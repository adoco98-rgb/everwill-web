/**
 * 휴대폰 인증 페이지 (/dashboard/phone-verify)
 * - SMS 인증 코드 방식
 * - 소셜 로그인 가입자 필수
 */
import { motion } from "framer-motion";
import { Smartphone, CheckCircle2, AlertCircle, Send, RefreshCw } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

export default function PhoneVerifyPage() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"input" | "verify" | "done">("input");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 인증 상태 (추후 API 연동)
  const isVerified = false;

  // 인증번호 발송 (데모 모드)
  const sendCodeMutation = {
    mutate: (_args: any) => {
      toast.success("인증번호가 발송됐습니다. (3분 이내 입력)");
      setStep("verify");
      startCountdown(180);
    },
    isPending: false,
  };

  // 인증번호 확인 (데모 모드)
  const verifyCodeMutation = {
    mutate: (_args: any) => {
      if (code === "123456") {
        toast.success("휴대폰 인증이 완료됐습니다!");
        setStep("done");
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        toast.error("인증번호가 올바르지 않습니다. (테스트: 123456)");
      }
    },
    isPending: false,
  };

  const startCountdown = (seconds: number) => {
    setCountdown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handleSendCode = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }
    sendCodeMutation.mutate?.({ phone: digits });
  };

  const handleVerifyCode = () => {
    if (code.length !== 6) {
      toast.error("6자리 인증번호를 입력해주세요.");
      return;
    }
    verifyCodeMutation.mutate?.({ phone: phone.replace(/\D/g, ""), code });
  };

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-5 h-5 text-[#1F3864]" />
          <h1 className="text-xl font-bold text-[#1F3864]">휴대폰 인증</h1>
        </div>
        <p className="text-gray-500 text-sm">
          본인 명의 휴대폰으로 인증하면 유언 서비스를 안전하게 이용할 수 있습니다.
        </p>
      </motion.div>

      {/* 이미 인증된 경우 */}
      {isVerified || step === "done" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
        >
          <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-3" />
          <p className="font-bold text-green-800 text-lg mb-1">인증 완료</p>
          <p className="text-green-600 text-sm">
            {"휴대폰 인증이 완료됐습니다."}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
        >
          {/* 번호 입력 */}
          <div>
            <label className="block text-sm font-semibold text-[#1F3864] mb-2">
              휴대폰 번호
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="010-0000-0000"
                disabled={step === "verify"}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={handleSendCode}
                disabled={sendCodeMutation.isPending || (step === "verify" && countdown > 0)}
                className="px-4 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-semibold hover:bg-[#162d52] transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
              >
                {sendCodeMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : step === "verify" && countdown > 0 ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    재발송
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    발송
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 인증번호 입력 */}
          {step === "verify" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="block text-sm font-semibold text-[#1F3864] mb-2">
                인증번호 (6자리)
                {countdown > 0 && (
                  <span className="ml-2 text-orange-500 font-normal">{formatCountdown(countdown)}</span>
                )}
                {countdown === 0 && (
                  <span className="ml-2 text-red-500 font-normal text-xs">만료됨 - 재발송 필요</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-center tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
                />
                <button
                  onClick={handleVerifyCode}
                  disabled={verifyCodeMutation.isPending || countdown === 0}
                  className="px-5 py-3 bg-[#C9A961] text-white rounded-xl text-sm font-semibold hover:bg-[#b8943f] transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {verifyCodeMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      확인
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* 안내 */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <ul className="text-xs text-gray-500 space-y-1">
                <li>본인 명의 휴대폰 번호만 인증 가능합니다.</li>
                <li>인증번호는 발송 후 3분 이내에 입력해야 합니다.</li>
                <li>해외 번호는 +국가코드 형식으로 입력하세요.</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
