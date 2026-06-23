/**
 * 법률 전문 AI 소개 섹션
 * LifeStorySection 바로 위에 배치
 * "법에 관한 무엇이든 물어보세요"
 * 11개 언어 지원 (useLanguage 훅 사용)
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Scale, MessageCircle, Globe, Shield, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LegalAISection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();
  const la = t.legalAI;

  const legalFeatures = [
    {
      icon: Scale,
      title: la.f1Title,
      desc: la.f1Desc,
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Globe,
      title: la.f2Title,
      desc: la.f2Desc,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      icon: Shield,
      title: la.f3Title,
      desc: la.f3Desc,
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: BookOpen,
      title: la.f4Title,
      desc: la.f4Desc,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const exampleQuestions = [la.faq1, la.faq2, la.faq3, la.faq4];

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-gradient-to-b from-[#1F3864] to-[#162a50] relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A961]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          {/* 태그 */}
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            {la.badge}
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {la.title}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            {la.subtitle}<br className="hidden sm:block" />
            {la.subtitle2}
          </p>
        </motion.div>

        {/* 메인 레이아웃: 좌측 채팅 미리보기 + 우측 기능 설명 */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          {/* 좌측: AI 채팅 미리보기 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 shadow-2xl">
              {/* 채팅 헤더 */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/10">
                <div className="w-10 h-10 bg-[#C9A961] rounded-full flex items-center justify-center flex-shrink-0">
                  <Scale className="w-5 h-5 text-[#1F3864]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Ever Legal AI</p>
                  <p className="text-white/40 text-xs">{la.badge}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">{la.onlineLabel}</span>
                </div>
              </div>

              {/* 채팅 메시지 */}
              <div className="space-y-4 mb-5">
                {/* AI 메시지 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#C9A961]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scale className="w-3.5 h-3.5 text-[#C9A961]" />
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                    <p className="text-white/90 text-sm leading-relaxed">
                      {la.greetingMsg}
                    </p>
                  </div>
                </div>

                {/* 사용자 메시지 */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#C9A961] rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                    <p className="text-[#1F3864] text-sm font-medium leading-relaxed">
                      {la.userQuestion}
                    </p>
                  </div>
                </div>

                {/* AI 답변 */}
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-[#C9A961]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scale className="w-3.5 h-3.5 text-[#C9A961]" />
                  </div>
                  <div className="bg-white/10 rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
                    <p className="text-white/90 text-sm leading-relaxed">
                      {la.aiAnswer.split(la.aiAnswerHighlight)[0]}
                      <span className="text-[#C9A961] font-semibold">{la.aiAnswerHighlight}</span>
                      {la.aiAnswer.split(la.aiAnswerHighlight)[1]}
                    </p>
                  </div>
                </div>
              </div>

              {/* 예시 질문 버튼 */}
              <div className="space-y-2">
                <p className="text-white/30 text-xs mb-2">{la.faqLabel}</p>
                {exampleQuestions.slice(0, 2).map((q, i) => (
                  <button
                    key={i}
                    className="w-full text-left text-xs text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#C9A961]" />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 우측: 기능 설명 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-4"
          >
            {legalFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">{feature.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}

            {/* CTA 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="pt-2"
            >
              <Link href="/register">
                <button className="w-full py-4 bg-[#C9A961] hover:bg-[#b8944f] text-[#1F3864] font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9A961]/20">
                  <MessageCircle className="w-5 h-5" />
                  {la.ctaBtn}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
              <p className="text-white/30 text-xs text-center mt-3">
                {la.ctaNote}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* 하단: 예시 질문 4개 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {exampleQuestions.map((q, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-start gap-2.5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-[#C9A961] flex-shrink-0 mt-0.5" />
              <p className="text-white/70 text-sm leading-relaxed">{q}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
