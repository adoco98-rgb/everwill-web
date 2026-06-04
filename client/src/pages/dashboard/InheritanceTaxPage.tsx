/**
 * 상속세 계산기 페이지 (/dashboard/inheritance-tax)
 * 한국 상속세 기본 계산 (2024년 기준)
 */
import { motion } from "framer-motion";
import { Calculator, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

/** 상속세 세율 구간 (2024년 기준) */
const TAX_BRACKETS = [
  { limit: 100_000_000, rate: 0.1, deduction: 0 },
  { limit: 500_000_000, rate: 0.2, deduction: 10_000_000 },
  { limit: 1_000_000_000, rate: 0.3, deduction: 60_000_000 },
  { limit: 3_000_000_000, rate: 0.4, deduction: 160_000_000 },
  { limit: Infinity, rate: 0.5, deduction: 460_000_000 },
];

/** 상속세 계산 */
function calcInheritanceTax(taxableAmount: number): number {
  if (taxableAmount <= 0) return 0;
  for (const bracket of TAX_BRACKETS) {
    if (taxableAmount <= bracket.limit) {
      return taxableAmount * bracket.rate - bracket.deduction;
    }
  }
  return taxableAmount * 0.5 - 460_000_000;
}

/** 숫자 포맷 */
const fmt = (n: number) =>
  n >= 100_000_000
    ? `${(n / 100_000_000).toFixed(2)}억 원`
    : `${n.toLocaleString("ko-KR")}원`;

export default function InheritanceTaxPage() {
  const [totalAssets, setTotalAssets] = useState("");
  const [debts, setDebts] = useState("");
  const [spouseExists, setSpouseExists] = useState(true);
  const [childCount, setChildCount] = useState(1);
  const [showDetail, setShowDetail] = useState(false);

  const parseKRW = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  };

  const totalAssetsNum = parseKRW(totalAssets);
  const debtsNum = parseKRW(debts);

  // 기본 공제
  const basicDeduction = 200_000_000; // 기초공제 2억
  const spouseDeduction = spouseExists ? 500_000_000 : 0; // 배우자 공제 최소 5억
  const perPersonDeduction = 50_000_000; // 인적공제 1인당 5천만
  const totalPersonDeduction = perPersonDeduction * (childCount + (spouseExists ? 1 : 0));
  const totalDeduction = Math.max(basicDeduction + totalPersonDeduction, 500_000_000) + spouseDeduction;

  // 과세표준
  const netAssets = Math.max(totalAssetsNum - debtsNum, 0);
  const taxableBase = Math.max(netAssets - totalDeduction, 0);

  // 세액
  const taxAmount = calcInheritanceTax(taxableBase);
  const effectiveRate = taxableBase > 0 ? ((taxAmount / taxableBase) * 100).toFixed(1) : "0";

  const formatInput = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "");
    return digits ? parseInt(digits, 10).toLocaleString("ko-KR") : "";
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-1">
          <Calculator className="w-5 h-5 text-[#1F3864]" />
          <h1 className="text-xl font-bold text-[#1F3864]">상속세 계산기</h1>
        </div>
        <p className="text-gray-500 text-sm">2024년 기준 한국 상속세 간편 계산 (참고용)</p>
      </motion.div>

      {/* 입력 폼 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
      >
        <h2 className="font-bold text-[#1F3864] text-sm">자산 정보 입력</h2>

        {/* 총 자산 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">총 상속 자산</label>
          <div className="relative">
            <input
              type="text"
              value={totalAssets}
              onChange={(e) => setTotalAssets(formatInput(e.target.value))}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
          </div>
          {totalAssetsNum > 0 && (
            <p className="text-xs text-[#C9A961] mt-1">{fmt(totalAssetsNum)}</p>
          )}
        </div>

        {/* 채무 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">채무·장례비용 (공제)</label>
          <div className="relative">
            <input
              type="text"
              value={debts}
              onChange={(e) => setDebts(formatInput(e.target.value))}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">원</span>
          </div>
        </div>

        {/* 배우자 여부 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">배우자 생존 여부</label>
          <div className="flex gap-3">
            {[
              { label: "있음", value: true },
              { label: "없음", value: false },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setSpouseExists(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  spouseExists === opt.value
                    ? "bg-[#1F3864] text-white border-[#1F3864]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1F3864]/30"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 자녀 수 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            자녀 수 <span className="text-gray-400 font-normal">(성년 기준)</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setChildCount(Math.max(0, childCount - 1))}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold text-lg"
            >
              −
            </button>
            <span className="text-2xl font-bold text-[#1F3864] w-8 text-center">{childCount}</span>
            <button
              onClick={() => setChildCount(childCount + 1)}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold text-lg"
            >
              +
            </button>
            <span className="text-sm text-gray-500">명</span>
          </div>
        </div>
      </motion.div>

      {/* 계산 결과 */}
      {totalAssetsNum > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#1F3864] to-[#243d72] rounded-2xl p-6 text-white"
        >
          <h2 className="font-bold text-white/80 text-sm mb-4">계산 결과 (참고용)</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">순 상속재산</span>
              <span className="font-semibold text-white">{fmt(netAssets)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">총 공제액</span>
              <span className="font-semibold text-white">− {fmt(totalDeduction)}</span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between items-center">
              <span className="text-white/70 text-sm">과세표준</span>
              <span className="font-semibold text-white">{fmt(taxableBase)}</span>
            </div>
          </div>

          <div className="mt-5 bg-white/10 rounded-xl p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/60 text-xs mb-1">예상 상속세</p>
                <p className="text-3xl font-bold text-[#C9A961]">
                  {taxAmount > 0 ? fmt(Math.max(taxAmount, 0)) : "없음"}
                </p>
              </div>
              {taxableBase > 0 && (
                <div className="text-right">
                  <p className="text-white/60 text-xs mb-1">실효세율</p>
                  <p className="text-xl font-bold text-white">{effectiveRate}%</p>
                </div>
              )}
            </div>
          </div>

          {/* 상세 내역 토글 */}
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-white/60 text-xs hover:text-white/80 transition-colors"
          >
            {showDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            공제 상세 내역
          </button>

          {showDetail && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 space-y-2 text-xs text-white/70"
            >
              <div className="flex justify-between">
                <span>기초공제 (2억)</span>
                <span>{fmt(basicDeduction)}</span>
              </div>
              {spouseExists && (
                <div className="flex justify-between">
                  <span>배우자공제 (최소 5억)</span>
                  <span>{fmt(spouseDeduction)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>인적공제 ({childCount + (spouseExists ? 1 : 0)}명 × 5천만)</span>
                <span>{fmt(totalPersonDeduction)}</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* 면책 안내 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4"
      >
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          본 계산기는 <strong>참고용</strong>이며 실제 세액과 다를 수 있습니다.
          정확한 상속세 신고는 세무사 또는 EverWill 제휴 전문가와 상담하세요.
          금융재산 공제, 가업상속 공제 등 특수 공제는 반영되지 않습니다.
        </p>
      </motion.div>
    </div>
  );
}
