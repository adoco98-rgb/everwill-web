/**
 * 휴대폰 인증 라우터 (Twilio Verify)
 * [기존] OTP 전용: 번호 입력 → SMS OTP → 자동 가입+로그인
 * [신규] 비밀번호 방식: 번호+비밀번호 → SMS OTP → 로그인
 */
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { publicProcedure, router } from "../_core/trpc";
import { sendSmsOtp, verifySmsOtp, toE164 } from "../_core/sms";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { randomUUID } from "crypto";

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

      // 신규 사용자용 QR 코드 생성
      const newQrCode = randomUUID();

      await db.insert(users).values({
        openId,
        phone: e164Phone,
        name: e164Phone, // 임시 이름 (프로필 입력 단계에서 업데이트)
        loginMethod: "phone",
        lastSignedIn: new Date(),
        qrCode: newQrCode,
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
   * [신규] 휴대폰+비밀번호 회원가입
   * 이름 + 휴대폰번호 + 비밀번호 저장 (OTP 인증 없이 즉시 가입)
   */
  register: publicProcedure
    .input(z.object({
      phone: z.string().min(7, "올바른 전화번호를 입력해주세요").max(20),
      countryCode: z.string().default("+82"),
      password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(100),
      name: z.string().min(1, "이름을 입력해주세요").max(50),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const e164Phone = toE164(input.phone, input.countryCode);
      const openId = `phone:${e164Phone}`;

      // 이미 가입된 번호인지 확인
      const existing = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "이미 가입된 휴대폰 번호입니다. 로그인해주세요.",
        });
      }

      const passwordHash = await bcrypt.hash(input.password, 12);
      const newQrCode = randomUUID();

      await db.insert(users).values({
        openId,
        phone: e164Phone,
        name: input.name,
        loginMethod: "phone_password",
        passwordHash,
        lastSignedIn: new Date(),
        qrCode: newQrCode,
      });

      return { success: true };
    }),

  /**
   * [신규] 로그인 1단계: 휴대폰번호 + 비밀번호 검증 → SMS OTP 발송
   */
  loginStep1: publicProcedure
    .input(z.object({
      phone: z.string().min(7, "올바른 전화번호를 입력해주세요").max(20),
      countryCode: z.string().default("+82"),
      password: z.string().min(1, "비밀번호를 입력해주세요"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const e164Phone = toE164(input.phone, input.countryCode);
      const openId = `phone:${e164Phone}`;

      const userRows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "휴대폰 번호 또는 비밀번호가 올바르지 않습니다.",
        });
      }

      const user = userRows[0];

      // 비밀번호 방식 가입자인지 확인
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "이 번호는 OTP 방식으로 가입되었습니다. 아래 'OTP로 로그인' 탭을 이용해주세요.",
        });
      }

      // 비밀번호 검증
      const isValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "휴대폰 번호 또는 비밀번호가 올바르지 않습니다.",
        });
      }

      // SMS OTP 발송
      const smsResult = await sendSmsOtp(e164Phone);
      if (!smsResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
        });
      }

      // 전화번호 마스킹
      const maskedPhone = e164Phone.replace(/(\+\d{2,3})(\d+)(\d{4})$/, (_, cc, mid, last) => {
        return `${cc}${"*".repeat(mid.length)}${last}`;
      });

      return { success: true, maskedPhone, phone: e164Phone };
    }),

  /**
   * [신규] 로그인 2단계: SMS OTP 검증 → 세션 발급 (비밀번호 방식)
   */
  loginStep2: publicProcedure
    .input(z.object({
      phone: z.string().min(7).max(20), // E.164 형식
      code: z.string().length(6, "6자리 코드를 입력해주세요"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      // Twilio Verify로 코드 검증
      const result = await verifySmsOtp(input.phone, input.code);
      if (!result.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: result.error ?? "인증 코드가 올바르지 않습니다.",
        });
      }

      const openId = `phone:${input.phone}`;
      const userRows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      }

      const user = userRows[0];

      // 마지막 로그인 시간 업데이트
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));

      // JWT 세션 토큰 생성
      const token = await sdk.createSessionToken(openId, { name: user.name ?? input.phone });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true };
    }),

  /**
   * [기존] 회원가입 후 추가 정보 저장 (전화번호 기반 가입자)
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
