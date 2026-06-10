/**
 * 영상 유언장 녹화 페이지 (/will/video)
 * 카메라 녹화 → S3 업로드 → 블록체인 해시 기록
 * 3가지 용도: 법적 녹음 유언 / 감성 메시지 / 미래 전달 영상
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, VideoOff, Play, Square, Upload, CheckCircle2,
  ArrowLeft, Sparkles, Shield, Clock, Heart, Send,
  Loader2, AlertCircle, Camera, RotateCcw, Download
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

type VideoType = "legal" | "emotional" | "future";
type Step = "select" | "record" | "preview" | "upload" | "done";

interface VideoTypeOption {
  id: VideoType;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  price: string;
}

const VIDEO_TYPES: VideoTypeOption[] = [
  {
    id: "legal",
    icon: <Shield className="w-8 h-8" />,
    title: "법적 녹음 유언",
    subtitle: "민법 제1067조 구수증서 유언",
    description: "AI가 낭독 스크립트를 생성하고, 녹화 중 실시간 가이드를 제공합니다. 블록체인 해시로 무결성을 보장합니다.",
    price: "+₩29,000",
  },
  {
    id: "emotional",
    icon: <Heart className="w-8 h-8" />,
    title: "감성 메시지 유언",
    subtitle: "가족 각자에게 개별 메시지",
    description: "사망 후 공개 타이밍을 설정할 수 있습니다. '손녀 성인 되는 날', '아들 결혼식 날' 등 특별한 순간에 전달됩니다.",
    price: "+₩29,000",
  },
  {
    id: "future",
    icon: <Clock className="w-8 h-8" />,
    title: "미래 전달 영상",
    subtitle: "생일·기념일 자동 전송",
    description: "평생 보관되며 수십 년 후에도 재생됩니다. 생일, 기념일, 특별한 날에 자동으로 전송됩니다.",
    price: "+₩29,000",
  },
];

// 법적 유언 스크립트 예시
const LEGAL_SCRIPT = `안녕하세요. 저는 [이름]입니다.
오늘 [날짜], 저의 유언을 영상으로 남깁니다.

저는 정신이 명료한 상태에서 자유로운 의사에 따라 다음과 같이 유언합니다.

첫째, 저의 모든 재산은 [상속인]에게 상속합니다.
둘째, [특별 지시사항]

이 유언은 저의 진정한 의사표시이며, 어떠한 강요나 압박 없이 작성되었습니다.

[날짜] [이름] (서명)`;

export default function VideoWillPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<Step>("select");
  const [selectedType, setSelectedType] = useState<VideoType | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ url: string; hash: string } | null>(null);
  const [recipient, setRecipient] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [memo, setMemo] = useState("");
  const [showScript, setShowScript] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 영상 유언 저장 API
  const saveVideoWill = trpc.videoWill.save.useMutation({
    onSuccess: (data) => {
      setUploadResult({ url: data.url, hash: data.blockchainHash });
      setStep("done");
      toast.success("영상 유언장이 안전하게 저장되었습니다!");
    },
    onError: (err) => {
      toast.error("저장 실패: " + err.message);
      setIsUploading(false);
    },
  });

  // 카메라 시작
  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "카메라 접근 실패";
      setCameraError("카메라/마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해 주세요.");
      console.error("Camera error:", msg);
    }
  }, []);

  // 카메라 중지
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // 녹화 시작
  const startRecording = useCallback(() => {
    if (!streamRef.current) return;
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
      ? "video/webm"
      : "video/mp4";

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      stopCamera();
      setStep("preview");
    };

    mediaRecorder.start(1000);
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 300) { // 5분 최대
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [stopCamera]);

  // 녹화 중지
  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  // 업로드 및 저장
  const handleUpload = useCallback(async () => {
    if (!videoBlob || !selectedType) return;
    setIsUploading(true);

    // Base64 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      saveVideoWill.mutate({
        videoBase64: base64,
        mimeType: videoBlob.type || "video/webm",
        videoType: selectedType,
        recipient: recipient || undefined,
        deliveryDate: deliveryDate || undefined,
        memo: memo || undefined,
      });
    };
    reader.readAsDataURL(videoBlob);
  }, [videoBlob, selectedType, recipient, deliveryDate, memo, saveVideoWill]);

  // 재촬영
  const handleRetake = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoBlob(null);
    setVideoUrl("");
    setStep("record");
    startCamera();
  }, [videoUrl, startCamera]);

  // 단계 진입 시 카메라 시작
  useEffect(() => {
    if (step === "record") {
      startCamera();
    }
    return () => {
      if (step !== "record") stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, []);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-[#1F3864] mx-auto mb-4" />
          <p className="text-xl font-bold text-[#1F3864]">로그인이 필요합니다</p>
          <button onClick={() => navigate("/login")} className="mt-4 px-6 py-3 bg-[#1F3864] text-white rounded-xl">
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white py-6 px-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate(-1 as never)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">영상 유언장</h1>
            <p className="text-blue-200 text-sm">Video Will · +₩29,000</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* Step 1: 유형 선택 */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-bold text-[#1F3864] mb-2">영상 유형 선택</h2>
              <p className="text-gray-500 mb-6">어떤 영상 유언을 남기시겠어요?</p>

              <div className="space-y-4">
                {VIDEO_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setStep("record");
                    }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all ${
                      selectedType === type.id
                        ? "border-[#C9A961] bg-amber-50"
                        : "border-gray-200 bg-white hover:border-[#1F3864]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-[#C9A961] mt-1">{type.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-bold text-[#1F3864]">{type.title}</h3>
                          <span className="text-sm font-semibold text-[#C9A961]">{type.price}</span>
                        </div>
                        <p className="text-sm text-[#C9A961] font-medium mb-2">{type.subtitle}</p>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: 녹화 */}
          {step === "record" && (
            <motion.div
              key="record"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1F3864]">영상 녹화</h2>
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="text-sm text-[#C9A961] font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-4 h-4" />
                  {showScript ? "스크립트 숨기기" : "AI 스크립트 보기"}
                </button>
              </div>

              {/* AI 스크립트 */}
              <AnimatePresence>
                {showScript && selectedType === "legal" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden"
                  >
                    <p className="text-xs font-bold text-amber-700 mb-2">📜 법적 유언 스크립트 (참고용)</p>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {LEGAL_SCRIPT}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 카메라 뷰 */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video mb-4">
                {cameraError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
                    <p className="text-sm text-center px-4">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="mt-3 px-4 py-2 bg-[#1F3864] rounded-lg text-sm"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}

                {/* 녹화 중 표시 */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    REC {formatTime(recordingTime)}
                  </div>
                )}

                {/* 최대 시간 경고 */}
                {isRecording && recordingTime > 240 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      ⚠️ 1분 후 자동 종료
                    </div>
                  </div>
                )}
              </div>

              {/* 녹화 컨트롤 */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => { stopCamera(); setStep("select"); }}
                  className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>

                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    disabled={!!cameraError}
                    className="w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Video className="w-8 h-8 text-white" />
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 bg-gray-800 hover:bg-gray-900 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 animate-pulse"
                  >
                    <Square className="w-8 h-8 text-white fill-white" />
                  </button>
                )}

                <div className="w-12" />
              </div>

              <p className="text-center text-sm text-gray-400 mt-3">
                {isRecording ? "녹화 중... 버튼을 눌러 중지하세요" : "빨간 버튼을 눌러 녹화를 시작하세요 (최대 5분)"}
              </p>
            </motion.div>
          )}

          {/* Step 3: 미리보기 */}
          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-xl font-bold text-[#1F3864] mb-4">녹화 확인</h2>

              {/* 영상 미리보기 */}
              <div className="bg-black rounded-2xl overflow-hidden aspect-video mb-6">
                <video
                  ref={previewRef}
                  src={videoUrl}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 추가 정보 (감성/미래 유형) */}
              {(selectedType === "emotional" || selectedType === "future") && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#1F3864] mb-1">
                      수신인 (선택)
                    </label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="예: 딸 김영희"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1F3864] focus:outline-none"
                    />
                  </div>
                  {selectedType === "future" && (
                    <div>
                      <label className="block text-sm font-semibold text-[#1F3864] mb-1">
                        전달 날짜 (선택)
                      </label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1F3864] focus:outline-none"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-[#1F3864] mb-1">
                      메모 (선택)
                    </label>
                    <textarea
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      placeholder="이 영상에 대한 메모를 남겨주세요..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#1F3864] focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              {/* 보안 안내 */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">블록체인 무결성 보장</p>
                    <p className="text-xs text-blue-600 mt-1">
                      영상이 업로드되면 SHA-256 해시값이 블록체인에 기록됩니다. 이후 영상의 위변조 여부를 언제든지 검증할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  재촬영
                </button>
                <button
                  onClick={() => { setStep("upload"); handleUpload(); }}
                  className="flex-1 py-4 bg-[#1F3864] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#2a4d8a] transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  저장하기
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: 업로드 중 */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <Loader2 className="w-16 h-16 text-[#1F3864] animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-[#1F3864] mb-2">저장 중...</h2>
              <p className="text-gray-500">영상을 암호화하고 블록체인에 기록하고 있습니다</p>
            </motion.div>
          )}

          {/* Step 5: 완료 */}
          {step === "done" && uploadResult && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-[#1F3864] mb-2">영상 유언장 저장 완료</h2>
              <p className="text-gray-500 mb-8">블록체인에 안전하게 기록되었습니다</p>

              {/* 블록체인 해시 */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-xs font-bold text-gray-500 mb-1">블록체인 해시 (무결성 증명)</p>
                <p className="text-xs font-mono text-gray-700 break-all">{uploadResult.hash}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex-1 py-4 bg-[#1F3864] text-white rounded-xl font-semibold hover:bg-[#2a4d8a] transition-colors"
                >
                  대시보드로 이동
                </button>
                <button
                  onClick={() => {
                    setStep("select");
                    setSelectedType(null);
                    setVideoBlob(null);
                    setVideoUrl("");
                    setUploadResult(null);
                  }}
                  className="flex-1 py-4 border-2 border-[#1F3864] text-[#1F3864] rounded-xl font-semibold hover:bg-blue-50 transition-colors"
                >
                  추가 녹화
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
