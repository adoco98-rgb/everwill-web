import { describe, it, expect } from "vitest";

describe("카카오 OAuth 환경변수 설정 확인", () => {
  it("KAKAO_CLIENT_ID가 설정되어 있어야 한다", () => {
    const clientId = process.env.KAKAO_CLIENT_ID;
    expect(clientId).toBeTruthy();
    expect(clientId?.length).toBe(32); // 카카오 REST API 키는 32자
  });
});
