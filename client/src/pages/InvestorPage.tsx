/**
 * EverWill 투자유치 사업설명회 랜딩페이지 (/investor)
 * - 네비게이션 미노출 (주소 직접 접근만 가능)
 * - 7개국어 지원: ko, en, ja, zh, de, es, ar
 * - 섹션: 히어로 → 핵심지표 → 시장기회(차트) → 경쟁사비교 → 차별화 → 수익모델(차트) → 재무전망(차트) → 로드맵 → 팀 → 투자조건 → CTA
 * - 사업계획서 다운로드 버튼 없음 (모든 내용 인라인 표시)
 */
import { useState } from "react";
import {
  Globe, TrendingUp, Shield, Zap, Users, DollarSign,
  ChevronDown, CheckCircle, BarChart3,
  Target, Rocket, Award, Mail,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, Area, AreaChart,
} from "recharts";

// ─────────────────────────────────────────────
// 7개국어 번역 데이터
// ─────────────────────────────────────────────
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

const T: Record<Lang, {
  nav_invest: string;
  hero_badge: string;
  hero_title: string;
  hero_sub: string;
  hero_cta: string;
  // 핵심 지표
  metrics_title: string;
  m1_label: string; m1_val: string;
  m2_label: string; m2_val: string;
  m3_label: string; m3_val: string;
  m4_label: string; m4_val: string;
  // 시장 기회
  market_title: string;
  market_sub: string;
  market_chart_title: string;
  market_growth_title: string;
  // 경쟁사 비교
  comp_title: string;
  comp_sub: string;
  comp_feature: string;
  comp_everwill: string;
  comp_tw: string;
  comp_fw: string;
  comp_gt: string;
  comp_rows: { feature: string; ew: string; tw: string; fw: string; gt: string }[];
  // 차별화
  diff_title: string;
  diff_sub: string;
  diff_1_title: string; diff_1_desc: string;
  diff_2_title: string; diff_2_desc: string;
  diff_3_title: string; diff_3_desc: string;
  diff_4_title: string; diff_4_desc: string;
  diff_5_title: string; diff_5_desc: string;
  diff_6_title: string; diff_6_desc: string;
  // 수익 모델
  revenue_title: string;
  revenue_sub: string;
  rev_pie_title: string;
  rev_1: string; rev_1_val: string;
  rev_2: string; rev_2_val: string;
  rev_3: string; rev_3_val: string;
  rev_4: string; rev_4_val: string;
  ltv_label: string; ltv_val: string;
  // 재무 전망
  finance_title: string;
  finance_sub: string;
  finance_arr_title: string;
  finance_user_title: string;
  // 로드맵
  roadmap_title: string;
  roadmap_sub: string;
  rm_1_q: string; rm_1_title: string; rm_1_items: string[];
  rm_2_q: string; rm_2_title: string; rm_2_items: string[];
  rm_3_q: string; rm_3_title: string; rm_3_items: string[];
  rm_4_q: string; rm_4_title: string; rm_4_items: string[];
  // 팀
  team_title: string; team_sub: string;
  t1_name: string; t1_role: string; t1_desc: string;
  // 투자 조건
  invest_title: string;
  invest_sub: string;
  invest_round: string;
  invest_amount: string;
  invest_valuation: string;
  invest_use: string;
  invest_use_items: { label: string; pct: string; desc: string }[];
  // CTA
  cta_title: string;
  cta_sub: string;
  cta_btn: string;
  cta_email: string;
  footer_conf: string;
}> = {
  ko: {
    nav_invest: "투자자 전용",
    hero_badge: "🌍 세계 최초 디지털 유언 OS",
    hero_title: "유언 산업의\nOS가 됩니다",
    hero_sub: "Trust & Will·Farewill·GoodTrust를 뛰어넘는 올인원 글로벌 유언 플랫폼.\n작성부터 사후 자동 집행까지, 전 과정을 책임집니다.",
    hero_cta: "투자 문의하기",
    metrics_title: "핵심 지표",
    m1_label: "목표 MAU (Year 2)", m1_val: "50,000",
    m2_label: "목표 ARR (Year 3)", m2_val: "$12M",
    m3_label: "목표 국가", m3_val: "7개국",
    m4_label: "고객 LTV", m4_val: "$5,500+",
    market_title: "글로벌 유언 시장 기회",
    market_sub: "전 세계 고령화와 디지털 전환이 만드는 거대한 시장 기회",
    market_chart_title: "국가별 시장 규모 (2030년 전망, $B)",
    market_growth_title: "글로벌 시장 성장 전망 ($B)",
    comp_title: "경쟁사 비교",
    comp_sub: "EverWill만이 제공하는 독창적 기능",
    comp_feature: "기능",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will",
    comp_fw: "Farewill",
    comp_gt: "GoodTrust",
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
    ltv_label: "고객 생애 가치 (LTV)", ltv_val: "$5,500+",
    finance_title: "재무 전망",
    finance_sub: "보수적 시나리오 기준 3개년 목표",
    finance_arr_title: "연간 반복 매출 (ARR) 목표",
    finance_user_title: "누적 인증 사용자 목표",
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
    invest_use: "투자금 사용 계획",
    invest_use_items: [
      { label: "제품 개발", pct: "40%", desc: "AI 유언 작성 엔진, eKYC, 블록체인 인증" },
      { label: "마케팅·영업", pct: "30%", desc: "한국·일본 런칭 캠페인, 재외한인 타깃" },
      { label: "법무·컴플라이언스", pct: "15%", desc: "각국 법률 검토, 변호사 파트너십" },
      { label: "운영·인프라", pct: "15%", desc: "서버, 보안, 고객 지원 시스템" },
    ],
    cta_title: "함께 만들어 갑시다",
    cta_sub: "EverWill의 글로벌 여정에 함께하실 투자자를 찾습니다.\n지금 바로 연락해 주세요.",
    cta_btn: "투자 문의 보내기",
    cta_email: "adoco98@gmail.com",
    footer_conf: "본 자료는 기밀입니다. 무단 배포를 금합니다.",
  },
  en: {
    nav_invest: "Investors Only",
    hero_badge: "🌍 World's First Digital Will OS",
    hero_title: "Becoming the OS\nof the Will Industry",
    hero_sub: "An all-in-one global will platform surpassing Trust & Will, Farewill, and GoodTrust.\nFrom writing to automatic post-death execution — we own the entire journey.",
    hero_cta: "Contact for Investment",
    metrics_title: "Key Metrics",
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
    comp_tw: "Trust & Will",
    comp_fw: "Farewill",
    comp_gt: "GoodTrust",
    comp_rows: [
      { feature: "Physical Badge System", ew: "✅ World's First", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "4-Layer Death Detection", ew: "✅ Automated", tw: "❌ Manual", fw: "❌ Manual", gt: "❌ Manual" },
      { feature: "Lawyer Marketplace", ew: "✅ Post-death exec.", tw: "⚠️ Pre-death only", fw: "⚠️ Limited", gt: "❌" },
      { feature: "Global Multi-jurisdiction", ew: "✅ 7 countries", tw: "❌ US only", fw: "❌ UK only", gt: "❌ US only" },
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
    finance_sub: "3-year targets based on conservative scenario",
    finance_arr_title: "Annual Recurring Revenue (ARR) Target",
    finance_user_title: "Cumulative Certified Users Target",
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
    invest_use: "Use of Proceeds",
    invest_use_items: [
      { label: "Product Development", pct: "40%", desc: "AI will engine, eKYC, blockchain certification" },
      { label: "Marketing & Sales", pct: "30%", desc: "Korea & Japan launch campaigns, Korean diaspora targeting" },
      { label: "Legal & Compliance", pct: "15%", desc: "Multi-country legal review, lawyer partnerships" },
      { label: "Operations & Infra", pct: "15%", desc: "Servers, security, customer support systems" },
    ],
    cta_title: "Let's Build Together",
    cta_sub: "We're looking for investors to join EverWill's global journey.\nReach out to us today.",
    cta_btn: "Send Investment Inquiry",
    cta_email: "adoco98@gmail.com",
    footer_conf: "This document is confidential. Unauthorized distribution is prohibited.",
  },
  ja: {
    nav_invest: "投資家専用",
    hero_badge: "🌍 世界初のデジタル遺言OS",
    hero_title: "遺言業界の\nOSになります",
    hero_sub: "Trust & Will・Farewill・GoodTrustを超えるオールインワングローバル遺言プラットフォーム。\n作成から死後自動執行まで、全プロセスを担います。",
    hero_cta: "投資お問い合わせ",
    metrics_title: "主要指標",
    m1_label: "目標MAU（Year 2）", m1_val: "50,000",
    m2_label: "目標ARR（Year 3）", m2_val: "$12M",
    m3_label: "目標国数", m3_val: "7カ国",
    m4_label: "顧客LTV", m4_val: "$5,500+",
    market_title: "グローバル遺言市場の機会",
    market_sub: "世界的な高齢化とデジタル転換が生む巨大な市場機会",
    market_chart_title: "国別市場規模（2030年予測、$B）",
    market_growth_title: "グローバル市場成長予測（$B）",
    comp_title: "競合比較",
    comp_sub: "EverWillだけが提供する独自機能",
    comp_feature: "機能",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will",
    comp_fw: "Farewill",
    comp_gt: "GoodTrust",
    comp_rows: [
      { feature: "物理的Badgeシステム", ew: "✅ 世界初", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "4重死亡検知", ew: "✅ 自動化", tw: "❌ 手動", fw: "❌ 手動", gt: "❌ 手動" },
      { feature: "弁護士マーケット", ew: "✅ 死後執行", tw: "⚠️ 生前のみ", fw: "⚠️ 限定的", gt: "❌" },
      { feature: "グローバル多管轄", ew: "✅ 7カ国", tw: "❌ 米国のみ", fw: "❌ 英国のみ", gt: "❌ 米国のみ" },
      { feature: "AIチェックボックス", ew: "✅ 17分", tw: "⚠️ 複雑", fw: "⚠️ 複雑", gt: "⚠️ 複雑" },
      { feature: "動画遺言", ew: "✅ 含む", tw: "❌", fw: "❌", gt: "⚠️ 限定的" },
      { feature: "7言語対応（RTL）", ew: "✅ RTL含む", tw: "❌ 英語のみ", fw: "❌ 英語のみ", gt: "❌ 英語のみ" },
      { feature: "再認証費用", ew: "✅ ¥1,500", tw: "❌ $299/年", fw: "❌ £90/年", gt: "❌ $149/年" },
    ],
    diff_title: "なぜEverWillなのか？",
    diff_sub: "既存競合が解決できなかった10の革新",
    diff_1_title: "物理的Badgeシステム", diff_1_desc: "MedicAlert + AirTag + 遺言認証を一つに。世界のどの遺言プラットフォームも試みていない永続的差別化。",
    diff_2_title: "4重死亡検知", diff_2_desc: "家族申告 → 政府DB → Dead Man's Switch → 緊急発見者。自動執行トリガーシステム。",
    diff_3_title: "弁護士マーケット", diff_3_desc: "生前0%、死後100%。本当に必要な瞬間だけ登場する専門家ネットワーク。",
    diff_4_title: "チェックボックス17分完成", diff_4_desc: "白紙の恐怖をなくしました。AIがチェックボックスを法律文章に自動変換。",
    diff_5_title: "グローバル多管轄", diff_5_desc: "韓国+米国+日本の資産を同時に。このようなサービスは現在世界に存在しません。",
    diff_6_title: "LTV 28倍", diff_6_desc: "再認証¥1,500で人生イベントごとに再訪問。Trust & Will比28倍LTV。",
    revenue_title: "収益モデル",
    revenue_sub: "多層収益構造による安定成長",
    rev_pie_title: "収益構成比率",
    rev_1: "電子認証", rev_1_val: "¥5,000 / 件",
    rev_2: "年間メンバーシップ", rev_2_val: "¥3,000 / 年",
    rev_3: "Badge販売", rev_3_val: "¥5,000 ~ ¥30,000",
    rev_4: "弁護士手数料", rev_4_val: "報酬の15~25%",
    ltv_label: "顧客生涯価値（LTV）", ltv_val: "$5,500+",
    finance_title: "財務予測",
    finance_sub: "保守的シナリオに基づく3年間目標",
    finance_arr_title: "年間反復収益（ARR）目標",
    finance_user_title: "累積認証ユーザー目標",
    roadmap_title: "グローバル展開ロードマップ",
    roadmap_sub: "12ヶ月で4カ国同時進出",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 韓国ローンチ",
    rm_1_items: ["MVP公開", "eKYC連携", "Toss決済", "Badge生産"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 日本進出",
    rm_2_items: ["公正証書デジタル化対応", "日本語完全対応", "PayPay連携", "現地弁護士採用"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 中華圏進出",
    rm_3_items: ["香港・台湾から先行", "WeChat Pay連携", "中国語簡体字対応", "現地パートナーシップ"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 米国進出",
    rm_4_items: ["在米韓国人100万人ターゲット", "Stripe決済", "英語完全対応", "CA・NY法律適用"],
    team_title: "チーム",
    team_sub: "ビジョンを実行する人々",
    t1_name: "Jeff Lah（라수환）",
    t1_role: "CEO · 株式会社SARAM",
    t1_desc: "30年の事業経験。製品開発・企画の専門家。グローバル遺言プラットフォーム1位を目指します。",
    invest_title: "投資条件",
    invest_sub: "シードラウンド調達中",
    invest_round: "シードラウンド",
    invest_amount: "目標調達額：₩5億〜₩10億",
    invest_valuation: "Pre-money Valuation：₩30億",
    invest_use: "資金使途",
    invest_use_items: [
      { label: "製品開発", pct: "40%", desc: "AI遺言エンジン、eKYC、ブロックチェーン認証" },
      { label: "マーケティング・営業", pct: "30%", desc: "韓国・日本ローンチキャンペーン" },
      { label: "法務・コンプライアンス", pct: "15%", desc: "各国法律審査、弁護士パートナーシップ" },
      { label: "運営・インフラ", pct: "15%", desc: "サーバー、セキュリティ、カスタマーサポート" },
    ],
    cta_title: "共に作りましょう",
    cta_sub: "EverWillのグローバルな旅に参加する投資家を募集しています。\n今すぐご連絡ください。",
    cta_btn: "投資お問い合わせを送る",
    cta_email: "adoco98@gmail.com",
    footer_conf: "本資料は機密です。無断配布を禁じます。",
  },
  zh: {
    nav_invest: "仅限投资者",
    hero_badge: "🌍 全球首个数字遗嘱OS",
    hero_title: "成为遗嘱行业的\nOS",
    hero_sub: "超越Trust & Will、Farewill、GoodTrust的一站式全球遗嘱平台。\n从撰写到身后自动执行，全程负责。",
    hero_cta: "投资咨询",
    metrics_title: "核心指标",
    m1_label: "目标MAU（第2年）", m1_val: "50,000",
    m2_label: "目标ARR（第3年）", m2_val: "$12M",
    m3_label: "目标国家", m3_val: "7个国家",
    m4_label: "客户LTV", m4_val: "$5,500+",
    market_title: "全球遗嘱市场机会",
    market_sub: "全球老龄化与数字化转型带来的巨大市场机会",
    market_chart_title: "各国市场规模（2030年预测，$B）",
    market_growth_title: "全球市场增长预测（$B）",
    comp_title: "竞争对手比较",
    comp_sub: "只有EverWill提供的独特功能",
    comp_feature: "功能",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will",
    comp_fw: "Farewill",
    comp_gt: "GoodTrust",
    comp_rows: [
      { feature: "物理Badge系统", ew: "✅ 全球首创", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "四重死亡检测", ew: "✅ 自动化", tw: "❌ 手动", fw: "❌ 手动", gt: "❌ 手动" },
      { feature: "律师市场", ew: "✅ 身后执行", tw: "⚠️ 仅生前", fw: "⚠️ 有限", gt: "❌" },
      { feature: "全球多司法管辖", ew: "✅ 7个国家", tw: "❌ 仅美国", fw: "❌ 仅英国", gt: "❌ 仅美国" },
      { feature: "AI复选框撰写", ew: "✅ 17分钟", tw: "⚠️ 复杂", fw: "⚠️ 复杂", gt: "⚠️ 复杂" },
      { feature: "视频遗嘱", ew: "✅ 包含", tw: "❌", fw: "❌", gt: "⚠️ 有限" },
      { feature: "7种语言（RTL）", ew: "✅ 含RTL", tw: "❌ 仅英语", fw: "❌ 仅英语", gt: "❌ 仅英语" },
      { feature: "重新认证费用", ew: "✅ ¥108", tw: "❌ $299/年", fw: "❌ £90/年", gt: "❌ $149/年" },
    ],
    diff_title: "为什么选择EverWill？",
    diff_sub: "现有竞争对手未能解决的10项创新",
    diff_1_title: "物理Badge系统", diff_1_desc: "MedicAlert + AirTag + 遗嘱认证合而为一。全球任何遗嘱平台都未尝试过的永久差异化。",
    diff_2_title: "四重死亡检测", diff_2_desc: "家属申报 → 政府DB → Dead Man's Switch → 紧急发现者。自动执行触发系统。",
    diff_3_title: "律师市场", diff_3_desc: "生前0%，身后100%。只在真正需要时出现的专家网络。",
    diff_4_title: "复选框17分钟完成", diff_4_desc: "消除了空白页的恐惧。AI自动将复选框转换为法律语言。",
    diff_5_title: "全球多司法管辖", diff_5_desc: "同时管理韩国+美国+日本资产。目前全球没有此类服务。",
    diff_6_title: "LTV 28倍", diff_6_desc: "¥108重新认证在每个人生事件时重复访问。LTV是Trust & Will的28倍。",
    revenue_title: "收益模式",
    revenue_sub: "多层次收益结构实现稳定增长",
    rev_pie_title: "收益构成比例",
    rev_1: "电子认证", rev_1_val: "¥280 / 件",
    rev_2: "年度会员", rev_2_val: "¥200 / 年",
    rev_3: "Badge销售", rev_3_val: "¥280 ~ ¥2,100",
    rev_4: "律师佣金", rev_4_val: "报酬的15~25%",
    ltv_label: "客户生命周期价值（LTV）", ltv_val: "$5,500+",
    finance_title: "财务预测",
    finance_sub: "基于保守情景的3年目标",
    finance_arr_title: "年度经常性收入（ARR）目标",
    finance_user_title: "累计认证用户目标",
    roadmap_title: "全球发布路线图",
    roadmap_sub: "12个月内同时进入4个国家",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 韩国上线",
    rm_1_items: ["MVP发布", "eKYC集成", "Toss支付", "Badge生产"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 进入日本",
    rm_2_items: ["公证书数字化支持", "完整日语支持", "PayPay集成", "本地律师招募"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 进入中华圈",
    rm_3_items: ["香港·台湾优先", "微信支付集成", "简体中文支持", "本地合作伙伴"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 进入美国",
    rm_4_items: ["100万韩裔美国人目标", "Stripe支付", "完整英语支持", "CA·NY法律"],
    team_title: "团队",
    team_sub: "执行愿景的人们",
    t1_name: "Jeff Lah（라수환）",
    t1_role: "CEO · SARAM Corp.",
    t1_desc: "30年商业经验。产品开发与规划专家。目标成为全球遗嘱平台第一。",
    invest_title: "投资条件",
    invest_sub: "正在进行种子轮融资",
    invest_round: "种子轮",
    invest_amount: "目标融资额：₩5亿~₩10亿",
    invest_valuation: "Pre-money估值：₩30亿",
    invest_use: "资金用途",
    invest_use_items: [
      { label: "产品开发", pct: "40%", desc: "AI遗嘱引擎、eKYC、区块链认证" },
      { label: "营销与销售", pct: "30%", desc: "韩国·日本上线活动，海外韩裔定向" },
      { label: "法务与合规", pct: "15%", desc: "各国法律审查，律师合作关系" },
      { label: "运营与基础设施", pct: "15%", desc: "服务器、安全、客户支持系统" },
    ],
    cta_title: "让我们共同创造",
    cta_sub: "我们正在寻找愿意加入EverWill全球旅程的投资者。\n立即联系我们。",
    cta_btn: "发送投资咨询",
    cta_email: "adoco98@gmail.com",
    footer_conf: "本资料为机密。禁止未经授权的分发。",
  },
  de: {
    nav_invest: "Nur für Investoren",
    hero_badge: "🌍 Weltweit erstes digitales Testament-OS",
    hero_title: "Das OS der\nTestamentsbranche werden",
    hero_sub: "Eine All-in-One-Plattform, die Trust & Will, Farewill und GoodTrust übertrifft.\nVon der Erstellung bis zur automatischen posthumen Ausführung.",
    hero_cta: "Investitionsanfrage",
    metrics_title: "Schlüsselkennzahlen",
    m1_label: "Ziel-MAU (Jahr 2)", m1_val: "50.000",
    m2_label: "Ziel-ARR (Jahr 3)", m2_val: "$12M",
    m3_label: "Zielmärkte", m3_val: "7 Länder",
    m4_label: "Kunden-LTV", m4_val: "$5.500+",
    market_title: "Globale Testamentsmarkt-Chance",
    market_sub: "Riesige Marktchance durch globale Alterung und digitale Transformation",
    market_chart_title: "Marktgröße nach Land (2030 Prognose, $B)",
    market_growth_title: "Globales Marktwachstum ($B)",
    comp_title: "Wettbewerbsanalyse",
    comp_sub: "Einzigartige Funktionen, die nur EverWill bietet",
    comp_feature: "Funktion",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will",
    comp_fw: "Farewill",
    comp_gt: "GoodTrust",
    comp_rows: [
      { feature: "Physisches Badge-System", ew: "✅ Weltweit 1.", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "4-fache Todeserkennung", ew: "✅ Automatisch", tw: "❌ Manuell", fw: "❌ Manuell", gt: "❌ Manuell" },
      { feature: "Anwalts-Marktplatz", ew: "✅ Posthume Ausf.", tw: "⚠️ Nur zu Lebzeiten", fw: "⚠️ Begrenzt", gt: "❌" },
      { feature: "Globale Multi-Jurisdiktion", ew: "✅ 7 Länder", tw: "❌ Nur USA", fw: "❌ Nur UK", gt: "❌ Nur USA" },
      { feature: "KI-Checkbox-Erstellung", ew: "✅ 17 Minuten", tw: "⚠️ Komplex", fw: "⚠️ Komplex", gt: "⚠️ Komplex" },
      { feature: "Video-Testament", ew: "✅ Inklusive", tw: "❌", fw: "❌", gt: "⚠️ Begrenzt" },
      { feature: "7 Sprachen (RTL)", ew: "✅ RTL inklusive", tw: "❌ Nur Englisch", fw: "❌ Nur Englisch", gt: "❌ Nur Englisch" },
      { feature: "Re-Zertifizierungskosten", ew: "✅ €14", tw: "❌ $299/Jahr", fw: "❌ £90/Jahr", gt: "❌ $149/Jahr" },
    ],
    diff_title: "Warum EverWill?",
    diff_sub: "10 Innovationen, die Wettbewerber nicht gelöst haben",
    diff_1_title: "Physisches Badge-System", diff_1_desc: "MedicAlert + AirTag + Testamentsauthentifizierung in einem. Permanente Differenzierung, die keine Testamentsplattform versucht hat.",
    diff_2_title: "4-fache Todeserkennung", diff_2_desc: "Familienmeldung → Regierungs-DB → Dead Man's Switch → Notfallentdecker. Automatischer Ausführungstrigger.",
    diff_3_title: "Anwalts-Marktplatz", diff_3_desc: "0% zu Lebzeiten, 100% nach dem Tod. Expertennetzwerk, das nur erscheint, wenn es wirklich gebraucht wird.",
    diff_4_title: "Checkbox in 17 Minuten", diff_4_desc: "Die Angst vor dem leeren Blatt beseitigt. KI konvertiert Checkboxen automatisch in Rechtssprache.",
    diff_5_title: "Globale Multi-Jurisdiktion", diff_5_desc: "Koreanische + US + japanische Vermögenswerte gleichzeitig. Solch einen Service gibt es derzeit nirgendwo auf der Welt.",
    diff_6_title: "28x LTV", diff_6_desc: "€14 Re-Zertifizierung treibt Wiederbesuche bei jedem Lebensereignis. 28x LTV vs. Trust & Will.",
    revenue_title: "Umsatzmodell",
    revenue_sub: "Stabiles Wachstum durch mehrschichtige Umsatzstruktur",
    rev_pie_title: "Umsatzmix",
    rev_1: "Elektronische Zertifizierung", rev_1_val: "€37 / Zert.",
    rev_2: "Jahresmitgliedschaft", rev_2_val: "€27 / Jahr",
    rev_3: "Badge-Verkauf", rev_3_val: "€46 ~ €280",
    rev_4: "Anwaltsgebühren", rev_4_val: "15~25% der Honorare",
    ltv_label: "Kunden-Lebenszeitwert (LTV)", ltv_val: "$5.500+",
    finance_title: "Finanzprognosen",
    finance_sub: "3-Jahres-Ziele basierend auf konservativem Szenario",
    finance_arr_title: "Jährlich wiederkehrender Umsatz (ARR) Ziel",
    finance_user_title: "Kumulierte zertifizierte Nutzer Ziel",
    roadmap_title: "Globaler Einführungs-Fahrplan",
    roadmap_sub: "4 Länder in 12 Monaten",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 Korea-Start",
    rm_1_items: ["MVP-Launch", "eKYC-Integration", "Toss Payments", "Badge-Produktion"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 Japan-Eintritt",
    rm_2_items: ["Digitale Beurkundung", "Vollständige Japanisch-Unterstützung", "PayPay-Integration", "Lokale Anwälte"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 Chinesischer Markt",
    rm_3_items: ["HK & Taiwan zuerst", "WeChat Pay", "Vereinfachtes Chinesisch", "Lokale Partnerschaften"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 USA-Eintritt",
    rm_4_items: ["1M Koreanisch-Amerikaner", "Stripe-Zahlungen", "Vollständige Englisch-Unterstützung", "CA & NY Recht"],
    team_title: "Team",
    team_sub: "Menschen, die die Vision umsetzen",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "CEO · SARAM Corp.",
    t1_desc: "30 Jahre Geschäftserfahrung. Experte für Produktentwicklung und -planung. Ziel: Nr. 1 globale Testamentsplattform.",
    invest_title: "Investitionsbedingungen",
    invest_sub: "Aktuell Seed-Runde im Gange",
    invest_round: "Seed-Runde",
    invest_amount: "Zielvolumen: ₩500M ~ ₩1B",
    invest_valuation: "Pre-money Bewertung: ₩3B",
    invest_use: "Mittelverwendung",
    invest_use_items: [
      { label: "Produktentwicklung", pct: "40%", desc: "KI-Testament-Engine, eKYC, Blockchain-Zertifizierung" },
      { label: "Marketing & Vertrieb", pct: "30%", desc: "Korea & Japan Launch-Kampagnen" },
      { label: "Recht & Compliance", pct: "15%", desc: "Länderübergreifende Rechtsberatung" },
      { label: "Betrieb & Infrastruktur", pct: "15%", desc: "Server, Sicherheit, Kundensupport" },
    ],
    cta_title: "Lassen Sie uns gemeinsam aufbauen",
    cta_sub: "Wir suchen Investoren, die EverWills globale Reise begleiten.\nKontaktieren Sie uns jetzt.",
    cta_btn: "Investitionsanfrage senden",
    cta_email: "adoco98@gmail.com",
    footer_conf: "Dieses Dokument ist vertraulich. Unbefugte Weitergabe ist verboten.",
  },
  es: {
    nav_invest: "Solo Inversores",
    hero_badge: "🌍 Primer OS Digital de Testamentos del Mundo",
    hero_title: "Convertirse en el OS\nde la industria testamentaria",
    hero_sub: "Una plataforma global todo-en-uno que supera a Trust & Will, Farewill y GoodTrust.\nDesde la redacción hasta la ejecución automática post-mortem.",
    hero_cta: "Consulta de Inversión",
    metrics_title: "Métricas Clave",
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
    comp_tw: "Trust & Will",
    comp_fw: "Farewill",
    comp_gt: "GoodTrust",
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
    finance_sub: "Objetivos a 3 años basados en escenario conservador",
    finance_arr_title: "Objetivo de Ingresos Recurrentes Anuales (ARR)",
    finance_user_title: "Objetivo de Usuarios Certificados Acumulados",
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
    invest_amount: "Objetivo: ₩500M ~ ₩1B",
    invest_valuation: "Valoración Pre-money: ₩3B",
    invest_use: "Uso de los Fondos",
    invest_use_items: [
      { label: "Desarrollo de producto", pct: "40%", desc: "Motor IA de testamentos, eKYC, certificación blockchain" },
      { label: "Marketing y ventas", pct: "30%", desc: "Campañas de lanzamiento en Corea y Japón" },
      { label: "Legal y cumplimiento", pct: "15%", desc: "Revisión legal multinacional, asociaciones con abogados" },
      { label: "Operaciones e infraestructura", pct: "15%", desc: "Servidores, seguridad, soporte al cliente" },
    ],
    cta_title: "Construyamos Juntos",
    cta_sub: "Buscamos inversores para unirse al viaje global de EverWill.\nContáctenos hoy.",
    cta_btn: "Enviar Consulta de Inversión",
    cta_email: "adoco98@gmail.com",
    footer_conf: "Este documento es confidencial. Se prohíbe su distribución no autorizada.",
  },
  ar: {
    nav_invest: "للمستثمرين فقط",
    hero_badge: "🌍 أول نظام تشغيل رقمي للوصايا في العالم",
    hero_title: "أن نصبح نظام التشغيل\nلصناعة الوصايا",
    hero_sub: "منصة وصايا عالمية شاملة تتفوق على Trust & Will وFarewill وGoodTrust.\nمن الكتابة إلى التنفيذ التلقائي بعد الوفاة.",
    hero_cta: "استفسار استثماري",
    metrics_title: "المؤشرات الرئيسية",
    m1_label: "MAU المستهدف (السنة 2)", m1_val: "50,000",
    m2_label: "ARR المستهدف (السنة 3)", m2_val: "$12M",
    m3_label: "الدول المستهدفة", m3_val: "7 دول",
    m4_label: "LTV العميل", m4_val: "$5,500+",
    market_title: "فرصة سوق الوصايا العالمي",
    market_sub: "فرصة سوق ضخمة ناتجة عن الشيخوخة العالمية والتحول الرقمي",
    market_chart_title: "حجم السوق حسب الدولة (توقعات 2030، $B)",
    market_growth_title: "توقعات نمو السوق العالمي ($B)",
    comp_title: "التحليل التنافسي",
    comp_sub: "ميزات فريدة لا يوفرها إلا EverWill",
    comp_feature: "الميزة",
    comp_everwill: "EverWill",
    comp_tw: "Trust & Will",
    comp_fw: "Farewill",
    comp_gt: "GoodTrust",
    comp_rows: [
      { feature: "نظام Badge المادي", ew: "✅ الأول عالمياً", tw: "❌", fw: "❌", gt: "❌" },
      { feature: "كشف الوفاة 4 طبقات", ew: "✅ تلقائي", tw: "❌ يدوي", fw: "❌ يدوي", gt: "❌ يدوي" },
      { feature: "سوق المحامين", ew: "✅ تنفيذ ما بعد الوفاة", tw: "⚠️ قبل الوفاة فقط", fw: "⚠️ محدود", gt: "❌" },
      { feature: "متعدد الولايات القضائية", ew: "✅ 7 دول", tw: "❌ الولايات المتحدة فقط", fw: "❌ المملكة المتحدة فقط", gt: "❌ الولايات المتحدة فقط" },
      { feature: "كتابة AI بمربعات الاختيار", ew: "✅ 17 دقيقة", tw: "⚠️ معقد", fw: "⚠️ معقد", gt: "⚠️ معقد" },
      { feature: "الوصية المرئية", ew: "✅ مضمّنة", tw: "❌", fw: "❌", gt: "⚠️ محدودة" },
      { feature: "7 لغات (RTL)", ew: "✅ يشمل RTL", tw: "❌ إنجليزية فقط", fw: "❌ إنجليزية فقط", gt: "❌ إنجليزية فقط" },
      { feature: "تكلفة إعادة التصديق", ew: "✅ $15", tw: "❌ $299/سنة", fw: "❌ £90/سنة", gt: "❌ $149/سنة" },
    ],
    diff_title: "لماذا EverWill؟",
    diff_sub: "10 ابتكارات لم يحلها المنافسون",
    diff_1_title: "نظام Badge المادي", diff_1_desc: "MedicAlert + AirTag + توثيق الوصية في واحد. تمييز دائم لم تحاوله أي منصة وصايا في العالم.",
    diff_2_title: "كشف الوفاة 4 طبقات", diff_2_desc: "إبلاغ العائلة → قاعدة بيانات حكومية → Dead Man's Switch → مكتشف الطوارئ. نظام تشغيل تلقائي.",
    diff_3_title: "سوق المحامين", diff_3_desc: "0% في الحياة، 100% بعد الوفاة. شبكة خبراء تظهر فقط عند الحاجة الحقيقية.",
    diff_4_title: "مربعات اختيار في 17 دقيقة", diff_4_desc: "أزلنا خوف الصفحة الفارغة. يحول الذكاء الاصطناعي مربعات الاختيار إلى لغة قانونية تلقائياً.",
    diff_5_title: "متعدد الولايات القضائية", diff_5_desc: "أصول كوريا + الولايات المتحدة + اليابان في آنٍ واحد. لا توجد خدمة مماثلة في العالم حالياً.",
    diff_6_title: "LTV أعلى بـ28 مرة", diff_6_desc: "إعادة التصديق بـ$15 تدفع الزيارات المتكررة في كل حدث حياتي. LTV أعلى بـ28 مرة من Trust & Will.",
    revenue_title: "نموذج الإيرادات",
    revenue_sub: "نمو مستقر من خلال هيكل إيرادات متعدد الطبقات",
    rev_pie_title: "تكوين الإيرادات",
    rev_1: "التصديق الإلكتروني", rev_1_val: "$39 / شهادة",
    rev_2: "العضوية السنوية", rev_2_val: "$29 / سنة",
    rev_3: "مبيعات Badge", rev_3_val: "$49 ~ $299",
    rev_4: "عمولة المحامين", rev_4_val: "15~25% من الأتعاب",
    ltv_label: "قيمة العميل مدى الحياة (LTV)", ltv_val: "$5,500+",
    finance_title: "التوقعات المالية",
    finance_sub: "أهداف 3 سنوات بناءً على سيناريو محافظ",
    finance_arr_title: "هدف الإيرادات المتكررة السنوية (ARR)",
    finance_user_title: "هدف المستخدمين المعتمدين التراكميين",
    roadmap_title: "خارطة طريق الإطلاق العالمي",
    roadmap_sub: "4 دول في 12 شهراً",
    rm_1_q: "Q1 2026", rm_1_title: "🇰🇷 إطلاق كوريا",
    rm_1_items: ["إطلاق MVP", "تكامل eKYC", "مدفوعات Toss", "إنتاج Badge"],
    rm_2_q: "Q2 2026", rm_2_title: "🇯🇵 دخول اليابان",
    rm_2_items: ["دعم التوثيق الرقمي", "دعم ياباني كامل", "تكامل PayPay", "توظيف محامين محليين"],
    rm_3_q: "Q3 2026", rm_3_title: "🇨🇳 السوق الصيني",
    rm_3_items: ["هونغ كونغ وتايوان أولاً", "تكامل WeChat Pay", "الصينية المبسطة", "شراكات محلية"],
    rm_4_q: "Q4 2026", rm_4_title: "🇺🇸 دخول الولايات المتحدة",
    rm_4_items: ["مليون كوري أمريكي", "مدفوعات Stripe", "دعم إنجليزي كامل", "قانون CA و NY"],
    team_title: "الفريق",
    team_sub: "الأشخاص الذين ينفذون الرؤية",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "الرئيس التنفيذي · SARAM Corp.",
    t1_desc: "30 عاماً من الخبرة التجارية. خبير في تطوير المنتجات والتخطيط. الهدف: منصة الوصايا العالمية الأولى.",
    invest_title: "شروط الاستثمار",
    invest_sub: "جمع تمويل الجولة التأسيسية حالياً",
    invest_round: "الجولة التأسيسية",
    invest_amount: "الهدف: ₩500M ~ ₩1B",
    invest_valuation: "التقييم قبل الاستثمار: ₩3B",
    invest_use: "استخدام العائدات",
    invest_use_items: [
      { label: "تطوير المنتج", pct: "40%", desc: "محرك الوصايا بالذكاء الاصطناعي، eKYC، توثيق البلوكتشين" },
      { label: "التسويق والمبيعات", pct: "30%", desc: "حملات إطلاق كوريا واليابان" },
      { label: "القانونية والامتثال", pct: "15%", desc: "مراجعة قانونية متعددة الدول" },
      { label: "العمليات والبنية التحتية", pct: "15%", desc: "الخوادم، الأمان، دعم العملاء" },
    ],
    cta_title: "لنبني معاً",
    cta_sub: "نبحث عن مستثمرين للانضمام إلى رحلة EverWill العالمية.\nتواصل معنا الآن.",
    cta_btn: "إرسال استفسار الاستثمار",
    cta_email: "adoco98@gmail.com",
    footer_conf: "هذه الوثيقة سرية. يُحظر التوزيع غير المصرح به.",
  },
};

// ─────────────────────────────────────────────
// 차트 데이터 (언어 무관, 숫자/영문 라벨)
// ─────────────────────────────────────────────
const MARKET_BAR_DATA = [
  { name: "USA", value: 67, fill: "#8B5CF6" },
  { name: "Japan", value: 28, fill: "#EF4444" },
  { name: "Germany", value: 18, fill: "#3B82F6" },
  { name: "UK", value: 15, fill: "#10B981" },
  { name: "Korea", value: 8, fill: "#F59E0B" },
  { name: "China", value: 12, fill: "#EC4899" },
  { name: "Others", value: 11, fill: "#6B7280" },
];

const MARKET_GROWTH_DATA = [
  { year: "2023", value: 89 },
  { year: "2024", value: 98 },
  { year: "2025", value: 112 },
  { year: "2026", value: 121 },
  { year: "2027", value: 128 },
  { year: "2028", value: 133 },
  { year: "2029", value: 137 },
  { year: "2030", value: 139 },
];

const REVENUE_PIE_DATA = [
  { name: "Certification", value: 40, fill: "#C9A961" },
  { name: "Membership", value: 20, fill: "#1F3864" },
  { name: "Badge", value: 25, fill: "#8B5CF6" },
  { name: "Lawyer", value: 15, fill: "#10B981" },
];

const ARR_DATA = [
  { year: "Year 1", arr: 0.3 },
  { year: "Year 2", arr: 2.1 },
  { year: "Year 3", arr: 12 },
];

const USER_DATA = [
  { year: "Year 1", users: 2000 },
  { year: "Year 2", users: 18000 },
  { year: "Year 3", users: 85000 },
];

// ─────────────────────────────────────────────
// 커스텀 툴팁
// ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a2035] border border-white/10 rounded-xl px-4 py-2 text-sm text-white shadow-xl">
        <p className="font-bold text-[#C9A961]">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white/80">{p.name}: <span className="text-white font-semibold">{p.value}</span></p>
        ))}
      </div>
    );
  }
  return null;
};

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function InvestorPage() {
  const [lang, setLang] = useState<Lang>("ko");
  const [langOpen, setLangOpen] = useState(false);

  const t = T[lang];
  const currentLang = LANGS.find((l) => l.code === lang)!;
  const isRTL = currentLang.rtl;

  return (
    <div
      className="min-h-screen bg-[#0a0f1e] text-white font-sans"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* ── 네비게이션 ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-white tracking-tight">EverWill</span>
            <span className="text-xs bg-red-500/80 text-white px-2 py-0.5 rounded-full">{t.nav_invest}</span>
          </div>
          {/* 언어 드롭다운 */}
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
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F3864]/40 via-[#0a0f1e] to-[#0a0f1e]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#C9A961]/5 rounded-full blur-3xl" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 border border-[#C9A961]/30 text-[#C9A961] px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Globe className="w-4 h-4" />
            {t.hero_badge}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 whitespace-pre-line">
            {t.hero_title.split("\n").map((line, i) => (
              <span key={i} className={i === 1 ? "text-[#C9A961]" : "text-white"}>
                {line}{i === 0 && "\n"}
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
      <section className="py-16 px-6 bg-[#1F3864]/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: t.m1_label, val: t.m1_val, icon: Users },
            { label: t.m2_label, val: t.m2_val, icon: DollarSign },
            { label: t.m3_label, val: t.m3_val, icon: Globe },
            { label: t.m4_label, val: t.m4_val, icon: TrendingUp },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <m.icon className="w-6 h-6 text-[#C9A961] mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-extrabold text-[#C9A961]">{m.val}</div>
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-6">{t.market_chart_title}</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MARKET_BAR_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {MARKET_BAR_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* 시장 성장 전망 에어리어차트 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-6">{t.market_growth_title}</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={MARKET_GROWTH_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A961" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A961" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} domain={[80, 145]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#C9A961" strokeWidth={2.5} fill="url(#marketGradient)" dot={{ fill: "#C9A961", r: 4 }} activeDot={{ r: 6, fill: "#C9A961" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── 경쟁사 비교표 ── */}
      <section className="py-24 px-6 bg-[#0d1428]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.comp_title}</h2>
            <p className="text-white/50 text-lg">{t.comp_sub}</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1F3864]/40 border-b border-white/10">
                  <th className="text-left px-6 py-4 text-white/60 font-semibold">{t.comp_feature}</th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-[#C9A961] font-extrabold text-base">{t.comp_everwill}</span>
                    <div className="text-xs text-[#C9A961]/60 mt-0.5">★ Our Product</div>
                  </th>
                  <th className="px-6 py-4 text-center text-white/50 font-semibold">{t.comp_tw}</th>
                  <th className="px-6 py-4 text-center text-white/50 font-semibold">{t.comp_fw}</th>
                  <th className="px-6 py-4 text-center text-white/50 font-semibold">{t.comp_gt}</th>
                </tr>
              </thead>
              <tbody>
                {t.comp_rows.map((row, i) => (
                  <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? "bg-white/2" : "bg-transparent"} hover:bg-white/5 transition-colors`}>
                    <td className="px-6 py-4 text-white/70 font-medium">{row.feature}</td>
                    <td className="px-6 py-4 text-center bg-[#C9A961]/5 font-semibold text-[#C9A961]">{row.ew}</td>
                    <td className="px-6 py-4 text-center text-white/50">{row.tw}</td>
                    <td className="px-6 py-4 text-center text-white/50">{row.fw}</td>
                    <td className="px-6 py-4 text-center text-white/50">{row.gt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 차별화 ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.diff_title}</h2>
            <p className="text-white/50 text-lg">{t.diff_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: t.diff_1_title, desc: t.diff_1_desc, icon: Award, num: "01" },
              { title: t.diff_2_title, desc: t.diff_2_desc, icon: Shield, num: "02" },
              { title: t.diff_3_title, desc: t.diff_3_desc, icon: Users, num: "03" },
              { title: t.diff_4_title, desc: t.diff_4_desc, icon: Zap, num: "04" },
              { title: t.diff_5_title, desc: t.diff_5_desc, icon: Globe, num: "05" },
              { title: t.diff_6_title, desc: t.diff_6_desc, icon: TrendingUp, num: "06" },
            ].map((d, i) => (
              <div key={i} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-6 transition-all group relative overflow-hidden">
                <div className="absolute top-4 right-4 text-4xl font-extrabold text-white/5 select-none">{d.num}</div>
                <div className="w-10 h-10 bg-[#C9A961]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#C9A961]/20 transition-colors">
                  <d.icon className="w-5 h-5 text-[#C9A961]" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{d.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 수익 모델 (파이차트) ── */}
      <section className="py-24 px-6 bg-[#0d1428]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.revenue_title}</h2>
            <p className="text-white/50 text-lg">{t.revenue_sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* 수익 파이차트 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 text-center">{t.rev_pie_title}</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={REVENUE_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {REVENUE_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, ""]}
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                  />
                  <Legend
                    formatter={(value) => <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* 수익 항목 목록 */}
            <div className="space-y-4">
              {[
                { label: t.rev_1, val: t.rev_1_val, icon: Shield, color: "#C9A961" },
                { label: t.rev_2, val: t.rev_2_val, icon: TrendingUp, color: "#1F3864" },
                { label: t.rev_3, val: t.rev_3_val, icon: Award, color: "#8B5CF6" },
                { label: t.rev_4, val: t.rev_4_val, icon: Users, color: "#10B981" },
              ].map((r, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <div className="flex-1">
                    <div className="text-white/60 text-sm">{r.label}</div>
                    <div className="text-white font-bold text-lg">{r.val}</div>
                  </div>
                </div>
              ))}
              {/* LTV 강조 */}
              <div className="bg-gradient-to-r from-[#C9A961]/20 to-[#C9A961]/5 border border-[#C9A961]/30 rounded-2xl p-6 text-center mt-2">
                <div className="text-white/60 text-sm mb-1">{t.ltv_label}</div>
                <div className="text-5xl font-extrabold text-[#C9A961]">{t.ltv_val}</div>
                <div className="text-white/40 text-xs mt-1">vs Trust & Will $197</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 재무 전망 (바차트 + 라인차트) ── */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.finance_title}</h2>
            <p className="text-white/50 text-lg">{t.finance_sub}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ARR 바차트 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-6">{t.finance_arr_title}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ARR_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                  <Tooltip
                    formatter={(v: number) => [`$${v}M`, "ARR"]}
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                  />
                  <Bar dataKey="arr" radius={[8, 8, 0, 0]}>
                    {ARR_DATA.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === 2 ? "#C9A961" : index === 1 ? "#C9A961aa" : "#C9A96155"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-around mt-4">
                {ARR_DATA.map((d, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[#C9A961] font-extrabold text-xl">${d.arr}M</div>
                    <div className="text-white/40 text-xs">{d.year}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* 사용자 라인차트 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-6">{t.finance_user_title}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={USER_DATA} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#1F3864" />
                      <stop offset="100%" stopColor="#C9A961" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 13 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v.toString()} />
                  <Tooltip
                    formatter={(v: number) => [v.toLocaleString(), "Users"]}
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white" }}
                  />
                  <Line type="monotone" dataKey="users" stroke="url(#userGradient)" strokeWidth={3} dot={{ fill: "#C9A961", r: 6, strokeWidth: 2, stroke: "#0a0f1e" }} activeDot={{ r: 8, fill: "#C9A961" }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-around mt-4">
                {USER_DATA.map((d, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[#C9A961] font-extrabold text-xl">{d.users.toLocaleString()}</div>
                    <div className="text-white/40 text-xs">{d.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 로드맵 ── */}
      <section className="py-24 px-6 bg-[#0d1428]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.roadmap_title}</h2>
            <p className="text-white/50 text-lg">{t.roadmap_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { q: t.rm_1_q, title: t.rm_1_title, items: t.rm_1_items, active: true },
              { q: t.rm_2_q, title: t.rm_2_title, items: t.rm_2_items, active: false },
              { q: t.rm_3_q, title: t.rm_3_title, items: t.rm_3_items, active: false },
              { q: t.rm_4_q, title: t.rm_4_title, items: t.rm_4_items, active: false },
            ].map((rm, i) => (
              <div key={i} className={`rounded-2xl p-6 border ${rm.active ? "bg-[#C9A961]/10 border-[#C9A961]/40" : "bg-white/5 border-white/10"}`}>
                <div className={`text-xs font-bold mb-2 ${rm.active ? "text-[#C9A961]" : "text-white/40"}`}>{rm.q}</div>
                <div className="font-bold text-white text-base mb-4">{rm.title}</div>
                <ul className="space-y-2">
                  {rm.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-white/60">
                      <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${rm.active ? "text-[#C9A961]" : "text-white/20"}`} />
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
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.team_title}</h2>
            <p className="text-white/50 text-lg">{t.team_sub}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1F3864]/40 to-[#1F3864]/10 border border-[#1F3864]/50 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-[#C9A961] rounded-2xl flex items-center justify-center text-[#1F3864] font-extrabold text-3xl shrink-0">
              JL
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white mb-1">{t.t1_name}</div>
              <div className="text-[#C9A961] font-semibold text-sm mb-3">{t.t1_role}</div>
              <p className="text-white/60 leading-relaxed">{t.t1_desc}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Product", "Design", "Finance", "30yr Experience"].map((tag) => (
                  <span key={tag} className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 투자 조건 ── */}
      <section className="py-24 px-6 bg-[#0d1428]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.invest_title}</h2>
            <p className="text-white/50 text-lg">{t.invest_sub}</p>
          </div>
          {/* 라운드 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: "Round", value: t.invest_round, icon: Target },
              { label: "Amount", value: t.invest_amount, icon: DollarSign },
              { label: "Valuation", value: t.invest_valuation, icon: BarChart3 },
            ].map((item, i) => (
              <div key={i} className="bg-gradient-to-b from-[#C9A961]/10 to-transparent border border-[#C9A961]/20 rounded-2xl p-6 text-center">
                <item.icon className="w-8 h-8 text-[#C9A961] mx-auto mb-3" />
                <div className="text-white/50 text-xs mb-1">{item.label}</div>
                <div className="text-white font-bold text-base leading-snug">{item.value}</div>
              </div>
            ))}
          </div>
          {/* 투자금 사용 계획 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-white font-bold text-xl mb-6">{t.invest_use}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {t.invest_use_items.map((item, i) => {
                const pct = parseInt(item.pct);
                const colors = ["#C9A961", "#1F3864", "#8B5CF6", "#10B981"];
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-sm" style={{ backgroundColor: `${colors[i]}22`, color: colors[i] }}>
                        {item.pct}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm mb-1">{item.label}</div>
                      <div className="text-white/50 text-xs leading-relaxed mb-2">{item.desc}</div>
                      <div className="w-full bg-white/10 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[i] }} />
                      </div>
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
          <Rocket className="w-12 h-12 text-[#C9A961] mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">{t.cta_title}</h2>
          <p className="text-white/60 text-lg mb-10 whitespace-pre-line leading-relaxed">{t.cta_sub}</p>
          <a
            href={`mailto:${t.cta_email}?subject=EverWill Investment Inquiry`}
            className="inline-flex items-center gap-3 bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-extrabold px-10 py-5 rounded-2xl text-xl transition-all shadow-2xl shadow-[#C9A961]/30"
          >
            <Mail className="w-6 h-6" />
            {t.cta_btn}
          </a>
          <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-sm">
            <Mail className="w-4 h-4" />
            <span>{t.cta_email}</span>
          </div>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="py-8 px-6 border-t border-white/10 text-center">
        <p className="text-white/30 text-sm">{t.footer_conf}</p>
        <p className="text-white/20 text-xs mt-2">© 2026 SARAM Corp. (주식회사 사람) · EverWill · All Rights Reserved</p>
      </footer>
    </div>
  );
}
