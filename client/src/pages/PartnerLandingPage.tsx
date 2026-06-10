/**
 * 파트너센터 국기 선택 첫 페이지
 * - 전 세계 주요 60개국 지원
 * - 브라우저 언어 자동 감지 + 3초 자동 이동
 * - 국가 검색 기능
 * - 스크롤 가능한 그리드
 */
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, useMemo } from "react";
import { Search } from "lucide-react";

// 전 세계 주요 국가 목록 (지역별 정렬)
const COUNTRIES = [
  // 동아시아
  { code: "KR", flagImg: "https://flagcdn.com/w80/kr.png", lang: "ko", name: "Korea", region: "Asia", locales: ["ko", "ko-KR"] },
  { code: "JP", flagImg: "https://flagcdn.com/w80/jp.png", lang: "ja", name: "Japan", region: "Asia", locales: ["ja", "ja-JP"] },
  { code: "CN", flagImg: "https://flagcdn.com/w80/cn.png", lang: "zh", name: "China", region: "Asia", locales: ["zh-CN", "zh-Hans"] },
  { code: "TW", flagImg: "https://flagcdn.com/w80/tw.png", lang: "zh", name: "Taiwan", region: "Asia", locales: ["zh-TW", "zh-Hant"] },
  { code: "HK", flagImg: "https://flagcdn.com/w80/hk.png", lang: "zh", name: "Hong Kong", region: "Asia", locales: ["zh-HK"] },
  { code: "MN", flagImg: "https://flagcdn.com/w80/mn.png", lang: "en", name: "Mongolia", region: "Asia", locales: ["mn"] },
  // 동남아시아
  { code: "SG", flagImg: "https://flagcdn.com/w80/sg.png", lang: "en", name: "Singapore", region: "Asia", locales: ["en-SG"] },
  { code: "MY", flagImg: "https://flagcdn.com/w80/my.png", lang: "en", name: "Malaysia", region: "Asia", locales: ["ms", "ms-MY"] },
  { code: "VN", flagImg: "https://flagcdn.com/w80/vn.png", lang: "en", name: "Vietnam", region: "Asia", locales: ["vi", "vi-VN"] },
  { code: "TH", flagImg: "https://flagcdn.com/w80/th.png", lang: "en", name: "Thailand", region: "Asia", locales: ["th", "th-TH"] },
  { code: "ID", flagImg: "https://flagcdn.com/w80/id.png", lang: "en", name: "Indonesia", region: "Asia", locales: ["id", "id-ID"] },
  { code: "PH", flagImg: "https://flagcdn.com/w80/ph.png", lang: "en", name: "Philippines", region: "Asia", locales: ["fil", "en-PH"] },
  { code: "MM", flagImg: "https://flagcdn.com/w80/mm.png", lang: "en", name: "Myanmar", region: "Asia", locales: ["my"] },
  { code: "KH", flagImg: "https://flagcdn.com/w80/kh.png", lang: "en", name: "Cambodia", region: "Asia", locales: ["km"] },
  // 남아시아
  { code: "IN", flagImg: "https://flagcdn.com/w80/in.png", lang: "en", name: "India", region: "Asia", locales: ["hi", "en-IN"] },
  { code: "PK", flagImg: "https://flagcdn.com/w80/pk.png", lang: "en", name: "Pakistan", region: "Asia", locales: ["ur"] },
  { code: "BD", flagImg: "https://flagcdn.com/w80/bd.png", lang: "en", name: "Bangladesh", region: "Asia", locales: ["bn"] },
  { code: "LK", flagImg: "https://flagcdn.com/w80/lk.png", lang: "en", name: "Sri Lanka", region: "Asia", locales: ["si"] },
  // 중앙아시아
  { code: "KZ", flagImg: "https://flagcdn.com/w80/kz.png", lang: "en", name: "Kazakhstan", region: "Asia", locales: ["kk"] },
  { code: "UZ", flagImg: "https://flagcdn.com/w80/uz.png", lang: "en", name: "Uzbekistan", region: "Asia", locales: ["uz"] },
  // 중동
  { code: "AE", flagImg: "https://flagcdn.com/w80/ae.png", lang: "en", name: "UAE", region: "Middle East", locales: ["ar-AE"] },
  { code: "SA", flagImg: "https://flagcdn.com/w80/sa.png", lang: "en", name: "Saudi Arabia", region: "Middle East", locales: ["ar-SA"] },
  { code: "QA", flagImg: "https://flagcdn.com/w80/qa.png", lang: "en", name: "Qatar", region: "Middle East", locales: ["ar-QA"] },
  { code: "KW", flagImg: "https://flagcdn.com/w80/kw.png", lang: "en", name: "Kuwait", region: "Middle East", locales: ["ar-KW"] },
  { code: "IL", flagImg: "https://flagcdn.com/w80/il.png", lang: "en", name: "Israel", region: "Middle East", locales: ["he"] },
  { code: "TR", flagImg: "https://flagcdn.com/w80/tr.png", lang: "en", name: "Turkey", region: "Middle East", locales: ["tr"] },
  // 북미
  { code: "US", flagImg: "https://flagcdn.com/w80/us.png", lang: "en", name: "United States", region: "Americas", locales: ["en-US"] },
  { code: "CA", flagImg: "https://flagcdn.com/w80/ca.png", lang: "en", name: "Canada", region: "Americas", locales: ["en-CA", "fr-CA"] },
  { code: "MX", flagImg: "https://flagcdn.com/w80/mx.png", lang: "en", name: "Mexico", region: "Americas", locales: ["es-MX"] },
  // 중남미
  { code: "BR", flagImg: "https://flagcdn.com/w80/br.png", lang: "en", name: "Brazil", region: "Americas", locales: ["pt-BR"] },
  { code: "AR", flagImg: "https://flagcdn.com/w80/ar.png", lang: "en", name: "Argentina", region: "Americas", locales: ["es-AR"] },
  { code: "CO", flagImg: "https://flagcdn.com/w80/co.png", lang: "en", name: "Colombia", region: "Americas", locales: ["es-CO"] },
  { code: "CL", flagImg: "https://flagcdn.com/w80/cl.png", lang: "en", name: "Chile", region: "Americas", locales: ["es-CL"] },
  { code: "PE", flagImg: "https://flagcdn.com/w80/pe.png", lang: "en", name: "Peru", region: "Americas", locales: ["es-PE"] },
  // 서유럽
  { code: "GB", flagImg: "https://flagcdn.com/w80/gb.png", lang: "en", name: "UK", region: "Europe", locales: ["en-GB"] },
  { code: "DE", flagImg: "https://flagcdn.com/w80/de.png", lang: "en", name: "Germany", region: "Europe", locales: ["de", "de-DE"] },
  { code: "FR", flagImg: "https://flagcdn.com/w80/fr.png", lang: "en", name: "France", region: "Europe", locales: ["fr", "fr-FR"] },
  { code: "ES", flagImg: "https://flagcdn.com/w80/es.png", lang: "en", name: "Spain", region: "Europe", locales: ["es-ES"] },
  { code: "IT", flagImg: "https://flagcdn.com/w80/it.png", lang: "en", name: "Italy", region: "Europe", locales: ["it", "it-IT"] },
  { code: "NL", flagImg: "https://flagcdn.com/w80/nl.png", lang: "en", name: "Netherlands", region: "Europe", locales: ["nl"] },
  { code: "BE", flagImg: "https://flagcdn.com/w80/be.png", lang: "en", name: "Belgium", region: "Europe", locales: ["nl-BE", "fr-BE"] },
  { code: "CH", flagImg: "https://flagcdn.com/w80/ch.png", lang: "en", name: "Switzerland", region: "Europe", locales: ["de-CH"] },
  { code: "AT", flagImg: "https://flagcdn.com/w80/at.png", lang: "en", name: "Austria", region: "Europe", locales: ["de-AT"] },
  { code: "SE", flagImg: "https://flagcdn.com/w80/se.png", lang: "en", name: "Sweden", region: "Europe", locales: ["sv"] },
  { code: "NO", flagImg: "https://flagcdn.com/w80/no.png", lang: "en", name: "Norway", region: "Europe", locales: ["nb"] },
  { code: "DK", flagImg: "https://flagcdn.com/w80/dk.png", lang: "en", name: "Denmark", region: "Europe", locales: ["da"] },
  { code: "FI", flagImg: "https://flagcdn.com/w80/fi.png", lang: "en", name: "Finland", region: "Europe", locales: ["fi"] },
  { code: "PT", flagImg: "https://flagcdn.com/w80/pt.png", lang: "en", name: "Portugal", region: "Europe", locales: ["pt-PT"] },
  { code: "PL", flagImg: "https://flagcdn.com/w80/pl.png", lang: "en", name: "Poland", region: "Europe", locales: ["pl"] },
  { code: "GR", flagImg: "https://flagcdn.com/w80/gr.png", lang: "en", name: "Greece", region: "Europe", locales: ["el"] },
  // 동유럽·CIS
  { code: "RU", flagImg: "https://flagcdn.com/w80/ru.png", lang: "en", name: "Russia", region: "Europe", locales: ["ru", "ru-RU"] },
  { code: "UA", flagImg: "https://flagcdn.com/w80/ua.png", lang: "en", name: "Ukraine", region: "Europe", locales: ["uk"] },
  // 오세아니아
  { code: "AU", flagImg: "https://flagcdn.com/w80/au.png", lang: "en", name: "Australia", region: "Oceania", locales: ["en-AU"] },
  { code: "NZ", flagImg: "https://flagcdn.com/w80/nz.png", lang: "en", name: "New Zealand", region: "Oceania", locales: ["en-NZ"] },
  // 아프리카
  { code: "ZA", flagImg: "https://flagcdn.com/w80/za.png", lang: "en", name: "South Africa", region: "Africa", locales: ["en-ZA"] },
  { code: "NG", flagImg: "https://flagcdn.com/w80/ng.png", lang: "en", name: "Nigeria", region: "Africa", locales: ["en-NG"] },
  { code: "EG", flagImg: "https://flagcdn.com/w80/eg.png", lang: "en", name: "Egypt", region: "Africa", locales: ["ar-EG"] },
  { code: "KE", flagImg: "https://flagcdn.com/w80/ke.png", lang: "en", name: "Kenya", region: "Africa", locales: ["sw"] },
  { code: "MA", flagImg: "https://flagcdn.com/w80/ma.png", lang: "en", name: "Morocco", region: "Africa", locales: ["ar-MA"] },
];

/** 브라우저 언어로 국가 코드 감지 */
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
  const primary = (langs[0] || "en").split("-")[0].toLowerCase();
  const langMap: Record<string, string> = {
    ko: "KR", ja: "JP", zh: "CN", de: "DE", es: "ES",
    ar: "SA", fr: "FR", ru: "RU", hi: "IN", pt: "BR",
    vi: "VN", th: "TH", id: "ID", ms: "MY", tr: "TR",
    it: "IT", nl: "NL", sv: "SE", pl: "PL", uk: "UA",
  };
  return langMap[primary] || "US";
}

export default function PartnerLandingPage() {
  const [, navigate] = useLocation();
  const { setLanguage } = useLanguage();
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // 브라우저 언어 감지 → 해당 국가 하이라이트만 (자동 이동 없음)
  useEffect(() => {
    const code = detectCountryCode();
    setDetectedCode(code);
  }, []);

  // 국기 클릭 시 언어 설정 후 이동
  const handleCountrySelect = (lang: string) => {
    setLanguage(lang as "ko" | "en" | "ja" | "zh");
    navigate("/partner/home");
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [search]);

  const detectedCountry = COUNTRIES.find(c => c.code === detectedCode);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#1F3864] via-[#2a4a7a] to-[#1F3864] flex flex-col items-center overflow-hidden"
      style={{ padding: "clamp(12px, 2vh, 28px) clamp(16px, 4vw, 60px)" }}
    >
      {/* 웰컴 메시지 */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="text-center flex-shrink-0" style={{ marginBottom: "clamp(6px, 1.2vh, 16px)" }}
      >
        <p className="text-[#C9A961] font-semibold uppercase"
          style={{ fontSize: "clamp(9px, 0.9vw, 12px)", letterSpacing: "0.15em", marginBottom: "4px" }}>
          Welcome to EverWill
        </p>
        <p className="text-white/75 italic"
          style={{ fontSize: "clamp(10px, 1vw, 14px)", lineHeight: 1.6, maxWidth: "520px" }}>
          We always stand beside our neighbors, practicing a life of warmth and care.{" "}
          <span className="text-white/50">We cheer for your happiness.</span>
        </p>
      </motion.div>

      {/* 타이틀 */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center flex-shrink-0" style={{ marginBottom: "clamp(6px, 1.2vh, 16px)" }}
      >
        <h1 className="font-bold text-white" style={{ fontSize: "clamp(18px, 3vw, 40px)", lineHeight: 1.2 }}>
          EverWill <span className="text-[#C9A961]">Partner Center</span>
        </h1>
        <p className="text-white/60" style={{ fontSize: "clamp(10px, 1.1vw, 14px)", marginTop: "4px" }}>
          {COUNTRIES.length} countries worldwide &nbsp;·&nbsp; 국가를 선택하세요
        </p>
      </motion.div>

      {/* 언어 자동 감지 안내 배너 (자동 이동 없음) */}
      <AnimatePresence>
        {detectedCountry && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 bg-[#C9A961]/15 border border-[#C9A961]/40 rounded-xl px-3 py-1.5 flex-shrink-0"
            style={{ fontSize: "clamp(9px, 0.9vw, 12px)", marginBottom: "clamp(6px, 1vh, 14px)" }}
          >
            <img src={detectedCountry.flagImg} alt={detectedCountry.name} className="w-6 h-4 object-cover rounded-sm" />
            <span className="text-white/80">
              Your language detected:{" "}
              <span className="text-[#C9A961] font-semibold">{detectedCountry.name}</span>
              {" "}— click to continue
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 검색창 */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="relative flex-shrink-0" style={{ width: "min(320px, 90vw)", marginBottom: "clamp(6px, 1.2vh, 16px)" }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
        <input
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 pl-9 pr-4 py-2 outline-none focus:border-[#C9A961]/60 transition-colors"
          style={{ fontSize: "clamp(11px, 1vw, 14px)" }}
        />
      </motion.div>

      {/* 국기 그리드 — 스크롤 가능 */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full flex-1 overflow-y-auto"
        style={{
          maxWidth: "1000px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(201,169,97,0.3) transparent",
        }}
      >
        <div className="grid" style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(70px, 8vw, 100px), 1fr))",
          gap: "clamp(5px, 1vw, 12px)",
          paddingBottom: "8px",
        }}>
          {filtered.map((country, index) => {
            const isDetected = country.code === detectedCode;
            return (
              <motion.button
                key={country.code}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: Math.min(0.03 * index, 0.5) }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCountrySelect(country.lang)}
                className="flex flex-col items-center gap-1 rounded-xl backdrop-blur-sm transition-all"
                style={{
                  padding: "clamp(6px, 1vw, 12px) clamp(3px, 0.5vw, 8px)",
                  background: isDetected ? "rgba(201,169,97,0.25)" : "rgba(255,255,255,0.07)",
                  border: isDetected ? "1.5px solid rgba(201,169,97,0.8)" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: isDetected ? "0 0 14px rgba(201,169,97,0.25)" : "none",
                }}
              >
                <img
                  src={country.flagImg}
                  alt={country.name}
                  className="object-cover rounded-sm"
                  style={{ width: "clamp(30px, 4vw, 52px)", height: "clamp(21px, 2.8vw, 37px)" }}
                />
                <span className="font-medium text-center leading-tight"
                  style={{
                    fontSize: "clamp(7px, 0.75vw, 11px)",
                    color: isDetected ? "#C9A961" : "rgba(255,255,255,0.8)",
                  }}>
                  {country.name}
                </span>
                {isDetected && (
                  <span style={{ fontSize: "clamp(6px, 0.6vw, 9px)", color: "#C9A961", fontWeight: 700 }}>✓ Auto</span>
                )}
              </motion.button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-white/40 py-8" style={{ fontSize: "13px" }}>
              No countries found for "{search}"
            </div>
          )}
        </div>
      </motion.div>

      {/* 하단 카피 */}
      <div className="text-center flex-shrink-0" style={{ marginTop: "clamp(6px, 1vh, 12px)" }}>
        <p className="text-white/30" style={{ fontSize: "clamp(8px, 0.8vw, 11px)" }}>
          EverWill Partner Program — Empowering Professionals Worldwide &nbsp;·&nbsp; © 2026 SARAM Inc.
        </p>
      </div>
    </div>
  );
}
