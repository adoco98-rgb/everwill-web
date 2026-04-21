/**
 * EverWill 가격 섹션
 * - 가격 순서대로 가로 배치: ₩0 → ₩49,000 → ₩73,900 → ₩88,000 → ₩128,000 → ₩248,000
 * - 부가 옵션: 영상유언 +₩29,000 / 자필유언 스캔 +₩19,000
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
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

function formatKRW(n: number) {
  return "₩" + n.toLocaleString("ko-KR");
}

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  /* ─── 전체 가격 플랜 (가로 순서: 0 → 248,000) ─── */
  const allPlans = [
    {
      id: "free",
      tier: "FREE",
      icon: Zap,
      name: t.pricing.free,
      price: 0,
      priceLabel: "₩0",
      usd: "Free",
      badge: null,
      highlight: false,
      accent: "border-gray-200 bg-[#FAFAF8]",
      iconColor: "text-gray-400",
      iconBg: "bg-gray-100",
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
      tier: "CERT",
      icon: Shield,
      name: t.pricing.certTitle,
      price: 49000,
      priceLabel: "₩49,000",
      originalPrice: "₩118,000",
      usd: "$39",
      badge: "59% " + t.pricing.discount,
      highlight: true,
      accent: "border-[#1F3864] bg-[#1F3864]",
      iconColor: "text-[#C9A961]",
      iconBg: "bg-white/20",
      description: t.pricing.certDesc,
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
      ctaClass: "btn-gold",
    },
    {
      id: "3y",
      tier: "3Y",
      icon: Clock,
      name: t.pricing.plan3y,
      price: 73900,
      priceLabel: "₩73,900",
      usd: "$74",
      badge: null,
      highlight: false,
      accent: "border-blue-100 bg-blue-50/30",
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100",
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
      tier: "5Y",
      icon: Star,
      name: t.pricing.plan5y,
      price: 88000,
      priceLabel: "₩88,000",
      usd: "$88",
      badge: t.pricing.lowestUnit,
      highlight: false,
      accent: "border-[#C9A961] bg-amber-50/30",
      iconColor: "text-[#C9A961]",
      iconBg: "bg-amber-100",
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
      ctaClass: "btn-gold",
    },
    {
      id: "10y",
      tier: "10Y",
      icon: Clock,
      name: t.pricing.plan10y,
      price: 128000,
      priceLabel: "₩128,000",
      usd: "$128",
      badge: null,
      highlight: false,
      accent: "border-purple-100 bg-purple-50/30",
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100",
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
      tier: "∞",
      icon: Crown,
      name: t.pricing.planPerm,
      price: 248000,
      priceLabel: "₩248,000",
      usd: "$248",
      badge: t.pricing.planPermStorage,
      highlight: false,
      accent: "border-[#C9A961]/60 bg-gradient-to-b from-amber-50/50 to-[#FAFAF8]",
      iconColor: "text-[#C9A961]",
      iconBg: "bg-amber-100",
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
      color: "border-blue-200 bg-blue-50/40",
      iconColor: "text-blue-600",
    },
    {
      name: t.services.s9Title,
      price: "+₩19,000",
      usd: "+$19",
      originalPrice: "+₩39,000",
      desc: t.services.s9Desc,
      color: "border-amber-200 bg-amber-50/40",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 섹션 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
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
          <div className="mt-6 inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-600 text-sm font-bold">{t.pricing.earlyBird}</span>
          </div>
        </motion.div>

        {/* ── 가격 흐름 라벨 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <span className="text-gray-400 text-sm">{formatKRW(0)}</span>
          <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-gray-200 via-[#C9A961]/40 to-[#1F3864]/40" />
          <span className="text-[#1F3864] text-sm font-semibold">{formatKRW(248000)}</span>
        </motion.div>

        {/* ── 메인 가격 카드 (가로 스크롤) ── */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-5 min-w-max lg:min-w-0 lg:grid lg:grid-cols-6">
            {allPlans.map((plan, i) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className={`relative rounded-2xl border-2 p-5 flex flex-col w-52 lg:w-auto transition-all hover:shadow-xl hover:-translate-y-1 ${plan.accent}`}
                >
                  {/* 뱃지 */}
                  {plan.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                      plan.id === "life"
                        ? "bg-[#C9A961] text-[#1F3864]"
                        : plan.id === "5y"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}>
                      {plan.badge}
                    </div>
                  )}

                  {/* 아이콘 + 티어 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-9 h-9 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                      {plan.id === "life"
                        ? <InfinityIcon className={`w-4 h-4 ${plan.iconColor}`} />
                        : <Icon className={`w-4 h-4 ${plan.iconColor}`} />
                      }
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      plan.highlight
                        ? "bg-white/20 text-white/70"
                        : "bg-[#1F3864]/8 text-[#1F3864]/50"
                    }`}>{plan.tier}</span>
                  </div>

                  {/* 플랜명 */}
                  <h3 className={`font-bold text-sm mb-1 ${plan.highlight ? "text-white" : "text-[#1F3864]"}`}>
                    {plan.name}
                  </h3>

                  {/* 가격 */}
                  <div className="mb-1">
                    {plan.originalPrice && (
                      <span className={`text-xs line-through mr-1 ${plan.highlight ? "text-white/30" : "text-gray-300"}`}>
                        {plan.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-2xl font-bold ${plan.highlight ? "text-[#C9A961]" : "text-[#1F3864]"}`}>
                      {plan.priceLabel}
                    </span>
                  </div>
                  <p className={`text-[11px] mb-4 ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>
                    {plan.usd} · {plan.description}
                  </p>

                  {/* 기능 목록 */}
                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-1.5">
                        <Check className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                          plan.highlight ? "text-[#C9A961]" : "text-green-500"
                        }`} />
                        <span className={`text-[11px] leading-tight ${
                          plan.highlight ? "text-white/75" : "text-gray-600"
                        }`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA 버튼 */}
                  <button
                    onClick={() => toast.info("서비스 준비 중입니다. 곧 오픈합니다!")}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all mt-auto ${plan.ctaClass}`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── 가격 흐름 화살표 (데스크탑) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="hidden lg:flex items-center justify-between mt-3 px-2"
        >
          {allPlans.map((plan, i) => (
            <div key={plan.id} className="flex items-center flex-1">
              <div className="text-center flex-1">
                <div className={`text-[10px] font-bold ${
                  plan.highlight ? "text-[#1F3864]" : "text-gray-400"
                }`}>{plan.priceLabel}</div>
              </div>
              {i < allPlans.length - 1 && (
                <div className="text-gray-300 text-xs px-1">→</div>
              )}
            </div>
          ))}
        </motion.div>

        {/* ── 부가 서비스 옵션 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5 text-[#C9A961]" />
            <h3 className="font-bold text-[#1F3864] text-lg">{t.pricing.certTitle}</h3>
            <span className="text-gray-400 text-sm ml-1">— {t.pricing.certDesc}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className={`rounded-2xl border-2 p-5 flex items-center justify-between ${addon.color}`}
              >
                <div>
                  <div className={`font-bold text-[#1F3864] text-sm mb-0.5`}>{addon.name}</div>
                  <div className="text-gray-400 text-xs">{addon.desc}</div>
                </div>
                <div className="text-right ml-4 shrink-0">
                  <div className="text-gray-300 text-xs line-through">{addon.originalPrice}</div>
                  <div className={`font-bold text-base ${addon.iconColor}`}>{addon.price}</div>
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
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-gray-400 text-xs mt-8 leading-relaxed"
        >
          {t.pricing.note}
        </motion.p>

      </div>
    </section>
  );
}
