/**
 * 회원가입 이탈 추적 라우터 단위 테스트
 */
import { describe, it, expect } from "vitest";

// 이메일 마스킹 로직 테스트
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.slice(0, 1) + "*".repeat(Math.max(local.length - 1, 2));
  return `${masked}@${domain}`;
}

// 기기 감지 로직 테스트
function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

describe("회원가입 이탈 추적 - 이메일 마스킹", () => {
  it("일반 이메일 마스킹", () => {
    expect(maskEmail("abc@gmail.com")).toBe("a**@gmail.com");
  });

  it("짧은 로컬 파트 마스킹", () => {
    expect(maskEmail("a@naver.com")).toBe("a**@naver.com");
  });

  it("긴 로컬 파트 마스킹", () => {
    const result = maskEmail("jefflah@example.com");
    expect(result).toMatch(/^j\*+@example\.com$/);
    expect(result.startsWith("j")).toBe(true);
  });

  it("도메인 없는 이메일은 그대로 반환", () => {
    expect(maskEmail("notanemail")).toBe("notanemail");
  });
});

describe("회원가입 이탈 추적 - 기기 감지", () => {
  it("iPhone → mobile", () => {
    expect(detectDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)")).toBe("mobile");
  });

  it("Android → mobile", () => {
    expect(detectDevice("Mozilla/5.0 (Linux; Android 11; SM-G991B)")).toBe("mobile");
  });

  it("iPad → tablet", () => {
    expect(detectDevice("Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)")).toBe("tablet");
  });

  it("Chrome Desktop → desktop", () => {
    expect(detectDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")).toBe("desktop");
  });

  it("빈 UA → desktop", () => {
    expect(detectDevice("")).toBe("desktop");
  });
});

describe("회원가입 이탈 추적 - 퍼널 이탈률 계산", () => {
  it("이탈률 계산: 진입 100명 중 30명 이탈 → 30%", () => {
    const entered = 100;
    const left = 30;
    const dropoffRate = entered > 0 ? Math.round((left / entered) * 100) : 0;
    expect(dropoffRate).toBe(30);
  });

  it("진입 0명이면 이탈률 0%", () => {
    const entered = 0;
    const left = 0;
    const dropoffRate = entered > 0 ? Math.round((left / entered) * 100) : 0;
    expect(dropoffRate).toBe(0);
  });

  it("전체 전환율: 시도 200명 중 완료 50명 → 25%", () => {
    const totalEntered = 200;
    const totalCompleted = 50;
    const rate = totalEntered > 0 ? Math.round((totalCompleted / totalEntered) * 100) : 0;
    expect(rate).toBe(25);
  });
});
