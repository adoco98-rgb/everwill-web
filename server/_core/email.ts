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
