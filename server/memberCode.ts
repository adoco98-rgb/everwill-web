/**
 * 회원번호 자동 생성 유틸리티
 * 형식: EV-[국가코드2자리]-[YYMMDD]-[전체순번 padStart(5,'0')]
 * 예시: EV-KR-260529-00001
 *       EV-US-260529-00042
 *       EV-KR-260529-100000 (10만명 초과 시 자동 확장)
 */

import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { count, isNotNull } from "drizzle-orm";

/**
 * 국가 코드 정규화 (ISO 3166-1 alpha-2)
 * 알 수 없는 국가는 XX 처리
 */
function normalizeCountryCode(country?: string | null): string {
  if (!country) return "XX";
  const code = country.toUpperCase().trim();
  // 유효한 2자리 알파벳 코드인지 확인
  if (/^[A-Z]{2}$/.test(code)) return code;
  return "XX";
}

/**
 * 오늘 날짜를 YYMMDD 형식으로 반환
 */
function getTodayStr(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2); // 2026 → "26"
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * 전체 가입자 수를 기반으로 순번 계산
 * memberCode가 이미 있는 사용자 수 + 1
 */
async function getNextSequence(): Promise<number> {
  const db = await getDb();
  if (!db) return 1;

  const result = await db
    .select({ total: count() })
    .from(users)
    .where(isNotNull(users.memberCode));

  const total = result[0]?.total ?? 0;
  return total + 1;
}

/**
 * 회원번호 생성 메인 함수
 * @param country - ISO 3166-1 alpha-2 국가 코드 (예: "KR", "US", "JP")
 * @returns 생성된 회원번호 (예: "EV-KR-260529-00001")
 */
export async function generateMemberCode(country?: string | null): Promise<string> {
  const countryCode = normalizeCountryCode(country);
  const dateStr = getTodayStr();
  const seq = await getNextSequence();

  // 5자리 기본, 초과 시 자동 확장
  const seqStr = String(seq).padStart(5, "0");

  return `EV-${countryCode}-${dateStr}-${seqStr}`;
}
