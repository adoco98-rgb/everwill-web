import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { ENV } from "./env";

export type EmailOtpPurpose = "signup" | "login" | "reauth";

export function generateEmailOtp(): string {
  return randomInt(100000, 1000000).toString();
}

export function hashEmailOtp(
  email: string,
  purpose: EmailOtpPurpose,
  code: string,
): string {
  return createHmac("sha256", ENV.cookieSecret)
    .update(`${email.trim().toLowerCase()}\0${purpose}\0${code}`)
    .digest("hex");
}

export function verifyEmailOtp(
  email: string,
  purpose: EmailOtpPurpose,
  code: string,
  storedHash: string,
): boolean {
  const actual = Buffer.from(hashEmailOtp(email, purpose, code), "hex");
  const expected = Buffer.from(storedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
