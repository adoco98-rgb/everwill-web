/**
 * EverWill 투자유치 사업설명회 랜딩페이지 (/investor)
 * - 네비게이션 미노출 (주소 직접 접근만 가능)
 * - 7개국어 지원: ko, en, ja, zh, de, es, ar
 * - 섹션: 히어로 → 시장 기회 → 차별화 → 수익 모델 → 로드맵 → 팀 → CTA
 */
import { useState } from "react";
import {
  Globe, TrendingUp, Shield, Zap, Users, DollarSign,
  ChevronDown, ArrowRight, CheckCircle, BarChart3,
  Target, Rocket, Award, Mail, Phone,
} from "lucide-react";

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
  hero_deck: string;
  market_title: string;
  market_sub: string;
  market_global: string;
  market_global_val: string;
  market_global_desc: string;
  market_korea: string;
  market_korea_val: string;
  market_korea_desc: string;
  market_japan: string;
  market_japan_val: string;
  market_japan_desc: string;
  market_us: string;
  market_us_val: string;
  market_us_desc: string;
  diff_title: string;
  diff_sub: string;
  diff_1_title: string;
  diff_1_desc: string;
  diff_2_title: string;
  diff_2_desc: string;
  diff_3_title: string;
  diff_3_desc: string;
  diff_4_title: string;
  diff_4_desc: string;
  diff_5_title: string;
  diff_5_desc: string;
  diff_6_title: string;
  diff_6_desc: string;
  revenue_title: string;
  revenue_sub: string;
  rev_1: string;
  rev_1_val: string;
  rev_2: string;
  rev_2_val: string;
  rev_3: string;
  rev_3_val: string;
  rev_4: string;
  rev_4_val: string;
  ltv_label: string;
  ltv_val: string;
  roadmap_title: string;
  roadmap_sub: string;
  rm_1_q: string;
  rm_1_title: string;
  rm_1_items: string[];
  rm_2_q: string;
  rm_2_title: string;
  rm_2_items: string[];
  rm_3_q: string;
  rm_3_title: string;
  rm_3_items: string[];
  rm_4_q: string;
  rm_4_title: string;
  rm_4_items: string[];
  metrics_title: string;
  m1_label: string;
  m1_val: string;
  m2_label: string;
  m2_val: string;
  m3_label: string;
  m3_val: string;
  m4_label: string;
  m4_val: string;
  team_title: string;
  team_sub: string;
  t1_name: string;
  t1_role: string;
  t1_desc: string;
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
    hero_deck: "사업계획서 다운로드",
    market_title: "글로벌 유언 시장",
    market_sub: "전 세계 고령화와 디지털 전환이 만드는 거대한 시장 기회",
    market_global: "글로벌 시장",
    market_global_val: "$139B",
    market_global_desc: "2030년 글로벌 유언·상속 시장 규모",
    market_korea: "한국 시장",
    market_korea_val: "₩2.4조",
    market_korea_desc: "연간 상속 분쟁 관련 법률 비용",
    market_japan: "일본 시장",
    market_japan_val: "¥8.5조",
    market_japan_desc: "2025년 공정증서 디지털화 개방",
    market_us: "미국 시장",
    market_us_val: "$67B",
    market_us_desc: "재미한인 100만 명 포함 거대 시장",
    diff_title: "왜 EverWill인가?",
    diff_sub: "기존 경쟁사가 해결하지 못한 10가지 혁신",
    diff_1_title: "물리적 Badge 시스템",
    diff_1_desc: "MedicAlert + AirTag + 유언 인증을 하나로. 전 세계 어떤 유언 플랫폼도 시도하지 않은 영구적 차별화.",
    diff_2_title: "4중 사망 감지",
    diff_2_desc: "가족 신고 → 정부 DB → Dead Man's Switch → 응급 발견자. 자동 집행 트리거 시스템.",
    diff_3_title: "변호사 마켓플레이스",
    diff_3_desc: "평소엔 0%, 사후 100%. 진짜 필요한 순간에만 등장하는 전문가 네트워크.",
    diff_4_title: "체크박스 17분 완성",
    diff_4_desc: "빈 종이의 공포를 없앴습니다. AI가 체크박스를 법률 문장으로 자동 변환.",
    diff_5_title: "글로벌 멀티관할권",
    diff_5_desc: "한국 + 미국 + 일본 자산을 동시에. 이런 서비스 현재 세계에 없습니다.",
    diff_6_title: "LTV 28배",
    diff_6_desc: "재인증 ₩15,000으로 생애 이벤트마다 재방문. Trust & Will 대비 28배 LTV.",
    revenue_title: "수익 모델",
    revenue_sub: "다층 수익 구조로 안정적인 성장",
    rev_1: "전자 인증",
    rev_1_val: "₩49,000 / 건",
    rev_2: "연 멤버십",
    rev_2_val: "₩29,000 / 년",
    rev_3: "Badge 판매",
    rev_3_val: "₩49,000 ~ ₩299,000",
    rev_4: "변호사 수수료",
    rev_4_val: "보수의 15~25%",
    ltv_label: "고객 생애 가치 (LTV)",
    ltv_val: "$5,500+",
    roadmap_title: "글로벌 출시 로드맵",
    roadmap_sub: "12개월 안에 4개국 동시 진출",
    rm_1_q: "Q1 2026",
    rm_1_title: "🇰🇷 한국 런칭",
    rm_1_items: ["MVP 출시", "eKYC 연동", "토스페이먼츠 결제", "Badge 생산"],
    rm_2_q: "Q2 2026",
    rm_2_title: "🇯🇵 일본 진출",
    rm_2_items: ["공정증서 디지털화 대응", "일본어 완전 지원", "PayPay 연동", "현지 변호사 영입"],
    rm_3_q: "Q3 2026",
    rm_3_title: "🇨🇳 중화권 진출",
    rm_3_items: ["홍콩·대만 먼저", "WeChat Pay 연동", "중국어 간체 지원", "현지 파트너십"],
    rm_4_q: "Q4 2026",
    rm_4_title: "🇺🇸 미국 진출",
    rm_4_items: ["재미한인 100만 타깃", "Stripe 결제", "영어 완전 지원", "CA·NY 법률 적용"],
    metrics_title: "핵심 지표",
    m1_label: "목표 MAU (Year 2)",
    m1_val: "50,000",
    m2_label: "목표 ARR (Year 3)",
    m2_val: "$12M",
    m3_label: "목표 국가",
    m3_val: "7개국",
    m4_label: "지원 언어",
    m4_val: "7개 언어",
    team_title: "팀",
    team_sub: "비전을 실행하는 사람들",
    t1_name: "라수환 (Jeff Lah)",
    t1_role: "CEO & Founder",
    t1_desc: "제품기획 · 디자인 · 재무 총괄. 주식회사 사람 대표. 글로벌 유언 플랫폼 1위를 목표로 합니다.",
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
    hero_deck: "Download Pitch Deck",
    market_title: "Global Will Market",
    market_sub: "A massive market opportunity created by global aging and digital transformation",
    market_global: "Global Market",
    market_global_val: "$139B",
    market_global_desc: "Global will & estate market size by 2030",
    market_korea: "Korea Market",
    market_korea_val: "₩2.4T",
    market_korea_desc: "Annual legal costs related to inheritance disputes",
    market_japan: "Japan Market",
    market_japan_val: "¥8.5T",
    market_japan_desc: "Notarial deed digitization opened in 2025",
    market_us: "US Market",
    market_us_val: "$67B",
    market_us_desc: "Massive market including 1M Korean-Americans",
    diff_title: "Why EverWill?",
    diff_sub: "10 innovations that existing competitors haven't solved",
    diff_1_title: "Physical Badge System",
    diff_1_desc: "MedicAlert + AirTag + Will Certification in one. A permanent differentiator no will platform in the world has attempted.",
    diff_2_title: "4-Layer Death Detection",
    diff_2_desc: "Family report → Government DB → Dead Man's Switch → Emergency finder. Automatic execution trigger system.",
    diff_3_title: "Lawyer Marketplace",
    diff_3_desc: "0% in life, 100% after death. Expert network that appears only when truly needed.",
    diff_4_title: "17-Minute Checkbox Wizard",
    diff_4_desc: "Eliminated the fear of a blank page. AI auto-converts checkboxes into legal language.",
    diff_5_title: "Global Multi-Jurisdiction",
    diff_5_desc: "Korea + US + Japan assets simultaneously. No service like this exists in the world.",
    diff_6_title: "28x LTV",
    diff_6_desc: "Re-certification at $15 drives return visits at every life event. 28x LTV vs Trust & Will.",
    revenue_title: "Revenue Model",
    revenue_sub: "Stable growth through multi-layered revenue structure",
    rev_1: "E-Certification",
    rev_1_val: "$39 / cert",
    rev_2: "Annual Membership",
    rev_2_val: "$29 / year",
    rev_3: "Badge Sales",
    rev_3_val: "$49 ~ $299",
    rev_4: "Lawyer Commission",
    rev_4_val: "15~25% of fee",
    ltv_label: "Customer Lifetime Value (LTV)",
    ltv_val: "$5,500+",
    roadmap_title: "Global Launch Roadmap",
    roadmap_sub: "4 countries in 12 months",
    rm_1_q: "Q1 2026",
    rm_1_title: "🇰🇷 Korea Launch",
    rm_1_items: ["MVP Release", "eKYC Integration", "Toss Payments", "Badge Production"],
    rm_2_q: "Q2 2026",
    rm_2_title: "🇯🇵 Japan Entry",
    rm_2_items: ["Notarial deed digitization", "Full Japanese support", "PayPay integration", "Local lawyer recruitment"],
    rm_3_q: "Q3 2026",
    rm_3_title: "🇨🇳 Greater China",
    rm_3_items: ["Hong Kong & Taiwan first", "WeChat Pay integration", "Simplified Chinese", "Local partnerships"],
    rm_4_q: "Q4 2026",
    rm_4_title: "🇺🇸 US Entry",
    rm_4_items: ["1M Korean-Americans target", "Stripe payments", "Full English support", "CA & NY law applied"],
    metrics_title: "Key Metrics",
    m1_label: "Target MAU (Year 2)",
    m1_val: "50,000",
    m2_label: "Target ARR (Year 3)",
    m2_val: "$12M",
    m3_label: "Target Countries",
    m3_val: "7 Countries",
    m4_label: "Languages Supported",
    m4_val: "7 Languages",
    team_title: "Team",
    team_sub: "People executing the vision",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "CEO & Founder",
    t1_desc: "Product · Design · Finance. CEO of SARAM Corp. Targeting #1 global will platform.",
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
    hero_deck: "事業計画書ダウンロード",
    market_title: "グローバル遺言市場",
    market_sub: "世界的な高齢化とデジタル転換が生む巨大な市場機会",
    market_global: "グローバル市場",
    market_global_val: "$139B",
    market_global_desc: "2030年グローバル遺言・相続市場規模",
    market_korea: "韓国市場",
    market_korea_val: "₩2.4兆",
    market_korea_desc: "年間相続紛争関連法律費用",
    market_japan: "日本市場",
    market_japan_val: "¥8.5兆",
    market_japan_desc: "2025年公正証書デジタル化開放",
    market_us: "米国市場",
    market_us_val: "$67B",
    market_us_desc: "在米韓国人100万人を含む巨大市場",
    diff_title: "なぜEverWillか？",
    diff_sub: "既存競合他社が解決できなかった10の革新",
    diff_1_title: "物理的バッジシステム",
    diff_1_desc: "MedicAlert + AirTag + 遺言認証を一つに。世界のどの遺言プラットフォームも試みていない永続的差別化。",
    diff_2_title: "4層死亡検知",
    diff_2_desc: "家族申告 → 政府DB → Dead Man's Switch → 緊急発見者。自動執行トリガーシステム。",
    diff_3_title: "弁護士マーケットプレイス",
    diff_3_desc: "生前は0%、死後は100%。本当に必要な瞬間にのみ登場する専門家ネットワーク。",
    diff_4_title: "17分チェックボックス完成",
    diff_4_desc: "白紙の恐怖をなくしました。AIがチェックボックスを法律文章に自動変換。",
    diff_5_title: "グローバルマルチ管轄",
    diff_5_desc: "韓国 + 米国 + 日本の資産を同時に。このようなサービスは現在世界に存在しません。",
    diff_6_title: "LTV 28倍",
    diff_6_desc: "再認証¥1,500で生涯イベントごとに再訪問。Trust & Will比28倍LTV。",
    revenue_title: "収益モデル",
    revenue_sub: "多層収益構造による安定した成長",
    rev_1: "電子認証",
    rev_1_val: "¥5,800 / 件",
    rev_2: "年間メンバーシップ",
    rev_2_val: "¥3,500 / 年",
    rev_3: "バッジ販売",
    rev_3_val: "¥5,800 ~ ¥35,000",
    rev_4: "弁護士手数料",
    rev_4_val: "報酬の15~25%",
    ltv_label: "顧客生涯価値 (LTV)",
    ltv_val: "$5,500+",
    roadmap_title: "グローバル展開ロードマップ",
    roadmap_sub: "12ヶ月で4カ国同時進出",
    rm_1_q: "Q1 2026",
    rm_1_title: "🇰🇷 韓国ローンチ",
    rm_1_items: ["MVP リリース", "eKYC 連携", "決済システム", "バッジ生産"],
    rm_2_q: "Q2 2026",
    rm_2_title: "🇯🇵 日本進出",
    rm_2_items: ["公正証書デジタル化対応", "日本語完全対応", "PayPay連携", "現地弁護士採用"],
    rm_3_q: "Q3 2026",
    rm_3_title: "🇨🇳 中華圏進出",
    rm_3_items: ["香港・台湾から", "WeChat Pay連携", "簡体字中国語対応", "現地パートナーシップ"],
    rm_4_q: "Q4 2026",
    rm_4_title: "🇺🇸 米国進出",
    rm_4_items: ["在米韓国人100万人ターゲット", "Stripe決済", "英語完全対応", "CA・NY法律適用"],
    metrics_title: "主要指標",
    m1_label: "目標MAU（Year 2）",
    m1_val: "50,000",
    m2_label: "目標ARR（Year 3）",
    m2_val: "$12M",
    m3_label: "目標国数",
    m3_val: "7カ国",
    m4_label: "対応言語",
    m4_val: "7言語",
    team_title: "チーム",
    team_sub: "ビジョンを実行する人々",
    t1_name: "Jeff Lah（라수환）",
    t1_role: "CEO & Founder",
    t1_desc: "製品企画・デザイン・財務担当。SARAM Corp代表。グローバル遺言プラットフォーム1位を目指します。",
    cta_title: "共に作りましょう",
    cta_sub: "EverWillのグローバルな旅に参加する投資家を募集しています。\n今すぐご連絡ください。",
    cta_btn: "投資お問い合わせを送る",
    cta_email: "adoco98@gmail.com",
    footer_conf: "本資料は機密です。無断配布を禁じます。",
  },
  zh: {
    nav_invest: "仅限投资者",
    hero_badge: "🌍 全球首个数字遗嘱OS",
    hero_title: "成为遗嘱行业的\nOS平台",
    hero_sub: "超越Trust & Will、Farewill、GoodTrust的一站式全球遗嘱平台。\n从撰写到身后自动执行，全程负责。",
    hero_cta: "投资咨询",
    hero_deck: "下载商业计划书",
    market_title: "全球遗嘱市场",
    market_sub: "全球老龄化与数字化转型带来的巨大市场机遇",
    market_global: "全球市场",
    market_global_val: "$1390亿",
    market_global_desc: "2030年全球遗嘱与遗产市场规模",
    market_korea: "韩国市场",
    market_korea_val: "2.4万亿韩元",
    market_korea_desc: "年度遗产纠纷相关法律费用",
    market_japan: "日本市场",
    market_japan_val: "8.5万亿日元",
    market_japan_desc: "2025年公证书数字化开放",
    market_us: "美国市场",
    market_us_val: "$670亿",
    market_us_desc: "包含100万在美韩裔的巨大市场",
    diff_title: "为什么选择EverWill？",
    diff_sub: "现有竞争对手未能解决的10项创新",
    diff_1_title: "实体徽章系统",
    diff_1_desc: "MedicAlert + AirTag + 遗嘱认证合而为一。全球任何遗嘱平台都未尝试过的永久差异化。",
    diff_2_title: "四重死亡检测",
    diff_2_desc: "家属申报 → 政府数据库 → Dead Man's Switch → 紧急发现者。自动执行触发系统。",
    diff_3_title: "律师市场平台",
    diff_3_desc: "生前0%，身后100%。只在真正需要时出现的专家网络。",
    diff_4_title: "17分钟勾选完成",
    diff_4_desc: "消除了面对空白页面的恐惧。AI自动将勾选框转换为法律语言。",
    diff_5_title: "全球多司法管辖",
    diff_5_desc: "同时管理韩国 + 美国 + 日本资产。目前全球没有此类服务。",
    diff_6_title: "LTV提升28倍",
    diff_6_desc: "每次生活事件以$15重新认证，带来回访。LTV是Trust & Will的28倍。",
    revenue_title: "盈利模式",
    revenue_sub: "多层收入结构实现稳定增长",
    rev_1: "电子认证",
    rev_1_val: "$39 / 次",
    rev_2: "年度会员",
    rev_2_val: "$29 / 年",
    rev_3: "徽章销售",
    rev_3_val: "$49 ~ $299",
    rev_4: "律师佣金",
    rev_4_val: "费用的15~25%",
    ltv_label: "客户终身价值 (LTV)",
    ltv_val: "$5,500+",
    roadmap_title: "全球发布路线图",
    roadmap_sub: "12个月内进入4个国家",
    rm_1_q: "Q1 2026",
    rm_1_title: "🇰🇷 韩国上线",
    rm_1_items: ["MVP发布", "eKYC集成", "支付系统", "徽章生产"],
    rm_2_q: "Q2 2026",
    rm_2_title: "🇯🇵 进入日本",
    rm_2_items: ["公证书数字化应对", "完整日语支持", "PayPay集成", "招募本地律师"],
    rm_3_q: "Q3 2026",
    rm_3_title: "🇨🇳 大中华区",
    rm_3_items: ["先进入香港和台湾", "微信支付集成", "简体中文支持", "本地合作伙伴"],
    rm_4_q: "Q4 2026",
    rm_4_title: "🇺🇸 进入美国",
    rm_4_items: ["目标100万在美韩裔", "Stripe支付", "完整英语支持", "适用CA和NY法律"],
    metrics_title: "核心指标",
    m1_label: "目标MAU（第2年）",
    m1_val: "50,000",
    m2_label: "目标ARR（第3年）",
    m2_val: "$1200万",
    m3_label: "目标国家",
    m3_val: "7个国家",
    m4_label: "支持语言",
    m4_val: "7种语言",
    team_title: "团队",
    team_sub: "执行愿景的人们",
    t1_name: "Jeff Lah（라수환）",
    t1_role: "CEO & 创始人",
    t1_desc: "产品规划·设计·财务总监。SARAM Corp代表。目标成为全球遗嘱平台第一。",
    cta_title: "让我们共同创造",
    cta_sub: "我们正在寻找愿意加入EverWill全球旅程的投资者。\n立即联系我们。",
    cta_btn: "发送投资咨询",
    cta_email: "adoco98@gmail.com",
    footer_conf: "本资料为机密文件，禁止未经授权的传播。",
  },
  de: {
    nav_invest: "Nur für Investoren",
    hero_badge: "🌍 Weltweit erstes digitales Testament-OS",
    hero_title: "Das OS der\nTestamentbranche werden",
    hero_sub: "Eine All-in-One-Plattform, die Trust & Will, Farewill und GoodTrust übertrifft.\nVon der Erstellung bis zur automatischen Nachlassabwicklung.",
    hero_cta: "Investitionsanfrage",
    hero_deck: "Pitch Deck herunterladen",
    market_title: "Globaler Testamentmarkt",
    market_sub: "Riesige Marktchance durch globale Alterung und digitale Transformation",
    market_global: "Globaler Markt",
    market_global_val: "$139 Mrd.",
    market_global_desc: "Globaler Testament- und Erbschaftsmarkt bis 2030",
    market_korea: "Koreanischer Markt",
    market_korea_val: "₩2,4 Bio.",
    market_korea_desc: "Jährliche Rechtskosten bei Erbstreitigkeiten",
    market_japan: "Japanischer Markt",
    market_japan_val: "¥8,5 Bio.",
    market_japan_desc: "Digitalisierung notarieller Urkunden ab 2025",
    market_us: "US-Markt",
    market_us_val: "$67 Mrd.",
    market_us_desc: "Riesiger Markt mit 1 Mio. Koreanern in den USA",
    diff_title: "Warum EverWill?",
    diff_sub: "10 Innovationen, die bestehende Wettbewerber nicht lösen konnten",
    diff_1_title: "Physisches Badge-System",
    diff_1_desc: "MedicAlert + AirTag + Testamentsauthentifizierung in einem. Dauerhafte Differenzierung, die kein Testamentsdienst weltweit versucht hat.",
    diff_2_title: "4-fache Todeserkennung",
    diff_2_desc: "Familienmeldung → Regierungs-DB → Dead Man's Switch → Notfallentdecker. Automatisches Ausführungs-Triggersystem.",
    diff_3_title: "Anwalts-Marktplatz",
    diff_3_desc: "0% im Leben, 100% nach dem Tod. Expertennetzwerk, das nur dann erscheint, wenn es wirklich gebraucht wird.",
    diff_4_title: "17-Minuten-Checkbox-Assistent",
    diff_4_desc: "Die Angst vor dem leeren Blatt beseitigt. KI wandelt Checkboxen automatisch in Rechtssprache um.",
    diff_5_title: "Globale Multi-Jurisdiktion",
    diff_5_desc: "Korea + USA + Japan-Vermögen gleichzeitig. Solch einen Service gibt es weltweit nicht.",
    diff_6_title: "28x LTV",
    diff_6_desc: "Re-Zertifizierung für $15 bringt Besucher bei jedem Lebensereignis zurück. 28x LTV vs. Trust & Will.",
    revenue_title: "Einnahmemodell",
    revenue_sub: "Stables Wachstum durch mehrschichtige Einnahmestruktur",
    rev_1: "E-Zertifizierung",
    rev_1_val: "39€ / Zert.",
    rev_2: "Jahresmitgliedschaft",
    rev_2_val: "29€ / Jahr",
    rev_3: "Badge-Verkauf",
    rev_3_val: "49€ ~ 299€",
    rev_4: "Anwaltsprovision",
    rev_4_val: "15~25% des Honorars",
    ltv_label: "Kundenlebenszeitwert (LTV)",
    ltv_val: "$5.500+",
    roadmap_title: "Globale Markteinführungs-Roadmap",
    roadmap_sub: "4 Länder in 12 Monaten",
    rm_1_q: "Q1 2026",
    rm_1_title: "🇰🇷 Korea-Launch",
    rm_1_items: ["MVP-Veröffentlichung", "eKYC-Integration", "Zahlungssystem", "Badge-Produktion"],
    rm_2_q: "Q2 2026",
    rm_2_title: "🇯🇵 Japan-Eintritt",
    rm_2_items: ["Notarielle Digitalisierung", "Vollständige Japanisch-Unterstützung", "PayPay-Integration", "Lokale Anwälte"],
    rm_3_q: "Q3 2026",
    rm_3_title: "🇨🇳 Greater China",
    rm_3_items: ["Hongkong & Taiwan zuerst", "WeChat Pay", "Vereinfachtes Chinesisch", "Lokale Partnerschaften"],
    rm_4_q: "Q4 2026",
    rm_4_title: "🇺🇸 USA-Eintritt",
    rm_4_items: ["1 Mio. Koreaner in den USA", "Stripe-Zahlung", "Vollständige Englisch-Unterstützung", "CA & NY Recht"],
    metrics_title: "Wichtige Kennzahlen",
    m1_label: "Ziel-MAU (Jahr 2)",
    m1_val: "50.000",
    m2_label: "Ziel-ARR (Jahr 3)",
    m2_val: "$12 Mio.",
    m3_label: "Zielländer",
    m3_val: "7 Länder",
    m4_label: "Unterstützte Sprachen",
    m4_val: "7 Sprachen",
    team_title: "Team",
    team_sub: "Menschen, die die Vision umsetzen",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "CEO & Gründer",
    t1_desc: "Produktplanung · Design · Finanzen. CEO von SARAM Corp. Ziel: Nr. 1 globale Testamentsplattform.",
    cta_title: "Lassen Sie uns gemeinsam aufbauen",
    cta_sub: "Wir suchen Investoren, die EverWills globale Reise begleiten.\nKontaktieren Sie uns jetzt.",
    cta_btn: "Investitionsanfrage senden",
    cta_email: "adoco98@gmail.com",
    footer_conf: "Dieses Dokument ist vertraulich. Unbefugte Weitergabe ist verboten.",
  },
  es: {
    nav_invest: "Solo para Inversores",
    hero_badge: "🌍 El primer OS de testamentos digitales del mundo",
    hero_title: "Convirtiéndonos en el OS\nde la industria testamentaria",
    hero_sub: "Una plataforma global todo-en-uno que supera a Trust & Will, Farewill y GoodTrust.\nDesde la redacción hasta la ejecución automática post-mortem.",
    hero_cta: "Consulta de Inversión",
    hero_deck: "Descargar Pitch Deck",
    market_title: "Mercado Global de Testamentos",
    market_sub: "Una enorme oportunidad de mercado creada por el envejecimiento global y la transformación digital",
    market_global: "Mercado Global",
    market_global_val: "$139 mil M",
    market_global_desc: "Tamaño del mercado global de testamentos y herencias para 2030",
    market_korea: "Mercado Coreano",
    market_korea_val: "₩2,4 bill.",
    market_korea_desc: "Costos legales anuales relacionados con disputas de herencia",
    market_japan: "Mercado Japonés",
    market_japan_val: "¥8,5 bill.",
    market_japan_desc: "Digitalización de escrituras notariales abierta en 2025",
    market_us: "Mercado EE.UU.",
    market_us_val: "$67 mil M",
    market_us_desc: "Mercado masivo con 1 millón de coreano-americanos",
    diff_title: "¿Por qué EverWill?",
    diff_sub: "10 innovaciones que los competidores existentes no han podido resolver",
    diff_1_title: "Sistema de Badge Físico",
    diff_1_desc: "MedicAlert + AirTag + Certificación de Testamento en uno. Diferenciación permanente que ninguna plataforma de testamentos en el mundo ha intentado.",
    diff_2_title: "Detección de Muerte en 4 Capas",
    diff_2_desc: "Reporte familiar → BD Gubernamental → Dead Man's Switch → Descubridor de emergencia. Sistema de activación de ejecución automática.",
    diff_3_title: "Mercado de Abogados",
    diff_3_desc: "0% en vida, 100% después de la muerte. Red de expertos que aparece solo cuando realmente se necesita.",
    diff_4_title: "Asistente de 17 Minutos",
    diff_4_desc: "Eliminamos el miedo a la página en blanco. La IA convierte automáticamente las casillas en lenguaje legal.",
    diff_5_title: "Multi-Jurisdicción Global",
    diff_5_desc: "Activos en Corea + EE.UU. + Japón simultáneamente. No existe tal servicio en el mundo.",
    diff_6_title: "LTV 28x",
    diff_6_desc: "Re-certificación por $15 genera retornos en cada evento de vida. LTV 28x vs Trust & Will.",
    revenue_title: "Modelo de Ingresos",
    revenue_sub: "Crecimiento estable a través de estructura de ingresos multicapa",
    rev_1: "Certificación Electrónica",
    rev_1_val: "$39 / cert.",
    rev_2: "Membresía Anual",
    rev_2_val: "$29 / año",
    rev_3: "Venta de Badges",
    rev_3_val: "$49 ~ $299",
    rev_4: "Comisión de Abogados",
    rev_4_val: "15~25% del honorario",
    ltv_label: "Valor de Vida del Cliente (LTV)",
    ltv_val: "$5,500+",
    roadmap_title: "Hoja de Ruta de Lanzamiento Global",
    roadmap_sub: "4 países en 12 meses",
    rm_1_q: "Q1 2026",
    rm_1_title: "🇰🇷 Lanzamiento en Corea",
    rm_1_items: ["Lanzamiento MVP", "Integración eKYC", "Sistema de pago", "Producción de Badge"],
    rm_2_q: "Q2 2026",
    rm_2_title: "🇯🇵 Entrada en Japón",
    rm_2_items: ["Digitalización notarial", "Soporte completo en japonés", "Integración PayPay", "Abogados locales"],
    rm_3_q: "Q3 2026",
    rm_3_title: "🇨🇳 Gran China",
    rm_3_items: ["Hong Kong y Taiwán primero", "Integración WeChat Pay", "Chino simplificado", "Asociaciones locales"],
    rm_4_q: "Q4 2026",
    rm_4_title: "🇺🇸 Entrada en EE.UU.",
    rm_4_items: ["1M coreano-americanos", "Pagos Stripe", "Soporte completo en inglés", "Leyes CA y NY"],
    metrics_title: "Métricas Clave",
    m1_label: "MAU Objetivo (Año 2)",
    m1_val: "50,000",
    m2_label: "ARR Objetivo (Año 3)",
    m2_val: "$12M",
    m3_label: "Países Objetivo",
    m3_val: "7 Países",
    m4_label: "Idiomas Soportados",
    m4_val: "7 Idiomas",
    team_title: "Equipo",
    team_sub: "Personas ejecutando la visión",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "CEO & Fundador",
    t1_desc: "Producto · Diseño · Finanzas. CEO de SARAM Corp. Objetivo: plataforma de testamentos global #1.",
    cta_title: "Construyamos Juntos",
    cta_sub: "Buscamos inversores para unirse al viaje global de EverWill.\nContáctenos hoy.",
    cta_btn: "Enviar Consulta de Inversión",
    cta_email: "adoco98@gmail.com",
    footer_conf: "Este documento es confidencial. Se prohíbe su distribución no autorizada.",
  },
  ar: {
    nav_invest: "للمستثمرين فقط",
    hero_badge: "🌍 أول نظام وصايا رقمي في العالم",
    hero_title: "نصبح نظام التشغيل\nلصناعة الوصايا",
    hero_sub: "منصة وصايا عالمية شاملة تتفوق على Trust & Will وFarewill وGoodTrust.\nمن الكتابة إلى التنفيذ التلقائي بعد الوفاة.",
    hero_cta: "استفسار الاستثمار",
    hero_deck: "تحميل خطة العمل",
    market_title: "السوق العالمية للوصايا",
    market_sub: "فرصة سوقية ضخمة يخلقها الشيخوخة العالمية والتحول الرقمي",
    market_global: "السوق العالمية",
    market_global_val: "$139 مليار",
    market_global_desc: "حجم سوق الوصايا والميراث العالمي بحلول 2030",
    market_korea: "السوق الكورية",
    market_korea_val: "2.4 تريليون وون",
    market_korea_desc: "التكاليف القانونية السنوية المتعلقة بنزاعات الميراث",
    market_japan: "السوق اليابانية",
    market_japan_val: "8.5 تريليون ين",
    market_japan_desc: "فتح رقمنة وثائق التوثيق في 2025",
    market_us: "السوق الأمريكية",
    market_us_val: "$67 مليار",
    market_us_desc: "سوق ضخمة تشمل مليون كوري-أمريكي",
    diff_title: "لماذا EverWill؟",
    diff_sub: "10 ابتكارات لم يتمكن المنافسون الحاليون من حلها",
    diff_1_title: "نظام الشارة المادية",
    diff_1_desc: "MedicAlert + AirTag + توثيق الوصية في واحد. تمييز دائم لم تحاوله أي منصة وصايا في العالم.",
    diff_2_title: "كشف الوفاة بأربع طبقات",
    diff_2_desc: "إبلاغ الأسرة ← قاعدة بيانات الحكومة ← Dead Man's Switch ← المكتشف في حالات الطوارئ. نظام تشغيل تنفيذ تلقائي.",
    diff_3_title: "سوق المحامين",
    diff_3_desc: "0% في الحياة، 100% بعد الوفاة. شبكة خبراء تظهر فقط عند الحاجة الحقيقية.",
    diff_4_title: "مساعد 17 دقيقة",
    diff_4_desc: "أزلنا الخوف من الصفحة البيضاء. يحول الذكاء الاصطناعي مربعات الاختيار تلقائياً إلى لغة قانونية.",
    diff_5_title: "ولايات قضائية متعددة عالمياً",
    diff_5_desc: "إدارة أصول كوريا + أمريكا + اليابان في آن واحد. لا توجد خدمة كهذه في العالم حالياً.",
    diff_6_title: "LTV أعلى بـ 28 مرة",
    diff_6_desc: "إعادة التوثيق بـ $15 تجلب العودة في كل حدث حياتي. LTV أعلى بـ 28 مرة مقارنة بـ Trust & Will.",
    revenue_title: "نموذج الإيرادات",
    revenue_sub: "نمو مستقر من خلال هيكل إيرادات متعدد الطبقات",
    rev_1: "التوثيق الإلكتروني",
    rev_1_val: "$39 / شهادة",
    rev_2: "العضوية السنوية",
    rev_2_val: "$29 / سنة",
    rev_3: "مبيعات الشارة",
    rev_3_val: "$49 ~ $299",
    rev_4: "عمولة المحامي",
    rev_4_val: "15~25% من الأتعاب",
    ltv_label: "قيمة عمر العميل (LTV)",
    ltv_val: "$5,500+",
    roadmap_title: "خارطة طريق الإطلاق العالمي",
    roadmap_sub: "4 دول في 12 شهراً",
    rm_1_q: "الربع الأول 2026",
    rm_1_title: "🇰🇷 إطلاق كوريا",
    rm_1_items: ["إصدار MVP", "تكامل eKYC", "نظام الدفع", "إنتاج الشارة"],
    rm_2_q: "الربع الثاني 2026",
    rm_2_title: "🇯🇵 دخول اليابان",
    rm_2_items: ["رقمنة التوثيق", "دعم كامل للغة اليابانية", "تكامل PayPay", "محامون محليون"],
    rm_3_q: "الربع الثالث 2026",
    rm_3_title: "🇨🇳 الصين الكبرى",
    rm_3_items: ["هونغ كونغ وتايوان أولاً", "تكامل WeChat Pay", "الصينية المبسطة", "شراكات محلية"],
    rm_4_q: "الربع الرابع 2026",
    rm_4_title: "🇺🇸 دخول أمريكا",
    rm_4_items: ["مليون كوري-أمريكي", "مدفوعات Stripe", "دعم كامل للإنجليزية", "قوانين CA وNY"],
    metrics_title: "المقاييس الرئيسية",
    m1_label: "هدف MAU (السنة 2)",
    m1_val: "50,000",
    m2_label: "هدف ARR (السنة 3)",
    m2_val: "$12M",
    m3_label: "الدول المستهدفة",
    m3_val: "7 دول",
    m4_label: "اللغات المدعومة",
    m4_val: "7 لغات",
    team_title: "الفريق",
    team_sub: "الأشخاص الذين ينفذون الرؤية",
    t1_name: "Jeff Lah (라수환)",
    t1_role: "الرئيس التنفيذي والمؤسس",
    t1_desc: "تخطيط المنتج · التصميم · المالية. رئيس SARAM Corp. الهدف: منصة الوصايا العالمية الأولى.",
    cta_title: "لنبني معاً",
    cta_sub: "نبحث عن مستثمرين للانضمام إلى رحلة EverWill العالمية.\nتواصل معنا الآن.",
    cta_btn: "إرسال استفسار الاستثمار",
    cta_email: "adoco98@gmail.com",
    footer_conf: "هذه الوثيقة سرية. يُحظر التوزيع غير المصرح به.",
  },
};

// ─────────────────────────────────────────────
// 메인 컴포넌트
// ─────────────────────────────────────────────
export default function InvestorPage() {
  const [lang, setLang] = useState<Lang>("ko");
  const [langOpen, setLangOpen] = useState(false);
  const t = T[lang];
  const isRtl = lang === "ar";
  const currentLang = LANGS.find((l) => l.code === lang)!;

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#0a0f1e] text-white font-sans"
      style={{ fontFamily: lang === "ar" ? "'Cairo', 'Tajawal', sans-serif" : lang === "ja" ? "'Noto Sans JP', sans-serif" : lang === "zh" ? "'Noto Sans SC', sans-serif" : "'Inter', 'Pretendard', sans-serif" }}
    >
      {/* ── 언어 선택 바 ── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0f1e]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A961] rounded-lg flex items-center justify-center text-[#1F3864] font-extrabold text-sm">EW</div>
            <span className="font-bold text-white text-sm">EverWill</span>
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
        {/* 배경 그라디언트 */}
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${t.cta_email}`}
              className="inline-flex items-center justify-center gap-2 bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold px-8 py-4 rounded-2xl text-lg transition-all shadow-lg shadow-[#C9A961]/20"
            >
              <Mail className="w-5 h-5" />
              {t.hero_cta}
            </a>
            <button className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition-all border border-white/20">
              <ArrowRight className="w-5 h-5" />
              {t.hero_deck}
            </button>
          </div>
        </div>
      </section>

      {/* ── 핵심 지표 ── */}
      <section className="py-16 px-6 bg-[#1F3864]/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: t.m1_label, val: t.m1_val, icon: Users },
            { label: t.m2_label, val: t.m2_val, icon: DollarSign },
            { label: t.m3_label, val: t.m3_val, icon: Globe },
            { label: t.m4_label, val: t.m4_val, icon: BarChart3 },
          ].map((m, i) => (
            <div key={i} className="text-center">
              <m.icon className="w-6 h-6 text-[#C9A961] mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-extrabold text-[#C9A961]">{m.val}</div>
              <div className="text-xs text-white/50 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 시장 기회 ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.market_title}</h2>
            <p className="text-white/50 text-lg">{t.market_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t.market_global, val: t.market_global_val, desc: t.market_global_desc, color: "from-[#C9A961]/20 to-[#C9A961]/5", border: "border-[#C9A961]/30" },
              { label: t.market_korea, val: t.market_korea_val, desc: t.market_korea_desc, color: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/30" },
              { label: t.market_japan, val: t.market_japan_val, desc: t.market_japan_desc, color: "from-red-500/20 to-red-500/5", border: "border-red-500/30" },
              { label: t.market_us, val: t.market_us_val, desc: t.market_us_desc, color: "from-purple-500/20 to-purple-500/5", border: "border-purple-500/30" },
            ].map((m, i) => (
              <div key={i} className={`bg-gradient-to-b ${m.color} border ${m.border} rounded-2xl p-6`}>
                <div className="text-white/60 text-sm font-medium mb-2">{m.label}</div>
                <div className="text-3xl font-extrabold text-white mb-3">{m.val}</div>
                <div className="text-white/50 text-xs leading-relaxed">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 차별화 ── */}
      <section className="py-24 px-6 bg-[#0d1428]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.diff_title}</h2>
            <p className="text-white/50 text-lg">{t.diff_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: t.diff_1_title, desc: t.diff_1_desc, icon: Award },
              { title: t.diff_2_title, desc: t.diff_2_desc, icon: Shield },
              { title: t.diff_3_title, desc: t.diff_3_desc, icon: Users },
              { title: t.diff_4_title, desc: t.diff_4_desc, icon: Zap },
              { title: t.diff_5_title, desc: t.diff_5_desc, icon: Globe },
              { title: t.diff_6_title, desc: t.diff_6_desc, icon: TrendingUp },
            ].map((d, i) => (
              <div key={i} className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-6 transition-all group">
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

      {/* ── 수익 모델 ── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">{t.revenue_title}</h2>
            <p className="text-white/50 text-lg">{t.revenue_sub}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {[
              { label: t.rev_1, val: t.rev_1_val, icon: Shield },
              { label: t.rev_2, val: t.rev_2_val, icon: TrendingUp },
              { label: t.rev_3, val: t.rev_3_val, icon: Award },
              { label: t.rev_4, val: t.rev_4_val, icon: Users },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-10 h-10 bg-[#C9A961]/10 rounded-xl flex items-center justify-center shrink-0">
                  <r.icon className="w-5 h-5 text-[#C9A961]" />
                </div>
                <div className="flex-1">
                  <div className="text-white/60 text-sm">{r.label}</div>
                  <div className="text-white font-bold text-lg">{r.val}</div>
                </div>
              </div>
            ))}
          </div>
          {/* LTV 강조 */}
          <div className="bg-gradient-to-r from-[#C9A961]/20 to-[#C9A961]/5 border border-[#C9A961]/30 rounded-2xl p-8 text-center">
            <div className="text-white/60 text-sm mb-2">{t.ltv_label}</div>
            <div className="text-6xl font-extrabold text-[#C9A961]">{t.ltv_val}</div>
            <div className="text-white/40 text-sm mt-2">vs Trust & Will $197</div>
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
                {["Product", "Design", "Finance", "Vision"].map((tag) => (
                  <span key={tag} className="text-xs bg-white/10 text-white/60 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
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
            <Phone className="w-4 h-4" />
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
