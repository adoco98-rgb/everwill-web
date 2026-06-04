/**
 * EverWill 멤버십 등급 및 가격 정책
 * SILVER / GOLD / PLATINUM / VIP 4등급
 * 승급 시: 차액 + 수수료 ₩5,000
 */

export type MemberGrade = "general" | "silver" | "gold" | "platinum" | "vip";

export interface MembershipPlan {
  grade: MemberGrade;
  name: string;
  nameKo: string;
  color: string;
  price: number; // 원화 (KRW)
  priceUsd: number; // USD
  storageYears: number | null; // null = 영구
  features: string[];
  cardColor: string; // CSS gradient
  popular?: boolean;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    grade: "silver",
    name: "SILVER",
    nameKo: "실버 카드",
    color: "silver",
    price: 49000,
    priceUsd: 39,
    storageYears: 1,
    cardColor: "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)",
    features: [
      "eKYC 전자 인증 완료",
      "QR 신원 인증",
      "NFC 태그",
      "유언 인증 번호",
      "1년 보관 포함",
      "사망 트리거",
    ],
  },
  {
    grade: "gold",
    name: "GOLD",
    nameKo: "골드 카드",
    color: "gold",
    price: 79000,
    priceUsd: 69,
    storageYears: 3,
    cardColor: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    popular: true,
    features: [
      "eKYC 전자 인증 완료",
      "QR 신원 인증",
      "NFC 태그",
      "유언 인증 번호",
      "3년 보관 포함",
      "사망 트리거 우선 처리",
      "유족 자동 알림",
      "AI 일기쓰기 (Life Story)",
      "소중한 사람에게 편지쓰기",
    ],
  },
  {
    grade: "platinum",
    name: "PLATINUM",
    nameKo: "플래티넘 카드",
    color: "platinum",
    price: 99000,
    priceUsd: 89,
    storageYears: 5,
    cardColor: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
    features: [
      "eKYC 전자 인증 완료",
      "QR 신원 인증",
      "NFC 태그",
      "유언 인증 번호",
      "5년 보관 포함",
      "자필/영상 유언 포함",
      "영상 유언 포함",
      "사망 트리거 우선 처리",
      "AI 일기쓰기 (Life Story)",
      "소중한 사람에게 편지쓰기",
    ],
  },
  {
    grade: "vip",
    name: "VIP",
    nameKo: "VIP 프리미엄",
    color: "vip",
    price: 199000,
    priceUsd: 179,
    storageYears: null, // 영구
    cardColor: "linear-gradient(135deg, #f59e0b 0%, #92400e 100%)",
    features: [
      "eKYC 전자 인증 완료",
      "QR 신원 인증",
      "NFC 태그",
      "유언 인증 번호",
      "영구 보관",
      "자필/영상 유언 포함",
      "사망 트리거 우선 처리",
      "VIP 전담 변호사 연결",
      "전담 컨시어지 서비스",
      "수정 무제한 무료",
      "AI 일기쓰기 (Life Story)",
      "소중한 사람에게 편지쓰기",
    ],
  },
];

/** 등급 순서 (낮은 숫자 = 낮은 등급) */
export const GRADE_ORDER: Record<MemberGrade, number> = {
  general: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
  vip: 4,
};

/** 승급 수수료 */
export const UPGRADE_FEE = 5000;

/**
 * 승급 결제 금액 계산
 * = (목표 등급 가격 - 현재 등급 가격) + 수수료 ₩5,000
 */
export function calculateUpgradePrice(
  currentGrade: MemberGrade,
  targetGrade: MemberGrade
): { diff: number; fee: number; total: number } | null {
  const currentPlan = MEMBERSHIP_PLANS.find((p) => p.grade === currentGrade);
  const targetPlan = MEMBERSHIP_PLANS.find((p) => p.grade === targetGrade);

  if (!currentPlan || !targetPlan) return null;
  if (GRADE_ORDER[targetGrade] <= GRADE_ORDER[currentGrade]) return null;

  const diff = targetPlan.price - currentPlan.price;
  return {
    diff,
    fee: UPGRADE_FEE,
    total: diff + UPGRADE_FEE,
  };
}

/**
 * 신규 가입 결제 금액 (general → 특정 등급)
 */
export function getNewMemberPrice(grade: MemberGrade): number | null {
  const plan = MEMBERSHIP_PLANS.find((p) => p.grade === grade);
  return plan ? plan.price : null;
}
