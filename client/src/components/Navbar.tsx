/**
 * EverWill 네비게이션 바
 * 11개 언어 국기 버튼 바 (네비게이션 바 하단에 항상 표시)
 * IP 기반 자동 언어 감지
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ChevronDown, LayoutDashboard, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n";

// 11개 언어 국기 목록 (flagcdn 고화질 PNG)
const languages: { code: Language; label: string; flagImg: string }[] = [
  { code: "ko", label: "한국어", flagImg: "https://flagcdn.com/w80/kr.png" },
  { code: "en", label: "English", flagImg: "https://flagcdn.com/w80/us.png" },
  { code: "ja", label: "日本語", flagImg: "https://flagcdn.com/w80/jp.png" },
  { code: "zh", label: "中文", flagImg: "https://flagcdn.com/w80/cn.png" },
  { code: "de", label: "Deutsch", flagImg: "https://flagcdn.com/w80/de.png" },
  { code: "es", label: "Español", flagImg: "https://flagcdn.com/w80/es.png" },
  { code: "ar", label: "العربية", flagImg: "https://flagcdn.com/w80/sa.png" },
  { code: "fr", label: "Français", flagImg: "https://flagcdn.com/w80/fr.png" },
  { code: "ru", label: "Русский", flagImg: "https://flagcdn.com/w80/ru.png" },
  { code: "hi", label: "हिन्दी", flagImg: "https://flagcdn.com/w80/in.png" },
  { code: "pt", label: "Português", flagImg: "https://flagcdn.com/w80/br.png" },
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

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
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IP 기반 자동 언어 감지 (최초 1회, 사용자가 직접 변경하지 않은 경우만)
  useEffect(() => {
    const saved = localStorage.getItem("everwill-lang-manual");
    if (saved) return;

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const countryCode = data.country_code as string;
        const detectedLang = countryToLanguage[countryCode];
        if (detectedLang) setLanguage(detectedLang);
      })
      .catch(() => {
        const browserLang = navigator.language.slice(0, 2);
        const langMap: Record<string, Language> = {
          ko: "ko", en: "en", ja: "ja", zh: "zh",
          de: "de", es: "es", ar: "ar", fr: "fr",
          ru: "ru", hi: "hi", pt: "pt",
        };
        if (langMap[browserLang]) setLanguage(langMap[browserLang]);
      });
  }, []);

  // 언어 수동 변경 핸들러
  const handleSetLanguage = (code: Language) => {
    setLanguage(code);
    localStorage.setItem("everwill-lang-manual", code);
    setMobileOpen(false);
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

  const navLinks = [
    { label: t.nav.services, href: "#services" },
    { label: t.nav.badge, href: "#badge" },
    { label: t.nav.pricing, href: "#pricing" },
    { label: t.nav.global, href: "#global" },
    { label: t.nav.lawyers, href: "#lawyers" },
    { label: t.nav.taxCalc, href: "/tax", isPage: true },
    { label: t.nav.letter ?? "사회기부", href: "/charity", isPage: true },
    { label: "FAQ", href: "/faq", isPage: true },
    { label: "가격 안내", href: "/pricing", isPage: true },
    { label: "유언장 포맷", href: "/will-formats", isPage: true },
  ];

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 로고 */}
          <a href="/" className="flex items-center group">
            <img
              src="/manus-storage/everwill-logo-white-text2_1d48b8ab.png"
              alt="EverWill Logo"
              className="h-14 w-auto object-contain"
            />
          </a>

          {/* 데스크탑 메뉴 */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => link.isPage ? navigate(link.href) : handleNavClick(link.href)}
                className={`text-white/80 hover:text-[#C9A961] text-sm font-medium transition-colors duration-200 relative group ${
                  link.href === "/tax" ? "text-[#C9A961]/80" : ""
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C9A961] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* 우측 액션 */}
          <div className="hidden lg:flex items-center gap-3">
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
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                    >
                      {/* 사용자 정보 헤더 */}
                      <div className="px-4 py-3 bg-[#1F3864]/5 border-b border-gray-100">
                        <p className="text-xs text-gray-500">로그인 중</p>
                        <p className="text-sm font-semibold text-[#1F3864] truncate">{user?.name || user?.email || displayName}</p>
                      </div>

                      {/* 메뉴 항목 */}
                      <div className="py-1">
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/dashboard/profile"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          내 정보 보기 / 수정
                        </button>
                        <button
                          onClick={() => { setUserMenuOpen(false); navigate("/dashboard"); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#1F3864]/5 hover:text-[#1F3864] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-gray-400" />
                          내 대시보드
                        </button>
                      </div>

                      <div className="border-t border-gray-100 py-1">
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
            <button
              onClick={() => {
                const el = document.querySelector("#pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-gold px-5 py-2 rounded-full text-sm font-semibold"
            >
              {t.nav.startFree}
            </button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 국기 언어 선택 바 - 네비게이션 바 하단에 항상 표시 */}
      <div className="border-t border-white/10 bg-[#162d52]/80">
        <div className="w-full">
          <div className="flex items-center justify-center gap-1 py-1.5 overflow-x-auto scrollbar-hide px-4">
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => handleSetLanguage(lang.code)}
                title={lang.label}
                whileHover={{ scale: 1.12, y: -2 }}
                whileTap={{ scale: 0.92 }}
                animate={language === lang.code ? { scale: 1.08 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`relative flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0 ${
                  language === lang.code
                    ? "bg-[#C9A961]/20 ring-1 ring-[#C9A961]"
                    : "hover:bg-white/10"
                }`}
              >
                {/* 선택 시 발광 효과 */}
                {language === lang.code && (
                  <motion.div
                    layoutId="activeLang"
                    className="absolute inset-0 rounded-lg bg-[#C9A961]/15"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <img
                    src={lang.flagImg}
                    alt={lang.label}
                    loading="eager"
                    decoding="async"
                    className={`relative z-10 rounded-sm flex-shrink-0 ${
                      language === lang.code
                        ? "ring-1 ring-[#C9A961] shadow-sm shadow-[#C9A961]/50"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    style={{ width: 32, height: 22, objectFit: "cover", display: "block" }}
                  />
                {/* 국기만 표시 — 코드 레이블 제거 */}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

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

              <div className="pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    {/* 모바일 사용자 정보 */}
                    <div className="bg-white/10 rounded-lg px-3 py-2 mb-1">
                      <p className="text-white/50 text-xs">로그인 중</p>
                      <p className="text-white text-sm font-semibold truncate">{user?.name || user?.email || displayName}</p>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/dashboard/profile"); }}
                      className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      내 정보 보기 / 수정
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                      className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      내 대시보드
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
                    const el = document.querySelector("#pricing");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
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
