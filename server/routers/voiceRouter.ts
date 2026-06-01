/**
 * voiceRouter - 음성 인식 라우터
 * Base64 오디오 데이터 → Whisper API → 텍스트 변환
 * 자서전/일기/편지 쓰기 음성 입력에 사용
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { transcribeAudio, type WhisperResponse } from "../_core/voiceTranscription";
import { storagePut } from "../storage";

export const voiceRouter = router({
  /**
   * 음성 → 텍스트 변환
   * 프론트엔드에서 Base64 오디오 데이터를 받아 Whisper API로 변환
   */
  transcribe: protectedProcedure
    .input(
      z.object({
        /** Base64 인코딩된 오디오 데이터 */
        audioBase64: z.string().min(1),
        /** 오디오 MIME 타입 (audio/webm, audio/mp4 등) */
        mimeType: z.string().default("audio/webm"),
        /** 언어 코드 (ko, en, ja 등) */
        language: z.string().default("ko"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Base64 → Buffer 변환
        const audioBuffer = Buffer.from(input.audioBase64, "base64");

        // 16MB 제한 체크
        if (audioBuffer.length > 16 * 1024 * 1024) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "오디오 파일이 너무 큽니다. 2분 이내로 녹음해 주세요.",
          });
        }

        // S3에 임시 저장 (Whisper API는 URL 방식)
        const ext = input.mimeType.includes("mp4") ? "mp4" : "webm";
        const fileKey = `voice-temp/${ctx.user.openId}-${Date.now()}.${ext}`;
        const { url: audioUrl } = await storagePut(fileKey, audioBuffer, input.mimeType);

        // Whisper API로 음성 변환
        const result = await transcribeAudio({
          audioUrl,
          language: input.language,
          prompt: "한국어 자서전, 일기, 편지 내용입니다.",
        });

        // 에러 응답 처리
        if ("error" in result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: result.error,
          });
        }

        const whisperResult = result as WhisperResponse;
        return {
          text: whisperResult.text,
          language: whisperResult.language,
        };
      } catch (err: unknown) {
        if (err instanceof TRPCError) throw err;
        const message = err instanceof Error ? err.message : "음성 인식 중 오류가 발생했습니다.";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
});
