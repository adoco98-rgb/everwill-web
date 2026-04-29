/**
 * QR 코드 라우터
 * - getMyQr: 내 QR 코드 및 공개 URL 반환
 * - getPublicProfile: QR 코드로 공개 프로필 조회
 * - updateQrPublic: QR 공개 여부 설정
 */
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";

export const qrRouter = router({
  /**
   * 내 QR 코드 정보 반환 (로그인 필요)
   * - qrCode: UUID 문자열
   * - qrUrl: 공개 프로필 URL
   * - qrPublic: 공개 여부
   */
  getMyQr: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

    const [user] = await db.select({
      id: users.id,
      name: users.name,
      qrCode: users.qrCode,
      qrPublic: users.qrPublic,
    }).from(users).where(eq(users.id, ctx.user.id)).limit(1);

    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "사용자를 찾을 수 없습니다." });

    // qrCode가 없는 기존 사용자: 자동 생성
    if (!user.qrCode) {
      const newQrCode = randomUUID();
      await db.update(users).set({ qrCode: newQrCode }).where(eq(users.id, ctx.user.id));
      user.qrCode = newQrCode;
    }

    return {
      qrCode: user.qrCode,
      qrPublic: user.qrPublic ?? 1,
    };
  }),

  /**
   * QR 코드로 공개 프로필 조회 (누구나 접근 가능)
   * - 이름, 주소, 가입 확인 여부만 반환 (민감 정보 제외)
   */
  getPublicProfile: publicProcedure
    .input(z.object({ qrCode: z.string().uuid() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      const [user] = await db.select({
        name: users.name,
        country: users.country,
        address: users.address,
        qrPublic: users.qrPublic,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.qrCode, input.qrCode)).limit(1);

      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "유효하지 않은 QR 코드입니다." });

      // 비공개 설정 시 이름만 반환
      if (!user.qrPublic) {
        return {
          found: true,
          isPublic: false,
          name: user.name ? user.name.charAt(0) + "**" : "회원",
          country: null,
          address: null,
          memberSince: null,
        };
      }

      // 이름 마스킹 (홍길동 → 홍*동)
      const maskedName = user.name
        ? user.name.length >= 3
          ? user.name.charAt(0) + "*".repeat(user.name.length - 2) + user.name.charAt(user.name.length - 1)
          : user.name.charAt(0) + "*"
        : "회원";

      // 주소 마스킹 (앞 10자만 표시)
      const maskedAddress = user.address
        ? user.address.substring(0, 15) + (user.address.length > 15 ? "..." : "")
        : null;

      return {
        found: true,
        isPublic: true,
        name: maskedName,
        country: user.country,
        address: maskedAddress,
        memberSince: user.createdAt
          ? new Date(user.createdAt).getFullYear() + "년"
          : null,
      };
    }),

  /**
   * QR 공개 여부 토글 (로그인 필요)
   */
  updateQrPublic: protectedProcedure
    .input(z.object({ isPublic: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });

      await db.update(users)
        .set({ qrPublic: input.isPublic ? 1 : 0 })
        .where(eq(users.id, ctx.user.id));

      return { success: true };
    }),
});
