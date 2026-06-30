/**
 * EverWill 사회기부 섹션 (전면 개편)
 * - 대형 배너 이미지
 * - 감성 문구 (이슈 텍스트)
 * - 기부 분야 선택 (다중 클릭)
 * - 금액 입력
 * - 즉시 결제 / 사후 기부 선택
 * - 전 세계 기부 현황 통계
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Globe2, TrendingUp, Users, Check, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import type { Language } from "@/i18n";

const BANNER_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/charity-banner-Twn94xaToNgAEzmBwEX6wt.webp";

// ─── 통화 매핑 ────────────────────────────────────────────────────
const LANG_CURRENCY: Record<Language, { code: string; symbol: string }> = {
  ko: { code: "KRW", symbol: "₩" },
  ja: { code: "JPY", symbol: "¥" },
  zh: { code: "CNY", symbol: "¥" },
  de: { code: "EUR", symbol: "€" },
  fr: { code: "EUR", symbol: "€" },
  es: { code: "EUR", symbol: "€" },
  ar: { code: "SAR", symbol: "﷼" },
  ru: { code: "RUB", symbol: "₽" },
  hi: { code: "INR", symbol: "₹" },
  pt: { code: "BRL", symbol: "R$" },
  en: { code: "USD", symbol: "$" },
};

const KRW_RATES: Record<string, number> = {
  KRW: 1, JPY: 9.0, CNY: 190, USD: 1350, EUR: 1480,
  SAR: 360, RUB: 15, INR: 16, BRL: 270,
};

// ─── 기부 분야 목록 (다국어 지원) ────────────────────────────────────
const CAUSE_IDS = [
  { id: "designated",  emoji: "🏢" },
  { id: "politics",    emoji: "🏛️" },
  { id: "sme",         emoji: "🏭" },
  { id: "education",   emoji: "🎓" },
  { id: "science",     emoji: "🔬" },
  { id: "climate",     emoji: "🌱" },
  { id: "poverty",     emoji: "🤝" },
  { id: "singlemom",   emoji: "👩‍👧" },
  { id: "youth",       emoji: "👦" },
  { id: "elderly",     emoji: "👴" },
  { id: "disabled",    emoji: "♿" },
  { id: "medical",     emoji: "🏥" },
  { id: "culture",     emoji: "🎨" },
  { id: "animal",      emoji: "🐾" },
  { id: "disaster",    emoji: "🆘" },
  { id: "other",       emoji: "💝" },
];

// 기부 분야 다국어 이름 매핑
const CAUSE_NAMES: Record<string, Record<Language, string>> = {
  designated: { ko: "지정 기부", en: "Designated Org", ja: "指定寄付", zh: "指定捐赠", de: "Bestimmte Org.", es: "Org. designada", ar: "منظمة محددة", fr: "Org. désignée", ru: "Указ. орг.", hi: "नामित संगठन", pt: "Org. designada" },
  politics:   { ko: "정치 개혁", en: "Political Reform", ja: "政治改革", zh: "政治改革", de: "Polit. Reform", es: "Reforma política", ar: "إصلاح سياسي", fr: "Réforme politique", ru: "Полит. реформа", hi: "राजनीतिक सुधार", pt: "Reforma política" },
  sme:        { ko: "중소기업 지원", en: "SME Support", ja: "中小企業支援", zh: "中小企业支持", de: "KMU-Förderung", es: "Apoyo PYME", ar: "دعم الشركات الصغيرة", fr: "Soutien PME", ru: "Поддержка МСП", hi: "एसएमई समर्थन", pt: "Apoio PME" },
  education:  { ko: "교육", en: "Education", ja: "教育", zh: "教育", de: "Bildung", es: "Educación", ar: "التعليم", fr: "Éducation", ru: "Образование", hi: "शिक्षा", pt: "Educação" },
  science:    { ko: "과학·기술", en: "Science & Tech", ja: "科学・技術", zh: "科学技术", de: "Wissenschaft", es: "Ciencia y Tech", ar: "العلوم والتقنية", fr: "Science & Tech", ru: "Наука и техника", hi: "विज्ञान और तकनीक", pt: "Ciência e Tech" },
  climate:    { ko: "기후·환경", en: "Climate & Env.", ja: "気候・環境", zh: "气候环境", de: "Klima & Umwelt", es: "Clima y Medio amb.", ar: "المناخ والبيئة", fr: "Climat & Env.", ru: "Климат и экология", hi: "जलवायु और पर्यावरण", pt: "Clima e Ambiente" },
  poverty:    { ko: "최저생계자 지원", en: "Poverty Relief", ja: "貧困支援", zh: "扶贫救助", de: "Armutsbekämpfung", es: "Alivio pobreza", ar: "مكافحة الفقر", fr: "Lutte pauvreté", ru: "Борьба с бедностью", hi: "गरीबी राहत", pt: "Alívio pobreza" },
  singlemom:  { ko: "미혼모 가정", en: "Single Mothers", ja: "シングルマザー", zh: "单亲妈妈", de: "Alleinerziehende", es: "Madres solteras", ar: "الأمهات العزباء", fr: "Mères célibataires", ru: "Матери-одиночки", hi: "एकल माताएं", pt: "Mães solteiras" },
  youth:      { ko: "청소년 가정", en: "Youth & Families", ja: "青少年・家族", zh: "青少年家庭", de: "Jugend & Familien", es: "Jóvenes y familias", ar: "الشباب والأسر", fr: "Jeunes & Familles", ru: "Молодёжь и семьи", hi: "युवा और परिवार", pt: "Jovens e famílias" },
  elderly:    { ko: "노인 복지", en: "Elderly Care", ja: "高齢者福祉", zh: "老年福利", de: "Altenpflege", es: "Cuidado mayores", ar: "رعاية المسنين", fr: "Soins aux âgés", ru: "Уход за пожилыми", hi: "वृद्ध देखभाल", pt: "Cuidado idosos" },
  disabled:   { ko: "장애인 지원", en: "Disability Support", ja: "障害者支援", zh: "残障人士支持", de: "Behindertenunterstützung", es: "Apoyo discapacidad", ar: "دعم ذوي الإعاقة", fr: "Soutien handicap", ru: "Поддержка инвалидов", hi: "विकलांग समर्थन", pt: "Apoio deficiência" },
  medical:    { ko: "의료·보건", en: "Medical & Health", ja: "医療・保健", zh: "医疗卫生", de: "Medizin & Gesundheit", es: "Salud y medicina", ar: "الصحة والطب", fr: "Médecine & Santé", ru: "Медицина и здоровье", hi: "चिकित्सा और स्वास्थ्य", pt: "Saúde e medicina" },
  culture:    { ko: "문화·예술", en: "Culture & Arts", ja: "文化・芸術", zh: "文化艺术", de: "Kultur & Kunst", es: "Cultura y Arte", ar: "الثقافة والفنون", fr: "Culture & Arts", ru: "Культура и искусство", hi: "संस्कृति और कला", pt: "Cultura e Arte" },
  animal:     { ko: "동물 복지", en: "Animal Welfare", ja: "動物福祉", zh: "动物福利", de: "Tierschutz", es: "Bienestar animal", ar: "رعاية الحيوان", fr: "Bien-être animal", ru: "Защита животных", hi: "पशु कल्याण", pt: "Bem-estar animal" },
  disaster:   { ko: "재난·구호", en: "Disaster Relief", ja: "災害救援", zh: "灾难救援", de: "Katastrophenhilfe", es: "Ayuda desastres", ar: "الإغاثة من الكوارث", fr: "Aide catastrophes", ru: "Помощь при катастрофах", hi: "आपदा राहत", pt: "Ajuda desastres" },
  other:      { ko: "기타", en: "Other", ja: "その他", zh: "其他", de: "Sonstiges", es: "Otro", ar: "أخرى", fr: "Autre", ru: "Другое", hi: "अन्य", pt: "Outro" },
};

// ─── 카운트업 훅 ──────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const prevTarget = useRef(0);
  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const startVal = current;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(startVal + eased * (target - startVal)));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return current;
}

function formatCurrency(amount: number, currencyCode: string, symbol: string): string {
  const abs = Math.abs(amount);
  if (currencyCode === "KRW" || currencyCode === "JPY" || currencyCode === "CNY") {
    if (abs >= 100_000_000) return `${symbol}${(amount / 100_000_000).toFixed(1)}${currencyCode === "KRW" ? "억" : "億"}`;
    if (abs >= 10_000) return `${symbol}${(amount / 10_000).toFixed(1)}${currencyCode === "KRW" ? "만" : "万"}`;
    return `${symbol}${amount.toLocaleString()}`;
  }
  if (abs >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  return `${symbol}${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function CharityStatsSection() {
  const { t, language } = useLanguage();
  const cs = t.charityStats;

  const localCurrency = LANG_CURRENCY[language] ?? LANG_CURRENCY["ko"];
  const localRate = KRW_RATES[localCurrency.code] ?? 1;

  const { data, isLoading } = trpc.charity.getGlobalStats.useQuery(undefined, {
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const totalKrw = data?.totalKrw ?? 0;
  const donorCount = data?.donorCount ?? 0;
  const totalLocal = Math.round(totalKrw / localRate);
  const animatedLocal = useCountUp(totalLocal, 2200);
  const animatedDonors = useCountUp(donorCount, 1800);
  // KR(한국) 카드는 모든 언어에서 숨김 (한국 기부 데이터는 글로벌 통계에 포함되지 않음)
  const byCountry = (data?.byCountry ?? []).filter(c => c.countryCode !== 'KR');
  const byCategory = data?.byCategory ?? [];
  const maxCategoryAmount = Math.max(...byCategory.map((c) => c.totalKrw), 1);

  // ── 기부 폼 상태 ──
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [donationType, setDonationType] = useState<"now" | "posthumous">("posthumous");
  const [designatedOrg, setDesignatedOrg] = useState({ name: "", address: "", phone: "" });
  const [orgSaved, setOrgSaved] = useState(false);

  const toggleCause = (id: string) => {
    setSelectedCauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // 언어별 빠른 선택 금액 표시
  const QUICK_AMOUNTS = localCurrency.code === "KRW"
    ? ["₩10,000", "₩30,000", "₩50,000", "₩100,000"]
    : localCurrency.code === "JPY"
    ? ["¥1,000", "¥3,000", "¥5,000", "¥10,000"]
    : ["$10", "$30", "$50", "$100"];
  const QUICK_VALUES = ["10000", "30000", "50000", "100000"];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
    setDisplayAmount(raw ? Number(raw).toLocaleString() : "");
  };

  const handleQuickAmount = (val: string) => {
    setAmount(val);
    setDisplayAmount(Number(val).toLocaleString());
  };

  const handleDonate = () => {
    if (selectedCauses.length === 0) {
      toast.error(cs.errorCause);
      return;
    }
    if (selectedCauses.includes("designated") && !orgSaved) {
      toast.error(cs.errorOrg);
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error(cs.errorAmount);
      return;
    }
    if (donationType === "now") {
      toast.info(cs.toastPayNow);
    } else {
      toast.success(cs.toastPosthumous);
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#0d1f3c] to-[#1F3864] text-white relative overflow-hidden">

      {/* ── 대형 배너 이미지 ── */}
      <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden">
        <img
          src={BANNER_URL}
          alt={cs.bannerTitle}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c]/40 via-transparent to-[#0d1f3c]/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/30 border border-[#C9A961]/50 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-semibold">Social Impact</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {cs.bannerTitle}
            </h2>
            <p className="text-white/90 text-base md:text-lg max-w-2xl mx-auto drop-shadow">
              {cs.bannerDesc}
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── 이슈 텍스트 ── */}
      <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <blockquote className="text-lg md:text-2xl font-semibold text-white/90 leading-relaxed mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {cs.quoteText}
          </blockquote>
          <p className="text-[#C9A961] text-base font-medium">
            {cs.quoteSubtext}
          </p>
        </motion.div>
      </div>

      {/* ── 기부 폼 ── */}
      <div className="relative max-w-5xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-white/8 border border-white/15 rounded-3xl p-6 md:p-10"
        >
          {/* Step 1: 분야 선택 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-1">
              {cs.step1Title}
            </h3>
            <p className="text-white/50 text-sm mb-5">
              {cs.step1Desc}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {CAUSE_IDS.map((cause) => {
                const selected = selectedCauses.includes(cause.id);
                const causeName = CAUSE_NAMES[cause.id]?.[language] ?? CAUSE_NAMES[cause.id]?.["en"] ?? cause.id;
                return (
                  <button
                    key={cause.id}
                    onClick={() => toggleCause(cause.id)}
                    className={`relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      selected
                        ? "bg-[#C9A961]/25 border-[#C9A961] text-[#C9A961] shadow-lg scale-105"
                        : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    {selected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C9A961] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <span className="text-xl">{cause.emoji}</span>
                    <span className="text-center leading-tight">{causeName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: 금액 입력 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-1">
              {cs.step2Title}
            </h3>
            <p className="text-white/50 text-sm mb-4">
              {cs.step2Desc}
            </p>
            {/* 빠른 선택 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_AMOUNTS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickAmount(QUICK_VALUES[i])}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    amount === QUICK_VALUES[i]
                      ? "bg-[#C9A961] border-[#C9A961] text-[#1F3864]"
                      : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A961] font-bold text-xl select-none pointer-events-none">
                {cs.currencySymbol || localCurrency.symbol}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder={cs.amountPlaceholder}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3.5 text-white placeholder-white/30 text-lg font-semibold focus:outline-none focus:border-[#C9A961] transition-colors"
              />
              {displayAmount && cs.currencyUnit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                  {cs.currencyUnit}
                </span>
              )}
            </div>

            {/* 지정기부 단체 정보 입력 */}
            {selectedCauses.includes("designated") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-5 bg-white/5 border border-[#C9A961]/30 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🏢</span>
                  <h4 className="text-white font-bold text-sm">
                    {cs.designatedTitle}
                  </h4>
                  {orgSaved && (
                    <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> {cs.designatedSaved}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">{cs.orgNameLabel}</label>
                    <input
                      type="text"
                      value={designatedOrg.name}
                      onChange={(e) => { setDesignatedOrg(p => ({ ...p, name: e.target.value })); setOrgSaved(false); }}
                      placeholder={cs.orgNamePlaceholder}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">{cs.orgAddressLabel}</label>
                    <input
                      type="text"
                      value={designatedOrg.address}
                      onChange={(e) => { setDesignatedOrg(p => ({ ...p, address: e.target.value })); setOrgSaved(false); }}
                      placeholder={cs.orgAddressPlaceholder}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">{cs.orgPhoneLabel}</label>
                    <input
                      type="tel"
                      value={designatedOrg.phone}
                      onChange={(e) => { setDesignatedOrg(p => ({ ...p, phone: e.target.value })); setOrgSaved(false); }}
                      placeholder={cs.orgPhonePlaceholder}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A961] transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!designatedOrg.name || !designatedOrg.address || !designatedOrg.phone) {
                        toast.error(cs.orgSaveError);
                        return;
                      }
                      setOrgSaved(true);
                      toast.success(cs.orgSaveSuccess);
                    }}
                    className="w-full bg-[#C9A961]/20 border border-[#C9A961]/50 text-[#C9A961] font-bold py-2.5 rounded-xl text-sm hover:bg-[#C9A961]/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {cs.orgSaveBtn}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Step 3: 즉시 결제 / 사후 기부 선택 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-4">
              {cs.step3Title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 즉시 결제 */}
              <button
                onClick={() => setDonationType("now")}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                  donationType === "now"
                    ? "border-[#C9A961] bg-[#C9A961]/15"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${donationType === "now" ? "bg-[#C9A961]" : "bg-white/10"}`}>
                  <span className="text-lg">💳</span>
                </div>
                <div>
                  <p className={`font-bold text-base mb-1 ${donationType === "now" ? "text-[#C9A961]" : "text-white"}`}>
                    {cs.donateNowTitle}
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {cs.donateNowDesc}
                  </p>
                </div>
              </button>

              {/* 사후 기부 */}
              <button
                onClick={() => setDonationType("posthumous")}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                  donationType === "posthumous"
                    ? "border-[#C9A961] bg-[#C9A961]/15"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${donationType === "posthumous" ? "bg-[#C9A961]" : "bg-white/10"}`}>
                  <span className="text-lg">📜</span>
                </div>
                <div>
                  <p className={`font-bold text-base mb-1 ${donationType === "posthumous" ? "text-[#C9A961]" : "text-white"}`}>
                    {cs.posthumousTitle}
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    {cs.posthumousDesc}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 선택 요약 + 기부 버튼 */}
          {(selectedCauses.length > 0 || amount) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6"
            >
              <p className="text-white/60 text-xs mb-2">{cs.summaryLabel}</p>
              {selectedCauses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedCauses.map((id) => {
                    const causeName = CAUSE_NAMES[id]?.[language] ?? CAUSE_NAMES[id]?.["en"] ?? id;
                    const causeEmoji = CAUSE_IDS.find((c) => c.id === id)?.emoji ?? "💝";
                    return (
                      <span key={id} className="bg-[#C9A961]/20 text-[#C9A961] text-xs px-2 py-0.5 rounded-full font-medium">
                        {causeEmoji} {causeName}
                      </span>
                    );
                  })}
                </div>
              )}
              {amount && (
                <p className="text-white font-bold text-sm">
                  {localCurrency.symbol}{Number(amount).toLocaleString()}{cs.currencyUnit}
                  {" · "}
                  <span className="text-[#C9A961]">
                    {donationType === "now" ? cs.payNow : cs.posthumous}
                  </span>
                </p>
              )}
            </motion.div>
          )}

          <button
            onClick={handleDonate}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A961] to-[#a88840] text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            <Heart className="w-5 h-5" />
            {donationType === "now" ? cs.donateNowBtn : cs.recordInWillBtn}
            <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-center text-white/30 text-xs mt-4">
            🔒 {cs.secureNote}
          </p>
        </motion.div>

        {/* ── 전 세계 기부 현황 통계 (데이터 있을 때만) ── */}
        {(totalKrw > 0 || donorCount > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            <div className="flex items-center justify-center gap-2 mb-8">
              <Globe2 className="w-5 h-5 text-[#C9A961]" />
              <h3 className="text-xl font-bold text-white">{cs.title}</h3>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-[#C9A961]" />
                </div>
                <p className="text-blue-200 text-sm mb-1">{cs.totalLabel}</p>
                <p className="text-3xl font-bold text-[#C9A961]">
                  {formatCurrency(animatedLocal, localCurrency.code, localCurrency.symbol)}
                </p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-[#C9A961]" />
                </div>
                <p className="text-blue-200 text-sm mb-1">{cs.donorLabel}</p>
                <p className="text-3xl font-bold text-[#C9A961]">
                  {animatedDonors.toLocaleString()}{cs.donorUnit}
                </p>
              </div>
            </div>

            {/* 국가별 */}
            {byCountry.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                {byCountry.map((country, idx) => (
                  <CountryCard key={country.countryCode} country={country} delay={idx * 0.05} donorUnit={cs.donorUnit} />
                ))}
              </div>
            )}

            {/* 분야별 */}
            {byCategory.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {byCategory.sort((a, b) => b.totalKrw - a.totalKrw).map((cat, idx) => {
                  const pct = Math.round((cat.totalKrw / maxCategoryAmount) * 100);
                  const causeEmoji = CAUSE_IDS.find((c) => c.id === cat.category)?.emoji ?? "💝";
                  const causeName = CAUSE_NAMES[cat.category]?.[language] ?? CAUSE_NAMES[cat.category]?.["en"] ?? cat.category;
                  return (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}
                      className="bg-white/8 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{causeEmoji}</span>
                          <span className="text-white font-semibold text-sm">
                            {causeName}
                          </span>
                        </div>
                        <span className="text-[#C9A961] text-sm font-bold">
                          {formatCurrency(Math.round(cat.totalKrw / localRate), localCurrency.code, localCurrency.symbol)}
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: idx * 0.04 }}
                          className="bg-gradient-to-r from-[#C9A961] to-[#e8c97a] h-1.5 rounded-full"
                        />
                      </div>
                      <p className="text-blue-300 text-xs mt-1">{cat.donorCount}{cs.donorUnit}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
// ─── 국가 카드 ────────────────────────────────────────────────────
function CountryCard({
  country,
  delay,
  donorUnit,
}: {
  country: {
    countryCode: string;
    countryName: string;
    flag: string;
    currencyCode: string;
    currencySymbol: string;
    totalAmount: number;
    donorCount: number;
  };
  delay: number;
  donorUnit: string;
}) {
  const animated = useCountUp(country.totalAmount, 2000);
  const formatted = formatCurrency(animated, country.currencyCode, country.currencySymbol);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/10 border border-white/15 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors flex flex-col items-center gap-2"
    >
      <p className="text-white/80 text-xs font-semibold tracking-wide uppercase">{country.countryName}</p>
      <div className="text-5xl leading-none my-1">{country.flag}</div>
      <p className="text-[#C9A961] font-bold text-xl leading-tight">{formatted}</p>
      <p className="text-blue-300 text-xs opacity-70">{country.donorCount.toLocaleString()}{donorUnit}</p>
    </motion.div>
  );
}
