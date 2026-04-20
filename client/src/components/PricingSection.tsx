/**
 * SARAM 가격 섹션
 * 투명한 가격 정책 강조
 * 무료 시작 → 인증 → 부가 서비스 단계별 구조
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";

const pricingPlans = [
  {
    name: "무료 시작",
    price: "₩0",
    usd: "Free",
    description: "AI 유언장 작성 무제한",
    highlight: false,
    features: [
      "AI 체크박스 유언 작성",
      "17분 완성 마법사",
      "실시간 미리보기",
      "임시 저장",
      "상속자 등록",
      "유류분 자동 계산",
    ],
    cta: "무료로 시작",
    ctaStyle: "btn-navy",
  },
  {
    name: "전자 인증",
    price: "₩49,000",
    usd: "$39",
    description: "법적 효력 있는 유언장",
    highlight: true,
    badge: "가장 인기",
    features: [
      "무료 플랜 전체 포함",
      "eKYC 본인인증",
      "전자서명 + 블록체인 기록",
      "법원 제출용 PDF",
      "공증 지원 (옵션)",
      "24/7 보안 보관",
    ],
    cta: "인증 시작하기",
    ctaStyle: "btn-gold",
  },
  {
    name: "프리미엄",
    price: "₩49,000",
    usd: "$39",
    description: "+ 영상 유언 + 자필 스캔",
    highlight: false,
    features: [
      "전자 인증 전체 포함",
      "영상 유언장 (+₩29,000)",
      "자필 유언 스캔 (+₩19,000)",
      "연 멤버십 (₩29,000/년)",
      "재인증 ₩15,000",
      "변호사 매칭 우선권",
    ],
    cta: "프리미엄 시작",
    ctaStyle: "btn-navy",
  },
];

const addons = [
  { name: "영상 유언장", price: "+₩29,000", desc: "법적 녹음 + 감성 메시지" },
  { name: "자필 스캔 인증", price: "+₩19,000", desc: "AI 형식 검증 + 블록체인" },
  { name: "재인증 (수정)", price: "₩15,000", desc: "횟수 무제한" },
  { name: "연 멤버십", price: "₩29,000/년", desc: "2년차부터 (옵션)" },
  { name: "변호사 생전 자문", price: "₩30,000~", desc: "매칭 수수료" },
  { name: "변호사 사후 집행", price: "보수의 15-25%", desc: "플랫폼 수수료" },
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            투명한 가격
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            AI 유언장 작성 무료. 인증만 ₩49,000.
            <br />
            Trust & Will($299/년) 대비 압도적 가성비.
          </p>
        </motion.div>

        {/* 가격 카드 */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
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
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-[#1F3864]"}`}>
                  {plan.name}
                </h3>
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

        {/* 부가 서비스 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-[#FAFAF8] rounded-2xl p-8 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[#C9A961]" />
            <h3 className="font-bold text-[#1F3864] text-lg">부가 서비스 가격</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <div key={addon.name} className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100">
                <div>
                  <div className="font-semibold text-[#1F3864] text-sm">{addon.name}</div>
                  <div className="text-gray-400 text-xs">{addon.desc}</div>
                </div>
                <div className="text-[#C9A961] font-bold text-sm text-right">{addon.price}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
