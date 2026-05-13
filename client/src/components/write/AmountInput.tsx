/**
 * 금액 입력 컴포넌트
 * - 숫자 입력 시 자동 콤마 삽입
 * - 만원/억원 단위 자동 표시
 * - unit prop으로 "원" / "주" 전환 가능
 */
import { formatNumberInput, formatKoreanUnit } from "@/lib/formatUtils";

interface AmountInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  className?: string;
  unit?: "원" | "주" | string;
  showUnit?: boolean;
}

export default function AmountInput({
  value,
  onChange,
  placeholder = "금액 입력",
  className = "",
  unit = "원",
  showUnit = true,
}: AmountInputProps) {
  const isShares = unit === "주";

  return (
    <div className="space-y-1">
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={formatNumberInput(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, "");
            onChange(raw);
          }}
          placeholder={placeholder}
          className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864] pr-10 ${className}`}
        />
        {showUnit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
      {/* 단위 표시 */}
      {value && (
        <p className="text-xs text-[#C9A961] font-semibold ml-1">
          {isShares
            ? `${parseInt(value, 10).toLocaleString("ko-KR")}주 보유`
            : formatKoreanUnit(value)
              ? `≈ ${formatKoreanUnit(value)}`
              : ""}
        </p>
      )}
    </div>
  );
}
