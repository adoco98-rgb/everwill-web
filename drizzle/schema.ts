import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

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
