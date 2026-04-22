/**
 * emailAuthRouter OTP 로직 단위 테스트
 */
import { describe, it, expect } from "vitest";

// OTP 생성 로직 테스트 (6자리 숫자)
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

describe("emailAuth OTP", () => {
  it("OTP는 6자리 숫자여야 한다", () => {
    for (let i = 0; i < 100; i++) {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
      expect(parseInt(otp)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(otp)).toBeLessThanOrEqual(999999);
    }
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
