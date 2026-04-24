/**
 * EverWill 네비게이션 바
 * 11개 언어 국기 버튼 바 (네비게이션 바 하단에 항상 표시)
 * IP 기반 자동 언어 감지
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/i18n";

// 11개 언어 국기 목록 (twemoji CDN 이미지 사용)
const languages: { code: Language; label: string; flagImg: string }[] = [
  { code: "ko", label: "한국어", flagImg: "https://flagcdn.com/w40/kr.png" },
  { code: "en", label: "English", flagImg: "https://flagcdn.com/w40/us.png" },
  { code: "ja", label: "日本語", flagImg: "https://flagcdn.com/w40/jp.png" },
  { code: "zh", label: "中文", flagImg: "https://flagcdn.com/w40/cn.png" },
  { code: "de", label: "Deutsch", flagImg: "https://flagcdn.com/w40/de.png" },
  { code: "es", label: "Español", flagImg: "https://flagcdn.com/w40/es.png" },
  { code: "ar", label: "العربية", flagImg: "https://flagcdn.com/w40/sa.png" },
  { code: "fr", label: "Français", flagImg: "https://flagcdn.com/w40/fr.png" },
  { code: "ru", label: "Русский", flagImg: "https://flagcdn.com/w40/ru.png" },
  { code: "hi", label: "हिन्दी", flagImg: "https://flagcdn.com/w40/in.png" },
  { code: "pt", label: "Português", flagImg: "https://flagcdn.com/w40/br.png" },
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
  const { user, isAuthenticated } = useAuth();
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
              src="/manus-storage/everwill-logo-white-text_9aa1b26e.png"
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

      {/* 국기 언어 선택 바 - 네비게이션 바 하단에 항상 표시 */}
      <div className="border-t border-white/10 bg-[#162d52]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-1 py-1.5 overflow-x-auto scrollbar-hide">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSetLanguage(lang.code)}
                title={lang.label}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                  language === lang.code
                    ? "bg-[#C9A961]/20 ring-1 ring-[#C9A961]"
                    : "hover:bg-white/10"
                }`}
              >
                <img
                  src={lang.flagImg}
                  alt={lang.label}
                  className={`w-7 h-5 object-cover rounded-sm ${language === lang.code ? "ring-1 ring-[#C9A961]" : ""}`}
                />
                <span className={`text-[10px] font-medium ${language === lang.code ? "text-[#C9A961]" : "text-white/50"}`}>
                  {lang.code.toUpperCase()}
                </span>
              </button>
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
