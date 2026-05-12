/**
 * 사회기부 유언 라우터
 * 유언자가 사망 후 특정 분야/단체에 기부 의사를 등록·수정·삭제
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { charityDonations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// 기부 분야 카테고리 목록
const CHARITY_CATEGORIES = [
  "education",
  "children",
  "elderly",
  "disabled",
  "medical",
  "environment",
  "culture",
  "science",
  "animal",
  "disaster",
  "religion",
  "other",
] as const;

export const charityRouter = router({
  /** 내 기부 유언 목록 조회 */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(charityDonations)
      .where(eq(charityDonations.userId, ctx.user.id));
    return rows;
  }),

  /** 기부 유언 저장 (upsert: category 기준) */
  upsert: protectedProcedure
    .input(
      z.object({
        category: z.enum(CHARITY_CATEGORIES),
        customOrgName: z.string().max(128).optional(),
        amount: z.number().int().min(1, "기부 금액은 1원 이상이어야 합니다"),
        memo: z.string().max(500).optional(),
      }).refine(
        (data) => data.category !== "other" || (!!data.customOrgName && data.customOrgName.trim().length > 0),
        { message: "기타 선택 시 단체명을 입력해주세요", path: ["customOrgName"] }
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // 기존 레코드 확인
      const existing = await db
        .select()
        .from(charityDonations)
        .where(
          and(
            eq(charityDonations.userId, ctx.user.id),
            eq(charityDonations.category, input.category)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(charityDonations)
          .set({
            customOrgName: input.customOrgName ?? null,
            amount: input.amount,
            memo: input.memo ?? null,
          })
          .where(
            and(
              eq(charityDonations.userId, ctx.user.id),
              eq(charityDonations.category, input.category)
            )
          );
        return { action: "updated" as const };
      } else {
        await db.insert(charityDonations).values({
          userId: ctx.user.id,
          category: input.category,
          customOrgName: input.customOrgName ?? null,
          amount: input.amount,
          memo: input.memo ?? null,
        });
        return { action: "created" as const };
      }
    }),

  /** 기부 유언 삭제 (category 기준) */
  delete: protectedProcedure
    .input(z.object({ category: z.enum(CHARITY_CATEGORIES) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");
      await db
        .delete(charityDonations)
        .where(
          and(
            eq(charityDonations.userId, ctx.user.id),
            eq(charityDonations.category, input.category)
          )
        );
      return { success: true };
    }),
});
