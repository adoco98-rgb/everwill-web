/**
 * 이메일 OTP 인증 라우터
 * 이메일 입력 → 6자리 코드 발송 → 코드 검증 → 세션 생성
 */
import { TRPCError } from "@trpc/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { Resend } from "resend";
import { z } from "zod";
import { emailOtps, users } from "../../drizzle/schema";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { getSessionCookieOptions } from "../_core/cookies";
import { sdk } from "../_core/sdk";
import { publicProcedure, router } from "../_core/trpc";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** 6자리 숫자 OTP 생성 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** OTP 만료 시간: 10분 */
const OTP_EXPIRES_MS = 10 * 60 * 1000;

export const emailAuthRouter = router({
  /**
   * 이메일로 OTP 발송
   * - 이미 가입된 이메일: 로그인 코드 발송
   * - 신규 이메일: 회원가입 코드 발송
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
      });

      // 이메일 발송
      if (!ENV.resendApiKey) {
        // 개발 환경: 콘솔에 출력
        console.log(`[EmailAuth] OTP for ${input.email}: ${code}`);
      } else {
        const resend = new Resend(ENV.resendApiKey);
        const { error } = await resend.emails.send({
          from: "EverWill <noreply@everwill.co.kr>",
          to: [input.email],
          subject: `[EverWill] 인증 코드: ${code}`,
          html: `
            <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #FAFAF8;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="display: inline-flex; align-items: center; gap: 8px; background: #1F3864; padding: 10px 20px; border-radius: 12px;">
                  <span style="color: #C9A961; font-weight: bold; font-size: 18px;">EverWill</span>
                </div>
              </div>
              <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 16px rgba(0,0,0,0.06);">
                <h2 style="color: #1F3864; font-size: 20px; font-weight: bold; margin: 0 0 8px;">이메일 인증 코드</h2>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px;">아래 6자리 코드를 입력해 주세요. 코드는 10분 후 만료됩니다.</p>
                <div style="background: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1F3864;">${code}</span>
                </div>
                <p style="color: #9CA3AF; font-size: 12px; margin: 0;">본인이 요청하지 않은 경우 이 이메일을 무시하세요.</p>
              </div>
              <p style="text-align: center; color: #9CA3AF; font-size: 11px; margin-top: 24px;">© 2025 EverWill · 주식회사 사람</p>
            </div>
          `,
        });
        if (error) {
          console.error("[EmailAuth] Resend error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요." });
        }
      }

      return { success: true, email: input.email };
    }),

  /**
   * OTP 코드 검증 및 세션 생성
   * - 코드 일치 + 미만료 → 사용자 upsert → JWT 세션 쿠키 설정
   * - 5회 실패 시 해당 OTP 잠금
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

      // 해당 이메일의 최신 미사용 OTP 조회 (만료 여부 포함)
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

      // 5회 실패 잠금 확인
      if (latestOtp.failCount >= 5) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "인증 시도 횟수를 초과했습니다. 새 인증 코드를 요청해주세요.",
        });
      }

      // 코드 일치 확인
      if (latestOtp.code !== input.code) {
        // 실패 횟수 증가
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

      // 코드 일치 확인 (유효한 OTP)
      const otpRows = [latestOtp];

      // OTP 사용 처리
      await db.update(emailOtps).set({ used: 1 }).where(eq(emailOtps.id, otpRows[0].id));

      // openId: 이메일 기반 고유 식별자 (email: 접두사)
      const openId = `email:${input.email}`;

      // 사용자 이름: 이메일 @ 앞부분
      const name = input.email.split("@")[0];

      // 기존 사용자 조회 또는 신규 생성
      const existingUsers = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      const isNewUser = existingUsers.length === 0;

      await db.insert(users).values({
        openId,
        email: input.email,
        name,
        loginMethod: "email",
        lastSignedIn: new Date(),
      }).onDuplicateKeyUpdate({
        set: { lastSignedIn: new Date() },
      });

      // JWT 세션 토큰 생성
      const token = await sdk.createSessionToken(openId, { name });

      // 세션 쿠키 설정
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, isNewUser };
    }),

  /**
   * 회원가입 후 추가 정보 저장
   * - 이름, 전화번호, 생년월일, 거주 국가 + 국가별 추가 필드
   */
  updateProfile: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().min(1, "이름을 입력해주세요").max(50),
      phone: z.string().optional(),
      birthDate: z.string().optional(),
      country: z.string().min(2).max(3).default("KR"),
      // 국가별 추가 필드
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
