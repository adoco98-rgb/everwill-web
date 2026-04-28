/**
 * 휴대폰 OTP 인증 라우터 (Twilio Verify)
 * 휴대폰 번호 입력 → SMS OTP 발송 → 코드 검증 → 세션 생성
 */
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { publicProcedure, router } from "../_core/trpc";
import { sendSmsOtp, verifySmsOtp, toE164 } from "../_core/sms";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const phoneAuthRouter = router({
  /**
   * 휴대폰 번호로 OTP SMS 발송
   * Twilio Verify가 OTP 생성 및 발송을 처리
   */
  sendOtp: publicProcedure
    .input(z.object({
      phone: z.string().min(7, "올바른 전화번호를 입력해주세요").max(20),
      countryCode: z.string().default("+82"), // 예: +82, +1, +81
    }))
    .mutation(async ({ input }) => {
      // E.164 형식으로 변환 (예: +821012345678)
      const e164Phone = toE164(input.phone, input.countryCode);

      const result = await sendSmsOtp(e164Phone);
      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.error ?? "SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
        });
      }

      return { success: true, phone: e164Phone };
    }),

  /**
   * OTP 코드 검증 및 세션 생성
   * Twilio Verify가 코드 검증 처리
   */
  verifyOtp: publicProcedure
    .input(z.object({
      phone: z.string().min(7).max(20),
      countryCode: z.string().default("+82"),
      code: z.string().length(6, "6자리 코드를 입력해주세요"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const e164Phone = toE164(input.phone, input.countryCode);

      // Twilio Verify로 코드 검증
      const result = await verifySmsOtp(e164Phone, input.code);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error ?? "인증 코드가 올바르지 않습니다.",
        });
      }

      // openId: 전화번호 기반 고유 식별자
      const openId = `phone:${e164Phone}`;

      // 기존 사용자 조회 또는 신규 생성
      const existingUsers = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      const isNewUser = existingUsers.length === 0;

      await db.insert(users).values({
        openId,
        phone: e164Phone,
        name: e164Phone, // 임시 이름 (프로필 입력 단계에서 업데이트)
        loginMethod: "phone",
        lastSignedIn: new Date(),
      }).onDuplicateKeyUpdate({
        set: { lastSignedIn: new Date() },
      });

      // JWT 세션 토큰 생성
      const token = await sdk.createSessionToken(openId, { name: e164Phone });

      // 세션 쿠키 설정
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, isNewUser, phone: e164Phone };
    }),

  /**
   * 회원가입 후 추가 정보 저장 (전화번호 기반 가입자)
   */
  updateProfile: publicProcedure
    .input(z.object({
      phone: z.string().min(7).max(20), // E.164 형식
      name: z.string().min(1, "이름을 입력해주세요").max(50),
      email: z.string().email().optional(),
      birthDate: z.string().optional(),
      country: z.string().min(2).max(3).default("KR"),
      address: z.string().optional(),
      zipCode: z.string().optional(),
      stateProvince: z.string().optional(),
      nationality: z.string().optional(),
      furigana: z.string().optional(),
      religion: z.string().optional(),
      occupation: z.string().optional(),
      assetScale: z.string().optional(),
      agreeTerms: z.number().optional(),
      agreePrivacy: z.number().optional(),
      agreeMarketing: z.number().optional(),
      agreeGdpr: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const openId = `phone:${input.phone}`;
      await db.update(users)
        .set({
          name: input.name,
          email: input.email || null,
          birthDate: input.birthDate || null,
          country: input.country,
          address: input.address || null,
          zipCode: input.zipCode || null,
          stateProvince: input.stateProvince || null,
          nationality: input.nationality || null,
          furigana: input.furigana || null,
          religion: input.religion || null,
          occupation: input.occupation || null,
          assetScale: input.assetScale || null,
          agreeTerms: input.agreeTerms ?? 0,
          agreePrivacy: input.agreePrivacy ?? 0,
          agreeMarketing: input.agreeMarketing ?? 0,
          agreeGdpr: input.agreeGdpr ?? 0,
          profileCompleted: 1,
          updatedAt: new Date(),
        })
        .where(eq(users.openId, openId));
      return { success: true };
    }),
});
