/**
 * 사회기부 누적 현황 섹션
 * - 전체 기부 예정 금액 (현재 언어 국가 화폐로 환산 표시)
 * - 국가별 카드: 제목(국가명) 중앙 → 국기 → 기부금액 순서
 * - 분야별 기부 현황
 * - 카운트업 애니메이션
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Globe2, TrendingUp, Users } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n";

// ─── 언어 → 통화 매핑 ───────────────────────────────────────────
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

/** KRW 기준 환율 (고정 참고값) */
const KRW_RATES: Record<string, number> = {
  KRW: 1,
  JPY: 9.0,
  CNY: 190,
  HKD: 170,
  TWD: 41,
  USD: 1350,
  EUR: 1480,
  SAR: 360,
  AED: 368,
  RUB: 15,
  INR: 16,
  BRL: 270,
  GBP: 1720,
  AUD: 890,
  CAD: 1000,
};

// ─── 카운트업 훅 ────────────────────────────────────────────────
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

// ─── 통화 포맷 ──────────────────────────────────────────────────
function formatCurrency(amount: number, currencyCode: string, symbol: string): string {
  const absAmount = Math.abs(amount);

  if (currencyCode === "KRW" || currencyCode === "JPY" || currencyCode === "CNY") {
    if (absAmount >= 100_000_000) {
      const unit = currencyCode === "KRW" ? "억" : "億";
      return `${symbol}${(amount / 100_000_000).toFixed(1)}${unit}`;
    }
    if (absAmount >= 10_000) {
      const unit = currencyCode === "KRW" ? "만" : "万";
      return `${symbol}${(amount / 10_000).toFixed(1)}${unit}`;
    }
    return `${symbol}${amount.toLocaleString()}`;
  }

  if (absAmount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (absAmount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return `${symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// ─── 분야 아이콘 ────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  education: "🎓", children: "👶", elderly: "👴", disabled: "♿",
  medical: "🏥", environment: "🌱", culture: "🎨", science: "🔬",
  animal: "🐾", disaster: "🆘", religion: "🕊️", other: "💝",
};

const CATEGORY_NAMES_KO: Record<string, string> = {
  education: "교육", children: "아동·청소년", elderly: "노인복지",
  disabled: "장애인", medical: "의료·보건", environment: "환경·기후",
  culture: "문화·예술", science: "과학·기술", animal: "동물복지",
  disaster: "재난·구호", religion: "종교·봉사", other: "기타",
};

// ─── 메인 컴포넌트 ──────────────────────────────────────────────
export default function CharityStatsSection() {
  const { t, language } = useLanguage();
  const cs = t.charityStats;

  // 현재 언어 기준 통화
  const localCurrency = LANG_CURRENCY[language] ?? LANG_CURRENCY["ko"];
  const localRate = KRW_RATES[localCurrency.code] ?? 1;

  const { data, isLoading } = trpc.charity.getGlobalStats.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const totalKrw = data?.totalKrw ?? 0;
  const donorCount = data?.donorCount ?? 0;

  // 현지 화폐로 환산한 총액
  const totalLocal = Math.round(totalKrw / localRate);
  const animatedLocal = useCountUp(totalLocal, 2200);
  const animatedDonors = useCountUp(donorCount, 1800);

  const byCountry = data?.byCountry ?? [];
  const byCategory = data?.byCategory ?? [];
  const maxCategoryAmount = Math.max(...byCategory.map((c) => c.totalKrw), 1);

  return (
    <section className="py-20 bg-gradient-to-b from-[#0d1f3c] to-[#1F3864] text-white relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-[#C9A961]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#C9A961]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">

        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-4">
            <Heart className="w-4 h-4 text-[#C9A961]" />
            <span className="text-[#C9A961] text-sm font-semibold">Social Impact</span>
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {cs.title}
          </h2>
          <p className="text-blue-200 text-base max-w-xl mx-auto">{cs.subtitle}</p>
        </motion.div>

        {/* 상단 요약 카드 2개 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14 max-w-2xl mx-auto">
          {/* 전체 기부 예정 금액 — 현지 화폐 환산 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-[#C9A961]" />
            </div>
            <p className="text-blue-200 text-sm mb-1">{cs.totalLabel}</p>
            {isLoading ? (
              <div className="h-10 w-36 bg-white/10 rounded-lg animate-pulse mx-auto" />
            ) : (
              <p className="text-3xl font-bold text-[#C9A961]">
                {formatCurrency(animatedLocal, localCurrency.code, localCurrency.symbol)}
              </p>
            )}
            <p className="text-blue-300 text-xs mt-1 opacity-70">
              {localCurrency.code} {cs.krwEquiv}
            </p>
          </motion.div>

          {/* 기부 유언 등록자 수 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-[#C9A961]" />
            </div>
            <p className="text-blue-200 text-sm mb-1">{cs.donorLabel}</p>
            {isLoading ? (
              <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse mx-auto" />
            ) : (
              <p className="text-3xl font-bold text-[#C9A961]">
                {animatedDonors.toLocaleString()}
                {cs.donorUnit && <span className="text-xl ml-1">{cs.donorUnit}</span>}
              </p>
            )}
          </motion.div>
        </div>

        {/* 국가별 기부 현황 — 제목 중앙, 국기, 기부금액 순서 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-14"
        >
          {/* 섹션 제목 중앙 정렬 */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <Globe2 className="w-5 h-5 text-[#C9A961]" />
            <h3 className="text-xl font-bold text-white">{cs.countryTitle}</h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-5 animate-pulse h-32" />
              ))}
            </div>
          ) : byCountry.length === 0 ? (
            <div className="text-center py-12 text-blue-300 opacity-60">
              <Heart className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>{cs.noData}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {byCountry.map((country, idx) => (
                <CountryCard key={country.countryCode} country={country} delay={idx * 0.05} />
              ))}
            </div>
          )}
        </motion.div>

        {/* 분야별 기부 현황 */}
        {byCategory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-[#C9A961]" />
              <h3 className="text-xl font-bold text-white">{cs.categoryTitle}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {byCategory
                .sort((a, b) => b.totalKrw - a.totalKrw)
                .map((cat, idx) => {
                  const pct = Math.round((cat.totalKrw / maxCategoryAmount) * 100);
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
                          <span className="text-lg">{CATEGORY_ICONS[cat.category] ?? "💝"}</span>
                          <span className="text-white text-sm font-medium">
                            {CATEGORY_NAMES_KO[cat.category] ?? cat.category}
                          </span>
                        </div>
                        <span className="text-[#C9A961] text-sm font-bold">
                          {formatCurrency(
                            Math.round(cat.totalKrw / localRate),
                            localCurrency.code,
                            localCurrency.symbol
                          )}
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
          </motion.div>
        )}

        {/* 하단 약속 문구 + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-blue-200 text-sm mb-5 opacity-80">
            🔒 {cs.pledgeNote}
          </p>
          <Link href="/write">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A961] to-[#a88840] text-white font-bold px-8 py-3.5 rounded-full text-sm hover:opacity-90 transition-opacity shadow-lg">
              <Heart className="w-4 h-4" />
              {cs.ctaBtn}
            </button>
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

// ─── 국가 카드 컴포넌트 ─────────────────────────────────────────
// 레이아웃: 국가명(중앙) → 국기(대형) → 기부금액 → 기부자 수
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
      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors flex flex-col items-center gap-2"
    >
      {/* 1. 국가명 — 상단 중앙 */}
      <p className="text-white/80 text-xs font-semibold tracking-wide uppercase">
        {country.countryName}
      </p>
      {/* 2. 국기 — 대형 이모지 */}
      <div className="text-5xl leading-none my-1">{country.flag}</div>
      {/* 3. 기부금액 */}
      <p className="text-[#C9A961] font-bold text-xl leading-tight">{formatted}</p>
      {/* 4. 기부자 수 */}
      <p className="text-blue-300 text-xs opacity-70">{country.donorCount.toLocaleString()}명</p>
    </motion.div>
  );
}
