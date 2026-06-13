/**
 * 관리자 AI 지침 + 모델 관리 페이지
 * 각 AI 모드별 시스템 프롬프트 + AI 모델(공급사·버전) 선택을 DB에서 직접 관리
 * 코드 수정 없이 관리자가 AI 성격·지식·지침·모델을 즉시 변경 가능
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Scale,
  BookOpen,
  NotebookPen,
  Mail,
  LayoutGrid,
  Save,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

// AI 모드 메타데이터
const AI_MODES = [
  {
    id: "public",
    label: "공개 안내 봇",
    sublabel: "비회원 대상 서비스 안내",
    icon: Bot,
    color: "#6B7280",
    bg: "#F3F4F6",
    description: "가입 전 방문자에게 서비스를 안내하는 AI. 가격, 기능, 가입 방법을 안내하고 회원가입을 유도합니다.",
  },
  {
    id: "general",
    label: "통합 AI (에버)",
    sublabel: "회원 전담 통합 상담",
    icon: LayoutGrid,
    color: "#1F3864",
    bg: "#EEF2FF",
    description: "회원 전담 통합 AI. 유언·상속·인생 기록 전반을 상담하고 전문 모드로 연결합니다.",
  },
  {
    id: "legal",
    label: "법률 전문 AI (에버 법률)",
    sublabel: "유언·상속 법률 전문",
    icon: Scale,
    color: "#1D4ED8",
    bg: "#EFF6FF",
    description: "11개국 유언·상속법 전문 AI. 법조문 인용, 실무 주의사항, 변호사 연결을 안내합니다.",
  },
  {
    id: "autobiography",
    label: "자서전 AI (에버 스토리)",
    sublabel: "인생 이야기 자서전 작성",
    icon: BookOpen,
    color: "#7C3AED",
    bg: "#F5F3FF",
    description: "인생 이야기를 아름다운 자서전으로 기록하는 AI. 질문으로 이야기를 끌어내고 문장으로 정리합니다.",
  },
  {
    id: "diary",
    label: "일기 AI (에버 다이어리)",
    sublabel: "오늘 하루 일기 작성",
    icon: NotebookPen,
    color: "#059669",
    bg: "#ECFDF5",
    description: "오늘 하루를 기록하는 따뜻한 일기 동반자 AI. 감정과 생각을 정리하고 일기로 완성합니다.",
  },
  {
    id: "letter",
    label: "편지 AI (에버 레터)",
    sublabel: "가족·지인 편지 작성",
    icon: Mail,
    color: "#D97706",
    bg: "#FFFBEB",
    description: "마음을 담은 편지를 함께 쓰는 AI. 유언장 개인 메시지, 미래 전달 편지 등을 작성합니다.",
  },
] as const;

// AI 공급사 및 모델 목록 (프론트엔드 표시용)
const AI_PROVIDERS = [
  {
    id: "manus",
    name: "Manus 내장 AI",
    badge: "개발용",
    badgeColor: "bg-gray-100 text-gray-600",
    description: "현재 플랫폼 기본 LLM. 개발·테스트 단계에서 사용",
    models: [
      { id: "default", name: "기본 모델 (자동)", description: "플랫폼 기본 모델 자동 선택" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    badge: "추천",
    badgeColor: "bg-green-100 text-green-700",
    description: "감성 글쓰기·다국어에 강함. 자서전·일기·편지에 최적",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "최신 멀티모달. 균형 잡힌 최고 성능" },
      { id: "gpt-4o-mini", name: "GPT-4o mini", description: "빠르고 저렴. 일반 대화·일기에 적합" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "고성능 추론. 복잡한 법률 문서" },
      { id: "o1-mini", name: "o1 mini", description: "고급 추론 특화. 법률 분석 최적" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    badge: "법률 최강",
    badgeColor: "bg-blue-100 text-blue-700",
    description: "긴 법률 문서 분석에 탁월. 안전성·정확성 중시",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "법률 문서 분석 최강. 긴 컨텍스트" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "빠르고 저렴. 일기·편지에 적합" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "최고 성능. 복잡한 법률 분석" },
    ],
  },
  {
    id: "google",
    name: "Google (Gemini)",
    badge: "다국어",
    badgeColor: "bg-yellow-100 text-yellow-700",
    description: "7개 언어 지원에 최적. 글로벌 서비스 특화",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "다국어·긴 문서 처리. 글로벌 서비스" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "빠르고 저렴. 실시간 대화" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "최신 모델. 멀티모달 지원" },
    ],
  },
  {
    id: "upstage",
    name: "Upstage (Solar)",
    badge: "한국어",
    badgeColor: "bg-purple-100 text-purple-700",
    description: "한국어 특화. 국내 서버 운영. 법률·금융 문서 특화",
    models: [
      { id: "solar-pro", name: "Solar Pro", description: "한국어 최강. 법률·금융 문서 특화" },
      { id: "solar-mini", name: "Solar Mini", description: "경량 한국어 모델. 빠른 응답" },
    ],
  },
];

type AiModeId = (typeof AI_MODES)[number]["id"];

interface PromptData {
  mode: AiModeId;
  id: number | null;
  title: string;
  description: string | null | undefined;
  systemPrompt: string;
  aiModel: string;
  aiProvider: string;
  isActive: number;
  isFromDb: boolean;
  updatedAt: Date | null;
}

export default function AdminAIPromptsPage() {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<AiModeId>("public");
  const [editedPrompts, setEditedPrompts] = useState<Record<string, Partial<PromptData>>>({});
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);

  // 관리자 확인
  if (user && user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">접근 권한 없음</h2>
          <p className="text-gray-500">관리자만 접근할 수 있는 페이지입니다.</p>
          <Link href="/admin">
            <Button className="mt-4" variant="outline">관리자 페이지로 이동</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 모든 프롬프트 조회
  const { data: prompts, isLoading, refetch } = trpc.aiPrompt.getAll.useQuery(undefined, {
    enabled: user?.role === "admin",
  });

  // 저장 mutation
  const saveMutation = trpc.aiPrompt.save.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      setEditedPrompts((prev) => {
        const next = { ...prev };
        delete next[selectedMode];
        return next;
      });
      setShowModelSelector(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // 기본값 초기화 mutation
  const resetMutation = trpc.aiPrompt.resetToDefault.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      setEditedPrompts((prev) => {
        const next = { ...prev };
        delete next[selectedMode];
        return next;
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // 전체 초기화 mutation
  const resetAllMutation = trpc.aiPrompt.resetAllToDefault.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      setEditedPrompts({});
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // 현재 선택된 모드 데이터
  const currentPromptData = prompts?.find((p) => p.mode === selectedMode);
  const editState = editedPrompts[selectedMode];
  const currentTitle = editState?.title ?? currentPromptData?.title ?? "";
  const currentSystemPrompt = editState?.systemPrompt ?? currentPromptData?.systemPrompt ?? "";
  const currentAiModel = editState?.aiModel ?? (currentPromptData as any)?.aiModel ?? "default";
  const currentAiProvider = editState?.aiProvider ?? (currentPromptData as any)?.aiProvider ?? "manus";
  const hasUnsavedChanges = !!editState;

  const selectedModeInfo = AI_MODES.find((m) => m.id === selectedMode)!;

  // 현재 선택된 공급사·모델 표시 이름
  const selectedProvider = AI_PROVIDERS.find((p) => p.id === currentAiProvider);
  const selectedModel = selectedProvider?.models.find((m) => m.id === currentAiModel);

  const handleSave = () => {
    if (!currentTitle.trim() || !currentSystemPrompt.trim()) {
      toast.error("제목과 AI 지침을 모두 입력해 주세요.");
      return;
    }
    saveMutation.mutate({
      mode: selectedMode,
      title: currentTitle,
      systemPrompt: currentSystemPrompt,
      aiModel: currentAiModel,
      aiProvider: currentAiProvider,
      isActive: 1,
    });
  };

  const handleReset = () => {
    if (confirm(`'${selectedModeInfo.label}' AI 지침을 기본값으로 초기화하시겠습니까?`)) {
      resetMutation.mutate({ mode: selectedMode });
    }
  };

  const handleResetAll = () => {
    if (confirm("모든 AI 지침을 기본값으로 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      resetAllMutation.mutate();
    }
  };

  const handleSelectModel = (providerId: string, modelId: string) => {
    setEditedPrompts((prev) => ({
      ...prev,
      [selectedMode]: {
        ...prev[selectedMode],
        aiProvider: providerId,
        aiModel: modelId,
        // title과 systemPrompt가 없으면 현재 값 유지
        title: prev[selectedMode]?.title ?? currentPromptData?.title ?? currentTitle,
        systemPrompt: prev[selectedMode]?.systemPrompt ?? currentPromptData?.systemPrompt ?? currentSystemPrompt,
      },
    }));
    setShowModelSelector(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="text-gray-400 hover:text-gray-600 text-sm">← 관리자</button>
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#1F3864]" />
              <h1 className="text-lg font-bold text-gray-900">AI 지침 & 모델 관리</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              disabled={resetAllMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {resetAllMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
              )}
              전체 초기화
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 안내 배너 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium mb-1">AI 지침 & 모델 관리 안내</p>
            <p>각 AI 모드의 <strong>시스템 프롬프트(지침)</strong>와 <strong>AI 모델(공급사·버전)</strong>을 직접 설정할 수 있습니다. 저장 즉시 반영되며, 코드 수정이나 재배포가 필요 없습니다.</p>
            <p className="mt-1 text-blue-600">⚠️ 실제 서비스 출시 시 각 공급사 API Key를 환경변수에 등록해야 해당 모델이 동작합니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽: AI 모드 선택 목록 */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">AI 모드 선택</h2>
            {AI_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = selectedMode === mode.id;
              const promptData = prompts?.find((p) => p.mode === mode.id);
              const hasEdit = !!editedPrompts[mode.id];

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? "border-[#1F3864] bg-[#1F3864] text-white shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? "rgba(255,255,255,0.2)" : mode.bg }}
                    >
                      <Icon className="w-4 h-4" style={{ color: isSelected ? "white" : mode.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium truncate ${isSelected ? "text-white" : "text-gray-900"}`}>
                        {mode.label}
                      </div>
                      <div className={`text-xs truncate ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                        {mode.sublabel}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {promptData?.isFromDb && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-green-100 text-green-700"}`}>
                          DB
                        </span>
                      )}
                      {hasEdit && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? "bg-yellow-300/80 text-yellow-900" : "bg-yellow-100 text-yellow-700"}`}>
                          수정중
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 오른쪽: 편집 영역 */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* 모드 헤더 */}
                <div
                  className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
                  style={{ background: selectedModeInfo.bg }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: selectedModeInfo.color }}
                    >
                      <selectedModeInfo.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{selectedModeInfo.label}</h3>
                      <p className="text-xs text-gray-500">{selectedModeInfo.sublabel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentPromptData?.isFromDb ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        DB 저장됨
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        코드 기본값
                      </Badge>
                    )}
                    {currentPromptData?.updatedAt && (
                      <span className="text-xs text-gray-400">
                        최종 수정: {new Date(currentPromptData.updatedAt).toLocaleDateString("ko-KR")}
                      </span>
                    )}
                  </div>
                </div>

                {/* AI 설명 (토글) */}
                <div className="border-b border-gray-100">
                  <button
                    onClick={() => setExpandedInfo(expandedInfo === selectedMode ? null : selectedMode)}
                    className="w-full px-6 py-3 flex items-center justify-between text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      이 AI의 역할 설명
                    </span>
                    {expandedInfo === selectedMode ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  {expandedInfo === selectedMode && (
                    <div className="px-6 pb-4 text-sm text-gray-600 bg-gray-50">
                      {selectedModeInfo.description}
                    </div>
                  )}
                </div>

                {/* 편집 폼 */}
                <div className="p-6 space-y-5">
                  {/* AI 모델 선택 섹션 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4 text-gray-500" />
                        AI 모델 선택
                      </label>
                      <span className="text-xs text-gray-400">출시 시 API Key 등록 필요</span>
                    </div>

                    {/* 현재 선택된 모델 표시 */}
                    <button
                      onClick={() => setShowModelSelector(!showModelSelector)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-[#1F3864] hover:bg-blue-50/30 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Cpu className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedProvider?.name ?? "공급사 선택 안됨"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {selectedModel?.name ?? currentAiModel} — {selectedModel?.description ?? ""}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedProvider && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedProvider.badgeColor}`}>
                            {selectedProvider.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showModelSelector ? "rotate-90" : ""}`} />
                      </div>
                    </button>

                    {/* 모델 선택 드롭다운 */}
                    {showModelSelector && (
                      <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-lg">
                        {AI_PROVIDERS.map((provider) => (
                          <div key={provider.id} className="border-b border-gray-100 last:border-0">
                            {/* 공급사 헤더 */}
                            <div className="px-4 py-2.5 bg-gray-50 flex items-center justify-between">
                              <div>
                                <span className="text-sm font-semibold text-gray-800">{provider.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{provider.description}</span>
                              </div>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${provider.badgeColor}`}>
                                {provider.badge}
                              </span>
                            </div>
                            {/* 모델 목록 */}
                            {provider.models.map((model) => {
                              const isCurrentModel = currentAiProvider === provider.id && currentAiModel === model.id;
                              return (
                                <button
                                  key={model.id}
                                  onClick={() => handleSelectModel(provider.id, model.id)}
                                  className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 transition-colors text-left ${
                                    isCurrentModel ? "bg-blue-50 border-l-2 border-[#1F3864]" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${isCurrentModel ? "bg-[#1F3864]" : "bg-gray-300"}`} />
                                    <div>
                                      <div className={`text-sm font-medium ${isCurrentModel ? "text-[#1F3864]" : "text-gray-700"}`}>
                                        {model.name}
                                      </div>
                                      <div className="text-xs text-gray-400">{model.description}</div>
                                    </div>
                                  </div>
                                  {isCurrentModel && (
                                    <CheckCircle className="w-4 h-4 text-[#1F3864]" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 표시 이름 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      AI 표시 이름
                    </label>
                    <Input
                      value={currentTitle}
                      onChange={(e) =>
                        setEditedPrompts((prev) => ({
                          ...prev,
                          [selectedMode]: { ...prev[selectedMode], title: e.target.value },
                        }))
                      }
                      placeholder="예: 법률 전문 AI (에버 법률)"
                      className="text-sm"
                    />
                  </div>

                  {/* 시스템 프롬프트 */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        AI 지침 (시스템 프롬프트)
                      </label>
                      <span className="text-xs text-gray-400">
                        {currentSystemPrompt.length}자
                      </span>
                    </div>
                    <Textarea
                      value={currentSystemPrompt}
                      onChange={(e) =>
                        setEditedPrompts((prev) => ({
                          ...prev,
                          [selectedMode]: { ...prev[selectedMode], systemPrompt: e.target.value },
                        }))
                      }
                      placeholder="AI에게 줄 지침을 입력하세요. 역할, 전문 지식, 답변 방식, 금지 사항 등을 포함하세요."
                      className="min-h-[360px] text-sm font-mono leading-relaxed resize-y"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">
                      * 이 내용이 AI에게 전달되는 핵심 지침입니다. 역할·지식·톤·제한사항을 구체적으로 작성하세요.
                    </p>
                  </div>

                  {/* 미저장 변경 알림 */}
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      저장되지 않은 변경사항이 있습니다. (모델: {selectedProvider?.name} / {selectedModel?.name ?? currentAiModel})
                    </div>
                  )}

                  {/* 버튼 영역 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={resetMutation.isPending}
                      className="text-gray-500"
                    >
                      {resetMutation.isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      기본값으로 초기화
                    </Button>

                    <Button
                      onClick={handleSave}
                      disabled={saveMutation.isPending || !hasUnsavedChanges}
                      className="bg-[#1F3864] hover:bg-[#162a4e] text-white"
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      저장 (즉시 반영)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
