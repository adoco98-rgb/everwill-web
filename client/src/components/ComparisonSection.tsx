/**
 * 기존 공증 vs EverWill 전자공증 비교 섹션
 * 국가별 현실 반영 금액/설명 적용
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
          traditional: "300,000원 ~ 1,500,000원+",
          traditionalSub: "변호사 수임료 + 공증료 + 증인 교통비 등",
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
          label: "증인",
          traditional: "증인 2명 필수",
          traditionalSub: "직접 섭외, 서명, 날인 — 번거롭고 비용 발생",
          everwill: "불필요",
          everwillSub: "eKYC 본인인증으로 대체",
          highlight: false,
        },
        {
          icon: FileText,
          label: "법적 효력",
          traditional: "공증 유언장",
          traditionalSub: "민법 제1068조 공증인 유언",
          everwill: "전자 인증 유언장",
          everwillSub: "eKYC + 블록체인 타임스탬프 + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "분실·훼손 위험",
          traditional: "높음",
          traditionalSub: "종이 원본 분실 시 효력 없음. 발견 안 되는 경우 다수",
          everwill: "없음",
          everwillSub: "암호화 클라우드 + 블록체인 영구 보존",
          highlight: false,
        },
        {
          icon: Zap,
          label: "사후 집행",
          traditional: "가족이 직접 진행",
          traditionalSub: "법원 검인 → 변호사 선임 → 상속 절차 → 수개월 소요",
          everwill: "자동 집행",
          everwillSub: "4중 사망 감지 → 상속자 자동 알림 → 변호사 자동 매칭",
          highlight: false,
        },
      ],
    },
    en: {
      sectionTitle: "Why EverWill?",
      sectionSub: "Compare traditional U.S. probate with EverWill's digital certification.",
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
          traditionalSub: "Attorney fees + court filing + executor costs",
          everwill: "$39",
          everwillSub: "All-inclusive (1yr free storage)",
          highlight: true,
        },
        {
          icon: Clock,
          label: "Time Required",
          traditional: "9 months ~ 2 years",
          traditionalSub: "Probate court → attorney → asset distribution",
          everwill: "17 minutes",
          everwillSub: "AI checkbox wizard — done instantly",
          highlight: true,
        },
        {
          icon: Users,
          label: "Witnesses",
          traditional: "2 witnesses required",
          traditionalSub: "Must sign in person — costly & inconvenient",
          everwill: "Not required",
          everwillSub: "Replaced by eKYC identity verification",
          highlight: false,
        },
        {
          icon: FileText,
          label: "Legal Validity",
          traditional: "Notarized Will",
          traditionalSub: "State-specific notarization requirements",
          everwill: "E-Certified Will",
          everwillSub: "eKYC + blockchain timestamp + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Loss / Damage Risk",
          traditional: "High",
          traditionalSub: "Lost paper = invalid. ~67% of Americans have no will",
          everwill: "None",
          everwillSub: "Encrypted cloud + blockchain permanent storage",
          highlight: false,
        },
        {
          icon: Zap,
          label: "Post-Death Execution",
          traditional: "Family must handle everything",
          traditionalSub: "Probate court → hire attorney → months of process",
          everwill: "Auto Execution",
          everwillSub: "4-layer detection → auto notify heirs → auto lawyer match",
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
          traditional: "30,000円 〜 200,000円+",
          traditionalSub: "公証人手数料 + 証人費用 + 交通費など",
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
          label: "証人",
          traditional: "証人2名必須",
          traditionalSub: "直接手配・署名・押印 — 手間とコストが発生",
          everwill: "不要",
          everwillSub: "eKYC本人確認で代替",
          highlight: false,
        },
        {
          icon: FileText,
          label: "法的効力",
          traditional: "公正証書遺言",
          traditionalSub: "民法第969条 公証人による遺言",
          everwill: "電子認証遺言",
          everwillSub: "eKYC + ブロックチェーンタイムスタンプ + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "紛失・毀損リスク",
          traditional: "高い",
          traditionalSub: "原本紛失で無効。発見されないケースも多数",
          everwill: "なし",
          everwillSub: "暗号化クラウド + ブロックチェーン永久保存",
          highlight: false,
        },
        {
          icon: Zap,
          label: "死後執行",
          traditional: "家族が直接対応",
          traditionalSub: "家庭裁判所検認 → 弁護士選任 → 相続手続き → 数ヶ月",
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
          label: "法律效力",
          traditional: "公证遗嘱",
          traditionalSub: "公证机关认证遗嘱",
          everwill: "电子认证遗嘱",
          everwillSub: "eKYC + 区块链时间戳 + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "丢失/损毁风险",
          traditional: "高",
          traditionalSub: "原件丢失则无效，许多遗嘱从未被发现",
          everwill: "无",
          everwillSub: "加密云存储 + 区块链永久保存",
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
          label: "Rechtsgültigkeit",
          traditional: "Notarielles Testament",
          traditionalSub: "§2232 BGB notariell beurkundetes Testament",
          everwill: "Elektronisch zertifiziertes Testament",
          everwillSub: "eKYC + Blockchain-Zeitstempel + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Verlust-/Beschädigungsrisiko",
          traditional: "Hoch",
          traditionalSub: "Verlust des Originals = ungültig. Viele Testamente werden nie gefunden",
          everwill: "Keines",
          everwillSub: "Verschlüsselte Cloud + Blockchain-Dauerspeicherung",
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
          label: "Validez legal",
          traditional: "Testamento Notarial",
          traditionalSub: "Art. 694 CC — testamento ante notario",
          everwill: "Testamento Electrónico",
          everwillSub: "eKYC + sello de tiempo blockchain + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "Riesgo de pérdida",
          traditional: "Alto",
          traditionalSub: "Original perdido = inválido. Muchos testamentos nunca se encuentran",
          everwill: "Ninguno",
          everwillSub: "Nube cifrada + almacenamiento permanente blockchain",
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
          label: "الصحة القانونية",
          traditional: "وصية موثقة",
          traditionalSub: "توثيق رسمي وفق نظام الأحوال الشخصية",
          everwill: "وصية معتمدة إلكترونياً",
          everwillSub: "eKYC + طابع زمني بلوكتشين + RFC 3161",
          highlight: false,
        },
        {
          icon: AlertTriangle,
          label: "خطر الضياع",
          traditional: "مرتفع",
          traditionalSub: "فقدان الأصل = لاغٍ. كثير من الوصايا لا تُعثر عليها",
          everwill: "معدوم",
          everwillSub: "سحابة مشفرة + تخزين دائم بالبلوكتشين",
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
