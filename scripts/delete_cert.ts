import { getDb } from "../server/db";
import { willCertificates } from "../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = await getDb();
  await db.delete(willCertificates).where(eq(willCertificates.id, 1));
  console.log("삭제 완료: id=1 (EW-20260714-000160001)");
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
