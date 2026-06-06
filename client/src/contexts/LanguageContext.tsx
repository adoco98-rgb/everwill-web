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
  /** 도메인으로 언어가 고정된 경우 true — 언어 선택 UI 숨김 */
  isLanguageLocked: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "everwill_language";

/** 도메인 기반 기본 언어 매핑 */
const DOMAIN_LANGUAGE_MAP: Record<string, Language> = {
  // 미국 (영어)
  "everwillus.com": "en",
  "www.everwillus.com": "en",
  "everwillusa.com": "en",
  "www.everwillusa.com": "en",
  // 일본 (일본어)
  "everwilljp.com": "ja",
  "www.everwilljp.com": "ja",
  // 독일 (독일어)
  "everwillde.com": "de",
  "www.everwillde.com": "de",
  // 중국 (중국어)
  "everwillcn.com": "zh",
  "www.everwillcn.com": "zh",
  // 스페인 (스페인어)
  "everwilles.com": "es",
  "www.everwilles.com": "es",
  // 프랑스 (프랑스어)
  "everwillfr.com": "fr",
  "www.everwillfr.com": "fr",
  // 아랍 (아랍어)
  "everwillar.com": "ar",
  "www.everwillar.com": "ar",
  // 인도 (힌디어)
  "everwillin.com": "hi",
  "www.everwillin.com": "hi",
  // 러시아 (러시아어)
  "everwillru.com": "ru",
  "www.everwillru.com": "ru",
  // 포르투갈/브라질 (포르투갈어)
  "everwillbr.com": "pt",
  "www.everwillbr.com": "pt",
  // 한국 (한국어) — 명시적 등록
  "everwill.co.kr": "ko",
  "www.everwill.co.kr": "ko",
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

/** 현재 도메인이 고정 도메인인지 확인 */
function getLockedDomainLang(): Language | null {
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  return DOMAIN_LANGUAGE_MAP[hostname] ?? null;
}

/** 기본 언어 감지 (URL 파라미터 > 도메인 고정 > 저장값 > 한국어) */
function detectDefaultLanguage(): Language {
  // 1순위: 도메인 기반 언어 고정 (가장 우선)
  // everwillus.com → en, everwilljp.com → ja 등
  const lockedLang = getLockedDomainLang();
  if (lockedLang) return lockedLang;

  // 2순위: URL 파라미터 ?lang=xx
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get("lang") as Language | null;
    if (urlLang && translations[urlLang]) return urlLang;
  }

  // 3순위: 사용자가 직접 선택한 저장값
  const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved && translations[saved]) return saved;

  // 기본값: 한국어 고정
  return "ko";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectDefaultLanguage);

  const isRTL = RTL_LANGUAGES.includes(language);
  const t = translations[language];

  // 도메인 고정 여부
  const isLanguageLocked = getLockedDomainLang() !== null;

  const setLanguage = useCallback((lang: Language) => {
    // 도메인 고정 사이트에서는 언어 변경 차단
    if (isLanguageLocked) return;
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, [isLanguageLocked]);

  // 언어 변경 시 HTML lang + dir 속성 업데이트 (AR 선택 시 dir="rtl" 적용)
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

// HMR 호환성을 위해 named export 사용
export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
};
