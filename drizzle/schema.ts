import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  /** Stripe 고객 ID */
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
  /** 전화번호 (알리고 SMS 인증용) */
  phone: varchar("phone", { length: 20 }),
  /** 생년월일 (YYYY-MM-DD) */
  birthDate: varchar("birthDate", { length: 16 }),
  /** 거주 국가 코드 (ISO 3166-1 alpha-2) */
  country: varchar("country", { length: 8 }).default("KR"),
  /** 프로필 완성 여부 (0=미완성, 1=완성) */
  profileCompleted: int("profileCompleted").default(0),
  /** 나의 추천인 코드 (6자리 대문자+숫자, 회원가입 시 자동 생성) */
  referralCode: varchar("referralCode", { length: 16 }).unique(),
  /** 나를 추천한 사람의 추천인 코드 */
  referredBy: varchar("referredBy", { length: 16 }),
  /** 포인트 잔액 */
  pointBalance: int("pointBalance").default(0).notNull(),
  /** 주소 (도로명 또는 외국 주소) */
  address: text("address"),
  /** 우편번호 */
  zipCode: varchar("zipCode", { length: 16 }),
  /** 주(주립) - 미국/캐나다/호주 등 */
  stateProvince: varchar("stateProvince", { length: 64 }),
  /** 국적 (거주국가와 다를 수 있음) */
  nationality: varchar("nationality", { length: 8 }),
  /** 후리가나 (일본 전용) */
  furigana: varchar("furigana", { length: 128 }),
  /** 종교 (아랍권 샤리아법 적용 여부) */
  religion: varchar("religion", { length: 32 }),
  /** 서비스 이용약관 동의 (0=미동의, 1=동의) */
  agreeTerms: int("agreeTerms").default(0),
  /** 개인정보처리방침 동의 (0=미동의, 1=동의) */
  agreePrivacy: int("agreePrivacy").default(0),
  /** 마케팅 동의 (0=미동의, 1=동의) */
  agreeMarketing: int("agreeMarketing").default(0),
  /** GDPR 동의 (유럽 사용자 전용, 0=미동의, 1=동의) */
  agreeGdpr: int("agreeGdpr").default(0),
  /** 직업 */
  occupation: varchar("occupation", { length: 64 }),
  /** 자산 규모 (선택: small/medium/large/ultra) */
  assetScale: varchar("assetScale", { length: 16 }),
  /** 개인 QR 코드 (UUID, 회원가입 시 자동 생성) */
  qrCode: varchar("qrCode", { length: 64 }).unique(),
  /** QR 코드 공개 여부 (0=비공개, 1=공개) */
  qrPublic: int("qrPublic").default(1),
  /** bcrypt 해시된 비밀번호 (이메일+비밀번호 로그인 방식 사용 시) */
  passwordHash: varchar("passwordHash", { length: 256 }),
  /**
   * 회원 등급
   * - general: 일반회원 (자산 등록 완료)
   * - silver: 실버 (유료 서비스 구매)
   * - gold: 골드 (Badge Premium ₩299,000 결제)
   * - platinum: 플래티넘 (Gold + 자산 3억 이상)
   * - vip: VIP (Gold + 자산 5억 이상)
   */
  memberGrade: mysqlEnum("memberGrade", ["general", "silver", "gold", "platinum", "vip"]).default("general").notNull(),
  /** 등급 마지막 업데이트 시각 */
  gradeUpdatedAt: timestamp("gradeUpdatedAt"),
  /** 프로필 사진 스토리지 키 */
  profilePhotoKey: varchar("profilePhotoKey", { length: 512 }),
  /** 얼굴 인증 완료 여부 (0=미완료, 1=완료) */
  faceVerified: int("faceVerified").default(0),
  /** 신분증 사진 스토리지 키 */
  idImageKey: varchar("idImageKey", { length: 512 }),
  /** 셀피(얼굴) 사진 스토리지 키 */
  selfieImageKey: varchar("selfieImageKey", { length: 512 }),
  /** 얼굴 인증 완료 시각 */
  faceVerifiedAt: timestamp("faceVerifiedAt"),
  /** AI 얼굴 인증 결과 메시지 */
  faceVerifyResult: text("faceVerifyResult"),

  // ===== 법적 인증 필수 정보 =====
  /** 주민등록번호 (AES-256 암호화 저장, 절대 평문 저장 금지) */
  residentNumberEnc: varchar("residentNumberEnc", { length: 512 }),
  /** 주민번호 마스킹 표시용 (앞 6자리만, 예: 800101-*******) */
  residentNumberMasked: varchar("residentNumberMasked", { length: 32 }),
  /** 외국인등록번호 (외국인 회원용, AES-256 암호화) */
  foreignerNumberEnc: varchar("foreignerNumberEnc", { length: 512 }),
  /** 여권번호 (해외 거주자용, AES-256 암호화) */
  passportNumberEnc: varchar("passportNumberEnc", { length: 512 }),
  /** 여권 만료일 */
  passportExpiry: varchar("passportExpiry", { length: 16 }),
  /** 상세 주소 (도로명주소 + 동/호수) */
  addressDetail: text("addressDetail"),
  /** 도시 */
  city: varchar("city", { length: 64 }),

  // ===== eKYC 본인인증 =====
  /** eKYC 인증 상태 (none/pending/verified/failed/expired) */
  kycStatus: mysqlEnum("kycStatus", ["none", "pending", "verified", "failed", "expired"]).default("none"),
  /** eKYC 인증 완료 시각 */
  kycVerifiedAt: timestamp("kycVerifiedAt"),
  /** eKYC 인증 기관 (nice/ipin/kakao/naver/pass) */
  kycProvider: varchar("kycProvider", { length: 32 }),
  /** eKYC 인증 고유번호 (기관 발급) */
  kycReferenceId: varchar("kycReferenceId", { length: 128 }),
  /** eKYC 인증 만료일 */
  kycExpiresAt: timestamp("kycExpiresAt"),
  /** 본인인증 완료 여부 (0=미완료, 1=완료) */
  identityVerified: int("identityVerified").default(0),

  // ===== 전자서명 인증 =====
  /** 전자서명 완료 여부 (0=미완료, 1=완료) */
  signatureVerified: int("signatureVerified").default(0),
  /** 전자서명 완료 시각 */
  signatureVerifiedAt: timestamp("signatureVerifiedAt"),
  /** 전자서명 공급자 (docusign/adobe/kakao) */
  signatureProvider: varchar("signatureProvider", { length: 32 }),
  /** 전자서명 문서 ID */
  signatureDocId: varchar("signatureDocId", { length: 256 }),

  // ===== 음성 의사 확인 =====
  /** 음성 의사 확인 완료 여부 (0=미완료, 1=완료) */
  voiceVerified: int("voiceVerified").default(0),
  /** 음성 의사 확인 시각 */
  voiceVerifiedAt: timestamp("voiceVerifiedAt"),
  /** 음성 파일 스토리지 키 */
  voiceFileKey: varchar("voiceFileKey", { length: 512 }),

  // ===== 블록체인 인증 =====
  /** 블록체인 해시 (Polygon, 유언장 무결성 증명) */
  blockchainHash: varchar("blockchainHash", { length: 256 }),
  /** 블록체인 트랜잭션 ID */
  blockchainTxId: varchar("blockchainTxId", { length: 256 }),
  /** 블록체인 기록 시각 */
  blockchainAt: timestamp("blockchainAt"),
  /** RFC 3161 타임스탬프 토큰 (법적 효력 시각 증명) */
  timestampToken: text("timestampToken"),
  /** 타임스탬프 발급 시각 */
  timestampIssuedAt: timestamp("timestampIssuedAt"),

  // ===== 관리자 메모 =====
  /** 관리자 메모 (내부용) */
  adminNote: text("adminNote"),
  /** 계정 정지 여부 (0=정상, 1=정지) */
  suspended: int("suspended").default(0),
  /** 계정 정지 사유 */
  suspendReason: text("suspendReason"),
  /** 계정 정지 시각 */
  suspendedAt: timestamp("suspendedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 결제 내역 테이블
 * Stripe Checkout Session 완료 시 기록
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  /** 결제한 사용자 ID (users.id 참조) */
  userId: int("userId").notNull(),
  /** Stripe Checkout Session ID (Stripe 결제 시) */
  stripeSessionId: varchar("stripeSessionId", { length: 128 }).unique(),
  /** Stripe Payment Intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  /** 토스페이먼츠 주문 ID */
  tossOrderId: varchar("tossOrderId", { length: 128 }).unique(),
  /** 토스페이먼츠 결제 키 */
  tossPaymentKey: varchar("tossPaymentKey", { length: 200 }),
  /** 결제 수단 (카드, 가상계좌 등) */
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  /** 결제 타입 (NORMAL, BILLING 등) */
  paymentType: varchar("paymentType", { length: 50 }),
  /** 결제 상태 */
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  /** 결제 금액 (원화 기준, 원 단위) */
  amountTotal: bigint("amountTotal", { mode: "number" }),
  /** 통화 코드 */
  currency: varchar("currency", { length: 8 }).default("krw"),
  /** 구매한 상품 키 목록 (콤마 구분) */
  items: text("items"),
  /** 고객 이메일 */
  customerEmail: varchar("customerEmail", { length: 320 }),
  /** 결제 완료 시각 */
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * 유언장 테이블
 * 사용자가 작성한 유언장 데이터 저장
 */
export const wills = mysqlTable("wills", {
  id: int("id").autoincrement().primaryKey(),
  /** 작성자 사용자 ID */
  userId: int("userId").notNull(),
  /** 유언장 제목 (자동 생성) */
  title: varchar("title", { length: 256 }),
  /** 유언장 JSON 데이터 */
  data: text("data"),
  /** 작성 모드 */
  mode: mysqlEnum("mode", ["ai", "direct"]).default("ai"),
  /** 유언장 상태 */
  status: mysqlEnum("status", ["draft", "certified", "expired"]).default("draft").notNull(),
  /** 전자 인증 완료 여부 */
  isCertified: int("isCertified").default(0),
  /** 인증 완료 시각 */
  certifiedAt: timestamp("certifiedAt"),
  /** 보관 만료 시각 (null = 영구) */
  storageExpiresAt: timestamp("storageExpiresAt"),
  /** 결제 ID 참조 */
  paymentId: int("paymentId"),
  /** PDF 파일 S3 키 */
  pdfKey: varchar("pdfKey", { length: 512 }),
  /** PDF 파일 URL */
  pdfUrl: varchar("pdfUrl", { length: 1024 }),
  /** 블록체인 해시값 (SHA-256) */
  blockchainHash: varchar("blockchainHash", { length: 128 }),
  /** 유언장 고유 인증 번호 (EW-YYYYMMDD-XXXXXX) */
  certNumber: varchar("certNumber", { length: 32 }).unique(),
  /** 플랜별 무료 수정 가능 횟수 (1=기본, 2=프리미엄, -1=영구보관 무제한) */
  freeRevisionCount: int("freeRevisionCount").default(1).notNull(),
  /** 사용한 무료 수정 횟수 */
  usedFreeRevisions: int("usedFreeRevisions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Will = typeof wills.$inferSelect;
export type InsertWill = typeof wills.$inferInsert;

/**
 * 재산 테이블
 * 회원가입 후 사용자가 등록하는 자산 목록
 * 유언장 작성 시 자동으로 불러와짐
 */
export const assets = mysqlTable("assets", {
  id: int("id").autoincrement().primaryKey(),
  /** 소유자 사용자 ID */
  userId: int("userId").notNull(),
  /** 자산 유형 */
  type: mysqlEnum("type", [
    "real_estate",   // 부동산
    "bank",          // 예금·적금
    "stock",         // 주식·펀드
    "insurance",     // 보험
    "crypto",        // 가상자산
    "vehicle",       // 차량
    "business",      // 사업체·지분
    "pension",       // 연금
    "artwork",       // 예술품·귀금속
    "other",         // 기타
  ]).notNull(),
  /** 자산명 (예: 서울 강남구 아파트, 국민은행 통장) */
  name: varchar("name", { length: 256 }).notNull(),
  /** 자산 설명 */
  description: text("description"),
  /** 예상 가치 (원화, 원 단위) */
  estimatedValue: bigint("estimatedValue", { mode: "number" }),
  /** 통화 코드 */
  currency: varchar("currency", { length: 8 }).default("KRW"),
  /** 국가 코드 (글로벌 자산) */
  country: varchar("country", { length: 8 }).default("KR"),
  /** 세부 정보 JSON (주소, 계좌번호 마스킹, 증권사 등) */
  details: text("details"),
  /** 표시 순서 */
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * 상속자 테이블
 * 유언장에 등록할 상속자 정보 사전 등록
 */
export const heirs = mysqlTable("heirs", {
  id: int("id").autoincrement().primaryKey(),
  /** 유언자 사용자 ID */
  userId: int("userId").notNull(),
  /** 상속자 이름 (한국어) */
  nameKo: varchar("nameKo", { length: 64 }).notNull(),
  /** 상속자 이름 (영문) */
  nameEn: varchar("nameEn", { length: 64 }),
  /** 관계 */
  relationship: mysqlEnum("relationship", [
    "spouse",    // 배우자
    "child",     // 자녀
    "parent",    // 부모
    "sibling",   // 형제자매
    "grandchild",// 손자녀
    "other",     // 기타
  ]).notNull(),
  /** 생년월일 */
  birthDate: varchar("birthDate", { length: 16 }),
  /** 휴대폰 번호 (+국가코드) */
  phone: varchar("phone", { length: 32 }),
  /** 이메일 */
  email: varchar("email", { length: 320 }),
  /** 거주 국가 */
  country: varchar("country", { length: 8 }).default("KR"),
  /** 주소 */
  address: text("address"),
  /** 상속 순위 (1=제1상속자, 2=제2상속자...) */
  priority: int("priority").default(1).notNull(),
  /** 분배 방식: percent=비율, amount=금액 */
  shareType: mysqlEnum("shareType", ["percent", "amount"]).default("percent"),
  /** 상속 지분 (%) - shareType=percent 일 때 */
  sharePercent: int("sharePercent").default(0),
  /** 상속 금액 (원) - shareType=amount 일 때 */
  shareAmount: bigint("shareAmount", { mode: "number" }).default(0),
  /** 제1상속자에게 EverWill 가입 사실 SMS 알림 동의 (0=미동의, 1=동의) */
  smsConsent: int("smsConsent").default(0),
  /** SMS 알림 발송 여부 (0=미발송, 1=발송완료) */
  smsSent: int("smsSent").default(0),
  /** 집행자 여부 (0=일반상속인, 1=집행자) */
  isExecutor: int("isExecutor").default(0).notNull(),
  /** 접근 권한 (own_only=자기 몫만, full=전체 열람) */
  accessLevel: mysqlEnum("accessLevel", ["own_only", "full"]).default("own_only").notNull(),
  /** 상속인 가입 요금 결제 여부 (0=미결제, 1=결제완료) */
  heirPaid: int("heirPaid").default(0).notNull(),
  /** 상속인 가입 요금 (원) */
  heirFee: int("heirFee").default(0).notNull(),
  /** KakaoTalk ID */
  kakaoId: varchar("kakaoId", { length: 128 }),
  /** LINE ID */
  lineId: varchar("lineId", { length: 128 }),
  /** WhatsApp 번호 (+국가코드 포함) */
  whatsappId: varchar("whatsappId", { length: 64 }),
  /** WeChat ID */
  wechatId: varchar("wechatId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Heir = typeof heirs.$inferSelect;
export type InsertHeir = typeof heirs.$inferInsert;

/**
 * 상속인 초대 테이블
 * 사망 감지 후 상속인에게 발송되는 초대 토큰 관리
 */
export const heirInvitations = mysqlTable("heirInvitations", {
  id: int("id").autoincrement().primaryKey(),
  /** 유언 ID */
  willId: int("willId").notNull(),
  /** 상속인 ID (heirs 테이블 참조) */
  heirId: int("heirId").notNull(),
  /** 유언자 사용자 ID */
  userId: int("userId").notNull(),
  /** 초대 토큰 (UUID) */
  token: varchar("token", { length: 128 }).notNull().unique(),
  /** 초대 이메일 발송 여부 */
  emailSent: int("emailSent").default(0).notNull(),
  /** 초대 SMS 발송 여부 */
  smsSent: int("smsSent").default(0).notNull(),
  /** 초대 수락 여부 */
  accepted: int("accepted").default(0).notNull(),
  /** 초대 수락 일시 */
  acceptedAt: timestamp("acceptedAt"),
  /** 상속인 가입 완료 여부 */
  registered: int("registered").default(0).notNull(),
  /** 토큰 만료일 (발송 후 30일) */
  expiresAt: timestamp("expiresAt").notNull(),
  /** 활성화 여부 (사망 감지 후 true) */
  isActive: int("isActive").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HeirInvitation = typeof heirInvitations.$inferSelect;
export type InsertHeirInvitation = typeof heirInvitations.$inferInsert;

/**
 * 이메일 OTP 테이블
 * 이메일 인증코드 임시 저장 (만료 10분)
 */
export const emailOtps = mysqlTable("emailOtps", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 8 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  used: int("used").default(0).notNull(),
  /** OTP 인증 실패 횟수 (5회 초과 시 잠금) */
  failCount: int("failCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailOtp = typeof emailOtps.$inferSelect;

/**
 * 사이트 통계 테이블
 * 인증회원 수 등 관리자가 수동 조정 가능한 카운터
 */
export const siteStats = mysqlTable("siteStats", {
  id: int("id").autoincrement().primaryKey(),
  /** 통계 키 (예: certified_members) */
  key: varchar("key", { length: 64 }).notNull().unique(),
  /** 통계 값 */
  value: bigint("value", { mode: "number" }).default(0).notNull(),
  /** 설명 */
  label: varchar("label", { length: 128 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteStat = typeof siteStats.$inferSelect;

/**
 * 자산 인증 테이블
 * 2단계 자산 인증: 신분증·얼굴사진·자산서류 업로드 + 본인확인 동의 + 전자서명
 */
export const assetVerifications = mysqlTable("assetVerifications", {
  id: int("id").autoincrement().primaryKey(),
  /** 신청자 사용자 ID */
  userId: int("userId").notNull().unique(),
  /** 인증 상태 */
  status: mysqlEnum("status", [
    "pending",    // 서류 업로드 중
    "submitted",  // 검토 요청 완료
    "reviewing",  // 관리자 검토 중
    "approved",   // 인증 승인
    "rejected",   // 반려 (재신청 필요)
  ]).default("pending").notNull(),
  /** 신분증 사진 S3 키 */
  idPhotoKey: varchar("idPhotoKey", { length: 512 }),
  /** 신분증 사진 URL */
  idPhotoUrl: text("idPhotoUrl"),
  /** 얼굴(셀피) 사진 S3 키 */
  selfieKey: varchar("selfieKey", { length: 512 }),
  /** 얼굴(셀피) 사진 URL */
  selfieUrl: text("selfieUrl"),
  /** 본인 확인 동의 시각 */
  consentAt: timestamp("consentAt"),
  /** 전자 서명 이미지 S3 키 */
  signatureKey: varchar("signatureKey", { length: 512 }),
  /** 전자 서명 이미지 URL */
  signatureUrl: text("signatureUrl"),
  /** 검토 완료 시각 */
  reviewedAt: timestamp("reviewedAt"),
  /** 검토 메모 (관리자용) */
  reviewNote: text("reviewNote"),
  /** 검토한 관리자 ID */
  reviewedBy: int("reviewedBy"),
  /** 검토 요청 시각 */
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AssetVerification = typeof assetVerifications.$inferSelect;
export type InsertAssetVerification = typeof assetVerifications.$inferInsert;

/**
 * 자산 인증 서류 테이블
 * 부동산 등기부등본, 통장 잔액 사본 등 자산별 서류
 */
export const assetDocuments = mysqlTable("assetDocuments", {
  id: int("id").autoincrement().primaryKey(),
  /** 자산 인증 ID */
  verificationId: int("verificationId").notNull(),
  /** 서류 유형 */
  type: mysqlEnum("type", [
    "real_estate_registry",  // 부동산 등기부등본
    "bank_statement",        // 통장 잔액 사본
    "asset_list",            // 자산내역서
    "insurance_policy",      // 보험증권
    "stock_statement",       // 주식 잔고 증명
    "other",                 // 기타
  ]).notNull(),
  /** 서류 라벨 (사용자 입력 설명) */
  label: varchar("label", { length: 256 }),
  /** S3 파일 키 */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** 파일 URL */
  fileUrl: text("fileUrl").notNull(),
  /** 파일 원본 이름 */
  fileName: varchar("fileName", { length: 256 }),
  /** 파일 MIME 타입 */
  mimeType: varchar("mimeType", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AssetDocument = typeof assetDocuments.$inferSelect;
export type InsertAssetDocument = typeof assetDocuments.$inferInsert;

/**
 * 포인트 내역 테이블
 * 추천인 적립, 사용, 만료 등 포인트 변동 이력
 */
export const pointHistory = mysqlTable("pointHistory", {
  id: int("id").autoincrement().primaryKey(),
  /** 포인트 소유자 사용자 ID */
  userId: int("userId").notNull(),
  /** 포인트 유형 */
  type: mysqlEnum("type", [
    "referral_reward",  // 추천인 보상 (추천한 사람에게 지급)
    "referral_bonus",   // 피추천인 가입 보너스
    "use",              // 포인트 사용
    "expire",           // 포인트 만료
    "admin",            // 관리자 수동 지급
  ]).notNull(),
  /** 포인트 변동량 (양수=적립, 음수=차감) */
  amount: int("amount").notNull(),
  /** 변동 후 잔액 */
  balanceAfter: int("balanceAfter").notNull(),
  /** 설명 (예: '홍길동 님 추천 보상') */
  description: varchar("description", { length: 256 }),
  /** 관련 사용자 ID (추천인 적립 시 피추천인 ID) */
  relatedUserId: int("relatedUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PointHistory = typeof pointHistory.$inferSelect;
export type InsertPointHistory = typeof pointHistory.$inferInsert;

/**
 * 유서(유서장) 테이블
 * 사용자가 작성한 유서 저장
 */
export const farewellLetters = mysqlTable("farewellLetters", {
  id: int("id").autoincrement().primaryKey(),
  /** 작성자 사용자 ID */
  userId: int("userId").notNull(),
  /** 유서 제목 */
  title: varchar("title", { length: 256 }),
  /** 1단계: 사랑하는 사람들에게 */
  step1Content: text("step1Content"),
  /** 2단계: 내 삶을 지니며 */
  step2Content: text("step2Content"),
  /** 3단계: 내가 사랑한 순간들 */
  step3Content: text("step3Content"),
  /** 4단계: 바라는 것들 */
  step4Content: text("step4Content"),
  /** 5단계: 마지막 인사 */
  step5Content: text("step5Content"),
  /** 수신자 모드: all=전체 공개, specific=개별 지정 */
  recipientMode: mysqlEnum("recipientMode", ["all", "specific"]).default("all").notNull(),
  /** 유서 상태 */
  status: mysqlEnum("status", ["draft", "paid", "locked"]).default("draft").notNull(),
  /** 결제 여부 (9900원 최초 작성료) */
  isPaid: tinyint("isPaid").default(0).notNull(),
  /** 수정 횟수 (수정마다 4900원) */
  editCount: int("editCount").default(0).notNull(),
  /** 유서 잠김 여부 (결제 전 수정 불가) */
  isLocked: tinyint("isLocked").default(0).notNull(),
  /** Stripe 결제 세션 ID */
  stripeSessionId: varchar("stripeSessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FarewellLetter = typeof farewellLetters.$inferSelect;
export type InsertFarewellLetter = typeof farewellLetters.$inferInsert;

/**
 * 유서 수신자 테이블
 * 유서별 수신자 정보 저장
 */
export const farewellRecipients = mysqlTable("farewellRecipients", {
  id: int("id").autoincrement().primaryKey(),
  /** 유서 ID */
  letterId: int("letterId").notNull(),
  /** 수신자 이름 */
  name: varchar("name", { length: 64 }).notNull(),
  /** 관계 */
  relationship: varchar("relationship", { length: 32 }),
  /** 휴대폰 (+국가코드 포함) */
  phone: varchar("phone", { length: 32 }),
  /** 이메일 */
  email: varchar("email", { length: 320 }),
  /** 주소 (우편 발송용) */
  address: text("address"),
  /** 열람 결제 여부 (6900원) */
  viewPaid: tinyint("viewPaid").default(0).notNull(),
  /** 열람 Stripe 세션 ID */
  viewStripeSessionId: varchar("viewStripeSessionId", { length: 128 }),
  /** 우편 발송 신청 여부 (19900원) */
  mailPaid: tinyint("mailPaid").default(0).notNull(),
  /** 우편 Stripe 세션 ID */
  mailStripeSessionId: varchar("mailStripeSessionId", { length: 128 }),
  /** 열람 시각 */
  viewedAt: timestamp("viewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FarewellRecipient = typeof farewellRecipients.$inferSelect;
export type InsertFarewellRecipient = typeof farewellRecipients.$inferInsert;

/**
 * 유서 첨부파일 테이블
 * 유서에 쳊부된 사진 및 파일
 */
export const farewellAttachments = mysqlTable("farewellAttachments", {
  id: int("id").autoincrement().primaryKey(),
  /** 유서 ID */
  letterId: int("letterId").notNull(),
  /** 업로더 사용자 ID */
  userId: int("userId").notNull(),
  /** 파일 원래 이름 */
  originalName: varchar("originalName", { length: 256 }).notNull(),
  /** S3 저장 키 */
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  /** 파일 URL */
  fileUrl: text("fileUrl").notNull(),
  /** MIME 타입 */
  mimeType: varchar("mimeType", { length: 128 }),
  /** 파일 크기 (bytes) */
  fileSize: bigint("fileSize", { mode: "number" }),
  /** 파일 유형: image | document | other */
  fileType: mysqlEnum("fileType", ["image", "document", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FarewellAttachment = typeof farewellAttachments.$inferSelect;
export type InsertFarewellAttachment = typeof farewellAttachments.$inferInsert;

/**
 * 1:1 문의 테이블
 * 사용자가 접수한 문의 및 관리자 답변
 */
export const inquiries = mysqlTable("inquiries", {
  id: int("id").autoincrement().primaryKey(),
  /** 문의자 사용자 ID (비로그인 시 null) */
  userId: int("userId"),
  /** 문의자 이름 */
  name: varchar("name", { length: 100 }).notNull(),
  /** 문의자 이메일 */
  email: varchar("email", { length: 320 }).notNull(),
  /** 문의 유형 */
  category: mysqlEnum("category", ["general", "service", "payment", "badge", "lawyer", "other"]).default("general").notNull(),
  /** 문의 제목 */
  subject: varchar("subject", { length: 200 }).notNull(),
  /** 문의 내용 */
  content: text("content").notNull(),
  /** 처리 상태 */
  status: mysqlEnum("status", ["pending", "answered", "closed"]).default("pending").notNull(),
  /** 관리자 답변 내용 */
  reply: text("reply"),
  /** 답변 일시 */
  repliedAt: timestamp("repliedAt"),
  /** 답변한 관리자 ID */
  repliedBy: int("repliedBy"),
  /** 만족도 평가 점수 (1~5, null=미평가) */
  satisfaction: int("satisfaction"),
  /** 만족도 평가용 일회성 토큰 (SHA-256 해시) */
  satisfactionToken: varchar("satisfactionToken", { length: 64 }),
  /** 만족도 평가 일시 */
  satisfactionAt: timestamp("satisfactionAt"),
  /** 우수 답변 핀 고정 여부 (관리자 수동 설정) */
  isFeatured: int("isFeatured").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;

/**
 * 회원가입 이탈 추적 이벤트 테이블
 * 회원가입 퍼널 각 단계의 진입/이탈 이벤트를 기록
 */
export const signupEvents = mysqlTable("signup_events", {
  id: int("id").autoincrement().primaryKey(),
  /** 세션 식별자 (브라우저 세션별 UUID, 비로그인 추적용) */
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  /** 이벤트 유형: enter(단계 진입) | leave(단계 이탈) | complete(완료) */
  event: mysqlEnum("event", ["enter", "leave", "complete"]).notNull(),
  /**
   * 회원가입 단계:
   * step1=이메일 입력, step2=OTP 인증, step3=프로필 입력(이름/전화번호/생년월일),
   * step4=국가별 추가정보, step5=약관동의, complete=가입완료
   */
  step: mysqlEnum("step", ["step1", "step2", "step3", "step4", "step5", "complete"]).notNull(),
  /** 이메일 (입력된 경우, 개인정보 보호를 위해 마스킹 저장) */
  emailMasked: varchar("emailMasked", { length: 320 }),
  /** 선택한 국가 코드 */
  country: varchar("country", { length: 8 }),
  /** 기기 유형: mobile | tablet | desktop */
  device: mysqlEnum("device", ["mobile", "tablet", "desktop"]).default("desktop"),
  /** 브라우저 언어 */
  lang: varchar("lang", { length: 16 }),
  /** 체류 시간 (해당 단계에서 머문 시간, 초 단위) */
  durationSec: int("durationSec"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SignupEvent = typeof signupEvents.$inferSelect;
export type InsertSignupEvent = typeof signupEvents.$inferInsert;

// ─── 글로벌 뉴스 게시판 ───────────────────────────────────────────────────────
export const newsPosts = mysqlTable("newsPosts", {
  id: int("id").autoincrement().primaryKey(),
  /** 뉴스 제목 */
  title: text("title").notNull(),
  /** 뉴스 원문 URL */
  url: varchar("url", { length: 2048 }).notNull(),
  /** 신문사명 (예: 조선일보, Bloomberg) */
  outlet: varchar("outlet", { length: 128 }).notNull(),
  /** 국가명 (예: 한국, 미국) */
  country: varchar("country", { length: 64 }).notNull(),
  /** 국기 이모지 (예: 🇰🇷) */
  flag: varchar("flag", { length: 8 }).notNull(),
  /** 짧은 요약 (선택) */
  summary: text("summary"),
  /** 카테고리 태그 (예: 상속, 유언, 부동산) */
  tag: varchar("tag", { length: 64 }),
  /** 공개 여부 (1=공개, 0=비공개) */
  isActive: tinyint("isActive").default(1).notNull(),
  /** 등록한 관리자 ID */
  createdBy: int("createdBy"),
  /** 뉴스 발행일 */
  publishedAt: varchar("publishedAt", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type NewsPost = typeof newsPosts.$inferSelect;
export type InsertNewsPost = typeof newsPosts.$inferInsert;

/**
 * 사회기부 유언 테이블
 * 유언자가 사망 후 특정 분야/단체에 기부 의사를 남기는 테이블
 * 기부 단체는 EverWill이 분야별로 선정하여 전달
 */
export const charityDonations = mysqlTable("charityDonations", {
  id: int("id").autoincrement().primaryKey(),
  /** 유언자 사용자 ID */
  userId: int("userId").notNull(),
  /**
   * 기부 분야 카테고리
   * education=교육, children=아동·청소년, elderly=노인복지,
   * disabled=장애인, medical=의료·보건, environment=환경·기후,
   * culture=문화·예술, science=과학·기술, animal=동물복지,
   * disaster=재난·긴급구호, religion=종교·사회봉사, other=기타
   */
  category: mysqlEnum("category", [
    "education",    // 교육
    "children",     // 아동·청소년
    "elderly",      // 노인복지
    "disabled",     // 장애인
    "medical",      // 의료·보건
    "environment",  // 환경·기후
    "culture",      // 문화·예술
    "science",      // 과학·기술
    "animal",       // 동물복지
    "disaster",     // 재난·긴급구호
    "religion",     // 종교·사회봉사
    "other",        // 기타 (단체명 직접 입력)
  ]).notNull(),
  /** 단체 지정 여부 (false=EverWill이 선정, true=직접 지정) */
  hasSpecificOrg: tinyint("hasSpecificOrg").default(0),
  /** 지정 단체명 (직접 지정 시) */
  customOrgName: varchar("customOrgName", { length: 128 }),
  /** 지정 단체 주소 */
  orgAddress: varchar("orgAddress", { length: 256 }),
  /** 지정 단체 연락처 */
  orgPhone: varchar("orgPhone", { length: 64 }),
  /** 기부 금액 (원) */
  amount: bigint("amount", { mode: "number" }).notNull().default(0),
  /** 메모 (선택) */
  memo: text("memo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CharityDonation = typeof charityDonations.$inferSelect;
export type InsertCharityDonation = typeof charityDonations.$inferInsert;

/**
 * 유언장 자산증명서 스캔 테이블 (AI OCR 결과 저장)
 * 회원이 유언장 작성 시 업로드한 자산증명서 이미지와 AI OCR 인식 결과를 저장
 * 부동산 등기부등본 여러 장, 은행잔액증명서, 주식보유증명서 등 무제한 등록 가능
 * verificationId 없이 userId 직접 참조 (독립 테이블)
 */
export const willAssetScans = mysqlTable("willAssetScans", {
  id: int("id").autoincrement().primaryKey(),
  /** 소유자 사용자 ID */
  userId: int("userId").notNull(),
  /** 서류 유형 (사용자 선택) */
  docType: mysqlEnum("docType", [
    "bank_balance",          // 은행 잔액증명서
    "real_estate_registry",  // 부동산 등기부등본
    "stock_certificate",     // 주식보유증명서
    "insurance_policy",      // 보험증권
    "bond_certificate",      // 채권증명서
    "pension_statement",     // 연금 수급 확인서
    "vehicle_registration",  // 자동차 등록증
    "business_registration", // 사업자등록증 (사업체 자산)
    "loan_statement",        // 대출 잔액 확인서 (부채)
    "other",                 // 기타 자산 서류
  ]).notNull().default("other"),
  /** AI가 인식한 서류 유형 레이블 (한국어) */
  docTypeLabel: varchar("docTypeLabel", { length: 64 }),
  /** 발급 기관 (은행명, 법원, 증권사 등) */
  issuer: varchar("issuer", { length: 128 }),
  /** 소유자명 (AI 인식) */
  ownerName: varchar("ownerName", { length: 64 }),
  /** 자산명 (부동산 주소, 주식 종목명, 예금 계좌명 등) */
  assetName: varchar("assetName", { length: 256 }),
  /** 자산 코드 (계좌번호, 종목코드, 등기번호 등) */
  assetCode: varchar("assetCode", { length: 128 }),
  /** 금액/수량 (숫자만) */
  amount: varchar("amount", { length: 64 }),
  /** 단위 (원, 주, m² 등) */
  unit: varchar("unit", { length: 32 }),
  /** 기준일 (증명서 발급일 또는 기준일) */
  referenceDate: varchar("referenceDate", { length: 32 }),
  /** 소재지/주소 (부동산 등) */
  location: text("location"),
  /** 면적 (부동산 등) */
  area: varchar("area", { length: 64 }),
  /** 수익자/피보험자 (보험 등) */
  beneficiary: varchar("beneficiary", { length: 128 }),
  /** 추가 정보 (AI가 인식한 기타 중요 정보) */
  additionalInfo: text("additionalInfo"),
  /** AI 인식 신뢰도 (high/medium/low) */
  confidence: varchar("confidence", { length: 16 }).default("medium"),
  /** S3 저장 키 (원본 이미지) */
  imageKey: varchar("imageKey", { length: 512 }),
  /** S3 이미지 URL */
  imageUrl: varchar("imageUrl", { length: 1024 }),
  /** 사용자가 직접 입력한 메모 */
  userMemo: text("userMemo"),
  /** 자산 추정 가치 (사용자 입력 또는 AI 추정, 원) */
  estimatedValue: bigint("estimatedValue", { mode: "number" }),
  /** 처리 상태 (pending=처리중, done=완료, error=오류) */
  status: mysqlEnum("status", ["pending", "done", "error"]).default("pending"),
  /** 표시 순서 (사용자가 드래그로 재정렬 가능) */
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type WillAssetScan = typeof willAssetScans.$inferSelect;
export type InsertWillAssetScan = typeof willAssetScans.$inferInsert;

/**
 * 유언장 수정 유료 결제 내역 테이블
 * 무료 수정 횟수 초과 시 ₩5,000 결제 기록
 */
export const willRevisionPayments = mysqlTable("willRevisionPayments", {
  id: int("id").autoincrement().primaryKey(),
  /** 유언장 ID */
  willId: int("willId").notNull(),
  /** 결제한 사용자 ID */
  userId: int("userId").notNull(),
  /** Stripe Session ID */
  stripeSessionId: varchar("stripeSessionId", { length: 128 }).unique(),
  /** 결제 금액 (원화) */
  amount: int("amount").default(5000).notNull(),
  /** 결제 상태 */
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WillRevisionPayment = typeof willRevisionPayments.$inferSelect;
export type InsertWillRevisionPayment = typeof willRevisionPayments.$inferInsert;

/**
 * 사이트 설정 테이블 (소셜 링크, 공지사항 등)
 * key-value 방식으로 저장하여 확장성 확보
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  /** 설정 키 (예: youtube_url, instagram_url, kakao_url, line_url) */
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  /** 설정 값 */
  settingValue: text("settingValue"),
  /** 설명 */
  description: varchar("description", { length: 255 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

/**
 * 인물 앨범 테이블
 * 유언자 본인 및 가족 사진 등록 → AI 일기 그림 생성 시 참조
 */
export const personProfiles = mysqlTable("personProfiles", {
  id: int("id").autoincrement().primaryKey(),
  /** 소유자 사용자 ID */
  userId: int("userId").notNull(),
  /** 인물 이름 */
  name: varchar("name", { length: 64 }).notNull(),
  /** 관계 (self=본인, spouse=배우자, son=아들, daughter=딸, etc.) */
  relationship: varchar("relationship", { length: 32 }).default("self").notNull(),
  /** 대표 사진 S3 키 */
  photoKey: varchar("photoKey", { length: 512 }),
  /** 대표 사진 URL */
  photoUrl: text("photoUrl"),
  /** GPT-4 Vision으로 추출한 얼굴 특징 프롬프트 (캐시) */
  facePrompt: text("facePrompt"),
  /** 활성 여부 */
  isActive: tinyint("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PersonProfile = typeof personProfiles.$inferSelect;
export type InsertPersonProfile = typeof personProfiles.$inferInsert;

/**
 * AI 일기 테이블
 * 유언자가 AI와 대화 후 생성된 일기 저장
 */
export const lifeJournals = mysqlTable("lifeJournals", {
  id: int("id").autoincrement().primaryKey(),
  /** 작성자 사용자 ID */
  userId: int("userId").notNull(),
  /** 일기 날짜 (YYYY-MM-DD) */
  journalDate: varchar("journalDate", { length: 16 }).notNull(),
  /** AI와 나눈 대화 원문 JSON */
  conversationJson: text("conversationJson"),
  /** AI가 생성한 일기 텍스트 */
  diaryText: text("diaryText"),
  /** AI가 생성한 그림 S3 키 */
  imageKey: varchar("imageKey", { length: 512 }),
  /** AI가 생성한 그림 URL */
  imageUrl: text("imageUrl"),
  /** 그림 스타일 (watercolor/illustration/oil_painting) */
  imageStyle: varchar("imageStyle", { length: 32 }).default("watercolor"),
  /** 감정 태그 (쉼표 구분) */
  emotionTags: varchar("emotionTags", { length: 256 }),
  /** 공개 여부 (0=비공개, 1=가족공개) */
  isShared: tinyint("isShared").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LifeJournal = typeof lifeJournals.$inferSelect;
export type InsertLifeJournal = typeof lifeJournals.$inferInsert;

/**
 * 소중한 사람에게 남기는 편지 테이블
 * 유언자가 작성 → 사후 또는 특정 조건 충족 시 수신자에게 공개
 */
export const legacyLetters = mysqlTable("legacyLetters", {
  id: int("id").autoincrement().primaryKey(),
  /** 작성자 사용자 ID */
  userId: int("userId").notNull(),
  /** 수신자 이름 */
  recipientName: varchar("recipientName", { length: 64 }).notNull(),
  /** 수신자 관계 */
  recipientRelationship: varchar("recipientRelationship", { length: 32 }),
  /** 수신자 이메일 */
  recipientEmail: varchar("recipientEmail", { length: 320 }),
  /** 수신자 전화번호 */
  recipientPhone: varchar("recipientPhone", { length: 32 }),
  /** 편지 제목 */
  title: varchar("title", { length: 256 }),
  /** 편지 본문 */
  content: text("content"),
  /** 공개 조건 (after_death=사후즉시, specific_date=특정날짜, event=이벤트) */
  releaseCondition: mysqlEnum("releaseCondition", ["after_death", "specific_date", "event"]).default("after_death").notNull(),
  /** 공개 예정 날짜 (specific_date 조건 시) */
  releaseDate: timestamp("releaseDate"),
  /** 공개 이벤트 설명 (event 조건 시, 예: '아들 결혼식 날') */
  releaseEventDesc: varchar("releaseEventDesc", { length: 256 }),
  /** 편지 상태 (draft=작성중, locked=잠금완료, released=공개됨) */
  status: mysqlEnum("status", ["draft", "locked", "released"]).default("draft").notNull(),
  /** 공개된 시각 */
  releasedAt: timestamp("releasedAt"),
  /** 수신자가 열람한 시각 */
  viewedAt: timestamp("viewedAt"),
  /** 첨부 이미지 S3 키 */
  attachmentKey: varchar("attachmentKey", { length: 512 }),
  /** 첨부 이미지 URL */
  attachmentUrl: text("attachmentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LegacyLetter = typeof legacyLetters.$inferSelect;
export type InsertLegacyLetter = typeof legacyLetters.$inferInsert;

/**
 * 나의 자서전 테이블
 * 사용자가 AI와 대화하며 작성하는 자서전
 */
export const autobiographies = mysqlTable("autobiographies", {
  id: int("id").autoincrement().primaryKey(),
  /** 작성자 사용자 ID */
  userId: int("userId").notNull(),
  /** 자서전 제목 */
  title: varchar("title", { length: 256 }).default("나의 자서전"),
  /** 전체 상태 (draft=작성중, completed=완성, published=공개) */
  status: mysqlEnum("status", ["draft", "completed", "published"]).default("draft").notNull(),
  /** 완성된 챕터 수 (0~6) */
  completedChapters: int("completedChapters").default(0).notNull(),
  /** PDF S3 키 */
  pdfKey: varchar("pdfKey", { length: 512 }),
  /** PDF URL */
  pdfUrl: text("pdfUrl"),
  /** 공유 링크 토큰 (가족 공유용) */
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  /** 공유 여부 */
  isShared: tinyint("isShared").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Autobiography = typeof autobiographies.$inferSelect;
export type InsertAutobiography = typeof autobiographies.$inferInsert;

/**
 * 자서전 챕터 테이블
 * 각 챕터별 AI 대화 내용 및 생성된 글 저장
 */
export const autobiographyChapters = mysqlTable("autobiographyChapters", {
  id: int("id").autoincrement().primaryKey(),
  /** 자서전 ID */
  autobiographyId: int("autobiographyId").notNull(),
  /** 챕터 번호 (1~6) */
  chapterNumber: int("chapterNumber").notNull(),
  /** 챕터 제목 */
  chapterTitle: varchar("chapterTitle", { length: 128 }),
  /** AI와 나눈 대화 JSON (messages 배열) */
  conversationJson: text("conversationJson"),
  /** AI가 생성한 챕터 글 (에세이 형태) */
  generatedText: text("generatedText"),
  /** 업로드된 사진 S3 키 (콤마 구분) */
  photoKeys: text("photoKeys"),
  /** AI가 변환한 그림 URL (콤마 구분) */
  artworkUrls: text("artworkUrls"),
  /** 챕터 완성 여부 */
  isCompleted: tinyint("isCompleted").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AutobiographyChapter = typeof autobiographyChapters.$inferSelect;
export type InsertAutobiographyChapter = typeof autobiographyChapters.$inferInsert;

/**
 * 챗봇 세션 테이블
 * 회원의 AI 상담 세션 관리
 */
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  /** 회원 ID (null이면 비회원 세션) */
  userId: int("userId"),
  /** 세션 고유 식별자 (UUID) */
  sessionKey: varchar("sessionKey", { length: 64 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * 챗봇 메시지 테이블
 * 회원 전담 AI 대화 히스토리 저장
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  /** 세션 ID */
  sessionId: int("sessionId").notNull(),
  /** 회원 ID */
  userId: int("userId").notNull(),
  /** 메시지 역할 (user / assistant) */
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  /** 메시지 내용 */
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─────────────────────────────────────────────
// 사전의료의향서 / 장기기증 동의서
// ─────────────────────────────────────────────
export const medicalDirectives = mysqlTable("medicalDirectives", {
  id: int("id").autoincrement().primaryKey(),
  /** 회원 ID */
  userId: int("userId").notNull(),
  /** 유형: advance=사전연명의료의향서, organ=장기기증 */
  type: mysqlEnum("type", ["advance", "organ"]).notNull(),
  /** 선택된 항목 JSON (체크박스 상태) */
  selections: text("selections").notNull(), // JSON string
  /** 저장 일시 */
  savedAt: timestamp("savedAt").defaultNow().notNull(),
  /** 마지막 수정 일시 */
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MedicalDirective = typeof medicalDirectives.$inferSelect;
export type InsertMedicalDirective = typeof medicalDirectives.$inferInsert;

// ─────────────────────────────────────────────
// 유언인증서 발급 내역
// ─────────────────────────────────────────────
export const willCertificates = mysqlTable("willCertificates", {
  id: int("id").autoincrement().primaryKey(),
  /** 회원 ID */
  userId: int("userId").notNull(),
  /** 유언장 ID */
  willId: int("willId").notNull(),
  /** 인증 날짜 (유언 인증 기준일) */
  certDate: varchar("certDate", { length: 20 }).notNull(),
  /** 발급 목적 */
  purpose: varchar("purpose", { length: 200 }).notNull(),
  /** 상태: pending=처리중, issued=발급완료, rejected=거부 */
  status: mysqlEnum("status", ["pending", "issued", "rejected"]).default("pending").notNull(),
  /** 발급 번호 (issued 상태일 때 생성) */
  issueNumber: varchar("issueNumber", { length: 50 }),
  /** 결제 ID */
  paymentId: varchar("paymentId", { length: 100 }),
  /** 신청 일시 */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** 처리 일시 */
  processedAt: timestamp("processedAt"),
});

export type WillCertificate = typeof willCertificates.$inferSelect;
export type InsertWillCertificate = typeof willCertificates.$inferInsert;

// ─────────────────────────────────────────────
// 영상 유언장
// ─────────────────────────────────────────────
export const videoWills = mysqlTable("videoWills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 1000 }).notNull(),
  mimeType: varchar("mimeType", { length: 50 }).notNull().default("video/webm"),
  videoType: mysqlEnum("videoType", ["legal", "emotional", "future"]).notNull().default("legal"),
  blockchainHash: varchar("blockchainHash", { length: 100 }).notNull(),
  recipient: varchar("recipient", { length: 200 }),
  deliveryDate: varchar("deliveryDate", { length: 20 }),
  memo: text("memo"),
  status: mysqlEnum("status", ["active", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type VideoWill = typeof videoWills.$inferSelect;
export type InsertVideoWill = typeof videoWills.$inferInsert;

// ===== 개인 AI 메모리 시스템 =====
// 사용자별 완전 격리된 AI 메모리 - 자서전/일기/편지 작성 시 참조

export const aiMemories = mysqlTable("aiMemories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  category: mysqlEnum("category", [
    "basic_info", "family", "career", "values",
    "life_events", "emotions", "hobbies", "health",
    "wishes", "diary_summary", "letter_summary", "conversation"
  ]).notNull(),
  content: text("content").notNull(),
  importance: int("importance").default(3).notNull(),
  source: mysqlEnum("source", ["manual", "conversation", "diary", "letter", "autobiography"]).default("manual").notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type AiMemory = typeof aiMemories.$inferSelect;
export type InsertAiMemory = typeof aiMemories.$inferInsert;

// AI 대화 세션 (사용자별 독립 대화 기록)
export const aiConversations = mysqlTable("aiConversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  purpose: mysqlEnum("purpose", ["autobiography", "diary", "letter", "free_chat"]).default("free_chat").notNull(),
  title: varchar("title", { length: 200 }),
  messages: text("messages").notNull(),
  extractedMemoryIds: text("extractedMemoryIds"),
  isActive: tinyint("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiConversation = typeof aiConversations.$inferInsert;
