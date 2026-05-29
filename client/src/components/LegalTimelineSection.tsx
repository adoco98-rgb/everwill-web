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
    ko: "한국, 전자계약·전자서명 완전 인정 — 디지털 유언 법리 분석 검토 중",
    en: "Korea fully recognizes e-contracts & e-signatures — Digital will legal analysis underway",
    highlight: false,
    stars: 3,
  },
  {
    year: "2025",
    flag: "🇬🇧",
    ko: "영국 Law Commission, 전자유언 합법화 최종 권고안 발표 — 입법 논의 진행 중",
    en: "UK Law Commission issues final recommendation for digital wills — Legislation in progress",
    highlight: false,
    stars: 3,
  },
  {
    year: "2026.8",
    flag: "🌍",
    ko: "EverWill — 세계 최초 디지털 유언 OS 서비스 개시",
    en: "EverWill — World's first Digital Will OS launches",
    highlight: true,
    everwill: true,
  },
];

/** 나라별 현황 데이터 */
const countryStatus = [
  {
    code: "us",
    flag: "🇺🇸",
    nameKo: "미국",
    nameEn: "USA",
    stars: 5,
    statusKo: "즉시 가능",
    statusEn: "Available Now",
    descKo: "UEWA로 20개 주 이상 전자유언 완전 합법. Trust & Will 등 플랫폼 이미 운영 중.",
    descEn: "UEWA adopted in 20+ states. Digital will platforms already active.",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-400/30",
  },
  {
    code: "ae",
    flag: "🇦🇪",
    nameKo: "UAE",
    nameEn: "UAE",
    stars: 5,
    statusKo: "즉시 가능",
    statusEn: "Available Now",
    descKo: "비무슬림 외국인(인구 90%) 전자유언 가능. DIFC·ADGM 자유무역지구 허용.",
    descEn: "Non-Muslim expats (90% of population) can use digital wills. DIFC/ADGM zones permitted.",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-400/30",
  },
  {
    code: "nz",
    flag: "🇳🇿",
    nameKo: "뉴질랜드",
    nameEn: "New Zealand",
    stars: 5,
    statusKo: "즉시 가능",
    statusEn: "Available Now",
    descKo: "2021년 Wills Act 개정으로 전자유언 공식 인정. 영미법 국가 최초 전면 합법화.",
    descEn: "2021 Wills Act amendment fully legalizes digital wills. First in common law countries.",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-400/30",
  },
  {
    code: "jp",
    flag: "🇯🇵",
    nameKo: "일본",
    nameEn: "Japan",
    stars: 4,
    statusKo: "조건부 가능",
    statusEn: "Conditionally Available",
    descKo: "2025년 10월 공정증서 디지털화 시행. 온라인 신청·웹 회의 방식 공정증서 유언 가능.",
    descEn: "Notarized digital wills via online/video conference from Oct 2025.",
    color: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-400/30",
  },
  {
    code: "ca",
    flag: "🇨🇦",
    nameKo: "캐나다",
    nameEn: "Canada",
    stars: 4,
    statusKo: "조건부 가능",
    statusEn: "Conditionally Available",
    descKo: "BC주·서스캐처원주 전자유언 합법(2021~2022). 타 주로 확산 추세.",
    descEn: "BC & Saskatchewan legalized digital wills (2021–2022). Spreading to other provinces.",
    color: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-400/30",
  },
  {
    code: "au",
    flag: "🇦🇺",
    nameKo: "호주",
    nameEn: "Australia",
    stars: 4,
    statusKo: "조건부 가능",
    statusEn: "Conditionally Available",
    descKo: "빅토리아·NSW주 원격 증인 허용(2021). 판례 축적으로 법적 인정 확대 중.",
    descEn: "Victoria & NSW allow remote witnesses (2021). Case law expanding recognition.",
    color: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-400/30",
  },
  {
    code: "mx",
    flag: "🇲🇽",
    nameKo: "멕시코",
    nameEn: "Mexico",
    stars: 4,
    statusKo: "조건부 가능",
    statusEn: "Conditionally Available",
    descKo: "멕시코시티 민법 2021년 개정, 디지털 유언 조항 포함. 대법원 긍정 판례 축적.",
    descEn: "Mexico City civil code (2021) includes digital will provisions. Positive Supreme Court rulings.",
    color: "from-yellow-500/20 to-yellow-600/10",
    border: "border-yellow-400/30",
  },
  {
    code: "kr",
    flag: "🇰🇷",
    nameKo: "한국",
    nameEn: "Korea",
    stars: 3,
    statusKo: "법리 분석 검토 중",
    statusEn: "Legal Analysis Underway",
    descKo: "전자서명법 완비(2020). 민법 개정 논의 진행 중. EverWill 1차 출시 시장.",
    descEn: "E-Signature Act complete (2020). Civil code amendment under discussion. EverWill's primary market.",
    color: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-400/30",
  },
  {
    code: "gb",
    flag: "🇬🇧",
    nameKo: "영국",
    nameEn: "UK",
    stars: 3,
    statusKo: "입법 논의 진행 중",
    statusEn: "Legislation in Progress",
    descKo: "2025년 Law Commission 합법화 권고안 발표. 법 개정 임박.",
    descEn: "Law Commission issued legalization recommendation in 2025. Amendment imminent.",
    color: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-400/30",
  },
  {
    code: "br",
    flag: "🇧🇷",
    nameKo: "브라질",
    nameEn: "Brazil",
    stars: 3,
    statusKo: "논의 진행 중",
    statusEn: "Under Discussion",
    descKo: "전자서명 인프라 완비(2020). 디지털 유언 논의 초기 단계. 남미 최대 시장.",
    descEn: "E-signature infrastructure complete (2020). Digital will discussion in early stages.",
    color: "from-orange-500/20 to-orange-600/10",
    border: "border-orange-400/30",
  },
  {
    code: "fr",
    flag: "🇫🇷",
    nameKo: "프랑스",
    nameEn: "France",
    stars: 2,
    statusKo: "논의 진행 중",
    statusEn: "Under Discussion",
    descKo: "EU eIDAS 전자서명 유효. 유언 분야는 자필 방식 고수. EU 전체 입법 동향 모니터링 중.",
    descEn: "EU eIDAS e-signature valid. Wills still require handwritten format. Monitoring EU legislation.",
    color: "from-slate-500/20 to-slate-600/10",
    border: "border-slate-400/30",
  },
  {
    code: "sg",
    flag: "🇸🇬",
    nameKo: "싱가포르",
    nameEn: "Singapore",
    stars: 2,
    statusKo: "법 개정 필요",
    statusEn: "Law Amendment Required",
    descKo: "전자거래법에서 유언장 명시적 제외. 법 개정 없이는 진출 불가. 장기 전략 수립 중.",
    descEn: "Electronic Transactions Act explicitly excludes wills. Cannot operate without law change.",
    color: "from-slate-500/20 to-slate-600/10",
    border: "border-slate-400/30",
  },
];

/** 별점 렌더링 */
function Stars({ count, total = 5 }: { count: number; total?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i < count ? "text-[#C9A961]" : "text-white/20"} style={{ fontSize: "14px" }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function LegalTimelineSection() {
  const { language } = useLanguage();
  const isKo = language === "ko";

  return (
    <section className="py-24 bg-[#1F3864] relative overflow-hidden">
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
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
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
                        : (item as any).future
                          ? "text-white/40"
                          : "text-white/60"
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
                        : (item as any).future
                          ? "bg-transparent border-white/30"
                          : "bg-white/20 border-white/40"
                    }`}
                  />
                </div>

                {/* 내용 */}
                <div
                  className={`flex-1 pb-2 rounded-xl px-4 py-3 ${
                    item.everwill
                      ? "bg-[#C9A961]/15 border border-[#C9A961]/40"
                      : (item as any).future
                        ? "bg-white/3 border border-white/10"
                        : "bg-white/5 border border-white/10"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl leading-tight">{item.flag}</span>
                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        item.everwill
                          ? "text-[#C9A961] font-semibold"
                          : (item as any).future
                            ? "text-white/50"
                            : "text-white/80"
                      }`}
                    >
                      {isKo ? item.ko : item.en}
                      {item.everwill && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-[#C9A961] text-[#1F3864] text-xs font-bold">
                          {isKo ? "지금 여기" : "NOW"}
                        </span>
                      )}
                      {(item as any).stars && (
                        <span className="ml-2 inline-flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < (item as any).stars ? "text-[#C9A961]" : "text-white/20"} style={{ fontSize: "12px" }}>★</span>
                          ))}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── 나라별 현황 카드 그리드 ─── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {isKo ? "국가별 전자유언 현황" : "Digital Will Status by Country"}
            </h3>
            <p className="text-white/50 text-sm">
              {isKo
                ? "★★★★★ 즉시 가능  ·  ★★★★ 조건부 가능  ·  ★★★ 논의 중  ·  ★★ 법 개정 필요"
                : "★★★★★ Available  ·  ★★★★ Conditional  ·  ★★★ Under Discussion  ·  ★★ Law Change Needed"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {countryStatus.map((c, idx) => (
              <motion.div
                key={c.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.color} p-4 backdrop-blur-sm`}
              >
                {/* 상단: 국기 + 국가명 + 별점 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* flagcdn 이미지 */}
                    <img
                      src={`https://flagcdn.com/w40/${c.code}.png`}
                      alt={c.nameEn}
                      className="w-8 h-auto rounded-sm shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-white font-bold text-base">
                      {isKo ? c.nameKo : c.nameEn}
                    </span>
                  </div>
                  <Stars count={c.stars} />
                </div>

                {/* 상태 배지 */}
                <div className="mb-2">
                  <span
                    className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.stars === 5
                        ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                        : c.stars === 4
                          ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                          : c.stars === 3
                            ? "bg-orange-400/20 text-orange-300 border border-orange-400/30"
                            : "bg-slate-400/20 text-slate-300 border border-slate-400/30"
                    }`}
                  >
                    {isKo ? c.statusKo : c.statusEn}
                  </span>
                </div>

                {/* 설명 */}
                <p className="text-white/70 text-xs leading-relaxed">
                  {isKo ? c.descKo : c.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

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
            <p className="text-white/70 text-base">
              {isKo
                ? "EverWill은 법이 오기 전에 이미 그 자리에 있습니다."
                : "EverWill is already there before the law arrives."}
            </p>
            <p className="text-white/40 text-xs mt-3">
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
