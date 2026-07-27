import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, payments, personProfiles, lifeJournals, legacyLetters, lifePhotos } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import { storagePut } from "../storage";

/**
 * Life Story 라우터
 * AI 일기, 소중한 사람에게 남기는 편지, 인물 앨범 기능
 * ₩79,000 이상 구매자 전용 (Badge Gold 이상)
 */

/** ₩168,000 인증 회원 여부 확인 헬퍼 (admin은 항상 true) */
async function checkLifeStoryAccess(userId: number, role?: string): Promise<boolean> {
  // 관리자는 모든 기능 무조건 허용
  if (role === "admin") return true;

  const db = await getDb();
  if (!db) return false;

  const paymentRows = await db
    .select({ items: payments.items, amountTotal: payments.amountTotal })
    .from(payments)
    .where(and(eq(payments.userId, userId), eq(payments.status, "completed")));

  for (const p of paymentRows) {
    const items = p.items ?? "";
    // ₩168,000 이상 인증 회원: certification, badge_necklace, badge_premium, badge_custom
    if (
      items.includes("certification") ||
      items.includes("badge_necklace") ||
      items.includes("badge_premium") ||
      items.includes("badge_custom") ||
      (p.amountTotal && p.amountTotal >= 168000)
    ) {
      return true;
    }
  }
  return false;
}

export const lifeStoryRouter = router({
  /**
   * 접근 권한 확인
   * 로그인 여부 + ₩168,000 이상 구매 여부 반환
   */
  checkAccess: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.openId, ctx.user.openId))
      .limit(1);

    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
    const userId = userRows[0].id;

    const hasAccess = await checkLifeStoryAccess(userId, ctx.user.role);
    return { hasAccess, userId };
  }),

  // ─────────────────────────────────────────
  // 인물 앨범
  // ─────────────────────────────────────────

  /** 인물 앨범 목록 조회 */
  getPersonProfiles: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
    const userId = userRows[0].id;

    if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
      throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
    }

    return db.select().from(personProfiles).where(and(eq(personProfiles.userId, userId), eq(personProfiles.isActive, 1))).orderBy(desc(personProfiles.createdAt));
  }),

  /** 인물 등록 */
  addPersonProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(64),
      relationship: z.string().max(32).default("self"),
      photoUrl: z.string().url().optional(),
      photoKey: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
      }

      // GPT-4 Vision으로 얼굴 특징 프롬프트 생성 (사진이 있을 경우)
      let facePrompt: string | undefined;
      if (input.photoUrl) {
        try {
          const res = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: input.photoUrl, detail: "low" } },
                  { type: "text", text: `이 사람의 외모 특징을 AI 이미지 생성 프롬프트용으로 영어로 간결하게 묘사해주세요. 예: "elderly Korean man, round face, silver hair, warm smile, glasses". 최대 30단어.` },
                ],
              },
            ],
          });
          facePrompt = res.choices?.[0]?.message?.content as string | undefined;
        } catch {
          // 얼굴 분석 실패해도 등록은 계속
        }
      }

      await db.insert(personProfiles).values({
        userId,
        name: input.name,
        relationship: input.relationship,
        photoUrl: input.photoUrl,
        photoKey: input.photoKey,
        facePrompt,
        isActive: 1,
      });

      return { success: true };
    }),

  /** 인물 삭제 (소프트 삭제) */
  deletePersonProfile: protectedProcedure
    .input(z.object({ profileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      await db.update(personProfiles).set({ isActive: 0 }).where(and(eq(personProfiles.id, input.profileId), eq(personProfiles.userId, userId)));
      return { success: true };
    }),

  // ─────────────────────────────────────────
  // AI 일기
  // ─────────────────────────────────────────

  /** 일기 목록 조회 */
  getJournals: protectedProcedure
    .input(z.object({ limit: z.number().default(20), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
      }

      return db.select().from(lifeJournals).where(eq(lifeJournals.userId, userId)).orderBy(desc(lifeJournals.journalDate)).limit(input.limit).offset(input.offset);
    }),

  /** AI 일기 생성 (대화 내용 → 일기 텍스트 + 그림) */
  generateJournal: protectedProcedure
    .input(z.object({
      journalDate: z.string(), // YYYY-MM-DD
      conversationText: z.string().min(10).max(5000),
      imageStyle: z.enum(["watercolor", "illustration", "oil_painting"]).default("watercolor"),
      personProfileIds: z.array(z.number()).optional(), // 등장 인물 ID 목록
      photoDataUrls: z.array(z.string()).optional(), // base64 data URL 사진들
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
      }

      // 1. 등장 인물 얼굴 프롬프트 수집
      let personPrompts = "";
      if (input.personProfileIds?.length) {
        const profiles = await db.select({ name: personProfiles.name, relationship: personProfiles.relationship, facePrompt: personProfiles.facePrompt })
          .from(personProfiles)
          .where(eq(personProfiles.userId, userId));
        const matched = profiles.filter((_, i) => input.personProfileIds!.includes(i));
        personPrompts = matched.map(p => `${p.name}(${p.relationship}): ${p.facePrompt ?? "person"}`).join("; ");
      }

      // 2. 업로드된 사진을 S3에 저장하고 갤러리에도 등록
      const uploadedPhotoUrls: string[] = [];
      if (input.photoDataUrls?.length) {
        for (let i = 0; i < input.photoDataUrls.length; i++) {
          try {
            const dataUrl = input.photoDataUrls[i];
            const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches) continue;
            const mimeType = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, "base64");
            const ext = mimeType.split("/")[1] ?? "jpg";
            const key = `life-story/photos/${userId}/${Date.now()}_${i}.${ext}`;
            const saved = await storagePut(key, buffer, mimeType);
            uploadedPhotoUrls.push(saved.url);
            // 갤러리에도 저장
            const { lifePhotos } = await import("../../drizzle/schema.js");
            await db.insert(lifePhotos).values({
              userId,
              fileKey: saved.key,
              fileUrl: saved.url,
              fileSize: buffer.length,
              fileName: `photo_${Date.now()}_${i}.${ext}`,
            });
          } catch { /* 사진 저장 실패 시 무시 */ }
        }
      }

      // 3. LLM으로 일기 텍스트 생성 (사진 포함 시 비전 모델 사용)
      const userMessageContent: any[] = [
        { type: "text", text: `오늘(${input.journalDate}) 있었던 일:\n\n${input.conversationText}` },
        ...uploadedPhotoUrls.map(url => ({ type: "image_url", image_url: { url, detail: "low" } })),
      ];

      const diaryRes = await invokeLLM({
        messages: [
          {
            role: "system",
            content: uploadedPhotoUrls.length > 0
              ? "당신은 따뜻하고 감성적인 일기 작가입니다. 사용자의 대화 내용과 첨부된 사진을 함께 보고, 사진 속 장면과 분위기를 일기에 자연스럽게 녹여서 아름다운 한국어 일기를 3-5문단으로 작성해주세요. 1인칭 시점으로 작성하며, 사진에서 느껴지는 감정과 세부 묘사를 풍부하게 담아주세요."
              : "당신은 따뜻하고 감성적인 일기 작가입니다. 사용자의 대화 내용을 바탕으로 아름다운 한국어 일기를 3-5문단으로 작성해주세요. 1인칭 시점으로 작성하며, 감정과 세부 묘사를 풍부하게 담아주세요.",
          },
          {
            role: "user",
            content: uploadedPhotoUrls.length > 0 ? userMessageContent : `오늘(${input.journalDate}) 있었던 일:\n\n${input.conversationText}`,
          },
        ],
      });
      const diaryText = diaryRes.choices?.[0]?.message?.content as string ?? "";

      // 3. 감정 태그 추출
      const tagRes = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "일기 내용에서 감정 태그를 3-5개 추출해주세요. 쉼표로 구분된 한국어 단어로만 답해주세요. 예: 행복,감사,그리움",
          },
          { role: "user", content: diaryText },
        ],
      });
      const emotionTags = (tagRes.choices?.[0]?.message?.content as string ?? "").trim();

      // 4. AI 그림 생성
      const styleMap: Record<string, string> = {
        watercolor: "soft watercolor painting style, warm colors",
        illustration: "gentle illustration style, storybook art",
        oil_painting: "impressionist oil painting style, rich textures",
      };
      const stylePrompt = styleMap[input.imageStyle] ?? styleMap.watercolor;
      const personPart = personPrompts ? `, featuring ${personPrompts}` : "";

      let imageUrl: string | undefined;
      let imageKey: string | undefined;
      try {
        const imgRes = await generateImage({
          prompt: `A heartwarming diary illustration${personPart}. Scene: ${diaryText.slice(0, 200)}. Style: ${stylePrompt}, peaceful atmosphere, no text.`,
        });
        imageUrl = imgRes.url;
        // S3에 저장
        if (imageUrl) {
          const imgFetch = await fetch(imageUrl);
          const imgBuffer = Buffer.from(await imgFetch.arrayBuffer());
          const saved = await storagePut(`life-story/journals/${userId}/${input.journalDate}.png`, imgBuffer, "image/png");
          imageKey = saved.key;
          imageUrl = saved.url;
        }
      } catch {
        // 이미지 생성 실패해도 일기 텍스트는 저장
      }

      // 5. DB 저장
      await db.insert(lifeJournals).values({
        userId,
        journalDate: input.journalDate,
        conversationJson: JSON.stringify([{ role: "user", content: input.conversationText }]),
        diaryText,
        imageKey,
        imageUrl,
        imageStyle: input.imageStyle,
        emotionTags,
        isShared: 0,
      });

      return { success: true, diaryText, imageUrl, emotionTags };
    }),

  // ─────────────────────────────────────────
  // 소중한 사람에게 남기는 편지
  // ─────────────────────────────────────────

  /** 편지 목록 조회 */
  getLetters: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
    const userId = userRows[0].id;

    if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
      throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
    }

    return db.select().from(legacyLetters).where(eq(legacyLetters.userId, userId)).orderBy(desc(legacyLetters.createdAt));
  }),

  /** 편지 작성 */
  createLetter: protectedProcedure
    .input(z.object({
      recipientName: z.string().min(1).max(64),
      recipientRelationship: z.string().max(32).optional(),
      recipientEmail: z.string().email().optional(),
      recipientPhone: z.string().max(32).optional(),
      title: z.string().max(256).optional(),
      content: z.string().min(1).max(10000),
      releaseCondition: z.enum(["after_death", "specific_date", "event"]).default("after_death"),
      releaseDate: z.string().optional(), // ISO 날짜 문자열
      releaseEventDesc: z.string().max(256).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
      }

      await db.insert(legacyLetters).values({
        userId,
        recipientName: input.recipientName,
        recipientRelationship: input.recipientRelationship,
        recipientEmail: input.recipientEmail,
        recipientPhone: input.recipientPhone,
        title: input.title ?? `${input.recipientName}에게 남기는 편지`,
        content: input.content,
        releaseCondition: input.releaseCondition,
        releaseDate: input.releaseDate ? new Date(input.releaseDate) : undefined,
        releaseEventDesc: input.releaseEventDesc,
        status: "locked",
      });

      return { success: true };
    }),

  /** 편지 삭제 */
  deleteLetter: protectedProcedure
    .input(z.object({ letterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      await db.delete(legacyLetters).where(and(eq(legacyLetters.id, input.letterId), eq(legacyLetters.userId, userId)));
      return { success: true };
    }),

  /** AI 일기 삭제 */
  deleteJournal: protectedProcedure
    .input(z.object({ journalId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      // 본인 일기만 삭제 가능
      await db.delete(lifeJournals).where(and(eq(lifeJournals.id, input.journalId), eq(lifeJournals.userId, userId)));
      return { success: true };
    }),

  // ─────────────────────────────────────────
  // 나의 사진 갤러리
  // ─────────────────────────────────────────

  /** 사진 업로드 (base64 → S3) */
  uploadPhoto: protectedProcedure
    .input(z.object({
      fileName: z.string().min(1).max(255),
      fileType: z.string().min(1).max(100),
      fileSize: z.number().int().positive(),
      fileBase64: z.string(),
      caption: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
      }

      // 파일 크기 제한 10MB
      if (input.fileSize > 10 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "파일 크기는 10MB 이하여야 합니다." });
      }

      const fileBuffer = Buffer.from(input.fileBase64, "base64");
      const now = Date.now();
      const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `life-story/photos/${userId}/${now}-${safeFileName}`;
      const { key, url } = await storagePut(fileKey, fileBuffer, input.fileType);

      await db.insert(lifePhotos).values({
        userId,
        fileKey: key,
        fileUrl: url,
        fileName: input.fileName,
        caption: input.caption,
        fileSize: input.fileSize,
        isActive: 1,
      });

      return { success: true, url, key };
    }),

  /** 사진 갤러리 목록 조회 */
  getPhotos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
    const userId = userRows[0].id;

    if (!(await checkLifeStoryAccess(userId, ctx.user.role))) {
      throw new TRPCError({ code: "FORBIDDEN", message: "EverWill 인증 회원(₩168,000) 전용 기능입니다. 유언장 전자 인증 후 이용해주세요." });
    }

    return db.select().from(lifePhotos)
      .where(and(eq(lifePhotos.userId, userId), eq(lifePhotos.isActive, 1)))
      .orderBy(desc(lifePhotos.createdAt));
  }),

  /** 사진 삭제 */
  deletePhoto: protectedProcedure
    .input(z.object({ photoId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id }).from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
      const userId = userRows[0].id;

      await db.update(lifePhotos).set({ isActive: 0 })
        .where(and(eq(lifePhotos.id, input.photoId), eq(lifePhotos.userId, userId)));
      return { success: true };
    }),
});
