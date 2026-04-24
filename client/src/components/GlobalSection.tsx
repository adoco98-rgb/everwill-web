/**
 * EverWill 글로벌 섹션
 * 4단계 글로벌 출시 전략 + 세계 지도 배경
 * 네이비 배경 + 골드 강조
 * 언어 지원: 11개 언어 전부 표시 (국기 + 언어명 + 코드)
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, ArrowRight, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const GLOBAL_MAP_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/global-map-bg-azf9Vc6ZPzzfcAYoyT8HFS.webp";

// 11개 지원 언어 전체 목록
const languages = [
  { lang: "한국어", nativeName: "Korean", flag: "🇰🇷", code: "KO", note: "" },
  { lang: "English", nativeName: "English", flag: "🇺🇸", code: "EN", note: "" },
  { lang: "日本語", nativeName: "Japanese", flag: "🇯🇵", code: "JA", note: "" },
  { lang: "中文", nativeName: "Chinese", flag: "🇨🇳", code: "ZH", note: "" },
  { lang: "Deutsch", nativeName: "German", flag: "🇩🇪", code: "DE", note: "" },
  { lang: "Español", nativeName: "Spanish", flag: "🇪🇸", code: "ES", note: "" },
  { lang: "العربية", nativeName: "Arabic", flag: "🇸🇦", code: "AR", note: "RTL" },
  { lang: "Français", nativeName: "French", flag: "🇫🇷", code: "FR", note: "" },
  { lang: "Русский", nativeName: "Russian", flag: "🇷🇺", code: "RU", note: "" },
  { lang: "हिन्दी", nativeName: "Hindi", flag: "🇮🇳", code: "HI", note: "" },
  { lang: "Português", nativeName: "Portuguese", flag: "🇧🇷", code: "PT", note: "" },
];

export default function GlobalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  const launchPhases = [
    {
      phase: t.global.phase1,
      period: "Month 1-3",
      country: t.global.korea,
      flag: "🇰🇷",
      status: t.global.statusLaunch,
      statusColor: "bg-green-500",
      highlights: t.global.koreaHighlights,
      payment: "토스페이먼츠",
    },
    {
      phase: t.global.phase2,
      period: "Month 4-6",
      country: t.global.japan,
      flag: "🇯🇵",
      status: t.global.statusPrepare,
      statusColor: "bg-yellow-500",
      highlights: t.global.japanHighlights,
      payment: "PayPay · LINE Pay",
    },
    {
      phase: t.global.phase3,
      period: "Month 7-9",
      country: t.global.china,
      flag: "🇨🇳",
      status: t.global.statusPlan,
      statusColor: "bg-blue-400",
      highlights: t.global.chinaHighlights,
      payment: "Alipay · WeChat Pay",
    },
    {
      phase: t.global.phase4,
      period: "Month 10-12",
      country: t.global.usa,
      flag: "🇺🇸",
      status: t.global.statusPlan,
      statusColor: "bg-blue-400",
      highlights: t.global.usaHighlights,
      payment: "Stripe · Paddle",
    },
  ];

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
            {t.global.title}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t.global.subtitle}
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
                {phase.highlights.map((h: string) => (
                  <li key={h} className="flex items-center gap-2 text-white/60 text-sm">
                    <MapPin className="w-3 h-3 text-[#C9A961] flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-white/10">
                <div className="text-white/40 text-xs mb-1">{t.global.payment}</div>
                <div className="text-white/70 text-xs font-medium">{phase.payment}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 언어 지원 — 11개 언어 전부 표시 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 max-w-16 bg-white/20" />
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#C9A961]" />
              <h3 className="text-white/90 text-lg font-bold">{t.global.langSupport}</h3>
            </div>
            <div className="h-px flex-1 max-w-16 bg-white/20" />
          </div>

          {/* 11개 언어 카드 그리드 */}
          <div className="flex flex-wrap justify-center gap-3">
            {languages.map((l, i) => (
              <motion.div
                key={l.code}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 hover:bg-white/15 hover:border-[#C9A961]/40 transition-all group"
              >
                {/* 국기 */}
                <span className="text-2xl">{l.flag}</span>

                {/* 언어 정보 */}
                <div className="text-left">
                  <div className="text-white font-bold text-sm leading-tight">{l.lang}</div>
                  <div className="text-white/40 text-[11px] font-medium">{l.code}</div>
                </div>

                {/* RTL 배지 */}
                {l.note === "RTL" && (
                  <span className="text-[#C9A961] text-[10px] font-extrabold bg-[#C9A961]/20 border border-[#C9A961]/30 px-1.5 py-0.5 rounded-md ml-1">
                    RTL
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          {/* 아랍어 특별 안내 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-8 inline-flex items-center gap-2 text-[#C9A961] text-sm font-medium"
          >
            <span>{t.global.arabicNote}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
