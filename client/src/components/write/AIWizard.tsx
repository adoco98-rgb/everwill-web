/**
 * EverWill AI 가이드 모드 - 10단계 마법사 + 서명 단계
 * 한국 민법 기준 유언장 자동 작성
 * 페이월: 1~9단계 무료, 9→10 전환 시 결제 게이트 표시
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Building2, Users, Lock, Sparkles, Shield, Clock } from "lucide-react";
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
  // 페이월 모달 상태
  const [showPaywall, setShowPaywall] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [profileLoaded, setProfileLoaded] = useState(false);

  // 회원가입 정보 자동 채움 (최초 1회)
  useEffect(() => {
    if (!user || profileLoaded) return;
    const profileUpdate: Partial<WillData> = {};
    if (user.name) profileUpdate.testatorName = user.name;
    if (user.phone) profileUpdate.testatorPhone = user.phone;
    if (user.address) profileUpdate.testatorAddress = user.address;
    if (Object.keys(profileUpdate).length > 0) {
      setWill((prev) => ({ ...prev, ...profileUpdate }));
      toast.success("회원 정보를 자동으로 불러왔습니다", { duration: 3000 });
    }
    setProfileLoaded(true);
  }, [user, profileLoaded]);

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
    // Step9 → Step10 전환 시 페이월 게이트 표시
    if (step === 9) {
      setShowPaywall(true);
      return;
    }
    if (step < 10) setStep((s) => s + 1);
  };

  const prev = () => {
    if (step > 1) setStep((s) => s - 1);
    else onBack();
  };

  // 페이월 확인 → Step10으로 이동
  const handlePaywallConfirm = () => {
    setShowPaywall(false);
    setStep(10);
  };

  // 임시 저장 (72시간 유효)
  const handleSaveDraft = () => {
    const expiry = Date.now() + 72 * 60 * 60 * 1000; // 72시간
    const saved = { ...will, isDraft: true, lastSaved: new Date().toISOString(), expiry };
    localStorage.setItem("saram_will_draft", JSON.stringify(saved));
    toast.success("임시 저장 완료 (72시간 보관)");
  };

  const stepProps = { will, update, onNext: next, onPrev: prev };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* ── 페이월 모달 ── */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* 상단 네이비 배너 */}
              <div className="bg-gradient-to-r from-[#1F3864] to-[#2d4f8a] px-6 py-5 text-center">
                <div className="w-14 h-14 bg-[#C9A961]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7 text-[#C9A961]" />
                </div>
                <h3 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                  유언장 완성까지 한 단계!
                </h3>
                <p className="text-blue-200 text-sm mt-1">전자 인증으로 법적 효력을 부여하세요</p>
              </div>

              {/* 본문 */}
              <div className="px-6 py-5">
                {/* 무료 vs 유료 비교 */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <p className="text-xs text-gray-400 font-medium mb-2">✅ 무료 완료</p>
                    <ul className="space-y-1">
                      {["AI 유언장 작성", "상속자 등록", "자산 분배 설계", "미리보기 확인"].map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-[#1F3864]/5 rounded-xl p-3 border border-[#C9A961]/30">
                    <p className="text-xs text-[#C9A961] font-medium mb-2">🔐 인증 후 활성화</p>
                    <ul className="space-y-1">
                      {["전자 서명 + 본인인증", "법적 효력 부여", "블록체인 기록", "상속자 자동 알림"].map((item) => (
                        <li key={item} className="flex items-center gap-1.5 text-xs text-[#1F3864]">
                          <Lock className="w-3 h-3 text-[#C9A961] flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 가격 */}
                <div className="bg-gradient-to-r from-[#C9A961]/10 to-[#C9A961]/5 rounded-xl p-4 mb-4 text-center border border-[#C9A961]/20">
                  <p className="text-gray-500 text-xs mb-1">전자 인증 1회</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-[#1F3864]">₩49,000</span>
                    <span className="text-gray-400 text-sm">/ $39</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">수정 시 재인증 ₩15,000 · 평생 보관</p>
                </div>

                {/* 혜택 아이콘 */}
                <div className="flex justify-around mb-5">
                  {[
                    { icon: Shield, label: "법적 효력", sub: "민법 준수" },
                    { icon: Sparkles, label: "AI 검증", sub: "오류 0건" },
                    { icon: Clock, label: "평생 보관", sub: "안전 저장" },
                  ].map(({ icon: Icon, label, sub }) => (
                    <div key={label} className="text-center">
                      <div className="w-9 h-9 bg-[#1F3864]/10 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Icon className="w-4 h-4 text-[#1F3864]" />
                      </div>
                      <p className="text-xs font-semibold text-[#1F3864]">{label}</p>
                      <p className="text-xs text-gray-400">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* 버튼 */}
                <button
                  onClick={handlePaywallConfirm}
                  className="w-full bg-gradient-to-r from-[#C9A961] to-[#a88840] text-white font-bold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg"
                >
                  전자 인증하고 완성하기 →
                </button>
                <button
                  onClick={() => {
                    handleSaveDraft();
                    setShowPaywall(false);
                  }}
                  className="w-full text-gray-400 text-xs py-2 mt-2 hover:text-gray-600 transition-colors"
                >
                  나중에 하기 (72시간 임시 저장됨)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <Lock className="w-4 h-4" />
              서명 및 인증하기
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

      {/* Step9 하단 안내 배너 */}
      {step === 9 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700">전자 인증 후 법적 효력이 부여됩니다</p>
            <p className="text-xs text-amber-600 mt-0.5">
              작성하신 유언장은 72시간 임시 저장됩니다. 전자 인증(₩49,000)을 완료하면 법적 효력과 함께 평생 보관됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
