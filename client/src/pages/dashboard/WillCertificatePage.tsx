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
  Upload,
  Trash2,
  Paperclip,
  Home,
  Building2,
  Coins,
  Shield,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** 첨부파일 카테고리 설정 */
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  real_estate: { label: "부동산 등기부등본",   icon: Home,      color: "text-blue-600 bg-blue-50" },
  bank:        { label: "통장 사본/잔고증명",  icon: Building2, color: "text-green-600 bg-green-50" },
  stock:       { label: "주식 잔고증명서",     icon: FileText,  color: "text-purple-600 bg-purple-50" },
  crypto:      { label: "가상자산 보유증명",   icon: Coins,     color: "text-orange-600 bg-orange-50" },
  insurance:   { label: "보험증권",           icon: Shield,    color: "text-pink-600 bg-pink-50" },
  pension:     { label: "연금 증명서",        icon: Calendar,  color: "text-teal-600 bg-teal-50" },
  other:       { label: "기타 증빙서류",      icon: Paperclip, color: "text-gray-600 bg-gray-50" },
};

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
  const [isSampleGenerating, setIsSampleGenerating] = useState(false);
  const [sampleCountry, setSampleCountry] = useState("KR");
  const [showSampleModal, setShowSampleModal] = useState(false);

  // PDF 미리보기 모달 상태
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [previewFilename, setPreviewFilename] = useState("");
  const [previewCountry, setPreviewCountry] = useState("KR");
  const [previewCertId, setPreviewCertId] = useState<number | null>(null);
  const [previewIsSample, setPreviewIsSample] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(100);

  // 첨부파일 업로드 상태
  const [uploadCategory, setUploadCategory] = useState("real_estate");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 인증 완료된 유언장 목록
  const { data: certifiedWills } = trpc.willCertificate.getMyCertifiedWills.useQuery();

  // 발급 내역 조회
  const { data: certificates, isLoading, refetch } = trpc.willCertificate.getMyList.useQuery();

  // 첨부파일 목록 조회
  const { data: attachments, refetch: refetchAttachments } = trpc.attachment.list.useQuery();

  // 첨부파일 업로드 뮤테이션
  const uploadMutation = trpc.attachment.upload.useMutation({
    onSuccess: () => {
      toast.success("파일이 업로드되었습니다.");
      setUploadDescription("");
      setIsUploading(false);
      refetchAttachments();
    },
    onError: (err) => {
      toast.error(err.message || "업로드에 실패했습니다.");
      setIsUploading(false);
    },
  });

  // 첨부파일 삭제 뮤테이션
  const deleteAttachmentMutation = trpc.attachment.delete.useMutation({
    onSuccess: () => {
      toast.success("파일이 삭제되었습니다.");
      refetchAttachments();
    },
    onError: (err) => toast.error(err.message || "삭제에 실패했습니다."),
  });

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // data:mime/type;base64,... 에서 base64 부분만 추출
      const base64 = dataUrl.split(",")[1];
      uploadMutation.mutate({
        fileName:    file.name,
        fileType:    file.type,
        fileSize:    file.size,
        fileBase64:  base64,
        category:    uploadCategory as any,
        description: uploadDescription || undefined,
      });
    };
    reader.readAsDataURL(file);
    // input 초기화
    e.target.value = "";
  };

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
      // pdfUrl로 직접 다운로드 (S3 저장 방식)
      const a = document.createElement("a");
      a.href = data.pdfUrl;
      a.download = data.filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`${data.filename} 다운로드 완료${data.cached ? " (캐시)" : ""}`);
      setShowDownloadModal(false);
      setIsDownloading(false);
    },
    onError: (err) => {
      toast.error(err.message || "PDF 생성에 실패했습니다.");
      setIsDownloading(false);
    },
  });

  // 샘플 PDF 생성
  const samplePdfMutation = trpc.willCertificate.generateSamplePdf.useMutation({
    onSuccess: (data) => {
      const a = document.createElement("a");
      a.href = data.pdfUrl;
      a.download = data.filename;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`샘플 인증서 PDF 다운로드 완료`);
      setShowSampleModal(false);
      setIsSampleGenerating(false);
    },
    onError: (err) => {
      toast.error(err.message || "샘플 PDF 생성에 실패했습니다.");
      setIsSampleGenerating(false);
    },
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

  // 미리보기 시작 핸들러
  const handlePreview = useCallback((certId: number | null, isSample: boolean, country: string) => {
    setPreviewCertId(certId);
    setPreviewIsSample(isSample);
    setPreviewCountry(country);
    setPreviewBase64(null);
    setIsPreviewLoading(true);
    previewPdfMutation.mutate({
      certificateId: certId ?? undefined,
      country,
      isSample,
    });
  }, [previewPdfMutation]);

  // 미리보기 중 다운로드
  const handleDownloadFromPreview = useCallback(() => {
    if (!previewBase64 || !previewFilename) return;
    const byteChars = atob(previewBase64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
    const blob = new Blob([new Uint8Array(byteNums)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = previewFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("미리보기에서 PDF 다운로드 완료");
  }, [previewBase64, previewFilename]);

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSampleModal(true)}
            className="flex items-center gap-2 border border-[#C9A961] text-[#C9A961] px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#C9A961]/10 transition-colors"
          >
            <FileText className="w-4 h-4" />
            샘플 미리보기
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 bg-[#1F3864] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors"
          >
            <Plus className="w-4 h-4" />
            인증서 신청
          </button>
        </div>
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

      {/* 첨부파일 업로드 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-[#C9A961]" />
            <h2 className="font-bold text-[#1F3864] text-sm">증빙서류 첨부</h2>
          </div>
          <span className="text-xs text-gray-400">총 {attachments?.length ?? 0}건 · PDF 출력 시 자동 포함</span>
        </div>

        <div className="p-5 space-y-4">
          {/* 카테고리 선택 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">서류 종류</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setUploadCategory(key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      uploadCategory === key
                        ? "border-[#1F3864] bg-[#1F3864]/5 text-[#1F3864]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 설명 입력 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">서류 설명 (선택)</label>
            <input
              type="text"
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="예: 서울 강남구 아파트 등기부등본"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
            />
          </div>

          {/* 파일 업로드 버튼 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.heic"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-[#1F3864]/30 rounded-xl py-4 text-sm font-semibold text-[#1F3864] hover:border-[#1F3864]/60 hover:bg-[#1F3864]/5 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <><div className="w-4 h-4 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />업로드 중...</>
            ) : (
              <><Upload className="w-4 h-4" />파일 선택 (PDF, JPG, PNG · 최대 10MB)</>
            )}
          </button>

          {/* 업로드된 파일 목록 */}
          {attachments && attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">업로드된 서류</p>
              {attachments.map((att: any) => {
                const cfg = CATEGORY_CONFIG[att.category] ?? CATEGORY_CONFIG.other;
                const Icon = cfg.icon;
                return (
                  <div key={att.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{att.fileName}</p>
                        <p className="text-xs text-gray-400">{cfg.label}{att.description ? ` · ${att.description}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {att.verified === 1 && (
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />검토완료
                        </span>
                      )}
                      <button
                        onClick={() => deleteAttachmentMutation.mutate({ id: att.id })}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            업로드된 서류는 PDF 인증서 출력 시 모든 페이지에 EverWill 확인 스탬프와 함께 자동으로 포함됩니다.
          </p>
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
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handlePreview(cert.id, false, downloadCountry)}
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
                        <button
                          onClick={() => handleDownload(cert.id)}
                          className="flex items-center gap-1.5 text-xs bg-[#1F3864] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#162d52] transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </div>
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
      {/* 샘플 PDF 미리보기 모달 */}
      {showSampleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-[#C9A961]" />
              <h3 className="font-bold text-[#1F3864] text-base">샘플 인증서 PDF 미리보기</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              실제 등록된 자산정보와 상속자 데이터를 바탕으로 샘플 인증서를 생성합니다.
              데이터가 없으면 예시 데이터로 대체됩니다.
            </p>

            {/* 국가 선택 */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1F3864] mb-2">
                <Globe className="w-3.5 h-3.5 inline mr-1" />
                인증서 양식 국가
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {SUPPORTED_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSampleCountry(c.code)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      sampleCountry === c.code
                        ? "border-[#C9A961] bg-[#C9A961]/10 text-[#1F3864]"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-700">
                ⚠️ 샘플 문서입니다. 정식 인증서는 유언장 인증 완료 후 신청하세요.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowSampleModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowSampleModal(false);
                  handlePreview(null, true, sampleCountry);
                }}
                disabled={isPreviewLoading}
                className="flex-1 py-3 border border-[#1F3864] text-[#1F3864] rounded-xl text-sm font-semibold hover:bg-[#1F3864]/5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPreviewLoading ? (
                  <><div className="w-4 h-4 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />로딩 중...</>
                ) : (
                  <><Eye className="w-4 h-4" />미리보기</>
                )}
              </button>
              <button
                onClick={() => {
                  setIsSampleGenerating(true);
                  samplePdfMutation.mutate({ country: sampleCountry });
                }}
                disabled={isSampleGenerating}
                className="flex-1 py-3 bg-[#C9A961] text-white rounded-xl text-sm font-semibold hover:bg-[#b8944f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSampleGenerating ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />생성 중...</>
                ) : (
                  <><Download className="w-4 h-4" />다운로드</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* PDF 미리보기 모달 - 풀스크린 다이얼로그 */}
      <Dialog open={showPreviewModal} onOpenChange={(v) => { if (!v) { setShowPreviewModal(false); setPreviewBase64(null); setPreviewZoom(100); } }}>
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
                <h3 className="font-bold text-white text-sm">
                  {previewIsSample ? "샘플 인증서 미리보기" : "PDF 미리보기"}
                </h3>
                <p className="text-white/60 text-xs">{previewFilename || "로딩 중..."}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* 줄 배율 조절 */}
              <button
                onClick={() => setPreviewZoom((z) => Math.max(50, z - 25))}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                title="축소"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <span className="text-white/80 text-xs font-mono w-10 text-center">{previewZoom}%</span>
              <button
                onClick={() => setPreviewZoom((z) => Math.min(200, z + 25))}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                title="확대"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
              {/* 다운로드 버튼 */}
              {previewBase64 && (
                <button
                  onClick={handleDownloadFromPreview}
                  className="flex items-center gap-1.5 bg-[#C9A961] hover:bg-[#b8944f] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF 다운로드
                </button>
              )}
              {/* 닫기 버튼 */}
              <button
                onClick={() => { setShowPreviewModal(false); setPreviewBase64(null); setPreviewZoom(100); }}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* PDF 뷰어 영역 */}
          <div className="flex-1 bg-gray-100 overflow-hidden relative">
            {isPreviewLoading || !previewBase64 ? (
              /* 로딩 상태 */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
                <div className="text-center">
                  <p className="text-[#1F3864] font-semibold text-sm">PDF 생성 중...</p>
                  <p className="text-gray-400 text-xs mt-1">실제 데이터를 바탕으로 인증서를 생성하고 있습니다</p>
                </div>
              </div>
            ) : (
              /* PDF 렌더링 */
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
                    style={{ minHeight: "calc(90vh - 120px)", height: "calc(90vh - 120px)" }}
                  >
                    {/* 브라우저가 PDF 렌더링을 지원하지 않을 때 fallback */}
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
            <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white rounded-b-2xl">
              <div className="flex items-center gap-2">
                {previewIsSample && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700">
                    SAMPLE
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {SUPPORTED_COUNTRIES.find((c) => c.code === previewCountry)?.flag}{" "}
                  {SUPPORTED_COUNTRIES.find((c) => c.code === previewCountry)?.name} 양식
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowPreviewModal(false); setPreviewBase64(null); setPreviewZoom(100); }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
                <button
                  onClick={handleDownloadFromPreview}
                  className="flex items-center gap-1.5 bg-[#1F3864] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#162d52] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF 다운로드
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
