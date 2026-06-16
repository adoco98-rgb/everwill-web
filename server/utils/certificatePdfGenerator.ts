/**
 * EverWill 국가별 유언인증서 PDF 생성 엔진 v2.0
 * - 자산 목록 (부동산·금융·기타) 포함
 * - 상속자 명단 포함
 * - 유언 전문 포함 (중앙 대형 인증 도장)
 * - 첨부파일 목록 페이지 포함
 * - 전 페이지 EverWill 확인 스탬프 (워터마크)
 * - 14개국 법적 양식 지원
 */
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(__dirname, "../fonts");
const SEAL_PATH = path.join(__dirname, "../../everwill_seal.png");

// ─── 폰트 경로 ───────────────────────────────────────────────────────────────
const FONT_CJK_REGULAR = path.join(FONTS_DIR, "NotoSansCJK-Regular.otf");
const FONT_CJK_BOLD    = path.join(FONTS_DIR, "NotoSansCJK-Bold.otf");

// ─── 국가별 인증서 설정 ────────────────────────────────────────────────────────
interface CountryCertConfig {
  lang: string;
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
  assetSectionTitle: string;
  heirSectionTitle: string;
  willTextTitle: string;
  attachmentSectionTitle: string;
  stampText: string;
  totalAssetsLabel: string;
  primaryColor: [number, number, number];
  accentColor: [number, number, number];
}

const COUNTRY_CONFIGS: Record<string, CountryCertConfig> = {
  KR: {
    lang: "ko", fontRegular: FONT_CJK_REGULAR, fontBold: FONT_CJK_BOLD, isRTL: false,
    title: "유언인증서",
    subtitle: "EverWill 디지털 유언 플랫폼 공식 인증 문서",
    certLabel: "인증번호", dateLabel: "인증일자", testatorLabel: "유언자",
    purposeLabel: "발급목적", certNumLabel: "인증번호", blockchainLabel: "블록체인 해시",
    signatureLabel: "발급 책임자",
    assetSectionTitle: "제2조 등록 자산 목록",
    heirSectionTitle: "제3조 상속자 명단",
    willTextTitle: "제4조 유언 전문",
    attachmentSectionTitle: "제5조 첨부 증빙서류",
    stampText: "EverWill\n인증완료",
    totalAssetsLabel: "총 자산 추정가",
    legalBasis: "법적 근거: 대한민국 민법 제1060조~제1072조 (유언의 방식), 전자서명법 제3조",
    legalNote: "본 인증서는 대한민국 민법 및 전자서명법에 따라 EverWill 플랫폼에서 발급된 디지털 유언 인증 문서입니다. 본 인증서는 유언장의 존재 및 인증 사실을 증명하며, 법원·금융기관·행정기관 제출용으로 활용 가능합니다. 유언의 법적 효력은 유언자 사망 후 가정법원 검인 절차를 통해 확정됩니다. ※ 위조·변조 시 형법 제231조에 따라 처벌받을 수 있습니다.",
    issuerName: "주식회사 에버윌 (EverWill Inc.)",
    issuerSubtitle: "디지털 유언 인증 기관 | 사업자등록번호: 621-81-61690",
    validityNote: "※ 본 인증서는 발급일로부터 유효하며, 유언장 수정 시 재인증이 필요합니다.",
    primaryColor: [31, 56, 100], accentColor: [201, 169, 97],
  },
  US: {
    lang: "en", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Official Authentication Document",
    certLabel: "Certificate No.", dateLabel: "Date of Authentication", testatorLabel: "Testator",
    purposeLabel: "Purpose", certNumLabel: "Certificate No.", blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    assetSectionTitle: "Article 2: Registered Assets",
    heirSectionTitle: "Article 3: Beneficiaries",
    willTextTitle: "Article 4: Will Text",
    attachmentSectionTitle: "Article 5: Supporting Documents",
    stampText: "EverWill\nCERTIFIED",
    totalAssetsLabel: "Total Estimated Value",
    legalBasis: "Legal Basis: Uniform Electronic Wills Act (UEWA) 2019; applicable state probate law",
    legalNote: "This certificate is issued by EverWill Inc. pursuant to the Uniform Electronic Wills Act 2019. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings in the applicable jurisdiction. This certificate may be presented to courts, financial institutions, and government agencies. WARNING: Forgery or alteration of this document is a federal offense.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digital Will Authentication Platform | EIN: 621-81-61690",
    validityNote: "* This certificate is valid from the date of issuance. Re-authentication required upon amendment.",
    primaryColor: [20, 52, 100], accentColor: [201, 169, 97],
  },
  JP: {
    lang: "ja", fontRegular: FONT_CJK_REGULAR, fontBold: FONT_CJK_BOLD, isRTL: false,
    title: "遺言認証書",
    subtitle: "EverWill デジタル遺言プラットフォーム 公式認証文書",
    certLabel: "認証番号", dateLabel: "認証日", testatorLabel: "遺言者",
    purposeLabel: "発行目的", certNumLabel: "認証番号", blockchainLabel: "ブロックチェーンハッシュ",
    signatureLabel: "発行責任者",
    assetSectionTitle: "第2条 登録資産一覧",
    heirSectionTitle: "第3条 相続人名簿",
    willTextTitle: "第4条 遺言全文",
    attachmentSectionTitle: "第5条 添付証憑書類",
    stampText: "EverWill\n認証済",
    totalAssetsLabel: "総資産推定額",
    legalBasis: "法的根拠: 民法第968条（自筆証書遺言）、第969条（公正証書遺言）、2025年デジタル化改正",
    legalNote: "本認証書は、EverWillプラットフォームが日本民法および電子署名法に基づき発行した公式文書です。本認証書は遺言の存在および認証事実を証明し、家庭裁判所・金融機関・行政機関への提出に使用できます。遺言の法的効力は、遺言者の死亡後、家庭裁判所の検認手続きを経て確定します。",
    issuerName: "EverWill株式会社",
    issuerSubtitle: "デジタル遺言認証機関 | 登録番号: 621-81-61690",
    validityNote: "※ 本認証書は発行日から有効です。遺言変更時は再認証が必要です。",
    primaryColor: [139, 0, 0], accentColor: [201, 169, 97],
  },
  CN: {
    lang: "zh", fontRegular: FONT_CJK_REGULAR, fontBold: FONT_CJK_BOLD, isRTL: false,
    title: "遗嘱认证书",
    subtitle: "EverWill 数字遗嘱平台 官方认证文件",
    certLabel: "认证编号", dateLabel: "认证日期", testatorLabel: "立遗嘱人",
    purposeLabel: "发行目的", certNumLabel: "认证编号", blockchainLabel: "区块链哈希",
    signatureLabel: "授权签署人",
    assetSectionTitle: "第二条 登记资产清单",
    heirSectionTitle: "第三条 继承人名单",
    willTextTitle: "第四条 遗嘱全文",
    attachmentSectionTitle: "第五条 附件证明文件",
    stampText: "EverWill\n认证完成",
    totalAssetsLabel: "资产总估值",
    legalBasis: "法律依据: 中华人民共和国民法典第1133条（遗嘱继承）、第1136条（打印遗嘱）",
    legalNote: "本认证书由EverWill平台依据中华人民共和国民法典及电子签名法发行。本认证书证明所引用遗嘱的存在及认证事实，可向法院、金融机构及行政机关提交。遗嘱的法律效力须经遗嘱人死亡后的法院认证程序确认。",
    issuerName: "EverWill Inc. (爱维尔公司)",
    issuerSubtitle: "数字遗嘱认证机构 | 注册编号: 621-81-61690",
    validityNote: "※ 本认证书自发行之日起有效。修改遗嘱时需重新认证。",
    primaryColor: [139, 0, 0], accentColor: [201, 169, 97],
  },
  DE: {
    lang: "de", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "TESTAMENTSURKUNDE",
    subtitle: "EverWill Digitale Testamentsplattform — Offizielle Beglaubigungsurkunde",
    certLabel: "Urkundennummer", dateLabel: "Beglaubigungsdatum", testatorLabel: "Erblasser",
    purposeLabel: "Ausstellungszweck", certNumLabel: "Urkundennummer", blockchainLabel: "Blockchain-Hash",
    signatureLabel: "Bevollmächtigter Unterzeichner",
    assetSectionTitle: "Artikel 2: Registrierte Vermögenswerte",
    heirSectionTitle: "Artikel 3: Erben",
    willTextTitle: "Artikel 4: Testamentstext",
    attachmentSectionTitle: "Artikel 5: Belege und Nachweise",
    stampText: "EverWill\nBEGLAUBIGT",
    totalAssetsLabel: "Geschätzter Gesamtwert",
    legalBasis: "Rechtsgrundlage: BGB §2247 (Eigenhändiges Testament), §2231 (Testamentsformen), eIDAS-Verordnung",
    legalNote: "Diese Urkunde wird von EverWill Inc. gemäß dem Bürgerlichen Gesetzbuch (BGB) und der eIDAS-Verordnung ausgestellt. Sie bestätigt die Existenz und Beglaubigung des genannten Testaments. Die Rechtsgültigkeit unterliegt dem Nachlassverfahren beim zuständigen Nachlassgericht. Diese Urkunde kann Gerichten, Finanzinstituten und Behörden vorgelegt werden.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Digitale Testament-Beglaubigungsplattform | Reg.-Nr.: 621-81-61690",
    validityNote: "* Diese Urkunde gilt ab dem Ausstellungsdatum. Bei Testamentsänderung ist eine Neubeglaubigung erforderlich.",
    primaryColor: [0, 0, 0], accentColor: [201, 169, 97],
  },
  ES: {
    lang: "es", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "CERTIFICADO DE AUTENTICACIÓN TESTAMENTARIA",
    subtitle: "EverWill Plataforma Digital de Testamentos — Documento Oficial",
    certLabel: "N.º de Certificado", dateLabel: "Fecha de Autenticación", testatorLabel: "Testador",
    purposeLabel: "Propósito", certNumLabel: "N.º de Certificado", blockchainLabel: "Hash Blockchain",
    signatureLabel: "Firmante Autorizado",
    assetSectionTitle: "Artículo 2: Bienes Registrados",
    heirSectionTitle: "Artículo 3: Herederos",
    willTextTitle: "Artículo 4: Texto del Testamento",
    attachmentSectionTitle: "Artículo 5: Documentos Adjuntos",
    stampText: "EverWill\nCERTIFICADO",
    totalAssetsLabel: "Valor Total Estimado",
    legalBasis: "Base Legal: Código Civil Art.688 (Testamento Ológrafo), Art.694 (Testamento Abierto), Ley de Firma Electrónica",
    legalNote: "Este certificado es emitido por EverWill Inc. conforme al Código Civil español y la Ley de Firma Electrónica. Certifica la existencia y autenticación del testamento referenciado. La validez legal está sujeta a los procedimientos notariales correspondientes. Este certificado puede presentarse ante tribunales, entidades financieras y organismos administrativos.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Plataforma de Autenticación Testamentaria Digital | Reg.: 621-81-61690",
    validityNote: "* Este certificado es válido desde la fecha de emisión. Se requiere re-autenticación al modificar el testamento.",
    primaryColor: [170, 0, 0], accentColor: [201, 169, 97],
  },
  SA: {
    lang: "ar", fontRegular: FONT_CJK_REGULAR, fontBold: FONT_CJK_BOLD, isRTL: true,
    title: "شهادة توثيق الوصية",
    subtitle: "منصة EverWill الرقمية للوصايا — وثيقة رسمية معتمدة",
    certLabel: "رقم الشهادة", dateLabel: "تاريخ التوثيق", testatorLabel: "الموصي",
    purposeLabel: "الغرض من الإصدار", certNumLabel: "رقم الشهادة", blockchainLabel: "تجزئة البلوكشين",
    signatureLabel: "الموقع المفوض",
    assetSectionTitle: "المادة الثانية: قائمة الأصول المسجلة",
    heirSectionTitle: "المادة الثالثة: قائمة الورثة",
    willTextTitle: "المادة الرابعة: نص الوصية الكامل",
    attachmentSectionTitle: "المادة الخامسة: المستندات المرفقة",
    stampText: "EverWill\nمعتمد",
    totalAssetsLabel: "إجمالي القيمة التقديرية",
    legalBasis: "الأساس القانوني: أحكام الشريعة الإسلامية في المواريث، نظام التوثيق السعودي، نظام التعاملات الإلكترونية",
    legalNote: "تُصدر هذه الشهادة من قِبل شركة EverWill وفقاً لأحكام الشريعة الإسلامية ونظام التوثيق في المملكة العربية السعودية. تُثبت هذه الشهادة وجود الوصية وصحة توثيقها. يخضع نفاذها القانوني لإجراءات المحاكم الشرعية المختصة. ملاحظة: تُطبَّق أحكام الميراث الشرعي (للذكر مثل حظ الأنثيين) وفقاً للفقه الإسلامي.",
    issuerName: "شركة EverWill",
    issuerSubtitle: "منصة توثيق الوصايا الرقمية | رقم التسجيل: 621-81-61690",
    validityNote: "* هذه الشهادة سارية من تاريخ إصدارها. يلزم إعادة التوثيق عند تعديل الوصية.",
    primaryColor: [0, 100, 0], accentColor: [201, 169, 97],
  },
  FR: {
    lang: "fr", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "CERTIFICAT D'AUTHENTIFICATION TESTAMENTAIRE",
    subtitle: "EverWill Plateforme Numérique de Testament — Document Officiel",
    certLabel: "N° de Certificat", dateLabel: "Date d'Authentification", testatorLabel: "Testateur",
    purposeLabel: "Objet", certNumLabel: "N° de Certificat", blockchainLabel: "Hash Blockchain",
    signatureLabel: "Signataire Autorisé",
    assetSectionTitle: "Article 2 : Biens Enregistrés",
    heirSectionTitle: "Article 3 : Héritiers",
    willTextTitle: "Article 4 : Texte du Testament",
    attachmentSectionTitle: "Article 5 : Pièces Jointes",
    stampText: "EverWill\nCERTIFIÉ",
    totalAssetsLabel: "Valeur Totale Estimée",
    legalBasis: "Base Légale: Code Civil Art.970 (Testament Olographe), Art.971 (Testament Authentique), Règlement eIDAS",
    legalNote: "Ce certificat est émis par EverWill Inc. conformément au Code Civil français et au règlement eIDAS. Il atteste de l'existence et de l'authentification du testament référencé. La validité juridique est soumise aux procédures notariales compétentes. Ce certificat peut être présenté aux tribunaux, établissements financiers et organismes administratifs.",
    issuerName: "EverWill Inc.",
    issuerSubtitle: "Plateforme d'Authentification Testamentaire Numérique | Reg.: 621-81-61690",
    validityNote: "* Ce certificat est valable à compter de sa date d'émission. Une ré-authentification est requise en cas de modification.",
    primaryColor: [0, 35, 149], accentColor: [201, 169, 97],
  },
  IN: {
    lang: "en", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Official Authentication Document (India)",
    certLabel: "Certificate No.", dateLabel: "Date of Authentication", testatorLabel: "Testator",
    purposeLabel: "Purpose", certNumLabel: "Certificate No.", blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    assetSectionTitle: "Article 2: Registered Assets",
    heirSectionTitle: "Article 3: Beneficiaries / Legatees",
    willTextTitle: "Article 4: Will Text",
    attachmentSectionTitle: "Article 5: Supporting Documents",
    stampText: "EverWill\nCERTIFIED",
    totalAssetsLabel: "Total Estimated Value",
    legalBasis: "Legal Basis: Indian Succession Act 1925 §63 (Execution of Unprivileged Wills), Information Technology Act 2000",
    legalNote: "This certificate is issued by EverWill Inc. pursuant to the Indian Succession Act 1925 and the Information Technology Act 2000. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the competent High Court. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc. (India Operations)",
    issuerSubtitle: "Digital Will Authentication Platform | Reg.: 621-81-61690",
    validityNote: "* This certificate is valid from the date of issuance. Re-authentication required upon amendment.",
    primaryColor: [19, 136, 8], accentColor: [201, 169, 97],
  },
  BR: {
    lang: "pt", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "CERTIFICADO DE AUTENTICAÇÃO TESTAMENTÁRIA",
    subtitle: "EverWill Plataforma Digital de Testamentos — Documento Oficial",
    certLabel: "N.º do Certificado", dateLabel: "Data de Autenticação", testatorLabel: "Testador",
    purposeLabel: "Finalidade", certNumLabel: "N.º do Certificado", blockchainLabel: "Hash Blockchain",
    signatureLabel: "Signatário Autorizado",
    assetSectionTitle: "Artigo 2.º: Bens Registados",
    heirSectionTitle: "Artigo 3.º: Herdeiros",
    willTextTitle: "Artigo 4.º: Texto do Testamento",
    attachmentSectionTitle: "Artigo 5.º: Documentos Anexos",
    stampText: "EverWill\nCERTIFICADO",
    totalAssetsLabel: "Valor Total Estimado",
    legalBasis: "Base Legal: Código Civil Art.1876 (Testamento Particular), ICP-Brasil, Lei 14.063/2020 (Assinatura Eletrônica)",
    legalNote: "Este certificado é emitido pela EverWill Inc. em conformidade com o Código Civil brasileiro e a Lei 14.063/2020. Certifica a existência e autenticação do testamento referenciado. A validade jurídica está sujeita aos procedimentos do cartório competente. Este certificado pode ser apresentado a tribunais, instituições financeiras e órgãos administrativos.",
    issuerName: "EverWill Inc. (Operações Brasil)",
    issuerSubtitle: "Plataforma de Autenticação Testamentária Digital | Reg.: 621-81-61690",
    validityNote: "* Este certificado é válido a partir da data de emissão. Reautenticação necessária em caso de alteração.",
    primaryColor: [0, 100, 0], accentColor: [201, 169, 97],
  },
  AU: {
    lang: "en", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Official Authentication Document (Australia)",
    certLabel: "Certificate No.", dateLabel: "Date of Authentication", testatorLabel: "Testator",
    purposeLabel: "Purpose", certNumLabel: "Certificate No.", blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    assetSectionTitle: "Article 2: Registered Assets",
    heirSectionTitle: "Article 3: Beneficiaries",
    willTextTitle: "Article 4: Will Text",
    attachmentSectionTitle: "Article 5: Supporting Documents",
    stampText: "EverWill\nCERTIFIED",
    totalAssetsLabel: "Total Estimated Value",
    legalBasis: "Legal Basis: Succession Act 2006 (NSW), Electronic Transactions Act 1999, Wills Act 1997 (VIC)",
    legalNote: "This certificate is issued by EverWill Inc. pursuant to the Succession Act 2006 and Electronic Transactions Act 1999 of Australia. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the Supreme Court of the relevant state. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc. (Australia)",
    issuerSubtitle: "Digital Will Authentication Platform | ABN: 621-81-61690",
    validityNote: "* This certificate is valid from the date of issuance. Re-authentication required upon amendment.",
    primaryColor: [0, 0, 139], accentColor: [201, 169, 97],
  },
  GB: {
    lang: "en", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Official Authentication Document (United Kingdom)",
    certLabel: "Certificate No.", dateLabel: "Date of Authentication", testatorLabel: "Testator",
    purposeLabel: "Purpose", certNumLabel: "Certificate No.", blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    assetSectionTitle: "Article 2: Registered Assets",
    heirSectionTitle: "Article 3: Beneficiaries",
    willTextTitle: "Article 4: Will Text",
    attachmentSectionTitle: "Article 5: Supporting Documents",
    stampText: "EverWill\nCERTIFIED",
    totalAssetsLabel: "Total Estimated Value",
    legalBasis: "Legal Basis: Wills Act 1837, Electronic Communications Act 2000, Law Commission Consultation Paper No.231",
    legalNote: "This certificate is issued by EverWill Inc. pursuant to the Wills Act 1837 and the Electronic Communications Act 2000. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the Senior Courts of England and Wales. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc. (UK Operations)",
    issuerSubtitle: "Digital Will Authentication Platform | Companies House Reg.: 621-81-61690",
    validityNote: "* This certificate is valid from the date of issuance. Re-authentication required upon amendment.",
    primaryColor: [0, 36, 125], accentColor: [201, 169, 97],
  },
  CA: {
    lang: "en", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Official Authentication Document (Canada)",
    certLabel: "Certificate No.", dateLabel: "Date of Authentication", testatorLabel: "Testator",
    purposeLabel: "Purpose", certNumLabel: "Certificate No.", blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    assetSectionTitle: "Article 2: Registered Assets",
    heirSectionTitle: "Article 3: Beneficiaries",
    willTextTitle: "Article 4: Will Text",
    attachmentSectionTitle: "Article 5: Supporting Documents",
    stampText: "EverWill\nCERTIFIED",
    totalAssetsLabel: "Total Estimated Value",
    legalBasis: "Legal Basis: WESA (BC) / SLRA (ON), Uniform Electronic Wills Act (ULCC 2022), Electronic Transactions Act",
    legalNote: "This certificate is issued by EverWill Inc. pursuant to applicable provincial succession legislation and the Uniform Electronic Wills Act. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the competent provincial court. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc. (Canada)",
    issuerSubtitle: "Digital Will Authentication Platform | BN: 621-81-61690",
    validityNote: "* This certificate is valid from the date of issuance. Re-authentication required upon amendment.",
    primaryColor: [255, 0, 0], accentColor: [201, 169, 97],
  },
  NZ: {
    lang: "en", fontRegular: "Helvetica", fontBold: "Helvetica-Bold", isRTL: false,
    title: "WILL AUTHENTICATION CERTIFICATE",
    subtitle: "EverWill Digital Will Platform — Official Authentication Document (New Zealand)",
    certLabel: "Certificate No.", dateLabel: "Date of Authentication", testatorLabel: "Testator",
    purposeLabel: "Purpose", certNumLabel: "Certificate No.", blockchainLabel: "Blockchain Hash",
    signatureLabel: "Authorised Signatory",
    assetSectionTitle: "Article 2: Registered Assets",
    heirSectionTitle: "Article 3: Beneficiaries",
    willTextTitle: "Article 4: Will Text",
    attachmentSectionTitle: "Article 5: Supporting Documents",
    stampText: "EverWill\nCERTIFIED",
    totalAssetsLabel: "Total Estimated Value",
    legalBasis: "Legal Basis: Wills Act 2007, Electronic Transactions Act 2002, Administration Act 1969",
    legalNote: "This certificate is issued by EverWill Inc. pursuant to the Wills Act 2007 and the Electronic Transactions Act 2002 of New Zealand. It certifies the existence and authentication of the referenced will. Legal validity is subject to probate proceedings before the High Court of New Zealand. This certificate may be presented to courts, financial institutions, and government agencies.",
    issuerName: "EverWill Inc. (New Zealand)",
    issuerSubtitle: "Digital Will Authentication Platform | NZBN: 621-81-61690",
    validityNote: "* This certificate is valid from the date of issuance. Re-authentication required upon amendment.",
    primaryColor: [0, 0, 139], accentColor: [220, 20, 60],
  },
};

const DEFAULT_CONFIG = COUNTRY_CONFIGS["US"];

// ─── 데이터 타입 ──────────────────────────────────────────────────────────────
export interface AssetData {
  type: string;
  name: string;
  description?: string | null;
  estimatedValue?: number | null;
  currency?: string | null;
  country?: string | null;
}

export interface HeirData {
  nameKo: string;
  nameEn?: string | null;
  relationship: string;
  sharePercent?: number | null;
  shareAmount?: number | null;
  shareType?: string | null;
  isExecutor?: number | null;
  country?: string | null;
}

export interface AttachmentData {
  fileName: string;
  category: string;
  description?: string | null;
  fileSize: number;
  verified?: number | null;
  createdAt?: Date | null;
}

export interface CertificateData {
  certNumber: string;
  certifiedAt: Date;
  testatorName: string;
  testatorBirthDate?: string | null;
  testatorAddress?: string | null;
  willTitle: string;
  willText?: string | null;
  purpose: string;
  blockchainHash?: string | null;
  country: string;
  assets?: AssetData[];
  heirs?: HeirData[];
  attachments?: AttachmentData[];
}

// ─── 헬퍼: 전 페이지 스탬프 그리기 ──────────────────────────────────────────
function drawPageStamp(
  doc: InstanceType<typeof PDFDocument>,
  config: CountryCertConfig,
  sealExists: boolean
) {
  const pageWidth  = doc.page.width;
  const pageHeight = doc.page.height;
  const [pr, pg, pb] = config.primaryColor;

  // 반투명 대각선 워터마크 텍스트
  doc.save();
  doc.opacity(0.06);
  doc.rotate(-45, { origin: [pageWidth / 2, pageHeight / 2] });
  doc
    .font("Helvetica-Bold")
    .fontSize(72)
    .fillColor(`rgb(${pr},${pg},${pb})`)
    .text("EverWill", pageWidth / 2 - 180, pageHeight / 2 - 40, { width: 360, align: "center" });
  doc.restore();

  // 우측 하단 소형 스탬프 원
  const cx = pageWidth - 80;
  const cy = pageHeight - 80;
  doc.save();
  doc.opacity(0.18);
  doc.circle(cx, cy, 38).stroke(`rgb(${pr},${pg},${pb})`).lineWidth(2);
  doc
    .font("Helvetica-Bold")
    .fontSize(7)
    .fillColor(`rgb(${pr},${pg},${pb})`)
    .text("EverWill", cx - 22, cy - 10, { width: 44, align: "center" })
    .text("CERTIFIED", cx - 22, cy, { width: 44, align: "center" });
  doc.restore();

  // 씰 이미지 (있을 때만)
  if (sealExists) {
    try {
      doc.save();
      doc.opacity(0.12);
      doc.image(SEAL_PATH, pageWidth - 130, pageHeight - 130, { width: 70 });
      doc.restore();
    } catch { /* 씰 없으면 무시 */ }
  }
}

// ─── 헬퍼: 섹션 헤더 그리기 ──────────────────────────────────────────────────
function drawSectionHeader(
  doc: InstanceType<typeof PDFDocument>,
  title: string,
  y: number,
  margin: number,
  contentWidth: number,
  config: CountryCertConfig,
  fontBold: string
): number {
  const [pr, pg, pb] = config.primaryColor;
  const [ar, ag, ab] = config.accentColor;
  doc.rect(margin, y, contentWidth, 28).fill(`rgb(${pr},${pg},${pb})`);
  doc.rect(margin, y, 4, 28).fill(`rgb(${ar},${ag},${ab})`);
  doc
    .font(fontBold)
    .fontSize(10)
    .fillColor("white")
    .text(title, margin + 12, y + 8, { width: contentWidth - 24 });
  return y + 36;
}

// ─── 헬퍼: 자산 유형 한국어 변환 ──────────────────────────────────────────────
function assetTypeLabel(type: string, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    real_estate: { ko: "부동산", en: "Real Estate", ja: "不動産", zh: "房地产" },
    bank:        { ko: "예금·적금", en: "Bank/Savings", ja: "預金", zh: "银行存款" },
    stock:       { ko: "주식·펀드", en: "Stocks/Funds", ja: "株式", zh: "股票" },
    insurance:   { ko: "보험", en: "Insurance", ja: "保険", zh: "保险" },
    crypto:      { ko: "가상자산", en: "Cryptocurrency", ja: "仮想通貨", zh: "加密货币" },
    vehicle:     { ko: "차량", en: "Vehicle", ja: "車両", zh: "车辆" },
    business:    { ko: "사업체", en: "Business", ja: "事業", zh: "企业" },
    pension:     { ko: "연금", en: "Pension", ja: "年金", zh: "养老金" },
    artwork:     { ko: "예술품", en: "Artwork", ja: "美術品", zh: "艺术品" },
    other:       { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  };
  const l = lang === "ko" ? "ko" : lang === "ja" ? "ja" : lang === "zh" ? "zh" : "en";
  return map[type]?.[l] ?? type;
}

function relationshipLabel(rel: string, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    spouse:     { ko: "배우자", en: "Spouse", ja: "配偶者", zh: "配偶" },
    child:      { ko: "자녀", en: "Child", ja: "子", zh: "子女" },
    parent:     { ko: "부모", en: "Parent", ja: "親", zh: "父母" },
    sibling:    { ko: "형제자매", en: "Sibling", ja: "兄弟姉妹", zh: "兄弟姐妹" },
    grandchild: { ko: "손자녀", en: "Grandchild", ja: "孫", zh: "孙子女" },
    other:      { ko: "기타", en: "Other", ja: "その他", zh: "其他" },
  };
  const l = lang === "ko" ? "ko" : lang === "ja" ? "ja" : lang === "zh" ? "zh" : "en";
  return map[rel]?.[l] ?? rel;
}

function attachCategoryLabel(cat: string, lang: string): string {
  const map: Record<string, Record<string, string>> = {
    real_estate: { ko: "부동산 등기부등본", en: "Real Estate Registry", ja: "不動産登記簿謄本", zh: "房地产登记证" },
    bank:        { ko: "통장 사본/잔고증명", en: "Bank Statement", ja: "通帳写し/残高証明", zh: "银行流水/余额证明" },
    stock:       { ko: "주식 잔고증명서", en: "Stock Certificate", ja: "株式残高証明書", zh: "股票持仓证明" },
    crypto:      { ko: "가상자산 보유증명", en: "Crypto Holdings Proof", ja: "仮想通貨保有証明", zh: "加密货币持有证明" },
    insurance:   { ko: "보험증권", en: "Insurance Policy", ja: "保険証券", zh: "保险单" },
    pension:     { ko: "연금 증명서", en: "Pension Certificate", ja: "年金証書", zh: "养老金证明" },
    other:       { ko: "기타 증빙서류", en: "Other Document", ja: "その他書類", zh: "其他文件" },
  };
  const l = lang === "ko" ? "ko" : lang === "ja" ? "ja" : lang === "zh" ? "zh" : "en";
  return map[cat]?.[l] ?? cat;
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("ko-KR", { style: "currency", currency: currency || "KRW", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

// ─── 메인 PDF 생성 함수 ────────────────────────────────────────────────────────
export function generateWillCertificatePDF(data: CertificateData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const config = COUNTRY_CONFIGS[data.country.toUpperCase()] ?? DEFAULT_CONFIG;
    const sealExists = fs.existsSync(SEAL_PATH);

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: config.title,
        Author: config.issuerName,
        Subject: `Will Authentication Certificate - ${data.certNumber}`,
        Creator: "EverWill Platform v2.0",
      },
    });

    // 폰트 등록
    const isBuiltIn = config.fontRegular === "Helvetica" || config.fontRegular === "Times-Roman";
    if (!isBuiltIn) {
      try {
        doc.registerFont("Regular", config.fontRegular);
        doc.registerFont("Bold", config.fontBold);
      } catch { /* 폰트 로드 실패 시 기본 폰트 사용 */ }
    }
    const fontRegular = isBuiltIn ? config.fontRegular : "Regular";
    const fontBold    = isBuiltIn ? config.fontBold    : "Bold";

    const [pr, pg, pb] = config.primaryColor;
    const [ar, ag, ab] = config.accentColor;

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth    = doc.page.width;
    const pageHeight   = doc.page.height;
    const margin       = 60;
    const contentWidth = pageWidth - margin * 2;

    // ════════════════════════════════════════════════════════════════════
    // 페이지 1: 인증서 표지 + 제1조 유언자 정보
    // ════════════════════════════════════════════════════════════════════

    // 배경 헤더
    doc.rect(0, 0, pageWidth, 150).fill(`rgb(${pr},${pg},${pb})`);
    doc.rect(0, pageHeight - 100, pageWidth, 100).fill(`rgb(${pr},${pg},${pb})`);
    doc.rect(0, 150, pageWidth, 4).fill(`rgb(${ar},${ag},${ab})`);
    doc.rect(0, pageHeight - 104, pageWidth, 4).fill(`rgb(${ar},${ag},${ab})`);

    // EverWill 로고
    doc.font(fontBold).fontSize(14).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 30, { align: "left" });

    // 국가 배지
    doc.roundedRect(pageWidth - margin - 55, 24, 55, 22, 4).fill("rgba(255,255,255,0.15)");
    doc.font(fontBold).fontSize(9).fillColor("white").text(data.country.toUpperCase(), pageWidth - margin - 55, 30, { width: 55, align: "center" });

    // 메인 제목
    doc.font(fontBold).fontSize(22).fillColor("white").text(config.title, margin, 60, { width: contentWidth, align: "center" });
    doc.font(fontRegular).fontSize(9).fillColor("rgba(255,255,255,0.8)").text(config.subtitle, margin, 96, { width: contentWidth, align: "center" });
    doc.font(fontBold).fontSize(8).fillColor(`rgb(${ar},${ag},${ab})`).text("OFFICIAL AUTHENTICATION DOCUMENT", margin, 122, { width: contentWidth, align: "center" });

    // 씰 이미지 (헤더 우측)
    if (sealExists) {
      try { doc.image(SEAL_PATH, pageWidth - margin - 70, 30, { width: 60 }); } catch { /* 무시 */ }
    }

    // 인증번호 박스
    const certBoxY = 170;
    doc.rect(margin, certBoxY, contentWidth, 60).fill("#F8F6F0");
    doc.rect(margin, certBoxY, 5, 60).fill(`rgb(${ar},${ag},${ab})`);
    doc.font(fontBold).fontSize(8).fillColor(`rgb(${pr},${pg},${pb})`).text(config.certNumLabel, margin + 16, certBoxY + 10);
    doc.font(fontBold).fontSize(20).fillColor(`rgb(${pr},${pg},${pb})`).text(data.certNumber, margin + 16, certBoxY + 24);
    const certDateStr = new Date(data.certifiedAt).toLocaleDateString(
      config.lang === "ko" ? "ko-KR" : config.lang === "ja" ? "ja-JP" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
    doc.font(fontRegular).fontSize(9).fillColor("#666").text(`${config.dateLabel}: ${certDateStr}`, margin + 16, certBoxY + 46);

    // 제1조 유언자 정보
    let y = certBoxY + 80;
    y = drawSectionHeader(doc, config.lang === "ko" ? "제1조 유언자 정보" : config.lang === "ja" ? "第1条 遺言者情報" : config.lang === "zh" ? "第一条 立遗嘱人信息" : "Article 1: Testator Information", y, margin, contentWidth, config, fontBold);

    const info1Rows = [
      [config.testatorLabel, data.testatorName],
      [config.lang === "ko" ? "생년월일" : config.lang === "ja" ? "生年月日" : "Date of Birth", data.testatorBirthDate ?? "-"],
      [config.lang === "ko" ? "주소" : config.lang === "ja" ? "住所" : "Address", data.testatorAddress ?? "-"],
      [config.lang === "ko" ? "유언장 제목" : config.lang === "ja" ? "遺言書タイトル" : "Will Title", data.willTitle],
      [config.purposeLabel, data.purpose],
    ];

    info1Rows.forEach((row, i) => {
      const ry = y + i * 32;
      doc.rect(margin, ry, contentWidth, 32).fill(i % 2 === 0 ? "#FAFAFA" : "#FFFFFF");
      doc.rect(margin, ry + 31, contentWidth, 1).fill("#E8E8E8");
      doc.font(fontBold).fontSize(8).fillColor(`rgb(${pr},${pg},${pb})`).text(row[0], margin + 12, ry + 10, { width: 130 });
      doc.font(fontRegular).fontSize(9).fillColor("#1A1A1A").text(row[1], margin + 150, ry + 10, { width: contentWidth - 162 });
    });
    y += info1Rows.length * 32 + 16;

    // 블록체인 해시
    if (data.blockchainHash) {
      doc.rect(margin, y, contentWidth, 44).fill("#F0F4F8");
      doc.rect(margin, y, 4, 44).fill("#4A90D9");
      doc.font(fontBold).fontSize(8).fillColor("#4A90D9").text(config.blockchainLabel, margin + 12, y + 8);
      doc.font(fontRegular).fontSize(7).fillColor("#555").text(data.blockchainHash, margin + 12, y + 22, { width: contentWidth - 24, lineBreak: false });
      y += 56;
    }

    // 법적 근거
    doc.rect(margin, y, contentWidth, 2).fill(`rgb(${ar},${ag},${ab})`);
    y += 10;
    doc.font(fontBold).fontSize(8).fillColor(`rgb(${pr},${pg},${pb})`).text(config.legalBasis, margin, y, { width: contentWidth });
    y += 22;
    doc.font(fontRegular).fontSize(7.5).fillColor("#444").text(config.legalNote, margin, y, { width: contentWidth, align: "justify", lineGap: 2 });
    y += 80;
    doc.font(fontRegular).fontSize(7.5).fillColor("#888").text(config.validityNote, margin, y, { width: contentWidth });

    // 서명란
    const signY = pageHeight - 155;
    doc.rect(margin + contentWidth - 200, signY, 200, 1).fill("#333");
    doc.font(fontBold).fontSize(9).fillColor("#333").text(config.signatureLabel, margin + contentWidth - 200, signY + 6, { width: 200, align: "center" });
    doc.font(fontRegular).fontSize(8).fillColor("#555").text(config.issuerName, margin + contentWidth - 200, signY + 20, { width: 200, align: "center" });

    // 푸터
    doc.font(fontBold).fontSize(10).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, pageHeight - 80);
    doc.font(fontRegular).fontSize(7.5).fillColor("rgba(255,255,255,0.8)").text(config.issuerSubtitle, margin, pageHeight - 65, { width: contentWidth });
    doc.font(fontRegular).fontSize(7).fillColor("rgba(255,255,255,0.6)").text(`https://everwill.co.kr  |  support@everwill.co.kr`, margin, pageHeight - 48, { width: contentWidth, align: "right" });
    const issuedAt = new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" });
    doc.font(fontRegular).fontSize(7).fillColor("rgba(255,255,255,0.5)").text(`Issued: ${issuedAt} KST  |  Page 1`, margin, pageHeight - 30, { width: contentWidth, align: "right" });

    // 페이지 1 스탬프
    drawPageStamp(doc, config, sealExists);

    // ════════════════════════════════════════════════════════════════════
    // 페이지 2: 자산 목록 + 상속자 명단
    // ════════════════════════════════════════════════════════════════════
    doc.addPage();
    drawPageStamp(doc, config, sealExists);

    // 페이지 헤더
    doc.rect(0, 0, pageWidth, 50).fill(`rgb(${pr},${pg},${pb})`);
    doc.rect(0, 50, pageWidth, 3).fill(`rgb(${ar},${ag},${ab})`);
    doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 16);
    doc.font(fontRegular).fontSize(9).fillColor("rgba(255,255,255,0.8)").text(config.title, margin + 80, 18, { width: contentWidth - 80 });
    doc.font(fontRegular).fontSize(8).fillColor("rgba(255,255,255,0.6)").text(`${data.certNumber}  |  Page 2`, margin, 33, { width: contentWidth, align: "right" });

    let y2 = 70;

    // 자산 목록
    y2 = drawSectionHeader(doc, config.assetSectionTitle, y2, margin, contentWidth, config, fontBold);

    const assetList = data.assets ?? [];
    if (assetList.length === 0) {
      doc.font(fontRegular).fontSize(9).fillColor("#888").text(config.lang === "ko" ? "등록된 자산이 없습니다." : "No assets registered.", margin + 12, y2 + 8);
      y2 += 30;
    } else {
      // 자산 테이블 헤더
      doc.rect(margin, y2, contentWidth, 22).fill(`rgb(${ar},${ag},${ab})`);
      const colW = [80, 160, 100, 120];
      const headers = config.lang === "ko"
        ? ["유형", "자산명", "국가", "추정가치"]
        : config.lang === "ja"
        ? ["種類", "資産名", "国", "推定価値"]
        : ["Type", "Asset Name", "Country", "Est. Value"];
      let hx = margin + 8;
      headers.forEach((h, i) => {
        doc.font(fontBold).fontSize(8).fillColor("white").text(h, hx, y2 + 6, { width: colW[i] });
        hx += colW[i];
      });
      y2 += 22;

      let totalValue = 0;
      assetList.forEach((asset, i) => {
        if (y2 > pageHeight - 120) {
          doc.addPage();
          drawPageStamp(doc, config, sealExists);
          doc.rect(0, 0, pageWidth, 50).fill(`rgb(${pr},${pg},${pb})`);
          doc.rect(0, 50, pageWidth, 3).fill(`rgb(${ar},${ag},${ab})`);
          doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 16);
          doc.font(fontRegular).fontSize(8).fillColor("rgba(255,255,255,0.6)").text(`${data.certNumber}  |  (continued)`, margin, 33, { width: contentWidth, align: "right" });
          y2 = 70;
        }
        doc.rect(margin, y2, contentWidth, 26).fill(i % 2 === 0 ? "#FAFAFA" : "#FFFFFF");
        doc.rect(margin, y2 + 25, contentWidth, 1).fill("#E8E8E8");
        let ax = margin + 8;
        doc.font(fontRegular).fontSize(8).fillColor("#333").text(assetTypeLabel(asset.type, config.lang), ax, y2 + 8, { width: colW[0] }); ax += colW[0];
        doc.font(fontBold).fontSize(8).fillColor("#1A1A1A").text(asset.name, ax, y2 + 8, { width: colW[1] }); ax += colW[1];
        doc.font(fontRegular).fontSize(8).fillColor("#555").text(asset.country ?? "-", ax, y2 + 8, { width: colW[2] }); ax += colW[2];
        const valStr = asset.estimatedValue ? formatCurrency(asset.estimatedValue, asset.currency ?? "KRW") : "-";
        doc.font(fontRegular).fontSize(8).fillColor("#333").text(valStr, ax, y2 + 8, { width: colW[3] });
        if (asset.estimatedValue) totalValue += asset.estimatedValue;
        y2 += 26;
      });

      // 합계
      doc.rect(margin, y2, contentWidth, 28).fill(`rgb(${pr},${pg},${pb})`);
      doc.font(fontBold).fontSize(9).fillColor("white").text(config.totalAssetsLabel, margin + 12, y2 + 8, { width: contentWidth - 150 });
      doc.font(fontBold).fontSize(10).fillColor(`rgb(${ar},${ag},${ab})`).text(formatCurrency(totalValue, "KRW"), margin + contentWidth - 140, y2 + 7, { width: 128, align: "right" });
      y2 += 40;
    }

    // 상속자 명단
    if (y2 > pageHeight - 200) {
      doc.addPage();
      drawPageStamp(doc, config, sealExists);
      doc.rect(0, 0, pageWidth, 50).fill(`rgb(${pr},${pg},${pb})`);
      doc.rect(0, 50, pageWidth, 3).fill(`rgb(${ar},${ag},${ab})`);
      doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 16);
      doc.font(fontRegular).fontSize(8).fillColor("rgba(255,255,255,0.6)").text(`${data.certNumber}  |  (continued)`, margin, 33, { width: contentWidth, align: "right" });
      y2 = 70;
    }

    y2 = drawSectionHeader(doc, config.heirSectionTitle, y2, margin, contentWidth, config, fontBold);

    const heirList = data.heirs ?? [];
    if (heirList.length === 0) {
      doc.font(fontRegular).fontSize(9).fillColor("#888").text(config.lang === "ko" ? "등록된 상속자가 없습니다." : "No heirs registered.", margin + 12, y2 + 8);
      y2 += 30;
    } else {
      // 상속자 테이블 헤더
      doc.rect(margin, y2, contentWidth, 22).fill(`rgb(${ar},${ag},${ab})`);
      const hColW = [130, 90, 80, 80, 100];
      const hHeaders = config.lang === "ko"
        ? ["성명", "관계", "지분(%)", "국가", "비고"]
        : config.lang === "ja"
        ? ["氏名", "続柄", "持分(%)", "国", "備考"]
        : ["Name", "Relationship", "Share(%)", "Country", "Notes"];
      let hhx = margin + 8;
      hHeaders.forEach((h, i) => {
        doc.font(fontBold).fontSize(8).fillColor("white").text(h, hhx, y2 + 6, { width: hColW[i] });
        hhx += hColW[i];
      });
      y2 += 22;

      heirList.forEach((heir, i) => {
        if (y2 > pageHeight - 120) {
          doc.addPage();
          drawPageStamp(doc, config, sealExists);
          doc.rect(0, 0, pageWidth, 50).fill(`rgb(${pr},${pg},${pb})`);
          doc.rect(0, 50, pageWidth, 3).fill(`rgb(${ar},${ag},${ab})`);
          doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 16);
          y2 = 70;
        }
        doc.rect(margin, y2, contentWidth, 28).fill(i % 2 === 0 ? "#FAFAFA" : "#FFFFFF");
        doc.rect(margin, y2 + 27, contentWidth, 1).fill("#E8E8E8");
        let hx2 = margin + 8;
        doc.font(fontBold).fontSize(9).fillColor("#1A1A1A").text(heir.nameKo, hx2, y2 + 9, { width: hColW[0] }); hx2 += hColW[0];
        doc.font(fontRegular).fontSize(8).fillColor("#555").text(relationshipLabel(heir.relationship, config.lang), hx2, y2 + 9, { width: hColW[1] }); hx2 += hColW[1];
        const shareStr = heir.shareType === "percent" ? `${heir.sharePercent ?? 0}%` : heir.shareAmount ? formatCurrency(heir.shareAmount, "KRW") : "-";
        doc.font(fontBold).fontSize(9).fillColor(`rgb(${pr},${pg},${pb})`).text(shareStr, hx2, y2 + 9, { width: hColW[2] }); hx2 += hColW[2];
        doc.font(fontRegular).fontSize(8).fillColor("#555").text(heir.country ?? "-", hx2, y2 + 9, { width: hColW[3] }); hx2 += hColW[3];
        const noteStr = heir.isExecutor ? (config.lang === "ko" ? "집행자" : config.lang === "ja" ? "執行者" : "Executor") : "";
        doc.font(fontRegular).fontSize(8).fillColor("#888").text(noteStr, hx2, y2 + 9, { width: hColW[4] });
        y2 += 28;
      });
      y2 += 10;
    }

    // ════════════════════════════════════════════════════════════════════
    // 페이지 3: 유언 전문 (중앙 대형 인증 도장)
    // ════════════════════════════════════════════════════════════════════
    if (data.willText) {
      doc.addPage();

      // 전 페이지 스탬프
      drawPageStamp(doc, config, sealExists);

      // 페이지 헤더
      doc.rect(0, 0, pageWidth, 50).fill(`rgb(${pr},${pg},${pb})`);
      doc.rect(0, 50, pageWidth, 3).fill(`rgb(${ar},${ag},${ab})`);
      doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 16);
      doc.font(fontRegular).fontSize(8).fillColor("rgba(255,255,255,0.6)").text(`${data.certNumber}  |  Page (Will Text)`, margin, 33, { width: contentWidth, align: "right" });

      let yw = 70;
      yw = drawSectionHeader(doc, config.willTextTitle, yw, margin, contentWidth, config, fontBold);

      // 유언 전문 박스
      doc.rect(margin, yw, contentWidth, pageHeight - yw - 120).fill("#FFFEF8");
      doc.rect(margin, yw, contentWidth, pageHeight - yw - 120).stroke("#E0D5B0").lineWidth(1);

      // 유언 전문 텍스트
      doc
        .font(fontRegular)
        .fontSize(9.5)
        .fillColor("#1A1A1A")
        .text(data.willText, margin + 20, yw + 20, {
          width: contentWidth - 40,
          lineGap: 4,
          align: "justify",
        });

      // ── 중앙 대형 인증 도장 ──────────────────────────────────────────
      const stampCX = pageWidth / 2;
      const stampCY = pageHeight / 2 + 30;
      const stampR  = 75;

      doc.save();
      doc.opacity(0.22);

      // 외부 원
      doc.circle(stampCX, stampCY, stampR).stroke(`rgb(${pr},${pg},${pb})`).lineWidth(3);
      // 내부 원
      doc.circle(stampCX, stampCY, stampR - 10).stroke(`rgb(${pr},${pg},${pb})`).lineWidth(1.5);
      // 골드 원
      doc.circle(stampCX, stampCY, stampR - 5).stroke(`rgb(${ar},${ag},${ab})`).lineWidth(1);

      // 도장 텍스트
      doc.font(fontBold).fontSize(14).fillColor(`rgb(${pr},${pg},${pb})`).text("EverWill", stampCX - 40, stampCY - 24, { width: 80, align: "center" });
      doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text(config.lang === "ko" ? "인증완료" : config.lang === "ja" ? "認証済" : config.lang === "zh" ? "认证完成" : "CERTIFIED", stampCX - 40, stampCY - 4, { width: 80, align: "center" });
      doc.font(fontRegular).fontSize(7).fillColor(`rgb(${pr},${pg},${pb})`).text(data.certNumber, stampCX - 50, stampCY + 14, { width: 100, align: "center" });

      doc.restore();

      // 씰 이미지 중앙 (있을 때)
      if (sealExists) {
        try {
          doc.save();
          doc.opacity(0.20);
          doc.image(SEAL_PATH, stampCX - 55, stampCY - 55, { width: 110 });
          doc.restore();
        } catch { /* 무시 */ }
      }
    }

    // ════════════════════════════════════════════════════════════════════
    // 페이지 4+: 첨부 증빙서류 목록
    // ════════════════════════════════════════════════════════════════════
    const attachList = data.attachments ?? [];
    if (attachList.length > 0) {
      doc.addPage();
      drawPageStamp(doc, config, sealExists);

      doc.rect(0, 0, pageWidth, 50).fill(`rgb(${pr},${pg},${pb})`);
      doc.rect(0, 50, pageWidth, 3).fill(`rgb(${ar},${ag},${ab})`);
      doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 16);
      doc.font(fontRegular).fontSize(8).fillColor("rgba(255,255,255,0.6)").text(`${data.certNumber}  |  Attachments`, margin, 33, { width: contentWidth, align: "right" });

      let ya = 70;
      ya = drawSectionHeader(doc, config.attachmentSectionTitle, ya, margin, contentWidth, config, fontBold);

      // 안내 문구
      const attachNote = config.lang === "ko"
        ? "아래 서류들은 유언자가 EverWill 플랫폼에 직접 업로드한 원본 증빙서류입니다. 각 서류에는 EverWill 인증 스탬프가 적용되어 있습니다."
        : "The following documents were directly uploaded by the testator to the EverWill platform as original supporting evidence. Each document bears the EverWill authentication stamp.";
      doc.rect(margin, ya, contentWidth, 36).fill("#FFF8E7");
      doc.rect(margin, ya, 4, 36).fill(`rgb(${ar},${ag},${ab})`);
      doc.font(fontRegular).fontSize(8).fillColor("#555").text(attachNote, margin + 12, ya + 10, { width: contentWidth - 24 });
      ya += 48;

      // 첨부 파일 테이블 헤더
      doc.rect(margin, ya, contentWidth, 22).fill(`rgb(${ar},${ag},${ab})`);
      const aColW = [40, 130, 200, 80, 25];
      const aHeaders = config.lang === "ko"
        ? ["#", "서류 종류", "파일명 / 설명", "업로드일", "검토"]
        : ["#", "Document Type", "File Name / Description", "Upload Date", "✓"];
      let ahx = margin + 8;
      aHeaders.forEach((h, i) => {
        doc.font(fontBold).fontSize(8).fillColor("white").text(h, ahx, ya + 6, { width: aColW[i] });
        ahx += aColW[i];
      });
      ya += 22;

      attachList.forEach((att, i) => {
        if (ya > pageHeight - 120) {
          doc.addPage();
          drawPageStamp(doc, config, sealExists);
          doc.rect(0, 0, pageWidth, 50).fill(`rgb(${pr},${pg},${pb})`);
          doc.rect(0, 50, pageWidth, 3).fill(`rgb(${ar},${ag},${pb})`);
          doc.font(fontBold).fontSize(11).fillColor(`rgb(${ar},${ag},${ab})`).text("EverWill", margin, 16);
          ya = 70;
        }
        doc.rect(margin, ya, contentWidth, 30).fill(i % 2 === 0 ? "#FAFAFA" : "#FFFFFF");
        doc.rect(margin, ya + 29, contentWidth, 1).fill("#E8E8E8");
        let ax2 = margin + 8;
        doc.font(fontBold).fontSize(9).fillColor(`rgb(${pr},${pg},${pb})`).text(`${i + 1}`, ax2, ya + 10, { width: aColW[0] }); ax2 += aColW[0];
        doc.font(fontBold).fontSize(8).fillColor("#1A1A1A").text(attachCategoryLabel(att.category, config.lang), ax2, ya + 10, { width: aColW[1] }); ax2 += aColW[1];
        const descStr = att.description ? `${att.fileName}\n${att.description}` : att.fileName;
        doc.font(fontRegular).fontSize(8).fillColor("#333").text(descStr, ax2, ya + 6, { width: aColW[2], lineGap: 1 }); ax2 += aColW[2];
        const dateStr = att.createdAt ? new Date(att.createdAt).toLocaleDateString("ko-KR") : "-";
        doc.font(fontRegular).fontSize(8).fillColor("#666").text(dateStr, ax2, ya + 10, { width: aColW[3] }); ax2 += aColW[3];
        const verStr = att.verified ? "✓" : "○";
        doc.font(fontBold).fontSize(10).fillColor(att.verified ? "#16A34A" : "#999").text(verStr, ax2, ya + 9, { width: aColW[4] });
        ya += 30;
      });

      ya += 20;

      // 합계 요약
      doc.rect(margin, ya, contentWidth, 30).fill(`rgb(${pr},${pg},${pb})`);
      const totalLabel = config.lang === "ko" ? `총 ${attachList.length}건의 증빙서류가 첨부되어 있습니다.` : `Total ${attachList.length} supporting document(s) attached.`;
      doc.font(fontBold).fontSize(9).fillColor("white").text(totalLabel, margin + 12, ya + 10, { width: contentWidth - 24 });
      ya += 42;

      // 하단 법적 고지
      doc.font(fontRegular).fontSize(7.5).fillColor("#888").text(
        config.lang === "ko"
          ? "※ 본 첨부서류 목록은 유언자가 직접 업로드한 파일의 목록입니다. EverWill은 서류의 진위 여부를 보증하지 않으며, 최종 법적 효력은 관할 법원의 판단에 따릅니다."
          : "* This attachment list records files directly uploaded by the testator. EverWill does not guarantee the authenticity of documents; final legal validity is subject to court determination.",
        margin, ya, { width: contentWidth }
      );
    }

    doc.end();
  });
}
