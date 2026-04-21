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

/** 브라우저 언어를 기반으로 기본 언어 감지 */
function detectDefaultLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved && translations[saved]) return saved;

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("ko")) return "ko";
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("zh")) return "zh";
  if (browserLang.startsWith("de")) return "de";
  if (browserLang.startsWith("es")) return "es";
  if (browserLang.startsWith("ar")) return "ar";
  return "ko"; // 기본값: 한국어
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDefaultLanguage);

  const isRTL = RTL_LANGUAGES.includes(language);
  const t = translations[language];

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  // 언어 변경 시 HTML lang 속성 업데이트 (레이아웃은 항상 LTR 유지)
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", "ltr");
    html.setAttribute("lang", language);
  }, [language]);

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
