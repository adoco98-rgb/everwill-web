/**
 * emailAuthRouter OTP 로직 단위 테스트
 */
import { describe, it, expect } from "vitest";
import {
  generateEmailOtp,
  hashEmailOtp,
  verifyEmailOtp,
} from "./_core/emailOtp";

describe("emailAuth OTP", () => {
  it("OTP는 6자리 숫자여야 한다", () => {
    for (let i = 0; i < 100; i++) {
      const otp = generateEmailOtp();
      expect(otp).toMatch(/^\d{6}$/);
      expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(otp)).toBeLessThanOrEqual(999999);
    }
  });

  it("OTP는 평문으로 저장하지 않고 목적별로 검증한다", () => {
    const email = "test@example.com";
    const otp = generateEmailOtp();
    const hash = hashEmailOtp(email, "signup", otp);
    expect(hash).not.toBe(otp);
    expect(hash).toHaveLength(64);
    expect(verifyEmailOtp(email, "signup", otp, hash)).toBe(true);
    expect(verifyEmailOtp(email, "login", otp, hash)).toBe(false);
    expect(verifyEmailOtp(email, "signup", "000000", hash)).toBe(false);
  });

  it("이메일 형식 검증", () => {
    const validEmails = ["test@example.com", "user@gmail.com", "jeff@everwill.co.kr"];
    const invalidEmails = ["notanemail", "missing@", "@nodomain.com"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validEmails.forEach(e => expect(emailRegex.test(e)).toBe(true));
    invalidEmails.forEach(e => expect(emailRegex.test(e)).toBe(false));
  });

  it("openId 이메일 기반 생성", () => {
    const email = "test@example.com";
    const openId = `email:${email}`;
    expect(openId).toBe("email:test@example.com");
    expect(openId.startsWith("email:")).toBe(true);
  });
});
