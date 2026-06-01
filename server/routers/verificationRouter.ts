/**
 * 얼굴 인증 (KYC) tRPC 라우터
 * 신분증 사진 + 셀피 사진 업로드 후 AI로 얼굴 매칭 검증
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";
import { invokeLLM } from "../_core/llm";

export const verificationRouter = router({
  /**
   * 프로필 사진 업로드
   * - photoBase64: 프로필 사진 (base64 data URL)
   */
  uploadProfilePhoto: protectedProcedure
    .input(z.object({ photoBase64: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      const userId = ctx.user.id;
      const match = input.photoBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) throw new Error("잘못된 이미지 형식입니다.");
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], "base64");
      const ext = mimeType.split("/")[1] || "jpg";
      const key = `profile/${userId}/photo_${Date.now()}.${ext}`;
      const { url } = await storagePut(key, buffer, mimeType);

      await db.update(users).set({ profilePhotoKey: key }).where(eq(users.id, userId));
      return { success: true, url, key };
    }),

  /**
   * 현재 사용자의 얼굴 인증 상태 조회
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { faceVerified: false, hasIdImage: false, hasSelfie: false, faceVerifiedAt: null, faceVerifyResult: null };

    const rows = await db
      .select({
        faceVerified: users.faceVerified,
        idImageKey: users.idImageKey,
        selfieImageKey: users.selfieImageKey,
        faceVerifiedAt: users.faceVerifiedAt,
        faceVerifyResult: users.faceVerifyResult,
        profilePhotoKey: users.profilePhotoKey,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const user = rows[0];
    return {
      faceVerified: user?.faceVerified === 1,
      hasIdImage: !!user?.idImageKey,
      hasSelfie: !!user?.selfieImageKey,
      faceVerifiedAt: user?.faceVerifiedAt ?? null,
      faceVerifyResult: user?.faceVerifyResult ?? null,
      profilePhotoUrl: user?.profilePhotoKey ? `/manus-storage/${user.profilePhotoKey}` : null,
    };
  }),

  /**
   * 신분증 + 셀피 이미지 업로드 후 AI 얼굴 매칭 검증
   * - idImageBase64: 신분증 사진 (base64 data URL)
   * - selfieBase64: 셀피 사진 (base64 data URL)
   */
  submitFaceVerification: protectedProcedure
    .input(
      z.object({
        idImageBase64: z.string().min(10),
        selfieBase64: z.string().min(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      const userId = ctx.user.id;

      // base64 → Buffer 변환 헬퍼
      const base64ToBuffer = (dataUrl: string): { buffer: Buffer; mimeType: string } => {
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) throw new Error("잘못된 이미지 형식입니다.");
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        return { buffer, mimeType };
      };

      // 스토리지에 업로드
      const idData = base64ToBuffer(input.idImageBase64);
      const selfieData = base64ToBuffer(input.selfieBase64);

      const idExt = idData.mimeType.split("/")[1] || "jpg";
      const selfieExt = selfieData.mimeType.split("/")[1] || "jpg";

      const idKey = `kyc/${userId}/id_${Date.now()}.${idExt}`;
      const selfieKey = `kyc/${userId}/selfie_${Date.now()}.${selfieExt}`;

      const { url: idUrl } = await storagePut(idKey, idData.buffer, idData.mimeType);
      const { url: selfieUrl } = await storagePut(selfieKey, selfieData.buffer, selfieData.mimeType);

      // AI 얼굴 매칭 검증
      let verifyResult = "검토중";
      let faceVerified = 0;

      try {
        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 신분증 진위 확인 및 얼굴 매칭 전문가입니다.
두 이미지를 분석하여 다음을 확인하세요:
1. 첫 번째 이미지(신분증)가 실제 신분증처럼 보이는지
2. 두 번째 이미지(셀피)에 명확한 얼굴이 있는지
3. 두 이미지의 얼굴이 동일인으로 보이는지

반드시 JSON 형식으로만 응답하세요:
{"match": true/false, "confidence": 0~100, "reason": "한국어 설명", "idValid": true/false, "selfieValid": true/false}`,
            },
            {
              role: "user",
              content: [
                { type: "text", text: "신분증 사진과 셀피 사진을 비교해주세요." },
                {
                  type: "image_url",
                  image_url: {
                    url: input.idImageBase64,
                    detail: "high" as const,
                  },
                },
                {
                  type: "image_url",
                  image_url: {
                    url: input.selfieBase64,
                    detail: "high" as const,
                  },
                },
              ],
            },
          ],
        });

        const rawContent = aiResponse.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : "";
        // JSON 파싱 시도
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.match === true && parsed.confidence >= 60 && parsed.idValid && parsed.selfieValid) {
            faceVerified = 1;
            verifyResult = `인증 완료 (신뢰도: ${parsed.confidence}%) - ${parsed.reason}`;
          } else {
            faceVerified = 0;
            verifyResult = `인증 실패 - ${parsed.reason || "얼굴 매칭 불일치"}`;
          }
        } else {
          verifyResult = "수동 검토 중 - 잠시 후 다시 확인해주세요.";
          faceVerified = 0;
        }
      } catch (e) {
        console.error("[FaceVerification] AI 검증 오류:", e);
        verifyResult = "검토 중 - AI 분석 오류, 수동 검토 예정";
        faceVerified = 0;
      }

      // DB 업데이트
      await db
        .update(users)
        .set({
          idImageKey: idKey,
          selfieImageKey: selfieKey,
          faceVerified,
          faceVerifiedAt: faceVerified === 1 ? new Date() : undefined,
          faceVerifyResult: verifyResult,
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        faceVerified: faceVerified === 1,
        result: verifyResult,
        idUrl,
        selfieUrl,
      };
    }),
});
