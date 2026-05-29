/**
 * EverWill 글로벌 섹션
 * 상단 국기 탭 클릭 시 해당 국가 박스 1개만 표시
 * 11개 언어 각각에 대한 국가 정보 데이터 포함
 */
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, ArrowRight, Globe, Languages, CreditCard, Scale, Users, Building2, Landmark, ShieldCheck, Zap, Globe2, Clock, Star, BookOpen, Banknote, Phone, Wifi, FileText } from "lucide-react";
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
    highlights: ["ESIGN Act (2000) — Federal Law", "UEWA (2019) — Valid in 20+ States", "Holographic Will — 26+ States", "Stripe · Paddle · CA & NY First"],
    payment: "Stripe · Paddle",
    legalNote: "ESIGN Act · UEWA 2019 · Probate Court · Immediately applicable",
  },
  ja: {
    flag: "🇯🇵",
    flagImg: "https://flagcdn.com/w80/jp.png",
    countryCode: "JP",
    phase: "2次",
    period: "Month 4-6",
    statusColor: "bg-yellow-500",
    highlights: ["日本語完全対応", "2025年10月 公正証書デジタル化施行", "遠隔公証合法化 — 即時適用可能", "PayPay · LINE Pay"],
    payment: "PayPay · LINE Pay",
    legalNote: "日本民法第968条・第969条 · 2025年10月施行 · 家庭裁判所検認",
  },
  zh: {
    flag: "🇨🇳",
    flagImg: "https://flagcdn.com/w80/cn.png",
    countryCode: "CN",
    phase: "3차",
    period: "Month 7-9",
    statusColor: "bg-blue-400",
    highlights: ["香港《遗嘱条例》第20条 — 即时适用", "台湾民法第1189条 — 即时适用", "大陆《民法典》第1133条 — 审慢中", "支付宝 · 微信支付"],
    payment: "Alipay · WeChat Pay",
    legalNote: "香港《遗嘱条例》 · 台湾民法 · 大陆《民法典》第1133条",
  },
  de: {
    flag: "🇩🇪",
    flagImg: "https://flagcdn.com/w80/de.png",
    countryCode: "DE",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["BGB §2247 (eigenhändig) — Sofort gültig", "BGB §2232 (notariell) — Sofort gültig", "ZTR (Zentrales Testamentsregister)", "EU-DSGVO konform · SEPA · Stripe"],
    payment: "SEPA · Stripe",
    legalNote: "BGB §2247 · §2232 · Nachlassgericht · ZTR",
  },
  es: {
    flag: "🇪🇸",
    flagImg: "https://flagcdn.com/w80/es.png",
    countryCode: "ES",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["Código Civil Art.688 (ológrafo)", "Código Civil Art.694 (notarial)", "Registro de Actos de Última Voluntad", "Stripe · PayPal · Bizum"],
    payment: "Stripe · PayPal · Bizum",
    legalNote: "Código Civil Art.688 · Art.694 · Registro de Última Voluntad",
  },
  ar: {
    flag: "🇸🇦",
    flagImg: "https://flagcdn.com/w80/sa.png",
    countryCode: "SA",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["نظام الوصية والتركات — مطابق فوراً", "نسبة الميراث 2:1 (ذكر:أنثى) تلقائياً", "محاكم الأحوال الشخصية متوافقة", "STC Pay · Mada · الشرق الأوسط"],
    payment: "STC Pay · Mada",
    legalNote: "الشريعة الإسلامية · نظام الوصية والتركات · محاكم الأحوال الشخصية",
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

// 하이라이트 아이콘 매핑 (키워드 기반)
type HighlightItem = { text: string; icon: React.ElementType };

// 각 국가별 하이라이트에 아이콘 매핑
const highlightIconsMap: Record<Language, HighlightItem[]> = {
  ko: [
    { text: "한국어 완벽 지원", icon: Languages },
    { text: "토스페이먼츠 결제", icon: CreditCard },
    { text: "현지 법률 적용", icon: Scale },
    { text: "재외한인 700만 명 타깃", icon: Users },
  ],
  en: [
    { text: "ESIGN Act (2000) — Federal Law", icon: ShieldCheck },
    { text: "UEWA 2019 — Valid in 20+ States", icon: Scale },
    { text: "Holographic Will — 26+ States", icon: FileText },
    { text: "Stripe · Paddle · CA & NY First", icon: CreditCard },
  ],
  ja: [
    { text: "日本語完全対応", icon: Languages },
    { text: "2025年10月 公正証書デジタル化施行", icon: Zap },
    { text: "遠隔公証合法化 — 即時適用可能", icon: ShieldCheck },
    { text: "PayPay · LINE Pay", icon: CreditCard },
  ],
  zh: [
    { text: "香港《遗嘱条例》第20条 — 即时适用", icon: ShieldCheck },
    { text: "台湾民法第1189条 — 即时适用", icon: Scale },
    { text: "大陆《民法典》第1133条 — 审慢中", icon: FileText },
    { text: "支付宝 · 微信支付", icon: CreditCard },
  ],
  de: [
    { text: "BGB §2247 (eigenhändig) — Sofort gültig", icon: ShieldCheck },
    { text: "BGB §2232 (notariell) — Sofort gültig", icon: Scale },
    { text: "ZTR (Zentrales Testamentsregister)", icon: FileText },
    { text: "EU-DSGVO konform · SEPA · Stripe", icon: CreditCard },
  ],
  es: [
    { text: "Código Civil Art.688 (ólógrafo)", icon: ShieldCheck },
    { text: "Código Civil Art.694 (notarial)", icon: Scale },
    { text: "Registro de Actos de Última Voluntad", icon: FileText },
    { text: "Stripe · PayPal · Bizum", icon: CreditCard },
  ],
  ar: [
    { text: "نظام الوصية والتركات — مطابق فوراً", icon: ShieldCheck },
    { text: "نسبة الميراث 2:1 (ذكر:أنثى) تلقائياً", icon: Scale },
    { text: "محاكم الأحوال الشخصية متوافقة", icon: BookOpen },
    { text: "STC Pay · Mada · الشرق الأوسط", icon: CreditCard },
  ],
  fr: [
    { text: "Support complet en français", icon: Languages },
    { text: "Paiement CB · Stripe", icon: CreditCard },
    { text: "France et Belgique", icon: Globe2 },
    { text: "Droit successoral français", icon: Scale },
  ],
  ru: [
    { text: "Полная поддержка русского языка", icon: Languages },
    { text: "Оплата через СБП · Stripe", icon: CreditCard },
    { text: "Россия и СНГ", icon: Globe2 },
    { text: "Российское наследственное право", icon: Scale },
  ],
  hi: [
    { text: "हिन्दी में पूर्ण सहायता", icon: Languages },
    { text: "UPI · Razorpay भुगतान", icon: CreditCard },
    { text: "भारतीय उत्तराधिकार अधिनियम", icon: Scale },
    { text: "NRI समुदाय लक्ष्य", icon: Users },
  ],
  pt: [
    { text: "Suporte completo em português", icon: Languages },
    { text: "Pagamento via PIX · Stripe", icon: CreditCard },
    { text: "Brasil e Portugal", icon: Globe2 },
    { text: "Direito sucessório brasileiro", icon: Scale },
  ],
};

// 뉴질랜드·호주 추가 국가 데이터 (영어권 — en 콘텐츠 재사용)
const extraCountries = [
  {
    code: "nz" as const,
    label: "New Zealand",
    flagImg: "https://flagcdn.com/w80/nz.png",
    flag: "🇳🇿",
    countryCode: "NZ",
    name: "New Zealand",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["Wills Act 1837 (NZ) — Immediately Applicable", "Electronic Transactions Act 2002", "Stripe · Visa · Mastercard", "Overseas Korean & Expat Community"],
    payment: "Stripe · Visa",
    legalNote: "Wills Act 1837 (NZ) · Electronic Transactions Act 2002",
    icons: [ShieldCheck, Zap, CreditCard, Users],
  },
  {
    code: "au" as const,
    label: "Australia",
    flagImg: "https://flagcdn.com/w80/au.png",
    flag: "🇦🇺",
    countryCode: "AU",
    name: "Australia",
    phase: "5th",
    period: "Year 2",
    statusColor: "bg-gray-400",
    highlights: ["Succession Act 2006 (NSW) — Immediately Applicable", "Electronic Transactions Act 1999", "Stripe · BPAY · PayID", "Korean-Australian Community"],
    payment: "Stripe · BPAY · PayID",
    legalNote: "Succession Act 2006 · Electronic Transactions Act 1999",
    icons: [ShieldCheck, Zap, CreditCard, Users],
  },
];

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
  // 뉴질랜드·호주 선택 상태 (null이면 언어 탭 기준)
  const [extraSelected, setExtraSelected] = useState<"nz" | "au" | null>(null);

  const currentData = extraSelected
    ? { ...countryDataMap["en"], ...extraCountries.find(c => c.code === extraSelected)! }
    : countryDataMap[language];
  const currentCountryName = extraSelected
    ? extraCountries.find(c => c.code === extraSelected)!.name
    : countryNames[language];
  const currentHighlightIcons = extraSelected
    ? extraCountries.find(c => c.code === extraSelected)!.icons.map((icon, i) => ({
        text: extraCountries.find(c => c.code === extraSelected)!.highlights[i],
        icon,
      }))
    : highlightIconsMap[language];

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
              onClick={() => { setLanguage(lang.code); setExtraSelected(null); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                language === lang.code && !extraSelected
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
              {language === lang.code && !extraSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961] animate-pulse" />
              )}
            </button>
          ))}
          {/* 뉴질랜드·호주 추가 탭 */}
          {extraCountries.map((ec) => (
            <button
              key={ec.code}
              onClick={() => setExtraSelected(extraSelected === ec.code ? null : ec.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 ${
                extraSelected === ec.code
                  ? "bg-[#C9A961]/20 border-[#C9A961] shadow-lg shadow-[#C9A961]/20"
                  : "bg-white/8 border-white/15 hover:bg-white/15 hover:border-white/30"
              }`}
            >
              <img
                src={ec.flagImg}
                alt={ec.label}
                className="rounded-sm flex-shrink-0"
                style={{ width: 28, height: 18, objectFit: "cover" }}
              />
              <span className={`text-xs font-medium hidden sm:block ${extraSelected === ec.code ? "text-[#C9A961]" : "text-white/70"}`}>
                {ec.label}
              </span>
              {extraSelected === ec.code && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961] animate-pulse" />
              )}
            </button>
          ))}
        </motion.div>

        {/* 선택된 국가 박스 (애니메이션으로 전환) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={extraSelected ?? language}
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

              {/* 하이라이트 목록 — 아이콘 포함 */}
              <ul className="space-y-2.5 mb-6">
                {currentHighlightIcons.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-center gap-3 text-white/75 text-sm">
                      <div className="w-7 h-7 rounded-lg bg-[#C9A961]/15 border border-[#C9A961]/25 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-[#C9A961]" />
                      </div>
                      {item.text}
                    </li>
                  );
                })}
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
