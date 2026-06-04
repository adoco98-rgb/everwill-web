/**
 * 유언인증서 신청 및 발급 페이지 (/dashboard/will-certificate)
 * - 유언인증서 신청 (날짜 기준)
 * - 발급 내역 조회
 * - 발급 수수료 ₩1,500/건
 */
import { motion } from "framer-motion";
import {
  ScrollText,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  FileText,
  Printer,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** 인증서 상태 라벨 */
const STATUS_LABEL: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "처리 중", color: "text-orange-600 bg-orange-50 border-orange-200", icon: Clock },
  issued: { label: "발급 완료", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  rejected: { label: "발급 거부", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
};

export default function WillCertificatePage() {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [purpose, setPurpose] = useState("");

  // 발급 내역 (추후 API 연동)
  const [certificates] = useState<any[]>([]);
  const isLoading = false;
  const refetch = () => {};

  // 인증서 신청 (추후 결제 연동)
  const applyMutation = {
    mutate: (_args: any) => {
      toast.success("유언인증서 신청이 완료됐습니다. 결제 후 발급됩니다.");
      setShowApplyModal(false);
    },
    isPending: false,
  };

  const handleApply = () => {
    if (!purpose.trim()) {
      toast.error("발급 목적을 입력해주세요.");
      return;
    }
    applyMutation.mutate?.({ certDate: selectedDate, purpose });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScrollText className="w-5 h-5 text-[#1F3864]" />
            <h1 className="text-xl font-bold text-[#1F3864]">유언인증서 신청 및 발급</h1>
          </div>
          <p className="text-gray-500 text-sm">
            유언 인증 날짜를 기준으로 공식 인증서를 발급받으세요. 발급 수수료 ₩1,500/건
          </p>
        </div>
        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 bg-[#1F3864] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors"
        >
          <Plus className="w-4 h-4" />
          인증서 신청
        </button>
      </motion.div>

      {/* 안내 배너 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-2xl p-5"
      >
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-[#1F3864] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1F3864] text-sm mb-2">유언인증서란?</p>
            <ul className="text-gray-600 text-xs space-y-1.5">
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                EverWill에서 발급하는 공식 디지털 유언 인증 문서입니다.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                법원·은행·금융기관에서 유언 효력 확인 시 제출 가능합니다.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                한국어·영문 버전 모두 발급 가능하며, 발급일 기준 유효합니다.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                발급 수수료: <strong>₩1,500/건</strong> (재발급 동일 금액)
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* 발급 내역 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-[#1F3864] text-sm">발급 내역</h2>
          <span className="text-xs text-gray-400">총 {certificates?.length ?? 0}건</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !certificates || certificates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <ScrollText className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">발급 내역이 없습니다</p>
            <p className="text-gray-400 text-xs mb-4">유언 인증 완료 후 인증서를 신청하세요.</p>
            <button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 bg-[#1F3864] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors"
            >
              <Plus className="w-4 h-4" />
              첫 인증서 신청하기
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {certificates.map((cert: any, idx: number) => {
              const status = STATUS_LABEL[cert.status] ?? STATUS_LABEL.pending;
              const StatusIcon = status.icon;
              return (
                <div key={cert.id ?? idx} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1F3864]/5 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#1F3864]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F3864] text-sm">
                        유언인증서 #{String(idx + 1).padStart(4, "0")}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {cert.certDate ?? cert.createdAt
                            ? new Date(cert.certDate ?? cert.createdAt).toLocaleDateString("ko-KR")
                            : "-"}
                        </span>
                        {cert.purpose && (
                          <span className="text-xs text-gray-400">· {cert.purpose}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    {cert.status === "issued" && (
                      <button
                        onClick={() => toast.info("PDF 다운로드 기능은 준비 중입니다.")}
                        className="flex items-center gap-1.5 text-xs text-[#1F3864] font-medium hover:text-[#C9A961] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* 신청 모달 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-5">
              <ScrollText className="w-5 h-5 text-[#1F3864]" />
              <h3 className="font-bold text-[#1F3864] text-base">유언인증서 신청</h3>
            </div>

            {/* 인증 날짜 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1F3864] mb-2">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                인증 기준 날짜
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
              />
              <p className="text-xs text-gray-400 mt-1">유언 인증이 완료된 날짜를 선택하세요.</p>
            </div>

            {/* 발급 목적 */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1F3864] mb-2">
                발급 목적
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
              >
                <option value="">목적 선택</option>
                <option value="법원 제출">법원 제출</option>
                <option value="은행·금융기관 제출">은행·금융기관 제출</option>
                <option value="부동산 등기">부동산 등기</option>
                <option value="상속세 신고">상속세 신고</option>
                <option value="개인 보관">개인 보관</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 수수료 안내 */}
            <div className="bg-[#C9A961]/10 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#C9A961]" />
                  <span className="text-sm font-semibold text-[#1F3864]">발급 수수료</span>
                </div>
                <span className="text-lg font-bold text-[#C9A961]">₩1,500</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">결제 완료 후 영업일 기준 1일 이내 발급됩니다.</p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleApply}
                disabled={applyMutation.isPending}
                className="flex-1 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {applyMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    결제 후 신청
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
