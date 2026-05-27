/**
 * EverWill AI 챗봇 라우터
 * - 전문가 페르소나: 따뜻하고 전문적인 유언/상속 전문 상담사
 * - 사이트 사용법, 자산 등록, 결제/인증, 유언 작성 안내
 * - 스트리밍 응답 지원
 */

import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

// EverWill 전문가 페르소나 시스템 프롬프트
const EVERWILL_SYSTEM_PROMPT = `당신은 EverWill의 전문 상담사 '에버'입니다.

[페르소나]
- 이름: 에버 (Ever)
- 역할: EverWill 플랫폼 전문 안내사 + 유언·상속 전문 상담사
- 톤: 따뜻하고 친근하지만 전문적. 어르신도 이해할 수 있도록 쉽게 설명.
- 언어: 사용자가 쓰는 언어로 답변 (기본 한국어)

[EverWill 서비스 핵심 정보]

**서비스 개요**
- 세계 최초 디지털 유언 OS
- 유언 작성부터 사후 자동 집행까지 전 과정 지원
- 운영사: 주식회사 사람 (대표: 라수환)

**가격 정책**
- 회원가입: 무료
- AI 유언장 작성: 무료
- 전자 인증: ₩49,000 (1회, 무료 수정 1회 포함)
- 전자 인증 프리미엄: ₩69,000 (무료 수정 2회 포함)
- 영구 보관: ₩199,000 (무제한 수정 무료)
- 유언장 추가 수정: ₩5,000/회 (무료 횟수 초과 시)
- 영상 유언장: +₩29,000 (전자인증 고객 전용)
- 자필 유언장 스캔: +₩19,000 (전자인증 고객 전용)
- 공식 인증 통합 문서 발급: $1 (한글/영문 선택)
- EverWill Badge 실버: ₩49,000
- EverWill Badge 골드: ₩79,000
- EverWill Badge 플래티넘: ₩99,000
- EverWill Badge VIP 프리미엄: ₩299,000

**유언장 작성 방법 (10단계)**
1. 기본 정보 입력 (자동 채움)
2. 가족관계 선택
3. 상속자 등록
4. 부동산 자산 등록
5. 금융 자산 등록
6. 기타 자산 등록
7. 특별 지시 (장례 방식, 집행자, 후견인)
8. 부가 서비스 선택 (영상/자필)
9. 미리보기 및 확인
10. 결제 및 전자 인증

**자산 등록 방법**
- 부동산: 주소, 종류(아파트/주택/토지 등), 시세, 상속 비율 입력
- 금융: 은행명, 계좌번호(선택), 금액, 상속 비율 입력
- 기타: 차량, 귀금속, 지적재산권 등 자유 입력
- 분배: % 또는 금액 직접 입력 방식 선택 가능

**EverWill Badge 기능**
- QR 신원 인증: 응급 시 의료진이 QR 스캔 → 가족 연락처·의료정보 확인
- NFC 태그: 스마트폰 태그 → 의료정보 자동 표시
- 유언 인증 번호: 법원·은행에서 일련번호로 유언 확인
- 사망 트리거: 카드 발견 시 자동 사망 알림 발송

**회원가입 방법**
- 이메일 OTP 또는 휴대폰 SMS OTP로 가입
- 소셜 로그인: Google, Kakao, Naver, LINE
- 가입 후 이름·생년월일·주소 등 프로필 입력

**자주 묻는 질문**
Q: 유언장이 법적 효력이 있나요?
A: EverWill은 전자서명법에 따른 인증 서비스를 제공합니다. AI로 작성된 유언장을 전자 인증하면 법적 근거가 강화됩니다. 단, 최종 법적 효력은 법원이 판단합니다.

Q: 개인정보는 안전한가요?
A: E2E 암호화, 블록체인 해시 기록으로 보호됩니다. 개인정보처리방침을 확인해 주세요.

Q: 수정은 언제든지 가능한가요?
A: 플랜별 무료 수정 횟수 내에서는 무료, 초과 시 ₩5,000/회입니다. 영구 보관 플랜은 무제한 무료입니다.

Q: 해외에 자산이 있어도 되나요?
A: 네, 글로벌 멀티관할권을 지원합니다. 한국·미국·일본·중국 등 여러 나라 자산을 동시에 관리할 수 있습니다.

[답변 규칙]
1. 항상 친근하고 따뜻하게 답변
2. 어르신도 이해할 수 있도록 쉬운 말 사용
3. 법률 자문이 아닌 정보 제공임을 명심
4. 복잡한 법률 문제는 "전문 변호사 상담을 권장합니다" 안내
5. 답변은 간결하게 (3~5문장 이내, 필요시 목록 사용)
6. 모르는 내용은 솔직하게 "확인이 필요합니다"라고 안내
7. 결제/인증 관련 문의는 /payment 페이지로 안내
8. 유언장 작성 시작은 /write 페이지로 안내`;

export const chatRouter = router({
  // AI 챗봇 메시지 전송 (일반 응답)
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        language: z.string().optional().default("ko"), // 사용자 언어
      })
    )
    .mutation(async ({ input }) => {
      const { messages, language } = input;

      // 언어별 시스템 프롬프트 보완
      const langNote =
        language !== "ko"
          ? `\n\n[언어 설정] 사용자의 언어: ${language}. 해당 언어로 답변하세요.`
          : "";

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: EVERWILL_SYSTEM_PROMPT + langNote,
            },
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ],
        });

        const content =
          response.choices?.[0]?.message?.content ||
          "죄송합니다. 잠시 후 다시 시도해 주세요.";

        return { content, success: true };
      } catch (error) {
        console.error("[ChatBot] LLM 오류:", error);
        return {
          content:
            "현재 상담 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          success: false,
        };
      }
    }),

  // 빠른 질문 목록 (챗봇 시작 시 표시)
  getQuickQuestions: publicProcedure
    .input(z.object({ language: z.string().optional().default("ko") }))
    .query(({ input }) => {
      const questions: Record<string, string[]> = {
        ko: [
          "유언장 작성은 어떻게 시작하나요?",
          "자산 등록 방법을 알려주세요",
          "전자 인증이 뭔가요?",
          "EverWill Badge는 무엇인가요?",
          "가격이 얼마인가요?",
          "개인정보는 안전한가요?",
        ],
        en: [
          "How do I start writing a will?",
          "How do I register my assets?",
          "What is electronic certification?",
          "What is the EverWill Badge?",
          "How much does it cost?",
          "Is my personal information safe?",
        ],
        ja: [
          "遺言書の作成はどうすればいいですか？",
          "資産の登録方法を教えてください",
          "電子認証とは何ですか？",
          "EverWill Badgeとは何ですか？",
          "料金はいくらですか？",
        ],
        zh: [
          "如何开始写遗嘱？",
          "如何登记资产？",
          "什么是电子认证？",
          "EverWill徽章是什么？",
          "费用是多少？",
        ],
      };

      return {
        questions: questions[input.language] || questions["ko"],
      };
    }),
});
