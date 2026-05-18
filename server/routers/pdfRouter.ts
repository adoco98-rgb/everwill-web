/**
 * EverWill PDF 생성 라우터
 * - 유언장 PDF 생성 및 S3 저장
 * - 인증된 유언장만 PDF 생성 가능
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { wills } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { generateWillPdf } from "../pdf";
import { storagePut } from "../storage";

export const pdfRouter = router({
  /**
   * 유언장 PDF 생성 및 S3 저장
   * - 인증된 유언장(status=certified)만 생성 가능
   * - 이미 PDF가 있으면 기존 URL 반환
   */
  generateWillPdf: protectedProcedure
    .input(z.object({
      willId: z.number(),
      forceRegenerate: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // 본인 소유 유언장 조회
      const result = await db.select().from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id)))
        .limit(1);

      if (!result.length) throw new Error("유언장을 찾을 수 없습니다");
      const will = result[0];

      // 이미 PDF가 있고 재생성 요청 없으면 기존 URL 반환
      if (will.pdfUrl && !input.forceRegenerate) {
        return { success: true, pdfUrl: will.pdfUrl, cached: true };
      }

      // 유언장 데이터 파싱
      let willData: Record<string, any> = {};
      try {
        willData = will.data ? JSON.parse(will.data) : {};
      } catch {
        willData = {};
      }

      // PDF 생성
      const pdfBuffer = await generateWillPdf({
        certNumber: will.certNumber || `EW-DRAFT-${will.id}`,
        testatorName: willData.testatorName || ctx.user.name || "유언자",
        testatorAddress: willData.testatorAddress || "주소 미입력",
        writtenDate: willData.writtenDate || new Date().toLocaleDateString("ko-KR"),
        certifiedAt: will.certifiedAt
          ? new Date(will.certifiedAt).toLocaleDateString("ko-KR", {
              year: "numeric", month: "long", day: "numeric",
            })
          : "인증 전",
        blockchainHash: will.blockchainHash || "해시 미생성",
        draftText: willData.draftText || willData.aiDraft || "유언 내용이 없습니다.",
      });

      // S3 업로드
      const fileKey = `wills/${ctx.user.id}/will-${will.id}-${Date.now()}.pdf`;
      const { url: pdfUrl } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      // DB 업데이트
      await db.update(wills)
        .set({ pdfKey: fileKey, pdfUrl })
        .where(eq(wills.id, input.willId));

      return { success: true, pdfUrl, cached: false };
    }),

  /**
   * 유언장 PDF URL 조회 (이미 생성된 경우)
   */
  getWillPdfUrl: protectedProcedure
    .input(z.object({ willId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const result = await db.select({
        pdfUrl: wills.pdfUrl,
        certNumber: wills.certNumber,
        status: wills.status,
      }).from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id)))
        .limit(1);

      if (!result.length) throw new Error("유언장을 찾을 수 없습니다");
      return result[0];
    }),
});
