/**
 * AutobiographyPage - 나의 자서전 만들기
 * AI와 대화하며 자서전 작성 + 음성 입력 + 사진 그림 변환 + PDF 다운로드
 * 노인 친화적 UI: 큰 글자, 큰 버튼, 음성 입력 우선
 */

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { VoiceInput } from "@/components/VoiceInput";
import { PhotoArtUploader, type ArtStyle } from "@/components/PhotoArtUploader";
import {
  BookOpen, ChevronRight, ChevronLeft, Send, Loader2,
  CheckCircle2, Download, Share2, Mic, Image as ImageIcon,
  BookMarked, Sparkles, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

// 6개 챕터 정의
const CHAPTERS = [
  {
    number: 1,
    title: "어린 시절",
    emoji: "🌱",
    color: "bg-green-50 border-green-200",
    headerColor: "bg-green-600",
    description: "태어난 곳, 어린 시절 추억, 가족과의 기억",
    firstQuestion: "어디서 태어나셨나요? 어린 시절 가장 기억에 남는 추억을 말씀해 주세요.",
  },
  {
    number: 2,
    title: "학창 시절",
    emoji: "📚",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-600",
    description: "학교 생활, 친구들, 꿈과 목표",
    firstQuestion: "학창 시절 가장 기억에 남는 선생님이나 친구가 있으셨나요? 그 시절 꿈은 무엇이었나요?",
  },
  {
    number: 3,
    title: "직업과 커리어",
    emoji: "💼",
    color: "bg-purple-50 border-purple-200",
    headerColor: "bg-purple-600",
    description: "첫 직장, 일하면서 배운 것들, 자랑스러운 순간",
    firstQuestion: "처음 일을 시작하셨을 때 어떠셨나요? 일하면서 가장 보람 있었던 순간은 언제였나요?",
  },
  {
    number: 4,
    title: "가족과 사랑",
    emoji: "❤️",
    color: "bg-red-50 border-red-200",
    headerColor: "bg-red-600",
    description: "배우자, 자녀, 소중한 사람들과의 이야기",
    firstQuestion: "배우자 또는 가장 사랑하는 사람을 처음 만났을 때 이야기를 들려주세요.",
  },
  {
    number: 5,
    title: "인생의 교훈",
    emoji: "⭐",
    color: "bg-yellow-50 border-yellow-200",
    headerColor: "bg-yellow-600",
    description: "살면서 깨달은 지혜, 어려움을 이겨낸 이야기",
    firstQuestion: "살면서 가장 힘들었던 시간이 있으셨나요? 그것을 어떻게 이겨내셨나요?",
  },
  {
    number: 6,
    title: "미래 세대에게",
    emoji: "🌟",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-600",
    description: "자녀와 손자녀에게 전하고 싶은 말",
    firstQuestion: "자녀와 손자녀에게 꼭 전하고 싶은 말씀이 있으시다면 무엇인가요?",
  },
];

type Message = { role: "user" | "assistant"; content: string };

interface ChapterArtwork {
  originalUrl: string;
  artworkUrl: string;
  style: ArtStyle;
}

export default function AutobiographyPage() {
  const { user, isAuthenticated } = useAuth();
  const [currentChapter, setCurrentChapter] = useState(0); // 0 = 챕터 선택 화면
  const [inputMode, setInputMode] = useState<"voice" | "text">("voice"); // 기본 음성 입력
  const [textInput, setTextInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [artworks, setArtworks] = useState<ChapterArtwork[]>([]);
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [generatedTexts, setGeneratedTexts] = useState<Record<number, string>>({});
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [autobiographyId, setAutobiographyId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 자서전 생성/조회
  const createMutation = trpc.autobiography.create.useMutation({
    onSuccess: (data) => setAutobiographyId(data.id),
  });

  const { data: autobiographyData } = trpc.autobiography.getOrCreate.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // autobiographyData 변경 시 상태 동기화
  useEffect(() => {
    if (autobiographyData) {
      setAutobiographyId(autobiographyData.id);
      setCompletedChapters(autobiographyData.completedChapterNumbers ?? []);
      // 챕터별 생성된 텍스트 복원
      const savedTexts: Record<number, string> = {};
      (autobiographyData.chapters ?? []).forEach((ch: { chapterNumber: number; generatedText?: string | null }) => {
        if (ch.generatedText) savedTexts[ch.chapterNumber] = ch.generatedText;
      });
      if (Object.keys(savedTexts).length > 0) {
        setGeneratedTexts(savedTexts);
      }
    }
  }, [autobiographyData]);

  // AI 채팅 API
  const chatMutation = trpc.autobiography.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant" as const, content: String(data.reply) }]);
    },
    onError: (err) => toast.error("AI 응답 오류: " + err.message),
  });

  // 챕터 글 생성 API
  const generateChapterMutation = trpc.autobiography.generateChapter.useMutation({
    onSuccess: (data) => {
      setGeneratedTexts((prev) => ({ ...prev, [currentChapter]: data.text ?? "" }));
      setCompletedChapters((prev) => Array.from(new Set([...prev, currentChapter])));
      setIsGeneratingText(false);
      toast.success("챕터가 완성되었습니다! ✨");
    },
    onError: (err) => {
      setIsGeneratingText(false);
      toast.error("글 생성 오류: " + err.message);
    },
  });

  // PDF 생성 API
  const generatePdfMutation = trpc.autobiography.generatePdf.useMutation({
    onSuccess: (data) => {
      window.open(data.pdfUrl, "_blank");
      toast.success("PDF가 생성되었습니다! 다운로드를 확인해 주세요.");
    },
    onError: (err) => toast.error("PDF 생성 오류: " + err.message),
  });

  // 메시지 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 챕터 진입 시 기존 대화 복원 또는 첫 질문 표시
  const enterChapter = (chapterNum: number) => {
    setCurrentChapter(chapterNum);
    const chapter = CHAPTERS[chapterNum - 1];
    // 기존 저장된 대화 내용 있으면 복원
    const savedChapter = (autobiographyData?.chapters ?? []).find(
      (ch: { chapterNumber: number; conversationJson?: string | null }) => ch.chapterNumber === chapterNum
    );
    if (savedChapter?.conversationJson) {
      try {
        const parsed = JSON.parse(savedChapter.conversationJson) as Message[];
        if (parsed.length > 0) {
          setMessages(parsed);
          setArtworks([]);
          setShowPhotoUploader(false);
          return;
        }
      } catch {
        // 파싱 실패 시 첫 질문으로 폴백
      }
    }
    setMessages([{ role: "assistant", content: chapter.firstQuestion }]);
    setArtworks([]);
    setShowPhotoUploader(false);
  };

  // 메시지 전송
  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    // autobiographyId가 준비되지 않았으면 전송 차단
    if (!autobiographyId || autobiographyId === 0) {
      toast.error("자서전 데이터를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setTextInput("");

    chatMutation.mutate({
      autobiographyId,
      chapterNumber: currentChapter,
      messages: newMessages,
      chapterTitle: CHAPTERS[currentChapter - 1].title,
    });
  };

  // 음성 인식 완료 후 자동 전송
  const handleVoiceTranscribed = (text: string) => {
    sendMessage(text);
  };

  // 챕터 글 생성
  const handleGenerateChapter = () => {
    if (!autobiographyId || autobiographyId === 0) {
      toast.error("자서전 데이터를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (messages.length < 3) {
      toast.warning("조금 더 이야기해 주세요. AI가 더 풍성한 글을 써드릴 수 있어요.");
      return;
    }
    setIsGeneratingText(true);
    generateChapterMutation.mutate({
      autobiographyId,
      chapterNumber: currentChapter,
      messages,
      artworkUrls: artworks.map((a) => a.artworkUrl),
    });
  };

  // 그림 변환 완료
  const handleArtGenerated = (originalUrl: string, artworkUrl: string, style: ArtStyle) => {
    setArtworks((prev) => [...prev, { originalUrl, artworkUrl, style }]);
    setShowPhotoUploader(false);
  };

  // 로그인 체크
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <BookOpen size={64} className="text-[#1F3864] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F3864] mb-3">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">자서전을 작성하려면 먼저 로그인해 주세요.</p>
          <Link href="/login">
            <button className="w-full py-4 bg-[#1F3864] text-white font-bold text-lg rounded-2xl">
              로그인하기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // 챕터 선택 화면
  if (currentChapter === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* 헤더 */}
        <div className="bg-[#1F3864] text-white py-8 px-6">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-white/70 hover:text-white mb-4">
              <ArrowLeft size={20} />
              <span className="text-base">대시보드로</span>
            </button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookMarked size={36} className="text-[#C9A961]" />
            <h1 className="text-3xl font-bold">나의 자서전</h1>
          </div>
          <p className="text-white/80 text-lg">AI와 대화하며 나만의 인생 이야기를 책으로 만들어 보세요</p>
        </div>

        {/* 안내 */}
        <div className="px-6 py-6 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start gap-3">
            <Mic size={24} className="text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <p className="text-base font-bold text-amber-800">음성으로 편하게 말씀하세요</p>
              <p className="text-sm text-amber-600 mt-1">
                타이핑이 불편하시면 마이크 버튼을 누르고 말씀하시면 됩니다.
                AI가 질문하고, 말씀하신 내용으로 아름다운 자서전을 써드립니다.
              </p>
            </div>
          </div>
        </div>

        {/* 챕터 목록 */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-bold text-[#1F3864] mb-4">
            챕터를 선택하세요 ({completedChapters.length}/6 완성)
          </h2>
          <div className="flex flex-col gap-4">
            {CHAPTERS.map((chapter) => {
              const isCompleted = completedChapters.includes(chapter.number);
              return (
                <button
                  key={chapter.number}
                  type="button"
                  onClick={() => enterChapter(chapter.number)}
                  className={`
                    w-full p-5 rounded-2xl border-2 text-left
                    flex items-center gap-4 transition-all
                    hover:shadow-md active:scale-98
                    ${isCompleted
                      ? "bg-green-50 border-green-300"
                      : chapter.color
                    }
                  `}
                >
                  <span className="text-4xl">{chapter.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500">
                        {chapter.number}장
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                          <CheckCircle2 size={14} />
                          완성
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-bold text-gray-800">{chapter.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
                  </div>
                  <ChevronRight size={24} className="text-gray-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* PDF 생성 버튼 */}
          {completedChapters.length >= 1 && (
            <div className="mt-8 p-5 bg-[#1F3864] rounded-2xl text-white">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen size={28} className="text-[#C9A961]" />
                <div>
                  <p className="font-bold text-lg">자서전 책 만들기</p>
                  <p className="text-white/70 text-sm">
                    완성된 챕터 {completedChapters.length}개로 PDF 책을 만들 수 있어요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!autobiographyId) return;
                  generatePdfMutation.mutate({
                    autobiographyId,
                    userName: user?.name ?? "작성자",
                  });
                }}
                disabled={generatePdfMutation.isPending}
                className="w-full py-4 bg-[#C9A961] hover:bg-[#b8954f] text-[#1F3864] font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {generatePdfMutation.isPending ? (
                  <><Loader2 size={20} className="animate-spin" /> PDF 생성 중...</>
                ) : (
                  <><Download size={20} /> PDF 책으로 다운로드</>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 챕터 작성 화면
  const chapter = CHAPTERS[currentChapter - 1];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* 챕터 헤더 */}
      <div className={`${chapter.headerColor} text-white py-5 px-6`}>
        <button
          type="button"
          onClick={() => setCurrentChapter(0)}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-3"
        >
          <ChevronLeft size={20} />
          <span className="text-base">챕터 목록으로</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{chapter.emoji}</span>
          <div>
            <p className="text-sm text-white/70">{chapter.number}장</p>
            <h2 className="text-2xl font-bold">{chapter.title}</h2>
          </div>
        </div>
      </div>

      {/* 대화 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`
                max-w-[85%] px-5 py-4 rounded-2xl text-base leading-relaxed
                ${msg.role === "user"
                  ? "bg-[#1F3864] text-white rounded-br-sm"
                  : "bg-white border-2 border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                }
              `}
            >
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">AI 도우미</span>
                </div>
              )}
              <p className="text-[17px] leading-7">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* AI 응답 로딩 */}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-gray-200 px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 size={18} className="text-amber-500 animate-spin" />
                <span className="text-gray-500 text-base">생각 중...</span>
              </div>
            </div>
          </div>
        )}

        {/* 업로드된 그림들 */}
        {artworks.length > 0 && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
            <p className="text-sm font-bold text-amber-700 mb-3">📸 이 챕터의 그림들</p>
            <div className="flex flex-wrap gap-2">
              {artworks.map((art, i) => (
                <img
                  key={i}
                  src={art.artworkUrl}
                  alt={`그림 ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-xl border-2 border-amber-300"
                />
              ))}
            </div>
          </div>
        )}

        {/* 생성된 챕터 글 */}
        {generatedTexts[currentChapter] && (
          <div className="bg-white border-2 border-green-300 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={20} className="text-green-600" />
              <p className="font-bold text-green-700 text-base">완성된 챕터 글</p>
            </div>
            <p className="text-[16px] leading-8 text-gray-700 whitespace-pre-wrap">
              {generatedTexts[currentChapter]}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 사진 업로더 (토글) */}
      {showPhotoUploader && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <PhotoArtUploader
            onArtGenerated={handleArtGenerated}
            onOriginalUsed={(dataUrl) => {
              setArtworks(prev => [...prev, { originalUrl: dataUrl, artworkUrl: dataUrl, style: "watercolor" }]);
              setShowPhotoUploader(false);
            }}
            contextHint={chapter.title}
            style="watercolor"
          />
          <button
            type="button"
            onClick={() => setShowPhotoUploader(false)}
            className="w-full mt-2 py-2 text-gray-500 text-sm"
          >
            닫기
          </button>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="border-t-2 border-gray-200 bg-white px-4 py-4">
        {/* 입력 모드 전환 탭 */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setInputMode("voice")}
            className={`flex-1 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              inputMode === "voice"
                ? "bg-[#1F3864] text-white shadow-md"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <Mic size={20} />
            음성으로 말하기
          </button>
          <button
            type="button"
            onClick={() => setInputMode("text")}
            className={`flex-1 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all ${
              inputMode === "text"
                ? "bg-[#1F3864] text-white shadow-md"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            ✏️ 직접 입력
          </button>
        </div>

        {/* 음성 입력 */}
        {inputMode === "voice" && (
          <div className="flex flex-col items-center py-4">
            <VoiceInput
              onTranscribed={handleVoiceTranscribed}
              language="ko"
              size="lg"
              hint="버튼을 누르고 말씀하세요"
              disabled={chatMutation.isPending}
            />
          </div>
        )}

        {/* 텍스트 입력 */}
        {inputMode === "text" && (
          <div className="flex gap-2">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(textInput);
                }
              }}
              placeholder="여기에 입력하세요..."
              rows={3}
              className="flex-1 p-4 border-2 border-gray-200 rounded-2xl text-[17px] resize-none focus:border-[#1F3864] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => sendMessage(textInput)}
              disabled={!textInput.trim() || chatMutation.isPending}
              className="w-14 bg-[#1F3864] text-white rounded-2xl flex items-center justify-center disabled:opacity-50"
            >
              <Send size={22} />
            </button>
          </div>
        )}

        {/* 하단 액션 버튼들 */}
        <div className="flex gap-2 mt-3">
          {/* 사진 추가 */}
          <button
            type="button"
            onClick={() => setShowPhotoUploader(!showPhotoUploader)}
            className="flex-1 py-3 bg-amber-50 border-2 border-amber-300 text-amber-700 font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <ImageIcon size={18} />
            사진 그림 추가
          </button>

          {/* 챕터 완성 */}
          {messages.length >= 3 && !generatedTexts[currentChapter] && (
            <button
              type="button"
              onClick={handleGenerateChapter}
              disabled={isGeneratingText}
              className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGeneratingText ? (
                <><Loader2 size={18} className="animate-spin" /> 글 쓰는 중...</>
              ) : (
                <><Sparkles size={18} /> 챕터 완성하기</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
