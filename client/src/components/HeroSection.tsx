/**
 * SARAM Hero 섹션
 * 디자인: 비대칭 레이아웃 - 좌측 텍스트 + 우측 다문화 노인 그룹 이미지
 * 배경: 딥 네이비 그라디언트
 * 애니메이션: Framer Motion 페이드인 + 슬라이드업
 */
import { motion } from "framer-motion";
import { ArrowRight, Shield, Globe, Clock } from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/hero-global-elders-v2-DB4mTEuKjbV7DYjdv5fYBA.webp";

const trustBadges = [
  { icon: Shield, text: "법적 효력 보장" },
  { icon: Globe, text: "7개국 지원" },
  { icon: Clock, text: "17분 완성" },
];

const stats = [
  { value: "무료", label: "AI 유언장 작성" },
  { value: "₩49,000", label: "최초 전자 인증" },
  { value: "17분", label: "평균 완성 시간" },
  { value: "7개국", label: "글로벌 지원" },
];

export default function HeroSection() {
  const scrollToPricing = () => {
    const el = document.querySelector("#pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToServices = () => {
    const el = document.querySelector("#services");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen navy-gradient overflow-hidden pt-16">
      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C9A961]/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#C9A961]/8 blur-3xl" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#C9A961]/5 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* 좌측: 텍스트 콘텐츠 */}
          <div className="order-2 lg:order-1">
            {/* 배지 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-[#C9A961]/15 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-[#C9A961] animate-pulse" />
              <span className="text-[#C9A961] text-sm font-medium">세계 최초 디지털 유언 OS</span>
            </motion.div>

            {/* 메인 헤드라인 */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              누구나 한번은
              <br />
              꼭 해야할,
              <br />
              <span className="text-[#C9A961]">나의 마지막 서명</span>
            </motion.h1>

            {/* 서브 헤드라인 */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg"
            >
              AI 유언장 작성부터 사후 자동 집행까지.
              Trust &amp; Will을 뛰어넘는 글로벌 유언 플랫폼.
              <br />
              <span className="text-white/90 font-medium">AI 작성 무료 · 전자인증 ₩49,000</span>
            </motion.p>

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <button
                onClick={scrollToPricing}
                className="btn-gold flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-semibold shadow-lg"
              >
                무료로 유언장 작성하기
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={scrollToServices}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base font-medium text-white border border-white/30 hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-all duration-300"
              >
                서비스 살펴보기
              </button>
            </motion.div>

            {/* 신뢰 배지 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-white/60 text-sm">
                  <badge.icon className="w-4 h-4 text-[#C9A961]" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </motion.div>

            {/* 통계 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-[#C9A961] text-xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/50 text-xs">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* 우측: 이미지 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative">
              {/* 이미지 컨테이너 */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
                <img
                  src={HERO_IMAGE}
                  alt="전 세계 다양한 국적의 노인들이 환하게 웃으며 손을 흔드는 모습"
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: "520px", objectPosition: "center top" }}
                />
                {/* 이미지 오버레이 그라디언트 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/40 to-transparent" />
              </div>

              {/* 플로팅 카드 1: 완성 알림 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 max-w-[200px]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg">✓</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-800">유언장 완성!</div>
                    <div className="text-xs text-gray-500">17분 만에 완료</div>
                  </div>
                </div>
              </motion.div>

              {/* 플로팅 카드 2: 글로벌 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="absolute -top-4 -right-4 bg-[#1F3864] rounded-xl shadow-xl p-4"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-white text-xs font-semibold">7개국 지원</div>
                  <div className="text-[#C9A961] text-xs">한·일·중·미·영·독·아랍</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 하단 웨이브 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L60 72C120 64 240 48 360 44C480 40 600 48 720 52C840 56 960 56 1080 52C1200 48 1320 40 1380 36L1440 32V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="oklch(0.985 0.005 80)" />
        </svg>
      </div>
    </section>
  );
}
