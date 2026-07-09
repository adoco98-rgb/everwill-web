import { Video, PenLine, Check, Info, Scale, Star, Zap } from "lucide-react";
import type { StepProps } from "./StepProps";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Step8Addons({ will, update }: StepProps) {
  const { t, language } = useLanguage();
  const isKo = language === "ko";
  const s = t.services;

  // 현재 선택된 플랜 계산
  const isPremiumPlan = will.hasVideoWill && will.hasHandwrittenScan;
  const totalPrice = 168000 + (will.hasVideoWill ? 29000 : 0) + (will.hasHandwrittenScan ? 19000 : 0);

  return (
    <div className="space-y-5">
      {/* 안내 배너 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-800 text-sm font-semibold mb-1">
            {isKo ? "기본 가입만으로도 민법 유언 요건을 충족합니다" : "Basic certification is legally valid"}
          </p>
          <p className="text-blue-700 text-xs leading-relaxed">
            {isKo
              ? "에버윌 기본 가입 + eKYC 전자 인증만으로 민법 유언 요건에 맞는 유언장이 완성됩니다. 아래 추가 인증 서비스는 더 높은 수준의 인증 확실성을 원하시는 분들을 위한 선택적 옵션입니다."
              : "EverWill basic membership + eKYC electronic certification alone creates a legally valid will."}
          </p>
        </div>
      </div>

      {/* ── 플랜 선택 카드 ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 기본 플랜 */}
        <div
          onClick={() => update({ hasVideoWill: false, hasHandwrittenScan: false })}
          className={`cursor-pointer rounded-2xl border-2 p-5 transition-all relative ${
            !will.hasVideoWill && !will.hasHandwrittenScan
              ? "border-[#1F3864] bg-[#1F3864]/4 shadow-md"
              : "border-gray-200 bg-white hover:border-[#1F3864]/30"
          }`}
        >
          {(!will.hasVideoWill && !will.hasHandwrittenScan) && (
            <span className="absolute -top-2.5 left-4 bg-[#1F3864] text-white text-xs font-bold px-3 py-0.5 rounded-full">
              선택됨
            </span>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-bold text-[#1F3864] text-sm">{isKo ? "전자 인증 기본" : "Basic Certification"}</p>
              <p className="text-xs text-gray-400">{isKo ? "전자 인증만" : "e-Certification only"}</p>
            </div>
          </div>
          <div className="text-sm font-bold text-[#1F3864] mb-3">
            {isKo ? "결제 페이지에서 확인" : "See pricing page"}
          </div>
          <ul className="space-y-1.5">
            {(isKo
              ? ["유언장 전자 인증", "블록체인 해시 기록", "인증서 발급"]
              : ["Electronic certification", "Blockchain hash record", "Certificate issuance"]
            ).map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="w-3 h-3 text-gray-400 flex-shrink-0" />{f}
              </li>
            ))}
          </ul>
          <div className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold text-center transition-all ${
            !will.hasVideoWill && !will.hasHandwrittenScan
              ? "bg-[#1F3864] text-white"
              : "bg-gray-100 text-gray-500"
          }`}>
            {!will.hasVideoWill && !will.hasHandwrittenScan ? "✓ 선택됨" : "선택하기"}
          </div>
        </div>

        {/* 프리미엄 플랜 */}
        <div
          onClick={() => update({ hasVideoWill: true, hasHandwrittenScan: true })}
          className={`cursor-pointer rounded-2xl border-2 p-5 transition-all relative ${
            isPremiumPlan
              ? "border-[#C9A961] bg-[#C9A961]/5 shadow-md"
              : "border-gray-200 bg-white hover:border-[#C9A961]/30"
          }`}
        >
          <span className="absolute -top-2.5 left-4 bg-[#C9A961] text-white text-xs font-bold px-3 py-0.5 rounded-full">
            {isKo ? "추천 · 묶음 할인" : "Recommended · Bundle"}
          </span>
          {isPremiumPlan && (
            <span className="absolute -top-2.5 right-4 bg-green-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
              선택됨
            </span>
          )}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-[#1F3864] text-sm">{isKo ? "전자 인증 프리미엄" : "Premium Certification"}</p>
              <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-400">{isKo ? "영상 + 자필 모두 포함" : "Video + Handwritten included"}</p>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full">{isKo ? "준비 중" : "Soon"}</span>
          </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-[#C9A961]">
              {isKo ? "₩69,000" : "$59"}
            </span>
            <span className="text-sm text-gray-400 line-through">
              {isKo ? "₩97,000" : "$87"}
            </span>
          </div>
          <p className="text-xs text-green-600 font-semibold mb-3">
            {isKo ? "영상 + 자필 묶음 할인 적용" : "Bundle discount applied"}
          </p>
          <ul className="space-y-1.5">
            {(isKo
              ? ["유언장 전자 인증", "블록체인 해시 기록", "인증서 발급", "영상 유언장 (법적 녹음)", "자필 유언장 스캔 인증"]
              : ["Electronic certification", "Blockchain hash record", "Certificate issuance", "Video Will (legal recording)", "Handwritten Will scan"]
            ).map((f, i) => (
              <li key={f} className={`flex items-center gap-2 text-xs ${i >= 3 ? "text-[#C9A961] font-semibold" : "text-gray-500"}`}>
                <Check className={`w-3 h-3 flex-shrink-0 ${i >= 3 ? "text-[#C9A961]" : "text-gray-400"}`} />{f}
                {i >= 3 && <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">포함</span>}
              </li>
            ))}
          </ul>
          <div className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold text-center transition-all ${
            isPremiumPlan
              ? "bg-[#C9A961] text-white"
              : "bg-amber-50 text-[#C9A961] border border-[#C9A961]/30"
          }`}>
            {isPremiumPlan ? "✓ 선택됨" : "선택하기"}
          </div>
        </div>
      </div>

      {/* 개별 선택 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-semibold">또는 개별 선택</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 영상 유언장 (개별) - 준비 중 */}
      <div
        className="cursor-not-allowed rounded-2xl border-2 p-5 transition-all opacity-60 border-gray-200 bg-gray-50 relative"
      >
        <span className="absolute -top-2.5 left-4 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
          {isKo ? "준비 중" : "Coming Soon"}
        </span>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1F3864]">{isKo ? "영상 유언장" : "Video Will"}</h4>
              <p className="text-gray-400 text-sm">{isKo ? "법적 녹음 유언 + 가족 감성 메시지" : "Legal recorded will + family messages"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              will.hasVideoWill ? "bg-[#1F3864] border-[#1F3864]" : "border-gray-300"
            }`}>
              {will.hasVideoWill && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 ml-16">
          {(isKo
            ? ["AI 낭독 스크립트 자동 생성", "녹화 중 실시간 가이드", "분산 암호화 기록", '"손녀 성인 되는 날" 등 공개 타이밍 설정', "평생 보관"]
            : [s.s8Detail1, s.s8Detail2, s.s8Detail3, s.s8Detail5, s.s8Detail6]
          ).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
      </div>

      {/* 자필 유언장 스캔 (개별) */}
      <div
        onClick={() => update({ hasHandwrittenScan: !will.hasHandwrittenScan })}
        className={`cursor-pointer rounded-2xl border-2 p-5 transition-all ${
          will.hasHandwrittenScan
            ? "border-[#1F3864] bg-[#1F3864]/4"
            : "border-gray-200 bg-white hover:border-[#1F3864]/30"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <PenLine className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#1F3864]">{isKo ? "자필 유언장 스캔 인증" : "Handwritten Will Scan"}</h4>
              <p className="text-gray-400 text-sm">{isKo ? "자필 원본 업로드 + AI 형식 검증" : "Upload photo → AI format validation"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              will.hasHandwrittenScan ? "bg-[#1F3864] border-[#1F3864]" : "border-gray-300"
            }`}>
              {will.hasHandwrittenScan && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 ml-16">
          {(isKo
            ? ["자필 여부·날짜·서명·날인 자동 체크", "위조 탐지 알고리즘", "분산 암호화 무결성 기록", "원본 위치 추적"]
            : [s.s9Detail3, s.s9Detail4, s.s9Detail5, s.s9Detail6]
          ).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-500">
              <Check className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />{f}
            </li>
          ))}
        </ul>
      </div>

      {/* 합계 */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${
        isPremiumPlan ? "bg-[#C9A961]" : "bg-[#1F3864]"
      }`}>
        <div>
          <span className="text-white/80 text-sm">
            {isKo ? "전자 인증" : "Certification"}
            {will.hasVideoWill && (isKo ? " + 영상 유언" : " + Video Will")}
            {will.hasHandwrittenScan && (isKo ? " + 자필 스캔" : " + Handwritten Scan")}
          </span>
          {isPremiumPlan && (
            <p className="text-white/70 text-xs mt-0.5">
              {isKo ? "프리미엄 묶음 할인 적용" : "Bundle discount applied"}
            </p>
          )}
        </div>
        <div className="text-right">
          {isPremiumPlan && (
            <p className="text-white/60 text-xs line-through">₩97,000</p>
          )}
          <span className="text-white font-bold text-lg">
            {isKo
              ? `₩${(isPremiumPlan ? 69000 : totalPrice).toLocaleString()}`
              : `$${isPremiumPlan ? 59 : (39 + (will.hasVideoWill ? 29 : 0) + (will.hasHandwrittenScan ? 19 : 0))}`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
