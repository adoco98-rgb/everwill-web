/**
 * 국가별 유언인증서 PDF 생성 엔진
 * 지원 국가: KR(한국), US(미국), JP(일본), CN(중국), DE(독일), ES(스페인),
 *            SA(사우디아라비아), FR(프랑스), IN(인도), BR(브라질), AU(호주),
 *            GB(영국), CA(캐나다), NZ(뉴질랜드)
 */
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, "../fonts");

// ─── 폰트 경로 ───────────────────────────────────────────────────────────────
const FONT_CJK_REGULAR = path.join(FONTS_DIR, "NotoSansCJK-Regular.otf");
const FONT_CJK_BOLD = path.join(FONTS_DIR, "NotoSansCJK-Bold.otf");
const FONT_ARABIC_REGULAR = path.join(FONTS_DIR, "NotoSansArabic-Regular.ttf");
const FONT_ARABIC_BOLD = path.join(FONTS_DIR, "NotoSansArabic-Bold.ttf");
const FONT_JP = path.join(FONTS_DIR, "Japanese-Gothic.ttf");

// ─── 국가별 인증서 설정 ────────────────────────────────────────────────────────
interface CountryCertConfig {
  lang: "ko" | "ja" | "zh" | "en" | "de" | "es" | "ar" | "fr" | "hi" | "pt";
  fontRegular: string;
  fontBold: string;
  isRTL: boolean;
  title: string;
  subtitle: string;
  certLabel: string;
  dateLabel: string;
  testatorLabel: string;
  purposeLabel: string;
  legalBasis: string;
  legalNote: string;
  issuerName: string;
  issuerSubtitle: string;
  validityNote: string;
  certNumLabel: string;
  blockchainLabel: string;
  signatureLabel: string;
  primaryColor: [number, number, number]; // RGB
  accentColor: [number, number, number];
}

const COUNTRY_CONFIGS: Record<string, CountryCertConfig> = {
  KR: {
    lang: "ko",
    fontRegular: FONT_CJK_REGULAR,
    fontBold: FONT_CJK_BOLD,
    isRTL: false,
    title: "유언인증서",
    subtitle: "EverWill 디지털 유언 플랫폼",
    certLabel: "인증번호",
    dateLabel: "인증일자",
    testatorLabel: "유언자",
    purposeLabel: "발급목적",
    legalBasis:
      "법적 근거: 대한민국 민법 제1060조~제1072조 (유언의 방식), 제1065조 (자필증서에 의한 유언), 전자서명법 제3조",
    legalNote:
      "본 인증서는 대한민국 민법 및 전자서명법에 따라 EverWill 플랫폼에서 발급된 디지털 유언 인증 문서입니다. 본 인증서는 유언장의 존재 및 인증 사실을 증명하며, 법원·금융기관·행정기관 제출용으로 활용 가능합니다. 유언의 법적 효력은 유언자 사망 후 가정법원 검인 절차를 통해 확정됩니다.",
    issuerName: "주식회사 에버윌 (EverWill Inc.)",
    issuerSubtitle: "디지털 유언 인증 기관 | 사업자등록번호: 621-81-61690",
    validityNote: "※ 본 인증서는 발급일로부터 유효하며, 유언장 수정 시 재인증이 필요합니다.",
    certNumLabel: "인증번호",
    blockchainLabel: "블록체인 해시",
    signatureLabel: "발급 책임자",
    primaryColor: [31, 56, 100],
    accentColor: [201, 169, 97],
  },
  US: {
    lang: "en",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform",
    certLabel: "Certificate No.",
    dateLabel: "Date of Authentication",
    testatorLabel: "Testator",
    purposeLabel: "Purpose",
    legalBasis:
      "Legal Basis: Uniform Probate Code (UPC) §2-502, Electronic Signatures in Global and National Commerce Act (E-SIGN Act), Uniform Electronic Wills Act (UEWA) 2019",
    legalNote:
      "This certificate is issued by EverWill Inc. pursuant to the Uniform Electronic Wills Act (UEWA) and applicable state law. This document certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings in the applicable jurisdiction. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digital Will Authentication Platform | Registered in the State of Delaware",
    validityNote:
      "* This certificate is valid from the date of issuance. Re-authentication is required upon amendment of the will.",
    certNumLabel: "Certificate No.",
    blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorized Signatory",
    primaryColor: [15, 52, 96],
    accentColor: [178, 34, 34],
  },
  JP: {
    lang: "ja",
    fontRegular: FONT_JP,
    fontBold: FONT_JP,
    isRTL: false,
    title: "遺言認証証明書",
    subtitle: "EverWill デジタル遺言プラットフォーム",
    certLabel: "証明書番号",
    dateLabel: "認証日",
    testatorLabel: "遺言者",
    purposeLabel: "発行目的",
    legalBasis:
      "法的根拠: 民法第960条〜第1027条（遺言の方式）、民法第968条（自筆証書遺言）、電子署名及び認証業務に関する法律（電子署名法）第3条、2025年公正証書遺言デジタル化対応",
    legalNote:
      "本証明書は、EverWillプラットフォームが日本民法及び電子署名法に基づき発行したデジタル遺言認証文書です。本証明書は遺言書の存在及び認証事実を証明するものであり、家庭裁判所・金融機関・行政機関への提出に使用できます。遺言の法的効力は、遺言者の死亡後に家庭裁判所の検認手続きを経て確定されます。",
    issuerName: "EverWill Inc.（エバーウィル株式会社）",
    issuerSubtitle: "デジタル遺言認証機関",
    validityNote: "※ 本証明書は発行日から有効です。遺言書を修正した場合は再認証が必要です。",
    certNumLabel: "証明書番号",
    blockchainLabel: "ブロックチェーンハッシュ",
    signatureLabel: "発行責任者",
    primaryColor: [139, 0, 0],
    accentColor: [184, 134, 11],
  },
  CN: {
    lang: "zh",
    fontRegular: FONT_CJK_REGULAR,
    fontBold: FONT_CJK_BOLD,
    isRTL: false,
    title: "遗嘱认证证书",
    subtitle: "EverWill 数字遗嘱平台",
    certLabel: "证书编号",
    dateLabel: "认证日期",
    testatorLabel: "立遗嘱人",
    purposeLabel: "出具目的",
    legalBasis:
      "法律依据: 中华人民共和国民法典第1133条至第1144条（遗嘱的形式与效力）、第1136条（打印遗嘱）、电子签名法第3条",
    legalNote:
      "本证书由EverWill平台依据《中华人民共和国民法典》及《电子签名法》出具，证明上述遗嘱的存在及认证事实。本证书可向人民法院、金融机构及行政机关提交。遗嘱的法律效力须经相关司法程序确认。",
    issuerName: "EverWill Inc.（永遗平台）",
    issuerSubtitle: "数字遗嘱认证机构",
    validityNote: "※ 本证书自出具之日起生效。遗嘱修改后需重新认证。",
    certNumLabel: "证书编号",
    blockchainLabel: "区块链哈希值",
    signatureLabel: "授权签署人",
    primaryColor: [139, 0, 0],
    accentColor: [184, 134, 11],
  },
  DE: {
    lang: "de",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "TESTAMENTAUTHENTIFIZIERUNGSZERTIFIKAT",
    subtitle: "EverWill Digitale Testament-Plattform",
    certLabel: "Zertifikatsnummer",
    dateLabel: "Authentifizierungsdatum",
    testatorLabel: "Erblasser",
    purposeLabel: "Ausstellungszweck",
    legalBasis:
      "Rechtsgrundlage: Bürgerliches Gesetzbuch (BGB) §§ 2064–2273 (Testamentsrecht), § 2247 (Eigenhändiges Testament), Vertrauensdienstegesetz (VDG), eIDAS-Verordnung (EU) 910/2014",
    legalNote:
      "Dieses Zertifikat wird von EverWill Inc. gemäß dem Bürgerlichen Gesetzbuch (BGB) und dem Vertrauensdienstegesetz (VDG) ausgestellt. Es bescheinigt die Existenz und Authentifizierung des genannten Testaments. Die Rechtswirksamkeit des Testaments wird im Rahmen des Erbscheinsverfahrens beim zuständigen Nachlassgericht festgestellt.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digitale Testament-Authentifizierungsplattform | Registriert in Deutschland",
    validityNote:
      "* Dieses Zertifikat ist ab dem Ausstellungsdatum gültig. Bei Änderungen des Testaments ist eine erneute Authentifizierung erforderlich.",
    certNumLabel: "Zertifikatsnummer",
    blockchainLabel: "Blockchain-Hash",
    signatureLabel: "Bevollmächtigter Unterzeichner",
    primaryColor: [0, 0, 0],
    accentColor: [220, 0, 0],
  },
  ES: {
    lang: "es",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "CERTIFICADO DE AUTENTICACIÓN TESTAMENTARIA",
    subtitle: "Plataforma Digital de Testamentos EverWill",
    certLabel: "Número de Certificado",
    dateLabel: "Fecha de Autenticación",
    testatorLabel: "Testador",
    purposeLabel: "Propósito",
    legalBasis:
      "Base Legal: Código Civil Español, Artículos 687–743 (Formas del Testamento), Artículo 688 (Testamento Ológrafo), Ley 59/2003 de Firma Electrónica, Reglamento eIDAS (UE) 910/2014",
    legalNote:
      "Este certificado es emitido por EverWill Inc. conforme al Código Civil Español y la Ley de Firma Electrónica. Certifica la existencia y autenticación del testamento referenciado. La validez legal del testamento se determina mediante los procedimientos sucesorios ante el Notario o Juzgado competente.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Plataforma de Autenticación de Testamentos Digitales",
    validityNote:
      "* Este certificado es válido desde la fecha de emisión. Se requiere nueva autenticación ante cualquier modificación del testamento.",
    certNumLabel: "N.º de Certificado",
    blockchainLabel: "Hash de Blockchain",
    signatureLabel: "Firmante Autorizado",
    primaryColor: [170, 21, 27],
    accentColor: [241, 191, 0],
  },
  SA: {
    lang: "ar",
    fontRegular: FONT_ARABIC_REGULAR,
    fontBold: FONT_ARABIC_BOLD,
    isRTL: true,
    title: "شهادة توثيق الوصية",
    subtitle: "منصة إيفروِل للوصايا الرقمية",
    certLabel: "رقم الشهادة",
    dateLabel: "تاريخ التوثيق",
    testatorLabel: "الموصي",
    purposeLabel: "الغرض من الإصدار",
    legalBasis:
      "الأساس القانوني: نظام الأحوال الشخصية السعودي، المادة 82–110 (أحكام الوصية)، نظام التوثيق السعودي، نظام التعاملات الإلكترونية (م/18 لعام 1428هـ)، أحكام الشريعة الإسلامية في الميراث",
    legalNote:
      "تُصدر هذه الشهادة من قِبل شركة إيفروِل وفقاً لنظام الأحوال الشخصية ونظام التعاملات الإلكترونية في المملكة العربية السعودية. تُثبت هذه الشهادة وجود الوصية وتوثيقها. تُطبَّق أحكام الشريعة الإسلامية في توزيع التركة، إذ تحصل الأنثى على نصف نصيب الذكر وفق المادة 11 من نظام الميراث. تسري الوصية في حدود ثلث التركة للأجانب عن الورثة.",
    issuerName: "شركة إيفروِل المحدودة",
    issuerSubtitle: "منصة توثيق الوصايا الرقمية | المملكة العربية السعودية",
    validityNote: "* هذه الشهادة سارية من تاريخ إصدارها. يلزم إعادة التوثيق عند تعديل الوصية.",
    certNumLabel: "رقم الشهادة",
    blockchainLabel: "تجزئة البلوكتشين",
    signatureLabel: "المفوَّض بالتوقيع",
    primaryColor: [0, 100, 0],
    accentColor: [184, 134, 11],
  },
  FR: {
    lang: "fr",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "CERTIFICAT D'AUTHENTIFICATION TESTAMENTAIRE",
    subtitle: "Plateforme de Testament Numérique EverWill",
    certLabel: "Numéro de Certificat",
    dateLabel: "Date d'Authentification",
    testatorLabel: "Testateur",
    purposeLabel: "Objet",
    legalBasis:
      "Base Légale: Code Civil Français, Articles 895–1047 (Des Testaments), Article 970 (Testament Olographe), Loi n°2000-230 relative à la preuve par voie électronique, Règlement eIDAS (UE) 910/2014",
    legalNote:
      "Ce certificat est délivré par EverWill Inc. conformément au Code Civil Français et à la loi sur la preuve électronique. Il atteste de l'existence et de l'authentification du testament référencé. La validité juridique du testament est déterminée par les procédures successorales devant le notaire ou le tribunal compétent.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Plateforme d'Authentification de Testaments Numériques | France",
    validityNote:
      "* Ce certificat est valable à compter de la date d'émission. Une nouvelle authentification est requise en cas de modification du testament.",
    certNumLabel: "N° de Certificat",
    blockchainLabel: "Hachage Blockchain",
    signatureLabel: "Signataire Autorisé",
    primaryColor: [0, 35, 149],
    accentColor: [237, 41, 57],
  },
  IN: {
    lang: "en",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — India",
    certLabel: "Certificate No.",
    dateLabel: "Date of Authentication",
    testatorLabel: "Testator",
    purposeLabel: "Purpose",
    legalBasis:
      "Legal Basis: Indian Succession Act, 1925 — Sections 57–191 (Wills and Codicils), Section 63 (Execution of Unprivileged Wills), Information Technology Act, 2000 — Section 5 (Legal Recognition of Electronic Signatures)",
    legalNote:
      "This certificate is issued by EverWill Inc. pursuant to the Indian Succession Act, 1925 and the Information Technology Act, 2000. It certifies the existence and authentication of the referenced will. The legal validity of the will is subject to probate proceedings before the competent District Court or High Court. This certificate may be presented to courts, banks, and government authorities.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digital Will Authentication Platform | India Operations",
    validityNote:
      "* This certificate is valid from the date of issuance. Re-authentication is required upon amendment of the will.",
    certNumLabel: "Certificate No.",
    blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorized Signatory",
    primaryColor: [19, 136, 8],
    accentColor: [255, 153, 51],
  },
  BR: {
    lang: "pt",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "CERTIFICADO DE AUTENTICAÇÃO TESTAMENTÁRIA",
    subtitle: "Plataforma Digital de Testamentos EverWill — Brasil",
    certLabel: "Número do Certificado",
    dateLabel: "Data de Autenticação",
    testatorLabel: "Testador",
    purposeLabel: "Finalidade",
    legalBasis:
      "Base Legal: Código Civil Brasileiro, Artigos 1857–1990 (Das Disposições Testamentárias), Artigo 1876 (Testamento Particular), Lei n.º 14.063/2020 (Assinaturas Eletrônicas em Atos Públicos), Medida Provisória n.º 2.200-2/2001 (ICP-Brasil)",
    legalNote:
      "Este certificado é emitido pela EverWill Inc. em conformidade com o Código Civil Brasileiro e a Lei de Assinaturas Eletrônicas. Certifica a existência e autenticação do testamento referenciado. A validade jurídica do testamento é determinada por procedimentos de inventário perante o Tabelião de Notas ou Vara de Sucessões competente.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Plataforma de Autenticação de Testamentos Digitais | Brasil",
    validityNote:
      "* Este certificado é válido a partir da data de emissão. Nova autenticação é necessária em caso de alteração do testamento.",
    certNumLabel: "N.º do Certificado",
    blockchainLabel: "Hash de Blockchain",
    signatureLabel: "Signatário Autorizado",
    primaryColor: [0, 130, 0],
    accentColor: [255, 223, 0],
  },
  AU: {
    lang: "en",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Australia",
    certLabel: "Certificate No.",
    dateLabel: "Date of Authentication",
    testatorLabel: "Testator",
    purposeLabel: "Purpose",
    legalBasis:
      "Legal Basis: Succession Act 2006 (NSW) / Wills Act 1997 (VIC) — applicable state legislation, Electronic Transactions Act 1999 (Cth), COVID-19 Omnibus (Emergency Measures) Act 2020 — Electronic Will Execution",
    legalNote:
      "This certificate is issued by EverWill Inc. pursuant to applicable Australian state succession legislation and the Electronic Transactions Act 1999. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the Supreme Court of the relevant state or territory. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digital Will Authentication Platform | Australia Operations",
    validityNote:
      "* This certificate is valid from the date of issuance. Re-authentication is required upon amendment of the will.",
    certNumLabel: "Certificate No.",
    blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    primaryColor: [0, 0, 139],
    accentColor: [220, 20, 60],
  },
  GB: {
    lang: "en",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — United Kingdom",
    certLabel: "Certificate No.",
    dateLabel: "Date of Authentication",
    testatorLabel: "Testator",
    purposeLabel: "Purpose",
    legalBasis:
      "Legal Basis: Wills Act 1837 (as amended), Administration of Justice Act 1982, Electronic Communications Act 2000, Law Commission Report: Making a Will (2017) — Electronic Will Proposals",
    legalNote:
      "This certificate is issued by EverWill Inc. pursuant to the Wills Act 1837 and the Electronic Communications Act 2000. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before His Majesty's Courts and Tribunals Service (HMCTS). This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digital Will Authentication Platform | United Kingdom Operations",
    validityNote:
      "* This certificate is valid from the date of issuance. Re-authentication is required upon amendment of the will.",
    certNumLabel: "Certificate No.",
    blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    primaryColor: [0, 36, 125],
    accentColor: [207, 20, 43],
  },
  CA: {
    lang: "en",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Canada",
    certLabel: "Certificate No.",
    dateLabel: "Date of Authentication",
    testatorLabel: "Testator",
    purposeLabel: "Purpose",
    legalBasis:
      "Legal Basis: Wills, Estates and Succession Act (WESA) — British Columbia, Succession Law Reform Act — Ontario, Electronic Commerce Act 2000, Uniform Electronic Wills Act (ULCC 2020)",
    legalNote:
      "This certificate is issued by EverWill Inc. pursuant to applicable Canadian provincial succession legislation and electronic commerce law. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the applicable provincial court. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digital Will Authentication Platform | Canada Operations",
    validityNote:
      "* This certificate is valid from the date of issuance. Re-authentication is required upon amendment of the will.",
    certNumLabel: "Certificate No.",
    blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorized Signatory",
    primaryColor: [255, 0, 0],
    accentColor: [255, 0, 0],
  },
  NZ: {
    lang: "en",
    fontRegular: "Helvetica",
    fontBold: "Helvetica-Bold",
    isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — New Zealand",
    certLabel: "Certificate No.",
    dateLabel: "Date of Authentication",
    testatorLabel: "Testator",
    purposeLabel: "Purpose",
    legalBasis:
      "Legal Basis: Wills Act 2007 (New Zealand), Electronic Transactions Act 2002, COVID-19 Response (Urgent Management Measures) Legislation Act 2020 — Remote Witnessing of Wills",
    legalNote:
      "This certificate is issued by EverWill Inc. pursuant to the Wills Act 2007 and the Electronic Transactions Act 2002 of New Zealand. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the High Court of New Zealand. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digital Will Authentication Platform | New Zealand Operations",
    validityNote:
      "* This certificate is valid from the date of issuance. Re-authentication is required upon amendment of the will.",
    certNumLabel: "Certificate No.",
    blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    primaryColor: [0, 0, 139],
    accentColor: [220, 20, 60],
  },
};

// ─── 기본값 (알 수 없는 국가) ────────────────────────────────────────────────
const DEFAULT_CONFIG = COUNTRY_CONFIGS["US"];

// ─── PDF 생성 함수 ─────────────────────────────────────────────────────────────
export interface CertificateData {
  certNumber: string;
  certifiedAt: Date;
  testatorName: string;
  willTitle: string;
  purpose: string;
  blockchainHash?: string | null;
  country: string; // ISO 2자리 국가코드
}

export function generateWillCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const config = COUNTRY_CONFIGS[data.country.toUpperCase()] ?? DEFAULT_CONFIG;

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: config.title,
        Author: config.issuerName,
        Subject: `Will Authentication Certificate - ${data.certNumber}`,
        Creator: "EverWill Platform",
      },
    });

    // 폰트 등록
    const isBuiltIn = config.fontRegular === "Helvetica" || config.fontRegular === "Times-Roman";
    if (!isBuiltIn) {
      try {
        doc.registerFont("Regular", config.fontRegular);
        doc.registerFont("Bold", config.fontBold);
      } catch {
        // 폰트 로드 실패 시 기본 폰트 사용
      }
    }

    const fontRegular = isBuiltIn ? config.fontRegular : "Regular";
    const fontBold = isBuiltIn ? config.fontBold : "Bold";

    const [pr, pg, pb] = config.primaryColor;
    const [ar, ag, ab] = config.accentColor;

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 60;
    const contentWidth = pageWidth - margin * 2;

    // ── 배경 ──────────────────────────────────────────────────────────────────
    // 상단 헤더 배경
    doc.rect(0, 0, pageWidth, 140).fill(`rgb(${pr},${pg},${pb})`);

    // 하단 푸터 배경
    doc.rect(0, pageHeight - 100, pageWidth, 100).fill(`rgb(${pr},${pg},${pb})`);

    // 골드 구분선
    doc.rect(0, 140, pageWidth, 4).fill(`rgb(${ar},${ag},${ab})`);
    doc.rect(0, pageHeight - 104, pageWidth, 4).fill(`rgb(${ar},${ag},${ab})`);

    // ── 상단 헤더 ─────────────────────────────────────────────────────────────
    // 로고 텍스트 (EverWill)
    doc
      .font(fontBold)
      .fontSize(13)
      .fillColor(`rgb(${ar},${ag},${ab})`)
      .text("EverWill", margin, 28, { align: "left" });

    // 국가 코드 배지
    doc
      .roundedRect(pageWidth - margin - 50, 22, 50, 22, 4)
      .fill(`rgba(255,255,255,0.15)`);
    doc
      .font(fontBold)
      .fontSize(10)
      .fillColor("white")
      .text(data.country.toUpperCase(), pageWidth - margin - 50, 28, { width: 50, align: "center" });

    // 메인 제목
    doc
      .font(fontBold)
      .fontSize(config.isRTL ? 18 : 20)
      .fillColor("white")
      .text(config.title, margin, 58, { width: contentWidth, align: "center" });

    // 부제목
    doc
      .font(fontRegular)
      .fontSize(10)
      .fillColor(`rgba(255,255,255,0.8)`)
      .text(config.subtitle, margin, 90, { width: contentWidth, align: "center" });

    // 인증 배지 텍스트
    doc
      .font(fontBold)
      .fontSize(9)
      .fillColor(`rgb(${ar},${ag},${ab})`)
      .text("OFFICIAL AUTHENTICATION DOCUMENT", margin, 116, { width: contentWidth, align: "center" });

    // ── 인증 번호 박스 ────────────────────────────────────────────────────────
    const certBoxY = 165;
    doc.rect(margin, certBoxY, contentWidth, 55).fill("#F8F6F0");
    doc.rect(margin, certBoxY, 4, 55).fill(`rgb(${ar},${ag},${ab})`);

    doc
      .font(fontBold)
      .fontSize(9)
      .fillColor(`rgb(${pr},${pg},${pb})`)
      .text(config.certNumLabel, margin + 16, certBoxY + 10);

    doc
      .font(fontBold)
      .fontSize(18)
      .fillColor(`rgb(${pr},${pg},${pb})`)
      .text(data.certNumber, margin + 16, certBoxY + 24);

    // 인증 날짜 (우측)
    const certDateStr = new Date(data.certifiedAt).toLocaleDateString(
      config.lang === "ko" ? "ko-KR" : config.lang === "ja" ? "ja-JP" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
    doc
      .font(fontRegular)
      .fontSize(9)
      .fillColor("#666")
      .text(`${config.dateLabel}: ${certDateStr}`, margin + 16, certBoxY + 38);

    // ── 본문 정보 테이블 ──────────────────────────────────────────────────────
    const tableY = certBoxY + 75;
    const rowHeight = 38;
    const labelWidth = 140;

    const rows = [
      { label: config.testatorLabel, value: data.testatorName },
      { label: "유언장 / Will", value: data.willTitle },
      { label: config.purposeLabel, value: data.purpose },
    ];

    rows.forEach((row, i) => {
      const y = tableY + i * rowHeight;
      // 배경 (교대)
      if (i % 2 === 0) {
        doc.rect(margin, y, contentWidth, rowHeight).fill("#FAFAFA");
      } else {
        doc.rect(margin, y, contentWidth, rowHeight).fill("#FFFFFF");
      }
      // 구분선
      doc.rect(margin, y + rowHeight - 1, contentWidth, 1).fill("#E8E8E8");

      // 레이블
      doc
        .font(fontBold)
        .fontSize(9)
        .fillColor(`rgb(${pr},${pg},${pb})`)
        .text(row.label, margin + 12, y + 12, { width: labelWidth });

      // 값
      doc
        .font(fontRegular)
        .fontSize(10)
        .fillColor("#1A1A1A")
        .text(row.value || "-", margin + labelWidth + 12, y + 12, {
          width: contentWidth - labelWidth - 24,
        });
    });

    // ── 블록체인 해시 ─────────────────────────────────────────────────────────
    const hashY = tableY + rows.length * rowHeight + 20;
    if (data.blockchainHash) {
      doc.rect(margin, hashY, contentWidth, 44).fill("#F0F4F8");
      doc.rect(margin, hashY, 4, 44).fill("#4A90D9");

      doc
        .font(fontBold)
        .fontSize(8)
        .fillColor("#4A90D9")
        .text(config.blockchainLabel, margin + 12, hashY + 8);

      doc
        .font(fontRegular)
        .fontSize(7.5)
        .fillColor("#555")
        .text(data.blockchainHash, margin + 12, hashY + 22, {
          width: contentWidth - 24,
          lineBreak: false,
        });
    }

    // ── 법적 근거 섹션 ────────────────────────────────────────────────────────
    const legalY = (data.blockchainHash ? hashY + 64 : hashY);
    doc.rect(margin, legalY, contentWidth, 2).fill(`rgb(${ar},${ag},${ab})`);

    doc
      .font(fontBold)
      .fontSize(9)
      .fillColor(`rgb(${pr},${pg},${pb})`)
      .text(config.legalBasis, margin, legalY + 10, {
        width: contentWidth,
        align: "left",
      });

    const legalNoteY = legalY + 35;
    doc
      .font(fontRegular)
      .fontSize(8.5)
      .fillColor("#444")
      .text(config.legalNote, margin, legalNoteY, {
        width: contentWidth,
        align: "justify",
        lineGap: 2,
      });

    // ── 유효성 안내 ───────────────────────────────────────────────────────────
    const validityY = legalNoteY + 80;
    doc
      .font(fontRegular)
      .fontSize(8)
      .fillColor("#888")
      .text(config.validityNote, margin, validityY, { width: contentWidth });

    // ── 서명란 ────────────────────────────────────────────────────────────────
    const signY = pageHeight - 155;
    // 서명 구분선
    doc.rect(margin + contentWidth - 180, signY, 180, 1).fill("#333");
    doc
      .font(fontBold)
      .fontSize(9)
      .fillColor("#333")
      .text(config.signatureLabel, margin + contentWidth - 180, signY + 6, { width: 180, align: "center" });

    doc
      .font(fontRegular)
      .fontSize(8)
      .fillColor("#555")
      .text(config.issuerName, margin + contentWidth - 180, signY + 20, { width: 180, align: "center" });

    // ── 하단 푸터 ─────────────────────────────────────────────────────────────
    doc
      .font(fontBold)
      .fontSize(10)
      .fillColor(`rgb(${ar},${ag},${ab})`)
      .text("EverWill", margin, pageHeight - 80, { align: "left" });

    doc
      .font(fontRegular)
      .fontSize(8)
      .fillColor("rgba(255,255,255,0.8)")
      .text(config.issuerSubtitle, margin, pageHeight - 65, { width: contentWidth, align: "left" });

    doc
      .font(fontRegular)
      .fontSize(7.5)
      .fillColor("rgba(255,255,255,0.6)")
      .text(`https://everwill.co.kr  |  support@everwill.co.kr`, margin, pageHeight - 48, {
        width: contentWidth,
        align: "right",
      });

    // 발급 일시 (우측 하단)
    const issuedAt = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Seoul",
    });
    doc
      .font(fontRegular)
      .fontSize(7)
      .fillColor("rgba(255,255,255,0.5)")
      .text(`Issued: ${issuedAt} KST`, margin, pageHeight - 30, { width: contentWidth, align: "right" });

    doc.end();
  });
}
