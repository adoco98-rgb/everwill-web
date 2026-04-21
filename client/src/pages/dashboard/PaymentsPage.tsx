/**
 * EverWill 결제 내역 페이지 (/dashboard/payments)
 * DB에 저장된 결제 내역 조회
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle2, XCircle, Clock, ArrowRight, Receipt } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface PaymentRecord {
  id: number;
  stripeSessionId: string;
  status: string;
  amountTotal: number | null;
  currency: string | null;
  items: string | null;
  customerEmail: string | null;
  paidAt: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  completed: { label: "결제 완료", icon: CheckCircle2, color: "text-green-500" },
  pending: { label: "처리 중", icon: Clock, color: "text-amber-500" },
  failed: { label: "결제 실패", icon: XCircle, color: "text-red-500" },
  refunded: { label: "환불됨", icon: XCircle, color: "text-gray-400" },
};

const ITEM_LABELS: Record<string, string> = {
  certification: "전자 인증",
  video_will: "영상 유언장",
  handwritten_scan: "자필 스캔",
  storage_1y: "보관 1년",
  storage_3y: "보관 3년",
  storage_5y: "보관 5년",
  storage_10y: "보관 10년",
  storage_lifetime: "영구 보관",
  badge_essential: "Badge Essential",
  badge_wearable: "Badge Wearable",
  badge_necklace: "Badge Necklace",
  badge_premium: "Badge Premium",
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments/my")
      .then((r) => r.json())
      .then((data) => {
        setPayments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
          결제 내역
        </h1>
        <p className="text-gray-400 text-sm mt-1">EverWill에서 결제한 모든 내역을 확인하세요.</p>
      </div>

      {/* 결제 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-50 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-12 text-center"
        >
          <Receipt className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-400 mb-2">결제 내역이 없습니다</h3>
          <p className="text-gray-300 text-sm mb-6">첫 결제를 진행해보세요.</p>
          <Link href="/payment">
            <a className="inline-flex items-center gap-2 bg-[#C9A961] hover:bg-[#b8944f] text-white px-6 py-3 rounded-xl text-sm font-bold transition-all">
              결제하기
              <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment, i) => {
            const statusInfo = STATUS_MAP[payment.status] || STATUS_MAP.pending;
            const StatusIcon = statusInfo.icon;
            const itemLabels = payment.items
              ? payment.items.split(",").map((k) => ITEM_LABELS[k.trim()] || k.trim()).join(" · ")
              : "-";
            const paidDate = payment.paidAt
              ? new Date(payment.paidAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
              : new Date(payment.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

            return (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#1F3864]/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#1F3864]/5 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-5 h-5 text-[#1F3864]/40" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F3864] text-sm">{itemLabels}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{paidDate}</p>
                      {payment.customerEmail && (
                        <p className="text-gray-300 text-xs mt-0.5">{payment.customerEmail}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-[#1F3864]">
                      {payment.amountTotal ? `₩${payment.amountTotal.toLocaleString()}` : "-"}
                    </p>
                    <div className={`flex items-center gap-1 justify-end mt-1 ${statusInfo.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span className="text-xs">{statusInfo.label}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 새 결제 버튼 */}
      {payments.length > 0 && (
        <div className="text-center pt-2">
          <Link href="/payment">
            <a className="inline-flex items-center gap-2 text-[#1F3864] hover:text-[#C9A961] text-sm font-semibold transition-colors">
              추가 서비스 결제하기
              <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      )}
    </div>
  );
}
