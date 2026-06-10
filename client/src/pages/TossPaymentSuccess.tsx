/**
 * 토스페이먼츠 결제 성공 페이지 (/payment/toss/success)
 */
import { useEffect, useState } from "react";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

export default function TossPaymentSuccess() {
  const params = new URLSearchParams(window.location.search);
  const paymentKey = params.get("paymentKey") || "";
  const orderId = params.get("orderId") || "";
  const amount = parseInt(params.get("amount") || "0", 10);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const confirmMutation = trpc.tossPayment.confirmPayment.useMutation();

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    confirmMutation.mutateAsync({ paymentKey, orderId, amount })
      .then(() => setStatus("success"))
      .catch((err: unknown) => {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "결제 승인에 실패했습니다.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === "loading" && (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-[#1F3864] mx-auto mb-4" />
            <p className="text-gray-400 text-sm">결제를 승인하는 중...</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-[#1F3864] to-[#2d4f8a] p-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-[#C9A961]" />
              </div>
              <h1
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                결제 완료
              </h1>
              <p className="text-white/60 text-sm">EverWill 서비스가 활성화됐습니다.</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-[#FAFAF8] rounded-xl p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">결제 금액</p>
                <p className="text-2xl font-bold text-[#C9A961]">
                  ₩{amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">주문번호: {orderId}</p>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  href="/dashboard/wills"
                  className="w-full bg-[#C9A961] hover:bg-[#b8944f] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  내 유언장 확인 → PDF 출력
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/write"
                  className="w-full border-2 border-[#1F3864] text-[#1F3864] py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1F3864]/5 transition-all"
                >
                  새 유언장 작성
                </Link>
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-red-500 p-8 text-center">
              <h1 className="text-2xl font-bold text-white mb-1">결제 실패</h1>
              <p className="text-white/80 text-sm">{errorMsg}</p>
            </div>
            <div className="p-6">
              <Link
                href="/payment/toss"
                className="w-full bg-[#1F3864] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#2d4f8a]"
              >
                다시 결제하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
