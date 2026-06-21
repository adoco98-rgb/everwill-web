/**
 * voiceRouter - 음성 인식 라우터
 * Base64 오디오 데이터 → Whisper API 직접 전송 → 텍스트 변환
 * 자서전/일기/편지 쓰기 음성 입력에 사용
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { type WhisperResponse } from "../_core/voiceTranscription";
import { ENV } from "../_core/env";

export const voiceRouter = router({
  /**
   * 음성 → 텍스트 변환
   * S3 저장 없이 Buffer를 직접 Whisper API에 FormData로 전송
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
    .mutation(async ({ input }) => {
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

        // Buffer를 직접 Whisper API에 FormData로 전송
        const ext = input.mimeType.includes("mp4") ? "mp4" : "webm";
        const filename = `audio.${ext}`;
        const formData = new FormData();
        const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: input.mimeType });
        formData.append("file", audioBlob, filename);
        formData.append("model", "whisper-1");
        formData.append("response_format", "verbose_json");
        formData.append("prompt", "한국어 자서전, 일기, 편지 내용입니다.");
        if (input.language) formData.append("language", input.language);

        if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "음성 변환 서비스가 설정되지 않았습니다.",
          });
        }

        const baseUrl = ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`;
        const fullUrl = new URL("v1/audio/transcriptions", baseUrl).toString();
        const response = await fetch(fullUrl, {
          method: "POST",
          headers: {
            authorization: `Bearer ${ENV.forgeApiKey}`,
            "Accept-Encoding": "identity",
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `음성 변환 실패: ${response.status} ${errorText}`,
          });
        }

        const whisperResult = await response.json() as WhisperResponse;

        if (!whisperResult.text) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "음성 변환 결과가 비어있습니다.",
          });
        }

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
