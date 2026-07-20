import { getDb } from "../server/db";
import { willCertificates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = await getDb();
  const rows = await db.select().from(willCertificates).limit(5);
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
