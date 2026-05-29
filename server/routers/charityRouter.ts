/**
 * 사회기부 유언 라우터
 * 유언자가 사망 후 특정 분야/단체에 기부 의사를 등록·수정·삭제
 * 글로벌 누적 통계 (publicProcedure) - 국가별 화폐 기준 집계
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { charityDonations, users } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

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

/** 국가 코드 → 통화 매핑 */
const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string; countryName: string; flag: string }> = {
  KR: { code: "KRW", symbol: "₩",   countryName: "한국",       flag: "🇰🇷" },
  JP: { code: "JPY", symbol: "¥",   countryName: "日本",       flag: "🇯🇵" },
  CN: { code: "CNY", symbol: "¥",   countryName: "中国",       flag: "🇨🇳" },
  HK: { code: "HKD", symbol: "HK$", countryName: "香港",       flag: "🇭🇰" },
  TW: { code: "TWD", symbol: "NT$", countryName: "台灣",       flag: "🇹🇼" },
  US: { code: "USD", symbol: "$",   countryName: "USA",        flag: "🇺🇸" },
  DE: { code: "EUR", symbol: "€",   countryName: "Deutschland",flag: "🇩🇪" },
  FR: { code: "EUR", symbol: "€",   countryName: "France",     flag: "🇫🇷" },
  ES: { code: "EUR", symbol: "€",   countryName: "España",     flag: "🇪🇸" },
  SA: { code: "SAR", symbol: "﷼",   countryName: "السعودية",   flag: "🇸🇦" },
  AE: { code: "AED", symbol: "د.إ", countryName: "الإمارات",   flag: "🇦🇪" },
  RU: { code: "RUB", symbol: "₽",   countryName: "Россия",     flag: "🇷🇺" },
  IN: { code: "INR", symbol: "₹",   countryName: "India",      flag: "🇮🇳" },
  BR: { code: "BRL", symbol: "R$",  countryName: "Brasil",     flag: "🇧🇷" },
  GB: { code: "GBP", symbol: "£",   countryName: "UK",         flag: "🇬🇧" },
  AU: { code: "AUD", symbol: "A$",  countryName: "Australia",  flag: "🇦🇺" },
  CA: { code: "CAD", symbol: "C$",  countryName: "Canada",     flag: "🇨🇦" },
};

/** KRW 기준 환율 (고정 참고값) */
const KRW_RATES: Record<string, number> = {
  KRW: 1,
  JPY: 9.0,
  CNY: 190,
  HKD: 170,
  TWD: 41,
  USD: 1350,
  EUR: 1480,
  SAR: 360,
  AED: 368,
  RUB: 15,
  INR: 16,
  BRL: 270,
  GBP: 1720,
  AUD: 890,
  CAD: 1000,
};

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
        /** 단체 직접 지정 여부 (false=EverWill이 선정, true=직접 지정) */
        hasSpecificOrg: z.boolean().optional().default(false),
        /** 직접 지정 시 단체명 */
        customOrgName: z.string().max(128).optional(),
        /** 직접 지정 시 단체 주소 */
        orgAddress: z.string().max(256).optional(),
        /** 직접 지정 시 단체 연락처 */
        orgPhone: z.string().max(64).optional(),
        amount: z.number().int().min(1, "기부 금액은 1원 이상이어야 합니다"),
        memo: z.string().max(500).optional(),
      }).refine(
        (data) => !data.hasSpecificOrg || (!!data.customOrgName && data.customOrgName.trim().length > 0),
        { message: "단체를 직접 지정하는 경우 단체명을 입력해주세요", path: ["customOrgName"] }
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const setData = {
        hasSpecificOrg: input.hasSpecificOrg ? 1 : 0,
        customOrgName: input.hasSpecificOrg ? (input.customOrgName ?? null) : null,
        orgAddress: input.hasSpecificOrg ? (input.orgAddress ?? null) : null,
        orgPhone: input.hasSpecificOrg ? (input.orgPhone ?? null) : null,
        amount: input.amount,
        memo: input.memo ?? null,
      };

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
          .set(setData)
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
          ...setData,
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

  /**
   * 공개 기부 메시지 목록 (모든 방문자 열람 가능)
   * messagePublic=1 인 레코드만 반환
   */
  getPublicMessages: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(6) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { messages: [], total: 0 };
      const rows = await db
        .select({
          id: charityDonations.id,
          displayName: charityDonations.displayName,
          publicMessage: charityDonations.publicMessage,
          category: charityDonations.category,
          donationType: charityDonations.donationType,
          country: charityDonations.country,
          createdAt: charityDonations.createdAt,
        })
        .from(charityDonations)
        .where(eq(charityDonations.messagePublic, 1))
        .orderBy(sql`${charityDonations.createdAt} DESC`)
        .limit(input.limit);
      const totalRows = await db
        .select({ cnt: sql<number>`COUNT(*)` })
        .from(charityDonations)
        .where(eq(charityDonations.messagePublic, 1));
      return {
        messages: rows.map((r) => ({
          id: r.id,
          displayName: r.displayName ?? '익명의 기부자',
          publicMessage: r.publicMessage ?? '',
          category: r.category,
          donationType: r.donationType,
          country: r.country ?? 'KR',
          createdAt: r.createdAt,
        })),
        total: Number(totalRows[0]?.cnt ?? 0),
      };
    }),

  /**
   * 글로벌 기부 누적 통계 (공개 API) - 생전/사후 분리
   */
  getGlobalStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalKrw: 0,
        donorCount: 0,
        byCountry: [] as Array<{
          countryCode: string;
          countryName: string;
          flag: string;
          currencyCode: string;
          currencySymbol: string;
          totalAmount: number;
          donorCount: number;
        }>,
        byCategory: [] as Array<{ category: string; totalKrw: number; donorCount: number }>,
      };
    }

    const countryRows = await db
      .select({
        country: users.country,
        totalAmount: sql<number>`COALESCE(SUM(${charityDonations.amount}), 0)`,
        donorCount: sql<number>`COUNT(DISTINCT ${charityDonations.userId})`,
      })
      .from(charityDonations)
      .leftJoin(users, eq(charityDonations.userId, users.id))
      .groupBy(users.country);

    const categoryRows = await db
      .select({
        category: charityDonations.category,
        totalAmount: sql<number>`COALESCE(SUM(${charityDonations.amount}), 0)`,
        donorCount: sql<number>`COUNT(DISTINCT ${charityDonations.userId})`,
      })
      .from(charityDonations)
      .groupBy(charityDonations.category);

    const byCountry = countryRows
      .filter((r) => r.totalAmount > 0)
      .map((r) => {
        const code = (r.country ?? "KR").toUpperCase();
        const meta = COUNTRY_CURRENCY[code] ?? COUNTRY_CURRENCY["KR"];
        const rate = KRW_RATES[meta.code] ?? 1;
        const totalInCurrency = Math.round(Number(r.totalAmount) / rate);
        return {
          countryCode: code,
          countryName: meta.countryName,
          flag: meta.flag,
          currencyCode: meta.code,
          currencySymbol: meta.symbol,
          totalAmount: totalInCurrency,
          donorCount: Number(r.donorCount),
        };
      })
      .sort((a, b) => b.donorCount - a.donorCount);

    const totalKrw = countryRows.reduce((sum, r) => sum + Number(r.totalAmount), 0);

    const donorCount = await db
      .select({ cnt: sql<number>`COUNT(DISTINCT ${charityDonations.userId})` })
      .from(charityDonations);

    // 생전 기부 (결제 완료된 것만) vs 사후 기부 (유언 등록)
    const lifetimeRows = await db
      .select({ total: sql<number>`COALESCE(SUM(${charityDonations.amount}), 0)`, cnt: sql<number>`COUNT(*)` })
      .from(charityDonations)
      .where(and(eq(charityDonations.donationType, 'lifetime'), eq(charityDonations.paymentStatus, 'completed')));

    const posthumousRows = await db
      .select({ total: sql<number>`COALESCE(SUM(${charityDonations.amount}), 0)`, cnt: sql<number>`COUNT(*)` })
      .from(charityDonations)
      .where(eq(charityDonations.donationType, 'posthumous'));

    const byCategory = categoryRows.map((r) => ({
      category: r.category,
      totalKrw: Number(r.totalAmount),
      donorCount: Number(r.donorCount),
    }));

    return {
      totalKrw,
      donorCount: Number(donorCount[0]?.cnt ?? 0),
      byCountry,
      byCategory,
      lifetimeKrw: Number(lifetimeRows[0]?.total ?? 0),
      lifetimeCount: Number(lifetimeRows[0]?.cnt ?? 0),
      posthumousKrw: Number(posthumousRows[0]?.total ?? 0),
      posthumousCount: Number(posthumousRows[0]?.cnt ?? 0),
    };
  }),
});
