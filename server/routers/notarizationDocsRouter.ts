/**
 * 공증서류 업로드 라우터
 * - 파일을 S3에 업로드하고 DB에 메타데이터 저장
 * - 사용자별 서류 목록 조회 및 삭제
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { notarizationDocs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storagePut } from "../storage";

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

  /** 공증서류 업로드 (base64 → S3 저장) */
  upload: protectedProcedure
    .input(
      z.object({
        docId: z.string(),
        docName: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        /** base64 인코딩된 파일 데이터 (data:image/...;base64,... 형태) */
        fileBase64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('[notarizationDocs.upload] 요청 수신:', { userId: ctx.user.id, docId: input.docId, fileName: input.fileName, fileSize: input.fileSize, base64Length: input.fileBase64.length });
      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // base64 → Buffer 변환
      const base64Data = input.fileBase64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // S3 업로드
      const fileKey = `notarization-docs/${ctx.user.id}/${input.docId}-${Date.now()}-${input.fileName}`;
      const { key, url } = await storagePut(fileKey, buffer, input.mimeType);

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
        fileKey: key,
        fileUrl: url,
        fileName: input.fileName,
        fileSize: input.fileSize,
      });

      return { success: true, fileKey: key, fileUrl: url };
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
