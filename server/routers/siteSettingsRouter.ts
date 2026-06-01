/**
 * 사이트 설정 라우터
 * 소셜 링크(유튜브, 인스타, 카카오, 라인) + 국가별 영상 URL 관리
 */
import { z } from "zod";
import { publicProcedure, router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { siteSettings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const SOCIAL_KEYS = ["youtube_url", "instagram_url", "kakao_url", "line_url"] as const;

const VIDEO_KEYS = [
  "video_kr", "video_us", "video_jp", "video_cn",
  "video_de", "video_es", "video_ar", "video_fr",
  "video_ru", "video_in", "video_br",
  "video_ca", "video_au", "video_nz",
  "video_mx", "video_it", "video_nl",
  "video_sg", "video_th", "video_vn", "video_ph",
] as const;

/** 유튜브 watch URL → embed URL 변환 */
function toEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  if (url.includes("/embed/")) return url;
  return url;
}

async function upsertSetting(db: Awaited<ReturnType<typeof getDb>>, key: string, value: string | null, desc: string) {
  if (!db) return;
  const existing = await db.select({ id: siteSettings.id }).from(siteSettings).where(eq(siteSettings.settingKey, key)).limit(1);
  if (existing.length > 0) {
    await db.update(siteSettings).set({ settingValue: value || null }).where(eq(siteSettings.settingKey, key));
  } else {
    await db.insert(siteSettings).values({ settingKey: key, settingValue: value || null, description: desc });
  }
}

export const siteSettingsRouter = router({
  /** 소셜 링크 조회 (공개) */
  getSocialLinks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { youtube: null, instagram: null, kakao: null, line: null };
    const allRows = await db.select().from(siteSettings);
    const map: Record<string, string | null> = {};
    for (const row of allRows) map[row.settingKey] = row.settingValue ?? null;
    return {
      youtube: map["youtube_url"] ?? null,
      instagram: map["instagram_url"] ?? null,
      kakao: map["kakao_url"] ?? null,
      line: map["line_url"] ?? null,
    };
  }),

  /** 소셜 링크 업데이트 (관리자 전용) */
  updateSocialLinks: adminProcedure
    .input(z.object({
      youtube: z.string().url().or(z.literal("")).optional(),
      instagram: z.string().url().or(z.literal("")).optional(),
      kakao: z.string().url().or(z.literal("")).optional(),
      line: z.string().url().or(z.literal("")).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 오류");
      await upsertSetting(db, "youtube_url", input.youtube ?? null, "유튜브 채널 URL");
      await upsertSetting(db, "instagram_url", input.instagram ?? null, "인스타그램 URL");
      await upsertSetting(db, "kakao_url", input.kakao ?? null, "카카오 채널 URL");
      await upsertSetting(db, "line_url", input.line ?? null, "라인 공식 계정 URL");
      return { success: true };
    }),

  /** 국가별 영상 URL 조회 - embed URL 변환 후 반환 (공개) */
  getVideos: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {} as Record<string, string | null>;
    const allRows = await db.select().from(siteSettings);
    const map: Record<string, string | null> = {};
    for (const row of allRows) map[row.settingKey] = row.settingValue ?? null;
    const result: Record<string, string | null> = {};
    for (const key of VIDEO_KEYS) {
      result[key] = toEmbedUrl(map[key] ?? null);
    }
    return result;
  }),

  /** 국가별 영상 URL 원본 조회 (관리자 편집용) */
  getVideosRaw: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return {} as Record<string, string>;
    const allRows = await db.select().from(siteSettings);
    const result: Record<string, string> = {};
    for (const row of allRows) {
      if (VIDEO_KEYS.includes(row.settingKey as typeof VIDEO_KEYS[number])) {
        result[row.settingKey] = row.settingValue ?? "";
      }
    }
    return result;
  }),

  /** 국가별 영상 URL 업데이트 (관리자 전용) */
  updateVideos: adminProcedure
    .input(z.object({
      video_kr: z.string().optional(),
      video_us: z.string().optional(),
      video_jp: z.string().optional(),
      video_cn: z.string().optional(),
      video_de: z.string().optional(),
      video_es: z.string().optional(),
      video_ar: z.string().optional(),
      video_fr: z.string().optional(),
      video_ru: z.string().optional(),
      video_in: z.string().optional(),
      video_br: z.string().optional(),
      video_ca: z.string().optional(),
      video_au: z.string().optional(),
      video_nz: z.string().optional(),
      video_mx: z.string().optional(),
      video_it: z.string().optional(),
      video_nl: z.string().optional(),
      video_sg: z.string().optional(),
      video_th: z.string().optional(),
      video_vn: z.string().optional(),
      video_ph: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 오류");
      const labels: Record<string, string> = {
        video_kr: "한국 영상", video_us: "미국 영상", video_jp: "일본 영상",
        video_cn: "중국 영상", video_de: "독일 영상", video_es: "스페인 영상",
        video_ar: "아랍 영상", video_fr: "프랑스 영상", video_ru: "러시아 영상",
        video_in: "인도 영상", video_br: "브라질 영상",
        video_ca: "캐나다 영상", video_au: "호주 영상", video_nz: "뉴질랜드 영상",
        video_mx: "멕시코 영상", video_it: "이탈리아 영상", video_nl: "네덜란드 영상",
        video_sg: "싱가포르 영상", video_th: "태국 영상", video_vn: "베트남 영상", video_ph: "필리핀 영상",
      };
      for (const key of VIDEO_KEYS) {
        const value = input[key as keyof typeof input];
        if (value !== undefined) {
          await upsertSetting(db, key, value || null, labels[key] ?? key);
        }
      }
      return { success: true };
    }),
});
