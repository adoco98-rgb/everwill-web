/**
 * i18n 번역 시스템 테스트
 * 7개 언어 번역 파일의 완전성과 RTL 지원을 검증합니다.
 */
import { describe, it, expect } from "vitest";
import { ko } from "../client/src/i18n/ko";
import { en } from "../client/src/i18n/en";
import { ja } from "../client/src/i18n/ja";
import { zh } from "../client/src/i18n/zh";
import { de } from "../client/src/i18n/de";
import { es } from "../client/src/i18n/es";
import { ar } from "../client/src/i18n/ar";

// 모든 번역 파일
const allTranslations = { ko, en, ja, zh, de, es, ar };

// 필수 최상위 섹션 키
const requiredSections = [
  "nav",
  "hero",
  "trust",
  "services",
  "badge",
  "pricing",
  "global",
  "lawyers",
  "reviews",
  "cta",
  "footer",
];

// 각 섹션의 필수 키
const requiredKeys: Record<string, string[]> = {
  nav: ["services", "badge", "pricing", "global", "lawyers"],
  hero: ["title1", "title2", "subtitle"],
  trust: ["title", "subtitle"],
  services: ["title", "subtitle", "s1Title", "s2Title", "s3Title"],
  badge: ["title", "subtitle", "lineup"],
  pricing: ["title", "subtitle", "free", "certTitle"],
  global: ["title", "subtitle", "korea", "japan", "china", "usa"],
  lawyers: ["title", "subtitle", "step1Title", "step2Title"],
  reviews: ["title", "subtitle"],
  cta: ["title", "subtitle", "btn"],
  footer: ["company", "tagline", "copyright", "legalNote"],
};

describe("i18n 번역 시스템", () => {
  describe("번역 파일 구조 검증", () => {
    it("모든 7개 언어 파일이 존재해야 한다", () => {
      expect(Object.keys(allTranslations)).toHaveLength(7);
      expect(allTranslations).toHaveProperty("ko");
      expect(allTranslations).toHaveProperty("en");
      expect(allTranslations).toHaveProperty("ja");
      expect(allTranslations).toHaveProperty("zh");
      expect(allTranslations).toHaveProperty("de");
      expect(allTranslations).toHaveProperty("es");
      expect(allTranslations).toHaveProperty("ar");
    });

    it("모든 언어 파일에 필수 섹션이 존재해야 한다", () => {
      for (const [lang, translation] of Object.entries(allTranslations)) {
        for (const section of requiredSections) {
          expect(translation, `${lang}: ${section} 섹션 누락`).toHaveProperty(section);
        }
      }
    });

    it("모든 언어 파일의 필수 섹션에 필수 키가 존재해야 한다", () => {
      for (const [lang, translation] of Object.entries(allTranslations)) {
        for (const [section, keys] of Object.entries(requiredKeys)) {
          const sectionObj = (translation as Record<string, Record<string, string>>)[section];
          for (const key of keys) {
            expect(sectionObj, `${lang}.${section}.${key} 누락`).toHaveProperty(key);
          }
        }
      }
    });
  });

  describe("번역 값 검증", () => {
    it("모든 언어의 번역 값이 빈 문자열이 아니어야 한다", () => {
      for (const [lang, translation] of Object.entries(allTranslations)) {
        for (const [section, sectionObj] of Object.entries(translation)) {
          if (typeof sectionObj === "object" && sectionObj !== null) {
            for (const [key, value] of Object.entries(sectionObj)) {
              if (typeof value === "string") {
                expect(value.trim(), `${lang}.${section}.${key} 빈 문자열`).not.toBe("");
              }
            }
          }
        }
      }
    });

    it("한국어 번역이 기준 번역이어야 한다", () => {
      expect(ko.nav.services).toBe("서비스");
      expect(ko.hero.title1).toContain("누구나");
      expect(ko.pricing.free).toBe("무료 시작");
    });

    it("영어 번역이 올바르게 설정되어야 한다", () => {
      expect(en.nav.services).toBe("Services");
      expect(en.pricing.free).toBe("Start Free");
    });

    it("일본어 번역이 올바르게 설정되어야 한다", () => {
      expect(ja.nav.services).toBe("サービス");
    });

    it("아랍어 번역이 올바르게 설정되어야 한다", () => {
      expect(ar.nav.services).toBe("الخدمات");
    });
  });

  describe("RTL 언어 지원", () => {
    it("아랍어(ar)가 RTL 언어로 분류되어야 한다", async () => {
      const { RTL_LANGUAGES } = await import("../client/src/i18n/index");
      expect(RTL_LANGUAGES).toContain("ar");
    });

    it("한국어, 영어, 일본어, 중국어, 독일어, 스페인어는 RTL이 아니어야 한다", async () => {
      const { RTL_LANGUAGES } = await import("../client/src/i18n/index");
      for (const lang of ["ko", "en", "ja", "zh", "de", "es"]) {
        expect(RTL_LANGUAGES).not.toContain(lang);
      }
    });
  });

  describe("언어 메타데이터", () => {
    it("모든 언어에 이름과 국기가 정의되어야 한다", async () => {
      const { languageNames, languageFlags } = await import("../client/src/i18n/index");
      const langs = ["ko", "en", "ja", "zh", "de", "es", "ar"];
      for (const lang of langs) {
        expect(languageNames).toHaveProperty(lang);
        expect(languageFlags).toHaveProperty(lang);
        expect(languageNames[lang as keyof typeof languageNames]).not.toBe("");
        expect(languageFlags[lang as keyof typeof languageFlags]).not.toBe("");
      }
    });
  });

  describe("서비스 섹션 detail 키 검증", () => {
    it("모든 언어에 s8Detail1~s8Detail6 키가 있어야 한다", () => {
      for (const [lang, translation] of Object.entries(allTranslations)) {
        const services = (translation as Record<string, Record<string, string>>).services;
        for (let i = 1; i <= 6; i++) {
          expect(services, `${lang}.services.s8Detail${i} 누락`).toHaveProperty(`s8Detail${i}`);
        }
      }
    });

    it("모든 언어에 s9Detail1~s9Detail6 키가 있어야 한다", () => {
      for (const [lang, translation] of Object.entries(allTranslations)) {
        const services = (translation as Record<string, Record<string, string>>).services;
        for (let i = 1; i <= 6; i++) {
          expect(services, `${lang}.services.s9Detail${i} 누락`).toHaveProperty(`s9Detail${i}`);
        }
      }
    });
  });
});
