/**
 * 사회기부 누적 현황 섹션
 * - 현재 기부금액 (생전 기부, 결제 완료) / 미래 기부금액 (사후 유언 기부) 분리
 * - 기부 메시지 공개 월 (더보기)
 * - 국가별 카드 / 분야별 현황
 */
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Globe2, TrendingUp, Users, MessageCircle, ChevronDown, ChevronUp, Clock } from "lucide-react";
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
  KRW: 1, JPY: 9.0, CNY: 190, HKD: 170, TWD: 41,
  USD: 1350, EUR: 1480, SAR: 360, AED: 368,
  RUB: 15, INR: 16, BRL: 270, GBP: 1720, AUD: 890, CAD: 1000,
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
    if (absAmount >= 100_000_000) return `${symbol}${(amount / 100_000_000).toFixed(1)}억`;
    if (absAmount >= 10_000) return `${symbol}${(amount / 10_000).toFixed(1)}만`;
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
const COUNTRY_FLAGS: Record<string, string> = {
  KR: "🇰🇷", JP: "🇯🇵", CN: "🇨🇳", US: "🇺🇸", DE: "🇩🇪",
  FR: "🇫🇷", ES: "🇪🇸", SA: "🇸🇦", AE: "🇦🇪", RU: "🇷🇺",
  IN: "🇮🇳", BR: "🇧🇷", GB: "🇬🇧", AU: "🇦🇺", CA: "🇨🇦",
};

// ─── 메인 컴포넌트 ──────────────────────────────────────────────
export default function CharityStatsSection() {
  const { t, language } = useLanguage();
  const cs = t.charityStats;
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [msgLimit, setMsgLimit] = useState(6);

  const localCurrency = LANG_CURRENCY[language] ?? LANG_CURRENCY["ko"];
  const localRate = KRW_RATES[localCurrency.code] ?? 1;

  const { data, isLoading } = trpc.charity.getGlobalStats.useQuery(undefined, {
    refetchInterval: 60_000, staleTime: 30_000,
  });

  const { data: msgData, isLoading: msgLoading } = trpc.charity.getPublicMessages.useQuery(
    { limit: msgLimit },
    { staleTime: 30_000 }
  );

  const lifetimeKrw = data?.lifetimeKrw ?? 0;
  const posthumousKrw = data?.posthumousKrw ?? 0;
  const lifetimeCount = data?.lifetimeCount ?? 0;
  const posthumousCount = data?.posthumousCount ?? 0;
  const donorCount = data?.donorCount ?? 0;

  const lifetimeLocal = Math.round(lifetimeKrw / localRate);
  const posthumousLocal = Math.round(posthumousKrw / localRate);

  const animatedLifetime = useCountUp(lifetimeLocal, 2200);
  const animatedPosthumous = useCountUp(posthumousLocal, 2200);
  const animatedDonors = useCountUp(donorCount, 1800);

  const byCountry = data?.byCountry ?? [];
  const byCategory = data?.byCategory ?? [];
  const maxCategoryAmount = Math.max(...byCategory.map((c) => c.totalKrw), 1);

  const messages = msgData?.messages ?? [];
  const totalMessages = msgData?.total ?? 0;

  // 데이터가 모두 0이면 섹션 전체 숨김
  if (lifetimeKrw === 0 && posthumousKrw === 0 && donorCount === 0 && byCountry.length === 0) return null;

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
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-4">
            <Heart className="w-4 h-4 text-[#C9A961]" />
            <span className="text-[#C9A961] text-sm font-semibold">Social Impact</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            {cs.title}
          </h2>
          <p className="text-blue-200 text-base max-w-xl mx-auto">{cs.subtitle}</p>
        </motion.div>

        {/* ── 현재 기부금액 / 미래 기부금액 분리 카드 ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">

          {/* 현재 기부금액 (생전 기부, 실제 납부 완료) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-emerald-900/60 to-emerald-800/40 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-1">현재 기부금액</p>
            <p className="text-blue-200 text-sm mb-2">생전 기부 (납부 완료)</p>
            {isLoading ? (
              <div className="h-10 w-36 bg-white/10 rounded-lg animate-pulse mx-auto" />
            ) : (
              <p className="text-3xl font-bold text-emerald-300">
                {formatCurrency(animatedLifetime, localCurrency.code, localCurrency.symbol)}
              </p>
            )}
            <p className="text-emerald-400/70 text-xs mt-2">{lifetimeCount.toLocaleString()}건 완료</p>
          </motion.div>

          {/* 미래 기부금액 (사후 유언 기부 예정) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-gradient-to-br from-amber-900/60 to-amber-800/40 backdrop-blur-sm border border-[#C9A961]/40 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-[#C9A961]" />
            </div>
            <p className="text-[#C9A961] text-xs font-semibold uppercase tracking-wider mb-1">미래 기부금액</p>
            <p className="text-blue-200 text-sm mb-2">사후 유언 기부 (예정)</p>
            {isLoading ? (
              <div className="h-10 w-36 bg-white/10 rounded-lg animate-pulse mx-auto" />
            ) : (
              <p className="text-3xl font-bold text-[#C9A961]">
                {formatCurrency(animatedPosthumous, localCurrency.code, localCurrency.symbol)}
              </p>
            )}
            <p className="text-[#C9A961]/70 text-xs mt-2">{posthumousCount.toLocaleString()}건 유언 등록</p>
          </motion.div>

          {/* 기부 유언 등록자 수 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-blue-300" />
            </div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider mb-1">기부 참여자</p>
            <p className="text-blue-200 text-sm mb-2">{cs.donorLabel}</p>
            {isLoading ? (
              <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse mx-auto" />
            ) : (
              <p className="text-3xl font-bold text-white">
                {animatedDonors.toLocaleString()}
                {cs.donorUnit && <span className="text-xl ml-1">{cs.donorUnit}</span>}
              </p>
            )}
          </motion.div>
        </div>

        {/* ── 기부 메시지 월 ── */}
        {(messages.length > 0 || msgLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="mb-14"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <MessageCircle className="w-5 h-5 text-[#C9A961]" />
              <h3 className="text-xl font-bold text-white">기부자들의 마음</h3>
              <span className="text-blue-300 text-sm">({totalMessages.toLocaleString()}개의 메시지)</span>
            </div>

            {msgLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/10 rounded-2xl p-5 animate-pulse h-32" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/12 transition-colors"
                      >
                        {/* 상단: 이름 + 국가 + 기부 유형 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#C9A961]/20 rounded-full flex items-center justify-center text-sm">
                              {COUNTRY_FLAGS[msg.country] ?? "🌍"}
                            </div>
                            <span className="text-white font-semibold text-sm">{msg.displayName}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            msg.donationType === 'lifetime'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-[#C9A961]/20 text-[#C9A961]'
                          }`}>
                            {msg.donationType === 'lifetime' ? '생전 기부' : '유언 기부'}
                          </span>
                        </div>

                        {/* 메시지 */}
                        <p className="text-blue-100 text-sm leading-relaxed flex-1">
                          "{msg.publicMessage}"
                        </p>

                        {/* 하단: 분야 + 날짜 */}
                        <div className="flex items-center justify-between text-xs text-blue-300/60">
                          <span>{CATEGORY_ICONS[msg.category] ?? "💝"} {CATEGORY_NAMES_KO[msg.category] ?? msg.category}</span>
                          <span>{new Date(msg.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* 더보기 / 접기 버튼 */}
                {totalMessages > 6 && (
                  <div className="text-center mt-6">
                    {msgLimit < totalMessages ? (
                      <button
                        onClick={() => setMsgLimit((prev) => Math.min(prev + 6, totalMessages))}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                        더보기 ({totalMessages - msgLimit}개 더)
                      </button>
                    ) : (
                      <button
                        onClick={() => setMsgLimit(6)}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                        접기
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* 국가별 기부 현황 */}
        {byCountry.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-14"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <Globe2 className="w-5 h-5 text-[#C9A961]" />
              <h3 className="text-xl font-bold text-white">{cs.countryTitle}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {byCountry.map((country, idx) => (
                <CountryCard key={country.countryCode} country={country} delay={idx * 0.05} />
              ))}
            </div>
          </motion.div>
        )}

        {/* 분야별 기부 현황 */}
        {byCategory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
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
                      initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: idx * 0.04 }}
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
                          {formatCurrency(Math.round(cat.totalKrw / localRate), localCurrency.code, localCurrency.symbol)}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }} transition={{ duration: 0.8, delay: idx * 0.04 }}
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
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-blue-200 text-sm mb-2 opacity-80">
            🔒 {cs.pledgeNote}
          </p>
          <p className="text-blue-300 text-xs mb-5 opacity-60">
            기부금은 EverWill이 수탁 보관 후 매월 지정 공익단체에 전달합니다.
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
function CountryCard({
  country, delay,
}: {
  country: {
    countryCode: string; countryName: string; flag: string;
    currencyCode: string; currencySymbol: string;
    totalAmount: number; donorCount: number;
  };
  delay: number;
}) {
  const animated = useCountUp(country.totalAmount, 2000);
  const formatted = formatCurrency(animated, country.currencyCode, country.currencySymbol);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }} transition={{ duration: 0.4, delay }}
      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors flex flex-col items-center gap-2"
    >
      <p className="text-white/80 text-xs font-semibold tracking-wide uppercase">{country.countryName}</p>
      <div className="text-5xl leading-none my-1">{country.flag}</div>
      <p className="text-[#C9A961] font-bold text-xl leading-tight">{formatted}</p>
      <p className="text-blue-300 text-xs opacity-70">{country.donorCount.toLocaleString()}명</p>
    </motion.div>
  );
}
