/**
 * EverWill NFC 인증 카드 공개 소개 및 주문 페이지
 * 비회원도 볼 수 있는 공개 페이지
 * 경로: /card
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  CreditCard, Wifi, QrCode, ShieldCheck, Zap, Globe,
  ChevronRight, Star, Check, AlertCircle, Heart, Phone
} from "lucide-react";

// NFC 카드 라인업 정의
const CARD_LINEUP = [
  {
    id: "essential",
    tier: "Essential",
    tierKo: "에센셜",
    price: 49000,
    priceUsd: 49,
    material: "스테인레스 스틸",
    materialEn: "Stainless Steel",
    color: "from-gray-400 to-gray-600",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
    bgLight: "bg-gray-50",
    popular: false,
    features: [
      "QR 코드 신원 인증",
      "NFC 태그 내장",
      "유언 인증 번호",
      "응급 의료 정보",
      "1년 보관 포함",
      "전자인증(₩49,000)에 무료 포함",
    ],
    desc: "처음 시작하는 분께 추천. 전자인증 구매 시 무료 제공.",
  },
  {
    id: "gold",
    tier: "Gold",
    tierKo: "골드",
    price: 99000,
    priceUsd: 99,
    material: "골드 코팅 스테인레스",
    materialEn: "Gold-Coated Stainless",
    color: "from-yellow-400 to-yellow-600",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-400",
    bgLight: "bg-yellow-50",
    popular: true,
    features: [
      "QR 코드 신원 인증",
      "NFC 태그 내장",
      "유언 인증 번호",
      "응급 의료 정보",
      "3년 보관 포함",
      "사망 트리거 우선 처리",
      "가족 긴급 알림",
    ],
    desc: "가장 인기 있는 선택. 골드 코팅으로 품격 있는 디자인.",
  },
  {
    id: "platinum",
    tier: "Platinum",
    tierKo: "플래티넘",
    price: 199000,
    priceUsd: 199,
    material: "티타늄 합금",
    materialEn: "Titanium Alloy",
    color: "from-slate-500 to-slate-700",
    textColor: "text-slate-700",
    borderColor: "border-slate-400",
    bgLight: "bg-slate-50",
    popular: false,
    features: [
      "QR 코드 신원 인증",
      "NFC 태그 내장",
      "유언 인증 번호",
      "응급 의료 정보",
      "5년 보관 포함",
      "사망 트리거 우선 처리",
      "자필·영상 유언 포함",
      "VIP 변호사 연결",
    ],
    desc: "최고급 티타늄 소재. 복잡한 자산 구조에 적합.",
  },
  {
    id: "vip",
    tier: "VIP Premium",
    tierKo: "VIP 프리미엄",
    price: 299000,
    priceUsd: 299,
    material: "티타늄·플래티넘",
    materialEn: "Titanium · Platinum",
    color: "from-purple-500 to-purple-800",
    textColor: "text-purple-700",
    borderColor: "border-purple-400",
    bgLight: "bg-purple-50",
    popular: false,
    features: [
      "QR 코드 신원 인증",
      "NFC 태그 내장",
      "유언 인증 번호",
      "응급 의료 정보",
      "영구 보관 포함",
      "사망 트리거 우선 처리",
      "자필·영상 유언 포함",
      "VIP 전담 변호사 연결",
      "전담 콘시어지 서비스",
      "맞춤 각인 서비스",
    ],
    desc: "최고의 서비스를 원하는 분께. 전담 콘시어지 포함.",
  },
];

// 4가지 핵심 기능
const CARD_ROLES = [
  {
    icon: Phone,
    title: "신원 확인",
    desc: "응급 시 QR 스캔 → 가족 연락처·의료정보 즉시 확인",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Zap,
    title: "사망 트리거",
    desc: "카드 발견 시 자동 사망 알림 발송 → 유언 집행 개시",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    icon: ShieldCheck,
    title: "유언 인증",
    desc: "법원·은행에서 일련번호 조회 → 유언 진위 확인",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Heart,
    title: "평생 동반자",
    desc: "지갑 속 카드 한 장으로 가족을 지키는 마음의 안전장치",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

export default function NFCCardPage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 헤더 히어로 */}
      <div className="bg-gradient-to-br from-[#1F3864] to-[#2d4f8a] text-white py-20 px-4 relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-[#C9A961] blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-4 py-1.5 text-sm mb-6">
              <CreditCard className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] font-medium">세계 최초 디지털 유언 NFC 카드</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              EverWill<br />
              <span className="text-[#C9A961]">NFC 인증 카드</span>
            </h1>

            <p className="text-white/80 text-lg mb-2 max-w-2xl">
              지갑 속 카드 한 장이 당신의 마지막 서명을 지킵니다.
            </p>
            <p className="text-white/60 text-sm mb-8 max-w-2xl">
              MedicAlert + AirTag + 유언 인증을 하나로. 전 세계 어떤 유언 플랫폼도 시도하지 않은 혁신.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#lineup">
                <button className="px-6 py-3 bg-[#C9A961] text-[#1F3864] rounded-xl font-bold text-sm hover:bg-[#d4b870] transition-colors flex items-center gap-2">
                  카드 라인업 보기 <ChevronRight className="w-4 h-4" />
                </button>
              </a>
              <Link href="/register">
                <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
                  무료 가입 후 주문하기
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 카드 미리보기 (시각적 카드 디자인) */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1F3864] mb-2">카드 한 장에 담긴 4가지 역할</h2>
            <p className="text-gray-500 text-sm">평소엔 신분증, 응급엔 의료정보, 사망 시엔 유언 트리거</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CARD_ROLES.map((role, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`${role.bg} rounded-2xl p-5 text-center`}
              >
                <div className={`w-10 h-10 rounded-xl ${role.bg} flex items-center justify-center mx-auto mb-3 border border-white shadow-sm`}>
                  <role.icon className={`w-5 h-5 ${role.color}`} />
                </div>
                <h3 className={`font-bold text-sm mb-1 ${role.color}`}>{role.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* NFC/QR 기술 설명 */}
      <div className="bg-[#1F3864] py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-2xl font-bold mb-4">어떻게 작동하나요?</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A961] flex items-center justify-center flex-shrink-0 text-[#1F3864] font-bold text-sm">1</div>
                  <div>
                    <p className="font-semibold text-white">QR 스캔</p>
                    <p className="text-white/60 text-sm">스마트폰 카메라로 QR 코드 스캔 → 응급 정보 페이지 즉시 열림</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A961] flex items-center justify-center flex-shrink-0 text-[#1F3864] font-bold text-sm">2</div>
                  <div>
                    <p className="font-semibold text-white">NFC 태그</p>
                    <p className="text-white/60 text-sm">NFC 지원 스마트폰을 카드에 가져다 대면 자동으로 정보 표시</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A961] flex items-center justify-center flex-shrink-0 text-[#1F3864] font-bold text-sm">3</div>
                  <div>
                    <p className="font-semibold text-white">자동 알림</p>
                    <p className="text-white/60 text-sm">병원·장례식장에서 카드 발견 → 가족에게 자동 알림 발송</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              {/* 카드 시각화 */}
              <div className="relative">
                <div className="w-72 h-44 rounded-2xl bg-gradient-to-br from-[#C9A961] to-[#a07830] shadow-2xl flex flex-col justify-between p-5 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs opacity-70 font-medium">EVERWILL</p>
                      <p className="text-sm font-bold">NFC 인증 카드</p>
                    </div>
                    <div className="flex gap-1">
                      <QrCode className="w-5 h-5 opacity-80" />
                      <Wifi className="w-5 h-5 opacity-80" />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs opacity-60 mb-1">일련번호</p>
                    <p className="font-mono text-sm tracking-widest">EW-2026-XXXX-XXXX</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-60">유효기간</p>
                      <p className="text-sm font-semibold">평생</p>
                    </div>
                    <Globe className="w-6 h-6 opacity-60" />
                  </div>
                </div>
                {/* 빛 반사 효과 */}
                <div className="absolute top-3 left-3 w-20 h-8 bg-white/20 rounded-full blur-sm rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 카드 라인업 */}
      <div id="lineup" className="py-16 px-4 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1F3864] mb-2">NFC 카드 라인업</h2>
            <p className="text-gray-500 text-sm">필요에 맞는 카드를 선택하세요</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CARD_LINEUP.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedCard(card.id === selectedCard ? null : card.id)}
                className={`relative rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedCard === card.id
                    ? `${card.borderColor} shadow-lg scale-[1.02]`
                    : "border-gray-200 hover:border-gray-300"
                } bg-white p-5`}
              >
                {/* 인기 배지 */}
                {card.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> 인기
                  </div>
                )}

                {/* 카드 미니 이미지 */}
                <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${card.color} mb-4 flex items-center justify-center`}>
                  <div className="text-white/80 flex gap-2">
                    <QrCode className="w-5 h-5" />
                    <Wifi className="w-5 h-5" />
                  </div>
                </div>

                <h3 className={`font-bold text-base mb-0.5 ${card.textColor}`}>{card.tierKo}</h3>
                <p className="text-xs text-gray-400 mb-2">{card.material}</p>
                <p className="text-xl font-bold text-[#1F3864] mb-1">
                  ₩{card.price.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mb-3">${card.priceUsd} USD</p>

                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{card.desc}</p>

                <ul className="space-y-1.5">
                  {card.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${card.textColor}`} />
                      {f}
                    </li>
                  ))}
                  {card.features.length > 4 && (
                    <li className="text-xs text-gray-400">+{card.features.length - 4}개 더...</li>
                  )}
                </ul>

                {selectedCard === card.id && (
                  <div className={`mt-3 pt-3 border-t ${card.borderColor}`}>
                    <ul className="space-y-1">
                      {card.features.slice(4).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <Check className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${card.textColor}`} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* 주문 안내 */}
          <div className="mt-10 bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-2xl p-6">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-5 h-5 text-[#1F3864] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#1F3864] mb-1 text-sm">주문 방법 안내</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• <strong>Essential 카드</strong>는 전자인증(₩49,000) 구매 시 <strong>무료 제공</strong>됩니다.</li>
                  <li>• Gold·Platinum·VIP 카드는 회원 가입 후 대시보드 → NFC 인증 카드 메뉴에서 주문 가능합니다.</li>
                  <li>• 카드 제작 후 배송까지 약 7~14 영업일 소요됩니다.</li>
                  <li>• 전 세계 배송 가능 (해외 배송비 별도)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#1F3864] py-16 px-4 text-center text-white">
        <h2 className="text-2xl font-bold mb-3">지금 시작하세요</h2>
        <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
          무료 가입 후 유언장을 작성하고, Essential 카드를 무료로 받아보세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register">
            <button className="px-8 py-3 bg-[#C9A961] text-[#1F3864] rounded-xl font-bold text-sm hover:bg-[#d4b870] transition-colors">
              무료 가입하기 →
            </button>
          </Link>
          <Link href="/will/chat">
            <button className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
              AI 상담 먼저 받기
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
