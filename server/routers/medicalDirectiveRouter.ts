/**
 * 사전의료의향서 / 장기기증 동의서 라우터
 * - save: 의사 표시 저장 (upsert)
 * - get: 현재 저장된 의사 표시 조회
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { medicalDirectives } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const medicalDirectiveRouter = router({
  /** 의사 표시 저장 (upsert) */
  save: protectedProcedure
    .input(
      z.object({
        type: z.enum(["advance", "organ"]),
        selections: z.record(z.string(), z.boolean()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      // 기존 레코드 확인
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const existing = await db
        .select()
        .from(medicalDirectives)
        .where(and(eq(medicalDirectives.userId, userId), eq(medicalDirectives.type, input.type)))
        .limit(1);

      const selectionsJson = JSON.stringify(input.selections);

      if (existing.length > 0) {
        // 업데이트
        await db
          .update(medicalDirectives)
          .set({
            selections: selectionsJson,
            updatedAt: new Date(),
          })
          .where(and(eq(medicalDirectives.userId, userId), eq(medicalDirectives.type, input.type)));
      } else {
        // 신규 삽입
        await db.insert(medicalDirectives).values({
          userId,
          type: input.type,
          selections: selectionsJson,
          savedAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true };
    }),

  /** 저장된 의사 표시 조회 */
  get: protectedProcedure
    .input(z.object({ type: z.enum(["advance", "organ"]) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const result = await db
        .select()
        .from(medicalDirectives)
        .where(and(eq(medicalDirectives.userId, userId), eq(medicalDirectives.type, input.type)))
        .limit(1);

      if (result.length === 0) return null;

      return {
        ...result[0],
        selections: JSON.parse(result[0].selections) as Record<string, boolean>,
      };
    }),
});
