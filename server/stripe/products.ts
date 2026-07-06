/**
 * EverWill 멤버십 등급별 결제 상품 정의
 *
 * 등급 체계:
 * - general : 무료 (유언장 초안 작성, 기본 메뉴 탐색)
 * - silver  : ₩168,000 (전자 인증, 자산 등록, 상속인 등록, 건강증명서 업로드, 영구 보관)
 * - gold    : ₩79,000 (Silver + 영상 유언, 자필 스캔, 일기/편지, 영구 보관)
 * - platinum: ₩168,000 (Gold + 영구 보관, 수정 10회)
 * - vip     : ₩199,000 (전체 + 영구 보관 + 무제한 수정)
 *
 * 업그레이드: 차액 + ₩5,000 수수료
 */

export type MemberGrade = "general" | "silver" | "gold" | "platinum" | "vip";

export const GRADE_PRICES: Record<Exclude<MemberGrade, "general">, number> = {
  silver: 168000,
  gold: 79000,
  platinum: 168000,
  vip: 199000,
};

/** 등급별 포함 기능 */
export const GRADE_FEATURES: Record<MemberGrade, string[]> = {
  general: [
    "유언장 초안 작성 (AI 자동 생성)",
    "기본 메뉴 탐색",
  ],
  silver: [
    "유언장 전자 인증",
    "블록체인 해시 기록",
    "인증서 발급",
    "자산 등록 (부동산·금융·기타)",
    "상속인 등록 및 저장",
    "건강증명서 업로드",
    "유언장 수정 10회 무료",
    "영구 보관",
  ],
  gold: [
    "Silver 전체 포함",
    "영상 유언장 녹화",
    "자필 유언장 스캔 인증",
    "AI 일기 (Life Story)",
    "가족 편지 서비스",
    "유언장 수정 10회 무료",
    "영구 보관",
  ],
  platinum: [
    "Gold 전체 포함",
    "유언장 수정 10회 무료",
    "영구 보관",
    "공식 인증 통합 문서 발급 1회 무료",
  ],
  vip: [
    "Platinum 전체 포함",
    "유언장 수정 무제한",
    "영구 보관",
    "공식 인증 통합 문서 발급 무제한",
    "변호사 사후 집행 우선 배정",
  ],
};

/** 등급 표시명 */
export const GRADE_LABELS: Record<MemberGrade, string> = {
  general: "무료",
  silver: "실버",
  gold: "골드",
  platinum: "플래티넘",
  vip: "VIP",
};

/** 등급 색상 (Tailwind 클래스) */
export const GRADE_COLORS: Record<MemberGrade, string> = {
  general: "text-gray-500",
  silver: "text-gray-400",
  gold: "text-yellow-500",
  platinum: "text-blue-500",
  vip: "text-purple-600",
};

/** 업그레이드 가능한 다음 등급 */
export const NEXT_GRADE: Partial<Record<MemberGrade, Exclude<MemberGrade, "general">>> = {
  general: "silver",
  silver: "gold",
  gold: "platinum",
  platinum: "vip",
};

/** 특정 기능에 필요한 최소 등급 */
export const FEATURE_MIN_GRADE: Record<string, MemberGrade> = {
  electronic_certification: "silver",
  asset_registration: "silver",
  heir_registration: "silver",
  health_cert_upload: "silver",
  document_download: "silver",
  video_will: "gold",
  handwritten_scan: "gold",
  life_story: "gold",
  letter: "gold",
  lifetime_storage: "vip",
};

/** 등급 우선순위 (숫자가 클수록 높은 등급) */
export const GRADE_RANK: Record<MemberGrade, number> = {
  general: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  vip: 4,
};

/** 현재 등급이 요구 등급 이상인지 확인 */
export function hasAccess(userGrade: MemberGrade, requiredGrade: MemberGrade): boolean {
  return GRADE_RANK[userGrade] >= GRADE_RANK[requiredGrade];
}

/** 업그레이드 비용 계산 (차액 + ₩5,000 수수료) */
export function calcUpgradeCost(
  currentGrade: MemberGrade,
  targetGrade: Exclude<MemberGrade, "general">
): number {
  const currentPrice =
    currentGrade === "general"
      ? 0
      : (GRADE_PRICES[currentGrade as Exclude<MemberGrade, "general">] ?? 0);
  const targetPrice = GRADE_PRICES[targetGrade];
  const diff = Math.max(0, targetPrice - currentPrice);
  return diff + 15000;
}

/** Stripe 결제 상품 정의 */
export const SARAM_PRODUCTS = {
  MEMBERSHIP_SILVER: {
    name: "EverWill 실버 멤버십",
    description: "전자 인증 · 자산 등록 · 상속인 등록 · 영구 보관",
    amount: 168000,
    currency: "krw",
    key: "membership_silver",
    grade: "silver" as MemberGrade,
  },
  MEMBERSHIP_GOLD: {
    name: "EverWill 골드 멤버십",
    description: "실버 전체 + 영상 유언 · 자필 스캔 · 일기/편지 · 영구 보관",
    amount: 79000,
    currency: "krw",
    key: "membership_gold",
    grade: "gold" as MemberGrade,
  },
  MEMBERSHIP_PLATINUM: {
    name: "EverWill 플래티넘 멤버십",
    description: "골드 전체 + 영구 보관 · 수정 10회",
    amount: 168000,
    currency: "krw",
    key: "membership_platinum",
    grade: "platinum" as MemberGrade,
  },
  MEMBERSHIP_VIP: {
    name: "EverWill VIP 멤버십",
    description: "전체 서비스 + 영구 보관 · 무제한 수정",
    amount: 199000,
    currency: "krw",
    key: "membership_vip",
    grade: "vip" as MemberGrade,
  },
  WILL_REVISION: {
    name: "유언장 수정",
    description: "유언장 수정 1회 · 무료 횟수 초과 시 적용",
    amount: 5000,
    currency: "krw",
    key: "will_revision",
    grade: null,
  },
  DOCUMENT_DOWNLOAD: {
    name: "공식 인증 통합 문서 발급",
    description: "EverWill 공식 인증 통합 문서 PDF 발급 (한글/영문)",
    amount: 1500,
    currency: "krw",
    key: "document_download",
    grade: null,
  },
} as const;

export type ProductKey = keyof typeof SARAM_PRODUCTS;
export type ProductKeyStr =
  | "membership_silver"
  | "membership_gold"
  | "membership_platinum"
  | "membership_vip"
  | "will_revision"
  | "document_download";
