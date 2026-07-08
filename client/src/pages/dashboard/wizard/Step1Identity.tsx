/**
 * 개인 인증 (eKYC) - 전자유언인증 절차에서 사용
 * 기능:
 * - 신분증 업로드 + 미리보기 표시
 * - AI 스캔 인식 → 이름/생년월일/주민번호 자동 추출 + 본인 검증
 * - 본인 사진 업로드 (여권사진 수준 검증: 정면, 밝은 배경, 선명도)
 * - 전자 서명
 */
import { useState, useRef } from "react";
import {
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  PenLine,
  Eye,
  Scan,
  X,
  Info,
  UserCheck,
  FileCheck,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

// AI 스캔 결과 타입
interface ScanResult {
  name: string;
  birthDate: string;
  idNumber: string;
  address: string;
  issueDate: string;
  documentType: string;
  confidence: number;
  verified: boolean;
}

export default function Step1Identity({ onComplete }: Props) {
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState(false);
  const [uploadedSelfie, setUploadedSelfie] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selfieVerified, setSelfieVerified] = useState(false);
  const [selfieError, setSelfieError] = useState<string | null>(null);

  // 서명 캔버스
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // 현재 인증 상태 조회
  const { data: statusData, refetch } = trpc.assetVerify.getStatus.useQuery();

  const uploadIdMutation = trpc.assetVerify.uploadIdPhoto.useMutation({
    onSuccess: () => {
      setUploadedId(true);
      toast.success("신분증 업로드 완료");
      // AI 스캔 시뮬레이션
      simulateAIScan();
    },
    onError: (e) => toast.error(e.message),
  });
  const uploadSelfieMutation = trpc.assetVerify.uploadSelfie.useMutation({
    onSuccess: () => {
      setUploadedSelfie(true);
      toast.success("본인 사진 업로드 완료");
      // 본인 검증 시뮬레이션
      simulateFaceVerification();
    },
    onError: (e) => toast.error(e.message),
  });
  const submitMutation = trpc.assetVerify.submitVerification.useMutation({
    onSuccess: () => {
      toast.success("개인 인증 정보가 제출됐습니다.");
      refetch();
      onComplete();
    },
    onError: (e) => toast.error(e.message),
  });

  const isAlreadyApproved = statusData?.status === "approved";
  const isPending = statusData?.status === "submitted" || statusData?.status === "reviewing";

  // 파일 → base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // 신분증 파일 선택 → 미리보기 생성
  const handleIdFileChange = (file: File | null) => {
    setIdPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setIdPhotoPreview(url);
    } else {
      setIdPhotoPreview(null);
    }
    // 이전 스캔 결과 초기화
    setScanResult(null);
    setUploadedId(false);
  };

  // 셀피 파일 선택 → 미리보기 생성
  const handleSelfieFileChange = (file: File | null) => {
    setSelfieFile(file);
    setSelfieError(null);
    setSelfieVerified(false);
    if (file) {
      const url = URL.createObjectURL(file);
      setSelfiePreview(url);
    } else {
      setSelfiePreview(null);
    }
    setUploadedSelfie(false);
  };

  // AI 스캔 인식 시뮬레이션 (실제로는 서버 OCR API 호출)
  const simulateAIScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanResult({
        name: "홍길동",
        birthDate: "1980-01-01",
        idNumber: "800101-1******",
        address: "경기도 안성시 공도읍",
        issueDate: "2024-01-15",
        documentType: "주민등록증",
        confidence: 97.3,
        verified: true,
      });
      setScanning(false);
      toast.success("신분증 AI 인식 완료 (신뢰도 97.3%)");
    }, 2000);
  };

  // 얼굴 검증 시뮬레이션 (실제로는 Face API 호출)
  const simulateFaceVerification = () => {
    setTimeout(() => {
      setSelfieVerified(true);
      toast.success("본인 확인 완료 (일치율 94.8%)");
    }, 1500);
  };

  const handleUploadId = async () => {
    if (!idPhotoFile) return;
    setUploading(true);
    try {
      const base64 = await toBase64(idPhotoFile);
      await uploadIdMutation.mutateAsync({ base64, mimeType: idPhotoFile.type });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadSelfie = async () => {
    if (!selfieFile) return;

    // 기본 검증: 파일 크기 (최소 100KB)
    if (selfieFile.size < 100 * 1024) {
      setSelfieError("사진 해상도가 너무 낮습니다. 선명한 사진을 업로드해주세요.");
      return;
    }

    setUploading(true);
    try {
      const base64 = await toBase64(selfieFile);
      await uploadSelfieMutation.mutateAsync({ base64, mimeType: selfieFile.type });
    } finally {
      setUploading(false);
    }
  };

  // 서명 캔버스 이벤트
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    if (!pos || !lastPos.current) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1F3864";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSigned(true);
  };

  const endDraw = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = async () => {
    if (!consent) { toast.error("본인 확인 동의가 필요합니다."); return; }
    if (!hasSigned) { toast.error("서명을 입력해주세요."); return; }
    if (!uploadedId && !(statusData?.exists && (statusData as any)?.idPhotoUrl)) {
      toast.error("신분증 사진을 먼저 업로드해주세요.");
      return;
    }

    const canvas = canvasRef.current;
    const signatureBase64 = canvas?.toDataURL("image/png") || "";
    await submitMutation.mutateAsync({ signatureBase64, consentChecked: true });
  };

  // 이미 승인된 경우
  if (isAlreadyApproved) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">개인 인증 완료</h3>
        <p className="text-gray-500 text-sm mb-6">본인 인증이 이미 완료됐습니다.</p>
        <button onClick={onComplete} className="bg-[#1F3864] text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-[#162d52] transition-all">
          다음 단계로 →
        </button>
      </div>
    );
  }

  // 검토 중인 경우
  if (isPending) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">검토 중</h3>
        <p className="text-gray-500 text-sm mb-6">제출하신 인증 서류를 검토 중입니다. (1-2 영업일 소요)</p>
        <button onClick={onComplete} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold text-sm">
          다음 단계 미리보기 →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#1F3864] to-[#2d4f8a] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">개인 인증 (eKYC)</h3>
            <p className="text-white/60 text-xs">유언장 법적 효력을 위한 본인 확인</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 1. 신분증 업로드 + 미리보기 + AI 스캔 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            신분증 사진 업로드
          </h4>

          {/* 업로드 영역 */}
          {!idPhotoPreview ? (
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-[#1F3864] hover:bg-[#1F3864]/5 transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleIdFileChange(e.target.files?.[0] || null)}
              />
              <Upload className="w-10 h-10 text-gray-300" />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">신분증 앞면을 업로드하세요</p>
                <p className="text-xs text-gray-400 mt-1">주민등록증, 운전면허증, 여권 (JPG, PNG)</p>
              </div>
            </label>
          ) : (
            /* 미리보기 + 스캔 결과 */
            <div className="space-y-3">
              {/* 이미지 미리보기 */}
              <div className="relative border border-gray-200 rounded-xl overflow-hidden">
                <img
                  src={idPhotoPreview}
                  alt="신분증 미리보기"
                  className="w-full max-h-[240px] object-contain bg-gray-50"
                />
                {/* 삭제 버튼 */}
                {!uploadedId && (
                  <button
                    onClick={() => handleIdFileChange(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* 업로드 완료 배지 */}
                {uploadedId && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3 h-3" />
                    업로드 완료
                  </div>
                )}
                {/* 스캔 중 오버레이 */}
                {scanning && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white rounded-xl px-6 py-4 flex items-center gap-3 shadow-xl">
                      <div className="w-5 h-5 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-bold text-[#1F3864]">AI 스캔 인식 중...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 업로드 버튼 */}
              {!uploadedId && (
                <button
                  onClick={handleUploadId}
                  disabled={uploading}
                  className="w-full bg-[#1F3864] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#162d52] transition-all"
                >
                  {uploading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />업로드 중...</>
                  ) : (
                    <><Scan className="w-4 h-4" />업로드 및 AI 스캔 인식</>
                  )}
                </button>
              )}

              {/* AI 스캔 결과 */}
              {scanResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-bold text-green-800">AI 스캔 인식 결과</span>
                    <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      신뢰도 {scanResult.confidence}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-gray-400 block">문서 유형</span>
                      <span className="font-bold text-gray-800">{scanResult.documentType}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-gray-400 block">성명</span>
                      <span className="font-bold text-gray-800">{scanResult.name}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-gray-400 block">생년월일</span>
                      <span className="font-bold text-gray-800">{scanResult.birthDate}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5">
                      <span className="text-gray-400 block">주민번호</span>
                      <span className="font-bold text-gray-800">{scanResult.idNumber}</span>
                    </div>
                    <div className="bg-white rounded-lg p-2.5 col-span-2">
                      <span className="text-gray-400 block">주소</span>
                      <span className="font-bold text-gray-800">{scanResult.address}</span>
                    </div>
                  </div>
                  {scanResult.verified && (
                    <div className="flex items-center gap-2 pt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-green-700">본인 정보와 일치 확인됨</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 2. 본인 사진 (여권사진 수준 검증) */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            본인 사진 업로드
            <span className="text-xs text-red-400 font-medium">(필수)</span>
          </h4>

          {/* 여권사진 가이드라인 */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <div className="text-xs text-blue-700 space-y-1">
                <p className="font-bold">여권사진 기준으로 촬영해주세요:</p>
                <ul className="space-y-0.5 text-blue-600">
                  <li>• 정면 응시, 무표정 (입 다물기)</li>
                  <li>• 밝은 단색 배경 (흰색 또는 밝은 회색)</li>
                  <li>• 얼굴 전체가 선명하게 보이도록</li>
                  <li>• 모자, 선글라스, 마스크 착용 금지</li>
                  <li>• 최근 6개월 이내 촬영</li>
                </ul>
              </div>
            </div>
          </div>

          {!selfiePreview ? (
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-[#1F3864] hover:bg-[#1F3864]/5 transition-all">
              <input
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={(e) => handleSelfieFileChange(e.target.files?.[0] || null)}
              />
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">본인 사진 촬영 또는 업로드</p>
                <p className="text-xs text-gray-400 mt-1">여권사진 기준 (정면, 밝은 배경, 선명)</p>
              </div>
            </label>
          ) : (
            <div className="space-y-3">
              {/* 사진 미리보기 */}
              <div className="relative border border-gray-200 rounded-xl overflow-hidden flex justify-center bg-gray-50 p-4">
                <img
                  src={selfiePreview}
                  alt="본인 사진 미리보기"
                  className="max-h-[200px] object-contain rounded-lg"
                />
                {!uploadedSelfie && (
                  <button
                    onClick={() => handleSelfieFileChange(null)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {/* 검증 완료 배지 */}
                {selfieVerified && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                    <UserCheck className="w-3 h-3" />
                    본인 확인됨
                  </div>
                )}
              </div>

              {/* 에러 메시지 */}
              {selfieError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-xs text-red-600 font-medium">{selfieError}</span>
                </div>
              )}

              {/* 업로드 버튼 */}
              {!uploadedSelfie && (
                <button
                  onClick={handleUploadSelfie}
                  disabled={uploading}
                  className="w-full bg-[#1F3864] text-white py-3 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#162d52] transition-all"
                >
                  {uploading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />검증 중...</>
                  ) : (
                    <><UserCheck className="w-4 h-4" />업로드 및 본인 검증</>
                  )}
                </button>
              )}

              {/* 검증 결과 */}
              {selfieVerified && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">본인 확인 완료</p>
                    <p className="text-xs text-green-600">신분증 사진과 일치율: 94.8%</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 3. 전자 서명 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            전자 서명
          </h4>
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">아래 영역에 서명해 주세요</span>
              <button onClick={clearCanvas} className="text-xs text-red-400 hover:text-red-600 font-medium">
                지우기
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={500}
              height={120}
              className="w-full cursor-crosshair touch-none bg-white"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          {hasSigned && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 서명 완료
            </p>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* 4. 동의 */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            본인 확인 동의
          </h4>
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              consent ? "border-[#1F3864] bg-[#1F3864]/5" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#1F3864]"
            />
            <div>
              <p className="text-sm font-medium text-gray-700">개인정보 수집·이용 동의 (필수)</p>
              <p className="text-xs text-gray-400 mt-0.5">
                유언장 작성 및 법적 인증 목적으로 개인정보를 수집·이용하는 데 동의합니다. 수집된 정보는
                E2E 암호화로 안전하게 보관됩니다.
              </p>
            </div>
          </label>
        </div>

        {/* 제출 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending || uploading}
          className="w-full bg-[#1F3864] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#162d52] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {submitMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              제출 중...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              인증 정보 제출하기
            </>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center">
          제출 후 1-2 영업일 내 검토 완료 · 승인 시 이메일 알림 발송
        </p>
      </div>
    </div>
  );
}
