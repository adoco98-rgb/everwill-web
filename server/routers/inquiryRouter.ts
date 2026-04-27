import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { inquiries } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { sendInquiryConfirmationEmail } from "../_core/email";
import { TRPCError } from "@trpc/server";

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
      await db
        .update(inquiries)
        .set({
          reply: input.reply,
          status: "answered",
          repliedAt: new Date(),
          repliedBy: ctx.user.id,
        })
        .where(eq(inquiries.id, input.inquiryId));

      return { success: true };
    }),
});
