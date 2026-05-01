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

// 언론소개 데이터 — 언어별 뉴스 제목 번역 포함
const pressItems: {
  flag: string;
  country: Record<Language, string>;
  outlet: string;
  headline: Record<Language, string>;
}[] = [
  {
    flag: "🇰🇷",
    country: { ko: "한국", en: "Korea", ja: "韓国", zh: "韩国", de: "Korea", es: "Corea", ar: "كوريا", fr: "Corée", ru: "Корея", hi: "कोरिया", pt: "Coreia" },
    outlet: "조선일보",
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
  },
  {
    flag: "🇯🇵",
    country: { ko: "일본", en: "Japan", ja: "日本", zh: "日本", de: "Japan", es: "Japón", ar: "اليابان", fr: "Japon", ru: "Япония", hi: "जापान", pt: "Japão" },
    outlet: "朝日新聞",
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
  },
  {
    flag: "🇺🇸",
    country: { ko: "미국", en: "USA", ja: "米国", zh: "美国", de: "USA", es: "EE.UU.", ar: "الولايات المتحدة", fr: "États-Unis", ru: "США", hi: "अमेरिका", pt: "EUA" },
    outlet: "Bloomberg",
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
  },
  {
    flag: "🇫🇷",
    country: { ko: "프랑스", en: "France", ja: "フランス", zh: "法国", de: "Frankreich", es: "Francia", ar: "فرنسا", fr: "France", ru: "Франция", hi: "फ्रांस", pt: "França" },
    outlet: "Le Monde",
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
  },
  {
    flag: "🇸🇦",
    country: { ko: "중동", en: "Middle East", ja: "中東", zh: "中东", de: "Naher Osten", es: "Oriente Medio", ar: "الشرق الأوسط", fr: "Moyen-Orient", ru: "Ближний Восток", hi: "मध्य पूर्व", pt: "Oriente Médio" },
    outlet: "Al Jazeera",
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
        {/* 미디어 언급 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-6">
            {t.trust.mediaTitle}
          </p>
          <div className="max-w-3xl mx-auto w-full divide-y divide-gray-100">
            {pressItems.map((item, i) => (
              <motion.div
                key={item.outlet}
                initial={{ opacity: 0, x: -16 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4 py-4 group cursor-default hover:bg-gray-50 rounded-lg px-3 transition-colors"
              >
                {/* 순번 */}
                <span className="text-[#C9A961] font-bold text-sm w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                {/* 국기 + 국가명 */}
                <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
                  <span className="text-lg">{item.flag}</span>
                  <span className="text-gray-400 text-xs font-medium">{item.country[language as Language]}</span>
                </div>
                {/* 신문사명 */}
                <span className="text-[#1F3864] font-bold text-sm w-28 flex-shrink-0 group-hover:text-[#C9A961] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {item.outlet}
                </span>
                {/* 뉴스 제목 */}
                <span className="text-gray-600 text-sm leading-snug flex-1">
                  {item.headline[language as Language]}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C9A961] flex-shrink-0 mt-0.5 transition-colors" />
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
