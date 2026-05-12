/**
 * 유언 작성 마법사 - 사회기부 소개 섹션
 * Step6(기타 자산) 이후, Step7(특별 지시사항) 이전에 삽입
 * - 12개 분야 체크박스 + 금액 입력
 * - 기타 선택 시 단체명 직접 입력
 * - 최소 금액: 한국 ₩10,000 / 미국 $10 / 일본 ¥1,000 / 기타 동등 금액
 * - 건너뛰기 버튼 제공 (강제 아님)
 * - 11개 언어 i18n 지원
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronRight, SkipForward, Info, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import type { StepProps } from "./StepProps";

// ─────────────────────────────────────────────
// 기부 분야 정의
// ─────────────────────────────────────────────
const CHARITY_CATEGORIES = [
  { key: "education",   emoji: "📚" },
  { key: "children",    emoji: "👶" },
  { key: "elderly",     emoji: "👴" },
  { key: "disabled",    emoji: "♿" },
  { key: "medical",     emoji: "🏥" },
  { key: "environment", emoji: "🌿" },
  { key: "culture",     emoji: "🎨" },
  { key: "science",     emoji: "🔬" },
  { key: "animal",      emoji: "🐾" },
  { key: "disaster",    emoji: "🆘" },
  { key: "religion",    emoji: "🙏" },
  { key: "other",       emoji: "✏️" },
] as const;

type CharityCategory = typeof CHARITY_CATEGORIES[number]["key"];

// ─────────────────────────────────────────────
// 국가별 최소 금액 설정
// ─────────────────────────────────────────────
const MIN_AMOUNTS: Record<string, { amount: number; label: string }> = {
  ko: { amount: 10000,  label: "₩10,000" },
  ja: { amount: 1000,   label: "¥1,000" },
  zh: { amount: 100,    label: "¥100" },
  en: { amount: 10,     label: "$10" },
  de: { amount: 10,     label: "€10" },
  fr: { amount: 10,     label: "€10" },
  es: { amount: 10,     label: "$10" },
  ar: { amount: 10,     label: "$10" },
  ru: { amount: 1000,   label: "₽1,000" },
  hi: { amount: 100,    label: "₹100" },
  pt: { amount: 10,     label: "$10" },
};

/** 금액 포맷 (입력 중 콤마 표시) */
function formatAmount(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  return num ? Number(num).toLocaleString() : "";
}

// ─────────────────────────────────────────────
// WillCharityStep 컴포넌트
// ─────────────────────────────────────────────
export default function WillCharityStep({ onNext, onPrev }: StepProps) {
  const { t, language } = useLanguage();
  const wc = t.willCharity;
  const cats = t.charityPage.cats;
  const { isAuthenticated } = useAuth();

  // DB 데이터
  const { data: savedList = [], isLoading, refetch } = trpc.charity.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const upsertMutation = trpc.charity.upsert.useMutation({
    onSuccess: () => { toast.success(wc.toastSaved); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.charity.delete.useMutation({
    onSuccess: () => { toast.success(wc.toastDeleted); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // 로컬 상태
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [customOrg, setCustomOrg] = useState<Record<string, string>>({});

  // savedList 비동기 수신 후 로컬 상태 동기화
  useEffect(() => {
    if (savedList.length === 0) return;
    const newChecked: Record<string, boolean> = {};
    const newAmounts: Record<string, string> = {};
    const newCustomOrg: Record<string, string> = {};
    savedList.forEach((d) => {
      newChecked[d.category] = true;
      newAmounts[d.category] = d.amount > 0 ? d.amount.toLocaleString() : "";
      if (d.customOrgName) newCustomOrg[d.category] = d.customOrgName;
    });
    setChecked(newChecked);
    setAmounts(newAmounts);
    setCustomOrg(newCustomOrg);
  }, [savedList]);

  // 체크 토글
  const handleToggle = (key: string) => {
    const next = !checked[key];
    setChecked((prev) => ({ ...prev, [key]: next }));
    if (!next) {
      const existing = savedList.find((d) => d.category === key);
      if (existing) {
        deleteMutation.mutate({ category: key as CharityCategory });
      }
    }
  };

  // 저장
  const handleSave = (key: string) => {
    const rawAmount = (amounts[key] || "0").replace(/[^0-9]/g, "");
    const amount = parseInt(rawAmount, 10) || 0;
    const minInfo = MIN_AMOUNTS[language] ?? MIN_AMOUNTS["en"];

    if (amount <= 0) return toast.error(wc.errorAmount);
    if (amount < minInfo.amount) return toast.error(wc.errorMinAmount);
    if (key === "other" && !customOrg["other"]?.trim()) return toast.error(wc.errorOrgName);

    upsertMutation.mutate({
      category: key as CharityCategory,
      customOrgName: key === "other" ? customOrg["other"] : undefined,
      amount,
    });
  };

  // 총 기부 금액 합산
  const totalDonation = savedList.reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const minInfo = MIN_AMOUNTS[language] ?? MIN_AMOUNTS["en"];

  return (
    <div className="space-y-6">
      {/* ── 참고 정보 카드 ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-5"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-rose-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#1F3864] text-base mb-1">{wc.infoCard}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{wc.infoDesc}</p>
            {/* 통계 배지 */}
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white border border-rose-200 rounded-full px-3 py-1">
              <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs text-rose-600 font-medium">{wc.statText}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 총 기부 예정 금액 ── */}
      {totalDonation > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl p-4 flex items-center justify-between"
        >
          <span className="text-sm text-[#1F3864] font-medium">{wc.totalLabel}</span>
          <span className="text-lg font-bold text-[#C9A961]">
            {totalDonation.toLocaleString()}
          </span>
        </motion.div>
      )}

      {/* ── 분야 선택 안내 ── */}
      <div>
        <h4 className="font-semibold text-[#1F3864] text-sm mb-1">{wc.categoriesTitle}</h4>
        <p className="text-xs text-gray-500 mb-3">{wc.categoriesDesc}</p>

        {/* 로딩 상태 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {CHARITY_CATEGORIES.map((cat) => {
              const isChecked = !!checked[cat.key];
              const isSaved = savedList.some((d) => d.category === cat.key);
              const catLabel = cats[cat.key as keyof typeof cats] ?? cat.key;

              return (
                <div
                  key={cat.key}
                  className={`rounded-xl border-2 transition-all duration-200 ${
                    isChecked
                      ? "border-rose-300 bg-rose-50/50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {/* 체크박스 행 */}
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    onClick={() => handleToggle(cat.key)}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isChecked
                          ? "bg-rose-500 border-rose-500"
                          : "border-gray-300"
                      }`}
                    >
                      {isChecked && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </div>
                    <span className="text-lg">{cat.emoji}</span>
                    <span className="flex-1 font-semibold text-[#1F3864] text-sm">
                      {catLabel}
                    </span>
                    {isSaved && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                        {wc.savedBadge}
                      </span>
                    )}
                  </button>

                  {/* 체크 시 확장 영역 */}
                  <AnimatePresence>
                    {isChecked && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-rose-200/60 pt-3">
                          {/* 기타: 단체명 입력 */}
                          {cat.key === "other" && (
                            <div>
                              <label className="text-xs font-medium text-gray-600 mb-1 block">
                                {wc.orgNameLabel} *
                              </label>
                              <input
                                type="text"
                                placeholder={wc.orgNamePlaceholder}
                                value={customOrg["other"] ?? ""}
                                onChange={(e) =>
                                  setCustomOrg((prev) => ({
                                    ...prev,
                                    other: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                              />
                            </div>
                          )}

                          {/* 금액 입력 */}
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1 block">
                              {wc.amountLabel} *
                              <span className="text-gray-400 font-normal">
                                ({wc.minAmountNote})
                              </span>
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder={wc.amountPlaceholder}
                                value={amounts[cat.key] ?? ""}
                                onChange={(e) => {
                                  const formatted = formatAmount(e.target.value);
                                  setAmounts((prev) => ({
                                    ...prev,
                                    [cat.key]: formatted,
                                  }));
                                }}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                              />
                              <button
                                type="button"
                                onClick={() => handleSave(cat.key)}
                                disabled={
                                  upsertMutation.isPending ||
                                  deleteMutation.isPending
                                }
                                className="px-4 py-2 bg-[#1F3864] hover:bg-[#162a4e] text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 shrink-0"
                              >
                                {upsertMutation.isPending
                                  ? wc.savingBtn
                                  : isSaved
                                  ? wc.editBtn
                                  : wc.saveBtn}
                              </button>
                            </div>
                          </div>

                          {/* 저장된 금액 표시 */}
                          {isSaved && (
                            <div className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                              ✓ {wc.savedAmountPrefix}
                              {(
                                savedList.find((d) => d.category === cat.key)
                                  ?.amount ?? 0
                              ).toLocaleString()}
                              {cat.key === "other" &&
                                savedList.find((d) => d.category === "other")
                                  ?.customOrgName && (
                                  <span className="ml-2 text-gray-500">
                                    (
                                    {
                                      savedList.find(
                                        (d) => d.category === "other"
                                      )?.customOrgName
                                    }
                                    )
                                  </span>
                                )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── EverWill 약속 안내 ── */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">{wc.pledgeNote}</p>
      </div>

      {/* ── 하단 버튼 ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        {/* 건너뛰기 버튼 */}
        <button
          type="button"
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          {wc.skipBtn}
        </button>

        {/* 다음 단계 버튼 */}
        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#1F3864] hover:bg-[#162a4e] text-white text-sm font-semibold transition-colors"
        >
          {wc.nextBtn}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
