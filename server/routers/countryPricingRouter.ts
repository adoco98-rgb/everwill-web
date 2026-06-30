/**
 * 국가별 가격 관리 라우터
 * 관리자: 국가별 가격 조회/수정
 * 일반 사용자: 자신의 국가 가격 조회
 */
import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { countryPricing } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

export const countryPricingRouter = router({
  /** 특정 국가 가격 조회 (공개) */
  getByCountry: publicProcedure
    .input(z.object({ countryCode: z.string().min(2).max(8) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db
        .select()
        .from(countryPricing)
        .where(eq(countryPricing.countryCode, input.countryCode.toUpperCase()))
        .limit(1);
      return rows[0] ?? null;
    }),

  /** 전체 국가 가격 목록 조회 (공개) */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(countryPricing).orderBy(countryPricing.countryCode);
  }),

  /** 국가 가격 저장/수정 (관리자 전용) */
  upsert: protectedProcedure
    .input(
      z.object({
        countryCode: z.string().min(2).max(8),
        currency: z.string().min(1).max(8),
        currencySymbol: z.string().min(1).max(8),
        certificationPrice: z.number().int().min(0),
        recertificationPrice: z.number().int().min(0),
        videoWillPrice: z.number().int().min(0),
        handwrittenScanPrice: z.number().int().min(0),
        membershipPrice: z.number().int().min(0),
        badgeEssentialPrice: z.number().int().min(0),
        badgeWearablePrice: z.number().int().min(0),
        badgeNecklacePrice: z.number().int().min(0),
        badgePremiumPrice: z.number().int().min(0),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 관리자 권한 확인
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 가격을 수정할 수 있습니다." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const code = input.countryCode.toUpperCase();
      const existing = await db
        .select({ id: countryPricing.id })
        .from(countryPricing)
        .where(eq(countryPricing.countryCode, code))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(countryPricing)
          .set({
            currency: input.currency,
            currencySymbol: input.currencySymbol,
            certificationPrice: input.certificationPrice,
            recertificationPrice: input.recertificationPrice,
            videoWillPrice: input.videoWillPrice,
            handwrittenScanPrice: input.handwrittenScanPrice,
            membershipPrice: input.membershipPrice,
            badgeEssentialPrice: input.badgeEssentialPrice,
            badgeWearablePrice: input.badgeWearablePrice,
            badgeNecklacePrice: input.badgeNecklacePrice,
            badgePremiumPrice: input.badgePremiumPrice,
            note: input.note,
          })
          .where(eq(countryPricing.countryCode, code));
      } else {
        await db.insert(countryPricing).values({ ...input, countryCode: code });
      }
      return { success: true };
    }),
});
