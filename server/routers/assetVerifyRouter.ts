/**
 * 자산 인증 라우터
 * - getStatus: 내 인증 상태 조회
 * - uploadIdPhoto: 신분증 사진 업로드
 * - uploadSelfie: 얼굴(셀피) 사진 업로드
 * - uploadDocument: 자산 서류 업로드 (부동산/통장/기타)
 * - deleteDocument: 자산 서류 삭제
 * - submitVerification: 본인 동의 + 서명 후 검토 요청
 * - adminList: 관리자용 인증 목록 조회
 * - adminReview: 관리자 승인/반려 처리
 */
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { assetVerifications, assetDocuments, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

export const assetVerifyRouter = router({
  /**
   * 내 자산 인증 상태 조회
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const [verification] = await db
      .select()
      .from(assetVerifications)
      .where(eq(assetVerifications.userId, ctx.user.id))
      .limit(1);

    if (!verification) {
      return { exists: false, status: "pending" as const, documents: [] };
    }

    const documents = await db
      .select()
      .from(assetDocuments)
      .where(eq(assetDocuments.verificationId, verification.id));

    return {
      exists: true,
      ...verification,
      documents,
    };
  }),

  /**
   * 신분증 사진 업로드 (base64 → S3)
   */
  uploadIdPhoto: protectedProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // base64 → Buffer
      const base64Data = input.base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileKey = `asset-verify/${ctx.user.id}/id-photo-${Date.now()}.jpg`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // upsert: 기존 인증 레코드 업데이트 또는 신규 생성
      const [existing] = await db
        .select({ id: assetVerifications.id })
        .from(assetVerifications)
        .where(eq(assetVerifications.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        await db.update(assetVerifications)
          .set({ idPhotoKey: fileKey, idPhotoUrl: url, status: "pending" })
          .where(eq(assetVerifications.userId, ctx.user.id));
      } else {
        await db.insert(assetVerifications).values({
          userId: ctx.user.id,
          status: "pending",
          idPhotoKey: fileKey,
          idPhotoUrl: url,
        });
      }

      return { url };
    }),

  /**
   * 얼굴(셀피) 사진 업로드 (base64 → S3)
   */
  uploadSelfie: protectedProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.string().default("image/jpeg"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const base64Data = input.base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileKey = `asset-verify/${ctx.user.id}/selfie-${Date.now()}.jpg`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      const [existing] = await db
        .select({ id: assetVerifications.id })
        .from(assetVerifications)
        .where(eq(assetVerifications.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        await db.update(assetVerifications)
          .set({ selfieKey: fileKey, selfieUrl: url })
          .where(eq(assetVerifications.userId, ctx.user.id));
      } else {
        await db.insert(assetVerifications).values({
          userId: ctx.user.id,
          status: "pending",
          selfieKey: fileKey,
          selfieUrl: url,
        });
      }

      return { url };
    }),

  /**
   * 자산 서류 업로드 (base64 → S3)
   */
  uploadDocument: protectedProcedure
    .input(z.object({
      base64: z.string(),
      mimeType: z.string(),
      fileName: z.string(),
      type: z.enum([
        "real_estate_registry",
        "bank_statement",
        "asset_list",
        "insurance_policy",
        "stock_statement",
        "other",
      ]),
      label: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const base64Data = input.base64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const ext = input.fileName.split(".").pop() || "bin";
      const fileKey = `asset-verify/${ctx.user.id}/docs/${input.type}-${Date.now()}.${ext}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);

      // 인증 레코드 확인/생성
      let [verification] = await db
        .select({ id: assetVerifications.id })
        .from(assetVerifications)
        .where(eq(assetVerifications.userId, ctx.user.id))
        .limit(1);

      if (!verification) {
        const [inserted] = await db.insert(assetVerifications).values({
          userId: ctx.user.id,
          status: "pending",
        });
        // MySQL insert 후 id 가져오기
        const [newRec] = await db
          .select({ id: assetVerifications.id })
          .from(assetVerifications)
          .where(eq(assetVerifications.userId, ctx.user.id))
          .limit(1);
        verification = newRec;
      }

      // 서류 저장
      await db.insert(assetDocuments).values({
        verificationId: verification.id,
        type: input.type,
        label: input.label || input.fileName,
        fileKey,
        fileUrl: url,
        fileName: input.fileName,
        mimeType: input.mimeType,
      });

      return { url, fileKey };
    }),

  /**
   * 자산 서류 삭제
   */
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 소유자 확인
      const [doc] = await db
        .select({ id: assetDocuments.id, verificationId: assetDocuments.verificationId })
        .from(assetDocuments)
        .where(eq(assetDocuments.id, input.documentId))
        .limit(1);

      if (!doc) throw new TRPCError({ code: "NOT_FOUND", message: "서류를 찾을 수 없습니다." });

      const [verif] = await db
        .select({ userId: assetVerifications.userId })
        .from(assetVerifications)
        .where(eq(assetVerifications.id, doc.verificationId))
        .limit(1);

      if (!verif || verif.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "권한이 없습니다." });
      }

      await db.delete(assetDocuments).where(eq(assetDocuments.id, input.documentId));
      return { success: true };
    }),

  /**
   * 본인 확인 동의 + 전자서명 후 검토 요청 제출
   */
  submitVerification: protectedProcedure
    .input(z.object({
      signatureBase64: z.string(), // 서명 캔버스 이미지 base64
      consentChecked: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      if (!input.consentChecked) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "본인 확인 동의가 필요합니다." });
      }

      const [verification] = await db
        .select()
        .from(assetVerifications)
        .where(eq(assetVerifications.userId, ctx.user.id))
        .limit(1);

      if (!verification) {
        throw new TRPCError({ code: "NOT_FOUND", message: "인증 정보가 없습니다. 먼저 서류를 업로드해 주세요." });
      }

      if (!verification.idPhotoKey || !verification.selfieKey) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "신분증 사진과 얼굴 사진이 모두 필요합니다." });
      }

      // 서명 이미지 S3 업로드
      const sigBase64 = input.signatureBase64.replace(/^data:[^;]+;base64,/, "");
      const sigBuffer = Buffer.from(sigBase64, "base64");
      const sigKey = `asset-verify/${ctx.user.id}/signature-${Date.now()}.png`;
      // storagePut은 내부적으로 해시를 추가하므로 반환된 key(해시 포함)를 저장해야 함
      const { key: actualSigKey, url: sigUrl } = await storagePut(sigKey, sigBuffer, "image/png");

      // 서류 업로드 완료 시 자동 승인 처리 (관리자 수동 검토 불필요)
      await db.update(assetVerifications)
        .set({
          status: "approved",
          signatureKey: actualSigKey,
          signatureUrl: sigUrl,
          consentAt: new Date(),
          submittedAt: new Date(),
          reviewedAt: new Date(),
          reviewNote: "자동 승인",
        })
        .where(eq(assetVerifications.userId, ctx.user.id));

      return { success: true };
    }),

  /**
   * 관리자: 자산 인증 목록 조회
   */
  adminList: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const verifications = await db
      .select({
        id: assetVerifications.id,
        userId: assetVerifications.userId,
        status: assetVerifications.status,
        submittedAt: assetVerifications.submittedAt,
        reviewedAt: assetVerifications.reviewedAt,
        reviewNote: assetVerifications.reviewNote,
        idPhotoUrl: assetVerifications.idPhotoUrl,
        selfieUrl: assetVerifications.selfieUrl,
        userName: users.name,
        userEmail: users.email,
      })
      .from(assetVerifications)
      .leftJoin(users, eq(assetVerifications.userId, users.id))
      .orderBy(desc(assetVerifications.submittedAt));

    // 각 인증 건의 문서 목록도 함께 조회
    const result = await Promise.all(
      verifications.map(async (v) => {
        const docs = await db
          .select()
          .from(assetDocuments)
          .where(eq(assetDocuments.verificationId, v.id));
        return { ...v, documents: docs };
      })
    );

    return result;
  }),

  /**
   * 관리자: 인증 승인/반려 처리
   */
  adminReview: adminProcedure
    .input(z.object({
      verificationId: z.number(),
      action: z.enum(["approve", "reject"]),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      await db.update(assetVerifications)
        .set({
          status: input.action === "approve" ? "approved" : "rejected",
          reviewedAt: new Date(),
          reviewedBy: ctx.user.id,
          reviewNote: input.note || null,
        })
        .where(eq(assetVerifications.id, input.verificationId));

      return { success: true };
    }),
});
