/**
 * 국가코드 → 다국어 국가명 번역 테이블
 * 모든 컴포넌트에서 공통으로 사용
 */

export const COUNTRY_NAMES_I18N: Record<string, Record<string, string>> = {
  KR: { ko: "한국", en: "Korea", ja: "韓国", zh: "韩国", de: "Korea", es: "Corea", fr: "Corée", ar: "كوريا", ru: "Корея", hi: "कोरिया", pt: "Coreia" },
  US: { ko: "미국", en: "USA", ja: "アメリカ", zh: "美国", de: "USA", es: "EE.UU.", fr: "États-Unis", ar: "أمريكا", ru: "США", hi: "अमेरिका", pt: "EUA" },
  JP: { ko: "일본", en: "Japan", ja: "日本", zh: "日本", de: "Japan", es: "Japón", fr: "Japon", ar: "اليابان", ru: "Япония", hi: "जापान", pt: "Japão" },
  CN: { ko: "중국", en: "China", ja: "中国", zh: "中国", de: "China", es: "China", fr: "Chine", ar: "الصين", ru: "Китай", hi: "चीन", pt: "China" },
  DE: { ko: "독일", en: "Germany", ja: "ドイツ", zh: "德国", de: "Deutschland", es: "Alemania", fr: "Allemagne", ar: "ألمانيا", ru: "Германия", hi: "जर्मनी", pt: "Alemanha" },
  FR: { ko: "프랑스", en: "France", ja: "フランス", zh: "法国", de: "Frankreich", es: "Francia", fr: "France", ar: "فرنسا", ru: "Франция", hi: "फ्रांस", pt: "França" },
  ES: { ko: "스페인", en: "Spain", ja: "スペイン", zh: "西班牙", de: "Spanien", es: "España", fr: "Espagne", ar: "إسبانيا", ru: "Испания", hi: "स्पेन", pt: "Espanha" },
  SA: { ko: "사우디", en: "Saudi Arabia", ja: "サウジアラビア", zh: "沙特", de: "Saudi-Arabien", es: "Arabia Saudita", fr: "Arabie Saoudite", ar: "السعودية", ru: "Саудовская Аравия", hi: "सऊदी अरब", pt: "Arábia Saudita" },
  IN: { ko: "인도", en: "India", ja: "インド", zh: "印度", de: "Indien", es: "India", fr: "Inde", ar: "الهند", ru: "Индия", hi: "भारत", pt: "Índia" },
  BR: { ko: "브라질", en: "Brazil", ja: "ブラジル", zh: "巴西", de: "Brasilien", es: "Brasil", fr: "Brésil", ar: "البرازيل", ru: "Бразилия", hi: "ब्राज़ील", pt: "Brasil" },
  GB: { ko: "영국", en: "UK", ja: "イギリス", zh: "英国", de: "Großbritannien", es: "Reino Unido", fr: "Royaume-Uni", ar: "المملكة المتحدة", ru: "Великобритания", hi: "यूके", pt: "Reino Unido" },
  AU: { ko: "호주", en: "Australia", ja: "オーストラリア", zh: "澳大利亚", de: "Australien", es: "Australia", fr: "Australie", ar: "أستراليا", ru: "Австралия", hi: "ऑस्ट्रेलिया", pt: "Austrália" },
  CA: { ko: "캐나다", en: "Canada", ja: "カナダ", zh: "加拿大", de: "Kanada", es: "Canadá", fr: "Canada", ar: "كندا", ru: "Канада", hi: "कनाडा", pt: "Canadá" },
  RU: { ko: "러시아", en: "Russia", ja: "ロシア", zh: "俄罗斯", de: "Russland", es: "Rusia", fr: "Russie", ar: "روسيا", ru: "Россия", hi: "रूस", pt: "Rússia" },
  NZ: { ko: "뉴질랜드", en: "New Zealand", ja: "ニュージーランド", zh: "新西兰", de: "Neuseeland", es: "Nueva Zelanda", fr: "Nouvelle-Zélande", ar: "نيوزيلندا", ru: "Новая Зеландия", hi: "न्यूज़ीलैंड", pt: "Nova Zelândia" },
  MX: { ko: "멕시코", en: "Mexico", ja: "メキシコ", zh: "墨西哥", de: "Mexiko", es: "México", fr: "Mexique", ar: "المكسيك", ru: "Мексика", hi: "मेक्सिको", pt: "México" },
  IT: { ko: "이탈리아", en: "Italy", ja: "イタリア", zh: "意大利", de: "Italien", es: "Italia", fr: "Italie", ar: "إيطاليا", ru: "Италия", hi: "इटली", pt: "Itália" },
  NL: { ko: "네덜란드", en: "Netherlands", ja: "オランダ", zh: "荷兰", de: "Niederlande", es: "Países Bajos", fr: "Pays-Bas", ar: "هولندا", ru: "Нидерланды", hi: "नीदरलैंड", pt: "Países Baixos" },
  SG: { ko: "싱가포르", en: "Singapore", ja: "シンガポール", zh: "新加坡", de: "Singapur", es: "Singapur", fr: "Singapour", ar: "سنغافورة", ru: "Сингапур", hi: "सिंगापुर", pt: "Singapura" },
  TH: { ko: "태국", en: "Thailand", ja: "タイ", zh: "泰国", de: "Thailand", es: "Tailandia", fr: "Thaïlande", ar: "تايلاند", ru: "Таиланд", hi: "थाईलैंड", pt: "Tailândia" },
  VN: { ko: "베트남", en: "Vietnam", ja: "ベトナム", zh: "越南", de: "Vietnam", es: "Vietnam", fr: "Viêt Nam", ar: "فيتنام", ru: "Вьетнам", hi: "वियतनाम", pt: "Vietnã" },
  PH: { ko: "필리핀", en: "Philippines", ja: "フィリピン", zh: "菲律宾", de: "Philippinen", es: "Filipinas", fr: "Philippines", ar: "الفلبين", ru: "Филиппины", hi: "फिलीपींस", pt: "Filipinas" },
  AR: { ko: "아랍", en: "Arab", ja: "アラブ", zh: "阿拉伯", de: "Arabien", es: "Arabia", fr: "Arabie", ar: "العرب", ru: "Арабия", hi: "अरब", pt: "Arábia" },
};

/**
 * 국가코드와 현재 언어를 받아 해당 언어로 된 국가명 반환
 * @param countryCode 국가코드 (예: "KR", "JP")
 * @param language 현재 언어 (예: "ko", "ja")
 * @param fallback 번역 없을 때 기본값 (기본: 국가코드)
 */
export function getCountryName(countryCode: string, language: string, fallback?: string): string {
  const names = COUNTRY_NAMES_I18N[countryCode.toUpperCase()];
  if (!names) return fallback ?? countryCode;
  return names[language] ?? names["en"] ?? fallback ?? countryCode;
}

/** video_kr → KR 등 video 키를 국가코드로 변환 */
export function videoKeyToCountryCode(videoKey: string): string {
  const map: Record<string, string> = {
    video_kr: "KR", video_us: "US", video_jp: "JP", video_cn: "CN",
    video_de: "DE", video_es: "ES", video_ar: "AR", video_fr: "FR",
    video_ru: "RU", video_in: "IN", video_br: "BR", video_ca: "CA",
    video_au: "AU", video_nz: "NZ", video_mx: "MX", video_it: "IT",
    video_nl: "NL", video_sg: "SG", video_th: "TH", video_vn: "VN",
    video_ph: "PH",
  };
  return map[videoKey] ?? videoKey.replace("video_", "").toUpperCase();
}

/** 국가코드별 국기 이모지 */
export const COUNTRY_FLAGS_EMOJI: Record<string, string> = {
  KR: "🇰🇷", US: "🇺🇸", JP: "🇯🇵", CN: "🇨🇳", DE: "🇩🇪",
  FR: "🇫🇷", ES: "🇪🇸", SA: "🇸🇦", IN: "🇮🇳", BR: "🇧🇷",
  GB: "🇬🇧", AU: "🇦🇺", CA: "🇨🇦", RU: "🇷🇺", NZ: "🇳🇿",
  MX: "🇲🇽", IT: "🇮🇹", NL: "🇳🇱", SG: "🇸🇬", TH: "🇹🇭",
  VN: "🇻🇳", PH: "🇵🇭", AR: "🇸🇦",
};
