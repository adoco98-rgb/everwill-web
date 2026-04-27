import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { inquiries } from "../../drizzle/schema";
import { eq, desc, gte, isNotNull, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendInquiryConfirmationEmail, sendInquiryReplyEmail } from "../_core/email";
import { TRPCError } from "@trpc/server";
import { createHash, randomBytes } from "crypto";

export const inquiryRouter = router({
  /**
   * 문의 접수 (비로그인도 가능)
   */
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        email: z.string().email().max(320),
        category: z.enum(["general", "service", "payment", "badge", "lawyer", "other"]),
        subject: z.string().min(1).max(200),
        content: z.string().min(10).max(5000),
        userId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // 문의 저장
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.insert(inquiries).values({
        userId: input.userId ?? null,
        name: input.name,
        email: input.email,
        category: input.category,
        subject: input.subject,
        content: input.content,
        status: "pending",
      });

      // 관리자에게 알림 발송
      const notified = await notifyOwner({
        title: `[1:1 문의] ${input.name} - ${input.subject}`,
        content: `문의 유형: ${input.category}\n이메일: ${input.email}\n\n${input.content}`,
      });
      if (!notified) {
        console.warn("[Inquiry] 관리자 알림 발송 실패 - 문의 ID 저장은 완료됨");
      }

      // 사용자에게 접수 확인 이메일 발송
      const emailSent = await sendInquiryConfirmationEmail({
        toEmail: input.email,
        toName: input.name,
        subject: input.subject,
        category: input.category,
        content: input.content,
      });
      if (!emailSent) {
        console.warn("[Inquiry] 사용자 확인 이메일 발송 실패 - 문의 접수는 완료됨");
      }

      return { success: true, emailSent };
    }),

  /**
   * 내 문의 목록 조회 (로그인 필요)
   */
  myList: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    const list = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.userId, ctx.user.id))
      .orderBy(desc(inquiries.createdAt));
    return list;
  }),

  /**
   * 관리자: 전체 문의 목록 조회
   */
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    const list = await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt));
    return list;
  }),

  /**
   * 관리자: 문의 답변 처리
   */
  reply: protectedProcedure
    .input(
      z.object({
        inquiryId: z.number(),
        reply: z.string().min(1).max(5000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 만족도 평가용 일회성 토큰 생성
      const rawToken = randomBytes(32).toString("hex");
      const satisfactionToken = createHash("sha256").update(rawToken).digest("hex");

      // 문의 조회 (이메일 전송용)
      const [inquiry] = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.id, input.inquiryId))
        .limit(1);

      if (!inquiry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "문의를 찾을 수 없습니다" });
      }

      await db
        .update(inquiries)
        .set({
          reply: input.reply,
          status: "answered",
          repliedAt: new Date(),
          repliedBy: ctx.user.id,
          satisfactionToken,
        })
        .where(eq(inquiries.id, input.inquiryId));

      // 답변 이메일 + 만족도 조사 링크 발송
      await sendInquiryReplyEmail({
        toEmail: inquiry.email,
        toName: inquiry.name,
        subject: inquiry.subject,
        reply: input.reply,
        satisfactionToken: rawToken, // 해시 전 원본 토큰
        inquiryId: input.inquiryId,
      });

      return { success: true };
    }),

  /**
   * 관리자: 우수 답변 목록 조회 (만족도 4~5점 + 답변 완료)
   */
  adminFeaturedList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    // 만족도 4~5점 + 답변 완료된 문의만 선정 (핀 고정 포함)
    const list = await db
      .select()
      .from(inquiries)
      .where(gte(inquiries.satisfaction, 4))
      .orderBy(desc(inquiries.isFeatured), desc(inquiries.satisfaction), desc(inquiries.satisfactionAt));
    return list;
  }),

  /**
   * 관리자: 우수 답변 핀 고정/해제
   */
  adminToggleFeatured: protectedProcedure
    .input(z.object({ inquiryId: z.number(), isFeatured: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db
        .update(inquiries)
        .set({ isFeatured: input.isFeatured ? 1 : 0 })
        .where(eq(inquiries.id, input.inquiryId));
      return { success: true };
    }),

  /**
   * 관리자: 만족도 통계 조회
   */
  adminSatisfactionStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    // 전체 문의 수
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(inquiries);
    const total = totalResult[0]?.count ?? 0;

    // 답변 완료 수
    const answeredResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(inquiries)
      .where(eq(inquiries.status, "answered"));
    const answered = answeredResult[0]?.count ?? 0;

    // 평가 완료 수
    const evaluatedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(inquiries)
      .where(isNotNull(inquiries.satisfaction));
    const evaluated = evaluatedResult[0]?.count ?? 0;

    // 평균 점수
    const avgResult = await db
      .select({ avg: sql<number>`avg(satisfaction)` })
      .from(inquiries)
      .where(isNotNull(inquiries.satisfaction));
    const avgScore = avgResult[0]?.avg ? parseFloat(String(avgResult[0].avg)).toFixed(1) : null;

    // 점수별 분포 (1~5)
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (let score = 1; score <= 5; score++) {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(inquiries)
        .where(eq(inquiries.satisfaction, score));
      distribution[score] = result[0]?.count ?? 0;
    }

    return { total, answered, evaluated, avgScore, distribution };
  }),

  /**
   * 만족도 평가 저장 (비로그인 가능, 토큰 기반)
   */
  submitSatisfaction: publicProcedure
    .input(
      z.object({
        inquiryId: z.number(),
        token: z.string().min(1), // 원본 토큰 (해시 전)
        score: z.number().int().min(1).max(5),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 토큰 해시 후 DB와 비교
      const hashedToken = createHash("sha256").update(input.token).digest("hex");

      const [inquiry] = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.id, input.inquiryId))
        .limit(1);

      if (!inquiry) {
        throw new TRPCError({ code: "NOT_FOUND", message: "문의를 찾을 수 없습니다" });
      }
      if (inquiry.satisfactionToken !== hashedToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "유효하지 않은 토큰입니다" });
      }
      if (inquiry.satisfaction !== null) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "이미 평가하셨습니다" });
      }

      await db
        .update(inquiries)
        .set({
          satisfaction: input.score,
          satisfactionAt: new Date(),
        })
        .where(eq(inquiries.id, input.inquiryId));

      return { success: true };
    }),
});
