import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema";
import { count } from "drizzle-orm";

async function main() {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool, { schema, mode: "default" });

  // 사용자 전체
  const users = await db.select().from(schema.users).orderBy(schema.users.createdAt);
  console.log("=== USERS ===");
  console.log(JSON.stringify(users.map(u => ({
    id: u.id, name: u.name, email: u.email, loginMethod: u.loginMethod,
    memberGrade: u.memberGrade, country: u.country, profileCompleted: u.profileCompleted,
    phone: u.phone ? '있음' : '없음', referralCode: u.referralCode,
    referredBy: u.referredBy, pointBalance: u.pointBalance,
    agreeMarketing: u.agreeMarketing,
    createdAt: u.createdAt,
    lastSignedIn: u.lastSignedIn
  })), null, 2));

  // 결제
  const payments = await db.select().from(schema.payments);
  console.log("=== PAYMENTS ===");
  console.log(JSON.stringify(payments, null, 2));

  // 유언장
  const wills = await db.select().from(schema.wills);
  console.log("=== WILLS ===");
  console.log(JSON.stringify(wills.map(w => ({
    id: w.id, userId: w.userId, status: w.status, willType: w.willType,
    title: w.title, createdAt: w.createdAt
  })), null, 2));

  // 상속인
  const heirCount = await db.select({ cnt: count() }).from(schema.heirs);
  console.log("=== HEIRS COUNT ===", heirCount[0].cnt);

  // 자산
  const assetCount = await db.select({ cnt: count() }).from(schema.assets);
  console.log("=== ASSETS COUNT ===", assetCount[0].cnt);

  // 문의
  const inquiryCount = await db.select({ cnt: count() }).from(schema.inquiries);
  console.log("=== INQUIRIES COUNT ===", inquiryCount[0].cnt);

  // 로그인 방법별
  const loginMethods = await db.select({ loginMethod: schema.users.loginMethod, cnt: count() })
    .from(schema.users)
    .groupBy(schema.users.loginMethod);
  console.log("=== LOGIN METHODS ===", JSON.stringify(loginMethods));

  // 회원 등급별
  const grades = await db.select({ memberGrade: schema.users.memberGrade, cnt: count() })
    .from(schema.users)
    .groupBy(schema.users.memberGrade);
  console.log("=== MEMBER GRADES ===", JSON.stringify(grades));

  // 국가별
  const countries = await db.select({ country: schema.users.country, cnt: count() })
    .from(schema.users)
    .groupBy(schema.users.country);
  console.log("=== COUNTRIES ===", JSON.stringify(countries));

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
