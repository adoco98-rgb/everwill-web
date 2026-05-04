/**
 * EverWill 서명 및 인증 단계 (Step 10)
 * 6단계 흐름:
 * 1단계: 신분증 스캔 (AI OCR 자동인식)
 * 2단계: 자산 정보 입력 (부동산/금융/기타)
 * 3단계: 관련 서류 파일 업로드
 * 4단계: SMS OTP 재인증 (등록 휴대폰으로 재발송)
 * 5단계: 손글씨 전자서명
 * 6단계: 결제
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle2, Clock, Hash, CreditCard, FileDown, Lock, Pen, Trash2,
  RotateCcw, ScanLine, Upload, Camera, X, Loader2, IdCard, Building2,
  Banknote, Package, Plus, ChevronRight, Phone, KeyRound, FileText, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { StepProps } from "./StepProps";

// ─── 타입 정의 ───────────────────────────────────────────────
type SignStep = "id_scan" | "assets" | "documents" | "sms_reauth" | "signature" | "payment";

interface AssetItem {
  id: string;
  category: "real_estate" | "financial" | "other";
  description: string;
  estimatedValue: string;
  country: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  size: number;
}

// ─── 단계 메타 데이터 ─────────────────────────────────────────
const STEPS: { key: SignStep; label: string; icon: React.ReactNode }[] = [
  { key: "id_scan",    label: "신분증 인증",  icon: <IdCard className="w-3.5 h-3.5" /> },
  { key: "assets",     label: "자산 입력",    icon: <Banknote className="w-3.5 h-3.5" /> },
  { key: "documents",  label: "서류 업로드",  icon: <FileText className="w-3.5 h-3.5" /> },
  { key: "sms_reauth", label: "본인 재인증",  icon: <Phone className="w-3.5 h-3.5" /> },
  { key: "signature",  label: "전자서명",     icon: <Pen className="w-3.5 h-3.5" /> },
  { key: "payment",    label: "결제",         icon: <CreditCard className="w-3.5 h-3.5" /> },
];

const STEP_ORDER: SignStep[] = ["id_scan", "assets", "documents", "sms_reauth", "signature", "payment"];

// ─── 서명 캔버스 컴포넌트 ─────────────────────────────────────
function SignatureCanvas({ onSigned, onClear, isSigned }: {
  onSigned: (dataUrl: string) => void;
  onClear: () => void;
  isSigned: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = "#1F3864";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    if (lastPos.current) {
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas) onSigned(canvas.toDataURL("image/png"));
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-[#1F3864] flex items-center gap-1.5">
          <Pen className="w-4 h-4" />
          손글씨 서명
        </p>
        <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
          지우기
        </button>
      </div>
      <div className="relative rounded-xl border-2 border-dashed border-[#C9A961]/50 bg-[#FFFDF7] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-36 cursor-crosshair touch-none"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        {!isSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[#C9A961]/40 text-sm font-medium select-none">여기에 서명하세요</p>
          </div>
        )}
        {isSigned && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            서명 완료
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">마우스 또는 터치로 서명해 주세요</p>
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function Step10Sign({ will }: StepProps) {
  const [signStep, setSignStep] = useState<SignStep>("id_scan");
  const completedSteps = useRef<Set<SignStep>>(new Set());

  // ── 1단계: 신분증 스캔 상태 ──
  const [showIdScan, setShowIdScan] = useState(false);
  const [idScanPreview, setIdScanPreview] = useState<string | null>(null);
  const [idScanResult, setIdScanResult] = useState<{
    name: string | null;
    idNumber: string | null;
    idNumberLabel: string | null;
    birthDate: string | null;
    country: string | null;
    docType: string;
    confidence: string;
  } | null>(null);
  const idFileInputRef = useRef<HTMLInputElement>(null);
  const idCameraInputRef = useRef<HTMLInputElement>(null);

  // ── 2단계: 자산 입력 상태 ──
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [newAsset, setNewAsset] = useState<Omit<AssetItem, "id">>({
    category: "real_estate",
    description: "",
    estimatedValue: "",
    country: "KR",
  });

  // ── 3단계: 파일 업로드 상태 ──
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // ── 4단계: SMS 재인증 상태 ──
  const [reauthOtpSent, setReauthOtpSent] = useState(false);
  const [reauthMaskedPhone, setReauthMaskedPhone] = useState("");
  const [reauthCode, setReauthCode] = useState("");
  const [reauthVerified, setReauthVerified] = useState(false);
  const [reauthResendTimer, setReauthResendTimer] = useState(0);

  // ── 5단계: 전자서명 상태 ──
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [isSigned, setIsSigned] = useState(false);

  // ── 6단계: 완료 상태 ──
  const [timestamp, setTimestamp] = useState("");
  const [secureHash, setSecureHash] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);

  const totalPrice = 49000 + (will.hasVideoWill ? 29000 : 0) + (will.hasHandwrittenScan ? 19000 : 0);

  // ── tRPC 뮤테이션 ──
  const idScanMutation = trpc.idScan.scanId.useMutation({
    onSuccess: (data) => {
      setIdScanResult(data.data);
      toast.success("신분증 자동 인식 완료!");
    },
    onError: (err) => {
      toast.error(err.message || "신분증 인식에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const sendReauthOtpMutation = trpc.auth.email.sendReauthOtp.useMutation({
    onSuccess: (data) => {
      setReauthOtpSent(true);
      setReauthMaskedPhone(data.maskedPhone);
      setReauthResendTimer(60);
      toast.success(`인증번호가 ${data.maskedPhone}으로 발송되었습니다.`);
    },
    onError: (err) => {
      toast.error(err.message || "SMS 발송에 실패했습니다.");
    },
  });

  const verifyReauthOtpMutation = trpc.auth.email.verifyReauthOtp.useMutation({
    onSuccess: () => {
      setReauthVerified(true);
      completedSteps.current.add("sms_reauth");
      toast.success("본인 재인증 완료!");
    },
    onError: (err) => {
      toast.error(err.message || "인증 코드가 올바르지 않습니다.");
    },
  });

  // ── 재발송 타이머 ──
  useEffect(() => {
    if (reauthResendTimer <= 0) return;
    const timer = setTimeout(() => setReauthResendTimer(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [reauthResendTimer]);

  // ── 단계 이동 헬퍼 ──
  const goToStep = (step: SignStep) => {
    completedSteps.current.add(signStep);
    setSignStep(step);
  };

  const getStepIndex = (step: SignStep) => STEP_ORDER.indexOf(step);
  const currentIndex = getStepIndex(signStep);

  // ── 신분증 이미지 처리 ──
  async function handleIdImageSelect(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("이미지 파일만 업로드 가능합니다."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("파일 크기는 10MB 이하여야 합니다."); return; }
    const reader = new FileReader();
    reader.onload = (e) => setIdScanPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    const base64Reader = new FileReader();
    base64Reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      idScanMutation.mutate({ imageUrl: dataUrl });
    };
    base64Reader.readAsDataURL(file);
  }

  // ── 자산 추가 ──
  function handleAddAsset() {
    if (!newAsset.description.trim()) { toast.error("자산 설명을 입력해주세요."); return; }
    setAssets(prev => [...prev, { ...newAsset, id: Date.now().toString() }]);
    setNewAsset({ category: "real_estate", description: "", estimatedValue: "", country: "KR" });
    toast.success("자산이 추가되었습니다.");
  }

  // ── 서류 업로드 ──
  function handleDocUpload(file: File) {
    if (file.size > 20 * 1024 * 1024) { toast.error("파일 크기는 20MB 이하여야 합니다."); return; }
    setUploadedDocs(prev => [...prev, {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
    }]);
    toast.success(`${file.name} 업로드 완료`);
  }

  // ── 결제 처리 ──
  function handlePayment() {
    const ts = new Date().toISOString();
    const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    setTimestamp(ts);
    setSecureHash(hash);
    setPaymentDone(true);
    toast.success("결제 완료! 유언장 인증이 완료되었습니다.");
  }

  // ─────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-4 bg-[#1F3864]/5 rounded-xl">
        <Lock className="w-5 h-5 text-[#1F3864]" />
        <div>
          <p className="font-semibold text-[#1F3864] text-sm">전자 인증 및 결제</p>
          <p className="text-gray-400 text-xs">신분증 인증 → 자산 입력 → 서류 업로드 → SMS 재인증 → 전자서명 → 결제</p>
        </div>
      </div>

      {/* 단계 진행 표시 */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps.current.has(step.key) || getStepIndex(step.key) < currentIndex;
          const isCurrent = step.key === signStep;
          return (
            <div key={step.key} className="flex items-center gap-1 flex-shrink-0">
              <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-all ${
                isCompleted ? "bg-green-100 text-green-700" :
                isCurrent ? "bg-[#1F3864] text-white" :
                "bg-gray-100 text-gray-400"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.icon}
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{idx + 1}</span>
              </div>
              {idx < STEPS.length - 1 && <div className="w-3 h-px bg-gray-200 flex-shrink-0" />}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── 1단계: 신분증 스캔 ─── */}
        {signStep === "id_scan" && (
          <motion.div key="id_scan" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <IdCard className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-blue-800 text-sm">신분증 / 여권 자동 인식</p>
                <p className="text-xs text-blue-600">한국, 일본, 미국, 중국 등 전 세계 신분증 지원. AI가 자동으로 정보를 인식합니다.</p>
              </div>
            </div>

            {!idScanPreview ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => idCameraInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-200 hover:border-[#1F3864] bg-white transition-all">
                  <Camera className="w-8 h-8 text-[#1F3864]" />
                  <span className="text-sm font-semibold text-[#1F3864]">카메라 촬영</span>
                  <span className="text-xs text-gray-400">실시간 촬영 (모바일)</span>
                </button>
                <button onClick={() => idFileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-gray-200 hover:border-[#1F3864] bg-white transition-all">
                  <Upload className="w-8 h-8 text-[#1F3864]" />
                  <span className="text-sm font-semibold text-[#1F3864]">파일 업로드</span>
                  <span className="text-xs text-gray-400">사진 선택 (PC/모바일)</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <img src={idScanPreview} alt="신분증 미리보기" className="w-full h-44 object-cover rounded-xl border-2 border-[#C9A961]" />
                <button onClick={() => { setIdScanPreview(null); setIdScanResult(null); }}
                  className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-red-50 shadow">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            )}

            <input ref={idFileInputRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleIdImageSelect(f); }} />
            <input ref={idCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleIdImageSelect(f); }} />

            {idScanMutation.isPending && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-700">신분증 자동 인식 중...</span>
              </div>
            )}

            {idScanResult && (
              <div className="bg-white border-2 border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">자동 인식 완료 — 오류가 있으면 수정하세요</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${
                    idScanResult.confidence === 'high' ? 'bg-green-100 text-green-700' :
                    idScanResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>신뢰도: {idScanResult.confidence === 'high' ? '높음' : idScanResult.confidence === 'medium' ? '중간' : '낮음'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">이름</label>
                    <input type="text" value={idScanResult.name || ''} onChange={(e) => setIdScanResult(p => p ? { ...p, name: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-[#1F3864]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">{idScanResult.idNumberLabel || '신분증 번호'}</label>
                    <input type="text" value={idScanResult.idNumber || ''} onChange={(e) => setIdScanResult(p => p ? { ...p, idNumber: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#1F3864]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">생년월일</label>
                    <input type="text" value={idScanResult.birthDate || ''} onChange={(e) => setIdScanResult(p => p ? { ...p, birthDate: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">국가</label>
                    <input type="text" value={idScanResult.country || ''} onChange={(e) => setIdScanResult(p => p ? { ...p, country: e.target.value } : p)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => goToStep("assets")}
                disabled={!idScanResult}
                className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  idScanResult ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                <ChevronRight className="w-4 h-4" />
                {idScanResult ? "인증 완료 — 자산 입력으로" : "신분증을 먼저 스캔해주세요"}
              </button>
              {!idScanResult && (
                <button onClick={() => goToStep("assets")}
                  className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                  건너뛰기
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── 2단계: 자산 입력 ─── */}
        {signStep === "assets" && (
          <motion.div key="assets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Banknote className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-800 text-sm">자산 정보 입력</p>
                <p className="text-xs text-amber-600">부동산, 금융자산, 기타 자산을 입력해주세요. 모든 국가 자산 입력 가능합니다.</p>
              </div>
            </div>

            {/* 자산 목록 */}
            {assets.length > 0 && (
              <div className="space-y-2">
                {assets.map(asset => (
                  <div key={asset.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      asset.category === 'real_estate' ? 'bg-blue-100' :
                      asset.category === 'financial' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {asset.category === 'real_estate' ? <Building2 className="w-4 h-4 text-blue-600" /> :
                       asset.category === 'financial' ? <Banknote className="w-4 h-4 text-green-600" /> :
                       <Package className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{asset.description}</p>
                      <p className="text-xs text-gray-400">{asset.country} · {asset.estimatedValue || '금액 미입력'}</p>
                    </div>
                    <button onClick={() => setAssets(prev => prev.filter(a => a.id !== asset.id))}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 자산 추가 폼 */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-[#1F3864]">자산 추가</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "real_estate", label: "부동산", icon: <Building2 className="w-4 h-4" /> },
                  { value: "financial", label: "금융자산", icon: <Banknote className="w-4 h-4" /> },
                  { value: "other", label: "기타", icon: <Package className="w-4 h-4" /> },
                ].map(cat => (
                  <button key={cat.value} onClick={() => setNewAsset(p => ({ ...p, category: cat.value as AssetItem["category"] }))}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${
                      newAsset.category === cat.value ? 'border-[#1F3864] bg-[#1F3864] text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'
                    }`}>
                    {cat.icon}{cat.label}
                  </button>
                ))}
              </div>
              <input type="text" placeholder="자산 설명 (예: 서울 강남구 아파트, 국민은행 예금)" value={newAsset.description}
                onChange={(e) => setNewAsset(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="예상 가액 (예: ₩500,000,000)" value={newAsset.estimatedValue}
                  onChange={(e) => setNewAsset(p => ({ ...p, estimatedValue: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]" />
                <select value={newAsset.country} onChange={(e) => setNewAsset(p => ({ ...p, country: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] bg-white">
                  <option value="KR">🇰🇷 한국</option>
                  <option value="JP">🇯🇵 일본</option>
                  <option value="US">🇺🇸 미국</option>
                  <option value="CN">🇨🇳 중국</option>
                  <option value="GB">🇬🇧 영국</option>
                  <option value="DE">🇩🇪 독일</option>
                  <option value="FR">🇫🇷 프랑스</option>
                  <option value="AU">🇦🇺 호주</option>
                  <option value="CA">🇨🇦 캐나다</option>
                  <option value="SG">🇸🇬 싱가포르</option>
                  <option value="AE">🇦🇪 UAE</option>
                  <option value="OTHER">🌍 기타</option>
                </select>
              </div>
              <button onClick={handleAddAsset}
                className="w-full py-2.5 rounded-lg border-2 border-dashed border-[#C9A961] text-[#C9A961] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#C9A961]/5 transition-all">
                <Plus className="w-4 h-4" />
                자산 추가
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSignStep("id_scan")} className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button onClick={() => goToStep("documents")}
                className="flex-1 btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {assets.length > 0 ? `자산 ${assets.length}개 등록 완료 — 서류 업로드로` : "건너뛰기 — 서류 업로드로"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 3단계: 서류 업로드 ─── */}
        {signStep === "documents" && (
          <motion.div key="documents" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-purple-800 text-sm">관련 서류 업로드</p>
                <p className="text-xs text-purple-600">부동산 등기부등본, 통장 잔액증명서, 보험증권 등 자산 관련 서류를 업로드해주세요.</p>
              </div>
            </div>

            {/* 업로드된 파일 목록 */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                {uploadedDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl">
                    <FileText className="w-5 h-5 text-[#1F3864] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-400">{(doc.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setUploadedDocs(prev => prev.filter(d => d.id !== doc.id))}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 업로드 버튼 */}
            <button onClick={() => docFileInputRef.current?.click()}
              className="w-full py-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-[#1F3864] bg-gray-50 hover:bg-[#1F3864]/5 transition-all flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-600">파일을 클릭하여 업로드</p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOCX 지원 · 최대 20MB</p>
              </div>
            </button>
            <input ref={docFileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" multiple className="hidden"
              onChange={(e) => { Array.from(e.target.files || []).forEach(handleDocUpload); }} />

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-600 mb-2">권장 서류 목록</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
                {["부동산 등기부등본", "통장 잔액증명서", "보험증권", "주식 잔고증명서", "자산내역서", "기타 증빙서류"].map(doc => (
                  <div key={doc} className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A961]" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSignStep("assets")} className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button onClick={() => goToStep("sms_reauth")}
                className="flex-1 btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {uploadedDocs.length > 0 ? `서류 ${uploadedDocs.length}개 업로드 완료 — 본인 재인증으로` : "건너뛰기 — 본인 재인증으로"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 4단계: SMS OTP 재인증 ─── */}
        {signStep === "sms_reauth" && (
          <motion.div key="sms_reauth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <Shield className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-red-800 text-sm">본인 재인증 (필수)</p>
                <p className="text-xs text-red-600">유언장은 법적 효력이 있는 중요 문서입니다. 등록된 휴대폰으로 인증번호를 받아 본인을 재확인합니다.</p>
              </div>
            </div>

            {!reauthVerified ? (
              <div className="space-y-4">
                {!reauthOtpSent ? (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#1F3864]" />
                      <div>
                        <p className="text-sm font-semibold text-[#1F3864]">등록된 휴대폰으로 인증번호 발송</p>
                        <p className="text-xs text-gray-400">프로필에 등록된 휴대폰 번호로 6자리 인증번호가 발송됩니다.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => sendReauthOtpMutation.mutate()}
                      disabled={sendReauthOtpMutation.isPending}
                      className="w-full btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      {sendReauthOtpMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />발송 중...</>
                      ) : (
                        <><Phone className="w-4 h-4" />인증번호 발송</>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-sm font-semibold text-green-800">📱 {reauthMaskedPhone}으로 인증번호가 발송되었습니다.</p>
                      <p className="text-xs text-green-600 mt-1">6자리 인증번호를 입력해주세요.</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block font-semibold">인증번호 6자리</label>
                      <input
                        type="tel" maxLength={6} value={reauthCode}
                        onChange={(e) => setReauthCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-[#1F3864]"
                      />
                    </div>
                    <button
                      onClick={() => verifyReauthOtpMutation.mutate({ code: reauthCode })}
                      disabled={reauthCode.length !== 6 || verifyReauthOtpMutation.isPending}
                      className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        reauthCode.length === 6 && !verifyReauthOtpMutation.isPending ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}>
                      {verifyReauthOtpMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />인증 중...</>
                      ) : (
                        <><KeyRound className="w-4 h-4" />인증 확인</>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setReauthOtpSent(false); setReauthCode(""); }}
                        disabled={reauthResendTimer > 0}
                        className={`text-xs ${reauthResendTimer > 0 ? "text-gray-300" : "text-[#1F3864] hover:underline"}`}>
                        {reauthResendTimer > 0 ? `재발송 (${reauthResendTimer}초 후)` : "인증번호 재발송"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="font-bold text-green-800 text-lg">본인 재인증 완료!</p>
                <p className="text-green-600 text-sm mt-1">신원이 확인되었습니다. 전자서명을 진행해주세요.</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSignStep("documents")} className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              {reauthVerified && (
                <button onClick={() => goToStep("signature")}
                  className="flex-1 btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  전자서명으로
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ─── 5단계: 전자서명 ─── */}
        {signStep === "signature" && (
          <motion.div key="signature" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-[#1F3864]/5 rounded-xl">
              <Pen className="w-6 h-6 text-[#1F3864] flex-shrink-0" />
              <div>
                <p className="font-bold text-[#1F3864] text-sm">손글씨 전자서명</p>
                <p className="text-xs text-gray-400">마우스 또는 손가락으로 서명해주세요. 서명은 RFC 3161 타임스탬프로 기록됩니다.</p>
              </div>
            </div>

            <SignatureCanvas onSigned={(url) => { setSignatureDataUrl(url); setIsSigned(true); }} onClear={() => { setSignatureDataUrl(""); setIsSigned(false); }} isSigned={isSigned} />

            {isSigned && signatureDataUrl && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#C9A961]/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#1F3864] mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  서명 미리보기
                </p>
                <img src={signatureDataUrl} alt="서명 미리보기" className="h-16 object-contain border border-gray-100 rounded-lg bg-[#FFFDF7] w-full" />
                <button onClick={() => { setSignatureDataUrl(""); setIsSigned(false); }}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
                  <RotateCcw className="w-3 h-3" />
                  다시 서명하기
                </button>
              </motion.div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
              <p className="font-semibold text-gray-700 mb-1">서명 전 확인사항</p>
              <ul className="space-y-1">
                <li>• 본인이 자유로운 의사로 작성한 유언장임을 확인합니다.</li>
                <li>• 인증 완료 시 RFC 3161 타임스탬프 및 Polygon 분산 암호화 보안에 기록됩니다.</li>
                <li>• 서명 후 수정 시 재인증(₩15,000)이 필요합니다.</li>
                <li>• 법적 효력은 전자 인증 결제(₩49,000) 완료 후 발생합니다.</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSignStep("sms_reauth")} className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button onClick={() => { if (!isSigned) { toast.error("먼저 서명을 완료해주세요."); return; } goToStep("payment"); }}
                disabled={!isSigned}
                className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isSigned ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                <CreditCard className="w-4 h-4" />
                {isSigned ? "서명 완료 — 결제로" : "먼저 서명을 완료해주세요"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 6단계: 결제 ─── */}
        {signStep === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {!paymentDone ? (
              <>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
                  <p className="font-bold text-[#1F3864] text-sm mb-3">결제 내역</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">전자 인증</span>
                      <span className="font-semibold">₩49,000</span>
                    </div>
                    {will.hasVideoWill && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">영상 유언</span>
                        <span className="font-semibold">₩29,000</span>
                      </div>
                    )}
                    {will.hasHandwrittenScan && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">자필 스캔 인증</span>
                        <span className="font-semibold">₩19,000</span>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-[#1F3864]">
                      <span>합계</span>
                      <span>₩{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 완료된 단계 요약 */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">인증 완료 항목</p>
                  {[
                    { label: "신분증 인증", done: !!idScanResult },
                    { label: `자산 등록 (${assets.length}개)`, done: assets.length > 0 },
                    { label: `서류 업로드 (${uploadedDocs.length}개)`, done: uploadedDocs.length > 0 },
                    { label: "SMS 본인 재인증", done: reauthVerified },
                    { label: "전자서명", done: isSigned },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      {item.done
                        ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : <AlertCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                      <span className={item.done ? "text-gray-700" : "text-gray-400"}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <button onClick={handlePayment}
                  className="w-full btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  결제하기 — ₩{totalPrice.toLocaleString()}
                </button>
                <button onClick={() => toast.info("PDF 생성 중... (서비스 준비 중)")}
                  className="w-full border-2 border-[#1F3864] text-[#1F3864] py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1F3864]/5 transition-all">
                  <FileDown className="w-4 h-4" />
                  유언장 PDF 미리보기
                </button>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-green-800 text-xl mb-2">유언장 인증 완료!</h3>
                  <p className="text-green-600 text-sm">서명 타임스탬프가 분산 암호화 보안에 기록되었습니다.<br />인증서가 이메일로 발송됩니다.</p>
                </div>

                {signatureDataUrl && (
                  <div className="bg-white border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#1F3864] mb-2">등록된 서명</p>
                    <img src={signatureDataUrl} alt="등록된 서명" className="h-16 object-contain border border-gray-100 rounded-lg bg-[#FFFDF7] w-full" />
                  </div>
                )}

                <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-[#C9A961]" />
                    <span className="text-gray-500">인증 일시:</span>
                    <span className="font-mono text-xs text-[#1F3864] ml-auto">{new Date(timestamp).toLocaleString("ko-KR")}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <Hash className="w-4 h-4 text-[#C9A961] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500 flex-shrink-0">암호화 해시:</span>
                    <span className="font-mono text-xs text-[#1F3864] break-all ml-auto">{secureHash.slice(0, 20)}...</span>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400">
                  결제 완료 후 법적 효력이 발생하며, 인증서가 이메일로 발송됩니다.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
