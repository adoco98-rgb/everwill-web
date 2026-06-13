/**
 * expertRouter - 전문가 파트너 시스템 (변호사·세무사·공증인)
 * - 공개 목록 조회 (홈페이지 + 대시보드)
 * - 파트너 가입 신청
 * - 관리자 승인/거절/정지
 * - 연락처는 절대 공개하지 않음 (상담 신청은 EverWill 통해서만)
 */

import { z } from "zod";
import { eq, and, like, or, desc, asc } from "drizzle-orm";
import { getDb } from "../db";
import { expertPartners } from "../../drizzle/schema";
import {
  publicProcedure,
  protectedProcedure,
  router,
} from "../_core/trpc";
import { TRPCError } from "@trpc/server";

// ===== 공개 전문가 목록 조회 =====
const listExperts = publicProcedure
  .input(
    z.object({
      country: z.string().optional(),
      specialty: z.enum(["lawyer", "tax", "all"]).optional().default("all"),
      search: z.string().optional(),
      limit: z.number().min(1).max(100).optional().default(12),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const { country, specialty, search, limit, offset } = input;

    // 활성 파트너만 조회
    const conditions: ReturnType<typeof eq>[] = [eq(expertPartners.status, "active")];

    if (country && country !== "all") {
      conditions.push(eq(expertPartners.country, country));
    }
    if (specialty && specialty !== "all") {
      conditions.push(eq(expertPartners.specialty, specialty as "lawyer" | "tax"));
    }

    let baseQuery = db
      .select({
        id: expertPartners.id,
        name: expertPartners.name,
        nameEn: expertPartners.nameEn,
        specialty: expertPartners.specialty,
        subSpecialty: expertPartners.subSpecialty,
        country: expertPartners.country,
        city: expertPartners.city,
        firmName: expertPartners.firmName,
        bio: expertPartners.bio,
        bioEn: expertPartners.bioEn,
        yearsOfExperience: expertPartners.yearsOfExperience,
        languages: expertPartners.languages,
        photoUrl: expertPartners.photoUrl,
        ratingAvg: expertPartners.ratingAvg,
        reviewCount: expertPartners.reviewCount,
        consultCount: expertPartners.consultCount,
        isSample: expertPartners.isSample,
        createdAt: expertPartners.createdAt,
        // 연락처(email, phone, website, licenseNumber)는 의도적으로 제외
      })
      .from(expertPartners)
      .$dynamic();

    if (search) {
      const searchCondition = or(
        like(expertPartners.name, `%${search}%`),
        like(expertPartners.nameEn, `%${search}%`),
        like(expertPartners.firmName, `%${search}%`),
        like(expertPartners.subSpecialty, `%${search}%`),
        like(expertPartners.city, `%${search}%`)
      );
      const rows = await baseQuery
        .where(and(...conditions, searchCondition))
        .orderBy(desc(expertPartners.ratingAvg), desc(expertPartners.consultCount))
        .limit(limit)
        .offset(offset);

      const countRows = await db
        .select({ id: expertPartners.id })
        .from(expertPartners)
        .where(and(...conditions, searchCondition));

      return { experts: rows, total: countRows.length, hasMore: offset + limit < countRows.length };
    }

    const rows = await baseQuery
      .where(and(...conditions))
      .orderBy(desc(expertPartners.ratingAvg), desc(expertPartners.consultCount))
      .limit(limit)
      .offset(offset);

    const countRows = await db
      .select({ id: expertPartners.id })
      .from(expertPartners)
      .where(and(...conditions));

    return { experts: rows, total: countRows.length, hasMore: offset + limit < countRows.length };
  });

// ===== 전문가 상세 조회 (연락처 제외) =====
const getExpert = publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const [expert] = await db
      .select({
        id: expertPartners.id,
        name: expertPartners.name,
        nameEn: expertPartners.nameEn,
        specialty: expertPartners.specialty,
        subSpecialty: expertPartners.subSpecialty,
        country: expertPartners.country,
        city: expertPartners.city,
        firmName: expertPartners.firmName,
        bio: expertPartners.bio,
        bioEn: expertPartners.bioEn,
        yearsOfExperience: expertPartners.yearsOfExperience,
        languages: expertPartners.languages,
        photoUrl: expertPartners.photoUrl,
        ratingAvg: expertPartners.ratingAvg,
        reviewCount: expertPartners.reviewCount,
        consultCount: expertPartners.consultCount,
        isSample: expertPartners.isSample,
        createdAt: expertPartners.createdAt,
      })
      .from(expertPartners)
      .where(and(eq(expertPartners.id, input.id), eq(expertPartners.status, "active")));

    if (!expert) throw new TRPCError({ code: "NOT_FOUND", message: "전문가를 찾을 수 없습니다." });
    return expert;
  });

// ===== 파트너 가입 신청 (로그인 필요) =====
const applyPartner = protectedProcedure
  .input(
    z.object({
      name: z.string().min(2).max(100),
      nameEn: z.string().max(100).optional(),
      specialty: z.enum(["lawyer", "tax"]),
      subSpecialty: z.string().max(200).optional(),
      country: z.string().max(8),
      city: z.string().max(100).optional(),
      firmName: z.string().max(200).optional(),
      bio: z.string().max(2000).optional(),
      bioEn: z.string().max(2000).optional(),
      yearsOfExperience: z.number().min(0).max(60).optional(),
      languages: z.string().max(200).optional(),
      email: z.string().email().max(320),
      phone: z.string().max(50).optional(),
      website: z.string().max(500).optional(),
      licenseNumber: z.string().max(100).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    // 중복 신청 방지
    const existing = await db
      .select({ id: expertPartners.id })
      .from(expertPartners)
      .where(eq(expertPartners.userId, ctx.user.id));

    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "이미 파트너 신청이 접수되어 있습니다.",
      });
    }

    await db.insert(expertPartners).values({
      ...input,
      userId: ctx.user.id,
      status: "pending",
      annualFeePaid: 0,
      isSample: 0,
    });

    return { success: true };
  });

// ===== 내 파트너 신청 상태 조회 =====
const getMyPartnerStatus = protectedProcedure.query(async ({ ctx }) => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

  const [row] = await db
    .select({
      id: expertPartners.id,
      status: expertPartners.status,
      annualFeePaid: expertPartners.annualFeePaid,
      adminNote: expertPartners.adminNote,
      createdAt: expertPartners.createdAt,
    })
    .from(expertPartners)
    .where(eq(expertPartners.userId, ctx.user.id));

  return row ?? null;
});

// ===== 관리자: 전체 파트너 목록 (연락처 포함) =====
const adminListExperts = protectedProcedure
  .input(
    z.object({
      status: z.enum(["pending", "active", "suspended", "rejected", "all"]).optional().default("all"),
      limit: z.number().min(1).max(200).optional().default(50),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "관리자 권한이 필요합니다." });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const conditions = [];
    if (input.status !== "all") {
      conditions.push(eq(expertPartners.status, input.status as "pending" | "active" | "suspended" | "rejected"));
    }

    const rows = await db
      .select()
      .from(expertPartners)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(expertPartners.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    const allRows = await db.select({ id: expertPartners.id }).from(expertPartners)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return { experts: rows, total: allRows.length };
  });

// ===== 관리자: 파트너 상태 변경 (승인/거절/정지) =====
const adminUpdateExpertStatus = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      status: z.enum(["active", "suspended", "rejected"]),
      adminNote: z.string().max(500).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "관리자 권한이 필요합니다." });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    await db
      .update(expertPartners)
      .set({
        status: input.status,
        adminNote: input.adminNote,
        ...(input.status === "active" ? { annualFeePaid: 1 } : {}),
      })
      .where(eq(expertPartners.id, input.id));

    return { success: true };
  });

// ===== 관리자: 파트너 정보 수정 =====
const adminUpdateExpert = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(2).max(100).optional(),
      nameEn: z.string().max(100).optional(),
      specialty: z.enum(["lawyer", "tax"]).optional(),
      subSpecialty: z.string().max(200).optional(),
      country: z.string().max(8).optional(),
      city: z.string().max(100).optional(),
      firmName: z.string().max(200).optional(),
      bio: z.string().max(2000).optional(),
      bioEn: z.string().max(2000).optional(),
      yearsOfExperience: z.number().min(0).max(60).optional(),
      languages: z.string().max(200).optional(),
      photoUrl: z.string().max(1000).optional(),
      adminNote: z.string().max(500).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "관리자 권한이 필요합니다." });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const { id, ...updateData } = input;
    await db.update(expertPartners).set(updateData).where(eq(expertPartners.id, id));
    return { success: true };
  });

// ===== 국가 목록 조회 (필터용) =====
const getCountries = publicProcedure.query(async () => {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .selectDistinct({ country: expertPartners.country })
    .from(expertPartners)
    .where(eq(expertPartners.status, "active"))
    .orderBy(asc(expertPartners.country));

  return rows.map((r: { country: string }) => r.country);
});

export const expertRouter = router({
  list: listExperts,
  get: getExpert,
  applyPartner: applyPartner,
  myStatus: getMyPartnerStatus,
  getCountries,
  admin: router({
    list: adminListExperts,
    updateStatus: adminUpdateExpertStatus,
    update: adminUpdateExpert,
  }),
});
