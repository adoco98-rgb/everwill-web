/**
 * SARAM 가격 섹션
 * 투명한 가격 정책 강조
 * 무료 시작 → 인증 → 부가 서비스 → 보관 수수료 단계별 구조
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, Zap, Archive, Gift } from "lucide-react";
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
      "1년 무료 보관",
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
      "재인증 ₩15,000",
      "변호사 매칭 우선권",
      "1년 무료 보관",
    ],
    cta: "프리미엄 시작",
    ctaStyle: "btn-navy",
  },
];

const addons = [
  { name: "영상 유언장", price: "+₩29,000", desc: "법적 녹음 + 감성 메시지" },
  { name: "자필 스캔 인증", price: "+₩19,000", desc: "AI 형식 검증 + 블록체인" },
  { name: "재인증 (수정)", price: "₩15,000", desc: "횟수 무제한" },
  { name: "변호사 생전 자문", price: "₩30,000~", desc: "매칭 수수료" },
  { name: "변호사 사후 집행", price: "보수의 15-25%", desc: "플랫폼 수수료" },
];

// 보관 플랜 계산
// 기준: 9,900원/년, 3·5·10년 15% 할인, 20년+ 일시불 199,000원
const storagePlans = [
  {
    id: "1y",
    label: "1년",
    years: 1,
    pricePerYear: 9900,
    total: 9900,
    discount: 0,
    badge: null,
    highlight: false,
  },
  {
    id: "3y",
    label: "3년",
    years: 3,
    pricePerYear: Math.round(9900 * 0.85),
    total: Math.round(9900 * 3 * 0.85),
    discount: 15,
    badge: "15% 할인",
    highlight: false,
  },
  {
    id: "5y",
    label: "5년",
    years: 5,
    pricePerYear: Math.round(9900 * 0.85),
    total: Math.round(9900 * 5 * 0.85),
    discount: 15,
    badge: "15% 할인",
    highlight: true,
  },
  {
    id: "10y",
    label: "10년",
    years: 10,
    pricePerYear: Math.round(9900 * 0.85),
    total: Math.round(9900 * 10 * 0.85),
    discount: 15,
    badge: "15% 할인",
    highlight: false,
  },
  {
    id: "20y",
    label: "20년+",
    years: 20,
    pricePerYear: null,
    total: 199000,
    discount: null,
    badge: "평생 안심",
    highlight: false,
    isLifetime: true,
  },
];

function formatKRW(n: number) {
  return "₩" + n.toLocaleString("ko-KR");
}

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [selectedStorage, setSelectedStorage] = useState("5y");

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
          <h2
            className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            투명한 가격
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            AI 유언장 작성 무료. 인증만 ₩49,000.
            <br />
            필요할 때만 비용이 발생하는 합리적인 가격 정책.
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
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}
              <div className="mb-6">
                <h3
                  className={`font-bold text-lg mb-1 ${
                    plan.highlight ? "text-white" : "text-[#1F3864]"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className={`text-4xl font-bold ${
                      plan.highlight ? "text-[#C9A961]" : "text-[#1F3864]"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${
                      plan.highlight ? "text-white/50" : "text-gray-400"
                    }`}
                  >
                    {plan.usd}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    plan.highlight ? "text-white/60" : "text-gray-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5">
                    <Check
                      className={`w-4 h-4 flex-shrink-0 ${
                        plan.highlight ? "text-[#C9A961]" : "text-green-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-white/80" : "text-gray-600"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() =>
                  toast.info("서비스 준비 중입니다. 곧 오픈합니다!")
                }
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

        {/* ───── 보관 수수료 섹션 ───── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-10"
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1F3864]/8 flex items-center justify-center">
              <Archive className="w-5 h-5 text-[#1F3864]" />
            </div>
            <div>
              <h3
                className="text-xl font-bold text-[#1F3864]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                유언장 보관 수수료
              </h3>
              <p className="text-gray-400 text-sm">
                유언장 작성 후 첫 1년은 무료 · 2년째부터 연 ₩9,900
              </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
              <Gift className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-700 text-xs font-semibold">첫 1년 무료</span>
            </div>
          </div>

          {/* 플랜 탭 선택 */}
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

            {/* 선택된 플랜 상세 */}
            {storagePlans
              .filter((p) => p.id === selectedStorage)
              .map((plan) => (
                <div key={plan.id} className="grid sm:grid-cols-3 gap-4">
                  {/* 총 금액 */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-gray-400 text-xs mb-1">총 보관료</div>
                    <div className="text-3xl font-bold text-[#1F3864]">
                      {formatKRW(plan.total)}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {plan.isLifetime ? "일시불 · 20년 이상" : `${plan.years}년 일시납`}
                    </div>
                  </div>

                  {/* 연간 단가 */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-gray-400 text-xs mb-1">연간 단가</div>
                    <div className="text-3xl font-bold text-[#1F3864]">
                      {plan.isLifetime
                        ? "₩9,950~"
                        : formatKRW(plan.pricePerYear!) + "/년"}
                    </div>
                    {plan.discount ? (
                      <div className="text-green-600 text-xs mt-1 font-semibold">
                        정가 대비 {plan.discount}% 절약
                      </div>
                    ) : plan.isLifetime ? (
                      <div className="text-[#C9A961] text-xs mt-1 font-semibold">
                        20년 이상 최저가
                      </div>
                    ) : (
                      <div className="text-gray-300 text-xs mt-1">기본 요금</div>
                    )}
                  </div>

                  {/* 절약 금액 */}
                  <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-gray-400 text-xs mb-1">절약 금액</div>
                    <div className="text-3xl font-bold text-green-600">
                      {plan.isLifetime
                        ? formatKRW(9900 * 20 - 199000)
                        : plan.discount
                        ? formatKRW(Math.round(9900 * plan.years * (plan.discount / 100)))
                        : "₩0"}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {plan.isLifetime
                        ? "20년 기준 절약"
                        : plan.discount
                        ? `${plan.years}년 기준 절약`
                        : "기본 요금"}
                    </div>
                  </div>
                </div>
              ))}

            {/* 전체 요금표 */}
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-medium">기간</th>
                    <th className="text-right py-2 text-gray-400 font-medium">연간 단가</th>
                    <th className="text-right py-2 text-gray-400 font-medium">할인율</th>
                    <th className="text-right py-2 text-gray-400 font-medium">총 금액</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 text-gray-500">첫 1년</td>
                    <td className="py-2.5 text-right font-semibold text-green-600">무료</td>
                    <td className="py-2.5 text-right text-green-600">—</td>
                    <td className="py-2.5 text-right font-bold text-green-600">₩0</td>
                  </tr>
                  {storagePlans.map((plan) => (
                    <tr
                      key={plan.id}
                      className={`border-b border-gray-50 cursor-pointer transition-colors ${
                        selectedStorage === plan.id
                          ? "bg-[#1F3864]/4"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedStorage(plan.id)}
                    >
                      <td className="py-2.5 font-medium text-[#1F3864]">
                        {plan.label}
                        {plan.highlight && (
                          <span className="ml-2 text-[10px] bg-[#C9A961] text-[#1F3864] px-1.5 py-0.5 rounded-full font-bold">
                            추천
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-gray-600">
                        {plan.isLifetime ? "—" : formatKRW(plan.pricePerYear!) + "/년"}
                      </td>
                      <td className="py-2.5 text-right">
                        {plan.discount ? (
                          <span className="text-green-600 font-semibold">
                            -{plan.discount}%
                          </span>
                        ) : plan.isLifetime ? (
                          <span className="text-[#C9A961] font-semibold">최저가</span>
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
              * 유언장 인증 완료 후 1년은 무료 보관됩니다. 이후 선택한 플랜에 따라 보관 수수료가 발생합니다.
              <br />
              * 보관 기간 중 언제든지 유언장 열람 및 재인증이 가능합니다. 재인증 시 ₩15,000이 별도 부과됩니다.
            </p>
          </div>
        </motion.div>

        {/* 부가 서비스 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="bg-[#FAFAF8] rounded-2xl p-8 border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-[#C9A961]" />
            <h3 className="font-bold text-[#1F3864] text-lg">부가 서비스 가격</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map((addon) => (
              <div
                key={addon.name}
                className="flex items-center justify-between bg-white rounded-xl p-4 border border-gray-100"
              >
                <div>
                  <div className="font-semibold text-[#1F3864] text-sm">
                    {addon.name}
                  </div>
                  <div className="text-gray-400 text-xs">{addon.desc}</div>
                </div>
                <div className="text-[#C9A961] font-bold text-sm text-right">
                  {addon.price}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
