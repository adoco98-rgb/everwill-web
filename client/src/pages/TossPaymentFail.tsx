/**
 * 토스페이먼츠 결제 실패 페이지 (/payment/toss/fail)
 */
import { Link } from "wouter";
import { XCircle } from "lucide-react";

export default function TossPaymentFail() {
  const params = new URLSearchParams(window.location.search);
  const message = params.get("message") || "결제가 취소되었습니다.";
  const code = params.get("code") || "";

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-9 h-9 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-700 mb-1">결제 취소</h1>
          <p className="text-gray-500 text-sm">{message}</p>
          {code && <p className="text-xs text-gray-400 mt-1">코드: {code}</p>}
        </div>
        <div className="p-6 space-y-3">
          <Link
            href="/payment/toss"
            className="w-full bg-[#1F3864] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#2d4f8a]"
          >
            다시 결제하기
          </Link>
          <Link
            href="/"
            className="w-full border border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
