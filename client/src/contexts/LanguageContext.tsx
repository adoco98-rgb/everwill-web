/**
 * 언어 Context/Provider
 * 전역 언어 상태를 관리하고 RTL 지원을 처리합니다.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, RTL_LANGUAGES, translations, TranslationKeys } from "@/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "everwill_language";

/** 도메인 기반 기본 언어 매핑 */
const DOMAIN_LANGUAGE_MAP: Record<string, Language> = {
  "everwillusa.com": "en",
  "www.everwillusa.com": "en",
};

/** 브라우저 언어 목록에서 지원 언어 매핑 */
function mapBrowserLang(lang: string): Language | null {
  const l = lang.toLowerCase();
  if (l.startsWith("ko")) return "ko";
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("zh")) return "zh";
  if (l.startsWith("de")) return "de";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("ar")) return "ar";
  if (l.startsWith("en")) return "en";
  return null;
}

/** 브라우저 언어 + 도메인을 기반으로 기본 언어 감지 */
function detectDefaultLanguage(): Language {
  // 0순위: URL 파라미터 ?lang=xx (가장 높은 우선순위)
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang") as Language | null;
    if (urlLang && translations[urlLang]) {
      localStorage.setItem(STORAGE_KEY, urlLang);
      localStorage.setItem("everwill-lang-manual", urlLang);
      return urlLang;
    }
  }

  // 1순위: 도메인 기반 자동 감지 (저장값 무시)
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const domainLang = DOMAIN_LANGUAGE_MAP[hostname];
  if (domainLang) {
    localStorage.setItem(STORAGE_KEY, domainLang);
    return domainLang;
  }

  // 2순위: 사용자가 직접 수동으로 선택한 언어
  const manual = typeof window !== "undefined" ? localStorage.getItem("everwill-lang-manual") as Language | null : null;
  if (manual && translations[manual]) return manual;

  // 3순위: 저장된 언어 (자동 감지로 저장된 경우)
  const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) as Language | null : null;
  if (saved && translations[saved]) return saved;

  // 4순위: 브라우저 언어 목록 순서대로 매핑 (navigator.languages 우선)
  if (typeof navigator !== "undefined") {
    const langs = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    for (const lang of langs) {
      const mapped = mapBrowserLang(lang);
      if (mapped) return mapped;
    }
  }

  // 기본값: 한국어 (1차 출시 시장)
  return "ko";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDefaultLanguage);

  const isRTL = RTL_LANGUAGES.includes(language);
  const t = translations[language];

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  // 언어 변경 시 HTML lang + dir 속성 업데이트 (AR 선택 시 dir="rtl" 적용)
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    html.setAttribute("lang", language);
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

// HMR 호환성을 위해 named export 사용
export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
