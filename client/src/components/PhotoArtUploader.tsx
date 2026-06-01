/**
 * PhotoArtUploader - 사진 업로드 + AI 그림 변환 컴포넌트
 * 사진을 올리면 AI가 수채화/일러스트 스타일 그림으로 변환
 * 자서전/일기/편지 쓰기 모든 기능에서 공통 사용
 */

import { useState, useRef } from "react";
import { Camera, ImagePlus, Loader2, Sparkles, X, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export type ArtStyle = "watercolor" | "illustration" | "oil_painting" | "sketch" | "cartoon";

interface PhotoArtUploaderProps {
  /** 그림 변환 완료 콜백 (원본 URL, 변환된 그림 URL) */
  onArtGenerated: (originalUrl: string, artworkUrl: string, style: ArtStyle) => void;
  /** 그림 스타일 */
  style?: ArtStyle;
  /** 추가 프롬프트 힌트 (예: "어린 시절 추억") */
  contextHint?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

const STYLE_LABELS: Record<ArtStyle, string> = {
  watercolor: "수채화",
  illustration: "일러스트",
  oil_painting: "유화",
  sketch: "스케치",
  cartoon: "만화풍",
};

const STYLE_EMOJIS: Record<ArtStyle, string> = {
  watercolor: "🎨",
  illustration: "✏️",
  oil_painting: "🖼️",
  sketch: "📝",
  cartoon: "😊",
};

export function PhotoArtUploader({
  onArtGenerated,
  style = "watercolor",
  contextHint = "",
  disabled = false,
}: PhotoArtUploaderProps) {
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle>(style);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사진 업로드 + AI 그림 변환 API
  const generateArtMutation = trpc.artwork.generateFromPhoto.useMutation({
    onSuccess: (data) => {
      setArtworkUrl(data.artworkUrl ?? null);
      onArtGenerated(data.originalUrl ?? "", data.artworkUrl ?? "", selectedStyle);
      toast.success("그림이 완성되었습니다! 🎨");
    },
    onError: (err) => {
      toast.error("그림 변환 실패: " + err.message);
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  // 파일 선택 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("사진 크기가 너무 큽니다. 10MB 이하 사진을 올려주세요.");
      return;
    }

    // 미리보기 표시
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setArtworkUrl(null);
    };
    reader.readAsDataURL(file);
  };

  // AI 그림 변환 시작
  const handleGenerateArt = async () => {
    if (!previewUrl || !fileInputRef.current?.files?.[0]) return;

    setIsGenerating(true);
    const file = fileInputRef.current.files[0];

    // Base64 변환 후 서버 전송
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      generateArtMutation.mutate({
        imageBase64: base64,
        mimeType: file.type,
        style: selectedStyle,
        contextHint,
      });
    };
    reader.readAsDataURL(file);
  };

  // 초기화
  const handleReset = () => {
    setPreviewUrl(null);
    setArtworkUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-amber-50 rounded-2xl border-2 border-amber-200">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-amber-600" />
        <h3 className="text-lg font-bold text-amber-800">사진을 그림으로 변환</h3>
      </div>

      {/* 스타일 선택 */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(STYLE_LABELS) as ArtStyle[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSelectedStyle(s)}
            className={`
              px-3 py-2 rounded-xl text-sm font-semibold transition-all
              ${selectedStyle === s
                ? "bg-amber-600 text-white shadow-md scale-105"
                : "bg-white text-amber-700 border border-amber-300 hover:bg-amber-100"
              }
            `}
          >
            {STYLE_EMOJIS[s]} {STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* 사진 업로드 영역 */}
      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="
            w-full h-40 border-3 border-dashed border-amber-400
            rounded-2xl flex flex-col items-center justify-center gap-3
            bg-white hover:bg-amber-50 transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Camera size={48} className="text-amber-500" />
          <div className="text-center">
            <p className="text-lg font-bold text-amber-700">사진 올리기</p>
            <p className="text-sm text-amber-500">클릭하거나 사진을 끌어다 놓으세요</p>
          </div>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* 원본 사진 + 변환된 그림 나란히 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 원본 사진 */}
            <div className="relative">
              <p className="text-xs font-semibold text-gray-500 mb-1 text-center">📷 원본 사진</p>
              <img
                src={previewUrl}
                alt="원본 사진"
                className="w-full h-36 object-cover rounded-xl border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={handleReset}
                className="absolute top-6 right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>

            {/* 변환된 그림 */}
            <div className="relative">
              <p className="text-xs font-semibold text-amber-600 mb-1 text-center">
                🎨 {STYLE_LABELS[selectedStyle]} 그림
              </p>
              {isGenerating ? (
                <div className="w-full h-36 bg-amber-100 rounded-xl border-2 border-amber-300 flex flex-col items-center justify-center gap-2">
                  <Loader2 size={32} className="text-amber-600 animate-spin" />
                  <p className="text-xs text-amber-600 font-semibold">그림 그리는 중...</p>
                  <p className="text-xs text-amber-400">약 10~20초 소요</p>
                </div>
              ) : artworkUrl ? (
                <div className="relative">
                  <img
                    src={artworkUrl}
                    alt="AI 변환 그림"
                    className="w-full h-36 object-cover rounded-xl border-2 border-amber-400"
                  />
                  <a
                    href={artworkUrl}
                    download="artwork.png"
                    className="absolute bottom-1 right-1 w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center hover:bg-amber-700"
                    title="그림 저장"
                  >
                    <Download size={14} />
                  </a>
                </div>
              ) : (
                <div className="w-full h-36 bg-amber-50 rounded-xl border-2 border-dashed border-amber-300 flex items-center justify-center">
                  <p className="text-xs text-amber-400 text-center px-2">
                    아래 버튼을 눌러<br />그림으로 변환하세요
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 변환 버튼 */}
          {!artworkUrl && (
            <button
              type="button"
              onClick={handleGenerateArt}
              disabled={isGenerating || disabled}
              className="
                w-full py-4 bg-amber-600 hover:bg-amber-700
                text-white font-bold text-lg rounded-2xl
                flex items-center justify-center gap-2
                transition-all active:scale-95 shadow-md
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  그림 그리는 중...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  {STYLE_LABELS[selectedStyle]}로 변환하기
                </>
              )}
            </button>
          )}

          {/* 다른 사진 올리기 */}
          {artworkUrl && (
            <button
              type="button"
              onClick={() => {
                handleReset();
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
              className="w-full py-3 bg-white border-2 border-amber-400 text-amber-700 font-semibold rounded-xl hover:bg-amber-50 flex items-center justify-center gap-2"
            >
              <ImagePlus size={18} />
              다른 사진 추가하기
            </button>
          )}
        </div>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
