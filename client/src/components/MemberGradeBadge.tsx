/**
 * 회원 등급 배지 컴포넌트
 * 대시보드 사이드바, 프로필 페이지 등에서 사용
 */
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

interface MemberGradeBadgeProps {
  /** 배지 크기 */
  size?: "sm" | "md" | "lg";
  /** 다음 등급 안내 표시 여부 */
  showNextInfo?: boolean;
  /** 추가 클래스 */
  className?: string;
}

const GRADE_STYLES: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  general: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-300",
    ring: "ring-gray-200",
  },
  silver: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-400",
    ring: "ring-slate-200",
  },
  gold: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-400",
    ring: "ring-amber-200",
  },
  platinum: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-400",
    ring: "ring-purple-200",
  },
  vip: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-400",
    ring: "ring-red-200",
  },
};

export function MemberGradeBadge({ size = "md", showNextInfo = false, className }: MemberGradeBadgeProps) {
  const { data, isLoading } = trpc.memberGrade.getMyGrade.useQuery();

  if (isLoading) {
    return (
      <div className={cn("animate-pulse rounded-full bg-gray-200", {
        "h-5 w-20": size === "sm",
        "h-6 w-28": size === "md",
        "h-8 w-36": size === "lg",
      }, className)} />
    );
  }

  if (!data) return null;

  const style = GRADE_STYLES[data.grade] ?? GRADE_STYLES.general;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* 배지 */}
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-semibold",
          style.bg,
          style.text,
          style.border,
          {
            "px-2 py-0.5 text-xs": size === "sm",
            "px-3 py-1 text-sm": size === "md",
            "px-4 py-1.5 text-base": size === "lg",
          }
        )}
      >
        <span>{data.badge}</span>
        <span>{data.label}</span>
      </div>

      {/* 다음 등급 안내 */}
      {showNextInfo && data.nextGradeInfo && (
        <p className="text-xs text-gray-500 leading-relaxed">
          {data.nextGradeInfo.requirement}
        </p>
      )}
    </div>
  );
}

/**
 * 등급 카드 (프로필 페이지용 - 더 상세한 정보 표시)
 */
export function MemberGradeCard({ className }: { className?: string }) {
  const { data, isLoading } = trpc.memberGrade.getMyGrade.useQuery();
  const recalculate = trpc.memberGrade.recalculate.useMutation({
    onSuccess: () => {
      // 재계산 후 자동 갱신
    },
  });

  if (isLoading) {
    return (
      <div className={cn("animate-pulse rounded-2xl bg-gray-100 h-40", className)} />
    );
  }

  if (!data) return null;

  const style = GRADE_STYLES[data.grade] ?? GRADE_STYLES.general;

  // 자산 포맷
  const formatAsset = (krw: number) => {
    if (krw >= 100_000_000) return `${(krw / 100_000_000).toFixed(1)}억 원`;
    if (krw >= 10_000) return `${(krw / 10_000).toFixed(0)}만 원`;
    return `${krw.toLocaleString()} 원`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl border-2 p-5 space-y-3",
        style.bg,
        style.border,
        className
      )}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{data.badge}</span>
          <div>
            <p className={cn("font-bold text-lg", style.text)}>{data.label}</p>
            <p className="text-xs text-gray-500">
              {data.gradeUpdatedAt
                ? `${new Date(data.gradeUpdatedAt).toLocaleDateString("ko-KR")} 승급`
                : "현재 등급"}
            </p>
          </div>
        </div>
        <button
          onClick={() => recalculate.mutate()}
          disabled={recalculate.isPending}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          {recalculate.isPending ? "계산 중..." : "등급 갱신"}
        </button>
      </div>

      {/* 자산 합계 */}
      {data.totalAssetKrw > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">등록 자산 합계</span>
          <span className={cn("font-semibold", style.text)}>
            {formatAsset(data.totalAssetKrw)}
          </span>
        </div>
      )}

      {/* 다음 등급 안내 */}
      {data.nextGradeInfo && (
        <div className="rounded-xl bg-white/60 p-3 text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-gray-700">다음 등급: {data.nextGradeInfo.nextLabel}</span>
          <br />
          {data.nextGradeInfo.requirement}
        </div>
      )}
    </div>
  );
}
