/**
 * 글로벌 전자유언 입법 흐름 타임라인 섹션
 * 연도 위치 유지 + 국기 + 상세 내용 + 사업 즉시 가능 별점 표시
 */
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// 국기 코드 (flagcdn.com 사용)
// 별점: 5 = 즉시 사업 가능, 0 = 불가
const timelineItems = [
  {
    year: "2000",
    flag: "us",
    stars: 5,
    ko: "ESIGN Act 제정 — 미국, 전자계약·전자서명 법적 효력 전면 인정. 온라인 계약·문서 서명이 종이와 동일한 법적 효력 획득. 디지털 경제의 법적 기반 완성.",
    en: "ESIGN Act — US grants full legal validity to e-contracts & e-signatures. Digital economy legal foundation established.",
    highlight: false,
    everwill: false,
  },
  {
    year: "2016",
    flag: "eu",
    stars: 3,
    ko: "EU eIDAS 규정 시행 — 유럽 27개국 전자서명 통일. 3단계 전자서명 체계(SES·AES·QES) 도입. 국경 초월 전자문서 상호 인정 실현.",
    en: "EU eIDAS Regulation — Unified e-signature across 27 EU countries. 3-tier signature framework established.",
    highlight: false,
    everwill: false,
  },
  {
    year: "2019",
    flag: "us",
    stars: 5,
    ko: "UEWA(통일전자유언법) 제정 — 미국 20개 주 이상 전자유언 명시적 법적 인정. 전자서명 + 원격 증인 방식으로 유언장 작성 가능. Trust & Will 등 디지털 유언 플랫폼 급성장.",
    en: "UEWA enacted — 20+ US states recognize digital wills. Remote witnessing allowed. Digital will platforms boom.",
    highlight: false,
    everwill: false,
  },
  {
    year: "2020",
    flag: "kr",
    stars: 2,
    ko: "전자서명법 전면 개정 — 공인인증서 독점 폐지, 다양한 민간 전자서명 효력 인정. 단, 민법상 유언 방식(5종)에 전자유언 미포함 — 헌법소원 논거 확보.",
    en: "Korea e-Signature Act revised — Monopoly abolished. However, digital wills still not recognized under Civil Code.",
    highlight: false,
    everwill: false,
  },
  {
    year: "2021",
    flag: "nz",
    stars: 5,
    ko: "뉴질랜드 Wills Act 개정 — 전자유언 공식 인정. 법원 재량으로 전자 형태 유언 효력 부여 가능. 영미법 국가 최초 전자유언 전면 합법화.",
    en: "New Zealand Wills Act amended — Digital wills officially recognized. First common law country to fully legalize e-wills.",
    highlight: false,
    everwill: false,
  },
  {
    year: "2021",
    flag: "ae",
    stars: 5,
    ko: "UAE 전자거래법 개정 — 전자서명 법적 가치 강화. 비무슬림 외국인(전체 인구 90%) 민법 기반 유언 등록 가능. 디지털 자산 상속 포함 의무화.",
    en: "UAE e-Transaction Law revised — Non-Muslims (90% of population) can register digital wills. Digital assets included.",
    highlight: false,
    everwill: false,
  },
  {
    year: "2025",
    flag: "jp",
    stars: 4,
    ko: "일본 공정증서 디지털화 시행 — 2025년 10월부터 온라인 신청·웹 회의 방식으로 공정증서 유언 작성 가능. 법무성 법제심의회: 디지털 자필증서 도입 검토 중.",
    en: "Japan notarial will digitization — Online/video conference notarial wills allowed from Oct 2025. Digital holographic will under review.",
    highlight: false,
    everwill: false,
  },
  {
    year: "2025",
    flag: "kr",
    stars: 2,
    ko: "법무부 공식 입장 발표 — '디지털 유언 현행법상 효력 없음, 추가 입법 논의 필요'. 사법정책연구원 유언증서 등록·보관제도 연구 발간. 헌법소원 논의 가속화.",
    en: "Korea Ministry of Justice — 'Digital wills have no legal effect under current law, legislative discussion needed.'",
    highlight: false,
    everwill: false,
  },
  {
    year: "2026.8",
    flag: "everwill",
    stars: 5,
    ko: "EverWill — 전자서명 유언 디지털 서비스 개시. 한국·미국·일본·UAE 동시 서비스. 세계 최초 디지털 유언 OS 플랫폼.",
    en: "EverWill — Digital Will OS Service Launches. Korea, US, Japan, UAE simultaneous service.",
    highlight: true,
    everwill: true,
  },
];

// 별점 렌더링 컴포넌트
function StarRating({ stars, everwill }: { stars: number; everwill: boolean }) {
  if (everwill) return null;
  return (
    <div className="flex items-center gap-0.5 mt-1.5 flex-shrink-0">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-sm ${
            s <= stars ? "text-[#C9A961]" : "text-white/20"
          }`}
        >
          ★
        </span>
      ))}
      <span className="text-white/50 text-xs ml-1">
        {stars === 5
          ? "즉시 가능"
          : stars >= 4
          ? "조건부 가능"
          : stars >= 3
          ? "준비 중"
          : "법 개정 필요"}
      </span>
    </div>
  );
}

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
          {/* 별점 범례 */}
          <div className="mt-6 inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-5 py-2 text-xs text-white/60">
            <span>★★★★★ 즉시 사업 가능</span>
            <span className="text-white/20">|</span>
            <span>★★★★ 조건부</span>
            <span className="text-white/20">|</span>
            <span>★★ 법 개정 필요</span>
          </div>
        </motion.div>

        {/* 타임라인 */}
        <div className="relative">
          {/* 중앙 세로선 */}
          <div className="absolute left-[72px] sm:left-[88px] top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-5">
            {timelineItems.map((item, idx) => (
              <motion.div
                key={`${item.year}-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.07 }}
                className="flex items-start gap-4 sm:gap-6"
              >
                {/* 연도 */}
                <div className="flex-shrink-0 w-16 sm:w-20 text-right pt-3">
                  <span
                    className={`text-sm font-bold ${
                      item.everwill ? "text-[#C9A961]" : "text-white"
                    }`}
                  >
                    {item.year}
                  </span>
                </div>

                {/* 점 */}
                <div className="flex-shrink-0 relative flex items-start justify-center w-6 pt-3.5">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      item.everwill
                        ? "bg-[#C9A961] border-[#C9A961] shadow-[0_0_12px_rgba(201,169,97,0.6)]"
                        : item.stars === 5
                        ? "bg-[#C9A961]/60 border-[#C9A961]"
                        : "bg-white/20 border-white/40"
                    }`}
                  />
                </div>

                {/* 내용 */}
                <div
                  className={`flex-1 pb-2 rounded-xl px-4 py-3 ${
                    item.everwill
                      ? "bg-[#C9A961]/20 border border-[#C9A961]/60"
                      : item.stars === 5
                      ? "bg-white/12 border border-[#C9A961]/30"
                      : "bg-white/8 border border-white/20"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {item.flag === "everwill" ? (
                      <span className="text-2xl leading-tight flex-shrink-0 mt-0.5">🌍</span>
                    ) : (
                      <img
                        src={`https://flagcdn.com/w40/${item.flag}.png`}
                        srcSet={`https://flagcdn.com/w80/${item.flag}.png 2x`}
                        width="32"
                        height="24"
                        alt={item.flag}
                        className="rounded-sm flex-shrink-0 mt-0.5 object-cover"
                        style={{ width: 32, height: 24 }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
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
                      <StarRating stars={item.stars} everwill={item.everwill} />
                    </div>
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
