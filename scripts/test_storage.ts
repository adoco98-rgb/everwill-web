import "dotenv/config";
import { getDb } from "../server/db";
import { storageGetSignedUrl } from "../server/storage";
import { willAssetScans } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) { console.log("DB 없음"); return; }
  const data = await db.select({
    id: willAssetScans.id,
    imageKey: willAssetScans.imageKey,
    imageUrl: willAssetScans.imageUrl,
  }).from(willAssetScans).limit(5);
  console.log("DB rows:", JSON.stringify(data, null, 2));
  
  for (const row of data) {
    if (row.imageKey) {
      try {
        const url = await storageGetSignedUrl(row.imageKey);
        console.log(`\n[id=${row.id}] imageKey: ${row.imageKey}`);
        console.log(`signedUrl: ${url.substring(0, 80)}...`);
        // fetch 테스트
        const res = await fetch(url);
        console.log(`fetch status: ${res.status}, size: ${res.headers.get('content-length')}`);
      } catch(e) {
        console.error(`[id=${row.id}] 오류:`, e instanceof Error ? e.message : e);
      }
    }
  }
  await db.$client.end();
}
main().catch(console.error);
