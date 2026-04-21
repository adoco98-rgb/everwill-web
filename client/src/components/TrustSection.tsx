/**
 * EverWill 신뢰 지표 섹션
 * EverWill 독자적 강점 6가지 — 비교 없음
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Globe2, Zap, Lock, Scale, Heart } from "lucide-react";

const mediaLogos = [
  { abbr: "조선" },
  { abbr: "중앙" },
  { abbr: "한경" },
  { abbr: "TechCrunch" },
  { abbr: "Forbes" },
  { abbr: "Bloomberg" },
];

const strengths = [
  {
    icon: Zap,
    title: "17분 완성",
    description: "AI 체크박스 마법사로 복잡한 법률 문서를 누구나 빠르게 완성할 수 있습니다.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "법적 효력 보장",
    description: "eKYC 본인인증 + 전자서명 + 블록체인 타임스탬프로 완전한 법적 효력을 갖습니다.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Globe2,
    title: "7개국 동시 지원",
    description: "한·일·중·영·독·스페인어·아랍어(RTL). 각국 법률 자동 적용, 세계 어디서나.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Lock,
    title: "은행급 보안",
    description: "E2E 암호화, ISMS 인증, SOC 2 Type II 목표. 개인정보는 절대 제3자에게 제공하지 않습니다.",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Scale,
    title: "사후 자동 집행",
    description: "4중 사망 감지 시스템으로 가족이 아무것도 하지 않아도 유언이 자동으로 집행됩니다.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Heart,
    title: "평생 동반자",
    description: "결혼·출산·이사·자산 변동마다 ₩15,000 재인증. 삶의 모든 순간을 함께합니다.",
    color: "bg-rose-50 text-rose-600",
  },
];

export default function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 미디어 언급 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-6">
            주요 언론 소개
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-14">
            {mediaLogos.map((logo, i) => (
              <motion.div
                key={logo.abbr}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-gray-300 font-bold text-lg lg:text-xl hover:text-[#1F3864] transition-colors cursor-default"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {logo.abbr}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="gold-line mb-14 max-w-2xl mx-auto" />

        {/* 섹션 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-10"
        >
          <h2
            className="text-2xl lg:text-4xl font-bold text-[#1F3864] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            EverWill만의 6가지 이유
          </h2>
          <p className="text-gray-500">
            독자적인 기술과 아이디어로 만든 세계 최초 디지털 유언 OS
          </p>
        </motion.div>

        {/* 강점 카드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {strengths.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
              className="flex items-start gap-4 bg-[#FAFAF8] rounded-xl p-5 border border-gray-100 card-hover"
            >
              <div
                className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#1F3864] mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
