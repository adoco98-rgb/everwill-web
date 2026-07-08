/**
 * 프로필 기본정보 저장 라우터
 * 유언 작성 1단계에서 사용자가 입력한 기본정보를 DB에 영구 저장
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const profileRouter = router({
  /**
   * 기본정보 저장 (로그인된 사용자 본인)
   * - 전화번호, 주소, 상세주소, 생년월일 등
   */
  saveBasicInfo: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(50),
      phone: z.string().max(20).optional(),
      address: z.string().optional(),
      addressDetail: z.string().optional(),
      birthDate: z.string().max(16).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      const userId = ctx.user.id;

      await db.update(users).set({
        name: input.name,
        phone: input.phone || null,
        address: input.address || null,
        addressDetail: input.addressDetail || null,
        birthDate: input.birthDate || null,
        updatedAt: new Date(),
      }).where(eq(users.id, userId));

      return { success: true };
    }),

  /**
   * 기본정보 조회 (로그인된 사용자 본인)
   */
  getBasicInfo: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const rows = await db.select({
      name: users.name,
      phone: users.phone,
      email: users.email,
      address: users.address,
      addressDetail: users.addressDetail,
      birthDate: users.birthDate,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);

    return rows[0] || null;
  }),
});
