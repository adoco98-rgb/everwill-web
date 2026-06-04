/**
 * 1단계: 개인 인증 (eKYC)
 * 기존 assetVerify 라우터 활용:
 * - getStatus: 현재 인증 상태 조회
 * - uploadIdPhoto: 신분증 사진 업로드
 * - uploadSelfie: 셀피 업로드
 * - submitVerification: 동의 + 서명 제출
 */
import { useState, useRef } from "react";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Camera, PenLine } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

export default function Step1Identity({ onComplete }: Props) {
  const [idPhotoFile, setIdPhotoFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedId, setUploadedId] = useState(false);
  const [uploadedSelfie, setUploadedSelfie] = useState(false);

  // 서명 캔버스
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // 현재 인증 상태 조회
  const { data: statusData, refetch } = trpc.assetVerify.getStatus.useQuery();

  const uploadIdMutation = trpc.assetVerify.uploadIdPhoto.useMutation({
    onSuccess: () => { setUploadedId(true); toast.success("신분증 업로드 완료"); },
    onError: (e) => toast.error(e.message),
  });
  const uploadSelfieMutation = trpc.assetVerify.uploadSelfie.useMutation({
    onSuccess: () => { setUploadedSelfie(true); toast.success("셀피 업로드 완료"); },
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

  const handleUploadId = async () => {
    if (!idPhotoFile) return;
    setUploading(true);
    try {
      const base64 = await toBase64(idPhotoFile);
      await uploadIdMutation.mutateAsync({ base64, mimeType: idPhotoFile.type });
    } finally { setUploading(false); }
  };

  const handleUploadSelfie = async () => {
    if (!selfieFile) return;
    setUploading(true);
    try {
      const base64 = await toBase64(selfieFile);
      await uploadSelfieMutation.mutateAsync({ base64, mimeType: selfieFile.type });
    } finally { setUploading(false); }
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

  const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleSubmit = async () => {
    if (!consent) { toast.error("본인 확인 동의가 필요합니다."); return; }
    if (!hasSigned) { toast.error("서명을 입력해주세요."); return; }
    if (!uploadedId && !(statusData?.exists && (statusData as any)?.idPhotoUrl)) { toast.error("신분증 사진을 먼저 업로드해주세요."); return; }

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
            <h3 className="text-white font-bold">1단계: 개인 인증</h3>
            <p className="text-white/60 text-xs">유언장 법적 효력을 위한 본인 확인</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 신분증 업로드 */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-xs">1</span>
            신분증 사진 업로드
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 신분증 */}
            <div className="space-y-2">
              <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                uploadedId || (statusData?.exists && (statusData as any)?.idPhotoUrl) ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-[#1F3864]"
              }`}>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setIdPhotoFile(e.target.files?.[0] || null)} />
                {uploadedId || (statusData?.exists && (statusData as any)?.idPhotoUrl) ? (
                  <><CheckCircle2 className="w-8 h-8 text-green-500" /><span className="text-xs text-green-600 font-medium">신분증 업로드 완료</span></>
                ) : (
                  <><Upload className="w-8 h-8 text-gray-300" /><span className="text-xs text-gray-500 font-medium">신분증 앞면 선택</span><span className="text-xs text-gray-400">주민등록증, 운전면허증, 여권</span></>
                )}
              </label>
              {idPhotoFile && !uploadedId && (
                <button onClick={handleUploadId} disabled={uploading} className="w-full bg-[#1F3864] text-white py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                  {uploading ? "업로드 중..." : "업로드"}
                </button>
              )}
            </div>

            {/* 셀피 */}
            <div className="space-y-2">
              <label className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all ${
                uploadedSelfie || (statusData?.exists && (statusData as any)?.selfieUrl) ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-[#1F3864]"
              }`}>
                <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => setSelfieFile(e.target.files?.[0] || null)} />
                {uploadedSelfie || (statusData?.exists && (statusData as any)?.selfieUrl) ? (
                  <><CheckCircle2 className="w-8 h-8 text-green-500" /><span className="text-xs text-green-600 font-medium">셀피 업로드 완료</span></>
                ) : (
                  <><Camera className="w-8 h-8 text-gray-300" /><span className="text-xs text-gray-500 font-medium">본인 셀피 (선택)</span><span className="text-xs text-gray-400">얼굴이 잘 보이는 사진</span></>
                )}
              </label>
              {selfieFile && !uploadedSelfie && (
                <button onClick={handleUploadSelfie} disabled={uploading} className="w-full bg-[#1F3864] text-white py-2 rounded-lg text-xs font-bold disabled:opacity-50">
                  {uploading ? "업로드 중..." : "업로드"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 전자 서명 */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-xs">2</span>
            전자 서명
          </h4>
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">아래 영역에 서명해 주세요</span>
              <button onClick={clearCanvas} className="text-xs text-red-400 hover:text-red-600">지우기</button>
            </div>
            <canvas
              ref={canvasRef}
              width={500}
              height={120}
              className="w-full cursor-crosshair touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          {hasSigned && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 서명 완료</p>}
        </div>

        {/* 동의 */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-xs">3</span>
            본인 확인 동의
          </h4>
          <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
            consent ? "border-[#1F3864] bg-[#1F3864]/5" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#1F3864]" />
            <div>
              <p className="text-sm font-medium text-gray-700">개인정보 수집·이용 동의 (필수)</p>
              <p className="text-xs text-gray-400 mt-0.5">유언장 작성 및 법적 인증 목적으로 개인정보를 수집·이용하는 데 동의합니다. 수집된 정보는 E2E 암호화로 안전하게 보관됩니다.</p>
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
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />제출 중...</>
          ) : (
            <><ShieldCheck className="w-4 h-4" />인증 정보 제출하기</>
          )}
        </button>
        <p className="text-xs text-gray-400 text-center">제출 후 1-2 영업일 내 검토 완료 · 승인 시 이메일 알림 발송</p>
      </div>
    </div>
  );
}
