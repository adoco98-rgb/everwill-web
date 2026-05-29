/**
 * 기존 공증 vs EverWill 전자공증 비교 섹션
 * 각국 유언 법률 시스템 차이 반영 (민법 조항·증인 요건·유류분·특수 규정)
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check, Clock, DollarSign, FileText, Users, AlertTriangle, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ComparisonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { language } = useLanguage();

  /** 언어별 데이터 정의 */
  const localeData = {
    ko: {
      sectionTitle: "왜 EverWill인가?",
      sectionSub: "기존 공증 방식과 EverWill 전자공증을 직접 비교해보세요.",
      categoryLabel: "비교 항목",
      traditionalLabel: "기존 공증",
      summaryLabel: "기존 공증 대비 EverWill",
      costSaving: "비용 절감",
      timeSaving: "시간 단축",
      zeroLoss: "분실 위험 제거",
      rows: [
        {
          icon: DollarSign,
          label: "총 비용",
          traditional: "300,000원 ~ 3,000,000원+",
          traditionalSub: "공증료(상한 300만원) + 변호사 수임료 + 증인 교통비",
          everwill: "49,000원",
          everwillSub: "모든 비용 포함 (1년 무료 보관)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "소요 시간",
          traditional: "2주 ~ 2개월",
          traditionalSub: "변호사 예약 → 상담 → 작성 → 공증 → 보관",
          everwill: "17분",
          everwillSub: "AI 체크박스 마법사로 즉시 완성",
          highlight: true,
        },
        {
          icon: Users,
          label: "증인 요건",
          traditional: "공정증서 유언: 증인 2명 필수",
          traditionalSub: "민법 제1068조 · 자필증서 유언은 증인 불필요(제1066조)",
          everwill: "불필요",
          everwillSub: "eKYC 본인인증으로 대체 · 5가지 유언 방식 모두 지원",
          highlight: false,
        },
        {
          icon: FileText,
          label: "유언 방식 & 법률",
          traditional: "5가지 방식 (자필·공정증서·비밀·녹음·구수)",
          traditionalSub: "민법 제1060~1111조 · 자필·녹음·비밀·구수는 가정법원 검인 필요",
          everwill: "전자 인증 유언장",
          everwillSub: "eKYC + 보안 인증 타임스탬프 + RFC 3161 · 검인 절차 간소화",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "유류분 & 강제상속",
          traditional: "유류분 제도 (민법 제1112조)",
          traditionalSub: "직계비속·배우자: 법정상속분의 1/2 · 직계존속·형제자매: 1/3",
          everwill: "자동 유류분 검증",
          everwillSub: "AI가 작성 중 실시간 유류분 위반 경고 · 법적 리스크 사전 차단",
          highlight: false,
        },
        {
          icon: Zap,
          label: "사후 집행",
          traditional: "가족이 직접 진행",
          traditionalSub: "가정법원 검인(공정증서 제외) → 변호사 선임 → 상속 절차 → 수개월",
          everwill: "자동 집행",
          everwillSub: "다층 안심 확인 → 상속자 자동 알림 → 변호사 자동 매칭",
          highlight: false,
        },
      ],
    },
    en: {
      sectionTitle: "Why EverWill?",
      sectionSub: "Compare traditional US probate with EverWill — legally valid under ESIGN Act & UEWA in 20+ states.",
      categoryLabel: "Category",
      traditionalLabel: "Traditional Probate",
      summaryLabel: "EverWill vs Traditional Probate",
      costSaving: "Cost Savings",
      timeSaving: "Time Saved",
      zeroLoss: "Zero Loss Risk",
      rows: [
        {
          icon: DollarSign,
          label: "Total Cost",
          traditional: "$3,000 ~ $15,000+",
          traditionalSub: "Attorney fees + probate court + executor costs (3–7% of estate in CA)",
          everwill: "$39",
          everwillSub: "All-inclusive (1yr free storage) · No annual subscription",
          highlight: true,
        },
        {
          icon: Clock,
          label: "Time Required",
          traditional: "9 months ~ 2 years",
          traditionalSub: "Probate court → attorney → asset distribution (varies by state)",
          everwill: "17 minutes",
          everwillSub: "AI checkbox wizard — done instantly",
          highlight: true,
        },
        {
          icon: Users,
          label: "Witnesses",
          traditional: "2 witnesses required (most states)",
          traditionalSub: "Holographic will: no witnesses needed (26+ states) · UEWA: remote witness allowed",
          everwill: "Not required",
          everwillSub: "Replaced by eKYC identity verification · ESIGN Act compliant",
          highlight: false,
        },
        {
          icon: FileText,
          label: "Will Types & Legal Basis",
          traditional: "Attested / Holographic / Notarized Will",
          traditionalSub: "ESIGN Act (2000, federal) · UEWA (2019, 20+ states: AZ, CO, FL, IL, NV, VA, WA…) · Holographic: CA §6111, TX §251.052",
          everwill: "E-Certified Will",
          everwillSub: "eKYC + RFC 3161 certified timestamp · ESIGN Act & UEWA compliant · Probate-ready",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Forced Heirship",
          traditional: "No forced heirship (common law)",
          traditionalSub: "~67% of Americans have no will · Intestacy laws apply without a will · Elective share for spouse",
          everwill: "Auto Compliance Check",
          everwillSub: "AI flags state-specific requirements · Elective share & community property alerts",
          highlight: false,
        },
        {
          icon: Zap,
          label: "Post-Death Execution",
          traditional: "Family must handle everything",
          traditionalSub: "Probate court → hire attorney → months of process → attorney fees 3–7% of estate",
          everwill: "Auto Execution",
          everwillSub: "SSA Death Master File → auto notify heirs → attorney match → asset transfer",
          highlight: false,
        },
      ],
    },
    ja: {
      sectionTitle: "なぜEverWillなのか？",
      sectionSub: "従来の公正証書遺言とEverWillの電子認証を比較してみましょう。",
      categoryLabel: "比較項目",
      traditionalLabel: "従来の公正証書",
      summaryLabel: "従来の公正証書 vs EverWill",
      costSaving: "コスト削減",
      timeSaving: "時間短縮",
      zeroLoss: "紛失リスクゼロ",
      rows: [
        {
          icon: DollarSign,
          label: "総費用",
          traditional: "50,000円 〜 300,000円+",
          traditionalSub: "公証人手数料 + 証人2名費用 + 交通費など",
          everwill: "5,900円",
          everwillSub: "全費用込み（1年間無料保管）",
          highlight: true,
        },
        {
          icon: Clock,
          label: "所要時間",
          traditional: "2週間 〜 3ヶ月",
          traditionalSub: "弁護士予約 → 相談 → 作成 → 公証役場 → 保管",
          everwill: "17分",
          everwillSub: "AIチェックボックスウィザードで即完成",
          highlight: true,
        },
        {
          icon: Users,
          label: "証人要件",
          traditional: "公正証書遺言: 証人2名必須",
          traditionalSub: "民法第969条 · 自筆証書遺言は証人不要(第968条) · 秘密証書は2名",
          everwill: "不要",
          everwillSub: "eKYC本人確認で代替 · 3種類の遺言方式すべて対応",
          highlight: false,
        },
        {
          icon: FileText,
          label: "遺言方式 & 法律",
          traditional: "3方式 (自筆証書・公正証書・秘密証書)",
          traditionalSub: "民法第960条〜 · ✅ 2025年10月 公正証書デジタル化正式施行 · 遠隔公正証書遺言が合法化",
          everwill: "電子認証遺言",
          everwillSub: "eKYC + ブロックチェーンタイムスタンプ + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "遺留分 & 強制相続",
          traditional: "遺留分制度 (民法第1042条)",
          traditionalSub: "直系卑属・配偶者: 法定相続分の1/2 · 直系尊属: 1/3",
          everwill: "自動遺留分チェック",
          everwillSub: "AI作成中にリアルタイム遺留分違反を警告 · 法的リスクを事前防止",
          highlight: false,
        },
        {
          icon: Zap,
          label: "死後執行",
          traditional: "家族が直接対応",
          traditionalSub: "家庭裁判所検認(公正証書除く) → 弁護士選任 → 相続手続き → 数ヶ月",
          everwill: "自動執行",
          everwillSub: "4重死亡検知 → 相続人自動通知 → 弁護士自動マッチング",
          highlight: false,
        },
      ],
    },
    zh: {
      sectionTitle: "为什么选择EverWill？",
      sectionSub: "对比传统公证遗嘱与EverWill电子认证的差异。",
      categoryLabel: "对比项目",
      traditionalLabel: "传统公证",
      summaryLabel: "EverWill vs 传统公证",
      costSaving: "节省费用",
      timeSaving: "节省时间",
      zeroLoss: "零丢失风险",
      rows: [
        {
          icon: DollarSign,
          label: "总费用",
          traditional: "¥2,000 ~ ¥20,000+",
          traditionalSub: "律师费 + 公证费 + 见证人费用等",
          everwill: "¥280",
          everwillSub: "全包含（1年免费存储）",
          highlight: true,
        },
        {
          icon: Clock,
          label: "所需时间",
          traditional: "2周 ~ 3个月",
          traditionalSub: "预约律师 → 咨询 → 起草 → 公证 → 存档",
          everwill: "17分钟",
          everwillSub: "AI复选框向导即时完成",
          highlight: true,
        },
        {
          icon: Users,
          label: "见证人",
          traditional: "需要2名见证人",
          traditionalSub: "亲自安排、签名、盖章 — 麻烦且费用高",
          everwill: "不需要",
          everwillSub: "由eKYC身份验证代替",
          highlight: false,
        },
        {
          icon: FileText,
          label: "遗嘱方式 & 法律",
          traditional: "5种方式 (自书·代书·公证·录音·口头)",
          traditionalSub: "民法典第1133条〜 · 2021年改革: 公证遗嘱不再具有最高效力",
          everwill: "电子认证遗嘱",
          everwillSub: "eKYC + 区块链时间戳 + RFC 3161 · 港澳台另行适用",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "特留份 & 强制继承",
          traditional: "特留份制度 (民法典第1141条)",
          traditionalSub: "子女·配偶·父母享有特留份保护 · 最后遗嘱优先原则(2021年)",
          everwill: "自动特留份验证",
          everwillSub: "AI实时检测特留份违规 · 法律风险提前规避",
          highlight: false,
        },
        {
          icon: Zap,
          label: "身后执行",
          traditional: "家属自行处理",
          traditionalSub: "法院认证 → 聘请律师 → 继承程序 → 数月",
          everwill: "自动执行",
          everwillSub: "四重死亡检测 → 自动通知继承人 → 自动匹配律师",
          highlight: false,
        },
      ],
    },
    de: {
      sectionTitle: "Warum EverWill?",
      sectionSub: "Vergleichen Sie das traditionelle Notarverfahren mit EverWills digitaler Zertifizierung.",
      categoryLabel: "Kategorie",
      traditionalLabel: "Notarielles Testament",
      summaryLabel: "EverWill vs Notarielles Testament",
      costSaving: "Kostenersparnis",
      timeSaving: "Zeitersparnis",
      zeroLoss: "Kein Verlustrisiko",
      rows: [
        {
          icon: DollarSign,
          label: "Gesamtkosten",
          traditional: "€500 ~ €3,000+",
          traditionalSub: "Notargebühren + Zeugenkosten + Beratungsgebühren",
          everwill: "€39",
          everwillSub: "Alles inklusive (1 Jahr kostenlose Aufbewahrung)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "Zeitaufwand",
          traditional: "2 Wochen ~ 3 Monate",
          traditionalSub: "Notar buchen → Beratung → Entwurf → Beurkundung",
          everwill: "17 Minuten",
          everwillSub: "KI-Assistent — sofort fertig",
          highlight: true,
        },
        {
          icon: Users,
          label: "Zeugen",
          traditional: "2 Zeugen erforderlich",
          traditionalSub: "Persönliche Anwesenheit, Unterschrift — aufwendig",
          everwill: "Nicht erforderlich",
          everwillSub: "Ersetzt durch eKYC-Identitätsprüfung",
          highlight: false,
        },
        {
          icon: FileText,
          label: "Testamentsformen & Recht",
          traditional: "Eigenhändiges oder notarielles Testament",
          traditionalSub: "§2247 BGB (eigenhändig, kein Zeuge nötig) · §2232 BGB (notariell)",
          everwill: "Elektronisch zertifiziertes Testament",
          everwillSub: "eKYC + Distributed Encryption Security-Zeitstempel + RFC 3161 · Zentrales Testamentsregister",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Pflichtteil & Zwangserbrecht",
          traditional: "Pflichtteilsrecht (§2303 BGB)",
          traditionalSub: "Kinder/Ehegatte: 1/2 des gesetzlichen Erbteils · Enterbung möglich, aber Pflichtteil bleibt",
          everwill: "Automatische Pflichtteilsprüfung",
          everwillSub: "KI warnt bei Pflichtteilsverletzung · Rechtssichere Gestaltung",
          highlight: false,
        },
        {
          icon: Zap,
          label: "Nachlassabwicklung",
          traditional: "Familie muss alles regeln",
          traditionalSub: "Nachlassgericht → Anwalt → Erbschaftsverfahren → Monate",
          everwill: "Automatische Abwicklung",
          everwillSub: "4-fache Todeserkennung → auto. Erbenbenachrichtigung → auto. Anwalt",
          highlight: false,
        },
      ],
    },
    es: {
      sectionTitle: "¿Por qué EverWill?",
      sectionSub: "Compare el testamento notarial tradicional con la certificación digital de EverWill.",
      categoryLabel: "Categoría",
      traditionalLabel: "Testamento Notarial",
      summaryLabel: "EverWill vs Testamento Notarial",
      costSaving: "Ahorro en costos",
      timeSaving: "Tiempo ahorrado",
      zeroLoss: "Riesgo cero de pérdida",
      rows: [
        {
          icon: DollarSign,
          label: "Costo total",
          traditional: "$500 ~ $3,000+",
          traditionalSub: "Honorarios notariales + testigos + asesoría legal",
          everwill: "$39",
          everwillSub: "Todo incluido (1 año de almacenamiento gratuito)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "Tiempo requerido",
          traditional: "2 semanas ~ 3 meses",
          traditionalSub: "Notario → consulta → redacción → firma → archivo",
          everwill: "17 minutos",
          everwillSub: "Asistente IA — completado al instante",
          highlight: true,
        },
        {
          icon: Users,
          label: "Testigos",
          traditional: "2 testigos requeridos",
          traditionalSub: "Presencia personal, firma — costoso e inconveniente",
          everwill: "No requerido",
          everwillSub: "Reemplazado por verificación eKYC",
          highlight: false,
        },
        {
          icon: FileText,
          label: "Formas testamentarias",
          traditional: "Testamento abierto / ológrafo / cerrado",
          traditionalSub: "Art. 694 CC (notarial) · Art. 688 CC (ológrafo, sin testigos) · Registro Central",
          everwill: "Testamento Electrónico",
          everwillSub: "eKYC + sello de tiempo distributed encryption security + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Legítima & Herencia forzosa",
          traditional: "Legítima estricta (Art. 806 CC)",
          traditionalSub: "Hijos: 2/3 del caudal · Cónyuge: usufructo 1/3 · Varía por comunidad autónoma",
          everwill: "Verificación automática de legítima",
          everwillSub: "IA detecta violaciones de legítima en tiempo real · Protección legal",
          highlight: false,
        },
        {
          icon: Zap,
          label: "Ejecución post-mortem",
          traditional: "La familia lo gestiona todo",
          traditionalSub: "Tribunal → abogado → trámites sucesorios → meses",
          everwill: "Ejecución automática",
          everwillSub: "Detección 4 capas → notif. auto herederos → abogado auto",
          highlight: false,
        },
      ],
    },
    ar: {
      sectionTitle: "لماذا EverWill؟",
      sectionSub: "قارن بين التوثيق التقليدي وشهادة EverWill الرقمية.",
      categoryLabel: "الفئة",
      traditionalLabel: "التوثيق التقليدي",
      summaryLabel: "EverWill مقابل التوثيق التقليدي",
      costSaving: "توفير التكاليف",
      timeSaving: "توفير الوقت",
      zeroLoss: "صفر مخاطر الضياع",
      rows: [
        {
          icon: DollarSign,
          label: "التكلفة الإجمالية",
          traditional: "500 ~ 5,000 ريال+",
          traditionalSub: "رسوم المحامي + التوثيق + الشهود",
          everwill: "149 ريال",
          everwillSub: "شامل جميع التكاليف (تخزين مجاني لسنة)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "الوقت المطلوب",
          traditional: "أسبوعان ~ 3 أشهر",
          traditionalSub: "محامٍ → استشارة → صياغة → توثيق → حفظ",
          everwill: "17 دقيقة",
          everwillSub: "مساعد الذكاء الاصطناعي — مكتمل فوراً",
          highlight: true,
        },
        {
          icon: Users,
          label: "الشهود",
          traditional: "شاهدان مطلوبان",
          traditionalSub: "حضور شخصي وتوقيع — مكلف ومرهق",
          everwill: "غير مطلوب",
          everwillSub: "يُستبدل بالتحقق من الهوية eKYC",
          highlight: false,
        },
        {
          icon: FileText,
          label: "أنواع الوصية والقانون",
          traditional: "الوصية (Wasiyyah) وفق الشريعة الإسلامية",
          traditionalSub: "الوصية بحد أقصى 1/3 من التركة · الباقي يُوزَّع وفق الفرائض",
          everwill: "وصية معتمدة إلكترونياً",
          everwillSub: "eKYC + طابع زمني بلوكتشين + RFC 3161 · متوافق مع الشريعة",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "الإرث الإجباري (الفرائض)",
          traditional: "الفرائض الشرعية الإجبارية",
          traditionalSub: "حصة الذكر = ضعف حصة الأنثى · غير المسلم لا يرث المسلم · UAE 2023: خيار القانون",
          everwill: "حساب الفرائض تلقائياً",
          everwillSub: "AI يحسب حصص الشريعة تلقائياً · تنبيه عند مخالفة أحكام الفرائض",
          highlight: false,
        },
        {
          icon: Zap,
          label: "التنفيذ بعد الوفاة",
          traditional: "الأسرة تتولى كل شيء",
          traditionalSub: "المحكمة → محامٍ → إجراءات الإرث → أشهر",
          everwill: "تنفيذ تلقائي",
          everwillSub: "كشف 4 طبقات → إشعار تلقائي للورثة → محامٍ تلقائي",
          highlight: false,
        },
      ],
    },
    fr: {
      sectionTitle: "Pourquoi EverWill ?",
      sectionSub: "Comparez le testament notarié traditionnel avec la certification numérique EverWill.",
      categoryLabel: "Catégorie",
      traditionalLabel: "Testament notarié",
      summaryLabel: "EverWill vs Testament notarié",
      costSaving: "Économies réalisées",
      timeSaving: "Temps économisé",
      zeroLoss: "Zéro risque de perte",
      rows: [
        {
          icon: DollarSign,
          label: "Coût total",
          traditional: "€500 ~ €3,000+",
          traditionalSub: "Honoraires notaire + témoins + frais de conseil",
          everwill: "€39",
          everwillSub: "Tout inclus (1 an de stockage gratuit)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "Temps requis",
          traditional: "2 semaines ~ 3 mois",
          traditionalSub: "Notaire → consultation → rédaction → signature",
          everwill: "17 minutes",
          everwillSub: "Assistant IA — terminé instantanément",
          highlight: true,
        },
        {
          icon: Users,
          label: "Témoins",
          traditional: "2 témoins requis",
          traditionalSub: "Présence physique, signature — coûteux et contraignant",
          everwill: "Non requis",
          everwillSub: "Remplacé par la vérification eKYC",
          highlight: false,
        },
        {
          icon: FileText,
          label: "Formes testamentaires",
          traditional: "Testament olographe / authentique / mystique",
          traditionalSub: "Art. 970 CC (olographe, sans témoin) · Art. 971 CC (authentique, notaire+2 témoins)",
          everwill: "Testament électronique certifié",
          everwillSub: "eKYC + horodatage distributed encryption security + RFC 3161 · FCDDV (fichier central)",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Réserve héréditaire",
          traditional: "Réserve héréditaire (Art. 912 CC)",
          traditionalSub: "1 enfant: 1/2 · 2 enfants: 2/3 · 3+ enfants: 3/4 · Règl. EU 650/2012",
          everwill: "Vérification automatique de la réserve",
          everwillSub: "L'IA détecte les violations en temps réel · Protection juridique complète",
          highlight: false,
        },
        {
          icon: Zap,
          label: "Exécution post-mortem",
          traditional: "La famille gère tout",
          traditionalSub: "Tribunal → avocat → procédure successorale → des mois",
          everwill: "Exécution automatique",
          everwillSub: "Détection 4 couches → notif. auto héritiers → avocat auto",
          highlight: false,
        },
      ],
    },
    ru: {
      sectionTitle: "Почему EverWill?",
      sectionSub: "Сравните традиционное нотариальное завещание с цифровой сертификацией EverWill.",
      categoryLabel: "Категория",
      traditionalLabel: "Нотариальное завещание",
      summaryLabel: "EverWill vs Нотариальное завещание",
      costSaving: "Экономия средств",
      timeSaving: "Экономия времени",
      zeroLoss: "Нулевой риск утери",
      rows: [
        {
          icon: DollarSign,
          label: "Общая стоимость",
          traditional: "5,000 ~ 50,000 ₽+",
          traditionalSub: "Нотариальные сборы + свидетели + юридические услуги",
          everwill: "3,500 ₽",
          everwillSub: "Всё включено (1 год бесплатного хранения)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "Требуемое время",
          traditional: "2 недели ~ 3 месяца",
          traditionalSub: "Нотариус → консультация → составление → подпись",
          everwill: "17 минут",
          everwillSub: "ИИ-ассистент — готово мгновенно",
          highlight: true,
        },
        {
          icon: Users,
          label: "Свидетели",
          traditional: "2 свидетеля обязательны",
          traditionalSub: "Личное присутствие, подпись — дорого и неудобно",
          everwill: "Не требуются",
          everwillSub: "Заменено верификацией eKYC",
          highlight: false,
        },
        {
          icon: FileText,
          label: "Формы завещания и закон",
          traditional: "Нотариально удостоверенное завещание",
          traditionalSub: "Ст. 1125 ГК РФ (нотариальное) · Закрытое завещание: ст. 1126 · Нотариус обязателен",
          everwill: "Электронно сертифицированное завещание",
          everwillSub: "eKYC + блокчейн-метка времени + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Обязательная доля",
          traditional: "Обязательная доля (ст. 1149 ГК РФ)",
          traditionalSub: "Нетрудоспособные наследники: 1/2 законной доли · Завещательный отказ",
          everwill: "Автоматическая проверка",
          everwillSub: "ИИ предупреждает о нарушении обязательной доли · Правовая защита",
          highlight: false,
        },
        {
          icon: Zap,
          label: "Исполнение после смерти",
          traditional: "Семья занимается всем сама",
          traditionalSub: "Суд → адвокат → наследственные процедуры → месяцы",
          everwill: "Автоматическое исполнение",
          everwillSub: "4-уровневое обнаружение → авто-уведомление → авто-адвокат",
          highlight: false,
        },
      ],
    },
    hi: {
      sectionTitle: "EverWill क्यों?",
      sectionSub: "पारंपरिक नोटरी वसीयत और EverWill की डिजिटल प्रमाणीकरण की तुलना करें।",
      categoryLabel: "श्रेणी",
      traditionalLabel: "पारंपरिक नोटरी",
      summaryLabel: "EverWill बनाम पारंपरिक नोटरी",
      costSaving: "लागत बचत",
      timeSaving: "समय बचत",
      zeroLoss: "शून्य हानि जोखिम",
      rows: [
        {
          icon: DollarSign,
          label: "कुल लागत",
          traditional: "₹5,000 ~ ₹50,000+",
          traditionalSub: "वकील शुल्क + नोटरी + गवाह खर्च",
          everwill: "₹3,200",
          everwillSub: "सब कुछ शामिल (1 साल मुफ्त स्टोरेज)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "आवश्यक समय",
          traditional: "2 सप्ताह ~ 3 महीने",
          traditionalSub: "वकील → परामर्श → मसौदा → हस्ताक्षर → संग्रह",
          everwill: "17 मिनट",
          everwillSub: "AI सहायक — तुरंत पूर्ण",
          highlight: true,
        },
        {
          icon: Users,
          label: "गवाह",
          traditional: "2 गवाह अनिवार्य",
          traditionalSub: "व्यक्तिगत उपस्थिति, हस्ताक्षर — महंगा और असुविधाजनक",
          everwill: "आवश्यक नहीं",
          everwillSub: "eKYC पहचान सत्यापन से प्रतिस्थापित",
          highlight: false,
        },
        {
          icon: FileText,
          label: "वसीयत के प्रकार और कानून",
          traditional: "लिखित वसीयत + हस्ताक्षर + 2 गवाह",
          traditionalSub: "Indian Succession Act 1925 · मुस्लिम: शरिया कानून · हिंदू: Hindu Succession Act",
          everwill: "इलेक्ट्रॉनिक प्रमाणित वसीयत",
          everwillSub: "eKYC + ब्लॉकचेन टाइमस्टैम्प + RFC 3161 · सभी धर्मों के लिए",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "अनिवार्य उत्तराधिकार",
          traditional: "कोई forced heirship नहीं (गैर-मुस्लिम)",
          traditionalSub: "मुस्लिम: फरायज़ (Faraid) अनिवार्य · Probate प्रक्रिया: 6 माह ~ 3 वर्ष",
          everwill: "स्वचालित अनुपालन जांच",
          everwillSub: "AI धर्म-आधारित नियमों की जांच करता है · कानूनी जोखिम से सुरक्षा",
          highlight: false,
        },
        {
          icon: Zap,
          label: "मृत्यु के बाद निष्पादन",
          traditional: "परिवार सब संभाले",
          traditionalSub: "न्यायालय → वकील → उत्तराधिकार प्रक्रिया → महीनों",
          everwill: "स्वचालित निष्पादन",
          everwillSub: "4-परत पहचान → स्वतः सूचना → स्वतः वकील मिलान",
          highlight: false,
        },
      ],
    },
    pt: {
      sectionTitle: "Por que EverWill?",
      sectionSub: "Compare o testamento em cartório tradicional com a certificação digital EverWill.",
      categoryLabel: "Categoria",
      traditionalLabel: "Testamento em Cartório",
      summaryLabel: "EverWill vs Testamento em Cartório",
      costSaving: "Economia de custos",
      timeSaving: "Tempo economizado",
      zeroLoss: "Risco zero de perda",
      rows: [
        {
          icon: DollarSign,
          label: "Custo total",
          traditional: "R$500 ~ R$5,000+",
          traditionalSub: "Honorários advocatícios + cartório + testemunhas",
          everwill: "R$200",
          everwillSub: "Tudo incluído (1 ano de armazenamento grátis)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "Tempo necessário",
          traditional: "2 semanas ~ 3 meses",
          traditionalSub: "Advogado → consulta → rascunho → assinatura → arquivo",
          everwill: "17 minutos",
          everwillSub: "Assistente IA — concluído instantaneamente",
          highlight: true,
        },
        {
          icon: Users,
          label: "Testemunhas",
          traditional: "2 testemunhas obrigatórias",
          traditionalSub: "Presença pessoal, assinatura — caro e inconveniente",
          everwill: "Não necessário",
          everwillSub: "Substituído por verificação eKYC",
          highlight: false,
        },
        {
          icon: FileText,
          label: "Formas testamentárias",
          traditional: "Testamento público / particular / cerrado",
          traditionalSub: "Art. 1.864 CC (público: notário+2 test.) · Art. 1.876 CC (particular: 3 testemunhas)",
          everwill: "Testamento eletrônico certificado",
          everwillSub: "eKYC + carimbo de tempo distributed encryption security + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Legítima & Herança forçada",
          traditional: "Legítima obrigatória (Art. 1.845 CC)",
          traditionalSub: "Herdeiros necessários: 50% do patrimônio · Filhos/cônjuge/pais protegidos",
          everwill: "Verificação automática de legítima",
          everwillSub: "IA detecta violações em tempo real · Proteção jurídica completa",
          highlight: false,
        },
        {
          icon: Zap,
          label: "Execução pós-morte",
          traditional: "Família gerencia tudo",
          traditionalSub: "Tribunal → advogado → inventário → meses",
          everwill: "Execução automática",
          everwillSub: "Detecção 4 camadas → notif. auto herdeiros → advogado auto",
          highlight: false,
        },
      ],
    },
  };

  const d = localeData[language as keyof typeof localeData] ?? localeData.ko;
  const rows = d.rows;

  return (
    <section id="comparison" className="py-20 lg:py-28 bg-[#F5F4F0]" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2
            className="text-4xl lg:text-6xl font-extrabold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {d.sectionTitle}
          </h2>
          <p className="text-gray-700 text-xl font-semibold max-w-2xl mx-auto">
            {d.sectionSub}
          </p>
        </motion.div>

        {/* ── 테이블 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-3 px-1"
        >
          <div className="text-xs sm:text-base font-extrabold text-gray-500 uppercase tracking-wider flex items-center">
            {d.categoryLabel}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-red-50 border-2 border-red-300 rounded-xl px-2 sm:px-5 py-1.5 sm:py-2.5">
              <X className="w-3 h-3 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              <span className="text-xs sm:text-base font-extrabold text-red-600 leading-tight">
                {d.traditionalLabel}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-[#1F3864] rounded-xl px-2 sm:px-5 py-1.5 sm:py-2.5">
              <Check className="w-3 h-3 sm:w-5 sm:h-5 text-[#C9A961] flex-shrink-0" />
              <span className="text-xs sm:text-base font-extrabold text-white">EverWill</span>
            </div>
          </div>
        </motion.div>

        {/* ── 비교 행 ── */}
        <div className="space-y-2 sm:space-y-3">
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="grid grid-cols-3 gap-0 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden"
              >
                {/* 항목명 */}
                <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-5 py-3 sm:py-5 bg-gray-50 border-r-2 border-gray-100">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#1F3864]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#1F3864]" />
                  </div>
                  <span className="font-extrabold text-[#1F3864] text-xs sm:text-base leading-tight">{row.label}</span>
                </div>

                {/* 기존 공증 */}
                <div className="px-2 sm:px-5 py-3 sm:py-5 border-r-2 border-gray-100">
                  <div className="flex items-start gap-1 sm:gap-2">
                    <X className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className={`font-extrabold leading-tight ${row.highlight ? "text-red-600 text-sm sm:text-xl" : "text-gray-800 text-xs sm:text-base"}`}>
                        {row.traditional}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 leading-snug font-medium hidden sm:block">{row.traditionalSub}</div>
                    </div>
                  </div>
                </div>

                {/* EverWill */}
                <div className={`px-2 sm:px-5 py-3 sm:py-5 ${row.highlight ? "bg-[#1F3864]/5" : ""}`}>
                  <div className="flex items-start gap-1 sm:gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C9A961] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className={`font-extrabold leading-tight ${row.highlight ? "text-[#1F3864] text-sm sm:text-xl" : "text-gray-800 text-xs sm:text-base"}`}>
                        {row.everwill}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-snug font-medium hidden sm:block">{row.everwillSub}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── 요약 배너 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 bg-[#1F3864] rounded-2xl p-10 text-center"
        >
          <div className="text-white/70 text-base mb-5 font-semibold">
            {d.summaryLabel}
          </div>
          <div className="flex justify-center gap-16 flex-wrap">
            <div>
              <div className="text-6xl font-extrabold text-[#C9A961]">97%</div>
              <div className="text-white text-lg font-bold mt-2">{d.costSaving}</div>
            </div>
            <div className="w-px bg-white/20 hidden sm:block" />
            <div>
              <div className="text-6xl font-extrabold text-[#C9A961]">99%</div>
              <div className="text-white text-lg font-bold mt-2">{d.timeSaving}</div>
            </div>
            <div className="w-px bg-white/20 hidden sm:block" />
            <div>
              <div className="text-6xl font-extrabold text-[#C9A961]">100%</div>
              <div className="text-white text-lg font-bold mt-2">{d.zeroLoss}</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
