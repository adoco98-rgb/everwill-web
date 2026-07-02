/**
 * 유언 완성하기 - 6단계 위저드
 * 1단계: 개인 인증 (eKYC)
 * 2단계: 자산 등록
 * 3단계: 상속자 등록
 * 4단계: 유언장 작성
 * 5단계: 상속 내용 입력
 * 6단계: 전자서명 + 인증 완료
 */
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ClipboardList,
  Users,
  FileText,
  Scale,
  PenLine,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  AlertCircle,
} from "lucide-react";
import Step1Identity from "./wizard/Step1Identity";
import Step2Assets from "./wizard/Step2Assets";
import Step3Heirs from "./wizard/Step3Heirs";
import Step4Will from "./wizard/Step4Will";
import Step5Distribution from "./wizard/Step5Distribution";
import Step6Signature from "./wizard/Step6Signature";

// 6단계 정의
const STEPS = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "개인 인증",
    subtitle: "본인 확인 및 신원 인증",
    description: "유언장의 법적 효력을 위해 본인 인증이 필요합니다.",
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
    title: "상속 내용 입력",
    subtitle: "자산별 분배 비율 설정",
    description: "각 상속인에게 자산을 어떻게 분배할지 설정하세요.",
    color: "#EF4444",
  },
  {
    id: 6,
    icon: PenLine,
    title: "전자서명",
    subtitle: "서명 및 인증 완료",
    description: "전자서명 후 유언장이 공식 인증됩니다. (₩49,000)",
    color: "#C9A961",
  },
];

export default function WillWizardPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
    if (step < 6) {
      setCurrentStep(step + 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    // 완료된 단계 또는 현재 단계 직전까지만 이동 가능
    if (stepId <= currentStep || completedSteps.includes(stepId - 1)) {
      setCurrentStep(stepId);
    }
  };

  const currentStepData = STEPS.find((s) => s.id === currentStep)!;

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1F3864] mb-1">유언 완성하기</h1>
        <p className="text-gray-500 text-sm">6단계를 완료하면 민법 요건에 맞는 유언장이 완성됩니다.</p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between relative">
          {/* 연결선 */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-[#C9A961] z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          />

          {STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            const isLocked = step.id > currentStep && !completedSteps.includes(step.id - 1);
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={isLocked}
                className={`relative z-10 flex flex-col items-center gap-1.5 group ${
                  isLocked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? "bg-green-500 text-white shadow-md"
                      : isCurrent
                      ? "bg-[#1F3864] text-white shadow-lg scale-110"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
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
            );
          })}
        </div>

        {/* 현재 단계 정보 */}
        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${currentStepData.color}15` }}
          >
            <currentStepData.icon
              className="w-5 h-5"
              style={{ color: currentStepData.color }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-medium">{currentStep}단계 / 6단계</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${currentStepData.color}15`,
                  color: currentStepData.color,
                }}
              >
                {currentStepData.subtitle}
              </span>
            </div>
            <h2 className="text-base font-bold text-[#1F3864]">{currentStepData.title}</h2>
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-bold text-[#1F3864]">
              {Math.round(((completedSteps.length) / 6) * 100)}%
            </div>
            <div className="text-xs text-gray-400">완료</div>
          </div>
        </div>
      </div>

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
            <Step1Identity onComplete={() => handleStepComplete(1)} />
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
          {currentStep === 6 && (
            <Step6Signature onComplete={() => handleStepComplete(6)} />
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

        {currentStep < 6 && (
          <button
            onClick={() => {
              if (completedSteps.includes(currentStep)) {
                setCurrentStep((s) => Math.min(6, s + 1));
              }
            }}
            disabled={!completedSteps.includes(currentStep)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F3864] text-white text-sm font-medium hover:bg-[#162d52] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            다음 단계
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
