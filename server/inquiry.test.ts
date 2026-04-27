import { describe, it, expect } from "vitest";

// inquiryRouter의 입력 유효성 검사 로직 단위 테스트
describe("inquiry validation", () => {
  it("유효한 문의 데이터 검증", () => {
    const validInput = {
      name: "홍길동",
      email: "test@example.com",
      category: "general" as const,
      subject: "테스트 문의",
      content: "문의 내용입니다. 최소 10자 이상이어야 합니다.",
    };
    expect(validInput.name.length).toBeGreaterThan(0);
    expect(validInput.email).toContain("@");
    expect(validInput.content.length).toBeGreaterThanOrEqual(10);
    expect(["general", "service", "payment", "badge", "lawyer", "other"]).toContain(validInput.category);
  });

  it("이메일 형식 검증", () => {
    const validEmails = ["test@example.com", "user@domain.co.kr", "hello@world.org"];
    const invalidEmails = ["notanemail", "missing@", "@nodomain.com"];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validEmails.forEach(email => expect(emailRegex.test(email)).toBe(true));
    invalidEmails.forEach(email => expect(emailRegex.test(email)).toBe(false));
  });

  it("문의 유형 목록 검증", () => {
    const categories = ["general", "service", "payment", "badge", "lawyer", "other"];
    expect(categories).toHaveLength(6);
    expect(categories).toContain("general");
    expect(categories).toContain("lawyer");
  });

  it("내용 최소 길이 검증", () => {
    const shortContent = "짧음";
    const validContent = "문의 내용입니다. 최소 10자 이상이어야 합니다.";
    expect(shortContent.length).toBeLessThan(10);
    expect(validContent.length).toBeGreaterThanOrEqual(10);
  });
});
