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

/* ─── 현재 집행 프로세스 ─── */
const currentProcess = [
  {
    step: "01",
    icon: Bell,
    title: "사망 감지",
    desc: "4중 감지 시스템 — 가족 신고·정부 DB·Dead Man's Switch·응급 발견자 중 2채널 교차 확인",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    step: "02",
    icon: Users,
    title: "유족 자동 알림",
    desc: "등록된 상속자 전원에게 현지 언어·시간대 맞춤 자동 알림. 72시간 이의제기 기간 부여",
    color: "text-[#C9A961]",
    bg: "bg-amber-50",
  },
  {
    step: "03",
    icon: Scale,
    title: "계약 변호사 배정",
    desc: "EverWill과 계약된 전문 변호사가 유족과 연락하여 상속 집행 전 과정 지원",
    color: "text-[#1F3864]",
    bg: "bg-blue-50",
  },
  {
    step: "04",
    icon: FileCheck,
    title: "상속 완료",
    desc: "법원 검인 → 상속세 신고 → 부동산·금융자산 이전까지 원스톱 처리",
    color: "text-green-600",
    bg: "bg-green-50",
  },
];

/* ─── 미래 비전: AI 자동화 ─── */
const futureFeatures = [
  {
    icon: Cpu,
    title: "AI 법원 서류 자동 생성",
    desc: "유언 내용을 분석해 각국 법원에 제출 가능한 서류를 자동으로 생성합니다. 변호사 없이 직접 제출 가능.",
  },
  {
    icon: FileCheck,
    title: "전자 제출 시스템",
    desc: "생성된 서류를 법원 전자 시스템에 직접 제출할 수 있도록 안내합니다. 비용 대폭 절감.",
  },
  {
    icon: Sparkles,
    title: "AI 상속세 자동 계산·신고",
    desc: "자산 정보 기반으로 상속세를 자동 계산하고 신고 서류까지 생성합니다.",
  },
  {
    icon: Users,
    title: "상속자 직접 처리 가이드",
    desc: "상속자가 직접 처리할 수 있도록 단계별 가이드를 제공합니다. 변호사 비용 없이 저렴하게.",
  },
];

export default function LawyersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

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
            사망 후, EverWill이 모든 것을 처리합니다
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            유족이 슬픔에 잠긴 순간, 복잡한 상속 절차를 대신합니다.
            <br />
            현재는 계약 변호사가, 미래에는 AI가 법원 서류를 자동으로 처리합니다.
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
            <h3 className="text-xl font-bold text-[#1F3864]">현재 서비스 — 사후 자동 집행 프로세스</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentProcess.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#1F3864]/20 hover:shadow-md transition-all h-full">
                  {/* 단계 번호 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center`}>
                      <step.icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <span className="text-2xl font-black text-gray-100">{step.step}</span>
                  </div>
                  <h4 className="font-bold text-[#1F3864] mb-2">{step.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>

                {/* 화살표 (마지막 제외) */}
                {i < currentProcess.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-2 z-10 -translate-y-1/2">
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
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
              <div className="font-bold text-[#1F3864] mb-1">계약 변호사 사후 집행 지원</div>
              <p className="text-sm text-gray-600">
                EverWill과 계약된 전문 변호사가 유족과 직접 연락하여 가정법원 검인, 상속세 신고, 부동산·금융자산 이전까지 전 과정을 지원합니다.
                유언장 인증(₩49,000) 요금에 포함된 서비스입니다.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 whitespace-nowrap ml-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-700 text-xs font-semibold">인증 요금에 포함</span>
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
            앞으로는 변호사가 필요 없습니다
          </h3>
          <p className="text-white/70 mb-10 max-w-2xl text-base leading-relaxed">
            EverWill의 궁극적 비전은 AI가 모든 법원 제출 서류를 자동으로 생성하고,
            상속자가 직접 제출할 수 있도록 돕는 것입니다.
            기존 변호사 비용 대비 <span className="text-[#C9A961] font-bold">90% 이상 저렴</span>하고,
            더 빠르고, 더 투명합니다.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {futureFeatures.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 hover:border-[#C9A961]/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-[#C9A961]/20 flex items-center justify-center mb-3">
                  <feat.icon className="w-4.5 h-4.5 text-[#C9A961]" />
                </div>
                <h4 className="font-bold text-white mb-2 text-sm">{feat.title}</h4>
                <p className="text-white/60 text-xs leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 비교 표 */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-white font-bold mb-5 text-sm">기존 방식 vs EverWill 방식 비교</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white/50 font-medium text-xs">항목</th>
                    <th className="text-center py-2 text-white/50 font-medium text-xs">기존 변호사</th>
                    <th className="text-center py-2 text-[#C9A961] font-bold text-xs">EverWill (현재)</th>
                    <th className="text-center py-2 text-[#C9A961] font-bold text-xs">EverWill (미래)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    ["비용", "₩300~500만", "인증료 포함", "인증료 포함"],
                    ["소요 기간", "3~12개월", "1~3개월", "2~4주"],
                    ["서류 작성", "변호사 직접", "변호사 지원", "AI 자동 생성"],
                    ["법원 제출", "변호사 대리", "변호사 대리", "직접 전자 제출"],
                    ["다국적 자산", "각국 변호사 별도", "EverWill 조율", "AI 자동 조율"],
                    ["투명성", "낮음", "높음", "완전 투명"],
                  ].map(([item, old, now, future], i) => (
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
          </div>

          <div className="mt-6 flex items-center gap-2 text-white/40 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>AI 자동화 서비스는 단계적으로 출시 예정입니다. 현재는 계약 변호사 지원 방식으로 운영됩니다.</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
