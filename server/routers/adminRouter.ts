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
  stats: adminProcedure
    .input(z.object({ country: z.string().optional() }))
    .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const countryFilter = input.country ? eq(users.country, input.country) : undefined;
    const [totalUsersRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(countryFilter);
    const [todayUsersRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(users).where(and(gte(users.createdAt, todayStart), countryFilter));
    const [totalWillsRow] = await db.select({ count: sql<number>`COUNT(*)` }).from(wills)
      .leftJoin(users, eq(wills.userId, users.id)).where(countryFilter);
    const paymentsBase = countryFilter
      ? db.select({ total: sql<number>`COALESCE(SUM(${payments.amountTotal}), 0)` }).from(payments).leftJoin(users, eq(payments.userId, users.id)).where(and(eq(payments.status, "completed"), countryFilter))
      : db.select({ total: sql<number>`COALESCE(SUM(amountTotal), 0)` }).from(payments).where(eq(payments.status, "completed"));
    const monthPaymentsBase = countryFilter
      ? db.select({ total: sql<number>`COALESCE(SUM(${payments.amountTotal}), 0)` }).from(payments).leftJoin(users, eq(payments.userId, users.id)).where(and(eq(payments.status, "completed"), gte(payments.paidAt, monthStart), countryFilter))
      : db.select({ total: sql<number>`COALESCE(SUM(amountTotal), 0)` }).from(payments).where(and(eq(payments.status, "completed"), gte(payments.paidAt, monthStart)));
    const inquiriesBase = countryFilter
      ? db.select({ count: sql<number>`COUNT(*)` }).from(inquiries).leftJoin(users, eq(inquiries.userId, users.id)).where(and(eq(inquiries.status, "pending"), countryFilter))
      : db.select({ count: sql<number>`COUNT(*)` }).from(inquiries).where(eq(inquiries.status, "pending"));
    const [[totalPaymentsRow], [monthPaymentsRow], [pendingInquiriesRow]] = await Promise.all([paymentsBase, monthPaymentsBase, inquiriesBase]);
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
      country: z.string().optional(),
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
      if (input.country) {
        conditions.push(eq(users.country, input.country));
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
      country: z.string().optional(),
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
      if (input.country) {
        conditions.push(eq(users.country, input.country));
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
      country: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const offset = (input.page - 1) * input.limit;
      const conditions = [];
      if (input.status !== "all") {
        conditions.push(eq(inquiries.status, input.status));
      }
      if (input.country) {
        conditions.push(eq(users.country, input.country));
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

  /**
   * 셀러 정산 내역 조회
   * 추천인 코드가 있는 셀러의 추천 현황 + 수수료 합계
   */
  getSellerStats: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const offset = (input.page - 1) * input.limit;

      // 추천인 코드가 있는 셀러 목록
      const baseWhere = sql`${users.referralCode} IS NOT NULL AND ${users.referralCode} != ''`;
      const searchWhere = input.search
        ? and(
            baseWhere,
            or(
              like(users.name, `%${input.search}%`),
              like(users.referralCode, `%${input.search}%`),
              like(users.email, `%${input.search}%`),
            )
          )
        : baseWhere;

      const sellerRows = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        referralCode: users.referralCode,
        country: users.country,
        pointBalance: users.pointBalance,
        createdAt: users.createdAt,
      }).from(users)
        .where(searchWhere)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(offset);

      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(searchWhere);

      // 각 셀러의 추천 회원 수 + 결제 합계 조회
      const sellersWithStats = await Promise.all(sellerRows.map(async (seller) => {
        const [referralCount] = await db.select({ cnt: sql<number>`COUNT(*)` })
          .from(users).where(eq(users.referredBy, seller.referralCode!));

        const referredUserIds = await db.select({ id: users.id })
          .from(users).where(eq(users.referredBy, seller.referralCode!));

        let totalRevenue = 0;
        for (const u of referredUserIds) {
          const [paySum] = await db.select({
            total: sql<number>`COALESCE(SUM(${payments.amountTotal}), 0)`,
          }).from(payments)
            .where(and(eq(payments.userId, u.id), eq(payments.status, "completed")));
          totalRevenue += Number(paySum?.total ?? 0);
        }

        const commissionAmount = Math.floor(totalRevenue * 0.1);

        return {
          ...seller,
          totalReferrals: Number(referralCount?.cnt ?? 0),
          totalRevenue,
          commissionAmount,
        };
      }));

      return {
        sellers: sellersWithStats,
        total: Number(countResult?.count ?? 0),
        page: input.page,
        limit: input.limit,
      };
    }),
});

// =====================================================
// 국가별 관리 API (14개국)
// =====================================================

export const adminCountryRouter = router({
  /** 14개국 전체 요약 통계 */
  getCountrySummary: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    // 국가별 가입자 수
    const usersByCountry = await db
      .select({
        country: users.country,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .groupBy(users.country);

    // 국가별 매출 (payments 테이블 + users JOIN)
    const revenueByCountry = await db
      .select({
        country: users.country,
        total: sql<number>`COALESCE(SUM(${payments.amountTotal}), 0)`,
        count: sql<number>`COUNT(${payments.id})`,
      })
      .from(payments)
      .leftJoin(users, eq(payments.userId, users.id))
      .where(eq(payments.status, "completed"))
      .groupBy(users.country);

    // 국가별 문의 수
    const inquiriesByCountry = await db
      .select({
        country: users.country,
        total: sql<number>`COUNT(${inquiries.id})`,
        pending: sql<number>`SUM(CASE WHEN ${inquiries.status} = 'pending' THEN 1 ELSE 0 END)`,
      })
      .from(inquiries)
      .leftJoin(users, eq(inquiries.userId, users.id))
      .groupBy(users.country);

    // 국가별 유언장 수
    const willsByCountry = await db
      .select({
        country: users.country,
        count: sql<number>`COUNT(${wills.id})`,
        certified: sql<number>`SUM(CASE WHEN ${wills.isCertified} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(wills)
      .leftJoin(users, eq(wills.userId, users.id))
      .groupBy(users.country);

    // 14개국 목록 정의
    const countries = [
      { code: "KR", name: "한국", flag: "🇰🇷", currency: "KRW" },
      { code: "US", name: "미국", flag: "🇺🇸", currency: "USD" },
      { code: "JP", name: "일본", flag: "🇯🇵", currency: "JPY" },
      { code: "CN", name: "중국", flag: "🇨🇳", currency: "CNY" },
      { code: "DE", name: "독일", flag: "🇩🇪", currency: "EUR" },
      { code: "ES", name: "스페인", flag: "🇪🇸", currency: "EUR" },
      { code: "SA", name: "사우디", flag: "🇸🇦", currency: "SAR" },
      { code: "FR", name: "프랑스", flag: "🇫🇷", currency: "EUR" },
      { code: "RU", name: "러시아", flag: "🇷🇺", currency: "RUB" },
      { code: "IN", name: "인도", flag: "🇮🇳", currency: "INR" },
      { code: "BR", name: "브라질", flag: "🇧🇷", currency: "BRL" },
      { code: "CA", name: "캐나다", flag: "🇨🇦", currency: "CAD" },
      { code: "AU", name: "호주", flag: "🇦🇺", currency: "AUD" },
      { code: "NZ", name: "뉴질랜드", flag: "🇳🇿", currency: "NZD" },
    ];

    // 데이터 병합
    const result = countries.map((c) => {
      const userRow = usersByCountry.find((r) => r.country === c.code);
      const revenueRow = revenueByCountry.find((r) => r.country === c.code);
      const inquiryRow = inquiriesByCountry.find((r) => r.country === c.code);
      const willRow = willsByCountry.find((r) => r.country === c.code);
      return {
        ...c,
        users: Number(userRow?.count ?? 0),
        revenue: Number(revenueRow?.total ?? 0),
        paymentCount: Number(revenueRow?.count ?? 0),
        inquiries: Number(inquiryRow?.total ?? 0),
        pendingInquiries: Number(inquiryRow?.pending ?? 0),
        wills: Number(willRow?.count ?? 0),
        certifiedWills: Number(willRow?.certified ?? 0),
      };
    });

    // null/undefined 국가 (기타)
    const etcUsers = usersByCountry
      .filter((r) => !countries.find((c) => c.code === r.country))
      .reduce((sum, r) => sum + Number(r.count), 0);

    return { countries: result, etcUsers };
  }),

  /** 특정 국가 회원 목록 */
  getUsersByCountry: adminProcedure
    .input(z.object({
      country: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const offset = (input.page - 1) * input.limit;
      const conditions: ReturnType<typeof eq>[] = [eq(users.country, input.country) as ReturnType<typeof eq>];
      if (input.search) {
        conditions.push(or(
          like(users.name, `%${input.search}%`),
          like(users.email, `%${input.search}%`),
        ) as ReturnType<typeof eq>);
      }
      const whereClause = and(...conditions);
      const list = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        country: users.country,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
        memberGrade: users.memberGrade,
        kycStatus: users.kycStatus,
      })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(offset);
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(whereClause);
      return { list, total: Number(countResult.count), page: input.page, limit: input.limit };
    }),

  /** 특정 국가 매출 내역 */
  getRevenueByCountry: adminProcedure
    .input(z.object({
      country: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const offset = (input.page - 1) * input.limit;
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
        userCountry: users.country,
      })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .where(and(eq(users.country, input.country), eq(payments.status, "completed")))
        .orderBy(desc(payments.paidAt))
        .limit(input.limit)
        .offset(offset);
      const [countResult] = await db.select({ count: sql<number>`COUNT(*)`, total: sql<number>`COALESCE(SUM(${payments.amountTotal}), 0)` })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .where(and(eq(users.country, input.country), eq(payments.status, "completed")));
      return { list, total: Number(countResult.count), totalRevenue: Number(countResult.total), page: input.page, limit: input.limit };
    }),

  /** 특정 국가 문의 목록 */
  getInquiriesByCountry: adminProcedure
    .input(z.object({
      country: z.string(),
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["all", "pending", "answered"]).default("all"),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const offset = (input.page - 1) * input.limit;
      const conditions = [eq(users.country, input.country) as ReturnType<typeof eq>];
      if (input.status !== "all") {
        conditions.push(eq(inquiries.status, input.status) as ReturnType<typeof eq>);
      }
      const whereClause = and(...conditions);
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
        userCountry: users.country,
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
      return { list, total: Number(countResult.count), page: input.page, limit: input.limit };
    }),

  /** 문의 답변 (국가별 라우터에서도 사용) */
  replyInquiry: adminProcedure
    .input(z.object({
      inquiryId: z.number(),
      reply: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.update(inquiries)
        .set({ reply: input.reply, status: "answered", repliedAt: new Date() })
        .where(eq(inquiries.id, input.inquiryId));
      return { success: true };
    }),

  /** 국가별 월별 매출 추이 (최근 12개월) */
  getMonthlyRevenue: adminProcedure
    .input(z.object({
      country: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      // 최근 12개월 월별 매출
      const rows = await db.execute(sql`
        SELECT
          DATE_FORMAT(p.paidAt, '%Y-%m') as month,
          COALESCE(p.country, u.country, 'KR') as country,
          COUNT(*) as cnt,
          COALESCE(SUM(p.amountTotal), 0) as revenue
        FROM payments p
        LEFT JOIN users u ON p.userId = u.id
        WHERE p.status = 'completed'
          AND p.paidAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
          ${input.country ? sql`AND COALESCE(p.country, u.country, 'KR') = ${input.country}` : sql``}
        GROUP BY month, COALESCE(p.country, u.country, 'KR')
        ORDER BY month ASC
      `);
      const data = (rows as any)[0] as Array<{ month: string; country: string; cnt: number; revenue: number }>;
      return { data: data ?? [] };
    }),

  /** 국가별 상품별 매출 통계 */
  getProductRevenue: adminProcedure
    .input(z.object({
      country: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const conditions: any[] = [eq(payments.status, "completed")];
      if (input.country) {
        conditions.push(sql`COALESCE(${payments.country}, ${users.country}, 'KR') = ${input.country}`);
      }
      const list = await db.select({
        items: payments.items,
        amount: payments.amountTotal,
        currency: payments.currency,
      })
        .from(payments)
        .leftJoin(users, eq(payments.userId, users.id))
        .where(and(...conditions))
        .limit(2000);
      // 상품별 집계
      const productMap: Record<string, { count: number; revenue: number }> = {};
      for (const row of list) {
        const items = (row.items || "certification").split(",").map((s: string) => s.trim()).filter(Boolean);
        for (const item of items) {
          if (!productMap[item]) productMap[item] = { count: 0, revenue: 0 };
          productMap[item].count++;
          productMap[item].revenue += Math.round(Number(row.amount ?? 0) / items.length);
        }
      }
      return {
        products: Object.entries(productMap)
          .map(([name, v]) => ({ name, ...v }))
          .sort((a, b) => b.revenue - a.revenue)
      };
    }),

  /** 결제 데이터 country 필드 마이그레이션 (기존 데이터 업데이트) */
  migratePaymentCountry: adminProcedure
    .mutation(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const result = await db.execute(sql`
        UPDATE payments p
        LEFT JOIN users u ON p.userId = u.id
        SET p.country = COALESCE(u.country, 'KR')
        WHERE p.country IS NULL
      `);
      return { updated: (result as any)[0]?.affectedRows ?? 0 };
    }),

  /** 전체 국가별 매출 요약 (차트용) */
  getRevenueSummary: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    const rows = await db.execute(sql`
      SELECT
        COALESCE(p.country, u.country, 'KR') as country,
        COUNT(*) as cnt,
        COALESCE(SUM(p.amountTotal), 0) as revenue,
        COALESCE(SUM(CASE WHEN p.paidAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN p.amountTotal ELSE 0 END), 0) as monthRevenue
      FROM payments p
      LEFT JOIN users u ON p.userId = u.id
      WHERE p.status = 'completed'
      GROUP BY COALESCE(p.country, u.country, 'KR')
      ORDER BY revenue DESC
    `);
    return { data: (rows as any)[0] as Array<{ country: string; cnt: number; revenue: number; monthRevenue: number }> };
  }),
});
