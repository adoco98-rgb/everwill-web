/**
 * 이메일 인증 라우터
 * 1) 기존 OTP 방식: 이메일 → 6자리 코드 발송 → 코드 검증 → 세션 생성
 * 2) 신규 비밀번호 방식: 이메일+비밀번호 → SMS OTP 2차 인증 → 세션 생성
 */
import { TRPCError } from "@trpc/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { Resend } from "resend";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { emailOtps, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { randomUUID } from "crypto";
import { sendSmsOtp, verifySmsOtp } from "../_core/sms";

/** 6자리 숫자 OTP 생성 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** OTP 만료 시간: 10분 */
const OTP_EXPIRES_MS = 10 * 60 * 1000;

export const emailAuthRouter = router({
  /**
   * 이메일로 OTP 발송 (기존 방식 유지)
   */
  sendOtp: publicProcedure
    .input(z.object({ email: z.string().email("올바른 이메일 주소를 입력해주세요") }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRES_MS);
      // 기존 미사용 OTP 무효화 (같은 이메일)
      await db.update(emailOtps)
        .set({ used: 1 })
        .where(and(eq(emailOtps.email, input.email), eq(emailOtps.used, 0)));
      // 새 OTP 저장
      await db.insert(emailOtps).values({
        email: input.email,
        code,
        expiresAt,
        used: 0,
        failCount: 0,
      });
      // Resend로 이메일 발송
      const resend = new Resend(ENV.resendApiKey);
      try {
        await resend.emails.send({
          from: "EverWill <noreply@everwill.co.kr>",
          to: input.email,
          subject: "[EverWill] 이메일 인증 코드",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
              <h2 style="color: #1F3864;">EverWill 인증 코드</h2>
              <p style="font-size: 16px; color: #333;">아래 6자리 코드를 입력해주세요.</p>
              <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #1F3864;">${code}</span>
              </div>
              <p style="font-size: 14px; color: #888;">이 코드는 10분간 유효합니다.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[Email] OTP 발송 실패:", err);
      }
      return { success: true, email: input.email };
    }),

  /**
   * OTP 코드 검증 및 세션 생성 (기존 방식 유지)
   */
  verifyOtp: publicProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string().length(6, "6자리 코드를 입력해주세요"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });
      const now = new Date();
      const latestOtpRows = await db.select().from(emailOtps).where(
        and(
          eq(emailOtps.email, input.email),
          eq(emailOtps.used, 0),
          gt(emailOtps.expiresAt, now),
        )
      ).limit(1);
      if (latestOtpRows.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "인증 코드가 만료되었습니다. 새 코드를 요청해주세요." });
      }
      const latestOtp = latestOtpRows[0];
      if (latestOtp.failCount >= 5) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "인증 시도 횟수를 초과했습니다. 새 인증 코드를 요청해주세요.",
        });
      }
      if (latestOtp.code !== input.code) {
        await db.update(emailOtps)
          .set({ failCount: sql`${emailOtps.failCount} + 1` })
          .where(eq(emailOtps.id, latestOtp.id));
        const remaining = 5 - (latestOtp.failCount + 1);
        if (remaining <= 0) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "인증 시도 횟수를 초과했습니다. 새 인증 코드를 요청해주세요.",
          });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `인증 코드가 올바르지 않습니다. (남은 시도: ${remaining}회)`,
        });
      }
      await db.update(emailOtps).set({ used: 1 }).where(eq(emailOtps.id, latestOtp.id));
      const openId = `email:${input.email}`;
      const name = input.email.split("@")[0];
      const newQrCode = randomUUID();
      // isNewUser 판단: insert 전에 존재 여부 먼저 확인 (insert 후 select 시 항상 false 반환되는 버그 수정)
      const existingUsers = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      const isNewUser = existingUsers.length === 0;
      await db.insert(users).values({
        openId,
        email: input.email,
        name,
        loginMethod: "email",
        lastSignedIn: new Date(),
        qrCode: newQrCode,
      }).onDuplicateKeyUpdate({
        set: { lastSignedIn: new Date() },
      });
      const token = await sdk.createSessionToken(openId, { name });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });
      return { success: true, isNewUser };
    }),

  /**
   * [신규] 이메일+비밀번호 회원가입
   * - 이메일, 비밀번호, 전화번호 필수
   * - 비밀번호는 bcrypt 해시 후 저장
   */
  register: publicProcedure
    .input(z.object({
      email: z.string().email("올바른 이메일 주소를 입력해주세요"),
      password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(100),
      name: z.string().min(1, "이름을 입력해주세요").max(50),
      phone: z.string().min(7, "전화번호를 입력해주세요").max(20).optional().or(z.literal("")),
      country: z.string().min(2).max(3).default("KR"),
      address: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const openId = `email:${input.email}`;

      // 이미 가입된 이메일 확인
      const existing = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      if (existing.length > 0) {
        throw new TRPCError({ code: "CONFLICT", message: "이미 가입된 이메일입니다." });
      }

      // 비밀번호 해시
      const passwordHash = await bcrypt.hash(input.password, 12);
      const newQrCode = randomUUID();

      await db.insert(users).values({
        openId,
        email: input.email,
        name: input.name,
        phone: input.phone || null,
        country: input.country,
        address: input.address || null,
        loginMethod: "email_password",
        passwordHash,
        lastSignedIn: new Date(),
        qrCode: newQrCode,
        profileCompleted: 1,
      });

      return { success: true };
    }),

  /**
   * [신규] 로그인 1단계: 이메일+비밀번호 검증 → 등록된 전화번호로 SMS OTP 발송
   */
  loginStep1: publicProcedure
    .input(z.object({
      email: z.string().email("올바른 이메일 주소를 입력해주세요"),
      password: z.string().min(1, "비밀번호를 입력해주세요"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const openId = `email:${input.email}`;
      const userRows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

      if (userRows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      }

      const user = userRows[0];

      // 비밀번호 방식 가입자인지 확인
      if (!user.passwordHash) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "이 계정은 인증코드 방식으로 가입되었습니다. 이메일 인증코드로 로그인해주세요.",
        });
      }

      // 비밀번호 검증
      const isValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "이메일 또는 비밀번호가 올바르지 않습니다." });
      }

      // 관리자는 OTP 없이 즉시 세션 발급
      if (user.role === "admin") {
        await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));
        const token = await sdk.createSessionToken(openId, { name: user.name ?? "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });
        return { success: true, isAdmin: true, otpChannel: null as null, maskedContact: null as null };
      }
      // 일반 회원: 전화번호 있으면 SMS, 없으면 이메일 OTP 발송
      if (user.phone) {
        let phoneE164 = user.phone;
        if (!phoneE164.startsWith("+")) {
          phoneE164 = "+82" + phoneE164.replace(/^0/, "");
        }
        const smsResult = await sendSmsOtp(phoneE164);
        if (smsResult.success) {
          const maskedPhone = phoneE164.replace(/(\+\d{2,3})(\d+)(\d{4})$/, (_: string, cc: string, mid: string, last: string) => {
            return `${cc}${"*".repeat(mid.length)}${last}`;
          });
          return { success: true, isAdmin: false, otpChannel: "sms" as const, maskedContact: maskedPhone };
        }
      }
      // 전화번호 없거나 SMS 실패 → 이메일 OTP 발송
      const loginCode = generateOtp();
      const loginExpiresAt = new Date(Date.now() + OTP_EXPIRES_MS);
      await db.update(emailOtps).set({ used: 1 }).where(and(eq(emailOtps.email, input.email), eq(emailOtps.used, 0)));
      await db.insert(emailOtps).values({ email: input.email, code: loginCode, expiresAt: loginExpiresAt, used: 0, failCount: 0 });
      const resend = new Resend(ENV.resendApiKey);
      try {
        await resend.emails.send({
          from: "EverWill <noreply@everwill.co.kr>",
          to: input.email,
          subject: "[EverWill] 로그인 인증 코드",
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px"><h2 style="color:#1F3864">EverWill 로그인 인증</h2><p>아래 인증 코드를 입력해주세요:</p><div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#C9A961;padding:16px;background:#f5f5f5;border-radius:8px;text-align:center">${loginCode}</div><p style="color:#666;font-size:14px">10분 내에 입력해주세요.</p></div>`,
        });
      } catch (e) { /* 이메일 발송 실패 무시 */ }
      const maskedEmail = input.email.replace(/(.)(.+)(@.+)/, (_: string, f: string, m: string, d: string) => f + "*".repeat(Math.min(m.length, 4)) + d);
      return { success: true, isAdmin: false, otpChannel: "email" as const, maskedContact: maskedEmail };
    }),

  /**
   * [신규] 로그인 2단계: SMS OTP 검증 → 세션 발급
   */
  loginStep2: publicProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string().length(6, "6자리 코드를 입력해주세요"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const openId = `email:${input.email}`;
      const userRows = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

      if (userRows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      }

      const user = userRows[0];

      // 전화번호 있으면 SMS OTP 검증, 없으면 이메일 OTP 검증
      if (user.phone) {
        let phoneE164 = user.phone;
        if (!phoneE164.startsWith("+")) {
          phoneE164 = "+82" + phoneE164.replace(/^0/, "");
        }
        const verifyResult = await verifySmsOtp(phoneE164, input.code);
        if (!verifyResult.success) {
          // SMS 검증 실패 시 이메일 OTP로 fallback
          const emailOtpRows2 = await db.select().from(emailOtps).where(
            and(eq(emailOtps.email, input.email), eq(emailOtps.used, 0), gt(emailOtps.expiresAt, new Date()))
          ).limit(1);
          if (emailOtpRows2.length === 0 || emailOtpRows2[0].code !== input.code) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: verifyResult.error || "인증 코드가 올바르지 않습니다." });
          }
          await db.update(emailOtps).set({ used: 1 }).where(eq(emailOtps.id, emailOtpRows2[0].id));
        }
      } else {
        // 이메일 OTP 검증
        const emailOtpRows3 = await db.select().from(emailOtps).where(
          and(eq(emailOtps.email, input.email), eq(emailOtps.used, 0), gt(emailOtps.expiresAt, new Date()))
        ).limit(1);
        if (emailOtpRows3.length === 0 || emailOtpRows3[0].code !== input.code) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "인증 코드가 올바르지 않거나 만료되었습니다." });
        }
        await db.update(emailOtps).set({ used: 1 }).where(eq(emailOtps.id, emailOtpRows3[0].id));
      }

      // 마지막 로그인 시간 업데이트
      await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.openId, openId));

      // 세션 발급
      const token = await sdk.createSessionToken(openId, { name: user.name ?? "" });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, isNewUser: false };
    }),

  /**
   * [신규] 비밀번호 설정 (기존 OTP 가입자가 비밀번호 추가 설정 시)
   */
  setPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다").max(100),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const openId = `email:${input.email}`;
      const passwordHash = await bcrypt.hash(input.password, 12);

      await db.update(users)
        .set({ passwordHash, loginMethod: "email_password", updatedAt: new Date() })
        .where(eq(users.openId, openId));

      return { success: true };
    }),

  /**
   * [재인증] 로그인된 사용자 휴대폰으로 SMS OTP 재발송 (결제/인증 단계 재인증용)
   */
  sendReauthOtp: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      }

      const user = userRows[0];

      // 전화번호 확인
      if (!user.phone) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "등록된 휴대폰 번호가 없습니다. 프로필에서 휴대폰 번호를 먼저 등록해주세요.",
        });
      }

      // E.164 형식 변환
      let phoneE164 = user.phone;
      if (!phoneE164.startsWith("+")) {
        phoneE164 = "+82" + phoneE164.replace(/^0/, "");
      }

      // SMS OTP 발송
      const smsResult = await sendSmsOtp(phoneE164);
      if (!smsResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
        });
      }

      // 전화번호 마스킹
      const maskedPhone = phoneE164.replace(/(\+\d{2,3})(\d+)(\d{4})$/, (_, cc, mid, last) => {
        return `${cc}${"*".repeat(mid.length)}${last}`;
      });

      return { success: true, maskedPhone };
    }),

  /**
   * [재인증] SMS OTP 검증 (결제/인증 단계 재인증용)
   */
  verifyReauthOtp: protectedProcedure
    .input(z.object({
      code: z.string().length(6, "6자리 코드를 입력해주세요"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });

      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      }

      const user = userRows[0];

      if (!user.phone) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "등록된 휴대폰 번호가 없습니다." });
      }

      let phoneE164 = user.phone;
      if (!phoneE164.startsWith("+")) {
        phoneE164 = "+82" + phoneE164.replace(/^0/, "");
      }

      // SMS OTP 검증
      const verifyResult = await verifySmsOtp(phoneE164, input.code);
      if (!verifyResult.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: verifyResult.error || "인증 코드가 올바르지 않습니다.",
        });
      }

      return { success: true, verifiedAt: new Date().toISOString() };
    }),
  /**
   * [이메일 재인증] 로그인된 사용자 이메일로 OTP 발송 (결제/인증 단계 이메일 인증용)
   */
  sendReauthEmailOtp: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      }
      const user = userRows[0];
      if (!user.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "등록된 이메일이 없습니다. 프로필에서 이메일을 먼저 등록해주세요.",
        });
      }
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_EXPIRES_MS);
      // 기존 미사용 OTP 무효화
      await db.update(emailOtps)
        .set({ used: 1 })
        .where(and(eq(emailOtps.email, user.email), eq(emailOtps.used, 0)));
      // 새 OTP 저장
      await db.insert(emailOtps).values({
        email: user.email,
        code,
        expiresAt,
        used: 0,
        failCount: 0,
      });
      // Resend로 이메일 발송
      const resend = new Resend(ENV.resendApiKey);
      try {
        await resend.emails.send({
          from: "EverWill <noreply@everwill.co.kr>",
          to: user.email,
          subject: "[EverWill] 유언장 인증 코드",
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fafafa;">
              <div style="background: #1F3864; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h2 style="color: #C9A961; margin: 0; font-size: 22px;">EverWill</h2>
                <p style="color: #fff; margin: 4px 0 0; font-size: 13px;">유언장 인증 코드</p>
              </div>
              <div style="background: #fff; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
                <p style="font-size: 15px; color: #333; margin-top: 0;">안녕하세요, <strong>${user.name || '회원'}</strong>님.</p>
                <p style="font-size: 15px; color: #333;">유언장 인증을 위한 이메일 인증 코드입니다.</p>
                <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #1F3864;">${code}</span>
                </div>
                <p style="font-size: 13px; color: #888;">이 코드는 10분간 유효합니다. 본인이 요청하지 않은 경우 무시해주세요.</p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error("[Email] 재인증 OTP 발송 실패:", err);
      }
      // 이메일 마스킹
      const [localPart, domain] = user.email.split("@");
      const maskedEmail = localPart.slice(0, 2) + "*".repeat(Math.max(0, localPart.length - 2)) + "@" + domain;
      return { success: true, maskedEmail };
    }),
  /**
   * [이메일 재인증] OTP 검증 (결제/인증 단계 이메일 인증용)
   */
  verifyReauthEmailOtp: protectedProcedure
    .input(z.object({
      code: z.string().length(6, "6자리 코드를 입력해주세요"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "데이터베이스 연결 실패" });
      const userRows = await db.select().from(users).where(eq(users.openId, ctx.user.openId)).limit(1);
      if (userRows.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "사용자를 찾을 수 없습니다." });
      }
      const user = userRows[0];
      if (!user.email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "등록된 이메일이 없습니다." });
      }
      const now = new Date();
      const otpRows = await db.select().from(emailOtps).where(
        and(eq(emailOtps.email, user.email), eq(emailOtps.used, 0), gt(emailOtps.expiresAt, now))
      ).orderBy(sql`${emailOtps.createdAt} DESC`).limit(1);
      if (otpRows.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "인증 코드가 만료되었거나 존재하지 않습니다." });
      }
      const otp = otpRows[0];
      if (otp.code !== input.code) {
        await db.update(emailOtps)
          .set({ failCount: sql`${emailOtps.failCount} + 1` })
          .where(eq(emailOtps.id, otp.id));
        throw new TRPCError({ code: "BAD_REQUEST", message: "인증 코드가 올바르지 않습니다." });
      }
      await db.update(emailOtps).set({ used: 1 }).where(eq(emailOtps.id, otp.id));
      return { success: true, verifiedAt: new Date().toISOString() };
    }),
  /**
   * 회원가입 후 추가 정보 저장 (기존 방식 유지)
   */
  updateProfile: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1, "이름을 입력해주세요").max(50),
      phone: z.string().optional(),
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
      const openId = `email:${input.email}`;
      await db.update(users)
        .set({
          name: input.name,
          phone: input.phone || null,
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
