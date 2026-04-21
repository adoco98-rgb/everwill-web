/**
 * EverWill Hero 섹션
 * 디자인: 전체화면 이미지 배경 + 중앙 슬로건 + CTA 버튼
 * 이미지: 다문화 글로벌 노인 그룹 (미국/영국/유럽 포함)
 * 오버레이: 딥 네이비 그라디언트로 텍스트 가독성 확보
 */
import { motion } from "framer-motion";
import { ArrowRight, PenLine, UserPlus } from "lucide-react";
import { toast } from "sonner";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/hero-global-elders-v2-DB4mTEuKjbV7DYjdv5fYBA.webp";

export default function HeroSection() {
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center pt-16 pb-24">

        {/* 상단 배지 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/25 rounded-full px-5 py-2 mb-10"
        >
          <span className="w-2 h-2 rounded-full bg-[#C9A961] animate-pulse" />
          <span className="text-white/90 text-sm font-medium tracking-wide">
            세계 최초 디지털 유언 OS
          </span>
        </motion.div>

        {/* 메인 슬로건 */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.1] mb-6 max-w-5xl"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          누구나 한번은
          <br />
          꼭 해야할,
          <br />
          <span
            className="text-[#C9A961]"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            나의 마지막 서명
          </span>
        </motion.h1>

        {/* 서브 카피 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-white/70 text-lg sm:text-xl leading-relaxed mb-12 max-w-2xl"
        >
          AI 유언장 작성 무료 · 전자인증 ₩49,000
          <br className="hidden sm:block" />
          유언 작성, 인증, 사후 집행을 하나로.
        </motion.p>

        {/* CTA 버튼 2개 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          {/* 유언장 서명 버튼 */}
          <button
            onClick={scrollToPricing}
            className="group flex items-center gap-3 btn-gold px-10 py-4 rounded-full text-base font-semibold shadow-2xl shadow-[#C9A961]/30 min-w-[220px] justify-center"
          >
            <PenLine className="w-5 h-5" />
            유언장 서명하기
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* 무료 가입 버튼 */}
          <button
            onClick={() => toast.info("회원가입 기능 준비 중입니다")}
            className="group flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/40 hover:bg-white/25 hover:border-white/60 text-white px-10 py-4 rounded-full text-base font-semibold transition-all duration-300 min-w-[220px] justify-center"
          >
            <UserPlus className="w-5 h-5" />
            무료로 가입하기
          </button>
        </motion.div>

        {/* 신뢰 지표 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="flex flex-wrap justify-center gap-6 mt-14 text-white/50 text-sm"
        >
          <span className="flex items-center gap-1.5">
            <span className="text-[#C9A961]">✓</span> 법적 효력 보장
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#C9A961]">✓</span> 7개국 지원
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#C9A961]">✓</span> 17분 완성
          </span>
          <span className="text-white/20">|</span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#C9A961]">✓</span> 은행급 보안
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
