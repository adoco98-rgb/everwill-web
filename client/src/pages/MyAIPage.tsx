/**
 * 나만의 AI 페이지
 * - 완전 격리된 개인 AI 채팅 인터페이스
 * - 메모리 기반 개인화 대화 (자서전/일기/편지/자유 대화)
 * - AI가 나에 대해 얼마나 아는지 통계 표시
 * - 이전 대화 목록 및 이어가기
 */
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import SaramDashboardLayout from "@/components/SaramDashboardLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Send,
  Plus,
  MessageSquare,
  BookMarked,
  PenLine,
  Mail,
  Sparkles,
  ChevronRight,
  Trash2,
  Lock,
  BarChart3,
  Clock,
  User,
  Bot,
} from "lucide-react";
import { Streamdown } from "streamdown";

// ===== 대화 목적 설정 =====
const PURPOSE_CONFIG = {
  free_chat: {
    label: "자유 대화",
    icon: MessageSquare,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "유언, 상속, 일상 등 무엇이든 대화하세요",
    placeholder: "무엇이든 물어보세요...",
  },
  autobiography: {
    label: "자서전 작성",
    icon: BookMarked,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "AI와 함께 나의 인생 이야기를 기록하세요",
    placeholder: "어떤 시절 이야기를 하고 싶으신가요?",
  },
  diary: {
    label: "AI 일기",
    icon: PenLine,
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    description: "오늘 하루를 AI와 함께 정리해보세요",
    placeholder: "오늘 어떤 하루를 보내셨나요?",
  },
  letter: {
    label: "가족 편지",
    icon: Mail,
    color: "bg-rose-500",
    textColor: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    description: "소중한 가족에게 전하고 싶은 말을 담아보세요",
    placeholder: "누구에게 어떤 마음을 전하고 싶으신가요?",
  },
} as const;

type Purpose = keyof typeof PURPOSE_CONFIG;

// ===== 메시지 타입 =====
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// ===== 카테고리 라벨 =====
const CATEGORY_LABELS: Record<string, string> = {
  basic_info: "기본 정보",
  family: "가족 관계",
  career: "직업·경력",
  values: "인생관·가치관",
  life_events: "중요한 사건",
  emotions: "성격·감정",
  hobbies: "취미·관심사",
  health: "건강·병력",
  wishes: "소원·바람",
  diary_summary: "일기 요약",
  letter_summary: "편지 요약",
  conversation: "대화 기록",
};

export default function MyAIPage() {
  const { user } = useAuth();
  const [selectedPurpose, setSelectedPurpose] = useState<Purpose>("free_chat");
  const [currentConversationId, setCurrentConversationId] = useState<number | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState<"chat" | "history" | "memory">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ===== tRPC 훅 =====
  const chatMutation = trpc.aiMemory.chat.useMutation();
  const { data: conversations, refetch: refetchConversations } = trpc.aiMemory.getConversations.useQuery({});
  const { data: memoryStats } = trpc.aiMemory.getMemoryStats.useQuery();
  const { data: memories } = trpc.aiMemory.getMyMemories.useQuery({});
  const deleteConversation = trpc.aiMemory.deleteConversation.useMutation({
    onSuccess: () => refetchConversations(),
  });

  // ===== 스크롤 자동 이동 =====
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== 메시지 전송 =====
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || chatMutation.isPending) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");

    try {
      const result = await chatMutation.mutateAsync({
        message: text,
        conversationId: currentConversationId,
        purpose: selectedPurpose,
      });

      const aiMsg: Message = {
        role: "assistant",
        content: result.message,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setCurrentConversationId(result.conversationId);
      refetchConversations();
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.",
        timestamp: new Date().toISOString(),
      }]);
    }
  };

  // ===== 새 대화 시작 =====
  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(undefined);
    setActiveTab("chat");
  };

  // ===== 이전 대화 불러오기 =====
  const utils = trpc.useUtils();
  const handleLoadConversation = async (convId: number) => {
    try {
      const result = await utils.aiMemory.getConversation.fetch({ id: convId });
      setMessages(result.messages as Message[]);
      setCurrentConversationId(convId);
      setSelectedPurpose((result.purpose as Purpose) || "free_chat");
      setActiveTab("chat");
    } catch { /* 조용히 무시 */ }
  };

  // ===== 키보드 전송 (Shift+Enter는 줄바꿈) =====
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const config = PURPOSE_CONFIG[selectedPurpose];
  const Icon = config.icon;

  return (
    <SaramDashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1F3864] to-[#2d4f8a] rounded-xl flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#C9A961]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F3864]">나만의 AI</h1>
              <p className="text-sm text-gray-500">나만 아는 완전 비공개 AI · E2E 암호화</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <Lock className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-700 font-medium">완전 격리 보안</span>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1">
          {[
            { key: "chat", label: "AI 대화", icon: MessageSquare },
            { key: "history", label: "대화 기록", icon: Clock },
            { key: "memory", label: "AI 메모리", icon: Brain },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-[#1F3864] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== 채팅 탭 ===== */}
        {activeTab === "chat" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* 사이드: 목적 선택 */}
            <div className="lg:col-span-1 space-y-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">대화 목적</p>
              {(Object.entries(PURPOSE_CONFIG) as [Purpose, typeof PURPOSE_CONFIG[Purpose]][]).map(([key, cfg]) => {
                const Ico = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedPurpose(key);
                      if (messages.length > 0) handleNewChat();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                      selectedPurpose === key
                        ? `${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor}`
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Ico className="w-4 h-4 shrink-0" />
                    <span>{cfg.label}</span>
                    {selectedPurpose === key && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}

              {/* 새 대화 버튼 */}
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-[#1F3864] text-white hover:bg-[#2d4f8a] transition-all mt-4"
              >
                <Plus className="w-4 h-4" />
                새 대화 시작
              </button>

              {/* 메모리 통계 미니 */}
              {memoryStats && (
                <div className="mt-4 bg-gradient-to-br from-[#1F3864]/5 to-[#C9A961]/10 rounded-xl p-3 border border-[#C9A961]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C9A961]" />
                    <span className="text-xs font-bold text-[#1F3864]">AI 이해도</span>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-[#1F3864]">{memoryStats.completionScore}</span>
                    <span className="text-sm text-gray-500 mb-0.5">%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                    <div
                      className="bg-gradient-to-r from-[#1F3864] to-[#C9A961] h-1.5 rounded-full transition-all"
                      style={{ width: `${memoryStats.completionScore}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{memoryStats.totalMemories}개 기억 저장됨</p>
                </div>
              )}
            </div>

            {/* 메인: 채팅 영역 */}
            <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm" style={{ minHeight: "520px" }}>
              {/* 채팅 헤더 */}
              <div className={`px-4 py-3 border-b border-gray-100 rounded-t-2xl ${config.bgColor}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${config.textColor}`} />
                  <span className={`text-sm font-semibold ${config.textColor}`}>{config.label}</span>
                  <span className="text-xs text-gray-500 ml-1">— {config.description}</span>
                </div>
              </div>

              {/* 메시지 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "380px" }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className={`w-16 h-16 ${config.bgColor} rounded-2xl flex items-center justify-center mb-4`}>
                      <Icon className={`w-8 h-8 ${config.textColor}`} />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">{config.label} 시작하기</p>
                    <p className="text-gray-400 text-sm max-w-xs">{config.description}</p>
                    {user && (
                      <p className="text-[#C9A961] text-sm font-medium mt-3">
                        안녕하세요, {user.name || "사용자"}님!
                      </p>
                    )}
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {/* 아바타 */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          msg.role === "user"
                            ? "bg-[#1F3864]"
                            : "bg-gradient-to-br from-[#C9A961] to-[#b8944f]"
                        }`}>
                          {msg.role === "user"
                            ? <User className="w-4 h-4 text-white" />
                            : <Bot className="w-4 h-4 text-white" />
                          }
                        </div>
                        {/* 메시지 버블 */}
                        <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === "user"
                            ? "bg-[#1F3864] text-white rounded-tr-sm"
                            : "bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100"
                        }`}>
                          {msg.role === "assistant"
                            ? <Streamdown>{msg.content}</Streamdown>
                            : <p className="whitespace-pre-wrap">{msg.content}</p>
                          }
                          <p className={`text-xs mt-1 ${msg.role === "user" ? "text-white/50" : "text-gray-400"}`}>
                            {new Date(msg.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                {/* AI 응답 중 로딩 */}
                {chatMutation.isPending && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A961] to-[#b8944f] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-4 py-3 border border-gray-100">
                      <div className="flex gap-1.5 items-center h-5">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2 items-end">
                  <textarea
                    ref={textareaRef}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={config.placeholder}
                    rows={2}
                    className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-1 focus:ring-[#1F3864]/20 transition-all"
                    style={{ maxHeight: "120px" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || chatMutation.isPending}
                    className="w-10 h-10 bg-[#1F3864] hover:bg-[#2d4f8a] disabled:bg-gray-200 rounded-xl flex items-center justify-center transition-all shrink-0"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Enter로 전송 · Shift+Enter로 줄바꿈 · 대화 내용은 나만 볼 수 있습니다</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== 대화 기록 탭 ===== */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-[#1F3864]">이전 대화 기록</h2>
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 text-sm text-[#1F3864] font-medium hover:text-[#C9A961] transition-colors"
              >
                <Plus className="w-4 h-4" />
                새 대화
              </button>
            </div>
            {!conversations || conversations.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">아직 대화 기록이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {conversations.map(conv => {
                  const cfg = PURPOSE_CONFIG[conv.purpose as Purpose] ?? PURPOSE_CONFIG.free_chat;
                  const Ico = cfg.icon;
                  return (
                    <div key={conv.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group">
                      <div className={`w-9 h-9 ${cfg.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                        <Ico className={`w-4 h-4 ${cfg.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{conv.title || "대화"}</p>
                        <p className="text-xs text-gray-400">
                          {cfg.label} · {new Date(conv.updatedAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleLoadConversation(conv.id)}
                          className="text-xs text-[#1F3864] font-medium hover:text-[#C9A961] transition-colors"
                        >
                          이어가기
                        </button>
                        <button
                          onClick={() => deleteConversation.mutate({ id: conv.id })}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== AI 메모리 탭 ===== */}
        {activeTab === "memory" && (
          <div className="space-y-4">
            {/* 메모리 통계 */}
            {memoryStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-[#C9A961]" />
                    <span className="text-sm font-semibold text-gray-700">AI 이해도</span>
                  </div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-3xl font-bold text-[#1F3864]">{memoryStats.completionScore}</span>
                    <span className="text-gray-400 mb-1">%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#1F3864] to-[#C9A961] h-2 rounded-full transition-all"
                      style={{ width: `${memoryStats.completionScore}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-4 h-4 text-[#1F3864]" />
                    <span className="text-sm font-semibold text-gray-700">저장된 기억</span>
                  </div>
                  <span className="text-3xl font-bold text-[#1F3864]">{memoryStats.totalMemories}</span>
                  <p className="text-xs text-gray-400 mt-1">개의 정보를 기억하고 있어요</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#C9A961]" />
                    <span className="text-sm font-semibold text-gray-700">카테고리</span>
                  </div>
                  <span className="text-3xl font-bold text-[#1F3864]">{Object.keys(memoryStats.byCategory).length}</span>
                  <p className="text-xs text-gray-400 mt-1">/ 12개 카테고리 파악됨</p>
                </div>
              </div>
            )}

            {/* 메모리 목록 */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#1F3864]">AI가 나에 대해 알고 있는 것</h2>
                <p className="text-xs text-gray-400 mt-0.5">대화할수록 AI가 더 잘 이해하게 됩니다</p>
              </div>
              {!memories || memories.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">아직 저장된 기억이 없습니다</p>
                  <p className="text-xs mt-1">AI와 대화하면 자동으로 기억이 쌓입니다</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {memories.map(mem => (
                    <div key={mem.id} className="flex items-start gap-3 px-5 py-3.5">
                      <div className="w-2 h-2 rounded-full bg-[#C9A961] mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-[#1F3864] bg-[#1F3864]/10 px-2 py-0.5 rounded-full">
                            {CATEGORY_LABELS[mem.category] ?? mem.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {"★".repeat(mem.importance)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{mem.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 보안 안내 */}
            <div className="bg-gradient-to-r from-[#1F3864]/5 to-[#C9A961]/10 rounded-2xl border border-[#C9A961]/20 p-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#1F3864] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1F3864]">완전 격리 보안 보장</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    AI 메모리는 오직 본인만 접근할 수 있습니다. 다른 사용자의 데이터와 절대 혼용되지 않으며,
                    E2E 암호화로 안전하게 저장됩니다. 언제든지 삭제할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SaramDashboardLayout>
  );
}
