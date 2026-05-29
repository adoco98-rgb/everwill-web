/**
 * 글로벌 전자유언 입법 흐름 타임라인 섹션
 * "전자유언, 세계는 이미 바뀌고 있습니다"
 * 법률전략 검토문서 v2 기반 — 입법 선도 포지셔닝
 */
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const timelineItems = [
  {
    year: "2000",
    flag: "🇺🇸",
    ko: "ESIGN Act — 미국, 전자계약 법적 효력 전면 인정",
    en: "ESIGN Act — US recognizes full legal validity of electronic contracts",
    highlight: false,
  },
  {
    year: "2016",
    flag: "🇪🇺",
    ko: "EU eIDAS 규정 시행 — 유럽 27개국 전자서명 통일",
    en: "EU eIDAS Regulation — Unified e-signature across 27 EU countries",
    highlight: false,
  },
  {
    year: "2019",
    flag: "🇺🇸",
    ko: "UEWA — 미국 20개 주 이상, 전자유언 명시적 법적 인정",
    en: "UEWA — 20+ US states explicitly recognize digital wills",
    highlight: false,
  },
  {
    year: "2020",
    flag: "🇰🇷",
    ko: "전자서명법 전면 개정 — 공인인증서 독점 폐지, 다양한 전자서명 효력 인정",
    en: "Korea e-Signature Act revised — Monopoly abolished, diverse e-signatures recognized",
    highlight: false,
  },
  {
    year: "2021",
    flag: "🇳🇿",
    ko: "뉴질랜드 Wills Act 개정 — 전자유언 공식 인정",
    en: "New Zealand Wills Act amended — Digital wills officially recognized",
    highlight: false,
  },
  {
    year: "2023",
    flag: "🇰🇷",
    ko: "법무부, 디지털 유언 도입 가능성 연구 용역 발주 — 도입 긍정적 검토",
    en: "Korea Ministry of Justice commissions digital will feasibility study — Positive review",
    highlight: false,
  },
  {
    year: "2026.8",
    flag: "🌍",
    ko: "EverWill — 전자서명 유언 디지털 서비스 개시",
    en: "EverWill — Digital Will Service with E-Signature Launches",
    highlight: true,
    everwill: true,
  },
];

export default function LegalTimelineSection() {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section className="py-24 bg-[#162d54] relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#C9A961] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9A961] rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#C9A961]/20 text-[#C9A961] text-sm font-medium mb-4 border border-[#C9A961]/30">
            {isKo ? "글로벌 입법 흐름" : "Global Legislative Trend"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isKo
              ? "전자유언, 세계는 이미 바뀌고 있습니다"
              : "The World Is Already Moving to Digital Wills"}
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            {isKo
              ? "전자계약 → 전자서명 → 전자유언. 역사는 반복됩니다. EverWill은 그 흐름의 선두에 있습니다."
              : "E-contracts → E-signatures → E-wills. History repeats itself. EverWill leads this wave."}
          </p>
        </motion.div>

        {/* 타임라인 */}
        <div className="relative">
          {/* 중앙 세로선 */}
          <div className="absolute left-[72px] sm:left-[88px] top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-6">
            {timelineItems.map((item, idx) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="flex items-start gap-4 sm:gap-6"
              >
                {/* 연도 */}
                <div className="flex-shrink-0 w-16 sm:w-20 text-right">
                  <span
                    className={`text-sm font-bold ${
                      item.everwill
                        ? "text-[#C9A961]"
                        : "text-white"
                    }`}
                  >
                    {item.year}
                  </span>
                </div>

                {/* 점 */}
                <div className="flex-shrink-0 relative flex items-center justify-center w-6 mt-0.5">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      item.everwill
                        ? "bg-[#C9A961] border-[#C9A961] shadow-[0_0_12px_rgba(201,169,97,0.6)]"
                        : "bg-white/20 border-white/40"
                    }`}
                  />
                </div>

                {/* 내용 */}
                <div
                  className={`flex-1 pb-2 rounded-xl px-4 py-3 ${
                    item.everwill
                      ? "bg-[#C9A961]/20 border border-[#C9A961]/60"
                      : "bg-white/10 border border-white/25"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl leading-tight">{item.flag}</span>
                    <p
                      className={`text-base sm:text-lg leading-relaxed font-medium ${
                        item.everwill
                          ? "text-[#C9A961] font-bold"
                          : "text-white"
                      }`}
                    >
                      {isKo ? item.ko : item.en}
                      {item.everwill && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-[#C9A961] text-[#1F3864] text-xs font-bold">
                          {isKo ? "지금 여기" : "NOW"}
                        </span>
                      )}

                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 마지막 강조 문구 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-2xl px-8 py-6">
            <p className="text-[#C9A961] text-xl sm:text-2xl font-bold mb-2">
              {isKo
                ? '"법은 기술을 뒤따른다."'
                : '"Law follows technology."'}
            </p>
            <p className="text-white/90 text-base">
              {isKo
                ? "EverWill은 법이 오기 전에 이미 그 자리에 있습니다."
                : "EverWill is already there before the law arrives."}
            </p>
            <p className="text-white/60 text-xs mt-3">
              {isKo
                ? "— Law Panel, EverWill 각국 유언 전문 변호사단 · 2026 —"
                : "— Law Panel, EverWill International Legal Advisory · 2026 —"}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
