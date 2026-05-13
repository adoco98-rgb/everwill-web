/**
 * 유언 작성 마법사 - 사회기부 유언 단계 (Step 7)
 * 선택한 분야만 법적 유언 문서에 반영
 * 단체 직접 지정: 단체명 + 주소 + 연락처
 * 미지정 시 EverWill 사회적후원 운영위원회에 집행 일임
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, ChevronRight, SkipForward, Info,
  Building2, MapPin, Phone, CheckCircle2, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import type { StepProps } from "./StepProps";

const CHARITY_CATEGORIES = [
  { key: "education",   emoji: "📚", label: "교육" },
  { key: "children",    emoji: "👶", label: "아동·청소년" },
  { key: "elderly",     emoji: "👴", label: "노인 복지" },
  { key: "disabled",    emoji: "♿", label: "장애인" },
  { key: "medical",     emoji: "🏥", label: "의료·보건" },
  { key: "environment", emoji: "🌿", label: "환경·기후" },
  { key: "culture",     emoji: "🎨", label: "문화·예술" },
  { key: "science",     emoji: "🔬", label: "과학·기술" },
  { key: "animal",      emoji: "🐾", label: "동물 복지" },
  { key: "disaster",    emoji: "🆘", label: "재난·긴급구호" },
  { key: "religion",    emoji: "🙏", label: "종교·사회봉사" },
  { key: "other",       emoji: "✏️", label: "기타" },
] as const;

type CategoryKey = typeof CHARITY_CATEGORIES[number]["key"];

function formatAmount(val: string): string {
  const num = val.replace(/[^0-9]/g, "");
  return num ? Number(num).toLocaleString() : "";
}

export default function WillCharityStep({ onNext }: StepProps) {
  const { t } = useLanguage();
  const cats = (t.charityPage?.cats ?? {}) as Record<string, string>;
  const { isAuthenticated } = useAuth();

  const { data: savedList = [], isLoading, refetch } = trpc.charity.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const upsertMutation = trpc.charity.upsert.useMutation({
    onSuccess: () => { toast.success("기부 유언이 저장되었습니다"); refetch(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.charity.delete.useMutation({
    onSuccess: () => { toast.success("기부 유언이 삭제되었습니다"); refetch(); },
    onError: () => {},
  });

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [hasSpecificOrg, setHasSpecificOrg] = useState<Record<string, boolean>>({});
  const [orgName, setOrgName] = useState<Record<string, string>>({});
  const [orgAddress, setOrgAddress] = useState<Record<string, string>>({});
  const [orgPhone, setOrgPhone] = useState<Record<string, string>>({});
  const [orgPanelOpen, setOrgPanelOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (savedList.length === 0) return;
    const nc: Record<string, boolean> = {};
    const na: Record<string, string> = {};
    const nh: Record<string, boolean> = {};
    const no: Record<string, string> = {};
    const noa: Record<string, string> = {};
    const nop: Record<string, string> = {};
    savedList.forEach((d) => {
      nc[d.category] = true;
      na[d.category] = d.amount > 0 ? d.amount.toLocaleString() : "";
      nh[d.category] = !!d.hasSpecificOrg;
      no[d.category] = d.customOrgName ?? "";
      noa[d.category] = d.orgAddress ?? "";
      nop[d.category] = d.orgPhone ?? "";
    });
    setChecked(nc); setAmounts(na); setHasSpecificOrg(nh);
    setOrgName(no); setOrgAddress(noa); setOrgPhone(nop);
  }, [savedList]);

  const handleToggle = (key: string) => {
    const next = !checked[key];
    setChecked((p) => ({ ...p, [key]: next }));
    if (!next) deleteMutation.mutate({ category: key as CategoryKey });
  };

  const handleSave = (key: string) => {
    const rawAmount = (amounts[key] ?? "").replace(/,/g, "");
    const numAmount = parseInt(rawAmount, 10);
    if (!rawAmount || isNaN(numAmount) || numAmount < 1) {
      toast.error("기부 금액을 입력해주세요"); return;
    }
    if (hasSpecificOrg[key] && !orgName[key]?.trim()) {
      toast.error("단체명을 입력해주세요"); return;
    }
    upsertMutation.mutate({
      category: key as CategoryKey,
      hasSpecificOrg: !!hasSpecificOrg[key],
      customOrgName: hasSpecificOrg[key] ? orgName[key] : undefined,
      orgAddress: hasSpecificOrg[key] ? orgAddress[key] : undefined,
      orgPhone: hasSpecificOrg[key] ? orgPhone[key] : undefined,
      amount: numAmount,
    });
  };

  const isSaved = (key: string) => savedList.some((d) => d.category === key);
  const totalAmount = savedList.reduce((s, d) => s + d.amount, 0);
  const selectedCount = Object.values(checked).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* 헤더 안내 */}
      <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 rounded-2xl p-4">
        <Heart className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-rose-700 text-sm">사회기부 유언 (선택 사항)</p>
          <p className="text-xs text-rose-600 mt-1 leading-relaxed">
            후원하고 싶은 분야를 선택하고 금액을 입력하세요.
            선택한 내용만 사회기부 유언 문서에 포함됩니다.
          </p>
        </div>
      </div>

      {/* 분야 선택 그리드 */}
      <div>
        <p className="text-sm font-semibold text-[#1F3864] mb-3">후원 분야 선택</p>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CHARITY_CATEGORIES.map((cat) => {
              const label = cats[cat.key] ?? cat.label;
              const isChecked = !!checked[cat.key];
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleToggle(cat.key)}
                  className={[
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                    isChecked
                      ? "bg-rose-50 border-rose-300 text-rose-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-rose-200 hover:bg-rose-50/50",
                  ].join(" ")}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="flex-1 leading-tight">{label}</span>
                  {isChecked && <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 선택된 분야별 입력 */}
      <AnimatePresence>
        {CHARITY_CATEGORIES.filter((cat) => checked[cat.key]).map((cat) => {
          const label = cats[cat.key] ?? cat.label;
          const saved = savedList.find((d) => d.category === cat.key);
          const isOrgOpen = !!orgPanelOpen[cat.key];
          const isSpecific = !!hasSpecificOrg[cat.key];
          return (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* 분야 헤더 */}
              <div className="bg-rose-50 px-4 py-3 flex items-center gap-2">
                <span className="text-lg">{cat.emoji}</span>
                <span className="font-semibold text-rose-700 text-sm">{label} 분야 기부</span>
                {isSaved(cat.key) && (
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    ✓ 저장됨
                  </span>
                )}
              </div>

              <div className="p-4 space-y-4">
                {/* 금액 입력 */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    기부 금액 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₩</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="10,000,000"
                        value={amounts[cat.key] ?? ""}
                        onChange={(e) => setAmounts((p) => ({ ...p, [cat.key]: formatAmount(e.target.value) }))}
                        className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSave(cat.key)}
                      disabled={upsertMutation.isPending}
                      className="px-4 py-2.5 bg-[#1F3864] hover:bg-[#162a4e] text-white text-sm rounded-xl font-medium transition-colors disabled:opacity-50 shrink-0"
                    >
                      {upsertMutation.isPending ? "저장 중..." : isSaved(cat.key) ? "수정" : "저장"}
                    </button>
                  </div>
                </div>

                {/* 단체 직접 지정 토글 */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOrgPanelOpen((p) => ({ ...p, [cat.key]: !p[cat.key] }))}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
                  >
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-600">
                      {isSpecific
                        ? ("단체 지정: " + (orgName[cat.key] || "미입력"))
                        : "특정 단체 직접 지정 (선택)"}
                    </span>
                    <span className="ml-auto text-gray-400">
                      {isOrgOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOrgOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3 border-t border-gray-100">
                          {/* 직접 지정 체크 */}
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSpecific}
                              onChange={(e) => setHasSpecificOrg((p) => ({ ...p, [cat.key]: e.target.checked }))}
                              className="w-4 h-4 accent-rose-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">특정 단체를 직접 지정합니다</span>
                          </label>

                          {isSpecific && (
                            <div className="space-y-3 pl-6">
                              {/* 단체명 */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  단체명 <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="예: 사랑의 열매 사회복지공동모금회"
                                  value={orgName[cat.key] ?? ""}
                                  onChange={(e) => setOrgName((p) => ({ ...p, [cat.key]: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                />
                              </div>
                              {/* 단체 주소 */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> 단체 주소
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  placeholder="예: 서울특별시 중구 남대문로 120"
                                  value={orgAddress[cat.key] ?? ""}
                                  onChange={(e) => setOrgAddress((p) => ({ ...p, [cat.key]: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                />
                              </div>
                              {/* 단체 연락처 */}
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> 단체 연락처
                                  </span>
                                </label>
                                <input
                                  type="tel"
                                  placeholder="예: 02-1234-5678"
                                  value={orgPhone[cat.key] ?? ""}
                                  onChange={(e) => setOrgPhone((p) => ({ ...p, [cat.key]: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                />
                              </div>
                            </div>
                          )}

                          {/* 미지정 안내 */}
                          {!isSpecific && (
                            <div className="flex items-start gap-2 bg-blue-50 rounded-xl px-3 py-2.5">
                              <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                              <p className="text-xs text-blue-700 leading-relaxed">
                                단체를 지정하지 않으면 <strong>EverWill 사회적후원 운영위원회</strong>가
                                해당 분야의 검증된 단체를 선정하여 투명하게 집행합니다.
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 저장된 정보 요약 */}
                {saved && (
                  <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 text-xs text-green-700 space-y-1">
                    <p className="font-semibold">✓ 저장된 기부 유언</p>
                    <p>금액: ₩{saved.amount.toLocaleString()}</p>
                    {saved.hasSpecificOrg && saved.customOrgName && <p>지정 단체: {saved.customOrgName}</p>}
                    {saved.hasSpecificOrg && saved.orgAddress && <p>주소: {saved.orgAddress}</p>}
                    {!saved.hasSpecificOrg && (
                      <p className="text-green-600">집행: EverWill 사회적후원 운영위원회에 일임</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* 총 기부 금액 */}
      {totalAmount > 0 && (
        <div className="bg-[#1F3864] rounded-2xl px-5 py-4 text-white flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">총 기부 예정 금액</p>
            <p className="text-xl font-bold mt-0.5">₩{totalAmount.toLocaleString()}</p>
          </div>
          <Heart className="w-8 h-8 text-rose-300 opacity-60" />
        </div>
      )}

      {/* EverWill 집행 원칙 안내 */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>집행 원칙:</strong> 본 사회기부 유언의 집행은{" "}
          <strong>EverWill 사회적후원 운영위원회</strong>에 그 집행을 일임합니다.
          단체를 직접 지정한 경우에도 EverWill이 집행 과정을 감독하고 가족에게 결과를 투명하게 공개합니다.
        </p>
      </div>

      {/* 하단 버튼 */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          이 단계 건너뛰기
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#1F3864] hover:bg-[#162a4e] text-white text-sm font-semibold transition-colors"
        >
          {selectedCount > 0
            ? (selectedCount + "개 분야 선택 완료 · 다음 단계")
            : "다음 단계로"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
