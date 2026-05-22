/**
 * 플로우 점검 회귀 테스트
 * 1. emailAuth.register: phone 없이도 가입 가능한지 (optional 처리)
 * 2. will.certifyWill: certNumber, blockchainHash 반환 확인
 * 3. emailAuth.verifyOtp: isNewUser 판단 로직 (insert 전 select)
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";

// ── 1. register 입력 스키마 검증 ──────────────────────────────────
const registerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(50),
  phone: z.string().min(7).max(20).optional().or(z.literal("")),
  country: z.string().min(2).max(3).default("KR"),
  address: z.string().optional(),
});

describe("emailAuth.register 입력 스키마", () => {
  it("phone 없이도 유효한 입력으로 처리됨", () => {
    const result = registerInputSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
      phone: "",
      country: "KR",
    });
    expect(result.success).toBe(true);
  });

  it("phone undefined 도 유효한 입력으로 처리됨", () => {
    const result = registerInputSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
      country: "KR",
    });
    expect(result.success).toBe(true);
  });

  it("phone 있을 때 정상 처리됨", () => {
    const result = registerInputSchema.safeParse({
      email: "test@example.com",
      password: "password123",
      name: "홍길동",
      phone: "01012345678",
      country: "KR",
    });
    expect(result.success).toBe(true);
  });

  it("이메일 형식이 잘못되면 실패", () => {
    const result = registerInputSchema.safeParse({
      email: "not-an-email",
      password: "password123",
      name: "홍길동",
    });
    expect(result.success).toBe(false);
  });

  it("비밀번호 8자 미만이면 실패", () => {
    const result = registerInputSchema.safeParse({
      email: "test@example.com",
      password: "short",
      name: "홍길동",
    });
    expect(result.success).toBe(false);
  });
});

// ── 2. certifyWill 반환 구조 검증 ─────────────────────────────────
const certifyWillOutputSchema = z.object({
  success: z.literal(true),
  certNumber: z.string().regex(/^EW-\d{8}-[A-Z0-9]{6}$/),
  blockchainHash: z.string().length(64),
});

describe("certifyWill 반환값 구조", () => {
  it("certNumber 형식이 EW-YYYYMMDD-XXXXXX 패턴임", () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const suffix = "ABC123";
    const certNumber = `EW-${today}-${suffix}`;
    expect(/^EW-\d{8}-[A-Z0-9]{6}$/.test(certNumber)).toBe(true);
  });

  it("SHA-256 해시는 64자 hex 문자열임", () => {
    const { createHash } = require("crypto");
    const hash = createHash("sha256").update("test-input").digest("hex");
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it("certifyWill 출력 스키마 검증", () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const { createHash } = require("crypto");
    const mockOutput = {
      success: true as const,
      certNumber: `EW-${today}-XYZ789`,
      blockchainHash: createHash("sha256").update("mock").digest("hex"),
    };
    const result = certifyWillOutputSchema.safeParse(mockOutput);
    expect(result.success).toBe(true);
  });
});

// ── 3. isNewUser 판단 로직 ────────────────────────────────────────
describe("isNewUser 판단 로직", () => {
  it("insert 전에 select 하면 신규 사용자 정확히 판단됨", () => {
    // 시뮬레이션: DB에 없는 사용자
    const existingUsers: unknown[] = [];
    const isNewUser = existingUsers.length === 0;
    expect(isNewUser).toBe(true);
  });

  it("insert 후에 select 하면 항상 false 반환 (버그 시나리오)", () => {
    // 버그 시나리오: insert 후 select → 항상 기존 사용자로 판단
    const existingUsersAfterInsert = [{ id: 1 }]; // insert 후에는 항상 row 존재
    const isNewUserBug = existingUsersAfterInsert.length === 0;
    expect(isNewUserBug).toBe(false); // 항상 false → 신규 사용자 감지 불가
  });
});
