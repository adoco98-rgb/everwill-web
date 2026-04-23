/**
 * EverWill 네비게이션 바
 * 11개 언어 국기 버튼 UI + IP 기반 자동 언어 감지
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n";

// 11개 언어 국기 목록
const languages: { code: Language; label: string; flag: string }[] = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
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
  const [langOpen, setLangOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const currentLang = languages.find((l) => l.code === language) ?? languages[0];

  // 스크롤 감지
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IP 기반 자동 언어 감지 (최초 1회, 사용자가 직접 변경하지 않은 경우만)
  useEffect(() => {
    const saved = localStorage.getItem("everwill-lang-manual");
    if (saved) return; // 사용자가 직접 선택한 경우 건너뜀

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const countryCode = data.country_code as string;
        const detectedLang = countryToLanguage[countryCode];
        if (detectedLang) {
          setLanguage(detectedLang);
        }
      })
      .catch(() => {
        // 실패 시 브라우저 언어 기반 폴백
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
    setLangOpen(false);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          {/* 로고 */}
          <a href="/" className="flex items-center group">
            <img
              src="/manus-storage/everwill-logo-white-text_9aa1b26e.png"
              alt="EverWill Logo"
              className="h-16 w-auto object-contain"
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
            {/* 국기 언어 선택기 */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
                aria-label="언어 선택"
                aria-expanded={langOpen}
              >
                <span className="text-2xl leading-none">{currentLang.flag}</span>
                <span className="text-xs font-medium text-white/60">{currentLang.code.toUpperCase()}</span>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <>
                    {/* 배경 클릭 닫기 */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setLangOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-3"
                      style={{ direction: "ltr", width: "280px" }}
                      role="menu"
                    >
                      <p className="text-xs text-gray-400 font-medium mb-2 px-1">언어 선택 / Select Language</p>
                      {/* 국기 그리드 */}
                      <div className="grid grid-cols-4 gap-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => handleSetLanguage(lang.code)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl text-center transition-all hover:scale-105 ${
                              language === lang.code
                                ? "bg-[#1F3864] ring-2 ring-[#C9A961]"
                                : "hover:bg-gray-50"
                            }`}
                            role="menuitem"
                            title={lang.label}
                          >
                            <span className="text-2xl leading-none">{lang.flag}</span>
                            <span className={`text-[10px] font-medium leading-tight ${
                              language === lang.code ? "text-white" : "text-gray-600"
                            }`}>
                              {lang.code.toUpperCase()}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                <User className="w-4 h-4" />
                <span>{displayName}</span>
              </button>
            ) : (
              <button
                onClick={() => { window.location.href = getLoginUrl(); }}
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

              {/* 모바일 국기 언어 선택 */}
              <div className="py-3 border-b border-white/5">
                <p className="text-white/40 text-xs mb-3 px-2">언어 선택 / Select Language</p>
                <div className="grid grid-cols-6 gap-2 px-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSetLanguage(lang.code)}
                      className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                        language === lang.code
                          ? "bg-[#C9A961] ring-2 ring-white/50"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                      title={lang.label}
                    >
                      <span className="text-xl leading-none">{lang.flag}</span>
                      <span className={`text-[9px] font-bold ${
                        language === lang.code ? "text-white" : "text-white/60"
                      }`}>
                        {lang.code.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
                    className="w-full text-white/80 py-2.5 text-sm font-medium border border-white/20 rounded-lg flex items-center justify-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    {displayName}
                  </button>
                ) : (
                  <button
                    onClick={() => { window.location.href = getLoginUrl(); }}
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
