/**
 * EverWill 소개 영상 섹션
 * Hero 섹션 바로 아래에 표시되는 30초 브랜드 소개 영상
 */
import { motion } from "framer-motion";
import { Play, Volume2 } from "lucide-react";
import { useState, useRef } from "react";

export default function VideoIntroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

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
            <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">EverWill 소개</span>
            <div className="w-8 h-px bg-[#C9A961]" />
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            세계 최초 디지털 유언 OS
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            유언 작성부터 사후 자동 집행까지, 전 과정을 책임지는 EverWill을 소개합니다.
          </p>
        </motion.div>

        {/* 영상 플레이어 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl bg-[#1F3864] group cursor-pointer"
          style={{ aspectRatio: "16/9" }}
          onClick={handlePlay}
        >
          {/* 영상 */}
          <video
            ref={videoRef}
            src="/manus-storage/everwill_intro_8c033abb.mp4"
            className="w-full h-full object-cover"
            onEnded={() => setIsPlaying(false)}
            playsInline
            preload="metadata"
            title="EverWill 소개 영상 - 세계 최초 디지털 유언 OS"
          />

          {/* 재생 버튼 오버레이 */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all duration-300">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-xl"
              >
                <Play className="w-8 h-8 text-[#1F3864] ml-1" fill="#1F3864" />
              </motion.div>
              {/* 영상 제목 오버레이 */}
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-medium opacity-80 mb-1">
                  <Volume2 className="w-4 h-4 inline mr-1" />
                  소리와 함께 시청하세요
                </p>
                <p className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  누구나 한번은 꼭 해야할, 나의 마지막 서명
                </p>
              </div>
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
          {["AI 유언장 작성 무료", "전자인증 ₩49,000", "7개 언어 지원", "사후 자동 집행", "4중 사망 감지"].map((tag) => (
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
