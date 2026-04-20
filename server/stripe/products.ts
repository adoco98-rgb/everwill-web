/**
 * SARAM Stripe 상품 정의
 * 가격은 KRW 기준 (Stripe는 원화 지원)
 */

export const SARAM_PRODUCTS = {
  /** 전자 인증 (기본) */
  CERTIFICATION: {
    name: "SARAM 전자 인증",
    description: "유언장 전자 인증 · 블록체인 해시 기록 · 인증서 발급",
    amount: 49000,
    currency: "krw",
    key: "certification",
  },
  /** 영상 유언장 */
  VIDEO_WILL: {
    name: "영상 유언장",
    description: "법적 녹음 유언 + 가족 감성 메시지 · 평생 보관",
    amount: 29000,
    currency: "krw",
    key: "video_will",
  },
  /** 자필 유언장 스캔 */
  HANDWRITTEN_SCAN: {
    name: "자필 유언장 스캔 인증",
    description: "자필 원본 업로드 · AI 형식 검증 · 블록체인 무결성 기록",
    amount: 19000,
    currency: "krw",
    key: "handwritten_scan",
  },
  /** 보관 플랜 */
  STORAGE_1Y: {
    name: "유언장 보관 1년",
    description: "디지털 유언장 1년 보관 (2년차~)",
    amount: 9900,
    currency: "krw",
    key: "storage_1y",
  },
  STORAGE_3Y: {
    name: "유언장 보관 3년",
    description: "디지털 유언장 3년 보관 (15% 할인)",
    amount: 25245,
    currency: "krw",
    key: "storage_3y",
  },
  STORAGE_5Y: {
    name: "유언장 보관 5년",
    description: "디지털 유언장 5년 보관 (15% 할인)",
    amount: 42075,
    currency: "krw",
    key: "storage_5y",
  },
  STORAGE_10Y: {
    name: "유언장 보관 10년",
    description: "디지털 유언장 10년 보관 (15% 할인)",
    amount: 84150,
    currency: "krw",
    key: "storage_10y",
  },
  STORAGE_LIFETIME: {
    name: "유언장 영구 보관",
    description: "디지털 유언장 영구 보관 (평생)",
    amount: 199000,
    currency: "krw",
    key: "storage_lifetime",
  },
  /** Badge */
  BADGE_ESSENTIAL: {
    name: "SARAM Badge Essential",
    description: "스테인레스 카드형 · QR + NFC",
    amount: 49000,
    currency: "krw",
    key: "badge_essential",
  },
  BADGE_WEARABLE: {
    name: "SARAM Badge Wearable",
    description: "실리콘·티타늄 팔찌형 · QR + NFC",
    amount: 79000,
    currency: "krw",
    key: "badge_wearable",
  },
  BADGE_NECKLACE: {
    name: "SARAM Badge Necklace",
    description: "스테인레스·로즈골드 목걸이형 · QR + NFC",
    amount: 99000,
    currency: "krw",
    key: "badge_necklace",
  },
  BADGE_PREMIUM: {
    name: "SARAM Badge Premium",
    description: "티타늄·플래티넘 · QR + NFC",
    amount: 299000,
    currency: "krw",
    key: "badge_premium",
  },
} as const;

export type ProductKey = keyof typeof SARAM_PRODUCTS;
