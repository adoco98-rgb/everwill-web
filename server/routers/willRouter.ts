/**
 * SARAM 유언장 AI 라우터
 * - AI 유언장 초안 자동 생성
 * - 자필 스캔 AI 검증
 * - AI 챗봇 가이드
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

// 상속인 스키마
const HeirSchema = z.object({
  id: z.string(),
  name: z.string(),
  relation: z.string(),
  birthDate: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  share: z.number(),
});

// 부동산 스키마
const RealEstateSchema = z.object({
  id: z.string(),
  type: z.string(),
  address: z.string(),
  area: z.string().optional(),
  registrationNo: z.string().optional(),
  estimatedValue: z.string().optional(),
  heirId: z.string(),
  sharePercent: z.number(),
});

// 금융자산 스키마
const FinancialAssetSchema = z.object({
  id: z.string(),
  type: z.string(),
  institution: z.string(),
  accountNo: z.string().optional(),
  estimatedValue: z.string().optional(),
  heirId: z.string(),
  sharePercent: z.number(),
});

// 기타자산 스키마
const OtherAssetSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string(),
  estimatedValue: z.string().optional(),
  heirId: z.string(),
});

// 유언장 데이터 스키마
const WillDataSchema = z.object({
  testatorName: z.string(),
  testatorRRN: z.string().optional(),
  testatorAddress: z.string(),
  testatorPhone: z.string().optional(),
  writtenDate: z.string(),
  heirs: z.array(HeirSchema),
  realEstates: z.array(RealEstateSchema),
  financialAssets: z.array(FinancialAssetSchema),
  otherAssets: z.array(OtherAssetSchema),
  executor: z.string().optional(),
  guardian: z.string().optional(),
  funeralWish: z.string().optional(),
  donationDetails: z.string().optional(),
  specialInstructions: z.string().optional(),
});

export const willRouter = router({
  /**
   * AI 유언장 초안 자동 생성
   * 사용자가 입력한 정보를 바탕으로 한국 민법에 맞는 유언장 전문을 생성
   */
  generateDraft: publicProcedure
    .input(WillDataSchema)
    .mutation(async ({ input }) => {
      // 상속인 목록 텍스트 생성
      const heirsText = input.heirs.map((h, i) =>
        `${i + 1}. ${h.name} (${h.relation}, 지분 ${h.share}%)`
      ).join("\n");

      // 부동산 목록 텍스트
      const realEstateText = input.realEstates.length > 0
        ? input.realEstates.map((r, i) => {
            const heir = input.heirs.find(h => h.id === r.heirId);
            return `${i + 1}. ${r.type} (${r.address}) → ${heir?.name || "미지정"} (${r.sharePercent}%)`;
          }).join("\n")
        : "해당 없음";

      // 금융자산 목록 텍스트
      const financialText = input.financialAssets.length > 0
        ? input.financialAssets.map((f, i) => {
            const heir = input.heirs.find(h => h.id === f.heirId);
            return `${i + 1}. ${f.institution} ${f.type} → ${heir?.name || "미지정"} (${f.sharePercent}%)`;
          }).join("\n")
        : "해당 없음";

      // 기타자산 목록 텍스트
      const otherText = input.otherAssets.length > 0
        ? input.otherAssets.map((o, i) => {
            const heir = input.heirs.find(h => h.id === o.heirId);
            return `${i + 1}. ${o.type}: ${o.description} → ${heir?.name || "미지정"}`;
          }).join("\n")
        : "해당 없음";

      const prompt = `당신은 한국 민법 전문 유언장 작성 AI입니다.
아래 정보를 바탕으로 한국 민법 제1066조(자필증서 유언) 요건에 맞는 유언장 전문을 작성해주세요.

[유언자 정보]
- 성명: ${input.testatorName}
- 주소: ${input.testatorAddress}
- 작성일: ${input.writtenDate}

[상속인]
${heirsText}

[부동산 자산]
${realEstateText}

[금융 자산]
${financialText}

[기타 자산]
${otherText}

[특별 지시사항]
- 유언집행자: ${input.executor || "미지정"}
- 미성년 후견인: ${input.guardian || "해당 없음"}
- 장례 방식: ${input.funeralWish || "미지정"}
- 기부 내역: ${input.donationDetails || "없음"}
- 기타: ${input.specialInstructions || "없음"}

[작성 규칙]
1. 반드시 "유언장"이라는 제목으로 시작
2. "본인은 다음과 같이 유언한다"로 시작하는 전문 포함
3. 각 자산별 상속인과 지분을 명확히 기재
4. 법적 요건(성명, 주소, 연월일, 날인란)을 포함
5. 마지막에 "위 유언은 본인의 자유로운 의사에 따라 작성하였음을 확인한다" 결어 포함
6. 날인란: "서명: ___________  (인)" 형식으로 마무리
7. 한국어로 작성, 법률 문서 형식 유지
8. 자필로 옮겨 쓸 수 있도록 명확하고 간결하게 작성

유언장 전문만 출력하세요. 설명이나 주석은 포함하지 마세요.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "당신은 한국 민법 전문 유언장 작성 AI입니다. 법적으로 유효한 자필증서 유언장 초안을 작성합니다.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const draftText = response.choices?.[0]?.message?.content || "";

      return {
        success: true,
        draft: draftText,
        writtenDate: input.writtenDate,
        testatorName: input.testatorName,
      };
    }),

  /**
   * 자필 유언장 스캔 AI 검증
   * 업로드된 이미지를 분석하여 법적 요건 충족 여부 확인
   */
  verifyScan: publicProcedure
    .input(z.object({
      imageUrl: z.string(), // 업로드된 이미지 URL
      testatorName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "당신은 한국 민법 자필증서 유언 검증 전문가입니다. 유언장 이미지를 분석하여 법적 요건 충족 여부를 확인합니다.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: input.imageUrl, detail: "high" },
              },
              {
                type: "text",
                text: `이 유언장 이미지를 분석하여 한국 민법 제1066조 자필증서 유언 요건을 검증해주세요.

검증 항목:
1. 자필 여부 (손으로 직접 작성했는지)
2. 전문 기재 여부 (유언 내용이 모두 자필인지)
3. 연월일 기재 여부
4. 주소 기재 여부
5. 성명 기재 여부
6. 날인(도장 또는 서명) 여부
7. 내용 판독 가능 여부

다음 JSON 형식으로만 응답하세요:
{
  "isHandwritten": true/false,
  "hasFullText": true/false,
  "hasDate": true/false,
  "hasAddress": true/false,
  "hasName": true/false,
  "hasSeal": true/false,
  "isReadable": true/false,
  "overallValid": true/false,
  "missingItems": ["누락된 항목 목록"],
  "warnings": ["주의사항 목록"],
  "summary": "전체 검증 결과 요약 (2-3문장)"
}`,
              },
            ],
          },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const content = typeof rawContent === "string" ? rawContent : "{}";

      // JSON 파싱 시도
      let result;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        result = null;
      }

      if (!result) {
        return {
          success: false,
          error: "이미지 분석에 실패했습니다. 다시 시도해주세요.",
        };
      }

      return {
        success: true,
        verification: result,
      };
    }),

  /**
   * AI 챗봇 가이드 - 대화형 유언장 작성
   * 사용자와 대화하며 유언장 작성에 필요한 정보를 수집
   */
  chat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
      currentData: WillDataSchema.partial().optional(),
    }))
    .mutation(async ({ input }) => {
      const systemPrompt = `당신은 SARAM의 유언장 작성 AI 가이드입니다.
사용자가 유언장 작성에 필요한 정보를 쉽게 입력할 수 있도록 친절하게 안내합니다.

[역할]
- 어르신도 이해할 수 있는 쉬운 말로 설명
- 한 번에 하나씩 질문
- 법적 요건을 자연스럽게 안내
- 입력된 정보를 확인하고 누락된 항목 안내

[수집해야 할 정보 순서]
1. 유언자 성명, 주소, 작성일
2. 상속인 정보 (이름, 관계, 연락처)
3. 부동산 자산
4. 금융 자산 (예금, 주식 등)
5. 기타 자산
6. 특별 지시사항 (장례 방식, 집행자 등)

[현재까지 수집된 정보]
${input.currentData ? JSON.stringify(input.currentData, null, 2) : "없음"}

[주의사항]
- 법률 자문이 아닌 정보 제공임을 명시
- 복잡한 법률 용어 사용 금지
- 따뜻하고 공감하는 톤 유지
- 응답은 3-4문장 이내로 간결하게`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...input.messages,
        ],
      });

      const reply = response.choices?.[0]?.message?.content || "죄송합니다. 다시 시도해주세요.";

      return {
        success: true,
        reply,
      };
    }),
});
