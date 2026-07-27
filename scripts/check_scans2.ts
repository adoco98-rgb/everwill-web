import "dotenv/config";
import { getDb } from "../server/db";
import { willAssetScans } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) { console.log("DB 없음"); return; }
  const rows = await db.select({
    id: willAssetScans.id,
    docType: willAssetScans.docType,
    docTypeLabel: willAssetScans.docTypeLabel,
    assetName: willAssetScans.assetName,
    imageKey: willAssetScans.imageKey,
    imageUrl: willAssetScans.imageUrl,
  }).from(willAssetScans).limit(10);
  console.log(JSON.stringify(rows, null, 2));
  await db.$client.end();
}
main().catch(console.error);
