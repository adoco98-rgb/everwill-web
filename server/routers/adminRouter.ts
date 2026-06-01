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
import { adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, payments, wills, inquiries, assetVerifications, legacyLetters, lifeJournals, autobiographies } from "../../drizzle/schema";
import type { Will } from "../../drizzle/schema";
import { desc, eq, like, or, sql, and, gte } from "drizzle-orm";

export const adminRouter = router({
  /** 종합 통계 */
  stats: adminProcedure.query(async ({ ctx }) => {
    
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
  getUsers: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      role: z.enum(["all", "user", "admin"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      
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
  resetUserPassword: adminProcedure
    .input(z.object({
      userId: z.number(),
      newPassword: z.string().min(8),
    }))
    .mutation(async ({ ctx, input }) => {
      
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
  updateUserGrade: adminProcedure
    .input(z.object({
      userId: z.number(),
      grade: z.enum(["general", "silver", "gold", "platinum", "vip"]),
    }))
    .mutation(async ({ ctx, input }) => {
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(users)
        .set({ memberGrade: input.grade, gradeUpdatedAt: new Date() })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** 회원 역할 변경 */
  updateUserRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** 결제 내역 조회 */
  getPayments: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      
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
  getWills: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      
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
  getInquiries: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "answered"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      
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

  /** 회원 상세 조회 - 모든 자료 통합 */
  getUserDetail: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      // 회원 기본 정보
      const [user] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "회원을 찾을 수 없습니다" });
      // 유언장 목록
      const userWills = await db.select().from(wills).where(eq(wills.userId, input.userId)).orderBy(desc(wills.createdAt));
      // 결제 내역
      const userPayments = await db.select().from(payments).where(eq(payments.userId, input.userId)).orderBy(desc(payments.paidAt));
      // 자산 인증
      const userAssets = await db.select().from(assetVerifications).where(eq(assetVerifications.userId, input.userId)).orderBy(desc(assetVerifications.createdAt));
      // 편지
      const userLetters = await db.select().from(legacyLetters).where(eq(legacyLetters.userId, input.userId)).orderBy(desc(legacyLetters.createdAt));
      // 일기
      const userJournals = await db.select().from(lifeJournals).where(eq(lifeJournals.userId, input.userId)).orderBy(desc(lifeJournals.createdAt));
      // 자서전
      const userAutobiographies = await db.select().from(autobiographies).where(eq(autobiographies.userId, input.userId)).orderBy(desc(autobiographies.createdAt));
      return {
        user,
        wills: userWills,
        payments: userPayments,
        assets: userAssets,
        letters: userLetters,
        journals: userJournals,
        autobiographies: userAutobiographies,
      };
    }),

  /** 회원 법적 인증 정보 업데이트 (kycStatus, 주민번호 마스킹 등) */
  updateUserLegal: adminProcedure
    .input(z.object({
      userId: z.number(),
      kycStatus: z.enum(["none", "pending", "verified", "failed", "expired"]).optional(),
      kycProvider: z.string().optional(),
      kycReferenceId: z.string().optional(),
      identityVerified: z.number().optional(),
      signatureVerified: z.number().optional(),
      voiceVerified: z.number().optional(),
      residentNumberMasked: z.string().optional(),
      residentNumberEnc: z.string().optional(),
      passportNumberEnc: z.string().optional(),
      passportExpiry: z.string().optional(),
      foreignerNumberEnc: z.string().optional(),
      address: z.string().optional(),
      addressDetail: z.string().optional(),
      city: z.string().optional(),
      zipCode: z.string().optional(),
      adminNote: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const updateData: Record<string, unknown> = {};
      if (input.kycStatus !== undefined) {
        updateData.kycStatus = input.kycStatus;
        if (input.kycStatus === "verified") {
          updateData.kycVerifiedAt = new Date();
          updateData.identityVerified = 1;
          // eKYC 인증 만료일: 1년 후
          const expires = new Date();
          expires.setFullYear(expires.getFullYear() + 1);
          updateData.kycExpiresAt = expires;
        }
      }
      if (input.kycProvider !== undefined) updateData.kycProvider = input.kycProvider;
      if (input.kycReferenceId !== undefined) updateData.kycReferenceId = input.kycReferenceId;
      if (input.identityVerified !== undefined) updateData.identityVerified = input.identityVerified;
      if (input.signatureVerified !== undefined) {
        updateData.signatureVerified = input.signatureVerified;
        if (input.signatureVerified === 1) updateData.signatureVerifiedAt = new Date();
      }
      if (input.voiceVerified !== undefined) {
        updateData.voiceVerified = input.voiceVerified;
        if (input.voiceVerified === 1) updateData.voiceVerifiedAt = new Date();
      }
      if (input.residentNumberMasked !== undefined) updateData.residentNumberMasked = input.residentNumberMasked;
      if (input.residentNumberEnc !== undefined) updateData.residentNumberEnc = input.residentNumberEnc;
      if (input.passportNumberEnc !== undefined) updateData.passportNumberEnc = input.passportNumberEnc;
      if (input.passportExpiry !== undefined) updateData.passportExpiry = input.passportExpiry;
      if (input.foreignerNumberEnc !== undefined) updateData.foreignerNumberEnc = input.foreignerNumberEnc;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.addressDetail !== undefined) updateData.addressDetail = input.addressDetail;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.zipCode !== undefined) updateData.zipCode = input.zipCode;
      if (input.adminNote !== undefined) updateData.adminNote = input.adminNote;
      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, input.userId));
      }
      return { success: true };
    }),

  /** 관리자 메모 저장 */
  updateAdminNote: adminProcedure
    .input(z.object({ userId: z.number(), note: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(users).set({ adminNote: input.note }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** 계정 정지/해제 */
  updateSuspend: adminProcedure
    .input(z.object({
      userId: z.number(),
      suspended: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(users).set({
        suspended: input.suspended,
        suspendReason: input.reason || null,
        suspendedAt: input.suspended === 1 ? new Date() : null,
      }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  /** 문의 답변 */
  replyInquiry: adminProcedure
    .input(z.object({
      inquiryId: z.number(),
      reply: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(inquiries)
        .set({ reply: input.reply, status: "answered", repliedAt: new Date() })
        .where(eq(inquiries.id, input.inquiryId));
      return { success: true };
    }),
});
