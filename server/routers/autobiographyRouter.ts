/**
 * autobiographyRouter - 나의 자서전 라우터
 * AI와 대화하며 자서전 작성 + 챕터별 글 생성 + PDF 책 다운로드
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, autobiographies, autobiographyChapters } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";

// 챕터 정의
const CHAPTER_TITLES: Record<number, string> = {
  1: "어린 시절",
  2: "학창 시절",
  3: "직업과 커리어",
  4: "가족과 사랑",
  5: "인생의 교훈",
  6: "미래 세대에게",
};

// 챕터별 시스템 프롬프트
const CHAPTER_SYSTEM_PROMPTS: Record<number, string> = {
  1: `당신은 따뜻하고 공감 능력이 뛰어난 자서전 작가 도우미입니다. 
노인 사용자가 어린 시절 이야기를 편하게 나눌 수 있도록 도와주세요.
질문은 하나씩만 하고, 구체적이고 따뜻하게 물어보세요.
사용자의 답변에 공감하고 더 깊은 이야기를 이끌어내세요.
한국어로 대화하세요. 존댓말을 사용하세요.`,
  2: `당신은 따뜻하고 공감 능력이 뛰어난 자서전 작가 도우미입니다.
학창 시절 이야기를 이끌어내세요. 친구, 선생님, 꿈, 추억에 대해 물어보세요.
질문은 하나씩만 하고, 구체적이고 따뜻하게 물어보세요.
한국어로 대화하세요. 존댓말을 사용하세요.`,
  3: `당신은 따뜻하고 공감 능력이 뛰어난 자서전 작가 도우미입니다.
직업과 커리어 이야기를 이끌어내세요. 첫 직장, 보람, 어려움, 성취에 대해 물어보세요.
질문은 하나씩만 하고, 구체적이고 따뜻하게 물어보세요.
한국어로 대화하세요. 존댓말을 사용하세요.`,
  4: `당신은 따뜻하고 공감 능력이 뛰어난 자서전 작가 도우미입니다.
가족과 사랑 이야기를 이끌어내세요. 배우자, 자녀, 소중한 사람들에 대해 물어보세요.
질문은 하나씩만 하고, 구체적이고 따뜻하게 물어보세요.
한국어로 대화하세요. 존댓말을 사용하세요.`,
  5: `당신은 따뜻하고 공감 능력이 뛰어난 자서전 작가 도우미입니다.
인생의 교훈과 지혜를 이끌어내세요. 어려움, 극복, 깨달음에 대해 물어보세요.
질문은 하나씩만 하고, 구체적이고 따뜻하게 물어보세요.
한국어로 대화하세요. 존댓말을 사용하세요.`,
  6: `당신은 따뜻하고 공감 능력이 뛰어난 자서전 작가 도우미입니다.
미래 세대에게 전하고 싶은 말을 이끌어내세요. 자녀, 손자녀에게 전하는 메시지를 물어보세요.
질문은 하나씩만 하고, 구체적이고 따뜻하게 물어보세요.
한국어로 대화하세요. 존댓말을 사용하세요.`,
};

export const autobiographyRouter = router({
  /**
   * 자서전 가져오기 또는 생성
   * 로그인 사용자의 자서전이 없으면 새로 생성
   */
  getOrCreate: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select({ id: users.id, name: users.name })
      .from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
    const userId = userRows[0].id;

    // 기존 자서전 조회
    const existing = await db.select().from(autobiographies)
      .where(eq(autobiographies.userId, userId)).limit(1);

    if (existing.length > 0) {
      // 모든 챕터 데이터 조회 (대화 내용 포함)
      const chapters = await db.select({
        chapterNumber: autobiographyChapters.chapterNumber,
        conversationJson: autobiographyChapters.conversationJson,
        generatedText: autobiographyChapters.generatedText,
        isCompleted: autobiographyChapters.isCompleted,
      })
        .from(autobiographyChapters)
        .where(eq(autobiographyChapters.autobiographyId, existing[0].id));
      return {
        ...existing[0],
        completedChapterNumbers: chapters
          .filter((c) => c.isCompleted === 1)
          .map((c) => c.chapterNumber),
        chapters: chapters.map((c) => ({
          chapterNumber: c.chapterNumber,
          conversationJson: c.conversationJson,
          generatedText: c.generatedText,
        })),
      };
    }

    // 새 자서전 생성
    const [result] = await db.insert(autobiographies).values({
      userId,
      title: `${userRows[0].name ?? "나"}의 자서전`,
      status: "draft",
      completedChapters: 0,
    });
    const newId = Number((result as any).insertId ?? 0);

    return {
      id: newId,
      userId,
      title: `${userRows[0].name ?? "나"}의 자서전`,
      status: "draft" as const,
      completedChapters: 0,
      completedChapterNumbers: [] as number[],
      chapters: [] as { chapterNumber: number; conversationJson: string | null; generatedText: string | null }[],
      pdfKey: null,
      pdfUrl: null,
      shareToken: null,
      isShared: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),

  /**
   * 자서전 생성
   */
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const userRows = await db.select({ id: users.id, name: users.name })
      .from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
    if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });
    const userId = userRows[0].id;

    const [insertResult] = await db.insert(autobiographies).values({
      userId,
      title: `${userRows[0].name ?? "나"}의 자서전`,
      status: "draft",
      completedChapters: 0,
    });
    return { id: Number((insertResult as any).insertId ?? 0) };
  }),

  /**
   * AI와 대화 (챕터별)
   * 사용자 메시지를 받아 AI 응답 반환
   */
  chat: protectedProcedure
    .input(z.object({
      autobiographyId: z.number(),
      chapterNumber: z.number().min(1).max(6),
      chapterTitle: z.string(),
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // 사용자 확인
      const userRows = await db.select({ id: users.id })
        .from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });

      // 자서전 소유권 확인
      const autoRows = await db.select({ userId: autobiographies.userId })
        .from(autobiographies).where(eq(autobiographies.id, input.autobiographyId)).limit(1);
      if (!autoRows.length || autoRows[0].userId !== userRows[0].id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const systemPrompt = CHAPTER_SYSTEM_PROMPTS[input.chapterNumber] ??
        CHAPTER_SYSTEM_PROMPTS[1];

      // AI 대화 (마지막 10개 메시지만 전송)
      const recentMessages = input.messages.slice(-10);
      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...recentMessages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
      });

      const reply = response.choices?.[0]?.message?.content ?? "죄송합니다, 다시 말씀해 주세요.";

      // 대화 내용 DB 저장 (챕터 레코드 upsert)
      const existingChapter = await db.select({ id: autobiographyChapters.id })
        .from(autobiographyChapters)
        .where(and(
          eq(autobiographyChapters.autobiographyId, input.autobiographyId),
          eq(autobiographyChapters.chapterNumber, input.chapterNumber)
        )).limit(1);

      const allMessages = [...input.messages, { role: "assistant", content: reply }];
      const conversationJson = JSON.stringify(allMessages);

      if (existingChapter.length > 0) {
        await db.update(autobiographyChapters)
          .set({ conversationJson, updatedAt: new Date() })
          .where(eq(autobiographyChapters.id, existingChapter[0].id));
      } else {
        await db.insert(autobiographyChapters).values({
          autobiographyId: input.autobiographyId,
          chapterNumber: input.chapterNumber,
          chapterTitle: CHAPTER_TITLES[input.chapterNumber] ?? input.chapterTitle,
          conversationJson,
          isCompleted: 0,
        });
      }

      return { reply };
    }),

  /**
   * 챕터 글 생성
   * 대화 내용을 바탕으로 AI가 아름다운 에세이 형태의 챕터 글 생성
   */
  generateChapter: protectedProcedure
    .input(z.object({
      autobiographyId: z.number(),
      chapterNumber: z.number().min(1).max(6),
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })),
      artworkUrls: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id, name: users.name })
        .from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });

      const chapterTitle = CHAPTER_TITLES[input.chapterNumber] ?? "나의 이야기";

      // 대화 내용을 에세이로 변환
      const conversationText = input.messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join("\n\n");

      const systemPrompt = `당신은 아름다운 자서전을 쓰는 전문 작가입니다.
사용자가 나눈 대화 내용을 바탕으로 따뜻하고 감동적인 자서전 챕터를 작성해 주세요.

요구사항:
- 1인칭 시점으로 작성 (나는, 내가, 나의...)
- 한국어로 작성
- 문학적이고 아름다운 문체
- 구체적인 장면과 감정 묘사 포함
- 500~1000자 분량
- 단락 구분 명확하게
- 독자(자녀, 손자녀)에게 따뜻하게 전달되는 느낌

챕터 제목: ${chapterTitle}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `다음 대화 내용을 바탕으로 "${chapterTitle}" 챕터를 작성해 주세요:\n\n${conversationText}`,
          },
        ],
      });

      const generatedText: string = String(response.choices?.[0]?.message?.content ?? "");

      // DB 업데이트
      const existingChapter = await db.select({ id: autobiographyChapters.id })
        .from(autobiographyChapters)
        .where(and(
          eq(autobiographyChapters.autobiographyId, input.autobiographyId),
          eq(autobiographyChapters.chapterNumber, input.chapterNumber)
        )).limit(1);

      const artworkUrlsStr: string = (input.artworkUrls ?? []).join(",");

      if (existingChapter.length > 0) {
        await db.update(autobiographyChapters)
          .set({
            generatedText: generatedText,
            artworkUrls: artworkUrlsStr,
            isCompleted: 1,
            updatedAt: new Date(),
          })
          .where(eq(autobiographyChapters.id, existingChapter[0].id));
      } else {
        await db.insert(autobiographyChapters).values({
          autobiographyId: input.autobiographyId,
          chapterNumber: input.chapterNumber,
          chapterTitle: chapterTitle,
          generatedText: generatedText,
          artworkUrls: artworkUrlsStr,
          isCompleted: 1,
        });
      }

      // 완성된 챕터 수 업데이트
      const completedCount = await db.select()
        .from(autobiographyChapters)
        .where(and(
          eq(autobiographyChapters.autobiographyId, input.autobiographyId),
          eq(autobiographyChapters.isCompleted, 1)
        ));

      await db.update(autobiographies)
        .set({ completedChapters: completedCount.length, updatedAt: new Date() })
        .where(eq(autobiographies.id, input.autobiographyId));

      return { text: generatedText };
    }),

  /**
   * PDF 생성
   * 완성된 챕터들로 자서전 PDF 책 생성
   */
  generatePdf: protectedProcedure
    .input(z.object({
      autobiographyId: z.number(),
      userName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ id: users.id, name: users.name })
        .from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (!userRows.length) throw new TRPCError({ code: "NOT_FOUND" });

      // 완성된 챕터 조회
      const chapters = await db.select()
        .from(autobiographyChapters)
        .where(and(
          eq(autobiographyChapters.autobiographyId, input.autobiographyId),
          eq(autobiographyChapters.isCompleted, 1)
        ));

      if (chapters.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "완성된 챕터가 없습니다. 먼저 챕터를 완성해 주세요.",
        });
      }

      const userName = input.userName ?? userRows[0].name ?? "작성자";

      // HTML 기반 PDF 내용 생성
      const chaptersHtml = chapters
        .sort((a, b) => a.chapterNumber - b.chapterNumber)
        .map((ch) => {
          const artworks = (ch.artworkUrls ?? "")
            .split(",")
            .filter(Boolean)
            .map((url) => `<img src="${url}" style="max-width:100%;margin:10px 0;border-radius:8px;" />`)
            .join("");

          return `
            <div style="page-break-before:always;padding:40px;">
              <h2 style="color:#1F3864;font-size:24px;border-bottom:2px solid #C9A961;padding-bottom:10px;">
                ${ch.chapterNumber}장. ${ch.chapterTitle}
              </h2>
              ${artworks}
              <div style="font-size:16px;line-height:2;color:#333;white-space:pre-wrap;margin-top:20px;">
                ${ch.generatedText ?? ""}
              </div>
            </div>
          `;
        })
        .join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Noto Sans KR', sans-serif; margin: 0; padding: 0; }
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
          </style>
        </head>
        <body>
          <!-- 표지 -->
          <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:linear-gradient(135deg,#1F3864,#2a4d8a);color:white;text-align:center;padding:40px;">
            <div style="font-size:48px;margin-bottom:20px;">📖</div>
            <h1 style="font-size:36px;font-weight:bold;color:#C9A961;margin-bottom:10px;">${userName}의 자서전</h1>
            <p style="font-size:18px;color:rgba(255,255,255,0.8);">나의 소중한 인생 이야기</p>
            <p style="font-size:14px;color:rgba(255,255,255,0.5);margin-top:40px;">${new Date().getFullYear()}년</p>
          </div>
          <!-- 목차 -->
          <div style="padding:40px;">
            <h2 style="color:#1F3864;font-size:24px;border-bottom:2px solid #C9A961;padding-bottom:10px;">목차</h2>
            ${chapters
              .sort((a, b) => a.chapterNumber - b.chapterNumber)
              .map((ch) => `<p style="font-size:16px;padding:8px 0;border-bottom:1px solid #eee;">${ch.chapterNumber}장. ${ch.chapterTitle}</p>`)
              .join("")}
          </div>
          <!-- 챕터들 -->
          ${chaptersHtml}
        </body>
        </html>
      `;

      // HTML을 S3에 저장하고 URL 반환 (실제 PDF 변환은 클라이언트 측 print 또는 별도 서비스)
      const { storagePut } = await import("../storage");
      const htmlKey = `autobiography-pdf/${ctx.user.openId}-${Date.now()}.html`;
      const { url: htmlUrl } = await storagePut(
        htmlKey,
        Buffer.from(htmlContent, "utf-8"),
        "text/html"
      );

      // DB에 PDF URL 저장
      await db.update(autobiographies)
        .set({ pdfUrl: htmlUrl, pdfKey: htmlKey, updatedAt: new Date() })
        .where(eq(autobiographies.id, input.autobiographyId));

      return { pdfUrl: htmlUrl };
    }),
});
