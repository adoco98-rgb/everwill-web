/**
 * EverWill 글로벌 섹션
 * 상단 국기 탭 클릭 시 해당 국가 박스 1개만 표시
 * 11개 언어 각각에 대한 국가 정보 데이터 포함
 */
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MapPin, ArrowRight, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n";

const GLOBAL_MAP_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/global-map-bg-azf9Vc6ZPzzfcAYoyT8HFS.webp";

// 11개 언어별 국가 정보 데이터
type CountryData = {
  flag: string;
  flagImg: string;
  countryCode: string;
  phase: string;
  period: string;
  statusColor: string;
  highlights: string[];
  payment: string;
  legalNote: string;
};

const countryDataMap: Record<Language, CountryData> = {
  ko: {
    flag: "🇰🇷",
    flagImg: "https://flagcdn.com/w80/kr.png",
    countryCode: "KR",
    phase: "1차",
    period: "Month 1-3",
    statusColor: "bg-green-500",
    highlights: ["한국어 완벽 지원", "토스페이먼츠 결제", "현지 법률 적용", "재외한인 700만 명 타깃"],
    payment: "토스페이먼츠",
    legalNote: "한국 민법 기반 유언 · 가정법원 검인",
  },
  en: {
    flag: "🇺🇸",
    flagImg: "https://flagcdn.com/w80/us.png",
    countryCode: "US",
    phase: "4th",
    period: "Month 10-12",
    statusColor: "bg-blue-400",
    highlights: ["Full English support", "Stripe · Paddle payment", "California · New York first", "Korean-American community target"],
    payment: "Stripe · Paddle",
    legalNote: "US State Law · Probate Court",
  },
  ja: {
    flag: "🇯🇵",
    flagImg: "https://flagcdn.com/w80/jp.png",
    countryCode: "JP",
    phase: "2次",
    period: "Month 4-6",
    statusColor: "bg-yellow-500",
    highlights: ["日本語 완벽 지원", "PayPay · LINE Pay 결제", "현지 법률 적용", "2025.10 공정증서 디지털화"],
    payment: "PayPay · LINE Pay",
    legalNote: "日本民法 · 家庭裁判所",
  },
  zh: {
    flag: "🇨🇳",
    flagImg: "https://flagcdn.com/w80/cn.png",
    countryCode: "CN",
    phase: "3차",
    period: "Month 7-9",
    statusColor: "bg-blue-400",
    highlights: ["中文 간체·번체 지원", "Alipay · WeChat Pay 결제", "홍콩·대만 우선 진출", "본토는 규제 검토 후 진출"],
    payment: "Alipay · WeChat Pay",
    legalNote: "香港·台灣 法律 · 繼承法",
  },
  de: {
    flag: "🇩🇪",
    flagImg: "https://flagcdn.com/w80/de.png",
    countryCode: "DE",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["Vollständige Deutschsprachige Unterstützung", "SEPA · Stripe Zahlung", "EU-DSGVO konform", "Deutsches Erbrecht"],
    payment: "SEPA · Stripe",
    legalNote: "Deutsches BGB · Nachlassgericht",
  },
  es: {
    flag: "🇪🇸",
    flagImg: "https://flagcdn.com/w80/es.png",
    countryCode: "ES",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["Soporte completo en español", "Pago con Stripe · PayPal", "España y Latinoamérica", "Derecho sucesorio local"],
    payment: "Stripe · PayPal",
    legalNote: "Código Civil Español · Registro",
  },
  ar: {
    flag: "🇸🇦",
    flagImg: "https://flagcdn.com/w80/sa.png",
    countryCode: "SA",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["دعم كامل للغة العربية (RTL)", "تطبيق قانون الشريعة الإسلامية تلقائياً", "نسبة الميراث 2:1 (ذكر:أنثى)", "استهداف أصحاب الثروات في الشرق الأوسط"],
    payment: "STC Pay · Mada",
    legalNote: "الشريعة الإسلامية · محاكم الأحوال الشخصية",
  },
  fr: {
    flag: "🇫🇷",
    flagImg: "https://flagcdn.com/w80/fr.png",
    countryCode: "FR",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["Support complet en français", "Paiement CB · Stripe", "France et Belgique", "Droit successoral français"],
    payment: "Carte Bancaire · Stripe",
    legalNote: "Code Civil Français · Notaire",
  },
  ru: {
    flag: "🇷🇺",
    flagImg: "https://flagcdn.com/w80/ru.png",
    countryCode: "RU",
    phase: "6th",
    period: "Year 3",
    statusColor: "bg-gray-400",
    highlights: ["Полная поддержка русского языка", "Оплата через СБП · Stripe", "Россия и СНГ", "Российское наследственное право"],
    payment: "СБП · Stripe",
    legalNote: "ГК РФ · Нотариат",
  },
  hi: {
    flag: "🇮🇳",
    flagImg: "https://flagcdn.com/w80/in.png",
    countryCode: "IN",
    phase: "6th",
    period: "Year 3",
    statusColor: "bg-gray-400",
    highlights: ["हिन्दी में पूर्ण सहायता", "UPI · Razorpay भुगतान", "भारतीय उत्तराधिकार अधिनियम", "NRI समुदाय लक्ष्य"],
    payment: "UPI · Razorpay",
    legalNote: "Indian Succession Act · Civil Court",
  },
  pt: {
    flag: "🇧🇷",
    flagImg: "https://flagcdn.com/w80/br.png",
    countryCode: "BR",
    phase: "6th",
    period: "Year 3",
    statusColor: "bg-gray-400",
    highlights: ["Suporte completo em português", "Pagamento via PIX · Stripe", "Brasil e Portugal", "Direito sucessório brasileiro"],
    payment: "PIX · Stripe",
    legalNote: "Código Civil Brasileiro · Cartório",
  },
};

// 국가명 (선택된 언어로 표시)
const countryNames: Record<Language, string> = {
  ko: "한국",
  en: "United States",
  ja: "日本",
  zh: "中国·香港·台湾",
  de: "Deutschland",
  es: "España",
  ar: "المملكة العربية السعودية",
  fr: "France",
  ru: "Россия",
  hi: "भारत",
  pt: "Brasil",
};

// 언어 탭 목록 (Navbar와 동일)
const languageTabs: { code: Language; label: string; flagImg: string }[] = [
  { code: "ko", label: "한국어", flagImg: "https://flagcdn.com/w80/kr.png" },
  { code: "en", label: "English", flagImg: "https://flagcdn.com/w80/us.png" },
  { code: "ja", label: "日本語", flagImg: "https://flagcdn.com/w80/jp.png" },
  { code: "zh", label: "中文", flagImg: "https://flagcdn.com/w80/cn.png" },
  { code: "de", label: "Deutsch", flagImg: "https://flagcdn.com/w80/de.png" },
  { code: "es", label: "Español", flagImg: "https://flagcdn.com/w80/es.png" },
  { code: "ar", label: "العربية", flagImg: "https://flagcdn.com/w80/sa.png" },
  { code: "fr", label: "Français", flagImg: "https://flagcdn.com/w80/fr.png" },
  { code: "ru", label: "Русский", flagImg: "https://flagcdn.com/w80/ru.png" },
  { code: "hi", label: "हिन्दी", flagImg: "https://flagcdn.com/w80/in.png" },
  { code: "pt", label: "Português", flagImg: "https://flagcdn.com/w80/br.png" },
];

export default function GlobalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language, setLanguage } = useLanguage();

  const currentData = countryDataMap[language];
  const currentCountryName = countryNames[language];

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
          className="text-center mb-12"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.global.title}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t.global.subtitle}
          </p>
        </motion.div>

        {/* 국기 탭 선택기 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {languageTabs.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                language === lang.code
                  ? "bg-[#C9A961]/20 border-[#C9A961] shadow-lg shadow-[#C9A961]/20"
                  : "bg-white/8 border-white/15 hover:bg-white/15 hover:border-white/30"
              }`}
            >
              <img
                src={lang.flagImg}
                alt={lang.label}
                className="rounded-sm flex-shrink-0"
                style={{ width: 28, height: 18, objectFit: "cover" }}
              />
              <span className={`text-xs font-medium hidden sm:block ${language === lang.code ? "text-[#C9A961]" : "text-white/70"}`}>
                {lang.label}
              </span>
              {language === lang.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961] animate-pulse" />
              )}
            </button>
          ))}
        </motion.div>

        {/* 선택된 국가 박스 (애니메이션으로 전환) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={language}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl mx-auto mb-16"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-[#C9A961]/30 rounded-3xl p-8 hover:bg-white/12 transition-all shadow-xl shadow-black/20">
              {/* 상단: 단계 배지 + 상태 */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-[#C9A961] text-sm font-bold bg-[#C9A961]/15 px-3 py-1.5 rounded-full border border-[#C9A961]/30">
                  {currentData.phase} · {currentData.period}
                </span>
                <span className={`flex items-center gap-1.5 text-xs text-white/60`}>
                  <span className={`w-2 h-2 rounded-full ${currentData.statusColor} animate-pulse`} />
                  {currentData.statusColor === "bg-green-500" ? (language === "ko" ? "출시 예정" : "Launching") :
                   currentData.statusColor === "bg-yellow-500" ? (language === "ko" ? "준비 중" : "Preparing") :
                   currentData.statusColor === "bg-blue-400" ? (language === "ko" ? "계획" : "Planned") :
                   (language === "ko" ? "로드맵" : "Roadmap")}
                </span>
              </div>

              {/* 국기 + 국가명 */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={currentData.flagImg}
                  alt={currentCountryName}
                  className="rounded-lg shadow-md"
                  style={{ width: 64, height: 42, objectFit: "cover" }}
                />
                <div>
                  <div className="text-white/40 text-xs font-mono mb-0.5">{currentData.countryCode}</div>
                  <h3 className="text-white font-bold text-2xl">{currentCountryName}</h3>
                </div>
              </div>

              {/* 하이라이트 목록 */}
              <ul className="space-y-2.5 mb-6">
                {currentData.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/75 text-sm">
                    <MapPin className="w-3.5 h-3.5 text-[#C9A961] flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              {/* 결제 + 법률 */}
              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-white/10">
                <div>
                  <div className="text-white/40 text-xs mb-1">{t.global.payment}</div>
                  <div className="text-white/80 text-sm font-semibold">{currentData.payment}</div>
                </div>
                <div>
                  <div className="text-white/40 text-xs mb-1">{language === "ko" ? "법률 기반" : "Legal Basis"}</div>
                  <div className="text-white/80 text-sm font-semibold">{currentData.legalNote}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 언어 지원 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center"
        >
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
            {languageTabs.map((l, i) => (
              <motion.button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all group ${
                  language === l.code
                    ? "bg-[#C9A961]/20 border-[#C9A961]/60"
                    : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-[#C9A961]/40"
                }`}
              >
                <img
                  src={l.flagImg}
                  alt={l.label}
                  loading="lazy"
                  decoding="async"
                  className="rounded-sm flex-shrink-0 shadow-sm"
                  style={{ width: 36, height: 24, objectFit: "cover", display: "block" }}
                />
                <div className="text-left">
                  <div className={`font-bold text-sm leading-tight ${language === l.code ? "text-[#C9A961]" : "text-white"}`}>
                    {l.label}
                  </div>
                  <div className="text-white/40 text-[11px] font-medium">{l.code.toUpperCase()}</div>
                </div>
                {/* RTL 배지 */}
                {l.code === "ar" && (
                  <span className="text-[#C9A961] text-[10px] font-extrabold bg-[#C9A961]/20 border border-[#C9A961]/30 px-1.5 py-0.5 rounded-md ml-1">
                    RTL
                  </span>
                )}
              </motion.button>
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
