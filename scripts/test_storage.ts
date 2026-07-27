import { getDb } from "../server/db";
import { storageGetSignedUrl } from "../server/storage";
import { sql } from "drizzle-orm";

async function main() {
  const db = await getDb();
  if (!db) { console.log("DB 없음"); return; }
  const rows = await db.execute(sql`SELECT id, image_key, image_url FROM will_asset_scans LIMIT 5`) as any;
  const data = rows[0] as any[];
  console.log("DB rows:", JSON.stringify(data, null, 2));
  
  for (const row of data) {
    if (row.image_key) {
      try {
        const url = await storageGetSignedUrl(row.image_key);
        console.log(`\n[id=${row.id}] imageKey: ${row.image_key}`);
        console.log(`signedUrl: ${url.substring(0, 80)}...`);
        // fetch 테스트
        const res = await fetch(url);
        console.log(`fetch status: ${res.status}, size: ${res.headers.get('content-length')}`);
      } catch(e) {
        console.error(`[id=${row.id}] 오류:`, e instanceof Error ? e.message : e);
      }
    }
  }
}
main().catch(console.error).finally(() => process.exit(0));
