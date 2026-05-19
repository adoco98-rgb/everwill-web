/**
 * 가격 정책 유틸리티
 * - 한국: 원화 기준 가격
 * - 해외: 달러 결제, 환율 대비 15% 프리미엄
 * 기준 환율: 1 USD = 1,400 KRW
 *
 * [새 가격 정책 2026.05]
 * - 전자 인증 ₩49,000 (1년 보관 ₩15,000 포함, 실버 카드 포함)
 * - 1년 후 연장 보관: ₩15,000/년
 * - 자필 유언서 스캔 인증: +₩15,000 (별도 옵션)
 * - 영상 유언: +₩19,000 (별도 옵션)
 * - 3년 보관 플랜: ₩79,000 (인증+3년 보관, 골드 카드)
 * - 5년 보관 플랜: ₩99,000 (인증+5년 보관+자필+영상 모두 포함, 플래티넘 카드)
 * - 영구 플랜: ₩199,000 (인증+영구 보관+자필+영상 모두 포함, VIP)
 */

import { Language } from "@/i18n";

// 한국 원화 기준 단품 가격
export const KRW_PRICES = {
  certification: 49000,       // 최초 전자 인증 (1년 보관 포함)
  storageAnnual: 15000,       // 1년 연장 보관료 (1년 후 매년)
  handwrittenScan: 15000,     // 자필 유언서 스캔 인증 (별도 옵션)
  videoWill: 19000,           // 영상 유언 (별도 옵션)
  lawyerConsult: 30000,       // 변호사 생전 자문 (최소)
} as const;

// 플랜별 원화 가격
// cert: 전자인증 ₩49,000 (1년 보관 ₩15,000 포함, 실버 카드)
// plan3y: 3년 보관 ₩79,000 (골드 카드)
// plan5y: 5년 보관 ₩99,000 (자필+영상 포함, 플래티넘 카드)
// planLife: 영구 플랜 ₩199,000 (자필+영상 포함, VIP)
export const PLAN_KRW_PRICES = {
  cert:     { baseFee: 49000, storageFee: 15000, discount: 15000, total: 49000  },
  plan3y:   { baseFee: 49000, storageFee: 30000, discount: 0,     total: 79000  },
  plan5y:   { baseFee: 49000, storageFee: 50000, discount: 0,     total: 99000  },
  planLife: { baseFee: 49000, storageFee: 150000, discount: 0,    total: 199000 },
} as const;

// 기준 환율 (1 USD = KRW)
const BASE_EXCHANGE_RATE = 1400;
// 해외 프리미엄 비율
const OVERSEAS_PREMIUM = 1.15;

/**
 * 원화 → 달러 변환 (해외 +15% 프리미엄 적용)
 * 심리적으로 깔끔한 숫자로 반올림
 */
function krwToUsd(krw: number): number {
  const raw = (krw / BASE_EXCHANGE_RATE) * OVERSEAS_PREMIUM;
  // 10달러 미만: 1달러 단위, 10달러 이상: 5달러 단위로 반올림
  if (raw < 10) return Math.round(raw);
  if (raw < 50) return Math.round(raw / 5) * 5;
  return Math.round(raw / 10) * 10;
}

// 한국 여부 확인
export function isKorean(lang: Language): boolean {
  return lang === "ko";
}

// 가격 포맷 - 언어에 따라 원화 또는 달러 반환
export function formatPrice(krwAmount: number, lang: Language): string {
  if (isKorean(lang)) {
    return `₩${krwAmount.toLocaleString("ko-KR")}`;
  }
  const usd = krwToUsd(krwAmount);
  return `$${usd}`;
}

// 가격 숫자만 반환 (통화 기호 없이)
export function getPriceNumber(krwAmount: number, lang: Language): number {
  if (isKorean(lang)) return krwAmount;
  return krwToUsd(krwAmount);
}

// 통화 기호 반환
export function getCurrencySymbol(lang: Language): string {
  return isKorean(lang) ? "₩" : "$";
}

// 결제 통화 이름
export function getCurrencyName(lang: Language): string {
  return isKorean(lang) ? "KRW" : "USD";
}

// 플랜별 가격을 언어에 맞게 변환하여 반환
export function getPlanPrices(lang: Language) {
  const fmt = (krw: number) => formatPrice(krw, lang);
  return {
    cert: {
      baseFee: fmt(PLAN_KRW_PRICES.cert.baseFee),
      storageFee: fmt(PLAN_KRW_PRICES.cert.storageFee),
      discount: fmt(PLAN_KRW_PRICES.cert.discount),
      total: fmt(PLAN_KRW_PRICES.cert.total),
      totalNum: getPriceNumber(PLAN_KRW_PRICES.cert.total, lang),
    },
    plan3y: {
      baseFee: fmt(PLAN_KRW_PRICES.plan3y.baseFee),
      storageFee: fmt(PLAN_KRW_PRICES.plan3y.storageFee),
      discount: fmt(PLAN_KRW_PRICES.plan3y.discount),
      total: fmt(PLAN_KRW_PRICES.plan3y.total),
      totalNum: getPriceNumber(PLAN_KRW_PRICES.plan3y.total, lang),
    },
    plan5y: {
      baseFee: fmt(PLAN_KRW_PRICES.plan5y.baseFee),
      storageFee: fmt(PLAN_KRW_PRICES.plan5y.storageFee),
      discount: fmt(PLAN_KRW_PRICES.plan5y.discount),
      total: fmt(PLAN_KRW_PRICES.plan5y.total),
      totalNum: getPriceNumber(PLAN_KRW_PRICES.plan5y.total, lang),
    },
    planLife: {
      baseFee: fmt(PLAN_KRW_PRICES.planLife.baseFee),
      storageFee: fmt(PLAN_KRW_PRICES.planLife.storageFee),
      discount: fmt(PLAN_KRW_PRICES.planLife.discount),
      total: fmt(PLAN_KRW_PRICES.planLife.total),
      totalNum: getPriceNumber(PLAN_KRW_PRICES.planLife.total, lang),
    },
    symbol: getCurrencySymbol(lang),
    currency: getCurrencyName(lang),
  };
}

// 모든 가격을 언어에 맞게 변환하여 반환
export function getPrices(lang: Language) {
  return {
    certification: formatPrice(KRW_PRICES.certification, lang),
    storageAnnual: formatPrice(KRW_PRICES.storageAnnual, lang),
    handwrittenScan: formatPrice(KRW_PRICES.handwrittenScan, lang),
    videoWill: formatPrice(KRW_PRICES.videoWill, lang),
    lawyerConsult: formatPrice(KRW_PRICES.lawyerConsult, lang),
    // 숫자만 (UI 표시용)
    certificationNum: getPriceNumber(KRW_PRICES.certification, lang),
    storageAnnualNum: getPriceNumber(KRW_PRICES.storageAnnual, lang),
    symbol: getCurrencySymbol(lang),
    currency: getCurrencyName(lang),
  };
}
