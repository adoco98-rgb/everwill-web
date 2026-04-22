/**
 * EverWill 소개 영상 섹션
 * 영상은 배경으로만 사용, 한글 텍스트는 HTML 단계별 애니메이션 오버레이
 */
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// 장면별 오버레이 텍스트 (시간 기준)
const scenes = [
  {
    from: 0,
    to: 7,
    sub: "EverWill 소개",
    main: "누구나 한번은\n꼭 해야할,",
    highlight: "나의 마지막 서명",
  },
  {
    from: 7,
    to: 14,
    sub: "AI 유언장 작성",
    main: "체크 몇 번이면\n유언장 완성",
    highlight: "17분 · 무료",
  },
  {
    from: 14,
    to: 21,
    sub: "3가지 핵심 서비스",
    main: null,
    highlight: null,
    features: [
      { icon: "✍️", label: "AI 유언장 작성", sub: "무료" },
      { icon: "🔐", label: "전자인증", sub: "₩49,000" },
      { icon: "⚖️", label: "사후 자동 집행", sub: "전 세계" },
    ],
  },
  {
    from: 21,
    to: 28,
    sub: "지금 시작하세요",
    main: "가족을 위한\n가장 큰 선물",
    highlight: "everwill.co.kr",
  },
];

export default function VideoIntroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentScene, setCurrentScene] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 현재 시간에 맞는 장면 인덱스 계산
  useEffect(() => {
    const idx = scenes.findIndex(
      (s) => currentTime >= s.from && currentTime < s.to
    );
    if (idx !== -1 && idx !== currentScene) {
      setCurrentScene(idx);
    }
  }, [currentTime]);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const scene = scenes[currentScene];

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
            유언 작성부터 사후 자동 집행까지, 전 과정을 책임지는 EverWill을
            소개합니다.
          </p>
        </motion.div>

        {/* 영상 플레이어 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#0d1f3c] cursor-pointer"
          style={{ aspectRatio: "16/9" }}
          onClick={handlePlay}
        >
          {/* 배경 영상 (음소거 기본) */}
          <video
            ref={videoRef}
            src="/manus-storage/everwill_intro_8c033abb.mp4"
            className="w-full h-full object-cover opacity-60"
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={(e) =>
              setCurrentTime((e.target as HTMLVideoElement).currentTime)
            }
            playsInline
            preload="metadata"
            muted={isMuted}
            title="EverWill 소개 영상 - 세계 최초 디지털 유언 OS"
          />

          {/* 어두운 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f3c]/80 via-[#0d1f3c]/30 to-transparent pointer-events-none" />

          {/* ── 재생 중일 때: 장면별 한글 텍스트 오버레이 ── */}
          {isPlaying && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center px-8 pointer-events-none"
              >
                {/* 서브 타이틀 */}
                <span className="text-[#C9A961] text-sm md:text-base font-semibold tracking-widest uppercase mb-3">
                  {scene.sub}
                </span>

                {/* 피처 카드 (3번 장면) */}
                {scene.features ? (
                  <div className="flex gap-4 md:gap-8">
                    {scene.features.map((f, i) => (
                      <motion.div
                        key={f.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-4 text-white"
                      >
                        <span className="text-3xl mb-2">{f.icon}</span>
                        <span className="text-base font-bold">{f.label}</span>
                        <span className="text-[#C9A961] text-sm font-semibold mt-1">
                          {f.sub}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* 메인 텍스트 */}
                    {scene.main && (
                      <p className="text-white text-3xl md:text-5xl font-bold text-center leading-tight mb-3 drop-shadow-lg whitespace-pre-line">
                        {scene.main}
                      </p>
                    )}
                    {/* 하이라이트 텍스트 */}
                    {scene.highlight && (
                      <p
                        className="text-[#C9A961] text-2xl md:text-4xl font-bold text-center drop-shadow-lg"
                        style={{ fontFamily: "'Noto Serif KR', serif" }}
                      >
                        {scene.highlight}
                      </p>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── 정지 상태: 재생 버튼 오버레이 ── */}
          {!isPlaying && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl mb-4"
              >
                <Play className="w-8 h-8 text-[#1F3864] ml-1" fill="#1F3864" />
              </motion.div>
              <p className="text-white/80 text-sm font-medium">
                클릭하여 EverWill 소개 영상 재생
              </p>
              <p
                className="text-white text-xl md:text-2xl font-bold mt-2 drop-shadow-lg"
              >
                누구나 한번은 꼭 해야할, 나의 마지막 서명
              </p>
            </div>
          )}

          {/* ── 컨트롤 버튼 (재생/음소거) ── */}
          <div className="absolute bottom-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleMute}
              className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
              title={isMuted ? "소리 켜기" : "소리 끄기"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handlePlay}
              className="w-9 h-9 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center text-white transition-colors"
              title={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
          </div>

          {/* 재생 시간 진행 바 */}
          {isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-[#C9A961] transition-all duration-500"
                style={{ width: `${(currentTime / 28) * 100}%` }}
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
