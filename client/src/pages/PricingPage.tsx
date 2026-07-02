/**
 * EverWill 가격 안내 페이지
 * 상품별 가격 + 경쟁사 비교 + FAQ
 */
import { CheckCircle2, X, Sparkles, Shield, Video, FileText, CreditCard, Star } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const PLANS = [
  {
    name: "기본 플랜",
    badge: null,
    price: "₩49,000",
    priceNote: "최초 1회",
    subPrice: "+ 재인증 ₩15,000",
    color: "border-gray-200",
    headerBg: "bg-white",
    btnClass: "bg-[#1F3864] text-white hover:bg-[#2a4a7f]",
    features: [
      { text: "AI 유언장 작성 (무료)", ok: true },
      { text: "전자 인증 (최초 1회)", ok: true },
      { text: "블록체인 해시 기록", ok: true },
      { text: "상속인 자동 알림", ok: true },
      { text: "유류분 자동 계산", ok: true },
      { text: "영상 유언장", ok: false },
      { text: "자필 유언장 스캔 인증", ok: false },
    ],
  },
  {
    name: "프리미엄 플랜",
    badge: "추천",
    price: "₩69,000",
    priceNote: "최초 1회",
    subPrice: "₩97,000 → ₩29,000 절약",
    color: "border-[#C9A961]",
    headerBg: "bg-gradient-to-br from-[#1F3864] to-[#2a4a7f]",
    btnClass: "bg-[#C9A961] text-[#1F3864] hover:bg-[#d4b870] font-bold",
    features: [
      { text: "AI 유언장 작성 (무료)", ok: true },
      { text: "전자 인증 (최초 1회)", ok: true },
      { text: "블록체인 해시 기록", ok: true },
      { text: "상속인 자동 알림", ok: true },
      { text: "유류분 자동 계산", ok: true },
      { text: "영상 유언장 포함", ok: true },
      { text: "자필 유언장 스캔 인증 포함", ok: true },
    ],
  },
];

const ADDONS = [
  { icon: <Video className="w-5 h-5 text-purple-600" />, name: "영상 유언장", price: "+₩29,000", desc: "AI 스크립트 + 녹화 가이드 + 블록체인 기록" },
  { icon: <FileText className="w-5 h-5 text-green-600" />, name: "자필 스캔 인증", price: "+₩19,000", desc: "AI 형식 검증 + 위조 탐지 + 블록체인 무결성" },
  { icon: <Shield className="w-5 h-5 text-blue-600" />, name: "재인증 (수정)", price: "₩15,000", desc: "횟수 무제한 — 생애 이벤트마다 업데이트" },
  { icon: <Star className="w-5 h-5 text-amber-600" />, name: "연 멤버십 (2년차~)", price: "₩29,000/년", desc: "지속 보관 + Dead Man's Switch + 알림 서비스" },
];

const BADGES = [
  { name: "Essential", material: "스테인레스 카드", price: "₩49,000", features: ["QR 코드", "NFC 내장", "응급 정보"] },
  { name: "Wearable", material: "실리콘·티타늄 팔찌", price: "₩79,000", features: ["QR 코드", "NFC 내장", "방수"] },
  { name: "Necklace", material: "스테인레스·로즈골드", price: "₩99,000", features: ["QR 코드", "NFC 내장", "고급 마감"] },
  { name: "Premium", material: "티타늄·플래티넘", price: "₩299,000", features: ["QR 코드", "NFC 내장", "VIP 서비스"] },
];

const COMPARE = [
  { feature: "유언장 작성", everwill: "무료", trustwill: "$199/년", farewill: "£90" },
  { feature: "전자 인증", everwill: "₩49,000 (1회)", trustwill: "포함", farewill: "포함" },
  { feature: "재인증", everwill: "₩15,000", trustwill: "연 $299 멤버십", farewill: "연 £90" },
  { feature: "영상 유언", everwill: "+₩29,000", trustwill: "없음", farewill: "없음" },
  { feature: "자필 스캔 인증", everwill: "+₩19,000", trustwill: "없음", farewill: "없음" },
  { feature: "NFC 인증 카드", everwill: "₩49,000~", trustwill: "없음", farewill: "없음" },
  { feature: "4중 사망 감지", everwill: "포함", trustwill: "없음", farewill: "없음" },
  { feature: "다국어 지원", everwill: "14개 언어 (예정)", trustwill: "영어만", farewill: "영어만" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <CreditCard className="w-4 h-4 text-[#C9A961]" />
            <span>가격 안내</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            유언 작성은 <span className="text-[#C9A961]">무료</span>,<br />
            인증만 ₩49,000
          </h1>
          <p className="text-white/70 text-lg">
            진입 장벽 없이 시작하고, 필요한 것만 선택하세요.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">

        {/* 인증 플랜 비교 */}
        <section>
          <h2 className="text-2xl font-bold text-[#1F3864] text-center mb-8">전자 인증 플랜</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {PLANS.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`rounded-2xl border-2 ${plan.color} overflow-hidden shadow-sm relative`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-2.5 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className={`${plan.headerBg} p-6`}>
                  <h3 className={`text-lg font-bold mb-1 ${idx === 1 ? "text-white" : "text-[#1F3864]"}`}>{plan.name}</h3>
                  <div className={`text-3xl font-bold ${idx === 1 ? "text-[#C9A961]" : "text-[#1F3864]"}`}>{plan.price}</div>
                  <div className={`text-sm mt-1 ${idx === 1 ? "text-white/60" : "text-gray-500"}`}>{plan.priceNote}</div>
                  {plan.subPrice && (
                    <div className={`text-xs mt-1 ${idx === 1 ? "text-green-300" : "text-green-600"}`}>{plan.subPrice}</div>
                  )}
                </div>
                <div className="bg-white p-6 space-y-3">
                  {plan.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-2.5 text-sm">
                      {f.ok
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <X className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                      <span className={f.ok ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                    </div>
                  ))}
                  <Link href="/write">
                    <button className={`w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-colors ${plan.btnClass}`}>
                      지금 시작하기
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 부가 서비스 */}
        <section>
          <h2 className="text-2xl font-bold text-[#1F3864] text-center mb-2">부가 서비스</h2>
          <p className="text-center text-gray-500 text-sm mb-8">필요한 것만 선택하세요</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADDONS.map((addon, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mb-3">
                  {addon.icon}
                </div>
                <div className="font-semibold text-[#1F3864] text-sm mb-1">{addon.name}</div>
                <div className="text-[#C9A961] font-bold text-lg mb-2">{addon.price}</div>
                <div className="text-xs text-gray-500 leading-relaxed">{addon.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Badge 라인업 */}
        <section>
          <h2 className="text-2xl font-bold text-[#1F3864] text-center mb-2">EverWill NFC 인증 카드</h2>
          <p className="text-center text-gray-500 text-sm mb-8">물리적 인증 카드 — 응급 시 의료진이 QR 스캔으로 가족 연락처 확인</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BADGES.map((badge, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-[#C9A961]" />
                </div>
                <div className="font-bold text-[#1F3864] mb-1">{badge.name}</div>
                <div className="text-xs text-gray-400 mb-2">{badge.material}</div>
                <div className="text-[#C9A961] font-bold text-xl mb-3">{badge.price}</div>
                <div className="space-y-1">
                  {badge.features.map((f, fi) => (
                    <div key={fi} className="flex items-center gap-1.5 text-xs text-gray-600 justify-center">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 경쟁사 비교 */}
        <section>
          <h2 className="text-2xl font-bold text-[#1F3864] text-center mb-2">글로벌 서비스 비교</h2>
          <p className="text-center text-gray-500 text-sm mb-8">EverWill이 왜 다른지 확인하세요</p>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
            <table className="w-full bg-white">
              <thead>
                <tr className="bg-[#1F3864] text-white">
                  <th className="text-left p-4 text-sm font-semibold">기능</th>
                  <th className="p-4 text-sm font-semibold text-[#C9A961]">EverWill</th>
                  <th className="p-4 text-sm font-semibold text-white/70">Trust & Will</th>
                  <th className="p-4 text-sm font-semibold text-white/70">Farewill</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="p-4 text-sm text-gray-700 font-medium">{row.feature}</td>
                    <td className="p-4 text-sm text-center font-semibold text-[#1F3864]">{row.everwill}</td>
                    <td className="p-4 text-sm text-center text-gray-500">{row.trustwill}</td>
                    <td className="p-4 text-sm text-center text-gray-500">{row.farewill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#1F3864] rounded-2xl p-10 text-center text-white">
          <Sparkles className="w-10 h-10 text-[#C9A961] mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">지금 무료로 시작하세요</h3>
          <p className="text-white/70 mb-6">유언장 작성은 완전 무료. 인증이 필요할 때만 결제하면 됩니다.</p>
          <Link href="/write">
            <button className="px-8 py-4 bg-[#C9A961] text-[#1F3864] rounded-xl font-bold text-lg hover:bg-[#d4b870] transition-colors">
              무료로 유언장 작성 시작
            </button>
          </Link>
        </section>

      </div>
    </div>
  );
}
