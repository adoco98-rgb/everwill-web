/**
 * 유언장 수정 게이트 페이지 (/dashboard/wills/:willId/revise)
 * - 인증 완료된 유언장 수정 시 진입
 * - 무료 수정 횟수 확인 → 무료면 바로 수정, 유료면 ₩15,000 결제 후 수정
 */
import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  CheckCircle2,
  AlertTriangle,
  Infinity as InfinityIcon,
  ArrowLeft,
  Loader2,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function WillRevisionPage() {
  const [, params] = useRoute("/dashboard/wills/:willId/revise");
  const willId = params?.willId ? parseInt(params.willId) : null;
  const [, navigate] = useLocation();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // 수정 가능 여부 조회
  const { data: revisionStatus, isLoading } = trpc.will.checkRevisionStatus.useQuery(
    { willId: willId! },
    { enabled: !!willId }
  );

  const handleFreeRevision = () => {
    // 무료 수정: 바로 write 페이지로 이동
    navigate(`/write?willId=${willId}&revision=free`);
  };

  const handlePaidRevision = async () => {
    // 유료 수정: Stripe 결제 후 수정
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [{ key: "will_revision", quantity: 1 }],
          metadata: { willId: willId?.toString() },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "결제 세션 생성 실패");
      toast.success("Stripe 결제 페이지로 이동합니다...");
      // 결제 완료 후 /write?willId=...&revision=paid&session_id=...로 리다이렉트
      window.open(data.url, "_blank");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "결제 오류";
      toast.error(msg);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!willId) {
    return (
      <div className="p-8 text-center text-gray-400">
        잘못된 접근입니다.
        <Link href="/dashboard/wills" className="block mt-4 text-[#1F3864] underline">목록으로</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F3864]" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* 뒤로가기 */}
      <Link href="/dashboard/wills" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#1F3864] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        유언장 목록으로
      </Link>

      <h1 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        유언장 수정
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        인증 완료된 유언장을 수정하려면 재인증이 필요합니다.
      </p>

      {/* 현재 수정 횟수 현황 */}
      <Card className="mb-6 border-[#1F3864]/20">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
              <Edit className="w-5 h-5 text-[#1F3864]" />
            </div>
            <div>
              <div className="font-bold text-[#1F3864] text-sm">{revisionStatus?.planLabel}</div>
              <div className="text-xs text-gray-400">현재 플랜</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-[#FAFAF8] rounded-xl">
              <div className="text-lg font-bold text-[#1F3864]">
                {revisionStatus?.isUnlimited ? <InfinityIcon className="w-5 h-5 mx-auto" /> : revisionStatus?.freeRevisionCount}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">무료 수정 총 횟수</div>
            </div>
            <div className="text-center p-3 bg-[#FAFAF8] rounded-xl">
              <div className="text-lg font-bold text-amber-600">{revisionStatus?.usedFreeRevisions ?? 0}</div>
              <div className="text-xs text-gray-400 mt-0.5">사용한 횟수</div>
            </div>
            <div className="text-center p-3 bg-[#FAFAF8] rounded-xl">
              <div className={`text-lg font-bold ${(revisionStatus?.remainingFree ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {revisionStatus?.isUnlimited ? <InfinityIcon className="w-5 h-5 mx-auto text-emerald-600" /> : revisionStatus?.remainingFree}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">남은 무료 횟수</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 수정 방법 선택 */}
      {revisionStatus?.needsPayment ? (
        /* 유료 수정 필요 */
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">무료 수정 횟수를 모두 사용하셨습니다.</p>
              <p className="text-xs text-amber-700 mt-1">
                이번 수정은 <strong>₩15,000</strong>이 결제됩니다.
                결제 완료 후 수정 페이지로 이동합니다.
              </p>
            </div>
          </div>

          <Button
            onClick={handlePaidRevision}
            disabled={isCheckingOut}
            className="w-full bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {isCheckingOut ? (
              <><Loader2 className="w-4 h-4 animate-spin" />결제 중...</>
            ) : (
              <><CreditCard className="w-4 h-4" />₩15,000 결제 후 수정하기</>
            )}
          </Button>

          <p className="text-xs text-gray-400 text-center">
            더 많은 무료 수정을 원하시면{" "}
            <Link href="/payment" className="text-[#1F3864] underline">영구 보관 플랜</Link>으로 업그레이드하세요.
          </p>
        </div>
      ) : (
        /* 무료 수정 가능 */
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">무료 수정 가능합니다.</p>
              <p className="text-xs text-emerald-700 mt-1">
                {revisionStatus?.isUnlimited
                  ? "영구 보관 플랜으로 무제한 무료 수정이 가능합니다."
                  : `남은 무료 수정 횟수: ${revisionStatus?.remainingFree}회`}
              </p>
            </div>
          </div>

          <Button
            onClick={handleFreeRevision}
            className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Edit className="w-4 h-4" />
            무료로 수정하기
          </Button>
        </div>
      )}

      {/* 수정 후 재인증 안내 */}
      <div className="mt-6 p-4 bg-[#1F3864]/5 rounded-xl border border-[#1F3864]/10">
        <p className="text-xs text-[#1F3864]/70 leading-relaxed">
          <strong>안내:</strong> 수정 후 유언장은 <strong>초안 상태</strong>로 변경됩니다.
          효력을 유지하려면 수정 완료 후 재인증이 필요합니다.
        </p>
      </div>
    </div>
  );
}
