/**
 * 파트너센터 - 빈티지 세계지도 배경 + 알파벳 순 국기 그리드
 */
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, useMemo } from "react";
import { Search, X } from "lucide-react";

const COUNTRIES_RAW = [
  { code:"AR", flag:"https://flagcdn.com/w80/ar.png", lang:"en", name:"Argentina",    locales:["es-AR"] },
  { code:"AT", flag:"https://flagcdn.com/w80/at.png", lang:"en", name:"Austria",      locales:["de-AT"] },
  { code:"AU", flag:"https://flagcdn.com/w80/au.png", lang:"en", name:"Australia",    locales:["en-AU"] },
  { code:"BD", flag:"https://flagcdn.com/w80/bd.png", lang:"en", name:"Bangladesh",   locales:["bn"] },
  { code:"BE", flag:"https://flagcdn.com/w80/be.png", lang:"en", name:"Belgium",      locales:["nl-BE","fr-BE"] },
  { code:"BR", flag:"https://flagcdn.com/w80/br.png", lang:"en", name:"Brazil",       locales:["pt-BR"] },
  { code:"CA", flag:"https://flagcdn.com/w80/ca.png", lang:"en", name:"Canada",       locales:["en-CA","fr-CA"] },
  { code:"CH", flag:"https://flagcdn.com/w80/ch.png", lang:"en", name:"Switzerland",  locales:["de-CH"] },
  { code:"CL", flag:"https://flagcdn.com/w80/cl.png", lang:"en", name:"Chile",        locales:["es-CL"] },
  { code:"CN", flag:"https://flagcdn.com/w80/cn.png", lang:"zh", name:"China",        locales:["zh-CN","zh-Hans"] },
  { code:"CO", flag:"https://flagcdn.com/w80/co.png", lang:"en", name:"Colombia",     locales:["es-CO"] },
  { code:"DE", flag:"https://flagcdn.com/w80/de.png", lang:"en", name:"Germany",      locales:["de","de-DE"] },
  { code:"DK", flag:"https://flagcdn.com/w80/dk.png", lang:"en", name:"Denmark",      locales:["da"] },
  { code:"EG", flag:"https://flagcdn.com/w80/eg.png", lang:"en", name:"Egypt",        locales:["ar-EG"] },
  { code:"ES", flag:"https://flagcdn.com/w80/es.png", lang:"en", name:"Spain",        locales:["es-ES"] },
  { code:"FI", flag:"https://flagcdn.com/w80/fi.png", lang:"en", name:"Finland",      locales:["fi"] },
  { code:"FR", flag:"https://flagcdn.com/w80/fr.png", lang:"en", name:"France",       locales:["fr","fr-FR"] },
  { code:"GB", flag:"https://flagcdn.com/w80/gb.png", lang:"en", name:"UK",           locales:["en-GB"] },
  { code:"GR", flag:"https://flagcdn.com/w80/gr.png", lang:"en", name:"Greece",       locales:["el"] },
  { code:"HK", flag:"https://flagcdn.com/w80/hk.png", lang:"zh", name:"Hong Kong",   locales:["zh-HK"] },
  { code:"ID", flag:"https://flagcdn.com/w80/id.png", lang:"en", name:"Indonesia",    locales:["id","id-ID"] },
  { code:"IL", flag:"https://flagcdn.com/w80/il.png", lang:"en", name:"Israel",       locales:["he"] },
  { code:"IN", flag:"https://flagcdn.com/w80/in.png", lang:"en", name:"India",        locales:["hi","en-IN"] },
  { code:"IT", flag:"https://flagcdn.com/w80/it.png", lang:"en", name:"Italy",        locales:["it","it-IT"] },
  { code:"JP", flag:"https://flagcdn.com/w80/jp.png", lang:"ja", name:"Japan",        locales:["ja","ja-JP"] },
  { code:"KE", flag:"https://flagcdn.com/w80/ke.png", lang:"en", name:"Kenya",        locales:["sw"] },
  { code:"KH", flag:"https://flagcdn.com/w80/kh.png", lang:"en", name:"Cambodia",    locales:["km"] },
  { code:"KR", flag:"https://flagcdn.com/w80/kr.png", lang:"ko", name:"Korea",        locales:["ko","ko-KR"] },
  { code:"KW", flag:"https://flagcdn.com/w80/kw.png", lang:"en", name:"Kuwait",       locales:["ar-KW"] },
  { code:"KZ", flag:"https://flagcdn.com/w80/kz.png", lang:"en", name:"Kazakhstan",   locales:["kk"] },
  { code:"LK", flag:"https://flagcdn.com/w80/lk.png", lang:"en", name:"Sri Lanka",    locales:["si"] },
  { code:"MA", flag:"https://flagcdn.com/w80/ma.png", lang:"en", name:"Morocco",      locales:["ar-MA"] },
  { code:"MM", flag:"https://flagcdn.com/w80/mm.png", lang:"en", name:"Myanmar",      locales:["my"] },
  { code:"MN", flag:"https://flagcdn.com/w80/mn.png", lang:"en", name:"Mongolia",     locales:["mn"] },
  { code:"MX", flag:"https://flagcdn.com/w80/mx.png", lang:"en", name:"Mexico",       locales:["es-MX"] },
  { code:"MY", flag:"https://flagcdn.com/w80/my.png", lang:"en", name:"Malaysia",     locales:["ms","ms-MY"] },
  { code:"NG", flag:"https://flagcdn.com/w80/ng.png", lang:"en", name:"Nigeria",      locales:["en-NG"] },
  { code:"NL", flag:"https://flagcdn.com/w80/nl.png", lang:"en", name:"Netherlands",  locales:["nl"] },
  { code:"NO", flag:"https://flagcdn.com/w80/no.png", lang:"en", name:"Norway",       locales:["nb"] },
  { code:"NZ", flag:"https://flagcdn.com/w80/nz.png", lang:"en", name:"New Zealand",  locales:["en-NZ"] },
  { code:"PE", flag:"https://flagcdn.com/w80/pe.png", lang:"en", name:"Peru",         locales:["es-PE"] },
  { code:"PH", flag:"https://flagcdn.com/w80/ph.png", lang:"en", name:"Philippines",  locales:["fil","en-PH"] },
  { code:"PK", flag:"https://flagcdn.com/w80/pk.png", lang:"en", name:"Pakistan",     locales:["ur"] },
  { code:"PL", flag:"https://flagcdn.com/w80/pl.png", lang:"en", name:"Poland",       locales:["pl"] },
  { code:"PT", flag:"https://flagcdn.com/w80/pt.png", lang:"en", name:"Portugal",     locales:["pt-PT"] },
  { code:"QA", flag:"https://flagcdn.com/w80/qa.png", lang:"en", name:"Qatar",        locales:["ar-QA"] },
  { code:"RU", flag:"https://flagcdn.com/w80/ru.png", lang:"en", name:"Russia",       locales:["ru","ru-RU"] },
  { code:"SA", flag:"https://flagcdn.com/w80/sa.png", lang:"en", name:"Saudi Arabia", locales:["ar-SA"] },
  { code:"SE", flag:"https://flagcdn.com/w80/se.png", lang:"en", name:"Sweden",       locales:["sv"] },
  { code:"SG", flag:"https://flagcdn.com/w80/sg.png", lang:"en", name:"Singapore",    locales:["en-SG"] },
  { code:"TH", flag:"https://flagcdn.com/w80/th.png", lang:"en", name:"Thailand",     locales:["th","th-TH"] },
  { code:"TR", flag:"https://flagcdn.com/w80/tr.png", lang:"en", name:"Turkey",       locales:["tr"] },
  { code:"TW", flag:"https://flagcdn.com/w80/tw.png", lang:"zh", name:"Taiwan",       locales:["zh-TW","zh-Hant"] },
  { code:"UA", flag:"https://flagcdn.com/w80/ua.png", lang:"en", name:"Ukraine",      locales:["uk"] },
  { code:"US", flag:"https://flagcdn.com/w80/us.png", lang:"en", name:"United States",locales:["en-US"] },
  { code:"UZ", flag:"https://flagcdn.com/w80/uz.png", lang:"en", name:"Uzbekistan",   locales:["uz"] },
  { code:"VN", flag:"https://flagcdn.com/w80/vn.png", lang:"en", name:"Vietnam",      locales:["vi","vi-VN"] },
  { code:"ZA", flag:"https://flagcdn.com/w80/za.png", lang:"en", name:"South Africa", locales:["en-ZA"] },
  { code:"AE", flag:"https://flagcdn.com/w80/ae.png", lang:"en", name:"UAE",          locales:["ar-AE"] },
];

// 알파벳 순 정렬
const COUNTRIES = [...COUNTRIES_RAW].sort((a, b) => a.name.localeCompare(b.name));

function detectCountryCode(): string {
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    const lower = lang.toLowerCase();
    for (const c of COUNTRIES) {
      if (c.locales.some(l => lower.startsWith(l.toLowerCase()))) return c.code;
    }
  }
  const primary = (langs[0] || "en").split("-")[0].toLowerCase();
  const m: Record<string,string> = { ko:"KR",ja:"JP",zh:"CN",de:"DE",es:"ES",ar:"SA",fr:"FR",ru:"RU",hi:"IN",pt:"BR",vi:"VN",th:"TH",id:"ID",ms:"MY",tr:"TR",it:"IT",nl:"NL",sv:"SE",pl:"PL",uk:"UA" };
  return m[primary] || "US";
}

export default function PartnerLandingPage() {
  const [, navigate] = useLocation();
  const { setLanguage } = useLanguage();
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { setDetectedCode(detectCountryCode()); }, []);

  const handleSelect = (lang: string) => {
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
    <div
      className="w-screen h-screen overflow-hidden flex flex-col relative"
    >
      {/* 빈티지 세계지도 배경 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/manus-storage/old-world-map_19182dae.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.45) sepia(0.2)",
        }}
      />
      {/* 네이비 오버레이 */}
      <div className="absolute inset-0" style={{ background: "rgba(15, 28, 55, 0.72)" }} />

      {/* 헤더 */}
      <div className="relative z-10 flex-shrink-0 text-center pt-4 pb-2 px-4">
        <p className="text-[#C9A961] font-semibold uppercase tracking-widest" style={{ fontSize: "clamp(9px, 0.85vw, 12px)", marginBottom: "3px" }}>
          Welcome to EverWill
        </p>
        <h1 className="font-bold text-white" style={{ fontSize: "clamp(18px, 2.8vw, 38px)", lineHeight: 1.15 }}>
          EverWill <span className="text-[#C9A961]">Partner Center</span>
        </h1>
        <p className="text-white/60 italic" style={{ fontSize: "clamp(9px, 0.9vw, 13px)", marginTop: "2px" }}>
          We always stand beside our neighbors, practicing a life of warmth and care.
        </p>

        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          {/* 언어 감지 배너 */}
          <AnimatePresence>
            {detectedCountry && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1.5 bg-[#C9A961]/20 border border-[#C9A961]/50 rounded-full px-3 py-1"
                style={{ fontSize: "clamp(9px, 0.85vw, 12px)" }}
              >
                <img src={detectedCountry.flag} alt={detectedCountry.name} className="w-5 h-3.5 object-cover rounded-sm" />
                <span className="text-white/80">
                  Detected: <span className="text-[#C9A961] font-semibold">{detectedCountry.name}</span> — click to continue
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 검색창 */}
          <div className="relative" style={{ width: "min(240px, 70vw)" }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 pl-8 pr-7 py-1.5 outline-none focus:border-[#C9A961]/60 transition-colors"
              style={{ fontSize: "clamp(10px, 0.9vw, 13px)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 국기 그리드 — 알파벳 순, 스크롤 가능 */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-4 pb-2"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,169,97,0.3) transparent" }}
      >
        <div
          className="grid mx-auto"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(clamp(72px, 8.5vw, 108px), 1fr))",
            gap: "clamp(5px, 0.8vw, 12px)",
            maxWidth: "1100px",
          }}
        >
          {filtered.map((country, index) => {
            const isDetected = country.code === detectedCode;
            return (
              <motion.button
                key={country.code}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18, delay: Math.min(0.015 * index, 0.5) }}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => handleSelect(country.lang)}
                className="flex flex-col items-center gap-1 rounded-xl transition-all"
                style={{
                  padding: "clamp(6px, 1vw, 14px) clamp(3px, 0.5vw, 8px)",
                  background: isDetected
                    ? "rgba(201,169,97,0.28)"
                    : "rgba(255,255,255,0.08)",
                  border: isDetected
                    ? "1.5px solid rgba(201,169,97,0.85)"
                    : "1px solid rgba(255,255,255,0.15)",
                  boxShadow: isDetected
                    ? "0 0 16px rgba(201,169,97,0.35), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  backdropFilter: "blur(6px)",
                }}
              >
                {/* 국기 */}
                <img
                  src={country.flag}
                  alt={country.name}
                  className="object-cover rounded-sm"
                  style={{
                    width: "clamp(32px, 4.2vw, 58px)",
                    height: "clamp(22px, 3vw, 41px)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                  }}
                />
                {/* 국가명 */}
                <span
                  className="font-medium text-center leading-tight"
                  style={{
                    fontSize: "clamp(7px, 0.78vw, 11px)",
                    color: isDetected ? "#C9A961" : "rgba(255,255,255,0.85)",
                  }}
                >
                  {country.name}
                </span>
                {/* 감지 표시 */}
                {isDetected && (
                  <span style={{ fontSize: "clamp(6px, 0.65vw, 9px)", color: "#C9A961", fontWeight: 700 }}>
                    ✓ Your Language
                  </span>
                )}
              </motion.button>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full text-center text-white/40 py-10" style={{ fontSize: "13px" }}>
              No results for "{search}"
            </div>
          )}
        </div>
      </div>

      {/* 하단 */}
      <div className="relative z-10 flex-shrink-0 text-center pb-2">
        <p className="text-white/30" style={{ fontSize: "clamp(8px, 0.75vw, 11px)" }}>
          EverWill Partner Program — {COUNTRIES.length} countries worldwide · © 2026 SARAM Inc.
        </p>
      </div>
    </div>
  );
}
