/**
 * EverWill 투자 설명서 (Investor Relations)
 * 홈페이지와 완전히 다른 전문 IR 문서 스타일
 * 6개 언어: 한국어·영어·日本語·中文·العربية·Русский
 */
import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown, TrendingUp, Globe, Shield, Zap, Users, DollarSign, BarChart3, Target, Award, Mail } from "lucide-react";

// ─── 차트 이미지 URL ──────────────────────────────────────────────
const CHARTS = {
  globalGrowth: "/manus-storage/A_global_growth_d658777c.png",
  countryTam:   "/manus-storage/B_country_tam_aedc3309.png",
  koreaDetail:  "/manus-storage/C_korea_detail_f2b628df.png",
  japanDetail:  "/manus-storage/D_japan_detail_5b2a2284.png",
  usMideast:    "/manus-storage/E_us_mideast_19da6bd9.png",
  revenueLtv:   "/manus-storage/F_revenue_ltv_30304232.png",
  radar:        "/manus-storage/G_radar_a23f8aa0.png",
};

type LangCode = "ko" | "en" | "ja" | "zh" | "ar" | "ru";

const LANGS: { code: LangCode; flag: string; label: string; dir?: "rtl" }[] = [
  { code: "ko", flag: "🇰🇷", label: "한국어" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "ar", flag: "🇸🇦", label: "العربية", dir: "rtl" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
];

// ─── 다국어 텍스트 ────────────────────────────────────────────────
const T: Record<LangCode, Record<string, string>> = {
  ko: {
    navBrand: "EverWill 투자설명서",
    navCta: "투자 문의",
    heroBadge: "Series A 투자 유치 중 · 2026",
    heroTitle1: "세계 최초",
    heroTitle2: "디지털 유언 OS",
    heroSub: "유언 작성부터 사후 집행 지원까지 — 아시아 시장 선점 기회",
    heroCta1: "투자 문의하기",
    heroCta2: "시장 분석 보기",
    kpi1v: "$3.7B", kpi1l: "글로벌 시장 규모", kpi1s: "2026년 기준",
    kpi2v: "9.3%", kpi2l: "연평균 성장률 CAGR", kpi2s: "2026–2035",
    kpi3v: "5%", kpi3l: "한국 유언 작성률", kpi3s: "미국 46% 대비",
    kpi4v: "$550", kpi4l: "목표 고객 LTV", kpi4s: "경쟁사 대비 2.8배",
    s01: "01 · 사업 의의 & 목적",
    s01Title: "왜 지금, 왜 EverWill인가",
    s01Sub: "죽음은 누구에게나 찾아오지만, 준비된 사람은 극소수입니다. EverWill은 이 불평등을 해소합니다.",
    prob1: "한국인 95%가 유언장 없이 사망", prob1s: "한국 법원행정처 2024",
    prob2: "상속 분쟁 연간 수조원 발생", prob2s: "대법원 사법연감 2024",
    prob3: "기존 유언 공증 비용 50만원+", prob3s: "대한공증인협회 2024",
    prob4: "재외한인 700만명 — 다국적 상속 서비스 전무", prob4s: "외교부 재외동포 현황 2024",
    prob5: "아시아 디지털 유언 플랫폼 경쟁사 0개", prob5s: "자체 시장 조사 2024",
    prob6: "사망 후 유언장 미발견 사례 다수", prob6s: "법무부 유언 실태조사 2023",
    s02: "02 · 시장 현황 — 글로벌 통합",
    s02Title: "지금이 최적의 진입 시점",
    s02Sub: "고령화 가속 · 디지털 전환 · 법제화 — 세 메가트렌드가 동시에 수렴",
    gm1v: "$3.7B", gm1l: "2026 글로벌 시장", gm1s: "Grand View Research 2024",
    gm2v: "$14.1B", gm2l: "2035 예측 시장", gm2s: "Statista 2024",
    gm3v: "9.3%", gm3l: "CAGR", gm3s: "IBISWorld 2024",
    gm4v: "0개", gm4l: "아시아 경쟁사", gm4s: "자체 조사 2024",
    chartGlobal: "글로벌 온라인 유언 플랫폼 시장 성장 (2022–2035)",
    s03: "03 · 국가별 시장 분석",
    s03Title: "5개국 순차 진출 전략",
    s03Sub: "한국 → 일본 → 중화권 → 미국 → 중동",
    chartCountry: "국가별 TAM / SAM / SOM 분석",
    koTitle: "한국", koTam: "TAM $4.2B",
    koKey: "유언 작성률 5% · 초고령사회 2025 · 경쟁사 전무",
    koTiming: "2026 Q1 진출",
    jpTitle: "일본", jpTam: "TAM $18.5B",
    jpKey: "공정증서 디지털화 법제화 2025.10 · 연간 상속 60조엔",
    jpTiming: "2026 Q3 진출",
    cnTitle: "중화권 (홍콩·대만)", cnTam: "TAM $8.3B",
    cnKey: "홍콩 HNWI 밀집 · 대만 디지털 인프라 성숙",
    cnTiming: "2027 Q1 진출",
    usTitle: "미국", usTam: "TAM $42.0B",
    usKey: "재미한인 100만명 미개척 · Trust & Will 공백",
    usTiming: "2027 Q3 진출",
    meTitle: "중동 (GCC 6국)", meTam: "TAM $12.7B",
    meKey: "HNWI 72만명 · 샤리아 상속법 특화 · 아랍어 RTL",
    meTiming: "2028 Q1 진출",
    s04: "04 · 차별성 & 독립성",
    s04Title: "경쟁사가 따라올 수 없는 이유",
    s04Sub: "10가지 혁신 중 7가지는 전 세계 어떤 경쟁사도 시도하지 않은 독창적 기술",
    chartRadar: "글로벌 경쟁사 기능 비교 분석",
    s05: "05 · 비전 & 로드맵",
    s05Title: "2030년, 글로벌 유언 플랫폼 1위",
    s05Sub: "아시아에서 시작해 전 세계로 확장하는 단계별 성장 전략",
    ph1y: "2026", ph1t: "한국 런칭", ph1k: "MAU 50,000 · 매출 ₩5억",
    ph2y: "2027", ph2t: "일본 진출", ph2k: "MAU 200,000 · 매출 ₩30억",
    ph3y: "2028", ph3t: "중화권·중동", ph3k: "MAU 1,000,000 · 매출 ₩200억",
    ph4y: "2030", ph4t: "미국·글로벌", ph4k: "글로벌 1위 · 매출 ₩1,000억+",
    s06: "06 · 수익 모델",
    s06Title: "다층 수익 구조로 LTV 극대화",
    s06Sub: "단순 구독이 아닌 생애주기 전반에 걸친 반복 수익 모델",
    chartRevenue: "국가별 매출 예측 & LTV 비교",
    s07: "07 · 팀 & 투자 조건",
    s07Title: "실행하는 창업자",
    s07Sub: "1인 멀티 역할로 제품기획·디자인·재무를 직접 담당",
    founderName: "라수환 (Jeff Ra)",
    founderRole: "대표이사 · 창업자",
    founderCo: "주식회사 사람 (EverWill Inc.)",
    s08: "08 · 투자 문의",
    s08Title: "함께 만들어갈 투자자를 찾습니다",
    s08Sub: "Series A · 목표 투자금 $5~10M · 기업가치 협의",
    fName: "성함", fCompany: "회사명", fEmail: "이메일",
    fAmount: "투자 희망 금액", fMsg: "문의 내용",
    fSubmit: "투자 문의 보내기",
    fSuccess: "문의가 접수되었습니다. 48시간 내 연락드리겠습니다.",
    footerRights: "© 2026 주식회사 사람. All rights reserved.",
    footerHome: "메인 사이트", footerWill: "유언장 작성", footerTax: "상속세 계산기",
  },
  en: {
    navBrand: "EverWill Investor Relations",
    navCta: "Contact Investor",
    heroBadge: "Series A Fundraising · 2026",
    heroTitle1: "World's First",
    heroTitle2: "Digital Will OS",
    heroSub: "From will drafting to post-death execution support — Asia market first-mover opportunity",
    heroCta1: "Contact Us",
    heroCta2: "View Market Analysis",
    kpi1v: "$3.7B", kpi1l: "Global Market Size", kpi1s: "2026 Estimate",
    kpi2v: "9.3%", kpi2l: "CAGR", kpi2s: "2026–2035",
    kpi3v: "5%", kpi3l: "Korea Will Writing Rate", kpi3s: "vs USA 46%",
    kpi4v: "$550", kpi4l: "Target Customer LTV", kpi4s: "2.8x vs competitors",
    s01: "01 · Mission & Purpose",
    s01Title: "Why Now, Why EverWill",
    s01Sub: "Death comes to everyone, but few are prepared. EverWill democratizes end-of-life planning.",
    prob1: "95% of Koreans die without a will", prob1s: "Korean Court Admin 2024",
    prob2: "Trillions in annual inheritance disputes", prob2s: "Supreme Court 2024",
    prob3: "Traditional will notarization costs $400+", prob3s: "Korean Notary Assoc. 2024",
    prob4: "7M overseas Koreans — zero multi-jurisdictional service", prob4s: "MOFA 2024",
    prob5: "Zero digital will platforms in Asia", prob5s: "Market Research 2024",
    prob6: "Wills frequently undiscovered after death", prob6s: "MOJ Survey 2023",
    s02: "02 · Market — Global Overview",
    s02Title: "The Perfect Entry Timing",
    s02Sub: "Accelerating aging · Digital transformation · Legislation — three megatrends converging",
    gm1v: "$3.7B", gm1l: "2026 Global Market", gm1s: "Grand View Research 2024",
    gm2v: "$14.1B", gm2l: "2035 Projected Market", gm2s: "Statista 2024",
    gm3v: "9.3%", gm3l: "CAGR", gm3s: "IBISWorld 2024",
    gm4v: "0", gm4l: "Asian Competitors", gm4s: "Market Research 2024",
    chartGlobal: "Global Online Will Platform Market Growth (2022–2035)",
    s03: "03 · Country Market Analysis",
    s03Title: "5-Country Sequential Entry Strategy",
    s03Sub: "Korea → Japan → Greater China → USA → Middle East",
    chartCountry: "TAM / SAM / SOM by Country",
    koTitle: "Korea", koTam: "TAM $4.2B",
    koKey: "5% will rate · Super-aged society 2025 · Zero competitors",
    koTiming: "Launch 2026 Q1",
    jpTitle: "Japan", jpTam: "TAM $18.5B",
    jpKey: "Will digitization law Oct 2025 · ¥60T annual inheritance",
    jpTiming: "Launch 2026 Q3",
    cnTitle: "Greater China (HK+TW)", cnTam: "TAM $8.3B",
    cnKey: "HK HNWI concentration · TW mature digital infra",
    cnTiming: "Launch 2027 Q1",
    usTitle: "USA", usTam: "TAM $42.0B",
    usKey: "1M Korean-Americans untapped · Trust & Will gap",
    usTiming: "Launch 2027 Q3",
    meTitle: "Middle East (GCC 6)", meTam: "TAM $12.7B",
    meKey: "720K HNWI · Sharia inheritance law · Arabic RTL",
    meTiming: "Launch 2028 Q1",
    s04: "04 · Differentiation",
    s04Title: "Why Competitors Cannot Catch Up",
    s04Sub: "7 of 10 innovations are world-firsts that no global competitor has attempted",
    chartRadar: "Competitor Feature Comparison",
    s05: "05 · Vision & Roadmap",
    s05Title: "#1 Global Will Platform by 2030",
    s05Sub: "Starting in Asia, expanding globally — phased growth strategy",
    ph1y: "2026", ph1t: "Korea Launch", ph1k: "MAU 50K · Revenue ₩500M",
    ph2y: "2027", ph2t: "Japan Entry", ph2k: "MAU 200K · Revenue ₩3B",
    ph3y: "2028", ph3t: "China & Middle East", ph3k: "MAU 1M · Revenue ₩20B",
    ph4y: "2030", ph4t: "USA & Global", ph4k: "Global #1 · Revenue ₩100B+",
    s06: "06 · Revenue Model",
    s06Title: "Multi-Layer Revenue for Maximum LTV",
    s06Sub: "Not just subscriptions — recurring revenue across the entire life cycle",
    chartRevenue: "Revenue Forecast by Country & LTV Comparison",
    s07: "07 · Team & Investment Terms",
    s07Title: "An Executing Founder",
    s07Sub: "Solo multi-role: product design, finance, global strategy",
    founderName: "Jeff Ra (라수환)",
    founderRole: "CEO · Founder",
    founderCo: "EverWill Inc. (주식회사 사람)",
    s08: "08 · Contact",
    s08Title: "Looking for the Right Investor",
    s08Sub: "Series A · Target $5–10M · Valuation TBD",
    fName: "Name", fCompany: "Company", fEmail: "Email",
    fAmount: "Investment Amount", fMsg: "Message",
    fSubmit: "Send Inquiry",
    fSuccess: "Received! We will respond within 48 hours.",
    footerRights: "© 2026 EverWill Inc. All rights reserved.",
    footerHome: "Main Site", footerWill: "Write Will", footerTax: "Inheritance Tax",
  },
  ja: {
    navBrand: "EverWill 投資説明書",
    navCta: "投資お問い合わせ",
    heroBadge: "シリーズA 資金調達中 · 2026",
    heroTitle1: "世界初",
    heroTitle2: "デジタル遺言OS",
    heroSub: "遺言作成から死後自動執行まで — アジア市場先行者優位",
    heroCta1: "投資お問い合わせ",
    heroCta2: "市場分析を見る",
    kpi1v: "$3.7B", kpi1l: "グローバル市場規模", kpi1s: "2026年基準",
    kpi2v: "9.3%", kpi2l: "年平均成長率 CAGR", kpi2s: "2026–2035",
    kpi3v: "5%", kpi3l: "韓国遺言作成率", kpi3s: "米国46%比",
    kpi4v: "$550", kpi4l: "目標顧客LTV", kpi4s: "競合比2.8倍",
    s01: "01 · 事業の意義と目的",
    s01Title: "なぜ今、なぜEverWillか",
    s01Sub: "死は誰にでも訪れますが、準備している人はごくわずかです。EverWillはこの不平等を解消します。",
    prob1: "韓国人の95%が遺言なしで死亡", prob1s: "韓国法院行政処 2024",
    prob2: "相続紛争で年間数兆ウォンの損失", prob2s: "大法院 2024",
    prob3: "従来の遺言公証費用 50万ウォン以上", prob3s: "韓国公証人協会 2024",
    prob4: "在外韓国人700万人 — 多国籍相続サービス皆無", prob4s: "外交部 2024",
    prob5: "アジアのデジタル遺言プラットフォーム競合0社", prob5s: "自社調査 2024",
    prob6: "死後に遺言書が発見されないケース多数", prob6s: "法務部 2023",
    s02: "02 · 市場現況 — グローバル統合",
    s02Title: "今が最適な参入タイミング",
    s02Sub: "高齢化加速 · デジタル転換 · 法制化 — 3つのメガトレンドが同時収束",
    gm1v: "$3.7B", gm1l: "2026グローバル市場", gm1s: "Grand View Research 2024",
    gm2v: "$14.1B", gm2l: "2035予測市場", gm2s: "Statista 2024",
    gm3v: "9.3%", gm3l: "CAGR", gm3s: "IBISWorld 2024",
    gm4v: "0社", gm4l: "アジア競合", gm4s: "自社調査 2024",
    chartGlobal: "グローバルオンライン遺言プラットフォーム市場成長 (2022–2035)",
    s03: "03 · 国別市場分析",
    s03Title: "5カ国順次進出戦略",
    s03Sub: "韓国 → 日本 → 中華圏 → 米国 → 中東",
    chartCountry: "国別 TAM / SAM / SOM 分析",
    koTitle: "韓国", koTam: "TAM $4.2B",
    koKey: "遺言作成率5% · 超高齢社会2025 · 競合なし",
    koTiming: "2026 Q1 進出",
    jpTitle: "日本", jpTam: "TAM $18.5B",
    jpKey: "公正証書デジタル化法制化2025.10 · 年間相続60兆円",
    jpTiming: "2026 Q3 進出",
    cnTitle: "中華圏 (香港·台湾)", cnTam: "TAM $8.3B",
    cnKey: "香港HNWI集中 · 台湾デジタルインフラ成熟",
    cnTiming: "2027 Q1 進出",
    usTitle: "米国", usTam: "TAM $42.0B",
    usKey: "在米韓国人100万人未開拓 · Trust & Willの空白",
    usTiming: "2027 Q3 進出",
    meTitle: "中東 (GCC 6カ国)", meTam: "TAM $12.7B",
    meKey: "HNWI 72万人 · シャリア相続法特化 · アラビア語RTL",
    meTiming: "2028 Q1 進出",
    s04: "04 · 差別化と独自性",
    s04Title: "競合が追いつけない理由",
    s04Sub: "10の革新のうち7つは世界中のどの競合も試みていない独創的技術",
    chartRadar: "グローバル競合機能比較分析",
    s05: "05 · ビジョンとロードマップ",
    s05Title: "2030年、グローバル遺言プラットフォーム1位",
    s05Sub: "アジアから始まり全世界へ拡大する段階的成長戦略",
    ph1y: "2026", ph1t: "韓国ローンチ", ph1k: "MAU 5万 · 売上 5億ウォン",
    ph2y: "2027", ph2t: "日本進出", ph2k: "MAU 20万 · 売上 30億ウォン",
    ph3y: "2028", ph3t: "中華圏·中東", ph3k: "MAU 100万 · 売上 200億ウォン",
    ph4y: "2030", ph4t: "米国·グローバル", ph4k: "グローバル1位 · 売上 1000億ウォン+",
    s06: "06 · 収益モデル",
    s06Title: "多層収益構造でLTV最大化",
    s06Sub: "単純なサブスクではなく、ライフサイクル全体にわたる反復収益モデル",
    chartRevenue: "国別売上予測 & LTV比較",
    s07: "07 · チームと投資条件",
    s07Title: "実行する創業者",
    s07Sub: "1人マルチ役割：製品企画·デザイン·財務を直接担当",
    founderName: "ラ・スファン (Jeff Ra)",
    founderRole: "代表取締役 · 創業者",
    founderCo: "株式会社サラム (EverWill Inc.)",
    s08: "08 · 投資お問い合わせ",
    s08Title: "共に創る投資家を求めています",
    s08Sub: "シリーズA · 目標調達額 $5~10M · 企業価値協議",
    fName: "お名前", fCompany: "会社名", fEmail: "メール",
    fAmount: "投資希望金額", fMsg: "お問い合わせ内容",
    fSubmit: "投資お問い合わせを送る",
    fSuccess: "受け付けました。48時間以内にご連絡いたします。",
    footerRights: "© 2026 EverWill Inc. All rights reserved.",
    footerHome: "メインサイト", footerWill: "遺言書作成", footerTax: "相続税計算",
  },
  zh: {
    navBrand: "EverWill 投资说明书",
    navCta: "联系投资",
    heroBadge: "A轮融资中 · 2026",
    heroTitle1: "全球首创",
    heroTitle2: "数字遗嘱OS",
    heroSub: "从遗嘱起草到身后自动执行 — 亚洲市场先发优势",
    heroCta1: "联系我们",
    heroCta2: "查看市场分析",
    kpi1v: "$3.7B", kpi1l: "全球市场规模", kpi1s: "2026年估计",
    kpi2v: "9.3%", kpi2l: "年均增长率 CAGR", kpi2s: "2026–2035",
    kpi3v: "5%", kpi3l: "韩国遗嘱立写率", kpi3s: "对比美国46%",
    kpi4v: "$550", kpi4l: "目标客户LTV", kpi4s: "竞争对手的2.8倍",
    s01: "01 · 商业意义与目的",
    s01Title: "为什么是现在，为什么是EverWill",
    s01Sub: "死亡对每个人都会到来，但有准备的人极少。EverWill消除这种不平等。",
    prob1: "95%的韩国人没有遗嘱就去世", prob1s: "韩国法院行政处 2024",
    prob2: "遗产纠纷每年造成数万亿韩元损失", prob2s: "最高法院 2024",
    prob3: "传统遗嘱公证费用50万韩元以上", prob3s: "韩国公证人协会 2024",
    prob4: "700万海外韩国人 — 无跨国继承服务", prob4s: "外交部 2024",
    prob5: "亚洲数字遗嘱平台竞争对手为零", prob5s: "自主调查 2024",
    prob6: "死后遗嘱未被发现的情况频发", prob6s: "法务部 2023",
    s02: "02 · 市场现状 — 全球综合",
    s02Title: "现在是最佳进入时机",
    s02Sub: "老龄化加速 · 数字化转型 · 立法 — 三大趋势同时汇聚",
    gm1v: "$3.7B", gm1l: "2026全球市场", gm1s: "Grand View Research 2024",
    gm2v: "$14.1B", gm2l: "2035预测市场", gm2s: "Statista 2024",
    gm3v: "9.3%", gm3l: "CAGR", gm3s: "IBISWorld 2024",
    gm4v: "0家", gm4l: "亚洲竞争对手", gm4s: "自主调查 2024",
    chartGlobal: "全球在线遗嘱平台市场增长 (2022–2035)",
    s03: "03 · 各国市场分析",
    s03Title: "5国顺序进入战略",
    s03Sub: "韩国 → 日本 → 大中华区 → 美国 → 中东",
    chartCountry: "各国 TAM / SAM / SOM 分析",
    koTitle: "韩国", koTam: "TAM $4.2B",
    koKey: "遗嘱立写率5% · 超老龄社会2025 · 无竞争对手",
    koTiming: "2026 Q1 进入",
    jpTitle: "日本", jpTam: "TAM $18.5B",
    jpKey: "公证书数字化立法2025.10 · 年继承额60万亿日元",
    jpTiming: "2026 Q3 进入",
    cnTitle: "大中华区 (香港·台湾)", cnTam: "TAM $8.3B",
    cnKey: "香港HNWI集中 · 台湾数字基础设施成熟",
    cnTiming: "2027 Q1 进入",
    usTitle: "美国", usTam: "TAM $42.0B",
    usKey: "100万韩裔美国人未开发 · Trust & Will空白",
    usTiming: "2027 Q3 进入",
    meTitle: "中东 (GCC 6国)", meTam: "TAM $12.7B",
    meKey: "HNWI 72万人 · 伊斯兰继承法专项 · 阿拉伯语RTL",
    meTiming: "2028 Q1 进入",
    s04: "04 · 差异化与独立性",
    s04Title: "竞争对手无法追赶的原因",
    s04Sub: "10项创新中7项是全球任何竞争对手都未尝试过的独创技术",
    chartRadar: "全球竞争对手功能比较分析",
    s05: "05 · 愿景与路线图",
    s05Title: "2030年，全球遗嘱平台第一",
    s05Sub: "从亚洲出发，向全球扩张的阶段性增长战略",
    ph1y: "2026", ph1t: "韩国上线", ph1k: "MAU 5万 · 营收5亿韩元",
    ph2y: "2027", ph2t: "进入日本", ph2k: "MAU 20万 · 营收30亿韩元",
    ph3y: "2028", ph3t: "大中华区·中东", ph3k: "MAU 100万 · 营收200亿韩元",
    ph4y: "2030", ph4t: "美国·全球", ph4k: "全球第一 · 营收1000亿韩元+",
    s06: "06 · 收益模式",
    s06Title: "多层收益结构最大化LTV",
    s06Sub: "不仅仅是订阅 — 覆盖整个生命周期的重复收益模式",
    chartRevenue: "各国营收预测 & LTV比较",
    s07: "07 · 团队与投资条件",
    s07Title: "执行力强的创始人",
    s07Sub: "一人多角色：产品规划·设计·财务亲自负责",
    founderName: "罗秀焕 (Jeff Ra)",
    founderRole: "首席执行官 · 创始人",
    founderCo: "株式会社EverWill (EverWill Inc.)",
    s08: "08 · 投资咨询",
    s08Title: "寻找志同道合的投资者",
    s08Sub: "A轮 · 目标融资额 $5~10M · 估值协商",
    fName: "姓名", fCompany: "公司名", fEmail: "邮箱",
    fAmount: "投资意向金额", fMsg: "咨询内容",
    fSubmit: "发送投资咨询",
    fSuccess: "已收到！我们将在48小时内与您联系。",
    footerRights: "© 2026 EverWill Inc. All rights reserved.",
    footerHome: "主网站", footerWill: "立遗嘱", footerTax: "遗产税计算",
  },
  ar: {
    navBrand: "EverWill - نشرة المستثمرين",
    navCta: "تواصل معنا",
    heroBadge: "جولة التمويل A · 2026",
    heroTitle1: "الأول عالمياً",
    heroTitle2: "نظام الوصية الرقمية",
    heroSub: "من كتابة الوصية إلى التنفيذ التلقائي بعد الوفاة — فرصة ريادة السوق الآسيوية",
    heroCta1: "تواصل للاستثمار",
    heroCta2: "عرض تحليل السوق",
    kpi1v: "$3.7B", kpi1l: "حجم السوق العالمي", kpi1s: "تقدير 2026",
    kpi2v: "9.3%", kpi2l: "معدل النمو السنوي", kpi2s: "2026–2035",
    kpi3v: "5%", kpi3l: "معدل كتابة الوصايا في كوريا", kpi3s: "مقارنة بـ 46% في أمريكا",
    kpi4v: "$550", kpi4l: "قيمة العميل المستهدفة LTV", kpi4s: "2.8 ضعف المنافسين",
    s01: "01 · الرسالة والهدف",
    s01Title: "لماذا الآن؟ لماذا EverWill؟",
    s01Sub: "الموت يأتي للجميع، لكن القليلين يستعدون له. EverWill يزيل هذا التفاوت.",
    prob1: "95% من الكوريين يموتون بدون وصية", prob1s: "إدارة المحاكم الكورية 2024",
    prob2: "خسائر تريليونات من النزاعات الإرثية سنوياً", prob2s: "المحكمة العليا 2024",
    prob3: "تكلفة توثيق الوصية التقليدية 400 دولار+", prob3s: "جمعية كتّاب العدل 2024",
    prob4: "7 ملايين كوري في الخارج — لا خدمة إرث متعدد الجنسيات", prob4s: "وزارة الخارجية 2024",
    prob5: "صفر منافسين في منصات الوصايا الرقمية الآسيوية", prob5s: "بحث السوق 2024",
    prob6: "حالات كثيرة لعدم العثور على الوصية بعد الوفاة", prob6s: "وزارة العدل 2023",
    s02: "02 · السوق — نظرة عالمية شاملة",
    s02Title: "التوقيت المثالي للدخول",
    s02Sub: "شيخوخة متسارعة · تحول رقمي · تشريعات — ثلاثة اتجاهات كبرى تتقاطع",
    gm1v: "$3.7B", gm1l: "السوق العالمي 2026", gm1s: "Grand View Research 2024",
    gm2v: "$14.1B", gm2l: "السوق المتوقع 2035", gm2s: "Statista 2024",
    gm3v: "9.3%", gm3l: "CAGR", gm3s: "IBISWorld 2024",
    gm4v: "0", gm4l: "منافسون آسيويون", gm4s: "بحث السوق 2024",
    chartGlobal: "نمو سوق منصات الوصايا الرقمية العالمية (2022–2035)",
    s03: "03 · تحليل السوق حسب الدولة",
    s03Title: "استراتيجية الدخول التسلسلي لـ 5 دول",
    s03Sub: "كوريا → اليابان → الصين الكبرى → أمريكا → الشرق الأوسط",
    chartCountry: "تحليل TAM / SAM / SOM حسب الدولة",
    koTitle: "كوريا", koTam: "TAM $4.2B",
    koKey: "معدل وصايا 5% · مجتمع شائخ جداً 2025 · لا منافسين",
    koTiming: "الإطلاق 2026 Q1",
    jpTitle: "اليابان", jpTam: "TAM $18.5B",
    jpKey: "قانون رقمنة الوصايا أكتوبر 2025 · ميراث سنوي 60 تريليون ين",
    jpTiming: "الإطلاق 2026 Q3",
    cnTitle: "الصين الكبرى (هونغ كونغ·تايوان)", cnTam: "TAM $8.3B",
    cnKey: "تركز HNWI في هونغ كونغ · بنية رقمية ناضجة في تايوان",
    cnTiming: "الإطلاق 2027 Q1",
    usTitle: "الولايات المتحدة", usTam: "TAM $42.0B",
    usKey: "مليون كوري أمريكي غير مستغل · فجوة Trust & Will",
    usTiming: "الإطلاق 2027 Q3",
    meTitle: "الشرق الأوسط (دول الخليج الست)", meTam: "TAM $12.7B",
    meKey: "720 ألف HNWI · قانون الإرث الشرعي · عربي RTL",
    meTiming: "الإطلاق 2028 Q1",
    s04: "04 · التميز والاستقلالية",
    s04Title: "لماذا لا يستطيع المنافسون اللحاق",
    s04Sub: "7 من أصل 10 ابتكارات هي الأولى عالمياً لم يجرب أي منافس أياً منها",
    chartRadar: "تحليل مقارنة ميزات المنافسين العالميين",
    s05: "05 · الرؤية وخارطة الطريق",
    s05Title: "المنصة الأولى عالمياً للوصايا بحلول 2030",
    s05Sub: "البداية من آسيا والتوسع عالمياً — استراتيجية نمو مرحلية",
    ph1y: "2026", ph1t: "إطلاق كوريا", ph1k: "MAU 50K · إيرادات 500M وون",
    ph2y: "2027", ph2t: "دخول اليابان", ph2k: "MAU 200K · إيرادات 3B وون",
    ph3y: "2028", ph3t: "الصين الكبرى والشرق الأوسط", ph3k: "MAU 1M · إيرادات 20B وون",
    ph4y: "2030", ph4t: "أمريكا وعالمياً", ph4k: "الأول عالمياً · إيرادات 100B وون+",
    s06: "06 · نموذج الإيرادات",
    s06Title: "هيكل إيرادات متعدد الطبقات لتعظيم LTV",
    s06Sub: "ليس مجرد اشتراك — نموذج إيرادات متكررة عبر دورة الحياة الكاملة",
    chartRevenue: "توقعات الإيرادات حسب الدولة ومقارنة LTV",
    s07: "07 · الفريق وشروط الاستثمار",
    s07Title: "مؤسس منفذ",
    s07Sub: "دور متعدد: تخطيط المنتج والتصميم والمالية مباشرة",
    founderName: "جيف لاه (라수환)",
    founderRole: "الرئيس التنفيذي · المؤسس",
    founderCo: "شركة EverWill (주식회사 사람)",
    s08: "08 · تواصل للاستثمار",
    s08Title: "نبحث عن المستثمر المناسب",
    s08Sub: "الجولة A · الهدف $5~10M · التقييم قابل للتفاوض",
    fName: "الاسم", fCompany: "الشركة", fEmail: "البريد الإلكتروني",
    fAmount: "مبلغ الاستثمار المقترح", fMsg: "رسالتك",
    fSubmit: "إرسال استفسار الاستثمار",
    fSuccess: "تم الاستلام! سنتواصل معك خلال 48 ساعة.",
    footerRights: "© 2026 EverWill Inc. جميع الحقوق محفوظة.",
    footerHome: "الموقع الرئيسي", footerWill: "كتابة الوصية", footerTax: "ضريبة الميراث",
  },
  ru: {
    navBrand: "EverWill — Инвестиционный меморандум",
    navCta: "Связаться",
    heroBadge: "Раунд A · 2026",
    heroTitle1: "Первая в мире",
    heroTitle2: "Цифровая ОС для завещаний",
    heroSub: "От составления завещания до автоматического посмертного исполнения — преимущество первопроходца на азиатском рынке",
    heroCta1: "Связаться с нами",
    heroCta2: "Анализ рынка",
    kpi1v: "$3.7B", kpi1l: "Объём мирового рынка", kpi1s: "Оценка 2026",
    kpi2v: "9.3%", kpi2l: "CAGR", kpi2s: "2026–2035",
    kpi3v: "5%", kpi3l: "Доля составления завещаний в Корее", kpi3s: "vs 46% в США",
    kpi4v: "$550", kpi4l: "Целевой LTV клиента", kpi4s: "В 2.8 раза выше конкурентов",
    s01: "01 · Миссия и цель",
    s01Title: "Почему сейчас и почему EverWill",
    s01Sub: "Смерть приходит ко всем, но готовых единицы. EverWill устраняет это неравенство.",
    prob1: "95% корейцев умирают без завещания", prob1s: "Судебная администрация Кореи 2024",
    prob2: "Триллионы вон в год теряются в наследственных спорах", prob2s: "Верховный суд 2024",
    prob3: "Традиционное нотариальное завещание стоит от 400$", prob3s: "Ассоциация нотариусов 2024",
    prob4: "7 млн корейцев за рубежом — нет сервиса для международного наследования", prob4s: "МИД 2024",
    prob5: "Ноль конкурентов на рынке цифровых завещаний в Азии", prob5s: "Собственное исследование 2024",
    prob6: "Завещания часто не обнаруживаются после смерти", prob6s: "Министерство юстиции 2023",
    s02: "02 · Рынок — Глобальный обзор",
    s02Title: "Идеальный момент для входа",
    s02Sub: "Ускорение старения · Цифровая трансформация · Законодательство — три мегатренда сходятся",
    gm1v: "$3.7B", gm1l: "Мировой рынок 2026", gm1s: "Grand View Research 2024",
    gm2v: "$14.1B", gm2l: "Прогноз рынка 2035", gm2s: "Statista 2024",
    gm3v: "9.3%", gm3l: "CAGR", gm3s: "IBISWorld 2024",
    gm4v: "0", gm4l: "Азиатских конкурентов", gm4s: "Собственное исследование 2024",
    chartGlobal: "Рост мирового рынка онлайн-завещаний (2022–2035)",
    s03: "03 · Анализ рынка по странам",
    s03Title: "Стратегия последовательного выхода на 5 рынков",
    s03Sub: "Корея → Япония → Большой Китай → США → Ближний Восток",
    chartCountry: "TAM / SAM / SOM по странам",
    koTitle: "Корея", koTam: "TAM $4.2B",
    koKey: "Доля завещаний 5% · Сверхстарое общество 2025 · Нет конкурентов",
    koTiming: "Запуск 2026 Q1",
    jpTitle: "Япония", jpTam: "TAM $18.5B",
    jpKey: "Закон о цифровизации нотариата окт. 2025 · Наследование 60 трлн иен/год",
    jpTiming: "Запуск 2026 Q3",
    cnTitle: "Большой Китай (Гонконг·Тайвань)", cnTam: "TAM $8.3B",
    cnKey: "Концентрация HNWI в Гонконге · Зрелая цифровая инфраструктура Тайваня",
    cnTiming: "Запуск 2027 Q1",
    usTitle: "США", usTam: "TAM $42.0B",
    usKey: "1 млн корейских американцев — неосвоенная ниша · Пробел Trust & Will",
    usTiming: "Запуск 2027 Q3",
    meTitle: "Ближний Восток (6 стран ССЗ)", meTam: "TAM $12.7B",
    meKey: "720 тыс. HNWI · Шариатское наследственное право · Арабский RTL",
    meTiming: "Запуск 2028 Q1",
    s04: "04 · Дифференциация",
    s04Title: "Почему конкуренты не могут догнать",
    s04Sub: "7 из 10 инноваций — мировые первенства, которые ни один конкурент не пробовал",
    chartRadar: "Сравнительный анализ функций глобальных конкурентов",
    s05: "05 · Видение и дорожная карта",
    s05Title: "Платформа завещаний №1 в мире к 2030 году",
    s05Sub: "Начиная с Азии, расширяясь по всему миру — поэтапная стратегия роста",
    ph1y: "2026", ph1t: "Запуск в Корее", ph1k: "MAU 50K · Выручка 500M вон",
    ph2y: "2027", ph2t: "Выход в Японию", ph2k: "MAU 200K · Выручка 3B вон",
    ph3y: "2028", ph3t: "Китай и Ближний Восток", ph3k: "MAU 1M · Выручка 20B вон",
    ph4y: "2030", ph4t: "США и весь мир", ph4k: "Мировой лидер · Выручка 100B+ вон",
    s06: "06 · Модель доходов",
    s06Title: "Многоуровневая структура доходов для максимизации LTV",
    s06Sub: "Не просто подписка — повторяющиеся доходы на протяжении всего жизненного цикла",
    chartRevenue: "Прогноз выручки по странам и сравнение LTV",
    s07: "07 · Команда и условия инвестирования",
    s07Title: "Исполняющий основатель",
    s07Sub: "Один человек — несколько ролей: продукт, дизайн, финансы",
    founderName: "Джефф Ла (라수환)",
    founderRole: "Генеральный директор · Основатель",
    founderCo: "EverWill Inc. (주식회사 사람)",
    s08: "08 · Контакт для инвесторов",
    s08Title: "Ищем правильного инвестора",
    s08Sub: "Раунд A · Цель $5–10M · Оценка по договорённости",
    fName: "Имя", fCompany: "Компания", fEmail: "Email",
    fAmount: "Желаемая сумма инвестиций", fMsg: "Сообщение",
    fSubmit: "Отправить запрос",
    fSuccess: "Получено! Мы свяжемся с вами в течение 48 часов.",
    footerRights: "© 2026 EverWill Inc. Все права защищены.",
    footerHome: "Главный сайт", footerWill: "Написать завещание", footerTax: "Налог на наследство",
  },
};

// ─── 애니메이션 헬퍼 ───────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── 섹션 레이블 ──────────────────────────────────────────────────
function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-0.5 bg-[#C9A961]" />
      <span className="text-xs font-bold tracking-widest uppercase text-[#C9A961]">{text}</span>
    </div>
  );
}

// ─── 차트 카드 ────────────────────────────────────────────────────
function ChartCard({ src, title, note }: { src: string; title: string; note?: string }) {
  return (
    <FadeIn className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-2">
        <p className="text-sm font-semibold text-[#1F3864]">{title}</p>
      </div>
      <img src={src} alt={title} className="w-full object-contain" />
      {note && <p className="px-6 pb-4 text-xs text-gray-400 italic">{note}</p>}
    </FadeIn>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────
export default function InvestPage() {
  const [lang, setLang] = useState<LangCode>("ko");
  const [langOpen, setLangOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", amount: "", message: "" });

  const t = T[lang];
  const isRtl = lang === "ar";
  const currentLang = LANGS.find(l => l.code === lang)!;

  const PROBLEMS = [
    { icon: "📋", stat: t.prob1, src: t.prob1s },
    { icon: "⚖️", stat: t.prob2, src: t.prob2s },
    { icon: "💰", stat: t.prob3, src: t.prob3s },
    { icon: "🌏", stat: t.prob4, src: t.prob4s },
    { icon: "📱", stat: t.prob5, src: t.prob5s },
    { icon: "🔍", stat: t.prob6, src: t.prob6s },
  ];

  const INNOVATIONS_KO = [
    { no: "01", title: "NFC 인증 카드 시스템", desc: "MedicAlert + AirTag + 유언 인증 결합. 스테인레스·티타늄 5종 라인업. 착용 자체가 마케팅.", badge: "세계 최초" },
    { no: "02", title: "다층 안심 확인", desc: "가족 신고 + 정부 DB + 정기 안심 확인 서비스 + 응급 발견자. 2개 채널 교차 검증 후 집행 지원.", badge: "세계 최초" },
    { no: "03", title: "변호사 마켓플레이스", desc: "생전 0%, 사후 100% 등장. 진짜 필요한 순간에만 매칭. 플랫폼 수수료 15-25%.", badge: "세계 최초" },
    { no: "04", title: "상속자 직접 등록", desc: "사망 시 전 세계 상속자 자동 알림. 현지 언어·시간대 맞춤. 72시간 이의제기 후 공개.", badge: "세계 최초" },
    { no: "05", title: "체크박스 17분 완성", desc: "AI가 체크박스 → 법률 문장 자동 변환. 유류분 실시간 검증. 상속세 자동 계산." },
    { no: "06", title: "영상 유언 + 미래 전달", desc: "손녀 성인식, 아들 결혼식 날 자동 전송. 평생 보관. 수십 년 후에도 재생 보장.", badge: "세계 최초" },
    { no: "07", title: "자필 유언 스캔 인증", desc: "AI 형식 검증 + 위조 탐지 + 분산 암호화 무결성 기록." },
    { no: "08", title: "재인증 체계 (LTV 28배)", desc: "결혼·출산·이사·자산 변동마다 재인증 유도. 최초 ₩168,000 → 수정 5회 무료 → 6회부터 ₩15,000.", badge: "세계 최초" },
    { no: "09", title: "글로벌 멀티관할권", desc: "한국+미국+일본 자산 동시 관리. 각국 법률 자동 적용. 크로스보더 상속 자동 조율.", badge: "세계 최초" },
    { no: "10", title: "7개 언어 + 아랍어 RTL", desc: "한국어·영어·일본어·중국어·독일어·스페인어·아랍어. 샤리아 상속법 자동 적용." },
  ];

  const COUNTRIES = [
    { flag: "🇰🇷", title: t.koTitle, tam: t.koTam, key: t.koKey, timing: t.koTiming, color: "#1F3864" },
    { flag: "🇯🇵", title: t.jpTitle, tam: t.jpTam, key: t.jpKey, timing: t.jpTiming, color: "#C9A961" },
    { flag: "🇨🇳", title: t.cnTitle, tam: t.cnTam, key: t.cnKey, timing: t.cnTiming, color: "#3B82F6" },
    { flag: "🇺🇸", title: t.usTitle, tam: t.usTam, key: t.usKey, timing: t.usTiming, color: "#8B5CF6" },
    { flag: "🇸🇦", title: t.meTitle, tam: t.meTam, key: t.meKey, timing: t.meTiming, color: "#F59E0B" },
  ];

  const PHASES = [
    { year: t.ph1y, title: t.ph1t, kpi: t.ph1k, color: "#1F3864" },
    { year: t.ph2y, title: t.ph2t, kpi: t.ph2k, color: "#C9A961" },
    { year: t.ph3y, title: t.ph3t, kpi: t.ph3k, color: "#3B82F6" },
    { year: t.ph4y, title: t.ph4t, kpi: t.ph4k, color: "#16A34A" },
  ];

  const REVENUE_STREAMS = [
    { icon: "✍️", title: lang === "ko" ? "AI 유언장 작성" : "AI Will Drafting", amount: lang === "ko" ? "무료" : "Free", type: lang === "ko" ? "진입장벽 제거" : "Remove barriers" },
    { icon: "🔐", title: lang === "ko" ? "최초 전자 인증" : "First Certification", amount: "₩168,000 / $79", type: lang === "ko" ? "핵심 수익" : "Core revenue" },
    { icon: "🔄", title: lang === "ko" ? "재인증 (수정)" : "Re-certification", amount: "₩15,000 / $15", type: lang === "ko" ? "반복 수익" : "Recurring" },
    { icon: "🎬", title: lang === "ko" ? "영상 유언" : "Video Will", amount: "+₩29,000 / +$29", type: lang === "ko" ? "옵션 수익" : "Optional" },
    { icon: "🏅", title: lang === "ko" ? "Badge (5종)" : "Badge (5 types)", amount: "₩49K~299K", type: lang === "ko" ? "하드웨어 수익" : "Hardware" },
    { icon: "⚖️", title: lang === "ko" ? "변호사 사후 집행" : "Lawyer Execution", amount: "보수의 15-25%", type: lang === "ko" ? "플랫폼 수수료" : "Platform fee" },
    { icon: "📅", title: lang === "ko" ? "연 멤버십" : "Annual Membership", amount: "₩29,000/yr", type: lang === "ko" ? "구독 수익" : "Subscription" },
  ];

  return (
    <div dir={isRtl ? "rtl" : "ltr"}
      style={{ fontFamily: isRtl ? "'Cairo', 'Tajawal', sans-serif" : lang === "ja" ? "'Noto Sans JP', sans-serif" : lang === "zh" ? "'Noto Sans SC', sans-serif" : lang === "ru" ? "'Inter', sans-serif" : "'Pretendard', 'Inter', sans-serif", background: "#F8F9FC", color: "#1A1A1A", minHeight: "100vh" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* 브랜드 */}
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#1F3864" }}>S</span>
              <span className="font-bold text-sm text-[#1F3864] hidden sm:block">{t.navBrand}</span>
              <span className="font-bold text-sm text-[#1F3864] sm:hidden">EverWill IR</span>
            </span>
          </Link>

          {/* 데스크탑 앵커 링크 */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-gray-500">
            {["s01","s02","s03","s04","s05","s06"].map((id, i) => (
              <a key={id} href={`#${id}`}
                className="hover:text-[#1F3864] transition-colors">
                {["사업의의","시장현황","국가별","차별성","비전","수익"][i]}
              </a>
            ))}
          </div>

          {/* 우측: 언어 + CTA */}
          <div className="flex items-center gap-2">
            {/* 언어 드롭다운 */}
            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">
                <span className="text-lg leading-none">{currentLang.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50"
                    style={{ minWidth: 150 }}>
                    {LANGS.map(l => (
                      <button key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        style={{ color: lang === l.code ? "#1F3864" : "#374151", fontWeight: lang === l.code ? 600 : 400 }}>
                        <span className="text-base">{l.flag}</span>
                        <span>{l.label}</span>
                        {lang === l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A961]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#s08"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "#C9A961" }}>
              {t.navCta}
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="bg-[#1F3864] text-white py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(201,169,97,0.2)", color: "#C9A961", border: "1px solid rgba(201,169,97,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961] animate-pulse" />
              {t.heroBadge}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
              <span className="text-white">{t.heroTitle1}</span><br />
              <span style={{ color: "#C9A961" }}>{t.heroTitle2}</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg text-white/70 mb-10 max-w-2xl">{t.heroSub}</p>
          </FadeIn>

          {/* KPI 카드 */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { v: t.kpi1v, l: t.kpi1l, s: t.kpi1s },
                { v: t.kpi2v, l: t.kpi2l, s: t.kpi2s },
                { v: t.kpi3v, l: t.kpi3l, s: t.kpi3s },
                { v: t.kpi4v, l: t.kpi4l, s: t.kpi4s },
              ].map((k, i) => (
                <div key={i} className="rounded-xl p-4 border border-white/10"
                  style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="text-2xl md:text-3xl font-black text-[#C9A961]">{k.v}</div>
                  <div className="text-xs font-semibold text-white mt-1">{k.l}</div>
                  <div className="text-xs text-white/40 mt-0.5">{k.s}</div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="flex flex-wrap gap-3">
              <a href="#s08"
                className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                style={{ background: "#C9A961", color: "#1F3864" }}>
                {t.heroCta1} →
              </a>
              <a href="#s02"
                className="px-6 py-3 rounded-xl font-bold text-sm border border-white/20 text-white hover:bg-white/10 transition-colors">
                {t.heroCta2}
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 01 사업 의의 ────────────────────────────────────────────── */}
      <section id="s01" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionLabel text={t.s01} />
            <h2 className="text-3xl md:text-4xl font-black text-[#1F3864] mb-3">{t.s01Title}</h2>
            <p className="text-gray-500 mb-12 max-w-2xl">{t.s01Sub}</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROBLEMS.map((p, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div className="rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow bg-white">
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <p className="font-semibold text-[#1F3864] text-sm leading-snug mb-2">{p.stat}</p>
                  <p className="text-xs text-gray-400 italic">{p.src}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 10가지 혁신 */}
          <div className="mt-16">
            <FadeIn>
              <h3 className="text-2xl font-black text-[#1F3864] mb-2">{t.s04Title || "10가지 세계 최초 혁신"}</h3>
              <p className="text-gray-500 mb-8 text-sm">{t.s04Sub || ""}</p>
            </FadeIn>
            <div className="grid md:grid-cols-2 gap-4">
              {INNOVATIONS_KO.map((item, i) => (
                <FadeIn key={i} delay={i * 0.04}>
                  <div className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-sm transition-shadow">
                    <span className="text-xs font-black text-[#C9A961] mt-0.5 shrink-0 w-6">{item.no}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-[#1F3864]">{item.title}</span>
                        {item.badge && (
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: "rgba(201,169,97,0.15)", color: "#C9A961" }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 글로벌 시장 ──────────────────────────────────────────── */}
      <section id="s02" className="py-20" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionLabel text={t.s02} />
            <h2 className="text-3xl md:text-4xl font-black text-[#1F3864] mb-3">{t.s02Title}</h2>
            <p className="text-gray-500 mb-10 max-w-2xl">{t.s02Sub}</p>
          </FadeIn>

          {/* 글로벌 KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { v: t.gm1v, l: t.gm1l, s: t.gm1s },
              { v: t.gm2v, l: t.gm2l, s: t.gm2s },
              { v: t.gm3v, l: t.gm3l, s: t.gm3s },
              { v: t.gm4v, l: t.gm4l, s: t.gm4s },
            ].map((k, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="text-2xl font-black text-[#1F3864]">{k.v}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-1">{k.l}</div>
                  <div className="text-xs text-gray-400 mt-0.5 italic">{k.s}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <ChartCard src={CHARTS.globalGrowth} title={t.chartGlobal}
            note="Source: Grand View Research, Statista, IBISWorld 2024" />
        </div>
      </section>

      {/* ── 03 국가별 시장 ──────────────────────────────────────────── */}
      <section id="s03" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionLabel text={t.s03} />
            <h2 className="text-3xl md:text-4xl font-black text-[#1F3864] mb-3">{t.s03Title}</h2>
            <p className="text-gray-500 mb-10 max-w-2xl">{t.s03Sub}</p>
          </FadeIn>

          {/* 국가 카드 */}
          <div className="grid md:grid-cols-5 gap-4 mb-10">
            {COUNTRIES.map((c, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="rounded-2xl border-2 p-4 bg-white hover:shadow-md transition-shadow"
                  style={{ borderColor: c.color + "33" }}>
                  <div className="text-3xl mb-2">{c.flag}</div>
                  <div className="font-black text-sm text-[#1F3864] mb-1">{c.title}</div>
                  <div className="text-xs font-bold mb-2" style={{ color: c.color }}>{c.tam}</div>
                  <p className="text-xs text-gray-500 leading-snug mb-3">{c.key}</p>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: c.color + "15", color: c.color }}>
                    {c.timing}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>

          <ChartCard src={CHARTS.countryTam} title={t.chartCountry}
            note="Source: Statistics Korea, Japan MOJ, IBISWorld, Capgemini 2024" />

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <ChartCard src={CHARTS.koreaDetail} title="🇰🇷 Korea — Aging + Will Writing Rate"
              note="Source: Statistics Korea, FSS, Korean Court Admin 2024" />
            <ChartCard src={CHARTS.japanDetail} title="🇯🇵 Japan — Inheritance Scale + Digital Will Market"
              note="Source: Japan NTA, MOJ Digital Will Plan 2024" />
          </div>
          <div className="mt-6">
            <ChartCard src={CHARTS.usMideast} title="🇺🇸 USA + 🇸🇦 Middle East — Market Analysis"
              note="Source: IBISWorld, US Census Bureau, Capgemini World Wealth Report 2024" />
          </div>
        </div>
      </section>

      {/* ── 04 차별성 ───────────────────────────────────────────────── */}
      <section id="s04" className="py-20" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionLabel text={t.s04} />
            <h2 className="text-3xl md:text-4xl font-black text-[#1F3864] mb-3">{t.s04Title}</h2>
            <p className="text-gray-500 mb-10 max-w-2xl">{t.s04Sub}</p>
          </FadeIn>
          <ChartCard src={CHARTS.radar} title={t.chartRadar}
            note="Source: Company research, competitor public disclosures 2024" />
        </div>
      </section>

      {/* ── 05 비전 & 로드맵 ────────────────────────────────────────── */}
      <section id="s05" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionLabel text={t.s05} />
            <h2 className="text-3xl md:text-4xl font-black text-[#1F3864] mb-3">{t.s05Title}</h2>
            <p className="text-gray-500 mb-12 max-w-2xl">{t.s05Sub}</p>
          </FadeIn>

          <div className="grid md:grid-cols-4 gap-5">
            {PHASES.map((ph, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="rounded-2xl p-5 text-white relative overflow-hidden"
                  style={{ background: ph.color }}>
                  <div className="text-3xl font-black opacity-20 absolute top-3 right-4">{ph.year}</div>
                  <div className="text-xs font-bold opacity-60 mb-1">Phase {i+1}</div>
                  <div className="text-lg font-black mb-3">{ph.title}</div>
                  <div className="text-xs opacity-80 leading-relaxed">{ph.kpi}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 06 수익 모델 ────────────────────────────────────────────── */}
      <section id="s06" className="py-20" style={{ background: "#F8F9FC" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionLabel text={t.s06} />
            <h2 className="text-3xl md:text-4xl font-black text-[#1F3864] mb-3">{t.s06Title}</h2>
            <p className="text-gray-500 mb-10 max-w-2xl">{t.s06Sub}</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {REVENUE_STREAMS.map((r, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{r.icon}</div>
                  <div className="font-bold text-sm text-[#1F3864] mb-1">{r.title}</div>
                  <div className="text-base font-black text-[#C9A961] mb-1">{r.amount}</div>
                  <div className="text-xs text-gray-400">{r.type}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          <ChartCard src={CHARTS.revenueLtv} title={t.chartRevenue}
            note="Source: Farewill Annual Report 2023, Trust & Will Investor Deck 2024" />
        </div>
      </section>

      {/* ── 07 팀 ──────────────────────────────────────────────────── */}
      <section id="s07" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionLabel text={t.s07} />
            <h2 className="text-3xl md:text-4xl font-black text-[#1F3864] mb-3">{t.s07Title}</h2>
            <p className="text-gray-500 mb-10 max-w-2xl">{t.s07Sub}</p>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8">
            <FadeIn>
              <div className="bg-[#1F3864] rounded-2xl p-6 text-white">
                <div className="w-16 h-16 rounded-2xl bg-[#C9A961] flex items-center justify-center text-2xl font-black text-[#1F3864] mb-4">J</div>
                <div className="text-xl font-black mb-1">{t.founderName}</div>
                <div className="text-sm text-white/60 mb-1">{t.founderRole}</div>
                <div className="text-xs text-white/40 mb-4">{t.founderCo}</div>
                <div className="grid grid-cols-2 gap-2">
                  {["제품기획 · 디자인", "회계 · 재무", "글로벌 전략", "디자이너 출신"].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961]" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="rounded-2xl border border-gray-100 p-6 bg-white shadow-sm">
                <h4 className="font-black text-[#1F3864] mb-4 text-sm">
                  {lang === "ko" ? "투자금 사용 계획" : "Use of Funds"}
                </h4>
                {[
                  { label: lang === "ko" ? "기술 개발 (CTO + 개발팀)" : "Tech Development", pct: 40, color: "#1F3864" },
                  { label: lang === "ko" ? "마케팅 & 사용자 획득" : "Marketing & User Acquisition", pct: 25, color: "#C9A961" },
                  { label: lang === "ko" ? "법률 & 컴플라이언스" : "Legal & Compliance", pct: 15, color: "#3B82F6" },
                  { label: lang === "ko" ? "글로벌 확장 (일본·중동)" : "Global Expansion", pct: 12, color: "#8B5CF6" },
                  { label: lang === "ko" ? "운영 & 기타" : "Operations & Other", pct: 8, color: "#6B7280" },
                ].map((f, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{f.label}</span>
                      <span className="font-bold" style={{ color: f.color }}>{f.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full"
                        style={{ background: f.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${f.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.1 }} />
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 08 투자 문의 ────────────────────────────────────────────── */}
      <section id="s08" className="py-20" style={{ background: "#1F3864" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10">
              <SectionLabel text={t.s08} />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">{t.s08Title}</h2>
              <p className="text-white/60">{t.s08Sub}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            {submitted ? (
              <div className="bg-white/10 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-white font-semibold">{t.fSuccess}</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                className="bg-white rounded-2xl p-6 md:p-8 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fName} *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fCompany} *</label>
                    <input required value={form.company} onChange={e => setForm({...form, company: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fEmail} *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fAmount}</label>
                  <input value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                    placeholder="e.g. $1M, ₩10억"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fMsg}</label>
                  <textarea rows={4} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors resize-none" />
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{ background: "#C9A961", color: "#1F3864" }}>
                  {t.fSubmit} →
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-[#0d1f3c] text-white/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <span>{t.footerRights}</span>
          <div className="flex gap-4">
            <Link href="/"><span className="hover:text-white/70 cursor-pointer transition-colors">{t.footerHome}</span></Link>
            <Link href="/will"><span className="hover:text-white/70 cursor-pointer transition-colors">{t.footerWill}</span></Link>
            <Link href="/tax"><span className="hover:text-white/70 cursor-pointer transition-colors">{t.footerTax}</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
