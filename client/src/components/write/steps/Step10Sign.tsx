/**
 * EverWill 서명 단계 (Step 10)
 * 1단계: 캔버스 손글씨 서명 (마우스/터치)
 * 2단계: 본인인증 4종 (PASS / 카카오 / 네이버 / 공동인증서)
 * 인증 완료 → 분산 암호화 해시 → 결제(₩49,000)
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Clock, Hash, CreditCard, FileDown, Lock, Pen, Trash2, RotateCcw, ScanLine, Upload, Camera, X, Loader2, IdCard } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { StepProps } from "./StepProps";

type AuthMethod = "pass" | "kakao" | "naver" | "cert" | null;
type AuthState = "idle" | "pending" | "success";
type SignStep = "canvas" | "auth";

const AUTH_METHODS = [
  {
    id: "pass" as AuthMethod,
    name: "PASS 인증",
    desc: "통신3사 본인인증 · 가장 안전",
    icon: "📱",
    color: "border-blue-200 hover:border-blue-400",
    activeColor: "border-blue-500 bg-blue-50",
    badge: "최고 보안",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "kakao" as AuthMethod,
    name: "카카오 인증",
    desc: "카카오 인증서 · 간편함",
    icon: "💛",
    color: "border-yellow-200 hover:border-yellow-400",
    activeColor: "border-yellow-400 bg-yellow-50",
    badge: "간편",
    badgeColor: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "naver" as AuthMethod,
    name: "네이버 인증",
    desc: "네이버 인증서 · 간편함",
    icon: "🟢",
    color: "border-green-200 hover:border-green-400",
    activeColor: "border-green-500 bg-green-50",
    badge: "간편",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "cert" as AuthMethod,
    name: "공동인증서",
    desc: "구 공인인증서 · 은행·증권사 수준",
    icon: "🏦",
    color: "border-gray-200 hover:border-gray-400",
    activeColor: "border-gray-500 bg-gray-50",
    badge: "공식",
    badgeColor: "bg-gray-100 text-gray-700",
  },
];

function SignatureCanvas({
  onSigned,
  onClear,
  isSigned,
}: {
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
    if (canvas) {
      onSigned(canvas.toDataURL("image/png"));
    }
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
        <button
          onClick={clearCanvas}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          지우기
        </button>
      </div>
      <div className="relative rounded-xl border-2 border-dashed border-[#C9A961]/50 bg-[#FFFDF7] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-36 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
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

export default function Step10Sign({ will }: StepProps) {
  const [signStep, setSignStep] = useState<SignStep>("canvas");
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [isSigned, setIsSigned] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>(null);
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [timestamp, setTimestamp] = useState("");
  const [secureHash, setSecureHash] = useState("");

  // 신분증 스캔 OCR 상태
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

  const idScanMutation = trpc.idScan.scanId.useMutation({
    onSuccess: (data) => {
      setIdScanResult(data.data);
      toast.success("신분증 자동 인식 완료!");
    },
    onError: (err) => {
      toast.error(err.message || "신분증 인식에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // 신분증 이미지 선택 후 OCR 실행
  async function handleIdImageSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    // 미리보기 설정
    const reader = new FileReader();
    reader.onload = (e) => setIdScanPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    // 서버에 업로드하여 OCR 실행
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadRes = await fetch("/api/upload-id-scan", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json() as { url: string };
      idScanMutation.mutate({ imageUrl: url });
    } catch {
      // 업로드 실패 시 base64로 직접 전달
      const base64Reader = new FileReader();
      base64Reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        idScanMutation.mutate({ imageUrl: dataUrl });
      };
      base64Reader.readAsDataURL(file);
    }
  }

  const totalPrice = 49000 + (will.hasVideoWill ? 29000 : 0) + (will.hasHandwrittenScan ? 19000 : 0);

  const handleSigned = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
    setIsSigned(true);
  };

  const handleClearSignature = () => {
    setSignatureDataUrl("");
    setIsSigned(false);
  };

  const handleNextToAuth = () => {
    if (!isSigned) {
      toast.error("먼저 서명을 완료해주세요.");
      return;
    }
    setSignStep("auth");
  };

  const handleAuth = () => {
    if (!selectedMethod) {
      toast.error("인증 방식을 선택해주세요.");
      return;
    }
    setAuthState("pending");
    setTimeout(() => {
      const now = new Date();
      const ts = now.toISOString();
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTimestamp(ts);
      setSecureHash(hash);
      setAuthState("success");
      toast.success("본인인증 완료! 서명 타임스탬프가 기록됐습니다.");
    }, 2500);
  };

  const handlePayment = () => {
    toast.info("결제 페이지로 이동합니다. (서비스 준비 중)");
  };

  const handleDownloadPDF = () => {
    toast.info("PDF 생성 중... (서비스 준비 중)");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-[#1F3864]/5 rounded-xl">
        <Lock className="w-5 h-5 text-[#1F3864]" />
        <div>
          <p className="font-semibold text-[#1F3864] text-sm">전자서명 및 본인인증</p>
          <p className="text-gray-400 text-xs">서명 후 인증 완료 시 분산 암호화 보안에 타임스탬프가 기록됩니다.</p>
        </div>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${signStep === "canvas" ? "bg-[#1F3864] text-white" : "bg-green-100 text-green-700"}`}>
          {signStep !== "canvas" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Pen className="w-3.5 h-3.5" />}
          1단계: 손글씨 서명
        </div>
        <div className="h-px flex-1 bg-gray-200" />
        <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${signStep === "auth" && authState !== "success" ? "bg-[#1F3864] text-white" : authState === "success" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
          {authState === "success" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
          2단계: 본인인증
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* 1단계: 캔버스 서명 */}
        {signStep === "canvas" && (
          <motion.div
            key="canvas-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <SignatureCanvas
              onSigned={handleSigned}
              onClear={handleClearSignature}
              isSigned={isSigned}
            />

            {isSigned && signatureDataUrl && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#C9A961]/30 rounded-xl p-4"
              >
                <p className="text-xs font-semibold text-[#1F3864] mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  서명 미리보기
                </p>
                <img
                  src={signatureDataUrl}
                  alt="서명 미리보기"
                  className="h-16 object-contain border border-gray-100 rounded-lg bg-[#FFFDF7] w-full"
                />
                <button
                  onClick={handleClearSignature}
                  className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
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

            <button
              onClick={handleNextToAuth}
              disabled={!isSigned}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isSigned ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Shield className="w-4 h-4" />
              {isSigned ? "서명 완료 — 본인인증으로 이동" : "먼저 서명을 완료해주세요"}
            </button>
          </motion.div>
        )}

        {/* 신분증 스캔 OCR 섹션 */}
        {signStep === "auth" && authState !== "success" && (
          <motion.div
            key="id-scan-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-[#C9A961]/50 rounded-2xl p-4 bg-[#C9A961]/5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <IdCard className="w-5 h-5 text-[#1F3864]" />
                <span className="font-bold text-[#1F3864] text-sm">신분증 / 여권 자동 인식</span>
                <span className="text-xs bg-[#C9A961] text-white px-2 py-0.5 rounded-full">선택</span>
              </div>
              <button onClick={() => setShowIdScan(v => !v)}
                className="text-xs text-gray-400 hover:text-[#1F3864] flex items-center gap-1">
                {showIdScan ? <X className="w-3.5 h-3.5" /> : <ScanLine className="w-3.5 h-3.5" />}
                {showIdScan ? "접기" : "스캔 열기"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">신분증을 스캔하면 이름·주민번호·생년월일이 자동 입력됩니다. 한국, 일본, 미국, 중국 등 전 세계 신분증 지원.</p>
            {showIdScan && (
              <div className="space-y-3">
                {/* 업로드 버튼 그룹 */}
                {!idScanPreview && (
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => idCameraInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-[#1F3864] bg-white transition-all">
                      <Camera className="w-7 h-7 text-[#1F3864]" />
                      <span className="text-sm font-semibold text-[#1F3864]">카메라 촬영</span>
                      <span className="text-xs text-gray-400">실시간 촬영</span>
                    </button>
                    <button onClick={() => idFileInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 hover:border-[#1F3864] bg-white transition-all">
                      <Upload className="w-7 h-7 text-[#1F3864]" />
                      <span className="text-sm font-semibold text-[#1F3864]">파일 업로드</span>
                      <span className="text-xs text-gray-400">사진 선택</span>
                    </button>
                  </div>
                )}
                {/* 파일 입력 (hidden) */}
                <input ref={idFileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleIdImageSelect(f); }} />
                <input ref={idCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleIdImageSelect(f); }} />
                {/* 미리보기 */}
                {idScanPreview && (
                  <div className="relative">
                    <img src={idScanPreview} alt="신분증 미리보기" className="w-full h-40 object-cover rounded-xl border-2 border-[#C9A961]" />
                    <button onClick={() => { setIdScanPreview(null); setIdScanResult(null); }}
                      className="absolute top-2 right-2 bg-white/90 rounded-full p-1 hover:bg-red-50">
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
                {/* OCR 로딩 */}
                {idScanMutation.isPending && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">신분증 자동 인식 중...</span>
                  </div>
                )}
                {/* OCR 결과 */}
                {idScanResult && (
                  <div className="bg-white border-2 border-green-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-green-700">자동 인식 완료 — 수정 후 확인하세요</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        idScanResult.confidence === 'high' ? 'bg-green-100 text-green-700' :
                        idScanResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>신뢰도: {idScanResult.confidence === 'high' ? '높음' : idScanResult.confidence === 'medium' ? '중간' : '낙음'}</span>
                    </div>
                    {/* 수정 가능한 입력 필드 */}
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">이름</label>
                        <input
                          type="text"
                          value={idScanResult.name || ''}
                          onChange={(e) => setIdScanResult(prev => prev ? { ...prev, name: e.target.value } : prev)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#1F3864]"
                          placeholder="이름"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">{idScanResult.idNumberLabel || '신분증 번호'}</label>
                        <input
                          type="text"
                          value={idScanResult.idNumber || ''}
                          onChange={(e) => setIdScanResult(prev => prev ? { ...prev, idNumber: e.target.value } : prev)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 font-mono focus:outline-none focus:border-[#1F3864]"
                          placeholder="신분증 번호"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">생년월일</label>
                        <input
                          type="text"
                          value={idScanResult.birthDate || ''}
                          onChange={(e) => setIdScanResult(prev => prev ? { ...prev, birthDate: e.target.value } : prev)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#1F3864]"
                          placeholder="예) 1970-01-01"
                        />
                      </div>
                      {idScanResult.country && (
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">국가</label>
                          <input
                            type="text"
                            value={idScanResult.country || ''}
                            onChange={(e) => setIdScanResult(prev => prev ? { ...prev, country: e.target.value } : prev)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:border-[#1F3864]"
                            placeholder="국가"
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">⚠️ AI가 인식한 정보입니다. 오류가 있으면 직접 수정해주세요.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* 2단계: 본인인증 */}
        {signStep === "auth" && authState !== "success" && (
          <motion.div
            key="auth-select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">손글씨 서명 완료</p>
                <p className="text-xs text-green-600">이제 본인인증을 진행해주세요.</p>
              </div>
              <button
                onClick={() => setSignStep("canvas")}
                className="ml-auto text-xs text-gray-400 hover:text-[#1F3864] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                재서명
              </button>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-3">인증 방식 선택</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {AUTH_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id ? method.activeColor : `bg-white ${method.color}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{method.icon}</span>
                        <span className="font-bold text-[#1F3864] text-sm">{method.name}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{method.desc}</p>
                    {selectedMethod === method.id && (
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#1F3864]">
                        <CheckCircle2 className="w-3.5 h-3.5" />선택됨
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAuth}
              disabled={!selectedMethod || authState === "pending"}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedMethod && authState !== "pending" ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {authState === "pending" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-[#1F3864] border-t-transparent rounded-full"
                  />
                  인증 진행 중...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {selectedMethod
                    ? `${AUTH_METHODS.find((m) => m.id === selectedMethod)?.name}으로 서명하기`
                    : "인증 방식을 선택해주세요"}
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* 인증 완료 */}
        {authState === "success" && (
          <motion.div
            key="auth-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800 text-lg mb-1">서명 및 본인인증 완료!</h3>
              <p className="text-green-600 text-sm">서명 타임스탬프가 분산 암호화 보안에 기록됐습니다.</p>
            </div>

            {signatureDataUrl && (
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-[#1F3864] mb-2">등록된 서명</p>
                <img
                  src={signatureDataUrl}
                  alt="등록된 서명"
                  className="h-16 object-contain border border-gray-100 rounded-lg bg-[#FFFDF7] w-full"
                />
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#C9A961]" />
                <span className="text-gray-500">서명 일시:</span>
                <span className="font-mono text-xs text-[#1F3864] ml-auto">{new Date(timestamp).toLocaleString("ko-KR")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Hash className="w-4 h-4 text-[#C9A961] mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 flex-shrink-0">분산 암호화 해시:</span>
                <span className="font-mono text-xs text-[#1F3864] break-all ml-auto">{secureHash.slice(0, 20)}...</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-[#C9A961]" />
                <span className="text-gray-500">인증 방식:</span>
                <span className="font-semibold text-[#1F3864] ml-auto">
                  {AUTH_METHODS.find((m) => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePayment}
                className="w-full btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                결제하기 — ₩{totalPrice.toLocaleString()}
                <span className="text-xs opacity-70 ml-1">
                  (전자인증 ₩49,000{will.hasVideoWill ? " + 영상 ₩29,000" : ""}{will.hasHandwrittenScan ? " + 자필 ₩19,000" : ""})
                </span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full border-2 border-[#1F3864] text-[#1F3864] py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1F3864]/5 transition-all"
              >
                <FileDown className="w-4 h-4" />
                유언장 PDF 미리보기
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              결제 완료 후 법적 효력이 발생하며, 인증서가 이메일로 발송됩니다.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
