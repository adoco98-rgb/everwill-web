/**
 * 파트너센터 - 세계지도 위에 국기 핀 배치
 * - SVG 세계지도 배경 (메르카토르 좌표 기반)
 * - 각 국가 위치에 국기 핀
 * - 브라우저 언어 감지 → 해당 국가 하이라이트
 * - 클릭 시 해당 언어로 파트너 홈 이동
 */
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

// 메르카토르 투영 기준 % 좌표 (x: 0~100, y: 0~100)
// 위경도 → x = (lon + 180) / 360 * 100, y = (90 - lat) / 180 * 100
const COUNTRIES = [
  // 동아시아
  { code: "KR", flagImg: "https://flagcdn.com/w80/kr.png", lang: "ko", name: "Korea",       x: 79.5, y: 30.5, locales: ["ko","ko-KR"] },
  { code: "JP", flagImg: "https://flagcdn.com/w80/jp.png", lang: "ja", name: "Japan",        x: 81.5, y: 29.0, locales: ["ja","ja-JP"] },
  { code: "CN", flagImg: "https://flagcdn.com/w80/cn.png", lang: "zh", name: "China",        x: 76.0, y: 31.5, locales: ["zh-CN","zh-Hans"] },
  { code: "TW", flagImg: "https://flagcdn.com/w80/tw.png", lang: "zh", name: "Taiwan",       x: 79.0, y: 34.5, locales: ["zh-TW","zh-Hant"] },
  { code: "HK", flagImg: "https://flagcdn.com/w80/hk.png", lang: "zh", name: "Hong Kong",   x: 78.0, y: 35.5, locales: ["zh-HK"] },
  { code: "MN", flagImg: "https://flagcdn.com/w80/mn.png", lang: "en", name: "Mongolia",    x: 75.0, y: 26.0, locales: ["mn"] },
  // 동남아
  { code: "SG", flagImg: "https://flagcdn.com/w80/sg.png", lang: "en", name: "Singapore",   x: 75.5, y: 42.5, locales: ["en-SG"] },
  { code: "MY", flagImg: "https://flagcdn.com/w80/my.png", lang: "en", name: "Malaysia",    x: 74.5, y: 41.0, locales: ["ms","ms-MY"] },
  { code: "VN", flagImg: "https://flagcdn.com/w80/vn.png", lang: "en", name: "Vietnam",     x: 76.5, y: 38.5, locales: ["vi","vi-VN"] },
  { code: "TH", flagImg: "https://flagcdn.com/w80/th.png", lang: "en", name: "Thailand",    x: 74.5, y: 38.0, locales: ["th","th-TH"] },
  { code: "ID", flagImg: "https://flagcdn.com/w80/id.png", lang: "en", name: "Indonesia",   x: 76.5, y: 44.5, locales: ["id","id-ID"] },
  { code: "PH", flagImg: "https://flagcdn.com/w80/ph.png", lang: "en", name: "Philippines", x: 79.5, y: 38.5, locales: ["fil","en-PH"] },
  { code: "MM", flagImg: "https://flagcdn.com/w80/mm.png", lang: "en", name: "Myanmar",     x: 73.5, y: 36.5, locales: ["my"] },
  { code: "KH", flagImg: "https://flagcdn.com/w80/kh.png", lang: "en", name: "Cambodia",   x: 75.5, y: 39.5, locales: ["km"] },
  // 남아시아
  { code: "IN", flagImg: "https://flagcdn.com/w80/in.png", lang: "en", name: "India",       x: 70.5, y: 37.0, locales: ["hi","en-IN"] },
  { code: "PK", flagImg: "https://flagcdn.com/w80/pk.png", lang: "en", name: "Pakistan",    x: 67.5, y: 33.5, locales: ["ur"] },
  { code: "BD", flagImg: "https://flagcdn.com/w80/bd.png", lang: "en", name: "Bangladesh",  x: 72.5, y: 36.0, locales: ["bn"] },
  { code: "LK", flagImg: "https://flagcdn.com/w80/lk.png", lang: "en", name: "Sri Lanka",   x: 71.0, y: 41.5, locales: ["si"] },
  // 중앙아시아
  { code: "KZ", flagImg: "https://flagcdn.com/w80/kz.png", lang: "en", name: "Kazakhstan",  x: 66.0, y: 26.0, locales: ["kk"] },
  { code: "UZ", flagImg: "https://flagcdn.com/w80/uz.png", lang: "en", name: "Uzbekistan",  x: 64.5, y: 29.5, locales: ["uz"] },
  // 중동
  { code: "AE", flagImg: "https://flagcdn.com/w80/ae.png", lang: "en", name: "UAE",         x: 63.5, y: 37.5, locales: ["ar-AE"] },
  { code: "SA", flagImg: "https://flagcdn.com/w80/sa.png", lang: "en", name: "Saudi Arabia",x: 61.5, y: 37.0, locales: ["ar-SA"] },
  { code: "QA", flagImg: "https://flagcdn.com/w80/qa.png", lang: "en", name: "Qatar",       x: 62.5, y: 37.5, locales: ["ar-QA"] },
  { code: "KW", flagImg: "https://flagcdn.com/w80/kw.png", lang: "en", name: "Kuwait",      x: 61.0, y: 35.5, locales: ["ar-KW"] },
  { code: "IL", flagImg: "https://flagcdn.com/w80/il.png", lang: "en", name: "Israel",      x: 57.5, y: 34.5, locales: ["he"] },
  { code: "TR", flagImg: "https://flagcdn.com/w80/tr.png", lang: "en", name: "Turkey",      x: 56.5, y: 30.5, locales: ["tr"] },
  // 북미
  { code: "US", flagImg: "https://flagcdn.com/w80/us.png", lang: "en", name: "United States",x: 22.0, y: 31.0, locales: ["en-US"] },
  { code: "CA", flagImg: "https://flagcdn.com/w80/ca.png", lang: "en", name: "Canada",      x: 22.0, y: 24.0, locales: ["en-CA","fr-CA"] },
  { code: "MX", flagImg: "https://flagcdn.com/w80/mx.png", lang: "en", name: "Mexico",      x: 19.5, y: 37.5, locales: ["es-MX"] },
  // 중남미
  { code: "BR", flagImg: "https://flagcdn.com/w80/br.png", lang: "en", name: "Brazil",      x: 30.0, y: 52.0, locales: ["pt-BR"] },
  { code: "AR", flagImg: "https://flagcdn.com/w80/ar.png", lang: "en", name: "Argentina",   x: 27.5, y: 62.0, locales: ["es-AR"] },
  { code: "CO", flagImg: "https://flagcdn.com/w80/co.png", lang: "en", name: "Colombia",    x: 24.5, y: 46.0, locales: ["es-CO"] },
  { code: "CL", flagImg: "https://flagcdn.com/w80/cl.png", lang: "en", name: "Chile",       x: 25.5, y: 58.0, locales: ["es-CL"] },
  { code: "PE", flagImg: "https://flagcdn.com/w80/pe.png", lang: "en", name: "Peru",        x: 23.5, y: 51.0, locales: ["es-PE"] },
  // 서유럽
  { code: "GB", flagImg: "https://flagcdn.com/w80/gb.png", lang: "en", name: "UK",          x: 46.5, y: 22.0, locales: ["en-GB"] },
  { code: "DE", flagImg: "https://flagcdn.com/w80/de.png", lang: "en", name: "Germany",     x: 49.5, y: 23.5, locales: ["de","de-DE"] },
  { code: "FR", flagImg: "https://flagcdn.com/w80/fr.png", lang: "en", name: "France",      x: 47.5, y: 25.5, locales: ["fr","fr-FR"] },
  { code: "ES", flagImg: "https://flagcdn.com/w80/es.png", lang: "en", name: "Spain",       x: 46.0, y: 28.5, locales: ["es-ES"] },
  { code: "IT", flagImg: "https://flagcdn.com/w80/it.png", lang: "en", name: "Italy",       x: 50.5, y: 27.5, locales: ["it","it-IT"] },
  { code: "NL", flagImg: "https://flagcdn.com/w80/nl.png", lang: "en", name: "Netherlands", x: 48.5, y: 22.5, locales: ["nl"] },
  { code: "BE", flagImg: "https://flagcdn.com/w80/be.png", lang: "en", name: "Belgium",     x: 48.0, y: 23.5, locales: ["nl-BE","fr-BE"] },
  { code: "CH", flagImg: "https://flagcdn.com/w80/ch.png", lang: "en", name: "Switzerland", x: 49.0, y: 25.5, locales: ["de-CH"] },
  { code: "AT", flagImg: "https://flagcdn.com/w80/at.png", lang: "en", name: "Austria",     x: 50.5, y: 24.5, locales: ["de-AT"] },
  { code: "SE", flagImg: "https://flagcdn.com/w80/se.png", lang: "en", name: "Sweden",      x: 50.5, y: 18.0, locales: ["sv"] },
  { code: "NO", flagImg: "https://flagcdn.com/w80/no.png", lang: "en", name: "Norway",      x: 49.0, y: 17.0, locales: ["nb"] },
  { code: "DK", flagImg: "https://flagcdn.com/w80/dk.png", lang: "en", name: "Denmark",     x: 49.5, y: 20.5, locales: ["da"] },
  { code: "FI", flagImg: "https://flagcdn.com/w80/fi.png", lang: "en", name: "Finland",     x: 52.5, y: 17.5, locales: ["fi"] },
  { code: "PT", flagImg: "https://flagcdn.com/w80/pt.png", lang: "en", name: "Portugal",    x: 44.5, y: 28.0, locales: ["pt-PT"] },
  { code: "PL", flagImg: "https://flagcdn.com/w80/pl.png", lang: "en", name: "Poland",      x: 52.0, y: 22.5, locales: ["pl"] },
  { code: "GR", flagImg: "https://flagcdn.com/w80/gr.png", lang: "en", name: "Greece",      x: 53.0, y: 29.5, locales: ["el"] },
  // 동유럽
  { code: "RU", flagImg: "https://flagcdn.com/w80/ru.png", lang: "en", name: "Russia",      x: 63.0, y: 18.5, locales: ["ru","ru-RU"] },
  { code: "UA", flagImg: "https://flagcdn.com/w80/ua.png", lang: "en", name: "Ukraine",     x: 55.5, y: 24.5, locales: ["uk"] },
  // 오세아니아
  { code: "AU", flagImg: "https://flagcdn.com/w80/au.png", lang: "en", name: "Australia",   x: 80.0, y: 57.0, locales: ["en-AU"] },
  { code: "NZ", flagImg: "https://flagcdn.com/w80/nz.png", lang: "en", name: "New Zealand", x: 85.5, y: 61.0, locales: ["en-NZ"] },
  // 아프리카
  { code: "ZA", flagImg: "https://flagcdn.com/w80/za.png", lang: "en", name: "South Africa",x: 54.0, y: 62.0, locales: ["en-ZA"] },
  { code: "NG", flagImg: "https://flagcdn.com/w80/ng.png", lang: "en", name: "Nigeria",     x: 50.0, y: 46.5, locales: ["en-NG"] },
  { code: "EG", flagImg: "https://flagcdn.com/w80/eg.png", lang: "en", name: "Egypt",       x: 56.0, y: 35.5, locales: ["ar-EG"] },
  { code: "KE", flagImg: "https://flagcdn.com/w80/ke.png", lang: "en", name: "Kenya",       x: 57.5, y: 47.5, locales: ["sw"] },
  { code: "MA", flagImg: "https://flagcdn.com/w80/ma.png", lang: "en", name: "Morocco",     x: 45.5, y: 33.5, locales: ["ar-MA"] },
];

function detectCountryCode(): string {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const lower = lang.toLowerCase();
    for (const country of COUNTRIES) {
      if (country.locales.some(l => lower.startsWith(l.toLowerCase()))) return country.code;
    }
  }
  const primary = (langs[0] || "en").split("-")[0].toLowerCase();
  const langMap: Record<string, string> = {
    ko:"KR", ja:"JP", zh:"CN", de:"DE", es:"ES", ar:"SA", fr:"FR",
    ru:"RU", hi:"IN", pt:"BR", vi:"VN", th:"TH", id:"ID", ms:"MY", tr:"TR",
    it:"IT", nl:"NL", sv:"SE", pl:"PL", uk:"UA",
  };
  return langMap[primary] || "US";
}

export default function PartnerLandingPage() {
  const [, navigate] = useLocation();
  const { setLanguage } = useLanguage();
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tooltip, setTooltip] = useState<{ code: string; x: number; y: number } | null>(null);

  useEffect(() => {
    setDetectedCode(detectCountryCode());
  }, []);

  const handleCountrySelect = (lang: string) => {
    setLanguage(lang as "ko" | "en" | "ja" | "zh");
    navigate("/partner/home");
  };

  const filtered = search.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  const detectedCountry = COUNTRIES.find(c => c.code === detectedCode);

  return (
    <div className="w-screen h-screen overflow-hidden relative flex flex-col"
      style={{ background: "linear-gradient(135deg, #0d1f3c 0%, #1F3864 40%, #2a4a7a 70%, #1a3055 100%)" }}
    >
      {/* 세계지도 SVG 배경 */}
      <div className="absolute inset-0 opacity-20 pointer-events-none select-none flex items-center justify-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png"
          alt="world map"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(0.6) sepia(0.3) hue-rotate(200deg)" }}
        />
      </div>

      {/* 상단 헤더 */}
      <div className="relative z-10 text-center flex-shrink-0 pt-4 pb-2 px-4">
        <p className="text-[#C9A961] font-semibold uppercase tracking-widest" style={{ fontSize: "clamp(9px, 0.85vw, 12px)", marginBottom: "3px" }}>
          Welcome to EverWill
        </p>
        <h1 className="font-bold text-white" style={{ fontSize: "clamp(18px, 2.8vw, 38px)", lineHeight: 1.15 }}>
          EverWill <span className="text-[#C9A961]">Partner Center</span>
        </h1>
        <p className="text-white/50 italic" style={{ fontSize: "clamp(9px, 0.9vw, 13px)", marginTop: "2px" }}>
          We always stand beside our neighbors, practicing a life of warmth and care.
        </p>

        {/* 언어 감지 배너 */}
        <AnimatePresence>
          {detectedCountry && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-3 py-1 mt-2"
              style={{ fontSize: "clamp(9px, 0.85vw, 12px)" }}
            >
              <img src={detectedCountry.flagImg} alt={detectedCountry.name} className="w-5 h-3.5 object-cover rounded-sm" />
              <span className="text-white/80">
                Your language: <span className="text-[#C9A961] font-semibold">{detectedCountry.name}</span> — click the flag to continue
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 검색창 */}
        <div className="relative inline-flex mt-2" style={{ width: "min(260px, 80vw)" }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 pl-8 pr-8 py-1.5 outline-none focus:border-[#C9A961]/60 transition-colors"
            style={{ fontSize: "clamp(10px, 0.9vw, 13px)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 세계지도 + 국기 핀 영역 */}
      <div className="relative z-10 flex-1 w-full" style={{ minHeight: 0 }}>
        <div className="relative w-full h-full">
          {/* 지도 이미지 (클릭 불가, 배경용) */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2560px-World_map_-_low_resolution.svg.png"
            alt="world map"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            style={{ opacity: 0.15, filter: "brightness(1.2) saturate(0.3)" }}
          />

          {/* 국기 핀들 */}
          {filtered.map((country, index) => {
            const isDetected = country.code === detectedCode;
            const isTooltipOpen = tooltip?.code === country.code;
            return (
              <motion.div
                key={country.code}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: Math.min(0.02 * index, 0.6) }}
                className="absolute"
                style={{
                  left: `${country.x}%`,
                  top: `${country.y}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: isDetected ? 20 : isTooltipOpen ? 15 : 10,
                }}
              >
                {/* 감지된 국가 펄스 링 */}
                {isDetected && (
                  <div className="absolute inset-0 rounded-full"
                    style={{
                      width: "clamp(32px, 4vw, 52px)",
                      height: "clamp(32px, 4vw, 52px)",
                      transform: "translate(-50%, -50%) translate(50%, 50%)",
                      background: "rgba(201,169,97,0.3)",
                      animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                  />
                )}

                <motion.button
                  whileHover={{ scale: 1.3, zIndex: 30 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCountrySelect(country.lang)}
                  onMouseEnter={() => setTooltip({ code: country.code, x: country.x, y: country.y })}
                  onMouseLeave={() => setTooltip(null)}
                  className="relative flex flex-col items-center group"
                  title={country.name}
                >
                  {/* 국기 이미지 */}
                  <div
                    className="rounded overflow-hidden shadow-lg"
                    style={{
                      width: "clamp(22px, 2.8vw, 40px)",
                      height: "clamp(15px, 2vw, 28px)",
                      border: isDetected ? "2px solid #C9A961" : "1.5px solid rgba(255,255,255,0.4)",
                      boxShadow: isDetected
                        ? "0 0 12px rgba(201,169,97,0.7), 0 2px 8px rgba(0,0,0,0.5)"
                        : "0 2px 6px rgba(0,0,0,0.4)",
                    }}
                  >
                    <img src={country.flagImg} alt={country.name} className="w-full h-full object-cover" />
                  </div>
                  {/* 핀 꼬리 */}
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: "3px solid transparent",
                    borderRight: "3px solid transparent",
                    borderTop: isDetected ? "5px solid #C9A961" : "5px solid rgba(255,255,255,0.5)",
                  }} />
                </motion.button>

                {/* 툴팁 */}
                {isTooltipOpen && (
                  <div
                    className="absolute bg-[#1F3864] border border-[#C9A961]/50 rounded-lg px-2 py-1 text-white font-medium whitespace-nowrap pointer-events-none"
                    style={{
                      fontSize: "clamp(9px, 0.85vw, 12px)",
                      bottom: "calc(100% + 6px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      zIndex: 50,
                    }}
                  >
                    {country.name}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 하단 */}
      <div className="relative z-10 text-center flex-shrink-0 pb-2">
        <p className="text-white/25" style={{ fontSize: "clamp(8px, 0.75vw, 11px)" }}>
          EverWill Partner Program — {COUNTRIES.length} countries worldwide &nbsp;·&nbsp; © 2026 SARAM Inc.
        </p>
      </div>

      <style>{`
        @keyframes ping {
          75%, 100% { transform: translate(-50%, -50%) translate(50%, 50%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
