/**
 * 사이트 설정 라우터
 * 소셜 링크(유튜브, 인스타, 카카오, 라인) 등 사이트 전역 설정 관리
 * - getSocialLinks: 공개 API (누구나 조회 가능)
 * - updateSocialLinks: 관리자 전용
 */
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// 소셜 링크 키 목록
const SOCIAL_KEYS = ["youtube_url", "instagram_url", "kakao_url", "line_url"] as const;

export const siteSettingsRouter = router({
  /**
   * 소셜 링크 조회 (공개 - 누구나 접근 가능)
   */
  getSocialLinks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { youtube: null, instagram: null, kakao: null, line: null };

    const rows = await db
      .select()
      .from(siteSettings)
      .where(
        // IN 연산자 대신 OR 조건으로 처리
        eq(siteSettings.settingKey, "youtube_url")
      );

    // 모든 소셜 키 조회
    const allRows = await db.select().from(siteSettings);
    const map: Record<string, string | null> = {};
    for (const row of allRows) {
      if (SOCIAL_KEYS.includes(row.settingKey as typeof SOCIAL_KEYS[number])) {
        map[row.settingKey] = row.settingValue ?? null;
      }
    }

    return {
      youtube: map["youtube_url"] ?? null,
      instagram: map["instagram_url"] ?? null,
      kakao: map["kakao_url"] ?? null,
      line: map["line_url"] ?? null,
    };
  }),

  /**
   * 소셜 링크 업데이트 (관리자 전용)
   */
  updateSocialLinks: adminProcedure
    .input(
      z.object({
        youtube: z.string().url().or(z.literal("")).optional(),
        instagram: z.string().url().or(z.literal("")).optional(),
        kakao: z.string().url().or(z.literal("")).optional(),
        line: z.string().url().or(z.literal("")).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      const updates: { key: string; value: string; desc: string }[] = [
        { key: "youtube_url", value: input.youtube ?? "", desc: "유튜브 채널 URL" },
        { key: "instagram_url", value: input.instagram ?? "", desc: "인스타그램 계정 URL" },
        { key: "kakao_url", value: input.kakao ?? "", desc: "카카오 채널 URL" },
        { key: "line_url", value: input.line ?? "", desc: "라인 공식 계정 URL" },
      ];

      for (const item of updates) {
        if (item.value === undefined) continue;

        // upsert: 있으면 업데이트, 없으면 삽입
        const existing = await db
          .select({ id: siteSettings.id })
          .from(siteSettings)
          .where(eq(siteSettings.settingKey, item.key))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(siteSettings)
            .set({ settingValue: item.value || null })
            .where(eq(siteSettings.settingKey, item.key));
        } else {
          await db.insert(siteSettings).values({
            settingKey: item.key,
            settingValue: item.value || null,
            description: item.desc,
          });
        }
      }

      return { success: true };
    }),
});
