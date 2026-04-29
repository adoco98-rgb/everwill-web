/**
 * EverWill 로그인/회원가입 페이지 (/login)
 * 시니어 친화적 UI: 큰 글자, 큰 버튼, 명확한 단계 안내
 * 이메일 OTP 또는 휴대폰 OTP 선택 가능
 *
 * 이메일 플로우:
 *   Step 1: 이메일 입력
 *   Step 2: OTP 6자리 인증 (10분 카운트다운, 재발송, 5회 잠금)
 *   Step 3: 추가 정보 입력 (신규 가입자만)
 *   Step 4: 완료 → 대시보드
 *
 * 휴대폰 플로우:
 *   Step 1: 국가코드 + 휴대폰 번호 입력
 *   Step 2: SMS OTP 6자리 인증
 *   Step 3: 추가 정보 입력 (신규 가입자만)
 *   Step 4: 완료 → 대시보드
 */
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, ArrowLeft, Mail, CheckCircle2, RefreshCw,
  Loader2, HelpCircle, ChevronDown, User, Phone, Calendar, Globe, Gift, Check, X,
  MapPin, Building2, BookOpen, Briefcase, DollarSign, Smartphone, Lock, AlertTriangle
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

/** 국가코드 목록 (휴대폰 OTP용) */
const PHONE_COUNTRY_CODES = [
  { code: "+82", flag: "🇰🇷", name: "한국" },
  { code: "+1", flag: "🇺🇸", name: "미국/캐나다" },
  { code: "+81", flag: "🇯🇵", name: "일본" },
  { code: "+86", flag: "🇨🇳", name: "중국" },
  { code: "+852", flag: "🇭🇰", name: "홍콩" },
  { code: "+886", flag: "🇹🇼", name: "대만" },
  { code: "+44", flag: "🇬🇧", name: "영국" },
  { code: "+49", flag: "🇩🇪", name: "독일" },
  { code: "+33", flag: "🇫🇷", name: "프랑스" },
  { code: "+34", flag: "🇪🇸", name: "스페인" },
  { code: "+966", flag: "🇸🇦", name: "사우디" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+61", flag: "🇦🇺", name: "호주" },
  { code: "+7", flag: "🇷🇺", name: "러시아" },
  { code: "+91", flag: "🇮🇳", name: "인도" },
  { code: "+55", flag: "🇧🇷", name: "브라질" },
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

/** OTP 만료 시간 (초) */
const OTP_EXPIRE_SECONDS = 10 * 60; // 10분
/** OTP 최대 시도 횟수 */
const OTP_MAX_ATTEMPTS = 5;
/** 재발송 쿨다운 (초) */
const RESEND_COOLDOWN = 60;

type LoginMethod = "email" | "phone";
type EmailSubMode = "password" | "otp"; // 이메일 탭 내 서브 모드
type Step = "input" | "otp" | "sms_otp" | "profile" | "done"; // sms_otp: 비밀번호 로그인 후 SMS 2차 인증

export default function LoginPage() {
  const [, navigate] = useLocation();

  // 로그인 방법 선택 (이메일 / 휴대폰)
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");

  // 공통 스텝
  const [step, setStep] = useState<Step>("input");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // OTP 보안: 시도 횟수 및 잠금
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // OTP 만료 카운트다운 (초)
  const [otpExpireSeconds, setOtpExpireSeconds] = useState(0);

  // 이메일 플로우
  const [email, setEmail] = useState("");
  // 이메일 서브 모드: 비밀번호 방식 vs OTP 방식
  const [emailSubMode, setEmailSubMode] = useState<EmailSubMode>("password");
  // 비밀번호 방식 상태
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); // 로그인 vs 회원가입
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPhoneCode, setRegisterPhoneCode] = useState("+82");
  const [maskedPhone, setMaskedPhone] = useState(""); // SMS 발송 후 마스킹된 번호

  // 휴대폰 플로우
  const [phoneCountryCode, setPhoneCountryCode] = useState("+82");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [e164Phone, setE164Phone] = useState(""); // 서버에서 반환된 E.164 형식

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

  // 로그인 방법 변경 시 스텝 초기화
  useEffect(() => {
    setStep("input");
    setOtp(["", "", "", "", "", ""]);
    setResendCooldown(0);
    setShowHelp(false);
    setOtpAttempts(0);
    setIsLocked(false);
    setOtpExpireSeconds(0);
  }, [loginMethod]);

  const countryFields = COUNTRY_FIELDS[profileCountry] || {};

  // ── OTP 만료 카운트다운 타이머 ──
  useEffect(() => {
    if (step !== "otp" || otpExpireSeconds <= 0) return;
    const timer = setInterval(() => {
      setOtpExpireSeconds((v) => {
        if (v <= 1) {
          clearInterval(timer);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, otpExpireSeconds]);

  // 카운트다운 포맷 (mm:ss)
  function formatExpire(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  // ── 이메일 OTP 뮤테이션 ──
  const sendEmailOtp = trpc.auth.email.sendOtp.useMutation({
    onSuccess: () => {
      trackLeave("step1", email);
      setStep("otp");
      trackEnter("step2", email);
      startCooldown();
      startOtpExpire();
      setOtpAttempts(0);
      setIsLocked(false);
      toast.success("인증 코드를 발송했습니다. 이메일을 확인해주세요.");
    },
    onError: (err) => {
      toast.error(err.message || "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
  });

  const verifyEmailOtp = trpc.auth.email.verifyOtp.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        setIsNewUser(true);
        trackLeave("step2", email);
        setStep("profile");
        trackEnter("step3", email);
      } else {
        setStep("done");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    },
    onError: (err) => {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      if (newAttempts >= OTP_MAX_ATTEMPTS) {
        setIsLocked(true);
        toast.error("인증 코드를 5회 잘못 입력했습니다. 새 코드를 요청해주세요.");
      } else {
        toast.error(`인증 코드가 올바르지 않습니다. (${newAttempts}/${OTP_MAX_ATTEMPTS}회)`);
      }
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const updateEmailProfile = trpc.auth.email.updateProfile.useMutation({
    onSuccess: () => {
      trackComplete(email, profileCountry);
      setStep("done");
      setShowWelcome(true);
    },
    onError: (err) => {
      toast.error(err.message || "정보 저장에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // ── 휴대폰 OTP 뮤테이션 ──
  const sendPhoneOtp = trpc.auth.phone.sendOtp.useMutation({
    onSuccess: (data) => {
      setE164Phone(data.phone);
      setStep("otp");
      startCooldown();
      startOtpExpire();
      setOtpAttempts(0);
      setIsLocked(false);
      toast.success("SMS 인증 코드를 발송했습니다. 문자를 확인해주세요.");
    },
    onError: (err) => {
      toast.error(err.message || "SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    },
  });

  const verifyPhoneOtp = trpc.auth.phone.verifyOtp.useMutation({
    onSuccess: (data) => {
      if (data.isNewUser) {
        setIsNewUser(true);
        setStep("profile");
      } else {
        setStep("done");
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    },
    onError: (err) => {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      if (newAttempts >= OTP_MAX_ATTEMPTS) {
        setIsLocked(true);
        toast.error("인증 코드를 5회 잘못 입력했습니다. 새 코드를 요청해주세요.");
      } else {
        toast.error(`인증 코드가 올바르지 않습니다. (${newAttempts}/${OTP_MAX_ATTEMPTS}회)`);
      }
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const updatePhoneProfile = trpc.auth.phone.updateProfile.useMutation({
    onSuccess: () => {
      setStep("done");
      setShowWelcome(true);
    },
    onError: (err) => {
      toast.error(err.message || "정보 저장에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // 이메일+비밀번호 회원가입
  const registerMutation = trpc.auth.email.register.useMutation({
    onSuccess: () => {
      toast.success("회원가입이 완료되었습니다. 로그인해주세요.");
      setIsRegisterMode(false);
      setPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      toast.error(err.message || "회원가입에 실패했습니다.");
    },
  });

  // 로그인 1단계: 이메일+비밀번호 검증 → SMS OTP 발송
  const loginStep1Mutation = trpc.auth.email.loginStep1.useMutation({
    onSuccess: (data) => {
      setMaskedPhone(data.maskedPhone);
      setStep("sms_otp");
      setOtp(["", "", "", "", "", ""]);
      setOtpAttempts(0);
      setIsLocked(false);
      toast.success(`등록된 휴대폰(${data.maskedPhone})으로 SMS를 발송했습니다.`);
    },
    onError: (err) => {
      toast.error(err.message || "로그인에 실패했습니다.");
    },
  });

  // 로그인 2단계: SMS OTP 검증 → 세션 발급
  const loginStep2Mutation = trpc.auth.email.loginStep2.useMutation({
    onSuccess: () => {
      setStep("done");
      toast.success("로그인에 성공했습니다!");
      setTimeout(() => navigate("/dashboard"), 1000);
    },
    onError: (err) => {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      if (newAttempts >= OTP_MAX_ATTEMPTS) {
        setIsLocked(true);
        toast.error("인증 코드를 5회 잘못 입력했습니다. 다시 로그인해주세요.");
      } else {
        toast.error(err.message || `인증 코드가 올바르지 않습니다. (${newAttempts}/${OTP_MAX_ATTEMPTS}회)`);
      }
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
  });

  const applyReferral = trpc.referral.applyReferral.useMutation();

  function startCooldown() {
    setResendCooldown(RESEND_COOLDOWN);
    const interval = setInterval(() => {
      setResendCooldown((v) => {
        if (v <= 1) { clearInterval(interval); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  function startOtpExpire() {
    setOtpExpireSeconds(OTP_EXPIRE_SECONDS);
  }

  // ── 이메일 제출 ──
  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    sendEmailOtp.mutate({ email: email.trim().toLowerCase() });
  }

  // ── 휴대폰 제출 ──
  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    sendPhoneOtp.mutate({ phone: phoneNumber.trim(), countryCode: phoneCountryCode });
  }

  // ── OTP 입력 처리 ──
  function handleOtpChange(index: number, value: string) {
    if (isLocked) return;
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      digits.forEach((d, i) => { if (index + i < 6) newOtp[index + i] = d; });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newOtp.every(d => d !== "")) {
        submitOtp(newOtp.join(""));
      }
      return;
    }
    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== "")) {
      submitOtp(newOtp.join(""));
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function submitOtp(code: string) {
    if (isLocked) return;
    if (step === "sms_otp") {
      // 비밀번호 로그인 2단계 SMS OTP 검증
      loginStep2Mutation.mutate({ email, code });
    } else if (loginMethod === "email") {
      verifyEmailOtp.mutate({ email, code });
    } else {
      verifyPhoneOtp.mutate({ phone: phoneNumber.trim(), countryCode: phoneCountryCode, code });
    }
  }

  // 이메일+비밀번호 로그인 제출
  function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    loginStep1Mutation.mutate({ email: email.trim().toLowerCase(), password });
  }

  // 이메일+비밀번호 회원가입 제출
  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !registerName.trim() || !registerPhone.trim()) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    const fullPhone = registerPhone.startsWith("+") ? registerPhone : `${registerPhoneCode}${registerPhone.replace(/^0/, "")}`;
    registerMutation.mutate({
      email: email.trim().toLowerCase(),
      password,
      name: registerName.trim(),
      phone: fullPhone,
      country: "KR",
    });
  }

  function handleResend() {
    setOtp(["", "", "", "", "", ""]);
    setOtpAttempts(0);
    setIsLocked(false);
    if (loginMethod === "email") {
      sendEmailOtp.mutate({ email });
    } else {
      sendPhoneOtp.mutate({ phone: phoneNumber.trim(), countryCode: phoneCountryCode });
    }
  }

  // ── 프로필 제출 ──
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

    const profileData = {
      name: profileName.trim(),
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
    };

    if (loginMethod === "email") {
      updateEmailProfile.mutate({
        ...profileData,
        email,
        phone: profilePhone.trim() || undefined,
      });
      if (referralCode.trim() && referralValidated?.valid) {
        applyReferral.mutate(
          { referralCode: referralCode.trim().toUpperCase() },
          { onSuccess: () => toast.success("추청인 코드가 적용됐습니다!") }
        );
      }
    } else {
      updatePhoneProfile.mutate({
        ...profileData,
        phone: e164Phone,
        email: profilePhone.trim() || undefined,
      });
    }
  }

  useEffect(() => {
    if (step === "otp") setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  useEffect(() => {
    trackEnter("step1");
    window.addEventListener("beforeunload", trackUnload);
    return () => window.removeEventListener("beforeunload", trackUnload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 시니어 친화적 스타일 (큰 글자, 넉넉한 패딩)
  const inputClass = "w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 outline-none text-gray-800 text-lg transition-all";
  const labelClass = "block text-base font-semibold text-gray-700 mb-2";

  const isPendingSend = loginMethod === "email" ? sendEmailOtp.isPending : sendPhoneOtp.isPending;
  const isPendingVerify = loginMethod === "email" ? verifyEmailOtp.isPending : verifyPhoneOtp.isPending;
  const isPendingProfile = loginMethod === "email" ? updateEmailProfile.isPending : updatePhoneProfile.isPending;

  // 단계 표시 (1/2/3)
  const stepNumber = step === "input" ? 1 : step === "otp" ? 2 : step === "profile" ? 3 : 3;
  const stepTotal = 3;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* 왼쪽 브랜드 패널 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1F3864] via-[#243d72] to-[#1a3058] flex-col justify-between p-12">
        <Link href="/">
          <div className="flex items-center gap-2 text-white cursor-pointer">
            <div className="w-10 h-10 bg-[#C9A961] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">EW</span>
            </div>
            <span className="font-bold text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>EverWill</span>
            <span className="text-white/40 text-base ml-1">유언 OS</span>
          </div>
        </Link>
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              나의 마지막 서명,<br /><span className="text-[#C9A961]">지금 시작하세요</span>
            </h2>
            <p className="text-white/60 text-xl leading-relaxed">이메일 또는 휴대폰 하나로 가입 완료.<br />유언장 작성은 무료입니다.</p>
          </div>
          <div className="space-y-5">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#C9A961] shrink-0" />
                <span className="text-white/80 text-lg">{b}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm">© 2025 EverWill · 주식회사 사람</p>
      </div>

      {/* 오른쪽 폼 패널 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <div className="inline-flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 bg-[#1F3864] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EW</span>
                </div>
                <span className="font-bold text-2xl text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>EverWill</span>
              </div>
            </Link>
          </div>

          {/* 단계 진행 표시 (input/otp/profile 단계에서만) */}
          {step !== "done" && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-[#1F3864]">
                  {step === "input" && "1단계: 연락처 입력"}
                  {step === "otp" && "2단계: 인증 코드 확인"}
                  {step === "profile" && "3단계: 기본 정보 입력"}
                </span>
                <span className="text-sm text-gray-400">{stepNumber} / {stepTotal}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#C9A961] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(stepNumber / stepTotal) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">

            {/* ── 로그인 방법 탭 (input 스텝에서만 표시) ── */}
            {step === "input" && (
              <div className="flex rounded-2xl bg-gray-100 p-1.5 mb-8 gap-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all ${
                    loginMethod === "email"
                      ? "bg-white text-[#1F3864] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  이메일
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all ${
                    loginMethod === "phone"
                      ? "bg-white text-[#1F3864] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  휴대폰
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">

              {/* ── Step 1: 이메일 입력 (비밀번호 방식 기본) ── */}
              {step === "input" && loginMethod === "email" && emailSubMode === "password" && (
                <motion.div key="email-input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-[#1F3864]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>이메일로 시작하기</h1>
                  </div>

                  {/* 로그인 / 회원가입 서브탭 */}
                  <div className="flex rounded-xl bg-gray-100 p-1 mb-6 gap-1">
                    <button type="button" onClick={() => setIsRegisterMode(false)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        !isRegisterMode ? "bg-white text-[#1F3864] shadow-sm" : "text-gray-400 hover:text-gray-600"
                      }`}>
                      로그인
                    </button>
                    <button type="button" onClick={() => setIsRegisterMode(true)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        isRegisterMode ? "bg-white text-[#1F3864] shadow-sm" : "text-gray-400 hover:text-gray-600"
                      }`}>
                      회원가입
                    </button>
                  </div>

                  {/* 로그인 폼 */}
                  {!isRegisterMode && (
                    <form onSubmit={handlePasswordLogin} className="space-y-4">
                      <div>
                        <label className={labelClass}><Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />이메일</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com" required autoFocus className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}><Lock className="w-4 h-4 inline mr-1.5 text-gray-400" />비밀번호</label>
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호 입력" required className={inputClass + " pr-12"} />
                          <button type="button" onClick={() => setShowPassword(v => !v)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <X className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button type="submit" disabled={loginStep1Mutation.isPending || !email.trim() || !password.trim()}
                        className="w-full bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                        {loginStep1Mutation.isPending
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> 확인 중...</>
                          : <><Lock className="w-5 h-5" /> 로그인</>
                        }
                      </button>
                      <p className="text-center text-sm text-gray-400">
                        인증코드 방식으로 로그인하려면{" "}
                        <button type="button" onClick={() => setEmailSubMode("otp")} className="text-[#1F3864] underline">여기를 클릭</button>
                      </p>
                    </form>
                  )}

                  {/* 회원가입 폼 */}
                  {isRegisterMode && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className={labelClass}><User className="w-4 h-4 inline mr-1.5 text-gray-400" />이름</label>
                        <input type="text" value={registerName} onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="홍길동" required className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}><Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />이메일</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="example@email.com" required className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}><Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />휴대폰 번호 <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          <select value={registerPhoneCode} onChange={(e) => setRegisterPhoneCode(e.target.value)}
                            className="px-3 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1F3864] outline-none text-gray-800 text-base bg-white w-28 shrink-0">
                            {PHONE_COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                          </select>
                          <input type="tel" value={registerPhone} onChange={(e) => setRegisterPhone(e.target.value.replace(/[^\d\-\s]/g, ""))}
                            placeholder="010-0000-0000" required className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1F3864] outline-none text-gray-800 text-lg" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">로그인 시 이 번호로 인증번호가 발송됩니다.</p>
                      </div>
                      <div>
                        <label className={labelClass}><Lock className="w-4 h-4 inline mr-1.5 text-gray-400" />비밀번호 (8자 이상)</label>
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="비밀번호 입력" required minLength={8} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}><Lock className="w-4 h-4 inline mr-1.5 text-gray-400" />비밀번호 확인</label>
                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="비밀번호 재입력" required className={inputClass} />
                        {confirmPassword && password !== confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">비밀번호가 일치하지 않습니다.</p>
                        )}
                      </div>
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1">
                        {showPassword ? <X className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        비밀번호 {showPassword ? "숨기기" : "표시"}
                      </button>
                      <button type="submit" disabled={registerMutation.isPending}
                        className="w-full bg-[#C9A961] hover:bg-[#b8944f] disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-md">
                        {registerMutation.isPending
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> 가입 중...</>
                          : <><Check className="w-5 h-5" /> 회원가입 완료</>
                        }
                      </button>
                    </form>
                  )}

                  <p className="text-center text-xs text-gray-400 mt-4">
                    계속 진행하면{" "}
                    <a href="/terms" className="text-[#1F3864] underline">이용약관</a>{" "}및{" "}
                    <a href="/privacy" className="text-[#1F3864] underline">개인정보처리방침</a>에 동의합니다.
                  </p>
                </motion.div>
              )}

              {/* ── Step 1: 이메일 OTP 방식 (인증코드 전환 시) ── */}
              {step === "input" && loginMethod === "email" && emailSubMode === "otp" && (
                <motion.div key="email-otp-input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-[#1F3864]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F3864] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>인증코드로 로그인</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">이메일 주소를 입력하시면<br />인증 코드를 보내드립니다.</p>
                  </div>
                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <div>
                      <label className={labelClass}><Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />이메일 주소</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com" required autoFocus className={inputClass} />
                    </div>
                    <button type="submit" disabled={isPendingSend || !email.trim()}
                      className="w-full bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-50 text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-md">
                      {isPendingSend ? <><Loader2 className="w-5 h-5 animate-spin" /> 발송 중...</> : <><Mail className="w-5 h-5" /> 인증 코드 받기</>}
                    </button>
                  </form>
                  <p className="text-center text-sm text-gray-400 mt-4">
                    <button type="button" onClick={() => setEmailSubMode("password")} className="text-[#1F3864] underline">비밀번호로 로그인</button>
                  </p>
                </motion.div>
              )}

              {/* ── Step: SMS OTP (비밀번호 로그인 2단계) ── */}
              {step === "sms_otp" && (
                <motion.div key="sms-otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-[#1F3864]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F3864] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>SMS 인증</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">
                      등록된 휴대폰 <span className="font-semibold text-[#1F3864]">{maskedPhone}</span>으로<br />
                      6자리 인증번호를 발송했습니다.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center mb-6">
                    {otp.map((digit, i) => (
                      <input key={i} ref={(el) => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={isLocked || loginStep2Mutation.isPending}
                        className={`w-12 h-16 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all ${
                          digit ? "border-[#1F3864] bg-[#1F3864]/5" : "border-gray-200"
                        } ${isLocked ? "opacity-50 cursor-not-allowed" : "focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10"}`}
                      />
                    ))}
                  </div>
                  {isLocked && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                      <p className="text-red-600 text-sm">인증 시도 횟수를 초과했습니다. 처음부터 다시 시도해주세요.</p>
                    </div>
                  )}
                  {loginStep2Mutation.isPending && (
                    <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>인증 확인 중...</span>
                    </div>
                  )}
                  <button type="button" onClick={() => { setStep("input"); setOtp(["", "", "", "", "", ""]); setIsLocked(false); }}
                    className="w-full text-gray-500 hover:text-[#1F3864] py-3 rounded-2xl border border-gray-200 hover:border-[#1F3864] text-base font-medium transition-all">
                    <ArrowLeft className="w-4 h-4 inline mr-1.5" />처음으로 돌아가기
                  </button>
                </motion.div>
              )}

              {/* ── Step 1: 휴대폰 번호 입력 ── */}
              {step === "input" && loginMethod === "phone" && (
                <motion.div key="phone-input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-[#1F3864]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F3864] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>휴대폰으로 시작하기</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">휴대폰 번호를 입력하시면<br />문자(SMS)로 인증 코드를 보내드립니다.</p>
                  </div>
                  <form onSubmit={handlePhoneSubmit} className="space-y-5">
                    <div>
                      <label className={labelClass}>
                        <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        휴대폰 번호
                      </label>
                      <div className="flex gap-3">
                        {/* 국가코드 선택 */}
                        <select
                          value={phoneCountryCode}
                          onChange={(e) => setPhoneCountryCode(e.target.value)}
                          className="px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 outline-none text-gray-800 text-lg transition-all bg-white w-36 shrink-0"
                        >
                          {PHONE_COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        {/* 번호 입력 */}
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d\-\s]/g, ""))}
                          placeholder={phoneCountryCode === "+82" ? "010-0000-0000" : phoneCountryCode === "+1" ? "555-000-0000" : "번호 입력"}
                          required
                          autoFocus
                          className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 outline-none text-gray-800 text-lg transition-all"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-400">
                        {phoneCountryCode === "+82" ? "예: 010-1234-5678 (앞의 0 포함)" : "국가코드 없이 번호만 입력"}
                      </p>
                    </div>
                    <button
                      type="submit" disabled={isPendingSend || !phoneNumber.trim()}
                      className="w-full bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      {isPendingSend
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> 발송 중...</>
                        : <><Smartphone className="w-5 h-5" /> SMS 인증 코드 받기</>
                      }
                    </button>
                  </form>
                  <p className="text-center text-sm text-gray-400 mt-6 leading-relaxed">
                    계속 진행하면{" "}
                    <a href="/terms" className="text-[#1F3864] underline">이용약관</a>{" "}및{" "}
                    <a href="/privacy" className="text-[#1F3864] underline">개인정보처리방침</a>에 동의합니다.
                  </p>
                </motion.div>
              )}

              {/* ── Step 2: OTP 입력 (이메일/휴대폰 공통) ── */}
              {step === "otp" && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-[#1F3864]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F3864] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>인증 코드 입력</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">
                      {loginMethod === "email"
                        ? <><span className="text-[#1F3864] font-semibold">{email}</span>으로<br />발송된 6자리 코드를 입력해주세요.</>
                        : <><span className="text-[#1F3864] font-semibold">{phoneCountryCode} {phoneNumber}</span>으로<br />발송된 SMS 6자리 코드를 입력해주세요.</>
                      }
                    </p>
                  </div>

                  {/* OTP 만료 타이머 */}
                  {otpExpireSeconds > 0 && !isLocked && (
                    <div className={`flex items-center justify-center gap-2 mb-5 text-base font-semibold rounded-xl px-4 py-3 ${
                      otpExpireSeconds <= 60 ? "bg-red-50 text-red-600" : "bg-blue-50 text-[#1F3864]"
                    }`}>
                      <Shield className="w-4 h-4" />
                      코드 만료까지: <span className="font-bold text-lg">{formatExpire(otpExpireSeconds)}</span>
                    </div>
                  )}
                  {otpExpireSeconds === 0 && !isLocked && step === "otp" && (
                    <div className="flex items-center justify-center gap-2 mb-5 text-base font-semibold bg-orange-50 text-orange-600 rounded-xl px-4 py-3">
                      <AlertTriangle className="w-4 h-4" />
                      코드가 만료됐습니다. 아래에서 재발송해주세요.
                    </div>
                  )}

                  {/* 잠금 상태 */}
                  {isLocked && (
                    <div className="flex items-center justify-center gap-2 mb-5 text-base font-semibold bg-red-50 text-red-600 rounded-xl px-4 py-3">
                      <Lock className="w-4 h-4" />
                      5회 실패로 잠겼습니다. 아래에서 새 코드를 요청해주세요.
                    </div>
                  )}

                  {/* OTP 입력 칸 */}
                  <div className="flex gap-3 justify-center mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={isLocked || otpExpireSeconds === 0}
                        className={`w-14 h-16 text-center text-3xl font-bold rounded-2xl border-2 outline-none transition-all ${
                          isLocked || otpExpireSeconds === 0
                            ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed"
                            : "border-gray-200 focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 text-[#1F3864]"
                        }`}
                      />
                    ))}
                  </div>

                  {/* 시도 횟수 표시 */}
                  {otpAttempts > 0 && !isLocked && (
                    <p className="text-center text-sm text-orange-500 mb-4 font-medium">
                      잘못된 코드 입력: {otpAttempts}/{OTP_MAX_ATTEMPTS}회
                    </p>
                  )}

                  {isPendingVerify && (
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-base mb-4">
                      <Loader2 className="w-5 h-5 animate-spin" /> 확인 중...
                    </div>
                  )}

                  {/* 하단 버튼 */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      type="button" onClick={() => setStep("input")}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors text-base py-2 px-3 rounded-xl hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {loginMethod === "email" ? "이메일 변경" : "번호 변경"}
                    </button>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || isPendingSend}
                      onClick={handleResend}
                      className="flex items-center gap-1.5 text-[#1F3864] hover:text-[#162a4e] disabled:text-gray-300 disabled:cursor-not-allowed transition-colors text-base font-semibold py-2 px-3 rounded-xl hover:bg-[#1F3864]/5"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {resendCooldown > 0 ? `${resendCooldown}초 후 재발송` : "코드 재발송"}
                    </button>
                  </div>

                  {/* 도움말 */}
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                      코드가 오지 않나요?
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHelp ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {showHelp && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <ul className="mt-3 space-y-3 text-sm text-gray-500 bg-gray-50 rounded-2xl p-5">
                            {loginMethod === "email" ? (
                              <>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">1.</span><span>스팸 폴더를 확인해주세요.</span></li>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">2.</span><span>코드는 10분 후 만료됩니다. 재발송 버튼을 눌러주세요.</span></li>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">3.</span><span>회사 이메일은 보안 정책으로 차단될 수 있습니다. Gmail 등 개인 이메일을 사용해주세요.</span></li>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">4.</span><span>그래도 문제가 있으면 <a href="mailto:support@everwill.co.kr" className="text-[#1F3864] underline">support@everwill.co.kr</a>로 문의해주세요.</span></li>
                              </>
                            ) : (
                              <>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">1.</span><span>국가코드가 올바른지 확인해주세요.</span></li>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">2.</span><span>문자(SMS)는 최대 1~2분 소요될 수 있습니다.</span></li>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">3.</span><span>코드는 10분 후 만료됩니다. 재발송 버튼을 눌러주세요.</span></li>
                                <li className="flex items-start gap-2"><span className="text-[#C9A961] font-bold mt-0.5">4.</span><span>그래도 문제가 있으면 <a href="mailto:support@everwill.co.kr" className="text-[#1F3864] underline">support@everwill.co.kr</a>로 문의해주세요.</span></li>
                              </>
                            )}
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
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-[#1F3864]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1F3864] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>기본 정보 입력</h1>
                    <p className="text-gray-500 text-lg">유언장 작성에 필요한 기본 정보입니다.</p>
                  </div>
                  <form onSubmit={handleProfileSubmit} className="space-y-5">

                    {/* 이름 */}
                    <div>
                      <label className={labelClass}>
                        <User className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        이름 <span className="text-red-400 text-sm font-normal">(필수)</span>
                      </label>
                      <input
                        type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)}
                        placeholder="홍길동" required autoFocus
                        className={inputClass}
                      />
                    </div>

                    {/* 후리가나 (일본) */}
                    {countryFields.furigana && (
                      <div>
                        <label className={labelClass}>후리가나 (フリガナ)</label>
                        <input
                          type="text" value={furigana} onChange={(e) => setFurigana(e.target.value)}
                          placeholder="ホンギルドン"
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 생년월일 */}
                    <div>
                      <label className={labelClass}>
                        <Calendar className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        생년월일 <span className="text-gray-400 text-sm font-normal">(선택)</span>
                      </label>
                      <input
                        type="date" value={profileBirth} onChange={(e) => setProfileBirth(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {/* 거주 국가 */}
                    <div>
                      <label className={labelClass}>
                        <Globe className="w-4 h-4 inline mr-1.5 text-gray-400" />
                        거주 국가 <span className="text-gray-400 text-sm font-normal">(선택)</span>
                      </label>
                      <select value={profileCountry} onChange={(e) => setProfileCountry(e.target.value)} className={inputClass + " bg-white"}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>

                    {/* 이메일 가입자: 휴대폰 번호 선택 입력 */}
                    {loginMethod === "email" && (
                      <div>
                        <label className={labelClass}>
                          <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          휴대폰 번호 <span className="text-gray-400 text-sm font-normal">(선택)</span>
                        </label>
                        <input
                          type="tel" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 휴대폰 가입자: 이메일 선택 입력 */}
                    {loginMethod === "phone" && (
                      <div>
                        <label className={labelClass}>
                          <Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          이메일 주소 <span className="text-gray-400 text-sm font-normal">(선택)</span>
                        </label>
                        <input
                          type="email" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)}
                          placeholder="example@email.com"
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 국적 (중동) */}
                    {countryFields.nationality && (
                      <div>
                        <label className={labelClass}>
                          국적 <span className="text-gray-400 text-sm font-normal">(선택)</span>
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
                          <BookOpen className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          종교 <span className="text-gray-400 text-sm font-normal">(상속법 적용 기준 · 선택)</span>
                        </label>
                        <select value={religion} onChange={(e) => setReligion(e.target.value)} className={inputClass + " bg-white"}>
                          <option value="">선택 안 함</option>
                          {RELIGION_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        {religion === "islam" && (
                          <p className="mt-2 text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                            이슬람 샤리아 상속법이 자동 적용됩니다. (남녀 상속분 2:1 원칙)
                          </p>
                        )}
                      </div>
                    )}

                    {/* 직업 */}
                    {countryFields.occupation && (
                      <div>
                        <label className={labelClass}>
                          <Briefcase className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          직업 <span className="text-gray-400 text-sm font-normal">(선택)</span>
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
                          <DollarSign className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          자산 규모 <span className="text-gray-400 text-sm font-normal">(선택 · 상속세 계산 참고용)</span>
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
                          <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          우편번호 <span className="text-gray-400 text-sm font-normal">(선택)</span>
                        </label>
                        <input
                          type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)}
                          placeholder={profileCountry === "KR" ? "12345" : profileCountry === "US" ? "90210" : profileCountry === "JP" ? "123-4567" : "우편번호"}
                          className={inputClass}
                        />
                      </div>
                    )}

                    {/* 주/도 */}
                    {countryFields.stateProvince && (
                      <div>
                        <label className={labelClass}>
                          <Building2 className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          {countryFields.stateLabel || "주/도"} <span className="text-gray-400 text-sm font-normal">(선택)</span>
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
                          <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
                          주소 <span className="text-gray-400 text-sm font-normal">(선택)</span>
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

                    {/* 추천인 코드 (이메일 가입자만) */}
                    {loginMethod === "email" && (
                      <div>
                        <label className={labelClass}>
                          <Gift className="w-4 h-4 inline mr-1.5 text-[#C9A961]" />
                          추천인 코드 <span className="text-gray-400 text-sm font-normal">(선택 · 추천인에게 5,000P 적립)</span>
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
                            className="flex-1 px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10 outline-none text-gray-800 text-lg transition-all font-mono tracking-widest uppercase"
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
                            className="px-5 py-4 rounded-2xl bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-40 disabled:cursor-not-allowed text-white text-base font-semibold transition-all whitespace-nowrap"
                          >
                            {referralChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "확인"}
                          </button>
                        </div>
                        {referralValidated !== null && (
                          <div className={`mt-2 flex items-center gap-1.5 text-sm font-medium ${referralValidated.valid ? "text-green-600" : "text-red-500"}`}>
                            {referralValidated.valid
                              ? <><Check className="w-4 h-4" /> {referralValidated.name} 님의 추천 코드가 확인됐습니다.</>
                              : <><X className="w-4 h-4" /> 유효하지 않은 추천인 코드입니다.</>
                            }
                          </div>
                        )}
                      </div>
                    )}

                    {/* 약관 동의 */}
                    <div className="border-t border-gray-100 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-bold text-gray-600">약관 동의</p>
                        <label className="flex items-center gap-2 cursor-pointer group bg-[#1F3864]/5 hover:bg-[#1F3864]/10 px-3 py-1.5 rounded-lg transition-colors">
                          <input
                            type="checkbox"
                            checked={agreeTerms && agreePrivacy && agreeMarketing && (!countryFields.agreeGdpr || agreeGdpr)}
                            onChange={(e) => {
                              setAgreeTerms(e.target.checked);
                              setAgreePrivacy(e.target.checked);
                              setAgreeMarketing(e.target.checked);
                              if (countryFields.agreeGdpr) setAgreeGdpr(e.target.checked);
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]/20"
                          />
                          <span className="text-sm font-bold text-[#1F3864] group-hover:text-[#162a4e] transition-colors">전체 동의</span>
                        </label>
                      </div>

                      <label className="flex items-start gap-4 cursor-pointer group">
                        <input
                          type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]/20"
                        />
                        <span className="text-base text-gray-600 group-hover:text-gray-800 transition-colors leading-relaxed">
                          <span className="text-red-400 font-semibold">[필수]</span>{" "}
                          <a href="/terms" target="_blank" className="text-[#1F3864] underline hover:text-[#162a4e]">이용약관</a>에 동의합니다.
                        </span>
                      </label>

                      <label className="flex items-start gap-4 cursor-pointer group">
                        <input
                          type="checkbox" checked={agreePrivacy} onChange={(e) => setAgreePrivacy(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]/20"
                        />
                        <span className="text-base text-gray-600 group-hover:text-gray-800 transition-colors leading-relaxed">
                          <span className="text-red-400 font-semibold">[필수]</span>{" "}
                          <a href="/privacy" target="_blank" className="text-[#1F3864] underline hover:text-[#162a4e]">개인정보처리방침</a>에 동의합니다.
                        </span>
                      </label>

                      {countryFields.agreeGdpr && (
                        <label className="flex items-start gap-4 cursor-pointer group">
                          <input
                            type="checkbox" checked={agreeGdpr} onChange={(e) => setAgreeGdpr(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#1F3864] focus:ring-[#1F3864]/20"
                          />
                          <span className="text-base text-gray-600 group-hover:text-gray-800 transition-colors leading-relaxed">
                            <span className="text-red-400 font-semibold">[필수 · EU/GDPR]</span>{" "}
                            GDPR에 따른 개인정보 처리에 동의합니다. 언제든지 철회 가능합니다.
                          </span>
                        </label>
                      )}

                      <label className="flex items-start gap-4 cursor-pointer group">
                        <input
                          type="checkbox" checked={agreeMarketing} onChange={(e) => setAgreeMarketing(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#C9A961] focus:ring-[#C9A961]/20"
                        />
                        <span className="text-base text-gray-500 group-hover:text-gray-700 transition-colors leading-relaxed">
                          <span className="text-gray-400 font-medium">[선택]</span>{" "}
                          이벤트·혜택 정보 수신에 동의합니다.
                        </span>
                      </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => { setStep("done"); setShowWelcome(true); }}
                        className="flex-1 border-2 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 py-4 rounded-2xl text-base font-semibold transition-all"
                      >
                        나중에 입력
                      </button>
                      <button
                        type="submit" disabled={isPendingProfile || !profileName.trim() || !agreeTerms || !agreePrivacy}
                        className="flex-[2] bg-[#1F3864] hover:bg-[#162a4e] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        {isPendingProfile
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> 저장 중...</>
                          : "저장하고 시작하기 →"
                        }
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── Step 4: 완료 ── */}
              {step === "done" && !showWelcome && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"
                  >
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-[#1F3864] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {isNewUser ? "가입 완료!" : "로그인 완료!"}
                  </h2>
                  <p className="text-gray-400 text-lg">대시보드로 이동합니다...</p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <div className="text-center mt-6">
            <Link href="/">
              <div className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-base transition-colors cursor-pointer py-2 px-4 rounded-xl hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4" />홈으로 돌아가기
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
