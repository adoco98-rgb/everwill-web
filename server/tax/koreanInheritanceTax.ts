/**
 * 한국 상속세 자동 계산 모듈
 * 근거: 상속세 및 증여세법 (2024년 기준)
 */

// ─── 상속세 세율표 (상속세 및 증여세법 제26조) ───
const TAX_BRACKETS = [
  { limit: 100_000_000,        rate: 0.10, deduction: 0 },           // 1억 이하: 10%
  { limit: 500_000_000,        rate: 0.20, deduction: 10_000_000 },  // 5억 이하: 20%
  { limit: 1_000_000_000,      rate: 0.30, deduction: 60_000_000 },  // 10억 이하: 30%
  { limit: 3_000_000_000,      rate: 0.40, deduction: 160_000_000 }, // 30억 이하: 40%
  { limit: Infinity,           rate: 0.50, deduction: 460_000_000 }, // 30억 초과: 50%
];

export interface HeirInfo {
  relation: "spouse" | "child" | "parent" | "sibling" | "other";
  count: number;
}

export interface AssetInfo {
  realEstate: number;       // 부동산 (원)
  financialAssets: number;  // 금융자산 (원)
  businessAssets: number;   // 사업용 자산 (원)
  otherAssets: number;      // 기타 자산 (원)
  debts: number;            // 채무 (원)
  funeralExpenses: number;  // 장례비용 (원, 최대 1,500만원 공제)
}

export interface TaxCalculationResult {
  // 총 상속재산
  totalAssets: number;
  // 공제 항목
  deductions: {
    basicDeduction: number;       // 기초공제 2억
    spouseDeduction: number;      // 배우자 공제 (최소 5억, 최대 30억)
    childDeduction: number;       // 자녀공제 (1인당 5천만원)
    elderlyDeduction: number;     // 노령자 공제 (65세 이상, 1인당 5백만원)
    disabledDeduction: number;    // 장애인 공제
    financialDeduction: number;   // 금융재산 공제 (20%, 최대 2억)
    debtDeduction: number;        // 채무 공제
    funeralDeduction: number;     // 장례비용 공제 (최대 1,500만원)
    totalDeduction: number;       // 총 공제액
  };
  // 과세표준
  taxableAmount: number;
  // 산출세액
  calculatedTax: number;
  // 세대생략 할증 (30%)
  generationSkipSurcharge: number;
  // 신고세액공제 (3%)
  reportingDeduction: number;
  // 최종 납부세액
  finalTax: number;
  // 유효세율
  effectiveRate: number;
  // 상속인별 납부세액 (법정상속분 기준)
  heirTaxes: {
    relation: string;
    share: number;
    tax: number;
  }[];
  // 절세 팁
  taxSavingTips: string[];
}

/**
 * 한국 상속세 계산 메인 함수
 */
export function calculateKoreanInheritanceTax(
  assets: AssetInfo,
  heirs: HeirInfo[],
  deceasedAge: number,
  isGenerationSkip: boolean = false
): TaxCalculationResult {
  // 1. 총 상속재산 계산
  const totalAssets =
    assets.realEstate +
    assets.financialAssets +
    assets.businessAssets +
    assets.otherAssets;

  // 2. 공제 계산
  const hasSpouse = heirs.some(h => h.relation === "spouse");
  const childCount = heirs.find(h => h.relation === "child")?.count ?? 0;
  const elderlyCount = heirs.filter(h =>
    (h.relation === "parent") && deceasedAge >= 65
  ).reduce((sum, h) => sum + h.count, 0);

  // 기초공제: 2억원
  const basicDeduction = 200_000_000;

  // 배우자 공제: 실제 상속받은 금액 (최소 5억, 최대 30억)
  // 간소화: 배우자가 있으면 최소 5억 공제
  const spouseDeduction = hasSpouse
    ? Math.min(Math.max(500_000_000, totalAssets * 0.3), 3_000_000_000)
    : 0;

  // 자녀공제: 1인당 5천만원
  const childDeduction = childCount * 50_000_000;

  // 노령자 공제: 65세 이상 1인당 500만원
  const elderlyDeduction = elderlyCount * 5_000_000;

  // 장애인 공제: 생략 (별도 입력 필요)
  const disabledDeduction = 0;

  // 금융재산 공제: 금융재산의 20% (최대 2억)
  const financialDeduction = Math.min(assets.financialAssets * 0.2, 200_000_000);

  // 채무 공제
  const debtDeduction = assets.debts;

  // 장례비용 공제: 실제 비용 (최대 1,500만원)
  const funeralDeduction = Math.min(assets.funeralExpenses || 15_000_000, 15_000_000);

  // 일괄공제: 기초공제 + 인적공제 합계가 5억 미만이면 5억으로 일괄 적용
  const personalDeductions = basicDeduction + childDeduction + elderlyDeduction + disabledDeduction;
  const lumpSumDeduction = 500_000_000; // 일괄공제 5억
  const appliedPersonalDeduction = Math.max(personalDeductions, lumpSumDeduction);

  const totalDeduction =
    appliedPersonalDeduction +
    spouseDeduction +
    financialDeduction +
    debtDeduction +
    funeralDeduction;

  // 3. 과세표준
  const taxableAmount = Math.max(0, totalAssets - totalDeduction);

  // 4. 산출세액 계산 (누진세율)
  let calculatedTax = 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableAmount <= bracket.limit) {
      calculatedTax = taxableAmount * bracket.rate - bracket.deduction;
      break;
    }
  }
  calculatedTax = Math.max(0, calculatedTax);

  // 5. 세대생략 할증 (30%)
  const generationSkipSurcharge = isGenerationSkip ? calculatedTax * 0.3 : 0;
  const totalTax = calculatedTax + generationSkipSurcharge;

  // 6. 신고세액공제 (3%) - 신고기한 내 신고 시
  const reportingDeduction = totalTax * 0.03;

  // 7. 최종 납부세액
  const finalTax = Math.max(0, totalTax - reportingDeduction);

  // 8. 유효세율
  const effectiveRate = totalAssets > 0 ? (finalTax / totalAssets) * 100 : 0;

  // 9. 상속인별 납부세액 (법정상속분 기준)
  const heirTaxes = calculateHeirTaxes(heirs, finalTax, hasSpouse);

  // 10. 절세 팁 생성
  const taxSavingTips = generateTaxSavingTips(assets, heirs, taxableAmount, finalTax);

  return {
    totalAssets,
    deductions: {
      basicDeduction: appliedPersonalDeduction,
      spouseDeduction,
      childDeduction,
      elderlyDeduction,
      disabledDeduction,
      financialDeduction,
      debtDeduction,
      funeralDeduction,
      totalDeduction,
    },
    taxableAmount,
    calculatedTax,
    generationSkipSurcharge,
    reportingDeduction,
    finalTax,
    effectiveRate,
    heirTaxes,
    taxSavingTips,
  };
}

/**
 * 상속인별 법정상속분에 따른 세액 배분
 */
function calculateHeirTaxes(
  heirs: HeirInfo[],
  totalTax: number,
  hasSpouse: boolean
): { relation: string; share: number; tax: number }[] {
  // 법정상속분 계산 (민법 제1009조)
  // 배우자: 다른 상속인의 1.5배
  const childCount = heirs.find(h => h.relation === "child")?.count ?? 0;
  const parentCount = heirs.find(h => h.relation === "parent")?.count ?? 0;

  const results: { relation: string; share: number; tax: number }[] = [];

  if (hasSpouse && childCount > 0) {
    // 배우자 + 자녀: 배우자 1.5 / (자녀수 + 1.5)
    const total = childCount + 1.5;
    const spouseShare = 1.5 / total;
    const childShare = 1 / total;
    results.push({ relation: "배우자", share: spouseShare * 100, tax: totalTax * spouseShare });
    results.push({ relation: `자녀 (${childCount}명)`, share: childShare * childCount * 100, tax: totalTax * childShare * childCount });
  } else if (hasSpouse && childCount === 0 && parentCount > 0) {
    // 배우자 + 부모: 배우자 1.5 / (부모수 + 1.5)
    const total = parentCount + 1.5;
    const spouseShare = 1.5 / total;
    const parentShare = 1 / total;
    results.push({ relation: "배우자", share: spouseShare * 100, tax: totalTax * spouseShare });
    results.push({ relation: `부모 (${parentCount}명)`, share: parentShare * parentCount * 100, tax: totalTax * parentShare * parentCount });
  } else if (hasSpouse) {
    results.push({ relation: "배우자", share: 100, tax: totalTax });
  } else if (childCount > 0) {
    results.push({ relation: `자녀 (${childCount}명)`, share: 100, tax: totalTax });
  }

  return results;
}

/**
 * 절세 팁 자동 생성
 */
function generateTaxSavingTips(
  assets: AssetInfo,
  heirs: HeirInfo[],
  taxableAmount: number,
  finalTax: number
): string[] {
  const tips: string[] = [];

  if (finalTax > 0) {
    tips.push("신고기한(사망일로부터 6개월) 내 신고 시 3% 세액공제를 받을 수 있습니다.");
  }

  if (assets.realEstate > 500_000_000) {
    tips.push("부동산 비중이 높습니다. 생전 증여(10년 단위 5,000만원 공제)를 활용하면 절세 효과가 있습니다.");
  }

  if (assets.financialAssets > 0) {
    tips.push("금융재산은 20% (최대 2억원) 공제가 적용됩니다. 금융자산 비중을 높이면 유리합니다.");
  }

  const childCount = heirs.find(h => h.relation === "child")?.count ?? 0;
  if (childCount >= 2) {
    tips.push(`자녀 ${childCount}명에게 각각 5,000만원씩 사전 증여하면 총 ${(childCount * 5000).toLocaleString()}만원을 추가 공제받을 수 있습니다.`);
  }

  if (taxableAmount > 3_000_000_000) {
    tips.push("과세표준이 30억을 초과합니다. 세무사와 상담하여 가업승계 특례, 영농상속 공제 등을 검토하세요.");
  }

  tips.push("상속세 신고 기한은 사망일로부터 6개월(해외 거주자는 9개월)입니다.");

  return tips;
}
