/**
 * 파트너센터 국기 선택 첫 페이지
 * - 브라우저 언어(navigator.language) 기반으로 자동 국가 감지
 * - 감지된 국가를 하이라이트 표시 + 3초 후 자동 이동
 * - 수동으로 다른 국가 클릭 시 즉시 이동
 */
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

const COUNTRIES = [
  { code: "KR", flagImg: "https://flagcdn.com/w80/kr.png", lang: "ko", name: "Korea", locales: ["ko", "ko-KR"] },
  { code: "US", flagImg: "https://flagcdn.com/w80/us.png", lang: "en", name: "United States", locales: ["en-US"] },
  { code: "JP", flagImg: "https://flagcdn.com/w80/jp.png", lang: "ja", name: "Japan", locales: ["ja", "ja-JP"] },
  { code: "CN", flagImg: "https://flagcdn.com/w80/cn.png", lang: "zh", name: "China", locales: ["zh", "zh-CN", "zh-Hans"] },
  { code: "DE", flagImg: "https://flagcdn.com/w80/de.png", lang: "en", name: "Germany", locales: ["de", "de-DE"] },
  { code: "ES", flagImg: "https://flagcdn.com/w80/es.png", lang: "en", name: "Spain", locales: ["es", "es-ES"] },
  { code: "SA", flagImg: "https://flagcdn.com/w80/sa.png", lang: "en", name: "Saudi Arabia", locales: ["ar", "ar-SA"] },
  { code: "FR", flagImg: "https://flagcdn.com/w80/fr.png", lang: "en", name: "France", locales: ["fr", "fr-FR"] },
  { code: "RU", flagImg: "https://flagcdn.com/w80/ru.png", lang: "en", name: "Russia", locales: ["ru", "ru-RU"] },
  { code: "IN", flagImg: "https://flagcdn.com/w80/in.png", lang: "en", name: "India", locales: ["hi", "en-IN"] },
  { code: "BR", flagImg: "https://flagcdn.com/w80/br.png", lang: "en", name: "Brazil", locales: ["pt", "pt-BR"] },
  { code: "NZ", flagImg: "https://flagcdn.com/w80/nz.png", lang: "en", name: "New Zealand", locales: ["en-NZ"] },
  { code: "AU", flagImg: "https://flagcdn.com/w80/au.png", lang: "en", name: "Australia", locales: ["en-AU"] },
  { code: "CA", flagImg: "https://flagcdn.com/w80/ca.png", lang: "en", name: "Canada", locales: ["en-CA", "fr-CA"] },
];

/** 브라우저 언어 목록에서 가장 잘 맞는 국가 코드 반환 */
function detectCountryCode(): string {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const lower = lang.toLowerCase();
    for (const country of COUNTRIES) {
      if (country.locales.some(l => lower.startsWith(l.toLowerCase()))) {
        return country.code;
      }
    }
  }
  // 언어 prefix 매칭 (ko → KR, ja → JP 등)
  const primary = (langs[0] || "en").split("-")[0].toLowerCase();
  const langMap: Record<string, string> = {
    ko: "KR", ja: "JP", zh: "CN", de: "DE", es: "ES",
    ar: "SA", fr: "FR", ru: "RU", hi: "IN", pt: "BR",
  };
  return langMap[primary] || "US";
}

const AUTO_REDIRECT_SEC = 3;

export default function PartnerLandingPage() {
  const [, navigate] = useLocation();
  const { setLanguage } = useLanguage();
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SEC);
  const [cancelled, setCancelled] = useState(false);

  // 마운트 시 언어 감지
  useEffect(() => {
    const code = detectCountryCode();
    setDetectedCode(code);
  }, []);

  // 자동 리디렉션 카운트다운
  useEffect(() => {
    if (!detectedCode || cancelled) return;
    if (countdown <= 0) {
      const country = COUNTRIES.find(c => c.code === detectedCode);
      if (country) {
        setLanguage(country.lang as "ko" | "en" | "ja" | "zh");
        navigate("/partner/home");
      }
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [detectedCode, countdown, cancelled]);

  const handleCountrySelect = (code: string, lang: string) => {
    setCancelled(true);
    setLanguage(lang as "ko" | "en" | "ja" | "zh");
    navigate("/partner/home");
  };

  const detectedCountry = COUNTRIES.find(c => c.code === detectedCode);

  return (
    <div
      className="w-screen h-screen bg-gradient-to-br from-[#1F3864] via-[#2a4a7a] to-[#1F3864] flex flex-col items-center justify-center overflow-hidden"
      style={{ padding: "clamp(16px, 3vh, 40px) clamp(16px, 4vw, 60px)" }}
    >
      {/* 웰컴 메시지 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
        style={{ marginBottom: "clamp(10px, 2vh, 20px)" }}
      >
        <p
          className="text-[#C9A961] font-semibold uppercase"
          style={{ fontSize: "clamp(10px, 1vw, 13px)", letterSpacing: "0.15em", marginBottom: "6px" }}
        >
          Welcome to EverWill
        </p>
        <p
          className="text-white/80 italic"
          style={{ fontSize: "clamp(11px, 1.1vw, 15px)", lineHeight: 1.7, maxWidth: "560px" }}
        >
          We always stand beside our neighbors,<br />
          practicing a life of warmth and care.{" "}
          <span className="text-white/60">We cheer for your happiness.</span>
        </p>
      </motion.div>

      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center"
        style={{ marginBottom: "clamp(12px, 2.5vh, 28px)" }}
      >
        <h1
          className="font-bold text-white"
          style={{ fontSize: "clamp(20px, 3.5vw, 44px)", lineHeight: 1.2 }}
        >
          EverWill <span className="text-[#C9A961]">Partner Center</span>
        </h1>
        <p
          className="text-white/70"
          style={{ fontSize: "clamp(11px, 1.3vw, 16px)", marginTop: "5px" }}
        >
          Select your country to get started &nbsp;·&nbsp; 국가를 선택하세요
        </p>
      </motion.div>

      {/* 자동 감지 배너 */}
      <AnimatePresence>
        {detectedCountry && !cancelled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 bg-[#C9A961]/20 border border-[#C9A961]/50 rounded-xl px-4 py-2 text-white"
            style={{ fontSize: "clamp(10px, 1vw, 13px)", marginBottom: "clamp(10px, 2vh, 20px)" }}
          >
            <img src={detectedCountry.flagImg} alt={detectedCountry.name} className="w-7 h-5 object-cover rounded-sm" />
            <span>
              <span className="text-[#C9A961] font-semibold">{detectedCountry.name}</span>
              {" "}detected — redirecting in{" "}
              <span className="font-bold text-[#C9A961]">{countdown}s</span>
            </span>
            <button
              onClick={() => setCancelled(true)}
              className="ml-2 text-white/50 hover:text-white text-xs underline transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 국기 그리드 — 7열 2행 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid w-full"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "clamp(6px, 1.2vw, 18px)",
          maxWidth: "880px",
        }}
      >
        {COUNTRIES.map((country, index) => {
          const isDetected = country.code === detectedCode;
          return (
            <motion.button
              key={country.code}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.04 * index }}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCountrySelect(country.code, country.lang)}
              className="flex flex-col items-center gap-1.5 rounded-xl backdrop-blur-sm transition-all"
              style={{
                padding: "clamp(7px, 1.3vw, 16px) clamp(4px, 0.7vw, 10px)",
                background: isDetected ? "rgba(201,169,97,0.25)" : "rgba(255,255,255,0.08)",
                border: isDetected ? "1.5px solid rgba(201,169,97,0.8)" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: isDetected ? "0 0 16px rgba(201,169,97,0.3)" : "none",
              }}
            >
              <img
                src={country.flagImg}
                alt={country.name}
                className="object-cover rounded-sm"
                style={{ width: "clamp(34px, 4.5vw, 60px)", height: "clamp(24px, 3.2vw, 43px)" }}
              />
              <span
                className="font-medium text-center leading-tight"
                style={{
                  fontSize: "clamp(8px, 0.85vw, 12px)",
                  color: isDetected ? "#C9A961" : "rgba(255,255,255,0.85)",
                }}
              >
                {country.name}
              </span>
              {isDetected && (
                <span
                  className="text-[#C9A961] font-bold"
                  style={{ fontSize: "clamp(7px, 0.7vw, 10px)" }}
                >
                  ✓ Auto
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* 하단 카피 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center"
        style={{ marginTop: "clamp(10px, 2vh, 28px)" }}
      >
        <p className="text-white/40" style={{ fontSize: "clamp(9px, 0.9vw, 12px)" }}>
          EverWill Partner Program — Empowering Professionals Worldwide
        </p>
        <p className="text-white/25" style={{ fontSize: "clamp(8px, 0.8vw, 11px)", marginTop: "3px" }}>
          © 2026 SARAM Inc. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
