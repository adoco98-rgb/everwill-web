import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  if (!db) { console.log("DB 없음"); return; }
  const rows = await db.execute(sql`SELECT id, will_id, doc_type, doc_type_label, asset_name, image_key, image_url FROM will_asset_scans LIMIT 10`);
  console.log(JSON.stringify(rows[0], null, 2));
}
main().catch(console.error).finally(() => process.exit(0));
