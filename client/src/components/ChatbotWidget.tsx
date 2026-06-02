/**
 * EverWill AI 챗봇 위젯
 * - 비회원: 서비스 안내 봇 (3턴 제한 → 가입 유도)
 * - 회원: 나의 전담 AI (유언·상속·자서전·편지 통합, 히스토리 저장)
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  ChevronDown,
  Sparkles,
  LogIn,
  History,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// 비회원 환영 메시지 (언어별)
const GUEST_WELCOME: Record<string, string> = {
  ko: "안녕하세요! EverWill 안내 봇 **에버**입니다. 😊\n\n유언장 작성, 가격, 기능 등 궁금한 점을 물어보세요!\n\n*더 깊은 상담(법률·자서전·편지)은 회원 가입 후 전담 AI에서 이용하실 수 있어요.*",
  en: "Hello! I'm **Ever**, EverWill's guide bot. 😊\n\nAsk me about will writing, pricing, or features!\n\n*For deeper consultation (legal, autobiography, letters), join as a member to access your dedicated AI.*",
  ja: "こんにちは！EverWillガイドボット**エバー**です。😊\n\n遺言書作成、料金、機能などについてお気軽にどうぞ！\n\n*より深いご相談（法律・自伝・手紙）は会員登録後の専任AIをご利用ください。*",
  zh: "您好！我是EverWill导航机器人**Ever**。😊\n\n请随时询问遗嘱写作、价格或功能！\n\n*更深入的咨询（法律、自传、书信）请注册会员后使用专属AI。*",
  de: "Hallo! Ich bin **Ever**, EverWills Führungsbot. 😊\n\nFragen Sie mich zu Testament, Preisen oder Funktionen!\n\n*Für tiefere Beratung (Recht, Autobiografie, Briefe) registrieren Sie sich für Ihren persönlichen KI-Assistenten.*",
  es: "¡Hola! Soy **Ever**, el bot guía de EverWill. 😊\n\n¡Pregúntame sobre testamentos, precios o funciones!\n\n*Para consultas más profundas (legal, autobiografía, cartas), regístrate para acceder a tu IA dedicada.*",
  ar: "مرحباً! أنا **إيفر**، بوت إرشاد EverWill. 😊\n\nاسألني عن كتابة الوصايا أو الأسعار أو الميزات!\n\n*للاستشارات الأعمق (قانونية، سيرة ذاتية، رسائل)، سجّل للوصول إلى ذكاءك الاصطناعي المخصص.*",
  fr: "Bonjour! Je suis **Ever**, le bot guide d'EverWill. 😊\n\nPosez-moi des questions sur les testaments, les prix ou les fonctionnalités!\n\n*Pour des consultations plus approfondies (juridique, autobiographie, lettres), inscrivez-vous pour votre IA dédiée.*",
  ru: "Привет! Я **Эвер**, бот-гид EverWill. 😊\n\nСпросите меня о завещаниях, ценах или функциях!\n\n*Для более глубоких консультаций (юридических, автобиографических, писем) зарегистрируйтесь для доступа к персональному ИИ.*",
  hi: "नमस्ते! मैं **Ever** हूं, EverWill का गाइड बॉट। 😊\n\nवसीयत लेखन, कीमतों या सुविधाओं के बारे में पूछें!\n\n*गहरी परामर्श (कानूनी, आत्मकथा, पत्र) के लिए सदस्य बनें और अपने समर्पित AI का उपयोग करें।*",
  pt: "Olá! Sou **Ever**, o bot guia do EverWill. 😊\n\nPergunte-me sobre testamentos, preços ou recursos!\n\n*Para consultas mais profundas (jurídico, autobiografia, cartas), cadastre-se para acessar sua IA dedicada.*",
};

// 회원 환영 메시지 (언어별)
const MEMBER_WELCOME: Record<string, string> = {
  ko: "안녕하세요! 저는 회원님의 **전담 AI 에버**입니다. 🌟\n\n유언·상속 법률 정보, 자서전 작성, 가족 편지·일기 작성까지 모두 도와드릴 수 있어요.\n\n무엇이든 편하게 물어보세요!",
  en: "Hello! I'm your **dedicated AI Ever**. 🌟\n\nI can help with will & inheritance legal information, autobiography writing, and family letters & diary entries.\n\nFeel free to ask anything!",
  ja: "こんにちは！あなたの**専任AI エバー**です。🌟\n\n遺言・相続の法律情報、自伝作成、家族への手紙・日記作成まですべてお手伝いします。\n\nお気軽に何でもどうぞ！",
  zh: "您好！我是您的**专属AI Ever**。🌟\n\n我可以帮助您了解遗嘱和继承法律信息、撰写自传以及家书和日记。\n\n请随时提问！",
  de: "Hallo! Ich bin Ihr **persönlicher KI-Assistent Ever**. 🌟\n\nIch helfe bei Testament & Erbrecht, Autobiografie-Schreiben und Familienbriefen.\n\nFragen Sie mich alles!",
  es: "¡Hola! Soy tu **IA dedicada Ever**. 🌟\n\nPuedo ayudarte con información legal sobre testamentos y herencias, escritura de autobiografías y cartas familiares.\n\n¡Pregúntame lo que quieras!",
  ar: "مرحباً! أنا **ذكاءك الاصطناعي المخصص إيفر**. 🌟\n\nيمكنني مساعدتك في معلومات قانونية عن الوصايا والميراث، وكتابة السيرة الذاتية والرسائل العائلية.\n\nاسألني أي شيء!",
  fr: "Bonjour! Je suis votre **IA dédiée Ever**. 🌟\n\nJe peux vous aider avec les informations juridiques sur les testaments et successions, la rédaction d'autobiographie et les lettres familiales.\n\nPosez-moi n'importe quelle question!",
  ru: "Привет! Я ваш **персональный ИИ Эвер**. 🌟\n\nЯ помогу с юридической информацией о завещаниях и наследстве, написанием автобиографии и семейными письмами.\n\nСпрашивайте всё что угодно!",
  hi: "नमस्ते! मैं आपका **समर्पित AI Ever** हूं। 🌟\n\nमैं वसीयत और विरासत कानूनी जानकारी, आत्मकथा लेखन और पारिवारिक पत्र लेखन में मदद कर सकता हूं।\n\nकुछ भी पूछें!",
  pt: "Olá! Sou seu **IA dedicado Ever**. 🌟\n\nPosso ajudar com informações jurídicas sobre testamentos e heranças, escrita de autobiografia e cartas familiares.\n\nPergunte qualquer coisa!",
};

// 회원 전담 AI 전문 영역 뱃지
const MEMBER_BADGES: Record<string, string[]> = {
  ko: ["유언·상속 법률", "자서전 작성", "편지·일기"],
  en: ["Will & Inheritance Law", "Autobiography", "Letters & Diary"],
  ja: ["遺言・相続法律", "自伝作成", "手紙・日記"],
  zh: ["遗嘱·继承法律", "自传写作", "书信·日记"],
  de: ["Testament & Erbrecht", "Autobiografie", "Briefe & Tagebuch"],
  es: ["Testamento & Herencia", "Autobiografía", "Cartas & Diario"],
  ar: ["الوصايا والميراث", "السيرة الذاتية", "الرسائل واليوميات"],
  fr: ["Testament & Succession", "Autobiographie", "Lettres & Journal"],
  ru: ["Завещание & Наследство", "Автобиография", "Письма & Дневник"],
  hi: ["वसीयत & विरासत", "आत्मकथा", "पत्र & डायरी"],
  pt: ["Testamento & Herança", "Autobiografia", "Cartas & Diário"],
};

export function ChatbotWidget() {
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [guestTurnCount, setGuestTurnCount] = useState(0);
  const [sessionKey, setSessionKey] = useState<string | undefined>(undefined);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 빠른 질문 목록 조회
  const { data: quickData } = trpc.chat.getQuickQuestions.useQuery(
    { language },
    { enabled: isOpen }
  );

  // 최근 세션 조회 (회원)
  const { data: latestSession } = trpc.chat.getLatestSession.useQuery(undefined, {
    enabled: isOpen && isAuthenticated,
  });

  // 히스토리 조회 (회원)
  const { data: historyData } = trpc.chat.getHistory.useQuery(
    { sessionKey: sessionKey || "" },
    { enabled: isAuthenticated && !!sessionKey && !historyLoaded }
  );

  // 비회원 채팅 mutation
  const publicChatMutation = trpc.chat.publicChat.useMutation();

  // 회원 전담 AI mutation
  const memberChatMutation = trpc.chat.memberChat.useMutation();

  // 스크롤 자동 이동
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 최근 세션 키 설정 (회원)
  useEffect(() => {
    if (latestSession?.sessionKey && !sessionKey) {
      setSessionKey(latestSession.sessionKey);
    }
  }, [latestSession, sessionKey]);

  // 히스토리 로드 (회원)
  useEffect(() => {
    if (historyData && !historyLoaded && isAuthenticated && messages.length === 0) {
      if (historyData.messages.length > 0) {
        const loaded: Message[] = historyData.messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(loaded);
        setShowQuickQuestions(false);
        setHistoryLoaded(true);
        return;
      }
      setHistoryLoaded(true);
    }
  }, [historyData, historyLoaded, isAuthenticated, messages.length]);

  // 챗봇 열릴 때 환영 메시지
  useEffect(() => {
    if (isOpen && messages.length === 0 && historyLoaded) {
      const welcomeMap = isAuthenticated ? MEMBER_WELCOME : GUEST_WELCOME;
      const welcome = welcomeMap[language] || welcomeMap["ko"];
      setMessages([
        {
          role: "assistant",
          content: welcome,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length, historyLoaded, isAuthenticated, language]);

  // 비회원: 히스토리 없으므로 바로 로드 완료 처리
  useEffect(() => {
    if (!isAuthenticated) {
      setHistoryLoaded(true);
    }
  }, [isAuthenticated]);

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
      if (isAuthenticated) {
        // 회원 전담 AI
        const result = await memberChatMutation.mutateAsync({
          message: messageText,
          sessionKey,
          language,
        });
        if (result.sessionKey && !sessionKey) {
          setSessionKey(result.sessionKey);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.content as string,
            timestamp: new Date(),
          },
        ]);
      } else {
        // 비회원 안내 봇
        const newTurnCount = guestTurnCount + 1;
        const conversationHistory = [...messages, userMessage]
          .slice(-10)
          .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

        const result = await publicChatMutation.mutateAsync({
          messages: conversationHistory,
          language,
          turnCount: newTurnCount,
        });

        setGuestTurnCount(newTurnCount);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: result.content as string,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          timestamp: new Date(),
        },
      ]);
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

  // 마크다운 간단 렌더링
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const rendered = parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );
      const italicParts = rendered.flatMap((part, idx) => {
        if (typeof part !== "string") return [part];
        const sp = part.split(/\*(.*?)\*/g);
        return sp.map((s, k) => (k % 2 === 1 ? <em key={`${idx}-${k}`}>{s}</em> : s));
      });
      return (
        <span key={i}>
          {italicParts}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  // 챗봇 초기화
  const handleReset = () => {
    setIsOpen(false);
    setMessages([]);
    setShowQuickQuestions(true);
    setGuestTurnCount(0);
    setHistoryLoaded(!isAuthenticated);
  };

  const badges = MEMBER_BADGES[language] || MEMBER_BADGES["ko"];

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
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A961] rounded-full flex items-center justify-center">
                {isAuthenticated ? (
                  <Sparkles className="w-3 h-3 text-white" />
                ) : (
                  <span className="text-[8px] font-bold text-white">AI</span>
                )}
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
              className="absolute bottom-0 right-0 w-[380px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{ height: "560px", maxHeight: "calc(100vh - 100px)" }}
            >
              {/* 헤더 */}
              <div
                className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0"
                style={{
                  background: isAuthenticated
                    ? "linear-gradient(135deg, #1F3864, #7c3aed)"
                    : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: isAuthenticated ? "#C9A961" : "rgba(255,255,255,0.2)" }}
                  >
                    {isAuthenticated ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {isAuthenticated ? "나의 전담 AI 에버" : "에버 (Ever)"}
                    </p>
                    <p className="text-xs text-white/70">
                      {isAuthenticated
                        ? "유언·상속·자서전·편지 전문"
                        : "EverWill 서비스 안내"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {/* 이전 대화 이어서 (회원) */}
                  {isAuthenticated && sessionKey && (
                    <button
                      onClick={() => {
                        setHistoryLoaded(false);
                        setMessages([]);
                      }}
                      className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                      aria-label="이전 대화 불러오기"
                      title="이전 대화 이어서"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="챗봇 최소화"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="챗봇 닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 회원 전담 AI 전문 영역 뱃지 */}
              {isAuthenticated && (
                <div className="flex gap-1.5 px-3 py-2 bg-purple-50 flex-shrink-0 flex-wrap">
                  {badges.map((badge, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: ["#e0e7ff", "#fce7f3", "#d1fae5"][i % 3],
                        color: ["#4338ca", "#be185d", "#065f46"][i % 3],
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* 메시지 영역 */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: isAuthenticated
                            ? "linear-gradient(135deg, #1F3864, #7c3aed)"
                            : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                        }}
                      >
                        {isAuthenticated ? (
                          <Sparkles className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Bot className="w-3.5 h-3.5 text-white" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-tr-sm"
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      }`}
                      style={
                        msg.role === "user"
                          ? {
                              background: isAuthenticated
                                ? "linear-gradient(135deg, #1F3864, #7c3aed)"
                                : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                            }
                          : {}
                      }
                    >
                      {renderContent(msg.content)}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}

                {/* 로딩 */}
                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isAuthenticated
                          ? "linear-gradient(135deg, #1F3864, #7c3aed)"
                          : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                      }}
                    >
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 비회원 가입 유도 버튼 */}
                {!isAuthenticated && guestTurnCount >= 3 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link href="/login">
                      <button
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                        style={{ background: "linear-gradient(135deg, #1F3864, #2d5a9e)" }}
                      >
                        <LogIn className="w-4 h-4" />
                        로그인하기
                      </button>
                    </Link>
                    <Link href="/login?tab=signup">
                      <button
                        className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 flex items-center justify-center gap-2"
                        style={{ borderColor: "#C9A961", color: "#C9A961" }}
                      >
                        무료 회원가입
                      </button>
                    </Link>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* 빠른 질문 버튼 */}
              {showQuickQuestions && quickData?.questions && (
                <div className="px-3 pb-2 flex-shrink-0">
                  <div className="flex flex-wrap gap-1.5">
                    {quickData.questions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                        style={{ borderColor: "#1F3864", color: "#1F3864" }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 비회원 로그인 유도 배너 */}
              {!isAuthenticated && (
                <div
                  className="px-4 py-2 text-xs text-center flex-shrink-0"
                  style={{ background: "#f8f4ec", color: "#92400e" }}
                >
                  💡 회원 가입 후 <strong>유언·상속 법률 상담</strong>과 <strong>자서전·편지 작성</strong>을 이용하세요
                </div>
              )}

              {/* 입력창 */}
              <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-gray-100">
                <div className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isAuthenticated
                        ? "무엇이든 물어보세요..."
                        : "서비스에 대해 물어보세요..."
                    }
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1F3864] bg-gray-50"
                    disabled={isLoading || (!isAuthenticated && guestTurnCount >= 3)}
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={!inputValue.trim() || isLoading || (!isAuthenticated && guestTurnCount >= 3)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
                    style={{
                      background: isAuthenticated
                        ? "linear-gradient(135deg, #1F3864, #7c3aed)"
                        : "linear-gradient(135deg, #1F3864, #2d5a9e)",
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-1.5">
                  AI 정보 제공 서비스 · 법률 자문이 아닙니다
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
