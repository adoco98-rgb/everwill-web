import { describe, expect, it } from "vitest";
import type { User } from "../drizzle/schema";
import { toAuthUser } from "./_core/authUser";
import { createOAuthState, verifyOAuthState } from "./_core/oauthState";

describe("auth security", () => {
  it("OAuth state는 예측 불가능하며 정확히 일치해야 한다", () => {
    const first = createOAuthState();
    const second = createOAuthState();
    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(verifyOAuthState(first, first)).toBe(true);
    expect(verifyOAuthState(first, second)).toBe(false);
    expect(verifyOAuthState(first, undefined)).toBe(false);
  });

  it("auth.me 응답에서 인증 비밀과 법적 식별정보를 제외한다", () => {
    const user = {
      id: 1,
      openId: "email:test@example.com",
      name: "Test",
      email: "test@example.com",
      loginMethod: "email_password",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      passwordHash: "secret-hash",
      residentNumberEnc: "encrypted-id",
      adminNote: "internal",
    } as User;
    const result = toAuthUser(user) as Record<string, unknown>;
    expect(result.email).toBe("test@example.com");
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("residentNumberEnc");
    expect(result).not.toHaveProperty("adminNote");
    expect(result).not.toHaveProperty("openId");
  });
});
