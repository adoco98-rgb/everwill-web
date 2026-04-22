/**
 * EverWill 소개 슬라이드 섹션
 * 동영상 대신 이미지 슬라이드 + 한글 텍스트 오버레이
 * 자동 재생 + 수동 이동 지원
 */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const slides = [
  {
    id: 0,
    bg: "/manus-storage/slide1_writing_2c37efd7.jpg",
    tag: "AI 유언장 작성",
    tagColor: "#C9A961",
    title: "체크 몇 번이면\n유언장 완성",
    highlight: "17분 · 무료",
    desc: "복잡한 법률 용어 없이, AI가 안내하는 대로 체크만 하면 완성됩니다.",
    accent: "from-[#0d1f3c]/85 via-[#0d1f3c]/50 to-transparent",
  },
  {
    id: 1,
    bg: "/manus-storage/slide2_pen_d0fa71fc.jpg",
    tag: "전자인증",
    tagColor: "#C9A961",
    title: "법적 효력 있는\n디지털 유언장",
    highlight: "₩49,000 · 1회",
    desc: "블록체인 타임스탬프와 전자서명으로 법원에서 인정받는 유언장을 만드세요.",
    accent: "from-[#0d1f3c]/85 via-[#0d1f3c]/50 to-transparent",
  },
  {
    id: 2,
    bg: "/manus-storage/slide3_family_c5897e79.jpg",
    tag: "가족을 위한 선물",
    tagColor: "#C9A961",
    title: "가족이 받게 될\n가장 큰 사랑",
    highlight: "사후 자동 집행",
    desc: "사망 감지 시 상속자에게 자동 알림, 변호사 매칭, 자산 집행까지 EverWill이 책임집니다.",
    accent: "from-[#0d1f3c]/75 via-[#0d1f3c]/40 to-transparent",
  },
  {
    id: 3,
    bg: "/manus-storage/slide4_legacy_f680f72a.png",
    tag: "글로벌 서비스",
    tagColor: "#C9A961",
    title: "7개국 언어\n전 세계 어디서나",
    highlight: "한국 · 미국 · 일본 · 중국",
    desc: "재외동포, 해외 자산 보유자, 다국적 가족 모두를 위한 글로벌 유언 플랫폼입니다.",
    accent: "from-[#0d1f3c]/80 via-[#0d1f3c]/50 to-transparent",
  },
];

const INTERVAL = 5000; // 5초 자동 전환

export default function VideoIntroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  const prev = () => {
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  };

  // 자동 슬라이드
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-4">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-px bg-[#C9A961]" />
            <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">
              EverWill 소개
            </span>
            <div className="w-8 h-px bg-[#C9A961]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">
            세계 최초 디지털 유언 OS
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            유언 작성부터 사후 자동 집행까지, 전 과정을 책임지는 EverWill을 소개합니다.
          </p>
        </motion.div>

        {/* 슬라이드 컨테이너 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0d1f3c]"
          style={{ aspectRatio: "16/9" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* 배경 이미지 슬라이드 */}
          <AnimatePresence mode="sync">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={slide.bg}
                alt={slide.tag}
                className="w-full h-full object-cover"
              />
              {/* 그라디언트 오버레이 */}
              <div className={`absolute inset-0 bg-gradient-to-t ${slide.accent}`} />
            </motion.div>
          </AnimatePresence>

          {/* 텍스트 오버레이 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col justify-end px-10 pb-12 pointer-events-none"
            >
              {/* 태그 */}
              <span
                className="inline-block text-sm md:text-base font-bold tracking-widest uppercase mb-3 px-3 py-1 rounded-full w-fit"
                style={{
                  color: slide.tagColor,
                  background: "rgba(201,169,97,0.15)",
                  border: "1px solid rgba(201,169,97,0.4)",
                }}
              >
                {slide.tag}
              </span>

              {/* 메인 제목 */}
              <h3
                className="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-3 drop-shadow-2xl whitespace-pre-line"
                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
              >
                {slide.title}
              </h3>

              {/* 하이라이트 */}
              <p
                className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-xl"
                style={{
                  color: "#C9A961",
                  textShadow: "0 2px 12px rgba(0,0,0,0.6)",
                  fontFamily: "'Noto Serif KR', serif",
                }}
              >
                {slide.highlight}
              </p>

              {/* 설명 */}
              <p
                className="text-white/90 text-base md:text-lg max-w-xl leading-relaxed drop-shadow-md"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}
              >
                {slide.desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* 좌우 화살표 */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/65 rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/65 rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 하단 도트 인디케이터 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 h-2 bg-[#C9A961]"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          {/* 진행 바 */}
          {!paused && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
              <motion.div
                key={current}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                className="h-full bg-[#C9A961]"
              />
            </div>
          )}
        </motion.div>

        {/* 하단 태그 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mt-8"
        >
          {[
            "AI 유언장 작성 무료",
            "전자인증 ₩49,000",
            "7개 언어 지원",
            "사후 자동 집행",
            "4중 사망 감지",
          ].map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 bg-white border border-[#C9A961]/30 text-[#1F3864] text-sm font-medium rounded-full shadow-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
