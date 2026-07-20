/**
 * 자산 인증 페이지 (/dashboard/asset-verify)
 * 4단계 마법사:
 *   1단계: 신분증 + 얼굴 사진 업로드
 *   2단계: 자산 서류 업로드 (부동산 등기부등본, 통장 잔액 사본 등)
 *   3단계: 본인 확인 동의 체크박스
 *   4단계: 전자 서명 (캔버스) + 제출
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Upload,
  Camera,
  FileText,
  ShieldCheck,
  PenLine,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  AlertCircle,
  Building2,
  Landmark,
  FileStack,
  FileCheck,
  TrendingUp,
} from "lucide-react";

// ─── 타입 ────────────────────────────────────────────────
type DocType =
  | "real_estate_registry"
  | "bank_statement"
  | "asset_list"
  | "insurance_policy"
  | "stock_statement"
  | "other";

interface UploadedDoc {
  id?: number;
  type: DocType;
  label: string;
  fileName: string;
  url: string;
}

// ─── 파일 → base64 변환 ──────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── 서류 유형 메타 ──────────────────────────────────────
const DOC_TYPES: { value: DocType; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "real_estate_registry", label: "부동산 등기부등본", icon: <Building2 className="w-5 h-5" />, desc: "부동산 소유권 확인 서류" },
  { value: "bank_statement",       label: "통장 잔액 사본",   icon: <Landmark className="w-5 h-5" />,  desc: "예금·적금 잔액 증명" },
  { value: "asset_list",           label: "자산내역서",       icon: <FileStack className="w-5 h-5" />, desc: "전체 자산 목록 정리 문서" },
  { value: "insurance_policy",     label: "보험증권",         icon: <FileCheck className="w-5 h-5" />, desc: "생명·손해보험 증권" },
  { value: "stock_statement",      label: "주식 잔고 증명",   icon: <TrendingUp className="w-5 h-5" />, desc: "증권사 잔고 확인서" },
  { value: "other",                label: "기타 서류",        icon: <FileText className="w-5 h-5" />,  desc: "그 외 자산 증빙 서류" },
];

// ─── 단계 인디케이터 ─────────────────────────────────────
const STEPS = [
  { label: "신분 확인",   icon: <Camera className="w-4 h-4" /> },
  { label: "자산 서류",   icon: <FileText className="w-4 h-4" /> },
  { label: "본인 동의",   icon: <ShieldCheck className="w-4 h-4" /> },
  { label: "서명 제출",   icon: <PenLine className="w-4 h-4" /> },
];

// ─── 메인 컴포넌트 ───────────────────────────────────────
export default function AssetVerifyPage() {
  const [step, setStep] = useState(1);

  // Step 1 상태
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);

  // Step 2 상태
  const [documents, setDocuments] = useState<UploadedDoc[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocType>("real_estate_registry");
  const [docLabel, setDocLabel] = useState("");

  // Step 3 상태
  const [consentChecked, setConsentChecked] = useState(false);

  // Step 4 상태
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // tRPC 뮤테이션 (모든 Hook은 조건부 return 이전에 선언)
  const uploadIdPhoto = trpc.assetVerify.uploadIdPhoto.useMutation();
  const uploadSelfie = trpc.assetVerify.uploadSelfie.useMutation();
  const uploadDocument = trpc.assetVerify.uploadDocument.useMutation();
  const deleteDocument = trpc.assetVerify.deleteDocument.useMutation();
  const submitVerification = trpc.assetVerify.submitVerification.useMutation();
  const { data: status, refetch } = trpc.assetVerify.getStatus.useQuery();
  // willAssetScans 테이블에서 기존 자산 서류 스캔 데이터 로드
  const { data: scansData } = trpc.willAuto.listAssetScans.useQuery();

  // 이미 제출된 경우 상태 반영
  useEffect(() => {
    if (status?.exists && 'idPhotoUrl' in status) {
      if (status.idPhotoUrl) setIdPhotoPreview(status.idPhotoUrl);
      if (status.selfieUrl) setSelfiePreview(status.selfieUrl as string);
      if (status.documents?.length) {
        setDocuments((status.documents as any[]).map((d) => ({
          id: d.id,
          type: d.type,
          label: d.label || d.fileName,
          fileName: d.fileName || "",
          url: d.fileUrl,
        })));
      }
    }
  }, [status]);

  // ── 서명 캔버스 헬퍼 (useCallback은 조건부 return 이전에 선언) ──
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1F3864";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
  }, [isDrawing]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  // ── 이미 승인/제출된 경우 완료 화면 ──
  if (status?.status === "approved") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[#1F3864] mb-2">자산 인증 완료</h2>
        <p className="text-gray-500">회원님의 자산 인증이 승인되었습니다.</p>
        <Badge className="mt-4 bg-green-100 text-green-700 border-green-200">인증 완료</Badge>
      </div>
    );
  }

  if (status?.status === "submitted" || status?.status === "reviewing") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <Loader2 className="w-16 h-16 text-[#C9A961] mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold text-[#1F3864] mb-2">검토 중</h2>
        <p className="text-gray-500">제출하신 서류를 검토하고 있습니다. 영업일 기준 1~3일 내 결과를 알려드립니다.</p>
        <Badge className="mt-4 bg-yellow-100 text-yellow-700 border-yellow-200">검토 중</Badge>
      </div>
    );
  }

  // ── 파일 업로드 핸들러 ──
  const handleIdPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(true);
    try {
      const base64 = await fileToBase64(file);
      setIdPhotoPreview(base64);
      await uploadIdPhoto.mutateAsync({ base64, mimeType: file.type });
      toast.success("신분증 사진이 업로드되었습니다.");
    } catch {
      toast.error("업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploadingId(false);
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSelfie(true);
    try {
      const base64 = await fileToBase64(file);
      setSelfiePreview(base64);
      await uploadSelfie.mutateAsync({ base64, mimeType: file.type });
      toast.success("얼굴 사진이 업로드되었습니다.");
    } catch {
      toast.error("업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploadingSelfie(false);
    }
  };

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingDoc(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await uploadDocument.mutateAsync({
        base64,
        mimeType: file.type,
        fileName: file.name,
        type: selectedDocType,
        label: docLabel || DOC_TYPES.find(d => d.value === selectedDocType)?.label || file.name,
      });
      setDocuments(prev => [...prev, {
        type: selectedDocType,
        label: docLabel || DOC_TYPES.find(d => d.value === selectedDocType)?.label || file.name,
        fileName: file.name,
        url: result.url,
      }]);
      setDocLabel("");
      toast.success("서류가 업로드되었습니다.");
      await refetch();
    } catch {
      toast.error("업로드에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDoc = async (index: number) => {
    const doc = documents[index];
    if (doc.id) {
      try {
        await deleteDocument.mutateAsync({ documentId: doc.id });
      } catch {}
    }
    setDocuments(prev => prev.filter((_, i) => i !== index));
    toast.success("서류가 삭제되었습니다.");
  };

  const clearSig = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  // ── 최종 제출 ──
  const handleSubmit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSig) {
      toast.error("서명을 입력해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const signatureBase64 = canvas.toDataURL("image/png");
      await submitVerification.mutateAsync({ signatureBase64, consentChecked });
      toast.success("자산 인증 서류가 제출되었습니다. 검토 후 결과를 알려드립니다.");
      await refetch();
    } catch (err: any) {
      toast.error(err?.message || "제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── 렌더링 ──────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F3864]">자산 인증 등록</h1>
        <p className="text-gray-500 mt-1 text-sm">
          신분증·얼굴 사진과 자산 서류를 등록하고 본인 확인 서명을 완료하면 인증이 신청됩니다.
        </p>
      </div>

      {/* 단계 인디케이터 */}
      <div className="flex items-center mb-8 gap-0">
        {STEPS.map((s, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <div key={num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all
                  ${isDone ? "bg-[#1F3864] border-[#1F3864] text-white" :
                    isActive ? "bg-[#C9A961] border-[#C9A961] text-white" :
                    "bg-white border-gray-200 text-gray-400"}`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? "text-[#C9A961]" : isDone ? "text-[#1F3864]" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 ${step > num ? "bg-[#1F3864]" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ── 1단계: 신분 확인 ── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              신분증 사진과 본인 얼굴 사진을 업로드해 주세요. 사진은 암호화되어 안전하게 보관됩니다.
            </p>
          </div>

          {/* 신분증 업로드 */}
          <div>
            <h3 className="font-semibold text-[#1F3864] mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#C9A961]" /> 신분증 사진
            </h3>
            <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
              ${idPhotoPreview ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#C9A961] bg-gray-50"}`}>
              {uploadingId ? (
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#C9A961]" />
              ) : idPhotoPreview ? (
                <div>
                  <img src={idPhotoPreview} alt="신분증" className="max-h-40 mx-auto rounded-lg object-contain mb-2" />
                  <span className="text-sm text-green-600 font-medium">✓ 업로드 완료 (클릭하여 교체)</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">주민등록증, 운전면허증, 여권 중 하나</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · 최대 10MB</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*,application/pdf"
                onChange={handleIdPhotoUpload} />
            </label>
          </div>

          {/* 얼굴 사진 업로드 */}
          <div>
            <h3 className="font-semibold text-[#1F3864] mb-3 flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#C9A961]" /> 본인 얼굴 사진 (셀피)
            </h3>
            <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
              ${selfiePreview ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-[#C9A961] bg-gray-50"}`}>
              {uploadingSelfie ? (
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#C9A961]" />
              ) : selfiePreview ? (
                <div>
                  <img src={selfiePreview} alt="셀피" className="max-h-40 mx-auto rounded-lg object-contain mb-2" />
                  <span className="text-sm text-green-600 font-medium">✓ 업로드 완료 (클릭하여 교체)</span>
                </div>
              ) : (
                <div>
                  <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">본인 얼굴이 잘 보이는 사진</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG · 최대 10MB</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*"
                onChange={handleSelfieUpload} />
            </label>
          </div>

          <Button
            className="w-full bg-[#1F3864] hover:bg-[#162a4e] text-white h-12"
            disabled={!idPhotoPreview || !selfiePreview}
            onClick={() => setStep(2)}
          >
            다음 단계 <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ── 2단계: 자산 서류 ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              보유하신 자산 유형에 맞는 서류를 업로드해 주세요. 여러 건 업로드 가능합니다.
            </p>
          </div>

          {/* 서류 유형 선택 */}
          <div>
            <h3 className="font-semibold text-[#1F3864] mb-3">서류 유형 선택</h3>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TYPES.map(dt => (
                <button
                  key={dt.value}
                  onClick={() => setSelectedDocType(dt.value)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm
                    ${selectedDocType === dt.value
                      ? "border-[#C9A961] bg-amber-50 text-[#1F3864] font-medium"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                >
                  <span className={selectedDocType === dt.value ? "text-[#C9A961]" : "text-gray-400"}>
                    {dt.icon}
                  </span>
                  <span>{dt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 설명 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">서류 설명 (선택)</label>
            <input
              type="text"
              value={docLabel}
              onChange={e => setDocLabel(e.target.value)}
              placeholder="예: 강남구 아파트 등기부등본"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A961]"
            />
          </div>

          {/* 파일 업로드 */}
          <label className="block border-2 border-dashed border-gray-300 hover:border-[#C9A961] rounded-xl p-6 text-center cursor-pointer transition-all bg-gray-50">
            {uploadingDoc ? (
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#C9A961]" />
            ) : (
              <div>
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  {DOC_TYPES.find(d => d.value === selectedDocType)?.label} 업로드
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF · 최대 20MB</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*,application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.hwp,.hwpx,.txt" onChange={handleDocUpload} />
          </label>

          {/* 유언장 작성 시 등록된 자산 서류 (willAssetScans) */}
          {scansData?.scans && scansData.scans.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#1F3864] mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                유언장에 등록된 자산 서류 ({scansData.scans.length}건)
              </h3>
              <p className="text-xs text-gray-500 mb-2">유언장 작성 시 업로드한 자산증명서입니다. 이미 인증에 포함됩니다.</p>
              <div className="space-y-2">
                {(scansData.scans as any[]).map((scan: any) => (
                  <div key={scan.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {scan.docTypeLabel || scan.assetName || '자산 서류'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {scan.issuer ? `${scan.issuer} · ` : ''}
                        {scan.amount ? `${Number(scan.amount).toLocaleString()}원` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">등록됨</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 추가 업로드된 서류 목록 */}
          {documents.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#1F3864] mb-2">추가 업로드된 서류 ({documents.length}건)</h3>
              <div className="space-y-2">
                {documents.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.label}</p>
                      <p className="text-xs text-gray-500">{DOC_TYPES.find(d => d.value === doc.type)?.label}</p>
                    </div>
                    <button onClick={() => handleDeleteDoc(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> 이전
            </Button>
            <Button
              className="flex-1 bg-[#1F3864] hover:bg-[#162a4e] text-white h-12"
              disabled={documents.length === 0 && !(scansData?.scans && scansData.scans.length > 0)}
              onClick={() => setStep(3)}
            >
              다음 단계 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── 3단계: 본인 동의 ── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl p-6">
            <h3 className="font-bold text-[#1F3864] mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C9A961]" /> 본인 확인 동의서
            </h3>
            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              <p>본인은 EverWill 자산 인증 서비스 이용과 관련하여 다음 사항에 동의합니다.</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li>제출한 신분증 및 자산 서류는 본인 소유임을 확인합니다.</li>
                <li>제출한 서류는 자산 인증 목적으로만 사용되며, 제3자에게 제공되지 않습니다.</li>
                <li>허위 서류 제출 시 서비스 이용이 제한될 수 있습니다.</li>
                <li>본인의 자산 정보는 암호화되어 안전하게 보관됩니다.</li>
                <li>인증 완료 후 유언장에 자산 정보가 자동으로 연동됩니다.</li>
              </ol>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-4 border-2 rounded-xl transition-all
            border-gray-200 hover:border-[#C9A961]"
            onClick={() => setConsentChecked(v => !v)}>
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
              ${consentChecked ? "bg-[#C9A961] border-[#C9A961]" : "border-gray-300"}`}>
              {consentChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
            </div>
            <div>
              <p className="font-semibold text-[#1F3864]">위 내용을 모두 확인하였으며, 본인 확인에 동의합니다.</p>
              <p className="text-sm text-gray-500 mt-1">동의 시 다음 단계에서 전자 서명을 진행합니다.</p>
            </div>
          </label>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(2)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> 이전
            </Button>
            <Button
              className="flex-1 bg-[#1F3864] hover:bg-[#162a4e] text-white h-12"
              disabled={!consentChecked}
              onClick={() => setStep(4)}
            >
              동의하고 서명하기 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ── 4단계: 전자 서명 ── */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
            <PenLine className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">
              아래 서명란에 마우스(또는 손가락)로 서명해 주세요. 서명 완료 후 제출 버튼을 눌러주세요.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#1F3864]">전자 서명</h3>
              <button onClick={clearSig} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1">
                <X className="w-4 h-4" /> 지우기
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={560}
              height={180}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl bg-white cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
            {!hasSig && (
              <p className="text-xs text-gray-400 text-center mt-2">여기에 서명해 주세요</p>
            )}
          </div>

          {/* 제출 요약 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-semibold text-[#1F3864] mb-2">제출 내용 확인</p>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              신분증 사진 업로드 완료
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              얼굴 사진 업로드 완료
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              자산 서류 {documents.length + (scansData?.scans?.length ?? 0)}건 업로드 완료
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              본인 확인 동의 완료
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(3)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> 이전
            </Button>
            <Button
              className="flex-1 bg-[#C9A961] hover:bg-[#b8954f] text-white h-12 font-semibold"
              disabled={!hasSig || submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 제출 중...</>
              ) : (
                <><ShieldCheck className="w-4 h-4 mr-2" /> 인증 신청 제출</>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
