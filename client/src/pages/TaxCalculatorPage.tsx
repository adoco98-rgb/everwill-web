/**
 * 한국 상속세 자동 계산기 페이지
 * 경로: /tax
 * 상속세 및 증여세법 2024년 기준
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Calculator, FileText, Lightbulb, ChevronDown, ChevronUp, Download, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── 타입 ───
interface AssetForm {
  realEstate: string;
  financialAssets: string;
  businessAssets: string;
  otherAssets: string;
  debts: string;
  funeralExpenses: string;
}

interface HeirForm {
  relation: "spouse" | "child" | "parent" | "sibling" | "other";
  count: number;
  enabled: boolean;
}

// ─── 숫자 포맷 헬퍼 ───
const formatKRW = (n: number) => {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}억원`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
};

const parseAmount = (s: string): number => {
  const cleaned = s.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) * 10_000 || 0; // 만원 단위 입력
};

export default function TaxCalculatorPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"input" | "result">("input");
  const [showAIAdvice, setShowAIAdvice] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");

  const [assets, setAssets] = useState<AssetForm>({
    realEstate: "",
    financialAssets: "",
    businessAssets: "",
    otherAssets: "",
    debts: "",
    funeralExpenses: "150",
  });

  const [heirs, setHeirs] = useState<HeirForm[]>([
    { relation: "spouse", count: 1, enabled: false },
    { relation: "child", count: 1, enabled: false },
    { relation: "parent", count: 2, enabled: false },
    { relation: "sibling", count: 1, enabled: false },
  ]);

  const [deceasedAge, setDeceasedAge] = useState("70");
  const [isGenerationSkip, setIsGenerationSkip] = useState(false);

  const calculateMutation = trpc.tax.calculateKorean.useMutation({
    onSuccess: () => setStep("result"),
    onError: () => toast.error("계산 중 오류가 발생했습니다."),
  });

  const aiAdviceMutation = trpc.tax.getAIAdvice.useMutation({
    onSuccess: (data) => {
      setAiAdvice(data.advice as string);
      setShowAIAdvice(true);
    },
    onError: () => toast.error("AI 조언을 가져오지 못했습니다."),
  });

  const handleCalculate = () => {
    const enabledHeirs = heirs
      .filter(h => h.enabled)
      .map(h => ({ relation: h.relation, count: h.count }));

    if (enabledHeirs.length === 0) {
      toast.error("상속인을 1명 이상 선택해주세요.");
      return;
    }

    const totalAssets = parseAmount(assets.realEstate) +
      parseAmount(assets.financialAssets) +
      parseAmount(assets.businessAssets) +
      parseAmount(assets.otherAssets);

    if (totalAssets === 0) {
      toast.error("자산을 1개 이상 입력해주세요.");
      return;
    }

    calculateMutation.mutate({
      assets: {
        realEstate: parseAmount(assets.realEstate),
        financialAssets: parseAmount(assets.financialAssets),
        businessAssets: parseAmount(assets.businessAssets),
        otherAssets: parseAmount(assets.otherAssets),
        debts: parseAmount(assets.debts),
        funeralExpenses: parseAmount(assets.funeralExpenses),
      },
      heirs: enabledHeirs,
      deceasedAge: parseInt(deceasedAge) || 70,
      isGenerationSkip,
    });
  };

  const result = calculateMutation.data?.result;

  const heirLabels: Record<string, string> = {
    spouse: "배우자",
    child: "자녀",
    parent: "부모",
    sibling: "형제자매",
    other: "기타",
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <header className="bg-[#1F3864] text-white px-4 py-4 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[#C9A961]/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-[#C9A961]" />
          </div>
          <div>
            <h1 className="font-bold text-base">한국 상속세 자동 계산기</h1>
            <p className="text-white/60 text-xs">상속세 및 증여세법 2024년 기준</p>
          </div>
          {step === "result" && (
            <button
              onClick={() => setStep("input")}
              className="ml-auto text-xs text-[#C9A961] border border-[#C9A961]/30 px-3 py-1.5 rounded-full hover:bg-[#C9A961]/10 transition-colors"
            >
              다시 계산
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* 안내 배너 */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <strong>금액은 만원 단위로 입력하세요.</strong> 예: 5억원 → 50000 입력
                  <br />본 계산기는 참고용이며 실제 세액은 세무사 확인이 필요합니다.
                </div>
              </div>

              {/* 피상속인 나이 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#1F3864] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1F3864] text-white rounded-full text-xs flex items-center justify-center">1</span>
                  피상속인 정보
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-1.5 block">사망 당시 나이</label>
                    <input
                      type="number"
                      value={deceasedAge}
                      onChange={e => setDeceasedAge(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
                      placeholder="70"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isGenerationSkip}
                        onChange={e => setIsGenerationSkip(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-600">세대생략 상속 (+30%)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 상속 재산 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#1F3864] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1F3864] text-white rounded-full text-xs flex items-center justify-center">2</span>
                  상속 재산 (만원 단위)
                </h2>
                <div className="space-y-3">
                  {[
                    { key: "realEstate", label: "🏠 부동산", placeholder: "예: 50000 (5억원)" },
                    { key: "financialAssets", label: "💰 금융자산 (예금·주식·보험)", placeholder: "예: 10000 (1억원)" },
                    { key: "businessAssets", label: "🏢 사업용 자산", placeholder: "예: 20000 (2억원)" },
                    { key: "otherAssets", label: "📦 기타 자산", placeholder: "예: 5000 (5천만원)" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-44 flex-shrink-0">{label}</label>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={assets[key as keyof AssetForm]}
                          onChange={e => setAssets(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] pr-12"
                          placeholder={placeholder}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                      </div>
                    </div>
                  ))}
                  <hr className="border-gray-100" />
                  {[
                    { key: "debts", label: "📋 채무 (부채)", placeholder: "예: 5000 (5천만원)" },
                    { key: "funeralExpenses", label: "⚰️ 장례비용 (최대 1,500만원)", placeholder: "150" },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-sm text-gray-700 w-44 flex-shrink-0">{label}</label>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={assets[key as keyof AssetForm]}
                          onChange={e => setAssets(prev => ({ ...prev, [key]: e.target.value }))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] pr-12"
                          placeholder={placeholder}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">만원</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상속인 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="font-bold text-[#1F3864] mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-[#1F3864] text-white rounded-full text-xs flex items-center justify-center">3</span>
                  상속인 구성
                </h2>
                <div className="space-y-3">
                  {heirs.map((heir, i) => (
                    <div key={heir.relation} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${heir.enabled ? "border-[#1F3864]/30 bg-[#1F3864]/3" : "border-gray-100"}`}>
                      <input
                        type="checkbox"
                        checked={heir.enabled}
                        onChange={e => setHeirs(prev => prev.map((h, j) => j === i ? { ...h, enabled: e.target.checked } : h))}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700 w-20">{heirLabels[heir.relation]}</span>
                      {heir.relation !== "spouse" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setHeirs(prev => prev.map((h, j) => j === i ? { ...h, count: Math.max(1, h.count - 1) } : h))}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                          >-</button>
                          <span className="text-sm font-bold text-[#1F3864] w-6 text-center">{heir.count}</span>
                          <button
                            onClick={() => setHeirs(prev => prev.map((h, j) => j === i ? { ...h, count: h.count + 1 } : h))}
                            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                          >+</button>
                          <span className="text-xs text-gray-400">명</span>
                        </div>
                      )}
                      {heir.relation === "spouse" && (
                        <span className="text-xs text-gray-400">배우자 공제 최소 5억원 적용</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 계산 버튼 */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
                className="w-full bg-[#1F3864] hover:bg-[#162d52] disabled:opacity-60 text-white font-bold py-4 rounded-2xl text-base transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                {calculateMutation.isPending ? "계산 중..." : "상속세 자동 계산하기"}
              </motion.button>
            </motion.div>
          )}

          {step === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* 최종 세액 요약 */}
              <div className="bg-[#1F3864] rounded-2xl p-6 text-white">
                <p className="text-white/60 text-sm mb-1">예상 상속세 (신고 시 3% 공제 적용)</p>
                <p className="text-4xl font-bold text-[#C9A961] mb-1">{formatKRW(result.finalTax)}</p>
                <p className="text-white/60 text-sm">유효세율 {result.effectiveRate.toFixed(1)}% · 총 상속재산 {formatKRW(result.totalAssets)}</p>
              </div>

              {/* 계산 상세 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1F3864] mb-4">계산 상세 내역</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-600">총 상속재산</span>
                    <span className="font-semibold">{formatKRW(result.totalAssets)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50 text-red-500">
                    <span>(-) 총 공제액</span>
                    <span className="font-semibold">- {formatKRW(result.deductions.totalDeduction)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-600">과세표준</span>
                    <span className="font-semibold">{formatKRW(result.taxableAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-600">산출세액</span>
                    <span className="font-semibold">{formatKRW(result.calculatedTax)}</span>
                  </div>
                  {result.generationSkipSurcharge > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-50 text-orange-500">
                      <span>(+) 세대생략 할증 30%</span>
                      <span className="font-semibold">+ {formatKRW(result.generationSkipSurcharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-gray-50 text-green-600">
                    <span>(-) 신고세액공제 3%</span>
                    <span className="font-semibold">- {formatKRW(result.reportingDeduction)}</span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-[#1F3864]">
                    <span>최종 납부세액</span>
                    <span className="text-[#C9A961]">{formatKRW(result.finalTax)}</span>
                  </div>
                </div>
              </div>

              {/* 공제 내역 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-[#1F3864] mb-4">공제 내역</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "기초·인적공제 (일괄공제 5억 적용)", value: result.deductions.basicDeduction },
                    { label: "배우자 공제", value: result.deductions.spouseDeduction },
                    { label: "금융재산 공제 (20%)", value: result.deductions.financialDeduction },
                    { label: "채무 공제", value: result.deductions.debtDeduction },
                    { label: "장례비용 공제", value: result.deductions.funeralDeduction },
                  ].filter(d => d.value > 0).map(d => (
                    <div key={d.label} className="flex justify-between py-1.5 border-b border-gray-50">
                      <span className="text-gray-600">{d.label}</span>
                      <span className="text-green-600 font-medium">- {formatKRW(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상속인별 납부세액 */}
              {result.heirTaxes.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-[#1F3864] mb-4">상속인별 납부세액 (법정상속분 기준)</h3>
                  <div className="space-y-2">
                    {result.heirTaxes.map((h, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{h.relation}</p>
                          <p className="text-xs text-gray-500">법정상속분 {h.share.toFixed(1)}%</p>
                        </div>
                        <p className="font-bold text-[#1F3864]">{formatKRW(h.tax)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 절세 팁 */}
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  절세 체크리스트
                </h3>
                <ul className="space-y-2">
                  {result.taxSavingTips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-amber-700">
                      <span className="text-amber-400 flex-shrink-0">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI 절세 전략 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => {
                    if (!aiAdvice) {
                      aiAdviceMutation.mutate({
                        totalAssets: result.totalAssets,
                        finalTax: result.finalTax,
                        effectiveRate: result.effectiveRate,
                        hasSpouse: heirs.find(h => h.relation === "spouse")?.enabled ?? false,
                        childCount: heirs.find(h => h.relation === "child")?.count ?? 0,
                      });
                    } else {
                      setShowAIAdvice(prev => !prev);
                    }
                  }}
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[#1F3864] text-sm">AI 맞춤 절세 전략 받기</p>
                      <p className="text-xs text-gray-400">AI 세무사가 개인 맞춤 전략을 제안합니다</p>
                    </div>
                  </div>
                  {aiAdviceMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                  ) : showAIAdvice ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {showAIAdvice && aiAdvice && (
                  <div className="px-5 pb-5 border-t border-gray-50">
                    <div className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {aiAdvice}
                    </div>
                  </div>
                )}
              </div>

              {/* 신고서 생성 버튼 */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/tax/report")}
                  className="flex items-center justify-center gap-2 bg-[#C9A961] hover:bg-[#b8954f] text-white font-bold py-4 rounded-2xl text-sm transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  신고서 PDF 생성
                </button>
                <button
                  onClick={() => navigate("/write")}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-[#1F3864] text-[#1F3864] font-bold py-4 rounded-2xl text-sm transition-colors hover:bg-[#1F3864]/5"
                >
                  유언장 작성하기
                </button>
              </div>

              {/* 법적 고지 */}
              <p className="text-center text-xs text-gray-400 pb-4">
                본 계산기는 참고용이며 실제 세액과 다를 수 있습니다. 정확한 세액은 세무사 또는 국세청에 문의하세요.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
