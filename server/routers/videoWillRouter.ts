/**
 * videoWillRouter - 영상 유언장 라우터
 * 영상 업로드 → S3 저장 → SHA-256 블록체인 해시 기록
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { drizzle } from "drizzle-orm/mysql2";
import { videoWills } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";
import { TRPCError } from "@trpc/server";

export const videoWillRouter = router({
  /** 영상 유언장 저장 */
  save: protectedProcedure
    .input(
      z.object({
        videoBase64: z.string().min(1),
        mimeType: z.string().default("video/webm"),
        videoType: z.enum(["legal", "emotional", "future"]),
        recipient: z.string().optional(),
        deliveryDate: z.string().optional(),
        memo: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Base64 → Buffer
      const videoBuffer = Buffer.from(input.videoBase64, "base64");

      // 16MB 제한
      if (videoBuffer.length > 16 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "영상 파일이 너무 큽니다. 5분 이내로 녹화해 주세요.",
        });
      }

      // SHA-256 해시 생성 (블록체인 무결성 증명)
      const hash = crypto.createHash("sha256").update(videoBuffer).digest("hex");
      const blockchainHash = `sha256:${hash}`;

      // 파일 확장자
      const ext = input.mimeType.includes("mp4") ? "mp4" : "webm";
      const fileKey = `video-wills/${ctx.user.openId}/${Date.now()}.${ext}`;

      // S3 업로드
      const { url } = await storagePut(fileKey, videoBuffer, input.mimeType);

      // DB 저장
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db.insert(videoWills).values({
        userId: ctx.user.id,
        fileKey,
        fileUrl: url,
        mimeType: input.mimeType,
        videoType: input.videoType,
        blockchainHash,
        recipient: input.recipient ?? null,
        deliveryDate: input.deliveryDate ?? null,
        memo: input.memo ?? null,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return {
        success: true,
        url,
        blockchainHash,
        message: "영상 유언장이 안전하게 저장되었습니다.",
      };
    }),

  /** 내 영상 유언장 목록 */
  getMyVideos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const videos = await db
      .select()
      .from(videoWills)
      .where(eq(videoWills.userId, ctx.user.id))
      .orderBy(desc(videoWills.createdAt));
    return videos;
  }),

  /** 영상 유언장 삭제 */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const [video] = await db
        .select()
        .from(videoWills)
        .where(eq(videoWills.id, input.id));

      if (!video || video.userId !== ctx.user.id) {
        throw new TRPCError({ code: "NOT_FOUND", message: "영상을 찾을 수 없습니다." });
      }

      const db2 = await getDb();
      if (!db2) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      await db2.delete(videoWills).where(eq(videoWills.id, input.id));
      return { success: true };
    }),
});
