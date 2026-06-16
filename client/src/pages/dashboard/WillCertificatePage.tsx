/**
 * 유언인증서 신청 및 발급 페이지 (/dashboard/will-certificate)
 * - 유언인증서 신청 (날짜 기준)
 * - 발급 내역 조회
 * - 국가별 PDF 인증서 다운로드 (14개국 법적 양식)
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
  Globe,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/** 지원 국가 목록 */
const SUPPORTED_COUNTRIES = [
  { code: "KR", flag: "🇰🇷", name: "한국 (Korea)" },
  { code: "US", flag: "🇺🇸", name: "미국 (USA)" },
  { code: "JP", flag: "🇯🇵", name: "일본 (Japan)" },
  { code: "CN", flag: "🇨🇳", name: "중국 (China)" },
  { code: "DE", flag: "🇩🇪", name: "독일 (Germany)" },
  { code: "ES", flag: "🇪🇸", name: "스페인 (Spain)" },
  { code: "SA", flag: "🇸🇦", name: "사우디아라비아 (Saudi Arabia)" },
  { code: "FR", flag: "🇫🇷", name: "프랑스 (France)" },
  { code: "IN", flag: "🇮🇳", name: "인도 (India)" },
  { code: "BR", flag: "🇧🇷", name: "브라질 (Brazil)" },
  { code: "AU", flag: "🇦🇺", name: "호주 (Australia)" },
  { code: "GB", flag: "🇬🇧", name: "영국 (UK)" },
  { code: "CA", flag: "🇨🇦", name: "캐나다 (Canada)" },
  { code: "NZ", flag: "🇳🇿", name: "뉴질랜드 (New Zealand)" },
];

/** 인증서 상태 라벨 */
const STATUS_LABEL: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "처리 중", color: "text-orange-600 bg-orange-50 border-orange-200", icon: Clock },
  issued: { label: "발급 완료", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  rejected: { label: "발급 거부", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
};

/** base64 PDF 다운로드 헬퍼 */
function downloadBase64Pdf(base64: string, filename: string) {
  const byteChars = atob(base64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNums[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNums);
  const blob = new Blob([byteArray], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function WillCertificatePage() {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [purpose, setPurpose] = useState("");
  const [selectedWillId, setSelectedWillId] = useState<number | null>(null);
  const [selectedCertId, setSelectedCertId] = useState<number | null>(null);
  const [downloadCountry, setDownloadCountry] = useState("KR");
  const [isDownloading, setIsDownloading] = useState(false);

  // 인증 완료된 유언장 목록
  const { data: certifiedWills } = trpc.willCertificate.getMyCertifiedWills.useQuery();

  // 발급 내역 조회
  const { data: certificates, isLoading, refetch } = trpc.willCertificate.getMyList.useQuery();

  // 인증서 신청
  const applyMutation = trpc.willCertificate.requestCertificate.useMutation({
    onSuccess: () => {
      toast.success("유언인증서 신청이 완료되었습니다.");
      setShowApplyModal(false);
      setPurpose("");
      setSelectedWillId(null);
      refetch();
    },
    onError: (err) => toast.error(err.message || "신청에 실패했습니다."),
  });

  // PDF 다운로드
  const downloadPdfMutation = trpc.willCertificate.downloadPdf.useMutation({
    onSuccess: (data) => {
      downloadBase64Pdf(data.base64, data.filename);
      toast.success(`${data.filename} 다운로드 완료`);
      setShowDownloadModal(false);
      setIsDownloading(false);
    },
    onError: (err) => {
      toast.error(err.message || "PDF 생성에 실패했습니다.");
      setIsDownloading(false);
    },
  });

  const handleApply = () => {
    if (!purpose.trim()) {
      toast.error("발급 목적을 선택해주세요.");
      return;
    }
    if (!selectedWillId && certifiedWills && certifiedWills.length > 0) {
      toast.error("유언장을 선택해주세요.");
      return;
    }
    const willId = selectedWillId ?? certifiedWills?.[0]?.id;
    if (!willId) {
      toast.error("인증 완료된 유언장이 없습니다. 먼저 유언장 인증을 완료해주세요.");
      return;
    }
    applyMutation.mutate({ willId, certDate: selectedDate, purpose });
  };

  const handleDownload = (certId: number) => {
    setSelectedCertId(certId);
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = () => {
    if (!selectedCertId) return;
    setIsDownloading(true);
    downloadPdfMutation.mutate({
      certificateId: selectedCertId,
      country: downloadCountry,
    });
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

      {/* 국가별 법적 양식 안내 배너 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1F3864]/5 to-[#C9A961]/5 border border-[#1F3864]/10 rounded-2xl p-5"
      >
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-[#C9A961] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1F3864] text-sm mb-2">
              14개국 법적 양식 지원 — 국가별 법률 기준 인증서
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUPPORTED_COUNTRIES.map((c) => (
                <span key={c.code} className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-0.5 text-gray-600">
                  {c.flag} {c.code}
                </span>
              ))}
            </div>
            <ul className="text-gray-600 text-xs space-y-1">
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                한국: 민법 제1060조~제1072조 + 전자서명법 기준 양식
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                미국: Uniform Electronic Wills Act (UEWA) 2019 기준 영문 양식
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                일본: 民法第968条 + 2025년 공정증서 디지털화 기준 일문 양식
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#C9A961] font-bold shrink-0">•</span>
                사우디: 샤리아 상속법 + 이슬람 유언 규정 아랍어 양식
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
                        onClick={() => handleDownload(cert.id)}
                        className="flex items-center gap-1.5 text-xs bg-[#1F3864] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#162d52] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF 다운로드
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

            {/* 유언장 선택 (인증 완료된 것만) */}
            {certifiedWills && certifiedWills.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1F3864] mb-2">
                  유언장 선택
                </label>
                <select
                  value={selectedWillId ?? ""}
                  onChange={(e) => setSelectedWillId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
                >
                  {certifiedWills.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title || `유언장 #${w.id}`} — {w.certifiedAt ? new Date(w.certifiedAt).toLocaleDateString("ko-KR") : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

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

      {/* PDF 다운로드 국가 선택 모달 */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-[#C9A961]" />
              <h3 className="font-bold text-[#1F3864] text-base">국가별 인증서 PDF 다운로드</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              제출할 국가를 선택하면 해당 국가의 법적 기준에 맞는 양식으로 인증서가 생성됩니다.
            </p>

            {/* 국가 선택 그리드 */}
            <div className="grid grid-cols-2 gap-2 mb-5 max-h-64 overflow-y-auto pr-1">
              {SUPPORTED_COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setDownloadCountry(c.code)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    downloadCountry === c.code
                      ? "border-[#1F3864] bg-[#1F3864]/5 text-[#1F3864]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="text-xs">{c.name}</span>
                </button>
              ))}
            </div>

            {/* 선택된 국가 법적 근거 안내 */}
            <div className="bg-[#1F3864]/5 rounded-xl p-3 mb-5 text-xs text-gray-600">
              {downloadCountry === "KR" && "📋 민법 제1060조~제1072조 + 전자서명법 기준 한국어 양식"}
              {downloadCountry === "US" && "📋 Uniform Electronic Wills Act (UEWA) 2019 기준 영문 양식"}
              {downloadCountry === "JP" && "📋 民法第968条 + 2025년 공정증서 디지털화 기준 일문 양식"}
              {downloadCountry === "CN" && "📋 中华人民共和国民法典 第1133条 기준 중문 양식"}
              {downloadCountry === "DE" && "📋 BGB §2247 + eIDAS 규정 기준 독일어 양식"}
              {downloadCountry === "ES" && "📋 Código Civil Art.688 + 전자서명법 기준 스페인어 양식"}
              {downloadCountry === "SA" && "📋 샤리아 상속법 + 이슬람 유언 규정 아랍어 양식 (RTL)"}
              {downloadCountry === "FR" && "📋 Code Civil Art.970 + eIDAS 기준 프랑스어 양식"}
              {downloadCountry === "IN" && "📋 Indian Succession Act 1925 §63 기준 영문 양식"}
              {downloadCountry === "BR" && "📋 Código Civil Art.1876 + ICP-Brasil 기준 포르투갈어 양식"}
              {downloadCountry === "AU" && "📋 Succession Act 2006 + Electronic Transactions Act 기준 영문 양식"}
              {downloadCountry === "GB" && "📋 Wills Act 1837 + Electronic Communications Act 기준 영문 양식"}
              {downloadCountry === "CA" && "📋 WESA (BC) / SLRA (ON) + Uniform Electronic Wills Act 기준 영문 양식"}
              {downloadCountry === "NZ" && "📋 Wills Act 2007 + Electronic Transactions Act 2002 기준 영문 양식"}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDownload}
                disabled={isDownloading}
                className="flex-1 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    PDF 다운로드
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
