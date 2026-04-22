/**
 * 결제 취소 페이지 (/payment/cancel)
 */
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { Link } from "wouter";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-br from-gray-700 to-gray-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-9 h-9 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            결제 취소됨
          </h1>
          <p className="text-white/60 text-sm">결제가 취소됐습니다. 언제든지 다시 시도할 수 있습니다.</p>
        </div>
        <div className="p-6 space-y-3">
          <Link href="/payment" className="w-full bg-[#C9A961] hover:bg-[#b8944f] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
              <RotateCcw className="w-4 h-4" />
              다시 결제하기
            </Link>
          <Link href="/" className="w-full border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:border-gray-300 transition-all">
              <ArrowLeft className="w-4 h-4" />
              홈으로 돌아가기
            </Link>
        </div>
      </div>
    </div>
  );
}
