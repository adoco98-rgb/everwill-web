/**
 * 상속인 서비스 섹션
 * 상속인 전용 가입 절차 + 수수료 계산기
 * 각국 언어에 맞는 통화 표시 (KO: 원화, 해외: USD)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { isKorean, getCurrencySymbol, getCurrencyName } from "@/lib/pricing";
import {
  UserCheck,
  FileText,
  Scale,
  CheckCircle,
  Calculator,
  ArrowRight,
  Shield,
  Clock,
  Globe,
} from "lucide-react";

// 기준 환율 및 해외 프리미엄
const BASE_EXCHANGE_RATE = 1400; // 1 USD = 1,400 KRW
const OVERSEAS_PREMIUM = 1.15;   // 해외 +15%

// 한국 기준 수수료
const BASE_FEE_KRW = 199000;
const BASE_LIMIT_KRW = 200000000; // 2억
const RATE = 0.001; // 0.1%

// 원화 → 달러 변환 (해외 +15% 프리미엄)
function krwToUsd(krw: number): number {
  const raw = (krw / BASE_EXCHANGE_RATE) * OVERSEAS_PREMIUM;
  if (raw < 10) return Math.round(raw);
  if (raw < 50) return Math.round(raw / 5) * 5;
  if (raw < 200) return Math.round(raw / 10) * 10;
  return Math.round(raw / 50) * 50;
}

// 각 언어별 텍스트
const LANG_TEXT: Record<string, {
  badge: string;
  title: string;
  subtitle: string;
  processTitle: string;
  calcTitle: string;
  calcSub: string;
  tier1Label: string;
  tier2Label: string;
  inputLabel: string;
  inputPlaceholder: string;
  feeLabel: string;
  feeNote: string;
  emptyCalc: string;
  cta: string;
  footerNote: string;
  features: string[];
  steps: { title: string; desc: string }[];
}> = {
  ko: {
    badge: "상속인 전용 서비스",
    title: "상속인을 위한 특별한 서비스",
    subtitle: "유언자의 뜻을 이어받아 상속 절차를 스스로 진행할 수 있도록 법적 서류 작성부터 제출까지 도와드립니다.",
    processTitle: "상속인 가입 절차",
    calcTitle: "서비스 수수료 계산기",
    calcSub: "상속 자산 규모에 따라 자동 계산",
    tier1Label: "2억원 이하",
    tier2Label: "2억원 초과분",
    inputLabel: "상속 자산 총액 (원)",
    inputPlaceholder: "예: 500,000,000",
    feeLabel: "예상 서비스 수수료",
    feeNote: "* 실제 수수료는 자산 구성에 따라 달라질 수 있습니다.",
    emptyCalc: "자산 금액을 입력하면 수수료가 자동 계산됩니다",
    cta: "상속인으로 가입하기",
    footerNote: "상속인 서비스는 유언자 사망 확인 후 활성화됩니다. 유언자가 EverWill 회원인 경우에만 이용 가능합니다.",
    features: ["법적 효력 있는 서류 자동 작성", "72시간 이내 서류 완성", "7개국 법률 자동 적용"],
    steps: [
      { title: "상속인으로 가입", desc: "유언자의 사망 후 상속인 코드(Badge QR 또는 유언 번호)로 전용 가입 절차를 진행합니다." },
      { title: "유언 내용 확인", desc: "유언자가 남긴 유언장 전문을 열람하고, 상속 지분 및 특별 지시 사항을 확인합니다." },
      { title: "법적 서류 자동 생성", desc: "상속 신고서, 재산 이전 신청서 등 필요한 법적 양식을 AI가 자동으로 작성해 드립니다." },
      { title: "제출 및 완료", desc: "작성된 서류를 관할 기관(법원·은행·등기소 등)에 직접 제출하거나 온라인으로 신청합니다." },
    ],
  },
  en: {
    badge: "Heir-Only Service",
    title: "A Special Service for Heirs",
    subtitle: "We help heirs carry out the inheritance process independently — from legal document preparation to submission.",
    processTitle: "Heir Registration Process",
    calcTitle: "Service Fee Calculator",
    calcSub: "Auto-calculated by estate size",
    tier1Label: "Up to $200K",
    tier2Label: "Amount over $200K",
    inputLabel: "Total Estate Value (USD)",
    inputPlaceholder: "e.g. 500,000",
    feeLabel: "Estimated Service Fee",
    feeNote: "* Actual fee may vary depending on asset composition.",
    emptyCalc: "Enter asset amount to auto-calculate the fee",
    cta: "Register as Heir",
    footerNote: "Heir services are activated after the testator's death is confirmed. Available only when the testator is an EverWill member.",
    features: ["Legally valid documents auto-generated", "Documents completed within 72 hours", "Laws of 7 countries auto-applied"],
    steps: [
      { title: "Register as Heir", desc: "After the testator's passing, register using the heir code (Badge QR or will number) through a dedicated sign-up process." },
      { title: "Review the Will", desc: "Access the full will document and review inheritance shares and special instructions left by the testator." },
      { title: "Auto-Generate Legal Documents", desc: "AI automatically prepares required legal forms including inheritance declarations and asset transfer applications." },
      { title: "Submit & Complete", desc: "Submit the prepared documents to relevant authorities (courts, banks, registry offices) directly or online." },
    ],
  },
  ja: {
    badge: "相続人専用サービス",
    title: "相続人のための特別なサービス",
    subtitle: "遺言者の意思を引き継ぎ、相続手続きを自分で進められるよう、法的書類の作成から提出まで支援します。",
    processTitle: "相続人登録プロセス",
    calcTitle: "サービス手数料計算機",
    calcSub: "相続資産規模に応じて自動計算",
    tier1Label: "$200K以下",
    tier2Label: "$200K超過分",
    inputLabel: "相続資産総額 (USD)",
    inputPlaceholder: "例: 500,000",
    feeLabel: "予想サービス手数料",
    feeNote: "* 実際の手数料は資産構成により異なる場合があります。",
    emptyCalc: "資産金額を入力すると手数料が自動計算されます",
    cta: "相続人として登録",
    footerNote: "相続人サービスは遺言者の死亡確認後に有効化されます。遺言者がEverWill会員の場合のみご利用いただけます。",
    features: ["法的効力のある書類を自動作成", "72時間以内に書類完成", "7カ国の法律を自動適用"],
    steps: [
      { title: "相続人として登録", desc: "遺言者の死亡後、相続人コード（Badge QRまたは遺言番号）で専用登録手続きを行います。" },
      { title: "遺言内容の確認", desc: "遺言書の全文を閲覧し、相続分および特別指示事項を確認します。" },
      { title: "法的書類の自動生成", desc: "相続申告書、財産移転申請書など必要な法的書式をAIが自動作成します。" },
      { title: "提出・完了", desc: "作成された書類を管轄機関（裁判所・銀行・登記所など）に直接提出またはオンラインで申請します。" },
    ],
  },
  zh: {
    badge: "继承人专属服务",
    title: "为继承人提供的特别服务",
    subtitle: "我们帮助继承人独立完成遗产继承流程——从法律文件准备到提交。",
    processTitle: "继承人注册流程",
    calcTitle: "服务费用计算器",
    calcSub: "根据遗产规模自动计算",
    tier1Label: "20万美元以下",
    tier2Label: "超过20万美元部分",
    inputLabel: "遗产总额 (USD)",
    inputPlaceholder: "例: 500,000",
    feeLabel: "预估服务费用",
    feeNote: "* 实际费用可能因资产构成而有所不同。",
    emptyCalc: "输入资产金额即可自动计算费用",
    cta: "注册为继承人",
    footerNote: "继承人服务在确认遗嘱人死亡后激活。仅当遗嘱人是EverWill会员时方可使用。",
    features: ["自动生成具有法律效力的文件", "72小时内完成文件", "自动适用7国法律"],
    steps: [
      { title: "注册为继承人", desc: "遗嘱人去世后，使用继承人代码（Badge二维码或遗嘱编号）通过专用注册流程进行注册。" },
      { title: "查阅遗嘱内容", desc: "查阅遗嘱全文，确认继承份额及特别指示事项。" },
      { title: "自动生成法律文件", desc: "AI自动准备所需法律表格，包括遗产申报和资产转移申请。" },
      { title: "提交并完成", desc: "将准备好的文件直接提交给相关机构（法院、银行、登记处）或在线申请。" },
    ],
  },
  de: {
    badge: "Erben-Exklusivservice",
    title: "Ein besonderer Service für Erben",
    subtitle: "Wir helfen Erben, den Erbschaftsprozess selbstständig durchzuführen — von der Erstellung rechtlicher Dokumente bis zur Einreichung.",
    processTitle: "Erbenregistrierungsprozess",
    calcTitle: "Servicegebührenrechner",
    calcSub: "Automatisch nach Nachlassgröße berechnet",
    tier1Label: "Bis $200K",
    tier2Label: "Betrag über $200K",
    inputLabel: "Gesamter Nachlasswert (USD)",
    inputPlaceholder: "z.B. 500.000",
    feeLabel: "Geschätzte Servicegebühr",
    feeNote: "* Die tatsächliche Gebühr kann je nach Vermögenszusammensetzung variieren.",
    emptyCalc: "Geben Sie den Vermögensbetrag ein, um die Gebühr automatisch zu berechnen",
    cta: "Als Erbe registrieren",
    footerNote: "Erbendienste werden nach Bestätigung des Todes des Erblassers aktiviert. Nur verfügbar, wenn der Erblasser EverWill-Mitglied ist.",
    features: ["Rechtsgültige Dokumente automatisch erstellt", "Dokumente innerhalb von 72 Stunden fertig", "Gesetze von 7 Ländern automatisch angewendet"],
    steps: [
      { title: "Als Erbe registrieren", desc: "Nach dem Tod des Erblassers mit dem Erbencode (Badge-QR oder Testamentsnummer) registrieren." },
      { title: "Testament prüfen", desc: "Vollständiges Testament einsehen und Erbteile sowie besondere Anweisungen prüfen." },
      { title: "Rechtsdokumente automatisch erstellen", desc: "KI erstellt automatisch erforderliche Rechtsformulare einschließlich Erbschaftserklärungen." },
      { title: "Einreichen & Abschließen", desc: "Dokumente bei zuständigen Behörden (Gerichte, Banken, Grundbuchämter) einreichen." },
    ],
  },
  es: {
    badge: "Servicio Exclusivo para Herederos",
    title: "Un Servicio Especial para Herederos",
    subtitle: "Ayudamos a los herederos a llevar a cabo el proceso de herencia de forma independiente — desde la preparación de documentos legales hasta su presentación.",
    processTitle: "Proceso de Registro de Heredero",
    calcTitle: "Calculadora de Honorarios",
    calcSub: "Calculado automáticamente según el tamaño del patrimonio",
    tier1Label: "Hasta $200K",
    tier2Label: "Cantidad sobre $200K",
    inputLabel: "Valor Total del Patrimonio (USD)",
    inputPlaceholder: "ej. 500,000",
    feeLabel: "Honorario Estimado",
    feeNote: "* El honorario real puede variar según la composición de los activos.",
    emptyCalc: "Ingrese el monto del activo para calcular automáticamente el honorario",
    cta: "Registrarse como Heredero",
    footerNote: "Los servicios para herederos se activan después de confirmar el fallecimiento del testador. Solo disponible cuando el testador es miembro de EverWill.",
    features: ["Documentos legalmente válidos generados automáticamente", "Documentos completados en 72 horas", "Leyes de 7 países aplicadas automáticamente"],
    steps: [
      { title: "Registrarse como Heredero", desc: "Tras el fallecimiento del testador, regístrese usando el código de heredero (Badge QR o número de testamento)." },
      { title: "Revisar el Testamento", desc: "Acceda al testamento completo y revise las cuotas de herencia e instrucciones especiales." },
      { title: "Generar Documentos Legales Automáticamente", desc: "La IA prepara automáticamente los formularios legales requeridos." },
      { title: "Presentar y Completar", desc: "Presente los documentos a las autoridades competentes (tribunales, bancos, registros) directamente o en línea." },
    ],
  },
  ar: {
    badge: "خدمة حصرية للورثة",
    title: "خدمة خاصة للورثة",
    subtitle: "نساعد الورثة على إجراء عملية الإرث بشكل مستقل — من إعداد الوثائق القانونية إلى تقديمها.",
    processTitle: "عملية تسجيل الوارث",
    calcTitle: "حاسبة رسوم الخدمة",
    calcSub: "تُحسب تلقائياً حسب حجم التركة",
    tier1Label: "حتى $200K",
    tier2Label: "المبلغ الزائد عن $200K",
    inputLabel: "إجمالي قيمة التركة (USD)",
    inputPlaceholder: "مثال: 500,000",
    feeLabel: "رسوم الخدمة المقدرة",
    feeNote: "* قد تختلف الرسوم الفعلية حسب تكوين الأصول.",
    emptyCalc: "أدخل مبلغ الأصول لحساب الرسوم تلقائياً",
    cta: "التسجيل كوارث",
    footerNote: "يتم تفعيل خدمات الورثة بعد تأكيد وفاة الموصي. متاح فقط عندما يكون الموصي عضواً في EverWill.",
    features: ["وثائق ذات صلاحية قانونية تُنشأ تلقائياً", "اكتمال الوثائق خلال 72 ساعة", "تطبيق تلقائي لقوانين 7 دول"],
    steps: [
      { title: "التسجيل كوارث", desc: "بعد وفاة الموصي، سجّل باستخدام رمز الوارث (QR البادج أو رقم الوصية)." },
      { title: "مراجعة الوصية", desc: "اطّلع على وثيقة الوصية الكاملة وراجع حصص الإرث والتعليمات الخاصة." },
      { title: "إنشاء المستندات القانونية تلقائياً", desc: "تُعدّ الذكاء الاصطناعي تلقائياً النماذج القانونية المطلوبة." },
      { title: "التقديم والإتمام", desc: "قدّم المستندات إلى الجهات المختصة (المحاكم، البنوك، مكاتب التسجيل) مباشرةً أو عبر الإنترنت." },
    ],
  },
  fr: {
    badge: "Service Exclusif pour Héritiers",
    title: "Un Service Spécial pour les Héritiers",
    subtitle: "Nous aidons les héritiers à mener à bien le processus de succession de manière indépendante — de la préparation des documents légaux à leur soumission.",
    processTitle: "Processus d'Inscription des Héritiers",
    calcTitle: "Calculateur de Frais de Service",
    calcSub: "Calculé automatiquement selon la taille du patrimoine",
    tier1Label: "Jusqu'à $200K",
    tier2Label: "Montant au-delà de $200K",
    inputLabel: "Valeur Totale du Patrimoine (USD)",
    inputPlaceholder: "ex. 500 000",
    feeLabel: "Frais de Service Estimés",
    feeNote: "* Les frais réels peuvent varier selon la composition des actifs.",
    emptyCalc: "Entrez le montant des actifs pour calculer automatiquement les frais",
    cta: "S'inscrire comme Héritier",
    footerNote: "Les services pour héritiers sont activés après confirmation du décès du testateur. Disponible uniquement lorsque le testateur est membre d'EverWill.",
    features: ["Documents juridiquement valides générés automatiquement", "Documents complétés en 72 heures", "Lois de 7 pays appliquées automatiquement"],
    steps: [
      { title: "S'inscrire comme Héritier", desc: "Après le décès du testateur, inscrivez-vous avec le code héritier (Badge QR ou numéro de testament)." },
      { title: "Consulter le Testament", desc: "Accédez au testament complet et vérifiez les parts d'héritage et les instructions spéciales." },
      { title: "Générer Automatiquement les Documents Légaux", desc: "L'IA prépare automatiquement les formulaires juridiques requis." },
      { title: "Soumettre et Finaliser", desc: "Soumettez les documents aux autorités compétentes (tribunaux, banques, registres) directement ou en ligne." },
    ],
  },
  ru: {
    badge: "Эксклюзивная Служба для Наследников",
    title: "Особый Сервис для Наследников",
    subtitle: "Мы помогаем наследникам самостоятельно провести процесс наследования — от подготовки юридических документов до их подачи.",
    processTitle: "Процесс Регистрации Наследника",
    calcTitle: "Калькулятор Сервисных Сборов",
    calcSub: "Автоматически рассчитывается по размеру имущества",
    tier1Label: "До $200K",
    tier2Label: "Сумма свыше $200K",
    inputLabel: "Общая Стоимость Имущества (USD)",
    inputPlaceholder: "напр. 500 000",
    feeLabel: "Расчётный Сервисный Сбор",
    feeNote: "* Фактический сбор может варьироваться в зависимости от состава активов.",
    emptyCalc: "Введите сумму активов для автоматического расчёта сбора",
    cta: "Зарегистрироваться как Наследник",
    footerNote: "Услуги для наследников активируются после подтверждения смерти завещателя. Доступно только когда завещатель является членом EverWill.",
    features: ["Юридически действительные документы создаются автоматически", "Документы готовы в течение 72 часов", "Законы 7 стран применяются автоматически"],
    steps: [
      { title: "Зарегистрироваться как Наследник", desc: "После смерти завещателя зарегистрируйтесь с кодом наследника (Badge QR или номер завещания)." },
      { title: "Ознакомиться с Завещанием", desc: "Просмотрите полный текст завещания и проверьте доли наследства и особые инструкции." },
      { title: "Автоматически Создать Юридические Документы", desc: "ИИ автоматически подготавливает необходимые юридические формы." },
      { title: "Подать и Завершить", desc: "Подайте документы в соответствующие органы (суды, банки, реестры) напрямую или онлайн." },
    ],
  },
  hi: {
    badge: "उत्तराधिकारियों के लिए विशेष सेवा",
    title: "उत्तराधिकारियों के लिए एक विशेष सेवा",
    subtitle: "हम उत्तराधिकारियों को विरासत प्रक्रिया स्वतंत्र रूप से पूरी करने में मदद करते हैं — कानूनी दस्तावेज़ तैयार करने से लेकर जमा करने तक।",
    processTitle: "उत्तराधिकारी पंजीकरण प्रक्रिया",
    calcTitle: "सेवा शुल्क कैलकुलेटर",
    calcSub: "संपत्ति के आकार के अनुसार स्वचालित गणना",
    tier1Label: "$200K तक",
    tier2Label: "$200K से अधिक राशि",
    inputLabel: "कुल संपत्ति मूल्य (USD)",
    inputPlaceholder: "उदा. 500,000",
    feeLabel: "अनुमानित सेवा शुल्क",
    feeNote: "* वास्तविक शुल्क संपत्ति की संरचना के आधार पर भिन्न हो सकता है।",
    emptyCalc: "शुल्क की स्वचालित गणना के लिए संपत्ति राशि दर्ज करें",
    cta: "उत्तराधिकारी के रूप में पंजीकरण करें",
    footerNote: "उत्तराधिकारी सेवाएं वसीयतकर्ता की मृत्यु की पुष्टि के बाद सक्रिय होती हैं। केवल तभी उपलब्ध जब वसीयतकर्ता EverWill सदस्य हो।",
    features: ["कानूनी रूप से वैध दस्तावेज़ स्वचालित रूप से तैयार", "72 घंटों के भीतर दस्तावेज़ पूर्ण", "7 देशों के कानून स्वचालित रूप से लागू"],
    steps: [
      { title: "उत्तराधिकारी के रूप में पंजीकरण", desc: "वसीयतकर्ता के निधन के बाद, उत्तराधिकारी कोड (Badge QR या वसीयत नंबर) का उपयोग करके पंजीकरण करें।" },
      { title: "वसीयत की समीक्षा करें", desc: "पूर्ण वसीयत दस्तावेज़ देखें और विरासत के हिस्से और विशेष निर्देश जांचें।" },
      { title: "कानूनी दस्तावेज़ स्वचालित रूप से तैयार करें", desc: "AI स्वचालित रूप से आवश्यक कानूनी फ़ॉर्म तैयार करता है।" },
      { title: "जमा करें और पूरा करें", desc: "तैयार दस्तावेज़ संबंधित अधिकारियों (न्यायालय, बैंक, रजिस्ट्री) को सीधे या ऑनलाइन जमा करें।" },
    ],
  },
  pt: {
    badge: "Serviço Exclusivo para Herdeiros",
    title: "Um Serviço Especial para Herdeiros",
    subtitle: "Ajudamos os herdeiros a conduzir o processo de herança de forma independente — da preparação de documentos legais à submissão.",
    processTitle: "Processo de Registro de Herdeiro",
    calcTitle: "Calculadora de Taxas de Serviço",
    calcSub: "Calculado automaticamente pelo tamanho do espólio",
    tier1Label: "Até $200K",
    tier2Label: "Valor acima de $200K",
    inputLabel: "Valor Total do Espólio (USD)",
    inputPlaceholder: "ex. 500.000",
    feeLabel: "Taxa de Serviço Estimada",
    feeNote: "* A taxa real pode variar dependendo da composição dos ativos.",
    emptyCalc: "Insira o valor do ativo para calcular automaticamente a taxa",
    cta: "Registrar como Herdeiro",
    footerNote: "Os serviços para herdeiros são ativados após a confirmação do falecimento do testador. Disponível apenas quando o testador é membro do EverWill.",
    features: ["Documentos juridicamente válidos gerados automaticamente", "Documentos concluídos em 72 horas", "Leis de 7 países aplicadas automaticamente"],
    steps: [
      { title: "Registrar como Herdeiro", desc: "Após o falecimento do testador, registre-se usando o código do herdeiro (Badge QR ou número do testamento)." },
      { title: "Revisar o Testamento", desc: "Acesse o documento completo do testamento e revise as cotas de herança e instruções especiais." },
      { title: "Gerar Documentos Legais Automaticamente", desc: "A IA prepara automaticamente os formulários legais necessários." },
      { title: "Enviar e Concluir", desc: "Envie os documentos às autoridades competentes (tribunais, bancos, cartórios) diretamente ou online." },
    ],
  },
};

export default function HeirServiceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { language } = useLanguage();
  const isKo = isKorean(language);
  const symbol = getCurrencySymbol(language);
  const currencyName = getCurrencyName(language);

  const t = LANG_TEXT[language] ?? LANG_TEXT["en"];

  const [assetAmount, setAssetAmount] = useState<string>("");
  const [fee, setFee] = useState<number | null>(null);

  // 한국어: 원화 기준 계산, 해외: USD 기준 계산
  const BASE_FEE = isKo ? BASE_FEE_KRW : krwToUsd(BASE_FEE_KRW);
  const BASE_LIMIT = isKo ? BASE_LIMIT_KRW : krwToUsd(BASE_LIMIT_KRW);

  function calculateFee(input: string) {
    const raw = input.replace(/[^0-9]/g, "");
    const amount = parseInt(raw, 10);
    if (isNaN(amount) || amount <= 0) {
      setFee(null);
      return;
    }
    if (amount <= BASE_LIMIT) {
      setFee(BASE_FEE);
    } else {
      const extra = (amount - BASE_LIMIT) * RATE;
      setFee(BASE_FEE + extra);
    }
  }

  function formatAmount(n: number) {
    if (isKo) return "₩" + Math.round(n).toLocaleString("ko-KR");
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function formatInput(val: string) {
    const raw = val.replace(/[^0-9]/g, "");
    if (!raw) return "";
    return parseInt(raw, 10).toLocaleString(isKo ? "ko-KR" : "en-US");
  }

  // 수수료 구조 표시 텍스트
  const tier1Value = isKo ? "₩199,000" : `$${krwToUsd(BASE_FEE_KRW)}`;
  const tier2Value = isKo
    ? "₩199,000 + 초과분 × 0.1%"
    : `$${krwToUsd(BASE_FEE_KRW)} + excess × 0.1%`;

  const icons = [UserCheck, FileText, Scale, CheckCircle];

  return (
    <section id="heir-service" className="py-20 lg:py-28 bg-[#F5F3EE]" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="section-divider mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 bg-[#1F3864]/10 border border-[#1F3864]/20 rounded-full px-4 py-1.5 mb-4">
            <UserCheck className="w-4 h-4 text-[#1F3864]" />
            <span className="text-[#1F3864] text-sm font-bold">{t.badge}</span>
          </div>
          <h2
            className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── 2단 레이아웃: 가입 절차 + 수수료 계산기 ── */}
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">

          {/* 왼쪽: 가입 절차 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col"
          >
            <h3 className="text-xl font-bold text-[#1F3864] mb-6 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-[#C9A961]" />
              {t.processTitle}
            </h3>
            <div className="space-y-4 flex-1">
              {t.steps.map((step, i) => {
                const Icon = icons[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="flex gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1F3864]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#1F3864]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#C9A961] bg-[#C9A961]/10 rounded-full px-2 py-0.5">
                          STEP {i + 1}
                        </span>
                        <span className="font-bold text-[#1F3864] text-sm">{step.title}</span>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 특징 뱃지 */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[Shield, Clock, Globe].map((Icon, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white border border-[#C9A961]/30 rounded-full px-4 py-2 text-sm font-semibold text-[#1F3864]"
                >
                  <Icon className="w-4 h-4 text-[#C9A961]" />
                  {t.features[i]}
                </div>
              ))}
            </div>
          </motion.div>

          {/* 오른쪽: 수수료 계산기 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#C9A961]/15 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-[#C9A961]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1F3864] text-lg">{t.calcTitle}</h3>
                <p className="text-gray-500 text-xs">{t.calcSub}</p>
              </div>
            </div>

            {/* 수수료 구조 안내 */}
            <div className="bg-[#F5F3EE] rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{t.tier1Label}</span>
                <span className="font-bold text-[#1F3864]">{tier1Value}</span>
              </div>
              <div className="h-px bg-gray-200" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{t.tier2Label}</span>
                <span className="font-bold text-[#1F3864]">{tier2Value}</span>
              </div>
            </div>

            {/* 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-[#1F3864] mb-2">
                {t.inputLabel}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                  {symbol}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t.inputPlaceholder}
                  value={assetAmount}
                  onChange={(e) => {
                    const formatted = formatInput(e.target.value);
                    setAssetAmount(formatted);
                    calculateFee(e.target.value);
                  }}
                  className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl text-[#1F3864] font-semibold focus:border-[#C9A961] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* 결과 */}
            {fee !== null ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] rounded-2xl p-5 text-white"
              >
                <div className="text-sm font-medium text-white/70 mb-1">{t.feeLabel}</div>
                <div className="text-3xl font-extrabold mb-2">{formatAmount(fee)}</div>
                {fee > BASE_FEE && (
                  <div className="text-xs text-white/60">
                    {isKo
                      ? `기본 ₩199,000 + 초과분 ${formatAmount(fee - BASE_FEE)}`
                      : `Base ${formatAmount(BASE_FEE)} + excess ${formatAmount(fee - BASE_FEE)}`}
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-white/20 text-xs text-white/60">
                  {t.feeNote}
                </div>
              </motion.div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-5 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
                {t.emptyCalc}
              </div>
            )}

            {/* CTA */}
            <div className="flex-1" />
            <button
              onClick={() => {
                const el = document.getElementById("heir-register");
                if (el) el.scrollIntoView({ behavior: "smooth" });
                else alert(isKo ? "서비스 준비 중입니다. 곧 오픈합니다!" : "Coming soon!");
              }}
              className="mt-5 w-full py-3 rounded-xl bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              {t.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* ── 하단 안내 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-2xl px-6 py-4 text-center"
        >
          <p className="text-gray-600 text-sm leading-relaxed">{t.footerNote}</p>
        </motion.div>

      </div>
    </section>
  );
}
