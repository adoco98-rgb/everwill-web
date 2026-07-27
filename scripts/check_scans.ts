import "dotenv/config";
import assert from "node:assert/strict";
import { willAssetScans } from "../drizzle/schema";
import { getDb } from "../server/db";

async function main() {
  const db = await getDb();
  assert(db, "SUPABASE_DB_URL connection failed");
  const rows = await db.select({
    id: willAssetScans.id,
    docType: willAssetScans.docType,
    docTypeLabel: willAssetScans.docTypeLabel,
    imageKey: willAssetScans.imageKey,
    imageUrl: willAssetScans.imageUrl,
    status: willAssetScans.status,
    userId: willAssetScans.userId,
  }).from(willAssetScans);
  console.log(JSON.stringify(rows, null, 2));
  await db.$client.end();
}

main().catch(console.error);
