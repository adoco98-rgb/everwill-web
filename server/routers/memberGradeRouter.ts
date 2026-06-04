/**
 * 회원 등급 관리 라우터
 *
 * 등급 체계 (결제 기반):
 * - general : 무료회원 (회원가입만)
 * - silver  : 실버 카드 ₩49,000
 * - gold    : 골드 카드 ₩79,000
 * - platinum: 플래티넘 카드 ₩99,000
 * - vip     : VIP 프리미엄 ₩199,000
 *
 * 승급 시: (목표 등급 가격 - 현재 등급 가격) + 수수료 ₩5,000
 */
import { TRPCError } from "@trpc/server";
import { eq, sum, and } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { users, assets, payments } from "../../drizzle/schema";
import { protectedProcedure, adminProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import {
  MEMBERSHIP_PLANS,
  GRADE_ORDER,
  UPGRADE_FEE,
  calculateUpgradePrice,
  type MemberGrade,
} from "../../shared/membershipProducts";

/** 등급 한국어 라벨 */
export const GRADE_LABELS: Record<string, string> = {
  general: "무료회원",
  silver: "EverWill Silver",
  gold: "EverWill Gold",
  platinum: "EverWill Platinum",
  vip: "EverWill VIP",
};

/** 등급 색상 */
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
 * 특정 사용자의 등급을 결제 기반으로 재계산하고 DB에 저장
 * 결제 items에 membership_silver/gold/platinum/vip 포함 여부로 판단
 */
export async function recalculateUserGrade(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("DB 연결 실패");

  // 완료된 결제 내역 조회
  const paymentRows = await db
    .select({ items: payments.items, amountTotal: payments.amountTotal })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "completed")));

  let highestGrade: MemberGrade = "general";

  for (const p of paymentRows) {
    const items = p.items ?? "";
    if (items.includes("membership_vip") || items.includes("upgrade_to_vip")) {
      if (GRADE_ORDER["vip"] > GRADE_ORDER[highestGrade]) highestGrade = "vip";
    } else if (items.includes("membership_platinum") || items.includes("upgrade_to_platinum")) {
      if (GRADE_ORDER["platinum"] > GRADE_ORDER[highestGrade]) highestGrade = "platinum";
    } else if (items.includes("membership_gold") || items.includes("upgrade_to_gold")) {
      if (GRADE_ORDER["gold"] > GRADE_ORDER[highestGrade]) highestGrade = "gold";
    } else if (items.includes("membership_silver") || items.includes("upgrade_to_silver")) {
      if (GRADE_ORDER["silver"] > GRADE_ORDER[highestGrade]) highestGrade = "silver";
    }
  }

  // DB 업데이트
  await db
    .update(users)
    .set({ memberGrade: highestGrade, gradeUpdatedAt: new Date() })
    .where(eq(users.id, userId));

  return highestGrade;
}

export const memberGradeRouter = router({
  /**
   * 내 등급 조회 + 멤버십 플랜 목록
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

    const currentGrade = (user.memberGrade ?? "general") as MemberGrade;

    // 자산 합계
    const assetRows = await db
      .select({ total: sum(assets.estimatedValue) })
      .from(assets)
      .where(eq(assets.userId, user.id));
    const totalAssetKrw = Number(assetRows[0]?.total ?? 0);

    // 승급 가능한 플랜 목록 + 각각 결제 금액 계산
    const upgradePlans = MEMBERSHIP_PLANS.filter(
      (p) => GRADE_ORDER[p.grade] > GRADE_ORDER[currentGrade]
    ).map((p) => {
      const upgradePrice = currentGrade === "general"
        ? { diff: p.price, fee: 0, total: p.price }
        : calculateUpgradePrice(currentGrade, p.grade);
      return {
        ...p,
        upgradePrice,
      };
    });

    return {
      grade: currentGrade,
      label: GRADE_LABELS[currentGrade] ?? "무료회원",
      color: GRADE_COLORS[currentGrade] ?? "#6B7280",
      badge: GRADE_BADGES[currentGrade] ?? "👤",
      totalAssetKrw,
      gradeUpdatedAt: user.gradeUpdatedAt,
      currentPlan: MEMBERSHIP_PLANS.find((p) => p.grade === currentGrade) ?? null,
      upgradePlans,
      allPlans: MEMBERSHIP_PLANS,
    };
  }),

  /**
   * 멤버십 가입/승급 Stripe 체크아웃 세션 생성
   * - general → silver/gold/platinum/vip: 해당 플랜 가격 전액
   * - silver/gold/platinum → 상위 등급: 차액 + 수수료 ₩5,000
   */
  createUpgradeCheckout: protectedProcedure
    .input(
      z.object({
        targetGrade: z.enum(["silver", "gold", "platinum", "vip"]),
        origin: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 현재 사용자 등급 조회
      const userRows = await db
        .select({ id: users.id, memberGrade: users.memberGrade, email: users.email, name: users.name, stripeCustomerId: users.stripeCustomerId })
        .from(users)
        .where(eq(users.openId, ctx.user.openId))
        .limit(1);

      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const user = userRows[0];

      const currentGrade = (user.memberGrade ?? "general") as MemberGrade;
      const targetGrade = input.targetGrade as MemberGrade;

      // 이미 같거나 높은 등급이면 거부
      if (GRADE_ORDER[targetGrade] <= GRADE_ORDER[currentGrade]) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "이미 해당 등급 이상의 회원입니다.",
        });
      }

      // 결제 금액 계산
      let amountKrw: number;
      let itemKey: string;
      let itemName: string;

      const targetPlan = MEMBERSHIP_PLANS.find((p) => p.grade === targetGrade)!;

      if (currentGrade === "general") {
        // 신규 가입
        amountKrw = targetPlan.price;
        itemKey = `membership_${targetGrade}`;
        itemName = `EverWill ${targetPlan.name} 멤버십`;
      } else {
        // 승급
        const upgradePrice = calculateUpgradePrice(currentGrade, targetGrade);
        if (!upgradePrice) throw new TRPCError({ code: "BAD_REQUEST", message: "승급 금액 계산 실패" });
        amountKrw = upgradePrice.total;
        itemKey = `upgrade_to_${targetGrade}`;
        itemName = `EverWill ${targetPlan.name} 승급 (차액 + 수수료)`;
      }

      // Stripe 체크아웃 세션 생성
      const Stripe = (await import("stripe")).default;
      const { ENV } = await import("../_core/env");
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-03-25.dahlia" });

      // Stripe 고객 ID 확인/생성
      let customerId = user.stripeCustomerId;
      if (!customerId && user.email) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name ?? undefined,
          metadata: { userId: String(user.id) },
        });
        customerId = customer.id;
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId ?? undefined,
        customer_email: customerId ? undefined : (user.email ?? undefined),
        allow_promotion_codes: true,
        line_items: [
          {
            price_data: {
              currency: "krw",
              product_data: {
                name: itemName,
                description: `${GRADE_LABELS[currentGrade]} → ${GRADE_LABELS[targetGrade]}`,
              },
              unit_amount: amountKrw,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: String(user.id),
          currentGrade,
          targetGrade,
          itemKey,
          customer_email: user.email ?? "",
          customer_name: user.name ?? "",
        },
        client_reference_id: String(user.id),
        success_url: `${input.origin}/dashboard/membership?upgrade=success&grade=${targetGrade}`,
        cancel_url: `${input.origin}/dashboard/membership?upgrade=cancelled`,
      });

      return { checkoutUrl: session.url, sessionId: session.id };
    }),

  /**
   * 내 등급 재계산 (결제 완료 후 호출)
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
      label: GRADE_LABELS[newGrade] ?? "무료회원",
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
        gradeLabel: GRADE_LABELS[u.memberGrade] ?? "무료회원",
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
