/**
 * 추천인 시스템 라우터
 * - 추천인 코드 검증
 * - 추천인 포인트 적립 (5,000포인트)
 * - 포인트 내역 조회
 * - 포인트 잔액 조회
 */
import { TRPCError } from "@trpc/server";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";
import { users, pointHistory, payments } from "../../drizzle/schema";
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
   * 회원가입 시 추청인 코드 등록 및 포인트 적립
   * - 로그인한 본인만 자신의 추청인 코드 등록 가능 (타인 이메일 조작 방지)
   * - 추청인에게 5,000포인트 적립
   */
  applyReferral: protectedProcedure
    .input(z.object({
      referralCode: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const code = input.referralCode.toUpperCase().trim();

      // 로그인한 본인을 신규 가입자로 사용
      const newUserRows = await db.select().from(users)
        .where(eq(users.id, ctx.user.id)).limit(1);
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
        description: `${newUser.name || newUser.email || newUser.phone || "회원"} 님 추청 보상`,
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

  /**
   * 내가 추천한 회원 목록 조회
   * 셀러가 자신의 추천 코드로 가입한 회원 목록 + 각 회원의 결제 합계 확인
   */
  getMyReferrals: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 내 추천 코드 조회
      const meRows = await db.select({ referralCode: users.referralCode })
        .from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const myCode = meRows[0]?.referralCode;

      if (!myCode) {
        return { referrals: [], totalCount: 0, totalPaymentAmount: 0, commissionAmount: 0 };
      }

      // 내 코드로 가입한 회원 목록
      const referredUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        country: users.country,
        memberGrade: users.memberGrade,
        createdAt: users.createdAt,
      }).from(users)
        .where(eq(users.referredBy, myCode))
        .orderBy(desc(users.createdAt));

      // 각 추천 회원의 결제 합계 조회
      const referralIds = referredUsers.map(u => u.id);
      let paymentMap: Record<number, number> = {};

      if (referralIds.length > 0) {
        // 결제 완료된 금액 합산
        for (const uid of referralIds) {
          const payRows = await db.select({
            total: sql<number>`COALESCE(SUM(${payments.amountTotal}), 0)`,
          }).from(payments)
            .where(and(
              eq(payments.userId, uid),
              eq(payments.status, "completed")
            ));
          paymentMap[uid] = Number(payRows[0]?.total ?? 0);
        }
      }

      const referrals = referredUsers.map(u => ({
        ...u,
        totalPayment: paymentMap[u.id] ?? 0,
        // 수수료: 결제금액의 10% (추후 정책 변경 가능)
        commission: Math.floor((paymentMap[u.id] ?? 0) * 0.1),
      }));

      const totalPaymentAmount = referrals.reduce((s, r) => s + r.totalPayment, 0);
      const commissionAmount = referrals.reduce((s, r) => s + r.commission, 0);

      return {
        referrals,
        totalCount: referrals.length,
        totalPaymentAmount,
        commissionAmount,
      };
    }),

  /**
   * 수수료 요약 조회 (셀러 대시보드용)
   */
  getCommissionSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const meRows = await db.select({
        referralCode: users.referralCode,
        pointBalance: users.pointBalance,
        name: users.name,
      }).from(users).where(eq(users.id, ctx.user.id)).limit(1);

      const me = meRows[0];
      if (!me?.referralCode) {
        return { referralCode: null, totalReferrals: 0, totalRevenue: 0, commissionRate: 0.1, commissionAmount: 0, pointBalance: me?.pointBalance ?? 0 };
      }

      // 추천 회원 수
      const countRows = await db.select({ cnt: sql<number>`COUNT(*)` })
        .from(users).where(eq(users.referredBy, me.referralCode));
      const totalReferrals = Number(countRows[0]?.cnt ?? 0);

      // 추천 회원들의 총 결제 금액
      const referredUserIds = await db.select({ id: users.id })
        .from(users).where(eq(users.referredBy, me.referralCode));

      let totalRevenue = 0;
      for (const u of referredUserIds) {
        const payRows = await db.select({
          total: sql<number>`COALESCE(SUM(${payments.amountTotal}), 0)`,
        }).from(payments)
          .where(and(eq(payments.userId, u.id), eq(payments.status, "completed")));
        totalRevenue += Number(payRows[0]?.total ?? 0);
      }

      const commissionRate = 0.1; // 10%
      const commissionAmount = Math.floor(totalRevenue * commissionRate);

      return {
        referralCode: me.referralCode,
        totalReferrals,
        totalRevenue,
        commissionRate,
        commissionAmount,
        pointBalance: me.pointBalance ?? 0,
      };
    }),
});
