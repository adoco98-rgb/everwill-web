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
  { color: "text-blue-600", bg: "bg-blue-50" },
  { color: "text-[#C9A961]", bg: "bg-amber-50" },
  { color: "text-[#1F3864]", bg: "bg-blue-50" },
  { color: "text-green-600", bg: "bg-green-50" },
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
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#1F3864]/20 hover:shadow-md transition-all h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <span className="text-2xl font-black text-gray-100">{step.step}</span>
                    </div>
                    <h4 className="font-bold text-[#1F3864] mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
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

          {/* 변호사 안내 배너 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-6 bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1F3864] flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-[#C9A961]" />
            </div>
            <div>
              <div className="font-bold text-[#1F3864] mb-1">{t.lawyers.bannerTitle}</div>
              <p className="text-sm text-gray-600">{t.lawyers.bannerDesc}</p>
            </div>

          </motion.div>
        </motion.div>

        {/* ── 미래 비전: AI 자동화 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#C9A961]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C9A961]" />
            </div>
            <span className="text-[#C9A961] text-sm font-bold tracking-widest uppercase">Future Vision</span>
          </div>

          <h3
            className="text-2xl lg:text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.lawyers.futureTitle}
          </h3>
          <p className="text-white/70 mb-10 max-w-2xl text-base leading-relaxed">
            {t.lawyers.futureDesc}
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {futureFeatures.map((feat, i) => {
              const FeatIcon = futureIcons[i];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 hover:border-[#C9A961]/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#C9A961]/20 flex items-center justify-center mb-3">
                    <FeatIcon className="w-4 h-4 text-[#C9A961]" />
                  </div>
                  <h4 className="font-bold text-white mb-2 text-sm">{feat.title}</h4>
                  <p className="text-white/60 text-xs leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* 비교 표 - 모바일 카드형 */}
          <div className="bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/10">
            <h4 className="text-white font-bold mb-4 text-sm">{t.lawyers.cmpTitle}</h4>
            {/* 데스크탑: 테이블 */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white/50 font-medium text-xs">{t.lawyers.cmpHeader}</th>
                    <th className="text-center py-2 text-white/50 font-medium text-xs">{t.lawyers.cmpOld}</th>
                    <th className="text-center py-2 text-[#C9A961] font-bold text-xs">{t.lawyers.cmpNow}</th>
                    <th className="text-center py-2 text-[#C9A961] font-bold text-xs">{t.lawyers.cmpFuture}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {comparisonRows.map(([item, old, now, future], i) => (
                    <tr key={i}>
                      <td className="py-2.5 text-white/70 text-xs">{item}</td>
                      <td className="py-2.5 text-center text-white/40 text-xs">{old}</td>
                      <td className="py-2.5 text-center text-[#C9A961] text-xs font-medium">{now}</td>
                      <td className="py-2.5 text-center text-[#C9A961] text-xs font-bold">{future}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 모바일: 카드형 */}
            <div className="sm:hidden space-y-3">
              {/* 헤더 */}
              <div className="grid grid-cols-3 gap-1 pb-2 border-b border-white/10">
                <div className="text-white/50 text-[10px] font-medium"></div>
                <div className="text-white/50 text-[10px] font-medium text-center">{t.lawyers.cmpOld}</div>
                <div className="text-[#C9A961] text-[10px] font-bold text-center">{t.lawyers.cmpFuture}</div>
              </div>
              {comparisonRows.map(([item, old, _now, future], i) => (
                <div key={i} className="grid grid-cols-3 gap-1 py-2 border-b border-white/5 items-center">
                  <div className="text-white/80 text-[11px] font-semibold leading-tight">{item}</div>
                  <div className="text-white/40 text-[11px] text-center leading-tight">{old}</div>
                  <div className="text-[#C9A961] text-[11px] font-bold text-center leading-tight">{future}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-white/40 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{t.lawyers.aiNote}</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
