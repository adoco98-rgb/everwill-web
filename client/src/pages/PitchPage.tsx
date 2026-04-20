/**
 * SARAM 사업기획서 — 방대한 전문 IR 문서
 * 홈페이지와 완전히 다른 스타일: 데이터·표·차트 중심
 * 6개 언어 전환 (국기 표시)
 */
import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";

// ── 차트 URL ─────────────────────────────────────────────────────
const C = {
  global:   "/manus-storage/P1_global_growth_3ec2640e.png",
  tam:      "/manus-storage/P2_country_tam_2cb6c57b.png",
  willRate: "/manus-storage/P3_will_rate_c0a2e35c.png",
  kojp:     "/manus-storage/P4_ko_jp_59fb076f.png",
  usme:     "/manus-storage/P5_us_me_f368a8e6.png",
  revenue:  "/manus-storage/P6_revenue_ltv_ae565552.png",
  radar:    "/manus-storage/P7_radar_7987f6ab.png",
};

type L = "ko"|"en"|"ja"|"zh"|"ar"|"ru";
const LANGS:{code:L;flag:string;label:string;rtl?:boolean}[] = [
  {code:"ko",flag:"🇰🇷",label:"한국어"},
  {code:"en",flag:"🇺🇸",label:"English"},
  {code:"ja",flag:"🇯🇵",label:"日本語"},
  {code:"zh",flag:"🇨🇳",label:"中文"},
  {code:"ar",flag:"🇸🇦",label:"العربية",rtl:true},
  {code:"ru",flag:"🇷🇺",label:"Русский"},
];

// ── 다국어 ────────────────────────────────────────────────────────
const TXT:Record<L,Record<string,string>> = {
ko:{
  title:"SARAM 사업기획서",
  sub:"세계 최초 디지털 유언 OS — 시장 분석·차별성·비전·수익모델 종합 보고서",
  toc:"목차",
  s1:"1. 사업 개요 및 의의",s2:"2. 시장 현황 및 규모",s3:"3. 국가별 시장 분석",
  s4:"4. 경쟁사 분석 및 차별성",s5:"5. 비즈니스 모델 및 수익구조",
  s6:"6. 비전 및 성장 로드맵",s7:"7. 팀 및 투자 조건",s8:"8. 투자 문의",
  overview:"사업 개요",
  overviewDesc:"SARAM은 유언 작성부터 사후 자동 집행까지 전 과정을 책임지는 세계 최초 디지털 유언 OS입니다. 단순한 유언 작성 도구가 아닌, Trust & Will·Farewill·GoodTrust 등 글로벌 경쟁사를 뛰어넘는 올인원 글로벌 유언 플랫폼입니다.",
  missionTitle:"미션",
  mission:"누구나 17분 안에 법적 효력 있는 유언장을 완성하고, 사망 후 자동으로 집행되는 세상을 만든다.",
  visionTitle:"비전",
  vision:"2030년까지 아시아 1위, 글로벌 3위 디지털 유언 플랫폼",
  problemTitle:"해결하는 문제",
  problem1:"한국인 95%가 유언장 없이 사망 (법원행정처 2024)",
  problem2:"상속 분쟁으로 연간 수조원 손실 (대법원 사법연감 2024)",
  problem3:"기존 유언 공증 비용 50만원+ (대한공증인협회 2024)",
  problem4:"재외한인 700만명 — 다국적 상속 서비스 전무 (외교부 2024)",
  problem5:"아시아 디지털 유언 플랫폼 경쟁사 0개 (자체 조사 2024)",
  problem6:"사망 후 유언장 미발견 사례 다수 (법무부 2023)",
  marketTitle:"글로벌 시장 현황",
  marketDesc:"고령화 가속·디지털 전환·법제화 — 세 메가트렌드가 동시에 수렴하는 최적의 진입 시점",
  countryTitle:"국가별 시장 분석",
  countryDesc:"한국 → 일본 → 중화권 → 미국 → 중동 순차 진출 전략",
  diffTitle:"차별성 및 독립성",
  diffDesc:"10가지 혁신 중 7가지는 전 세계 어떤 경쟁사도 시도하지 않은 독창적 기술",
  bizTitle:"비즈니스 모델 및 수익구조",
  bizDesc:"단순 구독이 아닌 생애주기 전반에 걸친 다층 반복 수익 모델",
  roadmapTitle:"비전 및 성장 로드맵",
  roadmapDesc:"아시아에서 시작해 전 세계로 확장하는 단계별 성장 전략",
  teamTitle:"팀 및 투자 조건",
  contactTitle:"투자 문의",
  contactDesc:"Series A · 목표 투자금 $5~10M · 기업가치 협의",
  submit:"투자 문의 보내기",
  success:"문의가 접수되었습니다. 48시간 내 연락드리겠습니다.",
  fname:"성함",fcompany:"회사명",femail:"이메일",famount:"투자 희망 금액",fmsg:"문의 내용",
},
en:{
  title:"SARAM Business Plan",
  sub:"World's First Digital Will OS — Market Analysis, Differentiation, Vision & Revenue Model",
  toc:"Table of Contents",
  s1:"1. Business Overview",s2:"2. Market Overview",s3:"3. Country Analysis",
  s4:"4. Competitive Analysis",s5:"5. Business Model & Revenue",
  s6:"6. Vision & Roadmap",s7:"7. Team & Investment",s8:"8. Contact",
  overview:"Business Overview",
  overviewDesc:"SARAM is the world's first Digital Will OS — responsible for the entire process from will drafting to automated posthumous execution. Not just a will writing tool, but an all-in-one global will platform that surpasses competitors like Trust & Will, Farewill, and GoodTrust.",
  missionTitle:"Mission",
  mission:"Enable anyone to complete a legally valid will in 17 minutes, automatically executed after death.",
  visionTitle:"Vision",
  vision:"#1 in Asia, Top 3 globally in digital will platforms by 2030",
  problemTitle:"Problems We Solve",
  problem1:"95% of Koreans die without a will (Korean Court Admin 2024)",
  problem2:"Trillions in annual inheritance disputes (Supreme Court 2024)",
  problem3:"Traditional will notarization costs $400+ (Korean Notary Assoc. 2024)",
  problem4:"7M overseas Koreans — zero multi-jurisdictional service (MOFA 2024)",
  problem5:"Zero digital will platforms in Asia (Market Research 2024)",
  problem6:"Wills frequently undiscovered after death (MOJ Survey 2023)",
  marketTitle:"Global Market Overview",
  marketDesc:"Accelerating aging · Digital transformation · Legislation — three megatrends converging at the perfect entry timing",
  countryTitle:"Country Market Analysis",
  countryDesc:"Korea → Japan → Greater China → USA → Middle East sequential entry strategy",
  diffTitle:"Differentiation & Independence",
  diffDesc:"7 of 10 innovations are world-firsts that no global competitor has attempted",
  bizTitle:"Business Model & Revenue Structure",
  bizDesc:"Not just subscriptions — multi-layer recurring revenue across the entire life cycle",
  roadmapTitle:"Vision & Growth Roadmap",
  roadmapDesc:"Starting in Asia, expanding globally — phased growth strategy",
  teamTitle:"Team & Investment Terms",
  contactTitle:"Investment Inquiry",
  contactDesc:"Series A · Target $5–10M · Valuation TBD",
  submit:"Send Inquiry",
  success:"Received! We will respond within 48 hours.",
  fname:"Name",fcompany:"Company",femail:"Email",famount:"Investment Amount",fmsg:"Message",
},
ja:{
  title:"SARAM 事業計画書",
  sub:"世界初デジタル遺言OS — 市場分析・差別化・ビジョン・収益モデル総合報告書",
  toc:"目次",
  s1:"1. 事業概要",s2:"2. 市場現況",s3:"3. 国別市場分析",
  s4:"4. 競合分析・差別化",s5:"5. ビジネスモデル・収益構造",
  s6:"6. ビジョン・成長ロードマップ",s7:"7. チーム・投資条件",s8:"8. 投資お問い合わせ",
  overview:"事業概要",
  overviewDesc:"SARAMは遺言作成から死後自動執行まで全工程を担う世界初のデジタル遺言OSです。単なる遺言作成ツールではなく、Trust & Will・Farewill・GoodTrustなどのグローバル競合を超えるオールインワン遺言プラットフォームです。",
  missionTitle:"ミッション",
  mission:"誰もが17分以内に法的効力のある遺言書を完成させ、死後に自動執行される世界を作る。",
  visionTitle:"ビジョン",
  vision:"2030年までにアジア1位、グローバル3位のデジタル遺言プラットフォーム",
  problemTitle:"解決する問題",
  problem1:"韓国人の95%が遺言なしで死亡（法院行政処 2024）",
  problem2:"相続紛争で年間数兆ウォンの損失（大法院 2024）",
  problem3:"従来の遺言公証費用50万ウォン以上（公証人協会 2024）",
  problem4:"在外韓国人700万人 — 多国籍相続サービス皆無（外交部 2024）",
  problem5:"アジアのデジタル遺言プラットフォーム競合0社（自社調査 2024）",
  problem6:"死後に遺言書が発見されないケース多数（法務部 2023）",
  marketTitle:"グローバル市場現況",
  marketDesc:"高齢化加速・デジタル転換・法制化 — 3つのメガトレンドが同時収束する最適な参入タイミング",
  countryTitle:"国別市場分析",
  countryDesc:"韓国 → 日本 → 中華圏 → 米国 → 中東 順次進出戦略",
  diffTitle:"差別化と独自性",
  diffDesc:"10の革新のうち7つは世界中のどの競合も試みていない独創的技術",
  bizTitle:"ビジネスモデル・収益構造",
  bizDesc:"単純なサブスクではなく、ライフサイクル全体にわたる多層反復収益モデル",
  roadmapTitle:"ビジョン・成長ロードマップ",
  roadmapDesc:"アジアから始まり全世界へ拡大する段階的成長戦略",
  teamTitle:"チームと投資条件",
  contactTitle:"投資お問い合わせ",
  contactDesc:"シリーズA · 目標調達額 $5~10M · 企業価値協議",
  submit:"投資お問い合わせを送る",
  success:"受け付けました。48時間以内にご連絡いたします。",
  fname:"お名前",fcompany:"会社名",femail:"メール",famount:"投資希望金額",fmsg:"お問い合わせ内容",
},
zh:{
  title:"SARAM 商业计划书",
  sub:"全球首创数字遗嘱OS — 市场分析·差异化·愿景·收益模式综合报告",
  toc:"目录",
  s1:"1. 商业概述",s2:"2. 市场现状",s3:"3. 各国市场分析",
  s4:"4. 竞争分析·差异化",s5:"5. 商业模式·收益结构",
  s6:"6. 愿景·成长路线图",s7:"7. 团队·投资条件",s8:"8. 投资咨询",
  overview:"商业概述",
  overviewDesc:"SARAM是全球首创的数字遗嘱OS，负责从遗嘱起草到身后自动执行的全过程。不仅仅是遗嘱撰写工具，而是超越Trust & Will、Farewill、GoodTrust等全球竞争对手的一站式全球遗嘱平台。",
  missionTitle:"使命",
  mission:"让任何人都能在17分钟内完成具有法律效力的遗嘱，并在死后自动执行。",
  visionTitle:"愿景",
  vision:"到2030年成为亚洲第一、全球前三的数字遗嘱平台",
  problemTitle:"解决的问题",
  problem1:"95%的韩国人没有遗嘱就去世（法院行政处 2024）",
  problem2:"遗产纠纷每年造成数万亿韩元损失（最高法院 2024）",
  problem3:"传统遗嘱公证费用50万韩元以上（公证人协会 2024）",
  problem4:"700万海外韩国人 — 无跨国继承服务（外交部 2024）",
  problem5:"亚洲数字遗嘱平台竞争对手为零（自主调查 2024）",
  problem6:"死后遗嘱未被发现的情况频发（法务部 2023）",
  marketTitle:"全球市场现状",
  marketDesc:"老龄化加速·数字化转型·立法 — 三大趋势同时汇聚的最佳进入时机",
  countryTitle:"各国市场分析",
  countryDesc:"韩国 → 日本 → 大中华区 → 美国 → 中东 顺序进入战略",
  diffTitle:"差异化与独立性",
  diffDesc:"10项创新中7项是全球任何竞争对手都未尝试过的独创技术",
  bizTitle:"商业模式·收益结构",
  bizDesc:"不仅仅是订阅 — 覆盖整个生命周期的多层重复收益模式",
  roadmapTitle:"愿景·成长路线图",
  roadmapDesc:"从亚洲出发，向全球扩张的阶段性成长战略",
  teamTitle:"团队与投资条件",
  contactTitle:"投资咨询",
  contactDesc:"A轮 · 目标融资额 $5~10M · 估值协商",
  submit:"发送投资咨询",
  success:"已收到！我们将在48小时内与您联系。",
  fname:"姓名",fcompany:"公司名",femail:"邮箱",famount:"投资意向金额",fmsg:"咨询内容",
},
ar:{
  title:"SARAM - خطة العمل",
  sub:"نظام الوصية الرقمية الأول عالمياً — تحليل السوق والتميز والرؤية ونموذج الإيرادات",
  toc:"جدول المحتويات",
  s1:"1. نظرة عامة على الأعمال",s2:"2. نظرة عامة على السوق",s3:"3. تحليل السوق حسب الدولة",
  s4:"4. التحليل التنافسي",s5:"5. نموذج الأعمال والإيرادات",
  s6:"6. الرؤية وخارطة الطريق",s7:"7. الفريق والاستثمار",s8:"8. تواصل للاستثمار",
  overview:"نظرة عامة",
  overviewDesc:"SARAM هو أول نظام وصية رقمية في العالم، مسؤول عن العملية بأكملها من صياغة الوصية إلى التنفيذ التلقائي بعد الوفاة.",
  missionTitle:"الرسالة",
  mission:"تمكين أي شخص من إتمام وصية سارية قانونياً في 17 دقيقة، تُنفَّذ تلقائياً بعد الوفاة.",
  visionTitle:"الرؤية",
  vision:"الأول في آسيا، ضمن أفضل 3 عالمياً في منصات الوصايا الرقمية بحلول 2030",
  problemTitle:"المشاكل التي نحلها",
  problem1:"95% من الكوريين يموتون بدون وصية (إدارة المحاكم 2024)",
  problem2:"خسائر تريليونات من النزاعات الإرثية سنوياً (المحكمة العليا 2024)",
  problem3:"تكلفة توثيق الوصية التقليدية 400 دولار+ (جمعية كتّاب العدل 2024)",
  problem4:"7 ملايين كوري في الخارج — لا خدمة إرث متعدد الجنسيات (وزارة الخارجية 2024)",
  problem5:"صفر منافسين في منصات الوصايا الرقمية الآسيوية (بحث السوق 2024)",
  problem6:"حالات كثيرة لعدم العثور على الوصية بعد الوفاة (وزارة العدل 2023)",
  marketTitle:"نظرة عامة على السوق العالمي",
  marketDesc:"شيخوخة متسارعة · تحول رقمي · تشريعات — ثلاثة اتجاهات كبرى تتقاطع في التوقيت المثالي",
  countryTitle:"تحليل السوق حسب الدولة",
  countryDesc:"كوريا → اليابان → الصين الكبرى → أمريكا → الشرق الأوسط",
  diffTitle:"التميز والاستقلالية",
  diffDesc:"7 من أصل 10 ابتكارات هي الأولى عالمياً لم يجرب أي منافس أياً منها",
  bizTitle:"نموذج الأعمال وهيكل الإيرادات",
  bizDesc:"ليس مجرد اشتراك — إيرادات متكررة متعددة الطبقات عبر دورة الحياة الكاملة",
  roadmapTitle:"الرؤية وخارطة الطريق",
  roadmapDesc:"البداية من آسيا والتوسع عالمياً — استراتيجية نمو مرحلية",
  teamTitle:"الفريق وشروط الاستثمار",
  contactTitle:"تواصل للاستثمار",
  contactDesc:"الجولة A · الهدف $5~10M · التقييم قابل للتفاوض",
  submit:"إرسال استفسار الاستثمار",
  success:"تم الاستلام! سنتواصل معك خلال 48 ساعة.",
  fname:"الاسم",fcompany:"الشركة",femail:"البريد الإلكتروني",famount:"مبلغ الاستثمار",fmsg:"رسالتك",
},
ru:{
  title:"SARAM — Бизнес-план",
  sub:"Первая в мире цифровая ОС для завещаний — анализ рынка, дифференциация, видение и модель доходов",
  toc:"Содержание",
  s1:"1. Обзор бизнеса",s2:"2. Обзор рынка",s3:"3. Анализ по странам",
  s4:"4. Конкурентный анализ",s5:"5. Бизнес-модель и доходы",
  s6:"6. Видение и дорожная карта",s7:"7. Команда и инвестиции",s8:"8. Контакт",
  overview:"Обзор бизнеса",
  overviewDesc:"SARAM — первая в мире цифровая ОС для завещаний, отвечающая за весь процесс от составления завещания до автоматического посмертного исполнения.",
  missionTitle:"Миссия",
  mission:"Дать каждому возможность составить юридически действительное завещание за 17 минут, которое будет автоматически исполнено после смерти.",
  visionTitle:"Видение",
  vision:"№1 в Азии, топ-3 в мире по цифровым платформам завещаний к 2030 году",
  problemTitle:"Проблемы, которые мы решаем",
  problem1:"95% корейцев умирают без завещания (Судебная администрация 2024)",
  problem2:"Триллионы вон в год теряются в наследственных спорах (Верховный суд 2024)",
  problem3:"Традиционное нотариальное завещание стоит от $400 (Ассоциация нотариусов 2024)",
  problem4:"7 млн корейцев за рубежом — нет сервиса для международного наследования (МИД 2024)",
  problem5:"Ноль конкурентов на рынке цифровых завещаний в Азии (Собственное исследование 2024)",
  problem6:"Завещания часто не обнаруживаются после смерти (Министерство юстиции 2023)",
  marketTitle:"Обзор мирового рынка",
  marketDesc:"Ускорение старения · Цифровая трансформация · Законодательство — три мегатренда сходятся в идеальный момент",
  countryTitle:"Анализ рынка по странам",
  countryDesc:"Корея → Япония → Большой Китай → США → Ближний Восток",
  diffTitle:"Дифференциация и независимость",
  diffDesc:"7 из 10 инноваций — мировые первенства, которые ни один конкурент не пробовал",
  bizTitle:"Бизнес-модель и структура доходов",
  bizDesc:"Не просто подписка — многоуровневые повторяющиеся доходы на протяжении всего жизненного цикла",
  roadmapTitle:"Видение и дорожная карта",
  roadmapDesc:"Начиная с Азии, расширяясь по всему миру — поэтапная стратегия роста",
  teamTitle:"Команда и условия инвестирования",
  contactTitle:"Контакт для инвесторов",
  contactDesc:"Раунд A · Цель $5–10M · Оценка по договорённости",
  submit:"Отправить запрос",
  success:"Получено! Мы свяжемся с вами в течение 48 часов.",
  fname:"Имя",fcompany:"Компания",femail:"Email",famount:"Сумма инвестиций",fmsg:"Сообщение",
},
};

// ── 헬퍼 ─────────────────────────────────────────────────────────
function FadeIn({children,delay=0,className=""}:{children:React.ReactNode;delay?:number;className?:string}) {
  const ref=useRef(null);
  const inView=useInView(ref,{once:true,margin:"-50px"});
  return (
    <motion.div ref={ref} initial={{opacity:0,y:20}}
      animate={inView?{opacity:1,y:0}:{}} transition={{duration:0.55,delay,ease:"easeOut"}} className={className}>
      {children}
    </motion.div>
  );
}

function Sec({id,label,children}:{id:string;label:string;children:React.ReactNode}) {
  return (
    <section id={id} className="py-16 border-b border-gray-100">
      <FadeIn>
        <div className="flex items-center gap-3 mb-8">
          <span className="w-1 h-8 rounded-full" style={{background:"#C9A961"}} />
          <h2 className="text-2xl md:text-3xl font-black text-[#1F3864]">{label}</h2>
        </div>
      </FadeIn>
      {children}
    </section>
  );
}

function ChartImg({src,caption,note}:{src:string;caption:string;note?:string}) {
  return (
    <FadeIn className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden my-6">
      <div className="px-5 pt-4 pb-1">
        <p className="text-sm font-semibold text-[#1F3864]">{caption}</p>
      </div>
      <img src={src} alt={caption} className="w-full object-contain" loading="lazy" />
      {note && <p className="px-5 pb-4 text-xs text-gray-400 italic">{note}</p>}
    </FadeIn>
  );
}

function DataTable({headers,rows}:{headers:string[];rows:(string|React.ReactNode)[][]}) {
  return (
    <FadeIn className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{background:"#1F3864"}}>
            {headers.map((h,i)=>(
              <th key={i} className="px-4 py-3 text-left text-white font-semibold text-xs tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row,ri)=>(
            <tr key={ri} className={ri%2===0?"bg-white":"bg-gray-50"}>
              {row.map((cell,ci)=>(
                <td key={ci} className="px-4 py-3 text-gray-700 border-b border-gray-100 text-xs">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </FadeIn>
  );
}

function KpiGrid({items}:{items:{v:string;l:string;s:string;color?:string}[]}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      {items.map((k,i)=>(
        <FadeIn key={i} delay={i*0.07}>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-2xl font-black" style={{color:k.color||"#1F3864"}}>{k.v}</div>
            <div className="text-xs font-semibold text-gray-700 mt-1">{k.l}</div>
            <div className="text-xs text-gray-400 mt-0.5 italic">{k.s}</div>
          </div>
        </FadeIn>
      ))}
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────────
export default function PitchPage() {
  const [lang,setLang]=useState<L>("ko");
  const [langOpen,setLangOpen]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [form,setForm]=useState({name:"",company:"",email:"",amount:"",message:""});
  const t=TXT[lang];
  const isRtl=lang==="ar";
  const cur=LANGS.find(l=>l.code===lang)!;

  const fontFamily = isRtl ? "'Cairo','Tajawal',sans-serif"
    : lang==="ja" ? "'Noto Sans JP',sans-serif"
    : lang==="zh" ? "'Noto Sans SC',sans-serif"
    : "'Pretendard','Inter',sans-serif";

  return (
    <div dir={isRtl?"rtl":"ltr"} style={{fontFamily, background:"#F8F9FC", color:"#1A1A1A", minHeight:"100vh"}}>

      {/* ── TOPBAR ─────────────────────────────────────────────── */}
      <div style={{background:"#1F3864"}} className="py-2 px-4 text-center text-xs text-white/60">
        {lang==="ko" ? "본 문서는 기밀입니다. 허가된 투자자에게만 공개됩니다." :
         lang==="en" ? "CONFIDENTIAL — For authorized investors only." :
         lang==="ja" ? "本資料は機密です。許可された投資家のみに開示されます。" :
         lang==="zh" ? "本文件为机密文件，仅向授权投资者披露。" :
         lang==="ar" ? "هذه الوثيقة سرية — للمستثمرين المعتمدين فقط." :
         "КОНФИДЕНЦИАЛЬНО — только для авторизованных инвесторов."}
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                style={{background:"#1F3864"}}>S</span>
              <span className="font-black text-sm text-[#1F3864]">{t.title}</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {/* 언어 */}
            <div className="relative">
              <button onClick={()=>setLangOpen(!langOpen)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
                <span className="text-lg leading-none">{cur.flag}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen?"rotate-180":""}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[140px]">
                  {LANGS.map(l=>(
                    <button key={l.code} onClick={()=>{setLang(l.code);setLangOpen(false);}}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{color:lang===l.code?"#1F3864":"#374151",fontWeight:lang===l.code?700:400}}>
                      <span className="text-base">{l.flag}</span><span>{l.label}</span>
                      {lang===l.code && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C9A961]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <a href="#contact" className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
              style={{background:"#C9A961",color:"#1F3864"}}>
              {t.s8}
            </a>
          </div>
        </div>
      </nav>

      {/* ── COVER ──────────────────────────────────────────────── */}
      <div style={{background:"linear-gradient(135deg,#1F3864 0%,#0d1f3c 100%)"}} className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
              style={{background:"rgba(201,169,97,0.2)",color:"#C9A961",border:"1px solid rgba(201,169,97,0.3)"}}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961] animate-pulse" />
              Series A · 2026 · CONFIDENTIAL
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
              {t.title}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-white/60 text-lg mb-10 max-w-3xl">{t.sub}</p>
          </FadeIn>
          {/* 핵심 KPI */}
          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {v:"$3.7B",l:"2026 Global Market",s:"Grand View Research 2024"},
                {v:"9.3%",l:"CAGR 2026–2035",s:"IBISWorld 2024"},
                {v:"$14.1B",l:"2035 Projected Market",s:"Statista 2024"},
                {v:"$550",l:"Target LTV",s:"2.8x vs Trust & Will"},
              ].map((k,i)=>(
                <div key={i} className="rounded-xl p-4 border border-white/10"
                  style={{background:"rgba(255,255,255,0.07)"}}>
                  <div className="text-2xl font-black text-[#C9A961]">{k.v}</div>
                  <div className="text-xs font-semibold text-white mt-1">{k.l}</div>
                  <div className="text-xs text-white/40 mt-0.5">{k.s}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* ── 목차 ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.toc}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[t.s1,t.s2,t.s3,t.s4,t.s5,t.s6,t.s7,t.s8].map((s,i)=>(
              <a key={i} href={`#sec${i+1}`}
                className="text-xs text-gray-600 hover:text-[#1F3864] hover:font-semibold transition-all py-1 px-2 rounded hover:bg-gray-50">
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── 본문 ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* 1. 사업 개요 */}
        <Sec id="sec1" label={t.s1}>
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-black text-[#C9A961] uppercase tracking-wide mb-3">{t.missionTitle}</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{t.mission}</p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-sm font-black text-[#C9A961] uppercase tracking-wide mb-3">{t.visionTitle}</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{t.vision}</p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
              <h3 className="text-sm font-black text-[#1F3864] mb-3">{t.overview}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{t.overviewDesc}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <h3 className="text-base font-black text-[#1F3864] mb-4">{t.problemTitle}</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[t.problem1,t.problem2,t.problem3,t.problem4,t.problem5,t.problem6].map((p,i)=>(
                <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-gray-100 p-4">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                    style={{background:"#DC2626"}}>!</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </Sec>

        {/* 2. 시장 현황 */}
        <Sec id="sec2" label={t.s2}>
          <FadeIn>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{t.marketDesc}</p>
          </FadeIn>
          <KpiGrid items={[
            {v:"$3.7B",l:"2026 Global Market",s:"Grand View Research 2024",color:"#1F3864"},
            {v:"$14.1B",l:"2035 Projected",s:"Statista 2024",color:"#C9A961"},
            {v:"9.3%",l:"CAGR",s:"IBISWorld 2024",color:"#16A34A"},
            {v:"0",l:"Asian Competitors",s:"Market Research 2024",color:"#DC2626"},
          ]} />
          <ChartImg src={C.global}
            caption="Global Online Will & Estate Platform Market Growth 2020–2035"
            note="Source: Grand View Research 2024, Statista 2024, IBISWorld 2024" />
          <ChartImg src={C.willRate}
            caption="Will Writing Rate by Country & Growth Forecast"
            note="Source: AARP 2023, ONS UK 2023, Japan MOJ 2023, Korean Court Admin 2024" />
          <FadeIn>
            <DataTable
              headers={["Region","2024 Market","2030 Forecast","CAGR","Key Driver"]}
              rows={[
                ["North America","$1.8B","$3.9B","13.7%","Aging boomers + digital adoption"],
                ["Europe","$0.9B","$1.8B","12.2%","GDPR compliance + digitization"],
                ["Asia-Pacific","$0.6B","$2.1B","23.1%","Rapid aging + legal reform"],
                ["Middle East","$0.2B","$0.7B","23.4%","HNWI growth + Sharia law"],
                ["Latin America","$0.1B","$0.4B","26.0%","Digital infrastructure growth"],
                ["Total","$3.6B","$8.9B","16.4%","Global megatrend convergence"],
              ]}
            />
          </FadeIn>
        </Sec>

        {/* 3. 국가별 시장 */}
        <Sec id="sec3" label={t.s3}>
          <FadeIn>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{t.countryDesc}</p>
          </FadeIn>
          <ChartImg src={C.tam}
            caption="TAM / SAM / SOM by Country — SARAM Target Markets"
            note="Source: Statistics Korea, Japan MOJ, IBISWorld, Capgemini World Wealth Report 2024" />
          <FadeIn>
            <DataTable
              headers={["Country","TAM","SAM","SOM (5yr)","Will Rate","Entry","Key Opportunity"]}
              rows={[
                ["🇰🇷 Korea","$4.2B","$0.8B","$120M","5%","2026 Q1","Zero competitors, super-aged society 2025"],
                ["🇯🇵 Japan","$18.5B","$3.2B","$350M","12%","2026 Q3","Digitization law Oct 2025, ¥60T inheritance/yr"],
                ["🇨🇳 HK+TW","$8.3B","$1.1B","$80M","8%","2027 Q1","HK HNWI concentration, mature digital infra"],
                ["🇺🇸 USA","$42.0B","$5.8B","$420M","46%","2027 Q3","1M Korean-Americans untapped, Trust&Will gap"],
                ["🇸🇦 GCC","$12.7B","$2.1B","$180M","15%","2028 Q1","720K HNWI, Sharia law specialization"],
                ["🇩🇪 Germany","$6.8B","$1.0B","$50M","38%","2028 Q4","GDPR-ready, high digital literacy"],
                ["🇬🇧 UK","$5.2B","$0.9B","$40M","54%","2029 Q1","Mature market, premium positioning"],
              ]}
            />
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-6">
            <ChartImg src={C.kojp}
              caption="Korea & Japan — Aging + Market Detail"
              note="Source: Statistics Korea, FSS, Japan NTA, MOJ 2024" />
            <ChartImg src={C.usme}
              caption="USA & Middle East — Market Detail"
              note="Source: IBISWorld, US Census, Capgemini 2024" />
          </div>

          {/* 국가별 상세 카드 */}
          <FadeIn>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {[
                {flag:"🇰🇷",name:"Korea",tam:"$4.2B",color:"#1F3864",
                  facts:["유언 작성률 5% (미국 46% 대비)","2025년 초고령사회 진입","경쟁사 전무 — 블루오션","안심상속 원스톱 API 연동 가능"]},
                {flag:"🇯🇵",name:"Japan",tam:"$18.5B",color:"#C9A961",
                  facts:["공정증서 디지털화 법제화 2025.10","연간 상속 규모 60조엔","유언 작성률 12% → 빠른 성장","한국 유사 법체계 — 빠른 적용"]},
                {flag:"🇨🇳",name:"Greater China",tam:"$8.3B",color:"#3B82F6",
                  facts:["홍콩 HNWI 18만명 집중","대만 디지털 인프라 성숙","중국 본토는 규제 복잡 — 홍콩 우선","알리페이·위챗페이 연동"]},
                {flag:"🇺🇸",name:"USA",tam:"$42.0B",color:"#8B5CF6",
                  facts:["재미한인 100만명 미개척 니치","Trust & Will 연 $199 구독 공백","California·New York 우선","Stripe 결제 연동 완료"]},
                {flag:"🇸🇦",name:"Middle East",tam:"$12.7B",color:"#F59E0B",
                  facts:["GCC 6국 HNWI 72만명","샤리아 상속법 특화 (2:1 비율)","아랍어 RTL 완전 지원","두바이 핀테크 허브 활용"]},
                {flag:"🇩🇪",name:"Europe",tam:"$12.0B",color:"#0D9488",
                  facts:["독일·영국 합산 $12B","GDPR 완전 준수","높은 디지털 리터러시","2028년 이후 진출 예정"]},
              ].map((c,i)=>(
                <FadeIn key={i} delay={i*0.06}>
                  <div className="bg-white rounded-2xl border-l-4 p-5 shadow-sm" style={{borderColor:c.color}}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="font-black text-sm text-[#1F3864]">{c.name}</div>
                        <div className="text-xs font-bold" style={{color:c.color}}>TAM {c.tam}</div>
                      </div>
                    </div>
                    <ul className="space-y-1">
                      {c.facts.map((f,fi)=>(
                        <li key={fi} className="flex items-start gap-1.5 text-xs text-gray-600">
                          <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{background:c.color}} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </Sec>

        {/* 4. 경쟁사 분석 */}
        <Sec id="sec4" label={t.s4}>
          <FadeIn>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{t.diffDesc}</p>
          </FadeIn>
          <ChartImg src={C.radar}
            caption="Competitor Feature Comparison — SARAM vs Global Peers"
            note="Source: Company research, competitor public disclosures 2024" />
          <FadeIn>
            <DataTable
              headers={["Feature","SARAM","Trust & Will","Farewill","GoodTrust","LegalZoom"]}
              rows={[
                ["AI Will Drafting","✅ Free","✅ $199/yr","✅ £90","✅ $149","✅ $89"],
                ["Physical Badge","✅ World First","❌","❌","❌","❌"],
                ["4-Layer Death Detection","✅ World First","❌","❌","❌","❌"],
                ["Lawyer Marketplace","✅ Post-death focus","✅ Pre-death only","✅ Pre-death only","❌","✅ Pre-death only"],
                ["Multi-Jurisdiction","✅ World First","❌ US only","❌ UK only","❌ US only","❌ US only"],
                ["Video Will + Future Delivery","✅ World First","❌","❌","✅ Basic","❌"],
                ["Handwritten Will Scan","✅ AI Verified","❌","❌","❌","❌"],
                ["Re-certification System","✅ ₩15,000","❌ Full repurchase","❌ Full repurchase","❌","❌"],
                ["Arabic RTL + Sharia Law","✅ World First","❌","❌","❌","❌"],
                ["7 Languages","✅ 7 langs","❌ English only","❌ English only","❌ English only","❌ English only"],
                ["Beneficiary Auto-Notify","✅ Global","⚠️ Limited","⚠️ Limited","✅ Basic","❌"],
                ["Blockchain Hash","✅ Polygon","❌","❌","❌","❌"],
                ["Customer LTV","$550 (target)","$199","$150","$120","$89"],
                ["Asia Market","✅ Primary","❌","❌","❌","❌"],
              ]}
            />
          </FadeIn>

          {/* 10가지 혁신 */}
          <FadeIn delay={0.1}>
            <h3 className="text-base font-black text-[#1F3864] mt-8 mb-4">
              {lang==="ko" ? "10가지 독창적 혁신" : "10 Proprietary Innovations"}
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                {no:"01",title:"물리적 Badge 시스템",desc:"MedicAlert + AirTag + 유언 인증 결합. 스테인레스·티타늄 5종. 착용 자체가 마케팅.",badge:true},
                {no:"02",title:"4중 사망 감지 시스템",desc:"가족 신고 + 정부 DB + Dead Man's Switch + 응급 발견자. 2채널 교차 검증 후 자동 집행.",badge:true},
                {no:"03",title:"변호사 마켓플레이스",desc:"생전 0%, 사후 100% 등장. 진짜 필요한 순간에만 매칭. 플랫폼 수수료 15-25%.",badge:true},
                {no:"04",title:"상속자 직접 등록",desc:"사망 시 전 세계 상속자 자동 알림. 현지 언어·시간대 맞춤. 72시간 이의제기 후 공개.",badge:true},
                {no:"05",title:"체크박스 17분 완성",desc:"AI가 체크박스 → 법률 문장 자동 변환. 유류분 실시간 검증. 상속세 자동 계산.",badge:false},
                {no:"06",title:"영상 유언 + 미래 전달",desc:"손녀 성인식, 아들 결혼식 날 자동 전송. 평생 보관. 수십 년 후에도 재생 보장.",badge:true},
                {no:"07",title:"자필 유언 스캔 인증",desc:"AI 형식 검증 + 위조 탐지 + 블록체인 무결성 기록.",badge:false},
                {no:"08",title:"재인증 체계 (LTV 28배)",desc:"결혼·출산·이사·자산 변동마다 재인증 유도. 최초 ₩49,000 → 재인증 ₩15,000.",badge:true},
                {no:"09",title:"글로벌 멀티관할권",desc:"한국+미국+일본 자산 동시 관리. 각국 법률 자동 적용. 크로스보더 상속 자동 조율.",badge:true},
                {no:"10",title:"7개 언어 + 아랍어 RTL",desc:"한국어·영어·일본어·중국어·독일어·스페인어·아랍어. 샤리아 상속법 자동 적용.",badge:false},
              ].map((item,i)=>(
                <div key={i} className="flex gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                  <span className="text-xs font-black text-[#C9A961] shrink-0 w-6 mt-0.5">{item.no}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[#1F3864]">{item.title}</span>
                      {item.badge && (
                        <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
                          style={{background:"rgba(201,169,97,0.15)",color:"#C9A961"}}>
                          세계 최초
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </Sec>

        {/* 5. 비즈니스 모델 */}
        <Sec id="sec5" label={t.s5}>
          <FadeIn>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{t.bizDesc}</p>
          </FadeIn>
          <FadeIn>
            <DataTable
              headers={["Product","Price (KRW)","Price (USD)","Type","Revenue Driver"]}
              rows={[
                ["회원가입","무료","Free","Acquisition","진입장벽 0"],
                ["AI 유언장 작성","무료","Free","Acquisition","전환율 극대화"],
                ["최초 전자 인증","₩49,000","$39","Core Revenue","1회성 필수"],
                ["재인증 (수정)","₩15,000","$15","Recurring","생애 이벤트마다"],
                ["영상 유언","+₩29,000","+$29","Upsell","감성 옵션"],
                ["자필 스캔 인증","₩19,000","$19","Upsell","어르신 특화"],
                ["연 멤버십 (2년차~)","₩29,000/yr","$29/yr","Subscription","장기 LTV"],
                ["Badge Essential","₩49,000","$49","Hardware","마케팅 채널"],
                ["Badge Wearable","₩79,000","$79","Hardware","프리미엄"],
                ["Badge Necklace","₩99,000","$99","Hardware","프리미엄"],
                ["Badge Premium","₩299,000","$299","Hardware","럭셔리"],
                ["Badge Custom","₩500,000+","$500+","Hardware","VIP·기업"],
                ["변호사 생전 자문","₩30,000~","$30+","Marketplace","매칭 수수료"],
                ["변호사 사후 집행","보수의 15-25%","15-25%","Marketplace","플랫폼 수수료"],
              ]}
            />
          </FadeIn>
          <ChartImg src={C.revenue}
            caption="Revenue Forecast by Country 2026–2030 & LTV Comparison"
            note="Source: Farewill Annual Report 2023, Trust & Will Investor Deck 2024" />
          <FadeIn>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {[
                {title:"Year 1 (2026)",rev:"₩5억",users:"5,000명",ltv:"₩100,000",color:"#1F3864"},
                {title:"Year 3 (2028)",rev:"₩200억",users:"200,000명",ltv:"₩100,000",color:"#C9A961"},
                {title:"Year 5 (2030)",rev:"₩1,000억+",users:"1,000,000명+",ltv:"₩100,000+",color:"#16A34A"},
              ].map((p,i)=>(
                <FadeIn key={i} delay={i*0.1}>
                  <div className="rounded-2xl p-5 text-white" style={{background:p.color}}>
                    <div className="text-sm font-bold opacity-70 mb-2">{p.title}</div>
                    <div className="text-2xl font-black mb-1">{p.rev}</div>
                    <div className="text-xs opacity-70">누적 사용자 {p.users}</div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </FadeIn>
        </Sec>

        {/* 6. 비전 & 로드맵 */}
        <Sec id="sec6" label={t.s6}>
          <FadeIn>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">{t.roadmapDesc}</p>
          </FadeIn>
          <FadeIn>
            <DataTable
              headers={["Phase","Period","Market","Key Milestones","Revenue Target","MAU"]}
              rows={[
                ["Phase 1","2026 Q1–Q4","Korea","런칭, eKYC, Badge 출시, 토스페이먼츠","₩5억","50,000"],
                ["Phase 2","2027 Q1–Q4","Japan","일본 법인 설립, 공정증서 연동, LINE Pay","₩30억","200,000"],
                ["Phase 3","2028 Q1–Q4","HK+TW+ME","중화권 진출, 아랍어 RTL, 샤리아법","₩200억","1,000,000"],
                ["Phase 4","2029 Q1–Q4","USA","재미한인 캠페인, Stripe, 변호사 마켓","₩500억","3,000,000"],
                ["Phase 5","2030+","Global","글로벌 1위 목표, Series B/C, IPO 준비","₩1,000억+","10,000,000+"],
              ]}
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              {[
                {year:"2026",title:"한국 런칭",items:["AI 유언장 작성","eKYC 본인인증","Badge 시스템","토스페이먼츠"],color:"#1F3864"},
                {year:"2027",title:"일본 진출",items:["일본 법인 설립","공정증서 연동","LINE Pay·PayPay","변호사 마켓 베타"],color:"#C9A961"},
                {year:"2028",title:"중화권·중동",items:["홍콩·대만 진출","아랍어 RTL","샤리아 상속법","GCC 6국 진출"],color:"#3B82F6"},
                {year:"2030",title:"미국·글로벌",items:["재미한인 캠페인","글로벌 1위 목표","Series B/C","IPO 준비"],color:"#16A34A"},
              ].map((ph,i)=>(
                <div key={i} className="rounded-2xl p-5 text-white relative overflow-hidden" style={{background:ph.color}}>
                  <div className="text-4xl font-black opacity-15 absolute top-2 right-3">{ph.year}</div>
                  <div className="text-xs font-bold opacity-60 mb-1">{ph.year}</div>
                  <div className="text-base font-black mb-3">{ph.title}</div>
                  <ul className="space-y-1">
                    {ph.items.map((it,ii)=>(
                      <li key={ii} className="flex items-center gap-1.5 text-xs opacity-80">
                        <span className="w-1 h-1 rounded-full bg-white shrink-0" />{it}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </FadeIn>
        </Sec>

        {/* 7. 팀 & 투자 조건 */}
        <Sec id="sec7" label={t.s7}>
          <div className="grid md:grid-cols-2 gap-6">
            <FadeIn>
              <div className="bg-[#1F3864] rounded-2xl p-6 text-white">
                <div className="w-14 h-14 rounded-2xl bg-[#C9A961] flex items-center justify-center text-xl font-black text-[#1F3864] mb-4">J</div>
                <div className="text-xl font-black mb-1">라수환 (Jeff Lah)</div>
                <div className="text-sm text-white/60 mb-1">대표이사 · 창업자</div>
                <div className="text-xs text-white/40 mb-5">주식회사 사람 (SARAM Inc.)</div>
                <div className="grid grid-cols-2 gap-2">
                  {["제품기획","디자인","회계·재무","글로벌 전략"].map((s,i)=>(
                    <div key={i} className="flex items-center gap-1.5 text-xs text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9A961]" />{s}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h4 className="font-black text-[#1F3864] mb-4 text-sm">투자 조건 (Term Sheet 요약)</h4>
                <DataTable
                  headers={["항목","내용"]}
                  rows={[
                    ["투자 라운드","Series A"],
                    ["목표 투자금","$5M ~ $10M"],
                    ["기업 가치","협의 (Pre-money)"],
                    ["투자 형태","보통주 / 전환사채"],
                    ["사용 계획","기술개발 40% · 마케팅 25% · 법무 15% · 글로벌 12% · 운영 8%"],
                    ["Exit 전략","Series B/C → 글로벌 IPO (2030 목표)"],
                    ["경쟁사 비교","Trust & Will 기업가치 $100M+ (2021)"],
                  ]}
                />
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mt-6">
              <h4 className="font-black text-[#1F3864] mb-4 text-sm">핵심 채용 포지션 (투자금 활용)</h4>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  {role:"CTO",desc:"풀스택 + AI/ML 경험자. 유언 AI 엔진 개발 총괄."},
                  {role:"일본 법무 담당",desc:"일본 변호사 자격. 공정증서 디지털화 대응."},
                  {role:"중동 사업개발",desc:"아랍어 원어민. 샤리아법 전문. GCC 파트너십."},
                  {role:"eKYC 엔지니어",desc:"NICE평가정보·Veriff 연동. 블록체인 해시."},
                  {role:"마케팅 매니저",desc:"재외한인 커뮤니티 타깃. SNS·콘텐츠 마케팅."},
                  {role:"Badge 제조 PM",desc:"스테인레스·티타늄 제조 파트너 관리."},
                ].map((p,i)=>(
                  <div key={i} className="rounded-xl border border-gray-100 p-3">
                    <div className="font-bold text-sm text-[#1F3864] mb-1">{p.role}</div>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </Sec>

        {/* 8. 투자 문의 */}
        <Sec id="sec8" label={t.s8}>
          <FadeIn>
            <p className="text-gray-600 text-sm mb-6">{t.contactDesc}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-green-800 font-semibold text-sm">{t.success}</p>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSubmitted(true);}}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4 max-w-2xl">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fname} *</label>
                    <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fcompany} *</label>
                    <input required value={form.company} onChange={e=>setForm({...form,company:e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.femail} *</label>
                  <input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.famount}</label>
                  <input value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}
                    placeholder="e.g. $1M, ₩10억"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{t.fmsg}</label>
                  <textarea rows={4} value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] transition-colors resize-none" />
                </div>
                <button type="submit"
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={{background:"#1F3864",color:"white"}}>
                  {t.submit} →
                </button>
              </form>
            )}
          </FadeIn>
        </Sec>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <footer style={{background:"#0d1f3c"}} className="py-8 text-white/40 text-xs">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <span>© 2026 주식회사 사람 (SARAM Inc.) · All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/"><span className="hover:text-white/70 cursor-pointer transition-colors">메인 사이트</span></Link>
            <Link href="/invest"><span className="hover:text-white/70 cursor-pointer transition-colors">투자 설명서</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
