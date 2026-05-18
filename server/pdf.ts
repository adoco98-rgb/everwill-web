/**
 * EverWill 유언장 PDF 생성 헬퍼
 * html-pdf-node + 시스템 Chromium 사용
 */
import htmlPdfNode from "html-pdf-node";

export interface WillPdfData {
  certNumber: string;
  testatorName: string;
  testatorAddress: string;
  writtenDate: string;
  certifiedAt: string;
  blockchainHash: string;
  draftText: string;  // AI 생성 유언장 전문
}

/**
 * 유언장 HTML 템플릿 생성
 */
function buildWillHtml(data: WillPdfData): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Noto Serif KR', 'Malgun Gothic', serif;
      background: #fff;
      color: #1a1a1a;
      font-size: 13pt;
      line-height: 1.9;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 25mm 20mm 20mm 25mm;
      position: relative;
    }

    /* 헤더 */
    .header {
      text-align: center;
      border-bottom: 3px solid #1F3864;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }

    .logo-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 8px;
    }

    .logo-text {
      font-size: 18pt;
      font-weight: 700;
      color: #1F3864;
      letter-spacing: 2px;
    }

    .cert-badge {
      background: #1F3864;
      color: #C9A961;
      font-size: 9pt;
      padding: 3px 10px;
      border-radius: 4px;
      letter-spacing: 1px;
    }

    .doc-title {
      font-size: 22pt;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: 6px;
      margin-top: 8px;
    }

    /* 인증 정보 박스 */
    .cert-box {
      border: 1.5px solid #C9A961;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 24px;
      background: #FFFDF5;
    }

    .cert-box table {
      width: 100%;
      border-collapse: collapse;
    }

    .cert-box td {
      padding: 4px 8px;
      font-size: 10pt;
      vertical-align: top;
    }

    .cert-box td:first-child {
      color: #6B7280;
      width: 120px;
      white-space: nowrap;
    }

    .cert-box td:last-child {
      color: #1a1a1a;
      font-weight: 500;
    }

    .cert-number {
      font-size: 12pt;
      font-weight: 700;
      color: #1F3864;
      letter-spacing: 2px;
    }

    /* 유언장 본문 */
    .will-body {
      margin-bottom: 32px;
    }

    .will-body h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #1F3864;
      border-left: 4px solid #C9A961;
      padding-left: 10px;
      margin-bottom: 16px;
    }

    .will-text {
      white-space: pre-wrap;
      font-size: 12pt;
      line-height: 2.0;
      color: #1a1a1a;
      padding: 0 4px;
    }

    /* 서명란 */
    .signature-section {
      margin-top: 40px;
      border-top: 1px solid #ddd;
      padding-top: 24px;
    }

    .signature-row {
      display: flex;
      justify-content: flex-end;
      gap: 40px;
      margin-bottom: 12px;
    }

    .signature-item {
      text-align: center;
      min-width: 120px;
    }

    .signature-label {
      font-size: 10pt;
      color: #6B7280;
      margin-bottom: 40px;
    }

    .signature-line {
      border-bottom: 1px solid #1a1a1a;
      width: 120px;
      margin: 0 auto 4px;
    }

    .signature-name {
      font-size: 10pt;
      color: #1a1a1a;
    }

    /* 해시 푸터 */
    .hash-footer {
      margin-top: 32px;
      padding: 10px 14px;
      background: #F3F4F6;
      border-radius: 4px;
      font-size: 8pt;
      color: #6B7280;
      word-break: break-all;
    }

    .hash-footer strong {
      color: #1F3864;
    }

    /* 페이지 하단 */
    .page-footer {
      position: fixed;
      bottom: 15mm;
      left: 25mm;
      right: 20mm;
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      color: #9CA3AF;
      border-top: 1px solid #E5E7EB;
      padding-top: 6px;
    }

    /* 워터마크 */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 72pt;
      color: rgba(31, 56, 100, 0.04);
      font-weight: 700;
      letter-spacing: 8px;
      pointer-events: none;
      z-index: -1;
    }
  </style>
</head>
<body>
  <div class="watermark">EverWill</div>

  <div class="page">
    <!-- 헤더 -->
    <div class="header">
      <div class="logo-row">
        <span class="logo-text">EverWill</span>
        <span class="cert-badge">전자 인증 유언장</span>
      </div>
      <div class="doc-title">유 언 장</div>
    </div>

    <!-- 인증 정보 -->
    <div class="cert-box">
      <table>
        <tr>
          <td>인증 번호</td>
          <td><span class="cert-number">${data.certNumber}</span></td>
        </tr>
        <tr>
          <td>유언자 성명</td>
          <td>${data.testatorName}</td>
        </tr>
        <tr>
          <td>유언자 주소</td>
          <td>${data.testatorAddress}</td>
        </tr>
        <tr>
          <td>작성일</td>
          <td>${data.writtenDate}</td>
        </tr>
        <tr>
          <td>인증 완료일</td>
          <td>${data.certifiedAt}</td>
        </tr>
      </table>
    </div>

    <!-- 유언장 본문 -->
    <div class="will-body">
      <h2>유언 내용</h2>
      <div class="will-text">${data.draftText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
    </div>

    <!-- 서명란 -->
    <div class="signature-section">
      <div class="signature-row">
        <div class="signature-item">
          <div class="signature-label">유언자 서명</div>
          <div class="signature-line"></div>
          <div class="signature-name">${data.testatorName} (인)</div>
        </div>
      </div>
    </div>

    <!-- 해시 -->
    <div class="hash-footer">
      <strong>무결성 해시 (SHA-256):</strong> ${data.blockchainHash}<br/>
      본 문서는 EverWill 분산 암호화 보관 시스템에 의해 보호됩니다.
      인증 번호로 진위 여부를 확인하실 수 있습니다.
    </div>

    <!-- 페이지 하단 -->
    <div class="page-footer">
      <span>EverWill — 디지털 유언 플랫폼 | everwill.co.kr</span>
      <span>인증번호: ${data.certNumber}</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 유언장 PDF Buffer 생성
 */
export async function generateWillPdf(data: WillPdfData): Promise<Buffer> {
  const html = buildWillHtml(data);

  const file = { content: html };
  const options = {
    format: "A4" as const,
    printBackground: true,
    margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
    executablePath: "/usr/bin/chromium",
  };

  const pdfBuffer = await htmlPdfNode.generatePdf(file, options);
  return pdfBuffer as Buffer;
}
