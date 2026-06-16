/**
 * 유언 첨부파일 라우터
 * 부동산등본, 통장사본, 주식잔고증명, 코인보유증명 등 증빙서류 관리
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { willAttachments } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";

// 첨부파일 카테고리 목록
const ATTACHMENT_CATEGORIES = [
  "real_estate",  // 부동산 등기부등본
  "bank",         // 통장 사본 / 잔고증명서
  "stock",        // 주식 잔고증명서
  "crypto",       // 가상자산 보유증명
  "insurance",    // 보험증권
  "pension",      // 연금 증명서
  "other",        // 기타 증빙서류
] as const;

export const attachmentRouter = router({
  /**
   * 첨부파일 업로드
   * 파일은 base64로 인코딩하여 전송
   */
  upload: protectedProcedure
    .input(z.object({
      fileName:    z.string().min(1).max(255),
      fileType:    z.string().min(1).max(100),
      fileSize:    z.number().int().positive(),
      fileBase64:  z.string(), // base64 인코딩된 파일 데이터
      category:    z.enum(ATTACHMENT_CATEGORIES).default("other"),
      description: z.string().max(500).optional(),
      willId:      z.number().int().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const userId = ctx.user.id;
      const now = Date.now();

      // base64 → Buffer 변환
      const fileBuffer = Buffer.from(input.fileBase64, "base64");

      // S3 업로드
      const fileKey = `will-attachments/${userId}/${now}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { key, url } = await storagePut(fileKey, fileBuffer, input.fileType);

      // DB 저장
      await db.insert(willAttachments).values({
        userId,
        willId:      input.willId ?? null,
        fileKey:     key,
        fileUrl:     url,
        fileName:    input.fileName,
        fileType:    input.fileType,
        fileSize:    input.fileSize,
        category:    input.category,
        description: input.description ?? null,
        verified:    0,
        createdAt:   now,
        updatedAt:   now,
      });

      return { success: true, fileKey: key, fileUrl: url };
    }),

  /**
   * 내 첨부파일 목록 조회
   */
  list: protectedProcedure
    .input(z.object({
      willId: z.number().int().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;

      if (!db) return [];

      const rows = await db
        .select()
        .from(willAttachments)
        .where(eq(willAttachments.userId, userId));

      // willId 필터 (클라이언트에서 처리)
      if (input?.willId) {
        return rows.filter((r: typeof rows[0]) => r.willId === input.willId);
      }

      return rows;
    }),

  /**
   * 첨부파일 삭제
   */
  delete: protectedProcedure
    .input(z.object({
      id: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const userId = ctx.user.id;

      // 본인 파일인지 확인
      const [attachment] = await db
        .select()
        .from(willAttachments)
        .where(and(
          eq(willAttachments.id, input.id),
          eq(willAttachments.userId, userId)
        ));

      if (!attachment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "파일을 찾을 수 없습니다." });
      }

      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .delete(willAttachments)
        .where(eq(willAttachments.id, input.id));

      return { success: true };
    }),

  /**
   * 첨부파일을 유언장에 연결
   */
  linkToWill: protectedProcedure
    .input(z.object({
      attachmentId: z.number().int(),
      willId:       z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const userId = ctx.user.id;
      const now = Date.now();

      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(willAttachments)
        .set({ willId: input.willId, updatedAt: now })
        .where(and(
          eq(willAttachments.id, input.attachmentId),
          eq(willAttachments.userId, userId)
        ));

      return { success: true };
    }),
});
