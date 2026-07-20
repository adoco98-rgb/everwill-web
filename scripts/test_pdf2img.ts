import { pdf } from 'pdf-to-img';
import fs from 'fs';

async function main() {
  const pdfBytes = fs.readFileSync('/home/ubuntu/upload/EverWill_인증서_EW-20260720-000160001_KR.pdf');
  let pageCount = 0;
  for await (const page of await pdf(pdfBytes, { scale: 1.5 })) {
    pageCount++;
    fs.writeFileSync(`/tmp/test_page_${pageCount}.png`, page);
    console.log(`페이지 ${pageCount} 변환 완료: ${(page as Buffer).length} bytes`);
    if (pageCount >= 2) break;
  }
  console.log('완료, 총', pageCount, '페이지');
}
main().catch(console.error).finally(() => process.exit(0));
