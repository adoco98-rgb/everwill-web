/**
 * EverWill 카드 섹션
 * 실버 / 골드 / 플래티넘 3종 카드 라인업
 * 네이비 배경 + 카드별 컬러 강조
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { QrCode, FileCheck, Wifi, ShieldCheck, Star, Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

/* 카드 3종 공통 기능 */
const CARD_FEATURES = [
  { icon: QrCode, labelKo: "QR 신원 인증", labelEn: "QR Identity", descKo: "응급 시 QR 스캔 → 가족 연락처 즉시 확인", descEn: "Emergency QR scan → instant family contact" },
  { icon: Wifi, labelKo: "NFC 태그", labelEn: "NFC Tag", descKo: "스마트폰 태그 → 의료정보 자동 표시", descEn: "Tap phone → medical info displayed" },
  { icon: FileCheck, labelKo: "유언 인증 번호", labelEn: "Will Certificate", descKo: "법원·은행에서 일련번호로 유언 확인", descEn: "Court & bank will verification by serial number" },
  { icon: ShieldCheck, labelKo: "사망 트리거", labelEn: "Death Trigger", descKo: "카드 발견 시 자동 사망 알림 발송", descEn: "Auto death notification when card is found" },
];

type CardTier = {
  tier: string;
  tierLabel: string;
  color: string;
  borderColor: string;
  textAccent: string;
  bgCard: string;
  price: string;
  material: string;
  features: string[];
  popular: boolean;
  icon: React.ElementType;
};

export default function BadgeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { language } = useLanguage();
  const isKo = language === "ko";
  const isJa = language === "ja";
  const isZh = language === "zh";

  const getPrice = (usd: string, krw: string, jpy: string, cny: string) => {
    if (isKo) return krw;
    if (isJa) return jpy;
    if (isZh) return cny;
    return usd;
  };

  const cards: CardTier[] = [
    {
      tier: "Silver",
      tierLabel: isKo ? "실버 카드" : "Silver Card",
      color: "from-slate-400 to-slate-600",
      borderColor: "border-slate-400/40",
      textAccent: "text-slate-300",
      bgCard: "bg-gradient-to-br from-slate-700 to-slate-900",
      price: getPrice("$49", "₩49,000", "¥7,595", "¥353"),
      material: isKo ? "실버 콜러" : "Silver Color",
      features: isKo
        ? ["QR 신원 인증", "NFC 태그", "유언 인증 번호", "1년 보관 포함", "전자인증 ₩49,000에 무료 포함"]
        : ["QR Identity", "NFC Tag", "Will Certificate", "1yr Storage Included", "FREE with $49 e-certification"],
      popular: false,
      icon: CreditCard,
    },
    {
      tier: "Gold",
      tierLabel: isKo ? "골드 카드" : "Gold Card",
      color: "from-[#C9A961] to-[#a07c3a]",
      borderColor: "border-[#C9A961]/50",
      textAccent: "text-[#C9A961]",
      bgCard: "bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c]",
      price: getPrice("$79", "₩79,000", "¥12,245", "¥569"),
      material: isKo ? "골드 콜러" : "Gold Color",
      features: isKo
        ? ["QR 신원 인증", "NFC 태그", "유언 인증 번호", "3년 보관 포함", "사망 트리거 우선 처리"]
        : ["QR Identity", "NFC Tag", "Will Certificate", "3yr Storage Included", "Priority Death Trigger"],
      popular: true,
      icon: Star,
    },
    {
      tier: "Platinum",
      tierLabel: isKo ? "플래티넘 카드" : "Platinum Card",
      color: "from-purple-300 to-purple-600",
      borderColor: "border-purple-400/40",
      textAccent: "text-purple-300",
      bgCard: "bg-gradient-to-br from-purple-900 to-slate-900",
      price: getPrice("$99", "₩99,000", "¥15,345", "¥713"),
      material: isKo ? "플래티넘 콜러" : "Platinum Color",
      features: isKo
        ? ["QR 신원 인증", "NFC 태그", "유언 인증 번호", "5년 보관 포함", "자필·영상 유언 포함", "사망 트리거 우선 처리", "VIP 변호사 연결"]
        : ["QR Identity", "NFC Tag", "Will Certificate", "5yr Storage Included", "Handwritten & Video Will", "Priority Death Trigger", "VIP Attorney Access"],
      popular: false,
      icon: Sparkles,
    },
  ];

  return (
    <section id="badge" className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#C9A961]/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#C9A961]/8 blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A961]/3 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-6">
            <CreditCard className="w-4 h-4 text-[#C9A961]" />
            <span className="text-sm text-[#C9A961] font-medium">
              {isKo ? "멤버십 인증 카드" : "Membership Card"}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {isKo ? "EverWill 카드" : "EverWill Card"}
          </h2>
          <p className="text-xl text-white/80 mb-3">
            {isKo
              ? "지갑 속 한 장으로 — 신원 확인, 유언 인증, 사망 트리거까지"
              : "One card in your wallet — identity, will authentication, death trigger"}
          </p>
          <p className="text-white/50 max-w-2xl mx-auto text-sm leading-relaxed">
            {isKo
              ? "MedicAlert + AirTag + Trust&Will을 하나의 카드로. 전 세계 어떤 유언 플랫폼도 시도하지 않은 혁신."
              : "MedicAlert + AirTag + Trust&Will in a single card. Innovation no other will platform has attempted."}
          </p>
        </motion.div>

        {/* 카드 기능 4가지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
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

        {/* 카드 3종 라인업 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {cards.map((card, i) => (
            <motion.div
              key={card.tier}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.15 }}
              className={`relative rounded-2xl border ${card.borderColor} ${card.bgCard} p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 ${card.popular ? "ring-2 ring-[#C9A961]/50" : ""}`}
            >
              {/* 인기 배지 */}
              {card.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C9A961] text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    {isKo ? "인기" : "Popular"}
                  </span>
                </div>
              )}

              {/* 카드 상단 */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${card.textAccent} mb-1`}>
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
              <div className={`relative h-32 rounded-xl bg-gradient-to-br ${card.color} mb-5 overflow-hidden shadow-inner`}>
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
              <div className="mb-5">
                <span className={`text-3xl font-bold ${card.textAccent}`}>{card.price}</span>
                <span className="text-white/40 text-sm ml-1">{isKo ? "/ 1회" : "/ once"}</span>
              </div>

              {/* 포함 기능 목록 */}
              <ul className="space-y-2 mb-6">
                {card.features.map((feat, fi) => (
                  <li key={fi} className="flex items-center gap-2 text-sm text-white/70">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white text-[8px] font-bold">✓</span>
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              {/* 주문 버튼 */}
              <button
                onClick={() => toast.info(isKo ? "카드 주문 기능은 곧 오픈됩니다!" : "Card ordering coming soon!")}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 bg-gradient-to-r ${card.color} text-white hover:opacity-90 hover:shadow-lg`}
              >
                {isKo ? "지금 주문하기" : "Order Now"}
              </button>
            </motion.div>
          ))}
        </div>

        {/* 하단 안내 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <p className="text-white/40 text-sm">
            {isKo
              ? "* 카드는 유언장 인증 완료 후 신청 가능합니다. 제작 기간 약 2-3주 소요."
              : "* Card available after will certification. Production takes approx. 2-3 weeks."}
          </p>
          <p className="text-white/50 text-sm mt-2 font-medium">
            {isKo
              ? "실버 카드: 전자인증 ₩49,000에 무료 포함 · 골드 카드: 3년 플랜(₩79,000) · 플래티넘 카드: 5년 플랜(₩99,000)"
              : "Silver Card: FREE with $49 certification · Gold Card: 3-Year Plan ($79) · Platinum Card: 5-Year Plan ($99)"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
