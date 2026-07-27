/**
 * artworkRouter - AI 그림 변환 라우터
 * 사진 업로드 → AI가 수채화/일러스트/유화 스타일로 변환
 * 자서전/일기/편지에 그림 삽입 기능
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { generateImage } from "../_core/imageGeneration";
import { storagePut, storageGetSignedUrl } from "../storage";

// 그림 스타일별 프롬프트
const STYLE_PROMPTS: Record<string, string> = {
  watercolor: "Transform this photo into a beautiful watercolor painting style. Soft, flowing colors, gentle brush strokes, artistic and warm atmosphere. Keep the main subject recognizable.",
  illustration: "Transform this photo into a warm illustration style. Clean lines, vibrant colors, friendly and heartwarming feel, like a children's book illustration.",
  oil_painting: "Transform this photo into a classic oil painting style. Rich textures, deep colors, masterful brush strokes, reminiscent of traditional portrait paintings.",
  sketch: "Transform this photo into a detailed pencil sketch. Fine lines, subtle shading, artistic and nostalgic feel.",
  cartoon: "Transform this photo into a friendly cartoon style. Simplified features, warm colors, cheerful and approachable look.",
};

export const artworkRouter = router({
  /**
   * 사진 → AI 그림 변환
   * Base64 이미지를 받아 AI가 지정된 스타일로 변환
   */
  generateFromPhoto: protectedProcedure
    .input(
      z.object({
        /** Base64 인코딩된 이미지 데이터 */
        imageBase64: z.string().min(1),
        /** 이미지 MIME 타입 */
        mimeType: z.string().default("image/jpeg"),
        /** 그림 스타일 */
        style: z.enum(["watercolor", "illustration", "oil_painting", "sketch", "cartoon"]).default("watercolor"),
        /** 컨텍스트 힌트 (예: "어린 시절 추억") */
        contextHint: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 이미지 크기 체크 (10MB)
        const imageBuffer = Buffer.from(input.imageBase64, "base64");
        if (imageBuffer.length > 10 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "이미지 파일이 너무 큽니다. 10MB 이하 사진을 올려주세요.",
          });
        }

        // 원본 이미지 S3 저장
        const ext = input.mimeType.includes("png") ? "png" : "jpg";
        const originalKey = `artwork-original/${ctx.user.openId}-${Date.now()}.${ext}`;
        const { url: originalUrl } = await storagePut(originalKey, imageBuffer, input.mimeType);

        // AI에 전달할 presigned https URL 획득 (내부 /manus-storage/ 경로는 AI가 접근 불가)
        const signedUrl = await storageGetSignedUrl(originalKey);

        // 스타일 프롬프트 구성
        const stylePrompt = STYLE_PROMPTS[input.style] ?? STYLE_PROMPTS.watercolor;
        const contextPart = input.contextHint ? ` Context: ${input.contextHint}.` : "";
        const fullPrompt = `${stylePrompt}${contextPart} Create a warm, nostalgic, and emotionally touching artwork suitable for a personal memoir or life story book.`;

        // AI 그림 생성 (presigned URL로 원본 이미지 참조)
        const { url: artworkUrl } = await generateImage({
          prompt: fullPrompt,
          originalImages: [
            {
              url: signedUrl,
              mimeType: input.mimeType as "image/jpeg" | "image/png",
            },
          ],
        });

        return {
          originalUrl,
          artworkUrl,
          style: input.style,
        };
      } catch (err: unknown) {
        if (err instanceof TRPCError) throw err;
        const message = err instanceof Error ? err.message : "그림 변환 중 오류가 발생했습니다.";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
});
