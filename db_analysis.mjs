import "dotenv/config";
import { writeFileSync } from "node:fs";
import postgres from "postgres";

if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL not found");
}

const sql = postgres(process.env.SUPABASE_DB_URL, {
  ssl: "require",
  prepare: false,
});

try {
  const users = await sql`
    SELECT id, name, email, "loginMethod", "memberGrade", country,
           "profileCompleted", phone, "birthDate", "referralCode", "referredBy",
           "pointBalance", "agreeMarketing", "createdAt", "lastSignedIn"
    FROM users
    ORDER BY "createdAt" DESC
  `;
  const payments = await sql`
    SELECT p.id, p."userId", p."amountTotal", p.currency, p.status, p.items,
           p."createdAt", u.name AS "userName", u.email AS "userEmail"
    FROM payments p
    LEFT JOIN users u ON p."userId" = u.id
    ORDER BY p."createdAt" DESC
  `;
  const wills = await sql`
    SELECT w.id, w."userId", w.status, w.mode, w.title, w."createdAt",
           u.name AS "userName", u.email AS "userEmail"
    FROM wills w
    LEFT JOIN users u ON w."userId" = u.id
    ORDER BY w."createdAt" DESC
  `;
  const [{ count: totalHeirs }] =
    await sql`SELECT COUNT(*)::integer AS count FROM heirs`;
  const assets =
    await sql`SELECT type, COUNT(*)::integer AS count FROM assets GROUP BY type`;
  const inquiries =
    await sql`SELECT status, COUNT(*)::integer AS count FROM inquiries GROUP BY status`;
  const experts =
    await sql`SELECT status, COUNT(*)::integer AS count FROM "expertPartners" GROUP BY status`;
  const loginMethods =
    await sql`SELECT "loginMethod", COUNT(*)::integer AS count FROM users GROUP BY "loginMethod"`;
  const grades =
    await sql`SELECT "memberGrade", COUNT(*)::integer AS count FROM users GROUP BY "memberGrade"`;
  const countries =
    await sql`SELECT country, COUNT(*)::integer AS count FROM users GROUP BY country ORDER BY count DESC`;
  const [{ count: totalReferrals }] =
    await sql`SELECT COUNT(*)::integer AS count FROM users WHERE "referredBy" IS NOT NULL AND "referredBy" <> ''`;
  const [{ count: totalVideoWills }] =
    await sql`SELECT COUNT(*)::integer AS count FROM "videoWills"`;
  const certs =
    await sql`SELECT status, COUNT(*)::integer AS count FROM "willCertificates" GROUP BY status`;
  const [{ count: newLast7Days }] =
    await sql`SELECT COUNT(*)::integer AS count FROM users WHERE "createdAt" >= NOW() - INTERVAL '7 days'`;
  const [{ count: newLast30Days }] =
    await sql`SELECT COUNT(*)::integer AS count FROM users WHERE "createdAt" >= NOW() - INTERVAL '30 days'`;

  const result = {
    summary: {
      totalUsers: users.length,
      newLast7Days,
      newLast30Days,
      totalPayments: payments.length,
      totalRevenue: payments.reduce(
        (sum, payment) => sum + Number(payment.amountTotal ?? 0),
        0
      ),
      totalWills: wills.length,
      totalHeirs,
      totalReferrals,
      totalVideoWills,
      totalCerts: certs.reduce(
        (sum, certificate) => sum + Number(certificate.count),
        0
      ),
    },
    users,
    payments,
    wills,
    assets,
    inquiries,
    experts,
    loginMethods,
    grades,
    countries,
    certs,
  };

  writeFileSync("saram_db_result.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result.summary, null, 2));
} finally {
  await sql.end();
}
