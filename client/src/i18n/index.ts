/**
 * i18n 인덱스 파일
 * 모든 번역 파일을 export하고 언어 타입을 정의합니다.
 */

import { ko } from "./ko";
import { en } from "./en";
import { ja } from "./ja";
import { zh } from "./zh";
import { de } from "./de";
import { es } from "./es";
import { ar } from "./ar";
import { fr } from "./fr";
import { ru } from "./ru";
import { hi } from "./hi";
import { pt } from "./pt";

export type TranslationKeys = typeof ko;
export type Language = "ko" | "en" | "ja" | "zh" | "de" | "es" | "ar" | "fr" | "ru" | "hi" | "pt";

export const translations: Record<Language, TranslationKeys> = {
  ko,
  en,
  ja,
  zh,
  de,
  es,
  ar,
  fr,
  ru,
  hi,
  pt,
};

export const languageNames: Record<Language, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "中文",
  de: "Deutsch",
  es: "Español",
  ar: "العربية",
  fr: "Français",
  ru: "Русский",
  hi: "हिन्दी",
  pt: "Português",
};

export const languageFlags: Record<Language, string> = {
  ko: "🇰🇷",
  en: "🇺🇸",
  ja: "🇯🇵",
  zh: "🇨🇳",
  de: "🇩🇪",
  es: "🇪🇸",
  ar: "🇸🇦",
  fr: "🇫🇷",
  ru: "🇷🇺",
  hi: "🇮🇳",
  pt: "🇧🇷",
};

/** RTL 언어 목록 */
export const RTL_LANGUAGES: Language[] = ["ar"];

export { ko, en, ja, zh, de, es, ar, fr, ru, hi, pt };
