import { and, eq, gt, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { authSessions, InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

type DbClient = ReturnType<typeof postgres>;
type Db = ReturnType<typeof drizzle>;

let _client: DbClient | null = null;
let _db: Db | null = null;
let _dbCheck: Promise<Db | null> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
async function pingDb(client: DbClient) {
  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      client`select 1`,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Database health check timed out")), 3_000);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function ensureDb(): Promise<Db | null> {
  if (!ENV.databaseUrl) return null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (!_client || !_db) {
        _client = postgres(ENV.databaseUrl, {
          ssl: "require",
          prepare: false,
          max: 1,
          connect_timeout: 5,
        });
        _db = drizzle({ client: _client });
      }

      await pingDb(_client);
      return _db;
    } catch (error) {
      console.warn("[Database] Recreating stale connection:", error instanceof Error ? error.message : String(error));
      const client = _client;
      _client = null;
      _db = null;
      await client?.end({ timeout: 1 }).catch(() => {});
    }
  }

  return null;
}

export function getDb() {
  _dbCheck ??= ensureDb().finally(() => {
    _dbCheck = null;
  });
  return _dbCheck;
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
