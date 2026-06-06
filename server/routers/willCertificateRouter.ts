/**
 * 유언인증서 발급 내역 라우터
 * - apply: 유언인증서 신청
 * - getMyList: 내 발급 내역 조회
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { willCertificates, wills } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const willCertificateRouter = router({
  /** 내 발급 내역 조회 */
  getMyList: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("DB 연결 실패");

    const list = await db
      .select()
      .from(willCertificates)
      .where(eq(willCertificates.userId, userId))
      .orderBy(desc(willCertificates.createdAt));

    return list;
  }),

  /** 인증 완료된 유언장 목록 조회 (신청 전 선택용) */
  getMyCertifiedWills: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("DB 연결 실패");

    const list = await db
      .select({
        id: wills.id,
        title: wills.title,
        certifiedAt: wills.certifiedAt,
        certNumber: wills.certNumber,
      })
      .from(wills)
      .where(and(eq(wills.userId, userId), eq(wills.status, "certified")))
      .orderBy(desc(wills.certifiedAt));

    return list;
  }),

  /** 유언인증서 신청 */
  requestCertificate: protectedProcedure
    .input(
      z.object({
        willId: z.number(),
        certDate: z.string(),
        purpose: z.string().min(1, "발급 목적을 입력해주세요"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // 해당 유언장이 본인 것이고 인증 완료 상태인지 확인
      const will = await db
        .select()
        .from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, userId), eq(wills.status, "certified")))
        .limit(1);

      if (will.length === 0) {
        throw new Error("인증 완료된 유언장만 인증서를 신청할 수 있습니다");
      }

      // 신청 등록
      await db.insert(willCertificates).values({
        userId,
        willId: input.willId,
        certDate: input.certDate,
        purpose: input.purpose,
        status: "pending",
        createdAt: new Date(),
      });

      return { success: true };
    }),
});
