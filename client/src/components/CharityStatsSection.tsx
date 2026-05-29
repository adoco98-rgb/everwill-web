/**
 * EverWill 사회기부 섹션 (전면 개편)
 * - 대형 배너 이미지
 * - 감성 문구 (이슈 텍스트)
 * - 기부 분야 선택 (다중 클릭)
 * - 금액 입력
 * - 즉시 결제 / 사후 기부 선택
 * - 전 세계 기부 현황 통계
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Globe2, TrendingUp, Users, Check, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { Language } from "@/i18n";

const BANNER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/charity-banner-Twn94xaToNgAEzmBwEX6wt.webp";

// ─── 통화 매핑 ────────────────────────────────────────────────────
const LANG_CURRENCY: Record<Language, { code: string; symbol: string }> = {
  ko: { code: "KRW", symbol: "₩" },
  ja: { code: "JPY", symbol: "¥" },
  zh: { code: "CNY", symbol: "¥" },
  de: { code: "EUR", symbol: "€" },
  fr: { code: "EUR", symbol: "€" },
  es: { code: "EUR", symbol: "€" },
  ar: { code: "SAR", symbol: "﷼" },
  ru: { code: "RUB", symbol: "₽" },
  hi: { code: "INR", symbol: "₹" },
  pt: { code: "BRL", symbol: "R$" },
  en: { code: "USD", symbol: "$" },
};

const KRW_RATES: Record<string, number> = {
  KRW: 1, JPY: 9.0, CNY: 190, USD: 1350, EUR: 1480,
  SAR: 360, RUB: 15, INR: 16, BRL: 270,
};

// ─── 기부 분야 목록 ───────────────────────────────────────────────
const CAUSE_LIST = [
  { id: "politics",    emoji: "🏛️", ko: "정치 개혁",       en: "Political Reform" },
  { id: "sme",         emoji: "🏭", ko: "중소기업 지원",    en: "SME Support" },
  { id: "education",   emoji: "🎓", ko: "교육",             en: "Education" },
  { id: "science",     emoji: "🔬", ko: "과학·기술",        en: "Science & Tech" },
  { id: "climate",     emoji: "🌱", ko: "기후·환경",        en: "Climate & Environment" },
  { id: "poverty",     emoji: "🤝", ko: "최저생계자 지원",  en: "Poverty Relief" },
  { id: "singlemom",   emoji: "👩‍👧", ko: "미혼모 가정",      en: "Single Mothers" },
  { id: "youth",       emoji: "👦", ko: "청소년 가정",      en: "Youth & Families" },
  { id: "elderly",     emoji: "👴", ko: "노인 복지",        en: "Elderly Care" },
  { id: "disabled",    emoji: "♿", ko: "장애인 지원",      en: "Disability Support" },
  { id: "medical",     emoji: "🏥", ko: "의료·보건",        en: "Medical & Health" },
  { id: "culture",     emoji: "🎨", ko: "문화·예술",        en: "Culture & Arts" },
  { id: "animal",      emoji: "🐾", ko: "동물 복지",        en: "Animal Welfare" },
  { id: "disaster",    emoji: "🆘", ko: "재난·구호",        en: "Disaster Relief" },
  { id: "other",       emoji: "💝", ko: "기타",             en: "Other" },
];

// ─── 카운트업 훅 ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef(0);
  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const startVal = current;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(startVal + eased * (target - startVal)));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return current;
}

function formatCurrency(amount: number, currencyCode: string, symbol: string): string {
  const abs = Math.abs(amount);
  if (currencyCode === "KRW" || currencyCode === "JPY" || currencyCode === "CNY") {
    if (abs >= 100_000_000) return `${symbol}${(amount / 100_000_000).toFixed(1)}${currencyCode === "KRW" ? "억" : "億"}`;
    if (abs >= 10_000) return `${symbol}${(amount / 10_000).toFixed(1)}${currencyCode === "KRW" ? "만" : "万"}`;
    return `${symbol}${amount.toLocaleString()}`;
  }
  if (abs >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return `${symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function CharityStatsSection() {
  const { t, language } = useLanguage();
  const cs = t.charityStats;
  const isKo = language === "ko";

  const localCurrency = LANG_CURRENCY[language] ?? LANG_CURRENCY["ko"];
  const localRate = KRW_RATES[localCurrency.code] ?? 1;

  const { data, isLoading } = trpc.charity.getGlobalStats.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const totalKrw = data?.totalKrw ?? 0;
  const donorCount = data?.donorCount ?? 0;
  const totalLocal = Math.round(totalKrw / localRate);
  const animatedLocal = useCountUp(totalLocal, 2200);
  const animatedDonors = useCountUp(donorCount, 1800);
  const byCountry = data?.byCountry ?? [];
  const byCategory = data?.byCategory ?? [];
  const maxCategoryAmount = Math.max(...byCategory.map((c) => c.totalKrw), 1);

  // ── 기부 폼 상태 ──
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState<"now" | "posthumous">("posthumous");

  const toggleCause = (id: string) => {
    setSelectedCauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const QUICK_AMOUNTS = isKo
    ? ["₩10,000", "₩30,000", "₩50,000", "₩100,000"]
    : ["$10", "$30", "$50", "$100"];
  const QUICK_VALUES = ["10000", "30000", "50000", "100000"];

  const handleDonate = () => {
    if (selectedCauses.length === 0) {
      toast.error(isKo ? "기부 분야를 하나 이상 선택해주세요." : "Please select at least one cause.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error(isKo ? "기부 금액을 입력해주세요." : "Please enter a donation amount.");
      return;
    }
    if (donationType === "now") {
      toast.info(isKo ? "즉시 결제 기능은 곧 오픈됩니다!" : "Immediate payment coming soon!");
    } else {
      toast.success(isKo ? "사후 기부 의사가 유언에 기록됩니다." : "Your posthumous donation will be recorded in your will.");
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#0d1f3c] to-[#1F3864] text-white relative overflow-hidden">

      {/* ── 대형 배너 이미지 ── */}
      <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <img
          src={BANNER_URL}
          alt="전 세계 사람들이 선물을 나누며 웃는 모습"
          className="w-full h-full object-cover object-center"
        />
        {/* 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c]/40 via-transparent to-[#0d1f3c]/80" />
        {/* 배너 위 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/30 border border-[#C9A961]/50 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-semibold">Social Impact</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {isKo ? "나의 마지막 선물" : "My Last Gift to the World"}
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto drop-shadow">
              {isKo
                ? "내가 행복하게 살 수 있었던 것은, 우리 사회가 나를 보호하고 격려하고 성장시켜 주었기 때문입니다."
                : "I could live happily because society protected, encouraged, and helped me grow."}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── 이슈 텍스트 ── */}
      <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <blockquote className="text-lg md:text-2xl font-semibold text-white/90 leading-relaxed mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isKo
              ? `"이제 나는 모두에게 나의 작은 성의를 드리는 마음으로 후원합니다.`
              : `"Now I give back — a small token of gratitude to everyone who made my life possible.`}
          </blockquote>
          <p className="text-[#C9A961] text-base font-medium">
            {isKo
              ? "유언 속에 담긴 당신의 사랑이, 세상을 더 따뜻하게 만듭니다."
              : "The love written in your will makes the world a warmer place."}
          </p>
        </motion.div>
      </div>

      {/* ── 기부 폼 ── */}
      <div className="relative max-w-5xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-white/8 border border-white/15 rounded-3xl p-6 md:p-10"
        >
          {/* Step 1: 분야 선택 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-1">
              {isKo ? "① 기부 분야를 선택하세요" : "① Choose a cause"}
            </h3>
            <p className="text-white/50 text-sm mb-5">
              {isKo ? "여러 분야를 동시에 선택할 수 있습니다." : "You can select multiple causes."}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {CAUSE_LIST.map((cause) => {
                const selected = selectedCauses.includes(cause.id);
                return (
                  <button
                    key={cause.id}
                    onClick={() => toggleCause(cause.id)}
                    className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      selected
                        ? "bg-[#C9A961]/25 border-[#C9A961] text-[#C9A961] shadow-lg scale-105"
                        : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    {selected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C9A961] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className="text-xl">{cause.emoji}</span>
                    <span className="text-center leading-tight">{isKo ? cause.ko : cause.en}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: 금액 입력 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-1">
              {isKo ? "② 기부 금액을 입력하세요" : "② Enter donation amount"}
            </h3>
            <p className="text-white/50 text-sm mb-4">
              {isKo ? "직접 입력하거나 빠른 선택 버튼을 클릭하세요." : "Type an amount or use quick select."}
            </p>
            {/* 빠른 선택 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_AMOUNTS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setAmount(QUICK_VALUES[i])}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    amount === QUICK_VALUES[i]
                      ? "bg-[#C9A961] border-[#C9A961] text-[#1F3864]"
                      : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A961] font-bold text-lg">
                {isKo ? "₩" : "$"}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={isKo ? "금액 직접 입력" : "Enter custom amount"}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/30 text-lg font-semibold focus:outline-none focus:border-[#C9A961] transition-colors"
              />
            </div>
          </div>

          {/* Step 3: 즉시 결제 / 사후 기부 선택 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-4">
              {isKo ? "③ 기부 방식을 선택하세요" : "③ Choose donation timing"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 즉시 결제 */}
              <button
                onClick={() => setDonationType("now")}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                  donationType === "now"
                    ? "border-[#C9A961] bg-[#C9A961]/15"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${donationType === "now" ? "bg-[#C9A961]" : "bg-white/10"}`}>
                  <span className="text-lg">💳</span>
                </div>
                <div>
                  <p className={`font-bold text-base mb-1 ${donationType === "now" ? "text-[#C9A961]" : "text-white"}`}>
                    {isKo ? "지금 결제하기" : "Donate Now"}
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {isKo
                      ? "지금 바로 기부합니다. 즉시 영수증 발급 및 세금 공제 혜택."
                      : "Donate immediately. Instant receipt and tax deduction benefits."}
                  </p>
                </div>
              </button>

              {/* 사후 기부 */}
              <button
                onClick={() => setDonationType("posthumous")}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                  donationType === "posthumous"
                    ? "border-[#C9A961] bg-[#C9A961]/15"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${donationType === "posthumous" ? "bg-[#C9A961]" : "bg-white/10"}`}>
                  <span className="text-lg">📜</span>
                </div>
                <div>
                  <p className={`font-bold text-base mb-1 ${donationType === "posthumous" ? "text-[#C9A961]" : "text-white"}`}>
                    {isKo ? "사후 기부하기" : "Posthumous Donation"}
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {isKo
                      ? "유언장에 기부 의사를 기록합니다. 사망 후 자동 집행됩니다."
                      : "Record in your will. Automatically executed after death."}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 선택 요약 + 기부 버튼 */}
          {(selectedCauses.length > 0 || amount) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6"
            >
              <p className="text-white/60 text-xs mb-2">{isKo ? "선택 요약" : "Summary"}</p>
              {selectedCauses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedCauses.map((id) => {
                    const cause = CAUSE_LIST.find((c) => c.id === id);
                    return cause ? (
                      <span key={id} className="bg-[#C9A961]/20 text-[#C9A961] text-xs px-2 py-0.5 rounded-full font-medium">
                        {cause.emoji} {isKo ? cause.ko : cause.en}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              {amount && (
                <p className="text-white font-bold text-sm">
                  {isKo ? `기부 금액: ₩${Number(amount).toLocaleString()}` : `Amount: $${Number(amount).toLocaleString()}`}
                  {" · "}
                  <span className="text-[#C9A961]">
                    {donationType === "now" ? (isKo ? "즉시 결제" : "Pay Now") : (isKo ? "사후 기부" : "Posthumous")}
                  </span>
                </p>
              )}
            </motion.div>
          )}

          <button
            onClick={handleDonate}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A961] to-[#a88840] text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            <Heart className="w-5 h-5" />
            {donationType === "now"
              ? (isKo ? "지금 기부하기" : "Donate Now")
              : (isKo ? "유언에 기부 의사 기록하기" : "Record in Will")}
            <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-center text-white/30 text-xs mt-4">
            🔒 {isKo ? "EverWill이 검증한 단체를 선정하여 투명하게 전달합니다." : "EverWill selects verified organizations for transparent delivery."}
          </p>
        </motion.div>

        {/* ── 전 세계 기부 현황 통계 (데이터 있을 때만) ── */}
        {(totalKrw > 0 || donorCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <Globe2 className="w-5 h-5 text-[#C9A961]" />
              <h3 className="text-xl font-bold text-white">{cs.title || "전 세계 기부 현황"}</h3>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-[#C9A961]" />
                </div>
                <p className="text-blue-200 text-sm mb-1">{cs.totalLabel || "전체 기부 예정 금액"}</p>
                <p className="text-3xl font-bold text-[#C9A961]">
                  {formatCurrency(animatedLocal, localCurrency.code, localCurrency.symbol)}
                </p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[#C9A961]" />
                </div>
                <p className="text-blue-200 text-sm mb-1">{cs.donorLabel || "기부 유언 등록자"}</p>
                <p className="text-3xl font-bold text-[#C9A961]">
                  {animatedDonors.toLocaleString()}{cs.donorUnit || "명"}
                </p>
              </div>
            </div>

            {/* 국가별 */}
            {byCountry.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                {byCountry.map((country, idx) => (
                  <CountryCard key={country.countryCode} country={country} delay={idx * 0.05} />
                ))}
              </div>
            )}

            {/* 분야별 */}
            {byCategory.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {byCategory.sort((a, b) => b.totalKrw - a.totalKrw).map((cat, idx) => {
                  const pct = Math.round((cat.totalKrw / maxCategoryAmount) * 100);
                  const causeInfo = CAUSE_LIST.find((c) => c.id === cat.category);
                  return (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white/8 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{causeInfo?.emoji ?? "💝"}</span>
                          <span className="text-white font-semibold text-sm">
                            {causeInfo ? (language === "ko" ? causeInfo.ko : causeInfo.en) : cat.category}
                          </span>
                        </div>
                        <span className="text-[#C9A961] text-sm font-bold">
                          {formatCurrency(Math.round(cat.totalKrw / localRate), localCurrency.code, localCurrency.symbol)}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: idx * 0.04 }}
                          className="bg-gradient-to-r from-[#C9A961] to-[#e8c97a] h-1.5 rounded-full"
                        />
                      </div>
                      <p className="text-blue-300 text-xs mt-1">{cat.donorCount}{cs.donorUnit || "명"}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── 국가 카드 ────────────────────────────────────────────────────
function CountryCard({
  country,
  delay,
}: {
  country: {
    countryCode: string;
    countryName: string;
    flag: string;
    currencyCode: string;
    currencySymbol: string;
    totalAmount: number;
    donorCount: number;
  };
  delay: number;
}) {
  const animated = useCountUp(country.totalAmount, 2000);
  const formatted = formatCurrency(animated, country.currencyCode, country.currencySymbol);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/10 border border-white/15 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors flex flex-col items-center gap-2"
    >
      <p className="text-white/80 text-xs font-semibold tracking-wide uppercase">{country.countryName}</p>
      <div className="text-5xl leading-none my-1">{country.flag}</div>
      <p className="text-[#C9A961] font-bold text-xl leading-tight">{formatted}</p>
      <p className="text-blue-300 text-xs opacity-70">{country.donorCount.toLocaleString()}명</p>
    </motion.div>
  );
}
