/**
 * 한국 상속세 계산 로직 테스트
 * 상속세 및 증여세법 2024년 기준
 */
import { describe, expect, it } from "vitest";
import { calculateKoreanInheritanceTax } from "./tax/koreanInheritanceTax";

describe("한국 상속세 계산", () => {
  it("상속재산 5억 이하 - 일괄공제로 세금 0원", () => {
    const result = calculateKoreanInheritanceTax(
      {
        realEstate: 300_000_000,
        financialAssets: 100_000_000,
        businessAssets: 0,
        otherAssets: 0,
        debts: 0,
        funeralExpenses: 15_000_000,
      },
      [{ relation: "child", count: 1 }],
      70
    );
    // 총 재산 4억, 일괄공제 5억 → 과세표준 0 → 세금 0
    expect(result.taxableAmount).toBe(0);
    expect(result.finalTax).toBe(0);
  });

  it("상속재산 10억 - 자녀 1명 세금 계산", () => {
    const result = calculateKoreanInheritanceTax(
      {
        realEstate: 800_000_000,
        financialAssets: 200_000_000,
        businessAssets: 0,
        otherAssets: 0,
        debts: 0,
        funeralExpenses: 15_000_000,
      },
      [{ relation: "child", count: 1 }],
      70
    );
    // 총 재산 10억
    expect(result.totalAssets).toBe(1_000_000_000);
    // 과세표준 > 0
    expect(result.taxableAmount).toBeGreaterThan(0);
    // 세금 > 0
    expect(result.finalTax).toBeGreaterThan(0);
    // 신고세액공제 3% 적용 확인
    expect(result.reportingDeduction).toBeGreaterThan(0);
  });

  it("배우자 있을 때 공제 증가 확인", () => {
    const withSpouse = calculateKoreanInheritanceTax(
      { realEstate: 1_000_000_000, financialAssets: 0, businessAssets: 0, otherAssets: 0, debts: 0, funeralExpenses: 15_000_000 },
      [{ relation: "spouse", count: 1 }, { relation: "child", count: 1 }],
      70
    );
    const withoutSpouse = calculateKoreanInheritanceTax(
      { realEstate: 1_000_000_000, financialAssets: 0, businessAssets: 0, otherAssets: 0, debts: 0, funeralExpenses: 15_000_000 },
      [{ relation: "child", count: 1 }],
      70
    );
    // 배우자 있을 때 공제가 더 크고 세금이 더 적어야 함
    expect(withSpouse.deductions.totalDeduction).toBeGreaterThan(withoutSpouse.deductions.totalDeduction);
    expect(withSpouse.finalTax).toBeLessThan(withoutSpouse.finalTax);
  });

  it("세대생략 할증 30% 적용 확인", () => {
    const normal = calculateKoreanInheritanceTax(
      { realEstate: 1_000_000_000, financialAssets: 0, businessAssets: 0, otherAssets: 0, debts: 0, funeralExpenses: 15_000_000 },
      [{ relation: "child", count: 1 }],
      70,
      false
    );
    const withSkip = calculateKoreanInheritanceTax(
      { realEstate: 1_000_000_000, financialAssets: 0, businessAssets: 0, otherAssets: 0, debts: 0, funeralExpenses: 15_000_000 },
      [{ relation: "child", count: 1 }],
      70,
      true
    );
    // 세대생략 시 세금이 더 많아야 함
    expect(withSkip.finalTax).toBeGreaterThan(normal.finalTax);
    expect(withSkip.generationSkipSurcharge).toBeGreaterThan(0);
  });

  it("금융재산 공제 20% 최대 2억 적용 확인", () => {
    const result = calculateKoreanInheritanceTax(
      { realEstate: 0, financialAssets: 2_000_000_000, businessAssets: 0, otherAssets: 0, debts: 0, funeralExpenses: 15_000_000 },
      [{ relation: "child", count: 1 }],
      70
    );
    // 금융재산 20억 → 공제 최대 2억
    expect(result.deductions.financialDeduction).toBe(200_000_000);
  });

  it("채무 공제 적용 확인", () => {
    const withDebt = calculateKoreanInheritanceTax(
      { realEstate: 1_000_000_000, financialAssets: 0, businessAssets: 0, otherAssets: 0, debts: 200_000_000, funeralExpenses: 15_000_000 },
      [{ relation: "child", count: 1 }],
      70
    );
    const withoutDebt = calculateKoreanInheritanceTax(
      { realEstate: 1_000_000_000, financialAssets: 0, businessAssets: 0, otherAssets: 0, debts: 0, funeralExpenses: 15_000_000 },
      [{ relation: "child", count: 1 }],
      70
    );
    // 채무 있을 때 세금이 더 적어야 함
    expect(withDebt.finalTax).toBeLessThan(withoutDebt.finalTax);
    expect(withDebt.deductions.debtDeduction).toBe(200_000_000);
  });

  it("절세 팁이 생성되어야 함", () => {
    const result = calculateKoreanInheritanceTax(
      { realEstate: 1_000_000_000, financialAssets: 100_000_000, businessAssets: 0, otherAssets: 0, debts: 0, funeralExpenses: 15_000_000 },
      [{ relation: "child", count: 2 }],
      70
    );
    expect(result.taxSavingTips.length).toBeGreaterThan(0);
  });
});
