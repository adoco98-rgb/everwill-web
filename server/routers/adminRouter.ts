/**
 * 관리자 전용 API 라우터
 * - 회원 목록/검색/역할 변경
 * - 결제 내역 및 매출 통계
 * - 유언장 목록
 * - 문의 목록 및 답변
 * - 종합 통계 대시보드
 */
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, payments, wills, inquiries } from "../../drizzle/schema";
import type { Will } from "../../drizzle/schema";
import { desc, eq, like, or, sql, and, gte } from "drizzle-orm";

/** 관리자 권한 확인 미들웨어 */
function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
  }
}

export const adminRouter = router({
  /** 종합 통계 */
  stats: protectedProcedure.query(async ({ ctx }) => {
    requireAdmin(ctx.user.role);

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [todayUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users)
      .where(gte(users.createdAt, new Date(new Date().setHours(0, 0, 0, 0))));
    const [thisMonthUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users)
      .where(gte(users.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)));

    const [totalRevenue] = await db.select({ total: sql<number>`COALESCE(SUM(amountTotal), 0)` })
      .from(payments).where(eq(payments.status, "completed"));
    const [monthRevenue] = await db.select({ total: sql<number>`COALESCE(SUM(amountTotal), 0)` })
      .from(payments)
      .where(and(
        eq(payments.status, "completed"),
        gte(payments.paidAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      ));

    const [totalWills] = await db.select({ count: sql<number>`COUNT(*)` }).from(wills);
    const [certifiedWills] = await db.select({ count: sql<number>`COUNT(*)` }).from(wills)
      .where(eq(wills.isCertified, 1));

    const [pendingInquiries] = await db.select({ count: sql<number>`COUNT(*)` }).from(inquiries)
      .where(eq(inquiries.status, "pending"));
    const [totalInquiries] = await db.select({ count: sql<number>`COUNT(*)` }).from(inquiries);

    const [totalPayments] = await db.select({ count: sql<number>`COUNT(*)` }).from(payments)
      .where(eq(payments.status, "completed"));

    return {
      totalUsers: totalUsers.count,
      todayUsers: todayUsers.count,
      thisMonthUsers: thisMonthUsers.count,
      totalRevenue: totalRevenue.total,
      monthRevenue: monthRevenue.total,
      totalWills: totalWills.count,
      certifiedWills: certifiedWills.count,
      pendingInquiries: pendingInquiries.count,
      totalInquiries: totalInquiries.count,
      totalPayments: totalPayments.count,
    };
  }),

  /** 회원 목록 (검색, 페이지네이션) */
  getUsers: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      role: z.enum(["all", "user", "admin"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.search) {
        conditions.push(or(
          like(users.name, `%${input.search}%`),
          like(users.email, `%${input.search}%`),
          like(users.phone, `%${input.search}%`),
        ));
      }
      if (input.role !== "all") {
        conditions.push(eq(users.role, input.role));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const list = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        country: users.country,
        loginMethod: users.loginMethod,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
        pointBalance: users.pointBalance,
      })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(whereClause);

      return { list, total: countResult.count, page: input.page, limit: input.limit };
    }),

  /** 회원 역할 변경 */
  updateUserRole: protectedProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** 결제 내역 목록 */
  getPayments: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "completed", "failed", "refunded"]).default("all"),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(payments.status, input.status));
      }
      if (input.search) {
        conditions.push(like(payments.customerEmail, `%${input.search}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const list = await db.select().from(payments)
        .where(whereClause)
        .orderBy(desc(payments.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(payments).where(whereClause);

      // 월별 매출 집계 (최근 6개월)
      const monthlyRevenue = await db.select({
        month: sql<string>`DATE_FORMAT(paidAt, '%Y-%m')`,
        total: sql<number>`COALESCE(SUM(amountTotal), 0)`,
        count: sql<number>`COUNT(*)`,
      })
        .from(payments)
        .where(and(
          eq(payments.status, "completed"),
          gte(payments.paidAt, new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000))
        ))
        .groupBy(sql`DATE_FORMAT(paidAt, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(paidAt, '%Y-%m')`);

      return { list, total: countResult.count, monthlyRevenue };
    }),

  /** 유언장 목록 */
  getWills: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "draft", "certified", "expired"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(wills.status, input.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const list = await db.select({
        id: wills.id,
        userId: wills.userId,
        title: wills.title,
        mode: wills.mode,
        status: wills.status,
        isCertified: wills.isCertified,
        certifiedAt: wills.certifiedAt,
        createdAt: wills.createdAt,
        updatedAt: wills.updatedAt,
      })
        .from(wills)
        .where(whereClause)
        .orderBy(desc(wills.createdAt))
        .limit(input.limit)
        .offset(offset);

      // 작성자 이름/이메일 JOIN
      const enriched = await Promise.all(list.map(async (w: typeof list[number]) => {
        const [u] = await db.select({ name: users.name, email: users.email })
          .from(users).where(eq(users.id, w.userId)).limit(1);
        return { ...w, userName: u?.name || "-", userEmail: u?.email || "-" };
      }));

      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(wills).where(whereClause);

      return { list: enriched, total: countResult.count };
    }),

  /** 문의 목록 */
  getInquiries: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "answered", "closed"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(inquiries.status, input.status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const list = await db.select().from(inquiries)
        .where(whereClause)
        .orderBy(desc(inquiries.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(inquiries).where(whereClause);

      return { list, total: countResult.count };
    }),

  /** 문의 답변 */
  replyInquiry: protectedProcedure
    .input(z.object({
      inquiryId: z.number(),
      reply: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(inquiries).set({
        reply: input.reply,
        status: "answered",
        repliedAt: new Date(),
        repliedBy: ctx.user.id,
      }).where(eq(inquiries.id, input.inquiryId));
      return { success: true };
    }),
});
