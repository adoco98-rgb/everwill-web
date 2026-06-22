/**
 * EverWill Hero 섹션
 * 디자인: 전체화면 이미지 배경 + 중앙 슬로건 + CTA 버튼
 * 이미지: 다문화 글로벌 노인 그룹 (미국/영국/유럽 포함)
 * 오버레이: 딥 네이비 그라디언트로 텍스트 가독성 확보
 */
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ArrowRight, UserPlus, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/hero-global-elders-v2-DB4mTEuKjbV7DYjdv5fYBA.webp";

// 숫자 카운트업 컴포넌트
function AnimatedCounter({ target, duration = 2.5 }: { target: number; duration?: number }) {
  const countRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current || target === 0) return;
    hasAnimated.current = true;
    const startVal = Math.max(0, target - 200);
    let start = startVal;
    const end = target;
    const stepTime = Math.max(20, Math.floor((duration * 1000) / (end - start)));
    const timer = setInterval(() => {
      start += Math.ceil((end - start) / 15);
      if (countRef.current) {
        countRef.current.textContent = start.toLocaleString();
      }
      if (start >= end) {
        clearInterval(timer);
        if (countRef.current) countRef.current.textContent = end.toLocaleString();
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span ref={countRef}>{target.toLocaleString()}</span>;
}

export default function HeroSection() {
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  // 언어 코드 → 국가 코드 매핑
  const LANG_TO_COUNTRY: Record<string, string> = {
    ko: "KR", en: "US", ja: "JP", zh: "CN",
    de: "DE", es: "ES", ar: "SA", fr: "FR",
    ru: "RU", hi: "IN", pt: "BR",
  };
  const currentCountryCode = LANG_TO_COUNTRY[language] ?? "KR";

  // 국가별 가입자 수 조회 (DB 실제 + 임의 설정값)
  const { data: countryData } = trpc.stats.getCountryMemberCounts.useQuery(undefined, {
    staleTime: 60_000, // 1분 캐시
  });

  // 현재 선택된 국가에 해당하는 데이터만 표시
  const currentCountry = (countryData ?? []).find(c => c.code === currentCountryCode && c.displayEnabled && c.total > 0);
  // 하위 호환: 현재 국가가 없으면 표시 활성화된 국가 최대 3개 표시
  const displayCountries = currentCountry ? [currentCountry] : (countryData ?? []).filter(c => c.displayEnabled && c.total > 0).slice(0, 3);
  const totalMembers = (countryData ?? []).filter(c => c.displayEnabled).reduce((s, c) => s + c.total, 0) || 4709;

  // 로그인 상태면 대시보드, 비로그인이면 회원가입 페이지로
  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login?mode=signup");
    }
  };

  const scrollToPricing = () => {
    const el = document.querySelector("#pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full min-h-screen overflow-hidden">
      {/* 전체화면 배경 이미지 */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="전 세계 다양한 국적의 노인들이 환하게 웃으며 손을 흔드는 모습"
          className="w-full h-full object-cover object-center"
        />
        {/* 다층 오버레이: 상단 네이비 + 하단 강한 어둠 */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F3864]/75 via-[#1F3864]/55 to-[#0f1e36]/85" />
        {/* 중앙 집중 비네트 */}
        <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-transparent to-[#0f1e36]/40" />
      </div>

      {/* 중앙 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-36 sm:pt-32 pb-16 sm:pb-24">

        {/* 상단 배지 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2 mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-[#C9A961] animate-pulse" />
          <span className="text-white/90 text-sm font-medium tracking-wide">
            {t.hero.badge}
          </span>
        </motion.div>

        {/* 메인 슬로건 */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.15] mb-4 sm:mb-6 max-w-5xl w-full"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {t.hero.title1}
          <br />
          {t.hero.title2}
          <br />
          <span
            className="text-[#C9A961]"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            {t.hero.title3}
          </span>
        </motion.h1>

        {/* 서브 카피 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-white/70 text-sm sm:text-xl leading-relaxed mb-8 sm:mb-12 max-w-2xl px-2 sm:px-0"
        >
          {t.hero.subtitle}
          <br className="hidden sm:block" />
          {t.hero.subtitle2}
        </motion.p>

        {/* CTA 버튼 + 회원 수 카운터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full max-w-xs sm:max-w-none"
        >
          {/* 무료 가입 버튼 (단독, 크게) */}
          <button
            onClick={handleStart}
            className="group flex items-center gap-3 btn-gold px-8 sm:px-14 py-4 sm:py-5 rounded-full text-base sm:text-xl font-bold shadow-2xl shadow-[#C9A961]/40 w-full sm:min-w-[280px] justify-center transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            <UserPlus className="w-6 h-6" />
            {t.hero.ctaJoin}
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* 회원 수 카운터 배지 - 관리자 설정 기반 동적 표시 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col items-center sm:items-start gap-2 bg-[#1F3864]/80 backdrop-blur-md border border-[#C9A961]/40 rounded-2xl px-4 py-4 w-full sm:min-w-[220px] shadow-xl shadow-black/30"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C9A961]" />
              <span className="text-white/90 text-xs font-semibold tracking-wide">{t.hero.memberBadgeTitle}</span>
            </div>
            {/* 국가별 회원 수 - 관리자가 표시 활성화한 국가만 노요 */}
            {displayCountries.length > 0 ? (
              <div className="w-full space-y-1.5">
                {displayCountries.map((c) => (
                  <div key={c.code} className="flex items-center justify-between gap-4">
                    <span className="text-white/70 text-xs flex items-center gap-1">
                      <span>{c.flag}</span> <span>{c.name}</span>
                    </span>
                    <span className="text-white font-black text-lg tracking-tight leading-none">
                      <AnimatedCounter target={c.total} /><span className="text-[#C9A961] text-sm font-bold">+</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white font-black text-3xl sm:text-4xl tracking-tight leading-none">
                <AnimatedCounter target={totalMembers} />
                <span className="text-[#C9A961] ml-1 text-2xl font-bold">+</span>
              </div>
            )}
            <div className="w-full border-t border-white/10 pt-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[#C9A961]/80 text-xs font-medium">{t.hero.memberBadgeSub}</span>
                <span className="text-white font-bold text-sm">
                  <AnimatedCounter target={totalMembers} /><span className="text-[#C9A961] text-xs font-bold">+</span>
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 가격 투명성 부연 문구 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="text-white/50 text-sm mt-1 text-center"
        >
          {t.hero.pricingNote}
        </motion.p>

        {/* 신뢰 지표 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-8 mt-8 sm:mt-14 text-white text-xs sm:text-lg font-semibold"
        >
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#C9A961] text-sm sm:text-xl">✓</span> {t.hero.trust1}
          </span>
          <span className="text-white/30 text-sm sm:text-xl hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#C9A961] text-sm sm:text-xl">✓</span> {t.hero.trust2}
          </span>
          <span className="text-white/30 text-sm sm:text-xl hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#C9A961] text-sm sm:text-xl">✓</span> {t.hero.trust3}
          </span>
          <span className="text-white/30 text-sm sm:text-xl hidden sm:inline">|</span>
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[#C9A961] text-sm sm:text-xl">✓</span> {t.hero.trust4}
          </span>
        </motion.div>
      </div>

      {/* 하단 스크롤 유도 화살표 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1 text-white/30 cursor-pointer"
          onClick={() => {
            const el = document.querySelector("#services");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
            <path d="M8 0v20M1 13l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>

      {/* 하단 웨이브 */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 60L60 54C120 48 240 36 360 33C480 30 600 36 720 39C840 42 960 42 1080 39C1200 36 1320 30 1380 27L1440 24V60H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
