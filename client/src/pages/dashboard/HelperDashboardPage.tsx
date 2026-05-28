/**
 * 헬퍼 대시보드 페이지
 * - 판매 코드 확인 및 복사
 * - 커미션 등급 및 누적 매출 현황
 * - 커미션 내역 목록
 * - 정산 요청 (계좌 입력 → 3.3% 공제 미리보기 → 요청)
 */
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  Copy, TrendingUp, DollarSign, Clock, CheckCircle,
  ChevronRight, Banknote, AlertCircle, Star, ArrowUpRight
} from "lucide-react";

function formatKRW(n: number) {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(0)}만원`;
  return `${n.toLocaleString()}원`;
}

function formatDate(d: Date | string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

/** 커미션 등급 라벨 */
function getGradeLabel(rate: number) {
  if (rate >= 30) return { label: "플래티넘", color: "text-purple-600", bg: "bg-purple-50" };
  if (rate >= 25) return { label: "골드", color: "text-yellow-600", bg: "bg-yellow-50" };
  if (rate >= 20) return { label: "실버", color: "text-blue-600", bg: "bg-blue-50" };
  return { label: "기본", color: "text-gray-600", bg: "bg-gray-100" };
}

/** 다음 등급까지 남은 매출 */
function getNextTier(totalSales: number) {
  if (totalSales >= 50_000_000) return null;
  if (totalSales >= 20_000_000) return { next: "플래티넘 30%", remain: 50_000_000 - totalSales, target: 50_000_000 };
  if (totalSales >= 5_000_000) return { next: "골드 25%", remain: 20_000_000 - totalSales, target: 20_000_000 };
  return { next: "실버 20%", remain: 5_000_000 - totalSales, target: 5_000_000 };
}

export default function HelperDashboardPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data, refetch } = trpc.helper.getMyStatus.useQuery();

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const payoutMutation = trpc.helper.requestPayout.useMutation({
    onSuccess: (result) => {
      toast.success(
        `정산 요청 완료! 세전 ${formatKRW(result.grossAmount)} → 실지급 ${formatKRW(result.netAmount)} (3.3% 공제)`
      );
      setShowPayoutModal(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 헬퍼 미신청
  if (!data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <Star className="w-14 h-14 text-[#C9A961] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">헬퍼 신청이 필요합니다</h2>
        <p className="text-gray-500 text-sm mb-6">EverWill 서비스를 판매하고 커미션을 받으세요.</p>
        <button
          onClick={() => navigate("/dashboard/helper-apply")}
          className="px-8 py-3 bg-[#1F3864] text-white rounded-xl font-semibold"
        >
          헬퍼 신청하기
        </button>
      </div>
    );
  }

  // 승인 대기 / 거절
  if (data.helper.status !== "approved") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <Clock className="w-14 h-14 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {data.helper.status === "pending" ? "검토 중입니다" : "신청이 거절되었습니다"}
        </h2>
        <p className="text-gray-500 text-sm">
          {data.helper.status === "pending"
            ? "관리자 검토 후 승인 알림을 드립니다. (영업일 1~3일)"
            : data.helper.adminNote ?? "서류를 다시 확인 후 재신청해 주세요."}
        </p>
      </div>
    );
  }

  const { helper, commissions, pendingCommission } = data;
  const grade = getGradeLabel(helper.commissionRate);
  const nextTier = getNextTier(helper.totalSales);
  const grossAmount = pendingCommission;
  const taxAmount = Math.floor((grossAmount * 33) / 1000);
  const netAmount = grossAmount - taxAmount;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <span>마이페이지</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1F3864] font-medium">헬퍼 대시보드</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1F3864]">헬퍼 대시보드</h1>
      </div>

      {/* 판매 코드 카드 */}
      <div className="bg-[#1F3864] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white/70 text-sm">내 판매 코드</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${grade.bg} ${grade.color}`}>
            {grade.label} {helper.commissionRate}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-mono font-bold text-[#C9A961] tracking-widest">
            {helper.helperCode}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(helper.helperCode ?? "");
              toast.success("판매 코드가 복사되었습니다.");
            }}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
        <p className="text-white/50 text-xs mt-2">고객이 결제 시 이 코드를 입력하면 커미션이 자동 적립됩니다</p>
      </div>

      {/* 실적 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-800">{formatKRW(helper.totalSales)}</div>
          <div className="text-xs text-gray-500">누적 매출</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-800">{formatKRW(pendingCommission)}</div>
          <div className="text-xs text-gray-500">미정산 커미션</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <CheckCircle className="w-6 h-6 text-[#C9A961] mx-auto mb-1" />
          <div className="text-lg font-bold text-gray-800">{formatKRW(helper.totalPaidCommission)}</div>
          <div className="text-xs text-gray-500">총 지급액</div>
        </div>
      </div>

      {/* 다음 등급 진행률 */}
      {nextTier && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">다음 등급까지</span>
            <span className="text-sm text-[#1F3864] font-bold">{nextTier.next}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="bg-[#C9A961] h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (helper.totalSales / nextTier.target) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {formatKRW(nextTier.remain)} 더 판매하면 {nextTier.next} 달성
          </p>
        </div>
      )}

      {/* 정산 요청 버튼 */}
      {pendingCommission > 0 && (
        <button
          onClick={() => setShowPayoutModal(true)}
          className="w-full flex items-center justify-between px-6 py-4 bg-[#C9A961] text-white rounded-xl font-bold hover:bg-[#b8943f] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            정산 요청하기
          </span>
          <span className="text-sm font-normal">
            실지급 예상: {formatKRW(netAmount)}
          </span>
        </button>
      )}

      {/* 커미션 내역 */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">커미션 내역</h3>
          <span className="text-xs text-gray-400">최근 20건</span>
        </div>
        {commissions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            아직 커미션 내역이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {commissions.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-800">{c.productName}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{formatDate(c.createdAt)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">+{formatKRW(c.commissionAmount)}</div>
                  <div className="text-xs text-gray-400">{c.commissionRate}% / {formatKRW(c.saleAmount)}</div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${c.payoutStatus === "paid" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-600"}`}>
                    {c.payoutStatus === "paid" ? "정산완료" : "미정산"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 정산 요청 모달 */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">정산 요청</h3>

            {/* 금액 미리보기 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">커미션 세전</span>
                <span className="font-semibold">{formatKRW(grossAmount)}</span>
              </div>
              <div className="flex justify-between text-red-500">
                <span>원천징수 3.3%</span>
                <span>-{formatKRW(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-[#1F3864] border-t border-gray-200 pt-2">
                <span>실지급액</span>
                <span className="text-lg">{formatKRW(netAmount)}</span>
              </div>
            </div>

            {/* 계좌 입력 */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">은행명</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="예: 국민은행"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">계좌번호</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="예: 123-456-789012"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">예금주</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>원천징수 세금(3.3%)은 사업소득세로 국세청에 신고됩니다. 연말정산 시 환급 가능합니다.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!bankName || !accountNumber || !accountHolder) {
                    toast.error("계좌 정보를 모두 입력해 주세요.");
                    return;
                  }
                  payoutMutation.mutate({ bankName, accountNumber, accountHolder });
                }}
                disabled={payoutMutation.isPending}
                className="flex-1 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {payoutMutation.isPending ? "처리 중..." : "정산 요청"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
