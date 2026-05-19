/**
 * Resend를 이용한 이메일 발송 헬퍼
 * 발신 주소: noreply@everwill.co.kr (또는 Resend 기본 도메인)
 */
import { Resend } from "resend";
import { ENV } from "./env";

const resend = new Resend(ENV.resendApiKey);

// 발신자 주소 (Resend 무료 플랜: onboarding@resend.dev 사용 가능)
const FROM_ADDRESS = "EverWill <onboarding@resend.dev>";
const ADMIN_EMAIL = "adoco98@gmail.com";

/**
 * 문의 접수 확인 이메일 - 사용자에게 발송
 */
export async function sendInquiryConfirmationEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  category: string;
  content: string;
  inquiryId?: number;
}): Promise<boolean> {
  const categoryLabels: Record<string, string> = {
    general: "일반 문의",
    service: "서비스 이용",
    payment: "결제/환불",
    badge: "Badge 주문",
    lawyer: "변호사 연결",
    other: "기타",
  };
  const categoryLabel = categoryLabels[params.category] ?? params.category;

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.toEmail,
      subject: `[EverWill] 문의가 접수됐습니다 - ${params.subject}`,
      html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EverWill 문의 접수 확인</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- 헤더 -->
          <tr>
            <td style="background:#1F3864;padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:bold;color:#C9A961;letter-spacing:2px;">EverWill</div>
              <div style="font-size:11px;color:#ffffff99;margin-top:4px;letter-spacing:3px;">DIGITAL WILL OS</div>
            </td>
          </tr>
          <!-- 본문 -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#1F3864;">문의가 접수됐습니다</h2>
              <p style="margin:0 0 24px;color:#6B7280;font-size:15px;">
                안녕하세요, <strong>${params.toName}</strong>님.<br/>
                문의해 주셔서 감사합니다. 영업일 기준 <strong>1-2일 내</strong>에 답변드리겠습니다.
              </p>

              <!-- 문의 요약 박스 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:8px;border:1px solid #e5e7eb;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B7280;width:100px;">문의 유형</td>
                        <td style="padding:6px 0;font-size:13px;color:#1A1A1A;font-weight:500;">${categoryLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B7280;">제목</td>
                        <td style="padding:6px 0;font-size:13px;color:#1A1A1A;font-weight:500;">${params.subject}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B7280;vertical-align:top;">내용</td>
                        <td style="padding:6px 0;font-size:13px;color:#1A1A1A;line-height:1.6;">${params.content.replace(/\n/g, "<br/>")}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6B7280;font-size:14px;">
                추가 문의 사항이 있으시면 <a href="mailto:${ADMIN_EMAIL}" style="color:#1F3864;font-weight:600;">${ADMIN_EMAIL}</a>로 연락 주세요.
              </p>
            </td>
          </tr>
          <!-- 푸터 -->
          <tr>
            <td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © 2025 EverWill (주식회사 사람) · 세계 최초 디지털 유언 OS<br/>
                본 이메일은 문의 접수 확인을 위해 자동 발송됩니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Email] 문의 확인 이메일 발송 실패:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] 문의 확인 이메일 발송 오류:", err);
    return false;
  }
}

/**
 * 문의 답변 이메일 - 사용자에게 발송 (만족도 조사 링크 포함)
 */
export async function sendInquiryReplyEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  reply: string;
  satisfactionToken: string; // 원본 토큰 (해시 전)
  inquiryId: number;
}): Promise<boolean> {
  // 만족도 별점 링크 생성 (1~5)
  const baseUrl = "https://everwill.co.kr";
  const stars = [1, 2, 3, 4, 5];
  const starEmojis = ["😞", "😕", "😐", "😊", "😄"];
  const starLabels = ["매우 불만족", "불만족", "보통", "만족", "매우 만족"];

  const starLinks = stars.map((score) => {
    const url = `${baseUrl}/feedback?id=${params.inquiryId}&token=${encodeURIComponent(params.satisfactionToken)}&score=${score}`;
    return `
      <td align="center" style="padding:0 6px;">
        <a href="${url}" style="display:inline-block;text-decoration:none;">
          <div style="width:56px;height:56px;border-radius:12px;background:#f8f9fa;border:2px solid #e5e7eb;display:flex;align-items:center;justify-content:center;font-size:28px;line-height:56px;text-align:center;cursor:pointer;">
            ${starEmojis[score - 1]}
          </div>
          <div style="font-size:11px;color:#6B7280;margin-top:4px;text-align:center;">${starLabels[score - 1]}</div>
        </a>
      </td>`;
  }).join("");

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.toEmail,
      subject: `[EverWill] 문의 답변이 도착했습니다 - ${params.subject}`,
      html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EverWill 문의 답변</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- 헤더 -->
          <tr>
            <td style="background:#1F3864;padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:bold;color:#C9A961;letter-spacing:2px;">EverWill</div>
              <div style="font-size:11px;color:#ffffff99;margin-top:4px;letter-spacing:3px;">DIGITAL WILL OS</div>
            </td>
          </tr>
          <!-- 본문 -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#1F3864;">문의 답변이 도착했습니다</h2>
              <p style="margin:0 0 24px;color:#6B7280;font-size:15px;">
                안녕하세요, <strong>${params.toName}</strong>님.<br/>
                문의하신 내용에 대한 답변을 보내드립니다.
              </p>

              <!-- 문의 제목 -->
              <div style="margin-bottom:8px;font-size:13px;color:#6B7280;">문의 제목</div>
              <div style="margin-bottom:20px;font-size:15px;font-weight:600;color:#1A1A1A;">${params.subject}</div>

              <!-- 답변 박스 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#EFF6FF;border-radius:8px;border-left:4px solid #1F3864;margin-bottom:32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <div style="font-size:12px;font-weight:600;color:#1F3864;margin-bottom:10px;letter-spacing:1px;">EverWill 답변</div>
                    <div style="font-size:14px;color:#1A1A1A;line-height:1.8;">${params.reply.replace(/\n/g, "<br/>")}</div>
                  </td>
                </tr>
              </table>

              <!-- 만족도 조사 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;border-radius:12px;border:1px solid #F59E0B33;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <div style="font-size:16px;font-weight:700;color:#1F3864;margin-bottom:4px;">답변이 도움이 됐나요?</div>
                    <div style="font-size:13px;color:#6B7280;margin-bottom:20px;">아래 이모지를 클릭해 만족도를 알려주세요 (1회만 가능)</div>
                    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                      <tr>
                        ${starLinks}
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#6B7280;font-size:14px;">
                추가 문의 사항이 있으시면 <a href="mailto:${ADMIN_EMAIL}" style="color:#1F3864;font-weight:600;">${ADMIN_EMAIL}</a>로 연락 주세요.
              </p>
            </td>
          </tr>
          <!-- 푸터 -->
          <tr>
            <td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © 2025 EverWill (주식회사 사람) · 세계 최초 디지털 유언 OS<br/>
                본 이메일은 문의 답변 알림을 위해 자동 발송됩니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Email] 답변 이메일 발송 실패:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] 답변 이메일 발송 오류:", err);
    return false;
  }
}

/**
 * 유언장 인증 완료 이메일 - 사용자에게 발송
 */
export async function sendWillCertifiedEmail(params: {
  toEmail: string;
  toName: string;
  certNumber: string;
  willTitle: string;
  certifiedAt: string;
  pdfUrl?: string;
  digitalCardUrl?: string; // 디지털 카드 URL (S3 또는 대시보드 링크)
}): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.toEmail,
      subject: `[EverWill] 유언장 인증이 완료됐습니다 - ${params.certNumber}`,
      html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EverWill 유언장 인증 완료</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- 헤더 -->
          <tr>
            <td style="background:#1F3864;padding:32px 40px;text-align:center;">
              <div style="font-size:24px;font-weight:bold;color:#C9A961;letter-spacing:2px;">EverWill</div>
              <div style="font-size:11px;color:#ffffff99;margin-top:4px;letter-spacing:3px;">DIGITAL WILL OS</div>
            </td>
          </tr>
          <!-- 인증 완료 배너 -->
          <tr>
            <td style="background:#ECFDF5;padding:24px 40px;border-bottom:1px solid #D1FAE5;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">✅</div>
              <div style="font-size:20px;font-weight:700;color:#065F46;">유언장 인증이 완료됐습니다</div>
            </td>
          </tr>
          <!-- 본문 -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;color:#6B7280;font-size:15px;">
                안녕하세요, <strong>${params.toName}</strong>님.<br/>
                유언장이 성공적으로 인증됐습니다. 소중한 의사를 안전하게 보관해 드리겠습니다.
              </p>

              <!-- 인증 정보 박스 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;border-radius:8px;border:1.5px solid #86EFAC;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B7280;width:110px;">인증 번호</td>
                        <td style="padding:6px 0;font-size:14px;color:#065F46;font-weight:700;font-family:monospace;letter-spacing:1px;">${params.certNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B7280;">유언장 제목</td>
                        <td style="padding:6px 0;font-size:13px;color:#1A1A1A;font-weight:500;">${params.willTitle}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#6B7280;">인증 완료일</td>
                        <td style="padding:6px 0;font-size:13px;color:#1A1A1A;">${params.certifiedAt}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- 버튼 그룹 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <!-- 디지털 카드 다운로드 버튼 (항상 표시) -->
                    <a href="https://everwill.co.kr/dashboard/wills" target="_blank"
                      style="display:inline-block;background:linear-gradient(135deg,#C9A961,#e8c97a);color:#1F3864;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.5px;margin-bottom:12px;">
                      🪪 디지털 카드 다운로드
                    </a>
                  </td>
                </tr>
                ${params.pdfUrl ? `
                <tr>
                  <td align="center">
                    <a href="${params.pdfUrl}" target="_blank"
                      style="display:inline-block;background:#1F3864;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                      📄 유언장 PDF 다운로드
                    </a>
                  </td>
                </tr>
                ` : ""}
              </table>

              <!-- 디지털 카드 안내 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;border-radius:8px;border:1px solid #FDE68A;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-size:13px;font-weight:600;color:#92400E;margin-bottom:8px;">🪪 디지털 카드 사용법</div>
                    <ul style="margin:0;padding-left:16px;font-size:13px;color:#78350F;line-height:1.8;">
                      <li><strong>갤럭시:</strong> 다운로드 후 잠금화면 배경으로 설정</li>
                      <li><strong>아이폰:</strong> 사진 앱에서 잠금화면 배경으로 설정</li>
                      <li>응급 상황 시 QR 스캔으로 가족에게 즉시 연락</li>
                      <li>인증번호로 법원·금융기관에서 유언 효력 확인 가능</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- 안내 박스 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF7ED;border-radius:8px;border:1px solid #FED7AA;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <div style="font-size:13px;font-weight:600;color:#9A3412;margin-bottom:8px;">⚠️ 중요 안내</div>
                    <ul style="margin:0;padding-left:16px;font-size:13px;color:#7C2D12;line-height:1.8;">
                      <li>인증된 유언장은 수정 또는 삭제가 불가능합니다.</li>
                      <li>내용 변경 시 재인증(₩15,000)이 필요합니다.</li>
                      <li>인증 번호는 법원·금융기관 제출 시 사용됩니다.</li>
                      <li>유언장은 EverWill 분산 암호화 보관 시스템에 저장됩니다.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6B7280;font-size:14px;">
                문의 사항이 있으시면 <a href="mailto:${ADMIN_EMAIL}" style="color:#1F3864;font-weight:600;">${ADMIN_EMAIL}</a>로 연락 주세요.
              </p>
            </td>
          </tr>
          <!-- 푸터 -->
          <tr>
            <td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © 2025 EverWill (주식회사 사람) · 세계 최초 디지털 유언 OS<br/>
                본 이메일은 유언장 인증 완료 알림을 위해 자동 발송됩니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Email] 유언장 인증 완료 이메일 발송 실패:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] 유언장 인증 완료 이메일 발송 오류:", err);
    return false;
  }
}

/**
 * 회원가입 환영 이메일 - 사용자에게 발송
 */
export async function sendWelcomeEmail(params: {
  toEmail: string;
  toName: string;
}): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.toEmail,
      subject: `[EverWill] 가입을 환영합니다, ${params.toName}님`,
      html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EverWill 환영 이메일</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Apple SD Gothic Neo',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- 헤더 -->
          <tr>
            <td style="background:#1F3864;padding:40px;text-align:center;">
              <div style="font-size:28px;font-weight:bold;color:#C9A961;letter-spacing:3px;">EverWill</div>
              <div style="font-size:12px;color:#ffffff99;margin-top:6px;letter-spacing:3px;">DIGITAL WILL OS</div>
            </td>
          </tr>
          <!-- 본문 -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:22px;color:#1F3864;">환영합니다, ${params.toName}님! 🎉</h2>
              <p style="margin:0 0 28px;color:#6B7280;font-size:15px;line-height:1.7;">
                EverWill에 가입해 주셔서 감사합니다.<br/>
                이제 소중한 의사를 안전하게 남길 준비가 됐습니다.
              </p>

              <!-- 시작 가이드 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:0 0 16px;">
                    <div style="font-size:16px;font-weight:700;color:#1F3864;margin-bottom:16px;">지금 바로 시작하세요</div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:12px 16px;background:#F8FAFC;border-radius:8px;margin-bottom:8px;border-left:3px solid #C9A961;">
                          <div style="font-size:14px;font-weight:600;color:#1A1A1A;">1단계: 유언장 작성</div>
                          <div style="font-size:13px;color:#6B7280;margin-top:4px;">AI 가이드를 따라 17분 만에 완성</div>
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:12px 16px;background:#F8FAFC;border-radius:8px;border-left:3px solid #C9A961;">
                          <div style="font-size:14px;font-weight:600;color:#1A1A1A;">2단계: 전자 인증</div>
                          <div style="font-size:13px;color:#6B7280;margin-top:4px;">₩49,000 · 법적 효력 보장</div>
                        </td>
                      </tr>
                      <tr><td style="height:8px;"></td></tr>
                      <tr>
                        <td style="padding:12px 16px;background:#F8FAFC;border-radius:8px;border-left:3px solid #C9A961;">
                          <div style="font-size:14px;font-weight:600;color:#1A1A1A;">3단계: 상속자 등록</div>
                          <div style="font-size:13px;color:#6B7280;margin-top:4px;">사망 시 자동 알림 발송</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA 버튼 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="https://everwill.co.kr/write"
                      style="display:inline-block;background:#1F3864;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.5px;">
                      유언장 작성 시작하기 →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6B7280;font-size:13px;text-align:center;">
                작성은 무료입니다. 인증 시에만 비용이 발생합니다.
              </p>
            </td>
          </tr>
          <!-- 푸터 -->
          <tr>
            <td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                © 2025 EverWill (주식회사 사람) · 세계 최초 디지털 유언 OS<br/>
                본 이메일은 회원가입 환영 안내를 위해 자동 발송됩니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error("[Email] 환영 이메일 발송 실패:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[Email] 환영 이메일 발송 오류:", err);
    return false;
  }
}
