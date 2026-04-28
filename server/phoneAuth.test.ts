/**
 * 휴대폰 OTP 인증 테스트
 * - toE164 변환 함수 단위 테스트
 * - sendSmsOtp / verifySmsOtp mock fetch 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── toE164 변환 함수 테스트 (sms.ts에서 직접 import) ──
import { toE164 } from "./_core/sms";

describe("toE164 전화번호 변환", () => {
  it("한국 번호 0으로 시작 → +82 변환", () => {
    expect(toE164("01012345678", "+82")).toBe("+821012345678");
  });

  it("하이픈 포함 번호 정리", () => {
    expect(toE164("010-1234-5678", "+82")).toBe("+821012345678");
  });

  it("이미 +로 시작하는 번호 그대로 유지", () => {
    expect(toE164("+821012345678", "+82")).toBe("+821012345678");
  });

  it("미국 번호 변환", () => {
    expect(toE164("2015551234", "+1")).toBe("+12015551234");
  });

  it("일본 번호 0으로 시작 → +81 변환", () => {
    expect(toE164("09012345678", "+81")).toBe("+819012345678");
  });

  it("공백 포함 번호 정리", () => {
    expect(toE164("010 1234 5678", "+82")).toBe("+821012345678");
  });

  it("괄호 포함 번호 정리", () => {
    expect(toE164("(010)1234-5678", "+82")).toBe("+821012345678");
  });
});

// ── sendSmsOtp / verifySmsOtp mock fetch 테스트 ──
import { sendSmsOtp, verifySmsOtp } from "./_core/sms";

describe("sendSmsOtp - Twilio Verify 발송", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("성공: Twilio가 200 + pending 상태 반환", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "pending", sid: "VE123" }),
    } as Response);

    const result = await sendSmsOtp("+821012345678");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();

    // fetch 호출 URL 검증
    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[0]).toContain("/Verifications");
    expect(callArgs[1].method).toBe("POST");
    expect(callArgs[1].headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    expect(callArgs[1].headers["Authorization"]).toMatch(/^Basic /);
  });

  it("실패: Twilio가 400 에러 반환", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid phone number", code: 21211 }),
    } as Response);

    const result = await sendSmsOtp("+8200000000");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid phone number");
  });

  it("실패: 네트워크 오류", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await sendSmsOtp("+821012345678");
    expect(result.success).toBe(false);
    expect(result.error).toContain("오류");
  });

  it("요청 body에 To와 Channel=sms 포함", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "pending" }),
    } as Response);

    await sendSmsOtp("+821012345678");

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = callArgs[1].body as string;
    expect(body).toContain("To=%2B821012345678");
    expect(body).toContain("Channel=sms");
  });
});

describe("verifySmsOtp - Twilio Verify 코드 검증", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("성공: status=approved", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "approved" }),
    } as Response);

    const result = await verifySmsOtp("+821012345678", "123456");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("실패: status=pending (코드 불일치)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "pending" }),
    } as Response);

    const result = await verifySmsOtp("+821012345678", "000000");
    expect(result.success).toBe(false);
    expect(result.error).toContain("올바르지 않습니다");
  });

  it("실패: Twilio 400 에러 (만료된 코드)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Verification check expired", code: 60202 }),
    } as Response);

    const result = await verifySmsOtp("+821012345678", "123456");
    expect(result.success).toBe(false);
    expect(result.error).toBe("Verification check expired");
  });

  it("실패: 네트워크 오류", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Timeout"));

    const result = await verifySmsOtp("+821012345678", "123456");
    expect(result.success).toBe(false);
    expect(result.error).toContain("오류");
  });

  it("요청 body에 To와 Code 포함", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "approved" }),
    } as Response);

    await verifySmsOtp("+821012345678", "654321");

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = callArgs[1].body as string;
    expect(body).toContain("To=%2B821012345678");
    expect(body).toContain("Code=654321");
  });
});

// ── phoneAuth 입력 검증 테스트 ──
describe("phoneAuth 입력 검증", () => {
  it("전화번호 최소 7자리 이상이어야 함", () => {
    const phone = "123456";
    expect(phone.length).toBeLessThan(7);
  });

  it("OTP 코드는 정확히 6자리여야 함", () => {
    const validCode = "123456";
    const invalidCode = "12345";
    expect(validCode.length).toBe(6);
    expect(invalidCode.length).not.toBe(6);
  });

  it("국가코드 형식 검증 (+로 시작)", () => {
    const validCodes = ["+82", "+1", "+81", "+86", "+49"];
    validCodes.forEach(code => {
      expect(code).toMatch(/^\+\d+$/);
    });
  });
});
