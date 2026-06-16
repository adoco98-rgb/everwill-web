/**
 * 유언인증서 발급 내역 라우터
 * - requestCertificate: 유언인증서 신청
 * - getMyList: 내 발급 내역 조회
 * - downloadPdf: 국가별 PDF 인증서 다운로드
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { willCertificates, wills, users } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { generateWillCertificatePDF } from "../utils/certificatePdfGenerator";

export const willCertificateRouter = router({
  /** 내 발급 내역 조회 */
  getMyList: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("DB 연결 실패");

    const list = await db
      .select()
      .from(willCertificates)
      .where(eq(willCertificates.userId, userId))
      .orderBy(desc(willCertificates.createdAt));

    return list;
  }),

  /** 인증 완료된 유언장 목록 조회 (신청 전 선택용) */
  getMyCertifiedWills: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("DB 연결 실패");

    const list = await db
      .select({
        id: wills.id,
        title: wills.title,
        certifiedAt: wills.certifiedAt,
        certNumber: wills.certNumber,
      })
      .from(wills)
      .where(and(eq(wills.userId, userId), eq(wills.status, "certified")))
      .orderBy(desc(wills.certifiedAt));

    return list;
  }),

  /** 국가별 PDF 인증서 생성 및 다운로드 (base64 반환) */
  downloadPdf: protectedProcedure
    .input(
      z.object({
        certificateId: z.number().optional(),
        willId: z.number().optional(),
        country: z.string().length(2).optional(), // ISO 국가코드 (없으면 사용자 국가 자동 사용)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 사용자 정보 조회 (국가 코드)
      const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = userRows[0];
      const country = (input.country ?? user?.country ?? "KR").toUpperCase();

      let certData: {
        certNumber: string;
        certifiedAt: Date;
        testatorName: string;
        willTitle: string;
        purpose: string;
        blockchainHash?: string | null;
      } | null = null;

      if (input.certificateId) {
        // 발급된 인증서 기반
        const certRows = await db
          .select()
          .from(willCertificates)
          .where(and(eq(willCertificates.id, input.certificateId), eq(willCertificates.userId, userId)))
          .limit(1);
        const cert = certRows[0];
        if (!cert) throw new TRPCError({ code: "NOT_FOUND", message: "인증서를 찾을 수 없습니다" });

        const willRows = await db.select().from(wills).where(eq(wills.id, cert.willId)).limit(1);
        const will = willRows[0];

        certData = {
          certNumber: cert.issueNumber ?? `EW-CERT-${cert.id.toString().padStart(6, "0")}`,
          certifiedAt: cert.processedAt ?? cert.createdAt,
          testatorName: user?.name ?? "Unknown",
          willTitle: will?.title ?? "유언장",
          purpose: cert.purpose,
          blockchainHash: will?.blockchainHash,
        };
      } else if (input.willId) {
        // 유언장 직접 기반
        const willRows = await db
          .select()
          .from(wills)
          .where(and(eq(wills.id, input.willId), eq(wills.userId, userId)))
          .limit(1);
        const will = willRows[0];
        if (!will) throw new TRPCError({ code: "NOT_FOUND", message: "유언장을 찾을 수 없습니다" });

        certData = {
          certNumber:
            will.certNumber ?? `EW-${new Date().getFullYear()}-${will.id.toString().padStart(6, "0")}`,
          certifiedAt: will.certifiedAt ?? will.createdAt,
          testatorName: user?.name ?? "Unknown",
          willTitle: will.title ?? "유언장",
          purpose: "유언장 인증 확인용",
          blockchainHash: will.blockchainHash,
        };
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "certificateId 또는 willId가 필요합니다" });
      }

      // PDF 생성
      const pdfBuffer = await generateWillCertificatePDF({
        ...certData,
        country,
      });

      // base64로 반환 (프론트에서 다운로드)
      return {
        base64: pdfBuffer.toString("base64"),
        filename: `EverWill_Certificate_${certData.certNumber}_${country}.pdf`,
        mimeType: "application/pdf",
      };
    }),

  /** 유언인증서 신청 */
  requestCertificate: protectedProcedure
    .input(
      z.object({
        willId: z.number(),
        certDate: z.string(),
        purpose: z.string().min(1, "발급 목적을 입력해주세요"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // 해당 유언장이 본인 것이고 인증 완료 상태인지 확인
      const will = await db
        .select()
        .from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, userId), eq(wills.status, "certified")))
        .limit(1);

      if (will.length === 0) {
        throw new Error("인증 완료된 유언장만 인증서를 신청할 수 있습니다");
      }

      // 신청 등록
      await db.insert(willCertificates).values({
        userId,
        willId: input.willId,
        certDate: input.certDate,
        purpose: input.purpose,
        status: "pending",
        createdAt: new Date(),
      });

      return { success: true };
    }),
});
