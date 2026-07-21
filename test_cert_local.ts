// 인증서 PDF 직접 생성 테스트 스크립트
import { generateWillCertificatePDF } from './server/utils/certificatePdfGenerator';
import fs from 'fs';
import path from 'path';

// 실제 업로드된 이미지 파일들 로드
const uploadDir = '/home/ubuntu/upload';
const files = fs.readdirSync(uploadDir).filter(f => 
  f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
).slice(0, 3); // 최대 3개만 테스트

console.log('첨부 파일:', files);

const attachments = files.map((f, i) => ({
  id: `att-${i}`,
  fileName: i === 0 ? '가족관계증명서.png' : i === 1 ? '기본증명서.png' : '자산증명서.png',
  fileType: f.endsWith('.pdf') ? 'application/pdf' : 'image/png',
  fileUrl: '',
  fileBytes: fs.readFileSync(path.join(uploadDir, f)),
  docType: i === 0 ? 'notarization' : 'asset',
  docName: i === 0 ? '가족관계증명서' : i === 1 ? '기본증명서' : '자산증명서',
  category: i === 0 ? 'family_cert' : i === 1 ? 'basic_cert' : 'bank_balance',
  uploadedAt: '2026. 7. 21.',
}));

const certData = {
  certNumber: 'EW-20260721-000160001',
  certifiedAt: new Date('2026-07-21'),
  testatorName: '라수환',
  testatorBirthDate: '1969년 8월 12일',
  testatorAddress: '경기도 안성시 공도읍 중부대로 746번길 20',
  testatorPhone: '010-3857-2004',
  willTitle: '라수환 유언장',
  purpose: '유언장 인증 확인용',
  country: 'KR',
  willText: '본인 라수환은 다음과 같이 유언합니다.\n\n제1조 부동산 상속: 경기도 안성시 소재 부동산 전체를 장남 라민준에게 상속합니다.\n제2조 금융자산: 농협은행 예금 전액을 배우자 김영희에게 상속합니다.\n\n2026년 7월 21일\n유언자: 라수환 (인)',
  assets: [
    { category: '부동산', name: '경기도 안성시 공도읍 중부대로 746번길 20', value: '500,000,000원', heir: '라민준' },
    { category: '금융', name: '농협은행 예금', value: '50,000,000원', heir: '김영희' },
  ],
  heirs: [
    { name: '라민준', relation: '장남', birthDate: '1995년 3월 15일', phone: '010-1234-5678', share: '60%' },
    { name: '김영희', relation: '배우자', birthDate: '1970년 5월 20일', phone: '010-9876-5432', share: '40%' },
  ],
  attachments,
};

async function main() {
  console.log('PDF 생성 시작...');
  const pdfBuffer = await generateWillCertificatePDF(certData as any);
  const outPath = '/home/ubuntu/test_cert3.pdf';
  fs.writeFileSync(outPath, pdfBuffer);
  console.log(`PDF 생성 완료: ${outPath} (${Math.round(pdfBuffer.length / 1024)}KB)`);
}

main().catch(console.error);
