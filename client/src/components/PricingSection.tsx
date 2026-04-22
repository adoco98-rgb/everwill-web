/**
 * EverWill 가격 섹션
 * 가로 긴 직사각형 카드 레이아웃
 * ₩0 → ₩49,000 → ₩73,900 → ₩88,000 → ₩128,000 → ₩248,000 순서
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Check,
  Zap,
  Star,
  Crown,
  Shield,
  Clock,
  Infinity as InfinityIcon,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  /* ─── 전체 가격 플랜 (세로 순서: ₩0 → ₩248,000) ─── */
  const allPlans = [
    {
      id: "free",
      icon: Zap,
      name: t.pricing.free,
      price: "₩0",
      usd: "Free",
      originalPrice: null,
      badge: null,
      highlight: false,
      accent: "border-gray-200 bg-[#FAFAF8]",
      priceColor: "text-[#1F3864]",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      description: t.pricing.freeDesc,
      features: [
        t.services.s1Title,
        t.services.s2Title,
        t.services.s3Title,
        t.services.s4Title,
        t.services.s5Title,
        t.services.s6Title,
      ],
      cta: t.pricing.free,
      ctaClass: "bg-[#1F3864] text-white hover:bg-[#1F3864]/90",
    },
    {
      id: "cert",
      icon: Shield,
      name: t.pricing.certTitle,
      price: "₩49,000",
      usd: "$39",
      originalPrice: "₩118,000",
      badge: "59% " + t.pricing.discount,
      highlight: true,
      accent: "border-[#1F3864] bg-[#1F3864]",
      priceColor: "text-[#C9A961]",
      iconBg: "bg-white/15",
      iconColor: "text-[#C9A961]",
      description: t.pricing.certDesc,
      subBadge: t.pricing.freeStorage,
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
      ctaClass: "bg-[#C9A961] text-[#1F3864] font-bold hover:bg-[#C9A961]/90",
    },
    {
      id: "3y",
      icon: Clock,
      name: t.pricing.plan3y,
      price: "₩73,900",
      usd: "$74",
      originalPrice: null,
      badge: null,
      highlight: false,
      accent: "border-blue-100 bg-blue-50/40",
      priceColor: "text-[#1F3864]",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      description: t.pricing.plan3yStorage,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.plan3yStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
      ],
      cta: t.pricing.startBtn,
      ctaClass: "bg-[#1F3864] text-white hover:bg-[#1F3864]/90",
    },
    {
      id: "5y",
      icon: Star,
      name: t.pricing.plan5y,
      price: "₩88,000",
      usd: "$88",
      originalPrice: null,
      badge: t.pricing.lowestUnit,
      highlight: false,
      accent: "border-[#C9A961]/50 bg-amber-50/40",
      priceColor: "text-[#1F3864]",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A961]",
      description: t.pricing.plan5yStorage,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.plan5yStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
        "₩7,800/yr",
      ],
      cta: t.pricing.startNow,
      ctaClass: "bg-[#C9A961] text-[#1F3864] font-bold hover:bg-[#C9A961]/90",
    },
    {
      id: "10y",
      icon: Clock,
      name: t.pricing.plan10y,
      price: "₩128,000",
      usd: "$128",
      originalPrice: null,
      badge: null,
      highlight: false,
      accent: "border-purple-100 bg-purple-50/30",
      priceColor: "text-[#1F3864]",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
      description: t.pricing.plan10yStorage,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.plan10yStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
      ],
      cta: t.pricing.startBtn,
      ctaClass: "bg-[#1F3864] text-white hover:bg-[#1F3864]/90",
    },
    {
      id: "life",
      icon: Crown,
      name: t.pricing.planPerm,
      price: "₩248,000",
      usd: "$248",
      originalPrice: null,
      badge: t.pricing.planPermStorage,
      highlight: false,
      accent: "border-[#C9A961]/40 bg-gradient-to-r from-amber-50/60 to-[#FAFAF8]",
      priceColor: "text-[#1F3864]",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A961]",
      description: t.pricing.planPermStorage,
      features: [
        "eKYC " + t.trust.s2Title,
        t.trust.s4Title,
        t.pricing.planPermStorage,
        t.lawyers.step2Title,
        t.trust.s5Title,
        t.pricing.lowestPrice,
      ],
      cta: t.pricing.permanentStart,
      ctaClass: "bg-gradient-to-r from-[#C9A961] to-amber-500 text-[#1F3864] font-bold hover:opacity-90",
    },
  ];

  /* ─── 부가 서비스 ─── */
  const addons = [
    {
      name: t.services.s8Title,
      price: "+₩29,000",
      usd: "+$29",
      originalPrice: "+₩59,000",
      desc: t.services.s8Desc,
      borderColor: "border-blue-200",
      bg: "bg-blue-50/40",
      priceColor: "text-blue-600",
    },
    {
      name: t.services.s9Title,
      price: "+₩19,000",
      usd: "+$19",
      originalPrice: "+₩39,000",
      desc: t.services.s9Desc,
      borderColor: "border-amber-200",
      bg: "bg-amber-50/40",
      priceColor: "text-amber-600",
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 섹션 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2
            className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.pricing.title}
          </h2>
          <p className="text-gray-700 text-lg font-medium max-w-2xl mx-auto mb-5">
            {t.pricing.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-700 text-sm font-extrabold">{t.pricing.earlyBird}</span>
          </div>
        </motion.div>

        {/* ── 가로 긴 직사각형 카드 목록 ── */}
        <div className="space-y-3">
          {allPlans.map((plan, i) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`relative rounded-2xl border-2 px-6 py-5 flex items-center gap-6 transition-all hover:shadow-lg hover:-translate-y-0.5 ${plan.accent}`}
              >
                {/* 뱃지 */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-6 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                    plan.id === "life"
                      ? "bg-[#C9A961] text-[#1F3864]"
                      : plan.id === "5y"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* 아이콘 */}
                <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                  {plan.id === "life"
                    ? <InfinityIcon className={`w-5 h-5 ${plan.iconColor}`} />
                    : <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                  }
                </div>

                {/* 플랜명 + 설명 */}
                <div className="w-44 flex-shrink-0">
                  <div className={`font-bold text-base mb-0.5 ${plan.highlight ? "text-white" : "text-[#1F3864]"}`} style={{fontWeight:700}}>
                    {plan.name}
                  </div>
                  <div className={`text-xs leading-tight font-medium ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>
                    {plan.description}
                  </div>
                  {(plan as any).subBadge && (
                    <div className="mt-1 inline-flex items-center gap-1 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-2 py-0.5">
                      <span className="text-[10px] font-bold text-[#C9A961]">★ {(plan as any).subBadge}</span>
                    </div>
                  )}
                </div>

                {/* 구분선 */}
                <div className={`w-px h-10 flex-shrink-0 ${plan.highlight ? "bg-white/20" : "bg-gray-200"}`} />

                {/* 기능 목록 (가로) */}
                <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1">
                  {plan.features.slice(0, 4).map((f) => (
                    <div key={f} className="flex items-center gap-1">
                      <Check className={`w-3 h-3 flex-shrink-0 ${plan.highlight ? "text-[#C9A961]" : "text-green-500"}`} />
                      <span className={`text-sm font-semibold ${plan.highlight ? "text-white" : "text-gray-800"}`}>{f}</span>
                    </div>
                  ))}
                  {plan.features.length > 4 && (
                    <span className={`text-sm font-semibold ${plan.highlight ? "text-white/70" : "text-gray-600"}`}>
                      +{plan.features.length - 4}개
                    </span>
                  )}
                </div>

                {/* 가격 */}
                <div className="text-right flex-shrink-0 w-28">
                  {plan.originalPrice && (
                    <div className={`text-xs line-through mb-0.5 ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>
                      {plan.originalPrice}
                    </div>
                  )}
                  <div className={`text-2xl font-extrabold ${plan.priceColor}`}>
                    {plan.price}
                  </div>
                  <div className={`text-xs font-semibold ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>
                    {plan.usd}
                  </div>
                </div>

                {/* CTA 버튼 */}
                <button
                  onClick={() => toast.info("서비스 준비 중입니다. 곧 오픈합니다!")}
                  className={`flex-shrink-0 flex items-center gap-1 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${plan.ctaClass}`}
                >
                  {plan.cta}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* ── 부가 서비스 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#C9A961]" />
            <h3 className="font-bold text-[#1F3864] text-base">{t.services.s8Title} / {t.services.s9Title}</h3>
            <span className="text-gray-600 text-sm font-medium">— {t.pricing.certDesc}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className={`rounded-2xl border-2 px-5 py-4 flex items-center justify-between ${addon.borderColor} ${addon.bg}`}
              >
                <div>
                  <div className="font-bold text-[#1F3864] text-base mb-0.5">{addon.name}</div>
                  <div className="text-gray-600 text-sm font-medium">{addon.desc}</div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-gray-400 text-xs line-through">{addon.originalPrice}</div>
                  <div className={`font-bold text-xl ${addon.priceColor}`}>{addon.price}</div>
                  <div className="text-gray-400 text-[10px]">{addon.usd}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 주석 ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-gray-400 text-xs mt-8 leading-relaxed"
        >
          {t.pricing.note}
        </motion.p>

      </div>
    </section>
  );
}
