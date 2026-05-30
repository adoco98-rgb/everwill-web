import { motion } from "framer-motion";
import { BookOpen, Mail, Camera, Lock, Sparkles, Mic } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Life Story 기능 소개 섹션
 * 홈페이지에 표시 — 기존 섹션 건드리지 않고 추가만 함
 * ₩99,000 이상 구매자 전용 기능 안내
 * 번역 키: t.lifeStory
 */

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export function LifeStorySection() {
  const { t } = useLanguage();
  const ls = t.lifeStory;

  const features = [
    {
      icon: <Mic className="w-7 h-7" />,
      title: ls.journalCardTitle,
      desc: ls.journalCardDesc,
      badge: ls.journalCardTag,
    },
    {
      icon: <Camera className="w-7 h-7" />,
      title: ls.albumCardTitle,
      desc: ls.albumCardDesc,
      badge: ls.albumCardTag,
    },
    {
      icon: <Mail className="w-7 h-7" />,
      title: ls.letterCardTitle,
      desc: ls.letterCardDesc,
      badge: ls.letterCardTag,
    },
  ];

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
              {ls.sectionBadge}
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            {ls.sectionTitle}<br />
            <span className="text-[#C9A961]">{ls.sectionTitleAccent}</span>
          </h2>

          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            {ls.sectionDesc}
          </p>

          {/* 등급 배지 */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
              <Lock className="w-4 h-4 text-[#C9A961]" />
              <span className="text-white/80 text-sm">{ls.premiumBadge}</span>
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
                  <p className="text-white font-semibold text-sm">{ls.previewJournalDate}</p>
                  <p className="text-white/40 text-xs">{ls.previewJournalStyle}</p>
                </div>
              </div>

              {/* 가상 일기 내용 */}
              <div className="rounded-xl bg-white/5 p-5 mb-4">
                <p className="text-white/70 text-sm leading-relaxed italic">
                  {ls.previewJournalText}
                </p>
              </div>

              {/* 가상 AI 그림 자리 */}
              <div className="rounded-xl bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-white/10 h-32 flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#C9A961]/60 mx-auto mb-2" />
                  <p className="text-white/40 text-xs">{ls.previewImageLabel}</p>
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
                  <p className="text-white font-semibold text-sm">{ls.previewLetterTo}</p>
                  <p className="text-white/40 text-xs">{ls.previewLetterCondition}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 p-5 mb-4">
                <p className="text-white/70 text-sm leading-relaxed italic">
                  {ls.previewLetterText}
                </p>
              </div>

              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#C9A961]/10 border border-[#C9A961]/20">
                <Lock className="w-4 h-4 text-[#C9A961]" />
                <span className="text-[#C9A961] text-xs font-medium">{ls.previewLetterLock}</span>
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
              {ls.ctaBtn}
            </button>
          </Link>
          <p className="text-white/40 text-sm mt-4">
            {ls.ctaNote}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
