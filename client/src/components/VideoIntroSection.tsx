/**
 * EverWill 소개 슬라이드 섹션
 * 동영상 대신 이미지 슬라이드 + 다국어 텍스트 오버레이
 * 자동 재생 + 수동 이동 지원
 * slide3: 11개국 국기 이모지 표시
 */
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SLIDE_BGS = [
  "/slide1_writing.jpg",
  "/slide2_pen.jpg",
  "/slide3_family.jpg",
  "/manus-storage/slide4_legacy_ffdd7b23.png",
];

const ACCENTS = [
  "from-[#0d1f3c]/85 via-[#0d1f3c]/50 to-transparent",
  "from-[#0d1f3c]/85 via-[#0d1f3c]/50 to-transparent",
  "from-[#0d1f3c]/75 via-[#0d1f3c]/40 to-transparent",
  "from-[#0d1f3c]/80 via-[#0d1f3c]/50 to-transparent",
];

// 14개국 국기 + 언어명 (flagcdn PNG 이미지 사용)
const GLOBAL_FLAGS = [
  { flagImg: "https://flagcdn.com/w80/kr.png", name: "한국어", code: "KO" },
  { flagImg: "https://flagcdn.com/w80/us.png", name: "English", code: "EN" },
  { flagImg: "https://flagcdn.com/w80/jp.png", name: "日本語", code: "JA" },
  { flagImg: "https://flagcdn.com/w80/cn.png", name: "中文", code: "ZH" },
  { flagImg: "https://flagcdn.com/w80/de.png", name: "Deutsch", code: "DE" },
  { flagImg: "https://flagcdn.com/w80/es.png", name: "Español", code: "ES" },
  { flagImg: "https://flagcdn.com/w80/sa.png", name: "العربية", code: "AR" },
  { flagImg: "https://flagcdn.com/w80/fr.png", name: "Français", code: "FR" },
  { flagImg: "https://flagcdn.com/w80/ru.png", name: "Русский", code: "RU" },
  { flagImg: "https://flagcdn.com/w80/in.png", name: "हिन्दी", code: "HI" },
  { flagImg: "https://flagcdn.com/w80/br.png", name: "Português", code: "PT" },
];

const INTERVAL = 5000; // 5초 자동 전환

export default function VideoIntroSection() {
  const { t } = useLanguage();
  const vi = t.videoIntro;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // 번역 기반 슬라이드 데이터
  const slides = [
    {
      id: 0,
      bg: SLIDE_BGS[0],
      tag: vi.slide0Tag,
      tagColor: "#C9A961",
      title: vi.slide0Title,
      highlight: vi.slide0Highlight,
      desc: vi.slide0Desc,
      accent: ACCENTS[0],
      isGlobal: false,
    },
    {
      id: 1,
      bg: SLIDE_BGS[1],
      tag: vi.slide1Tag,
      tagColor: "#C9A961",
      title: vi.slide1Title,
      highlight: vi.slide1Highlight,
      desc: vi.slide1Desc,
      accent: ACCENTS[1],
      isGlobal: false,
    },
    {
      id: 2,
      bg: SLIDE_BGS[2],
      tag: vi.slide2Tag,
      tagColor: "#C9A961",
      title: vi.slide2Title,
      highlight: vi.slide2Highlight,
      desc: vi.slide2Desc,
      accent: ACCENTS[2],
      isGlobal: false,
    },
    {
      id: 3,
      bg: SLIDE_BGS[3],
      tag: vi.slide3Tag,
      tagColor: "#C9A961",
      title: vi.slide3Title,
      highlight: vi.slide3Highlight,
      desc: vi.slide3Desc,
      accent: ACCENTS[3],
      isGlobal: true, // 국기 표시 슬라이드
    },
  ];

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

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

  // 하단 태그 목록
  const bottomTags = [vi.tag0, vi.tag1, vi.tag2, vi.tag3, vi.tag4];

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
              {vi.sectionLabel}
            </span>
            <div className="w-8 h-px bg-[#C9A961]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">
            {vi.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {vi.subtitle}
          </p>
        </motion.div>

        {/* 슬라이드 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl cursor-pointer"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* 배경 이미지 */}
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
              className="absolute inset-0 flex flex-col justify-end px-4 sm:px-10 pb-6 sm:pb-12 pointer-events-none"
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
                className="text-white text-2xl sm:text-4xl md:text-6xl font-extrabold leading-tight mb-2 sm:mb-3 drop-shadow-2xl whitespace-pre-line"
                style={{ textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
              >
                {slide.title}
              </h3>

              {/* 슬라이드 3: 14개국 국기 표시 */}
              {slide.isGlobal ? (
                <div className="mb-4">
                  {/* 국기 그리드 - 2줄 */}
                  <div className="flex flex-wrap gap-2 max-w-xl">
                    {GLOBAL_FLAGS.map((item) => (
                      <div
                        key={item.code}
                        className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-2.5 py-1"
                      >
                        <img
                            src={item.flagImg}
                            alt={item.name}
                            style={{ width: 20, height: 14, objectFit: "cover", display: "block", flexShrink: 0 }}
                            className="rounded-sm"
                          />
                        <span className="text-white text-xs font-semibold leading-none">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* 일반 슬라이드: 하이라이트 텍스트 */
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
              )}

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
          {bottomTags.map((tag) => (
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
