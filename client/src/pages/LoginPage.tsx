/**
 * EverWill 로그인/회원가입 페이지 (/login)
 *
 * ── 신규 가입 플로우 ──
 *   Step 1: 이메일 또는 휴대폰 입력 (방법 선택)
 *   Step 2: 기본 정보 + 비밀번호 설정 + 자산 등록 (은행/채권/부동산/기타)
 *   Step 3: 가입 완료
 *
 * ── 재방문 로그인 플로우 ──
 *   Step 1: 이메일/휴대폰 + 비밀번호 입력
 *   Step 2: OTP 자동 발송 → 6자리 입력
 *   Step 3: 로그인 완료 → 대시보드 이동
 */
import { trpc } from "@/lib/trpc";
import AddressSearch from "@/components/write/AddressSearch";
import GlobalAddressSearch from "@/components/write/GlobalAddressSearch";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Mail, Phone, Lock, User, Calendar, Globe,
  Building2, Landmark, TrendingUp, HelpCircle,
  Eye, EyeOff, CheckCircle2, ArrowRight, Loader2, Plus, Trash2,
  MapPin, RefreshCw, Check, X
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

// ─── 타입 정의 ───────────────────────────────────────────────
type PageMode = "login" | "signup";
type LoginStep = "credentials" | "otp" | "done";
type SignupStep = "account" | "info" | "done";
type LoginMethod = "email" | "phone";

interface AssetEntry {
  id: string;
  type: "bank" | "bond" | "real_estate" | "other";
  name: string;
  value: string;
  address?: string; // 부동산 주소
}

// ─── 국가 목록 ───────────────────────────────────────────────
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

// ─── 국가 전화코드 ────────────────────────────────────────────
const PHONE_CODES = [
  { code: "+82", flag: "🇰🇷", name: "한국" },
  { code: "+1",  flag: "🇺🇸", name: "미국/캐나다" },
  { code: "+81", flag: "🇯🇵", name: "일본" },
  { code: "+86", flag: "🇨🇳", name: "중국" },
  { code: "+852",flag: "🇭🇰", name: "홍콩" },
  { code: "+886",flag: "🇹🇼", name: "대만" },
  { code: "+44", flag: "🇬🇧", name: "영국" },
  { code: "+49", flag: "🇩🇪", name: "독일" },
  { code: "+33", flag: "🇫🇷", name: "프랑스" },
  { code: "+34", flag: "🇪🇸", name: "스페인" },
  { code: "+966",flag: "🇸🇦", name: "사우디" },
  { code: "+971",flag: "🇦🇪", name: "UAE" },
  { code: "+61", flag: "🇦🇺", name: "호주" },
  { code: "+7",  flag: "🇷🇺", name: "러시아" },
  { code: "+91", flag: "🇮🇳", name: "인도" },
  { code: "+55", flag: "🇧🇷", name: "브라질" },
];

// ─── 자산 유형 정의 ───────────────────────────────────────────
const ASSET_TYPES = [
  { key: "bank" as const,        label: "은행 예금",  placeholder: "예: 국민은행 보통예금" },
  { key: "bond" as const,        label: "채권/주식",  placeholder: "예: 삼성전자 주식" },
  { key: "real_estate" as const, label: "부동산",     placeholder: "예: 서울 강남구 아파트" },
  { key: "other" as const,       label: "기타 자산",  placeholder: "예: 자동차, 보험, 귀금속" },
];

// ─── 공통 스타일 ──────────────────────────────────────────────
const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition placeholder:text-gray-400";
const labelCls = "block text-sm font-semibold text-[#1F3864] mb-1.5";

// ─── OTP 입력 컴포넌트 ────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const ref4 = useRef<HTMLInputElement>(null);
  const ref5 = useRef<HTMLInputElement>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i].trim() && i > 0) refs[i - 1].current?.focus();
  }
  function handleChange(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = d;
    onChange(next.join("").replace(/ /g, ""));
    if (d && i < 5) refs[i + 1].current?.focus();
  }
  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
    e.preventDefault();
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d.trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:border-[#1F3864] transition border-gray-200 bg-white text-gray-900"
        />
      ))}
    </div>
  );
}

// ─── 비밀번호 강도 표시 ───────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8자 이상", ok: password.length >= 8 },
    { label: "영문 포함", ok: /[a-zA-Z]/.test(password) },
    { label: "숫자 포함", ok: /\d/.test(password) },
    { label: "특수문자", ok: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter(c => c.ok).length;
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  const labels = ["", "약함", "보통", "양호", "강함"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map(c => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-green-600" : "text-gray-400"}`}>
            {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {c.label}
          </span>
        ))}
      </div>
      {score > 0 && <p className={`text-xs font-medium ${score >= 3 ? "text-green-600" : "text-orange-500"}`}>강도: {labels[score]}</p>}
    </div>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────
export default function LoginPage() {
  const [, navigate] = useLocation();
  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const initialMode: PageMode = urlParams.get("mode") === "signup" ? "signup" : "login";
  const returnTo = urlParams.get("returnTo") || "/dashboard";

  // ── 공통 상태 ──
  const [pageMode, setPageMode] = useState<PageMode>(initialMode);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");

  // ── 로그인 상태 ──
  const [loginStep, setLoginStep] = useState<LoginStep>("credentials");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPhoneCode, setLoginPhoneCode] = useState("+82");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginMaskedContact, setLoginMaskedContact] = useState("");
  const [loginE164Phone, setLoginE164Phone] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // ── 회원가입 상태 ──
  const [signupStep, setSignupStep] = useState<SignupStep>("account");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPhoneCode, setSignupPhoneCode] = useState("+82");
  const [signupPhoneVerified, setSignupPhoneVerified] = useState(false);
  const [signupPhoneOtpSent, setSignupPhoneOtpSent] = useState(false);
  const [signupPhoneOtp, setSignupPhoneOtp] = useState("");
  const [signupPhoneE164, setSignupPhoneE164] = useState("");
  const [signupPhoneTimer, setSignupPhoneTimer] = useState(0);
  const [signupName, setSignupName] = useState("");
  const [signupBirth, setSignupBirth] = useState("");
  const [signupCountry, setSignupCountry] = useState("KR");
  const [signupAddress, setSignupAddress] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPw, setSignupConfirmPw] = useState("");
  const [showSignupPw, setShowSignupPw] = useState(false);
  const [showSignupConfirmPw, setShowSignupConfirmPw] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [assetList, setAssetList] = useState<AssetEntry[]>([]);

  // ── OTP 타이머 ──
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer]);

  // ── tRPC mutations ──
  const emailLoginStep1 = trpc.auth.email.loginStep1.useMutation({
    onSuccess: (data) => {
      // 관리자는 OTP 없이 즉시 로그인 완료
      if (data.isAdmin) {
        toast.success("로그인 완료!");
        window.location.href = returnTo;
        return;
      }
      const contact = data.maskedContact ?? "";
      setLoginMaskedContact(contact);
      setLoginStep("otp");
      setOtpTimer(600);
      const channel = data.otpChannel === "sms" ? "SMS" : "이메일";
      toast.success(`인증 코드가 ${channel}(${contact})으로 발송되었습니다`);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const phoneLoginStep1 = trpc.auth.phone.loginStep1.useMutation({
    onSuccess: (data: { maskedPhone: string; phone: string }) => {
      setLoginMaskedContact(data.maskedPhone);
      setLoginE164Phone(data.phone);
      setLoginStep("otp");
      setOtpTimer(600);
      toast.success(`OTP가 ${data.maskedPhone}으로 발송되었습니다`);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const emailLoginStep2 = trpc.auth.email.loginStep2.useMutation({
    onSuccess: () => {
      setLoginStep("done");
      setTimeout(() => navigate(returnTo), 1500);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const phoneLoginStep2 = trpc.auth.phone.loginStep2.useMutation({
    onSuccess: () => {
      setLoginStep("done");
      setTimeout(() => navigate(returnTo), 1500);
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const emailRegister = trpc.auth.email.register.useMutation({
    onSuccess: (_data, variables) => {
      // 가입 완료 후 자동 로그인 시도
      setSignupStep("done");
      emailLoginStep1.mutate(
        { email: variables.email, password: variables.password },
        {
          onSuccess: (loginData) => {
            if (loginData.isAdmin) {
              window.location.href = returnTo;
              return;
            }
            const contact = loginData.maskedContact ?? "";
            setLoginMaskedContact(contact);
            setLoginStep("otp");
            setOtpTimer(600);
            const channel = loginData.otpChannel === "sms" ? "SMS" : "이메일";
            toast.info(`가입 완료! 인증 코드가 ${channel}(${contact})으로 발송되었습니다`);
            setPageMode("login");
          },
          onError: () => {
            // 자동 로그인 실패 시 수동 로그인 안내
            toast.success("가입 완료! 로그인해 주세요.");
          },
        }
      );
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const phoneRegister = trpc.auth.phone.register.useMutation({
    onSuccess: () => setSignupStep("done"),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  // ── 자산 관리 ──
  // ── 금액 포맷 유틸 ──
  // 숫자 → 콤마 표시 (입력용)
  function formatNumberInput(val: string): string {
    const num = val.replace(/[^0-9]/g, "");
    if (!num) return "";
    return parseInt(num, 10).toLocaleString("ko-KR");
  }
  // 숫자 → 만원/억원 단위 표시
  function formatKoreanUnit(val: string): string {
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
    if (!num || isNaN(num)) return "";
    if (num >= 100_000_000) {
      const eok = Math.floor(num / 100_000_000);
      const man = Math.floor((num % 100_000_000) / 10_000);
      return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    }
    if (num >= 10_000) {
      const man = Math.floor(num / 10_000);
      const rest = num % 10_000;
      return rest > 0 ? `${man.toLocaleString()}만 ${rest.toLocaleString()}원` : `${man.toLocaleString()}만원`;
    }
    return `${num.toLocaleString()}원`;
  }
  function addAsset(type: AssetEntry["type"]) {
    setAssetList(prev => [...prev, { id: Math.random().toString(36).slice(2), type, name: "", value: "" }]);
  }
  function removeAsset(id: string) {
    setAssetList(prev => prev.filter(a => a.id !== id));
  }
  function updateAsset(id: string, field: "name" | "value" | "address", val: string) {
    setAssetList(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
  }

  // ── 로그인 핸들러 ──
  function handleLoginStep1(e: React.FormEvent) {
    e.preventDefault();
    if (loginMethod === "email") {
      if (!loginEmail || !loginPassword) return toast.error("이메일과 비밀번호를 입력해주세요");
      emailLoginStep1.mutate({ email: loginEmail, password: loginPassword });
    } else {
      if (!loginPhone || !loginPassword) return toast.error("휴대폰 번호와 비밀번호를 입력해주세요");
      phoneLoginStep1.mutate({ phone: loginPhone, countryCode: loginPhoneCode, password: loginPassword });
    }
  }

  function handleLoginOtp(e: React.FormEvent) {
    e.preventDefault();
    if (loginOtp.length !== 6) return toast.error("6자리 OTP를 입력해주세요");
    if (loginMethod === "email") {
      emailLoginStep2.mutate({ email: loginEmail, code: loginOtp });
    } else {
      phoneLoginStep2.mutate({ phone: loginE164Phone, code: loginOtp });
    }
  }

  function resendOtp() {
    if (otpTimer > 0) return;
    if (loginMethod === "email") {
      emailLoginStep1.mutate({ email: loginEmail, password: loginPassword });
    } else {
      phoneLoginStep1.mutate({ phone: loginPhone, countryCode: loginPhoneCode, password: loginPassword });
    }
  }

  // ── 회원가입 핸들러 ──
  function handleSignupStep1(e: React.FormEvent) {
    e.preventDefault();
    if (loginMethod === "email") {
      if (!signupEmail) return toast.error("이메일을 입력해주세요");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) return toast.error("올바른 이메일 형식이 아닙니다");
    } else {
      if (!signupPhone) return toast.error("휴대폰 번호를 입력해주세요");
    }
    setSignupStep("info");
  }

  function handleSignupStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!signupName.trim()) return toast.error("이름을 입력해주세요");
    // 전화번호 인증은 유언장 인증/결제(Step10) 단계에서 진행 (가입 시 불필요)
    if (!signupPassword) return toast.error("비밀번호를 입력해주세요");
    if (signupPassword.length < 8) return toast.error("비밀번호는 8자 이상이어야 합니다");
    if (signupPassword !== signupConfirmPw) return toast.error("비밀번호가 일치하지 않습니다");
    if (!agreeTerms || !agreePrivacy) return toast.error("필수 약관에 동의해주세요");

    if (loginMethod === "email") {
      emailRegister.mutate({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        phone: signupPhone || "",
        country: signupCountry,
        address: signupAddress || undefined,
      });
    } else {
      phoneRegister.mutate({
        phone: signupPhone,
        countryCode: signupPhoneCode,
        password: signupPassword,
        name: signupName,
        address: signupAddress || undefined,
      });
    }
  }

  // 이메일 가입 시 전화번호 OTP 발송
  const sendVerifyOtp = trpc.auth.phone.sendVerifyOtp.useMutation({
    onSuccess: (data) => {
      setSignupPhoneOtpSent(true);
      setSignupPhoneE164(data.phone);
      setSignupPhoneTimer(180);
      toast.success("인증번호가 발송되었습니다 (3분 유효)");
    },
    onError: (err) => toast.error(err.message),
  });
  // 이메일 가입 시 전화번호 OTP 검증
  const checkVerifyOtp = trpc.auth.phone.checkVerifyOtp.useMutation({
    onSuccess: () => {
      setSignupPhoneVerified(true);
      setSignupPhoneOtpSent(false);
      toast.success("전화번호 인증이 완료되었습니다!");
    },
    onError: (err) => toast.error(err.message),
  });
  // 전화번호 인증 타이머
  useEffect(() => {
    if (signupPhoneTimer <= 0) return;
    const t = setTimeout(() => setSignupPhoneTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [signupPhoneTimer]);
  const isLoading = emailLoginStep1.isPending || phoneLoginStep1.isPending ||
    emailLoginStep2.isPending || phoneLoginStep2.isPending ||
    emailRegister.isPending || phoneRegister.isPending;

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-[#f0f4f8] flex">
      {/* ── 왼쪽 브랜드 패널 (데스크탑) ── */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-[#1F3864] px-12 py-16 shrink-0">
        <div>
          <Link href="/">
            <div className="flex items-center gap-3 mb-16 cursor-pointer">
              <div className="w-10 h-10 bg-[#C9A961] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">EW</span>
              </div>
              <div>
                <p className="text-white font-bold text-xl">EverWill</p>
                <p className="text-white/50 text-xs">Digital Will OS</p>
              </div>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-white leading-tight mb-6">
            나의 마지막 서명,<br />
            <span className="text-[#C9A961]">지금 시작하세요</span>
          </h2>
          <p className="text-white/70 text-base leading-relaxed mb-10">
            유언 작성부터 사후 자동 집행까지.<br />
            세계 최초 디지털 유언 OS
          </p>
          <div className="space-y-4">
            {[
              "유언장 작성 무료 · 언제든 재개 가능",
              "11개 언어 · 195개국 결제 지원",
              "4중 사망 감지 · 자동 집행 시스템",
              "블록체인 무결성 인증",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#C9A961]/20 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#C9A961]" />
                </div>
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-xs">© 2025 주식회사 사람 · EverWill</p>
      </div>

      {/* ── 오른쪽 폼 패널 ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        {/* 모바일 로고 */}
        <Link href="/">
          <div className="flex items-center gap-2 mb-8 lg:hidden cursor-pointer">
            <div className="w-8 h-8 bg-[#1F3864] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EW</span>
            </div>
            <span className="font-bold text-[#1F3864] text-lg">EverWill</span>
          </div>
        </Link>

        <div className="w-full max-w-md">
          {/* ── 탭: 로그인 / 회원가입 ── */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
            {(["login", "signup"] as PageMode[]).map(m => (
              <button
                key={m}
                onClick={() => { setPageMode(m); setLoginStep("credentials"); setSignupStep("account"); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${pageMode === m ? "bg-white text-[#1F3864] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {m === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>

          {/* ── 로그인 방법 선택 (이메일/휴대폰) ── */}
          {((pageMode === "login" && loginStep === "credentials") || (pageMode === "signup" && signupStep === "account")) && (
            <div className="flex gap-2 mb-6">
              {(["email", "phone"] as LoginMethod[]).map(m => (
                <button
                  key={m}
                  onClick={() => setLoginMethod(m)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${loginMethod === m ? "border-[#1F3864] bg-[#1F3864]/5 text-[#1F3864]" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                >
                  {m === "email" ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  {m === "email" ? "이메일" : "휴대폰"}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ════════════════════════════════════════
                로그인 플로우
            ════════════════════════════════════════ */}
            {pageMode === "login" && (
              <motion.div key={`login-${loginStep}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>

                {/* 로그인 Step1: 비밀번호 입력 */}
                {loginStep === "credentials" && (
                  <form onSubmit={handleLoginStep1} className="space-y-5">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold text-[#1F3864]">로그인</h1>
                      <p className="text-gray-500 text-sm mt-1">비밀번호 확인 후 OTP가 자동 발송됩니다</p>
                    </div>

                    {loginMethod === "email" ? (
                      <div>
                        <label className={labelCls}><Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />이메일</label>
                        <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                          placeholder="example@email.com" required autoFocus className={inputCls} />
                      </div>
                    ) : (
                      <div>
                        <label className={labelCls}><Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />휴대폰 번호</label>
                        <div className="flex gap-2">
                          <select value={loginPhoneCode} onChange={e => setLoginPhoneCode(e.target.value)}
                            className={inputCls + " w-32 shrink-0"}>
                            {PHONE_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                          </select>
                          <input type="tel" value={loginPhone} onChange={e => setLoginPhone(e.target.value)}
                            placeholder="010-0000-0000" required className={inputCls} />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className={labelCls}><Lock className="w-4 h-4 inline mr-1.5 text-gray-400" />비밀번호</label>
                      <div className="relative">
                        <input type={showLoginPw ? "text" : "password"} value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          placeholder="비밀번호 입력" required className={inputCls + " pr-12"} />
                        <button type="button" onClick={() => setShowLoginPw(p => !p)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showLoginPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading}
                      className="w-full py-3.5 bg-[#1F3864] hover:bg-[#162a4e] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>다음 — OTP 받기 <ArrowRight className="w-4 h-4" /></>}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                      계정이 없으신가요?{" "}
                      <button type="button" onClick={() => setPageMode("signup")} className="text-[#1F3864] font-semibold hover:underline">
                        회원가입
                      </button>
                    </p>
                  </form>
                )}

                {/* 로그인 Step2: OTP 입력 */}
                {loginStep === "otp" && (
                  <form onSubmit={handleLoginOtp} className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-[#C9A961]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-[#C9A961]" />
                      </div>
                      <h1 className="text-2xl font-bold text-[#1F3864]">OTP 인증</h1>
                      <p className="text-gray-500 text-sm mt-2">
                        <span className="font-semibold text-[#1F3864]">{loginMaskedContact}</span>으로<br />
                        발송된 6자리 코드를 입력해주세요
                      </p>
                    </div>

                    <OtpInput value={loginOtp} onChange={setLoginOtp} />

                    <div className="text-center">
                      {otpTimer > 0 ? (
                        <p className="text-sm text-gray-500">남은 시간: <span className="font-mono font-bold text-[#1F3864]">{formatTimer(otpTimer)}</span></p>
                      ) : (
                        <button type="button" onClick={resendOtp}
                          className="text-sm text-[#1F3864] font-semibold hover:underline flex items-center gap-1 mx-auto">
                          <RefreshCw className="w-4 h-4" /> OTP 재발송
                        </button>
                      )}
                    </div>

                    <button type="submit" disabled={loginOtp.length !== 6 || isLoading}
                      className="w-full py-3.5 bg-[#1F3864] hover:bg-[#162a4e] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>로그인 완료 <CheckCircle2 className="w-4 h-4" /></>}
                    </button>

                    <button type="button" onClick={() => setLoginStep("credentials")}
                      className="w-full text-center text-sm text-gray-500 hover:text-gray-700">
                      ← 이전으로
                    </button>
                  </form>
                )}

                {/* 로그인 완료 */}
                {loginStep === "done" && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1F3864] mb-2">로그인 완료!</h2>
                    <p className="text-gray-500">대시보드로 이동합니다...</p>
                    <Loader2 className="w-6 h-6 animate-spin text-[#C9A961] mx-auto mt-4" />
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════════════════════════
                회원가입 플로우
            ════════════════════════════════════════ */}
            {pageMode === "signup" && (
              <motion.div key={`signup-${signupStep}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>

                {/* 진행 단계 표시 */}
                {signupStep !== "done" && (
                  <div className="flex items-center mb-8">
                    {[
                      { key: "account", label: "계정" },
                      { key: "info",    label: "정보 + 자산" },
                      { key: "done",    label: "완료" },
                    ].map((s, i) => {
                      const stepOrder = ["account", "info", "done"];
                      const current = stepOrder.indexOf(signupStep);
                      const idx = stepOrder.indexOf(s.key);
                      return (
                        <div key={s.key} className="flex items-center flex-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${idx <= current ? "bg-[#1F3864] text-white" : "bg-gray-200 text-gray-400"}`}>
                            {idx < current ? <Check className="w-3.5 h-3.5" /> : i + 1}
                          </div>
                          <span className={`text-xs font-medium ml-1.5 ${idx <= current ? "text-[#1F3864]" : "text-gray-400"}`}>{s.label}</span>
                          {i < 2 && <div className={`flex-1 h-0.5 mx-2 ${idx < current ? "bg-[#1F3864]" : "bg-gray-200"}`} />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 회원가입 Step1: 계정 입력 */}
                {signupStep === "account" && (
                  <form onSubmit={handleSignupStep1} className="space-y-5">
                    <div className="text-center mb-6">
                      <h1 className="text-2xl font-bold text-[#1F3864]">계정 만들기</h1>
                      <p className="text-gray-500 text-sm mt-1">{loginMethod === "email" ? "이메일" : "휴대폰"} 주소를 입력해주세요</p>
                    </div>

                    {loginMethod === "email" ? (
                      <div>
                        <label className={labelCls}><Mail className="w-4 h-4 inline mr-1.5 text-gray-400" />이메일 <span className="text-red-400 font-normal text-xs">(필수)</span></label>
                        <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                          placeholder="example@email.com" required autoFocus className={inputCls} />
                      </div>
                    ) : (
                      <div>
                        <label className={labelCls}><Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />휴대폰 번호 <span className="text-red-400 font-normal text-xs">(필수)</span></label>
                        <div className="flex gap-2">
                          <select value={signupPhoneCode} onChange={e => setSignupPhoneCode(e.target.value)}
                            className={inputCls + " w-32 shrink-0"}>
                            {PHONE_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                          </select>
                          <input type="tel" value={signupPhone} onChange={e => setSignupPhone(e.target.value)}
                            placeholder="010-0000-0000" required className={inputCls} />
                        </div>
                      </div>
                    )}

                    {/* 이메일 가입 시 OTP 발송 채널 안내 */}
                    {loginMethod === "email" && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <span className="text-blue-500 text-sm mt-0.5 shrink-0">ℹ️</span>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          <strong>로그인 인증 방식 안내</strong><br />
                          가입 후 로그인 시 6자리 OTP가 발송됩니다.<br />
                          · 휴대폰 번호를 등록하면 <strong>SMS</strong>로 발송<br />
                          · 번호 미등록 시 <strong>이메일</strong>로 발송 (스팸함 확인)
                        </p>
                      </div>
                    )}

                    <button type="submit"
                      className="w-full py-3.5 bg-[#1F3864] hover:bg-[#162a4e] text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
                      다음 <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-sm text-gray-500">
                      이미 계정이 있으신가요?{" "}
                      <button type="button" onClick={() => setPageMode("login")} className="text-[#1F3864] font-semibold hover:underline">
                        로그인
                      </button>
                    </p>
                  </form>
                )}

                {/* 회원가입 Step2: 정보 + 비밀번호 + 자산 */}
                {signupStep === "info" && (
                  <form onSubmit={handleSignupStep2} className="space-y-5">
                    <div className="text-center mb-4">
                      <h1 className="text-2xl font-bold text-[#1F3864]">기본 정보 입력</h1>
                      <p className="text-gray-500 text-sm mt-1">유언장 작성에 사용됩니다</p>
                    </div>

                    {/* 이름 */}
                    <div>
                      <label className={labelCls}><User className="w-4 h-4 inline mr-1.5 text-gray-400" />이름 <span className="text-red-400 font-normal text-xs">(필수)</span></label>
                      <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)}
                        placeholder="홍길동" required autoFocus className={inputCls} />
                    </div>

                    {/* 생년월일 */}
                    <div>
                      <label className={labelCls}><Calendar className="w-4 h-4 inline mr-1.5 text-gray-400" />생년월일 <span className="text-gray-400 font-normal text-xs">(선택)</span></label>
                      <input type="date" value={signupBirth} onChange={e => setSignupBirth(e.target.value)} className={inputCls} />
                    </div>

                    {/* 거주 국가 */}
                    <div>
                      <label className={labelCls}><Globe className="w-4 h-4 inline mr-1.5 text-gray-400" />거주 국가</label>
                      <select value={signupCountry} onChange={e => setSignupCountry(e.target.value)} className={inputCls}>
                        {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>

                    {/* 주소 - 모든 국가 자동검색 (한국: 카카오, 해외: Google Places) */}
                    <div>
                      <GlobalAddressSearch
                        value={signupAddress}
                        onChange={(addr) => setSignupAddress(addr)}
                        countryCode={signupCountry}
                        label="주소 (선택)"
                        placeholder={signupCountry === "KR" ? "주소 검색 버튼을 눌러주세요" : "Start typing your address..."}
                      />
                    </div>

                    {/* 비밀번호 설정 */}
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-bold text-[#1F3864] mb-4 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-[#C9A961]" /> 비밀번호 설정
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className={labelCls}>비밀번호 <span className="text-red-400 font-normal text-xs">(필수 · 8자 이상)</span></label>
                          <div className="relative">
                            <input type={showSignupPw ? "text" : "password"} value={signupPassword}
                              onChange={e => setSignupPassword(e.target.value)}
                              placeholder="비밀번호 입력" required className={inputCls + " pr-12"} />
                            <button type="button" onClick={() => setShowSignupPw(p => !p)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                              {showSignupPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          <PasswordStrength password={signupPassword} />
                        </div>
                        <div>
                          <label className={labelCls}>비밀번호 확인</label>
                          <div className="relative">
                            <input type={showSignupConfirmPw ? "text" : "password"} value={signupConfirmPw}
                              onChange={e => setSignupConfirmPw(e.target.value)}
                              placeholder="비밀번호 재입력" required className={inputCls + " pr-12"} />
                            <button type="button" onClick={() => setShowSignupConfirmPw(p => !p)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                              {showSignupConfirmPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {signupConfirmPw && signupPassword !== signupConfirmPw && (
                            <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다</p>
                          )}
                          {signupConfirmPw && signupPassword === signupConfirmPw && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> 일치합니다</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 자산 등록 */}
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-sm font-bold text-[#1F3864] mb-1 flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-[#C9A961]" /> 자산 등록 <span className="text-gray-400 font-normal text-xs">(선택 · 나중에도 추가 가능)</span>
                      </p>
                      <p className="text-xs text-gray-400 mb-4">유언장 작성 시 자동으로 불러옵니다</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {ASSET_TYPES.map(at => (
                          <button key={at.key} type="button" onClick={() => addAsset(at.key)}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:border-[#1F3864] hover:text-[#1F3864] hover:bg-[#1F3864]/5 text-sm transition">
                            {at.key === "bank" && <Landmark className="w-4 h-4" />}
                            {at.key === "bond" && <TrendingUp className="w-4 h-4" />}
                            {at.key === "real_estate" && <Building2 className="w-4 h-4" />}
                            {at.key === "other" && <HelpCircle className="w-4 h-4" />}
                            {at.label} <Plus className="w-3.5 h-3.5 ml-auto" />
                          </button>
                        ))}
                      </div>
                      {assetList.length > 0 && (
                        <div className="space-y-3">
                          {assetList.map(asset => {
                            const typeInfo = ASSET_TYPES.find(t => t.key === asset.type)!;
                            return (
                              <div key={asset.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-[#1F3864]">{typeInfo.label}</span>
                                  <button type="button" onClick={() => removeAsset(asset.id)}
                                    className="ml-auto text-gray-400 hover:text-red-500 transition">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                {/* 자산명 입력 (부동산은 주소 자동검색) */}
                                {asset.type === "real_estate" ? (
                                  <div className="mb-2">
                                    <GlobalAddressSearch
                                      value={asset.address || ""}
                                      onChange={(addr) => updateAsset(asset.id, "address", addr)}
                                      countryCode={signupCountry}
                                      label="부동산 주소"
                                      placeholder={signupCountry === "KR" ? "주소 검색 버튼을 눌러주세요" : "Enter property address..."}
                                      showLabel={false}
                                    />
                                    <input type="text" value={asset.name}
                                      onChange={e => updateAsset(asset.id, "name", e.target.value)}
                                      placeholder="예: 아파트, 단독주택, 상가 등 (선택)"
                                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mt-2 focus:outline-none focus:border-[#1F3864] bg-white" />
                                  </div>
                                ) : (
                                  <input type="text" value={asset.name}
                                    onChange={e => updateAsset(asset.id, "name", e.target.value)}
                                    placeholder={typeInfo.placeholder}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-2 focus:outline-none focus:border-[#1F3864] bg-white" />
                                )}
                                {/* 채권/주식: 주식수 입력 / 그 외: 금액 입력 */}
                                {asset.type === "bond" ? (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      value={formatNumberInput(asset.value)}
                                      onChange={e => {
                                        const raw = e.target.value.replace(/[^0-9]/g, "");
                                        updateAsset(asset.id, "value", raw);
                                      }}
                                      placeholder="보유 주식 수"
                                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#1F3864] bg-white pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">주</span>
                                    {asset.value && (
                                      <p className="text-xs text-[#C9A961] font-semibold mt-1 ml-1">
                                        {parseInt(asset.value, 10).toLocaleString("ko-KR")}주 보유
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <>
                                    <div className="relative">
                                      <input
                                        type="text"
                                        inputMode="numeric"
                                        value={formatNumberInput(asset.value)}
                                        onChange={e => {
                                          const raw = e.target.value.replace(/[^0-9]/g, "");
                                          updateAsset(asset.id, "value", raw);
                                        }}
                                        placeholder="자산 가액"
                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#1F3864] bg-white pr-8"
                                      />
                                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">원</span>
                                    </div>
                                    {asset.value && formatKoreanUnit(asset.value) && (
                                      <p className="text-xs text-[#C9A961] font-semibold mt-1 ml-1">
                                        ≈ {formatKoreanUnit(asset.value)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 약관 동의 */}
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <p className="text-sm font-bold text-[#1F3864]">약관 동의</p>
                      {[
                        { state: agreeTerms,     setter: setAgreeTerms,     label: "서비스 이용약관 동의",    required: true },
                        { state: agreePrivacy,   setter: setAgreePrivacy,   label: "개인정보처리방침 동의",   required: true },
                        { state: agreeMarketing, setter: setAgreeMarketing, label: "마케팅 정보 수신 동의",   required: false },
                      ].map((item, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer">
                          <div onClick={() => item.setter(p => !p)}
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition shrink-0 ${item.state ? "bg-[#1F3864] border-[#1F3864]" : "border-gray-300"}`}>
                            {item.state && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-gray-700">
                            {item.required && <span className="text-red-400 mr-1">[필수]</span>}
                            {item.label}
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="button" onClick={() => setSignupStep("account")}
                        className="flex-1 py-3 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition">
                        이전
                      </button>
                      <button type="submit" disabled={isLoading}
                        className="flex-[2] py-3 bg-[#1F3864] hover:bg-[#162a4e] text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-60">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>가입 완료 <CheckCircle2 className="w-4 h-4" /></>}
                      </button>
                    </div>
                  </form>
                )}

                {/* 회원가입 완료 */}
                {signupStep === "done" && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-[#C9A961]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-[#C9A961]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#1F3864] mb-3">가입 완료!</h2>
                    <p className="text-gray-500 mb-2">EverWill에 오신 것을 환영합니다.</p>
                    <p className="text-gray-400 text-sm mb-8">이제 로그인하여 유언장 작성을 시작하세요.</p>
                    <button onClick={() => { setPageMode("login"); setLoginStep("credentials"); setSignupStep("account"); }}
                      className="w-full py-3.5 bg-[#1F3864] hover:bg-[#162a4e] text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
                      로그인하기 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
