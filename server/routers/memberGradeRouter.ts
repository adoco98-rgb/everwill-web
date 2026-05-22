/**
 * 회원 등급 관리 라우터
 *
 * 등급 체계:
 * - general : 일반회원 (자산 등록 완료)
 * - silver  : 실버 (유료 서비스 구매 - 인증 ₩49,000 등)
 * - gold    : 골드 (Badge Premium ₩299,000 결제 완료)
 * - platinum: 플래티넘 (Gold + 등록 자산 합계 3억 원 이상)
 * - vip     : VIP (Gold + 등록 자산 합계 5억 원 이상)
 */
import { TRPCError } from "@trpc/server";
import { eq, sum, and, gte } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { users, assets, payments } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, adminProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";

/** 등급 한국어 라벨 */
export const GRADE_LABELS: Record<string, string> = {
  general: "일반회원",
  silver: "EverWill Silver",
  gold: "EverWill Gold",
  platinum: "EverWill Platinum",
  vip: "EverWill VIP",
};

/** 등급 색상 (Tailwind 클래스용) */
export const GRADE_COLORS: Record<string, string> = {
  general: "#6B7280",
  silver: "#94A3B8",
  gold: "#C9A961",
  platinum: "#7C3AED",
  vip: "#DC2626",
};

/** 등급 배지 이모지 */
export const GRADE_BADGES: Record<string, string> = {
  general: "👤",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  vip: "👑",
};

/**
 * 사용자의 등급을 계산하는 순수 함수
 * - hasAssets: 자산 등록 여부
 * - hasPaidService: 유료 서비스 구매 여부 (인증 등)
 * - hasBadgePremium: Badge Premium ₩299,000 결제 여부
 * - totalAssetKrw: 등록 자산 합계 (원화)
 */
export function calculateGrade(params: {
  hasAssets: boolean;
  hasPaidService: boolean;
  hasBadgePremium: boolean;
  totalAssetKrw: number;
}): "general" | "silver" | "gold" | "platinum" | "vip" {
  const { hasAssets, hasPaidService, hasBadgePremium, totalAssetKrw } = params;

  // Gold 조건: Badge Premium 결제
  const isGold = hasBadgePremium;

  // VIP: Gold + 자산 5억 이상
  if (isGold && totalAssetKrw >= 500_000_000) return "vip";

  // Platinum: Gold + 자산 3억 이상
  if (isGold && totalAssetKrw >= 300_000_000) return "platinum";

  // Gold: Badge Premium 결제
  if (isGold) return "gold";

  // Silver: 유료 서비스 구매
  if (hasPaidService) return "silver";

  // General: 자산 등록 완료
  if (hasAssets) return "general";

  // 기본값
  return "general";
}

/**
 * 특정 사용자의 등급을 재계산하고 DB에 저장
 */
export async function recalculateUserGrade(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB 연결 실패");

  // 1. 자산 등록 여부 및 합계
  const assetRows = await db
    .select({ total: sum(assets.estimatedValue) })
    .from(assets)
    .where(eq(assets.userId, userId));
  const totalAssetKrw = Number(assetRows[0]?.total ?? 0);
  const hasAssets = totalAssetKrw > 0;

  // 2. 결제 내역 확인
  const paymentRows = await db
    .select({ items: payments.items, amountTotal: payments.amountTotal })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "completed")));

  let hasPaidService = false;
  let hasBadgePremium = false;

  for (const p of paymentRows) {
    const items = p.items ?? "";
    // 유료 서비스: 인증, 영상유언, 자필스캔, 멤버십, Badge 등 어떤 결제든
    if (items.length > 0) hasPaidService = true;
    // Badge Premium: 상품 키에 badge_premium 포함 또는 금액 299,000원 이상
    if (
      items.includes("badge_premium") ||
      items.includes("badge_necklace") ||
      (p.amountTotal && p.amountTotal >= 299000)
    ) {
      hasBadgePremium = true;
    }
  }

  const newGrade = calculateGrade({ hasAssets, hasPaidService, hasBadgePremium, totalAssetKrw });

  // 3. DB 업데이트
  await db
    .update(users)
    .set({ memberGrade: newGrade, gradeUpdatedAt: new Date() })
    .where(eq(users.id, userId));

  return newGrade;
}

export const memberGradeRouter = router({
  /**
   * 내 등급 조회
   */
  getMyGrade: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const userRows = await db
      .select({
        id: users.id,
        memberGrade: users.memberGrade,
        gradeUpdatedAt: users.gradeUpdatedAt,
      })
      .from(users)
      .where(eq(users.openId, ctx.user.openId))
      .limit(1);

    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
    const user = userRows[0];

    // 자산 합계
    const assetRows = await db
      .select({ total: sum(assets.estimatedValue) })
      .from(assets)
      .where(eq(assets.userId, user.id));
    const totalAssetKrw = Number(assetRows[0]?.total ?? 0);

    return {
      grade: user.memberGrade,
      label: GRADE_LABELS[user.memberGrade] ?? "일반회원",
      color: GRADE_COLORS[user.memberGrade] ?? "#6B7280",
      badge: GRADE_BADGES[user.memberGrade] ?? "👤",
      totalAssetKrw,
      gradeUpdatedAt: user.gradeUpdatedAt,
      // 다음 등급까지 필요한 정보
      nextGradeInfo: getNextGradeInfo(user.memberGrade, totalAssetKrw),
    };
  }),

  /**
   * 내 등급 재계산 (결제/자산 변경 후 호출)
   */
  recalculate: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const userRows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.openId, ctx.user.openId))
      .limit(1);

    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });

    const newGrade = await recalculateUserGrade(userRows[0].id);
    return {
      grade: newGrade,
      label: GRADE_LABELS[newGrade] ?? "일반회원",
      badge: GRADE_BADGES[newGrade] ?? "👤",
    };
  }),

  /**
   * [관리자] 전체 회원 목록 + 등급 조회
   */
  adminListMembers: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        grade: z.enum(["all", "general", "silver", "gold", "platinum", "vip"]).default("all"),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const allUsers = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          phone: users.phone,
          country: users.country,
          memberGrade: users.memberGrade,
          gradeUpdatedAt: users.gradeUpdatedAt,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
          role: users.role,
          profileCompleted: users.profileCompleted,
        })
        .from(users)
        .orderBy(users.createdAt);

      // 필터링
      let filtered = allUsers;
      if (input.grade !== "all") {
        filtered = filtered.filter((u) => u.memberGrade === input.grade);
      }
      if (input.search) {
        const q = input.search.toLowerCase();
        filtered = filtered.filter(
          (u) =>
            (u.name ?? "").toLowerCase().includes(q) ||
            (u.email ?? "").toLowerCase().includes(q) ||
            (u.phone ?? "").includes(q)
        );
      }

      const total = filtered.length;
      const offset = (input.page - 1) * input.pageSize;
      const items = filtered.slice(offset, offset + input.pageSize).map((u) => ({
        ...u,
        gradeLabel: GRADE_LABELS[u.memberGrade] ?? "일반회원",
        gradeBadge: GRADE_BADGES[u.memberGrade] ?? "👤",
        gradeColor: GRADE_COLORS[u.memberGrade] ?? "#6B7280",
      }));

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  /**
   * [관리자] 회원 등급 수동 변경
   */
  adminSetGrade: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        grade: z.enum(["general", "silver", "gold", "platinum", "vip"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(users)
        .set({ memberGrade: input.grade, gradeUpdatedAt: new Date() })
        .where(eq(users.id, input.userId));

      return { success: true, grade: input.grade, label: GRADE_LABELS[input.grade] };
    }),

  /**
   * [관리자] 회원 비밀번호 초기화 (임시 비밀번호 이메일 발송)
   */
  adminResetPassword: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db
        .select({ email: users.email, name: users.name })
        .from(users)
        .where(eq(users.id, input.userId))
        .limit(1);

      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND", message: "회원을 찾을 수 없습니다." });

      const targetUser = userRows[0];
      if (!targetUser.email) throw new TRPCError({ code: "BAD_REQUEST", message: "이메일이 없는 회원입니다." });

      // 임시 비밀번호 생성 (8자리 영숫자)
      const tempPassword = Math.random().toString(36).slice(2, 10).toUpperCase();

      // bcrypt 해시
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(tempPassword, 12);

      await db.update(users).set({ passwordHash: hash }).where(eq(users.id, input.userId));

      // 이메일 발송 (Resend)
      try {
        const { Resend } = await import("resend");
        const { ENV } = await import("../_core/env");
        const resend = new Resend(ENV.resendApiKey);
        await resend.emails.send({
          from: "EverWill <noreply@everwill.co.kr>",
          to: targetUser.email,
          subject: "[EverWill] 임시 비밀번호 안내",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
            <h2 style="color:#1F3864">EverWill 임시 비밀번호</h2>
            <p>${targetUser.name ?? "회원"}님의 비밀번호가 초기화되었습니다.</p>
            <div style="font-size:24px;font-weight:bold;letter-spacing:4px;color:#C9A961;padding:16px;background:#f5f5f5;border-radius:8px;text-align:center">${tempPassword}</div>
            <p style="color:#666;font-size:14px;margin-top:16px">로그인 후 반드시 비밀번호를 변경해주세요.</p>
          </div>`,
        });
      } catch (e) {
        // 이메일 발송 실패 시에도 초기화는 완료
      }

      return { success: true, tempPassword };
    }),

  /**
   * [관리자] 회원 등급 일괄 재계산
   */
  adminRecalculateAll: adminProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allUsers = await db.select({ id: users.id }).from(users);
    let updated = 0;
    for (const u of allUsers) {
      try {
        await recalculateUserGrade(u.id);
        updated++;
      } catch {
        // 개별 실패 무시
      }
    }
    return { success: true, updated };
  }),
});

/**
 * 다음 등급 안내 정보
 */
function getNextGradeInfo(
  currentGrade: string,
  totalAssetKrw: number
): { nextGrade: string; nextLabel: string; requirement: string } | null {
  switch (currentGrade) {
    case "general":
      return {
        nextGrade: "silver",
        nextLabel: "EverWill Silver",
        requirement: "유료 서비스(인증 ₩49,000 등)를 구매하면 Silver로 승급됩니다.",
      };
    case "silver":
      return {
        nextGrade: "gold",
        nextLabel: "EverWill Gold",
        requirement: "Badge Premium(₩299,000)을 구매하면 Gold로 승급됩니다.",
      };
    case "gold":
      if (totalAssetKrw < 300_000_000) {
        const remaining = 300_000_000 - totalAssetKrw;
        return {
          nextGrade: "platinum",
          nextLabel: "EverWill Platinum",
          requirement: `자산을 ${(remaining / 100_000_000).toFixed(1)}억 원 더 등록하면 Platinum으로 승급됩니다.`,
        };
      }
      if (totalAssetKrw < 500_000_000) {
        const remaining = 500_000_000 - totalAssetKrw;
        return {
          nextGrade: "vip",
          nextLabel: "EverWill VIP",
          requirement: `자산을 ${(remaining / 100_000_000).toFixed(1)}억 원 더 등록하면 VIP로 승급됩니다.`,
        };
      }
      return null;
    case "platinum":
      if (totalAssetKrw < 500_000_000) {
        const remaining = 500_000_000 - totalAssetKrw;
        return {
          nextGrade: "vip",
          nextLabel: "EverWill VIP",
          requirement: `자산을 ${(remaining / 100_000_000).toFixed(1)}억 원 더 등록하면 VIP로 승급됩니다.`,
        };
      }
      return null;
    case "vip":
      return null;
    default:
      return null;
  }
}
