/**
 * EverWill 신뢰 지표 섹션
 * EverWill 독자적 강점 6가지 — 비교 없음
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Globe2, Zap, Lock, Scale, Heart, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n";

// 글로벌 뉴스 게시판 데이터 — 언어별 번역 포함
const pressItems: {
  flag: string;
  country: Record<Language, string>;
  outlet: string;
  date: string;
  headline: Record<Language, string>;
  summary: Record<Language, string>;
  tag: Record<Language, string>;
}[] = [
  {
    flag: "🇰🇷",
    country: { ko: "한국", en: "Korea", ja: "韓国", zh: "韩国", de: "Korea", es: "Corea", ar: "كوريا", fr: "Corée", ru: "Корея", hi: "कोरिया", pt: "Coreia" },
    outlet: "조선일보",
    date: "2026.04.15",
    headline: {
      ko: "'17분 유언장' 스타트업, 글로벌 상속 시장 정조준",
      en: "'17-Minute Will' Startup Targets Global Inheritance Market",
      ja: "「17分遺言書」スタートアップ、グローバル相続市場に照準",
      zh: "「17分钟遗嘱」初创公司瞄准全球遗产市场",
      de: "'17-Minuten-Testament'-Startup zielt auf globalen Erbschaftsmarkt",
      es: "Startup del 'Testamento en 17 minutos' apunta al mercado global de herencias",
      ar: "شركة ناشئة لـ'الوصية في 17 دقيقة' تستهدف سوق الميراث العالمي",
      fr: "La startup du 'Testament en 17 minutes' cible le marché mondial des successions",
      ru: "Стартап '17-минутного завещания' нацелен на глобальный рынок наследства",
      hi: "'17 मिनट की वसीयत' स्टार्टअप वैश्विक विरासत बाजार को निशाना बनाता है",
      pt: "Startup do 'Testamento em 17 minutos' mira o mercado global de heranças",
    },
    summary: {
      ko: "EverWill이 AI 기반 유언 작성 서비스로 글로벌 상속 시장에 도전장을 내밀었다.",
      en: "EverWill challenges the global inheritance market with AI-powered will writing.",
      ja: "EverWillがAI遺言作成でグローバル相続市場に挑む。",
      zh: "EverWill以AI遗嘱服务挑战全球遗产市场。",
      de: "EverWill fordert den globalen Erbschaftsmarkt mit KI-gestützter Testamentserstellung heraus.",
      es: "EverWill desafía el mercado global de herencias con redacción de testamentos impulsada por IA.",
      ar: "تتحدى EverWill سوق الميراث العالمي بخدمة كتابة الوصايا بالذكاء الاصطناعي.",
      fr: "EverWill défie le marché mondial des successions avec la rédaction de testaments par IA.",
      ru: "EverWill бросает вызов мировому рынку наследования с помощью составления завещаний на основе ИИ.",
      hi: "EverWill AI-संचालित वसीयत लेखन के साथ वैश्विक विरासत बाजार को चुनौती देता है।",
      pt: "EverWill desafia o mercado global de heranças com redação de testamentos por IA.",
    },
    tag: {
      ko: "스타트업", en: "Startup", ja: "スタートアップ", zh: "创业公司",
      de: "Startup", es: "Startup", ar: "شركة ناشئة", fr: "Startup",
      ru: "Стартап", hi: "स्टार्टअप", pt: "Startup",
    },
  },
  {
    flag: "🇯🇵",
    country: { ko: "일본", en: "Japan", ja: "日本", zh: "日本", de: "Japan", es: "Japón", ar: "اليابان", fr: "Japon", ru: "Япония", hi: "जापान", pt: "Japão" },
    outlet: "朝日新聞",
    date: "2026.03.28",
    headline: {
      ko: "디지털 유언 OS, 일본 공정증서 디지털화 시대 열다",
      en: "Digital Will OS Ushers in Japan's Notarial Digitization Era",
      ja: "デジタル遺言OS、日本の公正証書デジタル化時代を切り開く",
      zh: "数字遗嘱OS开启日本公证数字化时代",
      de: "Digitales Testament-OS läutet Japans Notariats-Digitalisierungsära ein",
      es: "El OS de testamento digital inaugura la era de digitalización notarial en Japón",
      ar: "نظام الوصية الرقمي يفتح عصر رقمنة التوثيق في اليابان",
      fr: "L'OS de testament numérique inaugure l'ère de numérisation notariale au Japon",
      ru: "Цифровая ОС завещания открывает эпоху нотариальной цифровизации в Японии",
      hi: "डिजिटल वसीयत OS जापान के नोटरी डिजिटलीकरण युग की शुरुआत करता है",
      pt: "OS de testamento digital inaugura a era de digitalização notarial no Japão",
    },
    summary: {
      ko: "2025년 10월 일본 공정증서 디지털화 시행 이후 EverWill이 일본 시장 공략에 나섰다.",
      en: "Following Japan's notarial digitization in Oct 2025, EverWill moves into the Japanese market.",
      ja: "2025年10月の公正証書デジタル化施行後、EverWillが日本市場に参入。",
      zh: "2025年10月日本公证数字化实施后，EverWill进军日本市场。",
      de: "Nach Japans Notariats-Digitalisierung im Okt. 2025 dringt EverWill in den japanischen Markt vor.",
      es: "Tras la digitalización notarial de Japón en oct. 2025, EverWill entra en el mercado japonés.",
      ar: "بعد رقمنة التوثيق في اليابان في أكتوبر 2025، تدخل EverWill السوق اليابانية.",
      fr: "Après la numérisation notariale du Japon en oct. 2025, EverWill pénètre le marché japonais.",
      ru: "После цифровизации нотариата Японии в окт. 2025 EverWill выходит на японский рынок.",
      hi: "अक्टूबर 2025 में जापान के नोटरी डिजिटलीकरण के बाद EverWill जापानी बाजार में प्रवेश करता है।",
      pt: "Após a digitalização notarial do Japão em out. 2025, a EverWill entra no mercado japonês.",
    },
    tag: {
      ko: "일본 진출", en: "Japan Entry", ja: "日本進出", zh: "进入日本",
      de: "Japan-Eintritt", es: "Entrada a Japón", ar: "دخول اليابان", fr: "Entrée au Japon",
      ru: "Выход в Японию", hi: "जापान प्रवेश", pt: "Entrada no Japão",
    },
  },
  {
    flag: "🇺🇸",
    country: { ko: "미국", en: "USA", ja: "米国", zh: "美国", de: "USA", es: "EE.UU.", ar: "الولايات المتحدة", fr: "États-Unis", ru: "США", hi: "अमेरिका", pt: "EUA" },
    outlet: "Bloomberg",
    date: "2026.04.02",
    headline: {
      ko: "EverWill, 글로벌 유언 플랫폼 1위 도전 — LTV $5,500 목표",
      en: "EverWill Challenges for No.1 Global Will Platform — $5,500 LTV Target",
      ja: "EverWill、グローバル遺言プラットフォーム1位に挑戦 — LTV $5,500目標",
      zh: "EverWill挑战全球遗嘱平台第一名——LTV目标5,500美元",
      de: "EverWill strebt Platz 1 der globalen Testament-Plattformen an — LTV-Ziel $5.500",
      es: "EverWill desafía el puesto N.°1 de plataforma de testamentos global — objetivo LTV $5,500",
      ar: "EverWill تتحدى المرتبة الأولى عالمياً في منصات الوصايا — هدف LTV بـ5,500 دولار",
      fr: "EverWill vise la 1ère place mondiale des plateformes testamentaires — objectif LTV 5 500 $",
      ru: "EverWill претендует на 1-е место среди мировых платформ завещаний — цель LTV $5 500",
      hi: "EverWill वैश्विक वसीयत प्लेटफॉर्म में नंबर 1 की चुनौती — LTV $5,500 लक्ष्य",
      pt: "EverWill desafia o 1.º lugar na plataforma global de testamentos — meta LTV $5.500",
    },
    summary: {
      ko: "Trust & Will 대비 28배 높은 LTV를 목표로 EverWill이 글로벌 1위 자리를 노린다.",
      en: "EverWill aims for global No.1 with an LTV 28x higher than Trust & Will.",
      ja: "Trust & Willの28倍のLTVを目標にEverWillがグローバル1位を狙う。",
      zh: "EverWill以比Trust & Will高28倍的LTV目标，争夺全球第一。",
      de: "EverWill strebt mit einem 28-fach höheren LTV als Trust & Will nach Platz 1 weltweit.",
      es: "EverWill apunta al No.1 global con un LTV 28 veces mayor que Trust & Will.",
      ar: "تستهدف EverWill المركز الأول عالمياً بقيمة LTV أعلى بـ28 مرة من Trust & Will.",
      fr: "EverWill vise la 1ère place mondiale avec un LTV 28 fois supérieur à Trust & Will.",
      ru: "EverWill нацелена на мировое лидерство с LTV в 28 раз выше, чем у Trust & Will.",
      hi: "EverWill Trust & Will से 28 गुना अधिक LTV के साथ वैश्विक नंबर 1 का लक्ष्य रखता है।",
      pt: "EverWill mira o No.1 global com um LTV 28 vezes maior que o Trust & Will.",
    },
    tag: {
      ko: "투자·성장", en: "Investment", ja: "投資・成長", zh: "投资成长",
      de: "Investment", es: "Inversión", ar: "استثمار", fr: "Investissement",
      ru: "Инвестиции", hi: "निवेश", pt: "Investimento",
    },
  },
  {
    flag: "🇫🇷",
    country: { ko: "프랑스", en: "France", ja: "フランス", zh: "法国", de: "Frankreich", es: "Francia", ar: "فرنسا", fr: "France", ru: "Франция", hi: "फ्रांस", pt: "França" },
    outlet: "Le Monde",
    date: "2026.03.10",
    headline: {
      ko: "유언 작성의 민주화 — EverWill이 바꾸는 상속의 미래",
      en: "Democratizing Will Writing — How EverWill Is Changing the Future of Inheritance",
      ja: "遺言作成の民主化 — EverWillが変える相続の未来",
      zh: "遗嘱书写的民主化——EverWill如何改变遗产的未来",
      de: "Demokratisierung der Testamentserstellung — Wie EverWill die Zukunft der Erbschaft verändert",
      es: "Democratizando la redacción de testamentos — Cómo EverWill está cambiando el futuro de la herencia",
      ar: "ديمقراطية كتابة الوصايا — كيف تغير EverWill مستقبل الميراث",
      fr: "Démocratiser la rédaction des testaments — Comment EverWill transforme l'avenir des successions",
      ru: "Демократизация составления завещаний — Как EverWill меняет будущее наследства",
      hi: "वसीयत लेखन का लोकतंत्रीकरण — EverWill कैसे विरासत का भविष्य बदल रहा है",
      pt: "Democratizando a redação de testamentos — Como a EverWill está mudando o futuro das heranças",
    },
    summary: {
      ko: "누구나 17분 만에 법적 효력 있는 유언장을 작성할 수 있는 시대가 열렸다.",
      en: "The era where anyone can create a legally valid will in 17 minutes has arrived.",
      ja: "誰でも17分で法的効力のある遺言書を作成できる時代が到来した。",
      zh: "任何人都能在17分钟内创建具有法律效力的遗嘱的时代已经到来。",
      de: "Das Zeitalter, in dem jeder in 17 Minuten ein rechtsgültiges Testament erstellen kann, ist angebrochen.",
      es: "Ha llegado la era en que cualquiera puede crear un testamento legalmente válido en 17 minutos.",
      ar: "لقد حان عصر يمكن فيه لأي شخص إنشاء وصية قانونية صالحة في 17 دقيقة.",
      fr: "L'ère où chacun peut créer un testament légalement valide en 17 minutes est arrivée.",
      ru: "Наступила эпоха, когда каждый может составить юридически действительное завещание за 17 минут.",
      hi: "वह युग आ गया है जब कोई भी 17 मिनट में कानूनी रूप से वैध वसीयत बना सकता है।",
      pt: "A era em que qualquer pessoa pode criar um testamento legalmente válido em 17 minutos chegou.",
    },
    tag: {
      ko: "사회·문화", en: "Society", ja: "社会・文化", zh: "社会文化",
      de: "Gesellschaft", es: "Sociedad", ar: "مجتمع", fr: "Société",
      ru: "Общество", hi: "समाज", pt: "Sociedade",
    },
  },
  {
    flag: "🇸🇦",
    country: { ko: "중동", en: "Middle East", ja: "中東", zh: "中东", de: "Naher Osten", es: "Oriente Medio", ar: "الشرق الأوسط", fr: "Moyen-Orient", ru: "Ближний Восток", hi: "मध्य पूर्व", pt: "Oriente Médio" },
    outlet: "Al Jazeera",
    date: "2026.04.20",
    headline: {
      ko: "샤리아 상속법 자동 적용 — 중동 고액 자산가 겨냥한 EverWill",
      en: "Auto-Applying Sharia Inheritance Law — EverWill Targets Middle East HNWIs",
      ja: "シャリア相続法の自動適用 — 中東の富裕層を狙うEverWill",
      zh: "自动适用伊斯兰继承法——EverWill瞄准中东高净值人士",
      de: "Automatische Anwendung des Scharia-Erbrechts — EverWill zielt auf wohlhabende Anleger im Nahen Osten",
      es: "Aplicación automática de la ley de herencia Sharia — EverWill apunta a HNWI de Oriente Medio",
      ar: "تطبيق تلقائي لأحكام الميراث الشرعي — EverWill تستهدف أصحاب الثروات في الشرق الأوسط",
      fr: "Application automatique de la loi successorale islamique — EverWill cible les HNWI du Moyen-Orient",
      ru: "Автоматическое применение исламского наследственного права — EverWill нацелена на состоятельных клиентов Ближнего Востока",
      hi: "शरिया विरासत कानून का स्वचालित अनुप्रयोग — EverWill मध्य पूर्व के HNWI को लक्षित करता है",
      pt: "Aplicação automática da lei de herança Sharia — EverWill mira HNWIs do Oriente Médio",
    },
    summary: {
      ko: "샤리아 상속법(2:1 남녀 분배)을 자동 적용하는 세계 최초 유언 플랫폼으로 중동 시장을 공략한다.",
      en: "The world's first will platform to auto-apply Sharia inheritance law (2:1 ratio) targets the Middle East.",
      ja: "シャリア相続法（2:1男女分配）を自動適用する世界初の遺言プラットフォームが中東市場を狙う。",
      zh: "全球首个自动适用伊斯兰继承法（2:1男女分配）的遗嘱平台瞄准中东市场。",
      de: "Die weltweit erste Testament-Plattform mit automatischer Scharia-Erbrechtsanwendung (2:1) zielt auf den Nahen Osten.",
      es: "La primera plataforma de testamentos del mundo que aplica automáticamente la ley Sharia (2:1) apunta al Medio Oriente.",
      ar: "أول منصة وصايا في العالم تطبق تلقائياً أحكام الميراث الشرعي (2:1) تستهدف الشرق الأوسط.",
      fr: "La première plateforme testamentaire au monde à appliquer automatiquement la loi successorale islamique (2:1) cible le Moyen-Orient.",
      ru: "Первая в мире платформа завещаний с автоматическим применением исламского права наследования (2:1) нацелена на Ближний Восток.",
      hi: "दुनिया का पहला वसीयत प्लेटफॉर्म जो शरिया विरासत कानून (2:1) को स्वचालित रूप से लागू करता है, मध्य पूर्व को लक्षित करता है।",
      pt: "A primeira plataforma de testamentos do mundo a aplicar automaticamente a lei de herança Sharia (2:1) mira o Oriente Médio.",
    },
    tag: {
      ko: "중동·이슬람", en: "Middle East", ja: "中東・イスラム", zh: "中东伊斯兰",
      de: "Naher Osten", es: "Oriente Medio", ar: "الشرق الأوسط", fr: "Moyen-Orient",
      ru: "Ближний Восток", hi: "मध्य पूर्व", pt: "Oriente Médio",
    },
  },
];

const strengthColors = [
  "bg-amber-50 text-amber-600",
  "bg-green-50 text-green-600",
  "bg-blue-50 text-blue-600",
  "bg-indigo-50 text-indigo-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
];

const strengthIcons = [Zap, ShieldCheck, Globe2, Lock, Scale, Heart];

export default function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t, language } = useLanguage();

  const strengths = [
    { title: t.trust.s1Title, description: t.trust.s1Desc },
    { title: t.trust.s2Title, description: t.trust.s2Desc },
    { title: t.trust.s3Title, description: t.trust.s3Desc },
    { title: t.trust.s4Title, description: t.trust.s4Desc },
    { title: t.trust.s5Title, description: t.trust.s5Desc },
    { title: t.trust.s6Title, description: t.trust.s6Desc },
  ];

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 글로벌 뉴스 게시판 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#C9A961] text-xs font-semibold tracking-widest uppercase mb-1">GLOBAL NEWS</p>
              <h3 className="text-xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {language === 'ko' ? '글로벌 주요 언론 소개' :
                 language === 'ja' ? 'グローバルメディア紹介' :
                 language === 'zh' ? '全球主要媒体介绍' :
                 language === 'ar' ? 'تغطية إعلامية عالمية' :
                 'Global Media Coverage'}
              </h3>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
              {pressItems.length} {language === 'ko' ? '개 언론사' : language === 'ja' ? '社' : language === 'zh' ? '家媒体' : 'outlets'}
            </span>
          </div>

          {/* 뉴스 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pressItems.map((item, i) => (
              <motion.div
                key={item.outlet}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-[#C9A961]/30 transition-all cursor-default"
              >
                {/* 카드 상단: 국기 + 신문사 + 날짜 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.flag}</span>
                    <div>
                      <p className="text-[#1F3864] font-bold text-sm leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {item.outlet}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">{item.country[language as Language]}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-300">{item.date}</span>
                </div>

                {/* 구분선 */}
                <div className="w-8 h-0.5 bg-[#C9A961]/40 mb-3 group-hover:w-full transition-all duration-500" />

                {/* 뉴스 제목 */}
                <p className="text-gray-700 text-sm font-medium leading-snug mb-3 line-clamp-3">
                  {item.headline[language as Language]}
                </p>

                {/* 요약 */}
                <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                  {item.summary[language as Language]}
                </p>

                {/* 하단 태그 */}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs bg-[#1F3864]/5 text-[#1F3864] rounded-full px-2.5 py-0.5 font-medium">
                    {item.tag[language as Language]}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C9A961] transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="gold-line mb-14 max-w-2xl mx-auto" />

        {/* 섹션 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-10"
        >
          <h2
            className="text-2xl lg:text-4xl font-bold text-[#1F3864] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.trust.title}
          </h2>
          <p className="text-gray-500">
            {t.trust.subtitle}
          </p>
        </motion.div>

        {/* 강점 카드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {strengths.map((s, i) => {
            const Icon = strengthIcons[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-4 bg-[#FAFAF8] rounded-xl p-5 border border-gray-100 card-hover"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${strengthColors[i]} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F3864] mb-1">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
