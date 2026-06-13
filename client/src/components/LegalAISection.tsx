/**
 * 법률 전문 AI 소개 섹션
 * LifeStorySection 바로 위에 배치
 * "법에 관한 무엇이든 물어보세요"
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Scale, MessageCircle, Globe, Shield, BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "wouter";

const legalFeatures = [
  {
    icon: Scale,
    title: "유언·상속 전문",
    desc: "한국 민법 제1060조부터 11개국 상속법까지. 유언장 작성, 상속 분쟁, 유류분 계산을 즉시 안내합니다.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Globe,
    title: "다국적 법률 지원",
    desc: "한국·미국·일본·중국·독일·사우디아라비아 등 11개국 법률을 동시에 비교 분석합니다.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Shield,
    title: "생활 법률 상담",
    desc: "부동산 등기, 금융자산 이전, 세금 신고, 가족관계 법률까지 일상의 모든 법률 문제를 도와드립니다.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: BookOpen,
    title: "샤리아법 포함",
    desc: "아랍어 RTL 지원 및 이슬람 상속법(샤리아) 자동 적용. 중동 고액 자산가를 위한 특화 서비스입니다.",
    color: "bg-amber-50 text-amber-600",
  },
];

const exampleQuestions = [
  "자녀에게 집을 물려줄 때 세금은 얼마나 내야 하나요?",
  "미국에 있는 자산도 한국 유언장으로 처리할 수 있나요?",
  "유류분이란 무엇이고, 어떻게 계산하나요?",
  "일본 국적 자녀에게 상속할 때 어떤 법이 적용되나요?",
];

export default function LegalAISection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

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
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          {/* 태그 */}
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            법률 전문 AI 개인비서
          </div>

          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            법에 관한 무엇이든<br />
            <span className="text-[#C9A961]">물어보세요</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
            생활·상속·유언 — 당신의 모든 법률 문제를<br className="hidden sm:block" />
            법률 전문 AI 개인비서가 24시간 도와드립니다.
          </p>
        </motion.div>

        {/* 메인 레이아웃: 좌측 채팅 미리보기 + 우측 기능 설명 */}
        <div className="grid lg:grid-cols-2 gap-10 items-center mb-14">
          {/* 좌측: AI 채팅 미리보기 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
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
                  <p className="text-white/40 text-xs">법률 전문 AI · 11개국 법률 지원</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-xs">온라인</span>
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
                      안녕하세요. 저는 EverWill 법률 전문 AI입니다. 유언·상속·생활법률에 관해 무엇이든 물어보세요. 11개국 법률을 지원합니다.
                    </p>
                  </div>
                </div>

                {/* 사용자 메시지 */}
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-[#C9A961] rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                    <p className="text-[#1F3864] text-sm font-medium leading-relaxed">
                      미국에 있는 부동산을 한국 자녀에게 물려주려면 어떻게 해야 하나요?
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
                      미국 부동산 상속은 <span className="text-[#C9A961] font-semibold">미국 주법 + 한국 상속세법</span>이 동시에 적용됩니다. 캘리포니아의 경우 프로베이트(검인) 절차가 필요하며, 한국 상속세는 해외 자산도 과세 대상입니다. EverWill에서 미국·한국 동시 유언장 작성이 가능합니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 예시 질문 버튼 */}
              <div className="space-y-2">
                <p className="text-white/30 text-xs mb-2">자주 묻는 질문</p>
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
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="space-y-4"
          >
            {legalFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
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
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="pt-2"
            >
              <Link href="/register">
                <button className="w-full py-4 bg-[#C9A961] hover:bg-[#b8944f] text-[#1F3864] font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#C9A961]/20">
                  <MessageCircle className="w-5 h-5" />
                  법률 AI에게 무료로 물어보기
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
              <p className="text-white/30 text-xs text-center mt-3">
                * 법률 정보 제공 서비스입니다. 공식 법률 자문은 제휴 변호사를 통해 진행됩니다.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* 하단: 예시 질문 4개 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
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
