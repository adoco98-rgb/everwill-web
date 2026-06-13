/**
 * 사이트 통계 라우터
 * - 인증회원 수 조회 (public)
 * - 전체 회원 수 조회 (DB 실제 가입자 + 기준 3500)
 * - 관리자 수정 (admin only)
 */
import { z } from "zod";
import { eq, count } from "drizzle-orm";
import { getDb } from "../db";
import { siteStats, users } from "../../drizzle/schema";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const CERTIFIED_KEY = "certified_members";
// 기준 시작 회원 수 (3,500명)
const BASE_MEMBER_COUNT = 3500;

export const statsRouter = router({
  /** 인증회원 수 조회 (누구나 가능) */
  getCertifiedCount: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { count: 0 };
    const rows = await db
      .select()
      .from(siteStats)
      .where(eq(siteStats.key, CERTIFIED_KEY))
      .limit(1);

    if (rows.length === 0) {
      // 최초 조회 시 0으로 초기화
      await db.insert(siteStats).values({
        key: CERTIFIED_KEY,
        value: 0,
        label: "인증 완료 회원 수",
      });
      return { count: 0 };
    }
    return { count: rows[0].value };
  }),

  /** 전체 회원 수 조회 (DB 실제 가입자 + 기준 3500명) */
  getTotalMemberCount: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: BASE_MEMBER_COUNT };
    const result = await db.select({ cnt: count() }).from(users);
    const dbCount = result[0]?.cnt ?? 0;
    return { total: BASE_MEMBER_COUNT + dbCount };
  }),

  /** 관리자 전용 - 인증회원 수 직접 설정 */
  setCertifiedCount: adminProcedure
    .input(z.object({ count: z.number().int().min(0) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .insert(siteStats)
        .values({ key: CERTIFIED_KEY, value: input.count, label: "인증 완료 회원 수" })
        .onDuplicateKeyUpdate({ set: { value: input.count } });
      return { success: true, count: input.count };
    }),

  /** 관리자 전용 - 인증회원 수 증가 */
  incrementCertifiedCount: adminProcedure
    .input(z.object({ by: z.number().int().min(1).default(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const rows = await db
        .select()
        .from(siteStats)
        .where(eq(siteStats.key, CERTIFIED_KEY))
        .limit(1);

      const current = rows.length > 0 ? rows[0].value : 0;
      const next = current + input.by;

      await db
        .insert(siteStats)
        .values({ key: CERTIFIED_KEY, value: next, label: "인증 완료 회원 수" })
        .onDuplicateKeyUpdate({ set: { value: next } });

      return { success: true, count: next };
    }),
});
