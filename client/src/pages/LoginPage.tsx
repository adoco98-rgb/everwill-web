/**
 * EverWill 이메일 간편 가입/로그인 페이지 (/login)
 * 이메일 입력 → 6자리 OTP 발송 → 코드 입력 → 대시보드 진입
 */
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowLeft, Mail, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const benefits = [
  "유언장 작성 무료 · 언제든 재개 가능",
  "결제 내역 자동 연결 및 관리",
  "인증 완료 후 영구 보관",
  "7개 언어 · 195개국 결제 지원",
];

type Step = "email" | "otp" | "done";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOtp = trpc.auth.email.sendOtp.useMutation({
    onSuccess: () => {
      setStep("otp");
      startCooldown();
      toast.success("인증 코드를 발송했습니다. 이메일을 확인해주세요.");
    },
    onError: (err) => {
      toast.error(err.message || "이메일 발송에 실패했습니다.");
    },
  });

  const verifyOtp = trpc.auth.email.verifyOtp.useMutation({
    onSuccess: () => {
      setStep("done");
      setTimeout(() => navigate("/dashboard"), 1200);
    },
    onError: (err) => {
      toast.error(err.message || "인증 코드가 올바르지 않습니다.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  function startCooldown() {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((v) => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    sendOtp.mutate({ email: email.trim().toLowerCase() });
  }

  function handleOtpChange(index: number, value: string) {
    // 붙여넣기 처리
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newOtp.every(d => d !== "")) {
        verifyOtp.mutate({ email, code: newOtp.join("") });
      }
      return;
    }
    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== "")) {
      verifyOtp.mutate({ email, code: newOtp.join("") });
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  useEffect(() => {
    if (step === "otp") setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1F3864] via-[#243d72] to-[#1a3058] flex-col justify-between p-12">
        <Link href="/">
          <a className="flex items-center gap-2 text-white">
            <div className="w-9 h-9 bg-[#C9A961] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">EW</span>
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>EverWill</span>
            <span className="text-white/40 text-sm ml-1">유언 OS</span>
          </a>
        </Link>
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              나의 마지막 서명,<br /><span className="text-[#C9A961]">지금 시작하세요</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">이메일 하나로 가입 완료.<br />유언장 작성은 무료입니다.</p>
          </div>
          <div className="space-y-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#C9A961] shrink-0" />
                <span className="text-white/80 text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs">© 2025 EverWill · 주식회사 사람</p>
      </div>

      {/* 오른쪽 폼 패널 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <a className="inline-flex items-center gap-2">
                <div className="w-9 h-9 bg-[#1F3864] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs">EW</span>
                </div>
                <span className="font-bold text-xl text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>EverWill</span>
              </a>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <AnimatePresence mode="wait">

              {/* Step 1: 이메일 입력 */}
              {step === "email" && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-7 h-7 text-[#1F3864]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>시작하기</h1>
                    <p className="text-gray-400 text-sm">이메일 주소를 입력하면 인증 코드를 보내드립니다.<br />계정이 없으면 자동으로 회원가입됩니다.</p>
                  </div>
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">이메일 주소</label>
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com" required autoFocus
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 outline-none text-gray-800 text-sm transition-all"
                      />
                    </div>
                    <button
                      type="submit" disabled={sendOtp.isPending || !email.trim()}
                      className="w-full bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      {sendOtp.isPending
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> 발송 중...</>
                        : <><Mail className="w-4 h-4" /> 인증 코드 받기</>
                      }
                    </button>
                  </form>
                  <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
                    계속 진행하면{" "}
                    <a href="#" className="text-[#1F3864] underline">이용약관</a>{" "}및{" "}
                    <a href="#" className="text-[#1F3864] underline">개인정보처리방침</a>에 동의합니다.
                  </p>
                </motion.div>
              )}

              {/* Step 2: OTP 입력 */}
              {step === "otp" && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-[#C9A961]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-7 h-7 text-[#C9A961]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>인증 코드 입력</h1>
                    <p className="text-gray-400 text-sm">
                      <span className="font-medium text-gray-600">{email}</span>으로<br />6자리 코드를 발송했습니다.
                    </p>
                  </div>
                  {/* OTP 6자리 입력 박스 */}
                  <div className="flex gap-2 justify-center mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={6} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={verifyOtp.isPending}
                        className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 disabled:opacity-50 text-[#1F3864]"
                      />
                    ))}
                  </div>
                  {verifyOtp.isPending && (
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                      <Loader2 className="w-4 h-4 animate-spin" /><span>확인 중...</span>
                    </div>
                  )}
                  <div className="text-center space-y-2">
                    <button
                      onClick={() => { if (resendCooldown > 0) return; sendOtp.mutate({ email }); }}
                      disabled={resendCooldown > 0 || sendOtp.isPending}
                      className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1F3864] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `${resendCooldown}초 후 재발송` : "코드 재발송"}
                    </button>
                    <br />
                    <button
                      onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); }}
                      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      다른 이메일로 변경
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: 완료 */}
              {step === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>로그인 완료!</h2>
                  <p className="text-gray-400 text-sm">대시보드로 이동합니다...</p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="text-center mt-6">
            <Link href="/">
              <a className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-sm transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />홈으로 돌아가기
              </a>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
