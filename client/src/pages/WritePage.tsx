/**
 * SARAM 유언장 작성 페이지 (/write)
 * 디자인: 네이비 + 골드, 깔끔한 스텝 UI
 * 모드: AI 가이드 (10단계 마법사) / 직접 작성 (법적 양식)
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bot, PenLine, Shield, Clock, CheckCircle2 } from "lucide-react";
import AIWizard from "@/components/write/AIWizard";
import DirectForm from "@/components/write/DirectForm";
import type { WillMode } from "@/lib/willTypes";

export default function WritePage() {
  const [mode, setMode] = useState<WillMode>(null);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 상단 네비 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 text-[#1F3864] hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">홈으로</span>
            </a>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#C9A961] to-[#a88840] flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="font-bold text-[#1F3864] text-sm">SARAM 유언장 작성</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>E2E 암호화</span>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {mode === null && (
          <motion.div
            key="mode-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <ModeSelect onSelect={setMode} />
          </motion.div>
        )}
        {mode === "ai" && (
          <motion.div
            key="ai-mode"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <AIWizard onBack={() => setMode(null)} />
          </motion.div>
        )}
        {mode === "direct" && (
          <motion.div
            key="direct-mode"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <DirectForm onBack={() => setMode(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 모드 선택 화면 ─── */
function ModeSelect({ onSelect }: { onSelect: (m: WillMode) => void }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* 헤더 */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-[#1F3864]/8 rounded-full px-4 py-1.5 mb-5">
          <Clock className="w-4 h-4 text-[#C9A961]" />
          <span className="text-[#1F3864] text-sm font-medium">단순 케이스 17분 · 복잡 케이스 30-45분</span>
        </div>
        <h1
          className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          유언장 작성 방식을
          <br />
          선택해 주세요
        </h1>
        <p className="text-gray-500 text-lg">
          어떤 방식을 선택하든 법적 효력은 동일합니다.
        </p>
      </div>

      {/* 모드 카드 */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* AI 가이드 모드 */}
        <motion.button
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(31,56,100,0.12)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("ai")}
          className="text-left bg-[#1F3864] rounded-2xl p-8 border-2 border-[#1F3864] group transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-6 text-3xl">
            🤖
          </div>
          <div className="inline-flex items-center gap-1.5 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-3 py-1 rounded-full mb-3">
            추천 · 초보자용
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">AI 도움받기</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            AI가 질문하고 답변만 하면 유언장이 자동 완성됩니다.
            법률 지식이 없어도 17분이면 충분합니다.
          </p>
          <ul className="space-y-2">
            {["10단계 체크박스 마법사", "AI 법률 문장 자동 변환", "유류분 실시간 검증", "상속세 자동 계산"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-2 text-[#C9A961] font-semibold text-sm group-hover:gap-3 transition-all">
            AI 가이드로 시작하기
            <span>→</span>
          </div>
        </motion.button>

        {/* 직접 작성 모드 */}
        <motion.button
          whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(201,169,97,0.15)" }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect("direct")}
          className="text-left bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-[#C9A961]/40 group transition-all"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1F3864]/8 flex items-center justify-center mb-6 text-3xl">
            ✍️
          </div>
          <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
            법률 전문가용
          </div>
          <h2 className="text-2xl font-bold text-[#1F3864] mb-2">직접 작성</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            한국 민법 순서에 맞는 법적 양식을 제공합니다.
            법률 지식이 있는 분이나 세밀하게 작성하고 싶은 분께 적합합니다.
          </p>
          <ul className="space-y-2">
            {["민법 제1065조 기준 양식", "7개 법적 섹션 구조", "실시간 법적 유효성 확인", "필수 항목 누락 경고"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-gray-500 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center gap-2 text-[#1F3864] font-semibold text-sm group-hover:gap-3 transition-all">
            직접 작성 시작하기
            <span>→</span>
          </div>
        </motion.button>
      </div>

      {/* 하단 안내 */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">⚖️</span>
        <div>
          <div className="font-semibold text-amber-800 text-sm mb-1">법적 고지</div>
          <p className="text-amber-700 text-xs leading-relaxed">
            SARAM은 법률 정보를 제공하는 플랫폼으로, 법률 자문 서비스가 아닙니다.
            AI가 생성한 유언장은 변호사의 법률 자문을 대체하지 않습니다.
            복잡한 법적 상황은 반드시 전문 변호사와 상담하시기 바랍니다.
            유언장의 법적 효력은 전자 인증(₩49,000) 완료 후 발생합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
