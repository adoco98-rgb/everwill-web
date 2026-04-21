/**
 * EverWill 가격 섹션
 * - 유언장 작성 옵션 선택 (영상유언 / 자필유언 업로드)
 * - 보관 수수료: 첫 1년 무료, 2년~연 9,900원, 3·5·10년 15% 할인, 20년+ 영구보관 199,000원
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Check,
  Zap,
  Archive,
  Gift,
  Video,
  PenLine,
  FileText,
  ChevronRight,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

function formatKRW(n: number) {
  return "₩" + n.toLocaleString("ko-KR");
}

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [selectedStorage, setSelectedStorage] = useState("5y");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { t } = useLanguage();

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  /* ─── 멤버십 플랜 (보관 연수 포함) ─── */
  const membershipPlans = [
    {
      id: "3y",
      name: t.pricing.plan3y,
      storage: t.pricing.plan3yStorage,
      certPrice: 49000,
      storagePrice: 24900,
      originalStoragePrice: 29700,
      discountRate: "16% " + t.pricing.discount,
      total: 73900,
      usd: "$74",
      highlight: false,
      badge: null,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.plan3yStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
      ],
      cta: t.pricing.startBtn,
      discount: null,
    },
    {
      id: "5y",
      name: t.pricing.plan5y,
      storage: t.pricing.plan5yStorage,
      certPrice: 49000,
      storagePrice: 39000,
      originalStoragePrice: 49500,
      discountRate: "21% " + t.pricing.discount,
      total: 88000,
      usd: "$88",
      highlight: true,
      badge: t.pricing.lowestUnit,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.plan5yStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
        "₩7,800/yr",
      ],
      cta: t.pricing.startNow,
      discount: t.pricing.lowestUnit,
    },
    {
      id: "10y",
      name: t.pricing.plan10y,
      storage: t.pricing.plan10yStorage,
      certPrice: 49000,
      storagePrice: 79000,
      originalStoragePrice: 99000,
      discountRate: "20% " + t.pricing.discount,
      total: 128000,
      usd: "$128",
      highlight: false,
      badge: null,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.plan10yStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
      ],
      cta: t.pricing.startBtn,
      discount: null,
    },
    {
      id: "life",
      name: t.pricing.planPerm,
      storage: t.pricing.planPermStorage,
      certPrice: 49000,
      storagePrice: 199000,
      originalStoragePrice: 198000,
      discountRate: t.pricing.lowestPrice,
      total: 248000,
      usd: "$248",
      highlight: false,
      badge: t.pricing.planPermStorage,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.planPermStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
        t.pricing.lowestPrice,
      ],
      cta: t.pricing.permanentStart,
      discount: t.pricing.lowestPrice,
    },
  ];

  /* ─── 기본 플랜 ─── */
  const pricingPlans = [
    {
      name: t.pricing.free,
      price: "₩0",
      originalPrice: null,
      usd: "Free",
      description: t.pricing.freeDesc,
      highlight: false,
      features: [
        t.services.s1Title,
        t.services.s2Title,
        t.services.s3Title,
        t.services.s4Title,
        t.services.s5Title,
        t.services.s6Title,
      ],
      cta: t.pricing.free,
      ctaStyle: "btn-navy",
      discount: null,
    },
    {
      name: t.pricing.certTitle,
      price: "₩49,000",
      originalPrice: "₩118,000",
      usd: "$39",
      description: t.pricing.certDesc,
      highlight: true,
      badge: undefined,
      features: [
        t.pricing.free,
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.trust.s5Title,
        t.lawyers.step2Title,
        t.lawyers.step3Title,
        t.pricing.freeStorage,
      ],
      cta: t.pricing.certStart,
      ctaStyle: "btn-gold",
      discount: "59% " + t.pricing.discount,
    },
  ];

  /* ─── 부가 서비스 ─── */
  const addons = [
    { name: t.services.s7Title, price: "₩17,000", originalPrice: "₩29,000", desc: t.pricing.discount },
    { name: t.services.s8Title, price: "+₩29,000", originalPrice: "+₩59,000", desc: t.services.s8Desc },
    { name: t.services.s9Title, price: "+₩19,000", originalPrice: "+₩39,000", desc: t.services.s9Desc },
  ];

  /* ─── 보관 플랜 ─── */
  const storagePlans = [
    { id: "1y",  label: "1yr",   years: 1,  pricePerYear: 9900,  total: 9900,   discount: 0,   badge: null,      highlight: false, isLifetime: false },
    { id: "3y",  label: "3yr",   years: 3,  pricePerYear: 8300,  total: 24900,  discount: null, badge: null,      highlight: false, isLifetime: false },
    { id: "5y",  label: "5yr",   years: 5,  pricePerYear: 7800,  total: 39000,  discount: null, badge: t.pricing.lowestUnit,    highlight: true,  isLifetime: false },
    { id: "10y", label: "10yr",  years: 10, pricePerYear: 7900,  total: 79000,  discount: null, badge: null,      highlight: false, isLifetime: false },
    { id: "life",label: "20yr+", years: 0,  pricePerYear: null,  total: 199000, discount: null, badge: t.pricing.planPermStorage, highlight: false, isLifetime: true  },
  ];

  /* ─── 유언장 작성 옵션 ─── */
  const willOptions = [
    {
      id: "video",
      icon: Video,
      title: t.services.s8Title,
      price: "+₩29,000",
      usd: "+$29",
      description: t.services.s8Desc,
      details: [
        t.services.s8Detail1,
        t.services.s8Detail2,
        t.services.s8Detail3,
        t.services.s8Detail4,
        t.services.s8Detail5,
        t.services.s8Detail6,
      ],
      color: "border-blue-200 bg-blue-50/50",
      iconBg: "bg-blue-100 text-blue-600",
      accentColor: "text-blue-600",
    },
    {
      id: "handwritten",
      icon: PenLine,
      title: t.services.s9Title,
      price: "+₩19,000",
      usd: "+$19",
      description: t.services.s9Desc,
      details: [
        t.services.s9Detail1,
        t.services.s9Detail2,
        t.services.s9Detail3,
        t.services.s9Detail4,
        t.services.s9Detail5,
        t.services.s9Detail6,
      ],
      color: "border-amber-200 bg-amber-50/50",
      iconBg: "bg-amber-100 text-amber-600",
      accentColor: "text-amber-600",
    },
  ];

  /* 총 예상 금액 계산 */
  const basePrice = 49000;
  const videoPrice = selectedOptions.includes("video") ? 29000 : 0;
  const handwrittenPrice = selectedOptions.includes("handwritten") ? 19000 : 0;
  const totalPrice = basePrice + videoPrice + handwrittenPrice;

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 섹션 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2
            className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.pricing.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t.pricing.subtitle}
          </p>
          {/* 긴급 할인 배너 */}
          <div className="mt-6 inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-600 text-sm font-bold">{t.pricing.earlyBird}</span>
          </div>
        </motion.div>

        {/* ── 기본 플랜 카드 (1번: 무료, 2번: 인증) ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative rounded-2xl p-8 border transition-all ${
                plan.highlight
                  ? "bg-[#1F3864] border-[#1F3864] shadow-2xl shadow-[#1F3864]/20 scale-105"
                  : "bg-[#FAFAF8] border-gray-100 hover:border-[#C9A961]/30 hover:shadow-lg"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-[#1F3864]"}`}>
                  {plan.name}
                </h3>
                {plan.originalPrice && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm line-through ${plan.highlight ? "text-white/40" : "text-gray-300"}`}>
                      {plan.originalPrice}
                    </span>
                    {plan.discount && (
                      <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                        {plan.discount}
                      </span>
                    )}
                  </div>
                )}
              <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-[#C9A961]" : "text-[#1F3864]"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>
                    {plan.usd}
                  </span>
                </div>
                <p className={`text-sm ${plan.highlight ? "text-white/60" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-[#C9A961]" : "text-green-500"}`} />
                    <span className={`text-sm ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => toast.info("서비스 준비 중입니다. 곧 오픈합니다!")}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.ctaStyle === "btn-gold"
                    ? "btn-gold"
                    : plan.highlight
                    ? "bg-white text-[#1F3864] hover:bg-gray-50"
                    : "btn-navy text-white"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* ── 멤버십 플랜 카드 (보관 연수 포함 4종) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3
              className="text-2xl font-bold text-[#1F3864] mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {t.pricing.membershipTitle}
            </h3>
            <p className="text-gray-500 text-sm">{t.pricing.membershipSubtitle}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {membershipPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative rounded-2xl p-5 border transition-all flex flex-col ${
                  plan.highlight
                    ? "bg-[#1F3864] border-[#1F3864] shadow-2xl shadow-[#1F3864]/20 scale-105"
                    : "bg-[#FAFAF8] border-gray-100 hover:border-[#C9A961]/40 hover:shadow-lg"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                    plan.badge === t.pricing.planPermStorage
                      ? "bg-[#C9A961] text-[#1F3864]"
                      : "bg-green-500 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <div className="mb-4">
                  <h4 className={`font-bold text-base mb-1 ${
                    plan.highlight ? "text-white" : "text-[#1F3864]"
                  }`}>{plan.name}</h4>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block mb-3 ${
                    plan.highlight ? "bg-white/20 text-white" : "bg-[#1F3864]/8 text-[#1F3864]"
                  }`}>{plan.storage}</div>
                  {plan.discount && (
                    <div className="mb-1">
                      <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                        {plan.discount}
                      </span>
                    </div>
                  )}
                  {/* 가격 구조: 인증비 / 보관비 / 합계 */}
                  <div className={`mt-3 rounded-xl p-3 space-y-1.5 ${
                    plan.highlight ? "bg-white/10" : "bg-white border border-gray-100"
                  }`}>
                    {/* 인증비 */}
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-[11px] whitespace-nowrap ${
                        plan.highlight ? "text-white/60" : "text-gray-400"
                      }`}>{t.pricing.certFee}</span>
                      <div className="text-right shrink-0">
                        <span className={`text-[11px] font-semibold ${
                          plan.highlight ? "text-white/80" : "text-gray-600"
                        }`}>{formatKRW(plan.certPrice)}</span>
                        <div className={`text-[9px] ${
                          plan.highlight ? "text-white/40" : "text-gray-300"
                        }`}>{t.pricing.freeStorage}</div>
                      </div>
                    </div>
                    {/* 보관료 + 할인율 */}
                    <div className="flex justify-between items-start gap-1">
                      <span className={`text-[11px] whitespace-nowrap ${
                        plan.highlight ? "text-white/60" : "text-gray-400"
                      }`}>{t.pricing.storageFee}</span>
                      <div className="text-right shrink-0">
                        <span className={`text-[9px] line-through ${
                          plan.highlight ? "text-white/30" : "text-gray-300"
                        }`}>{formatKRW(plan.originalStoragePrice)}</span>
                        <span className={`text-[11px] font-semibold ml-1 ${
                          plan.highlight ? "text-white/80" : "text-gray-600"
                        }`}>{formatKRW(plan.storagePrice)}</span>
                        <div className="text-[9px] font-bold text-red-500">{plan.discountRate}</div>
                      </div>
                    </div>
                    {/* 합계 */}
                    <div className={`flex justify-between items-center pt-1.5 border-t ${
                      plan.highlight ? "border-white/20" : "border-gray-100"
                    }`}>
                      <span className={`text-xs font-bold ${
                        plan.highlight ? "text-white" : "text-[#1F3864]"
                      }`}>{t.pricing.total}</span>
                      <span className={`text-base font-bold ${
                        plan.highlight ? "text-[#C9A961]" : "text-[#1F3864]"
                      }`}>{formatKRW(plan.total)}</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                        plan.highlight ? "text-[#C9A961]" : "text-green-500"
                      }`} />
                      <span className={`text-xs ${
                        plan.highlight ? "text-white/80" : "text-gray-600"
                      }`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => toast.info("서비스 준비 중입니다. 곧 오픈합니다!")}
                  className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all mt-auto ${
                    plan.highlight
                      ? "btn-gold"
                      : "bg-[#1F3864] text-white hover:bg-[#1F3864]/90"
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-xs mt-4">{t.pricing.note}</p>
        </motion.div>

        {/* ══════════════════════════════════════════
            유언장 작성 옵션 선택
        ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#1F3864]/8 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#1F3864]" />
            </div>
            <div>
              <h3
                className="text-xl font-bold text-[#1F3864]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.services.s8Title} / {t.services.s9Title}
              </h3>
              <p className="text-gray-400 text-sm">
                {t.pricing.certDesc}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {willOptions.map((opt) => {
              const selected = selectedOptions.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                    selected
                      ? "border-[#1F3864] bg-[#1F3864]/4 shadow-md"
                      : `${opt.color} hover:shadow-md`
                  }`}
                >
                  {/* 체크박스 */}
                  <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected
                      ? "bg-[#1F3864] border-[#1F3864]"
                      : "border-gray-300 bg-white"
                  }`}>
                    {selected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>

                  {/* 헤더 */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl ${opt.iconBg} flex items-center justify-center`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1F3864]">{opt.title}</div>
                      <div className="text-gray-400 text-xs">{opt.description}</div>
                    </div>
                  </div>

                  {/* 기능 목록 */}
                  <ul className="space-y-2 mb-5">
                    {opt.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-gray-600">
                        <ChevronRight className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${opt.accentColor}`} />
                        {d}
                      </li>
                    ))}
                  </ul>

                  {/* 가격 */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200/60">
                    <span className="text-gray-400 text-sm">+</span>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${opt.accentColor}`}>{opt.price}</span>
                      <span className="text-gray-400 text-xs ml-1">{opt.usd}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 선택 시 합계 표시 */}
          {selectedOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 bg-[#1F3864] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="text-white/80 text-sm">
                {t.pricing.certFee} ₩49,000
                {selectedOptions.includes("video") && ` + ${t.services.s8Title} ₩29,000`}
                {selectedOptions.includes("handwritten") && ` + ${t.services.s9Title} ₩19,000`}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white/50 text-xs">{t.pricing.total}</div>
                  <div className="text-[#C9A961] text-2xl font-bold">{formatKRW(totalPrice)}</div>
                </div>
                <button
                  onClick={() => toast.info("서비스 준비 중입니다. 곧 오픈합니다!")}
                  className="btn-gold px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap"
                >
                  {t.pricing.certStart}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ══════════════════════════════════════════
            보관 수수료
        ══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1F3864]/8 flex items-center justify-center">
              <Archive className="w-5 h-5 text-[#1F3864]" />
            </div>
            <div>
              <h3
                className="text-xl font-bold text-[#1F3864]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.pricing.storageFee}
              </h3>
            <p className="text-gray-400 text-sm">
              {t.pricing.freeStorage}
            </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
              <Gift className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-700 text-xs font-semibold">{t.pricing.freeStorage}</span>
            </div>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl border border-gray-100 p-6 mt-4">
            {/* 탭 버튼 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {storagePlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedStorage(plan.id)}
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedStorage === plan.id
                      ? "bg-[#1F3864] text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-[#1F3864]/30"
                  }`}
                >
                  {plan.label}
                  {plan.badge && (
                    <span
                      className={`absolute -top-2 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        plan.isLifetime
                          ? "bg-[#C9A961] text-[#1F3864]"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* 선택 플랜 상세 카드 */}
            {storagePlans
              .filter((p) => p.id === selectedStorage)
              .map((plan) => (
                <div key={plan.id} className="grid sm:grid-cols-3 gap-4 mb-5">
                  <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-gray-400 text-xs mb-1">{t.pricing.storageFee}</div>
                    <div className="text-3xl font-bold text-[#1F3864]">
                      {formatKRW(plan.total)}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {plan.isLifetime ? t.pricing.planPermStorage : `${plan.years}yr`}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-gray-400 text-xs mb-1">/yr</div>
                    <div className="text-3xl font-bold text-[#1F3864]">
                      {plan.isLifetime ? (
                        <span className="flex items-center justify-center gap-1">
                          <InfinityIcon className="w-7 h-7 text-[#C9A961]" />
                        </span>
                      ) : (
                        formatKRW(plan.pricePerYear!) + "/yr"
                      )}
                    </div>
                    {plan.isLifetime ? (
                      <div className="text-[#C9A961] text-xs mt-1 font-semibold">{t.pricing.planPermStorage}</div>
                    ) : plan.discount ? (
                      <div className="text-green-600 text-xs mt-1 font-semibold">{plan.discount}% {t.pricing.discount}</div>
                    ) : (
                      <div className="text-gray-300 text-xs mt-1">—</div>
                    )}
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-gray-400 text-xs mb-1">{t.pricing.discount}</div>
                    <div className="text-3xl font-bold text-green-600">
                      {plan.isLifetime
                        ? formatKRW(9900 * 20 - 199000)
                        : plan.discount
                        ? formatKRW(Math.round(9900 * plan.years * (plan.discount / 100)))
                        : "₩0"}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {plan.isLifetime ? "20yr" : plan.discount ? `${plan.years}yr` : "—"}
                    </div>
                  </div>
                </div>
              ))}

            {/* 전체 요금표 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-medium">{t.pricing.storageFee}</th>
                    <th className="text-right py-2 text-gray-400 font-medium">/yr</th>
                    <th className="text-right py-2 text-gray-400 font-medium">{t.pricing.discount}</th>
                    <th className="text-right py-2 text-gray-400 font-medium">{t.pricing.total}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-500">1yr</td>
                    <td className="py-2.5 text-right font-semibold text-green-600">Free</td>
                    <td className="py-2.5 text-right text-green-600">—</td>
                    <td className="py-2.5 text-right font-bold text-green-600">₩0</td>
                  </tr>
                  {storagePlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${
                        selectedStorage === plan.id ? "bg-[#1F3864]/4" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedStorage(plan.id)}
                    >
                      <td className="py-2.5 font-medium text-[#1F3864]">
                        {plan.label}
                        {plan.isLifetime && (
                          <span className="ml-2 text-[10px] bg-[#C9A961] text-[#1F3864] px-1.5 py-0.5 rounded-full font-bold">
                            {t.pricing.planPermStorage}
                          </span>
                        )}
                        {plan.highlight && !plan.isLifetime && (
                          <span className="ml-2 text-[10px] bg-[#1F3864] text-white px-1.5 py-0.5 rounded-full font-bold">
                            {t.pricing.lowestUnit}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-gray-600">
                        {plan.isLifetime ? (
                          <span className="flex items-center justify-end gap-1 text-[#C9A961] font-semibold">
                            <InfinityIcon className="w-4 h-4" /> {t.pricing.permanent}
                          </span>
                        ) : (
                          formatKRW(plan.pricePerYear!) + "/yr"
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {plan.discount ? (
                          <span className="text-green-600 font-semibold">-{plan.discount}%</span>
                        ) : plan.isLifetime ? (
                          <span className="text-[#C9A961] font-semibold">{t.pricing.lowestPrice}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#1F3864]">
                        {formatKRW(plan.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-gray-400 text-xs mt-4 leading-relaxed">
              {t.pricing.note}
            </p>
          </div>
        </motion.div>

        {/* ── 부가 서비스 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="bg-[#FAFAF8] rounded-2xl p-8 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[#C9A961]" />
            <h3 className="font-bold text-[#1F3864] text-lg">{t.pricing.certTitle}</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100"
              >
                <div>
                  <div className="font-semibold text-[#1F3864] text-sm">{addon.name}</div>
                  <div className="text-gray-400 text-xs">{addon.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-300 text-xs line-through">{addon.originalPrice}</div>
                  <div className="text-[#C9A961] font-bold text-sm">{addon.price}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
