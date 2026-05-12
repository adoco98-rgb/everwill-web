/**
 * 관리자 전용 API 라우터
 * - 회원 목록/검색/역할 변경/비밀번호 초기화/등급 변경
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
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalUsersRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const [todayUsersRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(gte(users.createdAt, todayStart));
    const [totalWillsRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(wills);
    const [totalPaymentsRow] = await db.select({ total: sql<number>`COALESCE(SUM(amountTotal), 0)` }).from(payments).where(eq(payments.status, "completed"));
    const [monthPaymentsRow] = await db.select({ total: sql<number>`COALESCE(SUM(amountTotal), 0)` }).from(payments).where(and(eq(payments.status, "completed"), gte(payments.paidAt, monthStart)));
    const [pendingInquiriesRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(inquiries).where(eq(inquiries.status, "pending"));
    return {
      totalUsers: totalUsersRow.count,
      todayUsers: todayUsersRow.count,
      totalWills: totalWillsRow.count,
      totalRevenue: totalPaymentsRow.total,
      monthRevenue: monthPaymentsRow.total,
      pendingInquiries: pendingInquiriesRow.count,
    };
  }),

  /** 회원 목록 조회 */
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
        memberGrade: users.memberGrade,
        gradeUpdatedAt: users.gradeUpdatedAt,
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

  /** 회원 비밀번호 초기화 (관리자 전용) */
  resetUserPassword: protectedProcedure
    .input(z.object({
      userId: z.number(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const bcrypt = await import("bcryptjs");
      const hash = await bcrypt.hash(input.newPassword, 12);
      await db.update(users)
        .set({ passwordHash: hash })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** 회원 등급 수동 변경 (관리자 전용) */
  updateUserGrade: protectedProcedure
    .input(z.object({
      userId: z.number(),
      grade: z.enum(["general", "silver", "gold", "platinum", "vip"]),
    }))
    .mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(users)
        .set({ memberGrade: input.grade, gradeUpdatedAt: new Date() })
        .where(eq(users.id, input.userId));
      return { success: true };
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
      await db.update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** 결제 내역 조회 */
  getPayments: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const offset = (input.page - 1) * input.limit;
      const conditions = [];
      if (input.search) {
        conditions.push(or(
          like(users.name, `%${input.search}%`),
          like(users.email, `%${input.search}%`),
        ));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const list = await db.select({
        id: payments.id,
        userId: payments.userId,
        amount: payments.amountTotal,
        currency: payments.currency,
        status: payments.status,
        paidAt: payments.paidAt,
        items: payments.items,
        userName: users.name,
        userEmail: users.email,
      })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .where(whereClause)
        .orderBy(desc(payments.paidAt))
        .limit(input.limit)
        .offset(offset);
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .where(whereClause);
      return { list, total: countResult.count };
    }),

  /** 유언장 목록 조회 */
  getWills: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const offset = (input.page - 1) * input.limit;
      const conditions = [];
      if (input.search) {
        conditions.push(or(
          like(users.name, `%${input.search}%`),
          like(users.email, `%${input.search}%`),
        ));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const list = await db.select({
        id: wills.id,
        userId: wills.userId,
        status: wills.status,
        isCertified: wills.isCertified,
        createdAt: wills.createdAt,
        updatedAt: wills.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
        .from(wills)
        .leftJoin(users, eq(wills.userId, users.id))
        .where(whereClause)
        .orderBy(desc(wills.updatedAt))
        .limit(input.limit)
        .offset(offset);
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(wills)
        .leftJoin(users, eq(wills.userId, users.id))
        .where(whereClause);
      return { list, total: countResult.count };
    }),

  /** 문의 목록 조회 */
  getInquiries: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "answered"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const offset = (input.page - 1) * input.limit;
      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(inquiries.status, input.status));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const list = await db.select({
        id: inquiries.id,
        userId: inquiries.userId,
        subject: inquiries.subject,
        content: inquiries.content,
        status: inquiries.status,
        reply: inquiries.reply,
        createdAt: inquiries.createdAt,
        repliedAt: inquiries.repliedAt,
        userName: users.name,
        userEmail: users.email,
      })
        .from(inquiries)
        .leftJoin(users, eq(inquiries.userId, users.id))
        .where(whereClause)
        .orderBy(desc(inquiries.createdAt))
        .limit(input.limit)
        .offset(offset);
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(inquiries)
        .leftJoin(users, eq(inquiries.userId, users.id))
        .where(whereClause);
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
      await db.update(inquiries)
        .set({ reply: input.reply, status: "answered", repliedAt: new Date() })
        .where(eq(inquiries.id, input.inquiryId));
      return { success: true };
    }),
});
