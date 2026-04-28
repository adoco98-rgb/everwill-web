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
  /** Stripe Checkout Session ID */
  stripeSessionId: varchar("stripeSessionId", { length: 128 }).notNull().unique(),
  /** Stripe Payment Intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
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
  /** 상속 지분 (%) */
  sharePercent: int("sharePercent").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Heir = typeof heirs.$inferSelect;
export type InsertHeir = typeof heirs.$inferInsert;

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
