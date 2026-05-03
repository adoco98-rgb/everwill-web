import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { newsPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// 관리자 전용 미들웨어
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다" });
  }
  return next({ ctx });
});

export const newsRouter = router({
  // ─── 공개 뉴스 목록 (홈페이지용) ───────────────────────────────────────────
  getPublic: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const items = await db
      .select()
      .from(newsPosts)
      .where(eq(newsPosts.isActive, 1))
      .orderBy(desc(newsPosts.createdAt))
      .limit(10);
    return items;
  }),

  // ─── 전체 뉴스 목록 (관리자용) ─────────────────────────────────────────────
  getAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const items = await db
      .select()
      .from(newsPosts)
      .orderBy(desc(newsPosts.createdAt));
    return items;
  }),

  // ─── 뉴스 등록 ─────────────────────────────────────────────────────────────
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "제목을 입력하세요"),
        url: z.string().url("올바른 URL을 입력하세요"),
        outlet: z.string().min(1, "신문사명을 입력하세요"),
        country: z.string().min(1, "국가를 입력하세요"),
        flag: z.string().min(1, "국기를 입력하세요"),
        summary: z.string().optional(),
        tag: z.string().optional(),
        publishedAt: z.string().optional(),
        isActive: z.number().min(0).max(1).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.insert(newsPosts).values({
        title: input.title,
        url: input.url,
        outlet: input.outlet,
        country: input.country,
        flag: input.flag,
        summary: input.summary ?? null,
        tag: input.tag ?? null,
        publishedAt: input.publishedAt ?? null,
        isActive: input.isActive,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),

  // ─── 뉴스 수정 ─────────────────────────────────────────────────────────────
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        url: z.string().url().optional(),
        outlet: z.string().min(1).optional(),
        country: z.string().min(1).optional(),
        flag: z.string().min(1).optional(),
        summary: z.string().optional(),
        tag: z.string().optional(),
        publishedAt: z.string().optional(),
        isActive: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const { id, ...fields } = input;
      await db.update(newsPosts).set(fields).where(eq(newsPosts.id, id));
      return { success: true };
    }),

  // ─── 뉴스 삭제 ─────────────────────────────────────────────────────────────
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.delete(newsPosts).where(eq(newsPosts.id, input.id));
      return { success: true };
    }),

  // ─── 공개/비공개 전환 ──────────────────────────────────────────────────────
  toggleActive: adminProcedure
    .input(z.object({ id: z.number(), isActive: z.number().min(0).max(1) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db
        .update(newsPosts)
        .set({ isActive: input.isActive })
        .where(eq(newsPosts.id, input.id));
      return { success: true };
    }),
});
