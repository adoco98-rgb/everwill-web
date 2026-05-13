/**
 * 전화번호 입력 컴포넌트
 * - 국가코드 선택 드롭다운 (90px 고정)
 * - 전화번호 입력 (flex-1)
 * - 글로벌 대응
 */
import { PHONE_CODES } from "@/lib/formatUtils";

interface PhoneInputProps {
  countryCode: string;
  phone: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInput({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  placeholder = "010-0000-0000",
  disabled = false,
  className = "",
}: PhoneInputProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {/* 국가코드 선택 */}
      <select
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value)}
        disabled={disabled}
        style={{ width: "90px", flexShrink: 0 }}
        className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-[#1F3864] bg-white disabled:bg-gray-50 disabled:text-gray-400"
      >
        {PHONE_CODES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code}
          </option>
        ))}
      </select>
      {/* 전화번호 입력 */}
      <input
        type="tel"
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{ flex: 1, minWidth: 0 }}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864] disabled:bg-gray-50 disabled:text-gray-400"
      />
    </div>
  );
}
