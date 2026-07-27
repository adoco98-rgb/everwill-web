/**
 * 유서(Farewell Letter) tRPC 라우터
 */
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  farewellLetters,
  farewellRecipients,
  farewellAttachments,
} from "../../drizzle/schema";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" as any });

const PRICE_CREATE = 9900;
const PRICE_EDIT   = 4900;
const PRICE_VIEW   = 6900;
const PRICE_MAIL   = 19900;

// DB null 체크 헬퍼
async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
  return db;
}

export const farewellRouter = router({
  /** 내 유서 목록 */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();
    return db.select().from(farewellLetters)
      .where(eq(farewellLetters.userId, ctx.user.id))
      .orderBy(desc(farewellLetters.updatedAt));
  }),

  /** 유서 단건 조회 */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await requireDb();
      const [letter] = await db.select().from(farewellLetters)
        .where(and(eq(farewellLetters.id, input.id), eq(farewellLetters.userId, ctx.user.id)));
      if (!letter) throw new TRPCError({ code: "NOT_FOUND", message: "유서를 찾을 수 없습니다." });
      const recipients = await db.select().from(farewellRecipients)
        .where(eq(farewellRecipients.letterId, input.id));
      const attachments = await db.select().from(farewellAttachments)
        .where(eq(farewellAttachments.letterId, input.id));
      return { letter, recipients, attachments };
    }),

  /** 유서 초안 생성 */
  create: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      step1Content: z.string().optional(),
      step2Content: z.string().optional(),
      step3Content: z.string().optional(),
      step4Content: z.string().optional(),
      step5Content: z.string().optional(),
      recipientMode: z.enum(["all", "specific"]).default("all"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [result] = await db.insert(farewellLetters).values({
        userId: ctx.user.id,
        title: input.title ?? `${ctx.user.name ?? "나"}의 유서`,
        step1Content: input.step1Content,
        step2Content: input.step2Content,
        step3Content: input.step3Content,
        step4Content: input.step4Content,
        step5Content: input.step5Content,
        recipientMode: input.recipientMode,
        status: "draft",
        isPaid: 0,
        editCount: 0,
        isLocked: 0,
      });
      return { id: (result as any).insertId as number };
    }),

  /** 유서 수정 */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      step1Content: z.string().optional(),
      step2Content: z.string().optional(),
      step3Content: z.string().optional(),
      step4Content: z.string().optional(),
      step5Content: z.string().optional(),
      recipientMode: z.enum(["all", "specific"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [letter] = await db.select().from(farewellLetters)
        .where(and(eq(farewellLetters.id, input.id), eq(farewellLetters.userId, ctx.user.id)));
      if (!letter) throw new TRPCError({ code: "NOT_FOUND" });
      if (letter.isLocked === 1)
        throw new TRPCError({ code: "FORBIDDEN", message: "잠긴 유서는 수정할 수 없습니다. 수정료를 결제해 주세요." });
      const { id, ...rest } = input;
      await db.update(farewellLetters).set({ ...rest }).where(eq(farewellLetters.id, id));
      return { success: true };
    }),

  /** 유서 삭제 (미결제 초안만) */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [letter] = await db.select().from(farewellLetters)
        .where(and(eq(farewellLetters.id, input.id), eq(farewellLetters.userId, ctx.user.id)));
      if (!letter) throw new TRPCError({ code: "NOT_FOUND" });
      if (letter.isPaid === 1)
        throw new TRPCError({ code: "FORBIDDEN", message: "결제된 유서는 삭제할 수 없습니다." });
      await db.delete(farewellAttachments).where(eq(farewellAttachments.letterId, input.id));
      await db.delete(farewellRecipients).where(eq(farewellRecipients.letterId, input.id));
      await db.delete(farewellLetters).where(eq(farewellLetters.id, input.id));
      return { success: true };
    }),

  // ─── 수신자 ───────────────────────────────────────────────────

  addRecipient: protectedProcedure
    .input(z.object({
      letterId: z.number(),
      name: z.string().min(1),
      relationship: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [letter] = await db.select().from(farewellLetters)
        .where(and(eq(farewellLetters.id, input.letterId), eq(farewellLetters.userId, ctx.user.id)));
      if (!letter) throw new TRPCError({ code: "NOT_FOUND" });
      const [result] = await db.insert(farewellRecipients).values({
        letterId: input.letterId,
        name: input.name,
        relationship: input.relationship,
        phone: input.phone,
        email: input.email,
        address: input.address,
      });
      return { id: (result as any).insertId as number };
    }),

  removeRecipient: protectedProcedure
    .input(z.object({ recipientId: z.number(), letterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [letter] = await db.select().from(farewellLetters)
        .where(and(eq(farewellLetters.id, input.letterId), eq(farewellLetters.userId, ctx.user.id)));
      if (!letter) throw new TRPCError({ code: "NOT_FOUND" });
      await db.delete(farewellRecipients).where(eq(farewellRecipients.id, input.recipientId));
      return { success: true };
    }),

  // ─── 결제 세션 ───────────────────────────────────────────────

  createPaymentSession: protectedProcedure
    .input(z.object({ letterId: z.number(), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: ctx.user.email ?? undefined,
        line_items: [{
          price_data: {
            currency: "krw",
            product_data: { name: "유서 작성료", description: "EverWill 유서 최초 작성 및 보관" },
            unit_amount: PRICE_CREATE,
          },
          quantity: 1,
        }],
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), letter_id: input.letterId.toString(), type: "farewell_create" },
        success_url: `${input.origin}/letter?payment=success&id=${input.letterId}`,
        cancel_url: `${input.origin}/letter/write?id=${input.letterId}`,
        allow_promotion_codes: true,
      });
      return { url: session.url };
    }),

  createEditPaymentSession: protectedProcedure
    .input(z.object({ letterId: z.number(), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: ctx.user.email ?? undefined,
        line_items: [{
          price_data: {
            currency: "krw",
            product_data: { name: "유서 수정료", description: "EverWill 유서 수정 1회" },
            unit_amount: PRICE_EDIT,
          },
          quantity: 1,
        }],
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), letter_id: input.letterId.toString(), type: "farewell_edit" },
        success_url: `${input.origin}/letter/write?id=${input.letterId}&edit=1`,
        cancel_url: `${input.origin}/letter`,
        allow_promotion_codes: true,
      });
      return { url: session.url };
    }),

  createViewPaymentSession: protectedProcedure
    .input(z.object({ letterId: z.number(), recipientId: z.number(), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: ctx.user.email ?? undefined,
        line_items: [{
          price_data: {
            currency: "krw",
            product_data: { name: "유서 열람·프린트", description: "EverWill 유서 열람 및 인쇄" },
            unit_amount: PRICE_VIEW,
          },
          quantity: 1,
        }],
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), letter_id: input.letterId.toString(), recipient_id: input.recipientId.toString(), type: "farewell_view" },
        success_url: `${input.origin}/letter/view/${input.letterId}?payment=success`,
        cancel_url: `${input.origin}/letter`,
        allow_promotion_codes: true,
      });
      return { url: session.url };
    }),

  createMailPaymentSession: protectedProcedure
    .input(z.object({ letterId: z.number(), recipientId: z.number(), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: ctx.user.email ?? undefined,
        line_items: [{
          price_data: {
            currency: "krw",
            product_data: { name: "유서 우편 발송", description: "EverWill 유서 인쇄 + 우편 발송 (국내)" },
            unit_amount: PRICE_MAIL,
          },
          quantity: 1,
        }],
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), letter_id: input.letterId.toString(), recipient_id: input.recipientId.toString(), type: "farewell_mail" },
        success_url: `${input.origin}/letter?payment=mail_success&id=${input.letterId}`,
        cancel_url: `${input.origin}/letter`,
        allow_promotion_codes: true,
      });
      return { url: session.url };
    }),

  // ─── 첨부파일 ─────────────────────────────────────────────────

  addAttachment: protectedProcedure
    .input(z.object({
      letterId: z.number(),
      originalName: z.string(),
      fileKey: z.string(),
      fileUrl: z.string(),
      mimeType: z.string().optional(),
      fileSize: z.number().optional(),
      fileType: z.enum(["image", "document", "other"]).default("other"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [letter] = await db.select().from(farewellLetters)
        .where(and(eq(farewellLetters.id, input.letterId), eq(farewellLetters.userId, ctx.user.id)));
      if (!letter) throw new TRPCError({ code: "NOT_FOUND" });
      const [result] = await db.insert(farewellAttachments).values({
        letterId: input.letterId,
        userId: ctx.user.id,
        originalName: input.originalName,
        fileKey: input.fileKey,
        fileUrl: input.fileUrl,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        fileType: input.fileType,
      });
      return { id: (result as any).insertId as number };
    }),

  removeAttachment: protectedProcedure
    .input(z.object({ attachmentId: z.number(), letterId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const [letter] = await db.select().from(farewellLetters)
        .where(and(eq(farewellLetters.id, input.letterId), eq(farewellLetters.userId, ctx.user.id)));
      if (!letter) throw new TRPCError({ code: "NOT_FOUND" });
      await db.delete(farewellAttachments).where(eq(farewellAttachments.id, input.attachmentId));
      return { success: true };
    }),
});
