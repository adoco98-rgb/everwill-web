/**
 * EverWill AI 챗봇 위젯
 * - 모든 페이지 우측 하단 플로팅 버튼
 * - 전문가 페르소나 '에버' 대화 UI
 * - 빠른 질문 버튼, 대화 기록 유지
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 빠른 질문 목록 조회
  const { data: quickData } = trpc.chat.getQuickQuestions.useQuery(
    { language: "ko" },
    { enabled: isOpen }
  );

  // 메시지 전송 mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();

  // 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 챗봇 열릴 때 환영 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "안녕하세요! 저는 EverWill 전문 상담사 **에버**입니다. 😊\n\n유언장 작성, 자산 등록, 결제/인증 등 무엇이든 도와드릴게요. 아래 자주 묻는 질문을 선택하거나 직접 질문해 주세요!",
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  // 포커스 이동
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // 메시지 전송
  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowQuickQuestions(false);

    try {
      // 대화 기록 구성 (최근 10개만)
      const conversationHistory = [...messages, userMessage]
        .slice(-10)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content as string }));

      const result = await sendMessageMutation.mutateAsync({
        messages: conversationHistory,
        language: "ko",
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: result.content as string,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 마크다운 간단 렌더링 (굵게, 줄바꿈)
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1F3864, #2d5a9e)" }}
              aria-label="EverWill AI 상담사 열기"
            >
              <MessageCircle className="w-6 h-6 text-white" />
              {/* 알림 뱃지 */}
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C9A961] rounded-full flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">AI</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* 챗봇 창 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 right-0 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ height: "520px", maxHeight: "calc(100vh - 100px)" }}
            >
              {/* 헤더 */}
              <div
                className="flex items-center justify-between px-4 py-3 text-white"
                style={{ background: "linear-gradient(135deg, #1F3864, #2d5a9e)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#C9A961] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">에버 (Ever)</p>
                    <p className="text-xs text-white/70">EverWill 전문 상담사</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="챗봇 닫기"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setMessages([]);
                      setShowQuickQuestions(true);
                    }}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="챗봇 종료"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {/* 아바타 */}
                    <div
                      className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === "assistant"
                          ? "bg-[#1F3864]"
                          : "bg-[#C9A961]"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    {/* 말풍선 */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "assistant"
                          ? "bg-white text-gray-800 shadow-sm rounded-tl-sm"
                          : "bg-[#1F3864] text-white rounded-tr-sm"
                      }`}
                    >
                      {renderContent(msg.content)}
                    </div>
                  </div>
                ))}

                {/* 로딩 표시 */}
                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#1F3864] flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                      <div className="flex gap-1 items-center h-5">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 빠른 질문 */}
                {showQuickQuestions && messages.length === 1 && quickData?.questions && (
                  <div className="space-y-1.5 mt-2">
                    <p className="text-xs text-gray-400 text-center">자주 묻는 질문</p>
                    {quickData.questions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="w-full text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl hover:border-[#1F3864] hover:bg-blue-50 transition-colors text-gray-700"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 입력 영역 */}
              <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-[#1F3864] transition-colors">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="질문을 입력하세요..."
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isLoading}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                    style={{
                      background: inputValue.trim() && !isLoading ? "#1F3864" : "#e5e7eb",
                    }}
                    aria-label="전송"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">
                  AI 상담사 · 법률 자문이 아닌 정보 제공 서비스입니다
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
