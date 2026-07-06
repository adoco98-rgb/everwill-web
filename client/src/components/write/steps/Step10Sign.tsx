/**
 * EverWill 서명 및 인증 단계 (Step 10) - 자동화 파이프라인
 *
 * 7단계 흐름:
 * 1단계: 신분증 스캔 (AI OCR 자동인식)
 * 2단계: 자산증명서 스캔 (은행잔액증명/등기부등본/주식보유증명 AI OCR)
 * 3단계: AI 자산 데이터 자동완성 + 검토/수정
 * 4단계: 유언장 자동 생성 미리보기 (AI 법적 초안)
 * 5단계: 이중 본인 재인증 (이메일 OTP + SMS OTP)
 * 6단계: 공인인증서/개인인증서 최종 서명
 * 7단계: 결제
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, CheckCircle2, Clock, Hash, CreditCard, FileDown, Lock, Pen, Trash2,
  Upload, Camera, X, Loader2, IdCard, Building2,
  Banknote, Package, Plus, ChevronRight, Phone, KeyRound, FileText, AlertCircle,
  Mail, Smartphone, ScanLine, Sparkles, Eye, ChevronDown, ChevronUp,
  FileCheck, AlertTriangle, Info, RotateCcw
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { StepProps } from "./StepProps";

// ─── 타입 정의 ───────────────────────────────────────────────
type SignStep =
  | "id_scan"
  | "asset_scan"
  | "asset_review"
  | "will_preview"
  | "dual_reauth"
  | "final_sign"
  | "payment";

interface ScannedAssetDoc {
  id: string;
  docTypeLabel: string;
  detectedDocType: string;
  issuer: string | null;
  ownerName: string | null;
  assetName: string | null;
  assetCode: string | null;
  amount: string | null;
  unit: string | null;
  referenceDate: string | null;
  location: string | null;
  area: string | null;
  beneficiary: string | null;
  additionalInfo: string | null;
  confidence: string;
  imagePreview?: string;
}

interface BuiltAsset {
  id: string;
  category: string;
  categoryLabel: string;
  name: string;
  description: string;
  estimatedValue: string;
  unit: string;
  issuer: string;
  referenceDate: string;
  location: string;
  notes: string;
}

interface AssetSummary {
  totalEstimatedValue: string;
  realEstateTotal: string;
  financialTotal: string;
  otherTotal: string;
  taxableEstimate: string;
  notes: string;
}

interface WillDraftResult {
  willText: string;
  legalWarnings: string[];
  inheritanceRatioCheck: { isValid: boolean; totalPercent: number; issues: string[] };
  estimatedInheritanceTax: string;
  recommendedActions: string[];
  willSummary: string;
}

// ─── 단계 메타 데이터 ─────────────────────────────────────────
const STEPS: { key: SignStep; label: string; icon: React.ReactNode }[] = [
  { key: "id_scan",     label: "신분증",    icon: <IdCard className="w-3.5 h-3.5" /> },
  { key: "asset_scan",  label: "자산스캔",  icon: <ScanLine className="w-3.5 h-3.5" /> },
  { key: "asset_review",label: "자산확인",  icon: <FileCheck className="w-3.5 h-3.5" /> },
  { key: "will_preview",label: "유언장",    icon: <Sparkles className="w-3.5 h-3.5" /> },
  { key: "dual_reauth", label: "본인인증",  icon: <Shield className="w-3.5 h-3.5" /> },
  { key: "final_sign",  label: "최종서명",  icon: <Pen className="w-3.5 h-3.5" /> },
  { key: "payment",     label: "결제",      icon: <CreditCard className="w-3.5 h-3.5" /> },
];
const STEP_ORDER: SignStep[] = [
  "id_scan", "asset_scan", "asset_review", "will_preview", "dual_reauth", "final_sign", "payment"
];

const ASSET_DOC_TYPES = [
  { value: "bank_balance",          label: "은행 잔액증명서",    icon: <Banknote className="w-4 h-4 text-blue-600" /> },
  { value: "real_estate_registry",  label: "부동산 등기부등본",  icon: <Building2 className="w-4 h-4 text-green-600" /> },
  { value: "stock_certificate",     label: "주식보유증명서",     icon: <Package className="w-4 h-4 text-purple-600" /> },
  { value: "insurance_policy",      label: "보험증권",           icon: <Shield className="w-4 h-4 text-orange-600" /> },
  { value: "bond_certificate",      label: "채권증명서",         icon: <FileText className="w-4 h-4 text-red-600" /> },
  { value: "pension_statement",     label: "연금 수급 확인서",   icon: <CreditCard className="w-4 h-4 text-teal-600" /> },
  { value: "vehicle_registration",  label: "자동차 등록증",      icon: <Package className="w-4 h-4 text-indigo-600" /> },
  { value: "business_registration", label: "사업자등록증",       icon: <Building2 className="w-4 h-4 text-amber-600" /> },
  { value: "loan_statement",        label: "대출 잔액 확인서",   icon: <AlertTriangle className="w-4 h-4 text-rose-600" /> },
  { value: "other",                 label: "기타 자산 서류",     icon: <FileCheck className="w-4 h-4 text-gray-600" /> },
];

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
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
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
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
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
    const ctx = canvas.getContext("2d")!;
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

// ─── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function Step10Sign({ will }: StepProps) {
  // eKYC 사전 안내 화면 (최초 진입 시 true)
  const [showKycGuide, setShowKycGuide] = useState(true);
  const [signStep, setSignStep] = useState<SignStep>("id_scan");
  const completedSteps = useRef<Set<SignStep>>(new Set());

  // ── 1단계: 신분증 스캔 상태 ──
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

  // ── 2단계: 자산증명서 스캔 상태 ──
  const [scannedDocs, setScannedDocs] = useState<ScannedAssetDoc[]>([]);
  const [selectedDocType, setSelectedDocType] = useState("bank_balance");
  const [scanningDocId, setScanningDocId] = useState<string | null>(null);
  const assetDocFileInputRef = useRef<HTMLInputElement>(null);
  const assetDocCameraInputRef = useRef<HTMLInputElement>(null);

  // ── 3단계: AI 자산 자동완성 상태 ──
  const [builtAssets, setBuiltAssets] = useState<BuiltAsset[]>([]);
  const [assetSummary, setAssetSummary] = useState<AssetSummary | null>(null);
  const [assetBuildDone, setAssetBuildDone] = useState(false);

  // ── 4단계: 유언장 자동 생성 상태 ──
  const [willDraft, setWillDraft] = useState<WillDraftResult | null>(null);
  const [willTextExpanded, setWillTextExpanded] = useState(false);
  const [willGenDone, setWillGenDone] = useState(false);

  // ── 5단계: 이중 본인 재인증 상태 ──
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailResendTimer, setEmailResendTimer] = useState(0);
  const [smsOtpSent, setSmsOtpSent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsVerified, setSmsVerified] = useState(false);
  const [smsResendTimer, setSmsResendTimer] = useState(0);
  const dualReauthVerified = emailVerified && smsVerified;

  // ── 6단계: 최종 서명 상태 ──
  const [certMethod, setCertMethod] = useState<"pass" | "kakao" | "naver" | "joint" | "signature" | null>(null);
  const [certDone, setCertDone] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [isSigned, setIsSigned] = useState(false);

  // ── 7단계: 결제 상태 ──
  const [timestamp, setTimestamp] = useState("");
  const [secureHash, setSecureHash] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  // eKYC 실패 횟수 카운터 (TC-K06: 5회 초과 시 안내)
  const [kycFailCount, setKycFailCount] = useState(0);
  const [kycErrorDetail, setKycErrorDetail] = useState<string | null>(null);

  // 프리미엄 플랜(영상+자필 모두 선택) 시 69,000원 묶음 할인 적용
  const isPremiumPlan = will.hasVideoWill && will.hasHandwrittenScan;
  const totalPrice = isPremiumPlan
    ? 69000
    : 168000 + (will.hasVideoWill ? 29000 : 0) + (will.hasHandwrittenScan ? 19000 : 0);

  // ── tRPC 뮤테이션 ──
  const idScanMutation = trpc.idScan.scanId.useMutation({
    onSuccess: (data) => {
      setIdScanResult(data.data);
      toast.success("신분증 자동 인식 완료!");
    },
    onError: (err) => {
      const newCount = kycFailCount + 1;
      setKycFailCount(newCount);
      // 실패 원인별 상세 안내 (TC-K01~K05)
      const msg = err.message || "";
      let detail = "";
      if (msg.includes("blur") || msg.includes("focus")) {
        detail = "흔릴림: 휴대폰을 단단히 고정하고 다시 촬영해 주세요.";
      } else if (msg.includes("glare") || msg.includes("light")) {
        detail = "역광/반사: 조명을 조절하거나 각도를 바꾼 후 다시 시도해 주세요.";
      } else if (msg.includes("crop") || msg.includes("partial")) {
        detail = "일부 잘림: 신분증 전체가 프레임 안에 들어오도록 케 주세요.";
      } else if (msg.includes("expired") || msg.includes("만료")) {
        detail = "만료된 신분증: 유효한 신분증을 사용해 주세요.";
      } else {
        detail = "신분증을 밝은 곳에서 수평으로 놓고 다시 촬영해 주세요.";
      }
      setKycErrorDetail(detail);
      if (newCount >= 5) {
        toast.error("신분증 인식 5회 실패. 고객센터(070-4735-0834)로 문의해 주세요.");
      } else {
        toast.error(`신분증 인식 실패 (${newCount}/5회). ${detail}`);
      }
    },
  });

  const assetDocScanMutation = trpc.willAuto.scanAndSaveAssetDocument.useMutation({
    onSuccess: (data, variables) => {
      const newDoc: ScannedAssetDoc = {
        id: Date.now().toString(),
        ...data.data,
      };
      setScannedDocs(prev => [...prev, newDoc]);
      setScanningDocId(null);
      toast.success(`${data.data.docTypeLabel} 스캔 완료!`);
    },
    onError: (err) => {
      setScanningDocId(null);
      toast.error(err.message || "자산증명서 인식에 실패했습니다.");
    },
  });

  const buildAssetMutation = trpc.willAuto.buildAssetData.useMutation({
    onSuccess: (data) => {
      setBuiltAssets(data.data.assets || []);
      setAssetSummary(data.data.summary || null);
      setAssetBuildDone(true);
      toast.success("자산 데이터 자동완성 완료!");
    },
    onError: (err) => {
      toast.error(err.message || "자산 데이터 생성에 실패했습니다.");
    },
  });

  const generateWillMutation = trpc.willAuto.generateWillDraft.useMutation({
    onSuccess: (data) => {
      setWillDraft(data.data);
      setWillGenDone(true);
      toast.success("유언장 초안이 자동 생성되었습니다!");
    },
    onError: (err) => {
      toast.error(err.message || "유언장 생성에 실패했습니다.");
    },
  });

  // 상속인 목록 조회
  const heirsQuery = trpc.willAuto.getHeirsForWill.useQuery(undefined, { enabled: false });

  // 이메일 OTP
  const sendEmailOtpMutation = trpc.auth.email.sendReauthEmailOtp.useMutation({
    onSuccess: (data) => {
      setEmailOtpSent(true);
      setMaskedEmail(data.maskedEmail);
      setEmailResendTimer(60);
      toast.success(`인증 코드가 ${data.maskedEmail}으로 발송되었습니다.`);
    },
    onError: (err) => toast.error(err.message || "이메일 발송에 실패했습니다."),
  });
  const verifyEmailOtpMutation = trpc.auth.email.verifyReauthEmailOtp.useMutation({
    onSuccess: () => {
      setEmailVerified(true);
      toast.success("이메일 인증 완료!");
    },
    onError: (err) => toast.error(err.message || "이메일 인증 코드가 올바르지 않습니다."),
  });

  // SMS OTP
  const sendSmsOtpMutation = trpc.auth.email.sendReauthOtp.useMutation({
    onSuccess: (data) => {
      setSmsOtpSent(true);
      setMaskedPhone(data.maskedPhone);
      setSmsResendTimer(60);
      toast.success(`인증번호가 ${data.maskedPhone}으로 발송되었습니다.`);
    },
    onError: (err) => {
      if (err.message?.includes("등록된 휴대폰")) {
        toast.info("등록된 휴대폰 번호가 없습니다. 이메일 인증만으로 진행합니다.");
        setSmsVerified(true);
      } else {
        toast.error(err.message || "SMS 발송에 실패했습니다.");
      }
    },
  });
  const verifySmsOtpMutation = trpc.auth.email.verifyReauthOtp.useMutation({
    onSuccess: () => {
      setSmsVerified(true);
      toast.success("휴대폰 인증 완료!");
    },
    onError: (err) => toast.error(err.message || "인증 코드가 올바르지 않습니다."),
  });

  // ── 유언장 DB 저장 뮤테이션 ──
  const saveWillMutation = trpc.will.saveWill.useMutation({
    onError: () => {
      // 저장 실패는 조용히 처리 (결제 완료 UX 방해 안 함)
    },
  });

  // ── 유언장 인증 뮤테이션 (certNumber, blockchainHash, certifiedAt DB 저장) ──
  const certifyWillMutation = trpc.will.certifyWill.useMutation({
    onSuccess: (data) => {
      setSecureHash(data.blockchainHash);
      toast.success(`인증 완료! 인증번호: ${data.certNumber}`);
    },
    onError: () => {
      // 인증 실패는 조용히 처리 (결제 완료 UX 방해 안 함)
    },
  });

  // ── 타이머 ──
  useEffect(() => {
    if (emailResendTimer <= 0) return;
    const t = setTimeout(() => setEmailResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [emailResendTimer]);
  useEffect(() => {
    if (smsResendTimer <= 0) return;
    const t = setTimeout(() => setSmsResendTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [smsResendTimer]);

  // ── 단계 이동 ──
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
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setIdScanPreview(dataUrl);
      idScanMutation.mutate({ imageUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  // ── 자산증명서 이미지 처리 ──
  async function handleAssetDocImageSelect(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("이미지 파일만 업로드 가능합니다."); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("파일 크기는 20MB 이하여야 합니다."); return; }
    const tempId = Date.now().toString();
    setScanningDocId(tempId);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      assetDocScanMutation.mutate({
        imageUrl: dataUrl,
        docTypeHint: selectedDocType as any,
      });
    };
    reader.readAsDataURL(file);
  }

  // ── AI 자산 자동완성 실행 ──
  function handleBuildAssets() {
    if (scannedDocs.length === 0) {
      toast.error("최소 1개의 자산증명서를 스캔해주세요.");
      return;
    }
    buildAssetMutation.mutate({ scanResults: scannedDocs });
  }

  // ── 유언장 자동 생성 ──
  async function handleGenerateWill() {
    const heirsData = await heirsQuery.refetch();
    const heirList = (heirsData.data?.heirs || []).map(h => ({
      priority: h.priority || 1,
      name: h.nameKo,
      relationship: h.relationship || "미지정",
      shareValue: h.shareType === "percent" ? String(h.sharePercent || 0) : String(h.shareAmount || 0),
      shareType: h.shareType || undefined,
      address: h.address || undefined,
      phone: h.phone || undefined,
    }));

    generateWillMutation.mutate({
      testator: {
        name: idScanResult?.name || "미확인",
        idNumber: idScanResult?.idNumber || undefined,
        birthDate: idScanResult?.birthDate || undefined,
        nationality: idScanResult?.country || "KR",
      },
      assets: builtAssets.map(a => ({
        id: a.id,
        categoryLabel: a.categoryLabel,
        name: a.name,
        description: a.description || undefined,
        estimatedValue: a.estimatedValue || undefined,
        location: a.location || undefined,
        issuer: a.issuer || undefined,
        notes: a.notes || undefined,
      })),
      heirs: heirList,
      willType: "electronic",
    });
  }

  // ── 공인인증 처리 ──
  function handleCertMethod(method: typeof certMethod) {
    setCertMethod(method);
    if (method !== "signature") {
      // PASS/카카오/네이버/공동인증서는 외부 연동 안내 후 완료 처리
      setTimeout(() => {
        setCertDone(true);
        toast.success("인증이 완료되었습니다!");
      }, 2000);
    }
  }

  // ── 결제 처리 ──
  function handlePayment() {
    const ts = new Date().toISOString();
    setTimestamp(ts);
    setPaymentDone(true);
    toast.success("결제 완료! 유언장 인증이 완료되었습니다.");
    // 1단계: 유언장 DB 저장 (draft 상태로 먼저 저장하여 willId 확보)
    const willTitle = will.testatorName
      ? `${will.testatorName}의 유언장 ${new Date().toLocaleDateString("ko-KR")}`
      : `유언장 ${new Date().toLocaleDateString("ko-KR")}`;
    saveWillMutation.mutate(
      {
        title: willTitle,
        data: JSON.stringify(will),
        mode: (will.mode as "ai" | "direct") ?? "ai",
        status: "draft",
      },
      {
        onSuccess: (savedData) => {
          // 2단계: willId로 certifyWill 호출 → certNumber, blockchainHash, certifiedAt DB 저장
          if (savedData.willId) {
            certifyWillMutation.mutate({ willId: savedData.willId });
          }
        },
      }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────

  // ── eKYC 사전 안내 화면 ──
  if (showKycGuide) {
    return (
      <div className="space-y-5">
        {/* 안내 헤더 */}
        <div className="flex items-center gap-3 p-4 bg-[#1F3864]/5 rounded-xl">
          <Shield className="w-5 h-5 text-[#1F3864]" />
          <div>
            <p className="font-semibold text-[#1F3864] text-sm">본인인증 절차 안내</p>
            <p className="text-gray-400 text-xs">시작 전 아래 내용을 확인해 주세요</p>
          </div>
        </div>
        {/* 총 소요 시간 */}
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-full px-5 py-2">
            <Clock className="w-4 h-4 text-[#C9A961]" />
            <span className="text-[#1F3864] font-bold text-sm">총 소요 시간: 약 2분</span>
          </div>
        </div>
        {/* 3단계 안내 */}
        <div className="space-y-3">
          {([
            { step: 1, icon: IdCard, title: "신분증 준비", desc: "주민등록증 또는 운전면허증을 미리 준비해 주세요.", time: "약 1분" },
            { step: 2, icon: Camera, title: "얼굴 촬영", desc: "카메라로 정면 얼굴 사진을 촬영합니다. 밝은 곳에서 진행해 주세요.", time: "약 30초" },
            { step: 3, icon: Smartphone, title: "음성 의사 확인", desc: "마이크로 유언 의사를 음성으로 확인합니다. 조용한 환경을 권장합니다.", time: "약 30초" },
          ] as const).map(({ step, icon: Icon, title, desc, time }) => (
            <div key={step} className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1F3864] text-white flex items-center justify-center font-bold text-sm">{step}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#1F3864]" />
                    <span className="font-semibold text-[#1F3864] text-sm">{title}</span>
                  </div>
                  <span className="text-xs text-[#C9A961] font-medium whitespace-nowrap">{time}</span>
                </div>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* 안심 문구 */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-800 text-xs font-semibold">개인정보는 암호화 저장되며 제3자에게 절대 공유되지 않습니다.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-green-800 text-xs font-semibold">은행 수준 보안 (E2E 암호화 · ISMS 인증 목표)</span>
          </div>
        </div>
        {/* 시작 버튼 */}
        <button
          onClick={() => setShowKycGuide(false)}
          className="w-full py-4 rounded-xl bg-[#1F3864] text-white font-bold text-base hover:bg-[#1F3864]/90 transition-colors flex items-center justify-center gap-2"
        >
          <Shield className="w-5 h-5" />
          eKYC 인증 시작하기
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-4 bg-[#1F3864]/5 rounded-xl">
        <Lock className="w-5 h-5 text-[#1F3864]" />
        <div>
          <p className="font-semibold text-[#1F3864] text-sm">전자 인증 및 결제</p>
          <p className="text-gray-400 text-xs">신분증 → 자산증명서 스캔 → AI 자동완성 → 유언장 생성 → 본인인증 → 최종서명 → 결제</p>
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
          <motion.div key="id_scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <IdCard className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-800">1단계: 신분증 스캔</p>
                <p className="text-xs text-blue-600 mt-0.5">주민등록증, 여권, 운전면허증을 촬영하면 AI가 자동으로 정보를 입력합니다.</p>
              </div>
            </div>

            {/* 이미지 업로드 영역 */}
            {!idScanPreview ? (
              <div className="border-2 border-dashed border-[#C9A961]/50 rounded-xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-[#1F3864]/5 rounded-full flex items-center justify-center mx-auto">
                  <IdCard className="w-8 h-8 text-[#1F3864]/40" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">신분증을 업로드하거나 촬영하세요</p>
                  <p className="text-xs text-gray-400 mt-1">주민등록증 · 여권 · 운전면허증 지원</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => idFileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1F3864] text-white text-sm font-semibold rounded-xl hover:bg-[#162a4e] transition-all">
                    <Upload className="w-4 h-4" />
                    파일 업로드
                  </button>
                  <button onClick={() => idCameraInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1F3864] text-[#1F3864] text-sm font-semibold rounded-xl hover:bg-[#1F3864]/5 transition-all">
                    <Camera className="w-4 h-4" />
                    카메라 촬영
                  </button>
                </div>
                <input ref={idFileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleIdImageSelect(e.target.files[0])} />
                <input ref={idCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleIdImageSelect(e.target.files[0])} />
                {/* eKYC 실패 안내 (TC-K01~K06) */}
                {kycFailCount >= 5 && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <strong>⚠️ 신분증 인식 5회 실패</strong><br />
                    고객센터 <strong>070-4735-0834</strong>으로 문의하시면 직접 지원드립니다.
                  </div>
                )}
                {kycFailCount > 0 && kycFailCount < 5 && kycErrorDetail && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                    <strong>📸 재시도 팁:</strong> {kycErrorDetail}
                    <span className="ml-2 text-xs text-amber-600">({kycFailCount}/5회)</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                  <img src={idScanPreview} alt="신분증 미리보기" className="w-full h-40 object-cover" />
                  <button onClick={() => { setIdScanPreview(null); setIdScanResult(null); }}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-gray-600 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {idScanMutation.isPending && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    <p className="text-sm text-blue-700 font-medium">AI가 신분증을 분석하고 있습니다...</p>
                  </div>
                )}
                {idScanResult && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-bold text-green-800">자동 인식 완료</p>
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                        idScanResult.confidence === "high" ? "bg-green-100 text-green-700" :
                        idScanResult.confidence === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {idScanResult.confidence === "high" ? "높음" : idScanResult.confidence === "medium" ? "보통" : "낮음"} 신뢰도
                      </span>
                    </div>
                    {[
                      { label: "성명", value: idScanResult.name },
                      { label: idScanResult.idNumberLabel || "신분증 번호", value: idScanResult.idNumber },
                      { label: "생년월일", value: idScanResult.birthDate },
                      { label: "국적/발급국", value: idScanResult.country },
                    ].map(row => row.value && (
                      <div key={row.label} className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500 w-28 flex-shrink-0">{row.label}</span>
                        <span className="font-semibold text-gray-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => goToStep("asset_scan")}
              disabled={!idScanResult && !idScanPreview}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                idScanResult ? "btn-gold" : idScanPreview ? "bg-[#1F3864] text-white hover:bg-[#162a4e]" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}>
              <ChevronRight className="w-4 h-4" />
              {idScanResult ? "신분증 인증 완료 — 자산증명서 스캔으로" : "건너뛰기 — 자산증명서 스캔으로"}
            </button>
          </motion.div>
        )}

        {/* ─── 2단계: 자산증명서 스캔 ─── */}
        {signStep === "asset_scan" && (
          <motion.div key="asset_scan" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <ScanLine className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">2단계: 자산증명서 스캔</p>
                <p className="text-xs text-green-600 mt-0.5">은행잔액증명서, 부동산 등기부등본, 주식보유증명서 등을 업로드하면 AI가 자산 정보를 자동으로 인식합니다.</p>
              </div>
            </div>

            {/* 서류 유형 선택 */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">스캔할 서류 유형 선택</p>
              <div className="grid grid-cols-2 gap-2">
                {ASSET_DOC_TYPES.map(dt => (
                  <button key={dt.value} onClick={() => setSelectedDocType(dt.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                      selectedDocType === dt.value
                        ? "border-[#1F3864] bg-[#1F3864]/5 text-[#1F3864]"
                        : "border-gray-200 text-gray-600 hover:border-[#1F3864]/40"
                    }`}>
                    {dt.icon}
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 업로드 영역 — 다중 파일 + 드래그앤드롭 */}
            <div
              className="border-2 border-dashed border-[#1F3864]/30 rounded-xl p-5 text-center bg-[#1F3864]/[0.02] hover:bg-[#1F3864]/[0.04] transition-colors cursor-pointer"
              onClick={() => !assetDocScanMutation.isPending && assetDocFileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#1F3864]', 'bg-[#1F3864]/[0.06]'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-[#1F3864]', 'bg-[#1F3864]/[0.06]'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-[#1F3864]', 'bg-[#1F3864]/[0.06]');
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                files.forEach(f => handleAssetDocImageSelect(f));
              }}
            >
              {assetDocScanMutation.isPending ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#1F3864] animate-spin" />
                  <p className="text-sm font-semibold text-[#1F3864]">AI가 서류를 분석하고 있습니다...</p>
                  <p className="text-xs text-gray-500">잔액, 소재지, 보유 주수 등을 자동으로 인식합니다</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-[#1F3864]/40" />
                  <p className="text-sm font-semibold text-[#1F3864]">클릭하거나 파일을 드래그하세요</p>
                  <p className="text-xs text-gray-500">여러 장 동시 선택 가능 · JPG, PNG, HEIC 지원 · 최대 20MB</p>
                  {scannedDocs.length > 0 && (
                    <span className="mt-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      현재 {scannedDocs.length}건 스캔 완료
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => !assetDocScanMutation.isPending && assetDocFileInputRef.current?.click()}
                disabled={assetDocScanMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1F3864] text-white text-sm font-semibold rounded-xl hover:bg-[#162a4e] transition-all disabled:opacity-50">
                <Upload className="w-4 h-4" />
                파일 선택 (여러 장)
              </button>
              <button onClick={() => assetDocCameraInputRef.current?.click()}
                disabled={assetDocScanMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-[#1F3864] text-[#1F3864] text-sm font-semibold rounded-xl hover:bg-[#1F3864]/5 transition-all disabled:opacity-50">
                <Camera className="w-4 h-4" />
                카메라 촬영
              </button>
            </div>
            <input ref={assetDocFileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach(f => handleAssetDocImageSelect(f));
                  e.target.value = '';
                }
              }} />
            <input ref={assetDocCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleAssetDocImageSelect(e.target.files[0])} />

            {assetDocScanMutation.isPending && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                <div>
                  <p className="text-sm text-green-700 font-medium">AI가 자산증명서를 분석하고 있습니다...</p>
                  <p className="text-xs text-green-500 mt-0.5">잔액, 소재지, 보유 주수 등을 자동으로 인식합니다</p>
                </div>
              </div>
            )}

            {/* 스캔된 서류 목록 */}
            {scannedDocs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600">스캔 완료 ({scannedDocs.length}건)</p>
                {scannedDocs.map(doc => (
                  <div key={doc.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.detectedDocType === "bank_balance" ? "bg-blue-100" :
                      doc.detectedDocType === "real_estate_registry" ? "bg-green-100" :
                      doc.detectedDocType === "stock_certificate" ? "bg-purple-100" :
                      "bg-gray-100"
                    }`}>
                      {ASSET_DOC_TYPES.find(d => d.value === doc.detectedDocType)?.icon || <FileText className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{doc.docTypeLabel}</p>
                      <p className="text-xs text-gray-500 truncate">{doc.issuer || ""} {doc.assetName || ""}</p>
                      {doc.amount && (
                        <p className="text-xs font-bold text-[#1F3864] mt-0.5">
                          {Number(doc.amount).toLocaleString()}{doc.unit || "원"}
                        </p>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold mt-1 inline-block ${
                        doc.confidence === "high" ? "bg-green-100 text-green-700" :
                        doc.confidence === "medium" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {doc.confidence === "high" ? "높음" : doc.confidence === "medium" ? "보통" : "낮음"} 신뢰도
                      </span>
                    </div>
                    <button onClick={() => setScannedDocs(prev => prev.filter(d => d.id !== doc.id))}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSignStep("id_scan")}
                className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button
                onClick={() => {
                  if (scannedDocs.length === 0) {
                    goToStep("asset_review");
                  } else {
                    handleBuildAssets();
                    goToStep("asset_review");
                  }
                }}
                className="flex-1 btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {scannedDocs.length > 0 ? `${scannedDocs.length}건 스캔 완료 — AI 자산 자동완성으로` : "건너뛰기 — 자산 확인으로"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 3단계: AI 자산 자동완성 검토 ─── */}
        {signStep === "asset_review" && (
          <motion.div key="asset_review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-purple-800">3단계: AI 자산 데이터 자동완성</p>
                <p className="text-xs text-purple-600 mt-0.5">스캔된 서류를 바탕으로 AI가 자산 목록을 자동으로 구성했습니다. 내용을 확인해주세요.</p>
              </div>
            </div>

            {buildAssetMutation.isPending && (
              <div className="flex items-center gap-3 p-6 bg-purple-50 rounded-xl justify-center">
                <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                <div>
                  <p className="text-sm text-purple-700 font-medium">AI가 자산 데이터를 자동완성하고 있습니다...</p>
                  <p className="text-xs text-purple-500 mt-0.5">잠시만 기다려주세요</p>
                </div>
              </div>
            )}

            {assetBuildDone && builtAssets.length > 0 ? (
              <>
                {/* 자산 요약 카드 */}
                {assetSummary && (
                  <div className="bg-[#1F3864] text-white rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-white/70">AI 자산 평가 요약</p>
                    <p className="text-2xl font-bold">₩{Number(assetSummary.totalEstimatedValue || 0).toLocaleString()}</p>
                    <p className="text-xs text-white/60">총 추정 자산 가치</p>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/20">
                      {[
                        { label: "부동산", value: assetSummary.realEstateTotal },
                        { label: "금융자산", value: assetSummary.financialTotal },
                        { label: "기타", value: assetSummary.otherTotal },
                      ].map(item => (
                        <div key={item.label} className="text-center">
                          <p className="text-xs text-white/60">{item.label}</p>
                          <p className="text-sm font-bold">₩{Number(item.value || 0).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    {assetSummary.notes && (
                      <p className="text-xs text-white/60 mt-2 pt-2 border-t border-white/20">{assetSummary.notes}</p>
                    )}
                  </div>
                )}

                {/* 자산 목록 */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600">자동완성된 자산 목록 ({builtAssets.length}건)</p>
                  {builtAssets.map(asset => (
                    <div key={asset.id} className="bg-white border border-gray-100 rounded-xl p-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          asset.category === "real_estate" ? "bg-green-100" :
                          asset.category?.startsWith("financial") ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          {asset.category === "real_estate" ? <Building2 className="w-4 h-4 text-green-600" /> :
                           asset.category?.startsWith("financial") ? <Banknote className="w-4 h-4 text-blue-600" /> :
                           <Package className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{asset.categoryLabel}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mt-1">{asset.name}</p>
                          {asset.description && <p className="text-xs text-gray-500">{asset.description}</p>}
                          {asset.estimatedValue && (
                            <p className="text-sm font-bold text-[#1F3864] mt-1">
                              ₩{Number(asset.estimatedValue).toLocaleString()}
                            </p>
                          )}
                          {asset.location && <p className="text-xs text-gray-400">{asset.location}</p>}
                          {asset.issuer && <p className="text-xs text-gray-400">발급: {asset.issuer}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : !buildAssetMutation.isPending && scannedDocs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">스캔된 자산증명서가 없습니다.</p>
                <p className="text-xs mt-1">이전 단계에서 자산증명서를 스캔하면 자동으로 자산 목록이 완성됩니다.</p>
              </div>
            ) : !buildAssetMutation.isPending && !assetBuildDone && scannedDocs.length > 0 ? (
              <div className="text-center py-6">
                <button onClick={handleBuildAssets}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 mx-auto hover:bg-purple-700 transition-all">
                  <Sparkles className="w-4 h-4" />
                  AI 자산 자동완성 실행
                </button>
              </div>
            ) : null}

            <div className="flex gap-3">
              <button onClick={() => setSignStep("asset_scan")}
                className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button onClick={() => goToStep("will_preview")}
                className="flex-1 btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                <ChevronRight className="w-4 h-4" />
                {assetBuildDone ? "자산 확인 완료 — 유언장 자동 생성으로" : "건너뛰기 — 유언장 생성으로"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 4단계: 유언장 자동 생성 미리보기 ─── */}
        {signStep === "will_preview" && (
          <motion.div key="will_preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <Sparkles className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800">4단계: 유언장 자동 생성</p>
                <p className="text-xs text-amber-600 mt-0.5">신분증 정보, 자산 데이터, 상속인 목록을 바탕으로 AI가 한국 민법 기준 유언장 초안을 자동 작성합니다.</p>
              </div>
            </div>

            {!willGenDone && !generateWillMutation.isPending && (
              <button onClick={handleGenerateWill}
                className="w-full py-4 bg-[#1F3864] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#162a4e] transition-all">
                <Sparkles className="w-4 h-4" />
                AI 유언장 자동 생성 시작
              </button>
            )}

            {generateWillMutation.isPending && (
              <div className="flex items-center gap-3 p-6 bg-amber-50 rounded-xl justify-center">
                <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
                <div>
                  <p className="text-sm text-amber-700 font-medium">AI가 유언장을 작성하고 있습니다...</p>
                  <p className="text-xs text-amber-500 mt-0.5">한국 민법 기준으로 법적 요건을 검토하며 작성 중입니다</p>
                </div>
              </div>
            )}

            {willDraft && willGenDone && (
              <div className="space-y-4">
                {/* 요약 */}
                <div className="bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#1F3864] mb-2">유언장 핵심 요약</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{willDraft.willSummary}</p>
                </div>

                {/* 법적 경고 */}
                {willDraft.legalWarnings?.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <p className="text-xs font-semibold text-yellow-800">법적 주의사항</p>
                    </div>
                    {willDraft.legalWarnings.map((w, i) => (
                      <p key={i} className="text-xs text-yellow-700">• {w}</p>
                    ))}
                  </div>
                )}

                {/* 상속세 추정 */}
                {willDraft.estimatedInheritanceTax && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3">
                    <Info className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-800">상속세 추정액</p>
                      <p className="text-sm font-bold text-red-700">{willDraft.estimatedInheritanceTax}</p>
                    </div>
                  </div>
                )}

                {/* 유언장 전문 */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#1F3864]" />
                      <p className="text-sm font-bold text-[#1F3864]">유언장 전문</p>
                    </div>
                    <button onClick={() => setWillTextExpanded(v => !v)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#1F3864] transition-colors">
                      {willTextExpanded ? <><ChevronUp className="w-3.5 h-3.5" />접기</> : <><ChevronDown className="w-3.5 h-3.5" />펼치기</>}
                    </button>
                  </div>
                  {willTextExpanded && (
                    <div className="p-4 max-h-80 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{willDraft.willText}</pre>
                    </div>
                  )}
                </div>

                {/* 권장 조치 */}
                {willDraft.recommendedActions?.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-blue-800">권장 조치</p>
                    {willDraft.recommendedActions.map((a, i) => (
                      <p key={i} className="text-xs text-blue-700">• {a}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSignStep("asset_review")}
                className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button onClick={() => goToStep("dual_reauth")}
                disabled={!willGenDone && !willDraft}
                className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  willGenDone ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                <ChevronRight className="w-4 h-4" />
                {willGenDone ? "유언장 확인 완료 — 본인 재인증으로" : "유언장를 먼저 생성해주세요"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 5단계: 이중 본인 재인증 ─── */}
        {signStep === "dual_reauth" && (
          <motion.div key="dual_reauth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl">
              <Shield className="w-6 h-6 text-[#1F3864] flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#1F3864]">5단계: 이중 본인 재인증</p>
                <p className="text-xs text-gray-500 mt-0.5">유언장 최종 서명 전 이메일과 휴대폰 인증을 모두 완료해주세요.</p>
              </div>
            </div>

            {/* 이메일 인증 */}
            <div className={`rounded-xl border-2 p-4 space-y-3 transition-all ${emailVerified ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-2">
                {emailVerified
                  ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                  : <Mail className="w-5 h-5 text-[#1F3864]" />}
                <p className="text-sm font-semibold text-[#1F3864]">1단계: 이메일 인증</p>
                {emailVerified && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">완료</span>}
              </div>
              {!emailVerified && (
                !emailOtpSent ? (
                  <button onClick={() => sendEmailOtpMutation.mutate()}
                    disabled={sendEmailOtpMutation.isPending}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#1F3864] text-white hover:bg-[#162a4e] transition-all disabled:opacity-50">
                    {sendEmailOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    이메일로 인증 코드 발송
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-800">📧 {maskedEmail}으로 인증 코드가 발송되었습니다.</p>
                      <p className="text-xs text-blue-600 mt-1">6자리 인증 코드를 입력해주세요. (10분 유효)</p>
                    </div>
                    <div className="flex gap-2">
                      <input type="tel" maxLength={6} value={emailCode}
                        onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-[#1F3864]" />
                      <button onClick={() => verifyEmailOtpMutation.mutate({ code: emailCode })}
                        disabled={emailCode.length !== 6 || verifyEmailOtpMutation.isPending}
                        className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                          emailCode.length === 6 ? "bg-[#1F3864] text-white hover:bg-[#162a4e]" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}>
                        {verifyEmailOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        확인
                      </button>
                    </div>
                    <button onClick={() => { setEmailOtpSent(false); setEmailCode(""); }}
                      disabled={emailResendTimer > 0}
                      className={`text-xs ${emailResendTimer > 0 ? "text-gray-300" : "text-[#1F3864] hover:underline"}`}>
                      {emailResendTimer > 0 ? `재발송 (${emailResendTimer}초 후)` : "인증 코드 재발송"}
                    </button>
                  </div>
                )
              )}
            </div>

            {/* SMS 인증 */}
            <div className={`rounded-xl border-2 p-4 space-y-3 transition-all ${smsVerified ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
              <div className="flex items-center gap-2">
                {smsVerified
                  ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                  : <Smartphone className="w-5 h-5 text-[#1F3864]" />}
                <p className="text-sm font-semibold text-[#1F3864]">2단계: 휴대폰 SMS 인증</p>
                {smsVerified && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">완료</span>}
              </div>
              {!smsVerified && (
                !smsOtpSent ? (
                  <button onClick={() => sendSmsOtpMutation.mutate()}
                    disabled={sendSmsOtpMutation.isPending}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 border-[#1F3864] text-[#1F3864] hover:bg-[#1F3864]/5 transition-all disabled:opacity-50">
                    {sendSmsOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                    등록된 휴대폰으로 인증번호 발송
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-green-800">📱 {maskedPhone}으로 인증번호가 발송되었습니다.</p>
                      <p className="text-xs text-green-600 mt-1">6자리 인증번호를 입력해주세요.</p>
                    </div>
                    <div className="flex gap-2">
                      <input type="tel" maxLength={6} value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-[#1F3864]" />
                      <button onClick={() => verifySmsOtpMutation.mutate({ code: smsCode })}
                        disabled={smsCode.length !== 6 || verifySmsOtpMutation.isPending}
                        className={`px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                          smsCode.length === 6 ? "bg-[#1F3864] text-white hover:bg-[#162a4e]" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}>
                        {verifySmsOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                        확인
                      </button>
                    </div>
                    <button onClick={() => { setSmsOtpSent(false); setSmsCode(""); }}
                      disabled={smsResendTimer > 0}
                      className={`text-xs ${smsResendTimer > 0 ? "text-gray-300" : "text-[#1F3864] hover:underline"}`}>
                      {smsResendTimer > 0 ? `재발송 (${smsResendTimer}초 후)` : "인증번호 재발송"}
                    </button>
                  </div>
                )
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSignStep("will_preview")}
                className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button onClick={() => goToStep("final_sign")}
                disabled={!dualReauthVerified}
                className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  dualReauthVerified ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                <ChevronRight className="w-4 h-4" />
                {dualReauthVerified ? "이중 인증 완료 — 최종 서명으로" : "이메일 + 휴대폰 인증을 완료해주세요"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 6단계: 공인인증서 최종 서명 ─── */}
        {signStep === "final_sign" && (
          <motion.div key="final_sign" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="flex items-center gap-3 p-4 bg-[#C9A961]/10 border border-[#C9A961]/40 rounded-xl">
              <Pen className="w-6 h-6 text-[#C9A961] flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#1F3864]">6단계: 최종 서명</p>
                <p className="text-xs text-gray-500 mt-0.5">공인인증서 또는 개인인증서로 유언장에 최종 서명합니다. 서명 후에는 수정이 불가합니다.</p>
              </div>
            </div>

            {/* 전자서명법 준수 고지 배너 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-800">전자서명법 준수 안내</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    본 서비스의 전자서명은 「전자서명법」 및 「전자문서 및 전자거래 기본법」에 따라 제공됩니다.
                    단, 현행 한국 민법상 유언의 방식(자필증서 유언, 공정증서 유언 등)에 전자 유언이 포함되지 않아
                    <strong> 법적 효력에 제한이 있습니다.</strong> EverWill의 전자 인증은 유언 의사 확인 및 보관 목적이며,
                    법적 효력을 위해서는 반드시 자필증서 유언 또는 공정증서 유언으로 보완하시기 바랍니다.
                  </p>
                  <p className="text-xs text-amber-600">→ 관련 법령: 전자서명법 제2조, 민법 제1060조~제1072조</p>
                </div>
              </div>
            </div>

            {!certDone ? (
              <>
                {/* 인증 방법 선택 */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-3">인증 방법 선택</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "pass" as const, label: "PASS 인증", sub: "통신3사 공인인증", color: "bg-blue-600", icon: "📱" },
                      { key: "kakao" as const, label: "카카오 인증", sub: "카카오페이 인증서", color: "bg-yellow-400", icon: "💛" },
                      { key: "naver" as const, label: "네이버 인증", sub: "네이버 인증서", color: "bg-green-500", icon: "🟢" },
                      { key: "joint" as const, label: "공동인증서", sub: "구 공인인증서", color: "bg-gray-600", icon: "🔐" },
                    ].map(method => (
                      <button key={method.key}
                        onClick={() => handleCertMethod(method.key)}
                        disabled={!!certMethod && certMethod !== method.key}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          certMethod === method.key
                            ? "border-[#1F3864] bg-[#1F3864]/5"
                            : "border-gray-200 hover:border-[#1F3864]/40"
                        } disabled:opacity-40`}>
                        <div className="text-2xl mb-2">{method.icon}</div>
                        <p className="text-sm font-bold text-gray-800">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.sub}</p>
                        {certMethod === method.key && !certDone && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Loader2 className="w-3.5 h-3.5 text-[#1F3864] animate-spin" />
                            <span className="text-xs text-[#1F3864] font-semibold">인증 진행 중...</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 구분선 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400">또는</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                {/* 손글씨 서명 */}
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-3">손글씨 전자서명</p>
                  <SignatureCanvas
                    onSigned={(url) => { setSignatureDataUrl(url); setIsSigned(true); }}
                    onClear={() => { setSignatureDataUrl(""); setIsSigned(false); }}
                    isSigned={isSigned}
                  />
                  {isSigned && (
                    <button onClick={() => { setCertMethod("signature"); setCertDone(true); toast.success("서명이 등록되었습니다!"); }}
                      className="w-full mt-3 py-3 bg-[#1F3864] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#162a4e] transition-all">
                      <CheckCircle2 className="w-4 h-4" />
                      손글씨 서명으로 최종 서명 완료
                    </button>
                  )}
                </div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-green-800 text-lg">최종 서명 완료!</h3>
                <p className="text-green-600 text-sm">
                  {certMethod === "pass" ? "PASS 인증" :
                   certMethod === "kakao" ? "카카오 인증서" :
                   certMethod === "naver" ? "네이버 인증서" :
                   certMethod === "joint" ? "공동인증서" : "손글씨 서명"}으로 서명이 완료되었습니다.
                </p>
                {signatureDataUrl && certMethod === "signature" && (
                  <img src={signatureDataUrl} alt="등록된 서명" className="h-16 object-contain border border-gray-100 rounded-lg bg-[#FFFDF7] w-full mx-auto" />
                )}
              </motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSignStep("dual_reauth")}
                className="px-4 py-4 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-semibold hover:border-gray-400 transition-all">
                이전
              </button>
              <button onClick={() => goToStep("payment")}
                disabled={!certDone}
                className={`flex-1 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  certDone ? "btn-gold" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                <ChevronRight className="w-4 h-4" />
                {certDone ? "서명 완료 — 결제로" : "인증서 서명을 완료해주세요"}
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── 7단계: 결제 ─── */}
        {signStep === "payment" && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {!paymentDone ? (
              <>
                <div className="flex items-center gap-3 p-4 bg-[#C9A961]/10 border border-[#C9A961]/40 rounded-xl">
                  <CreditCard className="w-6 h-6 text-[#C9A961] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#1F3864]">7단계: 결제</p>
                    <p className="text-xs text-gray-500 mt-0.5">결제 완료 후 유언장이 분산 암호화 보안에 영구 보관됩니다.</p>
                  </div>
                </div>

                {/* 결제 내역 */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">결제 내역</p>
                  {isPremiumPlan ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <div>
                          <span className="text-gray-500">전자 인증 프리미엄</span>
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">묶음 할인</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">₩69,000</span>
                          <p className="text-xs text-gray-400 line-through">₩97,000</p>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-xs text-green-700">
                        ✓ 영상 유언장 + 자필 유언장 스캔 인증 포함
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">전자 인증 (최초)</span>
                        <span className="font-semibold">₩168,000</span>
                      </div>
                      {will.hasVideoWill && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">영상 유언장</span>
                          <span className="text-xs text-green-600 font-medium">포함</span>
                        </div>
                      )}
                      {will.hasHandwrittenScan && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">자필 스캔 인증</span>
                          <span className="text-xs text-green-600 font-medium">포함</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-[#1F3864]">
                    <span>합계</span>
                    <span>₩{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* 완료된 단계 요약 */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">인증 완료 항목</p>
                  {[
                    { label: "신분증 인증", done: !!idScanResult },
                    { label: `자산증명서 스캔 (${scannedDocs.length}건)`, done: scannedDocs.length > 0 },
                    { label: "AI 자산 자동완성", done: assetBuildDone },
                    { label: "유언장 자동 생성", done: willGenDone },
                    { label: "이메일 본인 재인증", done: emailVerified },
                    { label: "휴대폰 SMS 재인증", done: smsVerified },
                    { label: "공인인증서 최종 서명", done: certDone },
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
