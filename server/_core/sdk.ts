import { COOKIE_NAME, SESSION_MAX_AGE_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  openId: string;
  appId: string;
  name: string;
  sessionId: string;
};

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }

  /**
   * Create a session token for an app user openId.
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const user = await db.getUserByOpenId(openId);
    if (!user) {
      throw ForbiddenError("User not found");
    }
    const expiresInMs = options.expiresInMs ?? SESSION_MAX_AGE_MS;
    const sessionId = randomUUID();
    await db.createAuthSession({
      id: sessionId,
      userId: user.id,
      expiresAt: new Date(Date.now() + expiresInMs),
    });

    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || "",
        sessionId,
      },
      { expiresInMs },
    );
  }

  private async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? SESSION_MAX_AGE_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name,
      sessionId: payload.sessionId,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setIssuer(ENV.appId)
      .setAudience(ENV.appId)
      .setJti(payload.sessionId)
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
        issuer: ENV.appId,
        audience: ENV.appId,
      });
      const { openId, appId, name, sessionId } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        appId !== ENV.appId ||
        typeof name !== "string" ||
        !isNonEmptyString(sessionId)
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        openId,
        appId,
        name,
        sessionId,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Regular authentication flow
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    if (!user) {
      throw ForbiddenError("User not found");
    }

    const isActive = await db.isAuthSessionActive(session.sessionId, user.id);
    if (!isActive) {
      throw ForbiddenError("Session expired or revoked");
    }
    if (user.suspended === 1) {
      await db.revokeAuthSession(session.sessionId);
      throw ForbiddenError("Account suspended");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }

  async revokeRequestSession(req: Request) {
    const cookies = this.parseCookies(req.headers.cookie);
    const session = await this.verifySession(cookies.get(COOKIE_NAME));
    if (session) {
      await db.revokeAuthSession(session.sessionId);
    }
  }

  async createLoginChallenge(identifier: string) {
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      type: "login_challenge",
      identifier,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setIssuer(`${ENV.appId}:login-challenge`)
      .setAudience(ENV.appId)
      .setJti(randomUUID())
      .setExpirationTime("10m")
      .sign(secretKey);
  }

  async verifyLoginChallenge(token: string, identifier: string) {
    try {
      const { payload } = await jwtVerify(token, this.getSessionSecret(), {
        algorithms: ["HS256"],
        issuer: `${ENV.appId}:login-challenge`,
        audience: ENV.appId,
      });
      return (
        payload.type === "login_challenge" &&
        payload.identifier === identifier
      );
    } catch {
      return false;
    }
  }
}

export const sdk = new SDKServer();
