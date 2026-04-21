/**
 * EverWill AI 가이드 모드 - 10단계 마법사 + 서명 단계
 * 한국 민법 기준 유언장 자동 작성
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Building2, Users } from "lucide-react";
import { toast } from "sonner";
import { AI_STEPS, initialWillData } from "@/lib/willTypes";
import type { WillData, Heir } from "@/lib/willTypes";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Step1Testator from "./steps/Step1Testator";
import Step2Family from "./steps/Step2Family";
import Step3Heirs from "./steps/Step3Heirs";
import Step4RealEstate from "./steps/Step4RealEstate";
import Step5Financial from "./steps/Step5Financial";
import Step6Other from "./steps/Step6Other";
import Step7Special from "./steps/Step7Special";
import Step8Addons from "./steps/Step8Addons";
import Step9Preview from "./steps/Step9Preview";
import Step10Sign from "./steps/Step10Sign";

interface Props {
  onBack: () => void;
}

export default function AIWizard({ onBack }: Props) {
  const [step, setStep] = useState(1);
  const [will, setWill] = useState<WillData>({ ...initialWillData, mode: "ai" });
  const [autoLoaded, setAutoLoaded] = useState(false);
  const { isAuthenticated } = useAuth();

  // 등록된 재산 + 상속자 자동 불러오기
  const { data: willData } = trpc.asset.getWillData.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (!willData || autoLoaded) return;
    const { assets, heirs } = willData;
    if (assets.length === 0 && heirs.length === 0) return;

    // 상속자 매핑
    const mappedHeirs: Heir[] = heirs.map((h) => ({
      id: String(h.id),
      name: h.nameKo,
      relation: h.relationship === "spouse" ? "배우자" :
                h.relationship === "child" ? "자녀" :
                h.relationship === "parent" ? "부모" :
                h.relationship === "sibling" ? "형제자매" :
                h.relationship === "grandchild" ? "손자녀" : "기타",
      birthDate: h.birthDate ?? "",
      phone: h.phone ?? "",
      email: h.email ?? "",
      country: h.country ?? "KR",
      address: h.address ?? "",
      share: h.sharePercent ?? 0,
    }));

    // 부동산 매핑
    const realEstates = assets
      .filter((a) => a.type === "real_estate")
      .map((a) => ({
        id: String(a.id),
        type: "아파트",
        address: a.name,
        area: "",
        registrationNo: "",
        estimatedValue: a.estimatedValue ? String(a.estimatedValue) : "",
        heirId: "",
        sharePercent: 0,
      }));

    // 금융 자산 매핑
    const bankAssets = assets
      .filter((a) => ["bank", "stock", "insurance", "crypto", "pension"].includes(a.type))
      .map((a) => ({
        id: String(a.id),
        type: a.type === "bank" ? "예금·적금" :
              a.type === "stock" ? "주식·펀드" :
              a.type === "insurance" ? "보험" :
              a.type === "crypto" ? "가상자산" : "연금",
        institution: a.name,
        accountNo: "",
        estimatedValue: a.estimatedValue ? String(a.estimatedValue) : "",
        heirId: "",
        sharePercent: 0,
      }));

    update({
      heirs: mappedHeirs.length > 0 ? mappedHeirs : will.heirs,
      realEstates: realEstates.length > 0 ? realEstates : will.realEstates,
      financialAssets: bankAssets.length > 0 ? bankAssets : will.financialAssets,
    });

    setAutoLoaded(true);
    if (assets.length > 0 || heirs.length > 0) {
      toast.success(
        `등록된 재산 ${assets.length}개, 상속자 ${heirs.length}명을 자동으로 불러왔습니다`,
        { duration: 4000 }
      );
    }
  }, [willData, autoLoaded]);

  const update = (partial: Partial<WillData>) =>
    setWill((prev) => ({ ...prev, ...partial }));

  const next = () => {
    if (step < 10) setStep((s) => s + 1);
  };
  const prev = () => {
    if (step > 1) setStep((s) => s - 1);
    else onBack();
  };

  const handleSaveDraft = () => {
    const saved = { ...will, isDraft: true, lastSaved: new Date().toISOString() };
    localStorage.setItem("saram_will_draft", JSON.stringify(saved));
    toast.success("임시 저장 완료");
  };

  const stepProps = { will, update, onNext: next, onPrev: prev };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 진행 표시 */}
      <div className="mb-8">
        {/* 스텝 바 */}
        <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
          {AI_STEPS.map((s) => (
            <div
              key={s.id}
              className={`flex-1 h-1.5 rounded-full transition-all min-w-[20px] ${
                s.id < step
                  ? "bg-[#C9A961]"
                  : s.id === step
                  ? "bg-[#1F3864]"
                  : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[#C9A961] text-sm font-bold">
              {step} / {AI_STEPS.length}단계
            </span>
            <h2
              className="text-xl font-bold text-[#1F3864] mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {AI_STEPS[step - 1].icon} {AI_STEPS[step - 1].title}
            </h2>
            <p className="text-gray-400 text-sm">{AI_STEPS[step - 1].desc}</p>
          </div>
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            임시저장
          </button>
        </div>
      </div>

      {/* 스텝 콘텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 shadow-sm"
        >
          {step === 1 && <Step1Testator {...stepProps} />}
          {step === 2 && <Step2Family {...stepProps} />}
          {step === 3 && <Step3Heirs {...stepProps} />}
          {step === 4 && <Step4RealEstate {...stepProps} />}
          {step === 5 && <Step5Financial {...stepProps} />}
          {step === 6 && <Step6Other {...stepProps} />}
          {step === 7 && <Step7Special {...stepProps} />}
          {step === 8 && <Step8Addons {...stepProps} />}
          {step === 9 && <Step9Preview {...stepProps} />}
          {step === 10 && <Step10Sign {...stepProps} />}
        </motion.div>
      </AnimatePresence>

      {/* 하단 네비 (서명 단계 제외) */}
      {step < 10 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={prev}
            className="flex items-center gap-2 text-gray-400 hover:text-[#1F3864] text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 1 ? "모드 선택" : "이전"}
          </button>
          {step === 9 ? (
            <button
              onClick={next}
              className="btn-gold flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm"
            >
              서명 및 인증하기
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={next}
              className="btn-navy flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm text-white"
            >
              다음 단계
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
