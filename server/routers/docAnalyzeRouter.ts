/**
 * 공증서류 AI 분석 라우터
 * - 업로드된 서류 이미지를 AI(GPT-4o Vision)로 분석
 * - 4가지 검증: 선명도, 서류 종류 일치, 유효기간, 필수 항목 존재
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/** 서류 종류별 기대 정보 */
const DOC_TYPE_INFO: Record<string, { korName: string; expectedContent: string }> = {
  basic_cert: {
    korName: "기본증명서",
    expectedContent: "대한민국 법원 발행, '기본증명서' 제목, 본인의 출생·혼인·사망 등 신분사항, 등록기준지, 발급일자, 관인",
  },
  family_cert: {
    korName: "가족관계증명서",
    expectedContent: "대한민국 법원 발행, '가족관계증명서' 제목, 부모·배우자·자녀 등 가족 목록, 등록기준지, 발급일자, 관인",
  },
  resident_reg: {
    korName: "주민등록등본",
    expectedContent: "'주민등록 등본(초본)' 제목, 세대주·세대원 목록, 주소, 전입일자, 발급일자, 행정기관 직인",
  },
  seal_cert: {
    korName: "인감증명서",
    expectedContent: "'인감증명서' 제목, 본인 성명, 주민등록번호, 주소, 인감 이미지, 발급일자, 발급기관 직인",
  },
  id_card: {
    korName: "신분증 사본",
    expectedContent: "주민등록증, 운전면허증, 또는 여권 중 하나. 사진, 이름, 생년월일, 발급기관 등이 포함",
  },
  seal_stamp: {
    korName: "인감도장 날인",
    expectedContent: "인감도장을 종이에 찍은 이미지. 선명한 도장 인영(날인 자국)이 보여야 함",
  },
};

export const docAnalyzeRouter = router({
  /**
   * 서류 이미지 AI 분석
   * - base64 data URL 또는 http URL을 받아 분석
   * - 4가지 항목 판별: 선명도, 서류종류 일치, 유효기간, 필수항목 존재
   */
  analyzeDocument: protectedProcedure
    .input(z.object({
      imageUrl: z.string().refine(
        (v) => v.startsWith("http") || v.startsWith("data:image/"),
        { message: "올바른 이미지 URL 또는 data URL을 입력해주세요" }
      ),
      expectedDocType: z.enum(["basic_cert", "family_cert", "resident_reg", "seal_cert", "id_card", "seal_stamp"]),
    }))
    .mutation(async ({ input }) => {
      const docInfo = DOC_TYPE_INFO[input.expectedDocType];

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 한국 공증서류 검증 전문 AI입니다. 업로드된 서류 이미지를 분석하여 4가지 항목을 검증합니다.

검증 항목:
1. **선명도(clarity)**: 텍스트가 읽을 수 있을 정도로 선명한지. 흐릿하거나, 빛 반사, 그림자, 손떨림으로 글자가 안 보이면 "fail"
2. **서류종류 일치(docTypeMatch)**: 업로드된 이미지가 기대하는 서류 종류와 일치하는지
3. **유효기간(validity)**: 발급일이 확인되면 3개월 이내인지 판단. 발급일을 확인할 수 없으면 "unknown"
4. **필수항목 존재(requiredElements)**: 해당 서류에 반드시 있어야 할 요소(직인/관인, 성명, 날짜 등)가 있는지

중요 규칙:
- 보이는 것만 판단하세요. 추측하지 마세요.
- 오늘 날짜: ${new Date().toISOString().split("T")[0]}
- 인감도장(seal_stamp)의 경우: 선명도는 도장 인영이 뚜렷한지, 필수항목은 도장 자국이 완전한 원형/사각형으로 보이는지 판단
- 신분증(id_card)의 경우: 사진, 이름, 생년월일이 식별 가능한지 판단
- JSON만 반환하세요.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: input.imageUrl,
                    detail: "high",
                  },
                },
                {
                  type: "text",
                  text: `이 이미지를 분석해주세요.

기대하는 서류: ${docInfo.korName}
기대하는 내용: ${docInfo.expectedContent}

다음 JSON 형식으로만 응답하세요:
{
  "clarity": {
    "status": "pass" | "fail" | "warning",
    "message": "선명도에 대한 한국어 설명 (1-2문장)"
  },
  "docTypeMatch": {
    "status": "pass" | "fail",
    "detectedType": "실제로 감지된 서류 종류 (한국어)",
    "message": "서류 종류 일치 여부에 대한 한국어 설명 (1문장)"
  },
  "validity": {
    "status": "pass" | "fail" | "unknown",
    "issueDate": "발급일 (YYYY-MM-DD 형식, 확인 불가 시 null)",
    "message": "유효기간에 대한 한국어 설명 (1문장)"
  },
  "requiredElements": {
    "status": "pass" | "fail" | "warning",
    "found": ["발견된 필수 요소 목록"],
    "missing": ["누락된 필수 요소 목록"],
    "message": "필수 항목 존재 여부에 대한 한국어 설명 (1문장)"
  },
  "overallStatus": "pass" | "fail" | "warning",
  "overallMessage": "전체 종합 판정 한국어 메시지 (2-3문장, 사용자에게 보여줄 안내)",
  "confidence": "high" | "medium" | "low"
}`,
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "doc_analysis_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  clarity: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      message: { type: "string" },
                    },
                    required: ["status", "message"],
                    additionalProperties: false,
                  },
                  docTypeMatch: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      detectedType: { type: "string" },
                      message: { type: "string" },
                    },
                    required: ["status", "detectedType", "message"],
                    additionalProperties: false,
                  },
                  validity: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      issueDate: { type: ["string", "null"] },
                      message: { type: "string" },
                    },
                    required: ["status", "issueDate", "message"],
                    additionalProperties: false,
                  },
                  requiredElements: {
                    type: "object",
                    properties: {
                      status: { type: "string" },
                      found: { type: "array", items: { type: "string" } },
                      missing: { type: "array", items: { type: "string" } },
                      message: { type: "string" },
                    },
                    required: ["status", "found", "missing", "message"],
                    additionalProperties: false,
                  },
                  overallStatus: { type: "string" },
                  overallMessage: { type: "string" },
                  confidence: { type: "string" },
                },
                required: ["clarity", "docTypeMatch", "validity", "requiredElements", "overallStatus", "overallMessage", "confidence"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "서류 분석에 실패했습니다. 다시 시도해주세요.",
          });
        }

        const result = typeof content === "string" ? JSON.parse(content) : content;

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[docAnalyze] 서류 분석 오류:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "서류 분석 중 오류가 발생했습니다. 이미지를 다시 확인해주세요.",
        });
      }
    }),
});
