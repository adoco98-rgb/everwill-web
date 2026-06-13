/**
 * KYC 본인인증 페이지
 * 3단계: 신분증 업로드 → 셀카 촬영 → AI 검증
 * verificationRouter.submitFaceVerification 사용
 */
import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Camera,
  Upload,
  Shield,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Lock,
  Fingerprint,
  FileText,
  User,
} from "lucide-react";

// 이미지 파일을 Base64로 변환
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 이미지 리사이즈 (최대 1024px, 품질 0.85)
function resizeImage(base64: string, maxSize = 1024): Promise<string> {
  return new Promise((resolve) => {
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
    img.src = base64;
  });
}

type Step = "intro" | "id-upload" | "selfie" | "processing" | "result";

export default function KYCVerifyPage() {
  const [step, setStep] = useState<Step>("intro");
  const [idBase64, setIdBase64] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    success: boolean;
    message: string;
    confidence?: number | undefined;
  } | null>(null);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // 인증 상태 조회
  const { data: status, refetch: refetchStatus } = trpc.verification.getStatus.useQuery();

  // AI 얼굴 인증 뮤테이션
  const submitVerification = trpc.verification.submitFaceVerification.useMutation({
    onSuccess: (data) => {
      setVerifyResult({
        success: data.faceVerified,
        message: data.result || (data.faceVerified ? "본인인증이 완료되었습니다." : "신분증과 얼굴이 일치하지 않습니다."),
        confidence: undefined,
      });
      setStep("result");
      refetchStatus();
    },
    onError: (err) => {
      toast.error("인증 처리 중 오류가 발생했습니다: " + err.message);
      setStep("selfie");
    },
  });

  // 신분증 파일 선택
  const handleIdUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64);
      setIdBase64(resized);
      toast.success("신분증 사진이 등록되었습니다.");
    } catch {
      toast.error("이미지 처리 중 오류가 발생했습니다.");
    }
  }, []);

  // 카메라 시작
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error("카메라에 접근할 수 없습니다. 권한을 허용해 주세요.");
    }
  }, []);

  // 카메라 정지
  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  // 셀카 촬영
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")!.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    const resized = await resizeImage(base64, 800);
    setSelfieBase64(resized);
    stopCamera();
    toast.success("셀카가 촬영되었습니다.");
  }, [stopCamera]);

  // 파일로 셀카 업로드
  const handleSelfieUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      const resized = await resizeImage(base64, 800);
      setSelfieBase64(resized);
      toast.success("셀카 사진이 등록되었습니다.");
    } catch {
      toast.error("이미지 처리 중 오류가 발생했습니다.");
    }
  }, []);

  // AI 인증 제출
  const handleSubmit = useCallback(() => {
    if (!idBase64 || !selfieBase64) {
      toast.error("신분증과 셀카 사진이 모두 필요합니다.");
      return;
    }
    setStep("processing");
    submitVerification.mutate({
      idImageBase64: idBase64,
      selfieBase64: selfieBase64,
    });
  }, [idBase64, selfieBase64, submitVerification]);

  // 이미 인증 완료된 경우
  if (status?.faceVerified) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#1F3864] mb-3">본인인증 완료</h2>
        <p className="text-gray-600 mb-2">
          {status.faceVerifiedAt
            ? `${new Date(status.faceVerifiedAt).toLocaleDateString("ko-KR")} 인증 완료`
            : "인증이 완료되었습니다."}
        </p>
        {status.faceVerifyResult && (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mt-4">
            {status.faceVerifyResult}
          </p>
        )}
        <Badge className="mt-4 bg-green-100 text-green-700 border-green-200">
          <Shield className="w-3 h-3 mr-1" /> KYC 인증 완료
        </Badge>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Fingerprint className="w-6 h-6 text-[#C9A961]" />
          <h1 className="text-2xl font-bold text-[#1F3864]">본인인증 (KYC)</h1>
        </div>
        <p className="text-gray-500 text-sm">
          유언 인증을 위해 신분증과 얼굴 사진으로 본인을 확인합니다.
        </p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: "intro", label: "안내" },
          { key: "id-upload", label: "신분증" },
          { key: "selfie", label: "셀카" },
          { key: "processing", label: "검증" },
          { key: "result", label: "완료" },
        ].map((s, i, arr) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                step === s.key
                  ? "bg-[#1F3864] text-white"
                  : ["intro", "id-upload", "selfie", "processing", "result"].indexOf(step) > i
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {["intro", "id-upload", "selfie", "processing", "result"].indexOf(step) > i ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs hidden sm:block ${step === s.key ? "text-[#1F3864] font-semibold" : "text-gray-400"}`}>
              {s.label}
            </span>
            {i < arr.length - 1 && <div className="flex-1 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      {/* Step 1: 안내 */}
      {step === "intro" && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" /> 본인인증이 필요한 이유
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                유언장의 법적 효력을 위해 본인 확인이 필수입니다.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                타인이 무단으로 유언을 작성하는 것을 방지합니다.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                사망 후 상속 집행 시 본인 확인 자료로 활용됩니다.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: FileText, title: "신분증 준비", desc: "주민등록증, 운전면허증, 여권 중 하나" },
              { icon: Camera, title: "셀카 촬영", desc: "밝은 곳에서 정면 얼굴 촬영" },
              { icon: Shield, title: "AI 검증", desc: "신분증과 얼굴 자동 매칭 (10초)" },
            ].map((item) => (
              <div key={item.title} className="text-center p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-[#1F3864]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <item.icon className="w-5 h-5 text-[#1F3864]" />
                </div>
                <p className="font-semibold text-sm text-[#1F3864] mb-1">{item.title}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">
                <p className="font-semibold mb-1">개인정보 보호 안내</p>
                <p>업로드된 신분증과 셀카는 AES-256 암호화로 저장되며, 본인인증 목적 외에는 절대 사용되지 않습니다.</p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setStep("id-upload")}
            className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white py-6 text-lg"
          >
            본인인증 시작하기 <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Step 2: 신분증 업로드 */}
      {step === "id-upload" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#1F3864] mb-2">신분증 사진 업로드</h2>
            <p className="text-gray-500 text-sm">
              주민등록증, 운전면허증, 여권 중 하나를 촬영하거나 업로드해 주세요.
            </p>
          </div>

          {/* 업로드 영역 */}
          <div
            onClick={() => idInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              idBase64
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-[#C9A961] bg-gray-50"
            }`}
          >
            {idBase64 ? (
              <div>
                <img
                  src={idBase64}
                  alt="신분증"
                  className="max-h-48 mx-auto rounded-lg object-contain mb-3 shadow"
                />
                <p className="text-green-600 font-semibold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 신분증 등록 완료
                </p>
                <p className="text-xs text-gray-400 mt-1">다시 업로드하려면 클릭하세요</p>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-600 mb-1">신분증 사진을 업로드하세요</p>
                <p className="text-sm text-gray-400">JPG, PNG, HEIC · 최대 10MB</p>
              </div>
            )}
          </div>
          <input
            ref={idInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleIdUpload}
          />

          {/* 주의사항 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">촬영 시 주의사항</p>
            {[
              "신분증 전체가 화면에 들어오도록 촬영",
              "글자가 선명하게 보이도록 밝은 곳에서 촬영",
              "빛 반사나 그림자가 없도록 주의",
              "신분증 훼손·만료 여부 확인",
            ].map((tip) => (
              <p key={tip} className="text-xs text-gray-500 flex items-start gap-1.5">
                <span className="text-[#C9A961] mt-0.5">•</span> {tip}
              </p>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("intro")} className="flex-1">
              이전
            </Button>
            <Button
              onClick={() => setStep("selfie")}
              disabled={!idBase64}
              className="flex-1 bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
            >
              다음: 셀카 촬영 <ChevronRight className="ml-1 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: 셀카 촬영 */}
      {step === "selfie" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#1F3864] mb-2">본인 얼굴 촬영</h2>
            <p className="text-gray-500 text-sm">
              신분증 사진과 비교할 본인 얼굴 사진을 촬영해 주세요.
            </p>
          </div>

          {/* 카메라 또는 미리보기 */}
          {cameraActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-xl bg-black"
                style={{ maxHeight: 360 }}
              />
              {/* 얼굴 가이드 오버레이 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-56 border-4 border-[#C9A961] rounded-full opacity-60" />
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={stopCamera} className="flex-1">
                  취소
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="flex-1 bg-[#C9A961] hover:bg-[#C9A961]/90 text-white"
                >
                  <Camera className="mr-2 w-4 h-4" /> 촬영하기
                </Button>
              </div>
            </div>
          ) : selfieBase64 ? (
            <div className="text-center">
              <img
                src={selfieBase64}
                alt="셀카"
                className="max-h-48 mx-auto rounded-xl object-contain mb-3 shadow"
              />
              <p className="text-green-600 font-semibold flex items-center justify-center gap-1 mb-3">
                <CheckCircle2 className="w-4 h-4" /> 셀카 등록 완료
              </p>
              <Button
                variant="outline"
                onClick={() => setSelfieBase64(null)}
                size="sm"
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> 다시 촬영
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={startCamera}
                className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white py-6"
              >
                <Camera className="mr-2 w-5 h-5" /> 카메라로 촬영하기
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">또는</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => selfieInputRef.current?.click()}
                className="w-full py-6"
              >
                <Upload className="mr-2 w-5 h-5" /> 갤러리에서 선택
              </Button>
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleSelfieUpload}
              />
            </div>
          )}

          {/* 촬영 가이드 */}
          {!cameraActive && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <User className="w-4 h-4" /> 셀카 촬영 가이드
              </p>
              {[
                "정면을 바라보며 밝은 곳에서 촬영",
                "안경, 마스크, 모자 착용 금지",
                "얼굴 전체가 화면에 들어오도록",
                "표정은 자연스럽게 (무표정 권장)",
              ].map((tip) => (
                <p key={tip} className="text-xs text-gray-500 flex items-start gap-1.5">
                  <span className="text-[#C9A961] mt-0.5">•</span> {tip}
                </p>
              ))}
            </div>
          )}

          {!cameraActive && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("id-upload")} className="flex-1">
                이전
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selfieBase64}
                className="flex-1 bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
              >
                AI 검증 시작 <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: 처리 중 */}
      {step === "processing" && (
        <div className="text-center py-16 space-y-6">
          <div className="w-20 h-20 bg-[#1F3864]/10 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-[#1F3864] animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1F3864] mb-2">AI 신원 검증 중...</h2>
            <p className="text-gray-500 text-sm">신분증과 얼굴 사진을 비교하고 있습니다. 잠시만 기다려 주세요.</p>
          </div>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-[#C9A961] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 max-w-sm mx-auto">
            {[
              "신분증 진위 확인",
              "얼굴 특징점 추출",
              "신분증 사진과 셀카 매칭",
              "인증 결과 생성",
            ].map((item, i) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 ${i < 2 ? "bg-green-400" : "bg-gray-200 animate-pulse"}`} />
                <span className={i < 2 ? "text-gray-700" : "text-gray-400"}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: 결과 */}
      {step === "result" && verifyResult && (
        <div className="text-center py-8 space-y-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
              verifyResult.success ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {verifyResult.success ? (
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-500" />
            )}
          </div>

          <div>
            <h2 className={`text-2xl font-bold mb-2 ${verifyResult.success ? "text-green-700" : "text-red-600"}`}>
              {verifyResult.success ? "본인인증 완료!" : "인증 실패"}
            </h2>
            <p className="text-gray-600 text-sm">{verifyResult.message}</p>
            {verifyResult.confidence !== undefined && (
              <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
                <span className="text-xs text-gray-500">일치도</span>
                <span className={`text-sm font-bold ${verifyResult.confidence >= 70 ? "text-green-600" : "text-red-500"}`}>
                  {verifyResult.confidence}%
                </span>
              </div>
            )}
          </div>

          {verifyResult.success ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-700 text-sm">
                  본인인증이 완료되었습니다. 이제 유언장 작성 및 전자 인증 서비스를 이용하실 수 있습니다.
                </p>
              </div>
              <Button
                onClick={() => window.location.href = "/dashboard"}
                className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
              >
                대시보드로 이동
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 text-sm">
                  신분증과 얼굴 사진이 일치하지 않습니다. 더 선명한 사진으로 다시 시도해 주세요.
                </p>
              </div>
              <Button
                onClick={() => {
                  setIdBase64(null);
                  setSelfieBase64(null);
                  setVerifyResult(null);
                  setStep("id-upload");
                }}
                className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
              >
                <RefreshCw className="mr-2 w-4 h-4" /> 다시 시도
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
