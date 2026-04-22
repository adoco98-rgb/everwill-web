/**
 * EverWill 유언장 작성 타입 정의
 * 한국 민법 제1065조~1072조 기준
 */

export type WillMode = "ai" | "direct" | null;

export interface Heir {
  id: string;
  name: string;
  relation: string;
  birthDate: string;
  phone: string;
  email: string;
  country: string;
  address: string;
  share: number; // 상속 지분 (%)
}

export interface RealEstate {
  id: string;
  type: string; // 아파트, 단독주택, 토지 등
  address: string;
  area: string;
  registrationNo: string;
  estimatedValue: string;
  heirId: string;
  sharePercent: number;
  shareAmount?: string; // 직접 금액 입력 (예: "1억 5천만원")
  distributionMode?: "percent" | "amount"; // 배분 방식: % 또는 금액
}

export interface FinancialAsset {
  id: string;
  type: string; // 예금, 주식, 보험, 펀드 등
  institution: string;
  accountNo: string;
  estimatedValue: string;
  heirId: string;
  sharePercent: number;
  shareAmount?: string; // 직접 금액 입력
  distributionMode?: "percent" | "amount"; // 배분 방식: % 또는 금액
}

export interface OtherAsset {
  id: string;
  type: string; // 자동차, 귀금속, 미술품 등
  description: string;
  estimatedValue: string;
  heirId: string;
}

export interface WillData {
  // 1. 유언자 정보
  testatorName: string;
  testatorRRN: string; // 주민등록번호
  testatorAddress: string;
  testatorPhone: string;
  writtenDate: string; // 작성일

  // 2. 상속인
  heirs: Heir[];

  // 3. 재산
  realEstates: RealEstate[];
  financialAssets: FinancialAsset[];
  otherAssets: OtherAsset[];

  // 4. 특별 지시사항
  executor: string; // 유언집행자
  guardian: string; // 미성년 자녀 후견인
  funeralWish: string; // 장례 방식
  donationDetails: string; // 기부 내역
  specialInstructions: string; // 기타 특별 지시

  // 5. 부가 서비스
  hasVideoWill: boolean;
  hasHandwrittenScan: boolean;

  // 6. 메타
  mode: WillMode;
  currentStep: number; // AI 모드 현재 단계
  isDraft: boolean;
  lastSaved: string;
}

export const initialWillData: WillData = {
  testatorName: "",
  testatorRRN: "",
  testatorAddress: "",
  testatorPhone: "",
  writtenDate: new Date().toISOString().split("T")[0],
  heirs: [],
  realEstates: [],
  financialAssets: [],
  otherAssets: [],
  executor: "",
  guardian: "",
  funeralWish: "",
  donationDetails: "",
  specialInstructions: "",
  hasVideoWill: false,
  hasHandwrittenScan: false,
  mode: null,
  currentStep: 1,
  isDraft: true,
  lastSaved: "",
};

// AI 모드 10단계 정의
export const AI_STEPS = [
  { id: 1, title: "기본 정보",        desc: "유언자 본인 정보를 입력합니다",         icon: "👤" },
  { id: 2, title: "가족 관계",        desc: "가족 구성원을 확인합니다",              icon: "👨‍👩‍👧‍👦" },
  { id: 3, title: "상속인 지정",      desc: "유산을 물려줄 분들을 등록합니다",       icon: "📋" },
  { id: 4, title: "부동산 자산",      desc: "부동산 자산을 입력합니다",              icon: "🏠" },
  { id: 5, title: "금융 자산",        desc: "예금·주식·보험 등을 입력합니다",        icon: "💰" },
  { id: 6, title: "기타 자산",        desc: "자동차·귀금속 등 기타 자산",            icon: "📦" },
  { id: 7, title: "특별 지시사항",    desc: "집행자·후견인·장례 방식 등",            icon: "📝" },
  { id: 8, title: "부가 서비스",      desc: "영상 유언·자필 스캔 선택",              icon: "🎬" },
  { id: 9, title: "미리보기",         desc: "작성된 유언장을 확인합니다",            icon: "👁" },
  { id: 10, title: "인증 및 저장",    desc: "전자서명 후 법적 효력 부여",            icon: "✅" },
];

// 유류분 비율 (민법 제1112조)
export const FORCED_SHARE: Record<string, number> = {
  "배우자": 3 / 7,
  "자녀": 2 / 7,
  "부모": 1 / 7,
  "형제자매": 1 / 8,
};
