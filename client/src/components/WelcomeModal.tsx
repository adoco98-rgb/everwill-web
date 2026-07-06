/**
 * EverWill 환영 온보딩 모달
 * 신규 가입자에게 서비스 핵심 기능을 5단계 슬라이드로 안내
 */
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  X, FileText, Shield, Bell, CreditCard, ChevronRight, ChevronLeft, Sparkles
} from "lucide-react";

interface WelcomeModalProps {
  userName?: string;
  onClose: () => void;
}

const STEPS = [
  {
    icon: <Sparkles className="w-10 h-10 text-[#C9A961]" />,
    bg: "from-[#1F3864] to-[#243d72]",
    title: "EverWill에 오신 것을 환영합니다!",
    subtitle: "세계 최초 디지털 유언 OS",
    description: "유언 작성부터 사후 집행 지원까지, 전 과정을 책임집니다. 지금부터 5분이면 기본 설정을 완료할 수 있습니다.",
    tip: null,
  },
  {
    icon: <FileText className="w-10 h-10 text-[#C9A961]" />,
    bg: "from-[#1a3058] to-[#1F3864]",
    title: "AI 유언장 작성",
    subtitle: "체크박스 몇 번이면 완성",
    description: "빈 종이 앞에서 막막할 필요 없습니다. AI가 체크박스 선택 내용을 법률 문장으로 자동 변환합니다. 단순 케이스는 17분이면 완성됩니다.",
    tip: "💡 유언장 작성은 완전 무료입니다.",
  },
  {
    icon: <Shield className="w-10 h-10 text-[#C9A961]" />,
    bg: "from-[#243d72] to-[#1F3864]",
    title: "전자 인증 (₩168,000)",
    subtitle: "법규정에 맞는 유언장으로",
    description: "eKYC 본인확인 + 얼굴 인식 + 음성 의사 확인으로 법적 효력을 부여합니다. 분산 암호화 보안에 해시를 기록해 위변조가 불가능합니다.",
    tip: "💡 영구 보관이 포함됩니다.",
  },
  {
    icon: <Bell className="w-10 h-10 text-[#C9A961]" />,
    bg: "from-[#1F3864] to-[#1a3058]",
    title: "다층 안심 확인 서비스",
    subtitle: "가족이 신고하지 않아도 자동 감지",
    description: "가족 신고 → 정부 DB 연동 → 정기 안심 확인 서비스 → Badge 발견 신고. 4가지 방법으로 교차 검증 후 사후 집행 지원을 시작합니다.",
    tip: "💡 Badge를 등록하면 응급 시 의료 정보도 제공됩니다.",
  },
  {
    icon: <CreditCard className="w-10 h-10 text-[#C9A961]" />,
    bg: "from-[#243d72] to-[#1a3058]",
    title: "지금 바로 시작하세요",
    subtitle: "3단계로 완성",
    description: null,
    tip: null,
    steps: [
      { num: "01", text: "유언장 작성 (무료)" },
      { num: "02", text: "상속자 등록" },
      { num: "03", text: "전자 인증 (₩168,000)" },
    ],
  },
];

export default function WelcomeModal({ userName, onClose }: WelcomeModalProps) {
  const [current, setCurrent] = useState(0);
  const isLast = current === STEPS.length - 1;
  const step = STEPS[current];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl"
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* 슬라이드 콘텐츠 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className={`bg-gradient-to-br ${step.bg} p-8 pt-10 min-h-[420px] flex flex-col`}
            >
              {/* 아이콘 */}
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-5">
                {step.icon}
              </div>

              {/* 텍스트 */}
              <div className="flex-1">
                <p className="text-[#C9A961] text-xs font-semibold uppercase tracking-widest mb-2">
                  {step.subtitle}
                </p>
                <h2 className="text-white text-2xl font-bold leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {current === 0 && userName
                    ? <>{userName}님,<br />{step.title}</>
                    : step.title
                  }
                </h2>

                {step.description && (
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    {step.description}
                  </p>
                )}

                {/* 마지막 슬라이드 - 3단계 */}
                {step.steps && (
                  <div className="space-y-3 mb-4">
                    {step.steps.map((s) => (
                      <div key={s.num} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                        <span className="text-[#C9A961] font-bold text-lg w-8 shrink-0">{s.num}</span>
                        <span className="text-white font-medium text-sm">{s.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {step.tip && (
                  <div className="bg-white/10 rounded-xl px-4 py-3">
                    <p className="text-white/80 text-xs leading-relaxed">{step.tip}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 하단 네비게이션 */}
          <div className="bg-[#1a2f55] px-8 py-5 flex items-center justify-between">
            {/* 진행 도트 */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all ${
                    i === current
                      ? "w-5 h-2 bg-[#C9A961]"
                      : "w-2 h-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* 이전/다음 버튼 */}
            <div className="flex gap-2">
              {current > 0 && (
                <button
                  onClick={() => setCurrent(c => c - 1)}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              {isLast ? (
                <button
                  onClick={onClose}
                  className="bg-[#C9A961] hover:bg-[#b8943f] text-white px-6 h-10 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors shadow-lg"
                >
                  시작하기 <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrent(c => c + 1)}
                  className="bg-[#C9A961] hover:bg-[#b8943f] text-white px-5 h-10 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-colors"
                >
                  다음 <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
