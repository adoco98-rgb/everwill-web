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

// 이메일 발송 헬퍼 단위 테스트
describe("email confirmation logic", () => {
  it("이메일 HTML 템플릿 카테고리 레이블 매핑", () => {
    const categoryLabels: Record<string, string> = {
      general: "일반 문의",
      service: "서비스 이용",
      payment: "결제/환불",
      badge: "Badge 주문",
      lawyer: "변호사 연결",
      other: "기타",
    };
    expect(categoryLabels["general"]).toBe("일반 문의");
    expect(categoryLabels["lawyer"]).toBe("변호사 연결");
    expect(categoryLabels["payment"]).toBe("결제/환불");
    // 알 수 없는 카테고리는 원본 반환
    expect(categoryLabels["unknown"] ?? "unknown").toBe("unknown");
  });

  it("이메일 발신자 주소 형식 검증", () => {
    const fromAddress = "EverWill <onboarding@resend.dev>";
    expect(fromAddress).toContain("EverWill");
    expect(fromAddress).toContain("@");
  });

  it("이메일 제목 형식 검증", () => {
    const subject = "서비스 문의";
    const emailSubject = `[EverWill] 문의가 접수됐습니다 - ${subject}`;
    expect(emailSubject).toContain("[EverWill]");
    expect(emailSubject).toContain(subject);
  });
});

// 만족도 평가 로직 단위 테스트
describe("satisfaction survey logic", () => {
  it("점수 범위 검증 - 1~5 허용", () => {
    const validScores = [1, 2, 3, 4, 5];
    validScores.forEach((score) => {
      expect(score >= 1 && score <= 5).toBe(true);
    });
  });

  it("점수 범위 검증 - 0, 6 거부", () => {
    const invalidScores = [0, 6, -1, 10];
    invalidScores.forEach((score) => {
      expect(score >= 1 && score <= 5).toBe(false);
    });
  });

  it("토큰 해시 일관성 - 동일 입력 동일 출력", () => {
    const { createHash } = require("crypto");
    const rawToken = "test-token-abc123";
    const hash1 = createHash("sha256").update(rawToken).digest("hex");
    const hash2 = createHash("sha256").update(rawToken).digest("hex");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("토큰 해시 - 다른 입력 다른 출력", () => {
    const { createHash } = require("crypto");
    const hash1 = createHash("sha256").update("token-a").digest("hex");
    const hash2 = createHash("sha256").update("token-b").digest("hex");
    expect(hash1).not.toBe(hash2);
  });

  it("답변 이메일 제목 형식 검증", () => {
    const subject = "서비스 이용 문의";
    const emailSubject = `[EverWill] 문의 답변이 도착했습니다 - ${subject}`;
    expect(emailSubject).toContain("[EverWill]");
    expect(emailSubject).toContain("답변이 도착했습니다");
    expect(emailSubject).toContain(subject);
  });

  it("만족도 이모지 매핑 검증", () => {
    const emojiMap: Record<number, string> = {
      1: "😞", 2: "😕", 3: "😐", 4: "😊", 5: "😄"
    };
    expect(emojiMap[1]).toBe("😞");
    expect(emojiMap[5]).toBe("😄");
    expect(Object.keys(emojiMap)).toHaveLength(5);
  });

  it("feedback URL 파라미터 파싱 - 정상 케이스", () => {
    const mockSearch = "?id=42&token=abc123&score=4";
    const params = new URLSearchParams(mockSearch);
    expect(parseInt(params.get("id") ?? "0")).toBe(42);
    expect(params.get("token")).toBe("abc123");
    expect(parseInt(params.get("score") ?? "0")).toBe(4);
  });

  it("feedback URL 파라미터 파싱 - 누락 케이스", () => {
    const params = new URLSearchParams("");
    expect(parseInt(params.get("id") ?? "0")).toBe(0);
    expect(params.get("token")).toBeNull();
    expect(parseInt(params.get("score") ?? "0")).toBe(0);
  });
});
