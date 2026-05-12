/**
 * EverWill 사업소개서 / 투자설명서
 * 홈페이지와 완전히 독립된 전문 IR 문서
 * URL: /pitch (직접 접근만 가능, 홈페이지에서 링크 없음)
 */
import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PolarRadiusAxis
} from "recharts";

// ─── 다국어 콘텐츠 ───────────────────────────────────────────────────────────
const LANGS = {
  ko: {
    flag: "🇰🇷", name: "한국어",
    confidential: "본 문서는 기밀입니다. 허가된 투자자에게만 공개됩니다.",
    badge: "Series A · 2026 · CONFIDENTIAL",
    title: "EverWill 사업소개서",
    subtitle: "세계 최초 디지털 유언 OS — 유언 작성부터 사후 자동 집행까지",
    company: "주식회사 사람 (EverWill Inc.) · 대표 라수환 (Jeff Ra)",
    sections: ["사업 개요", "시장 현황", "국가별 시장", "차별성", "수익 모델", "비전·로드맵", "팀·투자 조건", "투자 문의"],
    s1: "01 사업 개요 및 의의",
    s1mission: "미션",
    s1missionText: "누구나 17분 안에 법적 효력 있는 유언장을 완성하고, 사망 후 자동으로 집행되는 세상을 만든다.",
    s1vision: "비전",
    s1visionText: "2030년까지 아시아 1위, 글로벌 3위 디지털 유언 플랫폼",
    s1about: "사업 소개",
    s1aboutText: "EverWill은 유언 작성부터 사후 자동 집행까지 전 과정을 책임지는 세계 최초 디지털 유언 OS입니다. Trust & Will·Farewill·GoodTrust 등 글로벌 경쟁사를 뛰어넘는 올인원 글로벌 유언 플랫폼으로, 아시아에 경쟁자가 전무한 블루오션 시장을 선점합니다.",
    s1problems: "해결하는 문제 (근거 기반)",
    s2: "02 글로벌 시장 현황",
    s2sub: "고령화 가속 · 디지털 전환 · 법제화 — 세 메가트렌드가 수렴하는 최적의 진입 시점",
    s2growth: "글로벌 시장 성장 전망",
    s2regional: "지역별 시장 규모 (2024 vs 2030)",
    s3: "03 국가별 시장 분석",
    s3sub: "한국 → 일본 → 중화권 → 미국 → 중동 순차 진출 전략",
    s3table: "TAM / SAM / SOM 요약",
    s3willRate: "국가별 유언 작성률 (시장 성숙도)",
    s4: "04 차별성 및 경쟁 분석",
    s4sub: "10가지 혁신 중 7가지는 전 세계 어떤 경쟁사도 시도하지 않은 독창적 기술",
    s4compare: "기능 비교표",
    s4innovations: "10가지 독창적 혁신",
    s5: "05 비즈니스 모델 및 수익구조",
    s5sub: "유언장 인증에 사후 집행까지 포함. AI가 법원 서류를 자동 생성하여 변호사 비용 없이 상속 처리가능한 플랫폼",
    s5pricing: "가격 정책",
    s5ltv: "고객 LTV 비교",
    s5forecast: "매출 예측",
    s6: "06 비전 및 성장 로드맵",
    s6sub: "2026년 한국 출발 → 2030년 글로벌 1위",
    s6roadmap: "단계별 성장 전략",
    s7: "07 팀 및 투자 조건",
    s7team: "창업팀",
    s7hiring: "핵심 채용 포지션",
    s7terms: "투자 조건 (Term Sheet 요약)",
    s7use: "투자금 사용 계획",
    s8: "08 투자 문의",
    s8sub: "Series A · 목표 투자금 $5~10M · 기업가치 협의",
    formName: "성함", formCompany: "회사명", formEmail: "이메일",
    formAmount: "투자 희망 금액", formMsg: "문의 내용", formSubmit: "투자 문의 보내기 →",
    formSuccess: "문의가 접수되었습니다. 48시간 내 연락드리겠습니다.",
    backHome: "메인 사이트",
    worldFirst: "세계 최초",
  },
  en: {
    flag: "🇺🇸", name: "English",
    confidential: "This document is confidential. For authorized investors only.",
    badge: "Series A · 2026 · CONFIDENTIAL",
    title: "EverWill Business Proposal",
    subtitle: "World's First Digital Will OS — From Will Creation to Automated Post-Death Execution",
    company: "EverWill Inc. · CEO Jeff Ra (라수환)",
    sections: ["Overview", "Market", "By Country", "Differentiation", "Revenue", "Vision", "Team", "Contact"],
    s1: "01 Business Overview",
    s1mission: "Mission",
    s1missionText: "Enable anyone to complete a legally valid will in 17 minutes, automatically executed after death.",
    s1vision: "Vision",
    s1visionText: "#1 in Asia, Top 3 globally in digital will platforms by 2030",
    s1about: "About",
    s1aboutText: "EverWill is the world's first Digital Will OS, handling everything from will creation to automated post-death execution. We outperform Trust & Will, Farewill, and GoodTrust with an all-in-one global platform, entering a blue ocean market with zero competitors in Asia.",
    s1problems: "Problems We Solve (Evidence-Based)",
    s2: "02 Global Market Overview",
    s2sub: "Aging acceleration · Digital transformation · Legislation — Three megatrends converging at the perfect entry point",
    s2growth: "Global Market Growth Forecast",
    s2regional: "Regional Market Size (2024 vs 2030)",
    s3: "03 Country-by-Country Market Analysis",
    s3sub: "Korea → Japan → Greater China → USA → Middle East sequential entry strategy",
    s3table: "TAM / SAM / SOM Summary",
    s3willRate: "Will Writing Rate by Country (Market Maturity)",
    s4: "04 Differentiation & Competitive Analysis",
    s4sub: "7 of 10 innovations are world-firsts that no global competitor has attempted",
    s4compare: "Feature Comparison",
    s4innovations: "10 Unique Innovations",
    s5: "05 Business Model & Revenue Structure",
    s5sub: "Multi-layered recurring revenue across the entire lifecycle — not just subscriptions",
    s5pricing: "Pricing Policy",
    s5ltv: "Customer LTV Comparison",
    s5forecast: "Revenue Forecast",
    s6: "06 Vision & Growth Roadmap",
    s6sub: "Starting in Korea 2026 → Global #1 by 2030",
    s6roadmap: "Phased Growth Strategy",
    s7: "07 Team & Investment Terms",
    s7team: "Founding Team",
    s7hiring: "Key Hiring Positions",
    s7terms: "Investment Terms (Term Sheet Summary)",
    s7use: "Use of Proceeds",
    s8: "08 Investment Inquiry",
    s8sub: "Series A · Target $5~10M · Valuation TBD",
    formName: "Name", formCompany: "Company", formEmail: "Email",
    formAmount: "Investment Amount", formMsg: "Message", formSubmit: "Send Inquiry →",
    formSuccess: "Inquiry received. We will contact you within 48 hours.",
    backHome: "Main Site",
    worldFirst: "World First",
  },
  ja: {
    flag: "🇯🇵", name: "日本語",
    confidential: "本書は機密情報です。許可された投資家のみに公開されます。",
    badge: "Series A · 2026 · CONFIDENTIAL",
    title: "EverWill 事業紹介書",
    subtitle: "世界初のデジタル遺言OS — 遺言作成から死後自動執行まで",
    company: "株式会社サラム (EverWill Inc.) · 代表 ラ・スファン (Jeff Ra)",
    sections: ["事業概要", "市場概況", "国別市場", "差別化", "収益モデル", "ビジョン", "チーム", "お問い合わせ"],
    s1: "01 事業概要",
    s1mission: "ミッション",
    s1missionText: "誰でも17分で法的効力のある遺言書を完成させ、死後自動的に執行される世界を作る。",
    s1vision: "ビジョン",
    s1visionText: "2030年までにアジア1位、グローバル3位のデジタル遺言プラットフォーム",
    s1about: "事業紹介",
    s1aboutText: "SaramはTrust & Will・Farewill・GoodTrustなどのグローバル競合を超えるオールインワンの遺言プラットフォームです。アジアに競合が皆無のブルーオーシャン市場を先占します。",
    s1problems: "解決する課題（根拠ベース）",
    s2: "02 グローバル市場概況",
    s2sub: "高齢化加速・デジタル転換・法制化 — 3つのメガトレンドが収束する最適な参入タイミング",
    s2growth: "グローバル市場成長予測",
    s2regional: "地域別市場規模（2024 vs 2030）",
    s3: "03 国別市場分析",
    s3sub: "韓国 → 日本 → 中華圏 → 米国 → 中東 順次進出戦略",
    s3table: "TAM / SAM / SOM サマリー",
    s3willRate: "国別遺言作成率（市場成熟度）",
    s4: "04 差別化・競合分析",
    s4sub: "10の革新のうち7つは世界初の独創的技術",
    s4compare: "機能比較表",
    s4innovations: "10の独創的イノベーション",
    s5: "05 ビジネスモデル・収益構造",
    s5sub: "単純なサブスクではなく、ライフサイクル全体にわたる多層反復収益モデル",
    s5pricing: "価格ポリシー",
    s5ltv: "顧客LTV比較",
    s5forecast: "売上予測",
    s6: "06 ビジョン・成長ロードマップ",
    s6sub: "2026年韓国スタート → 2030年グローバル1位",
    s6roadmap: "段階的成長戦略",
    s7: "07 チーム・投資条件",
    s7team: "創業チーム",
    s7hiring: "主要採用ポジション",
    s7terms: "投資条件（タームシート要約）",
    s7use: "資金使途",
    s8: "08 投資お問い合わせ",
    s8sub: "Series A · 目標 $5~10M · 企業価値 要相談",
    formName: "お名前", formCompany: "会社名", formEmail: "メール",
    formAmount: "投資希望額", formMsg: "お問い合わせ内容", formSubmit: "投資問い合わせを送る →",
    formSuccess: "お問い合わせを受け付けました。48時間以内にご連絡いたします。",
    backHome: "メインサイト",
    worldFirst: "世界初",
  },
  zh: {
    flag: "🇨🇳", name: "中文",
    confidential: "本文件为机密文件，仅供授权投资者查阅。",
    badge: "Series A · 2026 · CONFIDENTIAL",
    title: "EverWill 商业计划书",
    subtitle: "全球首个数字遗嘱OS — 从遗嘱起草到身后自动执行",
    company: "株式会社EverWill · CEO 罗秀焕 (Jeff Ra)",
    sections: ["业务概述", "市场概况", "各国市场", "差异化", "收益模式", "愿景", "团队", "联系我们"],
    s1: "01 业务概述",
    s1mission: "使命",
    s1missionText: "让任何人都能在17分钟内完成具有法律效力的遗嘱，并在身后自动执行。",
    s1vision: "愿景",
    s1visionText: "2030年前成为亚洲第一、全球前三的数字遗嘱平台",
    s1about: "业务介绍",
    s1aboutText: "EverWill是全球首个数字遗嘱OS，超越Trust & Will、Farewill、GoodTrust等全球竞争对手，抢占亚洲零竞争对手的蓝海市场。",
    s1problems: "解决的问题（基于证据）",
    s2: "02 全球市场概况",
    s2sub: "老龄化加速·数字化转型·法制化 — 三大趋势汇聚的最佳入场时机",
    s2growth: "全球市场增长预测",
    s2regional: "各地区市场规模（2024 vs 2030）",
    s3: "03 各国市场分析",
    s3sub: "韩国 → 日本 → 大中华区 → 美国 → 中东 顺序进入战略",
    s3table: "TAM / SAM / SOM 汇总",
    s3willRate: "各国遗嘱书写率（市场成熟度）",
    s4: "04 差异化与竞争分析",
    s4sub: "10项创新中7项为全球首创",
    s4compare: "功能对比表",
    s4innovations: "10项独创创新",
    s5: "05 商业模式与收益结构",
    s5sub: "贯穿全生命周期的多层重复收益模式",
    s5pricing: "定价策略",
    s5ltv: "客户LTV对比",
    s5forecast: "营收预测",
    s6: "06 愿景与增长路线图",
    s6sub: "2026年韩国出发 → 2030年全球第一",
    s6roadmap: "分阶段增长战略",
    s7: "07 团队与投资条款",
    s7team: "创始团队",
    s7hiring: "核心招聘职位",
    s7terms: "投资条款（条款清单摘要）",
    s7use: "资金用途",
    s8: "08 投资咨询",
    s8sub: "Series A · 目标 $5~10M · 估值待议",
    formName: "姓名", formCompany: "公司", formEmail: "邮箱",
    formAmount: "意向投资金额", formMsg: "咨询内容", formSubmit: "发送投资咨询 →",
    formSuccess: "咨询已收到，我们将在48小时内与您联系。",
    backHome: "主站",
    worldFirst: "全球首创",
  },
  ar: {
    flag: "🇸🇦", name: "العربية",
    confidential: "هذه الوثيقة سرية. للمستثمرين المعتمدين فقط.",
    badge: "Series A · 2026 · سري",
    title: "خطة أعمال EverWill",
    subtitle: "أول نظام وصايا رقمي في العالم — من إعداد الوصية إلى التنفيذ التلقائي بعد الوفاة",
    company: "شركة EverWill · الرئيس التنفيذي جيف لاه",
    sections: ["نظرة عامة", "السوق", "حسب الدولة", "التميز", "الإيرادات", "الرؤية", "الفريق", "تواصل"],
    s1: "01 نظرة عامة على الأعمال",
    s1mission: "المهمة",
    s1missionText: "تمكين أي شخص من إتمام وصية قانونية في 17 دقيقة، يتم تنفيذها تلقائياً بعد الوفاة.",
    s1vision: "الرؤية",
    s1visionText: "الأول في آسيا، وضمن أفضل 3 عالمياً في منصات الوصايا الرقمية بحلول 2030",
    s1about: "عن الشركة",
    s1aboutText: "EverWill هي أول نظام وصايا رقمي في العالم، يتفوق على Trust & Will وFarewill وGoodTrust، ويدخل سوقاً خالياً من المنافسين في آسيا.",
    s1problems: "المشكلات التي نحلها",
    s2: "02 نظرة عامة على السوق العالمي",
    s2sub: "تسارع الشيخوخة · التحول الرقمي · التشريعات — ثلاثة اتجاهات كبرى تتقاطع في أفضل وقت للدخول",
    s2growth: "توقعات نمو السوق العالمي",
    s2regional: "حجم السوق الإقليمي (2024 مقابل 2030)",
    s3: "03 تحليل السوق حسب الدولة",
    s3sub: "كوريا → اليابان → الصين الكبرى → الولايات المتحدة → الشرق الأوسط",
    s3table: "ملخص TAM / SAM / SOM",
    s3willRate: "معدل كتابة الوصايا حسب الدولة",
    s4: "04 التميز والتحليل التنافسي",
    s4sub: "7 من أصل 10 ابتكارات هي الأولى من نوعها عالمياً",
    s4compare: "جدول مقارنة الميزات",
    s4innovations: "10 ابتكارات فريدة",
    s5: "05 نموذج الأعمال وهيكل الإيرادات",
    s5sub: "نموذج إيرادات متعدد الطبقات عبر دورة الحياة الكاملة",
    s5pricing: "سياسة التسعير",
    s5ltv: "مقارنة LTV للعملاء",
    s5forecast: "توقعات الإيرادات",
    s6: "06 الرؤية وخارطة طريق النمو",
    s6sub: "الانطلاق من كوريا 2026 → الأول عالمياً بحلول 2030",
    s6roadmap: "استراتيجية النمو المرحلي",
    s7: "07 الفريق وشروط الاستثمار",
    s7team: "فريق التأسيس",
    s7hiring: "المناصب الرئيسية للتوظيف",
    s7terms: "شروط الاستثمار (ملخص)",
    s7use: "استخدام العائدات",
    s8: "08 استفسار الاستثمار",
    s8sub: "Series A · الهدف $5~10M · التقييم قابل للتفاوض",
    formName: "الاسم", formCompany: "الشركة", formEmail: "البريد الإلكتروني",
    formAmount: "مبلغ الاستثمار المطلوب", formMsg: "الرسالة", formSubmit: "إرسال الاستفسار ←",
    formSuccess: "تم استلام استفساركم. سنتواصل معكم خلال 48 ساعة.",
    backHome: "الموقع الرئيسي",
    worldFirst: "الأول عالمياً",
  },
  ru: {
    flag: "🇷🇺", name: "Русский",
    confidential: "Этот документ является конфиденциальным. Только для авторизованных инвесторов.",
    badge: "Series A · 2026 · КОНФИДЕНЦИАЛЬНО",
    title: "Бизнес-план EverWill",
    subtitle: "Первая в мире цифровая ОС завещаний — от составления до автоматического исполнения",
    company: "EverWill Inc. · Генеральный директор Джефф Ла (라수환)",
    sections: ["Обзор", "Рынок", "По странам", "Отличия", "Доходы", "Видение", "Команда", "Контакт"],
    s1: "01 Обзор бизнеса",
    s1mission: "Миссия",
    s1missionText: "Позволить каждому составить юридически действительное завещание за 17 минут, которое автоматически исполняется после смерти.",
    s1vision: "Видение",
    s1visionText: "№1 в Азии, топ-3 в мире среди цифровых платформ завещаний к 2030 году",
    s1about: "О компании",
    s1aboutText: "EverWill — первая в мире цифровая ОС завещаний, превосходящая Trust & Will, Farewill и GoodTrust. Мы занимаем рынок Азии, где нет конкурентов.",
    s1problems: "Решаемые проблемы (на основе данных)",
    s2: "02 Обзор глобального рынка",
    s2sub: "Старение населения · Цифровая трансформация · Законодательство — три мегатренда сходятся в оптимальный момент входа",
    s2growth: "Прогноз роста глобального рынка",
    s2regional: "Объём рынка по регионам (2024 vs 2030)",
    s3: "03 Анализ рынка по странам",
    s3sub: "Корея → Япония → Большой Китай → США → Ближний Восток",
    s3table: "Сводка TAM / SAM / SOM",
    s3willRate: "Уровень составления завещаний по странам",
    s4: "04 Дифференциация и конкурентный анализ",
    s4sub: "7 из 10 инноваций — мировые первенства, которые не пробовал ни один конкурент",
    s4compare: "Сравнительная таблица функций",
    s4innovations: "10 уникальных инноваций",
    s5: "05 Бизнес-модель и структура доходов",
    s5sub: "Многоуровневая повторяющаяся модель доходов на протяжении всего жизненного цикла",
    s5pricing: "Ценовая политика",
    s5ltv: "Сравнение LTV клиентов",
    s5forecast: "Прогноз выручки",
    s6: "06 Видение и дорожная карта роста",
    s6sub: "Старт в Корее 2026 → Глобальный №1 к 2030",
    s6roadmap: "Поэтапная стратегия роста",
    s7: "07 Команда и условия инвестирования",
    s7team: "Команда основателей",
    s7hiring: "Ключевые вакансии",
    s7terms: "Условия инвестирования (краткое изложение)",
    s7use: "Использование средств",
    s8: "08 Инвестиционный запрос",
    s8sub: "Series A · Цель $5~10M · Оценка обсуждается",
    formName: "Имя", formCompany: "Компания", formEmail: "Email",
    formAmount: "Желаемая сумма инвестиций", formMsg: "Сообщение", formSubmit: "Отправить запрос →",
    formSuccess: "Запрос получен. Мы свяжемся с вами в течение 48 часов.",
    backHome: "Главный сайт",
    worldFirst: "Мировой первый",
  },
};

// ─── 데이터 ───────────────────────────────────────────────────────────────────
const marketGrowthData = [
  { year: "2020", value: 1.4 },
  { year: "2022", value: 1.9 },
  { year: "2024", value: 2.6 },
  { year: "2026", value: 3.7, saram: 3.7 },
  { year: "2028", value: 5.0 },
  { year: "2030", value: 6.9 },
  { year: "2032", value: 9.8 },
  { year: "2035", value: 14.1 },
];

const regionalData = [
  { region: "North America", y2024: 1.8, y2030: 3.9 },
  { region: "Europe", y2024: 0.9, y2030: 1.8 },
  { region: "Asia-Pacific", y2024: 0.6, y2030: 2.1 },
  { region: "Middle East", y2024: 0.2, y2030: 0.7 },
  { region: "LatAm", y2024: 0.1, y2030: 0.4 },
];

const willRateData = [
  { country: "🇬🇧 UK", rate: 54 },
  { country: "🇺🇸 USA", rate: 46 },
  { country: "🇦🇺 AUS", rate: 43 },
  { country: "🇩🇪 GER", rate: 38 },
  { country: "🇯🇵 JPN", rate: 12 },
  { country: "🇸🇦 GCC", rate: 15 },
  { country: "🇰🇷 KOR", rate: 5 },
  { country: "🇨🇳 CHN", rate: 3 },
];

const revenueData = [
  { year: "2026", revenue: 5, users: 5000 },
  { year: "2027", revenue: 35, users: 50000 },
  { year: "2028", revenue: 200, users: 200000 },
  { year: "2029", revenue: 500, users: 500000 },
  { year: "2030", revenue: 1000, users: 1000000 },
];

const radarData = [
  { feature: "AI Will", SARAM: 100, TrustWill: 80, Farewill: 70, GoodTrust: 65 },
  { feature: "Multi-Lang", SARAM: 100, TrustWill: 20, Farewill: 20, GoodTrust: 20 },
  { feature: "Badge", SARAM: 100, TrustWill: 0, Farewill: 0, GoodTrust: 0 },
  { feature: "Death Detect", SARAM: 100, TrustWill: 0, Farewill: 0, GoodTrust: 0 },
  { feature: "Multi-Juris", SARAM: 100, TrustWill: 0, Farewill: 0, GoodTrust: 0 },
  { feature: "Video Will", SARAM: 100, TrustWill: 10, Farewill: 10, GoodTrust: 40 },
  { feature: "Asia Market", SARAM: 100, TrustWill: 0, Farewill: 0, GoodTrust: 0 },
];

const ltvData = [
  { company: "GoodTrust", ltv: 120 },
  { company: "Farewill", ltv: 150 },
  { company: "Trust & Will", ltv: 199 },
  { company: "EverWill", ltv: 550 },
];

const countryData = [
  { country: "🇰🇷 Korea", tam: 4.2, sam: 0.8, som: 120, rate: 5, entry: "2026 Q1" },
  { country: "🇯🇵 Japan", tam: 18.5, sam: 3.2, som: 350, rate: 12, entry: "2026 Q3" },
  { country: "🇨🇳 HK+TW", tam: 8.3, sam: 1.1, som: 80, rate: 8, entry: "2027 Q1" },
  { country: "🇺🇸 USA", tam: 42.0, sam: 5.8, som: 420, rate: 46, entry: "2027 Q3" },
  { country: "🇸🇦 GCC", tam: 12.7, sam: 2.1, som: 180, rate: 15, entry: "2028 Q1" },
  { country: "🇩🇪 Germany", tam: 6.8, sam: 1.0, som: 50, rate: 38, entry: "2028 Q4" },
];

const problems = [
  { stat: "95%", desc_ko: "한국인이 유언장 없이 사망", source: "법원행정처 2024" },
  { stat: "수조원", desc_ko: "상속 분쟁 연간 손실", source: "대법원 사법연감 2024" },
  { stat: "₩500,000+", desc_ko: "기존 유언 공증 비용", source: "대한공증인협회 2024" },
  { stat: "700만명", desc_ko: "재외한인 — 다국적 상속 서비스 전무", source: "외교부 2024" },
  { stat: "0개", desc_ko: "아시아 디지털 유언 플랫폼 경쟁사", source: "자체 조사 2024" },
  { stat: "多수", desc_ko: "사망 후 유언장 미발견 사례", source: "법무부 2023" },
];

const innovations = [
  { num: "01", title_ko: "물리적 Badge 시스템", title_en: "Physical Badge System", wf: true, desc_ko: "MedicAlert + AirTag + 유언 인증 결합. 5종 라인업. 착용 자체가 마케팅." },
  { num: "02", title_ko: "다층 안심 확인 서비스", title_en: "Multi-Layer Safety Confirmation", wf: true, desc_ko: "가족 신고 + 정부 DB + 정기 안심 확인 서비스 + 응급 발견자. 2채널 교차 검증." },
  { num: "03", title_ko: "변호사 마켓플레이스", title_en: "Lawyer Marketplace", wf: true, desc_ko: "평소엔 0%, 사망 후 100%. 플랫폼 수수료 15-25%." },
  { num: "04", title_ko: "상속자 직접 등록", title_en: "Beneficiary Direct Registration", wf: true, desc_ko: "사망 시 전 세계 상속자 자동 알림. 현지 언어·시간대 맞춤." },
  { num: "05", title_ko: "체크박스 17분 완성", title_en: "17-Min Checkbox Wizard", wf: false, desc_ko: "AI가 체크박스 → 법률 문장 자동 변환. 유류분 실시간 검증." },
  { num: "06", title_ko: "영상 유언 + 미래 전달", title_en: "Video Will + Future Delivery", wf: true, desc_ko: "손녀 성인식, 아들 결혼식 날 자동 전송. 평생 보관." },
  { num: "07", title_ko: "자필 유언 스캔 인증", title_en: "Handwritten Will Scan", wf: false, desc_ko: "AI 형식 검증 + 위조 탐지 + 분산 암호화 무결성 기록." },
  { num: "08", title_ko: "재인증 체계 (LTV 28배)", title_en: "Re-certification System", wf: true, desc_ko: "결혺·출산·이사·자산 변동마다 재인증. 최초 ₩49,000 → 재인증 ₩17,000." },
  { num: "09", title_ko: "글로벌 멀티관할권", title_en: "Multi-Jurisdiction", wf: true, desc_ko: "한국+미국+일본 자산 동시 관리. 각국 법률 자동 적용." },
  { num: "10", title_ko: "7개 언어 + 아랍어 RTL", title_en: "7 Languages + Arabic RTL", wf: false, desc_ko: "한·영·일·중·독·스·아랍어. 샤리아 상속법 자동 적용." },
];

const pricingData = [
  { product: "회원가입", krw: "무료", usd: "Free", type: "획득" },
  { product: "AI 유언장 작성", krw: "무료", usd: "Free", type: "획득" },
  { product: "유언장 인증 (사후 집행 포함)", krw: "₩49,000", usd: "$39", type: "핵심 수익" },
  { product: "재인증 (수정)", krw: "₩17,000", usd: "$17", type: "반복 수익" },
  { product: "영상 유언장", krw: "+₩29,000", usd: "+$29", type: "업셀" },
  { product: "자필 유언 스캔", krw: "+₩19,000", usd: "+$19", type: "업셀" },
  { product: "보관료 1년", krw: "₩9,900", usd: "$9", type: "보관" },
  { product: "보관료 3년", krw: "₩24,900", usd: "$24", type: "보관" },
  { product: "보관료 5년", krw: "₩39,000", usd: "$38", type: "보관" },
  { product: "보관료 10년", krw: "₩79,000", usd: "$76", type: "보관" },
  { product: "보관료 20년+ (영구)", krw: "₩199,000", usd: "$189", type: "보관" },
  { product: "Badge Essential", krw: "₩49,000", usd: "$49", type: "하드웨어" },
  { product: "Badge Premium", krw: "₩299,000", usd: "$299", type: "하드웨어" },
];

const roadmapData = [
  { phase: "Phase 1", period: "2026 Q1–Q4", market: "🇰🇷 한국", milestone: "런칭, eKYC, Badge 출시, 토스페이먼츠", revenue: "₩5억", mau: "50,000" },
  { phase: "Phase 2", period: "2027 Q1–Q4", market: "🇯🇵 일본", milestone: "일본 법인, 공정증서 연동, LINE Pay", revenue: "₩30억", mau: "200,000" },
  { phase: "Phase 3", period: "2028 Q1–Q4", market: "🇨🇳🇸🇦 중화권+중동", milestone: "아랍어 RTL, 샤리아법, 알리페이", revenue: "₩200억", mau: "1,000,000" },
  { phase: "Phase 4", period: "2029 Q1–Q4", market: "🇺🇸 미국", milestone: "재미한인 캠페인, Stripe, 변호사 마켓", revenue: "₩500억", mau: "3,000,000" },
  { phase: "Phase 5", period: "2030+", market: "🌍 글로벌", milestone: "글로벌 1위, Series B/C, IPO 준비", revenue: "₩1,000억+", mau: "10,000,000+" },
];

const hiringData = [
  { role: "CTO", desc: "풀스택 + AI/ML. 유언 AI 엔진 개발 총괄" },
  { role: "일본 법무", desc: "일본 변호사 자격. 공정증서 디지털화 대응" },
  { role: "중동 BD", desc: "아랍어 원어민. 샤리아법 전문. GCC 파트너십" },
  { role: "eKYC 엔지니어", desc: "NICE평가정보·Veriff 연동. 분산 암호화 해시" },
  { role: "마케팅 매니저", desc: "재외한인 커뮤니티 타깃. SNS·콘텐츠" },
  { role: "Badge 제조 PM", desc: "스테인레스·티타늄 제조 파트너 관리" },
];

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────
export default function PitchPage() {
  const [langKey, setLangKey] = useState<keyof typeof LANGS>("ko");
  const [langOpen, setLangOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", company: "", email: "", amount: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const t = LANGS[langKey];
  const isRTL = langKey === "ar";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={`min-h-screen bg-white text-gray-900 font-sans ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>

      {/* ── 상단 기밀 배너 */}
      <div className="bg-[#1F3864] text-white text-center py-2 text-xs tracking-widest font-medium">
        {t.confidential}
      </div>

      {/* ── 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1F3864] flex items-center justify-center">
              <span className="text-[#C9A961] font-bold text-sm">S</span>
            </div>
            <div>
              <div className="font-bold text-[#1F3864] text-sm leading-none">EverWill</div>
              <div className="text-[10px] text-gray-400 mt-0.5">사업소개서 · CONFIDENTIAL</div>
            </div>
          </div>

          {/* 섹션 네비 (데스크탑) */}
          <nav className="hidden xl:flex items-center gap-6">
            {t.sections.map((sec, i) => (
              <a key={i} href={`#sec${i + 1}`} className="text-xs text-gray-500 hover:text-[#1F3864] transition-colors font-medium">
                {sec}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {/* 언어 선택 */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                <span>{t.flag}</span>
                <span className="text-xs text-gray-600">{t.name}</span>
                <span className="text-gray-400 text-xs">▾</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[140px]">
                  {(Object.keys(LANGS) as Array<keyof typeof LANGS>).map((k) => (
                    <button
                      key={k}
                      onClick={() => { setLangKey(k); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${langKey === k ? "text-[#1F3864] font-semibold bg-blue-50" : "text-gray-700"}`}
                    >
                      <span>{LANGS[k].flag}</span>
                      <span>{LANGS[k].name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg">
              {t.backHome}
            </a>
          </div>
        </div>
      </header>

      {/* ── 커버 섹션 */}
      <section className="bg-gradient-to-br from-[#1F3864] via-[#2a4a7f] to-[#1a3060] text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-4 py-1.5 text-[#C9A961] text-xs font-semibold tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961] animate-pulse" />
            {t.badge}
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">{t.title}</h1>
          <p className="text-xl text-white/70 mb-6 max-w-3xl">{t.subtitle}</p>
          <p className="text-sm text-white/50">{t.company}</p>

          {/* KPI 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {[
              { v: "$3.7B", l: "2026 Global Market", s: "Grand View Research 2024" },
              { v: "9.3%", l: "CAGR 2026–2035", s: "IBISWorld 2024" },
              { v: "$14.1B", l: "2035 Projected", s: "Statista 2024" },
              { v: "$550", l: "Target LTV", s: "2.8x vs Trust & Will" },
            ].map((k, i) => (
              <div key={i} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                <div className="text-3xl font-black text-[#C9A961]">{k.v}</div>
                <div className="text-white/80 text-sm font-medium mt-1">{k.l}</div>
                <div className="text-white/40 text-xs mt-1">{k.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 목차 */}
      <section className="bg-gray-50 border-b border-gray-200 py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-3">
            {t.sections.map((sec, i) => (
              <a key={i} href={`#sec${i + 1}`}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#1F3864] hover:text-[#1F3864] transition-all">
                <span className="text-[#C9A961] font-bold text-xs">0{i + 1}</span>
                {sec}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-20">

        {/* ── 01 사업 개요 */}
        <section id="sec1">
          <SectionHeader num="01" title={t.s1} />
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <InfoCard title={t.s1mission} text={t.s1missionText} accent />
            <InfoCard title={t.s1vision} text={t.s1visionText} />
          </div>
          <InfoCard title={t.s1about} text={t.s1aboutText} />

          <h3 className="text-lg font-bold text-gray-800 mt-8 mb-4">{t.s1problems}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 hover:border-[#1F3864]/30 transition-colors">
                <div className="text-2xl font-black text-[#1F3864] mb-1">{p.stat}</div>
                <div className="text-sm text-gray-700 font-medium">{p.desc_ko}</div>
                <div className="text-xs text-gray-400 mt-2">{p.source}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 02 글로벌 시장 */}
        <section id="sec2">
          <SectionHeader num="02" title={t.s2} sub={t.s2sub} />

          <h3 className="font-semibold text-gray-700 mb-4">{t.s2growth}</h3>
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={marketGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}B`} />
                <Tooltip formatter={(v: number) => [`$${v}B`, "Market Size"]} />
                <Line type="monotone" dataKey="value" stroke="#1F3864" strokeWidth={3} dot={{ fill: "#1F3864", r: 5 }} />
                <Line type="monotone" dataKey="saram" stroke="#C9A961" strokeWidth={0} dot={{ fill: "#C9A961", r: 8 }} name="EverWill Entry" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 text-center mt-2">Source: Grand View Research 2024, Statista 2024, IBISWorld 2024</p>
          </div>

          <h3 className="font-semibold text-gray-700 mb-4">{t.s2regional}</h3>
          <div className="bg-gray-50 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={regionalData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}B`} />
                <YAxis dataKey="region" type="category" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v: number) => [`$${v}B`]} />
                <Legend />
                <Bar dataKey="y2024" name="2024" fill="#1F3864" radius={[0, 4, 4, 0]} />
                <Bar dataKey="y2030" name="2030" fill="#C9A961" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── 03 국가별 시장 */}
        <section id="sec3">
          <SectionHeader num="03" title={t.s3} sub={t.s3sub} />

          <h3 className="font-semibold text-gray-700 mb-4">{t.s3table}</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-8">
            <table className="w-full text-sm">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  {["국가", "TAM", "SAM", "SOM (5년)", "유언 작성률", "진입 시점"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countryData.map((c, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-semibold">{c.country}</td>
                    <td className="px-4 py-3 font-bold text-[#1F3864]">${c.tam}B</td>
                    <td className="px-4 py-3">${c.sam}B</td>
                    <td className="px-4 py-3 font-bold text-[#C9A961]">${c.som}M</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.rate <= 10 ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {c.rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.entry}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-gray-700 mb-4">{t.s3willRate}</h3>
          <div className="bg-gray-50 rounded-2xl p-6">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={willRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="country" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => [`${v}%`, "Will Rate"]} />
                <Bar dataKey="rate" fill="#1F3864" radius={[4, 4, 0, 0]}>
                  {willRateData.map((entry, index) => (
                    <rect key={index} fill={entry.country.includes("KOR") ? "#C9A961" : "#1F3864"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-400 text-center mt-2">Source: AARP 2023, ONS UK 2023, Japan MOJ 2023, Korean Court Admin 2024</p>
          </div>
        </section>

        {/* ── 04 차별성 */}
        <section id="sec4">
          <SectionHeader num="04" title={t.s4} sub={t.s4sub} />

          {/* 레이더 차트 */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-700 mb-4 text-center">Competitive Radar Chart</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="feature" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="EverWill" dataKey="EverWill" stroke="#C9A961" fill="#C9A961" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Trust & Will" dataKey="TrustWill" stroke="#1F3864" fill="#1F3864" fillOpacity={0.1} strokeWidth={1.5} />
                <Radar name="Farewill" dataKey="Farewill" stroke="#6b7280" fill="#6b7280" fillOpacity={0.1} strokeWidth={1} />
                <Radar name="GoodTrust" dataKey="GoodTrust" stroke="#9ca3af" fill="#9ca3af" fillOpacity={0.1} strokeWidth={1} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 기능 비교표 */}
          <h3 className="font-semibold text-gray-700 mb-4">{t.s4compare}</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-8">
            <table className="w-full text-sm">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs">Feature</th>
                  <th className="px-4 py-3 text-center text-xs text-[#C9A961]">EverWill</th>
                  <th className="px-4 py-3 text-center text-xs">Trust & Will</th>
                  <th className="px-4 py-3 text-center text-xs">Farewill</th>
                  <th className="px-4 py-3 text-center text-xs">GoodTrust</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI Will Drafting", "✅ Free", "✅ $199/yr", "✅ £90", "✅ $149"],
                  ["Physical Badge", "✅ World First", "❌", "❌", "❌"],
                  ["Multi-Layer Safety Confirmation", "✅ World First", "❌", "❌", "❌"],
                  ["Lawyer Marketplace", "✅ Post-death", "✅ Pre-death", "✅ Pre-death", "❌"],
                  ["Multi-Jurisdiction", "✅ World First", "❌ US only", "❌ UK only", "❌ US only"],
                  ["Video Will + Future Delivery", "✅ World First", "❌", "❌", "✅ Basic"],
                  ["Handwritten Will Scan", "✅ AI Verified", "❌", "❌", "❌"],
                  ["Re-certification System", "✅ ₩15,000", "❌ Full repurchase", "❌", "❌"],
                  ["Arabic RTL + Sharia Law", "✅ World First", "❌", "❌", "❌"],
                  ["7 Languages", "✅ 7 langs", "❌ EN only", "❌ EN only", "❌ EN only"],
                  ["Distributed Encrypted Hash", "✅ Polygon", "❌", "❌", "❌"],
                  ["Customer LTV", "$550 (target)", "$199", "$150", "$120"],
                  ["Asia Market", "✅ Primary", "❌", "❌", "❌"],
                ].map(([feat, s, tw, fw, gt], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{feat}</td>
                    <td className="px-4 py-2.5 text-center text-xs font-semibold text-[#1F3864]">{s}</td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">{tw}</td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">{fw}</td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">{gt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 10가지 혁신 */}
          <h3 className="font-semibold text-gray-700 mb-4">{t.s4innovations}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {innovations.map((inn, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 hover:border-[#1F3864]/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-[#C9A961] font-black text-lg leading-none">{inn.num}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-800 text-sm">{inn.title_ko}</span>
                      {inn.wf && (
                        <span className="bg-[#1F3864] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          {t.worldFirst}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{inn.desc_ko}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 05 수익 모델 */}
        <section id="sec5">
          <SectionHeader num="05" title={t.s5} sub={t.s5sub} />

          <h3 className="font-semibold text-gray-700 mb-4">{t.s5pricing}</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-8">
            <table className="w-full text-sm">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  {["상품", "가격 (KRW)", "가격 (USD)", "유형"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricingData.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-2.5 font-medium text-xs">{p.product}</td>
                    <td className="px-4 py-2.5 font-bold text-[#1F3864] text-xs">{p.krw}</td>
                    <td className="px-4 py-2.5 text-xs">{p.usd}</td>
                    <td className="px-4 py-2.5">
                      <span className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">{p.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">{t.s5ltv}</h3>
              <div className="bg-gray-50 rounded-2xl p-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={ltvData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="company" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v: number) => [`$${v}`, "LTV"]} />
                    <Bar dataKey="ltv" radius={[4, 4, 0, 0]}>
                      {ltvData.map((entry, index) => (
                        <rect key={index} fill={entry.company === "EverWill" ? "#C9A961" : "#1F3864"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            <p className="text-xs text-gray-400 text-center mt-2">Source: Farewill Annual Report 2023, Trust & Will Investor Deck 2024</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-4">{t.s5forecast}</h3>
              <div className="bg-gray-50 rounded-2xl p-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₩${v}억`} />
                    <Tooltip formatter={(v: number) => [`₩${v}억`]} />
                    <Bar dataKey="revenue" fill="#1F3864" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ── 06 비전·로드맵 */}
        <section id="sec6">
          <SectionHeader num="06" title={t.s6} sub={t.s6sub} />
          <h3 className="font-semibold text-gray-700 mb-4">{t.s6roadmap}</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  {["단계", "기간", "시장", "핵심 마일스톤", "매출 목표", "MAU"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roadmapData.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3">
                      <span className="bg-[#1F3864] text-white text-xs px-2 py-0.5 rounded font-bold">{r.phase}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.period}</td>
                    <td className="px-4 py-3 text-sm">{r.market}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.milestone}</td>
                    <td className="px-4 py-3 font-bold text-[#C9A961] text-sm">{r.revenue}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{r.mau}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 07 팀·투자 조건 */}
        <section id="sec7">
          <SectionHeader num="07" title={t.s7} />

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* 창업자 */}
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4">{t.s7team}</h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  J
                </div>
                <div>
                  <div className="font-bold text-gray-900">라수환 (Jeff Ra)</div>
                  <div className="text-sm text-[#1F3864] font-medium">대표이사 · 창업자</div>
                  <div className="text-xs text-gray-500 mt-1">주식회사 사람 (EverWill Inc.)</div>
                  <div className="text-xs text-gray-500">제품기획 · 디자인 · 회계/재무 · 글로벌 전략</div>
                </div>
              </div>
            </div>

            {/* 투자 조건 */}
            <div className="border border-[#C9A961]/30 bg-[#C9A961]/5 rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-4">{t.s7terms}</h3>
              <div className="space-y-2">
                {[
                  ["투자 라운드", "Series A"],
                  ["목표 투자금", "$5M ~ $10M"],
                  ["기업 가치", "협의 (Pre-money)"],
                  ["투자 형태", "보통주 / 전환사채"],
                  ["Exit 전략", "Series B/C → 글로벌 IPO (2030)"],
                  ["경쟁사 참고", "Trust & Will $100M+ (2021)"],
                ].map(([k, v], i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 채용 */}
          <h3 className="font-semibold text-gray-700 mb-4">{t.s7hiring}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {hiringData.map((h, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4">
                <div className="font-bold text-[#1F3864] text-sm mb-1">{h.role}</div>
                <div className="text-xs text-gray-500">{h.desc}</div>
              </div>
            ))}
          </div>

          {/* 투자금 사용 계획 */}
          <h3 className="font-semibold text-gray-700 mb-4">{t.s7use}</h3>
          <div className="space-y-3">
            {[
              { label: "기술개발 (AI 엔진, eKYC, 분산 암호화 보안, Badge NFC)", pct: 40, color: "#1F3864" },
              { label: "마케팅 (재외한인 캠페인, 일본 진출, 콘텐츠)", pct: 25, color: "#2a4a7f" },
              { label: "법무 (각국 법률 검토, 변호사 네트워크)", pct: 15, color: "#C9A961" },
              { label: "글로벌 확장 (일본·중동 법인, 현지화)", pct: 12, color: "#a88840" },
              { label: "운영 (팀 빌딩, 오피스, 인프라)", pct: 8, color: "#6b7280" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 08 투자 문의 */}
        <section id="sec8">
          <SectionHeader num="08" title={t.s8} sub={t.s8sub} />
          <div className="bg-[#1F3864] rounded-2xl p-8 text-white">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✓</div>
                <p className="text-xl font-bold text-[#C9A961]">{t.formSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                {[
                  { key: "name", label: t.formName, type: "text" },
                  { key: "company", label: t.formCompany, type: "text" },
                  { key: "email", label: t.formEmail, type: "email" },
                  { key: "amount", label: t.formAmount, type: "text", placeholder: "e.g. $1M, ₩10억" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-white/70 text-xs mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={formData[f.key as keyof typeof formData]}
                      onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A961]"
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-white/70 text-xs mb-1">{t.formMsg}</label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C9A961] resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full bg-[#C9A961] hover:bg-[#b8943a] text-white font-bold py-3 rounded-xl transition-colors text-sm">
                    {t.formSubmit}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* ── 푸터 */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 px-6 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            © 2026 주식회사 사람 (EverWill Inc.) · All rights reserved.
          </div>
          <div className="text-xs text-gray-400 text-center">
            본 문서는 기밀입니다. 무단 배포를 금합니다.
          </div>
          <a href="/" className="text-sm text-[#1F3864] hover:underline font-medium">{t.backHome} →</a>
        </div>
      </footer>
    </div>
  );
}

// ─── 헬퍼 컴포넌트 ────────────────────────────────────────────────────────────
function SectionHeader({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div className="mb-8 pb-4 border-b-2 border-[#1F3864]">
      <div className="flex items-center gap-3">
        <span className="text-[#C9A961] font-black text-3xl leading-none">{num}</span>
        <h2 className="text-2xl font-black text-[#1F3864]">{title}</h2>
      </div>
      {sub && <p className="text-sm text-gray-500 mt-2 ml-10">{sub}</p>}
    </div>
  );
}

function InfoCard({ title, text, accent }: { title: string; text: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-6 border ${accent ? "border-[#C9A961]/30 bg-[#C9A961]/5" : "border-gray-200 bg-gray-50"}`}>
      <h4 className={`font-bold text-sm mb-2 ${accent ? "text-[#C9A961]" : "text-[#1F3864]"}`}>{title}</h4>
      <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
    </div>
  );
}
