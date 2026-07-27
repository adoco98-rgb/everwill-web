import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { users } from "../drizzle/schema";
import { getDb } from "../server/db";

const db = await getDb();
assert(db, "SUPABASE_DB_URL connection failed");

try {
  const [summary] = await db.execute<{
    tables: number;
    rls_tables: number;
    identities: number;
    migrations: number;
    auth_sessions: boolean;
    otp_code_length: number;
    otp_purpose: boolean;
    charity_columns: number;
    share_percent_scale: number;
    supabase_auth_users: number;
  }>(sql`
    SELECT
      (SELECT COUNT(*)::integer FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tables,
      (SELECT COUNT(*)::integer FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity) AS rls_tables,
      (SELECT COUNT(*)::integer FROM information_schema.columns WHERE table_schema = 'public' AND is_identity = 'YES') AS identities,
      (SELECT COUNT(*)::integer FROM drizzle.__drizzle_migrations) AS migrations,
      to_regclass('public."authSessions"') IS NOT NULL AS auth_sessions,
      (SELECT character_maximum_length::integer FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emailOtps' AND column_name = 'code') AS otp_code_length,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'emailOtps' AND column_name = 'purpose') AS otp_purpose,
      (SELECT COUNT(*)::integer FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'charityDonations' AND column_name IN ('donationType', 'paymentStatus', 'stripeSessionId', 'paidAt', 'publicMessage', 'messagePublic', 'displayName', 'country')) AS charity_columns,
      (SELECT numeric_scale::integer FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'heirs' AND column_name = 'sharePercent') AS share_percent_scale,
      (SELECT COUNT(*)::integer FROM auth.users) AS supabase_auth_users
  `);

  assert.deepEqual(summary, {
    tables: 41,
    rls_tables: 41,
    identities: 40,
    migrations: 4,
    auth_sessions: true,
    otp_code_length: 64,
    otp_purpose: true,
    charity_columns: 8,
    share_percent_scale: 2,
    supabase_auth_users: 0,
  });

  const openId = `migration-check:${randomUUID()}`;
  const rollback = new Error("rollback");

  try {
    await db.transaction(async tx => {
      const [created] = await tx
        .insert(users)
        .values({ openId, name: "before" })
        .returning({ id: users.id });
      assert(created.id > 0);

      await tx
        .insert(users)
        .values({ openId, name: "after" })
        .onConflictDoUpdate({
          target: users.openId,
          set: { name: "after" },
        });

      const [updated] = await tx
        .select({ name: users.name })
        .from(users)
        .where(eq(users.openId, openId));
      assert.equal(updated.name, "after");
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }

  const rolledBack = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.openId, openId));
  assert.equal(rolledBack.length, 0);

  console.log("Supabase migration check passed:", summary);
} finally {
  await db.$client.end();
}
