/**
 * 소셜 간편 로그인 라우트
 * - Google (전 세계 공통)
 * - Kakao (한국)
 * - Naver (한국)
 * - LINE (일본)
 *
 * 각 플랫폼 콜백 URL (개발자 콘솔에 등록 필요):
 *   https://everwill.co.kr/api/auth/google/callback
 *   https://everwill.co.kr/api/auth/kakao/callback
 *   https://everwill.co.kr/api/auth/naver/callback
 *   https://everwill.co.kr/api/auth/line/callback
 */
import type { Express, Request, Response } from "express";
import axios from "axios";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sdk } from "./_core/sdk";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

// ─── 헬퍼: 항상 https로 redirect_uri 생성 (프록시 환경 대응) ──────
function getBaseUrl(req: Request): string {
  const host = req.get("host") || "";
  // 로컬 개발 환경은 http, 그 외 항상 https
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
  const protocol = isLocal ? "http" : "https";
  return `${protocol}://${host}`;
}

// ─── 환경변수 ─────────────────────────────────────────────────
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "";
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || "";
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "";
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || "";
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || "";
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";

// ─── 헬퍼: 소셜 사용자 DB upsert + 세션 발급 ─────────────────
async function loginSocialUser(
  res: Response,
  req: Request,
  params: {
    openId: string;       // "google:sub" | "kakao:id" | "naver:id" | "line:sub"
    email: string | null;
    name: string | null;
    loginMethod: string;
    profileImage?: string | null;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("DB 연결 실패");

  // 관리자 이메일 자동 승격
  const ADMIN_EMAILS = ["wadokdo@hanmail.net"];
  const isAdmin = params.email && ADMIN_EMAILS.includes(params.email);

  // DB upsert (openId 기준)
  await db
    .insert(users)
    .values({
      openId: params.openId,
      email: params.email,
      name: params.name,
      loginMethod: params.loginMethod,
      role: isAdmin ? "admin" : "user",
      lastSignedIn: new Date(),
    })
    .onDuplicateKeyUpdate({
      set: {
        email: params.email ?? undefined,
        name: params.name ?? undefined,
        loginMethod: params.loginMethod,
        lastSignedIn: new Date(),
        ...(isAdmin ? { role: "admin" } : {}),
      },
    });

  // 세션 토큰 발급
  const sessionToken = await sdk.createSessionToken(params.openId, {
    name: params.name || "",
    expiresInMs: ONE_YEAR_MS,
  });

  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

  // 가입 후 대시보드로 이동
  res.redirect(302, "/dashboard");
}

// ─── 오류 응답 헬퍼 ──────────────────────────────────────────
function redirectError(res: Response, provider: string, msg: string) {
  console.error(`[SocialAuth][${provider}]`, msg);
  res.redirect(302, `/login?error=${encodeURIComponent(`${provider} 로그인 실패: ${msg}`)}`);
}

// ─── Google OAuth 2.0 ────────────────────────────────────────
function registerGoogleRoutes(app: Express) {
  const GOOGLE_SCOPE = "openid email profile";

  // Step 1: Google 인증 페이지로 리다이렉트
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!GOOGLE_CLIENT_ID) {
      return redirectError(res, "Google", "GOOGLE_CLIENT_ID 미설정");
    }
    const redirectUri = `${getBaseUrl(req)}/api/auth/google/callback`;
    const state = Buffer.from(redirectUri).toString("base64");
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", GOOGLE_SCOPE);
    url.searchParams.set("state", state);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "select_account");
    res.redirect(302, url.toString());
  });

  // Step 2: Google 콜백 처리
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) return redirectError(res, "Google", "code 없음");

    try {
      const redirectUri = `${getBaseUrl(req)}/api/auth/google/callback`;

      // 액세스 토큰 교환
      const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      const { access_token } = tokenRes.data;

      // 사용자 정보 조회
      const userRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const { sub, email, name, picture } = userRes.data;

      await loginSocialUser(res, req, {
        openId: `google:${sub}`,
        email: email || null,
        name: name || null,
        loginMethod: "google",
        profileImage: picture || null,
      });
    } catch (err: any) {
      redirectError(res, "Google", err.message || "알 수 없는 오류");
    }
  });
}

// ─── Kakao OAuth ─────────────────────────────────────────────
function registerKakaoRoutes(app: Express) {
  app.get("/api/auth/kakao", (req: Request, res: Response) => {
    if (!KAKAO_CLIENT_ID) {
      return redirectError(res, "Kakao", "KAKAO_CLIENT_ID 미설정");
    }
    const redirectUri = `${getBaseUrl(req)}/api/auth/kakao/callback`;
    const url = new URL("https://kauth.kakao.com/oauth/authorize");
    url.searchParams.set("client_id", KAKAO_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "profile_nickname,account_email");
    res.redirect(302, url.toString());
  });

  app.get("/api/auth/kakao/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) return redirectError(res, "Kakao", "code 없음");

    try {
      const redirectUri = `${getBaseUrl(req)}/api/auth/kakao/callback`;

      // 액세스 토큰 교환
      const tokenRes = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: redirectUri,
          code,
          ...(KAKAO_CLIENT_SECRET ? { client_secret: KAKAO_CLIENT_SECRET } : {}),
        } as Record<string, string>),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const { access_token } = tokenRes.data;

      // 사용자 정보 조회
      const userRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const { id, kakao_account } = userRes.data;
      const email = kakao_account?.email || null;
      const name = kakao_account?.profile?.nickname || null;

      await loginSocialUser(res, req, {
        openId: `kakao:${id}`,
        email,
        name,
        loginMethod: "kakao",
      });
    } catch (err: any) {
      redirectError(res, "Kakao", err.message || "알 수 없는 오류");
    }
  });
}

// ─── Naver OAuth ─────────────────────────────────────────────
function registerNaverRoutes(app: Express) {
  app.get("/api/auth/naver", (req: Request, res: Response) => {
    if (!NAVER_CLIENT_ID) {
      return redirectError(res, "Naver", "NAVER_CLIENT_ID 미설정");
    }
    const redirectUri = `${getBaseUrl(req)}/api/auth/naver/callback`;
    const state = Math.random().toString(36).substring(2);
    const url = new URL("https://nid.naver.com/oauth2.0/authorize");
    url.searchParams.set("client_id", NAVER_CLIENT_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("state", state);
    res.redirect(302, url.toString());
  });

  app.get("/api/auth/naver/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) return redirectError(res, "Naver", "code 없음");

    try {
      const redirectUri = `${getBaseUrl(req)}/api/auth/naver/callback`;

      // 액세스 토큰 교환
      const tokenRes = await axios.get("https://nid.naver.com/oauth2.0/token", {
        params: {
          grant_type: "authorization_code",
          client_id: NAVER_CLIENT_ID,
          client_secret: NAVER_CLIENT_SECRET,
          redirect_uri: redirectUri,
          code,
          state: req.query.state,
        },
      });
      const { access_token } = tokenRes.data;

      // 사용자 정보 조회
      const userRes = await axios.get("https://openapi.naver.com/v1/nid/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const { id, email, name } = userRes.data.response;

      await loginSocialUser(res, req, {
        openId: `naver:${id}`,
        email: email || null,
        name: name || null,
        loginMethod: "naver",
      });
    } catch (err: any) {
      redirectError(res, "Naver", err.message || "알 수 없는 오류");
    }
  });
}

// ─── LINE OAuth ──────────────────────────────────────────────
function registerLineRoutes(app: Express) {
  app.get("/api/auth/line", (req: Request, res: Response) => {
    if (!LINE_CHANNEL_ID) {
      return redirectError(res, "LINE", "LINE_CHANNEL_ID 미설정");
    }
    const redirectUri = `${getBaseUrl(req)}/api/auth/line/callback`;
    const state = Math.random().toString(36).substring(2);
    const url = new URL("https://access.line.me/oauth2/v2.1/authorize");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", LINE_CHANNEL_ID);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", "profile openid email");
    res.redirect(302, url.toString());
  });

  app.get("/api/auth/line/callback", async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) return redirectError(res, "LINE", "code 없음");

    try {
      const redirectUri = `${getBaseUrl(req)}/api/auth/line/callback`;

      // 액세스 토큰 교환
      const tokenRes = await axios.post(
        "https://api.line.me/oauth2/v2.1/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: LINE_CHANNEL_ID,
          client_secret: LINE_CHANNEL_SECRET,
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const { access_token } = tokenRes.data;

      // 사용자 프로필 조회
      const profileRes = await axios.get("https://api.line.me/v2/profile", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const { userId, displayName, pictureUrl } = profileRes.data;

      // LINE은 이메일을 별도 scope 필요 (id_token에서 추출)
      let email: string | null = null;
      try {
        const idTokenRes = await axios.post(
          "https://api.line.me/oauth2/v2.1/verify",
          new URLSearchParams({
            id_token: tokenRes.data.id_token || "",
            client_id: LINE_CHANNEL_ID,
          }),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        email = idTokenRes.data.email || null;
      } catch {
        // 이메일 없어도 로그인 허용
      }

      await loginSocialUser(res, req, {
        openId: `line:${userId}`,
        email,
        name: displayName || null,
        loginMethod: "line",
        profileImage: pictureUrl || null,
      });
    } catch (err: any) {
      redirectError(res, "LINE", err.message || "알 수 없는 오류");
    }
  });
}

// ─── 전체 소셜 라우트 등록 ────────────────────────────────────
export function registerSocialAuthRoutes(app: Express) {
  registerGoogleRoutes(app);
  registerKakaoRoutes(app);
  registerNaverRoutes(app);
  registerLineRoutes(app);
}
