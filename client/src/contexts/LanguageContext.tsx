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

/** 기본 언어 감지 (URL 파라미터 > 저장값 > 한국어 고정) */
function detectDefaultLanguage(): Language {
  // 1순위: URL 파라미터 ?lang=xx
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang") as Language | null;
    if (urlLang && translations[urlLang]) return urlLang;
  }

  // 2순위: 도메인 기반 (예: everwillusa.com → en)
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const domainLang = DOMAIN_LANGUAGE_MAP[hostname];
  if (domainLang) {
    localStorage.setItem(STORAGE_KEY, domainLang);
    return domainLang;
  }

  // 3순위: 사용자가 직접 선택한 저장값
  const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved && translations[saved]) return saved;

  // 기본값: 한국어 고정 (IP/브라우저 언어 감지 제거 — 새드박스 IP가 SA로 오감지되는 문제 방지)
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
