/**
 * 자필 유언장 스캔 업로드 + AI 검증 페이지
 * 경로: /will/scan
 */
import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, XCircle, AlertCircle,
  Camera, FileImage, ArrowLeft, Sparkles, Shield
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { GradeGate } from "@/components/GradeGate";
import SaramDashboardLayout from "@/components/SaramDashboardLayout";

interface VerificationResult {
  isHandwritten: boolean;
  hasFullText: boolean;
  hasDate: boolean;
  hasAddress: boolean;
  hasName: boolean;
  hasSeal: boolean;
  isReadable: boolean;
  overallValid: boolean;
  missingItems: string[];
  warnings: string[];
  summary: string;
}

/**
 * 유언장 data JSON에서 willContent 텍스트를 추출해서 표시
 */
function WillPrintContent({ data }: { data: Record<string, unknown> }) {
  const willContent = (data.willContent as string) || "";
  if (!willContent.trim()) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 text-center">
        유언장 내용이 없습니다. 유언장 작성 4단계에서 내용을 작성·저장해주세요.
      </div>
    );
  }
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 font-mono text-sm leading-8 text-gray-800 whitespace-pre-line select-all print:bg-white print:border-0">
      {willContent}
    </div>
  );
}


export default function ScanVerifyPage() {
  const [, navigate] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAuth();

  // 최신 유언장 내용 불러오기 (자필 작성용)
  const { data: willForPrint, isLoading: willLoading } = trpc.will.getLatestWillForPrint.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 저장된 스캔 이미지 조회
  const { data: savedScan, refetch: refetchScan } = trpc.will.getScannedWill.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const saveScannedWill = trpc.will.saveScannedWill.useMutation({
    onSuccess: () => {
      toast.success("자필 유언장이 저장되었습니다.");
      refetchScan();
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  const deleteScannedWill = trpc.will.deleteScannedWill.useMutation({
    onSuccess: () => {
      toast.success("삭제되었습니다.");
      setSelectedFile(null);
      setPreviewUrl("");
      setResult(null);
      refetchScan();
    },
    onError: () => toast.error("삭제에 실패했습니다."),
  });

  const handleSave = () => {
    if (!selectedFile) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      saveScannedWill.mutate({ imageBase64: reader.result as string });
    };
    reader.readAsDataURL(selectedFile);
  };

  const verifyScan = trpc.will.verifyScan.useMutation({
    onSuccess: (data) => {
      if (data.success && data.verification) {
        setResult(data.verification as VerificationResult);
        if (data.verification.overallValid) {
          toast.success("유언장 검증 완료! 법적 요건을 충족합니다.");
        } else {
          toast.warning("일부 항목을 보완해야 합니다.");
        }
      } else {
        toast.error("검증에 실패했습니다. 다시 시도해주세요.");
      }
    },
    onError: () => {
      toast.error("이미지 분석 중 오류가 발생했습니다.");
    },
  });

  const handleFileSelect = (file: File) => {
    const allowed = file.type.startsWith("image/") || file.type === "application/pdf"
      || file.type.startsWith("application/vnd") || file.type.startsWith("application/msword")
      || /\.(pdf|doc|docx|xls|xlsx|hwp|hwpx|txt)$/i.test(file.name);
    if (!allowed) { toast.error("지원하지 않는 파일 형식입니다. (이미지·PDF·Word·Excel·HWP 가능)"); return; }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("파일 크기는 20MB 이하여야 합니다.");
      return;
    }
    setSelectedFile(file);
    setResult(null);
    const url = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
    setPreviewUrl(url || `__file__:${file.name}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      toast.error("이미지를 먼저 업로드해주세요.");
      return;
    }

    // Base64로 변환하여 전송
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      verifyScan.mutate({ imageUrl: base64 });
    };
    reader.readAsDataURL(selectedFile);
  };

  const CheckItem = ({ label, value }: { label: string; value: boolean }) => (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${value ? "bg-green-50" : "bg-red-50"}`}>
      {value
        ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      }
      <span className={`text-sm font-medium ${value ? "text-green-800" : "text-red-700"}`}>{label}</span>
    </div>
  );

  return (
    <SaramDashboardLayout>
    <GradeGate requiredGrade="platinum" featureName="자필 유언 스캔" description="자필 유언장 스캔 인증은 플래티넷 이상 회원만 이용할 수 있습니다." mode="block">
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/write")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">자필 유언장 AI 검증</h1>
            <p className="text-white/60 text-xs">한국 민법 제1066조 요건 자동 확인</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 안내 배너 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">자필증서 유언 필수 요건 (민법 제1066조)</p>
            <p>전문 자필 · 연월일 · 주소 · 성명 · 날인 — 5가지 모두 충족해야 법적 효력이 발생합니다.</p>
          </div>
        </div>

        {/* 내 유언장 내용 — 자필 작성용 */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="font-semibold text-[#1F3864] flex items-center gap-2">
              <span className="text-lg">📝</span>
              내 유언장 — 자필 작성용 양식
            </span>
            <button
              onClick={() => {
                const content = (willForPrint?.data as Record<string, unknown>)?.willContent as string || "";
                if (!content.trim()) return;
                const printWin = window.open("", "_blank", "width=800,height=900");
                if (!printWin) return;
                printWin.document.write(`
                  <html><head><title>유언장</title>
                  <style>
                    body { font-family: 'Malgun Gothic', serif; font-size: 14pt; line-height: 2.2; padding: 60px; white-space: pre-wrap; }
                    @media print { body { padding: 40px; } }
                  </style></head>
                  <body>${content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</body></html>
                `);
                printWin.document.close();
                printWin.focus();
                setTimeout(() => { printWin.print(); printWin.close(); }, 300);
              }}
              className="text-xs px-3 py-1.5 bg-[#1F3864] text-white rounded-lg hover:bg-[#162d52] transition-colors flex items-center gap-1"
            >
              🖨️ 인쇄
            </button>
          </div>

          {willLoading ? (
            <div className="px-5 py-8 text-center text-gray-400 text-sm">유언장 불러오는 중...</div>
          ) : !willForPrint ? (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-500 text-sm mb-3">작성된 유언장이 없습니다.</p>
              <button
                onClick={() => navigate("/write")}
                className="text-sm px-4 py-2 bg-[#C9A961] text-white rounded-lg hover:bg-[#b8944d] transition-colors"
              >
                유언장 작성하러 가기 →
              </button>
            </div>
          ) : (
            <div className="px-5 pb-5 space-y-4">
              {/* 유언장 제목 + 최종 수정일 */}
              <div className="pt-4 flex items-center justify-between">
                <p className="text-sm font-bold text-[#1F3864]">{willForPrint.title || "내 유언장"}</p>
                <p className="text-xs text-gray-400">
                  최종 수정: {willForPrint.updatedAt ? new Date(willForPrint.updatedAt).toLocaleDateString("ko-KR") : ""}
                </p>
              </div>

              {/* 자필 작성용 본문 — 유언장 data에서 생성 */}
              <WillPrintContent data={willForPrint.data as Record<string, unknown>} />

              {/* 안내 */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-xs text-amber-700">
                  ⚠️ 위 내용을 <strong>A4 흰 종이에 볼펜으로 직접 손으로</strong> 옮겨 쓰세요.
                  전문 자필 · 연월일 · 주소 · 성명 · 날인 5가지를 모두 포함해야 법적 효력이 발생합니다.
                </p>
              </div>

              {/* 5대 필수 요건 간략 */}
              <div className="grid grid-cols-5 gap-1.5">
                {["전문자필","연월일","주소","성명","날인"].map((item, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-[10px] font-bold text-[#1F3864]">{'①②③④⑤'[i]}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{item}</p>
                  </div>
                ))}
              </div>

              {/* 자주 하는 실수 */}
              <div>
                <p className="text-xs font-bold text-red-600 mb-1.5">❌ 자주 하는 실수 (무효 원인)</p>
                {["컴퓨터 작성 후 서명만 손으로 → 무효","날짜에서 일(日) 생략 → 무효","주소 없이 이름·도장만 → 무효","대리인이 대신 작성 → 무효"].map((item, i) => (
                  <p key={i} className="text-[11px] text-red-600 flex gap-1"><span>•</span>{item}</p>
                ))}
              </div>
            </div>
          )}
        </div>


        {/* 업로드 영역 */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#C9A961] bg-[#C9A961]/5"
              : previewUrl
              ? "border-[#1F3864]/30 bg-white"
              : "border-gray-300 hover:border-[#1F3864]/50 hover:bg-gray-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.hwp,.hwpx,.txt"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {previewUrl ? (
            <div className="space-y-3">
              <img
                src={previewUrl}
                alt="업로드된 유언장"
                className="max-h-80 mx-auto rounded-xl shadow-md object-contain"
              />
              <p className="text-sm text-gray-500">{selectedFile?.name}</p>
              <p className="text-xs text-[#1F3864] font-medium">클릭하여 다른 이미지로 교체</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                <FileImage className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">유언장 사진을 업로드하세요</p>
                <p className="text-sm text-gray-400">드래그 앤 드롭 또는 클릭하여 선택</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, HEIC · 최대 10MB</p>
              </div>
              <div className="flex justify-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Camera className="w-3.5 h-3.5" />
                  카메라 촬영
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Upload className="w-3.5 h-3.5" />
                  파일 선택
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 기존 저장된 스캔 이미지 */}
        {savedScan?.url && !selectedFile && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
            <p className="text-sm font-semibold text-[#1F3864] flex items-center gap-2">
              <Shield className="w-4 h-4" />
              저장된 자필 유언장
            </p>
            <img src={savedScan.url as string} alt="저장된 자필 유언장" className="max-h-60 mx-auto rounded-xl object-contain border" />
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border border-[#1F3864] text-[#1F3864] font-medium py-2.5 rounded-xl text-sm hover:bg-[#1F3864]/5 transition-colors"
              >
                새 이미지로 변경
              </button>
              <button
                onClick={() => deleteScannedWill.mutate()}
                disabled={deleteScannedWill.isPending}
                className="flex-1 border border-red-300 text-red-600 font-medium py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleteScannedWill.isPending ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        )}

        {/* 검증 + 저장 버튼 */}
        {selectedFile && (
          <div className="space-y-2">
            <button
              onClick={handleVerify}
              disabled={verifyScan.isPending}
              className="w-full bg-[#1F3864] hover:bg-[#162d52] disabled:opacity-60 text-white font-semibold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-base"
            >
              {verifyScan.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  AI가 유언장을 분석 중입니다...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  AI 법적 요건 검증하기
                </>
              )}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saveScannedWill.isPending}
                className="flex-1 bg-[#C9A961] hover:bg-[#b8954f] disabled:opacity-60 text-white font-semibold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                {saveScannedWill.isPending ? "저장 중..." : "클라우드에 저장"}
              </button>
              <button
                onClick={() => { setSelectedFile(null); setPreviewUrl(""); setResult(null); }}
                className="flex-1 border border-gray-300 text-gray-600 font-medium py-3 rounded-2xl text-sm hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 검증 결과 */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* 종합 결과 */}
              <div className={`rounded-2xl p-5 ${result.overallValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                <div className="flex items-center gap-3 mb-3">
                  {result.overallValid
                    ? <CheckCircle2 className="w-7 h-7 text-green-600" />
                    : <XCircle className="w-7 h-7 text-red-500" />
                  }
                  <div>
                    <p className={`font-bold text-lg ${result.overallValid ? "text-green-800" : "text-red-700"}`}>
                      {result.overallValid ? "법적 요건 충족" : "보완 필요"}
                    </p>
                    <p className={`text-sm ${result.overallValid ? "text-green-700" : "text-red-600"}`}>
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* 항목별 체크 */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h3 className="font-bold text-[#1F3864] mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  항목별 검증 결과
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <CheckItem label="자필 여부 (손으로 직접 작성)" value={result.isHandwritten} />
                  <CheckItem label="전문 기재 (유언 내용 전체 자필)" value={result.hasFullText} />
                  <CheckItem label="연월일 기재" value={result.hasDate} />
                  <CheckItem label="주소 기재" value={result.hasAddress} />
                  <CheckItem label="성명 기재" value={result.hasName} />
                  <CheckItem label="날인 (서명 또는 도장)" value={result.hasSeal} />
                  <CheckItem label="내용 판독 가능" value={result.isReadable} />
                </div>
              </div>

              {/* 누락 항목 */}
              {result.missingItems.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p className="font-semibold text-red-700 text-sm mb-2 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    누락된 항목
                  </p>
                  {result.missingItems.map((item, i) => (
                    <p key={i} className="text-red-600 text-sm flex gap-1.5">
                      <span>•</span>{item}
                    </p>
                  ))}
                </div>
              )}

              {/* 주의사항 */}
              {result.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <p className="font-semibold text-amber-700 text-sm mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    주의사항
                  </p>
                  {result.warnings.map((w, i) => (
                    <p key={i} className="text-amber-700 text-sm flex gap-1.5">
                      <span>•</span>{w}
                    </p>
                  ))}
                </div>
              )}


            </motion.div>
          )}
        </AnimatePresence>

        {/* 법적 고지 */}
        <p className="text-center text-xs text-gray-400 leading-relaxed">
          본 AI 검증은 참고용 정보 제공이며 법률 자문이 아닙니다.<br />
          최종 법적 효력 판단은 전문가에게 문의하시기 바랍니다.
        </p>
      </div>
    </div>
    </GradeGate>
    </SaramDashboardLayout>
  );
}
