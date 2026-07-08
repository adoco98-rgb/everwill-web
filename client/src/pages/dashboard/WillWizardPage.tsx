/**
 * 유언 작성하기 - 5단계 위저드 (무료)
 * 1단계: 기본정보 확인 (소셜 로그인 정보 자동 채움)
 * 2단계: 자산 등록
 * 3단계: 상속자 등록
 * 4단계: 유언장 작성 (AI 자동 생성)
 * 5단계: 상속 내용 입력 (분배 비율)
 *
 * ※ 전자유언인증(개인인증 + 전자서명)은 결제 + 카드 구매 완료 후 별도 절차
 */
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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

export default function WillWizardPage() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showCertGuide, setShowCertGuide] = useState(false);

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
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
        <h1 className="text-2xl font-bold text-[#1F3864] mb-1">유언 작성하기</h1>
        <p className="text-gray-500 text-sm">
          5단계를 완료하면 유언장 초안이 완성됩니다. <span className="text-green-600 font-semibold">모두 무료</span>
        </p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between relative">
          {/* 연결선 */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-[#C9A961] z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
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
              <span className="text-xs text-gray-400 font-medium">
                {currentStep}단계 / {TOTAL_STEPS}단계
              </span>
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
              {Math.round((completedSteps.length / TOTAL_STEPS) * 100)}%
            </div>
            <div className="text-xs text-gray-400">완료</div>
          </div>
        </div>
      </div>

      {/* 전자유언인증 안내 (모든 단계 완료 시) */}
      {showCertGuide && allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#C9A961]/10 to-[#C9A961]/5 border border-[#C9A961]/30 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#C9A961]/20 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#C9A961]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#1F3864] mb-1">
                🎉 유언장 작성 완료!
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                유언장 초안이 완성되었습니다. 법적 효력을 갖추려면 <strong>전자유언인증</strong>을 진행하세요.
              </p>
              <div className="bg-white/80 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-[#1F3864] mb-2">전자유언인증 절차 (결제 후 진행):</p>
                <ol className="text-xs text-gray-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    결제 완료 (₩168,000) + 인증 카드 구매
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    개인 인증 (신분증 + 셀피 + 전자서명)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    등록 자산 확인 및 수정/추가
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
                    공증서류 업로드
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#1F3864] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
                    전자서명 → 인증 완료
                  </li>
                </ol>
              </div>
              <a
                href="/dashboard/payment"
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#C9A961] text-white rounded-xl text-sm font-bold hover:bg-[#b8963f] transition-all shadow-md"
              >
                <CreditCard className="w-4 h-4" />
                결제하고 전자유언인증 시작하기
                <ChevronRight className="w-4 h-4" />
              </a>
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
