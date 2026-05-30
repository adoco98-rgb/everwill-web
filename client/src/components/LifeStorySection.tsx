import { motion } from "framer-motion";
import { BookOpen, Mail, Camera, Lock, Sparkles, Mic } from "lucide-react";
import { Link } from "wouter";

/**
 * Life Story 기능 소개 섹션
 * 홈페이지에 표시 — 기존 섹션 건드리지 않고 추가만 함
 * ₩99,000 이상 구매자 전용 기능 안내
 */

const features = [
  {
    icon: <Mic className="w-7 h-7" />,
    title: "AI와 대화하는 나의 일기",
    desc: "오늘 있었던 일을 AI에게 말하듯 이야기하세요. 음성이 텍스트로 변환되고, AI가 오늘의 일기와 그림을 자동으로 만들어 드립니다.",
    badge: "AI 일기",
    color: "from-blue-900/60 to-navy-900/80",
  },
  {
    icon: <Camera className="w-7 h-7" />,
    title: "나를 닮은 AI 그림",
    desc: "본인과 가족 사진을 등록하면, AI가 실제 얼굴을 닮은 수채화·일러스트 그림으로 일기를 완성합니다. 아내, 아들, 딸이 그림 속에 살아납니다.",
    badge: "인물 앨범",
    color: "from-purple-900/60 to-navy-900/80",
  },
  {
    icon: <Mail className="w-7 h-7" />,
    title: "소중한 사람에게 남기는 편지",
    desc: "아들의 결혼식 날, 손녀의 성인이 되는 날 — 원하는 순간에 자동으로 전달되는 편지를 지금 써두세요. 당신이 없어도 당신의 마음이 전해집니다.",
    badge: "레거시 편지",
    color: "from-amber-900/60 to-navy-900/80",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function LifeStorySection() {
  return (
    <section
      id="life-story"
      className="relative py-24 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1F3864 60%, #0d1b3e 100%)" }}
    >
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#C9A961]/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A961]/40 bg-[#C9A961]/10 mb-6">
            <Sparkles className="w-4 h-4 text-[#C9A961]" />
            <span className="text-[#C9A961] text-sm font-medium tracking-widest uppercase">
              Life Story — Premium Feature
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            당신의 이야기를<br />
            <span className="text-[#C9A961]">영원히 남기세요</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            유언장을 넘어, 삶의 기억과 감정을 AI와 함께 기록합니다.
            소중한 사람들에게 당신의 목소리와 마음을 전달하는 세계 최초의 디지털 생애 기록 서비스입니다.
          </p>

          {/* 등급 배지 */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
              <Lock className="w-4 h-4 text-[#C9A961]" />
              <span className="text-white/80 text-sm">Badge Necklace (₩99,000) 이상 전용</span>
            </div>
          </div>
        </motion.div>

        {/* 기능 카드 3개 */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-[#C9A961]/40 transition-all duration-300 group"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div className="p-8">
                {/* 아이콘 */}
                <div className="w-14 h-14 rounded-xl bg-[#C9A961]/15 border border-[#C9A961]/30 flex items-center justify-center text-[#C9A961] mb-6 group-hover:bg-[#C9A961]/25 transition-colors">
                  {f.icon}
                </div>

                {/* 배지 */}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30 mb-4">
                  {f.badge}
                </span>

                <h3 className="text-xl font-bold text-white mb-3 leading-snug">
                  {f.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>

              {/* 하단 그라데이션 */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C9A961]/0 via-[#C9A961]/60 to-[#C9A961]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </motion.div>

        {/* 미리보기 이미지 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="rounded-3xl border border-white/10 overflow-hidden mb-14"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* 왼쪽: 일기 미리보기 */}
            <div className="p-10 border-b md:border-b-0 md:border-r border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">2026년 5월 29일 목요일</p>
                  <p className="text-white/40 text-xs">AI 일기 · 수채화 스타일</p>
                </div>
              </div>

              {/* 가상 일기 내용 */}
              <div className="rounded-xl bg-white/5 p-5 mb-4">
                <p className="text-white/70 text-sm leading-relaxed italic">
                  "오늘 아들과 함께 뒷산을 올랐다. 오랜만에 둘이서 걸으며 많은 이야기를 나눴다.
                  저녁 노을이 참 아름다웠고, 아들의 웃음소리가 귓가에 맴돈다..."
                </p>
              </div>

              {/* 가상 AI 그림 자리 */}
              <div className="rounded-xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 h-32 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#C9A961]/60 mx-auto mb-2" />
                  <p className="text-white/40 text-xs">AI가 생성한 오늘의 그림</p>
                </div>
              </div>
            </div>

            {/* 오른쪽: 편지 미리보기 */}
            <div className="p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">아들에게 남기는 편지</p>
                  <p className="text-white/40 text-xs">공개 조건: 아들 결혼식 날</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-5 mb-4">
                <p className="text-white/70 text-sm leading-relaxed italic">
                  "사랑하는 아들아, 네가 이 편지를 읽을 때 아빠는 곁에 없겠지만,
                  네 결혼을 진심으로 축하한다. 항상 행복하게 살아라..."
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#C9A961]/10 border border-[#C9A961]/20">
                <Lock className="w-4 h-4 text-[#C9A961]" />
                <span className="text-[#C9A961] text-xs font-medium">잠금 상태 — 조건 충족 시 자동 공개</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link href="/life-story">
            <button className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-[#C9A961] text-[#1F3864] font-bold text-lg hover:bg-[#d4b56e] transition-all duration-200 shadow-lg shadow-[#C9A961]/20 hover:shadow-[#C9A961]/40 hover:scale-105">
              <Sparkles className="w-5 h-5" />
              Life Story 시작하기
            </button>
          </Link>
          <p className="text-white/40 text-sm mt-4">
            Badge Necklace (₩99,000) 이상 구매 시 무료 이용 · 로그인 필요
          </p>
        </motion.div>
      </div>
    </section>
  );
}
