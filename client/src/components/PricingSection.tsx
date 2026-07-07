/**
 * EverWill 가격 섹션 - 단일 박스 통합 가격 (₩168,000)
 * 모든 기능을 하나의 박스에 표시
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Check,
  Zap,
  ChevronRight,
  FileCheck,
  Video,
  Users,
  RefreshCw,
  Award,
  Lock,
  Clock,
  Globe,
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

  /* 포함 기능 목록 */
  const includedFeatures = [
    { icon: FileCheck, label: "eKYC 본인인증 + 전자서명" },
    { icon: Lock, label: "블록체인 해시 + RFC 3161 타임스탬프" },
    { icon: Clock, label: "유언장 영구 보관" },
    { icon: RefreshCw, label: "수정 10회 무료" },
    { icon: Shield, label: "NFC 인증 카드 발급" },
    { icon: Globe, label: "QR 신원 인증 + 사망 트리거" },
    { icon: Video, label: "영상 유언 녹화 지원" },
    { icon: Award, label: "사후 집행 지원 (상속자 자동 알림)" },
  ];

  /* 추가 옵션 */
  const addOns = [
    { label: "인증서 발급", price: "₩5,000", desc: "PDF/출력용 공식 인증서" },
    { label: "증인 선정", price: "+₩39,000", desc: "헬퍼 증인 2명 화상 확인 (옵션)" },
    { label: "수정 (11회~)", price: "₩15,000/회", desc: "11회째 수정부터 유료" },
  ];

  return (
    <section id="pricing" className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#C9A961]/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#C9A961]/8 blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

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
              ? "복잡한 요금제 없이, 한 번의 결제로 모든 핵심 기능을 이용하세요."
              : "No complicated plans. One payment covers all core features."}
          </p>
        </motion.div>

        {/* ── 메인 가격 박스 ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative rounded-3xl border border-[#C9A961]/40 bg-gradient-to-br from-[#1a2f5a] to-[#0d1f3c] p-8 lg:p-10 shadow-2xl"
        >
          {/* 출시 특가 배지 */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-[#C9A961] text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-lg">
              {isKo ? "2026 출시 기념 특가" : "2026 Launch Special"}
            </span>
          </div>

          {/* 상단: 가격 + 설명 */}
          <div className="text-center mb-8 pt-4">
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-5xl lg:text-6xl font-bold text-[#C9A961]">
                {isKo ? "₩168,000" : "$79"}
              </span>
              <span className="text-white/50 text-lg">
                {isKo ? "/ 1회" : "/ once"}
              </span>
            </div>
            <p className="text-white/60 text-sm">
              {isKo ? "유언장 작성은 무료 · 인증 시에만 결제" : "Will writing is free · Pay only for certification"}
            </p>
          </div>

          {/* 구분선 */}
          <div className="border-t border-white/10 mb-8" />

          {/* 포함 기능 그리드 */}
          <div className="mb-8">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 text-center">
              {isKo ? "₩168,000에 포함된 기능" : "Included Features"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {includedFeatures.map((feat, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A961]/20 flex items-center justify-center flex-shrink-0">
                    <feat.icon className="w-4 h-4 text-[#C9A961]" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>


          {/* CTA 버튼 */}
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#C9A961] to-[#a07c3a] text-white hover:opacity-90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isKo ? "무료로 유언장 작성 시작하기" : "Start Writing Your Will for Free"}
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 하단 안내 */}
          <p className="text-white/40 text-xs text-center mt-4">
            {isKo
              ? "신용카드 불필요 · 작성 완료 후 인증 시에만 결제 · 언제든 수정 가능"
              : "No credit card required · Pay only when certifying · Modify anytime"}
          </p>
        </motion.div>

        {/* ── 무료 기능 체크리스트 ── */}
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
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-white/60 text-sm">{item}</span>
            </div>
          ))}
        </motion.div>

        {/* 하단 비교 문구 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-8"
        >
          <p className="text-white/50 text-sm">
            {isKo
              ? "기존 공증 비용 30~300만원 대비 최대 97% 절감"
              : "Save up to 97% compared to traditional notarization costs"}
          </p>
          <p className="text-white/30 text-xs mt-2">
            {t.pricing?.note || (isKo ? "부가세 별도. 해외 결제 시 환율 적용." : "VAT excluded. Exchange rates apply for international payments.")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
