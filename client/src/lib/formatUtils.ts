/**
 * 공통 포맷 유틸리티 함수
 * - 숫자 콤마 포맷
 * - 한국 원화 단위 표시 (만원/억원)
 * - 주민등록번호 자동 하이픈
 * - 전화번호 국가코드 목록
 */

// ── 숫자 콤마 포맷 ──────────────────────────────────────────────
export function formatNumberInput(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  if (!num) return "";
  return parseInt(num, 10).toLocaleString("ko-KR");
}

// ── 숫자 → 만원/억원 단위 표시 ──────────────────────────────────
export function formatKoreanUnit(val: string): string {
  const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
  if (!num || isNaN(num)) return "";
  if (num >= 100_000_000) {
    const eok = Math.floor(num / 100_000_000);
    const man = Math.floor((num % 100_000_000) / 10_000);
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
  }
  if (num >= 10_000) {
    const man = Math.floor(num / 10_000);
    const rest = num % 10_000;
    return rest > 0 ? `${man.toLocaleString()}만 ${rest.toLocaleString()}원` : `${man.toLocaleString()}만원`;
  }
  return `${num.toLocaleString()}원`;
}

// ── 주민등록번호 자동 하이픈 ────────────────────────────────────
export function formatRRN(val: string): string {
  const digits = val.replace(/[^0-9]/g, "").slice(0, 13);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)}-${digits.slice(6)}`;
}

// ── 전화번호 국가코드 목록 ───────────────────────────────────────
export const PHONE_CODES = [
  { code: "+82",  flag: "🇰🇷", name: "한국" },
  { code: "+1",   flag: "🇺🇸", name: "미국/캐나다" },
  { code: "+81",  flag: "🇯🇵", name: "일본" },
  { code: "+86",  flag: "🇨🇳", name: "중국" },
  { code: "+852", flag: "🇭🇰", name: "홍콩" },
  { code: "+886", flag: "🇹🇼", name: "대만" },
  { code: "+44",  flag: "🇬🇧", name: "영국" },
  { code: "+49",  flag: "🇩🇪", name: "독일" },
  { code: "+33",  flag: "🇫🇷", name: "프랑스" },
  { code: "+34",  flag: "🇪🇸", name: "스페인" },
  { code: "+966", flag: "🇸🇦", name: "사우디" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+61",  flag: "🇦🇺", name: "호주" },
  { code: "+91",  flag: "🇮🇳", name: "인도" },
  { code: "+55",  flag: "🇧🇷", name: "브라질" },
];

// ── 국가코드 → ISO 코드 변환 (GlobalAddressSearch용) ────────────
export const PHONE_CODE_TO_ISO: Record<string, string> = {
  "+82":  "KR",
  "+1":   "US",
  "+81":  "JP",
  "+86":  "CN",
  "+852": "HK",
  "+886": "TW",
  "+44":  "GB",
  "+49":  "DE",
  "+33":  "FR",
  "+34":  "ES",
  "+966": "SA",
  "+971": "AE",
  "+61":  "AU",
  "+91":  "IN",
  "+55":  "BR",
};

// ── 국가명 → ISO 코드 변환 ───────────────────────────────────────
export const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  "대한민국": "KR",
  "미국": "US",
  "일본": "JP",
  "중국": "CN",
  "홍콩": "HK",
  "대만": "TW",
  "영국": "GB",
  "독일": "DE",
  "프랑스": "FR",
  "스페인": "ES",
  "사우디": "SA",
  "UAE": "AE",
  "호주": "AU",
  "캐나다": "CA",
  "인도": "IN",
  "브라질": "BR",
  "기타": "US",
};

// ── 금액 입력 컴포넌트 공통 props ────────────────────────────────
export interface AmountInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  className?: string;
  unit?: string; // 기본 "원"
}
