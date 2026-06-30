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
  Briefcase,
} from "lucide-react";

// 기준 환율 및 해외 프리미엄
const BASE_EXCHANGE_RATE = 1400; // 1 USD = 1,400 KRW
const OVERSEAS_PREMIUM = 1.15;   // 해외 +15%

// 한국 기준 수수료 (3단계)
const FREE_LIMIT_KRW = 100000000;  // 1억 이하: 무료
const BASE_FEE_KRW = 199000;       // 1억~2억: ₩199,000
const BASE_LIMIT_KRW = 200000000;  // 2억 이하 상한
const RATE = 0.001;                // 2억 초과분 × 0.1%

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
  tier0Label: string;
  tier1Label: string;
  tier2Label: string;
  tier3Label: string;
  assetBasisNote: string;
  inputLabel: string;
  inputPlaceholder: string;
  feeLabel: string;
  feeNote: string;
  emptyCalc: string;
  cta: string;
  footerNote: string;
  features: string[];
  steps: { title: string; desc: string }[];
  includedItems: string[];
  lawyerTitle: string;
  lawyerDesc: string;
  lawyerFee1: string;
  lawyerFee1Val: string;
  lawyerFee2: string;
  lawyerFee2Val: string;
  lawyerNote: string;
  lawyerCta: string;
  compareTitle: string;
  compareColFeature: string;
  compareColBasic: string;
  compareColLawyer: string;
  compareRows: { feature: string; basic: string | boolean; lawyer: string | boolean }[];
}> = {
  ko: {
    badge: "상속인 전용 서비스",
    title: "상속인을 위한 특별한 서비스",
    subtitle: "유언자의 뜻을 이어받아 상속 절차를 스스로 진행할 수 있도록 법적 서류 작성부터 제출까지 도와드립니다.",
    processTitle: "상속인 가입 절차",
    calcTitle: "서비스 수수료 계산기",
    calcSub: "상속 자산 규모에 따라 자동 계산",
    tier0Label: "1억원 이하",
    tier1Label: "2억원 이하",
    tier2Label: "2억원 초과분",
    tier3Label: "2억원 초과분 × 0.1%",
    assetBasisNote: "* 평가 기준: 현금·주식·채권 = 시가(가액), 부동산 = 공시지가 기준",
    inputLabel: "상속 자산 총액 (원)",
    inputPlaceholder: "예: 500,000,000",
    feeLabel: "예상 서비스 수수료",
    feeNote: "* 실제 수수료는 자산 구성에 따라 달라질 수 있습니다.",
    emptyCalc: "자산 금액을 입력하면 수수료가 자동 계산됩니다",
    cta: "상속인으로 가입하기",
    footerNote: "상속인 서비스는 유언자 사망 확인 후 활성화됩니다. 유언자가 EverWill 회원인 경우에만 이용 가능합니다.",
    features: ["상속 신고 서류 양식 자동 생성", "72시간 이내 서류 완성", "7개국 법률 정보 자동 적용"],
    includedItems: ["상속 절차 전 과정 안내", "상속세 자동 계산", "상속 신고 서류 초안 자동 작성", "온라인 접수 또는 PDF 다운로드"],
    lawyerTitle: "전문 변호사 서비스",
    lawyerDesc: "이의제기·소송 발생 시 EverWill 파트너 법률 전문가가 상속 절차를 지원합니다.",
    lawyerFee1: "착수금",
    lawyerFee1Val: "₩990,000",
    lawyerFee2: "성공 보수",
    lawyerFee2Val: "상속 자산의 1%",
    lawyerNote: "* 전문가 연결 후 위임 동의서가 자동 생성되며 전자서명 후 절차가 진행됩니다.",
    lawyerCta: "전문 변호사 연결 신청하기",
    compareTitle: "서비스 비교",
    compareColFeature: "항목",
    compareColBasic: "기본 서비스",
    compareColLawyer: "전문가 연결",
    compareRows: [
      { feature: "서비스 비용", basic: "₩199,000 (기본)", lawyer: "₩990,000 착수금 + 성공 보수 1%" },
      { feature: "상속 절차 안내", basic: true, lawyer: true },
      { feature: "상속세 자동 계산", basic: true, lawyer: true },
      { feature: "상속 신고 서류 초안 자동 작성", basic: true, lawyer: true },
      { feature: "온라인/PDF 접수 지원", basic: true, lawyer: true },
      { feature: "이의제기·분쟁 대응", basic: false, lawyer: true },
      { feature: "소송 법적 대리", basic: false, lawyer: true },
      { feature: "위임 동의서 자동 생성", basic: false, lawyer: true },
      { feature: "전담 변호사 1:1 상담", basic: false, lawyer: true },
      { feature: "법원 출석 대리", basic: false, lawyer: true }
    ],
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
    tier0Label: "Up to $100K",
    tier1Label: "Up to $200K",
    tier2Label: "Amount over $200K",
    tier3Label: "Excess × 0.1%",
    assetBasisNote: "* Valuation: Cash/Stocks/Bonds = Market Value; Real Estate = Official Assessed Value",
    inputLabel: "Total Estate Value (USD)",
    inputPlaceholder: "e.g. 500,000",
    feeLabel: "Estimated Service Fee",
    feeNote: "* Actual fee may vary depending on asset composition.",
    emptyCalc: "Enter asset amount to auto-calculate the fee",
    cta: "Register as Heir",
    footerNote: "Heir services are activated after the testator's death is confirmed. Available only when the testator is an EverWill member.",
    features: ["Legally valid documents auto-generated", "Documents completed within 72 hours", "Laws of 7 countries auto-applied"],
    includedItems: ["Full inheritance process guidance", "Automatic inheritance tax calculation", "Auto-generated legal filing documents", "Online submission or PDF download"],
    lawyerTitle: "Legal Expert Connection Service",
    lawyerDesc: "If a dispute or lawsuit arises, EverWill's partner legal experts support your inheritance process.",
    lawyerFee1: "Retainer Fee",
    lawyerFee1Val: "$699",
    lawyerFee2: "Contingency Fee",
    lawyerFee2Val: "1% of estate value",
    lawyerNote: "* After connecting with a legal expert, a consent form is auto-generated and the process begins after e-signature.",
    lawyerCta: "Request Expert Consultation",
    compareTitle: "Service Comparison",
    compareColFeature: "Feature",
    compareColBasic: "Basic Service",
    compareColLawyer: "Attorney Service",
    compareRows: [
      { feature: "Service Fee", basic: "$149 (Basic)", lawyer: "$699 retainer + 1% success fee" },
      { feature: "Inheritance Process Guidance", basic: true, lawyer: true },
      { feature: "Automatic Tax Calculation", basic: true, lawyer: true },
      { feature: "Auto-Generated Legal Documents", basic: true, lawyer: true },
      { feature: "Online / PDF Submission Support", basic: true, lawyer: true },
      { feature: "Dispute & Objection Handling", basic: false, lawyer: true },
      { feature: "Litigation Legal Representation", basic: false, lawyer: true },
      { feature: "Auto-Generated Retainer Agreement", basic: false, lawyer: true },
      { feature: "Dedicated Attorney 1:1 Consultation", basic: false, lawyer: true },
      { feature: "Court Appearance Representation", basic: false, lawyer: true }
    ],
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
    tier0Label: "$100K以下",
    tier1Label: "$200K以下",
    tier2Label: "$200K超過分",
    tier3Label: "超過分 × 0.1%",
    assetBasisNote: "* 評価基準：現金・株式・債券 = 時価（価額）、不動産 = 公示地価基準",
    inputLabel: "相続資産総額 (USD)",
    inputPlaceholder: "例: 500,000",
    feeLabel: "予想サービス手数料",
    feeNote: "* 実際の手数料は資産構成により異なる場合があります。",
    emptyCalc: "資産金額を入力すると手数料が自動計算されます",
    cta: "相続人として登録",
    footerNote: "相続人サービスは遺言者の死亡確認後に有効化されます。遺言者がEverWill会員の場合のみご利用いただけます。",
    features: ["法的効力のある書類を自動作成", "72時間以内に書類完成", "7カ国の法律を自動適用"],
    includedItems: ["相続手続き全過程のガイド", "相続税の自動計算", "法的申告書類の自動作成", "オンライン申請またはPDFダウンロード"],
    lawyerTitle: "法律専門家連携サービス",
    lawyerDesc: "異議申し立て・訴訟が発生した場合、EverWillパートナー法律専門家が相続手続きをサポートします。",
    lawyerFee1: "着手金",
    lawyerFee1Val: "¥99,000",
    lawyerFee2: "成功報酬",
    lawyerFee2Val: "相続資産の1%",
    lawyerNote: "* 専門家連携後、同意書が自動生成され、電子署名後に手続きが開始されます。",
    lawyerCta: "専門家相談を申し込む",
    compareTitle: "サービス比較",
    compareColFeature: "項目",
    compareColBasic: "基本サービス",
    compareColLawyer: "弁護士選任",
    compareRows: [
      { feature: "サービス料金", basic: "$149（基本）", lawyer: "専門家連結申請" },
      { feature: "相続手続きガイド", basic: true, lawyer: true },
      { feature: "相続税自動計算", basic: true, lawyer: true },
      { feature: "法的書類自動作成", basic: true, lawyer: true },
      { feature: "オンライン/PDF申請サポート", basic: true, lawyer: true },
      { feature: "異議申し立て・紛争対応", basic: false, lawyer: true },
      { feature: "訴訟法的代理", basic: false, lawyer: true },
      { feature: "委任契約書自動生成", basic: false, lawyer: true },
      { feature: "専任弁護士1:1相談", basic: false, lawyer: true },
      { feature: "法廷出席代理", basic: false, lawyer: true }
    ],
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
    tier0Label: "10万美元以下",
    tier1Label: "20万美元以下",
    tier2Label: "超过20万美元部分",
    tier3Label: "超出部分 × 0.1%",
    assetBasisNote: "* 评估标准：现金/股票/债券 = 市值（价额），房产 = 官方评估价",
    inputLabel: "遗产总额 (USD)",
    inputPlaceholder: "例: 500,000",
    feeLabel: "预估服务费用",
    feeNote: "* 实际费用可能因资产构成而有所不同。",
    emptyCalc: "输入资产金额即可自动计算费用",
    cta: "注册为继承人",
    footerNote: "继承人服务在确认遗嘱人死亡后激活。仅当遗嘱人是EverWill会员时方可使用。",
    features: ["自动生成具有法律效力的文件", "72小时内完成文件", "自动适用7国法律"],
    includedItems: ["继承全程指导", "自动计算遗产税", "自动生成法律申报文件", "在线提交或PDF下载"],
    lawyerTitle: "法律专家连接服务",
    lawyerDesc: "如发生异议或诉讼，EverWill合作法律专家将协助处理继承手续。",
    lawyerFee1: "委托金",
    lawyerFee1Val: "¥4,900",
    lawyerFee2: "成功报酬",
    lawyerFee2Val: "遗产价值的1%",
    lawyerNote: "* 连接专家后，同意书自动生成，电子签名后程序开始进行。",
    lawyerCta: "申请专家咨询",
    compareTitle: "服务比较",
    compareColFeature: "项目",
    compareColBasic: "基本服务",
    compareColLawyer: "律师委托",
    compareRows: [
      { feature: "服务费用", basic: "$149（基本）", lawyer: "申请专家连接" },
      { feature: "继承手续指导", basic: true, lawyer: true },
      { feature: "遗产税自动计算", basic: true, lawyer: true },
      { feature: "法律文件自动生成", basic: true, lawyer: true },
      { feature: "在线/PDF申请支持", basic: true, lawyer: true },
      { feature: "异议与纠纷处理", basic: false, lawyer: true },
      { feature: "诉讼法律代理", basic: false, lawyer: true },
      { feature: "委托合同自动生成", basic: false, lawyer: true },
      { feature: "专属律师1:1咨询", basic: false, lawyer: true },
      { feature: "出庭代理", basic: false, lawyer: true }
    ],
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
    tier0Label: "Bis $100K",
    tier1Label: "Bis $200K",
    tier2Label: "Betrag über $200K",
    tier3Label: "Überschuss × 0,1%",
    assetBasisNote: "* Bewertung: Bargeld/Aktien/Anleihen = Marktwert; Immobilien = Amtlicher Einheitswert",
    inputLabel: "Gesamter Nachlasswert (USD)",
    inputPlaceholder: "z.B. 500.000",
    feeLabel: "Geschätzte Servicegebühr",
    feeNote: "* Die tatsächliche Gebühr kann je nach Vermögenszusammensetzung variieren.",
    emptyCalc: "Geben Sie den Vermögensbetrag ein, um die Gebühr automatisch zu berechnen",
    cta: "Als Erbe registrieren",
    footerNote: "Erbendienste werden nach Bestätigung des Todes des Erblassers aktiviert. Nur verfügbar, wenn der Erblasser EverWill-Mitglied ist.",
    features: ["Rechtsgültige Dokumente automatisch erstellt", "Dokumente innerhalb von 72 Stunden fertig", "Gesetze von 7 Ländern automatisch angewendet"],
    includedItems: ["Vollständige Erbschaftsberatung", "Automatische Erbschaftssteuerberechnung", "Automatisch erstellte Rechtsdokumente", "Online-Einreichung oder PDF-Download"],
    lawyerTitle: "Rechtsexperten-Vermittlungsservice",
    lawyerDesc: "Bei Einsprüchen oder Klagen unterstützen EverWill-Partneranwälte das Erbschaftsverfahren.",
    lawyerFee1: "Honorarvorschuss",
    lawyerFee1Val: "€699",
    lawyerFee2: "Erfolgsprovision",
    lawyerFee2Val: "1% des Nachlasswerts",
    lawyerNote: "* Nach der Expertenverbindung wird automatisch ein Einwilligungsformular erstellt, das nach e-Signatur wirksam wird.",
    lawyerCta: "Expertenberatung anfragen",
    compareTitle: "Servicevergleich",
    compareColFeature: "Merkmal",
    compareColBasic: "Basisservice",
    compareColLawyer: "Anwaltlicher Service",
    compareRows: [
      { feature: "Servicegebühr", basic: "$149 (Basis)", lawyer: "Expertenverbindung beantragen" },
      { feature: "Erbschaftsprozess-Beratung", basic: true, lawyer: true },
      { feature: "Automatische Steuerberechnung", basic: true, lawyer: true },
      { feature: "Automatisch erstellte Rechtsdokumente", basic: true, lawyer: true },
      { feature: "Online/PDF-Einreichungsunterstützung", basic: true, lawyer: true },
      { feature: "Einspruchs- & Streitbearbeitung", basic: false, lawyer: true },
      { feature: "Gerichtliche Rechtsvertretung", basic: false, lawyer: true },
      { feature: "Automatisch erstellter Vollmachtsvertrag", basic: false, lawyer: true },
      { feature: "Dedizierter Anwalt 1:1-Beratung", basic: false, lawyer: true },
      { feature: "Gerichtsvertretung", basic: false, lawyer: true }
    ],
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
    tier0Label: "Hasta $100K",
    tier1Label: "Hasta $200K",
    tier2Label: "Cantidad sobre $200K",
    tier3Label: "Exceso × 0,1%",
    assetBasisNote: "* Valoración: Efectivo/Acciones/Bonos = Valor de mercado; Inmuebles = Valor catastral oficial",
    inputLabel: "Valor Total del Patrimonio (USD)",
    inputPlaceholder: "ej. 500,000",
    feeLabel: "Honorario Estimado",
    feeNote: "* El honorario real puede variar según la composición de los activos.",
    emptyCalc: "Ingrese el monto del activo para calcular automáticamente el honorario",
    cta: "Registrarse como Heredero",
    footerNote: "Los servicios para herederos se activan después de confirmar el fallecimiento del testador. Solo disponible cuando el testador es miembro de EverWill.",
    features: ["Documentos legalmente válidos generados automáticamente", "Documentos completados en 72 horas", "Leyes de 7 países aplicadas automáticamente"],
    includedItems: ["Guía completa del proceso de herencia", "Cálculo automático del impuesto de sucesiones", "Documentos legales generados automáticamente", "Presentación en línea o descarga en PDF"],
    lawyerTitle: "Servicio de Conexión con Expertos Legales",
    lawyerDesc: "En caso de disputa o litigio, los expertos legales asociados de EverWill apoyan el proceso de herencia.",
    lawyerFee1: "Honorario Inicial",
    lawyerFee1Val: "$699",
    lawyerFee2: "Honorario por Éxito",
    lawyerFee2Val: "1% del valor del patrimonio",
    lawyerNote: "* Tras conectar con un experto, se genera automáticamente un formulario de consentimiento que entra en vigor tras la firma electrónica.",
    lawyerCta: "Solicitar Consulta con Experto",
    compareTitle: "Comparación de Servicios",
    compareColFeature: "Característica",
    compareColBasic: "Servicio Básico",
    compareColLawyer: "Servicio de Abogado",
    compareRows: [
      { feature: "Tarifa del Servicio", basic: "$149 (Básico)", lawyer: "Solicitar Conexión con Experto" },
      { feature: "Guía del Proceso de Herencia", basic: true, lawyer: true },
      { feature: "Cálculo Automático de Impuestos", basic: true, lawyer: true },
      { feature: "Documentos Legales Generados Automáticamente", basic: true, lawyer: true },
      { feature: "Soporte de Presentación Online/PDF", basic: true, lawyer: true },
      { feature: "Manejo de Disputas y Objeciones", basic: false, lawyer: true },
      { feature: "Representación Legal en Litigios", basic: false, lawyer: true },
      { feature: "Contrato de Representación Automático", basic: false, lawyer: true },
      { feature: "Consulta 1:1 con Abogado Dedicado", basic: false, lawyer: true },
      { feature: "Representación en Tribunal", basic: false, lawyer: true }
    ],
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
    tier0Label: "حتى $100K",
    tier1Label: "حتى $200K",
    tier2Label: "المبلغ الزائد عن $200K",
    tier3Label: "الزيادة × 0.1%",
    assetBasisNote: "* التقييم: النقد/الأسهم/السندات = القيمة السوقية؛ العقارات = القيمة الرسمية المقدرة",
    inputLabel: "إجمالي قيمة التركة (USD)",
    inputPlaceholder: "مثال: 500,000",
    feeLabel: "رسوم الخدمة المقدرة",
    feeNote: "* قد تختلف الرسوم الفعلية حسب تكوين الأصول.",
    emptyCalc: "أدخل مبلغ الأصول لحساب الرسوم تلقائياً",
    cta: "التسجيل كوارث",
    footerNote: "يتم تفعيل خدمات الورثة بعد تأكيد وفاة الموصي. متاح فقط عندما يكون الموصي عضواً في EverWill.",
    features: ["وثائق ذات صلاحية قانونية تُنشأ تلقائياً", "اكتمال الوثائق خلال 72 ساعة", "تطبيق تلقائي لقوانين 7 دول"],
    includedItems: ["إرشاد شامل لإجراءات الإرث", "حساب تلقائي لضريبة الإرث", "إنشاء تلقائي للوثائق القانونية", "تقديم إلكتروني أو تنزيل PDF"],
    lawyerTitle: "خدمة التواصل مع خبراء قانونيين",
    lawyerDesc: "في حالة الاعتراض أو التقاضي، يدعم خبراء EverWill القانونيون الشركاء إجراءات الميراث.",
    lawyerFee1: "رسوم الاستئجار",
    lawyerFee1Val: "$699",
    lawyerFee2: "أتعاب النجاح",
    lawyerFee2Val: "1% من قيمة التركة",
    lawyerNote: "* بعد التواصل مع الخبير، يُنشأ نموذج الموافقة تلقائياً ويصبح نافذاً بعد التوقيع الإلكتروني.",
    lawyerCta: "طلب استشارة خبير",
    compareTitle: "مقارنة الخدمات",
    compareColFeature: "الميزة",
    compareColBasic: "الخدمة الأساسية",
    compareColLawyer: "خدمة المحامي",
    compareRows: [
      { feature: "رسوم الخدمة", basic: "$149 (أساسي)", lawyer: "طلب ربط خبير" },
      { feature: "إرشاد إجراءات الإرث", basic: true, lawyer: true },
      { feature: "حساب تلقائي للضرائب", basic: true, lawyer: true },
      { feature: "وثائق قانونية تُنشأ تلقائياً", basic: true, lawyer: true },
      { feature: "دعم التقديم الإلكتروني/PDF", basic: true, lawyer: true },
      { feature: "معالجة الاعتراضات والنزاعات", basic: false, lawyer: true },
      { feature: "التمثيل القانوني في التقاضي", basic: false, lawyer: true },
      { feature: "عقد توكيل يُنشأ تلقائياً", basic: false, lawyer: true },
      { feature: "استشارة 1:1 مع محامٍ متخصص", basic: false, lawyer: true },
      { feature: "التمثيل أمام المحكمة", basic: false, lawyer: true }
    ],
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
    tier0Label: "Jusqu'à $100K",
    tier1Label: "Jusqu'à $200K",
    tier2Label: "Montant au-delà de $200K",
    tier3Label: "Excédent × 0,1%",
    assetBasisNote: "* Évaluation : Liquidités/Actions/Obligations = Valeur marchande ; Immobilier = Valeur cadastrale officielle",
    inputLabel: "Valeur Totale du Patrimoine (USD)",
    inputPlaceholder: "ex. 500 000",
    feeLabel: "Frais de Service Estimés",
    feeNote: "* Les frais réels peuvent varier selon la composition des actifs.",
    emptyCalc: "Entrez le montant des actifs pour calculer automatiquement les frais",
    cta: "S'inscrire comme Héritier",
    footerNote: "Les services pour héritiers sont activés après confirmation du décès du testateur. Disponible uniquement lorsque le testateur est membre d'EverWill.",
    features: ["Documents juridiquement valides générés automatiquement", "Documents complétés en 72 heures", "Lois de 7 pays appliquées automatiquement"],
    includedItems: ["Guide complet du processus de succession", "Calcul automatique des droits de succession", "Documents juridiques générés automatiquement", "Soumission en ligne ou téléchargement PDF"],
    lawyerTitle: "Service de Mise en Relation Juridique",
    lawyerDesc: "En cas de litige, les experts juridiques partenaires d'EverWill accompagnent la procédure successorale.",
    lawyerFee1: "Honoraires de Dossier",
    lawyerFee1Val: "€699",
    lawyerFee2: "Honoraires de Succès",
    lawyerFee2Val: "1% de la valeur du patrimoine",
    lawyerNote: "* Après la mise en relation, un formulaire de consentement est généré automatiquement et prend effet après signature électronique.",
    lawyerCta: "Demander une Consultation d'Expert",
    compareTitle: "Comparaison des Services",
    compareColFeature: "Fonctionnalité",
    compareColBasic: "Service de Base",
    compareColLawyer: "Service d'Avocat",
    compareRows: [
      { feature: "Frais de Service", basic: "$149 (Basique)", lawyer: "Demander une Connexion Expert" },
      { feature: "Guide du Processus de Succession", basic: true, lawyer: true },
      { feature: "Calcul Automatique des Impôts", basic: true, lawyer: true },
      { feature: "Documents Juridiques Générés Automatiquement", basic: true, lawyer: true },
      { feature: "Support de Soumission en Ligne/PDF", basic: true, lawyer: true },
      { feature: "Gestion des Litiges et Contestations", basic: false, lawyer: true },
      { feature: "Représentation Juridique en Procès", basic: false, lawyer: true },
      { feature: "Contrat de Représentation Automatique", basic: false, lawyer: true },
      { feature: "Consultation 1:1 avec Avocat Dédié", basic: false, lawyer: true },
      { feature: "Représentation Judiciaire", basic: false, lawyer: true }
    ],
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
    tier0Label: "До $100K",
    tier1Label: "До $200K",
    tier2Label: "Сумма свыше $200K",
    tier3Label: "Превышение × 0,1%",
    assetBasisNote: "* Оценка: Наличные/Акции/Облигации = Рыночная стоимость; Недвижимость = Официальная кадастровая стоимость",
    inputLabel: "Общая Стоимость Имущества (USD)",
    inputPlaceholder: "напр. 500 000",
    feeLabel: "Расчётный Сервисный Сбор",
    feeNote: "* Фактический сбор может варьироваться в зависимости от состава активов.",
    emptyCalc: "Введите сумму активов для автоматического расчёта сбора",
    cta: "Зарегистрироваться как Наследник",
    footerNote: "Услуги для наследников активируются после подтверждения смерти завещателя. Доступно только когда завещатель является членом EverWill.",
    features: ["Юридически действительные документы создаются автоматически", "Документы готовы в течение 72 часов", "Законы 7 стран применяются автоматически"],
    includedItems: ["Полное руководство по наследованию", "Автоматический расчёт налога на наследство", "Автоматическое создание юридических документов", "Онлайн-подача или загрузка PDF"],
    lawyerTitle: "Сервис подключения юридических экспертов",
    lawyerDesc: "При возникновении споров или судебных разбирательств партнёрские юридические эксперты EverWill поддерживают наследственный процесс.",
    lawyerFee1: "Гонорар за ведение дела",
    lawyerFee1Val: "$699",
    lawyerFee2: "Гонорар за успех",
    lawyerFee2Val: "1% от стоимости наследства",
    lawyerNote: "* После подключения эксперта автоматически создаётся форма согласия, вступающая в силу после электронной подписи.",
    lawyerCta: "Запросить консультацию эксперта",
    compareTitle: "Сравнение Услуг",
    compareColFeature: "Функция",
    compareColBasic: "Базовая Услуга",
    compareColLawyer: "Юридическая Услуга",
    compareRows: [
      { feature: "Стоимость услуги", basic: "$149 (Базовый)", lawyer: "Подать заявку на эксперта" },
      { feature: "Руководство по наследованию", basic: true, lawyer: true },
      { feature: "Автоматический расчёт налогов", basic: true, lawyer: true },
      { feature: "Автоматически созданные юридические документы", basic: true, lawyer: true },
      { feature: "Поддержка онлайн/PDF подачи", basic: true, lawyer: true },
      { feature: "Урегулирование споров и возражений", basic: false, lawyer: true },
      { feature: "Юридическое представительство в суде", basic: false, lawyer: true },
      { feature: "Автоматически созданный договор представительства", basic: false, lawyer: true },
      { feature: "Консультация 1:1 с выделенным адвокатом", basic: false, lawyer: true },
      { feature: "Представительство в суде", basic: false, lawyer: true }
    ],
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
    tier0Label: "$100K तक",
    tier1Label: "$200K तक",
    tier2Label: "$200K से अधिक राशि",
    tier3Label: "अतिरिक्त × 0.1%",
    assetBasisNote: "* मूल्यांकन: नकद/शेयर/बांड = बाजार मूल्य; अचल संपत्ति = आधिकारिक मूल्यांकन मूल्य",
    inputLabel: "कुल संपत्ति मूल्य (USD)",
    inputPlaceholder: "उदा. 500,000",
    feeLabel: "अनुमानित सेवा शुल्क",
    feeNote: "* वास्तविक शुल्क संपत्ति की संरचना के आधार पर भिन्न हो सकता है।",
    emptyCalc: "शुल्क की स्वचालित गणना के लिए संपत्ति राशि दर्ज करें",
    cta: "उत्तराधिकारी के रूप में पंजीकरण करें",
    footerNote: "उत्तराधिकारी सेवाएं वसीयतकर्ता की मृत्यु की पुष्टि के बाद सक्रिय होती हैं। केवल तभी उपलब्ध जब वसीयतकर्ता EverWill सदस्य हो।",
    features: ["कानूनी रूप से वैध दस्तावेज़ स्वचालित रूप से तैयार", "72 घंटों के भीतर दस्तावेज़ पूर्ण", "7 देशों के कानून स्वचालित रूप से लागू"],
    includedItems: ["विरासत प्रक्रिया का पूर्ण मार्गदर्शन", "विरासत कर की स्वचालित गणना", "कानूनी दस्तावेज़ स्वचालित रूप से तैयार", "ऑनलाइन जमा या PDF डाउनलोड"],
    lawyerTitle: "कानूनी विशेषज्ञ संपर्क सेवा",
    lawyerDesc: "विवाद या मुकदमे की स्थिति में EverWill के भागीदार कानूनी विशेषज्ञ विरासत प्रक्रिया में सहायता करते हैं।",
    lawyerFee1: "अग्रिम शुल्क",
    lawyerFee1Val: "$699",
    lawyerFee2: "सफलता शुल्क",
    lawyerFee2Val: "संपत्ति मूल्य का 1%",
    lawyerNote: "* विशेषज्ञ से जुड़ने के बाद सहमति फॉर्म स्वचालित रूप से बनता है और ई-हस्ताक्षर के बाद प्रक्रिया शुरू होती है।",
    lawyerCta: "विशेषज्ञ परामर्श अनुरोध करें",
    compareTitle: "सेवा तुलना",
    compareColFeature: "विशेषता",
    compareColBasic: "बेसिक सेवा",
    compareColLawyer: "वकील सेवा",
    compareRows: [
      { feature: "सेवा शुल्क", basic: "$149 (बेसिक)", lawyer: "$699 अग्रिम + 1% सफलता शुल्क" },
      { feature: "विरासत प्रक्रिया मार्गदर्शन", basic: true, lawyer: true },
      { feature: "स्वचालित कर गणना", basic: true, lawyer: true },
      { feature: "स्वचालित कानूनी दस्तावेज़", basic: true, lawyer: true },
      { feature: "ऑनलाइन/PDF जमा सहायता", basic: true, lawyer: true },
      { feature: "विवाद और आपत्ति प्रबंधन", basic: false, lawyer: true },
      { feature: "मुकदमे में कानूनी प्रतिनिधित्व", basic: false, lawyer: true },
      { feature: "स्वचालित प्रतिनिधित्व अनुबंध", basic: false, lawyer: true },
      { feature: "समर्पित वकील 1:1 परामर्श", basic: false, lawyer: true },
      { feature: "न्यायालय में उपस्थिति", basic: false, lawyer: true }
    ],
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
    tier0Label: "Até $100K",
    tier1Label: "Até $200K",
    tier2Label: "Valor acima de $200K",
    tier3Label: "Excesso × 0,1%",
    assetBasisNote: "* Avaliação: Dinheiro/Ações/Títulos = Valor de mercado; Imóveis = Valor de avaliação oficial",
    inputLabel: "Valor Total do Espólio (USD)",
    inputPlaceholder: "ex. 500.000",
    feeLabel: "Taxa de Serviço Estimada",
    feeNote: "* A taxa real pode variar dependendo da composição dos ativos.",
    emptyCalc: "Insira o valor do ativo para calcular automaticamente a taxa",
    cta: "Registrar como Herdeiro",
    footerNote: "Os serviços para herdeiros são ativados após a confirmação do falecimento do testador. Disponível apenas quando o testador é membro do EverWill.",
    features: ["Documentos juridicamente válidos gerados automaticamente", "Documentos concluídos em 72 horas", "Leis de 7 países aplicadas automaticamente"],
    includedItems: ["Orientação completa do processo de herança", "Cálculo automático do imposto de herança", "Documentos legais gerados automaticamente", "Envio online ou download em PDF"],
    lawyerTitle: "Serviço de Conexão com Especialistas Jurídicos",
    lawyerDesc: "Em caso de disputa ou litígio, os especialistas jurídicos parceiros da EverWill apoiam o processo de herança.",
    lawyerFee1: "Honorário Inicial",
    lawyerFee1Val: "$699",
    lawyerFee2: "Honorário de Êxito",
    lawyerFee2Val: "1% do valor do patrimônio",
    lawyerNote: "* Após a conexão com o especialista, um formulário de consentimento é gerado automaticamente e entra em vigor após assinatura eletrônica.",
    lawyerCta: "Solicitar Consulta com Especialista",
    compareTitle: "Comparação de Serviços",
    compareColFeature: "Recurso",
    compareColBasic: "Serviço Básico",
    compareColLawyer: "Serviço de Advogado",
    compareRows: [
      { feature: "Taxa de Serviço", basic: "$149 (Básico)", lawyer: "$699 honorário + 1% honorário de êxito" },
      { feature: "Orientação do Processo de Herança", basic: true, lawyer: true },
      { feature: "Cálculo Automático de Impostos", basic: true, lawyer: true },
      { feature: "Documentos Legais Gerados Automaticamente", basic: true, lawyer: true },
      { feature: "Suporte de Envio Online/PDF", basic: true, lawyer: true },
      { feature: "Gestão de Disputas e Objeções", basic: false, lawyer: true },
      { feature: "Representação Legal em Litígios", basic: false, lawyer: true },
      { feature: "Contrato de Representação Automático", basic: false, lawyer: true },
      { feature: "Consulta 1:1 com Advogado Dedicado", basic: false, lawyer: true },
      { feature: "Representação Judicial", basic: false, lawyer: true }
    ],
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
   const FREE_LIMIT = isKo ? FREE_LIMIT_KRW : krwToUsd(FREE_LIMIT_KRW);
  const BASE_FEE = isKo ? BASE_FEE_KRW : krwToUsd(BASE_FEE_KRW);
  const BASE_LIMIT = isKo ? BASE_LIMIT_KRW : krwToUsd(BASE_LIMIT_KRW);
  function calculateFee(input: string) {
    const raw = input.replace(/[^0-9]/g, "");
    const amount = parseInt(raw, 10);
    if (isNaN(amount) || amount <= 0) {
      setFee(null);
      return;
    }
    // 3단계: 1억 이하 무료 / 1억~2억 ₩199,000 / 2억 초과분 × 0.1%
    if (amount <= FREE_LIMIT) {
      setFee(0);
    } else if (amount <= BASE_LIMIT) {
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

  // 수수료 구조 표시 텍스트 (3단계) - 동적 임계값 사용
  const freeLimitDisplay = isKo
    ? "₩1억 이하"
    : `$${krwToUsd(FREE_LIMIT_KRW).toLocaleString("en-US")}`;
  const baseLimitDisplay = isKo
    ? "₩2억 이하"
    : `$${krwToUsd(BASE_LIMIT_KRW).toLocaleString("en-US")}`;
  const tier0Value = isKo ? "무료" : "Free";
  const tier1Value = isKo ? "₩199,000" : `$${krwToUsd(BASE_FEE_KRW)}`;
  const tier2Value = isKo
    ? "₩199,000 + 초과분 × 0.1%"
    : `$${krwToUsd(BASE_FEE_KRW)} + excess × 0.1%`;
  // 결과 카드 보조 문구
  const freeDesc = t.tier0Label + " " + tier0Value;
  const fixedDesc = `${freeLimitDisplay} ~ ${baseLimitDisplay}`;
  const excessDesc = isKo
    ? `기본 ₩199,000 + 초과분 × 0.1%`
    : `Base ${tier1Value} + excess × 0.1%`;

  const icons = [UserCheck, FileText, Scale, CheckCircle];

  return (
    <section
      id="heir-service"
      className="relative py-20 lg:py-28"
      ref={ref}
      style={{
        backgroundImage: 'url(/manus-storage/heir-couple-bg_96a3b9bb.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 오버레이: 상단은 이미지 선명, 하단은 크림색 배경으로 전환 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#F5F3EE]" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="section-divider mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full px-4 py-1.5 mb-4">
            <UserCheck className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-bold drop-shadow">{t.badge}</span>
          </div>
          <h2
            className="text-3xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.title}
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed drop-shadow">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── 2단 레이아웃: 가입 절차 + 수수료 계산기 ── */}
        <div className="grid lg:grid-cols-2 gap-10 items-stretch">

          {/* 왼쪽: 가입 절차 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
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
                    animate={{ opacity: 1, y: 0 }}
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
            animate={{ opacity: 1, x: 0 }}
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

            {/* 수수료 구조 안내 (3단계) */}
            <div className="bg-[#F5F3EE] rounded-2xl p-4 mb-4 space-y-2">
              {/* 단계 0: 1억 이하 무료 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{t.tier0Label}</span>
                <span className="font-bold text-green-600">{tier0Value}</span>
              </div>
              <div className="h-px bg-gray-200" />
              {/* 단계 1: 2억 이하 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{t.tier1Label}</span>
                <span className="font-bold text-[#1F3864]">{tier1Value}</span>
              </div>
              <div className="h-px bg-gray-200" />
              {/* 단계 2: 2억 초과분 */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">{t.tier2Label}</span>
                <span className="font-bold text-[#1F3864]">{tier2Value}</span>
              </div>
            </div>
            {/* 자산 평가 기준 안내 */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-amber-700 text-xs leading-relaxed">{t.assetBasisNote}</p>
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
                className={`rounded-2xl p-5 text-white ${
                  fee === 0
                    ? "bg-gradient-to-br from-green-600 to-green-700"
                    : "bg-gradient-to-br from-[#1F3864] to-[#2a4a7f]"
                }`}
              >
                <div className="text-sm font-medium text-white/70 mb-1">{t.feeLabel}</div>
                <div className="text-3xl font-extrabold mb-2">
                  {fee === 0 ? (isKo ? "무료" : "Free") : formatAmount(fee)}
                </div>
                {fee === 0 && (
                  <div className="text-xs text-white/80">{freeDesc}</div>
                )}
                {fee > 0 && fee <= BASE_FEE && (
                  <div className="text-xs text-white/60">{fixedDesc}</div>
                )}
                {fee > BASE_FEE && (
                  <div className="text-xs text-white/60">
                    {excessDesc} ({formatAmount(fee - BASE_FEE)})
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

        {/* ── 기본 가입비 포함 내용 박스 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 bg-white rounded-3xl shadow-sm border border-[#C9A961]/20 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#C9A961]/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-[#C9A961]" />
            </div>
            <div>
              <h3 className="font-bold text-[#1F3864] text-lg">
                {isKo ? "₩199,000 기본 가입비에 포함된 내용" : "Included in the Base Service Fee"}
              </h3>
              <p className="text-gray-500 text-xs">
                {isKo ? "별도 추가 비용 없음" : "No additional charges"}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {t.includedItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#F5F3EE] rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-[#C9A961] flex-shrink-0" />
                <span className="text-[#1F3864] text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── 법률 전문가 연결 서비스 섹션 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-6 bg-gradient-to-br from-[#1F3864] to-[#2a4a7f] rounded-3xl p-8 text-white"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-6 h-6 text-[#C9A961]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl mb-1">{t.lawyerTitle}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{t.lawyerDesc}</p>
            </div>
          </div>
          <p className="text-white/50 text-xs mb-5">{t.lawyerNote}</p>
          <button
            onClick={() => {
              import("sonner").then(({ toast }) => {
                toast.info(isKo ? "법률 전문가 연결 서비스 준비 중입니다. 곧 오픈합니다!" : "Legal expert connection service coming soon!");
              });
            }}
            className="w-full py-3 rounded-xl bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Briefcase className="w-4 h-4" />
            {t.lawyerCta}
          </button>
        </motion.div>

        {/* ── 서비스 비교 표 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-6"
        >
          <h3 className="text-2xl font-bold text-[#1F3864] mb-6 text-center">{t.compareTitle}</h3>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="bg-gray-50 text-left px-5 py-4 text-gray-500 font-semibold w-2/5 border-b border-gray-200">
                    {t.compareColFeature}
                  </th>
                  <th className="bg-[#F5F3EE] text-center px-5 py-4 text-[#1F3864] font-bold border-b border-gray-200">
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-[#C9A961]" />
                      <span>{t.compareColBasic}</span>
                    </div>
                  </th>
                  <th className="bg-[#1F3864] text-center px-5 py-4 text-white font-bold border-b border-[#1F3864]">
                    <div className="flex flex-col items-center gap-1">
                      <Briefcase className="w-4 h-4 text-[#C9A961]" />
                      <span>{t.compareColLawyer}</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.compareRows.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-5 py-3.5 text-gray-700 font-medium border-b border-gray-100">
                      {row.feature}
                    </td>
                    <td className="px-5 py-3.5 text-center border-b border-gray-100">
                      {row.basic === true ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-100">
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        </span>
                      ) : row.basic === false ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                          <span className="text-gray-400 font-bold text-base leading-none">—</span>
                        </span>
                      ) : (
                        <span className="text-[#1F3864] font-semibold text-xs">{row.basic}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center bg-[#1F3864]/5 border-b border-gray-100">
                      {row.lawyer === true ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </span>
                      ) : row.lawyer === false ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100">
                          <span className="text-gray-400 font-bold text-base leading-none">—</span>
                        </span>
                      ) : (
                        <span className="text-[#1F3864] font-semibold text-xs">{row.lawyer}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ── 하단 안내 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-6 bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-2xl px-6 py-4 text-center"
        >
          <p className="text-gray-600 text-sm leading-relaxed">{t.footerNote}</p>
        </motion.div>

      </div>
    </section>
  );
}
