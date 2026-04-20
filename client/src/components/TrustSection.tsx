/**
 * SARAM 신뢰 지표 섹션
 * Trust & Will 대비 차별화 포인트 강조
 * 미디어 언급, 인증 배지
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle2 } from "lucide-react";

const mediaLogos = [
  { name: "조선일보", abbr: "조선" },
  { name: "중앙일보", abbr: "중앙" },
  { name: "한국경제", abbr: "한경" },
  { name: "TechCrunch", abbr: "TC" },
  { name: "Forbes", abbr: "Forbes" },
  { name: "Bloomberg", abbr: "Bloomberg" },
];

const differentiators = [
  {
    title: "Trust & Will 대비",
    items: [
      { label: "AI 유언장 작성", saram: "무료", competitor: "$199~" },
      { label: "전자 인증", saram: "₩49,000", competitor: "$299/년" },
      { label: "재인증 (수정)", saram: "₩15,000", competitor: "$299/년" },
      { label: "글로벌 지원", saram: "7개국", competitor: "미국만" },
      { label: "사망 감지", saram: "4중 자동", competitor: "가족 신고만" },
      { label: "Badge 시스템", saram: "세계 최초", competitor: "없음" },
    ],
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
          className="text-center mb-12"
        >
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-6">
            주요 언론 소개
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
            {mediaLogos.map((logo, i) => (
              <motion.div
                key={logo.name}
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

        {/* 골드 구분선 */}
        <div className="gold-line my-12 max-w-2xl mx-auto" />

        {/* 비교 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#1F3864] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              왜 SARAM인가?
            </h2>
            <p className="text-gray-500">글로벌 경쟁사 대비 압도적 가성비와 기능</p>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            {/* 헤더 */}
            <div className="grid grid-cols-3 bg-[#1F3864] text-white">
              <div className="px-6 py-4 text-sm font-medium text-white/70">항목</div>
              <div className="px-6 py-4 text-sm font-bold text-center text-[#C9A961]">SARAM</div>
              <div className="px-6 py-4 text-sm font-medium text-center text-white/60">Trust & Will</div>
            </div>

            {/* 비교 행 */}
            {differentiators[0].items.map((item, i) => (
              <div
                key={item.label}
                className={`grid grid-cols-3 border-b border-gray-100 last:border-0 ${
                  i % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"
                }`}
              >
                <div className="px-6 py-4 text-sm text-gray-600 font-medium">{item.label}</div>
                <div className="px-6 py-4 text-center">
                  <span className="inline-flex items-center gap-1 text-sm font-bold text-[#1F3864]">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {item.saram}
                  </span>
                </div>
                <div className="px-6 py-4 text-center text-sm text-gray-400">{item.competitor}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
