/**
 * EverWill 네비게이션 바
 * 디자인: 딥 네이비 배경 + 골드 액센트
 * 스크롤 시 배경 불투명도 변화
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

const navLinks = [
  { label: "서비스", href: "#services" },
  { label: "Badge", href: "#badge" },
  { label: "가격", href: "#pricing" },
  { label: "글로벌", href: "#global" },
  { label: "변호사", href: "#lawyers" },
  { label: "상속세 계산기", href: "/tax", isPage: true },
];

const languages = [
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
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // 관리자 표시명: wadokdo@hanmail.net 또는 admin 역할이면 "사람 매니저"
  const ADMIN_EMAIL = "wadokdo@hanmail.net";
  const displayName = user?.email === ADMIN_EMAIL || user?.role === "admin"
    ? "사람 매니저"
    : user?.name?.split(" ")[0] || "내 계정";

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
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
                key={link.label}
                onClick={() => link.isPage ? navigate(link.href) : handleNavClick(link.href)}
                className={`text-white/80 hover:text-[#C9A961] text-sm font-medium transition-colors duration-200 relative group ${
                  link.label === "상속세 계산기" ? "text-[#C9A961]/80" : ""
                }`}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C9A961] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* 우측 액션 */}
          <div className="hidden lg:flex items-center gap-3">
            {/* 언어 선택 - 국기만 표시 */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-white/80 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/10"
                title={currentLang.label}
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
                    className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[160px] py-1"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang);
                          setLangOpen(false);
                          if (lang.code !== "ko") toast.info(`${lang.label} 지원 예정입니다`);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                          currentLang.code === lang.code
                            ? "text-[#1F3864] font-semibold bg-[#1F3864]/5"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.label}</span>
                        {currentLang.code === lang.code && (
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
                로그인
              </button>
            )}
            <button
              onClick={() => {
                const el = document.querySelector("#pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-gold px-5 py-2 rounded-full text-sm font-semibold"
            >
              무료로 시작하기
            </button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
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
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="w-full text-left text-white/80 hover:text-[#C9A961] py-3 px-2 text-base font-medium transition-colors border-b border-white/5"
                >
                  {link.label}
                </button>
              ))}

              {/* 모바일 언어 선택 */}
              <div className="py-3 border-b border-white/5">
                <p className="text-white/40 text-xs mb-2 px-2">언어 선택</p>
                <div className="flex flex-wrap gap-2 px-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang(lang);
                        if (lang.code !== "ko") toast.info(`${lang.label} 지원 예정입니다`);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        currentLang.code === lang.code
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
                    로그인 / 회원가입
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
                  무료로 시작하기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
