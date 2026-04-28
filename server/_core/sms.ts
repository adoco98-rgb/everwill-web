import { ENV } from "./env";

// Twilio Verify API를 이용한 SMS OTP 발송/검증 헬퍼

const TWILIO_BASE_URL = `https://verify.twilio.com/v2/Services/${ENV.twilioVerifyServiceSid}`;

/**
 * Twilio Basic Auth 헤더 생성
 */
function getAuthHeader(): string {
  const credentials = `${ENV.twilioAccountSid}:${ENV.twilioAuthToken}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

/**
 * 휴대폰 번호로 OTP SMS 발송
 * @param phoneNumber E.164 형식 (예: +821012345678)
 */
export async function sendSmsOtp(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${TWILIO_BASE_URL}/Verifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: getAuthHeader(),
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Channel: "sms",
      }).toString(),
    });

    const data = await response.json() as { status?: string; message?: string };

    if (!response.ok) {
      console.error("[SMS] Twilio Verify 발송 실패:", data);
      return { success: false, error: data.message ?? "SMS 발송 실패" };
    }

    console.log("[SMS] OTP 발송 성공:", phoneNumber, data.status);
    return { success: true };
  } catch (error) {
    console.error("[SMS] 발송 오류:", error);
    return { success: false, error: "SMS 발송 중 오류가 발생했습니다" };
  }
}

/**
 * OTP 코드 검증
 * @param phoneNumber E.164 형식 (예: +821012345678)
 * @param code 사용자가 입력한 6자리 코드
 */
export async function verifySmsOtp(
  phoneNumber: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${TWILIO_BASE_URL}/VerificationCheck`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: getAuthHeader(),
      },
      body: new URLSearchParams({
        To: phoneNumber,
        Code: code,
      }).toString(),
    });

    const data = await response.json() as { status?: string; message?: string };

    if (!response.ok) {
      console.error("[SMS] OTP 검증 실패:", data);
      return { success: false, error: data.message ?? "코드 검증 실패" };
    }

    if (data.status === "approved") {
      return { success: true };
    } else {
      return { success: false, error: "인증 코드가 올바르지 않습니다" };
    }
  } catch (error) {
    console.error("[SMS] 검증 오류:", error);
    return { success: false, error: "코드 검증 중 오류가 발생했습니다" };
  }
}

/**
 * E.164 형식으로 전화번호 변환
 * @param phone 사용자 입력 번호 (예: 01012345678)
 * @param countryCode 국가코드 (예: +82)
 */
export function toE164(phone: string, countryCode: string): string {
  // 하이픈, 공백 제거
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  // 앞에 0이 있으면 제거 후 국가코드 붙이기
  if (cleaned.startsWith("0")) {
    return `${countryCode}${cleaned.slice(1)}`;
  }
  // 이미 + 로 시작하면 그대로
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  return `${countryCode}${cleaned}`;
}
