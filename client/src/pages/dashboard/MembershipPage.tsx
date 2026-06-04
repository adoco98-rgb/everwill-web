/**
 * 멤버십 카드 선택 + 승급 자동 계산 결제 화면
 * - 현재 등급 표시
 * - 상위 등급 카드 선택 시 차액 + 수수료 자동 계산
 * - Stripe 체크아웃으로 결제
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, Shield, ArrowRight, Loader2 } from "lucide-react";
import { MEMBERSHIP_PLANS, GRADE_ORDER, calculateUpgradePrice, type MemberGrade } from "@shared/membershipProducts";

/** 등급별 카드 아이콘 */
const GRADE_ICONS: Record<string, React.ReactNode> = {
  silver: <Shield className="w-6 h-6" />,
  gold: <Star className="w-6 h-6" />,
  platinum: <Zap className="w-6 h-6" />,
  vip: <Crown className="w-6 h-6" />,
};

/** 등급별 카드 그라디언트 */
const CARD_GRADIENTS: Record<string, string> = {
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-amber-600",
  platinum: "from-purple-400 to-violet-700",
  vip: "from-yellow-500 to-amber-900",
};

/** 등급별 배경 색상 */
const CARD_BG: Record<string, string> = {
  silver: "bg-slate-900 border-slate-500",
  gold: "bg-amber-950 border-amber-500",
  platinum: "bg-violet-950 border-violet-500",
  vip: "bg-amber-950 border-yellow-500",
};

/** 등급별 버튼 색상 */
const BTN_COLORS: Record<string, string> = {
  silver: "bg-slate-500 hover:bg-slate-400 text-white",
  gold: "bg-amber-500 hover:bg-amber-400 text-white",
  platinum: "bg-violet-600 hover:bg-violet-500 text-white",
  vip: "bg-yellow-500 hover:bg-yellow-400 text-black",
};

export default function MembershipPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<MemberGrade | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  // 내 등급 조회
  const { data: gradeData, isLoading, refetch } = trpc.memberGrade.getMyGrade.useQuery();

  // 결제 완료 후 등급 재계산
  const recalculate = trpc.memberGrade.recalculate.useMutation({
    onSuccess: () => {
      refetch();
      setToastMsg("등급이 업데이트됐습니다! 새로운 멤버십 혜택을 이용하세요.");
    },
  });

  // URL 파라미터로 결제 완료 감지
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "success") {
      recalculate.mutate();
      // URL 정리
      window.history.replaceState({}, "", "/dashboard/membership");
    }
  }, []);

  // 승급 체크아웃 생성
  const createCheckout = trpc.memberGrade.createUpgradeCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        setToastMsg("결제 페이지로 이동합니다. 결제 완료 후 자동으로 등급이 업그레이드됩니다.");
      }
      setCheckingOut(false);
    },
    onError: (err) => {
      setToastMsg(`오류: ${err.message}`);
      setCheckingOut(false);
    },
  });

  const handleSelectGrade = (grade: MemberGrade) => {
    if (!gradeData) return;
    const currentGrade = gradeData.grade as MemberGrade;
    if (GRADE_ORDER[grade] <= GRADE_ORDER[currentGrade]) return; // 하위 등급 선택 불가
    setSelectedGrade(grade === selectedGrade ? null : grade);
  };

  const handleCheckout = () => {
    if (!selectedGrade) return;
    setCheckingOut(true);
    createCheckout.mutate({
        targetGrade: selectedGrade as "silver" | "gold" | "platinum" | "vip",
      origin: window.location.origin,
    });
  };

  /** 선택한 등급의 결제 금액 계산 */
  const getUpgradeAmount = (targetGrade: MemberGrade) => {
    if (!gradeData) return null;
    const currentGrade = gradeData.grade as MemberGrade;
    if (currentGrade === "general") {
      const plan = MEMBERSHIP_PLANS.find((p) => p.grade === targetGrade);
      return plan ? { diff: plan.price, fee: 0, total: plan.price } : null;
    }
    return calculateUpgradePrice(currentGrade, targetGrade);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const currentGrade = (gradeData?.grade ?? "general") as MemberGrade;
  const currentPlan = MEMBERSHIP_PLANS.find((p) => p.grade === currentGrade);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 현재 등급 */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#1F3864] mb-2">멤버십 카드</h1>
        <p className="text-gray-500 mb-4">NFC 인증 카드로 언제 어디서나 유언을 증명하세요</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F3864] text-white text-sm font-medium">
          <span>{gradeData?.badge}</span>
          <span>현재 등급: {gradeData?.label}</span>
          {currentGrade !== "general" && (
            <Badge className="bg-amber-500 text-white text-xs ml-1">활성</Badge>
          )}
        </div>
      </div>

      {/* 멤버십 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {MEMBERSHIP_PLANS.map((plan) => {
          const isCurrentGrade = plan.grade === currentGrade;
          const isLowerGrade = GRADE_ORDER[plan.grade] < GRADE_ORDER[currentGrade];
          const isSelected = selectedGrade === plan.grade;
          const upgradeAmount = getUpgradeAmount(plan.grade);

          return (
            <div
              key={plan.grade}
              onClick={() => handleSelectGrade(plan.grade)}
              className={`
                relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200
                ${CARD_BG[plan.grade]}
                ${isSelected ? "border-white scale-105 shadow-2xl" : ""}
                ${isCurrentGrade ? "opacity-100 cursor-default" : ""}
                ${isLowerGrade ? "opacity-40 cursor-not-allowed" : "hover:scale-102 hover:shadow-xl"}
                ${plan.popular ? "ring-2 ring-amber-400" : ""}
              `}
            >
              {/* 인기 배지 */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-black text-xs font-bold rounded-full">
                  인기
                </div>
              )}

              {/* 현재 등급 배지 */}
              {isCurrentGrade && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  현재 등급
                </div>
              )}

              {/* 선택 체크 */}
              {isSelected && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}

              {/* 카드 미리보기 */}
              <div className={`w-full h-20 rounded-xl bg-gradient-to-br ${CARD_GRADIENTS[plan.grade]} mb-4 flex items-center justify-between px-4`}>
                <div>
                  <p className="text-white/70 text-xs font-medium">{plan.name}</p>
                  <p className="text-white font-bold text-sm">EverWill</p>
                </div>
                <div className="text-white/80">
                  {GRADE_ICONS[plan.grade]}
                </div>
              </div>

              {/* 등급명 */}
              <div className="mb-1">
                <span className="text-gray-400 text-xs uppercase tracking-wider">{plan.name}</span>
                <h3 className="text-white font-bold text-lg">{plan.nameKo}</h3>
              </div>

              {/* 가격 */}
              <div className="mb-4">
                {isLowerGrade || isCurrentGrade ? (
                  <p className="text-2xl font-bold text-white">
                    ₩{plan.price.toLocaleString()}
                  </p>
                ) : upgradeAmount ? (
                  <div>
                    <p className="text-2xl font-bold text-white">
                      ₩{upgradeAmount.total.toLocaleString()}
                    </p>
                    {upgradeAmount.fee > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        차액 ₩{upgradeAmount.diff.toLocaleString()} + 수수료 ₩{upgradeAmount.fee.toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-white">₩{plan.price.toLocaleString()}</p>
                )}
                <p className="text-gray-400 text-xs">/ 1회</p>
              </div>

              {/* 보관 기간 */}
              <div className="mb-4 text-xs text-gray-300">
                {plan.storageYears === null ? "영구 보관" : `${plan.storageYears}년 보관`}
              </div>

              {/* 기능 목록 */}
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                    <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* 선택된 등급 결제 요약 */}
      {selectedGrade && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-4 z-50 lg:relative lg:border lg:rounded-2xl lg:shadow-none lg:mb-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {(() => {
                const plan = MEMBERSHIP_PLANS.find((p) => p.grade === selectedGrade)!;
                const amount = getUpgradeAmount(selectedGrade);
                return (
                  <div>
                    <p className="font-bold text-[#1F3864] text-lg">
                      {gradeData?.label} → EverWill {plan.name}
                    </p>
                    {amount && (
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        {amount.fee > 0 && (
                          <>
                            <span>차액 ₩{amount.diff.toLocaleString()}</span>
                            <span>+</span>
                            <span>수수료 ₩{amount.fee.toLocaleString()}</span>
                            <span>=</span>
                          </>
                        )}
                        <span className="text-2xl font-bold text-[#1F3864]">
                          ₩{amount.total.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedGrade(null)}
                className="border-gray-300"
              >
                취소
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="bg-[#C9A961] hover:bg-[#b8933f] text-white px-8 py-3 text-base font-bold"
              >
                {checkingOut ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> 처리 중...</>
                ) : (
                  <>지금 신청하기 <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 무료회원 안내 */}
      {currentGrade === "general" && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
          <strong>무료회원</strong>으로 개인인증·자산등록·상속자등록·유언장 작성까지 무료로 이용하실 수 있습니다.
          멤버십 카드를 구매하시면 전자인증서 발급, NFC 카드, 유언 보관 서비스를 이용하실 수 있습니다.
        </div>
      )}
    </div>
  );
}
