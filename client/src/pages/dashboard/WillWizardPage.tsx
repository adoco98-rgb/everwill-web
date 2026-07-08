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
 * ※ 5단계 완료 시 간편 유언장 요약 카드 + 결제 인증 안내 박스 자동 표시
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
  Award,
  ArrowRight,
  Landmark,
  PenLine,
  BadgeCheck,
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

// 자산 타입 한글 변환
function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    real_estate: "부동산",
    bank: "예금·적금",
    stock: "주식·펀드",
    insurance: "보험",
    vehicle: "자동차",
    crypto: "가상자산",
    business: "사업체",
    pension: "연금",
    artwork: "예술품·귀금속",
    other: "기타 자산",
  };
  return labels[type] || type;
}

// 관계 한글 변환
function getRelationLabel(relation: string): string {
  const labels: Record<string, string> = {
    spouse: "배우자",
    child: "자녀",
    parent: "부모",
    sibling: "형제자매",
    grandchild: "손자녀",
    other: "기타",
  };
  return labels[relation] || relation;
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

    // 5단계까지 모두 완료된 상태라면 인증 안내 자동 표시
    if (merged.length >= TOTAL_STEPS) {
      setShowCertGuide(true);
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

  // 유언장 요약 데이터 계산
  const assets = willData?.assets || [];
  const heirs = willData?.heirs || [];
  const totalAssetValue = assets.reduce((sum: number, a: any) => sum + (a.estimatedValue || 0), 0);
  const topHeir = heirs.length > 0
    ? [...heirs].sort((a: any, b: any) => (b.sharePercent || 0) - (a.sharePercent || 0))[0]
    : null;
  const latestWill = myWills && myWills.length > 0 ? myWills[0] : null;

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

      {/* ─── 5단계 완료 시: 간편 유언장 요약 카드 + 결제 인증 안내 ─── */}
      {showCertGuide && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 mb-6"
        >
          {/* 간편 유언장 작성본 요약 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#C9A961]/30 overflow-hidden">
            {/* 카드 헤더 */}
            <div className="bg-[#1F3864] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9A961]/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#C9A961]" />
                </div>
                <div>
                  <h3 className="font-bold text-base">간편 유언장 작성본</h3>
                  <p className="text-white/60 text-xs">작성 완료 · 전자인증 대기 중</p>
                </div>
              </div>
              <div className="bg-[#C9A961]/20 text-[#C9A961] px-3 py-1 rounded-lg text-xs font-bold">
                초안 완성
              </div>
            </div>

            {/* 요약 내용 */}
            <div className="p-6 space-y-4">
              {/* 유언자 정보 */}
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#1F3864] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">유언자</p>
                  <p className="text-sm font-bold text-gray-800">
                    {profileData?.name || user?.name || "미입력"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profileData?.address || "주소 미입력"}
                    {profileData?.phone && ` · ${profileData.phone}`}
                  </p>
                </div>
              </div>

              {/* 자산 요약 */}
              <div className="flex items-start gap-3">
                <Landmark className="w-4 h-4 text-[#1F3864] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">등록 자산</p>
                  <p className="text-sm font-bold text-gray-800">
                    총 {assets.length}건
                    {totalAssetValue > 0 && (
                      <span className="text-[#C9A961] ml-2">
                        약 ₩{totalAssetValue.toLocaleString()}
                      </span>
                    )}
                  </p>
                  {assets.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {assets.slice(0, 4).map((a: any) => (
                        <span
                          key={a.id}
                          className="inline-flex items-center px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
                        >
                          {getAssetTypeLabel(a.type)}: {a.name}
                        </span>
                      ))}
                      {assets.length > 4 && (
                        <span className="text-xs text-gray-400">+{assets.length - 4}건</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 상속자 요약 */}
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[#1F3864] mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-0.5">상속자</p>
                  <p className="text-sm font-bold text-gray-800">총 {heirs.length}명</p>
                  {heirs.length > 0 && (
                    <div className="space-y-1 mt-1.5">
                      {heirs.map((h: any) => (
                        <div key={h.id} className="flex items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-[#1F3864]/10 flex items-center justify-center text-[10px] font-bold text-[#1F3864]">
                            {(h.nameKo || h.name || "?").charAt(0)}
                          </span>
                          <span className="text-gray-700 font-medium">{h.nameKo || h.name}</span>
                          <span className="text-gray-400">({getRelationLabel(h.relationship)})</span>
                          {h.sharePercent > 0 && (
                            <span className="text-[#C9A961] font-bold">{h.sharePercent}%</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 유언집행자 */}
              {topHeir && (
                <div className="flex items-start gap-3">
                  <Award className="w-4 h-4 text-[#1F3864] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">유언집행자</p>
                    <p className="text-sm font-bold text-gray-800">
                      {(topHeir as any).nameKo || (topHeir as any).name}
                      <span className="text-gray-400 font-normal ml-1">
                        ({getRelationLabel((topHeir as any).relationship)}, 지분 {(topHeir as any).sharePercent}%)
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* 유언장 제목 + 작성일 */}
              {latestWill && (
                <div className="flex items-start gap-3">
                  <PenLine className="w-4 h-4 text-[#1F3864] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">유언장</p>
                    <p className="text-sm font-bold text-gray-800">
                      {latestWill.title || "유언장"}
                    </p>
                    <p className="text-xs text-gray-400">
                      작성일: {new Date(latestWill.createdAt).toLocaleDateString("ko-KR")}
                      {latestWill.status === "draft" && (
                        <span className="ml-2 text-amber-600 font-medium">· 초안 (미인증)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 카드 하단 안내 */}
            <div className="bg-amber-50 border-t border-amber-100 px-6 py-3">
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>유의사항:</strong> 현재 유언장은 초안 상태입니다.
                전자유언인증을 완료해야 법적 효력이 부여됩니다.
              </p>
            </div>
          </div>

          {/* 결제 인증 안내 박스 */}
          <div className="bg-gradient-to-r from-[#1F3864] to-[#2d4a7a] rounded-2xl p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#C9A961]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">전자유언인증으로 법적 효력 부여</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  전자서명법 제3조에 따라 전자서명은 법적 효력을 가집니다.
                  EverWill 전자유언인증을 완료하면 블록체인 타임스탬프와 함께 유언장의 법적 효력이 보장됩니다.
                </p>

                {/* 인증 절차 안내 */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-xs text-white/50 mb-3 font-medium">인증 절차 (결제 후 진행)</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                      <BadgeCheck className="w-3.5 h-3.5 text-[#C9A961]" />
                      <span className="text-xs">개인 인증</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/30" />
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                      <FileText className="w-3.5 h-3.5 text-[#C9A961]" />
                      <span className="text-xs">공증서류 업로드</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/30" />
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                      <PenLine className="w-3.5 h-3.5 text-[#C9A961]" />
                      <span className="text-xs">전자서명</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-white/30" />
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-[#C9A961]" />
                      <span className="text-xs">인증서 발급</span>
                    </div>
                  </div>
                </div>

                {/* 결제 버튼 */}
                <div className="flex items-center gap-3">
                  <a
                    href="/dashboard/payments"
                    className="inline-flex items-center gap-2 bg-[#C9A961] text-[#1F3864] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#d4b872] transition-all shadow-lg shadow-[#C9A961]/20"
                  >
                    <CreditCard className="w-4 h-4" />
                    결제하고 정식인증 시작
                  </a>
                  <div className="text-left">
                    <p className="text-xs text-white/50">모든 서비스 포함</p>
                    <p className="text-sm font-bold text-[#C9A961]">₩168,000</p>
                  </div>
                </div>
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
