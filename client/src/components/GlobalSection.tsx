/**
 * EverWill 글로벌 섹션
 * 4단계 글로벌 출시 전략 + 세계 지도 배경
 * 네이비 배경 + 골드 강조
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, ArrowRight } from "lucide-react";

const GLOBAL_MAP_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/global-map-bg-azf9Vc6ZPzzfcAYoyT8HFS.webp";

const launchPhases = [
  {
    phase: "1차",
    period: "Month 1-3",
    country: "한국",
    flag: "🇰🇷",
    status: "출시 예정",
    statusColor: "bg-green-500",
    highlights: ["본사 위치", "재외한인 700만", "시장 공백"],
    payment: "토스페이먼츠",
  },
  {
    phase: "2차",
    period: "Month 4-6",
    country: "일본",
    flag: "🇯🇵",
    status: "준비 중",
    statusColor: "bg-yellow-500",
    highlights: ["2025.10 디지털화", "한국 유사 법체계", "고령화 사회"],
    payment: "PayPay · LINE Pay",
  },
  {
    phase: "3차",
    period: "Month 7-9",
    country: "중국·홍콩·대만",
    flag: "🇨🇳",
    status: "계획",
    statusColor: "bg-blue-400",
    highlights: ["홍콩·대만 우선", "화교 네트워크", "글로벌 자산"],
    payment: "Alipay · WeChat Pay",
  },
  {
    phase: "4차",
    period: "Month 10-12",
    country: "미국",
    flag: "🇺🇸",
    status: "계획",
    statusColor: "bg-blue-400",
    highlights: ["재미한인 100만", "CA·NY 우선", "영어 서비스"],
    payment: "Stripe · Paddle",
  },
];

const languages = [
  { lang: "한국어", flag: "🇰🇷", note: "기본" },
  { lang: "日本語", flag: "🇯🇵", note: "2차" },
  { lang: "中文", flag: "🇨🇳", note: "3차" },
  { lang: "English", flag: "🇺🇸", note: "4차" },
  { lang: "Deutsch", flag: "🇩🇪", note: "5차" },
  { lang: "Español", flag: "🇪🇸", note: "5차" },
  { lang: "عربي", flag: "🇸🇦", note: "RTL" },
];

export default function GlobalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="global" className="py-20 lg:py-28 relative overflow-hidden" ref={ref}>
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <img
          src={GLOBAL_MAP_IMAGE}
          alt="글로벌 네트워크 지도"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1F3864]/90" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            글로벌 유언 OS
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            한국에서 시작해 전 세계로. 7개 언어, 4개국 동시 지원.
            <br />
            이런 서비스는 현재 세계에 없습니다.
          </p>
        </motion.div>

        {/* 출시 단계 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {launchPhases.map((phase, i) => (
            <motion.div
              key={phase.country}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/12 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#C9A961] text-xs font-bold bg-[#C9A961]/15 px-2 py-1 rounded-full">
                  {phase.phase} · {phase.period}
                </span>
                <span className={`w-2 h-2 rounded-full ${phase.statusColor}`} />
              </div>

              <div className="text-4xl mb-2">{phase.flag}</div>
              <h3 className="text-white font-bold text-lg mb-3">{phase.country}</h3>

              <ul className="space-y-1.5 mb-4">
                {phase.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-white/60 text-sm">
                    <MapPin className="w-3 h-3 text-[#C9A961] flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-white/10">
                <div className="text-white/40 text-xs mb-1">결제</div>
                <div className="text-white/70 text-xs font-medium">{phase.payment}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 언어 지원 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-white/80 text-lg font-semibold mb-6">7개 언어 지원</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {languages.map((l, i) => (
              <motion.div
                key={l.lang}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.06 }}
                className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2"
              >
                <span className="text-lg">{l.flag}</span>
                <span className="text-white font-medium text-sm">{l.lang}</span>
                {l.note === "RTL" && (
                  <span className="text-[#C9A961] text-xs bg-[#C9A961]/20 px-1.5 py-0.5 rounded">RTL</span>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 inline-flex items-center gap-2 text-[#C9A961] text-sm font-medium"
          >
            <span>아랍어 RTL + 샤리아 상속법 자동 적용</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
