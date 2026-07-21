// DB에서 공증서류/첨부파일/자산스캔 데이터 확인
import { getDb } from '../server/db';
import { notarizationDocs, willAttachments, willAssetScans } from '../drizzle/schema';

async function main() {
  const db = await getDb();
  if (!db) { console.log('DB 연결 실패'); process.exit(1); }
  
  const notDocs = await db.select().from(notarizationDocs).limit(10);
  const willAtts = await db.select().from(willAttachments).limit(10);
  const scans = await db.select().from(willAssetScans).limit(10);
  
  console.log('=== notarizationDocs ===');
  notDocs.forEach(d => console.log(JSON.stringify({
    id: d.id, userId: d.userId, docName: d.docName, 
    fileName: d.fileName, fileKey: d.fileKey, 
    fileType: (d as any).fileType, 
    fileUrl: (d as any).fileUrl?.substring(0, 60)
  })));
  
  console.log('\n=== willAttachments ===');
  willAtts.forEach(d => console.log(JSON.stringify({
    id: d.id, userId: d.userId, fileName: d.fileName, 
    fileType: d.fileType, fileKey: d.fileKey, category: d.category
  })));
  
  console.log('\n=== willAssetScans ===');
  scans.forEach(d => console.log(JSON.stringify({
    id: d.id, userId: d.userId, docType: d.docType, 
    imageKey: d.imageKey, imageUrl: d.imageUrl?.substring(0, 60)
  })));
  
  process.exit(0);
}

main().catch(console.error);
