/**
 * SARAM 서명 단계 (Step 10)
 * 본인인증 4종: PASS / 카카오 / 네이버 / 공동인증서
 * 인증 완료 → 블록체인 해시 → 결제(₩49,000)
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Clock, Hash, CreditCard, FileDown, Lock } from "lucide-react";
import { toast } from "sonner";
import type { StepProps } from "./StepProps";

type AuthMethod = "pass" | "kakao" | "naver" | "cert" | null;
type AuthState = "idle" | "pending" | "success";

const AUTH_METHODS = [
  {
    id: "pass" as AuthMethod,
    name: "PASS 인증",
    desc: "통신3사 본인인증 · 가장 안전",
    icon: "📱",
    color: "border-blue-200 hover:border-blue-400",
    activeColor: "border-blue-500 bg-blue-50",
    badge: "최고 보안",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "kakao" as AuthMethod,
    name: "카카오 인증",
    desc: "카카오 인증서 · 간편함",
    icon: "💛",
    color: "border-yellow-200 hover:border-yellow-400",
    activeColor: "border-yellow-400 bg-yellow-50",
    badge: "간편",
    badgeColor: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "naver" as AuthMethod,
    name: "네이버 인증",
    desc: "네이버 인증서 · 간편함",
    icon: "🟢",
    color: "border-green-200 hover:border-green-400",
    activeColor: "border-green-500 bg-green-50",
    badge: "간편",
    badgeColor: "bg-green-100 text-green-700",
  },
  {
    id: "cert" as AuthMethod,
    name: "공동인증서",
    desc: "구 공인인증서 · 은행·증권사 수준",
    icon: "🏦",
    color: "border-gray-200 hover:border-gray-400",
    activeColor: "border-gray-500 bg-gray-50",
    badge: "공식",
    badgeColor: "bg-gray-100 text-gray-700",
  },
];

export default function Step10Sign({ will }: StepProps) {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>(null);
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [timestamp, setTimestamp] = useState("");
  const [blockchainHash, setBlockchainHash] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  const totalPrice = 49000 + (will.hasVideoWill ? 29000 : 0) + (will.hasHandwrittenScan ? 19000 : 0);

  const handleAuth = () => {
    if (!selectedMethod) {
      toast.error("인증 방식을 선택해주세요.");
      return;
    }
    setAuthState("pending");
    // 인증 시뮬레이션 (실제 연동 시 PASS/카카오/네이버 SDK 호출)
    setTimeout(() => {
      const now = new Date();
      const ts = now.toISOString();
      // 블록체인 해시 시뮬레이션 (실제: Polygon 트랜잭션)
      const hash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      setTimestamp(ts);
      setBlockchainHash(hash);
      setAuthState("success");
      toast.success("본인인증 완료! 서명 타임스탬프가 기록됐습니다.");
    }, 2500);
  };

  const handlePayment = () => {
    toast.info("결제 페이지로 이동합니다. (서비스 준비 중)");
  };

  const handleDownloadPDF = () => {
    toast.info("PDF 생성 중... (서비스 준비 중)");
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3 p-4 bg-[#1F3864]/5 rounded-xl">
        <Lock className="w-5 h-5 text-[#1F3864]" />
        <div>
          <p className="font-semibold text-[#1F3864] text-sm">전자서명 및 본인인증</p>
          <p className="text-gray-400 text-xs">인증 완료 시 블록체인에 서명 타임스탬프가 기록됩니다.</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {authState !== "success" && (
          <motion.div
            key="auth-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* 인증 방식 선택 */}
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-3">인증 방식 선택</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {AUTH_METHODS.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedMethod === method.id
                        ? method.activeColor
                        : `bg-white ${method.color}`
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{method.icon}</span>
                        <span className="font-bold text-[#1F3864] text-sm">{method.name}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${method.badgeColor}`}>
                        {method.badge}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{method.desc}</p>
                    {selectedMethod === method.id && (
                      <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#1F3864]">
                        <CheckCircle2 className="w-3.5 h-3.5" />선택됨
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 서명 동의 */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
              <p className="font-semibold text-gray-700 mb-1">서명 전 확인사항</p>
              <ul className="space-y-1">
                <li>• 본인이 자유로운 의사로 작성한 유언장임을 확인합니다.</li>
                <li>• 인증 완료 시 RFC 3161 타임스탬프 및 Polygon 블록체인에 기록됩니다.</li>
                <li>• 서명 후 수정 시 재인증(₩15,000)이 필요합니다.</li>
                <li>• 법적 효력은 전자 인증 결제(₩49,000) 완료 후 발생합니다.</li>
              </ul>
            </div>

            {/* 인증 버튼 */}
            <button
              onClick={handleAuth}
              disabled={!selectedMethod || authState === "pending"}
              className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                selectedMethod && authState !== "pending"
                  ? "btn-gold"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {authState === "pending" ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-4 h-4 border-2 border-[#1F3864] border-t-transparent rounded-full"
                  />
                  인증 진행 중...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {selectedMethod
                    ? `${AUTH_METHODS.find((m) => m.id === selectedMethod)?.name}으로 서명하기`
                    : "인증 방식을 선택해주세요"}
                </>
              )}
            </button>
          </motion.div>
        )}

        {authState === "success" && (
          <motion.div
            key="auth-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* 성공 배너 */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-bold text-green-800 text-lg mb-1">본인인증 완료!</h3>
              <p className="text-green-600 text-sm">서명 타임스탬프가 블록체인에 기록됐습니다.</p>
            </div>

            {/* 인증 상세 */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[#C9A961]" />
                <span className="text-gray-500">서명 일시:</span>
                <span className="font-mono text-xs text-[#1F3864] ml-auto">{new Date(timestamp).toLocaleString("ko-KR")}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Hash className="w-4 h-4 text-[#C9A961] mt-0.5 flex-shrink-0" />
                <span className="text-gray-500 flex-shrink-0">블록체인 해시:</span>
                <span className="font-mono text-xs text-[#1F3864] break-all ml-auto">{blockchainHash.slice(0, 20)}...</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-[#C9A961]" />
                <span className="text-gray-500">인증 방식:</span>
                <span className="font-semibold text-[#1F3864] ml-auto">
                  {AUTH_METHODS.find((m) => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>

            {/* 결제 및 PDF */}
            <div className="space-y-3">
              <button
                onClick={handlePayment}
                className="w-full btn-gold py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                결제하기 — ₩{totalPrice.toLocaleString()}
                <span className="text-xs opacity-70 ml-1">
                  (전자인증 ₩49,000{will.hasVideoWill ? " + 영상 ₩29,000" : ""}{will.hasHandwrittenScan ? " + 자필 ₩19,000" : ""})
                </span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full border-2 border-[#1F3864] text-[#1F3864] py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#1F3864]/5 transition-all"
              >
                <FileDown className="w-4 h-4" />
                유언장 PDF 미리보기
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              결제 완료 후 법적 효력이 발생하며, 인증서가 이메일로 발송됩니다.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
