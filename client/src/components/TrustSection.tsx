/**
 * EverWill 신뢰 지표 섹션
 * EverWill 독자적 강점 6가지 — 비교 없음
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Globe2, Zap, Lock, Scale, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const mediaLogos = [
  { abbr: "조선" },
  { abbr: "중앙" },
  { abbr: "한경" },
  { abbr: "TechCrunch" },
  { abbr: "Forbes" },
  { abbr: "Bloomberg" },
];

const strengthColors = [
  "bg-amber-50 text-amber-600",
  "bg-green-50 text-green-600",
  "bg-blue-50 text-blue-600",
  "bg-indigo-50 text-indigo-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
];

const strengthIcons = [Zap, ShieldCheck, Globe2, Lock, Scale, Heart];

export default function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t } = useLanguage();

  const strengths = [
    { title: t.trust.s1Title, description: t.trust.s1Desc },
    { title: t.trust.s2Title, description: t.trust.s2Desc },
    { title: t.trust.s3Title, description: t.trust.s3Desc },
    { title: t.trust.s4Title, description: t.trust.s4Desc },
    { title: t.trust.s5Title, description: t.trust.s5Desc },
    { title: t.trust.s6Title, description: t.trust.s6Desc },
  ];

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
            {t.trust.mediaTitle}
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
            {t.trust.title}
          </h2>
          <p className="text-gray-500">
            {t.trust.subtitle}
          </p>
        </motion.div>

        {/* 강점 카드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {strengths.map((s, i) => {
            const Icon = strengthIcons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-4 bg-[#FAFAF8] rounded-xl p-5 border border-gray-100 card-hover"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${strengthColors[i]} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F3864] mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
