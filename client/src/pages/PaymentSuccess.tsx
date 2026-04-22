/**
 * 결제 성공 페이지 (/payment/success)
 */
import { useEffect, useState } from "react";
import { CheckCircle2, Download, ArrowRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SessionInfo {
  status: string;
  paymentStatus: string;
  customerEmail: string;
  amountTotal: number;
  currency: string;
  items: { name: string; amount: number; quantity: number }[];
}

export default function PaymentSuccess() {
  const [location] = useLocation();
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) { setLoading(false); return; }
    fetch(`/api/stripe/session/${sessionId}`)
      .then((r) => r.json())
      .then((data) => { setSession(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-[#1F3864] mx-auto mb-4" />
            <p className="text-gray-400 text-sm">결제 정보를 확인하는 중...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* 성공 헤더 */}
            <div className="bg-gradient-to-br from-[#1F3864] to-[#2d4f8a] p-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-[#C9A961]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                결제 완료
              </h1>
              <p className="text-white/60 text-sm">EverWill 서비스가 활성화됐습니다.</p>
            </div>

            {/* 결제 상세 */}
            <div className="p-6 space-y-4">
              {session && (
                <>
                  <div className="bg-[#FAFAF8] rounded-xl p-4 space-y-2">
                    {session.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-semibold text-[#1F3864]">
                          ₩{item.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-2 flex justify-between">
                      <span className="font-bold text-[#1F3864]">합계</span>
                      <span className="font-bold text-[#C9A961]">
                        ₩{session.amountTotal?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {session.customerEmail && (
                    <p className="text-xs text-gray-400 text-center">
                      영수증이 <strong>{session.customerEmail}</strong>로 발송됩니다.
                    </p>
                  )}
                </>
              )}

              <div className="space-y-3 pt-2">
                <Link href="/write" className="w-full bg-[#C9A961] hover:bg-[#b8944f] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
                    유언장 작성 시작하기
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                <Link href="/" className="w-full border-2 border-[#1F3864] text-[#1F3864] py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1F3864]/5 transition-all">
                    홈으로 돌아가기
                  </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
