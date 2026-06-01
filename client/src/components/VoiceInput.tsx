/**
 * VoiceInput - 음성 인식 입력 컴포넌트
 * 노인 친화적 대형 마이크 버튼 + Whisper API 음성→텍스트 변환
 * 자서전/일기/편지 쓰기 모든 기능에서 공통 사용
 */

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface VoiceInputProps {
  /** 음성 인식 완료 후 텍스트 콜백 */
  onTranscribed: (text: string) => void;
  /** 언어 코드 (기본: ko) */
  language?: string;
  /** 버튼 크기 (sm/md/lg) - 기본 lg (노인 친화적) */
  size?: "sm" | "md" | "lg";
  /** 힌트 텍스트 */
  hint?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export function VoiceInput({
  onTranscribed,
  language = "ko",
  size = "lg",
  hint = "버튼을 누르고 말씀하세요",
  disabled = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 음성 파일 업로드 후 Whisper 변환 API
  const transcribeMutation = trpc.voice.transcribe.useMutation({
    onSuccess: (data) => {
      if (data.text) {
        onTranscribed(data.text);
        toast.success("음성이 텍스트로 변환되었습니다!");
      }
    },
    onError: (err) => {
      toast.error("음성 인식 실패: " + err.message);
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  // 녹음 시작
  const startRecording = useCallback(async () => {
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // 스트림 트랙 종료
        stream.getTracks().forEach((t) => t.stop());
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });

        // 16MB 제한 체크
        if (blob.size > 16 * 1024 * 1024) {
          toast.error("녹음 파일이 너무 큽니다. 짧게 말씀해 주세요.");
          setIsProcessing(false);
          return;
        }

        // Base64로 변환 후 서버 전송
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          transcribeMutation.mutate({
            audioBase64: base64,
            mimeType,
            language,
          });
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start(1000); // 1초마다 chunk
      setIsRecording(true);
      setRecordingTime(0);

      // 녹음 시간 타이머
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 120) {
            // 2분 최대
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      toast.error("마이크 접근 권한이 필요합니다. 브라우저 설정을 확인해 주세요.");
    }
  }, [disabled, language, transcribeMutation]);

  // 녹음 중지
  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsProcessing(true);
    }
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  // 버튼 크기 설정 (노인 친화적으로 크게)
  const sizeClasses = {
    sm: "w-12 h-12 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-24 h-24 text-4xl",
  };

  const iconSize = {
    sm: 20,
    md: 28,
    lg: 40,
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 메인 마이크 버튼 */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled || isProcessing}
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          transition-all duration-200 shadow-lg
          ${isRecording
            ? "bg-red-500 hover:bg-red-600 animate-pulse scale-110"
            : isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#1F3864] hover:bg-[#2a4d8a] active:scale-95"
          }
          disabled:opacity-50
        `}
        aria-label={isRecording ? "녹음 중지" : "음성 입력 시작"}
      >
        {isProcessing ? (
          <Loader2 size={iconSize[size]} className="text-white animate-spin" />
        ) : isRecording ? (
          <MicOff size={iconSize[size]} className="text-white" />
        ) : (
          <Mic size={iconSize[size]} className="text-white" />
        )}
      </button>

      {/* 상태 텍스트 */}
      <div className="text-center">
        {isProcessing ? (
          <p className="text-base font-semibold text-[#1F3864] animate-pulse">
            음성을 텍스트로 변환 중...
          </p>
        ) : isRecording ? (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <p className="text-base font-bold text-red-600">녹음 중...</p>
            </div>
            <p className="text-sm text-gray-500">
              {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")} / 2:00
            </p>
            <p className="text-sm text-gray-500 font-medium">
              말씀이 끝나면 버튼을 다시 누르세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-[#1F3864]">
              <Volume2 size={16} />
              <p className="text-sm font-semibold">{hint}</p>
            </div>
            <p className="text-xs text-gray-400">최대 2분 녹음 가능</p>
          </div>
        )}
      </div>
    </div>
  );
}
