import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { willAssetScans } from "../drizzle/schema";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL!);
  const db = drizzle(conn);
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
  await conn.end();
}

main().catch(console.error);
