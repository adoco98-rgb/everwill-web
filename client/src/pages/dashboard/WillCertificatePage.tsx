/**
 * 유언인증서 발급 페이지 (/dashboard/will-certificate)
 * - 페이지 진입 즉시 내 유언장 전체 내용 자동 표시
 * - EverWill 워터마크 포함 PDF 미리보기
 * - 출력하기 + 파일 받기 버튼만 제공
 */
import { motion } from "framer-motion";
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
  // PDF 미리보기 상태
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState("");
  const [previewCertId, setPreviewCertId] = useState<number | null>(null);
  const [previewWillId, setPreviewWillId] = useState<number | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloadingFile, setIsDownloadingFile] = useState(false);

  // 내 유언장 목록 조회
  const { data: myWills, isLoading: willsLoading } = trpc.will.getMyWills.useQuery();

  // 발급 내역 조회
  const { data: certificates, isLoading: certsLoading, refetch } = trpc.willCertificate.getMyList.useQuery();

  // 인증서 출력 기록
  const recordPrintMutation = trpc.willCertificate.recordPrint.useMutation({
    onSuccess: () => refetch(),
  });

  // PDF 미리보기 뮤테이션
  const previewPdfMutation = trpc.willCertificate.previewPdf.useMutation({
    onSuccess: (data) => {
      setPreviewBase64(data.base64);
      setPreviewFilename(data.filename);
      setIsPreviewLoading(false);
      setShowPreviewModal(true);
    },
    onError: (err) => {
      toast.error(err.message || "PDF 미리보기에 실패했습니다.");
      setIsPreviewLoading(false);
    },
  });

  // 인증서 신청 뮤테이션 (발급 내역 카드에서 신청 시)
  const applyMutation = trpc.willCertificate.requestCertificate.useMutation({
    onSuccess: (data) => {
      toast.success(`인증서가 발급되었습니다. (${data.issueNumber})`);
      refetch();
    },
    onError: (err) => toast.error(err.message || "신청에 실패했습니다."),
  });

  // 자동 미리보기 제거 - 사용자가 직접 버튼 클릭 시에만 미리보기 실행

  // 미리보기 시작 핸들러 (발급 내역에서 클릭)
  const handlePreview = useCallback((certId: number | null, willId?: number) => {
    setPreviewCertId(certId);
    setPreviewWillId(willId ?? null);
    setPreviewBase64(null);
    setIsPreviewLoading(true);
    previewPdfMutation.mutate({
      certificateId: certId ?? undefined,
      willId: willId,
      country: "KR",
      isSample: false,
    });
  }, [previewPdfMutation]);

  // 미리보기에서 파일 받기
  const handleDownloadFromPreview = useCallback(() => {
    if (!previewBase64 || !previewFilename) return;
    setIsDownloadingFile(true);
    setTimeout(() => {
      downloadBase64Pdf(previewBase64, previewFilename);
      toast.success("PDF 파일 저장 완료");
      setIsDownloadingFile(false);
      if (previewCertId) {
        recordPrintMutation.mutate({ certificateId: previewCertId });
      }
    }, 800);
  }, [previewBase64, previewFilename, previewCertId, recordPrintMutation]);

  // 미리보기에서 출력하기
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
      if (previewCertId) recordPrintMutation.mutate({ certificateId: previewCertId });
    }, 800);
  }, [previewBase64, isPrinting, previewCertId, recordPrintMutation]);

  const isLoading = willsLoading || certsLoading;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ScrollText className="w-5 h-5 text-[#1F3864]" />
            <h1 className="text-xl font-bold text-[#1F3864]">유언인증서 발급</h1>
          </div>
          <p className="text-gray-500 text-sm">
            내 유언장과 자산 정보가 포함된 공식 인증서를 출력하거나 저장하세요.
          </p>
        </div>
        {/* 새로고침 버튼 */}
        {myWills && myWills.length > 0 && (
          <button
            onClick={() => {
              const firstWill = myWills[0];
              if (!firstWill) return;
              setPreviewBase64(null);
              setIsPreviewLoading(true);
              previewPdfMutation.mutate({ willId: firstWill.id, country: "KR", isSample: false });
            }}
            disabled={isPreviewLoading}
            className="flex items-center gap-2 border border-[#1F3864]/20 text-[#1F3864] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1F3864]/5 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isPreviewLoading ? "animate-spin" : ""}`} />
            새로고침
          </button>
        )}
      </motion.div>

      {/* 한국 법적 양식 안내 배너 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#1F3864]/5 to-[#C9A961]/5 border border-[#1F3864]/10 rounded-2xl p-4"
      >
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-[#C9A961] shrink-0" />
          <div>
            <p className="font-semibold text-[#1F3864] text-sm">
              🇰🇷 한국 민법 기준 공식 인증서
            </p>
            <p className="text-gray-600 text-xs mt-0.5">
              민법 제1060조~제1072조 + 전자서명법 기준 · EverWill 인증 마크 포함
            </p>
          </div>
        </div>
      </motion.div>

      {/* 내 유언장 미리보기 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1F3864]" />
            <h2 className="font-bold text-[#1F3864] text-sm">내 유언인증서</h2>
          </div>
          {myWills && myWills.length > 0 && (
            <span className="text-xs text-gray-400">유언장 {myWills.length}건</span>
          )}
        </div>

        {isLoading ? (
          /* 로딩 상태 */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-[#1F3864] font-semibold text-sm">인증서 생성 중...</p>
              <p className="text-gray-400 text-xs mt-1">유언장 및 자산 정보를 불러오고 있습니다</p>
            </div>
          </div>
        ) : !myWills || myWills.length === 0 ? (
          /* 유언장 없음 */
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <ScrollText className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">유언장이 없습니다</p>
            <p className="text-gray-400 text-xs mb-4">먼저 유언장을 작성해주세요.</p>
            <a
              href="/dashboard/will"
              className="flex items-center gap-2 bg-[#1F3864] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors"
            >
              유언장 작성하기
            </a>
          </div>
        ) : isPreviewLoading ? (
          /* PDF 생성 중 */
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1F3864]/20 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-[#1F3864] font-bold text-base">문서 생성 중...</p>
              <p className="text-gray-400 text-sm mt-1">유언장 내용과 자산 정보를 인증서로 변환하고 있습니다</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-[#C9A961] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : previewBase64 ? (
          /* PDF 미리보기 인라인 표시 */
          <div className="flex flex-col">
            {/* PDF 뷰어 */}
            <div className="relative bg-gray-100" style={{ height: "70vh" }}>
              {/* 줌 컨트롤 */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-xl px-2 py-1.5 shadow-sm border border-gray-100">
                <button
                  onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  title="축소"
                >
                  <ZoomOut className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <span className="text-xs font-mono text-gray-600 w-9 text-center">{previewZoom}%</span>
                <button
                  onClick={() => setPreviewZoom((z) => Math.min(200, z + 25))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  title="확대"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                  title="전체화면"
                >
                  <Eye className="w-3.5 h-3.5 text-gray-600" />
                </button>
              </div>

              {/* PDF 렌더링 */}
              <div
                className="w-full h-full overflow-auto flex items-start justify-center p-4"
                style={{ background: "#e5e7eb" }}
              >
                <div
                  style={{
                    transform: `scale(${previewZoom / 100})`,
                    transformOrigin: "top center",
                    width: "100%",
                    transition: "transform 0.2s ease",
                  }}
                >
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

            {/* 하단 버튼 영역 */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-500">EverWill 인증 마크 포함</span>
              </div>
              <div className="flex items-center gap-2">
                {/* 출력하기 */}
                <button
                  onClick={handlePrintFromPreview}
                  disabled={isPrinting || isDownloadingFile}
                  className="flex items-center gap-2 border border-[#1F3864] text-[#1F3864] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#1F3864]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[110px] justify-center"
                >
                  {isPrinting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      문서 준비 중...
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      출력하기
                    </>
                  )}
                </button>
                {/* 파일 받기 */}
                <button
                  onClick={handleDownloadFromPreview}
                  disabled={isPrinting || isDownloadingFile}
                  className="flex items-center gap-2 bg-[#1F3864] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[110px] justify-center"
                >
                  {isDownloadingFile ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      파일 받기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* 에러 상태 */
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm font-medium mb-1">인증서를 불러올 수 없습니다</p>
            <button
              onClick={() => {
                if (!myWills?.[0]) return;
                setIsPreviewLoading(true);
                previewPdfMutation.mutate({ willId: myWills[0].id, country: "KR", isSample: false });
              }}
              className="mt-3 flex items-center gap-2 border border-[#1F3864]/20 text-[#1F3864] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#1F3864]/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              다시 시도
            </button>
          </div>
        )}
      </motion.div>

      {/* 발급 내역 */}
      {certificates && certificates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-[#1F3864] text-sm">발급 내역</h2>
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
                <div key={cert.id ?? idx} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1F3864]/5 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#1F3864]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#1F3864] text-sm">
                        {cert.issueNumber ?? `유언인증서 #${String(idx + 1).padStart(4, "0")}`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          신청: {cert.createdAt ? new Date(cert.createdAt).toLocaleString("ko-KR") : "-"}
                        </span>
                      </div>
                      {cert.printedAt && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <Printer className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            최초 출력: {new Date(cert.printedAt).toLocaleString("ko-KR")}
                          </span>
                          {cert.printCount > 1 && (
                            <span className="text-xs text-gray-400">· 총 {cert.printCount}회</span>
                          )}
                        </div>
                      )}
                      {cert.purpose && (
                        <span className="text-xs text-gray-400">목적: {cert.purpose}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                    {cert.status === "issued" && (
                      <button
                        onClick={() => handlePreview(cert.id, cert.willId)}
                        disabled={isPreviewLoading}
                        className="flex items-center gap-1.5 text-xs border border-[#C9A961] text-[#C9A961] px-3 py-1.5 rounded-lg font-medium hover:bg-[#C9A961]/10 transition-colors disabled:opacity-50"
                      >
                        {isPreviewLoading && previewCertId === cert.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        미리보기
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* 전체화면 PDF 미리보기 모달 */}
      <Dialog open={showPreviewModal} onOpenChange={(v) => { if (!v) { setShowPreviewModal(false); setPreviewZoom(100); } }}>
        <DialogContent
          className="max-w-[95vw] w-[95vw] h-[95vh] p-0 overflow-hidden flex flex-col rounded-2xl"
          showCloseButton={false}
        >
          {/* 모달 헤더 */}
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
              <button onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" title="축소">
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <span className="text-white/80 text-xs font-mono w-10 text-center">{previewZoom}%</span>
              <button onClick={() => setPreviewZoom((z) => Math.min(200, z + 25))} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors" title="확대">
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
              <button onClick={() => { setShowPreviewModal(false); setPreviewZoom(100); }} className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* PDF 뷰어 */}
          <div className="flex-1 bg-gray-100 overflow-hidden relative">
            {!previewBase64 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
                <p className="text-[#1F3864] font-semibold text-sm">PDF 생성 중...</p>
              </div>
            ) : (
              <div className="w-full h-full overflow-auto flex items-start justify-center p-4" style={{ background: "#e5e7eb" }}>
                <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: "top center", width: "100%", transition: "transform 0.2s ease" }}>
                  <object
                    data={`data:application/pdf;base64,${previewBase64}`}
                    type="application/pdf"
                    className="w-full rounded-lg shadow-xl"
                    style={{ minHeight: "calc(90vh - 120px)", height: "calc(90vh - 120px)" }}
                  >
                    <iframe
                      src={`data:application/pdf;base64,${previewBase64}`}
                      className="w-full rounded-lg shadow-xl"
                      style={{ minHeight: "calc(90vh - 120px)", height: "calc(90vh - 120px)", border: "none" }}
                      title="PDF 미리보기"
                    />
                  </object>
                </div>
              </div>
            )}
          </div>

          {/* 모달 푸터 */}
          {previewBase64 && (
            <div className="shrink-0 flex items-center justify-end px-5 py-3 border-t border-gray-100 bg-white rounded-b-2xl gap-2">
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewZoom(100); }}
                disabled={isPrinting || isDownloadingFile}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                닫기
              </button>
              <button
                onClick={handlePrintFromPreview}
                disabled={isPrinting || isDownloadingFile}
                className="flex items-center gap-1.5 border border-[#1F3864] text-[#1F3864] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1F3864]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[90px] justify-center"
              >
                {isPrinting ? (
                  <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>문서 준비 중...</>
                ) : (
                  <><Printer className="w-3.5 h-3.5" />출력하기</>
                )}
              </button>
              <button
                onClick={handleDownloadFromPreview}
                disabled={isPrinting || isDownloadingFile}
                className="flex items-center gap-1.5 bg-[#1F3864] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#162d52] transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-w-[90px] justify-center"
              >
                {isDownloadingFile ? (
                  <><svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>저장 중...</>
                ) : (
                  <><Download className="w-3.5 h-3.5" />파일 받기</>
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
