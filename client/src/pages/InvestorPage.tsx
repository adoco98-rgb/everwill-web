/**
 * EverWill 투자유치 사업설명회 랜딩페이지 (/investor)
 * - 7개국어 지원: ko, en, ja, zh, de, es, ar
 * - 최상단 슬라이드 (자동 재생 + 수동 이동)
 * - 언어별 통화 단위 표시 (원화/달러/엔화/위안/유로/페소/리얄)
 * - 경쟁사 비교표에 각국 국기 표시
 * - 광고/마케팅 섹션 추가
 */
import { useState, useEffect, useCallback } from "react";
import {
  Globe, TrendingUp, Users, DollarSign,
  ChevronDown, BarChart3,
  Target, Rocket, Mail, ChevronLeft, ChevronRight,
  Megaphone, Smartphone, Monitor, UserPlus,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";

type Lang = "ko" | "en" | "ja" | "zh" | "de" | "es" | "ar";
const LANGS: { code: Lang; label: string; flag: string; rtl?: boolean }[] = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦", rtl: true },
];

// 언어별 통화 설정 (USD 1 = 각국 통화 환율 기준)
const CURRENCY: Record<Lang, {
  formatArr: (usdM: number) => string;
  formatMarket: (usdB: number) => string;
  arrMultiplier: number;
  marketMultiplier: number;
  arrSuffix: string;
  marketSuffix: string;
}> = {
  ko: {
    arrMultiplier: 13.2, marketMultiplier: 1.32, arrSuffix: "억원", marketSuffix: "조원",
    formatArr: (v) => `${Math.round(v * 13.2 * 10) / 10}억원`,
    formatMarket: (v) => `${Math.round(v * 1.32 * 10) / 10}조원`,
  },
  en: {
    arrMultiplier: 1, marketMultiplier: 1, arrSuffix: "M", marketSuffix: "B",
    formatArr: (v) => `$${v}M`, formatMarket: (v) => `$${v}B`,
  },
  ja: {
    arrMultiplier: 148, marketMultiplier: 14.8, arrSuffix: "億円", marketSuffix: "兆円",
    formatArr: (v) => `${Math.round(v * 148)}億円`,
    formatMarket: (v) => `${Math.round(v * 14.8 * 10) / 10}兆円`,
  },
  zh: {
    arrMultiplier: 7.2, marketMultiplier: 7.2, arrSuffix: "百万元", marketSuffix: "十亿元",
    formatArr: (v) => `${Math.round(v * 7.2 * 10) / 10}百万元`,
    formatMarket: (v) => `${Math.round(v * 7.2 * 10) / 10}十亿元`,
  },
  de: {
    arrMultiplier: 0.93, marketMultiplier: 0.93, arrSuffix: "Mio.", marketSuffix: "Mrd.",
    formatArr: (v) => `€${Math.round(v * 0.93 * 10) / 10}Mio.`,
    formatMarket: (v) => `€${Math.round(v * 0.93 * 10) / 10}Mrd.`,
  },
  es: {
    arrMultiplier: 1, marketMultiplier: 1, arrSuffix: "M", marketSuffix: "B",
    formatArr: (v) => `$${v}M`, formatMarket: (v) => `$${v}B`,
  },
  ar: {
    arrMultiplier: 3.75, marketMultiplier: 3.75, arrSuffix: "م﷼", marketSuffix: "م﷼",
    formatArr: (v) => `${Math.round(v * 3.75 * 10) / 10}م﷼`,
    formatMarket: (v) => `${Math.round(v * 3.75 * 10) / 10}م﷼`,
  },
};

function getArrData(lang: Lang) {
  const base = [0.3, 2.1, 12];
  const c = CURRENCY[lang];
  return base.map((v, i) => ({
    year: `Year ${i + 1}`,
    arr: Math.round(v * c.arrMultiplier * 10) / 10,
    label: c.formatArr(v),
  }));
}

function getMarketBarData(lang: Lang) {
  const usdB = [67, 28, 18, 15, 8, 12, 11];
  const flags = ["🇺🇸", "🇯🇵", "🇩🇪", "🇬🇧", "🇰🇷", "🇨🇳", "🌍"];
  const fills = ["#8B5CF6", "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6B7280"];
  const names: Record<Lang, string[]> = {
    ko: ["미국", "일본", "독일", "영국", "한국", "중국", "기타"],
    en: ["USA", "Japan", "Germany", "UK", "Korea", "China", "Others"],
    ja: ["米国", "日本", "ドイツ", "英国", "韓国", "中国", "その他"],
    zh: ["美国", "日本", "德国", "英国", "韩国", "中国", "其他"],
    de: ["USA", "Japan", "Deutschland", "UK", "Korea", "China", "Andere"],
    es: ["EE.UU.", "Japón", "Alemania", "UK", "Corea", "China", "Otros"],
    ar: ["أمريكا", "اليابان", "ألمانيا", "المملكة المتحدة", "كوريا", "الصين", "أخرى"],
  };
  const c = CURRENCY[lang];
  return usdB.map((v, i) => ({
    name: `${flags[i]} ${names[lang][i]}`,
    value: Math.round(v * c.marketMultiplier * 10) / 10,
    fill: fills[i],
    label: c.formatMarket(v),
  }));
}

function getMarketGrowthData(lang: Lang) {
  const usdB = [89, 98, 112, 121, 128, 133, 137, 139];
  const years = ["2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"];
  const c = CURRENCY[lang];
  return usdB.map((v, i) => ({
    year: years[i],
    value: Math.round(v * c.marketMultiplier * 10) / 10,
  }));
}

const USER_DATA = [
  { year: "Year 1", users: 2000 },
  { year: "Year 2", users: 18000 },
  { year: "Year 3", users: 85000 },
];

const REVENUE_PIE_DATA = [
  { name: "Certification", value: 40, fill: "#C9A961" },
  { name: "Membership", value: 20, fill: "#1F3864" },
  { name: "Badge", value: 25, fill: "#8B5CF6" },
  { name: "Lawyer", value: 15, fill: "#10B981" },
];
// ─────────────────────────────────────────────
// 7개국어 번역 데이터
// ─────────────────────────────────────────────
type TranslationData = {
  nav_invest: string;
  hero_badge: string;
  hero_title: string;
  hero_sub: string;
  hero_cta: string;
  m1_label: string; m1_val: string;
  m2_label: string; m2_val: string;
  m3_label: string; m3_val: string;
  m4_label: string; m4_val: string;
  market_title: string;
  market_sub: string;
  market_chart_title: string;
  market_growth_title: string;
  comp_title: string;
  comp_sub: string;
  comp_feature: string;
  comp_everwill: string;
  comp_tw: string; comp_tw_country: string;
  comp_fw: string; comp_fw_country: string;
  comp_gt: string; comp_gt_country: string;
  comp_rows: { feature: string; ew: string; tw: string; fw: string; gt: string }[];
  diff_title: string;
  diff_sub: string;
  diff_1_title: string; diff_1_desc: string;
  diff_2_title: string; diff_2_desc: string;
  diff_3_title: string; diff_3_desc: string;
  diff_4_title: string; diff_4_desc: string;
  diff_5_title: string; diff_5_desc: string;
  diff_6_title: string; diff_6_desc: string;
  revenue_title: string;
  revenue_sub: string;
  rev_pie_title: string;
  rev_1: string; rev_1_val: string;
  rev_2: string; rev_2_val: string;
  rev_3: string; rev_3_val: string;
  rev_4: string; rev_4_val: string;
  ltv_label: string; ltv_val: string;
  finance_title: string;
  finance_sub: string;
  finance_arr_title: string;
  finance_user_title: string;
  // 광고 섹션
  ads_title: string;
  ads_sub: string;
  ads_media_title: string; ads_media_desc: string;
  ads_sns_title: string; ads_sns_desc: string;
  ads_online_title: string; ads_online_desc: string;
  ads_user_title: string; ads_user_desc: string;
  ads_budget_title: string;
  ads_budget_items: { label: string; pct: string; desc: string }[];
  // 로드맵
  roadmap_title: string;
  roadmap_sub: string;
  rm_1_q: string; rm_1_title: string; rm_1_items: string[];
  rm_2_q: string; rm_2_title: string; rm_2_items: string[];
  rm_3_q: string; rm_3_title: string; rm_3_items: string[];
  rm_4_q: string; rm_4_title: string; rm_4_items: string[];
  team_title: string;
  team_sub: string;
  t1_name: string; t1_role: string; t1_desc: string;
  invest_title: string;
  invest_sub: string;
  invest_round: string;
  invest_amount: string;
  invest_valuation: string;
  invest_use: string;
  invest_use_items: { label: string; pct: string; desc: string }[];
  invest_detail_title: string;
  invest_detail_items: { category: string; items: { name: string; amount: string; note: string }[] }[];
  cta_title: string;
  cta_sub: string;
  cta_btn: string;
  cta_email: string;
  footer_conf: string;
  // 슬라이드
  slides: { badge: string; title: string; sub: string; highlight: string }[];
};

const T: Record<Lang, TranslationData> = {
  ko: {
    nav_invest: "투자자 전용",
    hero_badge: "🌍 세계 최초 디지털 유언 OS",
    hero_title: "유언 산업의\nOS가 됩니다",
    hero_sub: "Trust & Will·Farewill·GoodTrust를 뛰어넘는 올인원 글로벌 유언 플랫폼.\n작성부터 사후 자동 집행까지, 전 과정을 책임집니다.",
    hero_cta: "투자 문의하기",
    m1_label: "목표 MAU (Year 2)", m1_val: "50,000",
    m2_label: "목표 ARR (Year 3)", m2_val: "1,584억원",
    m3_label: "목표 국가", m3_val: "7개국",
    m4_label: "고객 LTV", m4_val: "₩7,260,000+",
    market_title: "글로벌 유언 시장 기회",
    market_sub: "전 세계 고령화와 디지털 전환이 만드는 거대한 시장 기회",
    market_chart_title: "국가별 시장 규모 (2030년 전망, 조원)",
    market_growth_title: "글로벌 시장 성장 전망 (조원)",
    comp_title: "경쟁사 비교",
    comp_sub: "EverWill만이 제공하는 독창적 기능",
    comp_feature: "기능",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will", comp_tw_country: "🇺🇸 미국",
    comp_fw: "Farewill", comp_fw_country: "🇬🇧 영국",
    comp_gt: "GoodTrust", comp_gt_country: "🇺🇸 미국",
    comp_rows: [
      { feature: "물리적 Badge 시스템", ew: "✅ 세계 최초", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "4중 사망 감지", ew: "✅ 자동화", tw: "❌ 수동", fw: "❌ 수동", gt: "❌ 수동" },
      { feature: "변호사 마켓플레이스", ew: "✅ 사후 집행", tw: "⚠️ 생전만", fw: "⚠️ 제한적", gt: "❌" },
      { feature: "글로벌 멀티관할권", ew: "✅ 7개국", tw: "❌ 미국만", fw: "❌ 영국만", gt: "❌ 미국만" },
      { feature: "AI 체크박스 작성", ew: "✅ 17분", tw: "⚠️ 복잡", fw: "⚠️ 복잡", gt: "⚠️ 복잡" },
      { feature: "영상 유언장", ew: "✅ 포함", tw: "❌", fw: "❌", gt: "⚠️ 제한적" },
      { feature: "7개 언어 지원", ew: "✅ RTL 포함", tw: "❌ 영어만", fw: "❌ 영어만", gt: "❌ 영어만" },
      { feature: "재인증 비용", ew: "✅ ₩15,000", tw: "❌ $299/년", fw: "❌ £90/년", gt: "❌ $149/년" },
    ],
    diff_title: "왜 EverWill인가?",
    diff_sub: "기존 경쟁사가 해결하지 못한 10가지 혁신",
    diff_1_title: "물리적 Badge 시스템", diff_1_desc: "MedicAlert + AirTag + 유언 인증을 하나로. 전 세계 어떤 유언 플랫폼도 시도하지 않은 영구적 차별화.",
    diff_2_title: "4중 사망 감지", diff_2_desc: "가족 신고 → 정부 DB → Dead Man's Switch → 응급 발견자. 자동 집행 트리거 시스템.",
    diff_3_title: "변호사 마켓플레이스", diff_3_desc: "평소엔 0%, 사후 100%. 진짜 필요한 순간에만 등장하는 전문가 네트워크.",
    diff_4_title: "체크박스 17분 완성", diff_4_desc: "빈 종이의 공포를 없앴습니다. AI가 체크박스를 법률 문장으로 자동 변환.",
    diff_5_title: "글로벌 멀티관할권", diff_5_desc: "한국 + 미국 + 일본 자산을 동시에. 이런 서비스 현재 세계에 없습니다.",
    diff_6_title: "LTV 28배", diff_6_desc: "재인증 ₩15,000으로 생애 이벤트마다 재방문. Trust & Will 대비 28배 LTV.",
    revenue_title: "수익 모델",
    revenue_sub: "다층 수익 구조로 안정적인 성장",
    rev_pie_title: "수익 구성 비율",
    rev_1: "전자 인증", rev_1_val: "₩49,000 / 건",
    rev_2: "연 멤버십", rev_2_val: "₩29,000 / 년",
    rev_3: "Badge 판매", rev_3_val: "₩49,000 ~ ₩299,000",
    rev_4: "변호사 수수료", rev_4_val: "보수의 15~25%",
    ltv_label: "고객 생애 가치 (LTV)", ltv_val: "₩7,260,000+",
    finance_title: "재무 전망",
    finance_sub: "보수적 시나리오 기준 3개년 목표 (원화 기준)",
    finance_arr_title: "연간 반복 매출 (ARR) 목표 (억원)",
    finance_user_title: "누적 인증 사용자 목표",
    ads_title: "마케팅 전략",
    ads_sub: "미디어·SNS·온라인 광고로 글로벌 가입자 유치",
    ads_media_title: "미디어 광고", ads_media_desc: "TV·라디오·신문·잡지 등 전통 미디어 + 유튜브 프리롤 광고. 재외한인 커뮤니티 방송 집중 노출.",
    ads_sns_title: "SNS 마케팅", ads_sns_desc: "인스타그램·페이스북·카카오·LINE·WeChat 타깃 광고. 50~70대 고령층 + 재외한인 맞춤 콘텐츠.",
    ads_online_title: "온라인 광고", ads_online_desc: "구글 검색 광고 (유언장, 상속, 유언 작성 키워드). 네이버·야후재팬·바이두 검색 광고 동시 운영.",
    ads_user_title: "가입자 유치 캠페인", ads_user_desc: "무료 AI 유언 작성 체험 → 전자인증 전환 유도. 추천인 제도: 1인 추천 시 재인증 1회 무료 제공.",
    ads_budget_title: "마케팅 예산 배분 계획",
    ads_budget_items: [
      { label: "SNS 광고", pct: "35%", desc: "인스타그램·페이스북·카카오·LINE" },
      { label: "검색 광고", pct: "30%", desc: "구글·네이버·야후재팬·바이두" },
      { label: "미디어 광고", pct: "20%", desc: "유튜브·TV·라디오·재외한인 방송" },
      { label: "추천·바이럴", pct: "15%", desc: "추천인 제도·인플루언서·커뮤니티" },
    ],
    roadmap_title: "글로벌 출시 로드맵",
    roadmap_sub: "12개월 안에 4개국 동시 진출",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 한국 런칭",
    rm_1_items: ["MVP 출시", "eKYC 연동", "토스페이먼츠 결제", "Badge 생산"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 일본 진출",
    rm_2_items: ["공정증서 디지털화 대응", "일본어 완전 지원", "PayPay 연동", "현지 변호사 영입"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 중화권 진출",
    rm_3_items: ["홍콩·대만 먼저", "WeChat Pay 연동", "중국어 간체 지원", "현지 파트너십"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 미국 진출",
    rm_4_items: ["재미한인 100만 타깃", "Stripe 결제", "영어 완전 지원", "CA·NY 법률 적용"],
    team_title: "팀",
    team_sub: "비전을 실행하는 사람들",
    t1_name: "라수환 (Jeff Lah)",
    t1_role: "CEO · 주식회사 사람",
    t1_desc: "30년 사업 경력자. 제품 개발 기획 전문가. 글로벌 유언 플랫폼 1위를 목표로 합니다.",
    invest_title: "투자 조건",
    invest_sub: "시드 라운드 투자 유치 중",
    invest_round: "시드 라운드",
    invest_amount: "목표 조달액: ₩5억 ~ ₩10억",
    invest_valuation: "Pre-money Valuation: ₩30억",
    invest_use: "투자금 사용 계획 (총 ₩10억 기준)",
    invest_use_items: [
      { label: "제품 개발", pct: "40%", desc: "₩4억 — AI 유언 작성 엔진, eKYC, 블록체인 인증" },
      { label: "마케팅·영업", pct: "30%", desc: "₩3억 — 한국·일본 런칭 캠페인, 재외한인 타깃" },
      { label: "법무·컴플라이언스", pct: "15%", desc: "₩1.5억 — 각국 법률 검토, 변호사 파트너십" },
      { label: "운영·인프라", pct: "15%", desc: "₩1.5억 — 서버, 보안, 고객 지원 시스템" },
    ],
    invest_detail_title: "항목별 세부 자금 계획",
    invest_detail_items: [
      { category: "제품 개발 (₩4억)", items: [
        { name: "AI 유언 작성 엔진", amount: "₩120,000,000", note: "GPT-4/Claude API 연동, 법률 문장 자동 변환" },
        { name: "eKYC 본인인증 연동", amount: "₩60,000,000", note: "NICE평가정보, Veriff 연동" },
        { name: "블록체인 해시 기록", amount: "₩40,000,000", note: "Polygon 네트워크, RFC 3161 타임스탬프" },
        { name: "영상 유언 녹화 시스템", amount: "₩50,000,000", note: "녹화·저장·암호화·공개 타이밍 설정" },
        { name: "Badge NFC/QR 연동", amount: "₩50,000,000", note: "Badge 제조 파트너 연결, 앱 연동" },
        { name: "보안·인프라 구축", amount: "₩80,000,000", note: "E2E 암호화, ISMS 준비, 서버 구축" },
      ]},
      { category: "마케팅·영업 (₩3억)", items: [
        { name: "한국 런칭 캠페인", amount: "₩80,000,000", note: "SNS 광고, 검색 광고, PR" },
        { name: "일본 진출 마케팅", amount: "₩70,000,000", note: "야후재팬, LINE 광고, 현지 PR" },
        { name: "재외한인 타깃 광고", amount: "₩60,000,000", note: "미주·일본·중국 한인 커뮤니티" },
        { name: "인플루언서·콘텐츠", amount: "₩50,000,000", note: "유튜브·인스타 크리에이터 협업" },
        { name: "영업·파트너십", amount: "₩40,000,000", note: "장례식장·병원·은행 제휴" },
      ]},
      { category: "법무·컴플라이언스 (₩1.5억)", items: [
        { name: "한국 법률 자문", amount: "₩50,000,000", note: "변호사법·전자서명법·개인정보보호법" },
        { name: "일본·미국 법률 검토", amount: "₩60,000,000", note: "각국 유언법·상속법 검토" },
        { name: "변호사 파트너십 구축", amount: "₩40,000,000", note: "Year 1 큐레이션형 10명 영입" },
      ]},
      { category: "운영·인프라 (₩1.5억)", items: [
        { name: "클라우드 서버·CDN", amount: "₩50,000,000", note: "Vercel, Cloudflare, AWS" },
        { name: "고객 지원 시스템", amount: "₩40,000,000", note: "CS 툴, 챗봇, 다국어 지원" },
        { name: "운영 인력 채용", amount: "₩60,000,000", note: "개발자 1명, CS 1명 (6개월)" },
      ]},
    ],
    cta_title: "함께 만들어 갑시다",
    cta_sub: "EverWill의 글로벌 여정에 함께하실 투자자를 찾습니다.\n지금 바로 연락해 주세요.",
    cta_btn: "투자 문의 보내기",
    cta_email: "adoco98@gmail.com",
    footer_conf: "본 자료는 기밀입니다. 무단 배포를 금합니다.",
    slides: [
      { badge: "세계 최초", title: "유언 산업의 OS", sub: "작성부터 사후 자동 집행까지", highlight: "Trust & Will을 뛰어넘는 글로벌 플랫폼" },
      { badge: "핵심 차별화", title: "물리적 Badge 시스템", sub: "MedicAlert + AirTag + 유언 인증", highlight: "전 세계 어떤 유언 플랫폼도 시도하지 않은 혁신" },
      { badge: "글로벌 시장", title: "1,840억 달러 시장", sub: "2030년 글로벌 유언 시장 규모", highlight: "한국·일본·미국·중국 동시 진출" },
      { badge: "수익 모델", title: "LTV ₩7,260,000+", sub: "Trust & Will 대비 28배 고객 생애 가치", highlight: "재인증 ₩15,000으로 평생 반복 수익" },
      { badge: "투자 기회", title: "시드 라운드 모집 중", sub: "목표 조달액: ₩5억 ~ ₩10억", highlight: "Pre-money Valuation: ₩30억" },
    ],
  },
  en: {
    nav_invest: "Investors Only",
    hero_badge: "🌍 World's First Digital Will OS",
    hero_title: "Becoming the OS\nof the Will Industry",
    hero_sub: "An all-in-one global will platform surpassing Trust & Will, Farewill, and GoodTrust.\nFrom writing to automatic post-death execution — we own the entire journey.",
    hero_cta: "Contact for Investment",
    m1_label: "Target MAU (Year 2)", m1_val: "50,000",
    m2_label: "Target ARR (Year 3)", m2_val: "$12M",
    m3_label: "Target Countries", m3_val: "7",
    m4_label: "Customer LTV", m4_val: "$5,500+",
    market_title: "Global Will Market Opportunity",
    market_sub: "A massive market opportunity created by global aging and digital transformation",
    market_chart_title: "Market Size by Country (2030 Forecast, $B)",
    market_growth_title: "Global Market Growth Forecast ($B)",
    comp_title: "Competitive Analysis",
    comp_sub: "Unique features only EverWill provides",
    comp_feature: "Feature",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will", comp_tw_country: "🇺🇸 USA",
    comp_fw: "Farewill", comp_fw_country: "🇬🇧 UK",
    comp_gt: "GoodTrust", comp_gt_country: "🇺🇸 USA",
    comp_rows: [
      { feature: "Physical Badge System", ew: "✅ World First", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "4-Layer Death Detection", ew: "✅ Automated", tw: "❌ Manual", fw: "❌ Manual", gt: "❌ Manual" },
      { feature: "Lawyer Marketplace", ew: "✅ Post-death exec.", tw: "⚠️ Life only", fw: "⚠️ Limited", gt: "❌" },
      { feature: "Global Multi-jurisdiction", ew: "✅ 7 Countries", tw: "❌ US only", fw: "❌ UK only", gt: "❌ US only" },
      { feature: "AI Checkbox Writing", ew: "✅ 17 minutes", tw: "⚠️ Complex", fw: "⚠️ Complex", gt: "⚠️ Complex" },
      { feature: "Video Will", ew: "✅ Included", tw: "❌", fw: "❌", gt: "⚠️ Limited" },
      { feature: "7 Languages (RTL)", ew: "✅ RTL included", tw: "❌ English only", fw: "❌ English only", gt: "❌ English only" },
      { feature: "Re-certification Cost", ew: "✅ $15", tw: "❌ $299/yr", fw: "❌ £90/yr", gt: "❌ $149/yr" },
    ],
    diff_title: "Why EverWill?",
    diff_sub: "10 innovations competitors haven't solved",
    diff_1_title: "Physical Badge System", diff_1_desc: "MedicAlert + AirTag + Will certification in one. Permanent differentiation no will platform has attempted.",
    diff_2_title: "4-Layer Death Detection", diff_2_desc: "Family report → Government DB → Dead Man's Switch → Emergency finder. Automated execution trigger.",
    diff_3_title: "Lawyer Marketplace", diff_3_desc: "0% in life, 100% after death. Expert network that appears only when truly needed.",
    diff_4_title: "Checkbox in 17 Minutes", diff_4_desc: "Eliminated the fear of the blank page. AI converts checkboxes to legal language automatically.",
    diff_5_title: "Global Multi-jurisdiction", diff_5_desc: "Korean + US + Japan assets simultaneously. No such service exists anywhere in the world.",
    diff_6_title: "28x LTV", diff_6_desc: "$15 re-certification drives repeat visits at every life event. 28x LTV vs Trust & Will.",
    revenue_title: "Revenue Model",
    revenue_sub: "Stable growth through multi-layered revenue structure",
    rev_pie_title: "Revenue Mix",
    rev_1: "Electronic Certification", rev_1_val: "$39 / cert",
    rev_2: "Annual Membership", rev_2_val: "$29 / year",
    rev_3: "Badge Sales", rev_3_val: "$49 ~ $299",
    rev_4: "Lawyer Commission", rev_4_val: "15~25% of fees",
    ltv_label: "Customer Lifetime Value (LTV)", ltv_val: "$5,500+",
    finance_title: "Financial Projections",
    finance_sub: "3-year targets based on conservative scenario (USD)",
    finance_arr_title: "Annual Recurring Revenue (ARR) Target ($M)",
    finance_user_title: "Cumulative Certified Users Target",
    ads_title: "Marketing Strategy",
    ads_sub: "Acquiring global subscribers via Media, SNS & Online Advertising",
    ads_media_title: "Media Advertising", ads_media_desc: "TV, radio, print + YouTube pre-roll ads. Focused exposure on Korean diaspora community broadcasts.",
    ads_sns_title: "SNS Marketing", ads_sns_desc: "Targeted ads on Instagram, Facebook, KakaoTalk, LINE, WeChat. Custom content for 50-70 age group & Korean diaspora.",
    ads_online_title: "Online Advertising", ads_online_desc: "Google Search Ads (will, inheritance, estate planning keywords). Simultaneous campaigns on Naver, Yahoo Japan, Baidu.",
    ads_user_title: "User Acquisition Campaign", ads_user_desc: "Free AI will writing trial → conversion to e-certification. Referral program: 1 referral = 1 free re-certification.",
    ads_budget_title: "Marketing Budget Allocation",
    ads_budget_items: [
      { label: "SNS Ads", pct: "35%", desc: "Instagram, Facebook, KakaoTalk, LINE" },
      { label: "Search Ads", pct: "30%", desc: "Google, Naver, Yahoo Japan, Baidu" },
      { label: "Media Ads", pct: "20%", desc: "YouTube, TV, Radio, Diaspora broadcasts" },
      { label: "Referral & Viral", pct: "15%", desc: "Referral program, influencers, communities" },
    ],
    roadmap_title: "Global Launch Roadmap",
    roadmap_sub: "4 countries in 12 months",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 Korea Launch",
    rm_1_items: ["MVP launch", "eKYC integration", "Toss Payments", "Badge production"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 Japan Entry",
    rm_2_items: ["Digital notarization support", "Full Japanese support", "PayPay integration", "Local lawyer recruitment"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 Chinese Market",
    rm_3_items: ["HK & Taiwan first", "WeChat Pay integration", "Simplified Chinese", "Local partnerships"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 US Entry",
    rm_4_items: ["1M Korean-Americans target", "Stripe payments", "Full English support", "CA & NY law"],
    team_title: "Team",
    team_sub: "People executing the vision",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "CEO · SARAM Corp.",
    t1_desc: "30 years of business experience. Product development & planning expert. Targeting #1 global will platform.",
    invest_title: "Investment Terms",
    invest_sub: "Currently raising Seed Round",
    invest_round: "Seed Round",
    invest_amount: "Target: ₩500M ~ ₩1B (≈ $380K ~ $760K)",
    invest_valuation: "Pre-money Valuation: ₩3B (≈ $2.3M)",
    invest_use: "Use of Proceeds (Total ₩1B / ≈$760K)",
    invest_use_items: [
      { label: "Product Development", pct: "40%", desc: "₩400M ($304K) — AI will engine, eKYC, blockchain" },
      { label: "Marketing & Sales", pct: "30%", desc: "₩300M ($228K) — Korea & Japan launch, diaspora" },
      { label: "Legal & Compliance", pct: "15%", desc: "₩150M ($114K) — Multi-country legal, lawyer network" },
      { label: "Operations & Infra", pct: "15%", desc: "₩150M ($114K) — Servers, security, support" },
    ],
    invest_detail_title: "Detailed Budget Breakdown",
    invest_detail_items: [
      { category: "Product Development (₩400M / $304K)", items: [
        { name: "AI Will Writing Engine", amount: "₩120M ($91K)", note: "GPT-4/Claude API, legal text auto-generation" },
        { name: "eKYC Integration", amount: "₩60M ($46K)", note: "NICE, Veriff identity verification" },
        { name: "Blockchain Hash Record", amount: "₩40M ($30K)", note: "Polygon network, RFC 3161 timestamp" },
        { name: "Video Will Recording", amount: "₩50M ($38K)", note: "Recording, storage, encryption, timed release" },
        { name: "Badge NFC/QR System", amount: "₩50M ($38K)", note: "Badge manufacturing partner, app integration" },
        { name: "Security & Infrastructure", amount: "₩80M ($61K)", note: "E2E encryption, ISMS prep, server setup" },
      ]},
      { category: "Marketing & Sales (₩300M / $228K)", items: [
        { name: "Korea Launch Campaign", amount: "₩80M ($61K)", note: "SNS ads, search ads, PR" },
        { name: "Japan Market Entry", amount: "₩70M ($53K)", note: "Yahoo Japan, LINE ads, local PR" },
        { name: "Korean Diaspora Ads", amount: "₩60M ($46K)", note: "US, Japan, China Korean communities" },
        { name: "Influencer & Content", amount: "₩50M ($38K)", note: "YouTube & Instagram creator partnerships" },
        { name: "B2B Partnerships", amount: "₩40M ($30K)", note: "Funeral homes, hospitals, banks" },
      ]},
      { category: "Legal & Compliance (₩150M / $114K)", items: [
        { name: "Korea Legal Counsel", amount: "₩50M ($38K)", note: "Attorney Act, e-signature, privacy law" },
        { name: "Japan & US Legal Review", amount: "₩60M ($46K)", note: "Local will & inheritance law review" },
        { name: "Lawyer Network Setup", amount: "₩40M ($30K)", note: "Year 1: curated 10 lawyers" },
      ]},
      { category: "Operations & Infra (₩150M / $114K)", items: [
        { name: "Cloud Servers & CDN", amount: "₩50M ($38K)", note: "Vercel, Cloudflare, AWS" },
        { name: "Customer Support System", amount: "₩40M ($30K)", note: "CS tools, chatbot, multilingual" },
        { name: "Initial Hiring", amount: "₩60M ($46K)", note: "1 developer + 1 CS (6 months)" },
      ]},
    ],
    cta_title: "Let's Build Together",
    cta_sub: "We're looking for investors to join EverWill's global journey.\nReach out to us today.",
    cta_btn: "Send Investment Inquiry",
    cta_email: "adoco98@gmail.com",
    footer_conf: "This document is confidential. Unauthorized distribution is prohibited.",
    slides: [
      { badge: "World's First", title: "OS of the Will Industry", sub: "From writing to automatic post-death execution", highlight: "The global platform surpassing Trust & Will" },
      { badge: "Key Differentiator", title: "Physical Badge System", sub: "MedicAlert + AirTag + Will Certification", highlight: "Innovation no will platform has attempted worldwide" },
      { badge: "Global Market", title: "$184B Market", sub: "2030 global will market size", highlight: "Simultaneous entry: Korea, Japan, USA, China" },
      { badge: "Revenue Model", title: "LTV $5,500+", sub: "28x customer lifetime value vs Trust & Will", highlight: "$15 re-certification drives lifetime recurring revenue" },
      { badge: "Investment", title: "Seed Round Open", sub: "Target: ₩500M ~ ₩1B", highlight: "Pre-money Valuation: ₩3B (≈ $2.3M)" },
    ],
  },
  ja: {
    nav_invest: "投資家専用",
    hero_badge: "🌍 世界初のデジタル遺言OS",
    hero_title: "遺言業界の\nOSになります",
    hero_sub: "Trust & Will・Farewill・GoodTrustを超えるオールインワングローバル遺言プラットフォーム。\n作成から死後自動執行まで、全プロセスを担います。",
    hero_cta: "投資お問い合わせ",
    m1_label: "目標MAU（Year 2）", m1_val: "50,000",
    m2_label: "目標ARR（Year 3）", m2_val: "1,776億円",
    m3_label: "目標国数", m3_val: "7カ国",
    m4_label: "顧客LTV", m4_val: "¥814,800+",
    market_title: "グローバル遺言市場の機会",
    market_sub: "世界的な高齢化とデジタル転換が生む巨大な市場機会",
    market_chart_title: "国別市場規模（2030年予測、兆円）",
    market_growth_title: "グローバル市場成長予測（兆円）",
    comp_title: "競合比較",
    comp_sub: "EverWillだけが提供する独自機能",
    comp_feature: "機能",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will", comp_tw_country: "🇺🇸 米国",
    comp_fw: "Farewill", comp_fw_country: "🇬🇧 英国",
    comp_gt: "GoodTrust", comp_gt_country: "🇺🇸 米国",
    comp_rows: [
      { feature: "物理的Badgeシステム", ew: "✅ 世界初", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "4重死亡検知", ew: "✅ 自動化", tw: "❌ 手動", fw: "❌ 手動", gt: "❌ 手動" },
      { feature: "弁護士マーケットプレイス", ew: "✅ 死後執行", tw: "⚠️ 生前のみ", fw: "⚠️ 制限的", gt: "❌" },
      { feature: "グローバル多管轄", ew: "✅ 7カ国", tw: "❌ 米国のみ", fw: "❌ 英国のみ", gt: "❌ 米国のみ" },
      { feature: "AIチェックボックス作成", ew: "✅ 17分", tw: "⚠️ 複雑", fw: "⚠️ 複雑", gt: "⚠️ 複雑" },
      { feature: "動画遺言", ew: "✅ 含む", tw: "❌", fw: "❌", gt: "⚠️ 制限的" },
      { feature: "7言語対応（RTL）", ew: "✅ RTL含む", tw: "❌ 英語のみ", fw: "❌ 英語のみ", gt: "❌ 英語のみ" },
      { feature: "再認証費用", ew: "✅ ¥2,220", tw: "❌ $299/年", fw: "❌ £90/年", gt: "❌ $149/年" },
    ],
    diff_title: "なぜEverWillか？",
    diff_sub: "既存競合が解決できなかった10の革新",
    diff_1_title: "物理的Badgeシステム", diff_1_desc: "MedicAlert + AirTag + 遺言認証を一つに。世界のどの遺言プラットフォームも試みていない永続的差別化。",
    diff_2_title: "4重死亡検知", diff_2_desc: "家族報告 → 政府DB → Dead Man's Switch → 緊急発見者。自動執行トリガーシステム。",
    diff_3_title: "弁護士マーケットプレイス", diff_3_desc: "平時0%、死後100%。本当に必要な瞬間だけ登場する専門家ネットワーク。",
    diff_4_title: "チェックボックス17分完成", diff_4_desc: "白紙の恐怖を排除。AIがチェックボックスを法律文章に自動変換。",
    diff_5_title: "グローバル多管轄", diff_5_desc: "韓国 + 米国 + 日本の資産を同時に。このようなサービスは現在世界に存在しません。",
    diff_6_title: "LTV 28倍", diff_6_desc: "¥2,220再認証で生涯イベントごとに再訪問。Trust & Will比28倍のLTV。",
    revenue_title: "収益モデル",
    revenue_sub: "多層収益構造による安定成長",
    rev_pie_title: "収益構成比率",
    rev_1: "電子認証", rev_1_val: "¥5,772 / 件",
    rev_2: "年間メンバーシップ", rev_2_val: "¥4,292 / 年",
    rev_3: "Badge販売", rev_3_val: "¥7,252 ~ ¥44,252",
    rev_4: "弁護士手数料", rev_4_val: "報酬の15~25%",
    ltv_label: "顧客生涯価値（LTV）", ltv_val: "¥814,800+",
    finance_title: "財務予測",
    finance_sub: "保守的シナリオ基準3カ年目標（円建て）",
    finance_arr_title: "年間反復売上（ARR）目標（億円）",
    finance_user_title: "累積認証ユーザー目標",
    ads_title: "マーケティング戦略",
    ads_sub: "メディア・SNS・オンライン広告でグローバル会員獲得",
    ads_media_title: "メディア広告", ads_media_desc: "TV・ラジオ・新聞・雑誌 + YouTube プレロール広告。在日韓国人コミュニティ放送への集中露出。",
    ads_sns_title: "SNSマーケティング", ads_sns_desc: "Instagram・Facebook・LINE・WeChat ターゲット広告。50〜70代高齢層 + 在外韓国人向けカスタムコンテンツ。",
    ads_online_title: "オンライン広告", ads_online_desc: "Google検索広告（遺言書、相続、遺言作成キーワード）。Yahoo!Japan・百度同時運用。",
    ads_user_title: "会員獲得キャンペーン", ads_user_desc: "無料AI遺言作成体験 → 電子認証への転換誘導。紹介制度：1人紹介で再認証1回無料。",
    ads_budget_title: "マーケティング予算配分計画",
    ads_budget_items: [
      { label: "SNS広告", pct: "35%", desc: "Instagram・Facebook・LINE・WeChat" },
      { label: "検索広告", pct: "30%", desc: "Google・Yahoo!Japan・百度" },
      { label: "メディア広告", pct: "20%", desc: "YouTube・TV・ラジオ・在外韓国人放送" },
      { label: "紹介・バイラル", pct: "15%", desc: "紹介制度・インフルエンサー・コミュニティ" },
    ],
    roadmap_title: "グローバル展開ロードマップ",
    roadmap_sub: "12ヶ月で4カ国同時進出",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 韓国ローンチ",
    rm_1_items: ["MVPリリース", "eKYC連携", "Toss Payments決済", "Badge生産"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 日本進出",
    rm_2_items: ["公正証書デジタル化対応", "日本語完全対応", "PayPay連携", "現地弁護士採用"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 中華圏進出",
    rm_3_items: ["香港・台湾から先行", "WeChat Pay連携", "簡体字中国語対応", "現地パートナーシップ"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 米国進出",
    rm_4_items: ["在米韓国人100万人ターゲット", "Stripe決済", "英語完全対応", "CA・NY法律適用"],
    team_title: "チーム",
    team_sub: "ビジョンを実行する人々",
    t1_name: "Jeff Lah（라수환）",
    t1_role: "CEO · 株式会社SARAM",
    t1_desc: "30年の事業経験。製品開発・企画の専門家。グローバル遺言プラットフォーム1位を目指します。",
    invest_title: "投資条件",
    invest_sub: "シードラウンド投資募集中",
    invest_round: "シードラウンド",
    invest_amount: "目標調達額：₩5億〜₩10億（≈¥5,550万〜¥1.11億）",
    invest_valuation: "Pre-money Valuation：₩30億（≈¥3.33億）",
    invest_use: "投賄金使途計画（総額 ₩10億）",
    invest_use_items: [
      { label: "製品開発", pct: "40%", desc: "₩4億（¿¥4,440万）— AI遺言エンジン、eKYC、ブロックチェーン" },
      { label: "マーケティング・営業", pct: "30%", desc: "₩3億（¿¥3,330万）— 韓国・日本ローンチ、在外韓国人" },
      { label: "法務・コンプライアンス", pct: "15%", desc: "₩1.5億（¿¥1,665万）— 各国法律審査、弁護士ネットワーク" },
      { label: "運営・インフラ", pct: "15%", desc: "₩1.5億（¿¥1,665万）— サーバー、セキュリティ、サポート" },
    ],
    invest_detail_title: "項目別詳細資金計画",
    invest_detail_items: [
      { category: "製品開発（₩4億）", items: [
        { name: "AI遺言作成エンジン", amount: "₩1.2億", note: "GPT-4/Claude API連携、法律文章自動変換" },
        { name: "eKYC本人認証連携", amount: "₩6,000万", note: "NICE、Veriff連携" },
        { name: "ブロックチェーンハッシュ記録", amount: "₩4,000万", note: "Polygonネットワーク、RFC 3161タイムスタンプ" },
        { name: "映像遺言録画システム", amount: "₩5,000万", note: "録画・保存・暗号化・公開タイミング設定" },
        { name: "Badge NFC/QR連携", amount: "₩5,000万", note: "Badge製造パートナー連携、アプリ連携" },
        { name: "セキュリティ・インフラ構築", amount: "₩8,000万", note: "E2E暗号化、ISMS準備、サーバー構築" },
      ]},
      { category: "マーケティング・営業（₩3億）", items: [
        { name: "韓国ローンチキャンペーン", amount: "₩8,000万", note: "SNS広告、検索広告、PR" },
        { name: "日本進出マーケティング", amount: "₩7,000万", note: "Yahoo! Japan、LINE広告、現地PR" },
        { name: "在外韓国人ターゲット広告", amount: "₩6,000万", note: "米国・日本・中国韓人コミュニティ" },
        { name: "インフルエンサー・コンテンツ", amount: "₩5,000万", note: "YouTube・Instagramクリエイター協業" },
        { name: "営業・パートナーシップ", amount: "₩4,000万", note: "葯儀屋・病院・銀行提携" },
      ]},
      { category: "法務・コンプライアンス（₩1.5億）", items: [
        { name: "韓国法律アドバイザリー", amount: "₩5,000万", note: "弁護士法・電子署名法・個人情報保護法" },
        { name: "日本・米国法律審査", amount: "₩6,000万", note: "各国遺言法・相続法審査" },
        { name: "弁護士ネットワーク構築", amount: "₩4,000万", note: "Year 1 キュレーション型10名採用" },
      ]},
      { category: "運営・インフラ（₩1.5億）", items: [
        { name: "クラウドサーバー・CDN", amount: "₩5,000万", note: "Vercel、Cloudflare、AWS" },
        { name: "カスタマーサポートシステム", amount: "₩4,000万", note: "CSツール、チャットボット、多言語対応" },
        { name: "運営人材採用", amount: "₩6,000万", note: "開発者１名、CS１名（6ヶ月）" },
      ]},
    ],
    cta_title: "共に作りましょう",
    cta_sub: "EverWillのグローバルな旅に参加する投資家を募集しています。\n今すぐご連絡ください。",
    cta_btn: "投資お問い合わせを送る",
    cta_email: "adoco98@gmail.com",
    footer_conf: "本資料は機密です。無断配布を禁じます。",
    slides: [
      { badge: "世界初", title: "遺言業界のOS", sub: "作成から死後自動執行まで", highlight: "Trust & Willを超えるグローバルプラットフォーム" },
      { badge: "核心差別化", title: "物理的Badgeシステム", sub: "MedicAlert + AirTag + 遺言認証", highlight: "世界のどの遺言プラットフォームも試みていない革新" },
      { badge: "グローバル市場", title: "1,840億ドル市場", sub: "2030年グローバル遺言市場規模", highlight: "韓国・日本・米国・中国同時進出" },
      { badge: "収益モデル", title: "LTV ¥814,800+", sub: "Trust & Will比28倍の顧客生涯価値", highlight: "¥2,220再認証で生涯反復収益" },
      { badge: "投資機会", title: "シードラウンド募集中", sub: "目標調達額：₩5億〜₩10億", highlight: "Pre-money Valuation：₩30億" },
    ],
  },
  zh: {
    nav_invest: "仅限投资者",
    hero_badge: "🌍 全球首个数字遗嘱OS",
    hero_title: "成为遗嘱行业的\nOS",
    hero_sub: "超越Trust & Will、Farewill、GoodTrust的一体化全球遗嘱平台。\n从撰写到身后自动执行，全程负责。",
    hero_cta: "投资咨询",
    m1_label: "目标MAU（第2年）", m1_val: "50,000",
    m2_label: "目标ARR（第3年）", m2_val: "8,640万元",
    m3_label: "目标国家", m3_val: "7个国家",
    m4_label: "客户LTV", m4_val: "¥39,600+",
    market_title: "全球遗嘱市场机会",
    market_sub: "全球老龄化与数字化转型带来的巨大市场机会",
    market_chart_title: "各国市场规模（2030年预测，十亿元）",
    market_growth_title: "全球市场增长预测（十亿元）",
    comp_title: "竞争对手比较",
    comp_sub: "只有EverWill提供的独创功能",
    comp_feature: "功能",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will", comp_tw_country: "🇺🇸 美国",
    comp_fw: "Farewill", comp_fw_country: "🇬🇧 英国",
    comp_gt: "GoodTrust", comp_gt_country: "🇺🇸 美国",
    comp_rows: [
      { feature: "实体Badge系统", ew: "✅ 全球首创", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "四重死亡检测", ew: "✅ 自动化", tw: "❌ 手动", fw: "❌ 手动", gt: "❌ 手动" },
      { feature: "律师市场", ew: "✅ 身后执行", tw: "⚠️ 仅生前", fw: "⚠️ 有限", gt: "❌" },
      { feature: "全球多管辖权", ew: "✅ 7个国家", tw: "❌ 仅美国", fw: "❌ 仅英国", gt: "❌ 仅美国" },
      { feature: "AI复选框撰写", ew: "✅ 17分钟", tw: "⚠️ 复杂", fw: "⚠️ 复杂", gt: "⚠️ 复杂" },
      { feature: "视频遗嘱", ew: "✅ 包含", tw: "❌", fw: "❌", gt: "⚠️ 有限" },
      { feature: "7种语言（RTL）", ew: "✅ 含RTL", tw: "❌ 仅英语", fw: "❌ 仅英语", gt: "❌ 仅英语" },
      { feature: "重新认证费用", ew: "✅ ¥108", tw: "❌ $299/年", fw: "❌ £90/年", gt: "❌ $149/年" },
    ],
    diff_title: "为什么选择EverWill？",
    diff_sub: "现有竞争对手未能解决的10项创新",
    diff_1_title: "实体Badge系统", diff_1_desc: "MedicAlert + AirTag + 遗嘱认证合一。全球任何遗嘱平台都未尝试的永久差异化。",
    diff_2_title: "四重死亡检测", diff_2_desc: "家属报告 → 政府数据库 → Dead Man's Switch → 紧急发现者。自动执行触发系统。",
    diff_3_title: "律师市场", diff_3_desc: "平时0%，身后100%。只在真正需要时出现的专家网络。",
    diff_4_title: "复选框17分钟完成", diff_4_desc: "消除了白纸恐惧。AI自动将复选框转换为法律语言。",
    diff_5_title: "全球多管辖权", diff_5_desc: "同时管理韩国+美国+日本资产。目前全球没有此类服务。",
    diff_6_title: "LTV 28倍", diff_6_desc: "¥108重新认证驱动每次生命事件的重复访问。LTV是Trust & Will的28倍。",
    revenue_title: "收益模式",
    revenue_sub: "多层收益结构实现稳定增长",
    rev_pie_title: "收益构成比例",
    rev_1: "电子认证", rev_1_val: "¥281 / 件",
    rev_2: "年度会员", rev_2_val: "¥209 / 年",
    rev_3: "Badge销售", rev_3_val: "¥353 ~ ¥2,160",
    rev_4: "律师佣金", rev_4_val: "报酬的15~25%",
    ltv_label: "客户终身价值（LTV）", ltv_val: "¥39,600+",
    finance_title: "财务预测",
    finance_sub: "基于保守情景的3年目标（人民币）",
    finance_arr_title: "年度经常性收入（ARR）目标（百万元）",
    finance_user_title: "累计认证用户目标",
    ads_title: "营销策略",
    ads_sub: "通过媒体、SNS和在线广告获取全球用户",
    ads_media_title: "媒体广告", ads_media_desc: "电视、广播、报纸 + YouTube前贴片广告。重点投放海外韩国人社区频道。",
    ads_sns_title: "SNS营销", ads_sns_desc: "微信、微博、Instagram、Facebook定向广告。针对50-70岁老年群体和海外韩国人的定制内容。",
    ads_online_title: "在线广告", ads_online_desc: "百度搜索广告（遗嘱、继承、遗产规划关键词）。同时运营Google、Naver、Yahoo Japan。",
    ads_user_title: "用户获取活动", ads_user_desc: "免费AI遗嘱撰写体验 → 引导电子认证转化。推荐计划：推荐1人可获1次免费重新认证。",
    ads_budget_title: "营销预算分配计划",
    ads_budget_items: [
      { label: "SNS广告", pct: "35%", desc: "微信、微博、Instagram、Facebook" },
      { label: "搜索广告", pct: "30%", desc: "百度、Google、Naver、Yahoo Japan" },
      { label: "媒体广告", pct: "20%", desc: "YouTube、电视、广播、海外韩国人频道" },
      { label: "推荐与病毒式传播", pct: "15%", desc: "推荐计划、网红、社区" },
    ],
    roadmap_title: "全球发布路线图",
    roadmap_sub: "12个月内同时进入4个国家",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 韩国启动",
    rm_1_items: ["MVP发布", "eKYC集成", "Toss支付", "Badge生产"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 进入日本",
    rm_2_items: ["公证书数字化支持", "完整日语支持", "PayPay集成", "当地律师招募"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 进入中华圈",
    rm_3_items: ["香港、台湾优先", "微信支付集成", "简体中文支持", "当地合作伙伴"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 进入美国",
    rm_4_items: ["100万韩裔美国人目标", "Stripe支付", "完整英语支持", "加州纽约法律"],
    team_title: "团队",
    team_sub: "执行愿景的人们",
    t1_name: "Jeff Lah（라수환）",
    t1_role: "CEO · SARAM公司",
    t1_desc: "30年商业经验。产品开发与规划专家。目标成为全球遗嘱平台第一。",
    invest_title: "投资条件",
    invest_sub: "正在募集种子轮投资",
    invest_round: "种子轮",
    invest_amount: "目标募资：₩5亿〜₩10亿（约¥360万〜¥720万）",
    invest_valuation: "投前估值：₩30亿（约¥2,160万）",
    invest_use: "资金使用计划（总计 ₩10亿）",
    invest_use_items: [
      { label: "产品开发", pct: "40%", desc: "₩4亿（¿¥288万）— AI遗嘱引擎、eKYC、区块链" },
      { label: "营销与销售", pct: "30%", desc: "₩3亿（¿¥216万）— 韩日启动、海外韩人" },
      { label: "法务与合规", pct: "15%", desc: "₩1.5亿（¿¥108万）— 各国法律、律师网络" },
      { label: "运营与基础设施", pct: "15%", desc: "₩1.5亿（¿¥108万）— 服务器、安全、支持" },
    ],
    invest_detail_title: "项目详细资金计划",
    invest_detail_items: [
      { category: "产品开发（₩4亿）", items: [
        { name: "AI遗嘱写作引擎", amount: "₩1.2亿", note: "GPT-4/Claude API集成，法律文本自动转换" },
        { name: "eKYC身份认证集成", amount: "₩6,000万", note: "NICE、Veriff集成" },
        { name: "区块链哈希记录", amount: "₩4,000万", note: "Polygon网络，RFC 3161时间戳" },
        { name: "视频遗嘱录制系统", amount: "₩5,000万", note: "录制、存储、加密、定时公开设置" },
        { name: "Badge NFC/QR集成", amount: "₩5,000万", note: "Badge制造合作伙伴，App集成" },
        { name: "安全与基础设施", amount: "₩8,000万", note: "E2E加密、ISMS准备、服务器构建" },
      ]},
      { category: "营销与销售（₩3亿）", items: [
        { name: "韩国启动活动", amount: "₩8,000万", note: "SNS广告、搜索广告、PR" },
        { name: "日本市场进入", amount: "₩7,000万", note: "Yahoo Japan、LINE广告、当地PR" },
        { name: "海外韩人定向广告", amount: "₩6,000万", note: "美国、日本、中国韩人社区" },
        { name: "网红与内容营销", amount: "₩5,000万", note: "YouTube、Instagram创作者合作" },
        { name: "B2B合作伙伴", amount: "₩4,000万", note: "殖仪馆、医院、銀行合作" },
      ]},
      { category: "法务与合规（₩1.5亿）", items: [
        { name: "韩国法律顾问", amount: "₩5,000万", note: "律师法、电子签名法、隐私保护法" },
        { name: "日本及美国法律审查", amount: "₩6,000万", note: "各国遗嘱法、继承法审查" },
        { name: "律师网络建设", amount: "₩4,000万", note: "Year 1精选型10名律师" },
      ]},
      { category: "运营与基础设施（₩1.5亿）", items: [
        { name: "云服务器与CDN", amount: "₩5,000万", note: "Vercel、Cloudflare、AWS" },
        { name: "客户支持系统", amount: "₩4,000万", note: "CS工具、聊天机器人、多语言支持" },
        { name: "初期招聘", amount: "₩6,000万", note: "开发1名、CS 1名（6个月）" },
      ]},
    ],
    cta_title: "让我们共同创造",
    cta_sub: "我们正在寻找愿意加入EverWill全球旅程的投资者。\n立即联系我们。",
    cta_btn: "发送投资咨询",
    cta_email: "adoco98@gmail.com",
    footer_conf: "本文件为机密文件，禁止未经授权的分发。",
    slides: [
      { badge: "全球首创", title: "遗嘱行业的OS", sub: "从撰写到身后自动执行", highlight: "超越Trust & Will的全球平台" },
      { badge: "核心差异化", title: "实体Badge系统", sub: "MedicAlert + AirTag + 遗嘱认证", highlight: "全球任何遗嘱平台都未尝试的创新" },
      { badge: "全球市场", title: "1,840亿美元市场", sub: "2030年全球遗嘱市场规模", highlight: "韩国、日本、美国、中国同时进入" },
      { badge: "收益模式", title: "LTV ¥39,600+", sub: "客户终身价值是Trust & Will的28倍", highlight: "¥108重新认证驱动终身循环收益" },
      { badge: "投资机会", title: "种子轮开放中", sub: "目标募资：₩5亿〜₩10亿", highlight: "投前估值：₩30亿" },
    ],
  },
  de: {
    nav_invest: "Nur für Investoren",
    hero_badge: "🌍 Weltweit erstes digitales Testament-OS",
    hero_title: "Das OS der\nTestament-Industrie werden",
    hero_sub: "Eine All-in-One-Plattform, die Trust & Will, Farewill und GoodTrust übertrifft.\nVon der Erstellung bis zur automatischen Nachlass-Abwicklung.",
    hero_cta: "Investitionsanfrage",
    m1_label: "Ziel-MAU (Jahr 2)", m1_val: "50.000",
    m2_label: "Ziel-ARR (Jahr 3)", m2_val: "€11,2Mio.",
    m3_label: "Zielländer", m3_val: "7 Länder",
    m4_label: "Kunden-LTV", m4_val: "€5.115+",
    market_title: "Globale Testament-Marktchance",
    market_sub: "Riesige Marktchance durch globale Alterung und digitale Transformation",
    market_chart_title: "Marktgröße nach Land (Prognose 2030, Mrd. €)",
    market_growth_title: "Globale Marktentwicklung (Mrd. €)",
    comp_title: "Wettbewerbsanalyse",
    comp_sub: "Einzigartige Funktionen, die nur EverWill bietet",
    comp_feature: "Funktion",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will", comp_tw_country: "🇺🇸 USA",
    comp_fw: "Farewill", comp_fw_country: "🇬🇧 UK",
    comp_gt: "GoodTrust", comp_gt_country: "🇺🇸 USA",
    comp_rows: [
      { feature: "Physisches Badge-System", ew: "✅ Weltweit Erste", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "4-Schicht-Todeserkennung", ew: "✅ Automatisiert", tw: "❌ Manuell", fw: "❌ Manuell", gt: "❌ Manuell" },
      { feature: "Anwalts-Marktplatz", ew: "✅ Nachlassabwicklung", tw: "⚠️ Nur Lebzeiten", fw: "⚠️ Begrenzt", gt: "❌" },
      { feature: "Globale Multi-Jurisdiktion", ew: "✅ 7 Länder", tw: "❌ Nur USA", fw: "❌ Nur UK", gt: "❌ Nur USA" },
      { feature: "KI-Checkbox-Erstellung", ew: "✅ 17 Minuten", tw: "⚠️ Komplex", fw: "⚠️ Komplex", gt: "⚠️ Komplex" },
      { feature: "Video-Testament", ew: "✅ Enthalten", tw: "❌", fw: "❌", gt: "⚠️ Begrenzt" },
      { feature: "7 Sprachen (RTL)", ew: "✅ RTL enthalten", tw: "❌ Nur Englisch", fw: "❌ Nur Englisch", gt: "❌ Nur Englisch" },
      { feature: "Re-Zertifizierungskosten", ew: "✅ €14", tw: "❌ $299/Jahr", fw: "❌ £90/Jahr", gt: "❌ $149/Jahr" },
    ],
    diff_title: "Warum EverWill?",
    diff_sub: "10 Innovationen, die Wettbewerber nicht gelöst haben",
    diff_1_title: "Physisches Badge-System", diff_1_desc: "MedicAlert + AirTag + Testament-Zertifizierung in einem. Permanente Differenzierung, die kein Testament-Anbieter versucht hat.",
    diff_2_title: "4-Schicht-Todeserkennung", diff_2_desc: "Familienmeldung → Regierungs-DB → Dead Man's Switch → Notfallentdecker. Automatischer Ausführungsauslöser.",
    diff_3_title: "Anwalts-Marktplatz", diff_3_desc: "0% zu Lebzeiten, 100% nach dem Tod. Expertennetzwerk, das nur erscheint, wenn es wirklich gebraucht wird.",
    diff_4_title: "Checkbox in 17 Minuten", diff_4_desc: "Die Angst vor dem leeren Blatt beseitigt. KI konvertiert Checkboxen automatisch in Rechtssprache.",
    diff_5_title: "Globale Multi-Jurisdiktion", diff_5_desc: "Korea + USA + Japan-Vermögen gleichzeitig. Solch einen Service gibt es derzeit nirgendwo auf der Welt.",
    diff_6_title: "28x LTV", diff_6_desc: "€14 Re-Zertifizierung treibt Wiederholungsbesuche bei jedem Lebensereignis. 28x LTV vs. Trust & Will.",
    revenue_title: "Umsatzmodell",
    revenue_sub: "Stabiles Wachstum durch mehrschichtige Umsatzstruktur",
    rev_pie_title: "Umsatzmix",
    rev_1: "Elektronische Zertifizierung", rev_1_val: "€36 / Zert.",
    rev_2: "Jahresmitgliedschaft", rev_2_val: "€27 / Jahr",
    rev_3: "Badge-Verkauf", rev_3_val: "€46 ~ €278",
    rev_4: "Anwaltsgebühren", rev_4_val: "15~25% der Vergütung",
    ltv_label: "Kunden-Lebenszeitwert (LTV)", ltv_val: "€5.115+",
    finance_title: "Finanzprognose",
    finance_sub: "3-Jahres-Ziele basierend auf konservativem Szenario (EUR)",
    finance_arr_title: "Jährlich wiederkehrender Umsatz (ARR) Ziel (Mio. €)",
    finance_user_title: "Kumulierte zertifizierte Nutzer Ziel",
    ads_title: "Marketingstrategie",
    ads_sub: "Globale Nutzergewinnung durch Medien, SNS & Online-Werbung",
    ads_media_title: "Medienwerbung", ads_media_desc: "TV, Radio, Print + YouTube Pre-Roll-Anzeigen. Fokussierte Präsenz in koreanischen Diaspora-Gemeinschaftsmedien.",
    ads_sns_title: "SNS-Marketing", ads_sns_desc: "Gezielte Anzeigen auf Instagram, Facebook, LINE, WeChat. Maßgeschneiderte Inhalte für 50-70-Jährige und koreanische Diaspora.",
    ads_online_title: "Online-Werbung", ads_online_desc: "Google-Suchanzeigen (Testament, Erbschaft, Nachlassplanung). Gleichzeitige Kampagnen auf Naver, Yahoo Japan, Baidu.",
    ads_user_title: "Nutzerakquisitionskampagne", ads_user_desc: "Kostenlose KI-Testament-Erstellung → Konvertierung zur E-Zertifizierung. Empfehlungsprogramm: 1 Empfehlung = 1 kostenlose Re-Zertifizierung.",
    ads_budget_title: "Marketingbudget-Aufteilung",
    ads_budget_items: [
      { label: "SNS-Anzeigen", pct: "35%", desc: "Instagram, Facebook, LINE, WeChat" },
      { label: "Suchanzeigen", pct: "30%", desc: "Google, Naver, Yahoo Japan, Baidu" },
      { label: "Medienanzeigen", pct: "20%", desc: "YouTube, TV, Radio, Diaspora-Sender" },
      { label: "Empfehlung & Viral", pct: "15%", desc: "Empfehlungsprogramm, Influencer, Communities" },
    ],
    roadmap_title: "Globaler Launch-Fahrplan",
    roadmap_sub: "4 Länder in 12 Monaten",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 Korea-Start",
    rm_1_items: ["MVP-Launch", "eKYC-Integration", "Toss Payments", "Badge-Produktion"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 Japan-Eintritt",
    rm_2_items: ["Digitale Beurkundung", "Vollständige Japanisch-Unterstützung", "PayPay-Integration", "Lokale Anwälte"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 Chinesischer Markt",
    rm_3_items: ["HK & Taiwan zuerst", "WeChat Pay", "Vereinfachtes Chinesisch", "Lokale Partner"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 USA-Eintritt",
    rm_4_items: ["1M Koreanisch-Amerikaner", "Stripe", "Vollständiges Englisch", "CA & NY Recht"],
    team_title: "Team",
    team_sub: "Menschen, die die Vision umsetzen",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "CEO · SARAM Corp.",
    t1_desc: "30 Jahre Geschäftserfahrung. Experte für Produktentwicklung und -planung. Ziel: globale Testament-Plattform Nr. 1.",
    invest_title: "Investitionsbedingungen",
    invest_sub: "Seed-Runde wird derzeit aufgebracht",
    invest_round: "Seed-Runde",
    invest_amount: "Ziel: ₩500M ~ ₩1B (≈ €380K ~ €760K)",
    invest_valuation: "Pre-money Bewertung: ₩3B (≈ €2,1M)",
    invest_use: "Mittelverwendung (Gesamt ₩1B / ≈€760K)",
    invest_use_items: [
      { label: "Produktentwicklung", pct: "40%", desc: "₩400M (≈€304K) — KI-Engine, eKYC, Blockchain" },
      { label: "Marketing & Vertrieb", pct: "30%", desc: "₩300M (≈€228K) — Korea & Japan Launch, Diaspora" },
      { label: "Rechts & Compliance", pct: "15%", desc: "₩150M (≈€114K) — Rechtspüfung, Anwaltsnetzwerk" },
      { label: "Betrieb & Infrastruktur", pct: "15%", desc: "₩150M (≈€114K) — Server, Sicherheit, Support" },
    ],
    invest_detail_title: "Detaillierter Budgetplan",
    invest_detail_items: [
      { category: "Produktentwicklung (₩400M / ≈€304K)", items: [
        { name: "KI-Testament-Engine", amount: "₩120M (≈€91K)", note: "GPT-4/Claude API, automatische Rechtsgenerierung" },
        { name: "eKYC-Integration", amount: "₩60M (≈€46K)", note: "NICE, Veriff Identitätsprüfung" },
        { name: "Blockchain-Hash-Aufzeichnung", amount: "₩40M (≈€30K)", note: "Polygon-Netzwerk, RFC 3161 Zeitstempel" },
        { name: "Video-Testament-System", amount: "₩50M (≈€38K)", note: "Aufnahme, Speicherung, Verschlüsselung, zeitgesteuerter Zugang" },
        { name: "Badge NFC/QR-System", amount: "₩50M (≈€38K)", note: "Badge-Hersteller, App-Integration" },
        { name: "Sicherheit & Infrastruktur", amount: "₩80M (≈€61K)", note: "E2E-Verschlüsselung, ISMS, Server" },
      ]},
      { category: "Marketing & Vertrieb (₩300M / ≈€228K)", items: [
        { name: "Korea-Launch-Kampagne", amount: "₩80M (≈€61K)", note: "SNS-Werbung, Suchanzeigen, PR" },
        { name: "Japan-Markteintritt", amount: "₩70M (≈€53K)", note: "Yahoo Japan, LINE-Anzeigen, lokales PR" },
        { name: "Koreanische Diaspora-Anzeigen", amount: "₩60M (≈€46K)", note: "US, Japan, China koreanische Communities" },
        { name: "Influencer & Content", amount: "₩50M (≈€38K)", note: "YouTube & Instagram Creator-Partnerschaften" },
        { name: "B2B-Partnerschaften", amount: "₩40M (≈€30K)", note: "Bestattungsunternehmen, Krankenhäuser, Banken" },
      ]},
      { category: "Rechts & Compliance (₩150M / ≈€114K)", items: [
        { name: "Korea-Rechtsberatung", amount: "₩50M (≈€38K)", note: "Anwaltsgesetz, E-Signatur, Datenschutz" },
        { name: "Japan & USA Rechtsprüfung", amount: "₩60M (≈€46K)", note: "Lokales Testament- und Erbrecht" },
        { name: "Anwaltsnetzwerk-Aufbau", amount: "₩40M (≈€30K)", note: "Jahr 1: 10 kuratierte Anwälte" },
      ]},
      { category: "Betrieb & Infrastruktur (₩150M / ≈€114K)", items: [
        { name: "Cloud-Server & CDN", amount: "₩50M (≈€38K)", note: "Vercel, Cloudflare, AWS" },
        { name: "Kundensupport-System", amount: "₩40M (≈€30K)", note: "CS-Tools, Chatbot, mehrsprachig" },
        { name: "Ersteinstellungen", amount: "₩60M (≈€46K)", note: "1 Entwickler + 1 CS (6 Monate)" },
      ]},
    ],
    cta_title: "Lassen Sie uns gemeinsam aufbauen",
    cta_sub: "Wir suchen Investoren, die EverWills globale Reise begleiten.\nKontaktieren Sie uns noch heute.",
    cta_btn: "Investitionsanfrage senden",
    cta_email: "adoco98@gmail.com",
    footer_conf: "Dieses Dokument ist vertraulich. Unbefugte Weitergabe ist verboten.",
    slides: [
      { badge: "Weltweit Erste", title: "OS der Testament-Industrie", sub: "Von der Erstellung bis zur automatischen Abwicklung", highlight: "Die globale Plattform, die Trust & Will übertrifft" },
      { badge: "Kern-Differenzierung", title: "Physisches Badge-System", sub: "MedicAlert + AirTag + Testament-Zertifizierung", highlight: "Innovation, die kein Testament-Anbieter versucht hat" },
      { badge: "Globaler Markt", title: "$184 Mrd. Markt", sub: "Globale Testament-Marktgröße 2030", highlight: "Gleichzeitiger Eintritt: Korea, Japan, USA, China" },
      { badge: "Umsatzmodell", title: "LTV €5.115+", sub: "28x Kunden-Lebenszeitwert vs. Trust & Will", highlight: "€14 Re-Zertifizierung treibt lebenslange Einnahmen" },
      { badge: "Investitionschance", title: "Seed-Runde offen", sub: "Ziel: ₩500M ~ ₩1B", highlight: "Pre-money Bewertung: ₩3B (≈ €2,1M)" },
    ],
  },
  es: {
    nav_invest: "Solo para Inversores",
    hero_badge: "🌍 El Primer OS Digital de Testamentos del Mundo",
    hero_title: "Convertirse en el OS\nde la industria testamentaria",
    hero_sub: "Una plataforma global todo-en-uno que supera a Trust & Will, Farewill y GoodTrust.\nDesde la redacción hasta la ejecución automática post-mortem.",
    hero_cta: "Consulta de Inversión",
    m1_label: "MAU objetivo (Año 2)", m1_val: "50.000",
    m2_label: "ARR objetivo (Año 3)", m2_val: "$12M",
    m3_label: "Países objetivo", m3_val: "7 países",
    m4_label: "LTV del cliente", m4_val: "$5.500+",
    market_title: "Oportunidad del Mercado Global de Testamentos",
    market_sub: "Una enorme oportunidad de mercado creada por el envejecimiento global y la transformación digital",
    market_chart_title: "Tamaño del mercado por país (Previsión 2030, $B)",
    market_growth_title: "Previsión de crecimiento del mercado global ($B)",
    comp_title: "Análisis Competitivo",
    comp_sub: "Características únicas que solo EverWill proporciona",
    comp_feature: "Función",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will", comp_tw_country: "🇺🇸 EE.UU.",
    comp_fw: "Farewill", comp_fw_country: "🇬🇧 Reino Unido",
    comp_gt: "GoodTrust", comp_gt_country: "🇺🇸 EE.UU.",
    comp_rows: [
      { feature: "Sistema de Badge físico", ew: "✅ 1º mundial", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "Detección de muerte 4 capas", ew: "✅ Automatizado", tw: "❌ Manual", fw: "❌ Manual", gt: "❌ Manual" },
      { feature: "Mercado de abogados", ew: "✅ Ejec. post-mort.", tw: "⚠️ Solo en vida", fw: "⚠️ Limitado", gt: "❌" },
      { feature: "Multi-jurisdicción global", ew: "✅ 7 países", tw: "❌ Solo EE.UU.", fw: "❌ Solo UK", gt: "❌ Solo EE.UU." },
      { feature: "Redacción IA con casillas", ew: "✅ 17 minutos", tw: "⚠️ Complejo", fw: "⚠️ Complejo", gt: "⚠️ Complejo" },
      { feature: "Testamento en vídeo", ew: "✅ Incluido", tw: "❌", fw: "❌", gt: "⚠️ Limitado" },
      { feature: "7 idiomas (RTL)", ew: "✅ RTL incluido", tw: "❌ Solo inglés", fw: "❌ Solo inglés", gt: "❌ Solo inglés" },
      { feature: "Costo re-certificación", ew: "✅ $15", tw: "❌ $299/año", fw: "❌ £90/año", gt: "❌ $149/año" },
    ],
    diff_title: "¿Por qué EverWill?",
    diff_sub: "10 innovaciones que los competidores no han resuelto",
    diff_1_title: "Sistema de Badge físico", diff_1_desc: "MedicAlert + AirTag + certificación de testamento en uno. Diferenciación permanente que ninguna plataforma ha intentado.",
    diff_2_title: "Detección de muerte 4 capas", diff_2_desc: "Informe familiar → BD gubernamental → Dead Man's Switch → Descubridor de emergencia. Disparador de ejecución automática.",
    diff_3_title: "Mercado de abogados", diff_3_desc: "0% en vida, 100% después de la muerte. Red de expertos que aparece solo cuando realmente se necesita.",
    diff_4_title: "Casillas en 17 minutos", diff_4_desc: "Eliminó el miedo a la página en blanco. La IA convierte casillas en lenguaje legal automáticamente.",
    diff_5_title: "Multi-jurisdicción global", diff_5_desc: "Activos en Corea + EE.UU. + Japón simultáneamente. No existe tal servicio en el mundo actualmente.",
    diff_6_title: "LTV 28x", diff_6_desc: "Re-certificación de $15 impulsa visitas repetidas en cada evento vital. LTV 28x vs Trust & Will.",
    revenue_title: "Modelo de Ingresos",
    revenue_sub: "Crecimiento estable a través de estructura de ingresos multicapa",
    rev_pie_title: "Composición de ingresos",
    rev_1: "Certificación electrónica", rev_1_val: "$39 / cert.",
    rev_2: "Membresía anual", rev_2_val: "$29 / año",
    rev_3: "Ventas de Badge", rev_3_val: "$49 ~ $299",
    rev_4: "Comisión de abogados", rev_4_val: "15~25% de honorarios",
    ltv_label: "Valor de vida del cliente (LTV)", ltv_val: "$5.500+",
    finance_title: "Proyecciones Financieras",
    finance_sub: "Objetivos a 3 años basados en escenario conservador (USD)",
    finance_arr_title: "Objetivo de Ingresos Recurrentes Anuales (ARR) ($M)",
    finance_user_title: "Objetivo de Usuarios Certificados Acumulados",
    ads_title: "Estrategia de Marketing",
    ads_sub: "Adquisición de suscriptores globales mediante Medios, SNS y Publicidad Online",
    ads_media_title: "Publicidad en Medios", ads_media_desc: "TV, radio, prensa + anuncios pre-roll de YouTube. Exposición concentrada en medios de la comunidad coreana en el extranjero.",
    ads_sns_title: "Marketing en SNS", ads_sns_desc: "Anuncios dirigidos en Instagram, Facebook, LINE, WeChat. Contenido personalizado para mayores de 50-70 años y coreanos en el extranjero.",
    ads_online_title: "Publicidad Online", ads_online_desc: "Anuncios de búsqueda en Google (testamento, herencia, planificación patrimonial). Campañas simultáneas en Naver, Yahoo Japan, Baidu.",
    ads_user_title: "Campaña de Adquisición de Usuarios", ads_user_desc: "Prueba gratuita de redacción de testamento con IA → conversión a e-certificación. Programa de referidos: 1 referido = 1 re-certificación gratuita.",
    ads_budget_title: "Plan de Asignación de Presupuesto de Marketing",
    ads_budget_items: [
      { label: "Anuncios SNS", pct: "35%", desc: "Instagram, Facebook, LINE, WeChat" },
      { label: "Anuncios de búsqueda", pct: "30%", desc: "Google, Naver, Yahoo Japan, Baidu" },
      { label: "Anuncios en medios", pct: "20%", desc: "YouTube, TV, Radio, emisoras de la diáspora" },
      { label: "Referidos y viral", pct: "15%", desc: "Programa de referidos, influencers, comunidades" },
    ],
    roadmap_title: "Hoja de Ruta de Lanzamiento Global",
    roadmap_sub: "4 países en 12 meses",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 Lanzamiento Corea",
    rm_1_items: ["Lanzamiento MVP", "Integración eKYC", "Toss Payments", "Producción Badge"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 Entrada Japón",
    rm_2_items: ["Notarización digital", "Soporte japonés completo", "Integración PayPay", "Abogados locales"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 Mercado Chino",
    rm_3_items: ["HK y Taiwán primero", "WeChat Pay", "Chino simplificado", "Socios locales"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 Entrada EE.UU.",
    rm_4_items: ["1M coreano-americanos", "Stripe", "Inglés completo", "Ley CA y NY"],
    team_title: "Equipo",
    team_sub: "Personas ejecutando la visión",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "CEO · SARAM Corp.",
    t1_desc: "30 años de experiencia empresarial. Experto en desarrollo y planificación de productos. Objetivo: plataforma de testamentos global #1.",
    invest_title: "Condiciones de Inversión",
    invest_sub: "Actualmente recaudando Ronda Semilla",
    invest_round: "Ronda Semilla",
    invest_amount: "Objetivo: ₩500M ~ ₩1B (≈ $380K ~ $760K)",
    invest_valuation: "Valoración Pre-money: ₩3B (≈ $2,3M)",
    invest_use: "Uso de los Fondos (Total ₩1B / ≈$760K)",
    invest_use_items: [
      { label: "Desarrollo de Producto", pct: "40%", desc: "₩400M ($304K) — Motor IA, eKYC, blockchain" },
      { label: "Marketing y Ventas", pct: "30%", desc: "₩300M ($228K) — Lanzamiento Corea & Japón, diáspora" },
      { label: "Legal y Cumplimiento", pct: "15%", desc: "₩150M ($114K) — Revisión legal, red de abogados" },
      { label: "Operaciones e Infraestructura", pct: "15%", desc: "₩150M ($114K) — Servidores, seguridad, soporte" },
    ],
    invest_detail_title: "Desglose Detallado del Presupuesto",
    invest_detail_items: [
      { category: "Desarrollo de Producto (₩400M / $304K)", items: [
        { name: "Motor de Testamento IA", amount: "₩120M ($91K)", note: "GPT-4/Claude API, generación automática de texto legal" },
        { name: "Integración eKYC", amount: "₩60M ($46K)", note: "NICE, Veriff verificación de identidad" },
        { name: "Registro Hash Blockchain", amount: "₩40M ($30K)", note: "Red Polygon, marca de tiempo RFC 3161" },
        { name: "Sistema de Testamento en Video", amount: "₩50M ($38K)", note: "Grabación, almacenamiento, cifrado, lanzamiento programado" },
        { name: "Sistema Badge NFC/QR", amount: "₩50M ($38K)", note: "Fabricante de Badge, integración de app" },
        { name: "Seguridad e Infraestructura", amount: "₩80M ($61K)", note: "Cifrado E2E, preparación ISMS, configuración de servidor" },
      ]},
      { category: "Marketing y Ventas (₩300M / $228K)", items: [
        { name: "Campaña de Lanzamiento en Corea", amount: "₩80M ($61K)", note: "Anuncios SNS, búsqueda, PR" },
        { name: "Entrada al Mercado Japonés", amount: "₩70M ($53K)", note: "Yahoo Japan, anuncios LINE, PR local" },
        { name: "Anuncios Diáspora Coreana", amount: "₩60M ($46K)", note: "Comunidades coreanas en EE.UU., Japón, China" },
        { name: "Influencers y Contenido", amount: "₩50M ($38K)", note: "Asociaciones con creadores de YouTube e Instagram" },
        { name: "Alianzas B2B", amount: "₩40M ($30K)", note: "Funerarias, hospitales, bancos" },
      ]},
      { category: "Legal y Cumplimiento (₩150M / $114K)", items: [
        { name: "Asesoría Legal en Corea", amount: "₩50M ($38K)", note: "Ley de Abogados, firma electrónica, privacidad" },
        { name: "Revisión Legal Japón & EE.UU.", amount: "₩60M ($46K)", note: "Revisión de ley de testamentos y herencias" },
        { name: "Construcción de Red de Abogados", amount: "₩40M ($30K)", note: "Año 1: 10 abogados seleccionados" },
      ]},
      { category: "Operaciones e Infraestructura (₩150M / $114K)", items: [
        { name: "Servidores en la Nube & CDN", amount: "₩50M ($38K)", note: "Vercel, Cloudflare, AWS" },
        { name: "Sistema de Soporte al Cliente", amount: "₩40M ($30K)", note: "Herramientas CS, chatbot, multilingüe" },
        { name: "Contratación Inicial", amount: "₩60M ($46K)", note: "1 desarrollador + 1 CS (6 meses)" },
      ]},
    ],
    cta_title: "Construyamos Juntos",
    cta_sub: "Buscamos inversores para unirse al viaje global de EverWill.\nContáctenos hoy mismo.",
    cta_btn: "Enviar Consulta de Inversión",
    cta_email: "adoco98@gmail.com",
    footer_conf: "Este documento es confidencial. Se prohíbe su distribución no autorizada.",
    slides: [
      { badge: "Primero en el Mundo", title: "OS de la Industria Testamentaria", sub: "Desde la redacción hasta la ejecución automática", highlight: "La plataforma global que supera a Trust & Will" },
      { badge: "Diferenciación Clave", title: "Sistema de Badge Físico", sub: "MedicAlert + AirTag + Certificación de Testamento", highlight: "Innovación que ninguna plataforma ha intentado" },
      { badge: "Mercado Global", title: "Mercado de $184B", sub: "Tamaño del mercado global de testamentos 2030", highlight: "Entrada simultánea: Corea, Japón, EE.UU., China" },
      { badge: "Modelo de Ingresos", title: "LTV $5.500+", sub: "28x valor de vida del cliente vs Trust & Will", highlight: "$15 re-certificación impulsa ingresos recurrentes" },
      { badge: "Oportunidad de Inversión", title: "Ronda Semilla Abierta", sub: "Objetivo: ₩500M ~ ₩1B", highlight: "Valoración Pre-money: ₩3B (≈ $2,3M)" },
    ],
  },
  ar: {
    nav_invest: "للمستثمرين فقط",
    hero_badge: "🌍 أول نظام تشغيل رقمي للوصايا في العالم",
    hero_title: "نصبح نظام التشغيل\nلصناعة الوصايا",
    hero_sub: "منصة عالمية متكاملة تتفوق على Trust & Will وFarewill وGoodTrust.\nمن الكتابة إلى التنفيذ التلقائي بعد الوفاة.",
    hero_cta: "استفسار الاستثمار",
    m1_label: "هدف MAU (السنة 2)", m1_val: "50,000",
    m2_label: "هدف ARR (السنة 3)", m2_val: "45م﷼",
    m3_label: "الدول المستهدفة", m3_val: "7 دول",
    m4_label: "قيمة عمر العميل", m4_val: "﷼20,625+",
    market_title: "فرصة سوق الوصايا العالمي",
    market_sub: "فرصة سوق ضخمة يخلقها الشيخوخة العالمية والتحول الرقمي",
    market_chart_title: "حجم السوق حسب الدولة (توقعات 2030، مليار﷼)",
    market_growth_title: "توقعات نمو السوق العالمي (مليار﷼)",
    comp_title: "مقارنة المنافسين",
    comp_sub: "ميزات فريدة يوفرها EverWill فقط",
    comp_feature: "الميزة",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will", comp_tw_country: "🇺🇸 أمريكا",
    comp_fw: "Farewill", comp_fw_country: "🇬🇧 المملكة المتحدة",
    comp_gt: "GoodTrust", comp_gt_country: "🇺🇸 أمريكا",
    comp_rows: [
      { feature: "نظام Badge المادي", ew: "✅ الأول عالمياً", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "كشف الوفاة 4 طبقات", ew: "✅ آلي", tw: "❌ يدوي", fw: "❌ يدوي", gt: "❌ يدوي" },
      { feature: "سوق المحامين", ew: "✅ تنفيذ ما بعد الوفاة", tw: "⚠️ حياة فقط", fw: "⚠️ محدود", gt: "❌" },
      { feature: "الولاية القضائية المتعددة", ew: "✅ 7 دول", tw: "❌ أمريكا فقط", fw: "❌ المملكة المتحدة فقط", gt: "❌ أمريكا فقط" },
      { feature: "كتابة AI بمربعات الاختيار", ew: "✅ 17 دقيقة", tw: "⚠️ معقد", fw: "⚠️ معقد", gt: "⚠️ معقد" },
      { feature: "وصية فيديو", ew: "✅ مضمنة", tw: "❌", fw: "❌", gt: "⚠️ محدودة" },
      { feature: "7 لغات (RTL)", ew: "✅ RTL مضمن", tw: "❌ إنجليزية فقط", fw: "❌ إنجليزية فقط", gt: "❌ إنجليزية فقط" },
      { feature: "تكلفة إعادة التصديق", ew: "✅ ﷼56", tw: "❌ $299/سنة", fw: "❌ £90/سنة", gt: "❌ $149/سنة" },
    ],
    diff_title: "لماذا EverWill؟",
    diff_sub: "10 ابتكارات لم يحلها المنافسون",
    diff_1_title: "نظام Badge المادي", diff_1_desc: "MedicAlert + AirTag + توثيق الوصية في واحد. تمييز دائم لم تحاوله أي منصة وصايا في العالم.",
    diff_2_title: "كشف الوفاة 4 طبقات", diff_2_desc: "تقرير الأسرة → قاعدة بيانات الحكومة → Dead Man's Switch → مكتشف الطوارئ. نظام تشغيل تلقائي.",
    diff_3_title: "سوق المحامين", diff_3_desc: "0% في الحياة، 100% بعد الوفاة. شبكة خبراء تظهر فقط عند الحاجة الحقيقية.",
    diff_4_title: "مربعات الاختيار في 17 دقيقة", diff_4_desc: "أزلنا الخوف من الصفحة البيضاء. يحول الذكاء الاصطناعي مربعات الاختيار إلى لغة قانونية تلقائياً.",
    diff_5_title: "الولاية القضائية المتعددة العالمية", diff_5_desc: "أصول كوريا + أمريكا + اليابان في آنٍ واحد. لا توجد خدمة كهذه في العالم حالياً.",
    diff_6_title: "LTV 28 ضعفاً", diff_6_desc: "إعادة التصديق بـ﷼56 تدفع الزيارات المتكررة في كل حدث حياتي. LTV أعلى 28 مرة من Trust & Will.",
    revenue_title: "نموذج الإيرادات",
    revenue_sub: "نمو مستقر من خلال هيكل إيرادات متعدد الطبقات",
    rev_pie_title: "توزيع الإيرادات",
    rev_1: "التصديق الإلكتروني", rev_1_val: "﷼146 / شهادة",
    rev_2: "العضوية السنوية", rev_2_val: "﷼109 / سنة",
    rev_3: "مبيعات Badge", rev_3_val: "﷼184 ~ ﷼1,121",
    rev_4: "عمولة المحامي", rev_4_val: "15~25% من الأتعاب",
    ltv_label: "قيمة عمر العميل (LTV)", ltv_val: "﷼20,625+",
    finance_title: "التوقعات المالية",
    finance_sub: "أهداف 3 سنوات بناءً على سيناريو محافظ (ريال سعودي)",
    finance_arr_title: "هدف الإيرادات المتكررة السنوية (ARR) (مليون﷼)",
    finance_user_title: "هدف المستخدمين المعتمدين التراكمي",
    ads_title: "استراتيجية التسويق",
    ads_sub: "اكتساب مشتركين عالميين عبر الإعلام ووسائل التواصل والإعلانات الإلكترونية",
    ads_media_title: "الإعلانات الإعلامية", ads_media_desc: "تلفزيون وراديو وصحافة + إعلانات YouTube. تركيز على وسائل إعلام مجتمع الكوريين في الخارج.",
    ads_sns_title: "تسويق وسائل التواصل الاجتماعي", ads_sns_desc: "إعلانات موجهة على Instagram وFacebook وLINE وWeChat. محتوى مخصص لفئة 50-70 سنة والكوريين في الخارج.",
    ads_online_title: "الإعلانات الإلكترونية", ads_online_desc: "إعلانات بحث Google (وصية، إرث، تخطيط التركة). حملات متزامنة على Naver وYahoo Japan وBaidu.",
    ads_user_title: "حملة اكتساب المستخدمين", ads_user_desc: "تجربة كتابة وصية AI مجانية → تحويل إلى التصديق الإلكتروني. برنامج الإحالة: إحالة 1 = إعادة تصديق مجانية 1.",
    ads_budget_title: "خطة توزيع ميزانية التسويق",
    ads_budget_items: [
      { label: "إعلانات SNS", pct: "35%", desc: "Instagram وFacebook وLINE وWeChat" },
      { label: "إعلانات البحث", pct: "30%", desc: "Google وNaver وYahoo Japan وBaidu" },
      { label: "الإعلانات الإعلامية", pct: "20%", desc: "YouTube والتلفزيون والراديو وقنوات الكوريين" },
      { label: "الإحالة والانتشار", pct: "15%", desc: "برنامج الإحالة والمؤثرون والمجتمعات" },
    ],
    roadmap_title: "خارطة طريق الإطلاق العالمي",
    roadmap_sub: "4 دول في 12 شهراً",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 إطلاق كوريا",
    rm_1_items: ["إطلاق MVP", "تكامل eKYC", "مدفوعات Toss", "إنتاج Badge"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 دخول اليابان",
    rm_2_items: ["دعم التوثيق الرقمي", "دعم ياباني كامل", "تكامل PayPay", "توظيف محامين محليين"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 السوق الصيني",
    rm_3_items: ["هونج كونج وتايوان أولاً", "WeChat Pay", "الصينية المبسطة", "شراكات محلية"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 دخول أمريكا",
    rm_4_items: ["مليون كوري أمريكي", "Stripe", "إنجليزية كاملة", "قانون CA وNY"],
    team_title: "الفريق",
    team_sub: "الأشخاص الذين ينفذون الرؤية",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "الرئيس التنفيذي · شركة SARAM",
    t1_desc: "30 عاماً من الخبرة التجارية. خبير في تطوير المنتجات والتخطيط. الهدف: المنصة الأولى عالمياً للوصايا.",
    invest_title: "شروط الاستثمار",
    invest_sub: "جولة البذر قيد التمويل حالياً",
    invest_round: "جولة البذر",
    invest_amount: "الهدف: ₩500M ~ ₩1B (≈ $380K ~ $760K)",
    invest_valuation: "التقييم قبل الاستثمار: ₩3B (≈ $2.3M)",
    invest_use: "خطة استخدام الأموال (الإجمالي ₩1B / ≈$760K)",
    invest_use_items: [
      { label: "تطوير المنتج", pct: "40%", desc: "₩400M ($304K) — محرك AI، eKYC، بلوكشين" },
      { label: "التسويق والمبيعات", pct: "30%", desc: "₩300M ($228K) — إطلاق كوريا واليابان، الكوريون" },
      { label: "القانوني والامتثال", pct: "15%", desc: "₩150M ($114K) — مراجعة قانونية، شبكة محامين" },
      { label: "العمليات والبنية التحتية", pct: "15%", desc: "₩150M ($114K) — خوادم، أمان، دعم" },
    ],
    invest_detail_title: "خطة الميزانية التفصيلية",
    invest_detail_items: [
      { category: "تطوير المنتج (₩400M / $304K)", items: [
        { name: "محرك كتابة الوصية بالذكاء الاصطناعي", amount: "₩120M ($91K)", note: "GPT-4/Claude API، توليد نص قانوني تلقائي" },
        { name: "تكامل eKYC", amount: "₩60M ($46K)", note: "NICE، Veriff للتحقق من الهوية" },
        { name: "تسجيل هاش البلوكشين", amount: "₩40M ($30K)", note: "شبكة Polygon، ختم زمني RFC 3161" },
        { name: "نظام تسجيل الوصية بالفيديو", amount: "₩50M ($38K)", note: "تسجيل، تخزين، تشفير، إصدار مجدول" },
        { name: "نظام Badge NFC/QR", amount: "₩50M ($38K)", note: "شريك تصنيع Badge، تكامل التطبيق" },
        { name: "الأمان والبنية التحتية", amount: "₩80M ($61K)", note: "تشفير E2E، إعداد ISMS، إعداد الخادم" },
      ]},
      { category: "التسويق والمبيعات (₩300M / $228K)", items: [
        { name: "حملة إطلاق كوريا", amount: "₩80M ($61K)", note: "إعلانات SNS، بحث، PR" },
        { name: "دخول السوق الياباني", amount: "₩70M ($53K)", note: "Yahoo Japan، إعلانات LINE، PR محلي" },
        { name: "إعلانات الكوريين في الخارج", amount: "₩60M ($46K)", note: "مجتمعات كورية في أمريكا واليابان والصين" },
        { name: "المؤثرون والمحتوى", amount: "₩50M ($38K)", note: "شراكات مبدعي YouTube وInstagram" },
        { name: "شراكات B2B", amount: "₩40M ($30K)", note: "دور الجنازة، مستشفيات، بنوك" },
      ]},
      { category: "القانوني والامتثال (₩150M / $114K)", items: [
        { name: "الاستشارة القانونية في كوريا", amount: "₩50M ($38K)", note: "قانون المحاماة، التوقيع الإلكتروني، خصوصية البيانات" },
        { name: "مراجعة قانونية لليابان وأمريكا", amount: "₩60M ($46K)", note: "مراجعة قانون الوصايا والميراث المحلي" },
        { name: "بناء شبكة المحامين", amount: "₩40M ($30K)", note: "السنة 1: 10 محامين مختارين" },
      ]},
      { category: "العمليات والبنية التحتية (₩150M / $114K)", items: [
        { name: "خوادم سحابية وCDN", amount: "₩50M ($38K)", note: "Vercel، Cloudflare، AWS" },
        { name: "نظام دعم العملاء", amount: "₩40M ($30K)", note: "أدوات CS، روبوت محادثة، متعدد اللغات" },
        { name: "التوظيف الأولي", amount: "₩60M ($46K)", note: "مطور 1 + CS 1 (ستة أشهر)" },
      ]},
    ],
    cta_title: "لنبني معاً",
    cta_sub: "نبحث عن مستثمرين للانضمام إلى رحلة EverWill العالمية.\nتواصل معنا اليوم.",
    cta_btn: "إرسال استفسار الاستثمار",
    cta_email: "adoco98@gmail.com",
    footer_conf: "هذه الوثيقة سرية. يُحظر التوزيع غير المصرح به.",
    slides: [
      { badge: "الأول عالمياً", title: "نظام تشغيل صناعة الوصايا", sub: "من الكتابة إلى التنفيذ التلقائي بعد الوفاة", highlight: "المنصة العالمية التي تتفوق على Trust & Will" },
      { badge: "التمييز الجوهري", title: "نظام Badge المادي", sub: "MedicAlert + AirTag + توثيق الوصية", highlight: "ابتكار لم تحاوله أي منصة وصايا في العالم" },
      { badge: "السوق العالمي", title: "سوق 184 مليار دولار", sub: "حجم سوق الوصايا العالمي 2030", highlight: "دخول متزامن: كوريا، اليابان، أمريكا، الصين" },
      { badge: "نموذج الإيرادات", title: "LTV ﷼20,625+", sub: "28 ضعف قيمة عمر العميل مقارنة بـ Trust & Will", highlight: "﷼56 إعادة تصديق تدفع إيرادات متكررة مدى الحياة" },
      { badge: "فرصة الاستثمار", title: "جولة البذر مفتوحة", sub: "الهدف: ₩500M ~ ₩1B", highlight: "التقييم قبل الاستثمار: ₩3B (≈ $2.3M)" },
    ],
  },
};
// ─────────────────────────────────────────────
// 커스텀 툴팁 (언어별 통화 단위 표시)
// ─────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label, lang }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; lang: Lang }) {
  if (!active || !payload?.length) return null;
  const c = CURRENCY[lang];
  return (
    <div className="bg-[#1a2035] border border-white/20 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="text-[#C9A961] font-bold text-sm">{c.formatMarket(payload[0].value / c.marketMultiplier)}</p>
    </div>
  );
}

function CustomArrTooltip({ active, payload, label, lang }: { active?: boolean; payload?: Array<{ value: number }>; label?: string; lang: Lang }) {
  if (!active || !payload?.length) return null;
  const c = CURRENCY[lang];
  return (
    <div className="bg-[#1a2035] border border-white/20 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="text-[#C9A961] font-bold text-sm">{c.formatArr(payload[0].value / c.arrMultiplier)}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function InvestorPage() {
  const [lang, setLang] = useState<Lang>("ko");
  const [langOpen, setLangOpen] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const t = T[lang];
  const currentLang = LANGS.find((l) => l.code === lang)!;
  const isRTL = currentLang.rtl;

  // 슬라이드 자동 재생
  const nextSlide = useCallback(() => {
    setSlideIdx((prev) => (prev + 1) % t.slides.length);
  }, [t.slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4500);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const prevSlide = () => setSlideIdx((prev) => (prev - 1 + t.slides.length) % t.slides.length);

  const arrData = getArrData(lang);
  const marketBarData = getMarketBarData(lang);
  const marketGrowthData = getMarketGrowthData(lang);
  const c = CURRENCY[lang];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-sans" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── 최상단 슬라이드 ── */}
      <div className="relative w-full h-[420px] md:h-[500px] overflow-hidden bg-gradient-to-br from-[#1F3864] via-[#0a0f1e] to-[#0d1525]">
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#C9A961]/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#1F3864]/40 rounded-full blur-3xl" />
        </div>
        {/* 슬라이드 콘텐츠 */}
        <div className="relative h-full flex items-center justify-center px-8">
          {t.slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ${
                i === slideIdx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <span className="inline-block bg-[#C9A961]/20 border border-[#C9A961]/40 text-[#C9A961] text-xs font-bold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase">
                {slide.badge}
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-white/60 mb-4">{slide.sub}</p>
              <p className="text-base md:text-lg text-[#C9A961] font-semibold">{slide.highlight}</p>
            </div>
          ))}
        </div>
        {/* 슬라이드 컨트롤 */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors z-10"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
        {/* 슬라이드 인디케이터 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {t.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlideIdx(i)}
              className={`rounded-full transition-all duration-300 ${
                i === slideIdx ? "w-8 h-2 bg-[#C9A961]" : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── 네비게이션 ── */}
      <div className="sticky top-0 z-50 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-extrabold text-white tracking-tight">EverWill</span>
            <span className="text-xs bg-red-500/80 text-white px-2 py-0.5 rounded-full">{t.nav_invest}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            {langOpen && (
              <div className="absolute top-full mt-1 right-0 bg-[#1a2035] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[140px]">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-white/10 transition-colors text-left ${lang === l.code ? "bg-[#C9A961]/20 text-[#C9A961]" : "text-white/80"}`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="pt-20 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F3864]/30 via-[#0a0f1e] to-[#0a0f1e]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Globe className="w-4 h-4" />
            {t.hero_badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            {t.hero_title.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "text-[#C9A961] block" : "block"}>
                {line}
              </span>
            ))}
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed whitespace-pre-line">
            {t.hero_sub}
          </p>
          <a
            href={`mailto:${t.cta_email}?subject=EverWill Investment Inquiry`}
            className="inline-flex items-center justify-center gap-2 bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-[#C9A961]/20"
          >
            <Mail className="w-5 h-5" />
            {t.hero_cta}
          </a>
        </div>
      </section>

      {/* ── 핵심 지표 ── */}
      <section className="py-14 px-6 bg-[#1F3864]/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: t.m1_label, val: t.m1_val, icon: Users },
            { label: t.m2_label, val: t.m2_val, icon: DollarSign },
            { label: t.m3_label, val: t.m3_val, icon: Globe },
            { label: t.m4_label, val: t.m4_val, icon: TrendingUp },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <m.icon className="w-6 h-6 text-[#C9A961] mx-auto mb-2 opacity-80" />
              <div className="text-2xl md:text-3xl font-extrabold text-[#C9A961]">{m.val}</div>
              <div className="text-xs text-white/50 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 시장 기회 (차트) ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.market_title}</h2>
            <p className="text-white/50 text-lg">{t.market_sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 국가별 시장 규모 바차트 */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#C9A961]" />
                {t.market_chart_title}
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={marketBarData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" tick={{ fill: "#ffffff60", fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} unit={` ${c.marketSuffix}`} />
                  <Tooltip content={<CustomBarTooltip lang={lang} />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {marketBarData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* 시장 성장 에어리어차트 */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C9A961]" />
                {t.market_growth_title}
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={marketGrowthData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A961" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A961" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="year" tick={{ fill: "#ffffff60", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#ffffff60", fontSize: 11 }} unit={` ${c.marketSuffix}`} />
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    labelStyle={{ color: "#ffffff60" }}
                    itemStyle={{ color: "#C9A961" }}
                    formatter={(v: number) => [c.formatMarket(v / c.marketMultiplier), ""]}
                  />
                  <Area type="monotone" dataKey="value" stroke="#C9A961" strokeWidth={2.5} fill="url(#growthGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
      {/* ── 경쟁사 비교표 (국기 포함) ── */}
      <section className="py-24 px-6 bg-[#0d1525]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.comp_title}</h2>
            <p className="text-white/50 text-lg">{t.comp_sub}</p>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1F3864]/60">
                  <th className="px-5 py-4 text-left text-white/60 font-medium">{t.comp_feature}</th>
                  <th className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[#C9A961] font-bold text-base">{t.comp_everwill}</span>
                      <span className="text-xs text-[#C9A961]/60">🇰🇷 Korea</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-white/70 font-medium">{t.comp_tw}</span>
                      <span className="text-xs text-white/40">{t.comp_tw_country}</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-white/70 font-medium">{t.comp_fw}</span>
                      <span className="text-xs text-white/40">{t.comp_fw_country}</span>
                    </div>
                  </th>
                  <th className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-white/70 font-medium">{t.comp_gt}</span>
                      <span className="text-xs text-white/40">{t.comp_gt_country}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.comp_rows.map((row, i) => (
                  <tr key={i} className={`border-t border-white/5 ${i % 2 === 0 ? "bg-[#1a2035]/40" : "bg-transparent"}`}>
                    <td className="px-5 py-3.5 text-white/70 font-medium">{row.feature}</td>
                    <td className="px-5 py-3.5 text-center text-[#C9A961] font-semibold">{row.ew}</td>
                    <td className="px-5 py-3.5 text-center text-white/50">{row.tw}</td>
                    <td className="px-5 py-3.5 text-center text-white/50">{row.fw}</td>
                    <td className="px-5 py-3.5 text-center text-white/50">{row.gt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 차별화 포인트 ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.diff_title}</h2>
            <p className="text-white/50 text-lg">{t.diff_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🏅", title: t.diff_1_title, desc: t.diff_1_desc },
              { icon: "🔍", title: t.diff_2_title, desc: t.diff_2_desc },
              { icon: "⚖️", title: t.diff_3_title, desc: t.diff_3_desc },
              { icon: "☑️", title: t.diff_4_title, desc: t.diff_4_desc },
              { icon: "🌍", title: t.diff_5_title, desc: t.diff_5_desc },
              { icon: "📈", title: t.diff_6_title, desc: t.diff_6_desc },
            ].map((d, i) => (
              <div key={i} className="bg-[#1a2035] rounded-3xl p-6 border border-white/5 hover:border-[#C9A961]/30 transition-colors">
                <div className="text-3xl mb-4">{d.icon}</div>
                <h3 className="text-lg font-bold text-white mb-3">{d.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 수익 모델 ── */}
      <section className="py-24 px-6 bg-[#0d1525]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.revenue_title}</h2>
            <p className="text-white/50 text-lg">{t.revenue_sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* 파이차트 */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4 text-center">{t.rev_pie_title}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={REVENUE_PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                    {REVENUE_PIE_DATA.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {REVENUE_PIE_DATA.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-white/60">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill }} />
                    {d.name} {d.value}%
                  </div>
                ))}
              </div>
            </div>
            {/* 수익 항목 */}
            <div className="space-y-4">
              {[
                { label: t.rev_1, val: t.rev_1_val, color: "#C9A961" },
                { label: t.rev_2, val: t.rev_2_val, color: "#1F3864" },
                { label: t.rev_3, val: t.rev_3_val, color: "#8B5CF6" },
                { label: t.rev_4, val: t.rev_4_val, color: "#10B981" },
              ].map((r, i) => (
                <div key={i} className="bg-[#1a2035] rounded-2xl p-5 border border-white/5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="text-white/70 font-medium">{r.label}</span>
                  </div>
                  <span className="text-[#C9A961] font-bold text-sm">{r.val}</span>
                </div>
              ))}
              <div className="bg-gradient-to-r from-[#C9A961]/20 to-[#C9A961]/5 rounded-2xl p-5 border border-[#C9A961]/30 flex items-center justify-between">
                <span className="text-white font-bold">{t.ltv_label}</span>
                <span className="text-[#C9A961] font-extrabold text-xl">{t.ltv_val}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 재무 전망 (ARR + 사용자) ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.finance_title}</h2>
            <p className="text-white/50 text-lg">{t.finance_sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ARR 바차트 */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-[#C9A961]" />
                {t.finance_arr_title}
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={arrData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="year" tick={{ fill: "#ffffff60", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#ffffff60", fontSize: 12 }} unit={` ${c.arrSuffix}`} />
                  <Tooltip content={<CustomArrTooltip lang={lang} />} />
                  <Bar dataKey="arr" fill="#C9A961" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* 사용자 라인차트 */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C9A961]" />
                {t.finance_user_title}
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={USER_DATA} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1F3864" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#1F3864" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="year" tick={{ fill: "#ffffff60", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#ffffff60", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    formatter={(v: number) => [`${v.toLocaleString()}명`, ""]}
                  />
                  <Line type="monotone" dataKey="users" stroke="#1F3864" strokeWidth={3} dot={{ fill: "#C9A961", r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── 마케팅/광고 전략 ── */}
      <section className="py-24 px-6 bg-[#0d1525]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.ads_title}</h2>
            <p className="text-white/50 text-lg">{t.ads_sub}</p>
          </div>
          {/* 4가지 광고 채널 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: Monitor, title: t.ads_media_title, desc: t.ads_media_desc, color: "#8B5CF6" },
              { icon: Smartphone, title: t.ads_sns_title, desc: t.ads_sns_desc, color: "#EC4899" },
              { icon: BarChart3, title: t.ads_online_title, desc: t.ads_online_desc, color: "#3B82F6" },
              { icon: UserPlus, title: t.ads_user_title, desc: t.ads_user_desc, color: "#10B981" },
            ].map((ad, i) => (
              <div key={i} className="bg-[#1a2035] rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: `${ad.color}20` }}>
                    <ad.icon className="w-6 h-6" style={{ color: ad.color }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{ad.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{ad.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 마케팅 예산 배분 */}
          <div className="bg-[#1a2035] rounded-3xl p-8 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#C9A961]" />
              {t.ads_budget_title}
            </h3>
            <div className="space-y-5">
              {t.ads_budget_items.map((item, i) => {
                const pctNum = parseInt(item.pct);
                const colors = ["#C9A961", "#EC4899", "#8B5CF6", "#10B981"];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white font-semibold text-sm">{item.label}</span>
                        <span className="text-white/40 text-xs ml-2">— {item.desc}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: colors[i] }}>{item.pct}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pctNum}%`, background: colors[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── 글로벌 로드맵 ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.roadmap_title}</h2>
            <p className="text-white/50 text-lg">{t.roadmap_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { q: t.rm_1_q, title: t.rm_1_title, items: t.rm_1_items, color: "#C9A961" },
              { q: t.rm_2_q, title: t.rm_2_title, items: t.rm_2_items, color: "#8B5CF6" },
              { q: t.rm_3_q, title: t.rm_3_title, items: t.rm_3_items, color: "#EC4899" },
              { q: t.rm_4_q, title: t.rm_4_title, items: t.rm_4_items, color: "#3B82F6" },
            ].map((rm, i) => (
              <div key={i} className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
                <div className="text-xs font-bold mb-2 px-3 py-1 rounded-full inline-block" style={{ background: `${rm.color}20`, color: rm.color }}>
                  {rm.q}
                </div>
                <h3 className="text-lg font-bold text-white mt-3 mb-4">{rm.title}</h3>
                <ul className="space-y-2">
                  {rm.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="mt-0.5 flex-shrink-0" style={{ color: rm.color }}>▸</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 팀 ── */}
      <section className="py-24 px-6 bg-[#0d1525]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.team_title}</h2>
            <p className="text-white/50 text-lg">{t.team_sub}</p>
          </div>
          <div className="flex justify-center">
            <div className="bg-[#1a2035] rounded-3xl p-8 border border-white/5 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#C9A961] to-[#1F3864] rounded-full flex items-center justify-center mx-auto mb-5 text-3xl font-extrabold text-white">
                J
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">{t.t1_name}</h3>
              <p className="text-[#C9A961] font-semibold mb-4">{t.t1_role}</p>
              <p className="text-white/60 text-sm leading-relaxed">{t.t1_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 투자 조건 ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.invest_title}</h2>
            <p className="text-white/50 text-lg">{t.invest_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: t.invest_round, icon: Rocket, color: "#C9A961" },
              { label: t.invest_amount, icon: DollarSign, color: "#10B981" },
              { label: t.invest_valuation, icon: TrendingUp, color: "#8B5CF6" },
            ].map((item, i) => (
              <div key={i} className="bg-[#1a2035] rounded-3xl p-6 border border-white/5 text-center">
                <item.icon className="w-8 h-8 mx-auto mb-3" style={{ color: item.color }} />
                <p className="text-white font-bold text-lg leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#1a2035] rounded-3xl p-8 border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">{t.invest_use}</h3>
            <div className="space-y-5">
              {t.invest_use_items.map((item, i) => {
                const pctNum = parseInt(item.pct);
                const colors = ["#C9A961", "#10B981", "#8B5CF6", "#3B82F6"];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white font-semibold text-sm">{item.label}</span>
                        <span className="text-white/40 text-xs ml-2">— {item.desc}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: colors[i] }}>{item.pct}</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pctNum}%`, background: colors[i] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* 세부 자금 계획 테이블 */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#C9A961]" />
              {t.invest_detail_title}
            </h3>
            <div className="space-y-4">
              {t.invest_detail_items.map((group, gi) => {
                const catColors = ["#C9A961", "#10B981", "#8B5CF6", "#3B82F6"];
                return (
                  <div key={gi} className="bg-[#1a2035] rounded-2xl border border-white/5 overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5" style={{ background: `${catColors[gi]}15` }}>
                      <h4 className="font-bold text-base" style={{ color: catColors[gi] }}>{group.category}</h4>
                    </div>
                    <div className="divide-y divide-white/5">
                      {group.items.map((row, ri) => (
                        <div key={ri} className="px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div className="flex-1">
                            <span className="text-white text-sm font-medium">{row.name}</span>
                            <span className="text-white/40 text-xs ml-2">— {row.note}</span>
                          </div>
                          <span className="font-bold text-sm whitespace-nowrap" style={{ color: catColors[gi] }}>{row.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-[#1F3864] to-[#0a0f1e]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">{t.cta_title}</h2>
          <p className="text-xl text-white/60 mb-10 whitespace-pre-line">{t.cta_sub}</p>
          <a
            href={`mailto:${t.cta_email}?subject=EverWill Investment Inquiry`}
            className="inline-flex items-center justify-center gap-3 bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold px-10 py-5 rounded-2xl text-xl transition-all shadow-2xl shadow-[#C9A961]/20"
          >
            <Mail className="w-6 h-6" />
            {t.cta_btn}
          </a>
          <p className="mt-6 text-white/40 text-sm">{t.cta_email}</p>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-white/30 text-xs">{t.footer_conf}</p>
        <p className="text-white/20 text-xs mt-2">© 2025 SARAM Corp. · EverWill · adoco98@gmail.com</p>
      </footer>
    </div>
  );
}
