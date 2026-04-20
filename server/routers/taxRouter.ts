/**
 * 상속세 계산 및 신고서 생성 tRPC 라우터
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { calculateKoreanInheritanceTax } from "../tax/koreanInheritanceTax";
import { invokeLLM } from "../_core/llm";

const heirSchema = z.object({
  relation: z.enum(["spouse", "child", "parent", "sibling", "other"]),
  count: z.number().min(1),
});

const assetSchema = z.object({
  realEstate: z.number().min(0).default(0),
  financialAssets: z.number().min(0).default(0),
  businessAssets: z.number().min(0).default(0),
  otherAssets: z.number().min(0).default(0),
  debts: z.number().min(0).default(0),
  funeralExpenses: z.number().min(0).default(15_000_000),
});

export const taxRouter = router({
  /**
   * 한국 상속세 자동 계산
   */
  calculateKorean: publicProcedure
    .input(z.object({
      assets: assetSchema,
      heirs: z.array(heirSchema),
      deceasedAge: z.number().min(0).max(150).default(70),
      isGenerationSkip: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const result = calculateKoreanInheritanceTax(
        input.assets,
        input.heirs,
        input.deceasedAge,
        input.isGenerationSkip
      );
      return { success: true, result };
    }),

  /**
   * AI 상속세 절세 전략 조언
   */
  getAIAdvice: publicProcedure
    .input(z.object({
      totalAssets: z.number(),
      finalTax: z.number(),
      effectiveRate: z.number(),
      hasSpouse: z.boolean(),
      childCount: z.number(),
    }))
    .mutation(async ({ input }) => {
      const prompt = `당신은 한국 세무사입니다. 다음 상속세 계산 결과를 바탕으로 구체적인 절세 전략을 3-5가지 제안해주세요.

상속 재산: ${(input.totalAssets / 100_000_000).toFixed(1)}억원
예상 상속세: ${(input.finalTax / 100_000_000).toFixed(2)}억원
유효세율: ${input.effectiveRate.toFixed(1)}%
배우자 여부: ${input.hasSpouse ? "있음" : "없음"}
자녀 수: ${input.childCount}명

다음 형식으로 답변해주세요:
1. [전략명]: [구체적 설명 및 예상 절세액]
2. ...

주의: 법률 자문이 아닌 정보 제공 목적임을 마지막에 명시하세요.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "당신은 한국 상속세 전문 세무사입니다. 정확하고 실용적인 절세 전략을 제공합니다." },
          { role: "user", content: prompt },
        ],
      });

      const advice = (response as any).choices?.[0]?.message?.content ?? "조언을 가져오지 못했습니다.";
      return { success: true, advice };
    }),

  /**
   * 상속세 신고서 데이터 생성 (PDF용)
   */
  generateReportData: publicProcedure
    .input(z.object({
      // 피상속인 정보
      deceased: z.object({
        name: z.string(),
        residentId: z.string().optional(),
        address: z.string(),
        deathDate: z.string(),
        age: z.number(),
      }),
      // 신고인 정보
      reporter: z.object({
        name: z.string(),
        relation: z.string(),
        phone: z.string().optional(),
        address: z.string().optional(),
      }),
      assets: assetSchema,
      heirs: z.array(heirSchema),
      isGenerationSkip: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      const taxResult = calculateKoreanInheritanceTax(
        input.assets,
        input.heirs,
        input.deceased.age,
        input.isGenerationSkip
      );

      // 신고 기한 계산 (사망일로부터 6개월)
      const deathDate = new Date(input.deceased.deathDate);
      const deadline = new Date(deathDate);
      deadline.setMonth(deadline.getMonth() + 6);

      return {
        success: true,
        reportData: {
          deceased: input.deceased,
          reporter: input.reporter,
          taxResult,
          deadline: deadline.toLocaleDateString("ko-KR"),
          reportDate: new Date().toLocaleDateString("ko-KR"),
          taxOffice: "관할 세무서", // 실제로는 주소 기반 자동 배정
        },
      };
    }),
});
