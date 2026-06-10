/**
 * 파트너센터 국기 선택 첫 페이지
 * 국기를 클릭하면 해당 국가 언어로 파트너 프로그램 메인 페이지로 이동
 * 화면 전체를 꽉 채우는 레이아웃 (여백 최소화)
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const COUNTRIES = [
  { code: "KR", flagImg: "https://flagcdn.com/w80/kr.png", lang: "ko", name: "한국", nameEn: "Korea" },
  { code: "US", flagImg: "https://flagcdn.com/w80/us.png", lang: "en", name: "미국", nameEn: "United States" },
  { code: "JP", flagImg: "https://flagcdn.com/w80/jp.png", lang: "ja", name: "일본", nameEn: "Japan" },
  { code: "CN", flagImg: "https://flagcdn.com/w80/cn.png", lang: "zh", name: "중국", nameEn: "China" },
  { code: "DE", flagImg: "https://flagcdn.com/w80/de.png", lang: "en", name: "독일", nameEn: "Germany" },
  { code: "ES", flagImg: "https://flagcdn.com/w80/es.png", lang: "en", name: "스페인", nameEn: "Spain" },
  { code: "SA", flagImg: "https://flagcdn.com/w80/sa.png", lang: "en", name: "사우디", nameEn: "Saudi Arabia" },
  { code: "FR", flagImg: "https://flagcdn.com/w80/fr.png", lang: "en", name: "프랑스", nameEn: "France" },
  { code: "RU", flagImg: "https://flagcdn.com/w80/ru.png", lang: "en", name: "러시아", nameEn: "Russia" },
  { code: "IN", flagImg: "https://flagcdn.com/w80/in.png", lang: "en", name: "인도", nameEn: "India" },
  { code: "BR", flagImg: "https://flagcdn.com/w80/br.png", lang: "en", name: "브라질", nameEn: "Brazil" },
  { code: "NZ", flagImg: "https://flagcdn.com/w80/nz.png", lang: "en", name: "뉴질랜드", nameEn: "New Zealand" },
  { code: "AU", flagImg: "https://flagcdn.com/w80/au.png", lang: "en", name: "호주", nameEn: "Australia" },
  { code: "CA", flagImg: "https://flagcdn.com/w80/ca.png", lang: "en", name: "캐나다", nameEn: "Canada" },
];

export default function PartnerLandingPage() {
  const [, navigate] = useLocation();
  const { setLanguage } = useLanguage();

  const handleCountrySelect = (lang: string) => {
    setLanguage(lang as "ko" | "en" | "ja" | "zh");
    navigate("/partner/home");
  };

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
        style={{ marginBottom: "clamp(10px, 2vh, 24px)" }}
      >
        <p
          className="text-[#C9A961] font-semibold tracking-widest uppercase"
          style={{ fontSize: "clamp(10px, 1vw, 13px)", letterSpacing: "0.15em", marginBottom: "8px" }}
        >
          Welcome to EverWill
        </p>
        <p
          className="text-white/80 italic"
          style={{ fontSize: "clamp(11px, 1.2vw, 16px)", lineHeight: 1.7, maxWidth: "600px" }}
        >
          We always stand beside our neighbors,<br />
          practicing a life of warmth and care.<br />
          <span className="text-white/60">We cheer for your happiness.</span>
        </p>
      </motion.div>

      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-center"
        style={{ marginBottom: "clamp(16px, 3vh, 36px)" }}
      >
        <h1
          className="font-bold text-white"
          style={{ fontSize: "clamp(22px, 4vw, 48px)", lineHeight: 1.2 }}
        >
          EverWill <span className="text-[#C9A961]">Partner Center</span>
        </h1>
        <p
          className="text-white/70"
          style={{ fontSize: "clamp(12px, 1.5vw, 18px)", marginTop: "6px" }}
        >
          Select your country to get started &nbsp;·&nbsp; 국가를 선택하세요
        </p>
      </motion.div>

      {/* 국기 그리드 — 7열로 2행 배치 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="grid w-full"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "clamp(8px, 1.5vw, 20px)",
          maxWidth: "900px",
        }}
      >
        {COUNTRIES.map((country, index) => (
          <motion.button
            key={country.code}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, delay: 0.05 * index }}
            whileHover={{ scale: 1.08, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCountrySelect(country.lang)}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/10 hover:border-[#C9A961]/60"
            style={{ padding: "clamp(8px, 1.5vw, 18px) clamp(4px, 0.8vw, 10px)" }}
          >
            <img
              src={country.flagImg}
              alt={country.nameEn}
              className="object-cover rounded-sm"
              style={{ width: "clamp(36px, 5vw, 64px)", height: "clamp(26px, 3.5vw, 46px)" }}
            />
            <span
              className="text-white font-medium text-center leading-tight"
              style={{ fontSize: "clamp(9px, 0.9vw, 13px)" }}
            >
              {country.nameEn}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* 하단 카피 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="text-center"
        style={{ marginTop: "clamp(12px, 2.5vh, 32px)" }}
      >
        <p className="text-white/40" style={{ fontSize: "clamp(10px, 1vw, 13px)" }}>
          EverWill Partner Program — Empowering Professionals Worldwide
        </p>
        <p className="text-white/25" style={{ fontSize: "clamp(9px, 0.85vw, 11px)", marginTop: "4px" }}>
          © 2026 SARAM Inc. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
