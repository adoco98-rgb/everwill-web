/**
 * EverWill 네비게이션 바
 * 11개 언어 국기 버튼 바 (네비게이션 바 하단에 항상 표시)
 * IP 기반 자동 언어 감지
 * 소셜 링크 아이콘 (유튜브, 인스타, 카카오, 라인) - DB에서 관리자가 설정
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ChevronDown, LayoutDashboard, Settings, LogOut, FileText, ScrollText, Users, CreditCard } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n";
import { trpc } from "@/lib/trpc";

// 11개 언어 국기 목록 (flagcdn 고화질 PNG)
const languages: { code: Language; label: string; flagImg: string; countryCode: string }[] = [
  { code: "ko", label: "한국어", flagImg: "https://flagcdn.com/w80/kr.png", countryCode: "KR" },
  { code: "en", label: "English", flagImg: "https://flagcdn.com/w80/us.png", countryCode: "US" },
  { code: "ja", label: "日本語", flagImg: "https://flagcdn.com/w80/jp.png", countryCode: "JP" },
  { code: "zh", label: "中文", flagImg: "https://flagcdn.com/w80/cn.png", countryCode: "CN" },
  { code: "de", label: "Deutsch", flagImg: "https://flagcdn.com/w80/de.png", countryCode: "DE" },
  { code: "es", label: "Español", flagImg: "https://flagcdn.com/w80/es.png", countryCode: "ES" },
  { code: "ar", label: "العربية", flagImg: "https://flagcdn.com/w80/sa.png", countryCode: "SA" },
  { code: "fr", label: "Français", flagImg: "https://flagcdn.com/w80/fr.png", countryCode: "FR" },
  { code: "ru", label: "Русский", flagImg: "https://flagcdn.com/w80/ru.png", countryCode: "RU" },
  { code: "hi", label: "हिन्दी", flagImg: "https://flagcdn.com/w80/in.png", countryCode: "IN" },
  { code: "pt", label: "Português", flagImg: "https://flagcdn.com/w80/br.png", countryCode: "BR" },
];

// IP 기반 국가 → 언어 매핑
const countryToLanguage: Record<string, Language> = {
  KR: "ko", KP: "ko",
  US: "en", GB: "en", AU: "en", CA: "en", NZ: "en", IE: "en", SG: "en",
  JP: "ja",
  CN: "zh", TW: "zh", HK: "zh", MO: "zh",
  DE: "de", AT: "de", CH: "de", LI: "de",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es",
  SA: "ar", AE: "ar", EG: "ar", KW: "ar", QA: "ar", BH: "ar", OM: "ar", JO: "ar", LB: "ar", IQ: "ar",
  FR: "fr", BE: "fr", LU: "fr", MC: "fr", SN: "fr", CI: "fr", CM: "fr",
  RU: "ru", BY: "ru", KZ: "ru", UA: "ru",
  IN: "hi", NP: "hi",
  BR: "pt", PT: "pt", AO: "pt", MZ: "pt",
};

// ─── 소셜 아이콘 SVG 컴포넌트 ───
function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function KakaoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.607 1.563 4.9 3.938 6.3L5 21l4.5-2.813A11.8 11.8 0 0 0 12 18.5c5.523 0 10-3.477 10-7.75S17.523 3 12 3z"/>
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  // 소셜 링크 조회
  const { data: socialLinks } = trpc.siteSettings.getSocialLinks.useQuery();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [location, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 언어 자동 감지 (최초 1회, 수동 선택이 없는 경우만)
  useEffect(() => {
    // URL 파라미터 ?lang=xx 가 있으면 LanguageContext에서 이미 처리
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang") as Language | null;
    if (urlLang) return;

    // 수동 선택이 있으면 덮어쓰지 않음
    const saved = localStorage.getItem("everwill_language") || localStorage.getItem("everwill-lang-manual");
    if (saved) return;

    // LanguageContext의 detectDefaultLanguage()가 브라우저 언어 기반으로 설정함
    // Navbar에서는 별도 감지 없이 LanguageContext 값을 그대로 사용
    // (IP 감지 제거 — 새드박스/서버 IP가 SA로 오감지되는 문제 방지)
  }, []);

  // 언어 → 국가 코드 매핑 (국가 페이지에서 사용)
  const langToCountry: Record<Language, string> = {
    ko: "kr", en: "us", ja: "jp", zh: "cn",
    de: "de", es: "es", ar: "sa", fr: "fr",
    ru: "ru", hi: "in", pt: "br",
  };

  // 현재 URL이 /country/nz, /country/au, /country/ca 인지 확인
  const activeCountryCode = location.startsWith("/country/")
    ? location.split("/country/")[1]?.toLowerCase()
    : null;
  const extraCountryCodes = ["nz", "au", "ca"];
  const isExtraCountryActive = activeCountryCode && extraCountryCodes.includes(activeCountryCode);

  // 언어 수동 변경 핸들러
  const handleSetLanguage = (code: Language) => {
    setMobileOpen(false);
    const hostname = window.location.hostname;
    const isUSDomain = hostname.includes("everwillus.com");
    const isKRDomain = hostname.includes("everwill.co.kr") || hostname.includes("localhost") || hostname.includes("manus.computer");

    // 같은 도메인 내에서 언어 변경 가능한 경우
    if (isKRDomain) {
      setLanguage(code);
      localStorage.setItem("everwill_language", code);
      return;
    }

    // everwillus.com에서 영어 선택 시 현재 도메인 유지
    if (isUSDomain && code === "en") {
      setLanguage(code);
      localStorage.setItem("everwill_language", code);
      return;
    }

    // everwillus.com에서 다른 언어 선택 시 everwill.co.kr로 이동 (언어 파라미터 포함)
    window.location.href = `https://everwill.co.kr?lang=${code}`;
  };

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const ADMIN_EMAIL = "wadokdo@hanmail.net";
  const displayName = user?.email === ADMIN_EMAIL || user?.role === "admin"
    ? t.nav.manager
    : user?.name?.split(" ")[0] || t.nav.myPage;

  // 네비게이션 메뉴 (섹션 순서대로 정렬)
  const navLinks = [
    { label: t.nav.services, href: "#services" },
    { label: t.nav.global, href: "#global" },
    { label: t.nav.lawyers, href: "#lawyers" },
    { label: t.nav.pricing, href: "#pricing" },
    { label: t.nav.badge, href: "/card" },
    { label: t.nav.taxCalc, href: "/tax", isPage: true },
    { label: t.nav.letter ?? "사회기부", href: "/charity", isPage: true },
    { label: "Life Story", href: "/life-story", isPage: true, isPremium: true },
  ];

  // 소셜 링크 목록 (링크가 있는 것만 표시)
  const socialItems = [
    { key: "youtube", url: socialLinks?.youtube, icon: YoutubeIcon, label: "YouTube", hoverColor: "hover:text-red-500" },
    { key: "instagram", url: socialLinks?.instagram, icon: InstagramIcon, label: "Instagram", hoverColor: "hover:text-pink-400" },
    { key: "kakao", url: socialLinks?.kakao, icon: KakaoIcon, label: "KakaoTalk", hoverColor: "hover:text-yellow-400" },
    { key: "line", url: socialLinks?.line, icon: LineIcon, label: "LINE", hoverColor: "hover:text-green-400" },
  ].filter((item) => !!item.url);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      dir="ltr"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1F3864]/95 backdrop-blur-md shadow-lg shadow-[#1F3864]/20"
          : "bg-[#1F3864]"
      }`}
    >
      {/* 메인 네비게이션 바 */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* 로고 - 좌측 고정 (원형 씰 로고) */}
          <a href="/" className="flex items-center shrink-0">
            <img
              src="/everwill-seal.png"
              alt="EverWill Logo"
              className="object-contain drop-shadow-xl"
              style={{ height: '72px', width: '72px' }}
            />
          </a>

          {/* 데스크탑 메뉴 - 중앙 */}
          <div className="hidden lg:flex items-center justify-center gap-3 xl:gap-5">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => link.isPage ? navigate(link.href) : handleNavClick(link.href)}
                className={`whitespace-nowrap text-xs xl:text-sm font-medium transition-colors duration-200 relative group flex items-center gap-1 ${
                  (link as any).isPremium
                    ? "text-[#C9A961] hover:text-[#d4b56e]"
                    : link.href === "/tax"
                    ? "text-[#C9A961]/80 hover:text-[#C9A961]"
                    : "text-white/80 hover:text-[#C9A961]"
                }`}
              >
                {link.label}
                {(link as any).isPremium && (
                  <span className="text-[9px] bg-[#C9A961] text-[#1F3864] font-bold px-1 py-0.5 rounded leading-none">PRO</span>
                )}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C9A961] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* 우측 액션 - grid 3번째 컬럼 */}
          <div className="flex items-center gap-2 justify-end">
          <div className="hidden lg:flex items-center gap-3">
            {/* 소셜 링크 아이콘 */}
            {socialItems.length > 0 && (
              <div className="flex items-center gap-1.5">
                {socialItems.map((item) => (
                  <motion.a
                    key={item.key}
                    href={item.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={item.label}
                    whileHover={{ scale: 1.15, y: -1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 ${item.hoverColor} hover:bg-white/20 transition-all duration-200`}
                  >
                    <item.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                {/* 아이디 버튼 */}
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                  <User className="w-4 h-4" />
                  <span>{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* 드롭다운 메뉴 */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[200]"
                    >
                      {/* 사용자 정보 헤더 */}
                      <div className="px-4 py-3 bg-[#1F3864]/5 border-b border-gray-100">
                        <p className="text-xs text-gray-500">로그인 중</p>
                        <p className="text-sm font-semibold text-[#1F3864] truncate">{user?.name || user?.email || displayName}</p>
                      </div>

                      {/* 메뉴 항목 */}
                      <div className="py-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/dashboard"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          마이홈
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/write"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <FileText className="w-4 h-4 text-gray-400" />
                          유언장 작성
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/dashboard/wills"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <ScrollText className="w-4 h-4 text-gray-400" />
                          내 유언장
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/dashboard/heirs"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <Users className="w-4 h-4 text-gray-400" />
                          상속인 관리
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/payment"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          결제 / 인증
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/dashboard/profile"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          내 정보
                        </button>
                      </div>

                      <div className="border-t border-gray-100">
                        <button
                          onClick={() => { setUserMenuOpen(false); logout(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          로그아웃
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                {t.nav.login}
              </button>
            )}
            {/* 파트너 등록 버튼: URL 직접 접근은 가능, 네비게이션에서는 숨김 */}
            <button
              onClick={() => navigate("/login?mode=signup")}
              className="btn-gold px-4 py-2 rounded-full text-xs xl:text-sm font-semibold whitespace-nowrap"
            >
              {t.nav.startFree}
            </button>
          </div>

          {/* 모바일 전용: 로그인/무료시작 버튼 */}
          <div className="lg:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="text-white/80 hover:text-white text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-1"
              >
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[60px] truncate">{displayName}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-white/80 hover:text-white text-xs font-medium px-2 py-1.5 rounded-lg hover:bg-white/10"
                >
                  {t.nav.login}
                </button>
                <button
                  onClick={() => navigate("/login?mode=signup")}
                  className="btn-gold px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap"
                >
                  {t.nav.startFree}
                </button>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          </div>{/* 우측 액션 end */}
        </div>
      </div>
      {/* 국기 언어 선택 바 - everwillus.com에서는 숨김 */}
      {!window.location.hostname.includes("everwillus.com") && <div className="border-t border-[#C9A961]/20 bg-[#162d52]">
        {/* 모바일: 두 줄 wrap, 데스크탑: 한 줄 */}
        <div className="w-full">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 px-2 sm:px-4 justify-center">
            {/* 현재 선택 언어를 맨 앞에 표시하고 나머지 언어 순서대로 정렬 */}
            {/* NZ·AU·CA 전용 페이지에서는 언어 기반 국기 활성화 비활성화 */}
            {[
              ...languages.filter(l => l.code === language),
              ...languages.filter(l => l.code !== language),
            ].map((lang) => {
              // NZ·AU·CA 페이지에 있을 때는 언어 기반 활성화 표시 안 함
              const isLangActive = !isExtraCountryActive && language === lang.code;
              return (
                <motion.button
                  key={lang.code}
                  layout
                  onClick={() => handleSetLanguage(lang.code)}
                  title={lang.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`relative flex flex-col items-center gap-0.5 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${
                    isLangActive
                      ? "px-2 sm:px-3 py-1 sm:py-1.5 bg-[#C9A961]/25 ring-2 ring-[#C9A961] shadow-lg shadow-[#C9A961]/30"
                      : "px-1.5 sm:px-2 py-0.5 sm:py-1 hover:bg-white/10"
                  }`}
                >
                  {isLangActive && (
                    <motion.div
                      layoutId="activeLang"
                      className="absolute inset-0 rounded-xl bg-[#C9A961]/15"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <img
                    src={lang.flagImg}
                    alt={lang.label}
                    loading="eager"
                    decoding="async"
                    className={`relative z-10 rounded-sm flex-shrink-0 transition-all ${
                      isLangActive
                        ? "ring-2 ring-[#C9A961] shadow-md shadow-[#C9A961]/40"
                        : "opacity-75 hover:opacity-100"
                    }`}
                    style={{
                      width: isLangActive ? 36 : 24,
                      height: isLangActive ? 24 : 16,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <span className={`relative z-10 text-[8px] sm:text-[9px] font-bold mt-0.5 leading-none tracking-wide ${
                    isLangActive ? "text-[#C9A961]" : "text-white/70"
                  }`}>
                    {lang.countryCode}
                  </span>
                </motion.button>
              );
            })}
            {/* 뉴질랜드·호주·캐나다: 국가 전용 페이지로 이동 */}
            {[
              { code: "nz", label: "New Zealand", flagImg: "https://flagcdn.com/w80/nz.png", countryCode: "NZ" },
              { code: "au", label: "Australia", flagImg: "https://flagcdn.com/w80/au.png", countryCode: "AU" },
              { code: "ca", label: "Canada", flagImg: "https://flagcdn.com/w80/ca.png", countryCode: "CA" },
            ].map((extra) => {
              const isActive = activeCountryCode === extra.code;
              return (
                <motion.button
                  key={extra.code}
                  onClick={() => { window.location.href = `https://everwill.co.kr/country/${extra.code}`; setMobileOpen(false); }}
                  title={extra.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`relative flex flex-col items-center gap-0.5 rounded-xl whitespace-nowrap flex-shrink-0 transition-all ${
                    isActive
                      ? "px-2 sm:px-3 py-1 sm:py-1.5 bg-[#C9A961]/25 ring-2 ring-[#C9A961] shadow-lg shadow-[#C9A961]/30"
                      : "px-1.5 sm:px-2 py-0.5 sm:py-1 hover:bg-white/10"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeExtra"
                      className="absolute inset-0 rounded-xl bg-[#C9A961]/15"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <img
                    src={extra.flagImg}
                    alt={extra.label}
                    loading="eager"
                    decoding="async"
                    className={`relative z-10 rounded-sm flex-shrink-0 transition-all ${
                      isActive
                        ? "ring-2 ring-[#C9A961] shadow-md shadow-[#C9A961]/40"
                        : "opacity-75 hover:opacity-100"
                    }`}
                    style={{
                      width: isActive ? 36 : 24,
                      height: isActive ? 24 : 16,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <span className={`relative z-10 text-[8px] sm:text-[9px] font-bold mt-0.5 leading-none tracking-wide ${
                    isActive ? "text-[#C9A961]" : "text-white/70"
                  }`}>
                    {extra.countryCode}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>}
      {/* 모바일 메뉴 */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#1a2f56] border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => link.isPage ? (setMobileOpen(false), navigate(link.href)) : handleNavClick(link.href)}
                  className="w-full text-left text-white/80 hover:text-[#C9A961] py-3 px-2 text-base font-medium transition-colors border-b border-white/5"
                >
                  {link.label}
                </button>
              ))}

              {/* 모바일 소셜 링크 */}
              {socialItems.length > 0 && (
                <div className="flex items-center gap-3 py-3 px-2 border-b border-white/5">
                  <span className="text-white/50 text-xs">팔로우</span>
                  {socialItems.map((item) => (
                    <a
                      key={item.key}
                      href={item.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.label}
                      className={`w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 ${item.hoverColor} transition-colors`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}

              <div className="pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <div className="bg-white/10 rounded-lg px-3 py-2 mb-1">
                      <p className="text-white/50 text-xs">로그인 중</p>
                      <p className="text-white text-sm font-semibold truncate">{user?.name || user?.email || displayName}</p>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/dashboard/profile"); }}
                      className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      내 정보
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                      className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      마이홈
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/write"); }}
                      className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      유언장 작성
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/dashboard/wills"); }}
                      className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                    >
                      <ScrollText className="w-4 h-4" />
                      내 유언장
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/dashboard/heirs"); }}
                      className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      상속인 관리
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/payment"); }}
                      className="w-full text-[#C9A961] py-2.5 text-sm font-medium border border-[#C9A961]/40 rounded-lg flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      결제 / 인증
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); logout(); }}
                      className="w-full text-red-300 py-2.5 text-sm font-medium border border-red-400/30 rounded-lg flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/login"); }}
                    className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg"
                  >
                    {t.nav.login}
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login?mode=signup");
                    setMobileOpen(false);
                  }}
                  className="w-full btn-gold py-2.5 rounded-lg text-sm font-semibold"
                >
                  {t.nav.startFree}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
