/**
 * EverWill 가격 섹션
 * 모바일: 카드형 세로 레이아웃
 * 데스크탑: 가로 행 레이아웃
 * pricing.ts 연동으로 언어별 자동 가격 변환
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
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice, getPlanPrices, isKorean, PLAN_KRW_PRICES } from "@/lib/pricing";

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language } = useLanguage();
  const isKo = isKorean(language);

  // 언어에 맞는 플랜 가격 계산
  const planPrices = getPlanPrices(language);

  // 가격 포맷 함수 (원화 또는 달러)
  const fmtKrw = (krw: number) => formatPrice(krw, language);

  // 무료 플랜 페이월 안내 텍스트
  const certPriceStr = planPrices.cert.total;
  const paywallNote = isKo
    ? `🔐 전자 인증(${certPriceStr}) 후 법적 효력 · 72시간 임시 저장`
    : `🔐 Certification required for validity (${certPriceStr}) · 72hr temp save`;

  // 인증 플랜 배지 텍스트
  const certBadge = isKo ? "실버 카드 포함" : "Silver Card Included";
  const certSubBadge = isKo ? "★ 1년 보관(₩15,000) 포함" : "★ 1yr storage included";

  // 플랜 이름/설명 다국어 처리
  const planLabels = {
    free: {
      name: t.pricing.free || (isKo ? "무료 시작" : "Free Start"),
      description: t.pricing.freeDesc || (isKo ? "AI 유언장 작성 · 저장까지 무료" : "AI will writing — free until certification"),
      features: [
        isKo ? "AI 유언장 작성 (무료)" : "AI Will Writing (Free)",
        isKo ? "상속자 등록 (무료)" : "Heir Registration (Free)",
        isKo ? "자산 분배 설계 (무료)" : "Asset Distribution (Free)",
        isKo ? "미리보기 확인 (무료)" : "Preview & Review (Free)",
      ],
      cta: isKo ? "무료로 시작하기" : "Start Free",
    },
    cert: {
      name: isKo ? "전자 인증" : "Will Certification",
      description: isKo ? "전자 인증 + 1년 보관 + 실버 카드" : "Certification + 1yr storage + Silver Card",
      features: [
        isKo ? "eKYC 전자 인증 완료" : "eKYC Certified",
        isKo ? "1년 보관 (₩15,000 포함)" : "1-Year Storage (included)",
        isKo ? "실버 카드 발급" : "Silver Card Issued",
        isKo ? "은행급 보안" : "Bank-Level Security",
        isKo ? "무료 수정 1회 포함" : "1 Free Revision Included",
        isKo ? "추가 수정: ₩5,000/회" : "Extra Revision: ₩5,000/each",
      ],
      cta: isKo ? "지금 인증 시작하기" : "Start Certification",
    },
    plan3y: {
      name: isKo ? "3년 플랜" : "3-Year Plan",
      description: isKo ? "3년 보관 + 골드 카드" : "3-year storage + Gold Card",
      features: [
        isKo ? "eKYC 전자 인증 완료" : "eKYC Certified",
        isKo ? "3년 보관 포함" : "3-Year Storage Included",
        isKo ? "골드 카드 발급" : "Gold Card Issued",
        isKo ? "유족 자동 알림" : "Auto Family Notification",
        isKo ? "무료 수정 2회 포함" : "2 Free Revisions Included",
        isKo ? "추가 수정: ₩5,000/회" : "Extra Revision: ₩5,000/each",
      ],
      cta: isKo ? "시작하기" : "Get Started",
    },
    plan5y: {
      name: isKo ? "5년 플랜" : "5-Year Plan",
      description: isKo ? "5년 보관 + 자필·영상 유언 포함 + 플래티넘 카드" : "5yr storage + Handwritten & Video will + Platinum Card",
      features: [
        isKo ? "eKYC 전자 인증 완료" : "eKYC Certified",
        isKo ? "5년 보관 포함" : "5-Year Storage Included",
        isKo ? "자필 유언 스캔 인증 포함" : "Handwritten Scan Included",
        isKo ? "영상 유언 포함" : "Video Will Included",
        isKo ? "플래티넘 카드 발급" : "Platinum Card Issued",
        isKo ? "유족 자동 알림" : "Auto Family Notification",
      ],
      cta: isKo ? "지금 시작하기" : "Start Now",
    },
    planLife: {
      name: isKo ? "영구 플랜" : "Lifetime Plan",
      description: isKo ? "영구 보관 + 자필·영상 유언 포함 + VIP" : "Lifetime storage + All features + VIP",
      features: [
        isKo ? "eKYC 전자 인증 완료" : "eKYC Certified",
        isKo ? "영구 보관" : "Lifetime Storage",
        isKo ? "자필 유언 스캔 인증 포함" : "Handwritten Scan Included",
        isKo ? "영상 유언 포함" : "Video Will Included",
        isKo ? "VIP 카드 발급" : "VIP Card Issued",
        isKo ? "유족 자동 알림" : "Auto Family Notification",
        isKo ? "유언장 수정 무제한 무료" : "Unlimited Free Revisions",
      ],
      cta: isKo ? "영구 보관 시작" : "Start Lifetime",
    },
  };

  // 가격 세분화 레이블
  const baseFeeLabel = isKo ? "전자 인증" : "Certification";
  const storageFeeLabel = isKo ? "보관료" : "Storage";
  const discountLabel = isKo ? "할인" : "Discount";
  const totalLabel = isKo ? "합계" : "Total";

  const plans = [
    {
      id: "free",
      icon: Zap,
      name: planLabels.free.name,
      description: planLabels.free.description,
      baseFeeKrw: 0,
      storageFeeKrw: null as number | null,
      discountKrw: null as number | null,
      totalKrw: 0,
      badge: null as string | null,
      highlight: false,
      accent: "border-gray-200 bg-[#FAFAF8]",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      features: planLabels.free.features,
      paywallNote,
      cta: planLabels.free.cta,
      ctaClass: "bg-[#1F3864] text-white hover:bg-[#1F3864]/90",
    },
    {
      id: "cert",
      icon: Shield,
      name: planLabels.cert.name,
      description: planLabels.cert.description,
      baseFeeKrw: PLAN_KRW_PRICES.cert.baseFee,
      storageFeeKrw: PLAN_KRW_PRICES.cert.storageFee,
      discountKrw: PLAN_KRW_PRICES.cert.discount,
      totalKrw: PLAN_KRW_PRICES.cert.total,
      badge: certBadge,
      subBadge: certSubBadge,
      highlight: true,
      cardTier: isKo ? "실버" : "Silver",
      accent: "border-[#1F3864] bg-[#1F3864]",
      iconBg: "bg-white/15",
      iconColor: "text-[#C9A961]",
      features: planLabels.cert.features,
      cta: planLabels.cert.cta,
      ctaClass: "bg-[#C9A961] text-[#1F3864] font-bold hover:bg-[#d4b870]",
    },
    {
      id: "3y",
      icon: Clock,
      name: planLabels.plan3y.name,
      description: planLabels.plan3y.description,
      baseFeeKrw: PLAN_KRW_PRICES.plan3y.baseFee,
      storageFeeKrw: PLAN_KRW_PRICES.plan3y.storageFee,
      discountKrw: PLAN_KRW_PRICES.plan3y.discount,
      totalKrw: PLAN_KRW_PRICES.plan3y.total,
      badge: isKo ? "골드 카드" : "Gold Card",
      highlight: false,
      accent: "border-[#C9A961]/50 bg-amber-50/30",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A961]",
      features: planLabels.plan3y.features,
      cta: planLabels.plan3y.cta,
      ctaClass: "bg-[#C9A961] text-[#1F3864] font-bold hover:bg-[#d4b870]",
    },
    {
      id: "5y",
      icon: Star,
      name: planLabels.plan5y.name,
      description: planLabels.plan5y.description,
      baseFeeKrw: PLAN_KRW_PRICES.plan5y.baseFee,
      storageFeeKrw: PLAN_KRW_PRICES.plan5y.storageFee,
      discountKrw: PLAN_KRW_PRICES.plan5y.discount,
      totalKrw: PLAN_KRW_PRICES.plan5y.total,
      badge: isKo ? "플래티넘 카드" : "Platinum Card",
      highlight: false,
      accent: "border-[#C9A961]/50 bg-amber-50/40",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A961]",
      features: planLabels.plan5y.features,
      cta: planLabels.plan5y.cta,
      ctaClass: "bg-[#C9A961] text-[#1F3864] font-bold hover:bg-[#d4b870]",
    },
    {
      id: "life",
      icon: Crown,
      name: planLabels.planLife.name,
      description: planLabels.planLife.description,
      baseFeeKrw: PLAN_KRW_PRICES.planLife.baseFee,
      storageFeeKrw: PLAN_KRW_PRICES.planLife.storageFee,
      discountKrw: PLAN_KRW_PRICES.planLife.discount,
      totalKrw: PLAN_KRW_PRICES.planLife.total,
      badge: isKo ? "VIP · 영구" : "VIP · Lifetime",
      highlight: false,
      accent: "border-[#C9A961]/40 bg-gradient-to-r from-amber-50/60 to-[#FAFAF8]",
      iconBg: "bg-amber-100",
      iconColor: "text-[#C9A961]",
      features: planLabels.planLife.features,
      cta: planLabels.planLife.cta,
      ctaClass: "bg-gradient-to-r from-[#C9A961] to-amber-500 text-[#1F3864] font-bold hover:opacity-90",
    },
  ];

  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const comingSoonMsg = isKo ? "서비스 준비 중입니다. 곧 오픈합니다!" : "Coming soon!";
  // 무료 플랜 버튼: 로그인 여부에 따라 /write 또는 /login?returnTo=/write
  const handleFreeStart = () => {
    if (isAuthenticated) {
      navigate("/write");
    } else {
      navigate("/login?returnTo=/write");
    }
  };

  return (
    <section id="pricing" className="py-16 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 섹션 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2
            className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.pricing.title}
          </h2>
          <p className="text-gray-700 text-base lg:text-lg font-medium max-w-2xl mx-auto mb-5">
            {t.pricing.subtitle}
          </p>
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-700 text-sm font-extrabold">{t.pricing.earlyBird}</span>
          </div>
        </motion.div>

        {/* ── 가격 카드 목록 ── */}
        <div className="space-y-4">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const showBreakdown = plan.id !== "free";
            const totalFormatted = plan.id === "free" ? (isKo ? "₩0" : "$0") : fmtKrw(plan.totalKrw);
            const freeLabel = isKo ? "무료" : "Free";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`relative rounded-2xl border-2 p-5 lg:px-6 lg:py-5 transition-all hover:shadow-lg ${plan.accent}`}
              >
                {/* 뱃지 */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-5 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                    plan.id === "life"
                      ? "bg-[#C9A961] text-[#1F3864]"
                      : plan.id === "5y"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* ── 모바일: 세로 레이아웃 ── */}
                <div className="flex flex-col gap-4 lg:hidden">
                  {/* 상단: 아이콘 + 플랜명 + 가격 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                        {plan.id === "life"
                          ? <InfinityIcon className={`w-5 h-5 ${plan.iconColor}`} />
                          : <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                        }
                      </div>
                      <div>
                        <div className={`font-bold text-sm ${plan.highlight ? "text-white" : "text-[#1F3864]"}`}>
                          {plan.name}
                        </div>
                        <div className={`text-xs ${plan.highlight ? "text-white/70" : "text-gray-500"}`}>
                          {plan.description}
                        </div>
                      </div>
                    </div>
                    {/* 가격 */}
                    <div className="text-right">
                      <div className={`text-xl font-extrabold ${plan.highlight ? "text-[#C9A961]" : "text-[#1F3864]"}`}>
                        {totalFormatted}
                      </div>
                      {plan.id === "free" && (
                        <div className={`text-xs ${plan.highlight ? "text-white/50" : "text-gray-400"}`}>
                          {freeLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* subBadge */}
                  {(plan as any).subBadge && (
                    <div className="inline-flex items-center gap-1 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-2 py-0.5 w-fit">
                      <span className="text-[10px] font-bold text-[#C9A961]">{(plan as any).subBadge}</span>
                    </div>
                  )}

                  {/* 기능 목록 */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5">
                        <Check className={`w-3 h-3 flex-shrink-0 ${plan.highlight ? "text-[#C9A961]" : "text-green-500"}`} />
                        <span className={`text-xs font-semibold ${plan.highlight ? "text-white" : "text-gray-800"}`}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* 페이월 안내 (무료 플랜) */}
                  {plan.id === "free" && plan.paywallNote && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-[11px] text-amber-700 font-medium leading-snug">{plan.paywallNote}</p>
                    </div>
                  )}

                  {/* 가격 세분화 (무료 외) */}
                  {showBreakdown && (
                    <div className={`rounded-xl px-3 py-2 space-y-1 ${plan.highlight ? "bg-white/10" : "bg-white/60 border border-gray-100"}`}>
                      <div className="flex justify-between">
                        <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{baseFeeLabel}</span>
                        <span className={`text-xs font-semibold ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>{fmtKrw(plan.baseFeeKrw)}</span>
                      </div>
                      {plan.storageFeeKrw !== null && (
                        <div className="flex justify-between">
                          <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{storageFeeLabel}</span>
                          <span className={`text-xs font-semibold ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>+{fmtKrw(plan.storageFeeKrw!)}</span>
                        </div>
                      )}
                      {plan.discountKrw !== null && plan.discountKrw > 0 && (
                        <div className="flex justify-between">
                          <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{discountLabel}</span>
                          <span className={`text-xs font-bold ${plan.highlight ? "text-[#C9A961]" : "text-red-500"}`}>
                            <Minus className="w-2.5 h-2.5 inline" />{fmtKrw(plan.discountKrw!)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA 버튼 */}
                  <button
                    onClick={() => plan.id === "free" ? handleFreeStart() : toast.info(comingSoonMsg)}
                    className={`w-full flex items-center justify-center gap-1.5 py-3 rounded-xl font-semibold text-sm transition-all ${plan.ctaClass}`}
                  >
                    {plan.cta}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* ── 데스크탑: 가로 레이아웃 ── */}
                <div className="hidden lg:flex items-center gap-5">
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
                  {plan.id === "free" && plan.paywallNote && (
                    <div className="hidden lg:flex flex-shrink-0 w-52 items-center justify-end">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                        <p className="text-[10px] text-amber-700 font-medium leading-tight">{plan.paywallNote}</p>
                      </div>
                    </div>
                  )}

                  {/* 가격 세분화 */}
                  {showBreakdown ? (
                    <div className="flex-shrink-0 w-52 text-right">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{baseFeeLabel}</span>
                        <span className={`text-xs font-semibold ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>{fmtKrw(plan.baseFeeKrw)}</span>
                      </div>
                      {plan.storageFeeKrw !== null && (
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{storageFeeLabel}</span>
                          <span className={`text-xs font-semibold ${plan.highlight ? "text-white/80" : "text-gray-600"}`}>+{fmtKrw(plan.storageFeeKrw!)}</span>
                        </div>
                      )}
                      {plan.discountKrw !== null && plan.discountKrw > 0 && (
                        <div className="flex justify-between items-center mb-0.5">
                          <span className={`text-xs ${plan.highlight ? "text-white/60" : "text-gray-400"}`}>{discountLabel}</span>
                          <span className={`text-xs font-bold ${plan.highlight ? "text-[#C9A961]" : "text-red-500"}`}>
                            <Minus className="w-2.5 h-2.5 inline" />{fmtKrw(plan.discountKrw!)}
                          </span>
                        </div>
                      )}
                      <div className={`h-px mb-1 ${plan.highlight ? "bg-white/20" : "bg-gray-200"}`} />
                      <div className="flex justify-between items-center">
                        <span className={`text-xs font-bold ${plan.highlight ? "text-white/80" : "text-gray-500"}`}>{totalLabel}</span>
                        <div className="text-right">
                          <div className={`text-xl font-extrabold ${plan.highlight ? "text-[#C9A961]" : "text-[#1F3864]"}`}>{totalFormatted}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-28 text-right">
                      <div className="text-2xl font-extrabold text-[#1F3864]">{isKo ? "₩0" : "$0"}</div>
                      <div className="text-xs text-gray-400">{freeLabel}</div>
                    </div>
                  )}

                  {/* CTA 버튼 */}
                  <button
                    onClick={() => plan.id === "free" ? handleFreeStart() : toast.info(comingSoonMsg)}
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
