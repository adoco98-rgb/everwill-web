/**
 * 재산(Asset) 및 상속자(Heir) 관리 라우터
 * 회원가입 후 재산을 등록하고 유언장 작성 시 자동으로 불러옴
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { assets, heirs, willAssetScans, users, assetVerifications } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { storageGetSignedUrl } from "../storage";

// ─── 재산 유형 목록 ───
const ASSET_TYPES = [
  "real_estate", "bank", "stock", "insurance",
  "crypto", "vehicle", "business", "pension", "artwork", "other",
] as const;

// ─── 상속자 관계 목록 ───
const RELATIONSHIP_TYPES = [
  "spouse", "child", "parent", "sibling", "grandchild", "other",
] as const;

export const assetRouter = router({

  // ── 재산 목록 조회 ──
  listAssets: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, ctx.user.id));
    return rows;
  }),

  // ── 재산 추가 ──
  addAsset: protectedProcedure
    .input(z.object({
      type: z.enum(ASSET_TYPES),
      name: z.string().min(1).max(256),
      description: z.string().optional(),
      estimatedValue: z.number().optional(),
      currency: z.string().default("KRW"),
      country: z.string().default("KR"),
      details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [result] = await db.insert(assets).values({
        userId: ctx.user.id,
        type: input.type,
        name: input.name,
        description: input.description,
        estimatedValue: input.estimatedValue,
        currency: input.currency,
        country: input.country,
        details: input.details,
      });
      return { id: (result as any).insertId, success: true };
    }),

  // ── 재산 수정 ──
  updateAsset: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(256).optional(),
      description: z.string().optional(),
      estimatedValue: z.number().optional(),
      currency: z.string().optional(),
      country: z.string().optional(),
      details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...data } = input;
      await db.update(assets)
        .set(data)
        .where(and(eq(assets.id, id), eq(assets.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── 재산 삭제 ──
  deleteAsset: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(assets)
        .where(and(eq(assets.id, input.id), eq(assets.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── 상속자 목록 조회 ──
  listHeirs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select()
      .from(heirs)
      .where(eq(heirs.userId, ctx.user.id));
    return rows;
  }),

  // ── 상속자 추가 ──
  addHeir: protectedProcedure
    .input(z.object({
      nameKo: z.string().min(1).max(64),
      nameEn: z.string().optional(),
      relationship: z.enum(RELATIONSHIP_TYPES),
      birthDate: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      country: z.string().default("KR"),
      address: z.string().optional(),
      sharePercent: z.number().min(0).max(100).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const [result] = await db.insert(heirs).values({
        userId: ctx.user.id,
        ...input,
      });
      return { id: (result as any).insertId, success: true };
    }),

  // ── 상속자 수정 ──
  updateHeir: protectedProcedure
    .input(z.object({
      id: z.number(),
      nameKo: z.string().optional(),
      nameEn: z.string().optional(),
      relationship: z.enum(RELATIONSHIP_TYPES).optional(),
      birthDate: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      country: z.string().optional(),
      address: z.string().optional(),
      sharePercent: z.number().min(0).max(100).optional(),
      shareAmount: z.number().optional(),
      shareType: z.enum(['percent', 'amount']).optional(),
      isExecutor: z.number().min(0).max(1).optional(),
      accessLevel: z.enum(['own_only', 'full']).optional(),
      smsConsent: z.number().min(0).max(1).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      const { id, ...data } = input;
      await db.update(heirs)
        .set(data)
        .where(and(eq(heirs.id, id), eq(heirs.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── 상속자 삭제 ──
  deleteHeir: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");
      await db.delete(heirs)
        .where(and(eq(heirs.id, input.id), eq(heirs.userId, ctx.user.id)));
      return { success: true };
    }),

  // ── 자산 목록 잠금 상태 조회 ──
  getAssetLockStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { assetLocked: 0, assetLockedAt: null };
    const [user] = await db
      .select({ assetLocked: users.assetLocked, assetLockedAt: users.assetLockedAt })
      .from(users)
      .where(eq(users.id, ctx.user.id));
    return { assetLocked: user?.assetLocked ?? 0, assetLockedAt: user?.assetLockedAt ?? null };
  }),

  // ── 자산 목록 최종 저장 (잠금) ──
  lockAssets: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.update(users)
      .set({ assetLocked: 1, assetLockedAt: new Date() })
      .where(eq(users.id, ctx.user.id));
    return { success: true };
  }),

  // ── 자산 목록 잠금 해제 (수정 모드) ──
  unlockAssets: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB unavailable");
    await db.update(users)
      .set({ assetLocked: 0 })
      .where(eq(users.id, ctx.user.id));
    return { success: true };
  }),

  // ── 재산 + 상속자 통합 조회 (유언장 작성 시 사용) ──
  getWillData: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { assets: [], heirs: [], assetScans: [], signatureUrl: null };
    const [userAssets, userHeirs, userScans, verRows] = await Promise.all([
      db.select().from(assets).where(eq(assets.userId, ctx.user.id)),
      db.select().from(heirs).where(eq(heirs.userId, ctx.user.id)),
      db.select().from(willAssetScans).where(eq(willAssetScans.userId, ctx.user.id)),
      db.select({ signatureUrl: assetVerifications.signatureUrl, signatureKey: assetVerifications.signatureKey })
        .from(assetVerifications).where(eq(assetVerifications.userId, ctx.user.id)).limit(1),
    ]);
    // signatureKey가 있으면 presigned URL 생성 (배포 환경에서 /manus-storage/ 경로 대신 사용)
    let signatureUrl: string | null = verRows[0]?.signatureUrl ?? null;
    if (verRows[0]?.signatureKey) {
      try {
        signatureUrl = await storageGetSignedUrl(verRows[0].signatureKey);
      } catch { /* fallback to signatureUrl */ }
    }
    return { assets: userAssets, heirs: userHeirs, assetScans: userScans, signatureUrl };
  }),
});
