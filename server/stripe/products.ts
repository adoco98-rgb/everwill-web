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
  /** 전자 인증 프리미엄 (영상유언 + 자필유언 포함) */
  CERTIFICATION_PREMIUM: {
    name: "SARAM 전자 인증 프리미엄",
    description: "전자 인증 + 영상 유언장 + 자필 유언장 스캔 인증 — 모든 인증 방식 포함",
    amount: 69000,
    currency: "krw",
    key: "certification_premium",
    includes: ["certification", "video_will", "handwritten_scan"],
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
    name: "SARAM Card Silver",
    description: "스테인레스 카드형 · QR + NFC",
    amount: 49000,
    currency: "krw",
    key: "card_silver",
  },
  BADGE_WEARABLE: {
    name: "SARAM Card Gold",
    description: "실리콘·티타늄 팔찌형 · QR + NFC",
    amount: 79000,
    currency: "krw",
    key: "card_gold",
  },
  BADGE_NECKLACE: {
    name: "SARAM Card Platinum",
    description: "스테인레스·로즈골드 목걸이형 · QR + NFC",
    amount: 99000,
    currency: "krw",
    key: "card_platinum",
  },
  BADGE_PREMIUM: {
    name: "SARAM Card Diamond",
    description: "티타늄·플래티넘 · QR + NFC",
    amount: 299000,
    currency: "krw",
    key: "card_diamond",
  },
  /** 유언장 수정 유료 결제 (무료 횟수 초과 시, 1회 ₩5,000) */
  WILL_REVISION: {
    name: "유언장 수정",
    description: "유언장 수정 1회 · 무료 횟수 초과 시 적용",
    amount: 5000,
    currency: "krw",
    key: "will_revision",
  },
  /** 공식 인증 통합 문서 발급 ($1 USD) */
  DOCUMENT_DOWNLOAD: {
    name: "공식 인증 통합 문서 발급",
    description: "EverWill 공식 인증 통합 문서 PDF 발급 (한글/영문)",
    amount: 100,
    currency: "usd",
    key: "document_download",
  },
} as const;

export type ProductKey = keyof typeof SARAM_PRODUCTS;
export type ProductKeyStr = "certification" | "certification_premium" | "video_will" | "handwritten_scan" | "storage_1y" | "storage_3y" | "storage_5y" | "storage_10y" | "storage_lifetime" | "card_silver" | "card_gold" | "card_platinum" | "card_diamond" | "will_revision" | "document_download";
