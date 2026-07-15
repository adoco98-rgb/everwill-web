/**
 * 라수환 명의 샘플 자산 서류 3종 PDF 생성 스크립트
 * - 부동산 등기부등본
 * - 은행 잔액증명서
 * - 주식보유증명서
 * Node.js PDFKit 사용 (OTF 한글 폰트 지원)
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FONTS_DIR = '/home/ubuntu/saram-will/server/fonts';
const FONT_REGULAR = path.join(FONTS_DIR, 'NotoSansCJK-Regular.otf');
const FONT_BOLD    = path.join(FONTS_DIR, 'NotoSansCJK-Bold.otf');
const OUTPUT_DIR   = '/home/ubuntu/sample_docs';

// 출력 폴더 생성
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// 공통 색상
const COLOR_NAVY  = '#1F3864';
const COLOR_GOLD  = '#C9A961';
const COLOR_GRAY  = '#6B7280';
const COLOR_BLACK = '#1A1A1A';
const COLOR_LINE  = '#D1D5DB';

/** 공통 헤더 그리기 */
function drawHeader(doc, title, subtitle, docNo) {
  // 상단 네이비 바
  doc.rect(0, 0, doc.page.width, 80).fill(COLOR_NAVY);

  // 제목
  doc.font(FONT_BOLD).fontSize(20).fillColor('white')
     .text(title, 40, 22, { align: 'center', width: doc.page.width - 80 });

  // 부제목
  doc.font(FONT_REGULAR).fontSize(10).fillColor('#C9A961')
     .text(subtitle, 40, 50, { align: 'center', width: doc.page.width - 80 });

  // 문서번호
  doc.font(FONT_REGULAR).fontSize(8).fillColor(COLOR_GRAY)
     .text(`문서번호: ${docNo}`, doc.page.width - 200, 90);

  doc.moveDown(0.5);
}

/** 구분선 그리기 */
function drawLine(doc, y, color = COLOR_LINE) {
  doc.moveTo(40, y).lineTo(doc.page.width - 40, y)
     .strokeColor(color).lineWidth(0.5).stroke();
}

/** 섹션 제목 */
function sectionTitle(doc, text) {
  const y = doc.y;
  doc.rect(40, y, doc.page.width - 80, 22).fill(COLOR_NAVY);
  doc.font(FONT_BOLD).fontSize(10).fillColor('white')
     .text(text, 50, y + 6);
  doc.moveDown(0.3);
}

/** 2열 테이블 행 */
function tableRow(doc, label, value, isShaded = false) {
  const y = doc.y;
  const w = doc.page.width - 80;
  if (isShaded) {
    doc.rect(40, y, w, 18).fill('#F3F4F6');
  }
  doc.font(FONT_BOLD).fontSize(9).fillColor(COLOR_NAVY)
     .text(label, 50, y + 4, { width: 140 });
  doc.font(FONT_REGULAR).fontSize(9).fillColor(COLOR_BLACK)
     .text(value, 200, y + 4, { width: w - 165 });
  doc.moveDown(0.15);
  drawLine(doc, doc.y, '#E5E7EB');
  doc.moveDown(0.1);
}

/** 공통 푸터 - 현재 커서 위치 기준 (빈 페이지 방지) */
function drawFooter(doc, issuer, date) {
  const pageW = doc.page.width;

  doc.moveDown(1.5);
  const startY = doc.y;

  // 골드 라인
  doc.moveTo(40, startY).lineTo(pageW - 40, startY)
     .strokeColor(COLOR_GOLD).lineWidth(1).stroke();

  doc.font(FONT_REGULAR).fontSize(8).fillColor(COLOR_GRAY)
     .text(`발급기관: ${issuer}`, 40, startY + 8)
     .text(`발급일자: ${date}`, 40, startY + 20)
     .text('※ 본 증명서는 공식 기관에서 발급된 문서의 샘플입니다. 법적 효력이 없습니다.', 40, startY + 32, { width: pageW - 160 });

  // 직인 자리 (원)
  doc.circle(pageW - 80, startY + 24, 28)
     .strokeColor(COLOR_NAVY).lineWidth(1).stroke();
  doc.font(FONT_BOLD).fontSize(7).fillColor(COLOR_NAVY)
     .text('직인', pageW - 96, startY + 19, { width: 32, align: 'center' });
}

// ─────────────────────────────────────────────
// 1. 부동산 등기부등본
// ─────────────────────────────────────────────
function makeLandRegistry() {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const out = fs.createWriteStream(path.join(OUTPUT_DIR, '01_부동산등기부등본_라수환.pdf'));
  doc.pipe(out);

  drawHeader(doc, '부동산 등기부등본', 'Real Estate Registry Certificate', 'REG-2026-0715-001');

  doc.y = 100;

  // ── 표제부 ──
  sectionTitle(doc, '[ 표제부 ] (1동의 건물의 표시)');
  tableRow(doc, '소재지번', '경기도 안성시 양성면 벌티길 64-17', false);
  tableRow(doc, '건물내역', '철근콘크리트조 슬래브지붕 2층 주택', true);
  tableRow(doc, '건물면적', '1층 84.52㎡, 2층 76.30㎡', false);
  tableRow(doc, '등기원인', '2005년 04월 18일 소유권이전', true);
  doc.moveDown(0.5);

  // ── 갑구 ──
  sectionTitle(doc, '[ 갑구 ] (소유권에 관한 사항)');
  tableRow(doc, '순위번호', '3', false);
  tableRow(doc, '등기목적', '소유권이전', true);
  tableRow(doc, '접수일자', '2005년 04월 18일  제 18742호', false);
  tableRow(doc, '등기원인', '2005년 04월 15일 매매', true);
  tableRow(doc, '권리자', '소유자  라수환  690812-1******', false);
  tableRow(doc, '주소', '경기도 안성시 양성면 벌티길 64-17', true);
  doc.moveDown(0.5);

  // ── 을구 ──
  sectionTitle(doc, '[ 을구 ] (소유권 이외의 권리에 관한 사항)');
  tableRow(doc, '순위번호', '1', false);
  tableRow(doc, '등기목적', '근저당권설정', true);
  tableRow(doc, '접수일자', '2005년 04월 18일  제 18743호', false);
  tableRow(doc, '채권최고액', '금 78,000,000원', true);
  tableRow(doc, '채무자', '라수환', false);
  tableRow(doc, '근저당권자', '농협은행 주식회사', true);
  tableRow(doc, '말소사항', '2018년 11월 22일 해지로 인한 말소등기', false);
  doc.moveDown(0.5);

  // ── 토지 ──
  sectionTitle(doc, '[ 토지 표시 ]');
  tableRow(doc, '소재지번', '경기도 안성시 양성면 벌티리 산 64-17', false);
  tableRow(doc, '지목', '대', true);
  tableRow(doc, '면적', '298.0㎡', false);
  tableRow(doc, '공시지가', '금 42,500원/㎡ (2026년 기준)', true);
  tableRow(doc, '공시지가 총액', '금 12,665,000원', false);

  drawFooter(doc, '수원지방법원 안성등기소', '2026년 07월 15일');

  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─────────────────────────────────────────────
// 2. 은행 잔액증명서
// ─────────────────────────────────────────────
function makeBankBalance() {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const out = fs.createWriteStream(path.join(OUTPUT_DIR, '02_은행잔액증명서_라수환.pdf'));
  doc.pipe(out);

  drawHeader(doc, '잔액증명서', 'Bank Balance Certificate', 'BAL-2026-0715-002');

  doc.y = 100;

  // ── 예금주 정보 ──
  sectionTitle(doc, '[ 예금주 정보 ]');
  tableRow(doc, '예금주 성명', '라수환', false);
  tableRow(doc, '주민등록번호', '690812-1******', true);
  tableRow(doc, '주소', '경기도 안성시 양성면 벌티길 64-17', false);
  tableRow(doc, '연락처', '010-****-****', true);
  doc.moveDown(0.5);

  // ── 계좌 내역 ──
  sectionTitle(doc, '[ 계좌 내역 ]');

  // 헤더 행
  const y0 = doc.y;
  const w = doc.page.width - 80;
  doc.rect(40, y0, w, 20).fill(COLOR_NAVY);
  doc.font(FONT_BOLD).fontSize(9).fillColor('white')
     .text('은행명', 50, y0 + 5, { width: 80 })
     .text('계좌번호', 135, y0 + 5, { width: 130 })
     .text('계좌종류', 270, y0 + 5, { width: 80 })
     .text('잔액(원)', 355, y0 + 5, { width: 120, align: 'right' });
  doc.moveDown(0.2);

  const accounts = [
    ['NH농협은행', '301-****-****-11', '보통예금', '12,450,000'],
    ['IBK기업은행', '010-****-****-01', '보통예금', '8,320,000'],
    ['토스뱅크', '100-****-****-77', '보통예금', '3,180,000'],
    ['NH농협은행', '351-****-****-33', '정기예금', '30,000,000'],
    ['IBK기업은행', '020-****-****-55', '정기적금', '5,400,000'],
  ];

  accounts.forEach(([bank, acct, type, bal], i) => {
    const yr = doc.y;
    if (i % 2 === 0) doc.rect(40, yr, w, 18).fill('#F9FAFB');
    doc.font(FONT_REGULAR).fontSize(9).fillColor(COLOR_BLACK)
       .text(bank, 50, yr + 4, { width: 80 })
       .text(acct, 135, yr + 4, { width: 130 })
       .text(type, 270, yr + 4, { width: 80 })
       .text(bal, 355, yr + 4, { width: 120, align: 'right' });
    doc.moveDown(0.15);
    drawLine(doc, doc.y, '#E5E7EB');
    doc.moveDown(0.1);
  });

  // 합계
  const yt = doc.y;
  doc.rect(40, yt, w, 22).fill(COLOR_GOLD);
  doc.font(FONT_BOLD).fontSize(10).fillColor('white')
     .text('합  계', 50, yt + 5, { width: 200 })
     .text('59,350,000', 355, yt + 5, { width: 120, align: 'right' });
  doc.moveDown(0.8);

  // ── 증명 사항 ──
  sectionTitle(doc, '[ 증명 사항 ]');
  tableRow(doc, '기준일자', '2026년 07월 15일 현재', false);
  tableRow(doc, '총 잔액', '금 오천구백삼십오만원 정 (₩59,350,000)', true);
  tableRow(doc, '발급목적', '상속 및 재산 증명용', false);
  tableRow(doc, '유효기간', '발급일로부터 3개월', true);
  doc.moveDown(0.5);

  // ── 안내 ──
  doc.font(FONT_REGULAR).fontSize(8).fillColor(COLOR_GRAY)
     .text('※ 본 증명서는 위에 기재된 기준일자 현재의 잔액을 증명합니다.', 40, doc.y)
     .text('※ 계좌번호 및 잔액은 개인정보 보호를 위해 일부 마스킹 처리되었습니다.', 40, doc.y + 12);

  drawFooter(doc, 'NH농협은행 안성지점', '2026년 07월 15일');

  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─────────────────────────────────────────────
// 3. 주식보유증명서
// ─────────────────────────────────────────────
function makeStockCert() {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const out = fs.createWriteStream(path.join(OUTPUT_DIR, '03_주식보유증명서_라수환.pdf'));
  doc.pipe(out);

  drawHeader(doc, '주식보유증명서', 'Stock Holding Certificate', 'STK-2026-0715-003');

  doc.y = 100;

  // ── 주주 정보 ──
  sectionTitle(doc, '[ 주주 정보 ]');
  tableRow(doc, '성명', '라수환', false);
  tableRow(doc, '주민등록번호', '690812-1******', true);
  tableRow(doc, '주소', '경기도 안성시 양성면 벌티길 64-17', false);
  tableRow(doc, '증권사', '복수 증권사 (농협·기업·토스)', true);
  doc.moveDown(0.5);

  // ── 보유 주식 내역 ──
  sectionTitle(doc, '[ 보유 주식 내역 ]');

  const w = doc.page.width - 80;
  const y0 = doc.y;
  doc.rect(40, y0, w, 20).fill(COLOR_NAVY);
  doc.font(FONT_BOLD).fontSize(8).fillColor('white')
     .text('종목명', 50, y0 + 5, { width: 100 })
     .text('종목코드', 155, y0 + 5, { width: 60 })
     .text('수량(주)', 220, y0 + 5, { width: 60, align: 'right' })
     .text('평균단가(원)', 285, y0 + 5, { width: 80, align: 'right' })
     .text('평가금액(원)', 370, y0 + 5, { width: 100, align: 'right' });
  doc.moveDown(0.2);

  const stocks = [
    ['삼성전자', '005930', '500', '78,200', '39,100,000'],
    ['NAVER', '035420', '100', '185,500', '18,550,000'],
    ['카카오', '035720', '200', '42,300', '8,460,000'],
    ['현대차', '005380', '50', '215,000', '10,750,000'],
    ['SK하이닉스', '000660', '80', '168,000', '13,440,000'],
    ['LG에너지솔루션', '373220', '30', '320,000', '9,600,000'],
    ['POSCO홀딩스', '005490', '60', '385,000', '23,100,000'],
  ];

  stocks.forEach(([name, code, qty, avg, val], i) => {
    const yr = doc.y;
    if (i % 2 === 0) doc.rect(40, yr, w, 18).fill('#F9FAFB');
    doc.font(FONT_REGULAR).fontSize(8).fillColor(COLOR_BLACK)
       .text(name, 50, yr + 4, { width: 100 })
       .text(code, 155, yr + 4, { width: 60 })
       .text(qty, 220, yr + 4, { width: 60, align: 'right' })
       .text(avg, 285, yr + 4, { width: 80, align: 'right' })
       .text(val, 370, yr + 4, { width: 100, align: 'right' });
    doc.moveDown(0.15);
    drawLine(doc, doc.y, '#E5E7EB');
    doc.moveDown(0.1);
  });

  // 합계
  const yt = doc.y;
  doc.rect(40, yt, w, 22).fill(COLOR_GOLD);
  doc.font(FONT_BOLD).fontSize(9).fillColor('white')
     .text('총 평가금액', 50, yt + 5, { width: 300 })
     .text('123,000,000', 370, yt + 5, { width: 100, align: 'right' });
  doc.moveDown(0.8);

  // ── 암호화폐 ──
  sectionTitle(doc, '[ 가상자산 보유 내역 (참고) ]');

  const cy0 = doc.y;
  doc.rect(40, cy0, w, 20).fill(COLOR_NAVY);
  doc.font(FONT_BOLD).fontSize(8).fillColor('white')
     .text('자산명', 50, cy0 + 5, { width: 100 })
     .text('거래소', 155, cy0 + 5, { width: 80 })
     .text('수량', 240, cy0 + 5, { width: 80, align: 'right' })
     .text('평가금액(원)', 325, cy0 + 5, { width: 145, align: 'right' });
  doc.moveDown(0.2);

  const cryptos = [
    ['DOGE (도지코인)', '빗썸', '50,000 DOGE', '8,750,000'],
    ['BTC (비트코인)', '빗썸', '0.05 BTC', '7,250,000'],
  ];

  cryptos.forEach(([name, exchange, qty, val], i) => {
    const yr = doc.y;
    if (i % 2 === 0) doc.rect(40, yr, w, 18).fill('#F9FAFB');
    doc.font(FONT_REGULAR).fontSize(8).fillColor(COLOR_BLACK)
       .text(name, 50, yr + 4, { width: 100 })
       .text(exchange, 155, yr + 4, { width: 80 })
       .text(qty, 240, yr + 4, { width: 80, align: 'right' })
       .text(val, 325, yr + 4, { width: 145, align: 'right' });
    doc.moveDown(0.15);
    drawLine(doc, doc.y, '#E5E7EB');
    doc.moveDown(0.1);
  });

  doc.moveDown(0.5);

  // ── 증명 사항 ──
  sectionTitle(doc, '[ 증명 사항 ]');
  tableRow(doc, '기준일자', '2026년 07월 15일 현재', false);
  tableRow(doc, '주식 총 평가금액', '금 일억이천삼백만원 정 (₩123,000,000)', true);
  tableRow(doc, '가상자산 평가금액', '금 일천육백만원 정 (₩16,000,000)', false);
  tableRow(doc, '발급목적', '상속 및 재산 증명용', true);
  tableRow(doc, '유효기간', '발급일로부터 1개월', false);

  drawFooter(doc, 'NH투자증권 / 빗썸코리아', '2026년 07월 15일');

  doc.end();
  return new Promise(resolve => out.on('finish', resolve));
}

// ─────────────────────────────────────────────
// 실행
// ─────────────────────────────────────────────
console.log('샘플 자산 서류 PDF 생성 시작...');

Promise.all([
  makeLandRegistry().then(() => console.log('✅ 01_부동산등기부등본_라수환.pdf 생성 완료')),
  makeBankBalance().then(() => console.log('✅ 02_은행잔액증명서_라수환.pdf 생성 완료')),
  makeStockCert().then(() => console.log('✅ 03_주식보유증명서_라수환.pdf 생성 완료')),
]).then(() => {
  console.log('\n모든 PDF 생성 완료!');
  console.log(`출력 경로: ${OUTPUT_DIR}`);
}).catch(err => {
  console.error('오류:', err);
  process.exit(1);
});
