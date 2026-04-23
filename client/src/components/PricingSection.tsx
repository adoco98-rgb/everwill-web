/**
 * EverWill 가격 섹션
 * 기본비용(₩49,000) + 보관비용 + 할인 → 합계 세분화 표시
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
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language } = useLanguage();
  const isKo = language === "ko";

  /* ─── 가격 플랜 데이터 ─── */
  /* baseFee: 기본 인증비, storageFee: 보관비(정가), discount: 할인액, total: 최종 합계 */
  const plans = [
    {
      id: "free",
      icon: Zap,
      name: isKo ? "무료 시작" : "Free Start",
      description: isKo ? "AI 유언장 작성 · 저장까지 무료" : "AI will writing — free until certification",
      baseFee: 0,
      storageFee: null,
      discount: null,
      total: 0,
      usd: "Free",
      badge: null,
      highlight: false,
      accent: "border-gray-200 bg-[#FAFAF8]",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      features: [
        isKo ? "AI 유언장 작성 (무료)" : "AI Will Writing (Free)",
        isKo ? "상속자 등록 (무료)" : "Heir Registration (Free)",
        isKo ? "자산 분배 설계 (무료)" : "Asset Distribution (Free)",
        isKo ? "미리보기 확인 (무료)" : "Preview & Review (Free)",
      ],
      paywallNote: isKo
        ? "🔐 전자 인증(₩49,000) 후 법적 효력 · 72시간 임시 저장"
        : "🔐 Legal effect after certification ($39) · 72hr temp save",
      cta: isKo ? "무료로 시작하기 >" : "Start Free >",
      ctaClass: "bg-[#1F3864] text-white hover:bg-[#1F3864]/90",
    },
    {
      id: "cert",
      icon: Shield,
      name: isKo ? "유언장 인증" : "Will Certification",
      description: isKo ? "법적 효력 있는 유언장 + 사후 자동 집행" : "Legally valid will + auto execution",
      baseFee: 49000,
      storageFee: 9900,   // 1년 보관 정가
      discount: 9900,     // 1년 무료 포함 (100% 할인)
      total: 49000,
      usd: "$39",
      badge: isKo ? "59% 할인" : "59% OFF",
      subBadge: isKo ? "★ 1년 무료 보관 포함" : "★ 1yr free storage",
      highlight: true,
      accent: "border-[#1F3864] bg-[#1F3864]",
      iconBg: "bg-white/15",
      iconColor: "text-[#C9A961]",
      features: [
        isKo ? "무료 시작" : "Free Start",
        isKo ? "eKYC 법적 효력 보장" : "eKYC Legal Validity",
        isKo ? "은행급 보안" : "Bank-Level Security",
        isKo ? "사후 자동 집행" : "Auto Post-Death Execution",
      ],
      cta: isKo ? "지금 인증 시작하기 →" : "Start Certification →",
      ctaClass: "bg-[#C9A961] text-[#1F3864] font-bold hover:bg-[#d4b870]",
    },
    {
      id: "3y",
      icon: Clock,
      name: isKo ? "3년 플랜" : "3-Year Plan",
      description: isKo ? "3년 보관" : "3-year storage",
      baseFee: 49000,
      storageFee: 39600,  // 9,900 × 4 = 39,600 (3년 = 2년 추가)
      discount: 14700,    // 할인액
      total: 73900,
      usd: "$74",
      badge: null,
      highlight: false,
      accent: "border-blue-100 bg-blue-50/40",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
      features: [
        isKo ? "eKYC 법적 효력 보장" : "eKYC Legal Validity",
        isKo ? "은행급 보안" : "Bank-Level Security",
        isKo ? "3년 보관" : "3-Year Storage",
        isKo ? "유족 자동 알림" : "Auto Family Notification",
      ],
      cta: isKo ? "시작하기 >" : "Start >",
      ctaClass: "bg-[#1F3864] text-white hover:bg-[#1F3864]/90",
    },
    {
      id: "5y",
      icon: Star,
      name: isKo ? "5년 플랜" : "5-Year Plan",
      description: isKo ? "5년 보관" : "5-year storage",
      baseFee: 49000,
      storageFee: 59400,  // 9,900 × 6 = 59,400 (5년 = 4년 추가)
      discount: 20400,    // 할인액
      total: 88000,
      usd: "$88",
      badge: isKo ? "최저 단가" : "Best Value",
      highlight: false,
      accent: "border-[#C9A961]/50 bg-amber-50/40",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A961]",
      features: [
        isKo ? "eKYC 법적 효력 보장" : "eKYC Legal Validity",
        isKo ? "은행급 보안" : "Bank-Level Security",
        isKo ? "5년 보관" : "5-Year Storage",
        isKo ? "유족 자동 알림" : "Auto Family Notification",
      ],
      cta: isKo ? "지금 시작하기 →" : "Start Now →",
      ctaClass: "bg-[#C9A961] text-[#1F3864] font-bold hover:bg-[#d4b870]",
    },
    {
      id: "life",
      icon: Crown,
      name: isKo ? "영구 플랜" : "Lifetime Plan",
      description: isKo ? "영구 보관" : "Lifetime storage",
      baseFee: 49000,
      storageFee: 299000, // 영구 보관 정가
      discount: 100000,   // 할인액
      total: 248000,
      usd: "$248",
      badge: isKo ? "영구 보관" : "Lifetime",
      highlight: false,
      accent: "border-[#C9A961]/40 bg-gradient-to-r from-amber-50/60 to-[#FAFAF8]",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A961]",
      features: [
        isKo ? "eKYC 법적 효력 보장" : "eKYC Legal Validity",
        isKo ? "은행급 보안" : "Bank-Level Security",
        isKo ? "영구 보관" : "Lifetime Storage",
        isKo ? "유족 자동 알림" : "Auto Family Notification",
      ],
      cta: isKo ? "영구 보관 시작 >" : "Start Lifetime >",
      ctaClass: "bg-gradient-to-r from-[#C9A961] to-amber-500 text-[#1F3864] font-bold hover:opacity-90",
    },
  ];

  function fmt(n: number) {
    return "₩" + n.toLocaleString("ko-KR");
  }

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

        {/* ── 가격 카드 목록 ── */}
        <div className="space-y-3">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const showBreakdown = plan.id !== "free";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`relative rounded-2xl border-2 px-6 py-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${plan.accent}`}
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

                <div className="flex items-center gap-5">
                  {/* 아이콘 */}
                  <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {plan.id === "life"
                      ? <InfinityIcon className={`w-5 h-5 ${plan.iconColor}`} />
                      : <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    }
                  </div>

                  {/* 플랜명 + 설명 */}
                  <div className="w-40 flex-shrink-0">
                    <div className={`font-bold text-base mb-0.5 ${plan.highlight ? "text-white" : "text-[#1F3864]"}`}>
                      {plan.name}
                    </div>
                    <div className={`text-xs leading-tight ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>
                      {plan.description}
                    </div>
                    {(plan as any).subBadge && (
                      <div className="mt-1 inline-flex items-center gap-1 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-2 py-0.5">
                        <span className="text-[10px] font-bold text-[#C9A961]">{(plan as any).subBadge}</span>
                      </div>
                    )}
                  </div>

                  {/* 구분선 */}
                  <div className={`w-px h-12 flex-shrink-0 ${plan.highlight ? "bg-white/20" : "bg-gray-200"}`} />

                  {/* 기능 목록 */}
                  <div className="flex-1 flex flex-wrap gap-x-4 gap-y-1">
                    {plan.features.slice(0, 4).map((f) => (
                      <div key={f} className="flex items-center gap-1">
                        <Check className={`w-3 h-3 flex-shrink-0 ${plan.highlight ? "text-[#C9A961]" : "text-green-500"}`} />
                        <span className={`text-sm font-semibold ${plan.highlight ? "text-white" : "text-gray-800"}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* 무료 플랜 페이월 안내 노트 */}
                  {plan.id === "free" && (plan as any).paywallNote && (
                    <div className="hidden lg:flex flex-shrink-0 w-52 items-center justify-end">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                        <p className="text-[10px] text-amber-700 font-medium leading-tight">{(plan as any).paywallNote}</p>
                      </div>
                    </div>
                  )}

                  {/* 가격 세분화 */}
                  {showBreakdown ? (
                    <div className="flex-shrink-0 w-52 text-right">
                      {/* 기본비용 */}
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>
                          {isKo ? "기본 인증비" : "Base fee"}
                        </span>
                        <span className={`text-xs font-semibold ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>
                          {fmt(plan.baseFee)}
                        </span>
                      </div>
                      {/* 보관비 */}
                      {plan.storageFee !== null && (
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>
                            {isKo ? "보관비 (정가)" : "Storage (list)"}
                          </span>
                          <span className={`text-xs font-semibold ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>
                            +{fmt(plan.storageFee!)}
                          </span>
                        </div>
                      )}
                      {/* 할인 */}
                      {plan.discount !== null && plan.discount > 0 && (
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs ${plan.highlight ? "text-[#C9A961]" : "text-red-500"}`}>
                            {isKo ? "할인" : "Discount"}
                          </span>
                          <span className={`text-xs font-bold ${plan.highlight ? "text-[#C9A961]" : "text-red-500"}`}>
                            <Minus className="w-2.5 h-2.5 inline" />{fmt(plan.discount!)}
                          </span>
                        </div>
                      )}
                      {/* 구분선 */}
                      <div className={`h-px mb-1 ${plan.highlight ? "bg-white/20" : "bg-gray-200"}`} />
                      {/* 합계 */}
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${plan.highlight ? "text-white/80" : "text-gray-500"}`}>
                          {isKo ? "합계" : "Total"}
                        </span>
                        <div className="text-right">
                          <div className={`text-xl font-extrabold ${plan.highlight ? "text-[#C9A961]" : "text-[#1F3864]"}`}>
                            {fmt(plan.total)}
                          </div>
                          <div className={`text-[10px] ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>
                            {plan.usd}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 무료 플랜은 단순 표시 */
                    <div className="flex-shrink-0 w-28 text-right">
                      <div className="text-2xl font-extrabold text-[#1F3864]">₩0</div>
                      <div className="text-xs text-gray-400">Free</div>
                    </div>
                  )}

                  {/* CTA 버튼 */}
                  <button
                    onClick={() => toast.info(isKo ? "서비스 준비 중입니다. 곧 오픈합니다!" : "Coming soon!")}
                    className={`flex-shrink-0 flex items-center gap-1 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all whitespace-nowrap ${plan.ctaClass}`}
                  >
                    {plan.cta}
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

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
