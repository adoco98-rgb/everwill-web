/**
 * SARAM 유언장 AI 라우터
 * - AI 유언장 초안 자동 생성
 * - 자필 스캔 AI 검증
 * - AI 챗봇 가이드
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { wills, willRevisionPayments, willAssetScans, heirs, users } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import crypto from "crypto";
import { sendWillCertifiedEmail } from "../_core/email";
import { storagePut } from "../storage";

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
  testatorBirthDate: z.string().optional(),
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
- 주민등록번호: ${input.testatorRRN || (input.testatorBirthDate ? `${input.testatorBirthDate.replace(/-/g, '').slice(2)} - (뒷자리 미기재)` : '미기재')}
- 생년월일: ${input.testatorBirthDate || (input.testatorRRN ? input.testatorRRN.slice(0,6).replace(/(d{2})(d{2})(d{2})/, '19$1-$2-$3') : '미기재')}
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
2. 전문(前文) 서두는 반드시 아래 문구를 그대로 사용할 것 (유언자 이름은 실제 이름으로 대체):

   "유  언  장

   본인 ${input.testatorName} 은(는) 평생 사랑하고 아끼던 나의 가족에게,
   정신이 맑고 건강한 상태에서, 오로지 자유로운 의지와 진심어린 마음으로
   다음과 같이 재산 상속에 관한 사항을 유언합니다.

   이 유언은 어떠한 압력이나 강요 없이,
   오로지 나의 자유로운 의지와 애정으로 작성하는
   나의 마지막 유언입니다."
3. 각 자산별 상속인과 지분을 명확히 기재
4. 법적 요건(성명, 주소, 연월일, 날인란)을 포함
5. 마지막에 "위 유언은 본인의 자유로운 의사에 따라 작성하였음을 확인한다." 결어 포함
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

  // ===== 유언장 CRUD API =====

  /**
   * 유언장 저장 (신규 생성 또는 기존 업데이트)
   */
  saveWill: protectedProcedure
    .input(z.object({
      willId: z.number().optional(),
      title: z.string().optional(),
      data: z.string(),
      mode: z.enum(["ai", "direct"]).default("ai"),
      status: z.enum(["draft", "certified", "expired"]).default("draft"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const userId = ctx.user.id;
      const title = input.title || `유언장 ${new Date().toLocaleDateString("ko-KR")}`;

      if (input.willId) {
        const existing = await db.select().from(wills)
          .where(and(eq(wills.id, input.willId), eq(wills.userId, userId)))
          .limit(1);
        if (!existing.length) throw new Error("유언장을 찾을 수 없습니다");

        await db.update(wills)
          .set({ title, data: input.data, mode: input.mode, status: input.status })
          .where(eq(wills.id, input.willId));

        return { success: true, willId: input.willId, isNew: false };
      } else {
        const [result] = await db.insert(wills).values({
          userId,
          title,
          data: input.data,
          mode: input.mode,
          status: input.status,
        }).returning({ id: wills.id });
        const willId = result.id;
        return { success: true, willId, isNew: true };
      }
    }),

  /**
   * 내 유언장 목록 조회
   */
  getMyWills: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db.select({
        id: wills.id,
        title: wills.title,
        mode: wills.mode,
        status: wills.status,
        isCertified: wills.isCertified,
        certifiedAt: wills.certifiedAt,
        certNumber: wills.certNumber,
        pdfUrl: wills.pdfUrl,
        createdAt: wills.createdAt,
        updatedAt: wills.updatedAt,
      }).from(wills)
        .where(eq(wills.userId, ctx.user.id))
        .orderBy(desc(wills.updatedAt));
    }),

  /**
   * 유언장 상세 조회 (본인 소유만)
   */
  getWillById: protectedProcedure
    .input(z.object({ willId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const result = await db.select().from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id)))
        .limit(1);

      if (!result.length) throw new Error("유언장을 찾을 수 없습니다");
      return result[0];
    }),

  /**
   * 유언장 삭제 (초안 상태만 가능)
   */
  deleteWill: protectedProcedure
    .input(z.object({ willId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const existing = await db.select().from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id)))
        .limit(1);

      if (!existing.length) throw new Error("유언장을 찾을 수 없습니다");
      if (existing[0].status === "certified") throw new Error("인증된 유언장은 삭제할 수 없습니다");

      await db.delete(wills).where(eq(wills.id, input.willId));
      return { success: true };
    }),

  /**
   * 유언장 인증 처리 (결제 완료 후 호출)
   */
  certifyWill: protectedProcedure
    .input(z.object({
      willId: z.number(),
      paymentId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const existing = await db.select().from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id)))
        .limit(1);

      if (!existing.length) throw new Error("유언장을 찾을 수 없습니다");
      if (existing[0].isCertified) throw new Error("이미 인증된 유언장입니다");

      const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const suffix = Math.random().toString(36).toUpperCase().slice(2, 8);
      const certNumber = `EW-${today}-${suffix}`;

      const hashInput = `${input.willId}-${ctx.user.id}-${certNumber}-${existing[0].data}`;
      const blockchainHash = crypto.createHash("sha256").update(hashInput).digest("hex");

      await db.update(wills).set({
        status: "certified",
        isCertified: 1,
        certifiedAt: new Date(),
        certNumber,
        blockchainHash,
        paymentId: input.paymentId,
      }).where(eq(wills.id, input.willId));

      // 인증 완료 이메일 발송 (비동기 - 실패해도 인증은 성공으로 처리)
      if (ctx.user.email) {
        sendWillCertifiedEmail({
          toEmail: ctx.user.email,
          toName: ctx.user.name || "유언자",
          certNumber,
          willTitle: existing[0].title || "유언장",
          certifiedAt: new Date().toLocaleDateString("ko-KR", {
            year: "numeric", month: "long", day: "numeric",
          }),
        }).catch(err => console.error("[Email] 인증 완료 이메일 실패:", err));
      }

      return { success: true, certNumber, blockchainHash };
    }),

  /**
   * 유언장 수정 가능 여부 확인
   * - 인증된 유언장의 무료 수정 횟수 남은 횟수 반환
   * - 무제한(-1) 또는 잔여 횟수 있으면 무료, 없으면 유료 결제 필요
   */
  checkRevisionStatus: protectedProcedure
    .input(z.object({ willId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const will = await db.select().from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id)))
        .limit(1);

      if (!will.length) throw new Error("유언장을 찾을 수 없습니다");

      const w = will[0];
      const freeCount = w.freeRevisionCount; // -1 = 무제한
      const usedCount = w.usedFreeRevisions;
      const isUnlimited = freeCount === -1;
      const remainingFree = isUnlimited ? 999 : Math.max(0, freeCount - usedCount);
      const needsPayment = !isUnlimited && remainingFree === 0;

      return {
        willId: input.willId,
        freeRevisionCount: freeCount,
        usedFreeRevisions: usedCount,
        remainingFree,
        isUnlimited,
        needsPayment,
        planLabel: freeCount === -1 ? "영구보관 (무제한)" : `기본 (${freeCount}회)`,
      };
    }),

  /**
   * 유언장 수정 실행 (무료 횟수 내 또는 결제 확인 후)
   * - 무료 횟수 내: 수정 후 usedFreeRevisions +1
   * - 초과 시: stripeSessionId 필수 (결제 완료 확인)
   */
  executeRevision: protectedProcedure
    .input(z.object({
      willId: z.number(),
      title: z.string().optional(),
      data: z.string(),
      mode: z.enum(["ai", "direct"]).default("ai"),
      stripeSessionId: z.string().optional(), // 유료 수정 시 필수
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const will = await db.select().from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id)))
        .limit(1);

      if (!will.length) throw new Error("유언장을 찾을 수 없습니다");

      const w = will[0];
      const isUnlimited = w.freeRevisionCount === -1;
      const remainingFree = isUnlimited ? 999 : Math.max(0, w.freeRevisionCount - w.usedFreeRevisions);
      const needsPayment = !isUnlimited && remainingFree === 0;

      if (needsPayment && !input.stripeSessionId) {
        throw new Error("무료 수정 횟수를 모두 사용하셨습니다. 수정하려면 ₩15,000이 결제됩니다.");
      }

      const title = input.title || w.title || `유언장 ${new Date().toLocaleDateString("ko-KR")}`;

      // 유료 수정: 결제 내역 기록
      if (needsPayment && input.stripeSessionId) {
        await db.insert(willRevisionPayments).values({
          willId: input.willId,
          userId: ctx.user.id,
          stripeSessionId: input.stripeSessionId,
          amount: 15000,
          status: "completed",
        });
      }

      // 유언장 데이터 업데이트
      await db.update(wills)
        .set({
          title,
          data: input.data,
          mode: input.mode,
          // 무료 횟수 내 수정: usedFreeRevisions +1
          ...((!needsPayment && !isUnlimited) ? { usedFreeRevisions: w.usedFreeRevisions + 1 } : {}),
          // 인증 상태 다시 draft로 (수정 후 재인증 필요)
          status: "draft",
          isCertified: 0,
        })
        .where(eq(wills.id, input.willId));

      return {
        success: true,
        willId: input.willId,
        wasCharged: needsPayment,
        remainingFree: isUnlimited ? 999 : Math.max(0, w.freeRevisionCount - w.usedFreeRevisions - (needsPayment ? 0 : 1)),
      };
    }),

  /**
   * 파일 업로드 (건강증명서 등)
   * Base64 데이터 URL을 받아 S3에 저장하고 URL 반환
   */
  uploadFile: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // Base64 data URL (data:mime;base64,...)
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Base64 데이터 URL에서 실제 데이터 추출
      const base64Data = input.fileData.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const key = `will-docs/${ctx.user.id}/${input.fileName}`;
            const { url } = await storagePut(key, buffer, input.mimeType);
      return { url, key };
    }),

  /**
   * 자필 작성용: 최신 유언장 내용을 텍스트로 변환해서 반환
   */
  getLatestWillForPrint: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select({
        id: wills.id,
        title: wills.title,
        data: wills.data,
        updatedAt: wills.updatedAt,
      }).from(wills)
        .where(eq(wills.userId, ctx.user.id))
        .orderBy(desc(wills.updatedAt))
        .limit(1);
      if (!result.length) return null;
      const will = result[0];
      let parsedData: Record<string, unknown> = {};
      try {
        if (will.data) parsedData = JSON.parse(will.data);
      } catch { /* 파싱 실패 시 빈 객체 */ }
      return {
        id: will.id,
        title: will.title,
        data: parsedData,
        updatedAt: will.updatedAt,
      };
    }),

  // 자필 유언장 스캔 이미지 저장
  saveScannedWill: protectedProcedure
    .input(z.object({ imageBase64: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      // 최신 유언장 조회
      const [will] = await db.select({ id: wills.id }).from(wills)
        .where(eq(wills.userId, ctx.user.id))
        .orderBy(desc(wills.updatedAt))
        .limit(1);
      if (!will) throw new TRPCError({ code: "NOT_FOUND", message: "유언장이 없습니다" });
      // base64 데이터 파싱
      const matches = input.imageBase64.match(/^data:(.+);base64,(.+)$/);
      if (!matches) throw new TRPCError({ code: "BAD_REQUEST", message: "잘못된 이미지 형식" });
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      const fileKey = `scanned-wills/${ctx.user.id}/${will.id}_${Date.now()}.jpg`;
      const { url } = await storagePut(fileKey, buffer, mimeType);
      // DB 저장
      await db.update(wills)
        .set({ scannedWillKey: fileKey, scannedWillUrl: url } as Record<string, unknown>)
        .where(eq(wills.id, will.id));
      return { success: true, url, key: fileKey };
    }),

  // 자필 유언장 스캔 이미지 조회
  getScannedWill: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return { url: null };
      const [will] = await db.select({ scannedWillUrl: wills.scannedWillUrl, scannedWillKey: wills.scannedWillKey })
        .from(wills)
        .where(eq(wills.userId, ctx.user.id))
        .orderBy(desc(wills.updatedAt))
        .limit(1);
      return { url: (will as Record<string, unknown>)?.scannedWillUrl ?? null };
    }),

  /**
   * DB 실시간 자산 + 상속자 데이터로 유언장 전문 재생성
   * WillPreviewPage에서 페이지 로드 시 자동 호출
   */
  regenerateFromDB: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 1. 사용자 정보
      const [userRow] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);

      // 2. 상속자 목록 (DB 실시간)
      const heirList = await db.select().from(heirs).where(eq(heirs.userId, ctx.user.id));

      // 3. 자산 서류 목록 (willAssetScans)
      const assetScans = await db.select().from(willAssetScans)
        .where(eq(willAssetScans.userId, ctx.user.id));

      // 4. 유언장 최신본 조회
      const [latestWill] = await db.select().from(wills)
        .where(eq(wills.userId, ctx.user.id))
        .orderBy(desc(wills.updatedAt))
        .limit(1);

      // 5. 유언자 정보 구성
      let parsedJson: any = {};
      if (latestWill?.data) {
        try { parsedJson = JSON.parse(latestWill.data); } catch {}
      }
      const testatorName = parsedJson?.testatorName || userRow?.name || ctx.user.name || "유언자";
      const testatorAddress = parsedJson?.testatorAddress ||
        [(userRow as any)?.address || "", (userRow as any)?.addressDetail || ""].filter(Boolean).join(" ") || "";
      const testatorRRN = parsedJson?.testatorRRN || "";
      const executor = heirList.find((h: any) => Number(h.isExecutor) === 1);
      const executorName = executor ? (executor.nameKo || executor.nameEn || "") : (parsedJson?.executor || "");
      const funeralWish = parsedJson?.funeralWish || "";
      const specialInstructions = parsedJson?.specialInstructions || "";
      const donationDetails = parsedJson?.donationDetails || "";
      const guardian = parsedJson?.guardian || "";

      // 6. 상속자 텍스트 생성
      const RELATIONSHIP_KO: Record<string, string> = {
        spouse: "배우자", child: "자녀", parent: "부모",
        sibling: "형제자매", grandchild: "손자녀", other: "기타",
      };
      const totalAssetValue = assetScans.reduce((sum: number, a: any) => {
        const ev = a.estimatedValue ? Number(a.estimatedValue) : 0;
        const amt = ev > 0 ? ev : (Number(String(a.amount || '0').replace(/[^0-9]/g, '')) || 0);
        return sum + amt;
      }, 0);

      const heirsText = heirList.map((h: any, i: number) => {
        const rel = RELATIONSHIP_KO[h.relationship] || h.relationship || "";
        const share = h.shareType === 'amount'
          ? `₩${Number(h.shareAmount).toLocaleString()}`
          : `본인 소유의 모든 재산 중 ${h.sharePercent}%의 지분`;
        const approxAmt = h.shareType !== 'amount' && totalAssetValue > 0
          ? ` (약 ₩${Math.round(totalAssetValue * h.sharePercent / 100).toLocaleString()})`
          : '';
        return `${i + 1}. ${h.nameKo} (${rel}): ${share}${approxAmt}`;
      }).join("\n");

      // 7. 자산 목록 텍스트 생성
      const DOC_TYPE_KO: Record<string, string> = {
        bank_balance: "은행 잔액증명서",
        real_estate_registry: "부동산 등기부등본",
        stock_certificate: "주식보유증명서",
        insurance_policy: "보험증권",
        bond_certificate: "채권증명서",
        pension_statement: "연금수급확인서",
        vehicle_registration: "자동차등록증",
        business_registration: "사업자등록증",
        loan_statement: "대출잔액확인서",
        other: "기타 자산 서류",
      };
      // pension 유형 제외 (pension은 상속 대상 아님)
      const inheritableAssets = assetScans.filter((a: any) =>
        a.docType !== 'pension' && a.docType !== 'pension_statement'
      );
      const assetsText = inheritableAssets.length > 0
        ? inheritableAssets.map((a: any, i: number) => {
            const docLabel = DOC_TYPE_KO[a.docType] || a.docTypeLabel || a.docType || "자산";
            const assetName = a.assetName || "";
            const issuer = a.issuer ? ` (발급: ${a.issuer})` : "";
            const location = a.location ? ` [소재지: ${a.location}]` : "";
            const ev = a.estimatedValue ? Number(a.estimatedValue) : 0;
            const amt = Number(String(a.amount || '0').replace(/[^0-9]/g, '')) || 0;
            const valueStr = ev > 0 ? ` ₩${ev.toLocaleString()}` : amt > 0 ? ` ${amt.toLocaleString()} ${a.unit || '원'}` : "";
            return `${i + 1}. [${docLabel}] ${assetName}${issuer}${location}${valueStr}`;
          }).join("\n")
        : "등록된 상속 자산 없음";

      // 8. 오늘 날짜
      const today = new Date();
      const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

      // 9. AI 프롬프트 생성
      const prompt = `당신은 한국 민법 전문 유언장 작성 AI입니다.
아래 정보를 바탕으로 한국 민법 제1066조(자필증서 유언) 요건에 맞는 유언장 전문을 작성해주세요.

[유언자 정보]
- 성명: ${testatorName}
- 주민등록번호: ${testatorRRN || '미기재'}
- 주소: ${testatorAddress || '미기재'}
- 작성일: ${todayStr}

[상속인 목록]
${heirsText || '등록된 상속인 없음'}

[상속 자산 목록]
${assetsText}

[특별 지시사항]
- 유언집행자: ${executorName || '미지정'}
- 미성년 후견인: ${guardian || '해당 없음'}
- 장례 방식: ${funeralWish || '미지정'}
- 기부 내역: ${donationDetails || '없음'}
- 기타: ${specialInstructions || '없음'}

[작성 규칙]
1. 반드시 "유  언  장"이라는 제목으로 시작
2. 전문(前文) 서두는 반드시 아래 문구를 그대로 사용할 것 (유언자 이름은 실제 이름으로 대체):

   "본인 ${testatorName} 은(는) 평생 사랑하고 아끼던 나의 가족에게,
   정신이 맑고 건강한 상태에서, 오로지 자유로운 의지와 진심어린 마음으로
   다음과 같이 재산 상속에 관한 사항을 유언합니다.

   이 유언은 어떠한 압력이나 강요 없이,
   오로지 나의 자유로운 의지와 애정으로 작성하는
   나의 마지막 유언입니다."
3. 각 자산별 상속인과 지분을 명확히 기재
4. 법적 요건(성명, 주소, 연월일, 날인란)을 포함
5. 마지막에 "위 유언은 본인의 자유로운 의사에 따라 작성하였음을 확인한다." 결어 포함
6. 날인란: "서명: ___________  (인)" 형식으로 마무리
7. 한국어로 작성, 법률 문서 형식 유지
8. 자필로 옵겨 쓸 수 있도록 명확하고 간결하게 작성

유언장 전문만 출력하세요. 설명이나 주석은 포함하지 마세요.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "당신은 한국 민법 전문 유언장 작성 AI입니다. 법적으로 유효한 자필증서 유언장 초안을 작성합니다." },
          { role: "user", content: prompt },
        ],
      });

      const newWillText = response.choices?.[0]?.message?.content || "";

      // 10. 유언장 DB 업데이트 (새 전문 저장)
      if (latestWill && newWillText) {
        const updatedJson = {
          ...parsedJson,
          willContent: newWillText,
          lastRegeneratedAt: new Date().toISOString(),
        };
        await db.update(wills)
          .set({ data: JSON.stringify(updatedJson) })
          .where(eq(wills.id, latestWill.id));
      }

      return {
        success: true,
        willText: newWillText,
        todayStr,
      };
    }),

  // 자필 유언장 스캔 이미지 삭제
  deleteScannedWill: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const [will] = await db.select({ id: wills.id }).from(wills)
        .where(eq(wills.userId, ctx.user.id))
        .orderBy(desc(wills.updatedAt))
        .limit(1);
      if (!will) throw new TRPCError({ code: "NOT_FOUND", message: "유언장이 없습니다" });
      await db.update(wills)
        .set({ scannedWillKey: null, scannedWillUrl: null } as Record<string, unknown>)
        .where(eq(wills.id, will.id));
      return { success: true };
    }),
});
