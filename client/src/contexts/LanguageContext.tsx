/**
 * 언어 Context/Provider
 * IP 위치 기반 자동 언어 감지 + 전역 언어 상태 관리 + RTL 지원
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, RTL_LANGUAGES, translations, TranslationKeys } from "@/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
  /** 도메인으로 언어가 고정된 경우 true */
  isLanguageLocked: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "everwill_language";
const GEO_DETECTED_KEY = "everwill_geo_detected"; // IP 감지 완료 여부

/** 도메인 기반 언어 고정 매핑 (전용 도메인만) */
const DOMAIN_LANGUAGE_MAP: Record<string, Language> = {
  "everwillus.com": "en",
  "www.everwillus.com": "en",
  "everwillusa.com": "en",
  "www.everwillusa.com": "en",
  "everwilljp.com": "ja",
  "www.everwilljp.com": "ja",
  "everwillde.com": "de",
  "www.everwillde.com": "de",
  "everwillcn.com": "zh",
  "www.everwillcn.com": "zh",
  "everwilles.com": "es",
  "www.everwilles.com": "es",
  "everwillfr.com": "fr",
  "www.everwillfr.com": "fr",
  "everwillar.com": "ar",
  "www.everwillar.com": "ar",
  "everwillin.com": "hi",
  "www.everwillin.com": "hi",
  "everwillru.com": "ru",
  "www.everwillru.com": "ru",
  "everwillbr.com": "pt",
  "www.everwillbr.com": "pt",
};

/** 국가 코드 → 언어 매핑 (14개국) */
const COUNTRY_TO_LANGUAGE: Record<string, Language> = {
  KR: "ko", // 한국
  JP: "ja", // 일본
  CN: "zh", // 중국
  TW: "zh", // 대만
  HK: "zh", // 홍콩
  US: "en", // 미국
  GB: "en", // 영국
  AU: "en", // 호주
  NZ: "en", // 뉴질랜드
  CA: "en", // 캐나다
  DE: "de", // 독일
  AT: "de", // 오스트리아
  CH: "de", // 스위스
  ES: "es", // 스페인
  MX: "es", // 멕시코
  AR: "es", // 아르헨티나
  FR: "fr", // 프랑스
  BE: "fr", // 벨기에
  SA: "ar", // 사우디아라비아
  AE: "ar", // UAE
  EG: "ar", // 이집트
  IN: "hi", // 인도
  RU: "ru", // 러시아
  BR: "pt", // 브라질
  PT: "pt", // 포르투갈
};

/** 현재 도메인이 고정 도메인인지 확인 */
function getLockedDomainLang(): Language | null {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  return DOMAIN_LANGUAGE_MAP[hostname] ?? null;
}

/** 초기 언어 감지 (도메인 고정 > URL 파라미터 > 저장값 > 기본값) */
function detectInitialLanguage(): Language {
  // 1순위: 도메인 고정 (everwillus.com 등)
  const lockedLang = getLockedDomainLang();
  if (lockedLang) return lockedLang;

  // 2순위: URL 파라미터 ?lang=xx
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang") as Language | null;
    if (urlLang && translations[urlLang]) return urlLang;
  }

  // everwill.co.kr / manus.computer / localhost 도메인은 항상 한국어 기본
  // (국기 클릭 시 /country/xx로 이동하므로 홈은 항상 한국어)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isMainDomain = hostname.includes("everwill.co.kr") || hostname.includes("manus.computer") || hostname.includes("localhost") || hostname.includes("manus.space");
    if (isMainDomain) {
      // /country/ 경로에 있으면 해당 언어 사용
      const path = window.location.pathname;
      if (path.startsWith("/country/")) {
        const countryCode = path.split("/country/")[1]?.split("/")[0]?.toUpperCase();
        const countryLangMap: Record<string, Language> = {
          US: "en", JP: "ja", CN: "zh", DE: "de", ES: "es",
          SA: "ar", FR: "fr", RU: "ru", IN: "hi", BR: "pt",
          NZ: "en", AU: "en", CA: "en",
        };
        const lang = countryLangMap[countryCode];
        if (lang) return lang;
      }
      // 홈 및 기타 페이지는 항상 한국어
      return "ko";
    }
  }

  // 기본값: 한국어
  return "ko";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const isRTL = RTL_LANGUAGES.includes(language);
  const t = translations[language];
  const isLanguageLocked = getLockedDomainLang() !== null;

  const setLanguage = useCallback((lang: Language) => {
    if (isLanguageLocked) return;
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, [isLanguageLocked]);

  // IP 위치 기반 자동 언어 감지 (최초 1회만)
  useEffect(() => {
    // 도메인 고정 사이트는 IP 감지 불필요
    if (isLanguageLocked) return;

    // 이미 IP 감지 완료된 경우 스킵
    const geoDetected = localStorage.getItem(GEO_DETECTED_KEY);
    if (geoDetected) return;

    // ipapi.co 무료 API로 IP 위치 감지
    fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) })
      .then((res) => res.json())
      .then((data: { country_code?: string }) => {
        const countryCode = data?.country_code;
        if (!countryCode) return;

        const detectedLang = COUNTRY_TO_LANGUAGE[countryCode];
        if (detectedLang) {
          setLanguageState(detectedLang);
          localStorage.setItem(STORAGE_KEY, detectedLang);
        }
        // IP 감지 완료 표시 (재방문 시 스킵)
        localStorage.setItem(GEO_DETECTED_KEY, "1");
      })
      .catch(() => {
        // IP 감지 실패 시 기본값 유지 (한국어)
        localStorage.setItem(GEO_DETECTED_KEY, "1");
      });
  }, [isLanguageLocked]);

  // 언어 변경 시 HTML lang + dir 속성 업데이트
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    html.setAttribute("lang", language);
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, isLanguageLocked }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
