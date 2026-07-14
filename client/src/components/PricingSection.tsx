/**
 * EverWill 가격 섹션 - 베이직(₩79,000) + 올인원(₩168,000) 2개 플랜
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Check,
  X,
  ChevronRight,
  FileCheck,
  Video,
  Users,
  RefreshCw,
  Award,
  Lock,
  Clock,
  Globe,
  Star,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language } = useLanguage();
  const isKo = language === "ko";
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate("/write");
    } else {
      navigate("/login?returnTo=/write");
    }
  };

  /* 베이직 플랜 포함 기능 */
  const basicFeatures = [
    { label: "AI 유언장 작성 (무제한)", included: true },
    { label: "eKYC 본인인증 + 전자서명", included: true },
    { label: "블록체인 해시 기록", included: true },
    { label: "상속인 등록 · 자산 등록", included: true },
    { label: "유언장 수정 3회", included: true },
    { label: "인증서 발급 3회", included: true },
    { label: "1년 보관 (이후 ₩15,000/년)", included: true },
    { label: "영상 유언장", included: false },
    { label: "자필 유언장 스캔 인증", included: false },
    { label: "AI 일기 (Life Story)", included: false },
    { label: "자서전 만들기", included: false },
  ];

  /* 올인원 플랜 포함 기능 */
  const allInOneFeatures = [
    { icon: FileCheck, label: "eKYC 본인인증 + 전자서명" },
    { icon: Lock, label: "블록체인 해시 + RFC 3161 타임스탬프" },
    { icon: Clock, label: "유언장 영구 보관 (평생)" },
    { icon: RefreshCw, label: "수정 10회 무료" },
    { icon: Shield, label: "NFC 인증 카드 발급" },
    { icon: Globe, label: "QR 신원 인증 + 사망 트리거" },
    { icon: Video, label: "영상 유언 녹화 지원" },
    { icon: Award, label: "사후 집행 지원 (상속자 자동 알림)" },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#C9A961]/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#C9A961]/8 blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-5">
            <Shield className="w-4 h-4 text-[#C9A961]" />
            <span className="text-sm text-[#C9A961] font-medium">
              {isKo ? "심플한 가격 정책" : "Simple Pricing"}
            </span>
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {isKo ? "전자 디지털 서명인증!! 당신의 뜻을 실천합니다" : "Digital e-Signature Authentication!! We Fulfill Your Will"}
          </h2>
          <p className="text-white/70 text-base lg:text-lg max-w-2xl mx-auto">
            {isKo
              ? "복잡한 요금제 없이, 나에게 맞는 플랜 하나만 선택하세요."
              : "No complicated plans. Choose the one that fits you."}
          </p>
        </motion.div>

        {/* ── 2개 플랜 카드 ── */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">

          {/* 베이직 플랜 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-3xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-8">
              <div className="mb-6">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest">베이직</span>
                <div className="flex items-baseline gap-2 mt-2 mb-1">
                  <span className="text-4xl font-bold text-white">₩79,000</span>
                  <span className="text-white/50 text-sm">/ 1회</span>
                </div>
                <p className="text-white/50 text-xs">1년 보관 · 이후 매년 ₩15,000</p>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-3 rounded-xl font-bold text-sm border border-white/30 text-white hover:bg-white/10 transition-all duration-200 mb-6"
              >
                베이직으로 시작하기
              </button>

              <div className="space-y-3">
                {basicFeatures.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {f.included ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-white/20 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${f.included ? "text-white/80" : "text-white/30 line-through"}`}>
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 올인원 플랜 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-3xl border border-[#C9A961]/40 bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c] overflow-hidden shadow-2xl"
          >
            {/* 추천 배지 - 박스 내부 상단 */}
            <div className="flex justify-center pt-5 pb-0">
              <span className="bg-[#C9A961] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                <Star className="w-3 h-3" />
                {isKo ? "추천 · 2026 출시 특가" : "Recommended"}
              </span>
            </div>

            <div className="p-8 pt-4">
              <div className="mb-6">
                <span className="text-xs font-bold text-[#C9A961]/70 uppercase tracking-widest">올인원</span>
                <div className="flex items-baseline gap-2 mt-2 mb-1">
                  <span className="text-4xl font-bold text-[#C9A961]">₩168,000</span>
                  <span className="text-white/50 text-sm">/ 1회</span>
                </div>
                <p className="text-white/50 text-xs">영구 보관 · 모든 기능 포함</p>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#C9A961] to-[#a07c3a] text-white hover:opacity-90 hover:shadow-lg transition-all duration-200 mb-6"
              >
                {isKo ? "무료로 유언장 작성 시작하기" : "Start Writing for Free"}
              </button>

              <div className="grid grid-cols-1 gap-3">
                {allInOneFeatures.map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                    <div className="w-7 h-7 rounded-full bg-[#C9A961]/20 flex items-center justify-center flex-shrink-0">
                      <feat.icon className="w-3.5 h-3.5 text-[#C9A961]" />
                    </div>
                    <span className="text-white/90 text-sm">{feat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 무료 기능 체크리스트 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2"
        >
          {(isKo
            ? ["AI 유언장 작성 (무료)", "상속자 등록 (무료)", "자산 분배 설계 (무료)", "미리보기 확인 (무료)"]
            : ["AI Will Writing (Free)", "Heir Registration (Free)", "Asset Distribution (Free)", "Preview & Review (Free)"]
          ).map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#C9A961]" />
              <span className="text-white/50 text-xs">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
