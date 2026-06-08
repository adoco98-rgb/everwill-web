/**
 * 파트너센터 국기 선택 첫 페이지
 * 국기를 클릭하면 해당 국가 언어로 파트너 프로그램 메인 페이지로 이동
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

const COUNTRIES = [
  { code: "KR", flag: "🇰🇷", lang: "ko", name: "한국", nameEn: "Korea" },
  { code: "US", flag: "🇺🇸", lang: "en", name: "미국", nameEn: "United States" },
  { code: "JP", flag: "🇯🇵", lang: "ja", name: "일본", nameEn: "Japan" },
  { code: "CN", flag: "🇨🇳", lang: "zh", name: "중국", nameEn: "China" },
  { code: "DE", flag: "🇩🇪", lang: "en", name: "독일", nameEn: "Germany" },
  { code: "ES", flag: "🇪🇸", lang: "en", name: "스페인", nameEn: "Spain" },
  { code: "FR", flag: "🇫🇷", lang: "en", name: "프랑스", nameEn: "France" },
  { code: "GB", flag: "🇬🇧", lang: "en", name: "영국", nameEn: "United Kingdom" },
  { code: "AU", flag: "🇦🇺", lang: "en", name: "호주", nameEn: "Australia" },
  { code: "CA", flag: "🇨🇦", lang: "en", name: "캐나다", nameEn: "Canada" },
  { code: "SA", flag: "🇸🇦", lang: "en", name: "사우디", nameEn: "Saudi Arabia" },
  { code: "IN", flag: "🇮🇳", lang: "en", name: "인도", nameEn: "India" },
];

export default function PartnerLandingPage() {
  const [, navigate] = useLocation();
  const { setLanguage } = useLanguage();

  const handleCountrySelect = (lang: string) => {
    setLanguage(lang as "ko" | "en" | "ja" | "zh");
    navigate("/partner/home");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F3864] via-[#2a4a7a] to-[#1F3864] flex flex-col items-center justify-center px-4">
      {/* 로고 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          EverWill <span className="text-[#C9A961]">Partner Center</span>
        </h1>
        <p className="text-white/70 text-lg">Select your country to get started</p>
        <p className="text-white/50 text-sm mt-1">국가를 선택하세요</p>
      </motion.div>

      {/* 국기 그리드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 md:gap-6 max-w-4xl"
      >
        {COUNTRIES.map((country, index) => (
          <motion.button
            key={country.code}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCountrySelect(country.lang)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all border border-white/10 hover:border-[#C9A961]/50"
          >
            <span className="text-5xl md:text-6xl">{country.flag}</span>
            <span className="text-white text-xs font-medium">{country.nameEn}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* 하단 안내 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16 text-center"
      >
        <p className="text-white/40 text-sm">
          EverWill Partner Program — Empowering Professionals Worldwide
        </p>
        <p className="text-white/30 text-xs mt-2">
          © 2026 SARAM Inc. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
