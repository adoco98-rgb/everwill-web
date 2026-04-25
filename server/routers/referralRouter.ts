/**
 * 추천인 시스템 라우터
 * - 추천인 코드 검증
 * - 추천인 포인트 적립 (5,000포인트)
 * - 포인트 내역 조회
 * - 포인트 잔액 조회
 */
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { users, pointHistory } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

/** 6자리 대문자+숫자 추천인 코드 생성 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 혼동 문자(I,O,0,1) 제외
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** 추천인 포인트 적립량 */
const REFERRAL_REWARD_POINTS = 5000;

export const referralRouter = router({
  /**
   * 추천인 코드 유효성 검증
   * 회원가입 폼에서 실시간으로 확인
   */
  validateCode: publicProcedure
    .input(z.object({ code: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const code = input.code.toUpperCase().trim();
      const rows = await db.select({
        id: users.id,
        name: users.name,
        referralCode: users.referralCode,
      }).from(users).where(eq(users.referralCode, code)).limit(1);

      if (rows.length === 0) {
        return { valid: false, name: null };
      }
      return { valid: true, name: rows[0].name || "회원" };
    }),

  /**
   * 회원가입 시 추천인 코드 등록 및 포인트 적립
   * - 신규 가입자의 referredBy 설정
   * - 추천인에게 5,000포인트 적립
   * - 피추천인에게도 가입 보너스 0포인트 (추후 설정 가능)
   */
  applyReferral: publicProcedure
    .input(z.object({
      newUserEmail: z.string().email(),
      referralCode: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const code = input.referralCode.toUpperCase().trim();
      const newUserOpenId = `email:${input.newUserEmail}`;

      // 신규 가입자 조회
      const newUserRows = await db.select().from(users)
        .where(eq(users.openId, newUserOpenId)).limit(1);
      if (newUserRows.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." });
      }
      const newUser = newUserRows[0];

      // 이미 추천인 코드가 등록된 경우
      if (newUser.referredBy) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "이미 추천인 코드가 등록되어 있습니다." });
      }

      // 추천인 조회
      const referrerRows = await db.select().from(users)
        .where(eq(users.referralCode, code)).limit(1);
      if (referrerRows.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "유효하지 않은 추천인 코드입니다." });
      }
      const referrer = referrerRows[0];

      // 자기 자신 추천 방지
      if (referrer.id === newUser.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "자기 자신을 추천할 수 없습니다." });
      }

      // 신규 가입자 referredBy 설정
      await db.update(users)
        .set({ referredBy: code })
        .where(eq(users.id, newUser.id));

      // 추천인 포인트 적립
      const newBalance = (referrer.pointBalance || 0) + REFERRAL_REWARD_POINTS;
      await db.update(users)
        .set({ pointBalance: newBalance })
        .where(eq(users.id, referrer.id));

      // 포인트 내역 기록
      await db.insert(pointHistory).values({
        userId: referrer.id,
        type: "referral_reward",
        amount: REFERRAL_REWARD_POINTS,
        balanceAfter: newBalance,
        description: `${newUser.name || input.newUserEmail} 님 추천 보상`,
        relatedUserId: newUser.id,
        createdAt: new Date(),
      });

      return {
        success: true,
        referrerName: referrer.name || "추천인",
        pointsAwarded: REFERRAL_REWARD_POINTS,
      };
    }),

  /**
   * 나의 추천인 코드 조회 (없으면 자동 생성)
   */
  getMyCode: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const userRows = await db.select().from(users)
        .where(eq(users.id, ctx.user.id)).limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." });
      }

      let user = userRows[0];

      // 추천인 코드가 없으면 생성
      if (!user.referralCode) {
        let code = generateReferralCode();
        // 중복 방지 (최대 5회 시도)
        for (let i = 0; i < 5; i++) {
          const existing = await db.select({ id: users.id }).from(users)
            .where(eq(users.referralCode, code)).limit(1);
          if (existing.length === 0) break;
          code = generateReferralCode();
        }
        await db.update(users)
          .set({ referralCode: code })
          .where(eq(users.id, user.id));
        user = { ...user, referralCode: code };
      }

      return {
        referralCode: user.referralCode,
        pointBalance: user.pointBalance || 0,
        referredBy: user.referredBy,
      };
    }),

  /**
   * 포인트 잔액 조회
   */
  getBalance: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const rows = await db.select({ pointBalance: users.pointBalance })
        .from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return { balance: rows[0]?.pointBalance || 0 };
    }),

  /**
   * 포인트 적립 내역 조회 (최신순, 최대 50건)
   */
  getHistory: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const rows = await db.select().from(pointHistory)
        .where(eq(pointHistory.userId, ctx.user.id))
        .orderBy(desc(pointHistory.createdAt))
        .limit(50);

      return rows;
    }),
});
