/**
 * 토스페이먼츠 결제 라우터
 * - 결제 요청 생성 (주문 ID 발급)
 * - 결제 승인 (서버 측 최종 확인)
 * - 결제 내역 조회
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { payments, wills } from "../../drizzle/schema";
import type { Payment } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || "";
const TOSS_API_BASE = "https://api.tosspayments.com/v1";

/** 토스페이먼츠 API 기본 인증 헤더 생성 */
function getTossAuthHeader() {
  const encoded = Buffer.from(`${TOSS_SECRET_KEY}:`).toString("base64");
  return `Basic ${encoded}`;
}

/** 상품 코드 → 금액 매핑 */
const PRODUCT_PRICES: Record<string, { amount: number; name: string }> = {
  cert_basic: { amount: 49000, name: "EverWill 전자인증 (1년 보관)" },
  cert_gold: { amount: 79000, name: "EverWill 전자인증 Gold (3년 보관)" },
  cert_platinum: { amount: 99000, name: "EverWill 전자인증 Platinum (5년 보관)" },
  cert_vip: { amount: 199000, name: "EverWill 전자인증 VIP (영구 보관)" },
  cert_renewal: { amount: 15000, name: "EverWill 유언장 재인증" },
  video_will: { amount: 29000, name: "EverWill 영상 유언장" },
  handwriting_scan: { amount: 19000, name: "EverWill 자필 유언 스캔 인증" },
  badge_essential: { amount: 49000, name: "EverWill Badge Essential" },
  badge_wearable: { amount: 79000, name: "EverWill Badge Wearable" },
  badge_necklace: { amount: 99000, name: "EverWill Badge Necklace" },
  badge_premium: { amount: 299000, name: "EverWill Badge Premium" },
};

export const tossPaymentRouter = router({
  /**
   * 결제 주문 생성 - 프론트엔드에서 결제 시작 전 호출
   * 주문 ID를 발급하고 pending 상태로 DB에 기록
   */
  createOrder: protectedProcedure
    .input(
      z.object({
        productCode: z.string(),
        /** 유언장 ID (유언장 인증 결제 시) */
        willId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const product = PRODUCT_PRICES[input.productCode];
      if (!product) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "유효하지 않은 상품 코드입니다." });
      }

      // 주문 ID 생성 (토스페이먼츠 요구사항: 영문+숫자, 최대 64자)
      const orderId = `EW-${Date.now()}-${uuidv4().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

      // DB에 pending 상태로 기록
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const [result] = await database.insert(payments).values({
        userId: ctx.user.id,
        tossOrderId: orderId,
        status: "pending",
        amountTotal: product.amount,
        currency: "krw",
        items: input.productCode,
        customerEmail: ctx.user.email || undefined,
      });

      return {
        orderId,
        amount: product.amount,
        orderName: product.name,
        customerName: ctx.user.name || "고객",
        customerEmail: ctx.user.email || "",
        paymentId: (result as any).insertId,
      };
    }),

  /**
   * 결제 승인 - 토스페이먼츠 결제 완료 후 서버에서 최종 승인
   * 프론트엔드에서 paymentKey, orderId, amount를 받아 서버에서 검증
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        paymentKey: z.string(),
        orderId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // DB에서 주문 확인
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const [existingPayment] = await database
        .select()
        .from(payments)
        .where(eq(payments.tossOrderId, input.orderId))
        .limit(1);

      if (!existingPayment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "주문 정보를 찾을 수 없습니다." });
      }

      if (existingPayment.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "권한이 없습니다." });
      }

      if (existingPayment.amountTotal !== input.amount) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "결제 금액이 일치하지 않습니다." });
      }

      if (existingPayment.status === "completed") {
        return { success: true, alreadyCompleted: true };
      }

      // 토스페이먼츠 서버에 결제 승인 요청
      const tossResponse = await fetch(`${TOSS_API_BASE}/payments/confirm`, {
        method: "POST",
        headers: {
          Authorization: getTossAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentKey: input.paymentKey,
          orderId: input.orderId,
          amount: input.amount,
        }),
      });

      const tossData = await tossResponse.json();

      if (!tossResponse.ok) {
        // 결제 실패 처리
        await database
          .update(payments)
          .set({ status: "failed" })
          .where(eq(payments.tossOrderId, input.orderId));

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: tossData.message || "결제 승인에 실패했습니다.",
        });
      }

      // 결제 성공 - DB 업데이트
      await database
        .update(payments)
        .set({
          status: "completed",
          tossPaymentKey: input.paymentKey,
          paymentMethod: tossData.method,
          paymentType: tossData.type,
          paidAt: new Date(tossData.approvedAt || Date.now()),
        })
        .where(eq(payments.tossOrderId, input.orderId));

      // 상품에 따른 후처리 (유언장 인증 상태 업데이트 등)
      const productCode = existingPayment.items;
      if (productCode && productCode.startsWith("cert_")) {
        // 유언장 인증 완료 처리 - 가장 최근 유언장에 적용
        const [latestWill] = await database
          .select()
          .from(wills)
          .where(eq(wills.userId, ctx.user.id))
          .limit(1);

        if (latestWill) {
          const certNumber = `EW-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
          await database
            .update(wills)
            .set({
              isCertified: 1,
              certifiedAt: new Date(),
              status: "certified",
              certNumber,
              paymentId: existingPayment.id,
            })
            .where(eq(wills.id, latestWill.id));
        }
      }

      return {
        success: true,
        paymentKey: input.paymentKey,
        orderId: input.orderId,
        amount: input.amount,
        method: tossData.method,
        approvedAt: tossData.approvedAt,
      };
    }),

  /**
   * 결제 내역 조회
   */
  getMyPayments: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    const myPayments = await database
      .select()
      .from(payments)
      .where(eq(payments.userId, ctx.user.id));

    return myPayments.sort((a: Payment, b: Payment) => b.createdAt.getTime() - a.createdAt.getTime());
  }),

  /**
   * 상품 목록 조회 (공개)
   */
  getProducts: publicProcedure.query(() => {
    return Object.entries(PRODUCT_PRICES).map(([code, info]) => ({
      code,
      ...info,
    }));
  }),
});
