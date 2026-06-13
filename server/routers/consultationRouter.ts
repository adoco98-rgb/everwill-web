/**
 * consultationRouter - 전문가 상담 신청 라우터
 * - submitConsultation: 상담 신청서 제출
 * - myConsultations: 내 상담 신청 목록 조회
 * - getConsultation: 상담 신청 상세 조회
 * - admin: 관리자 전용 (전체 조회, 상태 변경)
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { expertConsultations, expertPartners } from "../../drizzle/schema";

// 상담 신청 제출
const submitConsultation = protectedProcedure
  .input(
    z.object({
      expertId: z.number(),
      applicantName: z.string().min(2).max(100),
      applicantEmail: z.string().email().optional(),
      applicantPhone: z.string().max(50).optional(),
      applicantCountry: z.string().max(8).optional().default("KR"),
      consultType: z.enum(["inheritance", "will", "tax", "dispute", "other"]).default("inheritance"),
      selfIntro: z.string().min(10).max(2000),
      assetScale: z.enum(["under_100m", "100m_500m", "500m_1b", "over_1b", "unknown"]).optional().default("unknown"),
      urgency: z.enum(["normal", "urgent"]).optional().default("normal"),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    // 전문가 존재 여부 확인
    const expert = await db
      .select({ id: expertPartners.id, status: expertPartners.status })
      .from(expertPartners)
      .where(eq(expertPartners.id, input.expertId))
      .limit(1);

    if (!expert.length || expert[0].status !== "active") {
      throw new TRPCError({ code: "NOT_FOUND", message: "해당 전문가를 찾을 수 없습니다." });
    }

    // 중복 신청 확인 (같은 전문가에게 pending 상태 신청이 있는 경우)
    const existing = await db
      .select({ id: expertConsultations.id })
      .from(expertConsultations)
      .where(
        and(
          eq(expertConsultations.userId, ctx.user.id),
          eq(expertConsultations.expertId, input.expertId),
          eq(expertConsultations.status, "pending")
        )
      )
      .limit(1);

    if (existing.length) {
      throw new TRPCError({ code: "CONFLICT", message: "이미 해당 전문가에게 상담 신청이 진행 중입니다." });
    }

    await db.insert(expertConsultations).values({
      userId: ctx.user.id,
      expertId: input.expertId,
      applicantName: input.applicantName,
      applicantEmail: input.applicantEmail,
      applicantPhone: input.applicantPhone,
      applicantCountry: input.applicantCountry,
      consultType: input.consultType,
      selfIntro: input.selfIntro,
      assetScale: input.assetScale,
      urgency: input.urgency,
      status: "pending",
    });

    return { success: true };
  });

// 내 상담 신청 목록 조회
const myConsultations = protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(50).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const rows = await db
      .select({
        id: expertConsultations.id,
        expertId: expertConsultations.expertId,
        expertName: expertPartners.name,
        expertSpecialty: expertPartners.specialty,
        expertCountry: expertPartners.country,
        expertCity: expertPartners.city,
        expertFirmName: expertPartners.firmName,
        consultType: expertConsultations.consultType,
        selfIntro: expertConsultations.selfIntro,
        urgency: expertConsultations.urgency,
        status: expertConsultations.status,
        expertNote: expertConsultations.expertNote,
        createdAt: expertConsultations.createdAt,
      })
      .from(expertConsultations)
      .leftJoin(expertPartners, eq(expertConsultations.expertId, expertPartners.id))
      .where(eq(expertConsultations.userId, ctx.user.id))
      .orderBy(desc(expertConsultations.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    return { consultations: rows };
  });

// 상담 신청 상세 조회
const getConsultation = protectedProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const rows = await db
      .select({
        id: expertConsultations.id,
        expertId: expertConsultations.expertId,
        expertName: expertPartners.name,
        expertSpecialty: expertPartners.specialty,
        expertCountry: expertPartners.country,
        expertCity: expertPartners.city,
        expertFirmName: expertPartners.firmName,
        consultType: expertConsultations.consultType,
        selfIntro: expertConsultations.selfIntro,
        assetScale: expertConsultations.assetScale,
        urgency: expertConsultations.urgency,
        status: expertConsultations.status,
        expertNote: expertConsultations.expertNote,
        createdAt: expertConsultations.createdAt,
      })
      .from(expertConsultations)
      .leftJoin(expertPartners, eq(expertConsultations.expertId, expertPartners.id))
      .where(
        and(
          eq(expertConsultations.id, input.id),
          eq(expertConsultations.userId, ctx.user.id)
        )
      )
      .limit(1);

    if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "신청 내역을 찾을 수 없습니다." });
    return rows[0];
  });

// 관리자: 전체 상담 신청 목록
const adminListConsultations = protectedProcedure
  .input(
    z.object({
      status: z.enum(["all", "pending", "read", "replied", "closed"]).optional().default("all"),
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const conditions = input.status !== "all"
      ? [eq(expertConsultations.status, input.status as "pending" | "read" | "replied" | "closed")]
      : [];

    const rows = await db
      .select({
        id: expertConsultations.id,
        userId: expertConsultations.userId,
        expertId: expertConsultations.expertId,
        applicantName: expertConsultations.applicantName,
        applicantEmail: expertConsultations.applicantEmail,
        expertName: expertPartners.name,
        expertSpecialty: expertPartners.specialty,
        consultType: expertConsultations.consultType,
        urgency: expertConsultations.urgency,
        status: expertConsultations.status,
        createdAt: expertConsultations.createdAt,
      })
      .from(expertConsultations)
      .leftJoin(expertPartners, eq(expertConsultations.expertId, expertPartners.id))
      .where(conditions.length ? conditions[0] : undefined)
      .orderBy(desc(expertConsultations.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    return { consultations: rows, total: rows.length };
  });

// 관리자: 상담 상태 변경
const adminUpdateStatus = protectedProcedure
  .input(
    z.object({
      id: z.number(),
      status: z.enum(["pending", "read", "replied", "closed"]),
      expertNote: z.string().max(1000).optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    await db
      .update(expertConsultations)
      .set({
        status: input.status,
        ...(input.expertNote !== undefined ? { expertNote: input.expertNote } : {}),
      })
      .where(eq(expertConsultations.id, input.id));

    return { success: true };
  });

export const consultationRouter = router({
  submit: submitConsultation,
  myList: myConsultations,
  get: getConsultation,
  admin: router({
    list: adminListConsultations,
    updateStatus: adminUpdateStatus,
  }),
});
