/**
 * EverWill 이메일 간편 가입/로그인 페이지 (/login)
 * Step 1: 이메일 입력
 * Step 2: OTP 6자리 인증
 * Step 3: 추가 정보 입력 (신규 가입자만) - 이름, 전화번호, 생년월일, 국가 + 국가별 추가 필드
 * Step 4: 완료 → 대시보드
 */
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowLeft, Mail, CheckCircle2, RefreshCw,
  Loader2, HelpCircle, ChevronDown, User, Phone, Calendar, Globe, Gift, Check, X,
  MapPin, Building2, BookOpen, Briefcase, DollarSign
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import WelcomeModal from "@/components/WelcomeModal";
import { useSignupTracking } from "@/hooks/useSignupTracking";

const benefits = [
  "유언장 작성 무료 · 언제든 재개 가능",
  "결제 내역 자동 연결 및 관리",
  "인증 완료 후 영구 보관",
  "7개 언어 · 195개국 결제 지원",
];

const COUNTRIES = [
  { code: "KR", label: "🇰🇷 한국" },
  { code: "US", label: "🇺🇸 미국" },
  { code: "JP", label: "🇯🇵 일본" },
  { code: "CN", label: "🇨🇳 중국" },
  { code: "HK", label: "🇭🇰 홍콩" },
  { code: "TW", label: "🇹🇼 대만" },
  { code: "DE", label: "🇩🇪 독일" },
  { code: "FR", label: "🇫🇷 프랑스" },
  { code: "ES", label: "🇪🇸 스페인" },
  { code: "SA", label: "🇸🇦 사우디아라비아" },
  { code: "AE", label: "🇦🇪 아랍에미리트" },
  { code: "GB", label: "🇬🇧 영국" },
  { code: "CA", label: "🇨🇦 캐나다" },
  { code: "AU", label: "🇦🇺 호주" },
  { code: "RU", label: "🇷🇺 러시아" },
  { code: "IN", label: "🇮🇳 인도" },
  { code: "BR", label: "🇧🇷 브라질" },
];

/** 국가별 추가 필드 설정 */
const COUNTRY_FIELDS: Record<string, {
  furigana?: boolean;
  zipCode?: boolean;
  address?: boolean;
  stateProvince?: boolean;
  nationality?: boolean;
  religion?: boolean;
  occupation?: boolean;
  assetScale?: boolean;
  agreeGdpr?: boolean;
  stateLabel?: string;
  addressLabel?: string;
  namePlaceholder?: string;
  phonePlaceholder?: string;
}> = {
  KR: { zipCode: true, address: true, occupation: true, assetScale: true },
  JP: { furigana: true, zipCode: true, address: true, occupation: true },
  CN: { zipCode: true, address: true, occupation: true },
  HK: { address: true, occupation: true, nationality: true },
  TW: { zipCode: true, address: true, occupation: true },
  US: { stateProvince: true, zipCode: true, address: true, occupation: true, assetScale: true, stateLabel: "주(State)" },
  CA: { stateProvince: true, zipCode: true, address: true, stateLabel: "주/준주(Province)" },
  AU: { stateProvince: true, zipCode: true, address: true, stateLabel: "주(State)" },
  GB: { zipCode: true, address: true, agreeGdpr: true },
  DE: { zipCode: true, address: true, agreeGdpr: true, occupation: true },
  FR: { zipCode: true, address: true, agreeGdpr: true },
  ES: { zipCode: true, address: true, agreeGdpr: true },
  SA: { nationality: true, religion: true, address: true, occupation: true },
  AE: { nationality: true, religion: true, address: true, occupation: true, assetScale: true },
  RU: { zipCode: true, address: true, occupation: true },
  IN: { stateProvince: true, zipCode: true, address: true, occupation: true, stateLabel: "주(State)" },
  BR: { stateProvince: true, zipCode: true, address: true, occupation: true, stateLabel: "주(Estado)" },
};

const ASSET_SCALE_OPTIONS = [
  { value: "", label: "선택 안 함" },
  { value: "under_100m", label: "1억 미만" },
  { value: "100m_500m", label: "1억 ~ 5억" },
  { value: "500m_1b", label: "5억 ~ 10억" },
  { value: "1b_5b", label: "10억 ~ 50억" },
  { value: "over_5b", label: "50억 이상" },
];

const RELIGION_OPTIONS = [
  { value: "islam", label: "이슬람(Islam)" },
  { value: "other", label: "기타" },
];

type Step = "email" | "otp" | "profile" | "done";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // 프로필 폼 - 공통
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBirth, setProfileBirth] = useState("");
  const [profileCountry, setProfileCountry] = useState("KR");

  // 프로필 폼 - 국가별 추가 필드
  const [furigana, setFurigana] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [nationality, setNationality] = useState("");
  const [religion, setReligion] = useState("");
  const [occupation, setOccupation] = useState("");
  const [assetScale, setAssetScale] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [agreeGdpr, setAgreeGdpr] = useState(false);

  // 추천인 코드
  const [referralCode, setReferralCode] = useState("");
  const [referralValidated, setReferralValidated] = useState<null | { valid: boolean; name: string | null }>(null);
  const [referralChecking, setReferralChecking] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { trackEnter, trackLeave, trackComplete, trackUnload } = useSignupTracking();

  // 국가 변경 시 추가 필드 초기화
  useEffect(() => {
    setFurigana(""); setZipCode(""); setAddress(""); setStateProvince("");
    setNationality(""); setReligion(""); setOccupation(""); setAssetScale("");
    setAgreeGdpr(false);
  }, [profileCountry]);

  const countryFields = COUNTRY_FIELDS[profileCountry] || {};

  const sendOtp = trpc.auth.email.sendOtp.useMutation({
    onSuccess: () => {
      // step1 이탈 + step2 진입 추적
      trackLeave("step1", email);
      setStep("otp");
      trackEnter("step2", email);
      startCooldown();
      toast.success("인증 코드를 발송했습니다. 이메일을 확인해주세요.");
    },
    onError: (err) => {
      toast.error(err.message || "이메일 발송에 실패했습니다.");
    },
  });

  const verifyOtp = trpc.auth.email.verifyOtp.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        setIsNewUser(true);
        // step2 이탈 + step3 진입
        trackLeave("step2", email);
        setStep("profile");
        trackEnter("step3", email);
      } else {
        // 재로그인 시는 추적 안 함
        setStep("done");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    },
    onError: (err) => {
      toast.error(err.message || "인증 코드가 올바르지 않습니다.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const applyReferral = trpc.referral.applyReferral.useMutation();

  const updateProfile = trpc.auth.email.updateProfile.useMutation({
    onSuccess: () => {
      // 가입 완료 추적
      trackComplete(email, profileCountry);
      setStep("done");
      setShowWelcome(true);
    },
    onError: (err) => {
      toast.error(err.message || "프로필 저장에 실패했습니다.");
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

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profileName.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      toast.error("이용약관 및 개인정보처리방침에 동의해주세요.");
      return;
    }
    if (countryFields.agreeGdpr && !agreeGdpr) {
      toast.error("GDPR 개인정보 처리에 동의해주세요.");
      return;
    }
    updateProfile.mutate({
      email,
      name: profileName.trim(),
      phone: profilePhone.trim() || undefined,
      birthDate: profileBirth || undefined,
      country: profileCountry,
      address: address.trim() || undefined,
      zipCode: zipCode.trim() || undefined,
      stateProvince: stateProvince.trim() || undefined,
      nationality: nationality.trim() || undefined,
      furigana: furigana.trim() || undefined,
      religion: religion || undefined,
      occupation: occupation.trim() || undefined,
      assetScale: assetScale || undefined,
      agreeTerms: agreeTerms ? 1 : 0,
      agreePrivacy: agreePrivacy ? 1 : 0,
      agreeMarketing: agreeMarketing ? 1 : 0,
      agreeGdpr: agreeGdpr ? 1 : 0,
    });
    // 추천인 코드가 유효하면 적립 처리
    if (referralCode.trim() && referralValidated?.valid) {
      applyReferral.mutate(
        { newUserEmail: email, referralCode: referralCode.trim().toUpperCase() },
        { onSuccess: () => toast.success("추천인 코드가 적용됐습니다!") }
      );
    }
  }

  useEffect(() => {
    if (step === "otp") setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  // 페이지 진입 시 step1 진입 추적
  useEffect(() => {
    trackEnter("step1");
    // beforeunload 시 trackUnload 사용 (ref 기반으로 최신 상태 반영)
    window.addEventListener("beforeunload", trackUnload);
    return () => window.removeEventListener("beforeunload", trackUnload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 outline-none text-gray-800 text-sm transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1F3864] via-[#243d72] to-[#1a3058] flex-col justify-between p-12">
        <Link href="/">
          <div className="flex items-center gap-2 text-white cursor-pointer">
            <div className="w-9 h-9 bg-[#C9A961] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xs">EW</span>
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>EverWill</span>
            <span className="text-white/40 text-sm ml-1">유언 OS</span>
          </div>
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
              <div className="inline-flex items-center gap-2 cursor-pointer">
                <div className="w-9 h-9 bg-[#1F3864] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xs">EW</span>
                </div>
                <span className="font-bold text-xl text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>EverWill</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <AnimatePresence mode="wait">

              {/* ── Step 1: 이메일 입력 ── */}
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
                      <label className={labelClass}>이메일 주소</label>
                      <input
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com" required autoFocus
                        className={inputClass}
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

              {/* ── Step 2: OTP 입력 ── */}
              {step === "otp" && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-7 h-7 text-[#1F3864]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>인증 코드 입력</h1>
                    <p className="text-gray-400 text-sm"><span className="text-[#1F3864] font-medium">{email}</span>로<br />발송된 6자리 코드를 입력해주세요.</p>
                  </div>
                  <div className="flex gap-2 justify-center mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 outline-none text-[#1F3864] transition-all"
                      />
                    ))}
                  </div>
                  {verifyOtp.isPending && (
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> 확인 중...
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button" onClick={() => setStep("email")}
                      className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> 이메일 변경
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || sendOtp.isPending}
                      onClick={() => sendOtp.mutate({ email })}
                      className="flex items-center gap-1 text-[#1F3864] hover:text-[#162a4e] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {resendCooldown > 0 ? `${resendCooldown}초 후 재발송` : "코드 재발송"}
                    </button>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      코드가 오지 않나요?
                      <ChevronDown className={`w-3 h-3 transition-transform ${showHelp ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showHelp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <ul className="mt-3 space-y-2 text-xs text-gray-500 bg-gray-50 rounded-xl p-4">
                            <li className="flex items-start gap-2">
                              <span className="text-[#C9A961] font-bold mt-0.5">1.</span>
                              <span>스팸 폴더를 확인해주세요.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#C9A961] font-bold mt-0.5">2.</span>
                              <span>코드는 10분 후 만료됩니다. 재발송 버튼을 눌러주세요.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#C9A961] font-bold mt-0.5">3.</span>
                              <span>회사 이메일은 보안 정책으로 차단될 수 있습니다. Gmail 등 개인 이메일을 사용해주세요.</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-[#C9A961] font-bold mt-0.5">4.</span>
                              <span>그래도 문제가 있으면 <a href="mailto:support@everwill.co.kr" className="text-[#1F3864] underline">support@everwill.co.kr</a>로 문의해주세요.</span>
                            </li>
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: 추가 정보 입력 (신규 가입자) ── */}
              {step === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-6">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-7 h-7 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>반갑습니다!</h1>
                    <p className="text-gray-400 text-sm">기본 정보를 입력해주세요.<br /><span className="text-gray-300">(이름·약관 동의 필수, 나머지는 선택)</span></p>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">

                    {/* ─ 공통 필드 ─ */}
                    {/* 거주 국가 (먼저 선택해야 국가별 필드가 나타남) */}
                    <div>
                      <label className={labelClass}>
                        <Globe className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        거주 국가 <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={profileCountry} onChange={(e) => setProfileCountry(e.target.value)}
                        className={inputClass + " bg-white"}
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* 이름 (필수) */}
                    <div>
                      <label className={labelClass}>
                        <User className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        이름 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                        placeholder={profileCountry === "JP" ? "山田 太郎" : profileCountry === "CN" ? "张三" : profileCountry === "SA" || profileCountry === "AE" ? "محمد أحمد" : "홍길동"}
                        required autoFocus
                        className={inputClass}
                      />
                    </div>

                    {/* 일본: 후리가나 */}
                    {countryFields.furigana && (
                      <div>
                        <label className={labelClass}>
                          <BookOpen className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          フリガナ (후리가나) <span className="text-gray-300 text-xs font-normal">(선택)</span>
                        </label>
                        <input
                          type="text" value={furigana} onChange={(e) => setFurigana(e.target.value)}
                          placeholder="ヤマダ タロウ"
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 전화번호 */}
                    <div>
                      <label className={labelClass}>
                        <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        전화번호 <span className="text-gray-300 text-xs font-normal">(선택)</span>
                      </label>
                      <input
                        type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder={
                          profileCountry === "KR" ? "010-0000-0000" :
                          profileCountry === "US" || profileCountry === "CA" ? "+1 (555) 000-0000" :
                          profileCountry === "JP" ? "090-0000-0000" :
                          profileCountry === "SA" || profileCountry === "AE" ? "+966 5X XXX XXXX" :
                          "+XX XXXX XXXX"
                        }
                        className={inputClass}
                      />
                    </div>

                    {/* 생년월일 */}
                    <div>
                      <label className={labelClass}>
                        <Calendar className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                        생년월일 <span className="text-gray-300 text-xs font-normal">(선택)</span>
                      </label>
                      <input
                        type="date" value={profileBirth} onChange={(e) => setProfileBirth(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                        className={inputClass}
                      />
                    </div>

                    {/* 국적 (홍콩·중동) */}
                    {countryFields.nationality && (
                      <div>
                        <label className={labelClass}>
                          <Globe className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          국적 <span className="text-gray-300 text-xs font-normal">(선택)</span>
                        </label>
                        <input
                          type="text" value={nationality} onChange={(e) => setNationality(e.target.value)}
                          placeholder="예: 한국 / Korean"
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 종교 (중동) */}
                    {countryFields.religion && (
                      <div>
                        <label className={labelClass}>
                          <BookOpen className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          종교 <span className="text-gray-300 text-xs font-normal">(상속법 적용 기준 · 선택)</span>
                        </label>
                        <select value={religion} onChange={(e) => setReligion(e.target.value)} className={inputClass + " bg-white"}>
                          <option value="">선택 안 함</option>
                          {RELIGION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        {religion === "islam" && (
                          <p className="mt-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                            이슬람 샤리아 상속법이 자동 적용됩니다. (남녀 상속분 2:1 원칙)
                          </p>
                        )}
                      </div>
                    )}

                    {/* 직업 */}
                    {countryFields.occupation && (
                      <div>
                        <label className={labelClass}>
                          <Briefcase className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          직업 <span className="text-gray-300 text-xs font-normal">(선택)</span>
                        </label>
                        <input
                          type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)}
                          placeholder="예: 회사원, 자영업, 의사..."
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 자산 규모 */}
                    {countryFields.assetScale && (
                      <div>
                        <label className={labelClass}>
                          <DollarSign className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          자산 규모 <span className="text-gray-300 text-xs font-normal">(선택 · 상속세 계산 참고용)</span>
                        </label>
                        <select value={assetScale} onChange={(e) => setAssetScale(e.target.value)} className={inputClass + " bg-white"}>
                          {ASSET_SCALE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    )}

                    {/* 우편번호 */}
                    {countryFields.zipCode && (
                      <div>
                        <label className={labelClass}>
                          <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          우편번호 <span className="text-gray-300 text-xs font-normal">(선택)</span>
                        </label>
                        <input
                          type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                          placeholder={profileCountry === "KR" ? "12345" : profileCountry === "US" ? "90210" : profileCountry === "JP" ? "123-4567" : "우편번호"}
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 주/도 (미국·캐나다·호주·인도·브라질) */}
                    {countryFields.stateProvince && (
                      <div>
                        <label className={labelClass}>
                          <Building2 className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          {countryFields.stateLabel || "주/도"} <span className="text-gray-300 text-xs font-normal">(선택)</span>
                        </label>
                        <input
                          type="text" value={stateProvince} onChange={(e) => setStateProvince(e.target.value)}
                          placeholder={profileCountry === "US" ? "California" : profileCountry === "CA" ? "Ontario" : profileCountry === "AU" ? "New South Wales" : ""}
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 주소 */}
                    {countryFields.address && (
                      <div>
                        <label className={labelClass}>
                          <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                          주소 <span className="text-gray-300 text-xs font-normal">(선택)</span>
                        </label>
                        <input
                          type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                          placeholder={
                            profileCountry === "KR" ? "서울시 강남구 테헤란로 123" :
                            profileCountry === "JP" ? "東京都渋谷区..." :
                            profileCountry === "US" ? "123 Main St, Los Angeles" :
                            "주소 입력"
                          }
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 추천인 코드 */}
                    <div>
                      <label className={labelClass}>
                        <Gift className="w-3.5 h-3.5 inline mr-1 text-[#C9A961]" />
                        추천인 코드 <span className="text-gray-300 text-xs font-normal">(선택 · 추천인에게 5,000P 적립)</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={referralCode}
                          onChange={(e) => {
                            const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
                            setReferralCode(v);
                            setReferralValidated(null);
                          }}
                          placeholder="예: AB3K7X"
                          maxLength={6}
                          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 outline-none text-gray-800 text-sm transition-all font-mono tracking-widest uppercase"
                        />
                        <button
                          type="button"
                          disabled={referralCode.length !== 6 || referralChecking}
                          onClick={async () => {
                            if (referralCode.length !== 6) return;
                            setReferralChecking(true);
                            try {
                              const res = await fetch(`/api/trpc/referral.validateCode?input=${encodeURIComponent(JSON.stringify({ json: { code: referralCode } }))}`);
                              const json = await res.json();
                              const result = json?.result?.data?.json;
                              setReferralValidated(result || { valid: false, name: null });
                            } catch {
                              setReferralValidated({ valid: false, name: null });
                            } finally {
                              setReferralChecking(false);
                            }
                          }}
                          className="px-4 py-3 rounded-xl bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all whitespace-nowrap"
                        >
                          {referralChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "확인"}
                        </button>
                      </div>
                      {referralValidated !== null && (
                        <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${referralValidated.valid ? "text-green-600" : "text-red-500"}`}>
                          {referralValidated.valid
                            ? <><Check className="w-3.5 h-3.5" /> {referralValidated.name} 님의 추천 코드가 확인됐습니다.</>
                            : <><X className="w-3.5 h-3.5" /> 유효하지 않은 추천인 코드입니다.</>
                          }
                        </div>
                      )}
                    </div>

                    {/* ─ 약관 동의 ─ */}
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">약관 동의</p>

                      {/* 이용약관 (필수) */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]/20"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                          <span className="text-red-400 font-medium">[필수]</span>{" "}
                          <a href="/terms" target="_blank" className="text-[#1F3864] underline hover:text-[#162a4e]">이용약관</a>에 동의합니다.
                        </span>
                      </label>

                      {/* 개인정보처리방침 (필수) */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]/20"
                        />
                        <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                          <span className="text-red-400 font-medium">[필수]</span>{" "}
                          <a href="/privacy" target="_blank" className="text-[#1F3864] underline hover:text-[#162a4e]">개인정보처리방침</a>에 동의합니다.
                        </span>
                      </label>

                      {/* GDPR (유럽 국가) */}
                      {countryFields.agreeGdpr && (
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox" checked={agreeGdpr} onChange={(e) => setAgreeGdpr(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]/20"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                            <span className="text-red-400 font-medium">[필수 · EU/GDPR]</span>{" "}
                            GDPR에 따른 개인정보 처리에 동의합니다. 언제든지 철회 가능합니다.
                          </span>
                        </label>
                      )}

                      {/* 마케팅 동의 (선택) */}
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#C9A961] focus:ring-[#C9A961]/20"
                        />
                        <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                          <span className="text-gray-400 font-medium">[선택]</span>{" "}
                          이벤트·혜택 정보 수신에 동의합니다.
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { trackComplete(email, profileCountry); setStep("done"); setShowWelcome(true); }}
                        className="flex-1 border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 py-3.5 rounded-xl text-sm font-medium transition-all"
                      >
                        나중에 입력
                      </button>
                      <button
                        type="submit" disabled={updateProfile.isPending || !profileName.trim() || !agreeTerms || !agreePrivacy}
                        className="flex-2 flex-grow bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        {updateProfile.isPending
                          ? <><Loader2 className="w-4 h-4 animate-spin" /> 저장 중...</>
                          : "저장하고 시작하기 →"
                        }
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── Step 4: 완료 ── */}
              {step === "done" && !showWelcome && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {isNewUser ? "가입 완료!" : "로그인 완료!"}
                  </h2>
                  <p className="text-gray-400 text-sm">대시보드로 이동합니다...</p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="text-center mt-6">
            <Link href="/">
              <div className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-sm transition-colors cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" />홈으로 돌아가기
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* 환영 온보딩 모달 */}
      {showWelcome && (
        <WelcomeModal
          userName={profileName || undefined}
          onClose={() => {
            setShowWelcome(false);
            navigate("/dashboard");
          }}
        />
      )}
    </div>
  );
}
