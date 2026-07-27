import { and, eq, gt, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { authSessions, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

type Db = ReturnType<typeof drizzle>;

let _db: Db | null = null;

// Vercel keeps the pool alive only until its idle connections are closed.
export async function getDb(): Promise<Db | null> {
  if (!ENV.databaseUrl) return null;

  if (!_db) {
    const pool = new Pool({
      connectionString: ENV.databaseUrl,
      ssl: { rejectUnauthorized: false },
      min: 1,
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 5_000,
    });
    if (ENV.isProduction) attachDatabasePool(pool);
    _db = drizzle({ client: pool });
  }

  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createAuthSession(input: {
  id: string;
  userId: number;
  expiresAt: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(authSessions).values(input);
}

export async function isAuthSessionActive(id: string, userId: number) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select({ id: authSessions.id })
    .from(authSessions)
    .where(
      and(
        eq(authSessions.id, id),
        eq(authSessions.userId, userId),
        isNull(authSessions.revokedAt),
        gt(authSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows.length === 1;
}

export async function revokeAuthSession(id: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(authSessions.id, id), isNull(authSessions.revokedAt)));
}

export async function revokeUserSessions(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(authSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(authSessions.userId, userId), isNull(authSessions.revokedAt)));
}

// TODO: add feature queries here as your schema grows.
