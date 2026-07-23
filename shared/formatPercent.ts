/**
 * 지분율 포맷 유틸리티
 * - 소수점 첫째 자리까지 표시 (정수도 .0 붙임)
 * - 소수 둘째 자리에서 반올림
 * - 최대 100.0%, 최소 0.0%
 */

/** 지분율 포맷: 10 → "10.0%", 23.33 → "23.3%" */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "0.0%";
  const rounded = Math.round(value * 10) / 10;
  return rounded.toFixed(1) + "%";
}

/** 지분율 합계 검증: 모든 상속자 지분 합계가 100.0%인지 확인 */
export function validateShareTotal(shares: (number | null | undefined)[]): {
  valid: boolean;
  total: number;
  message?: string;
} {
  const total: number = shares.reduce((sum: number, s) => sum + (s ?? 0), 0);
  const rounded = Math.round(total * 10) / 10;
  if (rounded !== 100.0) {
    return {
      valid: false,
      total: rounded,
      message: `지분 합계가 100.0%가 아닙니다: ${rounded.toFixed(1)}%`,
    };
  }
  return { valid: true, total: rounded };
}

/** 반올림 오차 자동 조정: 가장 큰 지분자에게 오차분 반영 */
export function adjustRounding(
  heirs: { sharePercent: number | null | undefined }[]
): { sharePercent: number }[] {
  const adjusted = heirs.map((h) => ({
    ...h,
    sharePercent: Math.round((h.sharePercent ?? 0) * 10) / 10,
  }));
  const total = adjusted.reduce((sum, h) => sum + h.sharePercent, 0);
  const diff = Math.round((100.0 - total) * 10) / 10;
  if (Math.abs(diff) > 0 && Math.abs(diff) < 0.5) {
    // 가장 큰 지분자에게 오차 반영
    let maxIdx = 0;
    for (let i = 1; i < adjusted.length; i++) {
      if (adjusted[i].sharePercent > adjusted[maxIdx].sharePercent) maxIdx = i;
    }
    adjusted[maxIdx].sharePercent =
      Math.round((adjusted[maxIdx].sharePercent + diff) * 10) / 10;
  }
  return adjusted as { sharePercent: number }[];
}
