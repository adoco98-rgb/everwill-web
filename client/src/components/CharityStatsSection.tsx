/**
 * EverWill 사회기부 섹션 - 노인복지 전용
 * "세계의 모든 빈곤노인들과 독거노인, 어렵고 힘든 상황에 놓인 노인분들께
 *  사랑과 희망을 드립니다. 에버윌이 함께 합니다."
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ChevronRight, Check, HandHeart, Home, Stethoscope, Briefcase, Music } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const BANNER_IMG = "/manus-storage/elderly-welfare-2_8647a9e2.webp";
const CARE_IMG = "/manus-storage/elderly-welfare-1_fb890531.jpg";

// ─── 노인복지 5개 분야 ────────────────────────────────────────────
const ELDERLY_CAUSES = [
  { id: "poverty", emoji: "🤝", icon: HandHeart, label: "빈곤 해결", desc: "기초생활 지원, 식사 배달, 난방비 지원" },
  { id: "business", emoji: "💼", icon: Briefcase, label: "사업 지원", desc: "노인 일자리 창출, 창업 지원, 직업 훈련" },
  { id: "care", emoji: "🏠", icon: Home, label: "돌봄 서비스", desc: "독거노인 방문 돌봄, 생활 도우미, 안부 확인" },
  { id: "medical", emoji: "🏥", icon: Stethoscope, label: "의료·건강", desc: "의료비 지원, 건강검진, 재활 치료" },
  { id: "culture", emoji: "🎵", icon: Music, label: "문화·여가", desc: "여가 프로그램, 여행 지원, 평생교육" },
];

// ─── 통화 매핑 ────────────────────────────────────────────────────
const QUICK_AMOUNTS_KRW = [
  { label: "₩10,000", value: "10000" },
  { label: "₩30,000", value: "30000" },
  { label: "₩50,000", value: "50000" },
  { label: "₩100,000", value: "100000" },
];

export default function CharityStatsSection() {
  const { language } = useLanguage();

  // ── 기부 폼 상태 ──
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [amount, setAmount] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [donationType, setDonationType] = useState<"now" | "posthumous">("posthumous");

  const toggleCause = (id: string) => {
    setSelectedCauses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setAmount(raw);
    setDisplayAmount(raw ? Number(raw).toLocaleString() : "");
  };

  const handleQuickAmount = (val: string) => {
    setAmount(val);
    setDisplayAmount(Number(val).toLocaleString());
  };

  const handleDonate = () => {
    if (selectedCauses.length === 0) {
      toast.error("기부 분야를 하나 이상 선택해주세요.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("기부 금액을 입력해주세요.");
      return;
    }
    if (donationType === "now") {
      toast.info("즉시 결제 기능은 곧 오픈됩니다!");
    } else {
      toast.success("사후 기부 의사가 유언에 기록됩니다.");
    }
  };

  return (
    <section className="bg-gradient-to-b from-[#0d1f3c] to-[#1F3864] text-white relative overflow-hidden">

      {/* ── 히어로 배너 ── */}
      <div className="relative w-full h-[360px] md:h-[460px] overflow-hidden">
        <img
          src={BANNER_IMG}
          alt="노인복지 지원"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c]/30 via-transparent to-[#0d1f3c]/90" />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/30 border border-[#C9A961]/50 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-semibold">노인복지 기부</span>
            </div>
            <h2
              className="text-2xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              나의 마지막 선물,<br />노인분들께 사랑과 희망을
            </h2>
          </motion.div>
        </div>
      </div>

      {/* ── 핵심 메시지 ── */}
      <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src={CARE_IMG}
              alt="노인 돌봄"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C9A961]/50 shadow-lg"
            />
          </div>
          <blockquote className="text-lg md:text-2xl font-semibold text-white/90 leading-relaxed mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            "세계의 모든 빈곤노인들과 독거노인,<br className="hidden md:block" />
            어렵고 힘든 상황에 놓인 노인분들께<br className="hidden md:block" />
            사랑과 희망을 드립니다."
          </blockquote>
          <p className="text-[#C9A961] text-base font-bold">
            에버윌이 함께 합니다.
          </p>
        </motion.div>
      </div>

      {/* ── 노인 빈곤 현실 안내 ── */}
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-[#C9A961] mb-1">40.4%</p>
              <p className="text-white/60 text-xs">한국 노인 상대적 빈곤율<br />(OECD 1위)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#C9A961] mb-1">190만</p>
              <p className="text-white/60 text-xs">독거노인 수<br />(2025년 기준)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#C9A961] mb-1">매일 36명</p>
              <p className="text-white/60 text-xs">노인 고독사 발생<br />(연간 13,000명 이상)</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── 기부 폼 ── */}
      <div className="relative max-w-4xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="bg-white/8 border border-white/15 rounded-3xl p-6 md:p-10"
        >
          {/* Step 1: 노인복지 분야 선택 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-1">
              ① 기부 분야를 선택하세요
            </h3>
            <p className="text-white/50 text-sm mb-5">
              노인복지를 위한 분야를 선택해주세요. 여러 분야 동시 선택 가능합니다.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ELDERLY_CAUSES.map((cause) => {
                const selected = selectedCauses.includes(cause.id);
                const Icon = cause.icon;
                return (
                  <button
                    key={cause.id}
                    onClick={() => toggleCause(cause.id)}
                    className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      selected
                        ? "bg-[#C9A961]/25 border-[#C9A961] text-[#C9A961] shadow-lg scale-105"
                        : "bg-white/5 border-white/15 text-white/70 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    {selected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#C9A961] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <Icon className={`w-6 h-6 ${selected ? "text-[#C9A961]" : "text-white/60"}`} />
                    <span className="text-center leading-tight font-bold">{cause.label}</span>
                    <span className="text-[10px] text-white/40 text-center leading-tight hidden sm:block">{cause.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: 금액 입력 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-1">
              ② 기부 금액을 입력하세요
            </h3>
            <p className="text-white/50 text-sm mb-4">
              직접 입력하거나 빠른 선택 버튼을 클릭하세요.
            </p>
            {/* 빠른 선택 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_AMOUNTS_KRW.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleQuickAmount(item.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    amount === item.value
                      ? "bg-[#C9A961] border-[#C9A961] text-[#1F3864]"
                      : "bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {/* 직접 입력 */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9A961] font-bold text-xl select-none pointer-events-none">
                ₩
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="금액 직접 입력"
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-12 py-3.5 text-white placeholder-white/30 text-lg font-semibold focus:outline-none focus:border-[#C9A961] transition-colors"
              />
              {displayAmount && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">
                  원
                </span>
              )}
            </div>
          </div>

          {/* Step 3: 즉시 결제 / 사후 기부 선택 */}
          <div className="mb-8">
            <h3 className="text-white font-bold text-lg mb-4">
              ③ 기부 방식을 선택하세요
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 즉시 결제 */}
              <button
                onClick={() => setDonationType("now")}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                  donationType === "now"
                    ? "border-[#C9A961] bg-[#C9A961]/15"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${donationType === "now" ? "bg-[#C9A961]" : "bg-white/10"}`}>
                  <span className="text-lg">💳</span>
                </div>
                <div>
                  <p className={`font-bold text-base mb-1 ${donationType === "now" ? "text-[#C9A961]" : "text-white"}`}>
                    지금 기부하기
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    지금 바로 기부합니다. 즉시 영수증 발급 및 세금 공제 혜택.
                  </p>
                </div>
              </button>

              {/* 사후 기부 */}
              <button
                onClick={() => setDonationType("posthumous")}
                className={`flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all ${
                  donationType === "posthumous"
                    ? "border-[#C9A961] bg-[#C9A961]/15"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${donationType === "posthumous" ? "bg-[#C9A961]" : "bg-white/10"}`}>
                  <span className="text-lg">📜</span>
                </div>
                <div>
                  <p className={`font-bold text-base mb-1 ${donationType === "posthumous" ? "text-[#C9A961]" : "text-white"}`}>
                    유언에 기부 기록하기
                  </p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    유언장에 기부 의사를 기록합니다. 사망 후 에버윌이 투명하게 전달합니다.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 선택 요약 + 기부 버튼 */}
          {(selectedCauses.length > 0 || amount) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6"
            >
              <p className="text-white/60 text-xs mb-2">선택 요약</p>
              {selectedCauses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedCauses.map((id) => {
                    const cause = ELDERLY_CAUSES.find((c) => c.id === id);
                    return (
                      <span key={id} className="bg-[#C9A961]/20 text-[#C9A961] text-xs px-2 py-0.5 rounded-full font-medium">
                        {cause?.emoji} {cause?.label}
                      </span>
                    );
                  })}
                </div>
              )}
              {amount && (
                <p className="text-white font-bold text-sm">
                  ₩{Number(amount).toLocaleString()}원
                  {" · "}
                  <span className="text-[#C9A961]">
                    {donationType === "now" ? "즉시 결제" : "사후 기부"}
                  </span>
                </p>
              )}
            </motion.div>
          )}

          <button
            onClick={handleDonate}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#C9A961] to-[#a88840] text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            <Heart className="w-5 h-5" />
            {donationType === "now" ? "지금 기부하기" : "유언에 기부 의사 기록하기"}
            <ChevronRight className="w-4 h-4" />
          </button>

          <p className="text-center text-white/30 text-xs mt-4">
            🔒 에버윌이 검증한 노인복지 단체를 선정하여 투명하게 전달합니다.
          </p>
        </motion.div>

        {/* ── 하단 안내 ── */}
        <div className="mt-8 text-center">
          <p className="text-white/40 text-xs leading-relaxed">
            * 기부 유언은 유언자 사망 확인 후 EverWill이 선정한 노인복지 단체에 전달됩니다.<br />
            * 기부 금액은 상속 자산에서 우선 공제 후 집행됩니다.<br />
            * 집행 결과는 유족에게 투명하게 보고됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}
