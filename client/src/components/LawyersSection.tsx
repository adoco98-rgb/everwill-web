/**
 * EverWill 사후 집행 섹션
 * 현재: 계약 변호사가 유족 연락 + 집행 지원
 * 미래 비전: AI가 법원 제출 서류 자동 생성 → 변호사 불필요
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Cpu,
  FileCheck,
  Bell,
  Users,
  Scale,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const stepIcons = [Bell, Users, Scale, FileCheck];
const stepColors = [
  { color: "text-blue-700", bg: "bg-blue-100", card: "bg-blue-50 border-blue-200", num: "text-blue-200", title: "text-blue-900", desc: "text-blue-700" },
  { color: "text-amber-700", bg: "bg-amber-100", card: "bg-amber-50 border-amber-200", num: "text-amber-200", title: "text-amber-900", desc: "text-amber-700" },
  { color: "text-purple-700", bg: "bg-purple-100", card: "bg-purple-50 border-purple-200", num: "text-purple-200", title: "text-purple-900", desc: "text-purple-700" },
  { color: "text-green-700", bg: "bg-green-100", card: "bg-green-50 border-green-200", num: "text-green-200", title: "text-green-900", desc: "text-green-700" },
];
const futureIcons = [Cpu, FileCheck, Sparkles, Users];

export default function LawyersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  const currentProcess = [
    { step: "01", title: t.lawyers.step1Title, desc: t.lawyers.step1Desc },
    { step: "02", title: t.lawyers.step2Title, desc: t.lawyers.step2Desc },
    { step: "03", title: t.lawyers.step3Title, desc: t.lawyers.step3Desc },
    { step: "04", title: t.lawyers.step4Title, desc: t.lawyers.step4Desc },
  ];

  const futureFeatures = [
    { title: t.lawyers.future1Title, desc: t.lawyers.future1Desc },
    { title: t.lawyers.future2Title, desc: t.lawyers.future2Desc },
    { title: t.lawyers.future3Title, desc: t.lawyers.future3Desc },
    { title: t.lawyers.future4Title, desc: t.lawyers.future4Desc },
  ];

  const comparisonRows = [
    [t.lawyers.cmpCost, t.lawyers.cmpCostOld, t.lawyers.cmpCostNow, t.lawyers.cmpCostFuture],
    [t.lawyers.cmpTime, t.lawyers.cmpTimeOld, t.lawyers.cmpTimeNow, t.lawyers.cmpTimeFuture],
    [t.lawyers.cmpDocs, t.lawyers.cmpDocsOld, t.lawyers.cmpDocsNow, t.lawyers.cmpDocsFuture],
    [t.lawyers.cmpCourt, t.lawyers.cmpCourtOld, t.lawyers.cmpCourtNow, t.lawyers.cmpCourtFuture],
    [t.lawyers.cmpMulti, t.lawyers.cmpMultiOld, t.lawyers.cmpMultiNow, t.lawyers.cmpMultiFuture],
    [t.lawyers.cmpTransparency, t.lawyers.cmpTransparencyOld, t.lawyers.cmpTransparencyNow, t.lawyers.cmpTransparencyFuture],
  ];

  return (
    <section id="lawyers" className="py-20 lg:py-28 bg-[#FAFAF8]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 섹션 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="section-divider mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 bg-[#1F3864]/10 border border-[#1F3864]/20 rounded-full px-4 py-1.5 mb-5">
            <Scale className="w-4 h-4 text-[#1F3864]" />
            <span className="text-[#1F3864] text-sm font-bold">{t.lawyers.sectionTag}</span>
          </div>
          <h2
            className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.lawyers.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t.lawyers.subtitle}
          </p>
        </motion.div>

        {/* ── 현재 집행 프로세스 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-16"
        >
          <div className="flex items-center gap-2 mb-8">
            <div className="w-2 h-6 rounded-full bg-[#1F3864]" />
            <h3 className="text-xl font-bold text-[#1F3864]">{t.lawyers.currentTitle}</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentProcess.map((step, i) => {
              const Icon = stepIcons[i];
              const { color, bg } = stepColors[i];
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                  className="relative"
                >
                  <div className={`rounded-2xl p-6 border-2 hover:shadow-lg transition-all h-full ${stepColors[i].card}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stepColors[i].bg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stepColors[i].color}`} />
                      </div>
                      <span className={`text-3xl font-black ${stepColors[i].num}`}>{step.step}</span>
                    </div>
                    <h4 className={`font-bold text-lg mb-2 ${stepColors[i].title}`}>{step.title}</h4>
                    <p className={`text-sm leading-relaxed font-medium ${stepColors[i].desc}`}>{step.desc}</p>
                  </div>

                  {i < currentProcess.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-2 z-10 -translate-y-1/2">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* 소송 발생 / 소송 없음 두 박스 */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {/* 소송 발생 시 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-lg font-black text-red-700">소송 발생 시</span>
              </div>
              <p className="text-red-900 text-base leading-relaxed font-medium">
                유언과 관련하여 소송이 발생할 경우, EverWill에서 선정한 <strong>최상의 유산상속 전문 변호사</strong>가 준비되어 있습니다. 확실한 전자 인증 유언 문서로 한 건의 문제도 없이 대응할 수 있도록 도와드립니다.
              </p>
            </motion.div>

            {/* 소송 없을 시 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="bg-green-50 border-2 border-green-200 rounded-2xl p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-lg font-black text-green-700">소송 없을 시</span>
              </div>
              <p className="text-green-900 text-base leading-relaxed font-medium">
                EverWill 서비스는 <strong>유언자의 뜻을 100% 구현</strong>하는 데 그 목적이 있습니다. 유언자 유고 후 상속과 세금 모든 서비스를 <strong>적은 비용</strong>으로 편리하게 상속 서비스를 받으실 수 있도록 도와드립니다.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* ── EverWill 핵심 메시지 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#C9A961]/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#C9A961]" />
            </div>
            <span className="text-[#C9A961] text-sm font-bold tracking-widest uppercase">EverWill Promise</span>
          </div>

          <h3
            className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            저렴하고 간편하며,<br />
            <span className="text-[#C9A961]">더 빠르고 더 투명한</span><br />
            EverWill 디지털 서명 인증
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 박스 1 */}
            <div className="bg-white/10 rounded-2xl p-7 border border-white/15">
              <div className="w-12 h-12 rounded-xl bg-[#C9A961]/20 flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-[#C9A961]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">유언자의 뜻을 100% 반영</h4>
              <p className="text-white/80 text-base leading-relaxed">
                유언자의 뜻을 100% 반영한 전자 유언 증서는 유언자 스스로 자기의 뜻을 명확하게 보여줍니다.
                EverWill은 <strong className="text-[#C9A961]">평생을 동행</strong>하여 행복하고 편안한 삶을 도와드립니다.
              </p>
            </div>

            {/* 박스 2 */}
            <div className="bg-white/10 rounded-2xl p-7 border border-white/15">
              <div className="w-12 h-12 rounded-xl bg-[#C9A961]/20 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-[#C9A961]" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3">유언자 유고 후 원스톱 상속 서비스</h4>
              <p className="text-white/80 text-base leading-relaxed">
                유언자 유고 후 상속과 세금 모든 서비스를 <strong className="text-[#C9A961]">적은 비용</strong>으로 서비스받아
                편리하게 상속 서비스를 받으실 수 있도록 도와드립니다.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
