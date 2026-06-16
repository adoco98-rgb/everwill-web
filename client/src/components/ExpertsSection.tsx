/**
 * ExpertsSection - 홈페이지 전문가 파트너 소개 섹션
 * - 14개국 국기 탭 (홈페이지 상단과 동일한 스타일)
 * - 사이트 언어에 따라 해당 국가 자동 선택 (한국어 → KR, 영어 → US 등)
 * - 카드 클릭 시 상세 모달 (경력·이력·소개 표시, 연락처 비공개)
 * - "상담 신청하기" 버튼으로 EverWill 통해서만 연결
 * - 모든 UI 텍스트 언어별 다국어 처리
 */

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Scale,
  Calculator,
  Star,
  MapPin,
  Clock,
  Languages,
  MessageSquare,
  ChevronRight,
  Search,
  Users,
} from "lucide-react";

// ===== 14개국 국기 탭 데이터 =====
const COUNTRY_FLAGS = [
  { code: "KR", flagImg: "https://flagcdn.com/w80/kr.png", name: "한국" },
  { code: "US", flagImg: "https://flagcdn.com/w80/us.png", name: "USA" },
  { code: "JP", flagImg: "https://flagcdn.com/w80/jp.png", name: "日本" },
  { code: "CN", flagImg: "https://flagcdn.com/w80/cn.png", name: "中国" },
  { code: "DE", flagImg: "https://flagcdn.com/w80/de.png", name: "DE" },
  { code: "ES", flagImg: "https://flagcdn.com/w80/es.png", name: "ES" },
  { code: "SA", flagImg: "https://flagcdn.com/w80/sa.png", name: "SA" },
  { code: "FR", flagImg: "https://flagcdn.com/w80/fr.png", name: "FR" },
  { code: "RU", flagImg: "https://flagcdn.com/w80/ru.png", name: "RU" },
  { code: "IN", flagImg: "https://flagcdn.com/w80/in.png", name: "IN" },
  { code: "BR", flagImg: "https://flagcdn.com/w80/br.png", name: "BR" },
  { code: "CA", flagImg: "https://flagcdn.com/w80/ca.png", name: "CA" },
  { code: "AU", flagImg: "https://flagcdn.com/w80/au.png", name: "AU" },
  { code: "NZ", flagImg: "https://flagcdn.com/w80/nz.png", name: "NZ" },
];

// 언어 코드 → 국가 코드 자동 매핑
const LANG_TO_COUNTRY: Record<string, string> = {
  ko: "KR",
  en: "US",
  ja: "JP",
  zh: "CN",
  de: "DE",
  es: "ES",
  ar: "SA",
  fr: "FR",
  ru: "RU",
  hi: "IN",
  pt: "BR",
};

// 국가별 헤드라인 (언어별 자국어로 표기)
const COUNTRY_HEADLINE: Record<string, { title: string; subtitle: string }> = {
  KR: { title: "최고의 상속 전문가가 여러분을 기다리고 있습니다", subtitle: "대한민국 EverWill 인증 파트너 변호사·세무사" },
  US: { title: "Top Inheritance Experts Are Waiting for You", subtitle: "EverWill Certified Partner Attorneys & Tax Advisors in the USA" },
  JP: { title: "最高の相続専門家があなたをお待ちしています", subtitle: "日本のEverWill認定パートナー弁護士・税理士" },
  CN: { title: "顶级遗产专家正在等待您", subtitle: "中国EverWill认证合作律师·税务师" },
  DE: { title: "Top-Erbschaftsexperten warten auf Sie", subtitle: "EverWill zertifizierte Partner-Anwälte & Steuerberater in Deutschland" },
  ES: { title: "Los mejores expertos en herencias le esperan", subtitle: "Abogados y asesores fiscales certificados por EverWill en España" },
  SA: { title: "أفضل خبراء الإرث في انتظاركم", subtitle: "شركاء EverWill المعتمدون من المحامين والمستشارين الضريبيين" },
  FR: { title: "Les meilleurs experts en succession vous attendent", subtitle: "Avocats et conseillers fiscaux partenaires EverWill en France" },
  RU: { title: "Лучшие эксперты по наследству ждут вас", subtitle: "Сертифицированные партнёры EverWill — адвокаты и налоговые консультанты" },
  IN: { title: "Top Inheritance Experts Are Waiting for You", subtitle: "EverWill Certified Partner Lawyers & Tax Advisors in India" },
  BR: { title: "Os melhores especialistas em herança esperam por você", subtitle: "Advogados e consultores fiscais parceiros EverWill no Brasil" },
  CA: { title: "Top Inheritance Experts Are Waiting for You", subtitle: "EverWill Certified Partner Attorneys & Tax Advisors in Canada" },
  AU: { title: "Top Inheritance Experts Are Waiting for You", subtitle: "EverWill Certified Partner Attorneys & Tax Advisors in Australia" },
  NZ: { title: "Top Inheritance Experts Are Waiting for You", subtitle: "EverWill Certified Partner Attorneys & Tax Advisors in New Zealand" },
};

// 국가 코드 → 국기 이모지 + 이름 (언어별)
const COUNTRY_MAP: Record<string, { flag: string; names: Record<string, string> }> = {
  KR: { flag: "🇰🇷", names: { ko: "한국", en: "Korea", ja: "韓国", zh: "韩国", de: "Korea", es: "Corea", fr: "Corée", ar: "كوريا", ru: "Корея", hi: "कोरिया", pt: "Coreia" } },
  US: { flag: "🇺🇸", names: { ko: "미국", en: "USA", ja: "アメリカ", zh: "美国", de: "USA", es: "EE.UU.", fr: "États-Unis", ar: "أمريكا", ru: "США", hi: "अमेरिका", pt: "EUA" } },
  JP: { flag: "🇯🇵", names: { ko: "일본", en: "Japan", ja: "日本", zh: "日本", de: "Japan", es: "Japón", fr: "Japon", ar: "اليابان", ru: "Япония", hi: "जापान", pt: "Japão" } },
  CN: { flag: "🇨🇳", names: { ko: "중국", en: "China", ja: "中国", zh: "中国", de: "China", es: "China", fr: "Chine", ar: "الصين", ru: "Китай", hi: "चीन", pt: "China" } },
  DE: { flag: "🇩🇪", names: { ko: "독일", en: "Germany", ja: "ドイツ", zh: "德国", de: "Deutschland", es: "Alemania", fr: "Allemagne", ar: "ألمانيا", ru: "Германия", hi: "जर्मनी", pt: "Alemanha" } },
  FR: { flag: "🇫🇷", names: { ko: "프랑스", en: "France", ja: "フランス", zh: "法国", de: "Frankreich", es: "Francia", fr: "France", ar: "فرنسا", ru: "Франция", hi: "फ्रांस", pt: "França" } },
  ES: { flag: "🇪🇸", names: { ko: "스페인", en: "Spain", ja: "スペイン", zh: "西班牙", de: "Spanien", es: "España", fr: "Espagne", ar: "إسبانيا", ru: "Испания", hi: "स्पेन", pt: "Espanha" } },
  SA: { flag: "🇸🇦", names: { ko: "사우디", en: "Saudi Arabia", ja: "サウジアラビア", zh: "沙特", de: "Saudi-Arabien", es: "Arabia Saudita", fr: "Arabie Saoudite", ar: "السعودية", ru: "Саудовская Аравия", hi: "सऊदी अरब", pt: "Arábia Saudita" } },
  IN: { flag: "🇮🇳", names: { ko: "인도", en: "India", ja: "インド", zh: "印度", de: "Indien", es: "India", fr: "Inde", ar: "الهند", ru: "Индия", hi: "भारत", pt: "Índia" } },
  BR: { flag: "🇧🇷", names: { ko: "브라질", en: "Brazil", ja: "ブラジル", zh: "巴西", de: "Brasilien", es: "Brasil", fr: "Brésil", ar: "البرازيل", ru: "Бразилия", hi: "ब्राज़ील", pt: "Brasil" } },
  GB: { flag: "🇬🇧", names: { ko: "영국", en: "UK", ja: "イギリス", zh: "英国", de: "Großbritannien", es: "Reino Unido", fr: "Royaume-Uni", ar: "المملكة المتحدة", ru: "Великобритания", hi: "यूके", pt: "Reino Unido" } },
  AU: { flag: "🇦🇺", names: { ko: "호주", en: "Australia", ja: "オーストラリア", zh: "澳大利亚", de: "Australien", es: "Australia", fr: "Australie", ar: "أستراليا", ru: "Австралия", hi: "ऑस्ट्रेलिया", pt: "Austrália" } },
  CA: { flag: "🇨🇦", names: { ko: "캐나다", en: "Canada", ja: "カナダ", zh: "加拿大", de: "Kanada", es: "Canadá", fr: "Canada", ar: "كندا", ru: "Канада", hi: "कनाडा", pt: "Canadá" } },
  RU: { flag: "🇷🇺", names: { ko: "러시아", en: "Russia", ja: "ロシア", zh: "俄罗斯", de: "Russland", es: "Rusia", fr: "Russie", ar: "روسيا", ru: "Россия", hi: "रूस", pt: "Rússia" } },
  NZ: { flag: "🇳🇿", names: { ko: "뉴질랜드", en: "New Zealand", ja: "ニュージーランド", zh: "新西兰", de: "Neuseeland", es: "Nueva Zelanda", fr: "Nouvelle-Zélande", ar: "نيوزيلندا", ru: "Новая Зеландия", hi: "न्यूज़ीलैंड", pt: "Nova Zelândia" } },
};

// 언어별 UI 텍스트
const UI_TEXT: Record<string, {
  badgeLabel: string;
  activeCount: string;
  searchPlaceholder: string;
  filterAll: string;
  filterLawyer: string;
  filterTax: string;
  noExpert: string;
  noExpertSub: string;
  yearsLabel: string;
  reviewLabel: string;
  consultLabel: string;
  experienceLabel: string;
  languagesLabel: string;
  specialtyLabel: string;
  bioLabel: string;
  privacyNote: string;
  consultBtn: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaBtn: string;
  modalTitle: string;
  ratingLabel: string;
  detailTitle: string;
}> = {
  ko: {
    badgeLabel: "EverWill 파트너 전문가 그룹",
    activeCount: "명의 파트너 전문가가 활동 중",
    searchPlaceholder: "이름, 전문분야, 도시 검색",
    filterAll: "전체",
    filterLawyer: "변호사",
    filterTax: "세무사",
    noExpert: "해당 국가의 전문가가 아직 없습니다.",
    noExpertSub: "다른 국가를 선택해보세요.",
    yearsLabel: "경력",
    reviewLabel: "리뷰",
    consultLabel: "건",
    experienceLabel: "경력",
    languagesLabel: "사용 언어",
    specialtyLabel: "전문 분야",
    bioLabel: "소개 및 이력",
    privacyNote: "📌 전문가 연락처는 개인정보 보호를 위해 비공개입니다.\nEverWill을 통해 안전하게 상담을 신청하세요.",
    consultBtn: "상담 신청하기",
    ctaTitle: "전문가이신가요?",
    ctaDesc: "EverWill 파트너로 가입하면 전 세계 고객에게 프로필이 노출됩니다.\n연 $99로 글로벌 상속 전문가로 활동하세요.",
    ctaBtn: "파트너 신청하기",
    modalTitle: "전문가 상세 프로필",
    ratingLabel: "상담",
    detailTitle: "Introduction (English)",
  },
  en: {
    badgeLabel: "EverWill Partner Expert Group",
    activeCount: "partner experts currently active",
    searchPlaceholder: "Search by name, specialty, or city",
    filterAll: "All",
    filterLawyer: "Attorney",
    filterTax: "Tax Advisor",
    noExpert: "No experts found for this country yet.",
    noExpertSub: "Please select another country.",
    yearsLabel: "Experience",
    reviewLabel: "Reviews",
    consultLabel: "cases",
    experienceLabel: "Experience",
    languagesLabel: "Languages",
    specialtyLabel: "Specialty",
    bioLabel: "Bio & Career",
    privacyNote: "📌 Contact details are kept private for privacy protection.\nApply for consultation safely through EverWill.",
    consultBtn: "Request Consultation",
    ctaTitle: "Are you an expert?",
    ctaDesc: "Join as an EverWill partner and get your profile exposed to clients worldwide.\nBecome a global inheritance expert for $99/year.",
    ctaBtn: "Apply as Partner",
    modalTitle: "Expert Profile",
    ratingLabel: "consultations",
    detailTitle: "Introduction (English)",
  },
  ja: {
    badgeLabel: "EverWillパートナー専門家グループ",
    activeCount: "名のパートナー専門家が活動中",
    searchPlaceholder: "名前・専門分野・都市で検索",
    filterAll: "すべて",
    filterLawyer: "弁護士",
    filterTax: "税理士",
    noExpert: "この国の専門家はまだいません。",
    noExpertSub: "他の国を選択してください。",
    yearsLabel: "経験",
    reviewLabel: "レビュー",
    consultLabel: "件",
    experienceLabel: "経験年数",
    languagesLabel: "対応言語",
    specialtyLabel: "専門分野",
    bioLabel: "自己紹介・経歴",
    privacyNote: "📌 専門家の連絡先はプライバシー保護のため非公開です。\nEverWillを通じて安全にご相談ください。",
    consultBtn: "相談を申し込む",
    ctaTitle: "専門家の方へ",
    ctaDesc: "EverWillパートナーに登録すると、世界中のお客様にプロフィールが公開されます。\n年間$99でグローバルな相続専門家として活動しましょう。",
    ctaBtn: "パートナー申請",
    modalTitle: "専門家詳細プロフィール",
    ratingLabel: "相談件数",
    detailTitle: "Introduction (English)",
  },
  zh: {
    badgeLabel: "EverWill合作专家团队",
    activeCount: "位合作专家正在服务",
    searchPlaceholder: "搜索姓名、专业领域或城市",
    filterAll: "全部",
    filterLawyer: "律师",
    filterTax: "税务师",
    noExpert: "该国家暂无专家。",
    noExpertSub: "请选择其他国家。",
    yearsLabel: "经验",
    reviewLabel: "评价",
    consultLabel: "件",
    experienceLabel: "从业年限",
    languagesLabel: "服务语言",
    specialtyLabel: "专业领域",
    bioLabel: "简介与履历",
    privacyNote: "📌 为保护隐私，专家联系方式不对外公开。\n请通过EverWill安全申请咨询。",
    consultBtn: "申请咨询",
    ctaTitle: "您是专业人士吗？",
    ctaDesc: "加入EverWill合作伙伴，您的档案将向全球客户展示。\n每年$99，成为全球遗产专家。",
    ctaBtn: "申请合作",
    modalTitle: "专家详细档案",
    ratingLabel: "咨询",
    detailTitle: "Introduction (English)",
  },
  de: {
    badgeLabel: "EverWill Partner-Expertengruppe",
    activeCount: "Partnerexperten derzeit aktiv",
    searchPlaceholder: "Nach Name, Fachgebiet oder Stadt suchen",
    filterAll: "Alle",
    filterLawyer: "Rechtsanwalt",
    filterTax: "Steuerberater",
    noExpert: "Für dieses Land sind noch keine Experten verfügbar.",
    noExpertSub: "Bitte wählen Sie ein anderes Land.",
    yearsLabel: "Erfahrung",
    reviewLabel: "Bewertungen",
    consultLabel: "Fälle",
    experienceLabel: "Berufserfahrung",
    languagesLabel: "Sprachen",
    specialtyLabel: "Fachgebiet",
    bioLabel: "Biografie & Werdegang",
    privacyNote: "📌 Kontaktdaten werden aus Datenschutzgründen nicht veröffentlicht.\nBeantragen Sie eine Beratung sicher über EverWill.",
    consultBtn: "Beratung anfragen",
    ctaTitle: "Sind Sie Experte?",
    ctaDesc: "Als EverWill-Partner wird Ihr Profil weltweit Kunden präsentiert.\nWerden Sie für $99/Jahr globaler Erbschaftsexperte.",
    ctaBtn: "Als Partner bewerben",
    modalTitle: "Expertenprofil",
    ratingLabel: "Beratungen",
    detailTitle: "Introduction (English)",
  },
  es: {
    badgeLabel: "Grupo de Expertos Socios EverWill",
    activeCount: "expertos socios actualmente activos",
    searchPlaceholder: "Buscar por nombre, especialidad o ciudad",
    filterAll: "Todos",
    filterLawyer: "Abogado",
    filterTax: "Asesor Fiscal",
    noExpert: "Aún no hay expertos para este país.",
    noExpertSub: "Por favor, seleccione otro país.",
    yearsLabel: "Experiencia",
    reviewLabel: "Reseñas",
    consultLabel: "casos",
    experienceLabel: "Años de experiencia",
    languagesLabel: "Idiomas",
    specialtyLabel: "Especialidad",
    bioLabel: "Biografía y trayectoria",
    privacyNote: "📌 Los datos de contacto son privados por protección de privacidad.\nSolicite consulta de forma segura a través de EverWill.",
    consultBtn: "Solicitar consulta",
    ctaTitle: "¿Es usted experto?",
    ctaDesc: "Únase como socio de EverWill y su perfil se mostrará a clientes de todo el mundo.\nConviértase en experto global en herencias por $99/año.",
    ctaBtn: "Solicitar ser socio",
    modalTitle: "Perfil detallado del experto",
    ratingLabel: "consultas",
    detailTitle: "Introduction (English)",
  },
  fr: {
    badgeLabel: "Groupe d'experts partenaires EverWill",
    activeCount: "experts partenaires actuellement actifs",
    searchPlaceholder: "Rechercher par nom, spécialité ou ville",
    filterAll: "Tous",
    filterLawyer: "Avocat",
    filterTax: "Conseiller fiscal",
    noExpert: "Aucun expert disponible pour ce pays.",
    noExpertSub: "Veuillez sélectionner un autre pays.",
    yearsLabel: "Expérience",
    reviewLabel: "Avis",
    consultLabel: "dossiers",
    experienceLabel: "Années d'expérience",
    languagesLabel: "Langues",
    specialtyLabel: "Spécialité",
    bioLabel: "Biographie et parcours",
    privacyNote: "📌 Les coordonnées sont confidentielles pour la protection de la vie privée.\nDemandez une consultation en toute sécurité via EverWill.",
    consultBtn: "Demander une consultation",
    ctaTitle: "Êtes-vous un expert ?",
    ctaDesc: "Rejoignez EverWill en tant que partenaire et votre profil sera visible par des clients du monde entier.\nDevenez expert mondial en succession pour 99$/an.",
    ctaBtn: "Postuler comme partenaire",
    modalTitle: "Profil détaillé de l'expert",
    ratingLabel: "consultations",
    detailTitle: "Introduction (English)",
  },
  ar: {
    badgeLabel: "مجموعة خبراء شركاء EverWill",
    activeCount: "خبير شريك نشط حالياً",
    searchPlaceholder: "البحث بالاسم أو التخصص أو المدينة",
    filterAll: "الكل",
    filterLawyer: "محامي",
    filterTax: "مستشار ضريبي",
    noExpert: "لا يوجد خبراء لهذا البلد بعد.",
    noExpertSub: "يرجى اختيار بلد آخر.",
    yearsLabel: "الخبرة",
    reviewLabel: "تقييمات",
    consultLabel: "قضية",
    experienceLabel: "سنوات الخبرة",
    languagesLabel: "اللغات",
    specialtyLabel: "التخصص",
    bioLabel: "نبذة ومسيرة مهنية",
    privacyNote: "📌 بيانات الاتصال سرية لحماية الخصوصية.\nاطلب استشارة بأمان عبر EverWill.",
    consultBtn: "طلب استشارة",
    ctaTitle: "هل أنت خبير؟",
    ctaDesc: "انضم كشريك في EverWill وسيظهر ملفك الشخصي للعملاء حول العالم.\nكن خبيراً عالمياً في الإرث مقابل 99$/سنة.",
    ctaBtn: "التقديم كشريك",
    modalTitle: "الملف الشخصي التفصيلي للخبير",
    ratingLabel: "استشارة",
    detailTitle: "Introduction (English)",
  },
  ru: {
    badgeLabel: "Группа экспертов-партнёров EverWill",
    activeCount: "партнёров-экспертов сейчас активны",
    searchPlaceholder: "Поиск по имени, специализации или городу",
    filterAll: "Все",
    filterLawyer: "Адвокат",
    filterTax: "Налоговый консультант",
    noExpert: "Для этой страны пока нет экспертов.",
    noExpertSub: "Пожалуйста, выберите другую страну.",
    yearsLabel: "Опыт",
    reviewLabel: "Отзывы",
    consultLabel: "дел",
    experienceLabel: "Лет опыта",
    languagesLabel: "Языки",
    specialtyLabel: "Специализация",
    bioLabel: "Биография и карьера",
    privacyNote: "📌 Контактные данные конфиденциальны в целях защиты персональных данных.\nОбратитесь за консультацией безопасно через EverWill.",
    consultBtn: "Запросить консультацию",
    ctaTitle: "Вы эксперт?",
    ctaDesc: "Станьте партнёром EverWill и ваш профиль будет виден клиентам по всему миру.\nСтаньте глобальным экспертом по наследству за $99/год.",
    ctaBtn: "Подать заявку как партнёр",
    modalTitle: "Подробный профиль эксперта",
    ratingLabel: "консультаций",
    detailTitle: "Introduction (English)",
  },
  hi: {
    badgeLabel: "EverWill पार्टनर विशेषज्ञ समूह",
    activeCount: "पार्टनर विशेषज्ञ वर्तमान में सक्रिय",
    searchPlaceholder: "नाम, विशेषता या शहर से खोजें",
    filterAll: "सभी",
    filterLawyer: "वकील",
    filterTax: "कर सलाहकार",
    noExpert: "इस देश के लिए अभी कोई विशेषज्ञ नहीं है।",
    noExpertSub: "कृपया कोई अन्य देश चुनें।",
    yearsLabel: "अनुभव",
    reviewLabel: "समीक्षाएं",
    consultLabel: "मामले",
    experienceLabel: "अनुभव के वर्ष",
    languagesLabel: "भाषाएं",
    specialtyLabel: "विशेषता",
    bioLabel: "परिचय और करियर",
    privacyNote: "📌 गोपनीयता सुरक्षा के लिए संपर्क विवरण निजी रखे जाते हैं।\nEverWill के माध्यम से सुरक्षित रूप से परामर्श के लिए आवेदन करें।",
    consultBtn: "परामर्श अनुरोध करें",
    ctaTitle: "क्या आप विशेषज्ञ हैं?",
    ctaDesc: "EverWill पार्टनर के रूप में शामिल हों और आपकी प्रोफाइल दुनिया भर के ग्राहकों को दिखाई देगी।\n$99/वर्ष में वैश्विक उत्तराधिकार विशेषज्ञ बनें।",
    ctaBtn: "पार्टनर के रूप में आवेदन करें",
    modalTitle: "विशेषज्ञ विस्तृत प्रोफाइल",
    ratingLabel: "परामर्श",
    detailTitle: "Introduction (English)",
  },
  pt: {
    badgeLabel: "Grupo de Especialistas Parceiros EverWill",
    activeCount: "especialistas parceiros atualmente ativos",
    searchPlaceholder: "Pesquisar por nome, especialidade ou cidade",
    filterAll: "Todos",
    filterLawyer: "Advogado",
    filterTax: "Consultor Fiscal",
    noExpert: "Ainda não há especialistas para este país.",
    noExpertSub: "Por favor, selecione outro país.",
    yearsLabel: "Experiência",
    reviewLabel: "Avaliações",
    consultLabel: "casos",
    experienceLabel: "Anos de experiência",
    languagesLabel: "Idiomas",
    specialtyLabel: "Especialidade",
    bioLabel: "Biografia e trajetória",
    privacyNote: "📌 Os dados de contato são privados para proteção de privacidade.\nSolicite consulta com segurança através do EverWill.",
    consultBtn: "Solicitar consulta",
    ctaTitle: "Você é especialista?",
    ctaDesc: "Junte-se como parceiro EverWill e seu perfil será exibido para clientes em todo o mundo.\nTorne-se um especialista global em herança por $99/ano.",
    ctaBtn: "Candidatar-se como parceiro",
    modalTitle: "Perfil detalhado do especialista",
    ratingLabel: "consultas",
    detailTitle: "Introduction (English)",
  },
};

const LANG_MAP: Record<string, string> = {
  ko: "한국어", en: "English", ja: "日本語", zh: "中文",
  de: "Deutsch", fr: "Français", es: "Español", ar: "العربية",
  hi: "हिन्दी", pt: "Português", ru: "Русский", gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ", ta: "தமிழ்", te: "తెలుగు", bn: "বাংলা",
  mr: "मराठी", ur: "اردو",
};

type Expert = {
  id: number;
  name: string;
  nameEn: string | null;
  specialty: "lawyer" | "tax";
  subSpecialty: string | null;
  country: string;
  city: string | null;
  firmName: string | null;
  bio: string | null;
  bioEn: string | null;
  yearsOfExperience: number | null;
  languages: string | null;
  photoUrl: string | null;
  ratingAvg: number | null;
  reviewCount: number | null;
  consultCount: number | null;
  isSample: number | null;
  createdAt: Date | null;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "fill-[#C9A961] text-[#C9A961]" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function ExpertCard({
  expert,
  onClick,
  ui,
  language,
}: {
  expert: Expert;
  onClick: () => void;
  ui: typeof UI_TEXT["ko"];
  language: string;
}) {
  const countryData = COUNTRY_MAP[expert.country] ?? { flag: "🌐", names: {} };
  const countryName = countryData.names[language] ?? countryData.names["en"] ?? expert.country;
  const specLabel = expert.specialty === "lawyer" ? ui.filterLawyer : ui.filterTax;
  const specColor = expert.specialty === "lawyer" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  const specIcon = expert.specialty === "lawyer" ? <Scale className="w-4 h-4" /> : <Calculator className="w-4 h-4" />;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#C9A961]/40 transition-all cursor-pointer group"
    >
      {/* 사진 + 이름 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative flex-shrink-0">
          {expert.photoUrl ? (
            <img
              src={expert.photoUrl}
              alt={expert.name}
              className="w-14 h-14 rounded-full object-cover bg-gray-100"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=1F3864&color=fff&size=56`;
              }}
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-lg">
              {expert.name.charAt(0)}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 text-base">{countryData.flag}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1F3864] text-base truncate group-hover:text-[#C9A961] transition-colors">
            {expert.name}
          </h3>
          {expert.firmName && (
            <p className="text-xs text-gray-500 truncate">{expert.firmName}</p>
          )}
          <div className="flex items-center gap-1 mt-1">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${specColor}`}>
              {specIcon} {specLabel}
            </span>
          </div>
        </div>
      </div>

      {/* 전문분야 */}
      {expert.subSpecialty && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{expert.subSpecialty}</p>
      )}

      {/* 정보 */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{countryName}{expert.city ? ` · ${expert.city}` : ""}</span>
        </div>
        {expert.yearsOfExperience != null && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{ui.yearsLabel} {expert.yearsOfExperience}{language === "ko" || language === "ja" ? "년" : "yr"}</span>
          </div>
        )}
        {expert.languages && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Languages className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">
              {expert.languages
                .split(",")
                .map((l) => LANG_MAP[l.trim()] ?? l.trim())
                .join(" · ")}
            </span>
          </div>
        )}
      </div>

      {/* 평점 + 상담 수 */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          {expert.ratingAvg != null && (
            <>
              <StarRating rating={expert.ratingAvg} />
              <span className="text-xs text-gray-500">
                {expert.ratingAvg.toFixed(1)} ({expert.reviewCount ?? 0})
              </span>
            </>
          )}
        </div>
        <span className="text-xs text-gray-400 flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {(expert.consultCount ?? 0).toLocaleString()}{ui.consultLabel}
        </span>
      </div>
    </div>
  );
}

function ExpertDetailModal({
  expert,
  open,
  onClose,
  ui,
  language,
}: {
  expert: Expert | null;
  open: boolean;
  onClose: () => void;
  ui: typeof UI_TEXT["ko"];
  language: string;
}) {
  if (!expert) return null;
  const countryData = COUNTRY_MAP[expert.country] ?? { flag: "🌐", names: {} };
  const countryName = countryData.names[language] ?? countryData.names["en"] ?? expert.country;
  const specLabel = expert.specialty === "lawyer" ? ui.filterLawyer : ui.filterTax;
  const specColor = expert.specialty === "lawyer" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
  const specIcon = expert.specialty === "lawyer" ? <Scale className="w-4 h-4" /> : <Calculator className="w-4 h-4" />;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1F3864]">{ui.modalTitle}</DialogTitle>
        </DialogHeader>

        {/* 프로필 헤더 */}
        <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
          {expert.photoUrl ? (
            <img
              src={expert.photoUrl}
              alt={expert.name}
              className="w-20 h-20 rounded-full object-cover bg-gray-100 flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(expert.name)}&background=1F3864&color=fff&size=80`;
              }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {expert.name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold text-[#1F3864]">{expert.name}</h3>
            {expert.nameEn && <p className="text-sm text-gray-500">{expert.nameEn}</p>}
            {expert.firmName && <p className="text-sm text-gray-600 mt-0.5">{expert.firmName}</p>}
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${specColor}`}>
                {specIcon} {specLabel}
              </span>
              <span className="text-sm text-gray-500">
                {countryData.flag} {countryName}{expert.city ? ` · ${expert.city}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* 평점 */}
        {expert.ratingAvg != null && (
          <div className="flex items-center gap-3 py-3 border-b border-gray-100">
            <StarRating rating={expert.ratingAvg} />
            <span className="text-sm font-medium text-[#1F3864]">{expert.ratingAvg.toFixed(1)}</span>
            <span className="text-sm text-gray-500">{ui.reviewLabel} {expert.reviewCount ?? 0}</span>
            <span className="text-sm text-gray-400">·</span>
            <span className="text-sm text-gray-500">{ui.ratingLabel} {(expert.consultCount ?? 0).toLocaleString()}{ui.consultLabel}</span>
          </div>
        )}

        {/* 상세 정보 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {expert.yearsOfExperience != null && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">{ui.experienceLabel}</p>
                <p className="font-bold text-[#1F3864]">{expert.yearsOfExperience}{language === "ko" || language === "ja" ? "년" : " yr"}</p>
              </div>
            )}
            {expert.languages && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-0.5">{ui.languagesLabel}</p>
                <p className="font-medium text-[#1F3864] text-sm">
                  {expert.languages
                    .split(",")
                    .map((l) => LANG_MAP[l.trim()] ?? l.trim())
                    .join(", ")}
                </p>
              </div>
            )}
          </div>

          {expert.subSpecialty && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">{ui.specialtyLabel}</p>
              <p className="text-sm text-gray-600">{expert.subSpecialty}</p>
            </div>
          )}

          {expert.bio && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">{ui.bioLabel}</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{expert.bio}</p>
            </div>
          )}
          {expert.bioEn && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">{ui.detailTitle}</p>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{expert.bioEn}</p>
            </div>
          )}
        </div>

        {/* 상담 신청 버튼 */}
        <div className="pt-4 border-t border-gray-100">
          <div className="bg-[#1F3864]/5 rounded-xl p-3 mb-3">
            <p className="text-xs text-gray-500 text-center whitespace-pre-line">
              {ui.privacyNote}
            </p>
          </div>
          <Button
            className="w-full bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
            onClick={() => {
              onClose();
              window.location.href = "/dashboard/find-expert";
            }}
          >
            {ui.consultBtn} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ===== 메인 섹션 =====
export default function ExpertsSection() {
  const { language } = useLanguage();

  // 언어에 따라 자동으로 해당 국가 선택
  const [selectedCountry, setSelectedCountry] = useState<string>(() => LANG_TO_COUNTRY[language] ?? "KR");
  const [selectedSpecialty, setSelectedSpecialty] = useState<"all" | "lawyer" | "tax">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 현재 언어에 맞는 UI 텍스트
  const ui = useMemo(() => UI_TEXT[language] ?? UI_TEXT["en"], [language]);

  const { data, isLoading } = trpc.expert.list.useQuery({
    country: selectedCountry,
    specialty: selectedSpecialty,
    search: search || undefined,
    limit: 12,
    offset: 0,
  });

  const experts = data?.experts ?? [];
  const total = data?.total ?? 0;

  // 현재 국가 헤드라인
  const headline = COUNTRY_HEADLINE[selectedCountry] ?? COUNTRY_HEADLINE["US"];

  return (
    <section className="py-20 bg-[#FAFAF8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <Badge className="bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20 mb-4 px-4 py-1">
            {ui.badgeLabel}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-3">
            {headline.title}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            {headline.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Users className="w-4 h-4 text-[#C9A961]" />
            <span className="text-sm text-gray-500">{total} {ui.activeCount}</span>
          </div>
        </div>

        {/* ===== 14개국 국기 탭 ===== */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex gap-1 overflow-x-auto max-w-full">
            {COUNTRY_FLAGS.map(({ code, flagImg }) => (
              <button
                key={code}
                onClick={() => setSelectedCountry(code)}
                title={COUNTRY_MAP[code]?.names[language] ?? code}
                className={`flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedCountry === code
                    ? "bg-[#1F3864] text-white shadow-sm"
                    : "text-gray-500 hover:text-[#1F3864] hover:bg-gray-50"
                }`}
              >
                <img
                  src={flagImg}
                  alt={code}
                  className="w-8 h-5 object-cover rounded shadow-sm"
                />
                <span className="text-[10px] leading-none mt-0.5">{code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 검색 + 전문분야 필터 */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
              placeholder={ui.searchPlaceholder}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "lawyer", "tax"] as const).map((sp) => (
              <button
                key={sp}
                onClick={() => setSelectedSpecialty(sp)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedSpecialty === sp
                    ? "bg-[#C9A961] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#C9A961]/50"
                }`}
              >
                {sp === "all" ? ui.filterAll : sp === "lawyer" ? ui.filterLawyer : ui.filterTax}
              </button>
            ))}
          </div>
        </div>

        {/* 카드 그리드 */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-52 animate-pulse" />
            ))}
          </div>
        ) : experts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{ui.noExpert}</p>
            <p className="text-sm mt-1 text-gray-300">{ui.noExpertSub}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {experts.map((expert) => (
              <ExpertCard
                key={expert.id}
                expert={expert as Expert}
                ui={ui}
                language={language}
                onClick={() => {
                  setSelectedExpert(expert as Expert);
                  setModalOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* 파트너 가입 CTA */}
        <div className="mt-12 bg-gradient-to-r from-[#1F3864] to-[#2a4a7f] rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">{ui.ctaTitle}</h3>
          <p className="text-white/80 mb-5 text-sm whitespace-pre-line">
            {ui.ctaDesc}
          </p>
          <Button
            onClick={() => (window.location.href = "/partner/expert")}
            className="bg-[#C9A961] hover:bg-[#C9A961]/90 text-white px-8"
          >
            {ui.ctaBtn} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* 상세 모달 */}
      <ExpertDetailModal
        expert={selectedExpert}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ui={ui}
        language={language}
      />
    </section>
  );
}
