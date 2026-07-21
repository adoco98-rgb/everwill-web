/**
 * 유언인증서 발급 페이지 (/dashboard/will-certificate)
 * 플로우: 신청 폼 → 신청내용 확인 → 인증서 완료 버튼 → PDF 미리보기/출력/저장
 * 발급 내역: 신청일시 + 출력일시/횟수 표시
 */
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText,
  Download,
  FileText,
  Printer,
  Globe,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  ClipboardList,
  Send,
  ChevronRight,
  Award,
  History,
  Trash2,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

/** base64 PDF 다운로드 헬퍼 */
function downloadBase64Pdf(base64: string, filename: string) {
  const byteChars = atob(base64);
  const byteNums = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
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

/** 날짜/시간 포맷 헬퍼 */
function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return "-";
  return new Date(d).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

// ─── 단계 정의 ────────────────────────────────────────────────────────────────
type Step = "apply" | "confirm" | "ready" | "preview";

export default function WillCertificatePage() {
  // ── 단계 상태 ──────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("apply");

  // ── 신청 폼 상태 ───────────────────────────────────────────────────────────
  const [selectedWillId, setSelectedWillId] = useState<number | null>(null);
  const [purpose, setPurpose] = useState("유언장 인증 확인용");

  const [appliedCert, setAppliedCert] = useState<any>(null); // 신청 완료된 인증서 레코드

  // ── PDF 미리보기 상태 ──────────────────────────────────────────────────────
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState("");
  const [previewCertId, setPreviewCertId] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);

  // ── 데이터 조회 ────────────────────────────────────────────────────────────
  const { data: myWills, isLoading: willsLoading } = trpc.will.getMyWills.useQuery();
  const { data: certificates, isLoading: certsLoading, refetch } = trpc.willCertificate.getMyList.useQuery();

  // 유언장 목록 로드 시 첫 번째 유언장 자동 선택
  useEffect(() => {
    if (myWills && myWills.length > 0 && selectedWillId === null) {
      setSelectedWillId((myWills[0] as any).id);
    }
  }, [myWills]);

  // ── 뮤테이션 ───────────────────────────────────────────────────────────────
  const recordPrintMutation = trpc.willCertificate.recordPrint.useMutation({
    onSuccess: () => refetch(),
  });

  const utils = trpc.useUtils();
  const deleteCertMutation = trpc.willCertificate.deleteCertificate.useMutation({
    onSuccess: () => {
      utils.willCertificate.getMyList.invalidate();
      toast.success("인증서가 삭제되었습니다");
    },
    onError: (e) => toast.error(e.message || "삭제에 실패했습니다"),
  });

  const applyMutation = trpc.willCertificate.requestCertificate.useMutation({
    onSuccess: (data) => {
      // 신청 완료 → 확인 단계로 이동
      refetch().then((res) => {
        const cert = res.data?.find((c: any) => c.issueNumber === data.issueNumber);
        setAppliedCert(cert ?? { issueNumber: data.issueNumber, createdAt: new Date(), status: "issued" });
      });
      setStep("confirm");
      toast.success(`인증서 신청 완료 (${data.issueNumber})`);
    },
    onError: (err) => toast.error(err.message || "신청에 실패했습니다."),
  });

  const previewPdfMutation = trpc.willCertificate.previewPdf.useMutation({
    onSuccess: (data) => {
      setPreviewBase64(data.base64);
      setPreviewFilename(data.filename);
      setIsPreviewLoading(false);
      setStep("preview");
    },
    onError: (err) => {
      toast.error(err.message || "PDF 생성에 실패했습니다.");
      setIsPreviewLoading(false);
    },
  });

  // ── 핸들러 ─────────────────────────────────────────────────────────────────
  const handleApply = useCallback(() => {
    if (!selectedWillId) { toast.error("유언장을 선택해주세요."); return; }
    if (!purpose.trim()) { toast.error("발급 목적을 입력해주세요."); return; }
    const today = new Date().toISOString().slice(0, 10);
    applyMutation.mutate({ willId: selectedWillId, certDate: today, purpose });
  }, [selectedWillId, purpose, applyMutation]);

  const handleGeneratePdf = useCallback(() => {
    if (!appliedCert) return;
    setIsPreviewLoading(true);
    setPreviewBase64(null);
    previewPdfMutation.mutate({
      certificateId: appliedCert.id ?? undefined,
      willId: selectedWillId ?? undefined,
      country: "KR",
      isSample: false,
    });
  }, [appliedCert, selectedWillId, previewPdfMutation]);

  const handlePreviewFromHistory = useCallback((certId: number, willId: number) => {
    setPreviewCertId(certId);
    setPreviewBase64(null);
    setIsPreviewLoading(true);
    setStep("preview");
    previewPdfMutation.mutate({ certificateId: certId, willId, country: "KR", isSample: false });
  }, [previewPdfMutation]);

  const handleDownloadFromPreview = useCallback(() => {
    if (!previewBase64 || !previewFilename) return;
    setIsDownloadingFile(true);
    setTimeout(() => {
      downloadBase64Pdf(previewBase64, previewFilename);
      toast.success("PDF 파일 저장 완료");
      setIsDownloadingFile(false);
      const certId = previewCertId ?? appliedCert?.id;
      if (certId) recordPrintMutation.mutate({ certificateId: certId });
    }, 800);
  }, [previewBase64, previewFilename, previewCertId, appliedCert, recordPrintMutation]);

  const handlePrintFromPreview = useCallback(() => {
    if (!previewBase64 || isPrinting) return;
    setIsPrinting(true);
    setTimeout(() => {
      const byteChars = atob(previewBase64);
      const byteNums = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const blob = new Blob([new Uint8Array(byteNums)], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
          setIsPrinting(false);
          toast.success("출력 완료");
        }, 1000);
      };
      const certId = previewCertId ?? appliedCert?.id;
      if (certId) recordPrintMutation.mutate({ certificateId: certId });
    }, 800);
  }, [previewBase64, isPrinting, previewCertId, appliedCert, recordPrintMutation]);

  const isLoading = willsLoading || certsLoading;

  // ── 단계 인디케이터 ────────────────────────────────────────────────────────
  const steps = [
    { id: "apply", label: "신청", icon: ClipboardList },
    { id: "confirm", label: "확인", icon: CheckCircle2 },
    { id: "ready", label: "완료", icon: Award },
    { id: "preview", label: "출력", icon: Printer },
  ];
  const stepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScrollText className="w-5 h-5 text-[#1F3864]" />
            <h1 className="text-xl font-bold text-[#1F3864]">유언인증서 발급</h1>
          </div>
          <p className="text-gray-500 text-sm">내 유언장과 자산 정보가 포함된 공식 인증서를 출력하거나 저장하세요.</p>
        </div>
      </motion.div>

      {/* 법적 양식 안내 배너 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1F3864]/5 to-[#C9A961]/5 border border-[#1F3864]/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-[#C9A961] shrink-0" />
          <div>
            <p className="font-semibold text-[#1F3864] text-sm">🇰🇷 한국 민법 기준 공식 인증서</p>
            <p className="text-gray-600 text-xs mt-0.5">민법 제1060조~제1072조 + 전자서명법 기준 · EverWill 인증 마크 포함</p>
          </div>
        </div>
      </motion.div>

      {/* 단계 인디케이터 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-0">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = i < stepIdx;
          return (
            <div key={s.id} className="flex items-center">
              <div className={`flex flex-col items-center gap-1 ${isActive ? "opacity-100" : isDone ? "opacity-70" : "opacity-30"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive ? "bg-[#1F3864] border-[#1F3864] text-white" :
                  isDone ? "bg-[#C9A961] border-[#C9A961] text-white" :
                  "bg-white border-gray-200 text-gray-400"
                }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs font-medium ${isActive ? "text-[#1F3864]" : isDone ? "text-[#C9A961]" : "text-gray-400"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 mb-4 transition-all ${i < stepIdx ? "bg-[#C9A961]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* ─── STEP 1: 신청 폼 ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {step === "apply" && (
          <motion.div key="apply" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#1F3864]" />
              <h2 className="font-bold text-[#1F3864] text-sm">인증서 신청</h2>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !myWills || myWills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <ScrollText className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium mb-1">유언장이 없습니다</p>
                <p className="text-gray-400 text-xs mb-4">먼저 유언장을 작성해주세요.</p>
                <a href="/dashboard/will" className="flex items-center gap-2 bg-[#1F3864] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors">
                  유언장 작성하기
                </a>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* 신청 날짜/시간 표시 */}
                <div className="bg-[#1F3864]/5 rounded-xl p-4 flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-[#1F3864] shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">신청 날짜 및 시간</p>
                    <p className="font-semibold text-[#1F3864] text-sm mt-0.5">{formatDateTime(new Date())}</p>
                  </div>
                </div>

                {/* 유언장 선택 */}
                <div>
                  <label className="block text-sm font-semibold text-[#1F3864] mb-2">유언장 선택 <span className="text-red-500">*</span></label>
                  <div className="space-y-2">
                    {myWills.map((will: any) => (
                      <button
                        key={will.id}
                        onClick={() => setSelectedWillId(will.id)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                          selectedWillId === will.id
                            ? "border-[#1F3864] bg-[#1F3864]/5"
                            : "border-gray-100 hover:border-[#1F3864]/30 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          selectedWillId === will.id ? "bg-[#1F3864] text-white" : "bg-gray-100 text-gray-400"
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1F3864] text-sm truncate">{will.title ?? "유언장"}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            작성: {formatDateTime(will.createdAt)} · 상태: {will.status === "certified" ? "인증완료" : will.status === "draft" ? "초안" : will.status}
                          </p>
                        </div>
                        {selectedWillId === will.id && <CheckCircle2 className="w-4 h-4 text-[#1F3864] shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 발급 목적 */}
                <div>
                  <label className="block text-sm font-semibold text-[#1F3864] mb-2">발급 목적 <span className="text-red-500">*</span></label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 bg-white"
                  >
                    <option value="유언장 인증 확인용">유언장 인증 확인용</option>
                    <option value="금융기관 제출용">금융기관 제출용</option>
                    <option value="법원 제출용">법원 제출용</option>
                    <option value="상속 절차 진행용">상속 절차 진행용</option>
                    <option value="부동산 이전 등기용">부동산 이전 등기용</option>
                    <option value="보험금 청구용">보험금 청구용</option>
                    <option value="기타">기타</option>
                  </select>
                </div>

                {/* 인증서 포함 내용 안내 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">📄 인증서 포함 내용</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {["표지 (인증번호·유언자·날짜)", "유언장 전문", "자산 목록 (부동산·금융·기타)", "상속자 명단", "첨부서류 목록", "첨부 이미지 파일 (실제 내용)"].map((item) => (
                      <div key={item} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                        <span className="text-xs text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 신청 버튼 */}
                <button
                  onClick={handleApply}
                  disabled={!selectedWillId || applyMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-[#1F3864] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#162d52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applyMutation.isPending ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />처리 중...</>
                  ) : (
                    <><Send className="w-4 h-4" />인증서 신청하기</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── STEP 2: 신청 확인 ──────────────────────────────────────────────── */}
        {step === "confirm" && appliedCert && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h2 className="font-bold text-[#1F3864] text-sm">신청 내용 확인</h2>
            </div>
            <div className="p-6 space-y-4">
              {/* 신청 완료 배지 */}
              <div className="flex items-center justify-center py-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-[#1F3864] text-base">인증서 신청이 완료되었습니다</p>
                    <p className="text-gray-500 text-sm mt-1">아래 내용을 확인하고 인증서를 출력하세요</p>
                  </div>
                </div>
              </div>

              {/* 신청 상세 정보 */}
              <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" />인증 번호</span>
                  <span className="text-sm font-bold text-[#1F3864]">{appliedCert.issueNumber}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />신청 날짜</span>
                  <span className="text-sm font-semibold text-gray-700">{formatDateTime(appliedCert.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />발급 목적</span>
                  <span className="text-sm font-semibold text-gray-700">{purpose}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />적용 법률</span>
                  <span className="text-sm font-semibold text-gray-700">한국 민법 (KR)</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />상태</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                    <CheckCircle2 className="w-3 h-3" />발급 완료
                  </span>
                </div>
              </div>

              {/* 인증서 출력 버튼 */}
              <button
                onClick={() => setStep("ready")}
                className="w-full flex items-center justify-center gap-2 bg-[#C9A961] text-white py-4 rounded-xl font-bold text-base hover:bg-[#b8944e] transition-colors"
              >
                <Award className="w-5 h-5" />
                인증서 완료 — 출력 준비
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 3: 인증서 완료 (출력 준비) ───────────────────────────────── */}
        {step === "ready" && (
          <motion.div key="ready" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C9A961]" />
              <h2 className="font-bold text-[#1F3864] text-sm">인증서 출력 준비</h2>
            </div>
            <div className="p-6 space-y-5">
              {/* 인증서 완료 안내 */}
              <div className="bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] rounded-2xl p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-[#C9A961]" />
                </div>
                <h3 className="text-lg font-bold mb-1">EverWill 유언인증서</h3>
                <p className="text-white/70 text-sm mb-3">{appliedCert?.issueNumber}</p>
                <div className="bg-white/10 rounded-xl p-3 text-left space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">신청 일시</span>
                    <span className="font-medium">{formatDateTime(appliedCert?.createdAt)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">발급 목적</span>
                    <span className="font-medium">{purpose}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">적용 법률</span>
                    <span className="font-medium">한국 민법 (KR)</span>
                  </div>
                </div>
              </div>

              {/* 포함 내용 안내 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-600 mb-3">인증서에 포함되는 내용</p>
                <div className="space-y-2">
                  {[
                    { icon: "📋", text: "표지 — 인증번호, 유언자 정보, 발급 날짜" },
                    { icon: "📝", text: "유언장 전문 — 작성한 유언 내용 전체" },
                    { icon: "🏠", text: "자산 목록 — 부동산, 금융, 기타 자산" },
                    { icon: "👨‍👩‍👧", text: "상속자 명단 — 상속 지분 포함" },
                    { icon: "📎", text: "첨부서류 — 가족관계증명, 등본 등 실제 이미지" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span className="text-xs text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 출력 버튼 */}
              <button
                onClick={handleGeneratePdf}
                disabled={isPreviewLoading}
                className="w-full flex items-center justify-center gap-2 bg-[#1F3864] text-white py-4 rounded-xl font-bold text-base hover:bg-[#162d52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPreviewLoading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />인증서 생성 중...</>
                ) : (
                  <><Printer className="w-5 h-5" />인증서 전체 내용 보기 / 출력</>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 4: PDF 미리보기 ────────────────────────────────────────────── */}
        {step === "preview" && (
          <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1F3864]" />
                <h2 className="font-bold text-[#1F3864] text-sm">유언인증서 전체 내용</h2>
              </div>
              <div className="flex items-center gap-2">
                {appliedCert && (
                  <span className="text-xs text-gray-400">{appliedCert.issueNumber}</span>
                )}
              </div>
            </div>

            {isPreviewLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#1F3864]/20 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-[#1F3864] font-bold text-base">인증서 생성 중...</p>
                  <p className="text-gray-400 text-sm mt-1">유언장 내용과 자산 정보를 인증서로 변환하고 있습니다</p>
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            ) : previewBase64 ? (
              <div className="flex flex-col">
                {/* PDF 뷰어 */}
                <div className="relative bg-gray-100" style={{ height: "70vh" }}>
                  {/* 줌 컨트롤 */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-xl px-2 py-1.5 shadow-sm border border-gray-100">
                    <button onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors" title="축소">
                      <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <span className="text-xs font-mono text-gray-600 w-9 text-center">{previewZoom}%</span>
                    <button onClick={() => setPreviewZoom((z) => Math.min(200, z + 25))} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors" title="확대">
                      <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button onClick={() => setShowPreviewModal(true)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors" title="전체화면">
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                  {/* PDF 렌더링 */}
                  <div className="w-full h-full overflow-auto flex items-start justify-center p-4" style={{ background: "#e5e7eb" }}>
                    <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: "top center", width: "100%", transition: "transform 0.2s ease" }}>
                      <object
                        data={`data:application/pdf;base64,${previewBase64}`}
                        type="application/pdf"
                        className="w-full rounded-lg shadow-xl"
                        style={{ minHeight: "60vh", height: "60vh" }}
                      >
                        <iframe
                          src={`data:application/pdf;base64,${previewBase64}`}
                          className="w-full rounded-lg shadow-xl"
                          style={{ minHeight: "60vh", height: "60vh", border: "none" }}
                          title="유언인증서 미리보기"
                        />
                      </object>
                    </div>
                  </div>
                </div>
                {/* 하단 버튼 */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-500">EverWill 인증 마크 포함 · 모든 내용 포함</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrintFromPreview}
                      disabled={isPrinting || isDownloadingFile}
                      className="flex items-center gap-2 border border-[#1F3864] text-[#1F3864] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1F3864]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[110px] justify-center"
                    >
                      {isPrinting ? (
                        <><div className="w-4 h-4 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />문서 준비 중...</>
                      ) : (
                        <><Printer className="w-4 h-4" />출력하기</>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadFromPreview}
                      disabled={isPrinting || isDownloadingFile}
                      className="flex items-center gap-2 bg-[#1F3864] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[110px] justify-center"
                    >
                      {isDownloadingFile ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />저장 중...</>
                      ) : (
                        <><Download className="w-4 h-4" />파일 받기</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium mb-1">인증서를 불러올 수 없습니다</p>
                <button onClick={handleGeneratePdf} className="mt-3 flex items-center gap-2 border border-[#1F3864]/20 text-[#1F3864] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1F3864]/5 transition-colors">
                  <RefreshCw className="w-4 h-4" />다시 시도
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 발급 내역 (출력 날짜/시간 포함) ────────────────────────────────── */}
      {certificates && certificates.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#1F3864]" />
              <h2 className="font-bold text-[#1F3864] text-sm">발급 내역</h2>
            </div>
            <span className="text-xs text-gray-400">총 {certificates.length}건</span>
          </div>
          <div className="divide-y divide-gray-50">
            {certificates.map((cert: any, idx: number) => {
              const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
                pending: { label: "처리 중", color: "text-orange-600 bg-orange-50 border-orange-200", icon: Clock },
                issued: { label: "발급 완료", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
                rejected: { label: "발급 거부", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
              };
              const status = statusMap[cert.status] ?? statusMap.pending;
              const StatusIcon = status.icon;
              return (
                <div key={cert.id ?? idx} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-[#1F3864]/5 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-5 h-5 text-[#1F3864]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1F3864] text-sm truncate">
                          {cert.issueNumber ?? `유언인증서 #${String(idx + 1).padStart(4, "0")}`}
                        </p>
                        {/* 신청 날짜/시간 */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3 text-[#C9A961] shrink-0" />
                          <span className="text-xs text-gray-500">
                            <span className="font-medium text-gray-600">신청:</span> {formatDateTime(cert.createdAt)}
                          </span>
                        </div>
                        {/* 출력 날짜/시간 */}
                        {cert.printedAt ? (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Printer className="w-3 h-3 text-green-500 shrink-0" />
                            <span className="text-xs text-gray-500">
                              <span className="font-medium text-gray-600">출력:</span> {formatDateTime(cert.printedAt)}
                              {cert.printCount > 1 && (
                                <span className="ml-1 text-gray-400">· 총 {cert.printCount}회 출력</span>
                              )}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Printer className="w-3 h-3 text-gray-300 shrink-0" />
                            <span className="text-xs text-gray-400">아직 출력하지 않음</span>
                          </div>
                        )}
                        {cert.purpose && (
                          <p className="text-xs text-gray-400 mt-0.5">목적: {cert.purpose}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                      {cert.status === "issued" && (
                        <button
                          onClick={() => handlePreviewFromHistory(cert.id, cert.willId)}
                          disabled={isPreviewLoading}
                          className="flex items-center gap-1.5 text-xs border border-[#C9A961] text-[#C9A961] px-3 py-1.5 rounded-lg font-medium hover:bg-[#C9A961]/10 transition-colors disabled:opacity-50"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          다시 보기
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("이 인증서를 삭제하시겠습니까?")) {
                            deleteCertMutation.mutate({ certificateId: cert.id });
                          }
                        }}
                        disabled={deleteCertMutation.isPending}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded border border-red-200 hover:border-red-400 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3" /> 삭제
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 새 인증서 신청 버튼 (preview/confirm/ready 단계에서) */}
      {(step === "confirm" || step === "ready" || step === "preview") && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center">
          <button
            onClick={() => { setStep("apply"); setAppliedCert(null); setPreviewBase64(null); setSelectedWillId(null); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1F3864] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            새 인증서 신청하기
          </button>
        </motion.div>
      )}

      {/* 전체화면 PDF 모달 */}
      <Dialog open={showPreviewModal} onOpenChange={(v) => { if (!v) { setShowPreviewModal(false); setPreviewZoom(100); } }}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col rounded-2xl" showCloseButton={false}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-[#1F3864] rounded-t-2xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">유언인증서 전체화면</h3>
                <p className="text-white/60 text-xs">{previewFilename || "로딩 중..."}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"><ZoomOut className="w-4 h-4 text-white" /></button>
              <span className="text-white/80 text-xs font-mono w-10 text-center">{previewZoom}%</span>
              <button onClick={() => setPreviewZoom((z) => Math.min(200, z + 25))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"><ZoomIn className="w-4 h-4 text-white" /></button>
              <button onClick={() => { setShowPreviewModal(false); setPreviewZoom(100); }} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"><X className="w-4 h-4 text-white" /></button>
            </div>
          </div>
          <div className="flex-1 bg-gray-100 overflow-hidden relative">
            {!previewBase64 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#1F3864] font-semibold text-sm">PDF 생성 중...</p>
              </div>
            ) : (
              <div className="w-full h-full overflow-auto flex items-start justify-center p-4" style={{ background: "#e5e7eb" }}>
                <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: "top center", width: "100%", transition: "transform 0.2s ease" }}>
                  <object data={`data:application/pdf;base64,${previewBase64}`} type="application/pdf" className="w-full rounded-lg shadow-xl" style={{ minHeight: "calc(90vh - 120px)", height: "calc(90vh - 120px)" }}>
                    <iframe src={`data:application/pdf;base64,${previewBase64}`} className="w-full rounded-lg shadow-xl" style={{ minHeight: "calc(90vh - 120px)", height: "calc(90vh - 120px)", border: "none" }} title="PDF 미리보기" />
                  </object>
                </div>
              </div>
            )}
          </div>
          {previewBase64 && (
            <div className="shrink-0 flex items-center justify-end px-5 py-3 border-t border-gray-100 bg-white rounded-b-2xl gap-2">
              <button onClick={() => { setShowPreviewModal(false); setPreviewZoom(100); }} className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">닫기</button>
              <button onClick={handlePrintFromPreview} disabled={isPrinting || isDownloadingFile} className="flex items-center gap-1.5 border border-[#1F3864] text-[#1F3864] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1F3864]/5 transition-colors disabled:opacity-60 min-w-[90px] justify-center">
                {isPrinting ? <><div className="w-3.5 h-3.5 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />준비 중...</> : <><Printer className="w-3.5 h-3.5" />출력하기</>}
              </button>
              <button onClick={handleDownloadFromPreview} disabled={isPrinting || isDownloadingFile} className="flex items-center gap-1.5 bg-[#1F3864] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#162d52] transition-colors disabled:opacity-60 min-w-[90px] justify-center">
                {isDownloadingFile ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />저장 중...</> : <><Download className="w-3.5 h-3.5" />파일 받기</>}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
