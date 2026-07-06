/**
 * EverWill 결제하기 페이지 (/dashboard/payments)
 * 4가지 멤버십 카드를 예쁘게 보여주고 바로 결제 가능
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Crown,
  Shield,
  Star,
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  Video,
  ScanLine,
  PenLine,
  Mail,
  HardDrive,
  Infinity,
  Scale,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

type MemberGrade = "silver" | "gold" | "platinum" | "vip";

interface MembershipCard {
  grade: MemberGrade;
  name: string;
  subtitle: string;
  price: number;
  originalPrice?: number;
  color: string;
  bgGradient: string;
  borderColor: string;
  icon: typeof Star;
  recommended?: boolean;
  features: { icon: typeof Check; text: string; highlight?: boolean }[];
  productKey: string;
}

const CARDS: MembershipCard[] = [
  {
    grade: "silver",
    name: "실버",
    subtitle: "전자 인증 기본",
    price: 168000,
    color: "text-gray-600",
    bgGradient: "from-gray-50 to-gray-100",
    borderColor: "border-gray-200 hover:border-gray-400",
    icon: Shield,
    features: [
      { icon: FileText, text: "유언장 전자 인증" },
      { icon: Shield, text: "블록체인 해시 기록" },
      { icon: FileText, text: "인증서 발급" },
      { icon: CreditCard, text: "자산 등록 (부동산·금융·기타)" },
      { icon: Check, text: "상속인 등록 및 저장" },
      { icon: Check, text: "건강증명서 업로드" },
      { icon: PenLine, text: "유언장 수정 2회 무료" },
      { icon: HardDrive, text: "1년 보관" },
    ],
    productKey: "membership_silver",
  },
  {
    grade: "gold",
    name: "골드",
    subtitle: "영상 + 자필 + Life Story",
    price: 79000,
    color: "text-yellow-600",
    bgGradient: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-200 hover:border-yellow-400",
    icon: Star,
    recommended: true,
    features: [
      { icon: Check, text: "실버 전체 포함", highlight: true },
      { icon: Video, text: "영상 유언장 녹화", highlight: true },
      { icon: ScanLine, text: "자필 유언장 스캔 인증", highlight: true },
      { icon: PenLine, text: "AI 일기 (Life Story)" },
      { icon: Mail, text: "가족 편지 서비스" },
      { icon: PenLine, text: "유언장 수정 3회 무료" },
      { icon: HardDrive, text: "3년 보관" },
    ],
    productKey: "membership_gold",
  },
  {
    grade: "platinum",
    name: "플래티넘",
    subtitle: "장기 보관 + 문서 발급",
    price: 168000,
    color: "text-blue-600",
    bgGradient: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200 hover:border-blue-400",
    icon: Crown,
    features: [
      { icon: Check, text: "골드 전체 포함", highlight: true },
      { icon: PenLine, text: "유언장 수정 5회 무료", highlight: true },
      { icon: HardDrive, text: "5년 보관", highlight: true },
      { icon: FileText, text: "공식 인증 통합 문서 발급 1회 무료" },
    ],
    productKey: "membership_platinum",
  },
  {
    grade: "vip",
    name: "VIP",
    subtitle: "올인원 · 영구 · 무제한",
    price: 199000,
    color: "text-purple-600",
    bgGradient: "from-purple-50 to-fuchsia-50",
    borderColor: "border-purple-200 hover:border-purple-500",
    icon: Sparkles,
    features: [
      { icon: Check, text: "플래티넘 전체 포함", highlight: true },
      { icon: Infinity, text: "유언장 수정 무제한", highlight: true },
      { icon: HardDrive, text: "영구 보관", highlight: true },
      { icon: FileText, text: "공식 인증 통합 문서 무제한 발급", highlight: true },
      { icon: Scale, text: "변호사 사후 집행 우선 배정", highlight: true },
    ],
    productKey: "membership_vip",
  },
];

export default function PaymentsPage() {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState<MemberGrade | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (card: MembershipCard) => {
    setIsLoading(true);
    setSelectedGrade(card.grade);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ key: card.productKey, quantity: 1 }],
          customerName: user?.name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "결제 세션 생성 실패");
      toast.success("결제 페이지로 이동합니다...");
      window.open(data.url, "_blank");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "결제 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setSelectedGrade(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1
          className="text-3xl font-bold text-[#1F3864]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          멤버십 선택
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          나에게 맞는 플랜을 선택하고 바로 결제하세요. 유언장 작성은 무료입니다.
        </p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" />Stripe 보안 결제</span>
          <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />195개국 지원</span>
          <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" />카드·Google Pay·Apple Pay</span>
        </div>
      </div>

      {/* 4가지 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {CARDS.map((card, idx) => {
          const CardIcon = card.icon;
          const isSelected = selectedGrade === card.grade;
          return (
            <motion.div
              key={card.grade}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-gradient-to-br ${card.bgGradient} rounded-2xl border-2 ${card.borderColor} p-5 flex flex-col transition-all duration-300 ${
                card.recommended ? "ring-2 ring-[#C9A961] ring-offset-2" : ""
              }`}
            >
              {/* 추천 배지 */}
              {card.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#C9A961] text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    추천
                  </span>
                </div>
              )}

              {/* 카드 헤더 */}
              <div className="text-center pt-2 pb-4 border-b border-white/50">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm mb-3 ${card.color}`}>
                  <CardIcon className="w-6 h-6" />
                </div>
                <h3 className={`text-xl font-bold ${card.color}`}>{card.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{card.subtitle}</p>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-[#1F3864]">
                    ₩{card.price.toLocaleString()}
                  </span>
                  {card.originalPrice && (
                    <span className="text-sm text-gray-400 line-through ml-2">
                      ₩{card.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">1회 결제 (구독 아님)</p>
                </div>
              </div>

              {/* 기능 목록 */}
              <div className="flex-1 py-4 space-y-2.5">
                {card.features.map((feature, i) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-2 text-sm ${
                        feature.highlight ? "font-semibold text-[#1F3864]" : "text-gray-600"
                      }`}
                    >
                      <FeatureIcon className={`w-4 h-4 mt-0.5 shrink-0 ${feature.highlight ? "text-[#C9A961]" : "text-gray-400"}`} />
                      <span>{feature.text}</span>
                    </div>
                  );
                })}
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={() => handleCheckout(card)}
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all mt-auto ${
                  card.recommended
                    ? "bg-[#C9A961] hover:bg-[#b8944f] text-white shadow-lg hover:shadow-xl"
                    : "bg-[#1F3864] hover:bg-[#162b4d] text-white shadow-md hover:shadow-lg"
                } ${isLoading && isSelected ? "opacity-70 cursor-wait" : ""}`}
              >
                {isLoading && isSelected ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />처리 중...</>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    선택 · 결제하기
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* 하단 안내 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-3">
        <h3 className="font-bold text-[#1F3864] text-sm">알아두세요</h3>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-gray-500">
          <div>
            <p className="font-semibold text-[#1F3864] mb-1">무료 유언장 작성</p>
            <p>회원가입만으로 AI 유언장 초안을 무료로 작성할 수 있습니다.</p>
          </div>
          <div>
            <p className="font-semibold text-[#1F3864] mb-1">업그레이드 가능</p>
            <p>차액 + ₩5,000 수수료로 언제든 상위 등급으로 업그레이드됩니다.</p>
          </div>
          <div>
            <p className="font-semibold text-[#1F3864] mb-1">테스트 결제</p>
            <p>테스트 카드: 4242 4242 4242 4242</p>
          </div>
        </div>
      </div>
    </div>
  );
}
