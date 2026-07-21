/**
 * 공증서류 업로드 라우터
 * - presigned PUT URL 발급 → 클라이언트가 직접 S3 업로드 → DB에 메타데이터 저장
 * - 서버를 통한 base64 전송 방식 대신 클라이언트 직접 업로드로 타임아웃 문제 해결
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notarizationDocs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { ENV } from "../_core/env";

/** Forge API를 통해 S3 presigned PUT URL 발급 */
async function getPresignedPutUrl(fileKey: string): Promise<string> {
  const forgeUrl = (ENV.forgeApiUrl || "").replace(/\/+$/, "");
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) throw new Error("Storage config missing");

  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/");
  presignUrl.searchParams.set("path", fileKey);
  const resp = await fetch(presignUrl.toString(), {
    headers: { Authorization: `Bearer ${forgeKey}` },
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => resp.statusText);
    throw new Error(`Presign failed (${resp.status}): ${msg}`);
  }
  const { url } = (await resp.json()) as { url: string };
  if (!url) throw new Error("Forge returned empty presign URL");
  return url;
}

/** 해시 suffix 추가 (storagePut과 동일 방식) */
function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export const notarizationDocsRouter = router({
  /** 공증서류 목록 조회 */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const docs = await db
      .select()
      .from(notarizationDocs)
      .where(eq(notarizationDocs.userId, ctx.user.id));
    return docs;
  }),

  /**
   * Step 1: presigned PUT URL 발급
   * 클라이언트가 이 URL로 직접 S3에 PUT 업로드
   */
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        docId: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const rawKey = `notarization-docs/${ctx.user.id}/${input.docId}-${Date.now()}-${input.fileName}`;
      const fileKey = appendHashSuffix(rawKey.replace(/^\/+/, ""));
      const presignedUrl = await getPresignedPutUrl(fileKey);
      console.log('[notarizationDocs.getUploadUrl] presigned URL 발급:', fileKey);
      return { presignedUrl, fileKey };
    }),

  /**
   * Step 2: 업로드 완료 후 DB에 메타데이터 저장
   * 클라이언트가 S3 업로드 완료 후 호출
   */
  confirmUpload: protectedProcedure
    .input(
      z.object({
        docId: z.string(),
        docName: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        fileKey: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('[notarizationDocs.confirmUpload] DB 저장 시작:', { userId: ctx.user.id, docId: input.docId, fileName: input.fileName });
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      const fileUrl = `/manus-storage/${input.fileKey}`;

      // 기존 같은 docId 서류 삭제 (1개만 유지)
      await db
        .delete(notarizationDocs)
        .where(
          and(
            eq(notarizationDocs.userId, ctx.user.id),
            eq(notarizationDocs.docId, input.docId)
          )
        );

      // DB 저장
      await db.insert(notarizationDocs).values({
        userId: ctx.user.id,
        docId: input.docId,
        docName: input.docName,
        fileKey: input.fileKey,
        fileUrl,
        fileName: input.fileName,
        fileSize: input.fileSize,
      });

      console.log('[notarizationDocs.confirmUpload] DB 저장 완료:', input.docId);
      return { success: true, fileKey: input.fileKey, fileUrl };
    }),

  /**
   * 기존 방식 (base64) - 소용량 파일용 fallback
   * @deprecated presigned URL 방식 사용 권장
   */
  upload: protectedProcedure
    .input(
      z.object({
        docId: z.string(),
        docName: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        fileBase64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('[notarizationDocs.upload] base64 방식 요청 수신:', { userId: ctx.user.id, docId: input.docId, fileName: input.fileName, fileSize: input.fileSize });
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // base64 → Buffer 변환
      const base64Data = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // presigned URL 방식으로 S3 업로드
      const rawKey = `notarization-docs/${ctx.user.id}/${input.docId}-${Date.now()}-${input.fileName}`;
      const fileKey = appendHashSuffix(rawKey.replace(/^\/+/, ""));
      const presignedUrl = await getPresignedPutUrl(fileKey);

      console.log('[notarizationDocs.upload] S3 업로드 시작:', fileKey);
      const uploadResp = await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": input.mimeType },
        body: buffer,
      });
      if (!uploadResp.ok) {
        throw new Error(`S3 업로드 실패 (${uploadResp.status})`);
      }
      console.log('[notarizationDocs.upload] S3 업로드 완료:', fileKey);

      const fileUrl = `/manus-storage/${fileKey}`;

      // 기존 같은 docId 서류 삭제
      await db
        .delete(notarizationDocs)
        .where(
          and(
            eq(notarizationDocs.userId, ctx.user.id),
            eq(notarizationDocs.docId, input.docId)
          )
        );

      // DB 저장
      console.log('[notarizationDocs.upload] DB 저장 시작');
      await db.insert(notarizationDocs).values({
        userId: ctx.user.id,
        docId: input.docId,
        docName: input.docName,
        fileKey,
        fileUrl,
        fileName: input.fileName,
        fileSize: input.fileSize,
      });

      console.log('[notarizationDocs.upload] DB 저장 완료');
      return { success: true, fileKey, fileUrl };
    }),

  /** 공증서류 삭제 */
  delete: protectedProcedure
    .input(z.object({ docId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");
      await db
        .delete(notarizationDocs)
        .where(
          and(
            eq(notarizationDocs.userId, ctx.user.id),
            eq(notarizationDocs.docId, input.docId)
          )
        );
      return { success: true };
    }),
});
