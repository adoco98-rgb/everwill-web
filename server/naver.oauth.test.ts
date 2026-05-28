import { describe, it, expect } from "vitest";

describe("네이버 OAuth 환경변수 설정 확인", () => {
  it("NAVER_CLIENT_ID가 설정되어 있어야 한다", () => {
    const clientId = process.env.NAVER_CLIENT_ID;
    expect(clientId).toBeTruthy();
    expect(clientId?.length).toBeGreaterThan(5);
  });

  it("NAVER_CLIENT_SECRET이 설정되어 있어야 한다", () => {
    const clientSecret = process.env.NAVER_CLIENT_SECRET;
    expect(clientSecret).toBeTruthy();
    expect(clientSecret?.length).toBeGreaterThan(3);
  });
});
