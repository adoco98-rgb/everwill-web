/**
 * EverWill 디지털 카드 생성 헬퍼
 * SVG 기반으로 카드 이미지를 생성하고 PNG Buffer로 반환
 * 갤럭시/아이폰 공통 사용 가능
 */
import QRCode from "qrcode";

export type CardTier = "silver" | "gold" | "platinum";

interface CardOptions {
  name: string;          // 유언자 이름
  certNumber: string;    // 인증 번호 (EW-2026-XXXXXX)
  qrUrl: string;         // QR 코드에 담을 URL
  tier: CardTier;        // 카드 등급
}

// 등급별 색상 설정
const TIER_COLORS: Record<CardTier, { bg1: string; bg2: string; text: string; accent: string; label: string }> = {
  silver: {
    bg1: "#6B7280",
    bg2: "#374151",
    text: "#FFFFFF",
    accent: "#D1D5DB",
    label: "SILVER",
  },
  gold: {
    bg1: "#C9A961",
    bg2: "#92400E",
    text: "#FFFFFF",
    accent: "#FDE68A",
    label: "GOLD",
  },
  platinum: {
    bg1: "#7C3AED",
    bg2: "#1E1B4B",
    text: "#FFFFFF",
    accent: "#C4B5FD",
    label: "PLATINUM",
  },
};

/**
 * 디지털 카드 SVG 문자열 생성
 */
async function buildCardSvg(opts: CardOptions): Promise<string> {
  const colors = TIER_COLORS[opts.tier];

  // QR 코드를 base64 PNG로 생성
  const qrDataUrl = await QRCode.toDataURL(opts.qrUrl, {
    width: 120,
    margin: 1,
    color: {
      dark: "#1A1A1A",
      light: "#FFFFFF",
    },
  });

  // 카드 번호 마스킹 (마지막 4자리만 표시)
  const maskedNumber = "•••• •••• •••• " + opts.certNumber.slice(-4);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="600" height="380" viewBox="0 0 600 380">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.bg1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.bg2};stop-opacity:1" />
    </linearGradient>
    <clipPath id="roundedRect">
      <rect width="600" height="380" rx="24" ry="24"/>
    </clipPath>
  </defs>

  <!-- 카드 배경 -->
  <rect width="600" height="380" rx="24" ry="24" fill="url(#cardGrad)"/>

  <!-- 배경 장식 원 -->
  <circle cx="480" cy="-40" r="200" fill="${colors.accent}" opacity="0.08"/>
  <circle cx="560" cy="320" r="150" fill="${colors.accent}" opacity="0.06"/>

  <!-- NFC 아이콘 (우상단) -->
  <g transform="translate(540, 40)" opacity="0.8">
    <path d="M0,0 Q8,-8 8,-18 Q8,-28 0,-36" stroke="${colors.text}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M-6,4 Q6,-6 6,-18 Q6,-30 -6,-40" stroke="${colors.text}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M-12,8 Q4,-4 4,-18 Q4,-32 -12,-44" stroke="${colors.text}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </g>

  <!-- EverWill 로고 텍스트 -->
  <text x="40" y="62" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="${colors.text}" letter-spacing="1">EverWill</text>
  <text x="40" y="82" font-family="Arial, sans-serif" font-size="11" fill="${colors.accent}" letter-spacing="3">${colors.label}</text>

  <!-- 구분선 -->
  <line x1="40" y1="100" x2="560" y2="100" stroke="${colors.accent}" stroke-width="0.5" opacity="0.4"/>

  <!-- 유언자 이름 -->
  <text x="40" y="160" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="${colors.text}">${escapeXml(opts.name)}</text>

  <!-- 인증 번호 마스킹 -->
  <text x="40" y="200" font-family="Courier New, monospace" font-size="18" fill="${colors.accent}" letter-spacing="2">${maskedNumber}</text>

  <!-- 인증 번호 전체 (작게) -->
  <text x="40" y="228" font-family="Arial, sans-serif" font-size="11" fill="${colors.text}" opacity="0.6">인증번호: ${escapeXml(opts.certNumber)}</text>

  <!-- 하단 문구 -->
  <text x="40" y="310" font-family="Arial, sans-serif" font-size="12" fill="${colors.text}" opacity="0.7">유언장이 EverWill에 디지털 보관되어 있습니다</text>
  <text x="40" y="330" font-family="Arial, sans-serif" font-size="11" fill="${colors.accent}" opacity="0.8">everwill.co.kr</text>

  <!-- QR 코드 (우측) -->
  <rect x="440" y="200" width="130" height="130" rx="8" fill="#FFFFFF" opacity="0.95"/>
  <image href="${qrDataUrl}" x="445" y="205" width="120" height="120"/>

  <!-- QR 안내 텍스트 -->
  <text x="505" y="348" font-family="Arial, sans-serif" font-size="10" fill="${colors.text}" opacity="0.6" text-anchor="middle">QR 스캔</text>
</svg>`;

  return svg;
}

/**
 * XML 특수문자 이스케이프
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 디지털 카드 SVG Buffer 반환
 * (SVG를 직접 반환 — 브라우저에서 PNG로 변환 가능)
 */
export async function generateDigitalCard(opts: CardOptions): Promise<Buffer> {
  const svg = await buildCardSvg(opts);
  return Buffer.from(svg, "utf-8");
}

/**
 * 디지털 카드 SVG 문자열 반환 (이메일 인라인 용)
 */
export async function generateDigitalCardSvgString(opts: CardOptions): Promise<string> {
  return buildCardSvg(opts);
}
