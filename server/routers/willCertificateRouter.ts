/**
 * 유언인증서 발급 내역 라우터 v3.0
 * - requestCertificate: 유언인증서 신청
 * - getMyList: 내 발급 내역 조회
 * - downloadPdf: 국가별 PDF 인증서 다운로드 (실제 DB 데이터 기반, S3 저장)
 * - generateSamplePdf: 샘플 PDF 즉시 생성 (로그인 없이도 미리보기 가능)
 */
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  willCertificates,
  wills,
  users,
  assets,
  heirs,
  willAttachments,
  notarizationDocs,
  willAssetScans,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { generateWillCertificatePDF } from "../utils/certificatePdfGenerator";
import { storagePut, storageGetSignedUrl } from "../storage";

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

  /**
   * 국가별 PDF 인증서 생성 및 다운로드
   * - 실제 DB 데이터 (자산, 상속자, 첨부파일) 기반으로 생성
   * - S3에 저장 후 URL 반환 (재다운로드 시 캐시 사용)
   */
  downloadPdf: protectedProcedure
    .input(
      z.object({
        certificateId: z.number().optional(),
        willId: z.number().optional(),
        country: z.string().length(2).optional(),
        forceRegenerate: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      // 사용자 정보 조회
      const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = userRows[0];
      const country = (input.country ?? user?.country ?? "KR").toUpperCase();

      let certRecord: any = null;
      let willRecord: any = null;

      if (input.certificateId) {
        // 발급된 인증서 기반
        const certRows = await db
          .select()
          .from(willCertificates)
          .where(and(eq(willCertificates.id, input.certificateId), eq(willCertificates.userId, userId)))
          .limit(1);
        certRecord = certRows[0];
        if (!certRecord) throw new TRPCError({ code: "NOT_FOUND", message: "인증서를 찾을 수 없습니다" });

        const willRows = await db.select().from(wills).where(eq(wills.id, certRecord.willId)).limit(1);
        willRecord = willRows[0];
      } else if (input.willId) {
        // 유언장 직접 기반
        const willRows = await db
          .select()
          .from(wills)
          .where(and(eq(wills.id, input.willId), eq(wills.userId, userId)))
          .limit(1);
        willRecord = willRows[0];
        if (!willRecord) throw new TRPCError({ code: "NOT_FOUND", message: "유언장을 찾을 수 없습니다" });
      } else {
        throw new TRPCError({ code: "BAD_REQUEST", message: "certificateId 또는 willId가 필요합니다" });
      }

      // 캐시된 PDF URL 반환 (재생성 요청 없으면)
      if (certRecord?.fileUrl && !input.forceRegenerate) {
        return {
          pdfUrl: certRecord.fileUrl,
          filename: `EverWill_Certificate_${certRecord.issueNumber ?? certRecord.id}_${country}.pdf`,
          cached: true,
        };
      }

      // 유언장 데이터 파싱
      let willData: Record<string, any> = {};
      try {
        willData = willRecord?.data ? JSON.parse(willRecord.data) : {};
      } catch {
        willData = {};
      }

      const certNumber =
        certRecord?.issueNumber ??
        willRecord?.certNumber ??
        `EW-${new Date().getFullYear()}-${(willRecord?.id ?? 0).toString().padStart(6, "0")}`;

      const certifiedAt = certRecord?.processedAt ?? willRecord?.certifiedAt ?? new Date();

      // ── 실제 자산 목록 조회 ──────────────────────────────────────────────────
      const assetRows = await db
        .select()
        .from(assets)
        .where(eq(assets.userId, userId))
        .orderBy(assets.type);

      const assetScanRowsDl = await db.select().from(willAssetScans).where(eq(willAssetScans.userId, userId));

      const assetData = [
        // assets 테이블 (pension 제외)
        ...assetRows
          .filter((a) => a.type !== "pension")
          .map((a) => ({
            type: a.type ?? "other",
            name: a.name ?? "자산",
            estimatedValue: a.estimatedValue ?? 0,
            currency: a.currency ?? "KRW",
            country: a.country ?? country,
            details: a.details ?? undefined,
          })),
        // willAssetScans 테이블 (pension_statement 제외)
        ...assetScanRowsDl
          .filter((s) => s.docType !== "pension_statement")
          .map((s) => ({
            type: s.docType ?? "other",
            name: s.assetName || s.docTypeLabel || s.docType || "자산",
            estimatedValue: s.estimatedValue ? Number(s.estimatedValue) : 0,
            currency: "KRW",
            country: country,
          })),
      ];

      // ── 실제 상속자 목록 조회 ────────────────────────────────────────────────
      const heirRows = await db
        .select()
        .from(heirs)
        .where(eq(heirs.userId, userId))
        .orderBy(heirs.priority);

      const heirData = heirRows.map((h) => ({
        nameKo: h.nameKo ?? "상속자",
        name: h.nameKo ?? "상속자",
        nameEn: h.nameEn ?? undefined,
        relationship: h.relationship ?? "other",
        birthDate: h.birthDate ?? undefined,
        sharePercent: h.sharePercent ?? undefined,
        shareType: h.shareType ?? "percentage",
        isExecutor: h.isExecutor ?? 0,
      }));

      // ── 실제 첨부파일 목록 조회 (자산서류 + 공증서류) ────────────────────────
      const attachmentRows = await db
        .select()
        .from(willAttachments)
        .where(eq(willAttachments.userId, userId))
        .orderBy(willAttachments.createdAt);

      // 공증서류 목록 조회
      const notarizationRows = await db
        .select()
        .from(notarizationDocs)
        .where(eq(notarizationDocs.userId, userId));

      // 첨부파일 이미지 bytes 미리 로드 (presigned URL 통해 S3에서 직접 fetch)
      const attachmentData: any[] = [];
      for (const att of attachmentRows) {
        const isImage = att.fileType && att.fileType.startsWith("image/");
        let fileBytes: Buffer | null = null;
        if (isImage && att.fileKey) {
          try {
            const signedUrl = await storageGetSignedUrl(att.fileKey);
            const res = await fetch(signedUrl);
            if (res.ok) {
              fileBytes = Buffer.from(await res.arrayBuffer());
            }
          } catch { /* 무시 */ }
        }
        attachmentData.push({
          fileName: att.fileName ?? "첨부파일",
          fileType: att.fileType ?? "application/octet-stream",
          category: att.category ?? "other",
          description: att.description ?? undefined,
          fileSize: att.fileSize ?? 0,
          verified: att.verified ?? 0,
          createdAt: att.createdAt ? new Date(att.createdAt) : undefined,
          fileKey: att.fileKey ?? undefined,
          fileUrl: att.fileUrl ?? undefined,
          fileBytes,
        });
      }
      // 공증서류도 첨부파일로 추가
      for (const doc of notarizationRows) {
        // 파일명으로 이미지 여부 판단 (fileType 커럼 없음)
        const fname = (doc.fileName ?? doc.fileKey ?? "").toLowerCase();
        const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/.test(fname);
        let fileBytes: Buffer | null = null;
        if (isImage) {
          try {
            // presigned URL 시도
            if (doc.fileKey) {
              const signedUrl = await storageGetSignedUrl(doc.fileKey);
              const res = await fetch(signedUrl);
              if (res.ok) {
                fileBytes = Buffer.from(await res.arrayBuffer());
              }
            }
            // presigned URL 실패 시 fileUrl 직접 fallback
            if (!fileBytes && doc.fileUrl) {
              const res2 = await fetch(doc.fileUrl);
              if (res2.ok) {
                fileBytes = Buffer.from(await res2.arrayBuffer());
              }
            }
          } catch { /* 무시 */ }
        }
        // 실제 fileType 추정
        const detectedFileType = isImage
          ? (fname.endsWith('.png') ? 'image/png' : fname.endsWith('.webp') ? 'image/webp' : 'image/jpeg')
          : 'application/pdf';
        attachmentData.push({
          fileName: doc.fileName ?? doc.docName ?? "공증서류",
          fileType: detectedFileType,
          category: "notarization",
          description: doc.docName ?? undefined,
          fileSize: doc.fileSize ?? 0,
          verified: 1,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
          fileKey: doc.fileKey ?? undefined,
          fileUrl: doc.fileUrl ?? undefined,
          fileBytes,
        });
      }

      // ── 유언 전문 추출 ────────────────────────────────────────────────────────
      // willContent: 10단계 마법사 최종 생성 텍스트 (가장 우선)
      // draftText/aiDraft/willText: 구버전 필드명
      const willText =
        willData.willContent ??
        willData.draftText ??
        willData.aiDraft ??
        willData.willText ??
        willRecord?.title ??
        "유언 내용이 등록되어 있지 않습니다.";

      // ── PDF 생성 ─────────────────────────────────────────────────────────────
      // 서명 이미지 로드 (assetVerifications 테이블에서)
      let signatureImageBuffer: Buffer | null = null;
      try {
        const { assetVerifications } = await import("../../drizzle/schema");
        const sigRows = await db
          .select({ signatureUrl: assetVerifications.signatureUrl, signatureKey: assetVerifications.signatureKey })
          .from(assetVerifications)
          .where(eq(assetVerifications.userId, userId))
          .orderBy(desc(assetVerifications.createdAt))
          .limit(1);
        const sigRow = sigRows[0];
        if (sigRow?.signatureKey) {
          const { storageGetSignedUrl } = await import("../storage");
          const signedUrl = await storageGetSignedUrl(sigRow.signatureKey);
          const sigRes = await fetch(signedUrl);
          if (sigRes.ok) signatureImageBuffer = Buffer.from(await sigRes.arrayBuffer());
        } else if (sigRow?.signatureUrl) {
          const sigRes = await fetch(sigRow.signatureUrl);
          if (sigRes.ok) signatureImageBuffer = Buffer.from(await sigRes.arrayBuffer());
        }
      } catch { /* 서명 이미지 로드 실패 시 무시 */ }

      const pdfBuffer = await generateWillCertificatePDF({
        certNumber,
        certifiedAt: new Date(certifiedAt),
        testatorName: user?.name ?? willData.testatorName ?? "유언자",
        testatorBirthDate: user?.birthDate ?? willData.testatorBirthDate ?? undefined,
        testatorRRN: willData.testatorRRN ?? user?.residentNumberMasked ?? undefined,
        testatorAddress: user?.address ?? willData.testatorAddress ?? undefined,
        testatorPhone: user?.phone ?? willData.testatorPhone ?? undefined,
        willTitle: willRecord?.title ?? "유언장",
        willText,
        purpose: certRecord?.purpose ?? "유언장 인증 확인용",
        blockchainHash: willRecord?.blockchainHash ?? undefined,
        country,
        assets: assetData,
        heirs: heirData,
        attachments: attachmentData,
        signatureImageBuffer,
      });

      // ── S3 업로드 ────────────────────────────────────────────────────────────
      const fileKey = `certificates/${userId}/cert-${certNumber}-${country}-${Date.now()}.pdf`;
      const { url: pdfUrl } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      // ── DB 업데이트 (인증서 레코드에 파일 URL 저장) ─────────────────────────
      if (certRecord?.id) {
        await db
          .update(willCertificates)
          .set({ fileKey, fileUrl: pdfUrl })
          .where(eq(willCertificates.id, certRecord.id));
      }

      return {
        pdfUrl,
        filename: `EverWill_Certificate_${certNumber}_${country}.pdf`,
        cached: false,
      };
    }),

  /**
   * 샘플 PDF 즉시 생성 (로그인 필요, 실제 데이터 없어도 샘플 데이터로 생성)
   * - 가입 후 바로 체험 가능
   */
  generateSamplePdf: protectedProcedure
    .input(
      z.object({
        country: z.string().length(2).default("KR"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = userRows[0];
      const country = input.country.toUpperCase();

      // 실제 자산/상속자 조회 (없으면 샘플 데이터 사용)
      const assetRows = await db.select().from(assets).where(eq(assets.userId, userId));
      const heirRows = await db.select().from(heirs).where(eq(heirs.userId, userId));
      const attachmentRows = await db.select().from(willAttachments).where(eq(willAttachments.userId, userId));

      // 샘플 자산 (실제 데이터 없을 때)
      const sampleAssets =
        assetRows.length > 0
          ? assetRows.map((a) => ({
              type: a.type ?? "other",
              name: a.name ?? "자산",
              estimatedValue: a.estimatedValue ?? 0,
              currency: a.currency ?? "KRW",
              country: a.country ?? country,
              details: a.details ?? undefined,
            }))
          : [
              { type: "real_estate", name: "서울 강남구 아파트 (예시)", estimatedValue: 850000000, currency: "KRW", country: "KR" },
              { type: "bank", name: "국민은행 예금 (예시)", estimatedValue: 45000000, currency: "KRW", country: "KR" },
              { type: "stock", name: "삼성전자 주식 500주 (예시)", estimatedValue: 35000000, currency: "KRW", country: "KR" },
            ];

      // 샘플 상속자 (실제 데이터 없을 때)
      const sampleHeirs =
        heirRows.length > 0
          ? heirRows.map((h) => ({
              nameKo: h.nameKo ?? "상속자",
              name: h.nameKo ?? "상속자",
              nameEn: h.nameEn ?? undefined,
              relationship: h.relationship ?? "other",
              birthDate: h.birthDate ?? undefined,
              sharePercent: h.sharePercent ?? undefined,
              shareType: h.shareType ?? "percentage",
              isExecutor: h.isExecutor ?? 0,
            }))
          : [
              { nameKo: "홍철수 (예시)", relationship: "child", sharePercent: 50, shareType: "percentage", isExecutor: 0 },
              { nameKo: "홍영희 (예시)", relationship: "child", sharePercent: 30, shareType: "percentage", isExecutor: 0 },
              { nameKo: "김순자 (예시)", relationship: "spouse", sharePercent: 20, shareType: "percentage", isExecutor: 0 },
            ];

      const sampleAttachments = attachmentRows.map((att) => ({
        fileName: att.fileName ?? "첨부파일",
        fileType: att.fileType ?? "application/pdf",
        category: att.category ?? "other",
        description: att.description ?? undefined,
        fileSize: att.fileSize ?? 0,
        verified: att.verified ?? 0,
        createdAt: att.createdAt ? new Date(att.createdAt) : undefined,
      }));

      const certNumber = `EW-SAMPLE-${userId}-${country}-${Date.now().toString(36).toUpperCase()}`;

      const pdfBuffer = await generateWillCertificatePDF({
        certNumber,
        certifiedAt: new Date(),
        testatorName: user?.name ?? "유언자 (샘플)",
        testatorBirthDate: user?.birthDate ?? undefined,
        testatorAddress: user?.address ?? undefined,
        willTitle: "EverWill 샘플 유언인증서",
        willText: `본 문서는 EverWill 플랫폼의 샘플 유언인증서입니다.\n실제 유언장 작성 및 인증 완료 후 정식 인증서가 발급됩니다.\n\n유언자: ${user?.name ?? "유언자"}\n발급일: ${new Date().toLocaleDateString("ko-KR")}`,
        purpose: "샘플 미리보기",
        country,
        assets: sampleAssets,
        heirs: sampleHeirs,
        attachments: sampleAttachments,
      });

      // S3 업로드
      const fileKey = `certificates/${userId}/sample-${country}-${Date.now()}.pdf`;
      const { url: pdfUrl } = await storagePut(fileKey, pdfBuffer, "application/pdf");

      return {
        pdfUrl,
        filename: `EverWill_샘플인증서_${country}.pdf`,
        cached: false,
        isSample: true,
      };
    }),

  /**
   * PDF 미리보기용 base64 반환
   * - 브라우저 내 iframe/embed에서 직접 렌더링
   * - certificateId 기반(정식) 또는 샘플 모드 지원
   */
  previewPdf: protectedProcedure
    .input(
      z.object({
        certificateId: z.number().optional(),
        willId: z.number().optional(),
        country: z.string().length(2).default("KR"),
        isSample: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      const user = userRows[0];
      const country = input.country.toUpperCase();

      let certRecord: any = null;
      let willRecord: any = null;
      let certNumber: string;
      let certifiedAt: Date;
      let willText: string;
      let willTitle: string;
      let purpose: string;

      if (!input.isSample && input.certificateId) {
        // 정식 인증서 기반
        const certRows = await db
          .select()
          .from(willCertificates)
          .where(and(eq(willCertificates.id, input.certificateId), eq(willCertificates.userId, userId)))
          .limit(1);
        certRecord = certRows[0];
        if (!certRecord) throw new TRPCError({ code: "NOT_FOUND", message: "인증서를 찾을 수 없습니다" });

        const willRows = await db.select().from(wills).where(eq(wills.id, certRecord.willId)).limit(1);
        willRecord = willRows[0];

        certNumber = certRecord.issueNumber ?? willRecord?.certNumber ?? `EW-${new Date().getFullYear()}-${String(certRecord.id).padStart(6, "0")}`;
        certifiedAt = certRecord.processedAt ?? willRecord?.certifiedAt ?? new Date();
        const willData = willRecord?.data ? JSON.parse(willRecord.data) : {};
        willText = willData.willContent ?? willData.draftText ?? willData.aiDraft ?? willData.willText ?? willRecord?.title ?? "유언 내용이 등록되어 있지 않습니다.";
        willTitle = willRecord?.title ?? "유언장";
        purpose = certRecord.purpose ?? "유언장 인증 확인용";
      } else if (!input.isSample && input.willId) {
        // 유언장 직접 기반 (인증서 없이 미리보기)
        const willRows = await db
          .select()
          .from(wills)
          .where(and(eq(wills.id, input.willId), eq(wills.userId, userId)))
          .limit(1);
        willRecord = willRows[0];
        if (!willRecord) throw new TRPCError({ code: "NOT_FOUND", message: "유언장을 찾을 수 없습니다" });

        certNumber = willRecord.certNumber ?? `EW-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${String(userId).slice(-4)}${String(input.willId).padStart(4,'0')}`;
        certifiedAt = willRecord.certifiedAt ?? new Date();
        const willData = willRecord.data ? JSON.parse(willRecord.data) : {};
        willText = willData.willContent ?? willData.draftText ?? willData.aiDraft ?? willData.willText ?? willRecord.title ?? "유언 내용이 등록되어 있지 않습니다.";
        willTitle = willRecord.title ?? "유언장";
        purpose = "유언장 인증 확인용";
      } else {
        // 샘플 모드
        certNumber = `EW-PREVIEW-${userId}-${country}-${Date.now().toString(36).toUpperCase()}`;
        certifiedAt = new Date();
        willText = `본 문서는 EverWill 플랫폼의 미리보기 샘플입니다.\n실제 유언장 작성 및 인증 완료 후 정식 인증서가 발급됩니다.\n\n유언자: ${user?.name ?? "유언자"}\n발급일: ${new Date().toLocaleDateString("ko-KR")}`;
        willTitle = "EverWill 샘플 유언인증서";
        purpose = "미리보기 샘플";
      }

      // 자산/상속자/첨부파일 조회
      const assetRows = await db.select().from(assets).where(eq(assets.userId, userId));
      const assetScanRows = await db.select().from(willAssetScans).where(eq(willAssetScans.userId, userId));
      const heirRows = await db.select().from(heirs).where(eq(heirs.userId, userId));
      const attachmentRows = await db.select().from(willAttachments).where(eq(willAttachments.userId, userId));
      const notarizationRowsPreview = await db.select().from(notarizationDocs).where(eq(notarizationDocs.userId, userId));

      // pension(연금)은 상속 대상이 아니므로 제외
      const filteredAssetRows = assetRows.filter((a) => a.type !== "pension");
      // willAssetScans도 pension 관련 서류 제외 (docType: pension_statement)
      const filteredScanRows = assetScanRows.filter((s) => s.docType !== "pension_statement");

      // assets 테이블 + willAssetScans 테이블 합산
      const combinedAssets = [
        ...filteredAssetRows.map((a) => ({
          type: a.type ?? "other",
          name: a.name ?? "자산",
          estimatedValue: a.estimatedValue ?? 0,
          currency: a.currency ?? "KRW",
          country: a.country ?? country,
        })),
        ...filteredScanRows.map((s) => ({
          type: s.docType ?? "other",
          name: s.assetName || s.docTypeLabel || s.docType || "자산",
          estimatedValue: s.estimatedValue ? Number(s.estimatedValue) : 0,
          currency: "KRW",
          country: country,
        })),
      ];

      const assetData =
        combinedAssets.length > 0
          ? combinedAssets
          : [
              { type: "real_estate", name: "서울 강남구 아파트 (예시)", estimatedValue: 850000000, currency: "KRW", country: "KR" },
              { type: "bank", name: "국민은행 예금 (예시)", estimatedValue: 45000000, currency: "KRW", country: "KR" },
              { type: "stock", name: "삼성전자 주식 500주 (예시)", estimatedValue: 35000000, currency: "KRW", country: "KR" },
            ];

      const heirData =
        heirRows.length > 0
          ? heirRows.map((h) => ({ nameKo: h.nameKo ?? "상속자", relationship: h.relationship ?? "other", sharePercent: h.sharePercent ?? undefined, shareType: h.shareType ?? "percentage", isExecutor: h.isExecutor ?? 0 }))
          : [
              { nameKo: "홍철수 (예시)", relationship: "child", sharePercent: 50, shareType: "percentage", isExecutor: 0 },
              { nameKo: "홍영희 (예시)", relationship: "child", sharePercent: 30, shareType: "percentage", isExecutor: 0 },
              { nameKo: "김순자 (예시)", relationship: "spouse", sharePercent: 20, shareType: "percentage", isExecutor: 0 },
            ];

      // 첨부파일 이미지 bytes 미리 로드 (presigned URL 통해 S3에서 직접 fetch)
      const attachmentData: any[] = [];
      for (const att of attachmentRows) {
        const isImage = att.fileType && att.fileType.startsWith("image/");
        let fileBytes: Buffer | null = null;
        if (isImage && att.fileKey) {
          try {
            const signedUrl = await storageGetSignedUrl(att.fileKey);
            const res = await fetch(signedUrl);
            if (res.ok) {
              fileBytes = Buffer.from(await res.arrayBuffer());
            }
          } catch { /* 무시 */ }
        }
        attachmentData.push({
          fileName: att.fileName ?? "첨부파일",
          fileType: att.fileType ?? "application/pdf",
          category: att.category ?? "other",
          description: att.description ?? undefined,
          fileSize: att.fileSize ?? 0,
          verified: att.verified ?? 0,
          createdAt: att.createdAt ? new Date(att.createdAt) : undefined,
          fileKey: att.fileKey ?? undefined,
          fileUrl: att.fileUrl ?? undefined,
          fileBytes,
        });
      }
      // 공증서류도 첨부파일로 추가
      for (const doc of notarizationRowsPreview) {
        const fname2 = (doc.fileName ?? doc.fileKey ?? "").toLowerCase();
        const isImage2 = /\.(jpg|jpeg|png|webp|gif|bmp)$/.test(fname2);
        let fileBytes: Buffer | null = null;
        if (isImage2) {
          try {
            if (doc.fileKey) {
              const signedUrl = await storageGetSignedUrl(doc.fileKey);
              const res = await fetch(signedUrl);
              if (res.ok) {
                fileBytes = Buffer.from(await res.arrayBuffer());
              }
            }
            if (!fileBytes && doc.fileUrl) {
              const res2 = await fetch(doc.fileUrl);
              if (res2.ok) {
                fileBytes = Buffer.from(await res2.arrayBuffer());
              }
            }
          } catch { /* 무시 */ }
        }
        const detectedFileType2 = isImage2
          ? (fname2.endsWith('.png') ? 'image/png' : fname2.endsWith('.webp') ? 'image/webp' : 'image/jpeg')
          : 'application/pdf';
        attachmentData.push({
          fileName: doc.fileName ?? doc.docName ?? "공증서류",
          fileType: detectedFileType2,
          category: "notarization",
          description: doc.docName ?? undefined,
          fileSize: doc.fileSize ?? 0,
          verified: 1,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
          fileKey: doc.fileKey ?? undefined,
          fileUrl: doc.fileUrl ?? undefined,
          fileBytes,
        });
      }

      // 서명 이미지 로드 (assetVerifications 테이블 우선, 없으면 willData JSON의 signature1 fallback)
      let signatureImageBufferPreview: Buffer | null = null;
      try {
        const { assetVerifications } = await import("../../drizzle/schema");
        const sigRows = await db
          .select({ signatureUrl: assetVerifications.signatureUrl, signatureKey: assetVerifications.signatureKey })
          .from(assetVerifications)
          .where(eq(assetVerifications.userId, userId))
          .orderBy(desc(assetVerifications.createdAt))
          .limit(1);
        const sigRow = sigRows[0];
        if (sigRow?.signatureKey) {
          const { storageGetSignedUrl } = await import("../storage");
          const signedUrl = await storageGetSignedUrl(sigRow.signatureKey);
          const sigRes = await fetch(signedUrl);
          if (sigRes.ok) signatureImageBufferPreview = Buffer.from(await sigRes.arrayBuffer());
        } else if (sigRow?.signatureUrl) {
          const sigRes = await fetch(sigRow.signatureUrl);
          if (sigRes.ok) signatureImageBufferPreview = Buffer.from(await sigRes.arrayBuffer());
        }
        // assetVerifications에 서명 없으면 willData JSON의 signature1 필드를 fallback으로 사용
        if (!signatureImageBufferPreview && willRecord?.data) {
          try {
            const wd = JSON.parse(willRecord.data);
            const sig1 = wd.signature1 || wd.signature || "";
            if (sig1 && sig1.startsWith("data:image/")) {
              // base64 data URL → Buffer
              const base64Data = sig1.split(",")[1];
              if (base64Data) signatureImageBufferPreview = Buffer.from(base64Data, "base64");
            }
          } catch { /* 무시 */ }
        }
      } catch { /* 서명 이미지 로드 실패 시 무시 */ }

      // willData에서 testatorRRN, testatorPhone 추출
      let previewRRN: string | undefined;
      let previewPhone: string | undefined;
      try {
        const wd = willRecord?.data ? JSON.parse(willRecord.data) : {};
        previewRRN = wd.testatorRRN ?? user?.residentNumberMasked ?? undefined;
        previewPhone = wd.testatorPhone ?? undefined;
      } catch { /* 무시 */ }

      // PDF 생성 (S3 저장 없이 buffer만 반환)
      const pdfBuffer = await generateWillCertificatePDF({
        certNumber,
        certifiedAt: new Date(certifiedAt),
        testatorName: user?.name ?? "유언자",
        testatorBirthDate: user?.birthDate ?? undefined,
        testatorRRN: previewRRN,
        testatorAddress: user?.address ?? undefined,
        testatorPhone: user?.phone ?? previewPhone ?? undefined,
        willTitle,
        willText,
        purpose,
        country,
        assets: assetData,
        heirs: heirData,
        attachments: attachmentData,
        signatureImageBuffer: signatureImageBufferPreview,
      });

      // base64로 변환하여 반환 (브라우저 내 렌더링용)
      const base64 = pdfBuffer.toString("base64");
      return {
        base64,
        filename: `EverWill_인증서_${certNumber}_${country}.pdf`,
        isSample: input.isSample,
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

      // 해당 유언장이 본인 것인지 확인 (status 무관하게 허용)
      const will = await db
        .select()
        .from(wills)
        .where(and(eq(wills.id, input.willId), eq(wills.userId, userId)))
        .limit(1);

      if (will.length === 0) {
        throw new Error("유언장을 찾을 수 없습니다");
      }

      // 신청 즉시 issued 처리 (무료 자동 발급)
      const issueNumber = `EW-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}-${String(userId).slice(-4)}${String(input.willId).padStart(4,'0')}`;

      const [inserted] = await db.insert(willCertificates).values({
        userId,
        willId: input.willId,
        certDate: input.certDate,
        purpose: input.purpose,
        status: "issued",
        issueNumber,
        processedAt: new Date(),
        createdAt: new Date(),
      });

      return { success: true, issueNumber };
    }),

  /**
   * 인증서 출력(다운로드) 일시 기록
   */
  recordPrint: protectedProcedure
    .input(z.object({ certificateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const [cert] = await db
        .select({ id: willCertificates.id, userId: willCertificates.userId, printCount: willCertificates.printCount, printedAt: willCertificates.printedAt })
        .from(willCertificates)
        .where(and(eq(willCertificates.id, input.certificateId), eq(willCertificates.userId, ctx.user.id)))
        .limit(1);

      if (!cert) throw new TRPCError({ code: "NOT_FOUND", message: "인증서를 찾을 수 없습니다" });

      const now = new Date();
      await db.update(willCertificates)
        .set({
          printedAt: cert.printedAt ?? now, // 최초 출력 날짜만 저장
          printCount: (cert.printCount ?? 0) + 1,
        })
        .where(eq(willCertificates.id, input.certificateId));

      return { success: true, printedAt: now, printCount: (cert.printCount ?? 0) + 1 };
    }),
});
