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
