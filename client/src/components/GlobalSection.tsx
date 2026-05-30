/**
 * EverWill 글로벌 섹션
 * 세계지도 위에 국기 핀을 배치하여 서비스 가능 국가를 시각적으로 표시
 * 핀 클릭 시 해당 국가 정보 팝업 표시
 */
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { MapPin, ArrowRight, Globe, Languages, CreditCard, Scale, Users, ShieldCheck, Zap, Globe2, BookOpen, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n";
// WorldMapSVG 대신 실제 세계지도 이미지 사용
const WORLD_MAP_URL = "/manus-storage/worldmap_new_hd_10cea9a0.jpg";

// 국가별 세계지도 위 위치 (% 기준, 지도 이미지에 맞게 조정)
type CountryPin = {
  code: Language | "nz" | "au" | "ca";
  flagImg: string;
  label: string;
  // 지도 위 위치 (left%, top%)
  x: number;
  y: number;
};

// Jeff님이 직접 AI 파일에서 배치한 정확한 좌표
const countryPins: CountryPin[] = [
  { code: "ko",  flagImg: "https://flagcdn.com/w80/kr.png",  label: "한국",        x: 80.1, y: 40.2 },
  { code: "ja",  flagImg: "https://flagcdn.com/w80/jp.png",  label: "日本",        x: 84.4, y: 43.2 },
  { code: "zh",  flagImg: "https://flagcdn.com/w80/cn.png",  label: "中国",        x: 73.7, y: 43.2 },
  { code: "en",  flagImg: "https://flagcdn.com/w80/us.png",  label: "USA",         x: 18.3, y: 43.2 },
  { code: "de",  flagImg: "https://flagcdn.com/w80/de.png",  label: "Deutschland", x: 48.6, y: 36.4 },
  { code: "es",  flagImg: "https://flagcdn.com/w80/es.png",  label: "España",      x: 43.5, y: 43.2 },
  { code: "ar",  flagImg: "https://flagcdn.com/w80/sa.png",  label: "السعودية",    x: 58.4, y: 45.5 },
  { code: "fr",  flagImg: "https://flagcdn.com/w80/fr.png",  label: "France",      x: 43.5, y: 38.7 },
  { code: "ru",  flagImg: "https://flagcdn.com/w80/ru.png",  label: "Россия",      x: 71.2, y: 25.8 },
  { code: "hi",  flagImg: "https://flagcdn.com/w80/in.png",  label: "भारत",        x: 64.8, y: 45.5 },
  { code: "pt",  flagImg: "https://flagcdn.com/w80/br.png",  label: "Brasil",      x: 29.0, y: 68.3 },
  { code: "nz",  flagImg: "https://flagcdn.com/w80/nz.png",  label: "New Zealand", x: 93.4, y: 78.9 },
  { code: "au",  flagImg: "https://flagcdn.com/w80/au.png",  label: "Australia",   x: 81.4, y: 74.4 },
  { code: "ca",  flagImg: "https://flagcdn.com/w80/ca.png",  label: "Canada",      x: 16.6, y: 26.6 },
];

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
    flag: "🇰🇷", flagImg: "https://flagcdn.com/w80/kr.png", countryCode: "KR",
    phase: "1차", period: "Month 1-3", statusColor: "bg-green-500",
    highlights: ["한국어 완벽 지원", "토스페이먼츠 결제", "현지 법률 적용", "재외한인 700만 명 타깃"],
    payment: "토스페이먼츠", legalNote: "한국 민법 기반 유언 · 가정법원 검인",
  },
  en: {
    flag: "🇺🇸", flagImg: "https://flagcdn.com/w80/us.png", countryCode: "US",
    phase: "4th", period: "Month 10-12", statusColor: "bg-blue-400",
    highlights: ["ESIGN Act (2000) — Federal Law", "UEWA (2019) — Valid in 20+ States", "Holographic Will — 26+ States", "Stripe · Paddle · CA & NY First"],
    payment: "Stripe · Paddle", legalNote: "ESIGN Act · UEWA 2019 · Probate Court",
  },
  ja: {
    flag: "🇯🇵", flagImg: "https://flagcdn.com/w80/jp.png", countryCode: "JP",
    phase: "2次", period: "Month 4-6", statusColor: "bg-yellow-500",
    highlights: ["日本語完全対応", "2025年10月 公正証書デジタル化施行", "遠隔公証合法化 — 即時適用可能", "PayPay · LINE Pay"],
    payment: "PayPay · LINE Pay", legalNote: "日本民法第968条・第969条 · 家庭裁判所検認",
  },
  zh: {
    flag: "🇨🇳", flagImg: "https://flagcdn.com/w80/cn.png", countryCode: "CN",
    phase: "3차", period: "Month 7-9", statusColor: "bg-blue-400",
    highlights: ["香港《遗嘱条例》第20条 — 即时适用", "台湾民法第1189条 — 即时适用", "大陆《民法典》第1133条", "支付宝 · 微信支付"],
    payment: "Alipay · WeChat Pay", legalNote: "香港《遗嘱条例》 · 台湾民法 · 大陆《民法典》",
  },
  de: {
    flag: "🇩🇪", flagImg: "https://flagcdn.com/w80/de.png", countryCode: "DE",
    phase: "5th", period: "Year 2", statusColor: "bg-gray-400",
    highlights: ["BGB §2247 (eigenhändig) — Sofort gültig", "BGB §2232 (notariell) — Sofort gültig", "ZTR (Zentrales Testamentsregister)", "EU-DSGVO konform · SEPA · Stripe"],
    payment: "SEPA · Stripe", legalNote: "BGB §2247 · §2232 · Nachlassgericht · ZTR",
  },
  es: {
    flag: "🇪🇸", flagImg: "https://flagcdn.com/w80/es.png", countryCode: "ES",
    phase: "5th", period: "Year 2", statusColor: "bg-gray-400",
    highlights: ["Código Civil Art.688 (ológrafo)", "Código Civil Art.694 (notarial)", "Registro de Actos de Última Voluntad", "Stripe · PayPal · Bizum"],
    payment: "Stripe · PayPal · Bizum", legalNote: "Código Civil Art.688 · Art.694",
  },
  ar: {
    flag: "🇸🇦", flagImg: "https://flagcdn.com/w80/sa.png", countryCode: "SA",
    phase: "5th", period: "Year 2", statusColor: "bg-gray-400",
    highlights: ["نظام الوصية والتركات — مطابق فوراً", "نسبة الميراث 2:1 (ذكر:أنثى) تلقائياً", "محاكم الأحوال الشخصية متوافقة", "STC Pay · Mada · الشرق الأوسط"],
    payment: "STC Pay · Mada", legalNote: "الشريعة الإسلامية · نظام الوصية والتركات",
  },
  fr: {
    flag: "🇫🇷", flagImg: "https://flagcdn.com/w80/fr.png", countryCode: "FR",
    phase: "5th", period: "Year 2", statusColor: "bg-gray-400",
    highlights: ["Support complet en français", "Paiement CB · Stripe", "France et Belgique", "Droit successoral français"],
    payment: "Carte Bancaire · Stripe", legalNote: "Code Civil Français · Notaire",
  },
  ru: {
    flag: "🇷🇺", flagImg: "https://flagcdn.com/w80/ru.png", countryCode: "RU",
    phase: "6th", period: "Year 3", statusColor: "bg-gray-400",
    highlights: ["Полная поддержка русского языка", "Оплата через СБП · Stripe", "Россия и СНГ", "Российское наследственное право"],
    payment: "СБП · Stripe", legalNote: "ГК РФ · Нотариат",
  },
  hi: {
    flag: "🇮🇳", flagImg: "https://flagcdn.com/w80/in.png", countryCode: "IN",
    phase: "6th", period: "Year 3", statusColor: "bg-gray-400",
    highlights: ["हिन्दी में पूर्ण सहायता", "UPI · Razorpay भुगतान", "भारतीय उत्तराधिकार अधिनियम", "NRI समुदाय लक्ष्य"],
    payment: "UPI · Razorpay", legalNote: "Indian Succession Act · Civil Court",
  },
  pt: {
    flag: "🇧🇷", flagImg: "https://flagcdn.com/w80/br.png", countryCode: "BR",
    phase: "6th", period: "Year 3", statusColor: "bg-gray-400",
    highlights: ["Suporte completo em português", "Pagamento via PIX · Stripe", "Brasil e Portugal", "Direito sucessório brasileiro"],
    payment: "PIX · Stripe", legalNote: "Código Civil Brasileiro · Cartório",
  },
};

const extraCountries = [
  {
    code: "nz" as const, label: "New Zealand", flagImg: "https://flagcdn.com/w80/nz.png",
    flag: "🇳🇿", countryCode: "NZ", name: "New Zealand",
    phase: "5th", period: "Year 2", statusColor: "bg-gray-400",
    highlights: ["Wills Act 1837 (NZ) — Immediately Applicable", "Electronic Transactions Act 2002", "Stripe · Visa · Mastercard", "Overseas Korean & Expat Community"],
    payment: "Stripe · Visa", legalNote: "Wills Act 1837 (NZ) · Electronic Transactions Act 2002",
    icons: [ShieldCheck, Zap, CreditCard, Users],
  },
  {
    code: "au" as const, label: "Australia", flagImg: "https://flagcdn.com/w80/au.png",
    flag: "🇦🇺", countryCode: "AU", name: "Australia",
    phase: "5th", period: "Year 2", statusColor: "bg-gray-400",
    highlights: ["Succession Act 2006 (NSW) — Immediately Applicable", "Electronic Transactions Act 1999", "Stripe · BPAY · PayID", "Korean-Australian Community"],
    payment: "Stripe · BPAY · PayID", legalNote: "Succession Act 2006 · Electronic Transactions Act 1999",
    icons: [ShieldCheck, Zap, CreditCard, Users],
  },
];

const countryNames: Record<Language, string> = {
  ko: "한국", en: "United States", ja: "日本", zh: "中国·香港·台湾",
  de: "Deutschland", es: "España", ar: "المملكة العربية السعودية",
  fr: "France", ru: "Россия", hi: "भारत", pt: "Brasil",
};

const highlightIconsMap: Record<Language, { text: string; icon: React.ElementType }[]> = {
  ko: [{ text: "한국어 완벽 지원", icon: Languages }, { text: "토스페이먼츠 결제", icon: CreditCard }, { text: "현지 법률 적용", icon: Scale }, { text: "재외한인 700만 명 타깃", icon: Users }],
  en: [{ text: "ESIGN Act (2000) — Federal Law", icon: ShieldCheck }, { text: "UEWA 2019 — Valid in 20+ States", icon: Scale }, { text: "Holographic Will — 26+ States", icon: FileText }, { text: "Stripe · Paddle · CA & NY First", icon: CreditCard }],
  ja: [{ text: "日本語完全対応", icon: Languages }, { text: "2025年10月 公正証書デジタル化施行", icon: Zap }, { text: "遠隔公証合法化 — 即時適用可能", icon: ShieldCheck }, { text: "PayPay · LINE Pay", icon: CreditCard }],
  zh: [{ text: "香港《遗嘱条例》第20条 — 即时适用", icon: ShieldCheck }, { text: "台湾民法第1189条 — 即时适用", icon: Scale }, { text: "大陆《民法典》第1133条 — 审慢中", icon: FileText }, { text: "支付宝 · 微信支付", icon: CreditCard }],
  de: [{ text: "BGB §2247 (eigenhändig) — Sofort gültig", icon: ShieldCheck }, { text: "BGB §2232 (notariell) — Sofort gültig", icon: Scale }, { text: "ZTR (Zentrales Testamentsregister)", icon: FileText }, { text: "EU-DSGVO konform · SEPA · Stripe", icon: CreditCard }],
  es: [{ text: "Código Civil Art.688 (ólógrafo)", icon: ShieldCheck }, { text: "Código Civil Art.694 (notarial)", icon: Scale }, { text: "Registro de Actos de Última Voluntad", icon: FileText }, { text: "Stripe · PayPal · Bizum", icon: CreditCard }],
  ar: [{ text: "نظام الوصية والتركات — مطابق فوراً", icon: ShieldCheck }, { text: "نسبة الميراث 2:1 (ذكر:أنثى) تلقائياً", icon: Scale }, { text: "محاكم الأحوال الشخصية متوافقة", icon: BookOpen }, { text: "STC Pay · Mada · الشرق الأوسط", icon: CreditCard }],
  fr: [{ text: "Support complet en français", icon: Languages }, { text: "Paiement CB · Stripe", icon: CreditCard }, { text: "France et Belgique", icon: Globe2 }, { text: "Droit successoral français", icon: Scale }],
  ru: [{ text: "Полная поддержка русского языка", icon: Languages }, { text: "Оплата через СБП · Stripe", icon: CreditCard }, { text: "Россия и СНГ", icon: Globe2 }, { text: "Российское наследственное право", icon: Scale }],
  hi: [{ text: "हिन्दी में पूर्ण सहायता", icon: Languages }, { text: "UPI · Razorpay भुगतान", icon: CreditCard }, { text: "भारतीय उत्तराधिकार अधिनियम", icon: Scale }, { text: "NRI समुदाय लक्ष्य", icon: Users }],
  pt: [{ text: "Suporte completo em português", icon: Languages }, { text: "Pagamento via PIX · Stripe", icon: CreditCard }, { text: "Brasil e Portugal", icon: Globe2 }, { text: "Direito sucessório brasileiro", icon: Scale }],
};

export default function GlobalSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language, setLanguage } = useLanguage();
  const [selectedPin, setSelectedPin] = useState<Language | "nz" | "au" | "ca" | null>(null);

  const getCountryData = (code: Language | "nz" | "au" | "ca") => {
    if (code === "nz" || code === "au" || code === "ca") {
      return extraCountries.find(c => c.code === code)!;
    }
    return countryDataMap[code as Language];
  };

  const getCountryName = (code: Language | "nz" | "au" | "ca") => {
    if (code === "nz") return "New Zealand";
    if (code === "au") return "Australia";
    return countryNames[code as Language];
  };

  const getHighlightIcons = (code: Language | "nz" | "au" | "ca") => {
    if (code === "nz" || code === "au" || code === "ca") {
      const ec = extraCountries.find(c => c.code === code)!;
      return ec.icons.map((icon, i) => ({ text: ec.highlights[i], icon }));
    }
    return highlightIconsMap[code as Language];
  };

  const selectedData = selectedPin ? getCountryData(selectedPin) : null;
  const selectedName = selectedPin ? getCountryName(selectedPin) : null;
  const selectedIcons = selectedPin ? getHighlightIcons(selectedPin) : null;

  const handlePinClick = (code: Language | "nz" | "au" | "ca") => {
    if (selectedPin === code) {
      setSelectedPin(null);
    } else {
      setSelectedPin(code);
      // 언어 탭도 함께 변경 (nz/au는 en으로)
      if (code !== "nz" && code !== "au" && code !== "ca") {
        setLanguage(code as Language);
      }
    }
  };

  return (
    <section id="global" className="py-20 lg:py-28 relative overflow-hidden" ref={ref}>
      {/* 배경 - 실제 세계지도 */}
      <div className="absolute inset-0">
        <img src={WORLD_MAP_URL} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#0d1f3c]/20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.global.title}
          </h2>
          {/* 강조 문구 — 크게 */}
          <p className="text-white text-xl lg:text-2xl font-semibold max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
            {t.global.subtitle}
          </p>
        </motion.div>

        {/* 세계지도 + 국기 핀 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full mb-10"
          style={{ aspectRatio: '2/1', paddingBottom: undefined }}
        >
          {/* 지도 - 실제 세계지도 이미지 */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/20">
            <img src={WORLD_MAP_URL} alt="세계지도" className="w-full h-full" style={{ display: 'block', objectFit: 'fill' }} />
            <div className="absolute inset-0" style={{ background: 'transparent' }} />
          </div>

          {/* 국기 핀들 */}
          {countryPins.map((pin, i) => {
            const isSelected = selectedPin === pin.code;
            const isLangActive = !selectedPin && pin.code === language;
            const isActive = isSelected || isLangActive;

            return (
              <motion.button
                key={pin.code}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                onClick={() => handlePinClick(pin.code)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                aria-label={pin.label}
              >
                {/* 핀 컨테이너 */}
                <div className={`relative flex flex-col items-center transition-all duration-200 ${isActive ? "scale-125" : "hover:scale-110"}`}>
                  {/* 국기 이미지 */}
                  <div className={`rounded-md shadow-lg border-2 overflow-hidden transition-all duration-200 ${
                    isActive
                      ? "border-[#C9A961] shadow-[#C9A961]/50 shadow-lg"
                      : "border-white/40 hover:border-[#C9A961]/70"
                  }`}
                    style={{ width: 36, height: 24 }}
                  >
                    <img
                      src={pin.flagImg}
                      alt={pin.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* 핀 꼬리 */}
                  <div className={`w-0.5 h-2 transition-colors duration-200 ${isActive ? "bg-[#C9A961]" : "bg-white/40"}`} />
                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${isActive ? "bg-[#C9A961] animate-pulse" : "bg-white/40"}`} />
                  {/* 국가명 툴팁 */}
                  <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold px-1.5 py-0.5 rounded transition-all duration-200 ${
                    isActive
                      ? "text-[#C9A961] bg-[#1F3864]/90 opacity-100"
                      : "text-white/70 bg-[#1F3864]/80 opacity-0 group-hover:opacity-100"
                  }`}>
                    {pin.label}
                  </div>
                </div>
              </motion.button>
            );
          })}

          {/* 범례 */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-[#1F3864]/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm border-2 border-[#C9A961]" />
              <span className="text-white/70 text-[10px]">{language === "ko" ? "선택됨" : "Selected"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-white/50" />
              <span className="text-white/70 text-[10px]">{language === "ko" ? "클릭하여 상세보기" : "Click for details"}</span>
            </div>
          </div>

          {/* 국가 수 표시 */}
          <div className="absolute top-3 right-3 bg-[#C9A961]/20 backdrop-blur-sm border border-[#C9A961]/40 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-bold">13 {language === "ko" ? "개국" : "Countries"}</span>
            </div>
          </div>
        </motion.div>

        {/* 선택된 국가 상세 정보 팝업 */}
        <AnimatePresence mode="wait">
          {selectedPin && selectedData && (
            <motion.div
              key={selectedPin}
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-[#C9A961]/30 rounded-3xl p-8 hover:bg-white/12 transition-all shadow-xl shadow-black/20">
                {/* 상단: 단계 배지 + 상태 */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[#C9A961] text-sm font-bold bg-[#C9A961]/15 px-3 py-1.5 rounded-full border border-[#C9A961]/30">
                    {selectedData.phase} · {selectedData.period}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 text-xs text-white/60`}>
                      <span className={`w-2 h-2 rounded-full ${selectedData.statusColor} animate-pulse`} />
                      {selectedData.statusColor === "bg-green-500" ? (language === "ko" ? "출시 예정" : "Launching") :
                       selectedData.statusColor === "bg-yellow-500" ? (language === "ko" ? "준비 중" : "Preparing") :
                       selectedData.statusColor === "bg-blue-400" ? (language === "ko" ? "계획" : "Planned") :
                       (language === "ko" ? "로드맵" : "Roadmap")}
                    </span>
                    {/* 닫기 버튼 */}
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="ml-2 text-white/40 hover:text-white/80 transition-colors text-lg leading-none"
                      aria-label="close"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* 국기 + 국가명 */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={selectedData.flagImg}
                    alt={selectedName ?? ""}
                    className="rounded-lg shadow-md"
                    style={{ width: 64, height: 42, objectFit: "cover" }}
                  />
                  <div>
                    <div className="text-white/40 text-xs font-mono mb-0.5">{selectedData.countryCode}</div>
                    <h3 className="text-white font-bold text-2xl">{selectedName}</h3>
                  </div>
                </div>

                {/* 하이라이트 목록 */}
                <ul className="space-y-2.5 mb-6">
                  {selectedIcons?.map((item, i) => {
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
                    <div className="text-white/80 text-sm font-semibold">{selectedData.payment}</div>
                  </div>
                  <div>
                    <div className="text-white/40 text-xs mb-1">{language === "ko" ? "법률 기반" : "Legal Basis"}</div>
                    <div className="text-white/80 text-sm font-semibold">{selectedData.legalNote}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 안내 문구 (핀 선택 전) */}
        {!selectedPin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mb-12"
          >
            <p className="text-white/50 text-sm">
              {language === "ko" ? "지도 위 국기를 클릭하면 해당 국가 정보를 확인할 수 있습니다" : "Click a flag on the map to see country details"}
            </p>
          </motion.div>
        )}

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
            {countryPins.filter(p => p.code !== "nz" && p.code !== "au").map((pin, i) => (
              <motion.button
                key={pin.code}
                onClick={() => handlePinClick(pin.code as Language)}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all group ${
                  (selectedPin === pin.code || (!selectedPin && language === pin.code))
                    ? "bg-[#C9A961]/20 border-[#C9A961]/60"
                    : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-[#C9A961]/40"
                }`}
              >
                <img
                  src={pin.flagImg}
                  alt={pin.label}
                  loading="lazy"
                  decoding="async"
                  className="rounded-sm flex-shrink-0 shadow-sm"
                  style={{ width: 36, height: 24, objectFit: "cover", display: "block" }}
                />
                <div className="text-left">
                  <div className={`font-bold text-sm leading-tight ${(selectedPin === pin.code || (!selectedPin && language === pin.code)) ? "text-[#C9A961]" : "text-white"}`}>
                    {pin.label}
                  </div>
                  <div className="text-white/40 text-[11px] font-medium">{(pin.code as string).toUpperCase()}</div>
                </div>
                {/* RTL 배지 */}
                {pin.code === "ar" && (
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
