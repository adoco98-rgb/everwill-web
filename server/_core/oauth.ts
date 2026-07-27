import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { Resend } from "resend";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // 관리자 이메일 확인: wadokdo@hanmail.net은 자동으로 admin 역할 부여
      const ADMIN_EMAILS = ["wadokdo@hanmail.net"];
      const isAdmin = userInfo.email && ADMIN_EMAILS.includes(userInfo.email);

      // 신규 사용자 여부 확인 (환영 이메일 발송용)
      const existingUser = await db.getUserByOpenId(userInfo.openId);
      const isNewUser = !existingUser;

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
        ...(isAdmin ? { role: "admin" } : {}),
      });

      // 신규 사용자 환영 이메일 발송
      if (isNewUser && userInfo.email && ENV.resendApiKey) {
        const resend = new Resend(ENV.resendApiKey);
        const userName = userInfo.name || "회원";
        try {
          await resend.emails.send({
            from: "EverWill <noreply@everwill.co.kr>",
            to: userInfo.email,
            subject: "[EverWill] 에버윌에 오신 것을 환영합니다 🌿",
            html: `
              <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 560px; margin: 0 auto; background: #fff;">
                <div style="background: #1F3864; padding: 32px 40px; text-align: center;">
                  <h1 style="color: #C9A961; font-size: 28px; margin: 0; letter-spacing: 2px;">EverWill</h1>
                  <p style="color: #fff; font-size: 13px; margin: 6px 0 0; opacity: 0.8;">세계 최초 디지털 유언 OS</p>
                </div>
                <div style="padding: 40px;">
                  <h2 style="color: #1F3864; font-size: 22px; margin: 0 0 12px;">${userName}님, 환영합니다! 🌿</h2>
                  <p style="color: #555; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">에버윌 회원가입을 축하드립니다.<br>유언장 작성부터 사후 집행까지, 에버윌이 여러분의 마지막 서명을 지켜드립니다.</p>
                  <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <p style="color: #1F3864; font-size: 15px; font-weight: bold; margin: 0 0 12px;">에버윌으로 할 수 있는 것</p>
                    <ul style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>✅ AI 유언장 작성 (무료)</li>
                      <li>✅ 상속인 직접 등록</li>
                      <li>✅ 자산 목록 관리</li>
                      <li>✅ 전자 인증 및 블록체인 저장</li>
                      <li>✅ 영상 유언장 녹화</li>
                    </ul>
                  </div>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="https://everwill.co.kr/write" style="display: inline-block; background: #C9A961; color: #1F3864; padding: 14px 36px; border-radius: 50px; font-size: 16px; font-weight: bold; text-decoration: none;">유언장 작성 시작하기</a>
                  </div>
                  <div style="border-left: 3px solid #C9A961; padding-left: 16px;">
                    <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0;">문의사항이 있으시면 <a href="https://everwill.co.kr" style="color: #1F3864;">고객센터</a>로 연락해 주세요.</p>
                  </div>
                </div>
                <div style="background: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
                  <p style="color: #999; font-size: 12px; margin: 0;">© 2026 EverWill (주식회사 사람) | <a href="https://everwill.co.kr/privacy" style="color: #999;">개인정보처리방침</a></p>
                </div>
              </div>
            `,
          });
          console.log(`[OAuth] 환영 이메일 발송 완료: ${userInfo.email}`);
        } catch (emailErr) {
          console.error("[OAuth] 환영 이메일 발송 실패:", emailErr);
        }
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
