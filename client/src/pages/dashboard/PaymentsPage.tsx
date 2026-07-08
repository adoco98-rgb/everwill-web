/**
 * EverWill 결제하기 페이지 (/dashboard/payments)
 * 단일 상품 ₩168,000 (모든 서비스 포함) + 노인복지후원 결제창
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Check,
  Shield,
  ArrowRight,
  Loader2,
  FileText,
  Video,
  ScanLine,
  PenLine,
  HardDrive,
  Heart,
  Globe,
  BadgeCheck,
  Award,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const DONATION_AMOUNTS = [5000, 10000, 30000, 50000, 100000];

export default function PaymentsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"main" | "donation" | null>(null);
  const [donationAmount, setDonationAmount] = useState<number>(10000);
  const [customDonation, setCustomDonation] = useState("");

  const handleMainCheckout = async () => {
    setIsLoading(true);
    setLoadingType("main");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ key: "membership_silver", quantity: 1 }],
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
      setLoadingType(null);
    }
  };

  const handleDonationCheckout = async () => {
    const amount = customDonation ? parseInt(customDonation) : donationAmount;
    if (!amount || amount < 1000) {
      toast.error("후원 금액은 최소 1,000원 이상이어야 합니다.");
      return;
    }
    setIsLoading(true);
    setLoadingType("donation");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ key: "donation_elderly_welfare", quantity: 1, customAmount: amount }],
          customerName: user?.name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "결제 세션 생성 실패");
      toast.success("후원 결제 페이지로 이동합니다...");
      window.open(data.url, "_blank");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "결제 오류가 발생했습니다.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1
          className="text-3xl font-bold text-[#1F3864]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          EverWill 전자유언인증
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          ₩168,000 한 번 결제로 모든 서비스를 이용하세요.
        </p>
      </div>

      {/* ─── 메인 상품: ₩168,000 올인원 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border-2 border-[#C9A961] shadow-lg overflow-hidden"
      >
        {/* 상품 헤더 */}
        <div className="bg-gradient-to-r from-[#1F3864] to-[#2d4a7a] text-white px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BadgeCheck className="w-5 h-5 text-[#C9A961]" />
                <span className="text-[#C9A961] text-xs font-bold tracking-wider">ALL-IN-ONE</span>
              </div>
              <h2 className="text-2xl font-bold">전자유언인증 올인원</h2>
              <p className="text-white/60 text-sm mt-1">모든 서비스가 포함된 단일 상품</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#C9A961]">₩168,000</p>
              <p className="text-white/50 text-xs mt-1">1회 결제 · 구독 아님</p>
            </div>
          </div>
        </div>

        {/* 포함 서비스 목록 */}
        <div className="p-8">
          <h3 className="text-sm font-bold text-[#1F3864] mb-4">포함된 모든 서비스</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: FileText, text: "유언장 전자 인증 · 진정성 증명", highlight: true },
              { icon: Shield, text: "블록체인 해시 기록 · 타임스탬프" },
              { icon: Award, text: "공식 인증서 발급" },
              { icon: Video, text: "영상 유언장 녹화 · 보관", highlight: true },
              { icon: ScanLine, text: "자필 유언장 스캔 인증" },
              { icon: PenLine, text: "AI 유언장 작성 (무제한)" },
              { icon: Users, text: "상속인 등록 · 자산 등록" },
              { icon: FileText, text: "건강증명서 업로드" },
              { icon: PenLine, text: "유언장 수정 10회 무료" },
              { icon: HardDrive, text: "영구 보관 (평생)", highlight: true },
              { icon: PenLine, text: "AI 일기 (Life Story)" },
              { icon: Heart, text: "가족 편지 서비스" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 py-2 px-3 rounded-lg ${
                    item.highlight ? "bg-[#1F3864]/5" : ""
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    item.highlight ? "bg-[#C9A961]/20" : "bg-green-50"
                  }`}>
                    {item.highlight ? (
                      <Icon className="w-3 h-3 text-[#C9A961]" />
                    ) : (
                      <Check className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  <span className={`text-sm ${item.highlight ? "font-semibold text-[#1F3864]" : "text-gray-700"}`}>
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 결제 수단 안내 */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-3 font-medium">지원 결제 수단</p>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
                <Wallet className="w-3.5 h-3.5 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-700">카카오페이</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">신용카드</span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <Globe className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">계좌이체</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                <Shield className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Google Pay · Apple Pay</span>
              </div>
            </div>
          </div>

          {/* 결제 버튼 */}
          <button
            onClick={handleMainCheckout}
            disabled={isLoading}
            className="w-full mt-6 py-4 rounded-xl bg-[#C9A961] hover:bg-[#b8944f] text-[#1F3864] font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading && loadingType === "main" ? (
              <><Loader2 className="w-5 h-5 animate-spin" />결제 처리 중...</>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                ₩168,000 결제하고 인증 시작
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Stripe 보안 결제 · SSL 암호화 · 195개국 지원
          </p>
        </div>
      </motion.div>

      {/* ─── 노인복지후원 결제창 ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {/* 후원 이미지 */}
        <div className="relative h-48 overflow-hidden">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/elderly-welfare-donation-Z8CEAcyCGy5Sc6Uy7dqzsT.webp"
            alt="노인복지후원"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-rose-400" />
              <span className="text-white font-bold text-lg">노인복지후원</span>
            </div>
            <p className="text-white/80 text-xs">
              따뜻한 마음이 어르신들의 내일을 밝힙니다
            </p>
          </div>
        </div>

        {/* 후원 안내 */}
        <div className="p-6">
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-5">
            <p className="text-sm text-rose-800 leading-relaxed">
              <strong>노인복지후원금 안내</strong>
            </p>
            <p className="text-sm text-rose-700 leading-relaxed mt-1">
              후원금은 <strong>빈곤, 독거, 질환</strong> 등으로 어려움을 겪고 계신 어르신들의 복지를 위한
              <strong> 사회후원금</strong>으로 사용됩니다. 식사 지원, 의료비 보조, 돌봄 서비스, 주거 환경 개선 등
              어르신들의 삶의 질 향상을 위해 투명하게 운영됩니다.
            </p>
          </div>

          {/* 후원 금액 선택 */}
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-700 mb-3">후원 금액 선택</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {DONATION_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => { setDonationAmount(amount); setCustomDonation(""); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                    donationAmount === amount && !customDonation
                      ? "bg-rose-500 text-white border-rose-500 shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:bg-rose-50"
                  }`}
                >
                  ₩{amount.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="직접 입력 (원)"
                value={customDonation}
                onChange={(e) => setCustomDonation(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-300"
              />
              <span className="text-sm text-gray-400">원</span>
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="mb-5">
            <p className="text-xs text-gray-400 mb-2">후원 결제 수단</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded text-yellow-700">카카오페이</span>
              <span className="text-xs bg-blue-50 border border-blue-200 px-2.5 py-1 rounded text-blue-700">신용카드</span>
              <span className="text-xs bg-green-50 border border-green-200 px-2.5 py-1 rounded text-green-700">계좌이체</span>
            </div>
          </div>

          {/* 후원 버튼 */}
          <button
            onClick={handleDonationCheckout}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-wait"
          >
            {isLoading && loadingType === "donation" ? (
              <><Loader2 className="w-4 h-4 animate-spin" />처리 중...</>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                ₩{(customDonation ? parseInt(customDonation) || 0 : donationAmount).toLocaleString()} 후원하기
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            후원금은 EverWill 노인복지후원 운영위원회를 통해 투명하게 집행됩니다.
          </p>
        </div>
      </motion.div>

      {/* 하단 안내 */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 text-center space-y-2">
        <p className="text-xs text-gray-500">
          유언장 작성은 <strong className="text-[#1F3864]">무료</strong>입니다. 전자인증 결제 시 모든 서비스가 활성화됩니다.
        </p>
        <p className="text-xs text-gray-400">
          테스트 카드: 4242 4242 4242 4242 · Stripe 보안 결제
        </p>
      </div>
    </div>
  );
}
