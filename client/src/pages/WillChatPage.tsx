/**
 * AI 챗봇 가이드 - 대화형 유언장 작성
 * 경로: /will/chat
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, Sparkles, Bot, User, PenLine } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: `안녕하세요! 저는 SARAM의 유언장 작성 AI 가이드입니다. 😊

유언장 작성이 처음이시더라도 걱정 마세요. 제가 차근차근 도와드리겠습니다.

먼저 간단한 질문부터 시작할게요.

**성함이 어떻게 되세요?**`,
  timestamp: new Date(),
};

export default function WillChatPage() {
  const [, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const chat = trpc.will.chat.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply as string,
          timestamp: new Date(),
        }]);
      }
      setIsTyping(false);
    },
    onError: () => {
      toast.error("응답을 받지 못했습니다. 다시 시도해주세요.");
      setIsTyping(false);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // AI에 전송 (최근 10개 메시지만)
    const recentMessages = [...messages, userMessage]
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    chat.mutate({ messages: recentMessages });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 마크다운 간단 렌더링
  const renderContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white px-4 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/write")} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[#C9A961]/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#C9A961]" />
          </div>
          <div>
            <h1 className="font-bold text-base">AI 유언장 가이드</h1>
            <p className="text-white/60 text-xs">대화하며 유언장을 작성합니다</p>
          </div>
          <button
            onClick={() => navigate("/write")}
            className="ml-auto flex items-center gap-1.5 text-xs text-[#C9A961] border border-[#C9A961]/30 px-3 py-1.5 rounded-full hover:bg-[#C9A961]/10 transition-colors"
          >
            <PenLine className="w-3.5 h-3.5" />
            직접 작성으로 전환
          </button>
        </div>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* 아바타 */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "assistant"
                    ? "bg-[#1F3864]"
                    : "bg-[#C9A961]"
                }`}>
                  {msg.role === "assistant"
                    ? <Bot className="w-4 h-4 text-white" />
                    : <User className="w-4 h-4 text-white" />
                  }
                </div>

                {/* 말풍선 */}
                <div className={`max-w-[80%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
                      : "bg-[#1F3864] text-white rounded-tr-sm"
                  }`}>
                    <span
                      dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 px-1">
                    {msg.timestamp.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* 타이핑 인디케이터 */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-[#1F3864] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력창 */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {/* 빠른 답변 버튼 */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {["네", "아니요", "잘 모르겠어요", "다음으로 넘어가요"].map((quick) => (
              <button
                key={quick}
                onClick={() => setInput(quick)}
                className="flex-shrink-0 text-xs text-[#1F3864] border border-[#1F3864]/20 px-3 py-1.5 rounded-full hover:bg-[#1F3864]/5 transition-colors"
              >
                {quick}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (Enter로 전송)"
              rows={1}
              className="flex-1 resize-none border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] transition-colors max-h-32"
              style={{ minHeight: "48px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-12 h-12 bg-[#1F3864] hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            본 AI 가이드는 정보 제공 목적이며 법률 자문이 아닙니다.
          </p>
        </div>
      </div>
    </div>
  );
}
