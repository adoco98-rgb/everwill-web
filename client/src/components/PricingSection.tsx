/**
 * SARAM 가격 섹션
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

/* ─── 기본 플랜 ─── */
const pricingPlans = [
  {
    name: "무료 시작",
    price: "₩0",
    originalPrice: null,
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
    discount: null,
  },
  {
    name: "유언장 인증",
    price: "₩49,000",
    originalPrice: "₩118,000",
    usd: "$39",
    description: "법적 효력 있는 유언장 + 사후 자동 집행",
    highlight: true,
    badge: "2026 출시 기념가",
    features: [
      "무료 플랜 전체 포함",
      "eKYC 본인인증 + 전자서명",
      "블록체인 무결성 기록",
      "법원 제출용 서류 자동 생성",
      "사망 후 유족 자동 알림",
      "계약 변호사 사후 집행 지원",
      "1년 무료 보관",
    ],
    cta: "지금 인증 시작하기 →",
    ctaStyle: "btn-gold",
    discount: "59% 할인",
  },
];

/* ─── 부가 서비스 ─── */
const addons = [
  { name: "재인증 (수정)", price: "₩17,000", originalPrice: "₩29,000", desc: "횟수 무제한" },
  { name: "영상 유언장", price: "+₩29,000", originalPrice: "+₩59,000", desc: "법적 녹음 + 감성 메시지" },
  { name: "자필 유언 스캔", price: "+₩19,000", originalPrice: "+₩39,000", desc: "AI 형식 검증 + 블록체인" },
];

/* ─── 보관 플랜 ─── */
const storagePlans = [
  { id: "1y",  label: "1년",   years: 1,  pricePerYear: 9900,  total: 9900,   discount: 0,   badge: null,      highlight: false, isLifetime: false },
  { id: "3y",  label: "3년",   years: 3,  pricePerYear: 8300,  total: 24900,  discount: null, badge: null,      highlight: false, isLifetime: false },
  { id: "5y",  label: "5년",   years: 5,  pricePerYear: 7800,  total: 39000,  discount: null, badge: "추천",    highlight: true,  isLifetime: false },
  { id: "10y", label: "10년",  years: 10, pricePerYear: 7900,  total: 79000,  discount: null, badge: null,      highlight: false, isLifetime: false },
  { id: "life",label: "20년+", years: 0,  pricePerYear: null,  total: 199000, discount: null, badge: "영구보관", highlight: false, isLifetime: true  },
];

function formatKRW(n: number) {
  return "₩" + n.toLocaleString("ko-KR");
}

/* ─── 유언 작성 옵션 ─── */
const willOptions = [
  {
    id: "video",
    icon: Video,
    title: "영상 유언장",
    price: "+₩29,000",
    usd: "+$29",
    description: "법적 녹음 유언 + 감성 메시지",
    details: [
      "AI 낭독 스크립트 자동 생성",
      "녹화 중 실시간 가이드",
      "블록체인 해시 기록",
      "가족별 개별 메시지 설정",
      '"손녀 성인 되는 날" 등 공개 타이밍 설정',
      "평생 보관 · 수십 년 후 재생",
    ],
    color: "border-blue-200 bg-blue-50/50",
    iconBg: "bg-blue-100 text-blue-600",
    accentColor: "text-blue-600",
  },
  {
    id: "handwritten",
    icon: PenLine,
    title: "자필 유언장 스캔",
    price: "+₩19,000",
    usd: "+$19",
    description: "자필 원본 업로드 + AI 인증",
    details: [
      "자필 유언 사진 업로드",
      "AI 자동 형식 검증",
      "자필 여부 · 날짜 · 서명 · 날인 체크",
      "위조 탐지 알고리즘",
      "블록체인 무결성 기록",
      "원본 위치 추적 시스템",
    ],
    color: "border-amber-200 bg-amber-50/50",
    iconBg: "bg-amber-100 text-amber-600",
    accentColor: "text-amber-600",
  },
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [selectedStorage, setSelectedStorage] = useState("5y");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (id: string) => {
    setSelectedOptions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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
            투명한 가격
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            AI 유언장 작성 무료. 인증만 ₩49,000.
            <br />
            필요할 때만 비용이 발생하는 합리적인 가격 정책.
          </p>
          {/* 긴급 할인 배너 */}
          <div className="mt-6 inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-5 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-600 text-sm font-bold">2026 출시 기념 한정 특가 — 정식 출시 후 가격 인상 예정</span>
          </div>
        </motion.div>

        {/* ── 기본 플랜 카드 ── */}
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
                유언장 작성 옵션
              </h3>
              <p className="text-gray-400 text-sm">
                전자 인증(₩49,000)에 추가할 수 있는 선택 서비스
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
                    <span className="text-gray-400 text-sm">추가 금액</span>
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
                전자 인증 ₩49,000
                {selectedOptions.includes("video") && " + 영상 유언 ₩29,000"}
                {selectedOptions.includes("handwritten") && " + 자필 스캔 ₩19,000"}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-white/50 text-xs">예상 총액</div>
                  <div className="text-[#C9A961] text-2xl font-bold">{formatKRW(totalPrice)}</div>
                </div>
                <button
                  onClick={() => toast.info("서비스 준비 중입니다. 곧 오픈합니다!")}
                  className="btn-gold px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap"
                >
                  선택 완료 →
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
                유언장 보관 수수료
              </h3>
            <p className="text-gray-400 text-sm">
              유언장 인증 후 첫 1년 무료 · 이후 선택한 기간만큼 보관
            </p>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-full px-3 py-1">
              <Gift className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-700 text-xs font-semibold">첫 1년 무료</span>
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
                    <div className="text-gray-400 text-xs mb-1">총 보관료</div>
                    <div className="text-3xl font-bold text-[#1F3864]">
                      {formatKRW(plan.total)}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {plan.isLifetime ? "일시불 · 영구보관" : `${plan.years}년 일시납`}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-100 text-center">
                    <div className="text-gray-400 text-xs mb-1">연간 단가</div>
                    <div className="text-3xl font-bold text-[#1F3864]">
                      {plan.isLifetime ? (
                        <span className="flex items-center justify-center gap-1">
                          <InfinityIcon className="w-7 h-7 text-[#C9A961]" />
                        </span>
                      ) : (
                        formatKRW(plan.pricePerYear!) + "/년"
                      )}
                    </div>
                    {plan.isLifetime ? (
                      <div className="text-[#C9A961] text-xs mt-1 font-semibold">영구 보관 · 무제한</div>
                    ) : plan.discount ? (
                      <div className="text-green-600 text-xs mt-1 font-semibold">정가 대비 {plan.discount}% 절약</div>
                    ) : (
                      <div className="text-gray-300 text-xs mt-1">기본 요금</div>
                    )}
                  </div>
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
                      {plan.isLifetime ? "20년 기준 절약" : plan.discount ? `${plan.years}년 기준 절약` : "기본 요금"}
                    </div>
                  </div>
                </div>
              ))}

            {/* 전체 요금표 */}
            <div className="overflow-x-auto">
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
                        selectedStorage === plan.id ? "bg-[#1F3864]/4" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedStorage(plan.id)}
                    >
                      <td className="py-2.5 font-medium text-[#1F3864]">
                        {plan.label}
                        {plan.isLifetime && (
                          <span className="ml-2 text-[10px] bg-[#C9A961] text-[#1F3864] px-1.5 py-0.5 rounded-full font-bold">
                            영구보관
                          </span>
                        )}
                        {plan.highlight && !plan.isLifetime && (
                          <span className="ml-2 text-[10px] bg-[#1F3864] text-white px-1.5 py-0.5 rounded-full font-bold">
                            추천
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right text-gray-600">
                        {plan.isLifetime ? (
                          <span className="flex items-center justify-end gap-1 text-[#C9A961] font-semibold">
                            <InfinityIcon className="w-4 h-4" /> 영구
                          </span>
                        ) : (
                          formatKRW(plan.pricePerYear!) + "/년"
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {plan.discount ? (
                          <span className="text-green-600 font-semibold">-{plan.discount}%</span>
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
              * 유언장 인증 완료 후 1년은 무료 보관됩니다. 이후 선택한 기간에 따라 보관료가 발생합니다.
              <br />
              * 20년+ 영구보관 플랜 선택 시 별도 갱신 없이 평생 보관됩니다.
              <br />
              * 보관 기간 중 언제든지 유언장 열람 및 재인증이 가능합니다. 재인증 시 ₩17,000이 별도 부과됩니다.
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
            <h3 className="font-bold text-[#1F3864] text-lg">기타 서비스 가격</h3>
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
