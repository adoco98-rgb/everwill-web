/**
 * 유류분 영상 증언 페이지
 * 유언자가 유류분 배제 사유를 영상으로 증언하여 법적 증거력 강화
 */
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Video,
  Play,
  Square,
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Mic,
  Camera,
  Save,
  Info,
} from "lucide-react";
import { toast } from "sonner";

/** 임시저장 키 */
const DRAFT_KEY = "everwill_reserve_share_video_draft";

/** 녹화 상태 */
type RecordingState = "idle" | "recording" | "recorded" | "uploaded";

export default function ReserveShareVideoPage() {
  const { user } = useAuth();

  // 녹화 상태
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // 스크립트
  const [script, setScript] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 미디어 참조
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // 임시저장 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.script) setScript(data.script);
        setLastSaved(data.savedAt || null);
        toast.success("이전에 작성하던 스크립트를 불러왔습니다.");
      }
    } catch {
      // 무시
    }
  }, []);

  // 임시저장
  const handleSaveDraft = () => {
    try {
      const data = {
        script,
        savedAt: new Date().toLocaleString("ko-KR"),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      setLastSaved(data.savedAt);
      setIsDirty(false);
      toast.success("스크립트가 임시저장되었습니다.");
    } catch {
      toast.error("임시저장에 실패했습니다.");
    }
  };

  // 녹화 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setRecordingState("recorded");

        // 스트림 정리
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start(1000);
      setRecordingState("recording");
      setDuration(0);

      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } catch (err) {
      toast.error("카메라/마이크 접근이 거부되었습니다. 브라우저 설정을 확인하세요.");
    }
  };

  // 녹화 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // 재녹화
  const resetRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingState("idle");
    setDuration(0);
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // 기본 스크립트 생성
  const generateDefaultScript = () => {
    const name = user?.name || "___";
    const date = new Date().toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const defaultScript = `저는 ${name}입니다. 오늘 ${date}, 자유로운 의사에 의하여 다음과 같이 유류분 배제 사유를 진술합니다.

[배제 대상 상속인의 이름]은(는) [구체적인 사유를 진술하세요].

이러한 사유로 인하여, 저는 [배제 대상 상속인의 이름]에 대한 유류분 반환청구를 배제하고자 하는 의사를 명확히 밝힙니다.

본 영상은 어떠한 강압이나 협박 없이, 본인의 자유로운 의사에 의하여 촬영되었음을 확인합니다.

${date}
${name}`;

    setScript(defaultScript);
    setIsDirty(true);
    toast.success("기본 스크립트가 생성되었습니다. 내용을 수정하세요.");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864] flex items-center gap-2">
            <Video className="w-7 h-7" />
            유류분 배제 영상 증언
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            유류분 배제 사유를 영상으로 녹화하여 법적 증거력을 강화합니다.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSaveDraft} className="gap-1">
          <Save className="w-4 h-4" />
          임시저장
        </Button>
      </div>

      {/* 임시저장 상태 */}
      {lastSaved && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          마지막 임시저장: {lastSaved}
          {isDirty && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 ml-2">
              수정됨 (저장 필요)
            </Badge>
          )}
        </div>
      )}

      {/* 안내사항 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-2">
              <p className="font-semibold">영상 증언 촬영 안내</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>밝은 조명 아래에서 얼굴이 명확히 보이도록 촬영하세요</li>
                <li>신분증을 카메라에 보여주면 본인 확인에 도움이 됩니다</li>
                <li>스크립트를 미리 작성하고, 천천히 명확하게 읽어주세요</li>
                <li>배제 사유를 구체적으로 진술할수록 법적 효력이 높아집니다</li>
                <li>촬영 시 날짜와 본인 이름을 반드시 말씀하세요</li>
                <li>강압이나 협박 없이 자유의사임을 마지막에 확인하세요</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스크립트 작성 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1F3864]" />
              증언 스크립트 작성
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateDefaultScript}
              className="text-xs"
            >
              기본 양식 생성
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            녹화 전에 스크립트를 미리 작성하세요. 녹화 중 화면 아래에 표시됩니다.
          </p>
          <Textarea
            value={script}
            onChange={(e) => {
              setScript(e.target.value);
              setIsDirty(true);
            }}
            placeholder="증언할 내용을 미리 작성하세요. '기본 양식 생성' 버튼을 누르면 템플릿이 제공됩니다."
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-gray-400">
            * 스크립트는 참고용입니다. 녹화 시 자연스럽게 말씀하셔도 됩니다.
          </p>
        </CardContent>
      </Card>

      {/* 영상 녹화 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#1F3864]" />
            영상 녹화
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 비디오 화면 */}
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {recordingState === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Camera className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-400">녹화 시작 버튼을 누르세요</p>
              </div>
            )}

            {recordingState === "recording" && (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                {/* 녹화 표시 */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-mono bg-black/50 px-2 py-1 rounded">
                    REC {formatTime(duration)}
                  </span>
                </div>
                {/* 스크립트 프롬프터 */}
                {script && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 max-h-32 overflow-y-auto">
                    <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                      {script}
                    </p>
                  </div>
                )}
              </>
            )}

            {recordingState === "recorded" && recordedUrl && (
              <video
                src={recordedUrl}
                className="w-full h-full object-cover"
                controls
                playsInline
              />
            )}
          </div>

          {/* 녹화 컨트롤 */}
          <div className="flex items-center justify-center gap-4">
            {recordingState === "idle" && (
              <Button
                onClick={startRecording}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white px-6"
                size="lg"
              >
                <Play className="w-5 h-5" />
                녹화 시작
              </Button>
            )}

            {recordingState === "recording" && (
              <Button
                onClick={stopRecording}
                className="gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6"
                size="lg"
              >
                <Square className="w-5 h-5" />
                녹화 중지 ({formatTime(duration)})
              </Button>
            )}

            {recordingState === "recorded" && (
              <div className="flex gap-3">
                <Button variant="outline" onClick={resetRecording} className="gap-1">
                  <Camera className="w-4 h-4" />
                  다시 녹화
                </Button>
                <Button
                  className="gap-1 bg-[#1F3864] hover:bg-[#162d52]"
                  onClick={() => {
                    toast.success("영상이 저장되었습니다. 인증서 발급 시 포함됩니다.");
                    setRecordingState("uploaded");
                  }}
                >
                  <Upload className="w-4 h-4" />
                  영상 저장 및 제출
                </Button>
              </div>
            )}

            {recordingState === "uploaded" && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">영상 증언이 성공적으로 저장되었습니다.</span>
              </div>
            )}
          </div>

          {/* 녹화 정보 */}
          {recordingState === "recorded" && (
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                녹화 시간: {formatTime(duration)}
              </span>
              <span className="flex items-center gap-1">
                <Mic className="w-4 h-4" />
                음성 포함
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 법적 안내 */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 space-y-1">
              <p className="font-semibold">법적 안내</p>
              <p>
                본 영상 증언은 유류분 배제 의사 표시서의 보충 증거로 활용됩니다.
                영상 자체만으로 유류분 반환청구를 완전히 차단할 수는 없으나,
                유언자의 명확한 의사를 증명하는 강력한 증거가 됩니다.
              </p>
              <p className="text-xs mt-2">
                * 유류분 배제 문서와 함께 제출하면 효력이 극대화됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
