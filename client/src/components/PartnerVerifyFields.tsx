/**
 * 파트너 가입 폼용 전화번호 OTP 인증 + 이메일 인증 컴포넌트
 * 실제 SMS/이메일 발송은 백엔드 연동 전까지 UI 시뮬레이션으로 동작
 */
import { useState, useRef } from "react";
import { CheckCircle, Loader2, Phone, Mail } from "lucide-react";

interface PhoneVerifyFieldProps {
  phone: string;
  onPhoneChange: (v: string) => void;
  verified: boolean;
  onVerified: () => void;
  label?: string;
  placeholder?: string;
}

export function PhoneVerifyField({
  phone,
  onPhoneChange,
  verified,
  onVerified,
  label = "휴대폰 번호",
  placeholder = "+82 10-1234-5678",
}: PhoneVerifyFieldProps) {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  // 개발 시뮬레이션용 내부 OTP (실제 배포 시 서버에서 처리)
  const mockOtpRef = useRef("");

  const handleSendOtp = async () => {
    if (!phone || phone.length < 8) {
      setError("올바른 전화번호를 입력하세요.");
      return;
    }
    setSending(true);
    setError("");
    // TODO: 실제 Twilio SMS 발송 API 호출
    await new Promise(r => setTimeout(r, 1200));
    mockOtpRef.current = "123456"; // 시뮬레이션 OTP
    setSending(false);
    setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("6자리 인증번호를 입력하세요.");
      return;
    }
    setChecking(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    if (otp === mockOtpRef.current) {
      setChecking(false);
      onVerified();
    } else {
      setChecking(false);
      setError("인증번호가 올바르지 않습니다. (테스트: 123456)");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#1A1A1A]">
        <Phone className="inline w-4 h-4 mr-1 text-[#C9A961]" />
        {label} *
        {verified && (
          <span className="ml-2 text-green-600 text-xs font-semibold inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> 인증완료
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={e => { onPhoneChange(e.target.value); setOtpSent(false); }}
          disabled={verified}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400"
          placeholder={placeholder}
        />
        {!verified && (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sending || otpSent}
            className="px-4 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-medium hover:bg-[#2a4a7a] transition-colors disabled:opacity-50 whitespace-nowrap min-w-[90px] flex items-center justify-center gap-1"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : otpSent ? "재발송" : "인증번호 발송"}
          </button>
        )}
      </div>

      {otpSent && !verified && (
        <div className="flex gap-2">
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="flex-1 px-4 py-3 border border-[#C9A961] rounded-xl focus:ring-2 focus:ring-[#C9A961] outline-none text-center tracking-widest text-lg font-bold"
            placeholder="6자리 입력"
          />
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={checking}
            className="px-4 py-3 bg-[#C9A961] text-white rounded-xl text-sm font-medium hover:bg-[#b8924f] transition-colors disabled:opacity-50 whitespace-nowrap min-w-[70px] flex items-center justify-center gap-1"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "확인"}
          </button>
        </div>
      )}

      {otpSent && !verified && (
        <p className="text-xs text-[#6B7280]">인증번호가 발송되었습니다. (테스트 환경: <strong>123456</strong>)</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface EmailVerifyFieldProps {
  email: string;
  onEmailChange: (v: string) => void;
  verified: boolean;
  onVerified: () => void;
  label?: string;
  placeholder?: string;
}

export function EmailVerifyField({
  email,
  onEmailChange,
  verified,
  onVerified,
  label = "이메일",
  placeholder = "attorney@example.com",
}: EmailVerifyFieldProps) {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const mockCodeRef = useRef("");

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      setError("올바른 이메일 주소를 입력하세요.");
      return;
    }
    setSending(true);
    setError("");
    // TODO: 실제 Resend 이메일 발송 API 호출
    await new Promise(r => setTimeout(r, 1200));
    mockCodeRef.current = "654321"; // 시뮬레이션 코드
    setSending(false);
    setCodeSent(true);
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setError("6자리 인증코드를 입력하세요.");
      return;
    }
    setChecking(true);
    setError("");
    await new Promise(r => setTimeout(r, 800));
    if (code === mockCodeRef.current) {
      setChecking(false);
      onVerified();
    } else {
      setChecking(false);
      setError("인증코드가 올바르지 않습니다. (테스트: 654321)");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[#1A1A1A]">
        <Mail className="inline w-4 h-4 mr-1 text-[#C9A961]" />
        {label} *
        {verified && (
          <span className="ml-2 text-green-600 text-xs font-semibold inline-flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> 인증완료
          </span>
        )}
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { onEmailChange(e.target.value); setCodeSent(false); }}
          disabled={verified}
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1F3864] focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-400"
          placeholder={placeholder}
        />
        {!verified && (
          <button
            type="button"
            onClick={handleSendCode}
            disabled={sending || codeSent}
            className="px-4 py-3 bg-[#1F3864] text-white rounded-xl text-sm font-medium hover:bg-[#2a4a7a] transition-colors disabled:opacity-50 whitespace-nowrap min-w-[90px] flex items-center justify-center gap-1"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : codeSent ? "재발송" : "인증코드 발송"}
          </button>
        )}
      </div>

      {codeSent && !verified && (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            className="flex-1 px-4 py-3 border border-[#C9A961] rounded-xl focus:ring-2 focus:ring-[#C9A961] outline-none text-center tracking-widest text-lg font-bold"
            placeholder="6자리 입력"
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={checking}
            className="px-4 py-3 bg-[#C9A961] text-white rounded-xl text-sm font-medium hover:bg-[#b8924f] transition-colors disabled:opacity-50 whitespace-nowrap min-w-[70px] flex items-center justify-center gap-1"
          >
            {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : "확인"}
          </button>
        </div>
      )}

      {codeSent && !verified && (
        <p className="text-xs text-[#6B7280]">이메일로 인증코드가 발송되었습니다. (테스트 환경: <strong>654321</strong>)</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
