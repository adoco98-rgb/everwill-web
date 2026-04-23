/**
 * 상속인 서비스 섹션
 * 상속인 전용 가입 절차 + 수수료 계산기
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  UserCheck,
  FileText,
  Scale,
  CheckCircle,
  Calculator,
  ArrowRight,
  Shield,
  Clock,
  Globe,
} from "lucide-react";

export default function HeirServiceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { language } = useLanguage();
  const isKo = language === "ko";

  const [assetAmount, setAssetAmount] = useState<string>("");
  const [fee, setFee] = useState<number | null>(null);

  /* ── 수수료 계산 ── */
  const BASE_FEE = 199000;
  const BASE_LIMIT = 200000000; // 2억
  const RATE = 0.001; // 0.1%

  function calculateFee(input: string) {
    const raw = input.replace(/[^0-9]/g, "");
    const amount = parseInt(raw, 10);
    if (isNaN(amount) || amount <= 0) {
      setFee(null);
      return;
    }
    if (amount <= BASE_LIMIT) {
      setFee(BASE_FEE);
    } else {
      const extra = (amount - BASE_LIMIT) * RATE;
      setFee(BASE_FEE + extra);
    }
  }

  function formatKRW(n: number) {
    return "₩" + Math.round(n).toLocaleString("ko-KR");
  }

  function formatInput(val: string) {
    const raw = val.replace(/[^0-9]/g, "");
    if (!raw) return "";
    return parseInt(raw, 10).toLocaleString("ko-KR");
  }

  /* ── 가입 절차 ── */
  const steps = isKo
    ? [
        {
          icon: UserCheck,
          title: "상속인으로 가입",
          desc: "유언자의 사망 후 상속인 코드(Badge QR 또는 유언 번호)로 전용 가입 절차를 진행합니다.",
        },
        {
          icon: FileText,
          title: "유언 내용 확인",
          desc: "유언자가 남긴 유언장 전문을 열람하고, 상속 지분 및 특별 지시 사항을 확인합니다.",
        },
        {
          icon: Scale,
          title: "법적 서류 자동 생성",
          desc: "상속 신고서, 재산 이전 신청서 등 필요한 법적 양식을 AI가 자동으로 작성해 드립니다.",
        },
        {
          icon: CheckCircle,
          title: "제출 및 완료",
          desc: "작성된 서류를 관할 기관(법원·은행·등기소 등)에 직접 제출하거나 온라인으로 신청합니다.",
        },
      ]
    : [
        {
          icon: UserCheck,
          title: "Register as Heir",
          desc: "After the testator's passing, register using the heir code (Badge QR or will number) through a dedicated sign-up process.",
        },
        {
          icon: FileText,
          title: "Review the Will",
          desc: "Access the full will document and review inheritance shares and special instructions left by the testator.",
        },
        {
          icon: Scale,
          title: "Auto-Generate Legal Documents",
          desc: "AI automatically prepares required legal forms including inheritance declarations and asset transfer applications.",
        },
        {
          icon: CheckCircle,
          title: "Submit & Complete",
          desc: "Submit the prepared documents to relevant authorities (courts, banks, registry offices) directly or online.",
        },
      ];

  /* ── 서비스 특징 ── */
  const features = isKo
    ? [
        { icon: Shield, text: "법적 효력 있는 서류 자동 작성" },
        { icon: Clock, text: "72시간 이내 서류 완성" },
        { icon: Globe, text: "7개국 법률 자동 적용" },
      ]
    : [
        { icon: Shield, text: "Legally valid documents auto-generated" },
        { icon: Clock, text: "Documents completed within 72 hours" },
        { icon: Globe, text: "Laws of 7 countries auto-applied" },
      ];

  return (
    <section id="heir-service" className="py-20 lg:py-28 bg-[#F5F3EE]" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="section-divider mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 bg-[#1F3864]/10 border border-[#1F3864]/20 rounded-full px-4 py-1.5 mb-4">
            <UserCheck className="w-4 h-4 text-[#1F3864]" />
            <span className="text-[#1F3864] text-sm font-bold">
              {isKo ? "상속인 전용 서비스" : "Heir-Only Service"}
            </span>
          </div>
          <h2
            className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {isKo ? "상속인을 위한 특별한 서비스" : "A Special Service for Heirs"}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {isKo
              ? "유언자의 뜻을 이어받아 상속 절차를 스스로 진행할 수 있도록 법적 서류 작성부터 제출까지 도와드립니다."
              : "We help heirs carry out the inheritance process independently — from legal document preparation to submission."}
          </p>
        </motion.div>

        {/* ── 2단 레이아웃: 가입 절차 + 수수료 계산기 ── */}
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">

          {/* 왼쪽: 가입 절차 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col"
          >
            <h3 className="text-xl font-bold text-[#1F3864] mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[#C9A961]" />
              {isKo ? "상속인 가입 절차" : "Heir Registration Process"}
            </h3>
            <div className="space-y-4 flex-1">
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="flex gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1F3864]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#1F3864]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#C9A961] bg-[#C9A961]/10 rounded-full px-2 py-0.5">
                          STEP {i + 1}
                        </span>
                        <span className="font-bold text-[#1F3864] text-sm">{step.title}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 특징 뱃지 */}
            <div className="flex flex-wrap gap-3 mt-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-white border border-[#C9A961]/30 rounded-full px-4 py-2 text-sm font-semibold text-[#1F3864]"
                  >
                    <Icon className="w-4 h-4 text-[#C9A961]" />
                    {f.text}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* 오른쪽: 수수료 계산기 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#C9A961]/15 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#C9A961]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1F3864] text-lg">
                  {isKo ? "서비스 수수료 계산기" : "Service Fee Calculator"}
                </h3>
                <p className="text-gray-500 text-xs">
                  {isKo ? "상속 자산 규모에 따라 자동 계산" : "Auto-calculated by estate size"}
                </p>
              </div>
            </div>

            {/* 수수료 구조 안내 */}
            <div className="bg-[#F5F3EE] rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">
                  {isKo ? "2억원 이하" : "Up to ₩200M"}
                </span>
                <span className="font-bold text-[#1F3864]">₩199,000</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">
                  {isKo ? "2억원 초과분" : "Amount over ₩200M"}
                </span>
                <span className="font-bold text-[#1F3864]">
                  {isKo ? "₩199,000 + 초과분 × 0.1%" : "₩199,000 + excess × 0.1%"}
                </span>
              </div>
            </div>

            {/* 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1F3864] mb-2">
                {isKo ? "상속 자산 총액 (원)" : "Total Estate Value (KRW)"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₩</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={isKo ? "예: 500,000,000" : "e.g. 500,000,000"}
                  value={assetAmount}
                  onChange={(e) => {
                    const formatted = formatInput(e.target.value);
                    setAssetAmount(formatted);
                    calculateFee(e.target.value);
                  }}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-[#1F3864] font-semibold focus:border-[#C9A961] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 결과 */}
            {fee !== null ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] rounded-2xl p-5 text-white"
              >
                <div className="text-sm font-medium text-white/70 mb-1">
                  {isKo ? "예상 서비스 수수료" : "Estimated Service Fee"}
                </div>
                <div className="text-3xl font-extrabold mb-2">{formatKRW(fee)}</div>
                {fee > BASE_FEE && (
                  <div className="text-xs text-white/60">
                    {isKo
                      ? `기본 ₩199,000 + 초과분 ${formatKRW(fee - BASE_FEE)}`
                      : `Base ₩199,000 + excess ${formatKRW(fee - BASE_FEE)}`}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/60">
                  {isKo
                    ? "* 실제 수수료는 자산 구성에 따라 달라질 수 있습니다."
                    : "* Actual fee may vary depending on asset composition."}
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
                {isKo
                  ? "자산 금액을 입력하면 수수료가 자동 계산됩니다"
                  : "Enter asset amount to auto-calculate the fee"}
              </div>
            )}

            {/* CTA */}
            <div className="flex-1" />
            <button
              onClick={() => {
                const el = document.getElementById("heir-register");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else alert(isKo ? "서비스 준비 중입니다. 곧 오픈합니다!" : "Coming soon!");
              }}
              className="mt-5 w-full py-3 rounded-xl bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {isKo ? "상속인으로 가입하기" : "Register as Heir"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* ── 하단 안내 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-2xl px-6 py-4 text-center"
        >
          <p className="text-gray-600 text-sm leading-relaxed">
            {isKo
              ? "상속인 서비스는 유언자 사망 확인 후 활성화됩니다. 유언자가 EverWill 회원인 경우에만 이용 가능합니다."
              : "Heir services are activated after the testator's death is confirmed. Available only when the testator is an EverWill member."}
          </p>
        </motion.div>

      </div>
    </section>
  );
}
