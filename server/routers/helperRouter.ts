/**
 * 헬퍼(셀러) 시스템 라우터
 * - 헬퍼 신청, 서류 업로드, 관리자 승인/거절
 * - 커미션 자동 적립, 정산 요청/처리
 * - 3.3% 원천징수 자동 계산
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { helpers, helperDocuments, helperCommissions, helperPayouts, users } from "../../drizzle/schema";
import { eq, desc, and, sum, count } from "drizzle-orm";
import { storagePut } from "../storage";
import { invokeLLM } from "../_core/llm";

/** 커미션율 등급 계산 (누적 매출 기준) */
function calcCommissionRate(totalSales: number): number {
  if (totalSales >= 50_000_000) return 30; // 5000만원 이상
  if (totalSales >= 20_000_000) return 25; // 2000만원 이상
  if (totalSales >= 5_000_000) return 20;  // 500만원 이상
  return 15; // 기본
}

/** 고유 헬퍼 코드 생성 (HELPER-XXXX 형식) */
function generateHelperCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HELPER-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const helperRouter = router({
  /** 내 헬퍼 상태 조회 */
  getMyStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = (await getDb())!;
    const helper = await db
      .select()
      .from(helpers)
      .where(eq(helpers.userId, ctx.user.id))
      .limit(1);

    if (!helper[0]) return null;

    // 문서 목록
    const docs = await db
      .select()
      .from(helperDocuments)
      .where(eq(helperDocuments.helperId, helper[0].id));

    // 최근 커미션 내역
    const commissions = await db
      .select()
      .from(helperCommissions)
      .where(eq(helperCommissions.helperId, helper[0].id))
      .orderBy(desc(helperCommissions.createdAt))
      .limit(20);

    // 미정산 커미션 합계
    const pendingResult = await db
      .select({ total: sum(helperCommissions.commissionAmount) })
      .from(helperCommissions)
      .where(
        and(
          eq(helperCommissions.helperId, helper[0].id),
          eq(helperCommissions.payoutStatus, "pending")
        )
      );

    return {
      helper: helper[0],
      docs,
      commissions,
      pendingCommission: Number(pendingResult[0]?.total ?? 0),
    };
  }),

  /** 헬퍼 신청 (서류 업로드 포함) */
  submitApplication: protectedProcedure
    .input(
      z.object({
        // 각 문서: base64 인코딩된 파일 데이터
        residentFileBase64: z.string().min(1),
        residentFileName: z.string(),
        idCardFileBase64: z.string().min(1),
        idCardFileName: z.string(),
        bankbookFileBase64: z.string().min(1),
        bankbookFileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = (await getDb())!;

      // 이미 신청한 경우 확인
      const existing = await db
        .select()
        .from(helpers)
        .where(eq(helpers.userId, ctx.user.id))
        .limit(1);

      if (existing[0]) {
        if (existing[0].status === "approved") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "이미 승인된 헬퍼입니다." });
        }
        if (existing[0].status === "pending") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "이미 검토 중인 신청이 있습니다." });
        }
      }

      // 헬퍼 레코드 생성 (또는 재신청)
      let helperId: number;
      if (existing[0] && existing[0].status === "rejected") {
        // 재신청: 상태 초기화
        await db.update(helpers).set({ status: "pending", adminNote: null }).where(eq(helpers.id, existing[0].id));
        helperId = existing[0].id;
        // 기존 문서 삭제 후 재업로드
        await db.delete(helperDocuments).where(eq(helperDocuments.helperId, helperId));
      } else {
        const [result] = await db.insert(helpers).values({
          userId: ctx.user.id,
          status: "pending",
          commissionRate: 15,
          totalSales: 0,
          pendingCommission: 0,
          totalPaidCommission: 0,
        });
        helperId = (result as any).insertId;
      }

      // 파일 업로드 및 OCR 처리 함수
      const processDocument = async (
        base64: string,
        fileName: string,
        docType: "resident" | "id_card" | "bankbook"
      ) => {
        // base64 → Buffer
        const buffer = Buffer.from(base64, "base64");
        const mimeType = fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg";
        const fileKey = `helper-docs/${helperId}/${docType}-${Date.now()}`;

        const { url } = await storagePut(fileKey, buffer, mimeType);

        // AI OCR 처리
        let ocrData: Record<string, string> = {};
        try {
          const prompt =
            docType === "resident"
              ? "이 주민등록등본에서 다음 정보를 JSON으로 추출하세요: name(이름), birthDate(생년월일 YYYY-MM-DD), address(주소). 찾을 수 없으면 빈 문자열로."
              : docType === "id_card"
              ? "이 신분증에서 다음 정보를 JSON으로 추출하세요: name(이름), birthDate(생년월일 YYYY-MM-DD), idNumber(주민번호 앞 6자리만). 찾을 수 없으면 빈 문자열로."
              : "이 통장사본에서 다음 정보를 JSON으로 추출하세요: bankName(은행명), accountNumber(계좌번호), accountHolder(예금주). 찾을 수 없으면 빈 문자열로.";

          const ocrResp = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url, detail: "high" } },
                  { type: "text", text: prompt },
                ],
              },
            ],
            response_format: { type: "json_object" } as any,
          });

          const content = ocrResp.choices[0]?.message?.content ?? "{}";
          ocrData = JSON.parse(typeof content === "string" ? content : "{}");
        } catch {
          // OCR 실패해도 업로드는 성공으로 처리
        }

        await db.insert(helperDocuments).values({
          helperId,
          docType,
          fileKey,
          fileUrl: url,
          ocrName: ocrData.name ?? null,
          ocrBirthDate: ocrData.birthDate ?? null,
          ocrAddress: ocrData.address ?? null,
          ocrBankName: ocrData.bankName ?? null,
          ocrAccountNumber: ocrData.accountNumber ?? null,
          ocrAccountHolder: ocrData.accountHolder ?? null,
          ocrRawData: JSON.stringify(ocrData),
          ocrStatus: "done",
        });
      };

      await processDocument(input.residentFileBase64, input.residentFileName, "resident");
      await processDocument(input.idCardFileBase64, input.idCardFileName, "id_card");
      await processDocument(input.bankbookFileBase64, input.bankbookFileName, "bankbook");

      return { success: true, helperId };
    }),

  /** 헬퍼 코드로 유효성 확인 (결제 화면에서 사용) */
  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const db = (await getDb())!;
      const helper = await db
        .select({
          id: helpers.id,
          helperCode: helpers.helperCode,
          commissionRate: helpers.commissionRate,
          name: users.name,
        })
        .from(helpers)
        .innerJoin(users, eq(helpers.userId, users.id))
        .where(
          and(
            eq(helpers.helperCode, input.code.toUpperCase()),
            eq(helpers.status, "approved")
          )
        )
        .limit(1);

      if (!helper[0]) return null;
      return helper[0];
    }),

  /** 커미션 적립 (결제 완료 시 서버에서 호출) */
  recordCommission: protectedProcedure
    .input(
      z.object({
        helperCode: z.string(),
        customerId: z.number(),
        stripeSessionId: z.string().optional(),
        productName: z.string(),
        saleAmount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = (await getDb())!;

      // 헬퍼 조회
      const helper = await db
        .select()
        .from(helpers)
        .where(
          and(
            eq(helpers.helperCode, input.helperCode.toUpperCase()),
            eq(helpers.status, "approved")
          )
        )
        .limit(1);

      if (!helper[0]) return { success: false };

      const rate = helper[0].commissionRate;
      const commissionAmount = Math.floor((input.saleAmount * rate) / 100);

      // 커미션 기록
      await db.insert(helperCommissions).values({
        helperId: helper[0].id,
        customerId: input.customerId,
        stripeSessionId: input.stripeSessionId ?? null,
        productName: input.productName,
        saleAmount: input.saleAmount,
        commissionRate: rate,
        commissionAmount,
        payoutStatus: "pending",
      });

      // 헬퍼 누적 매출 및 커미션 잔액 업데이트
      const newTotalSales = helper[0].totalSales + input.saleAmount;
      const newPendingCommission = helper[0].pendingCommission + commissionAmount;
      const newRate = calcCommissionRate(newTotalSales);

      await db
        .update(helpers)
        .set({
          totalSales: newTotalSales,
          pendingCommission: newPendingCommission,
          commissionRate: newRate,
        })
        .where(eq(helpers.id, helper[0].id));

      return { success: true, commissionAmount, newRate };
    }),

  /** 정산 요청 (헬퍼가 직접 요청) */
  requestPayout: protectedProcedure
    .input(
      z.object({
        bankName: z.string().min(1),
        accountNumber: z.string().min(1),
        accountHolder: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = (await getDb())!;

      const helper = await db
        .select()
        .from(helpers)
        .where(
          and(eq(helpers.userId, ctx.user.id), eq(helpers.status, "approved"))
        )
        .limit(1);

      if (!helper[0]) throw new TRPCError({ code: "FORBIDDEN", message: "승인된 헬퍼만 정산 요청이 가능합니다." });
      if (helper[0].pendingCommission <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "정산 가능한 커미션이 없습니다." });

      const grossAmount = helper[0].pendingCommission;
      const taxRate = 33; // 3.3% = 33/1000
      const taxAmount = Math.floor((grossAmount * taxRate) / 1000);
      const netAmount = grossAmount - taxAmount;

      // 정산 레코드 생성
      const [result] = await db.insert(helperPayouts).values({
        helperId: helper[0].id,
        grossAmount,
        taxRate,
        taxAmount,
        netAmount,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        accountHolder: input.accountHolder,
        status: "pending",
      });
      const payoutId = (result as any).insertId;

      // 해당 커미션들을 정산 연결
      await db
        .update(helperCommissions)
        .set({ payoutStatus: "paid", payoutId })
        .where(
          and(
            eq(helperCommissions.helperId, helper[0].id),
            eq(helperCommissions.payoutStatus, "pending")
          )
        );

      // 헬퍼 미지급 잔액 초기화
      await db
        .update(helpers)
        .set({ pendingCommission: 0 })
        .where(eq(helpers.id, helper[0].id));

      return { success: true, payoutId, grossAmount, taxAmount, netAmount };
    }),

  // ─── 관리자 전용 ─────────────────────────────────────────

  /** 관리자: 헬퍼 신청 목록 조회 */
  adminListHelpers: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "suspended", "all"]).default("all"),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = (await getDb())!;
      const offset = (input.page - 1) * input.limit;

      const query = db
        .select({
          helper: helpers,
          user: { id: users.id, name: users.name, email: users.email, phone: users.phone },
        })
        .from(helpers)
        .innerJoin(users, eq(helpers.userId, users.id))
        .orderBy(desc(helpers.createdAt))
        .limit(input.limit)
        .offset(offset);

      if (input.status !== "all") {
        const rows = await db
          .select({
            helper: helpers,
            user: { id: users.id, name: users.name, email: users.email, phone: users.phone },
          })
          .from(helpers)
          .innerJoin(users, eq(helpers.userId, users.id))
          .where(eq(helpers.status, input.status))
          .orderBy(desc(helpers.createdAt))
          .limit(input.limit)
          .offset(offset);
        return rows;
      }

      return await query;
    }),

  /** 관리자: 헬퍼 서류 조회 */
  adminGetHelperDocs: protectedProcedure
    .input(z.object({ helperId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = (await getDb())!;
      return await db
        .select()
        .from(helperDocuments)
        .where(eq(helperDocuments.helperId, input.helperId));
    }),

  /** 관리자: 헬퍼 신청 승인 */
  adminApprove: protectedProcedure
    .input(z.object({ helperId: z.number(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = (await getDb())!;

      // 고유 코드 생성 (중복 방지)
      let code = generateHelperCode();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await db
          .select()
          .from(helpers)
          .where(eq(helpers.helperCode, code))
          .limit(1);
        if (!existing[0]) break;
        code = generateHelperCode();
        attempts++;
      }

      await db
        .update(helpers)
        .set({
          status: "approved",
          helperCode: code,
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
          adminNote: input.note ?? null,
        })
        .where(eq(helpers.id, input.helperId));

      return { success: true, helperCode: code };
    }),

  /** 관리자: 헬퍼 신청 거절 */
  adminReject: protectedProcedure
    .input(z.object({ helperId: z.number(), note: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = (await getDb())!;
      await db
        .update(helpers)
        .set({ status: "rejected", adminNote: input.note })
        .where(eq(helpers.id, input.helperId));
      return { success: true };
    }),

  /** 관리자: 정산 목록 조회 */
  adminListPayouts: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "completed", "cancelled", "all"]).default("all"),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = (await getDb())!;
      const offset = (input.page - 1) * input.limit;

      const rows = await db
        .select({
          payout: helperPayouts,
          helper: { id: helpers.id, helperCode: helpers.helperCode },
          user: { id: users.id, name: users.name, email: users.email },
        })
        .from(helperPayouts)
        .innerJoin(helpers, eq(helperPayouts.helperId, helpers.id))
        .innerJoin(users, eq(helpers.userId, users.id))
        .orderBy(desc(helperPayouts.createdAt))
        .limit(input.limit)
        .offset(offset);

      return rows;
    }),

  /** 관리자: 정산 지급 완료 처리 */
  adminCompletePayout: protectedProcedure
    .input(z.object({ payoutId: z.number(), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = (await getDb())!;

      const payout = await db
        .select()
        .from(helperPayouts)
        .where(eq(helperPayouts.id, input.payoutId))
        .limit(1);

      if (!payout[0]) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .update(helperPayouts)
        .set({
          status: "completed",
          paidAt: new Date(),
          processedBy: ctx.user.id,
          adminNote: input.note ?? null,
        })
        .where(eq(helperPayouts.id, input.payoutId));

      // 헬퍼 총 지급 누적
      // totalPaidCommission 업데이트
      const helperRow = await db.select().from(helpers).where(eq(helpers.id, payout[0].helperId)).limit(1);
      if (helperRow[0]) {
        await db
          .update(helpers)
          .set({ totalPaidCommission: helperRow[0].totalPaidCommission + payout[0].netAmount })
          .where(eq(helpers.id, payout[0].helperId));
      }

      return { success: true };
    }),
});
