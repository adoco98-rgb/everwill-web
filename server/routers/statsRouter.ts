/**
 * 사이트 통계 라우터
 * - 인증회원 수 조회 (public)
 * - 전체 회원 수 조회 (DB 실제 가입자 + 기준 수)
 * - 국가별 가입자 수 조회/설정 (관리자)
 */
import { z } from "zod";
import { eq, count, like } from "drizzle-orm";
import { getDb } from "../db";
import { siteStats, users } from "../../drizzle/schema";
import { publicProcedure, adminProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

const CERTIFIED_KEY = "certified_members";
// 국가별 가입자 수 키 prefix
const COUNTRY_MEMBER_PREFIX = "country_members_";

// 지원 국가 목록 (Hero 섹션 표시용)
export const SUPPORTED_DISPLAY_COUNTRIES = [
  { code: "KR", name: "한국", flag: "🇰🇷", defaultCount: 3509 },
  { code: "US", name: "미국", flag: "🇺🇸", defaultCount: 450 },
  { code: "JP", name: "일본", flag: "🇯🇵", defaultCount: 750 },
  { code: "CN", name: "중국", flag: "🇨🇳", defaultCount: 0 },
  { code: "DE", name: "독일", flag: "🇩🇪", defaultCount: 0 },
  { code: "ES", name: "스페인", flag: "🇪🇸", defaultCount: 0 },
  { code: "SA", name: "사우디", flag: "🇸🇦", defaultCount: 0 },
  { code: "FR", name: "프랑스", flag: "🇫🇷", defaultCount: 0 },
  { code: "RU", name: "러시아", flag: "🇷🇺", defaultCount: 0 },
  { code: "IN", name: "인도", flag: "🇮🇳", defaultCount: 0 },
  { code: "BR", name: "브라질", flag: "🇧🇷", defaultCount: 0 },
  { code: "AU", name: "호주", flag: "🇦🇺", defaultCount: 0 },
  { code: "GB", name: "영국", flag: "🇬🇧", defaultCount: 0 },
  { code: "CA", name: "캐나다", flag: "🇨🇦", defaultCount: 0 },
];

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
      await db.insert(siteStats).values({
        key: CERTIFIED_KEY,
        value: 0,
        label: "인증 완료 회원 수",
      });
      return { count: 0 };
    }
    return { count: rows[0].value };
  }),

  /** 전체 회원 수 조회 (DB 실제 가입자 + 국가별 임의 가입자 합산) */
  getTotalMemberCount: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 4709 }; // 기본값: 3509+450+750

    // DB 실제 가입자 수
    const result = await db.select({ cnt: count() }).from(users);
    const dbCount = result[0]?.cnt ?? 0;

    // 국가별 임의 가입자 수 합산
    const countryRows = await db
      .select()
      .from(siteStats)
      .where(like(siteStats.key, `${COUNTRY_MEMBER_PREFIX}%`));

    const manualTotal = countryRows.reduce((sum, row) => sum + (row.value ?? 0), 0);

    // 임의 설정값이 없으면 기본값 사용
    const baseManual = manualTotal > 0 ? manualTotal : 4709;

    return { total: baseManual + dbCount };
  }),

  /**
   * 국가별 가입자 수 조회 (public)
   * - 임의 설정값 + DB 실제 가입자 수 합산 반환
   */
  getCountryMemberCounts: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return SUPPORTED_DISPLAY_COUNTRIES.map((c) => ({
        code: c.code,
        name: c.name,
        flag: c.flag,
        manualCount: c.defaultCount,
        dbCount: 0,
        total: c.defaultCount,
        displayEnabled: c.defaultCount > 0,
      }));
    }

    // 국가별 임의 설정값 조회
    const countryRows = await db
      .select()
      .from(siteStats)
      .where(like(siteStats.key, `${COUNTRY_MEMBER_PREFIX}%`));

    const manualMap: Record<string, number> = {};
    const enabledMap: Record<string, boolean> = {};
    for (const row of countryRows) {
      const code = row.key.replace(COUNTRY_MEMBER_PREFIX, "");
      manualMap[code] = row.value ?? 0;
      // display_enabled_XX 키로 표시 여부 관리
    }

    // display 설정 조회
    const displayRows = await db
      .select()
      .from(siteStats)
      .where(like(siteStats.key, "country_display_%"));
    for (const row of displayRows) {
      const code = row.key.replace("country_display_", "");
      enabledMap[code] = row.value === 1;
    }

    // DB 실제 가입자 수 (국가별)
    const dbCountRows = await db
      .select({ country: users.country, cnt: count() })
      .from(users)
      .groupBy(users.country);
    const dbMap: Record<string, number> = {};
    for (const row of dbCountRows) {
      if (row.country) dbMap[row.country] = row.cnt;
    }

    return SUPPORTED_DISPLAY_COUNTRIES.map((c) => {
      const manual = manualMap[c.code] ?? c.defaultCount;
      const db = dbMap[c.code] ?? 0;
      // 표시 여부: 명시적으로 설정된 경우 그 값, 없으면 manual > 0 이면 표시
      const displayEnabled = enabledMap[c.code] !== undefined
        ? enabledMap[c.code]
        : manual > 0;
      return {
        code: c.code,
        name: c.name,
        flag: c.flag,
        manualCount: manual,
        dbCount: db,
        total: manual + db,
        displayEnabled,
      };
    });
  }),

  /**
   * 관리자 전용 - 국가별 가입자 수 일괄 설정
   * entries: [{ code: "KR", manualCount: 3509, displayEnabled: true }, ...]
   */
  setCountryMemberCounts: adminProcedure
    .input(
      z.object({
        entries: z.array(
          z.object({
            code: z.string().length(2),
            manualCount: z.number().int().min(0),
            displayEnabled: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      for (const entry of input.entries) {
        const countKey = `${COUNTRY_MEMBER_PREFIX}${entry.code}`;
        const displayKey = `country_display_${entry.code}`;
        const countryInfo = SUPPORTED_DISPLAY_COUNTRIES.find((c) => c.code === entry.code);

        // 임의 가입자 수 저장
        await db
          .insert(siteStats)
          .values({
            key: countKey,
            value: entry.manualCount,
            label: `${countryInfo?.name ?? entry.code} 임의 가입자 수`,
          })
          .onDuplicateKeyUpdate({ set: { value: entry.manualCount } });

        // 표시 여부 저장
        await db
          .insert(siteStats)
          .values({
            key: displayKey,
            value: entry.displayEnabled ? 1 : 0,
            label: `${countryInfo?.name ?? entry.code} Hero 표시 여부`,
          })
          .onDuplicateKeyUpdate({ set: { value: entry.displayEnabled ? 1 : 0 } });
      }

      return { success: true, updated: input.entries.length };
    }),

  /** 관리자 전용 - 인증회원 수 직접 설정 */
  setCertifiedCount: adminProcedure
    .input(z.object({ count: z.number().int().min(0) }))
    .mutation(async ({ input }) => {
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
    .mutation(async ({ input }) => {
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
