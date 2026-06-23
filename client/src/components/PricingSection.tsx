/**
 * EverWill 통합 가격 섹션 (BadgeSection + PricingSection 합본)
 * - 상단: 카드 기능 4가지 (QR/NFC/유언인증/사망트리거)
 * - 중단: 카드 디자인 4종 (실버/골드/플래티넘/VIP) + 가격 상세
 * - 하단: 무료 시작 플랜 안내
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  QrCode,
  FileCheck,
  Wifi,
  ShieldCheck,
  Star,
  Sparkles,
  CreditCard,
  Check,
  Zap,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatPrice, isKorean, PLAN_KRW_PRICES } from "@/lib/pricing";

/* 카드 공통 기능 4가지 */
const CARD_FEATURES = [
  {
    icon: QrCode,
    labelKo: "QR 신원 인증",
    labelEn: "QR Identity",
    descKo: "응급 시 QR 스캔 → 가족 연락처 즉시 확인",
    descEn: "Emergency QR scan → instant family contact",
  },
  {
    icon: Wifi,
    labelKo: "NFC 태그",
    labelEn: "NFC Tag",
    descKo: "스마트폰 태그 → 의료정보 자동 표시",
    descEn: "Tap phone → medical info displayed",
  },
  {
    icon: FileCheck,
    labelKo: "유언 인증 번호",
    labelEn: "Will Certificate",
    descKo: "법원·은행에서 일련번호로 유언 확인",
    descEn: "Court & bank will verification by serial number",
  },
  {
    icon: ShieldCheck,
    labelKo: "사망 트리거",
    labelEn: "Death Trigger",
    descKo: "카드 발견 시 자동 사망 알림 발송",
    descEn: "Auto death notification when card is found",
  },
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language } = useLanguage();
  const isKo = isKorean(language);
  const isJa = language === "ja";
  const isZh = language === "zh";
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const fmtKrw = (krw: number) => formatPrice(krw, language);

  const getPrice = (usd: string, krw: string, jpy: string, cny: string) => {
    if (isKo) return krw;
    if (isJa) return jpy;
    if (isZh) return cny;
    return usd;
  };

  const handleFreeStart = () => {
    if (isAuthenticated) {
      navigate("/write");
    } else {
      navigate("/login?returnTo=/write");
    }
  };

  const comingSoonMsg = isKo ? "서비스 준비 중입니다. 곧 오픈합니다!" : "Coming soon!";

  /* 카드 4종 데이터 */
  const cards = [
    {
      tier: "Silver",
      tierLabel: isKo ? "실버 카드" : "Silver Card",
      planName: isKo ? "전자 인증 + 1년 보관" : "Certification + 1yr Storage",
      color: "from-slate-400 to-slate-600",
      borderColor: "border-slate-400/40",
      textAccent: "text-slate-300",
      bgCard: "bg-gradient-to-br from-slate-700 to-slate-900",
      price: getPrice("$49", "₩49,000", "¥7,595", "¥353"),
      priceKrw: PLAN_KRW_PRICES.cert.total,
      material: isKo ? "실버 컬러" : "Silver Color",
      popular: false,
      icon: CreditCard,
      features: isKo
        ? ["eKYC 전자 인증 완료", "QR 신원 인증", "NFC 태그", "유언 인증 번호", "1년 보관 포함", "사망 트리거"]
        : ["eKYC Certified", "QR Identity", "NFC Tag", "Will Certificate", "1yr Storage", "Death Trigger"],
      breakdown: isKo
        ? [{ label: "전자 인증", val: "₩49,000" }, { label: "1년 보관", val: "₩15,000" }, { label: "할인", val: "-₩15,000", red: true }, { label: "합계", val: "₩49,000", bold: true }]
        : [{ label: "Certification", val: "$39" }, { label: "1yr Storage", val: "$15" }, { label: "Discount", val: "-$15", red: true }, { label: "Total", val: "$39", bold: true }],
    },
    {
      tier: "Gold",
      tierLabel: isKo ? "골드 카드" : "Gold Card",
      planName: isKo ? "전자 인증 + 3년 보관" : "Certification + 3yr Storage",
      color: "from-[#C9A961] to-[#a07c3a]",
      borderColor: "border-[#C9A961]/50",
      textAccent: "text-[#C9A961]",
      bgCard: "bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c]",
      price: getPrice("$79", "₩79,000", "¥12,245", "¥569"),
      priceKrw: PLAN_KRW_PRICES.plan3y.total,
      material: isKo ? "골드 컬러" : "Gold Color",
      popular: true,
      icon: Star,
      features: isKo
        ? ["eKYC 전자 인증 완료", "QR 신원 인증", "NFC 태그", "유언 인증 번호", "3년 보관 포함", "사망 트리거 우선 처리", "유족 자동 알림", "AI 일기쓰기 (Life Story)", "소중한 사람에게 편지쓰기"]
        : ["eKYC Certified", "QR Identity", "NFC Tag", "Will Certificate", "3yr Storage", "Priority Death Trigger", "Auto Family Notification", "AI Life Story Diary", "Legacy Letter Writing"],
      breakdown: isKo
        ? [{ label: "전자 인증", val: "₩49,000" }, { label: "3년 보관", val: "₩30,000" }, { label: "합계", val: "₩79,000", bold: true }]
        : [{ label: "Certification", val: "$39" }, { label: "3yr Storage", val: "$30" }, { label: "Total", val: "$79", bold: true }],
    },
    {
      tier: "Platinum",
      tierLabel: isKo ? "플래티넘 카드" : "Platinum Card",
      planName: isKo ? "전자 인증 + 5년 보관 + 자필·영상" : "Certification + 5yr + Handwritten & Video",
      color: "from-purple-300 to-purple-600",
      borderColor: "border-purple-400/40",
      textAccent: "text-purple-300",
      bgCard: "bg-gradient-to-br from-purple-900 to-slate-900",
      price: getPrice("$99", "₩99,000", "¥15,345", "¥713"),
      priceKrw: PLAN_KRW_PRICES.plan5y.total,
      material: isKo ? "플래티넘 컬러" : "Platinum Color",
      popular: false,
      icon: Sparkles,
      features: isKo
        ? ["eKYC 전자 인증 완료", "QR 신원 인증", "NFC 태그", "유언 인증 번호", "5년 보관 포함", "자필 유언 스캔 인증", "영상 유언 포함", "사망 트리거 우선 처리", "AI 일기쓰기 (Life Story)", "소중한 사람에게 편지쓰기"]
        : ["eKYC Certified", "QR Identity", "NFC Tag", "Will Certificate", "5yr Storage", "Handwritten Scan", "Video Will", "Priority Death Trigger", "AI Life Story Diary", "Legacy Letter Writing"],
      breakdown: isKo
        ? [{ label: "전자 인증", val: "₩49,000" }, { label: "5년 보관", val: "₩50,000" }, { label: "합계", val: "₩99,000", bold: true }]
        : [{ label: "Certification", val: "$39" }, { label: "5yr Storage", val: "$50" }, { label: "Total", val: "$99", bold: true }],
    },
    {
      tier: "VIP",
      tierLabel: isKo ? "VIP 프리미엄" : "VIP Premium",
      planName: isKo ? "영구 보관 + 전체 기능 + VIP" : "Lifetime Storage + All Features + VIP",
      color: "from-amber-300 via-yellow-400 to-amber-600",
      borderColor: "border-amber-400/60",
      textAccent: "text-amber-300",
      bgCard: "bg-gradient-to-br from-amber-950 to-slate-900",
      price: getPrice("$199", "₩199,000", "¥30,897", "¥1,435"),
      priceKrw: PLAN_KRW_PRICES.planLife.total,
      material: isKo ? "티타늄 · 플래티넘" : "Titanium · Platinum",
      popular: false,
      icon: Sparkles,
      features: isKo
        ? ["eKYC 전자 인증 완료", "QR 신원 인증", "NFC 태그", "유언 인증 번호", "영구 보관", "자필·영상 유언 포함", "사망 트리거 우선 처리", "VIP 전담 변호사 연결", "전담 콘시어지 서비스", "수정 무제한 무료", "AI 일기쓰기 (Life Story)", "소중한 사람에게 편지쓰기"]
        : ["eKYC Certified", "QR Identity", "NFC Tag", "Will Certificate", "Lifetime Storage", "Handwritten & Video Will", "Priority Death Trigger", "Dedicated VIP Attorney", "Dedicated Concierge", "Unlimited Free Revisions", "AI Life Story Diary", "Legacy Letter Writing"],
      breakdown: isKo
        ? [{ label: "전자 인증", val: "₩49,000" }, { label: "영구 보관", val: "₩150,000" }, { label: "합계", val: "₩199,000", bold: true }]
        : [{ label: "Certification", val: "$39" }, { label: "Lifetime Storage", val: "$150" }, { label: "Total", val: "$199", bold: true }],
    },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#C9A961]/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#C9A961]/8 blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A961]/3 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 섹션 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-5">
            <CreditCard className="w-4 h-4 text-[#C9A961]" />
            <span className="text-sm text-[#C9A961] font-medium">
              {isKo ? "멤버십 인증 카드 & 가격 정책" : "Membership Card & Pricing"}
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {isKo ? "투명한 가격 정책" : "Transparent Pricing"}
          </h2>
          <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto mb-5">
            {isKo
              ? "지갑 속 한 장으로 — 신원 확인, 유언 인증, 사망 트리거까지. 필요할 때만 비용이 발생하는 합리적인 가격."
              : "One card in your wallet — identity, will authentication, death trigger. Pay only when you need it."}
          </p>
          <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-300 text-sm font-bold">
              {isKo ? "2026 출시 기념 한정 특가 — 정식 출시 후 가격 인상 예정" : "2026 Launch Special — Price increases after official launch"}
            </span>
          </div>
        </motion.div>

        {/* ── 카드 기능 4가지 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14"
        >
          {CARD_FEATURES.map((feat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-[#C9A961]/20 rounded-full mb-3">
                <feat.icon className="w-5 h-5 text-[#C9A961]" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">
                {isKo ? feat.labelKo : feat.labelEn}
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                {isKo ? feat.descKo : feat.descEn}
              </p>
            </div>
          ))}
        </motion.div>

        {/* ── 카드 4종 라인업 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {cards.map((card, i) => (
            <motion.div
              key={card.tier}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
              className={`relative rounded-2xl border ${card.borderColor} ${card.bgCard} p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 flex flex-col ${card.popular ? "ring-2 ring-[#C9A961]/50" : ""}`}
            >
              {/* 인기 배지 */}
              {card.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C9A961] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    {isKo ? "인기" : "Popular"}
                  </span>
                </div>
              )}

              {/* 카드 상단: 등급 + 아이콘 */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${card.textAccent} mb-0.5`}>
                    {card.tier}
                  </p>
                  <h3 className="text-white font-bold text-lg">{card.tierLabel}</h3>
                  <p className="text-white/40 text-xs mt-0.5">{card.material}</p>
                </div>
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* 카드 시각화 */}
              <div className={`relative h-28 rounded-xl bg-gradient-to-br ${card.color} mb-4 overflow-hidden shadow-inner`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="absolute top-3 left-4">
                  <p className="text-white font-bold text-sm tracking-wider">EverWill</p>
                  <p className="text-white/70 text-xs font-medium">{card.tier.toUpperCase()}</p>
                </div>
                <div className="absolute top-3 right-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-white/80" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-4">
                  <p className="text-white/60 text-xs font-mono tracking-widest">**** **** **** ****</p>
                </div>
              </div>

              {/* 가격 */}
              <div className="mb-4">
                <span className={`text-3xl font-bold ${card.textAccent}`}>{card.price}</span>
                <span className="text-white/40 text-sm ml-1">{isKo ? "/ 1회" : "/ once"}</span>
              </div>

              {/* 가격 세분화 */}
              <div className="bg-white/5 rounded-xl px-3 py-2 mb-4 space-y-1">
                {card.breakdown.map((row: { label: string; val: string; red?: boolean; bold?: boolean }, ri) => (
                  <div key={ri} className={`flex justify-between items-center ${row.bold ? "border-t border-white/10 pt-1 mt-1" : ""}`}>
                    <span className={`text-xs ${row.bold ? "text-white/80 font-bold" : "text-white/40"}`}>{row.label}</span>
                    <span className={`text-xs font-semibold ${row.red ? "text-red-400" : row.bold ? card.textAccent : "text-white/70"}`}>{row.val}</span>
                  </div>
                ))}
              </div>

              {/* 포함 기능 목록 */}
              <ul className="space-y-1.5 mb-5 flex-1">
                {card.features.map((feat, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-xs text-white/70">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-[8px] font-bold">✓</span>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* 신청 버튼 */}
              <button
                onClick={() => toast.info(isKo ? "카드 주문 기능은 곧 오픈됩니다!" : "Card ordering coming soon!")}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r ${card.color} text-white hover:opacity-90 hover:shadow-lg mt-auto`}
              >
                {isKo ? "지금 신청하기" : "Apply Now"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* ── 무료 시작 배너 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white/5 border border-white/15 rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-[#C9A961]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-1">
                {isKo ? "무료로 시작하기" : "Start for Free"}
              </h3>
              <p className="text-white/60 text-sm">
                {isKo
                  ? "AI 유언장 작성 · 상속자 등록 · 자산 분배 설계 · 미리보기 — 모두 무료"
                  : "AI will writing · heir registration · asset distribution · preview — all free"}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">

            <button
              onClick={handleFreeStart}
              className="flex items-center gap-2 px-6 py-3 bg-white text-[#1F3864] font-bold rounded-xl hover:bg-white/90 transition-all whitespace-nowrap"
            >
              {isKo ? "무료로 시작하기" : "Start Free"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* ── 포함 기능 체크리스트 (무료) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          {(isKo
            ? ["AI 유언장 작성 (무료)", "상속자 등록 (무료)", "자산 분배 설계 (무료)", "미리보기 확인 (무료)"]
            : ["AI Will Writing (Free)", "Heir Registration (Free)", "Asset Distribution (Free)", "Preview & Review (Free)"]
          ).map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white/60 text-sm">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* ── 하단 안내 ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-8"
        >
          <p className="text-white/30 text-xs">
            {isKo
              ? "* 카드는 유언장 인증 완료 후 신청 가능합니다. 제작 기간 약 2-3주 소요."
              : "* Card available after will certification. Production takes approx. 2-3 weeks."}
          </p>
          <p className="text-white/40 text-xs mt-1">
            {t.pricing?.note || (isKo ? "부가세 별도. 해외 결제 시 환율 적용." : "VAT excluded. Exchange rates apply for international payments.")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
