/**
 * EverWill 네비게이션 바
 * 디자인: 딥 네이비 배경 + 골드 액센트
 * 스크롤 시 배경 불투명도 변화
 * 7개 언어 전환 기능 포함
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageFlags, languageNames } from "@/i18n";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const currentLang = languages.find((l) => l.code === language) ?? languages[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 언어 변경 시 드롭다운 닫기
  useEffect(() => {
    setLangOpen(false);
  }, [language]);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // 관리자 표시명
  const ADMIN_EMAIL = "wadokdo@hanmail.net";
  const displayName = user?.email === ADMIN_EMAIL || user?.role === "admin"
    ? t.nav.manager
    : user?.name?.split(" ")[0] || t.nav.myPage;

  // 번역된 nav 링크 목록
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
            {/* 언어 선택 드롭다운 */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
                title={currentLang.label}
                aria-label="언어 선택"
                aria-expanded={langOpen}
              >
                <span className="text-xl leading-none">{currentLang.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[160px] py-1" style={{ direction: 'ltr' }}
                    role="menu"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          language === lang.code
                            ? "text-[#1F3864] font-semibold bg-[#1F3864]/5"
                            : "text-gray-700"
                        }`}
                        role="menuitem"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {language === lang.code && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A961]" />
                        )}
                      </button>
                    ))}
                  </motion.div>
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

              {/* 모바일 언어 선택 */}
              <div className="py-3 border-b border-white/5">
                <p className="text-white/40 text-xs mb-2 px-2">
                  {language === "ar" ? "اختر اللغة" : "언어 선택"}
                </p>
                <div className="flex flex-wrap gap-2 px-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        language === lang.code
                          ? "bg-[#C9A961] text-white font-semibold"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-xs">{lang.label}</span>
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
