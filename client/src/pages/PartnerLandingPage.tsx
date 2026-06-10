/**
 * 파트너센터 - 세계지도 SVG 배경 위에 국기 핀 배치
 * - 직접 생성한 SVG 세계지도 (메르카토르 투영, 1000x500)
 * - 각 국가 위경도 → 동일 투영 좌표로 핀 배치
 * - 브라우저 언어 감지 → 해당 국가 골드 펄스 하이라이트
 * - 클릭 시 이동, 호버 시 툴팁
 */
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

// 메르카토르 투영: viewBox 1000x500 기준 픽셀 좌표
// x = (lon + 180) / 360 * 1000
// y = 250 - ln(tan(π/4 + lat*π/360)) * 1000/(2π) * 0.85 + 30
function mercator(lon: number, lat: number): [number, number] {
  const x = (lon + 180) / 360 * 1000;
  const latRad = lat * Math.PI / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 250 - mercN * 1000 / (2 * Math.PI) * 0.85 + 30;
  return [x, y];
}

// 각 국가 수도/중심 위경도
const COUNTRIES_GEO = [
  // 동아시아
  { code:"KR", flag:"https://flagcdn.com/w80/kr.png", lang:"ko", name:"Korea",        lon:127.0, lat:37.5,  locales:["ko","ko-KR"] },
  { code:"JP", flag:"https://flagcdn.com/w80/jp.png", lang:"ja", name:"Japan",         lon:138.0, lat:36.0,  locales:["ja","ja-JP"] },
  { code:"CN", flag:"https://flagcdn.com/w80/cn.png", lang:"zh", name:"China",         lon:104.0, lat:35.0,  locales:["zh-CN","zh-Hans"] },
  { code:"TW", flag:"https://flagcdn.com/w80/tw.png", lang:"zh", name:"Taiwan",        lon:121.0, lat:23.5,  locales:["zh-TW","zh-Hant"] },
  { code:"HK", flag:"https://flagcdn.com/w80/hk.png", lang:"zh", name:"Hong Kong",    lon:114.2, lat:22.3,  locales:["zh-HK"] },
  { code:"MN", flag:"https://flagcdn.com/w80/mn.png", lang:"en", name:"Mongolia",     lon:105.0, lat:46.0,  locales:["mn"] },
  // 동남아
  { code:"SG", flag:"https://flagcdn.com/w80/sg.png", lang:"en", name:"Singapore",    lon:103.8, lat:1.3,   locales:["en-SG"] },
  { code:"MY", flag:"https://flagcdn.com/w80/my.png", lang:"en", name:"Malaysia",     lon:109.7, lat:4.2,   locales:["ms","ms-MY"] },
  { code:"VN", flag:"https://flagcdn.com/w80/vn.png", lang:"en", name:"Vietnam",      lon:108.0, lat:14.0,  locales:["vi","vi-VN"] },
  { code:"TH", flag:"https://flagcdn.com/w80/th.png", lang:"en", name:"Thailand",     lon:101.0, lat:15.0,  locales:["th","th-TH"] },
  { code:"ID", flag:"https://flagcdn.com/w80/id.png", lang:"en", name:"Indonesia",    lon:113.9, lat:-2.5,  locales:["id","id-ID"] },
  { code:"PH", flag:"https://flagcdn.com/w80/ph.png", lang:"en", name:"Philippines",  lon:122.0, lat:13.0,  locales:["fil","en-PH"] },
  { code:"MM", flag:"https://flagcdn.com/w80/mm.png", lang:"en", name:"Myanmar",      lon:96.0,  lat:19.0,  locales:["my"] },
  { code:"KH", flag:"https://flagcdn.com/w80/kh.png", lang:"en", name:"Cambodia",    lon:105.0, lat:12.0,  locales:["km"] },
  // 남아시아
  { code:"IN", flag:"https://flagcdn.com/w80/in.png", lang:"en", name:"India",        lon:78.0,  lat:20.0,  locales:["hi","en-IN"] },
  { code:"PK", flag:"https://flagcdn.com/w80/pk.png", lang:"en", name:"Pakistan",     lon:69.0,  lat:30.0,  locales:["ur"] },
  { code:"BD", flag:"https://flagcdn.com/w80/bd.png", lang:"en", name:"Bangladesh",   lon:90.0,  lat:23.5,  locales:["bn"] },
  { code:"LK", flag:"https://flagcdn.com/w80/lk.png", lang:"en", name:"Sri Lanka",    lon:80.7,  lat:7.9,   locales:["si"] },
  // 중앙아시아
  { code:"KZ", flag:"https://flagcdn.com/w80/kz.png", lang:"en", name:"Kazakhstan",   lon:67.0,  lat:48.0,  locales:["kk"] },
  { code:"UZ", flag:"https://flagcdn.com/w80/uz.png", lang:"en", name:"Uzbekistan",   lon:63.0,  lat:41.0,  locales:["uz"] },
  // 중동
  { code:"AE", flag:"https://flagcdn.com/w80/ae.png", lang:"en", name:"UAE",          lon:54.0,  lat:24.0,  locales:["ar-AE"] },
  { code:"SA", flag:"https://flagcdn.com/w80/sa.png", lang:"en", name:"Saudi Arabia", lon:45.0,  lat:24.0,  locales:["ar-SA"] },
  { code:"QA", flag:"https://flagcdn.com/w80/qa.png", lang:"en", name:"Qatar",        lon:51.2,  lat:25.3,  locales:["ar-QA"] },
  { code:"KW", flag:"https://flagcdn.com/w80/kw.png", lang:"en", name:"Kuwait",       lon:47.5,  lat:29.5,  locales:["ar-KW"] },
  { code:"IL", flag:"https://flagcdn.com/w80/il.png", lang:"en", name:"Israel",       lon:35.0,  lat:31.5,  locales:["he"] },
  { code:"TR", flag:"https://flagcdn.com/w80/tr.png", lang:"en", name:"Turkey",       lon:35.0,  lat:39.0,  locales:["tr"] },
  // 북미
  { code:"US", flag:"https://flagcdn.com/w80/us.png", lang:"en", name:"United States",lon:-100.0,lat:38.0,  locales:["en-US"] },
  { code:"CA", flag:"https://flagcdn.com/w80/ca.png", lang:"en", name:"Canada",       lon:-96.0, lat:56.0,  locales:["en-CA","fr-CA"] },
  { code:"MX", flag:"https://flagcdn.com/w80/mx.png", lang:"en", name:"Mexico",       lon:-102.0,lat:23.0,  locales:["es-MX"] },
  // 중남미
  { code:"BR", flag:"https://flagcdn.com/w80/br.png", lang:"en", name:"Brazil",       lon:-51.0, lat:-10.0, locales:["pt-BR"] },
  { code:"AR", flag:"https://flagcdn.com/w80/ar.png", lang:"en", name:"Argentina",    lon:-64.0, lat:-34.0, locales:["es-AR"] },
  { code:"CO", flag:"https://flagcdn.com/w80/co.png", lang:"en", name:"Colombia",     lon:-74.0, lat:4.0,   locales:["es-CO"] },
  { code:"CL", flag:"https://flagcdn.com/w80/cl.png", lang:"en", name:"Chile",        lon:-71.0, lat:-30.0, locales:["es-CL"] },
  { code:"PE", flag:"https://flagcdn.com/w80/pe.png", lang:"en", name:"Peru",         lon:-76.0, lat:-10.0, locales:["es-PE"] },
  // 서유럽
  { code:"GB", flag:"https://flagcdn.com/w80/gb.png", lang:"en", name:"UK",           lon:-2.0,  lat:54.0,  locales:["en-GB"] },
  { code:"DE", flag:"https://flagcdn.com/w80/de.png", lang:"en", name:"Germany",      lon:10.0,  lat:51.0,  locales:["de","de-DE"] },
  { code:"FR", flag:"https://flagcdn.com/w80/fr.png", lang:"en", name:"France",       lon:2.0,   lat:46.0,  locales:["fr","fr-FR"] },
  { code:"ES", flag:"https://flagcdn.com/w80/es.png", lang:"en", name:"Spain",        lon:-3.5,  lat:40.0,  locales:["es-ES"] },
  { code:"IT", flag:"https://flagcdn.com/w80/it.png", lang:"en", name:"Italy",        lon:12.5,  lat:42.0,  locales:["it","it-IT"] },
  { code:"NL", flag:"https://flagcdn.com/w80/nl.png", lang:"en", name:"Netherlands",  lon:5.3,   lat:52.3,  locales:["nl"] },
  { code:"BE", flag:"https://flagcdn.com/w80/be.png", lang:"en", name:"Belgium",      lon:4.5,   lat:50.5,  locales:["nl-BE","fr-BE"] },
  { code:"CH", flag:"https://flagcdn.com/w80/ch.png", lang:"en", name:"Switzerland",  lon:8.2,   lat:46.8,  locales:["de-CH"] },
  { code:"AT", flag:"https://flagcdn.com/w80/at.png", lang:"en", name:"Austria",      lon:14.5,  lat:47.5,  locales:["de-AT"] },
  { code:"SE", flag:"https://flagcdn.com/w80/se.png", lang:"en", name:"Sweden",       lon:18.0,  lat:62.0,  locales:["sv"] },
  { code:"NO", flag:"https://flagcdn.com/w80/no.png", lang:"en", name:"Norway",       lon:10.0,  lat:64.0,  locales:["nb"] },
  { code:"DK", flag:"https://flagcdn.com/w80/dk.png", lang:"en", name:"Denmark",      lon:10.0,  lat:56.0,  locales:["da"] },
  { code:"FI", flag:"https://flagcdn.com/w80/fi.png", lang:"en", name:"Finland",      lon:26.0,  lat:64.0,  locales:["fi"] },
  { code:"PT", flag:"https://flagcdn.com/w80/pt.png", lang:"en", name:"Portugal",     lon:-8.0,  lat:39.5,  locales:["pt-PT"] },
  { code:"PL", flag:"https://flagcdn.com/w80/pl.png", lang:"en", name:"Poland",       lon:20.0,  lat:52.0,  locales:["pl"] },
  { code:"GR", flag:"https://flagcdn.com/w80/gr.png", lang:"en", name:"Greece",       lon:22.0,  lat:39.0,  locales:["el"] },
  // 동유럽
  { code:"RU", flag:"https://flagcdn.com/w80/ru.png", lang:"en", name:"Russia",       lon:60.0,  lat:60.0,  locales:["ru","ru-RU"] },
  { code:"UA", flag:"https://flagcdn.com/w80/ua.png", lang:"en", name:"Ukraine",      lon:32.0,  lat:49.0,  locales:["uk"] },
  // 오세아니아
  { code:"AU", flag:"https://flagcdn.com/w80/au.png", lang:"en", name:"Australia",    lon:134.0, lat:-25.0, locales:["en-AU"] },
  { code:"NZ", flag:"https://flagcdn.com/w80/nz.png", lang:"en", name:"New Zealand",  lon:172.0, lat:-41.0, locales:["en-NZ"] },
  // 아프리카
  { code:"ZA", flag:"https://flagcdn.com/w80/za.png", lang:"en", name:"South Africa", lon:25.0,  lat:-29.0, locales:["en-ZA"] },
  { code:"NG", flag:"https://flagcdn.com/w80/ng.png", lang:"en", name:"Nigeria",      lon:8.0,   lat:9.0,   locales:["en-NG"] },
  { code:"EG", flag:"https://flagcdn.com/w80/eg.png", lang:"en", name:"Egypt",        lon:30.0,  lat:26.0,  locales:["ar-EG"] },
  { code:"KE", flag:"https://flagcdn.com/w80/ke.png", lang:"en", name:"Kenya",        lon:38.0,  lat:0.0,   locales:["sw"] },
  { code:"MA", flag:"https://flagcdn.com/w80/ma.png", lang:"en", name:"Morocco",      lon:-7.0,  lat:32.0,  locales:["ar-MA"] },
];

// 메르카토르 투영 계산 (viewBox 1000x500)
const COUNTRIES = COUNTRIES_GEO.map(c => {
  const [px, py] = mercator(c.lon, c.lat);
  return { ...c, px, py };
});

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

const MAP_W = 1000, MAP_H = 500;

export default function PartnerLandingPage() {
  const [, navigate] = useLocation();
  const { setLanguage } = useLanguage();
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => { setDetectedCode(detectCountryCode()); }, []);

  const handleSelect = (lang: string) => {
    setLanguage(lang as "ko" | "en" | "ja" | "zh");
    navigate("/partner/home");
  };

  const filtered = search.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  const detectedCountry = COUNTRIES.find(c => c.code === detectedCode);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col"
      style={{ background: "linear-gradient(160deg, #0b1a30 0%, #1F3864 50%, #162d52 100%)" }}
    >
      {/* 헤더 */}
      <div className="flex-shrink-0 text-center z-10 pt-3 pb-1 px-4">
        <p className="text-[#C9A961] font-semibold uppercase tracking-widest" style={{ fontSize: "clamp(9px, 0.8vw, 11px)" }}>
          Welcome to EverWill
        </p>
        <h1 className="font-bold text-white" style={{ fontSize: "clamp(16px, 2.4vw, 34px)", lineHeight: 1.15 }}>
          EverWill <span className="text-[#C9A961]">Partner Center</span>
        </h1>
        <p className="text-white/45 italic" style={{ fontSize: "clamp(9px, 0.8vw, 12px)" }}>
          We always stand beside our neighbors, practicing a life of warmth and care.
        </p>

        <div className="flex items-center justify-center gap-3 mt-1.5 flex-wrap">
          {/* 언어 감지 배너 */}
          <AnimatePresence>
            {detectedCountry && (
              <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                className="inline-flex items-center gap-1.5 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-2.5 py-1"
                style={{ fontSize:"clamp(9px,0.8vw,11px)" }}
              >
                <img src={detectedCountry.flag} alt={detectedCountry.name} className="w-5 h-3.5 object-cover rounded-sm" />
                <span className="text-white/80">
                  Detected: <span className="text-[#C9A961] font-semibold">{detectedCountry.name}</span> — click flag
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 검색 */}
          <div className="relative" style={{ width:"min(220px,60vw)" }}>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 w-3 h-3" />
            <input type="text" placeholder="Search country..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-full text-white placeholder-white/40 pl-7 pr-6 py-1 outline-none focus:border-[#C9A961]/60 transition-colors"
              style={{ fontSize:"clamp(9px,0.8vw,12px)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="flex-1 relative z-10 w-full" style={{ minHeight:0 }}>
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="w-full h-full"
          style={{ display:"block" }}
        >
          {/* 바다 배경 */}
          <rect width={MAP_W} height={MAP_H} fill="#0d2240" />

          {/* 세계지도 SVG (업로드된 파일) */}
          <image
            href="/manus-storage/world_map_3584276f.svg"
            x="0" y="0"
            width={MAP_W} height={MAP_H}
            preserveAspectRatio="xMidYMid meet"
          />

          {/* 국기 핀들 */}
          {filtered.map((country, index) => {
            const isDetected = country.code === detectedCode;
            const isHovered = hovered === country.code;
            const px = country.px;
            const py = country.py;
            const fw = 28, fh = 18;

            return (
              <g key={country.code} style={{ cursor:"pointer" }}
                onClick={() => handleSelect(country.lang)}
                onMouseEnter={() => setHovered(country.code)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* 감지된 국가 펄스 */}
                {isDetected && (
                  <>
                    <circle cx={px} cy={py} r="18" fill="rgba(201,169,97,0.15)">
                      <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={px} cy={py} r="12" fill="rgba(201,169,97,0.2)">
                      <animate attributeName="r" values="10;16;10" dur="2s" begin="0.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    </circle>
                  </>
                )}

                {/* 국기 이미지 */}
                <image
                  href={country.flag}
                  x={px - fw/2}
                  y={py - fh - 4}
                  width={fw}
                  height={fh}
                  style={{
                    filter: isDetected ? "drop-shadow(0 0 4px #C9A961)" : isHovered ? "drop-shadow(0 0 3px rgba(255,255,255,0.6))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
                    transform: isHovered ? `scale(1.4) translate(${-px*(0.4/1.4)}px, ${-py*(0.4/1.4)}px)` : "none",
                    transformOrigin: `${px}px ${py}px`,
                    transition: "transform 0.15s",
                  }}
                />

                {/* 국기 테두리 */}
                <rect
                  x={px - fw/2} y={py - fh - 4}
                  width={fw} height={fh}
                  fill="none"
                  stroke={isDetected ? "#C9A961" : "rgba(255,255,255,0.35)"}
                  strokeWidth={isDetected ? "1.5" : "0.8"}
                  rx="1"
                />

                {/* 핀 꼬리 */}
                <polygon
                  points={`${px-3},${py-4} ${px+3},${py-4} ${px},${py+1}`}
                  fill={isDetected ? "#C9A961" : "rgba(255,255,255,0.4)"}
                />

                {/* 툴팁 */}
                {isHovered && (
                  <g>
                    <rect
                      x={px - 28} y={py - fh - 22}
                      width="56" height="14"
                      rx="3" fill="#1F3864"
                      stroke="rgba(201,169,97,0.5)" strokeWidth="0.8"
                    />
                    <text
                      x={px} y={py - fh - 12}
                      textAnchor="middle"
                      fill="white"
                      fontSize="8"
                      fontFamily="Inter, sans-serif"
                    >
                      {country.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 하단 */}
      <div className="flex-shrink-0 text-center pb-1.5 z-10">
        <p className="text-white/25" style={{ fontSize:"clamp(8px,0.7vw,10px)" }}>
          EverWill Partner Program — {COUNTRIES.length} countries worldwide · © 2026 SARAM Inc.
        </p>
      </div>
    </div>
  );
}
