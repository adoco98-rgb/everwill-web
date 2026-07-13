/**
 * 공증서류 AI 분석 라우터
 * - PDF, JPG, PNG, HEIC 모두 지원
 * - PDF는 첫 페이지를 PNG로 변환 후 AI 분석
 * - 4가지 검증: 선명도, 서류 종류 일치, 유효기간, 필수 항목 존재
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/** PDF data URL → 첫 페이지 PNG base64 data URL 변환 */
async function pdfDataUrlToImageDataUrl(dataUrl: string): Promise<string> {
  const base64 = dataUrl.split(",")[1];
  const pdfBuffer = Buffer.from(base64, "base64");
  const { pdf } = await import("pdf-to-img");
  const doc = await pdf(pdfBuffer, { scale: 2 });
  for await (const page of doc) {
    const b64 = (page as Buffer).toString("base64");
    return `data:image/png;base64,${b64}`;
  }
  throw new Error("PDF에서 페이지를 추출할 수 없습니다");
}

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
  // 집행자 서류
  executor_family_cert: {
    korName: "가족관계증명서 (집행자)",
    expectedContent: "대한민국 법원 발행, '가족관계증명서' 제목, 부모·배우자·자녀 등 가족 목록, 등록기준지, 발급일자, 관인",
  },
  executor_basic_cert: {
    korName: "기본증명서 (집행자)",
    expectedContent: "대한민국 법원 발행, '기본증명서' 제목, 본인의 출생·혼인·사망 등 신분사항, 등록기준지, 발급일자, 관인",
  },
  executor_resident: {
    korName: "주민등록등본 (집행자)",
    expectedContent: "'주민등록 등본(초본)' 제목, 세대주·세대원 목록, 주소, 전입일자, 발급일자, 행정기관 직인",
  },
  executor_seal_cert: {
    korName: "인감증명서 (집행자)",
    expectedContent: "'인감증명서' 제목, 본인 성명, 주민등록번호, 주소, 인감 이미지, 발급일자, 발급기관 직인",
  },
  // 수증자 서류
  beneficiary_resident: {
    korName: "주민등록등본 (수증자)",
    expectedContent: "'주민등록 등본(초본)' 제목, 세대주·세대원 목록, 주소, 전입일자, 발급일자, 행정기관 직인",
  },
  // 건강 서류
  health_cert: {
    korName: "건강진단서",
    expectedContent: "의사 발행 건강진단서 또는 소견서. 환자 성명, 진단일, 의사 서명·직인, 진단 내용 포함",
  },
  dementia_check: {
    korName: "치매 선별검사 결과서",
    expectedContent: "치매안심센터 또는 의료기관 발행. 검사 대상자 성명, 검사일, MMSE 또는 CIST 점수, 판정 결과, 기관 직인",
  },
  // 부동산 서류
  real_estate_cert: {
    korName: "등기사항전부증명서",
    expectedContent: "대한민국 법원 등기소 발행, 부동산 소재지, 소유자 정보, 발급일자, 등기관 직인",
  },
  land_survey: {
    korName: "토지대장",
    expectedContent: "정부24 발행, 토지 소재지, 지번, 면적, 소유자 정보, 발급일자, 행정기관 직인",
  },
  building_register: {
    korName: "건축물대장",
    expectedContent: "정부24 발행, 건물 소재지, 구조, 면적, 소유자 정보, 발급일자, 행정기관 직인",
  },
};

export const docAnalyzeRouter = router({
  /**
   * 서류 AI 분석 (PDF + 이미지 모두 지원)
   * - PDF: 첫 페이지를 PNG로 변환 후 분석
   * - 이미지: 직접 분석
   */
  analyzeDocument: protectedProcedure
    .input(z.object({
      imageUrl: z.string().refine(
        (v) =>
          v.startsWith("http") ||
          v.startsWith("data:image/") ||
          v.startsWith("data:application/pdf"),
        { message: "올바른 이미지 URL, 이미지 data URL, 또는 PDF data URL을 입력해주세요" }
      ),
      expectedDocType: z.string(),
    }))
    .mutation(async ({ input }) => {
      const docInfo = DOC_TYPE_INFO[input.expectedDocType] ?? {
        korName: input.expectedDocType,
        expectedContent: "공문서",
      };

      try {
        // PDF인 경우 첫 페이지를 이미지로 변환
        let imageUrl = input.imageUrl;
        if (imageUrl.startsWith("data:application/pdf")) {
          imageUrl = await pdfDataUrlToImageDataUrl(imageUrl);
        }

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
                    url: imageUrl,
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
  "confidence": "high" | "medium" | "low",
  "extractedData": {
    "name": "성명 (확인 불가 시 null)",
    "birthDate": "생년월일 앞 6자리만 예: 650312 (확인 불가 시 null)",
    "address": "주소 전체 (확인 불가 시 null)",
    "issueDate": "발급일 YYYY-MM-DD (확인 불가 시 null)",
    "registrationBase": "등록기준지 (가족관계·기본증명서만, 없으면 null)",
    "familyRelations": "가족관계 요약 예: 배우자 홍길순, 자녀 홍철수 (없으면 null)",
    "extra": "기타 중요 정보 (없으면 null)"
  }
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
                  extractedData: {
                    type: "object",
                    properties: {
                      name: { type: ["string", "null"] },
                      birthDate: { type: ["string", "null"] },
                      address: { type: ["string", "null"] },
                      issueDate: { type: ["string", "null"] },
                      registrationBase: { type: ["string", "null"] },
                      familyRelations: { type: ["string", "null"] },
                      extra: { type: ["string", "null"] },
                    },
                    required: ["name", "birthDate", "address", "issueDate", "registrationBase", "familyRelations", "extra"],
                    additionalProperties: false,
                  },
                },
                required: ["clarity", "docTypeMatch", "validity", "requiredElements", "overallStatus", "overallMessage", "confidence", "extractedData"],
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
        console.log("[docAnalyze] extractedData:", JSON.stringify(result.extractedData));
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

  /**
   * 인감증명서 ↔ 인감도장 날인 교차 검증
   * - 인감증명서에 찍힌 인영과 인감도장 날인 이미지가 동일한지 AI로 비교
   */
  compareSealStamp: protectedProcedure
    .input(z.object({
      sealCertImageUrl: z.string(), // 인감증명서 이미지 (data URL 또는 http)
      sealStampImageUrl: z.string(), // 인감도장 날인 이미지 (data URL 또는 http)
    }))
    .mutation(async ({ input }) => {
      try {
        // PDF 변환 처리
        let certUrl = input.sealCertImageUrl;
        let stampUrl = input.sealStampImageUrl;
        if (certUrl.startsWith("data:application/pdf")) {
          certUrl = await pdfDataUrlToImageDataUrl(certUrl);
        }
        if (stampUrl.startsWith("data:application/pdf")) {
          stampUrl = await pdfDataUrlToImageDataUrl(stampUrl);
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 인감도장 전문 검증 AI입니다. 두 이미지를 비교하여 인감증명서에 등록된 인영과 인감도장 날인이 동일한지 판단합니다.

판단 기준:
- 도장의 전체적인 형태(원형/사각형)가 일치하는지
- 도장 내부의 글자 배열·패턴이 유사한지
- 크기 비율이 유사한지 (크기 자체는 달라도 됨)
- 완전히 동일할 필요는 없음 (날인 압력·각도 차이 허용)
- JSON만 반환하세요.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "첫 번째 이미지는 인감증명서(인감증명서에 찍힌 인영 포함), 두 번째 이미지는 인감도장 날인입니다. 두 인영이 동일한 도장인지 비교해주세요.",
                },
                {
                  type: "image_url",
                  image_url: { url: certUrl, detail: "high" },
                },
                {
                  type: "image_url",
                  image_url: { url: stampUrl, detail: "high" },
                },
                {
                  type: "text",
                  text: `다음 JSON 형식으로만 응답하세요:
{
  "match": "pass" | "fail" | "uncertain",
  "similarity": "high" | "medium" | "low",
  "message": "비교 결과에 대한 한국어 설명 (2-3문장)",
  "details": {
    "shapeMatch": true | false,
    "patternMatch": true | false,
    "notes": "세부 관찰 사항 (1문장)"
  }
}`,
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "seal_compare_result",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  match: { type: "string" },
                  similarity: { type: "string" },
                  message: { type: "string" },
                  details: {
                    type: "object",
                    properties: {
                      shapeMatch: { type: "boolean" },
                      patternMatch: { type: "boolean" },
                      notes: { type: "string" },
                    },
                    required: ["shapeMatch", "patternMatch", "notes"],
                    additionalProperties: false,
                  },
                },
                required: ["match", "similarity", "message", "details"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "인감 비교 분석에 실패했습니다." });
        const result = typeof content === "string" ? JSON.parse(content) : content;
        return { success: true, data: result };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[docAnalyze] 인감 비교 오류:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "인감 비교 중 오류가 발생했습니다." });
      }
    }),
});
