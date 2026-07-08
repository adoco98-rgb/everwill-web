/**
 * 유언 작성하기 - 5단계 위저드 (무료)
 * 1단계: 기본정보 확인 (소셜 로그인 정보 자동 채움)
 * 2단계: 자산 등록
 * 3단계: 상속자 등록
 * 4단계: 유언장 작성 (AI 자동 생성)
 * 5단계: 상속 내용 입력 (분배 비율)
 *
 * ※ 전자유언인증(개인인증 + 전자서명)은 결제 + 카드 구매 완료 후 별도 절차
 * ※ 진행 상태는 localStorage + DB 데이터 기반으로 새로고침 후에도 유지됨
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  ClipboardList,
  Users,
  FileText,
  Scale,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import Step1BasicInfo from "./wizard/Step1BasicInfo";
import Step2Assets from "./wizard/Step2Assets";
import Step3Heirs from "./wizard/Step3Heirs";
import Step4Will from "./wizard/Step4Will";
import Step5Distribution from "./wizard/Step5Distribution";

// 5단계 정의 (무료 유언 작성)
const STEPS = [
  {
    id: 1,
    icon: User,
    title: "기본정보",
    subtitle: "유언자 본인 정보 확인",
    description: "소셜 로그인으로 자동 입력된 정보를 확인합니다.",
    color: "#3B82F6",
  },
  {
    id: 2,
    icon: ClipboardList,
    title: "자산 등록",
    subtitle: "보유 자산 목록 입력",
    description: "부동산, 금융자산, 기타 자산을 등록하세요.",
    color: "#10B981",
  },
  {
    id: 3,
    icon: Users,
    title: "상속자 등록",
    subtitle: "상속인 정보 입력",
    description: "유언장에 등록할 상속인 정보를 입력하세요.",
    color: "#F59E0B",
  },
  {
    id: 4,
    icon: FileText,
    title: "유언장 작성",
    subtitle: "AI 유언장 자동 생성",
    description: "체크박스 선택으로 AI가 법적 유언장을 작성합니다.",
    color: "#8B5CF6",
  },
  {
    id: 5,
    icon: Scale,
    title: "상속 내용",
    subtitle: "자산별 분배 비율 설정",
    description: "각 상속인에게 자산을 어떻게 분배할지 설정하세요.",
    color: "#C9A961",
  },
];

const TOTAL_STEPS = STEPS.length;
const STORAGE_KEY = "everwill_wizard_progress";

// localStorage에서 진행 상태 읽기
function loadProgress(): { currentStep: number; completedSteps: number[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        currentStep: parsed.currentStep || 1,
        completedSteps: parsed.completedSteps || [],
      };
    }
  } catch {}
  return { currentStep: 1, completedSteps: [] };
}

// localStorage에 진행 상태 저장
function saveProgress(currentStep: number, completedSteps: number[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currentStep, completedSteps }));
  } catch {}
}

export default function WillWizardPage() {
  const { user } = useAuth();
  const initial = loadProgress();
  const [currentStep, setCurrentStep] = useState(initial.currentStep);
  const [completedSteps, setCompletedSteps] = useState<number[]>(initial.completedSteps);
  const [showCertGuide, setShowCertGuide] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // DB 데이터 기반으로 완료 단계 자동 복원
  const { data: profileData } = trpc.profile.getBasicInfo.useQuery();
  const { data: willData } = trpc.asset.getWillData.useQuery();
  const { data: myWills } = trpc.will.getMyWills.useQuery();

  // DB 데이터 기반 자동 완료 상태 복원
  useEffect(() => {
    if (initialized) return;
    const autoCompleted: number[] = [];

    // Step1: 기본정보 - 이름과 전화번호가 있으면 완료
    if (profileData?.name && profileData?.phone) {
      autoCompleted.push(1);
    }

    // Step2: 자산 등록 - 1개 이상 자산이 있으면 완료
    if (willData?.assets && willData.assets.length > 0) {
      autoCompleted.push(2);
    }

    // Step3: 상속자 등록 - 1명 이상 상속자가 있으면 완료
    if (willData?.heirs && willData.heirs.length > 0) {
      autoCompleted.push(3);
    }

    // Step4: 유언장 작성 - 저장된 유언장이 있으면 완료
    if (myWills && myWills.length > 0) {
      autoCompleted.push(4);
    }

    // localStorage 상태와 병합 (DB에 있는 것은 무조건 완료 처리)
    const merged = Array.from(new Set([...initial.completedSteps, ...autoCompleted])).sort((a, b) => a - b);
    setCompletedSteps(merged);

    // 현재 단계도 복원: 완료된 단계 다음으로 이동
    if (merged.length > 0) {
      const maxCompleted = Math.max(...merged);
      const restoredStep = Math.min(maxCompleted + 1, TOTAL_STEPS);
      // localStorage에 저장된 단계가 더 높으면 그것을 유지
      const finalStep = Math.max(initial.currentStep, restoredStep);
      setCurrentStep(Math.min(finalStep, TOTAL_STEPS));
    }

    setInitialized(true);
  }, [profileData, willData, myWills]);

  // 진행 상태 변경 시 localStorage에 저장
  useEffect(() => {
    if (initialized) {
      saveProgress(currentStep, completedSteps);
    }
  }, [currentStep, completedSteps, initialized]);

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => {
        const next = [...prev, step];
        saveProgress(step < TOTAL_STEPS ? step + 1 : step, next);
        return next;
      });
    }
    if (step < TOTAL_STEPS) {
      setCurrentStep(step + 1);
    } else {
      // 마지막 단계 완료 → 인증 안내 표시
      setShowCertGuide(true);
    }
  };

  const handleStepClick = (stepId: number) => {
    // 완료된 단계 또는 현재 단계 직전까지만 이동 가능
    if (stepId <= currentStep || completedSteps.includes(stepId - 1)) {
      setCurrentStep(stepId);
    }
  };

  const currentStepData = STEPS.find((s) => s.id === currentStep)!;
  const allCompleted = completedSteps.length === TOTAL_STEPS;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F3864]">유언 작성하기</h1>
        <p className="text-sm text-gray-500 mt-1">
          5단계를 완료하면 유언장 초안이 완성됩니다. <span className="text-[#C9A961] font-semibold">모두 무료</span>
        </p>
      </div>

      {/* 진행 바 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isLocked = step.id > currentStep && !completedSteps.includes(step.id - 1);
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={isLocked}
                  className={`flex flex-col items-center gap-1.5 transition-all ${
                    isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-[#1F3864] text-white ring-4 ring-[#1F3864]/20"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isCurrent ? "text-[#1F3864]" : isCompleted ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 h-0.5 mx-1 ${
                      completedSteps.includes(step.id) ? "bg-green-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 현재 단계 정보 */}
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">
              {currentStep}단계 / {TOTAL_STEPS}단계
            </span>
            <span className="text-xs text-blue-600 font-medium ml-2">
              {currentStepData.subtitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#1F3864]">
              {Math.round((completedSteps.length / TOTAL_STEPS) * 100)}%
            </span>
            <span className="text-xs text-gray-400">완료</span>
          </div>
        </div>
      </div>

      {/* 전자유언인증 안내 (모든 단계 완료 시) */}
      {showCertGuide && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1F3864] to-[#2d4a7a] rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">유언장 초안 작성 완료!</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                유언장 초안이 완성되었습니다. 법적 효력을 갖추려면 전자유언인증을 진행해주세요.
                <br />결제 후 개인 인증 → 공증서류 업로드 → 전자서명 순서로 진행됩니다.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <a
                  href="/dashboard/payment"
                  className="inline-flex items-center gap-2 bg-[#C9A961] text-[#1F3864] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#d4b872] transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  결제하고 인증 시작
                </a>
                <span className="text-xs text-white/50">₩168,000</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 단계별 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && (
            <Step1BasicInfo onComplete={() => handleStepComplete(1)} />
          )}
          {currentStep === 2 && (
            <Step2Assets onComplete={() => handleStepComplete(2)} />
          )}
          {currentStep === 3 && (
            <Step3Heirs onComplete={() => handleStepComplete(3)} />
          )}
          {currentStep === 4 && (
            <Step4Will onComplete={() => handleStepComplete(4)} />
          )}
          {currentStep === 5 && (
            <Step5Distribution onComplete={() => handleStepComplete(5)} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          이전 단계
        </button>

        <div className="flex items-center gap-1.5">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`w-2 h-2 rounded-full transition-all ${
                step.id === currentStep
                  ? "bg-[#1F3864] w-6"
                  : completedSteps.includes(step.id)
                  ? "bg-green-400"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {currentStep < TOTAL_STEPS && (
          <button
            onClick={() => {
              if (completedSteps.includes(currentStep)) {
                setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1));
              }
            }}
            disabled={!completedSteps.includes(currentStep)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F3864] text-white text-sm font-medium hover:bg-[#162d52] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            다음 단계
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {currentStep === TOTAL_STEPS && !allCompleted && (
          <div className="w-[120px]" /> 
        )}
      </div>
    </div>
  );
}
