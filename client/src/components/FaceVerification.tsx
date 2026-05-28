/**
 * 얼굴 인증 컴포넌트
 * 신분증 사진 + 셀피(얼굴) 사진을 모바일 카메라 촬영 또는 갤러리 업로드로 제출
 * AI가 두 사진의 얼굴을 비교하여 본인 인증 완료
 */
import { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2, AlertCircle, Loader2, RefreshCw, CreditCard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// 이미지 파일 → base64 data URL 변환
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// 이미지 리사이즈 (최대 1200px, 품질 0.85)
const resizeImage = (dataUrl: string, maxSize = 1200): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.src = dataUrl;
  });

interface FaceVerificationProps {
  onSuccess?: () => void;
  compact?: boolean; // 대시보드 내 간략 표시 모드
}

export default function FaceVerification({ onSuccess, compact = false }: FaceVerificationProps) {
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [idBase64, setIdBase64] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "confirm" | "done">("upload");

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  // 인증 상태 조회
  const { data: status, refetch: refetchStatus } = trpc.verification.getStatus.useQuery();

  // 얼굴 인증 제출 mutation
  const submitMutation = trpc.verification.submitFaceVerification.useMutation({
    onSuccess: (data) => {
      if (data.faceVerified) {
        toast.success("본인 인증이 완료되었습니다!");
        setStep("done");
        refetchStatus();
        onSuccess?.();
      } else {
        toast.error(`인증 실패: ${data.result}`);
      }
    },
    onError: (err) => {
      toast.error(`오류: ${err.message}`);
    },
  });

  // 신분증 사진 선택 처리
  const handleIdChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    const raw = await fileToBase64(file);
    const resized = await resizeImage(raw);
    setIdPreview(resized);
    setIdBase64(resized);
  };

  // 셀피 사진 선택 처리
  const handleSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    const raw = await fileToBase64(file);
    const resized = await resizeImage(raw);
    setSelfiePreview(resized);
    setSelfieBase64(resized);
  };

  // 인증 제출
  const handleSubmit = () => {
    if (!idBase64 || !selfieBase64) {
      toast.error("신분증과 셀피 사진을 모두 업로드해주세요.");
      return;
    }
    setStep("confirm");
    submitMutation.mutate({ idImageBase64: idBase64, selfieBase64 });
  };

  // 이미 인증 완료된 경우
  if (status?.faceVerified) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
        <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800 text-sm">본인 인증 완료</p>
          {status.faceVerifiedAt && (
            <p className="text-xs text-green-600 mt-0.5">
              {new Date(status.faceVerifiedAt).toLocaleDateString("ko-KR")} 인증됨
            </p>
          )}
        </div>
      </div>
    );
  }

  // 완료 단계
  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-bold text-gray-900">본인 인증 완료!</h3>
        <p className="text-gray-600 text-sm">신분증과 셀피 사진이 일치하여 인증이 완료되었습니다.</p>
      </div>
    );
  }

  // 분석 중 단계
  if (step === "confirm" && submitMutation.isPending) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Loader2 className="w-12 h-12 text-[#1F3864] animate-spin" />
        <h3 className="text-lg font-semibold text-gray-900">AI가 사진을 분석하고 있습니다...</h3>
        <p className="text-gray-500 text-sm">신분증과 셀피를 비교하는 중입니다. 잠시만 기다려주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-[#1F3864]">본인 인증</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            신분증 사진과 셀피(얼굴 사진)를 업로드하면 AI가 자동으로 본인 여부를 확인합니다.
          </p>
        </div>
      )}

      {/* 안내 배너 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">📋 인증 방법</p>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>• 신분증: 주민등록증, 운전면허증, 여권 중 하나</li>
          <li>• 셀피: 얼굴이 잘 보이는 정면 사진</li>
          <li>• 모바일에서는 카메라 직접 촬영 가능</li>
          <li>• 사진은 암호화되어 안전하게 보관됩니다</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 신분증 업로드 */}
        <Card className="border-2 border-dashed border-gray-200 hover:border-[#C9A961] transition-colors cursor-pointer"
          onClick={() => idInputRef.current?.click()}>
          <CardContent className="p-4 flex flex-col items-center gap-3 min-h-[200px] justify-center">
            {idPreview ? (
              <>
                <img src={idPreview} alt="신분증 미리보기" className="w-full h-32 object-cover rounded-lg" />
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  신분증 업로드 완료
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setIdPreview(null); setIdBase64(null); }}>
                  <RefreshCw className="w-3 h-3 mr-1" /> 다시 선택
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-[#1F3864]" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-sm">신분증 사진</p>
                  <p className="text-xs text-gray-500 mt-1">주민등록증 / 운전면허증 / 여권</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Camera className="w-3 h-3" /> 카메라 촬영
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Upload className="w-3 h-3" /> 갤러리
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 셀피 업로드 */}
        <Card className="border-2 border-dashed border-gray-200 hover:border-[#C9A961] transition-colors cursor-pointer"
          onClick={() => selfieInputRef.current?.click()}>
          <CardContent className="p-4 flex flex-col items-center gap-3 min-h-[200px] justify-center">
            {selfiePreview ? (
              <>
                <img src={selfiePreview} alt="셀피 미리보기" className="w-full h-32 object-cover rounded-lg" />
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  셀피 업로드 완료
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelfiePreview(null); setSelfieBase64(null); }}>
                  <RefreshCw className="w-3 h-3 mr-1" /> 다시 선택
                </Button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-[#1F3864]" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800 text-sm">셀피 (얼굴 사진)</p>
                  <p className="text-xs text-gray-500 mt-1">정면을 바라보는 얼굴 사진</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Camera className="w-3 h-3" /> 카메라 촬영
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Upload className="w-3 h-3" /> 갤러리
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 숨겨진 파일 입력 - 신분증 (뒷면 카메라) */}
      <input
        ref={idInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleIdChange}
      />
      {/* 숨겨진 파일 입력 - 셀피 (전면 카메라) */}
      <input
        ref={selfieInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleSelfieChange}
      />

      {/* 오류 메시지 */}
      {submitMutation.isError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>인증 중 오류가 발생했습니다. 다시 시도해주세요.</span>
        </div>
      )}

      {/* 제출 버튼 */}
      <Button
        className="w-full h-14 text-base font-bold bg-[#1F3864] hover:bg-[#1a3057] text-white"
        disabled={!idBase64 || !selfieBase64 || submitMutation.isPending}
        onClick={handleSubmit}
      >
        {submitMutation.isPending ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> AI 분석 중...</>
        ) : (
          "본인 인증 시작"
        )}
      </Button>

      <p className="text-xs text-center text-gray-400">
        업로드된 사진은 본인 인증 목적으로만 사용되며, AES-256 암호화로 안전하게 보관됩니다.
      </p>
    </div>
  );
}
