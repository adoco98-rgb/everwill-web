/**
 * Rate Limiting 미들웨어
 * 남용 방지를 위한 엔드포인트별 요청 제한
 */
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

/**
 * OTP 발송 제한: 동일 IP에서 15분에 최대 5회
 * 이메일/휴대폰 OTP 발송 남용 방지
 */
export const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "OTP 발송 요청이 너무 많습니다. 15분 후 다시 시도해주세요.",
  },
  keyGenerator: (req) => {
    // IPv6 안전 IP 추출 + 이메일/전화번호 조합으로 키 생성 (더 정밀한 제한)
    const body = req.body as Record<string, unknown>;
    const identifier = (body?.email as string) || (body?.phone as string) || "";
    const ip = ipKeyGenerator(req.ip ?? "");
    return `${ip}:${identifier}`;
  },
  skip: (req) => {
    // 개발 환경에서는 제한 비활성화
    return process.env.NODE_ENV === "development";
  },
});

/**
 * OTP 검증 제한: 동일 IP에서 15분에 최대 10회
 * 브루트포스 공격 방지
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "인증 시도가 너무 많습니다. 15분 후 다시 시도해주세요.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});

/**
 * 문의 접수 제한: 동일 IP에서 1시간에 최대 10회
 * 스팸 문의 방지
 */
export const inquiryCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "문의 접수 요청이 너무 많습니다. 1시간 후 다시 시도해주세요.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});

/**
 * 회원가입 추적 이벤트 제한: 동일 IP에서 1시간에 최대 200회
 * 분석 데이터 오염 방지
 */
export const signupTrackingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1시간
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});

/**
 * 일반 API 제한: 동일 IP에서 1분에 최대 60회
 * 전반적인 API 남용 방지
 */
export const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  },
  skip: (req) => process.env.NODE_ENV === "development",
});
