/**
 * GradeGate - 멤버십 등급 기반 접근 제어 컴포넌트
 *
 * 사용법:
 * <GradeGate requiredGrade="silver" featureName="전자 인증">
 *   <MyFeatureContent />
 * </GradeGate>
 *
 * 등급이 부족하면 잠금 오버레이 + 업그레이드 안내 팝업을 표시합니다.
 */

import { useState } from "react";
import { Lock, Crown, ChevronRight, X, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { MemberGrade } from "../../../shared/membershipProducts";
import { MEMBERSHIP_PLANS, GRADE_ORDER, calculateUpgradePrice } from "../../../shared/membershipProducts";

/** 등급별 한국어 라벨 */
const GRADE_LABELS: Record<MemberGrade, string> = {
  general: "무료",
  silver: "실버",
  gold: "골드",
  platinum: "플래티넘",
  vip: "VIP",
};

/** 등급별 색상 */
const GRADE_COLORS: Record<MemberGrade, { bg: string; text: string; border: string; gradient: string }> = {
  general: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300", gradient: "from-gray-400 to-gray-600" },
  silver:  { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-400", gradient: "from-slate-400 to-slate-600" },
  gold:    { bg: "bg-amber-50",  text: "text-amber-700", border: "border-amber-400", gradient: "from-amber-400 to-yellow-600" },
  platinum:{ bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-400", gradient: "from-purple-400 to-purple-700" },
  vip:     { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-400",    gradient: "from-red-500 to-rose-700" },
};

/** 등급 배지 이모지 */
const GRADE_BADGES: Record<MemberGrade, string> = {
  general: "👤",
  silver: "🥈",
  gold: "🥇",
  platinum: "💎",
  vip: "👑",
};

interface GradeGateProps {
  /** 이 기능에 필요한 최소 등급 */
  requiredGrade: MemberGrade;
  /** 기능 이름 (업그레이드 안내에 표시) */
  featureName: string;
  /** 잠금 시 표시할 설명 */
  description?: string;
  /** 자식 컴포넌트 (등급 충족 시 표시) */
  children: React.ReactNode;
  /** 잠금 표시 방식: overlay(오버레이) | redirect(페이지 전체 잠금) */
  mode?: "overlay" | "block";
  /** 추가 클래스 */
  className?: string;
}

export function GradeGate({
  requiredGrade,
  featureName,
  description,
  children,
  mode = "overlay",
  className,
}: GradeGateProps) {
  const { isAuthenticated } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // DB에서 직접 user 정보 조회 (role 포함)
  const { data: meData } = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 현재 사용자 등급 조회
  const { data: gradeData } = trpc.memberGrade.getMyGrade.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const currentGrade = (gradeData?.grade as MemberGrade) ?? "general";
  const currentRank = GRADE_ORDER[currentGrade];
  const requiredRank = GRADE_ORDER[requiredGrade];
  // 관리자는 모든 등급 제한 우회
  const isAdmin = (meData as any)?.role === "admin";
  const hasAccess = isAdmin || currentRank >= requiredRank;

  // 등급 충족 시 그냥 렌더링
  if (hasAccess) {
    return <>{children}</>;
  }

  // 업그레이드 대상 플랜들 (현재 등급보다 높은 것들)
  const upgradePlans = MEMBERSHIP_PLANS.filter(
    (p) => GRADE_ORDER[p.grade] >= requiredRank
  );

  // block 모드: 페이지 전체를 잠금 화면으로 교체
  if (mode === "block") {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[60vh] px-4", className)}>
        <UpgradeBanner
          currentGrade={currentGrade}
          requiredGrade={requiredGrade}
          featureName={featureName}
          description={description}
          onUpgrade={() => setShowUpgradeModal(true)}
        />
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentGrade={currentGrade}
          upgradePlans={upgradePlans}
          featureName={featureName}
        />
      </div>
    );
  }

  // overlay 모드: 자식 위에 반투명 오버레이
  return (
    <div className={cn("relative", className)}>
      {/* 흐린 배경으로 자식 렌더링 */}
      <div className="pointer-events-none select-none blur-sm opacity-40">
        {children}
      </div>

      {/* 잠금 오버레이 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl z-10">
        <UpgradeBanner
          currentGrade={currentGrade}
          requiredGrade={requiredGrade}
          featureName={featureName}
          description={description}
          onUpgrade={() => setShowUpgradeModal(true)}
          compact
        />
      </div>

      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentGrade={currentGrade}
        upgradePlans={upgradePlans}
        featureName={featureName}
      />
    </div>
  );
}

/** 업그레이드 안내 배너 */
function UpgradeBanner({
  currentGrade,
  requiredGrade,
  featureName,
  description,
  onUpgrade,
  compact = false,
}: {
  currentGrade: MemberGrade;
  requiredGrade: MemberGrade;
  featureName: string;
  description?: string;
  onUpgrade: () => void;
  compact?: boolean;
}) {
  const reqColor = GRADE_COLORS[requiredGrade];
  const reqLabel = GRADE_LABELS[requiredGrade];
  const reqBadge = GRADE_BADGES[requiredGrade];

  return (
    <div className={cn("flex flex-col items-center text-center gap-4", compact ? "p-4 max-w-xs" : "p-8 max-w-md")}>
      {/* 잠금 아이콘 */}
      <div className={cn(
        "rounded-full p-3 bg-gradient-to-br",
        reqColor.gradient,
        compact ? "w-12 h-12" : "w-16 h-16",
        "flex items-center justify-center"
      )}>
        <Lock className={cn("text-white", compact ? "w-5 h-5" : "w-7 h-7")} />
      </div>

      {/* 제목 */}
      <div>
        <h3 className={cn("font-bold text-gray-900", compact ? "text-base" : "text-xl")}>
          {featureName}
        </h3>
        <p className={cn("text-gray-500 mt-1", compact ? "text-xs" : "text-sm")}>
          {description || `이 기능은 ${reqBadge} ${reqLabel} 이상 회원만 이용할 수 있습니다.`}
        </p>
      </div>

      {/* 현재 등급 → 필요 등급 */}
      {!compact && (
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
            {GRADE_BADGES[currentGrade]} {GRADE_LABELS[currentGrade]}
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className={cn("px-2 py-1 rounded-full font-medium", reqColor.bg, reqColor.text)}>
            {reqBadge} {reqLabel}
          </span>
        </div>
      )}

      {/* 업그레이드 버튼 */}
      <Button
        onClick={onUpgrade}
        className={cn(
          "bg-gradient-to-r text-white font-semibold rounded-full shadow-md",
          `bg-gradient-to-r ${reqColor.gradient}`,
          compact ? "px-4 py-2 text-sm" : "px-6 py-2.5"
        )}
        style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
      >
        <Sparkles className="w-4 h-4 mr-1.5" />
        {compact ? "업그레이드" : `${reqBadge} ${reqLabel}으로 업그레이드`}
      </Button>
    </div>
  );
}

/** 업그레이드 선택 모달 */
function UpgradeModal({
  open,
  onClose,
  currentGrade,
  upgradePlans,
  featureName,
}: {
  open: boolean;
  onClose: () => void;
  currentGrade: MemberGrade;
  upgradePlans: typeof MEMBERSHIP_PLANS;
  featureName: string;
}) {
  const [selectedGrade, setSelectedGrade] = useState<MemberGrade | null>(
    upgradePlans[0]?.grade ?? null
  );

  // Stripe 결제 뮤테이션
  const createCheckout = trpc.memberGrade.createUpgradeCheckout.useMutation({
    onSuccess: (data: { checkoutUrl?: string | null; sessionId?: string }) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        onClose();
      }
    },
  });

  const selectedPlan = upgradePlans.find((p) => p.grade === selectedGrade);
  const upgradePrice = selectedGrade
    ? calculateUpgradePrice(currentGrade, selectedGrade)
    : null;

  const handlePay = () => {
    if (!selectedGrade) return;
    createCheckout.mutate({
      targetGrade: selectedGrade as "silver" | "gold" | "platinum" | "vip",
      origin: window.location.origin,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-[#1F3864] to-[#2d4f8a] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold text-white">멤버십 업그레이드</DialogTitle>
              <p className="text-sm text-blue-200 mt-0.5">{featureName} 기능을 이용하려면 업그레이드가 필요합니다</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 등급 선택 */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {upgradePlans.map((plan) => {
            const upPrice = calculateUpgradePrice(currentGrade, plan.grade);
            const color = GRADE_COLORS[plan.grade];
            const isSelected = selectedGrade === plan.grade;

            return (
              <button
                key={plan.grade}
                onClick={() => setSelectedGrade(plan.grade)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-4 transition-all",
                  isSelected ? `${color.border} ${color.bg}` : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{GRADE_BADGES[plan.grade]}</span>
                      <span className={cn("font-bold text-base", isSelected ? color.text : "text-gray-800")}>
                        {plan.nameKo}
                      </span>
                      {plan.popular && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          인기
                        </span>
                      )}
                    </div>
                    {/* 주요 기능 3개만 표시 */}
                    <ul className="space-y-0.5">
                      {plan.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-xs text-gray-400">+{plan.features.length - 3}개 더</li>
                      )}
                    </ul>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {upPrice && upPrice.diff > 0 ? (
                      <>
                        <p className="text-xs text-gray-400 line-through">₩{plan.price.toLocaleString()}</p>
                        <p className={cn("font-bold text-lg", isSelected ? color.text : "text-gray-800")}>
                          ₩{upPrice.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">차액 + 수수료 ₩5,000</p>
                      </>
                    ) : (
                      <p className={cn("font-bold text-lg", isSelected ? color.text : "text-gray-800")}>
                        ₩{plan.price.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 결제 버튼 */}
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          <Button
            onClick={handlePay}
            disabled={!selectedGrade || createCheckout.isPending}
            className="w-full bg-[#C9A961] hover:bg-[#b8983f] text-[#1F3864] font-bold rounded-full py-3 text-base"
          >
            {createCheckout.isPending ? (
              "결제 페이지 이동 중..."
            ) : selectedPlan ? (
              <>
                <Crown className="w-4 h-4 mr-2" />
                {GRADE_BADGES[selectedPlan.grade]} {selectedPlan.nameKo} 결제하기
                {upgradePrice && ` · ₩${upgradePrice.total.toLocaleString()}`}
              </>
            ) : (
              "등급을 선택해주세요"
            )}
          </Button>
          <p className="text-center text-xs text-gray-400 mt-2">
            결제 완료 즉시 등급이 업그레이드됩니다
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 기능 버튼 클릭 시 등급 체크 후 업그레이드 안내 (버튼 래퍼)
 *
 * 사용법:
 * <GradeGateButton requiredGrade="gold" featureName="영상 유언장" onClick={handleRecord}>
 *   <button>녹화 시작</button>
 * </GradeGateButton>
 */
export function GradeGateButton({
  requiredGrade,
  featureName,
  description,
  onClick,
  children,
  className,
}: {
  requiredGrade: MemberGrade;
  featureName: string;
  description?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  // DB에서 직접 user 정보 조회 (role 포함)
  const { data: meData } = trpc.auth.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: gradeData } = trpc.memberGrade.getMyGrade.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const currentGrade = (gradeData?.grade as MemberGrade) ?? "general";
  const currentRank = GRADE_ORDER[currentGrade];
  const requiredRank = GRADE_ORDER[requiredGrade];
  // 관리자는 모든 등급 제한 우회
  const isAdminUser = (meData as any)?.role === "admin";
  const hasAccess = isAdminUser || currentRank >= requiredRank;

  const upgradePlans = MEMBERSHIP_PLANS.filter(
    (p) => GRADE_ORDER[p.grade] >= requiredRank
  );

  const handleClick = () => {
    if (hasAccess) {
      onClick?.();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div onClick={handleClick} className={cn("cursor-pointer", className)}>
        {children}
      </div>
      <UpgradeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        currentGrade={currentGrade}
        upgradePlans={upgradePlans}
        featureName={featureName}
      />
    </>
  );
}
