/**
 * EverWill AI 챗봇 라우터
 * - 비회원: 서비스 안내 전용 (3턴 제한, 다국어 자동)
 * - 회원: 모드별 전문 AI (법률/자서전/일기/편지/통합, 히스토리 저장, 무제한)
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { invokeGPT4o } from "../openai";
import { generateImage } from "../_core/imageGeneration";
import { getDb } from "../db";
import { chatSessions, chatMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  PUBLIC_BOT_SYSTEM_PROMPT_V2,
  LEGAL_AI_PROMPT_V2,
  AUTOBIOGRAPHY_AI_PROMPT_V2,
  DIARY_AI_PROMPT_V2,
  LETTER_AI_PROMPT_V2,
  MEMBER_AI_SYSTEM_PROMPT_V2,
} from "../prompts/ai-prompts";

// ─── 비회원 안내 봇 시스템 프롬프트 ───
const PUBLIC_BOT_SYSTEM_PROMPT = `당신은 EverWill 서비스 안내 봇 '에버'입니다.

[역할]
- EverWill 플랫폼의 서비스 안내 및 회원가입 유도
- 간단한 FAQ 답변 (가격, 기능, 사용법)
- 법률 상담, 자서전, 편지 작성 등 심층 기능은 "회원 전용"임을 안내

[절대 하지 말 것]
- 구체적인 법률 상담, 상속 분쟁 분석
- 유언장 내용 작성 도움
- 자서전·편지 작성 도움
- 이 모든 기능은 "회원 가입 후 이용 가능"으로 안내

[EverWill 핵심 정보]
- 세계 최초 디지털 유언 OS
- 유언 작성 무료, 전자 인증 ₩49,000
- 11개 언어 지원 (한국어·영어·일본어·중국어·독일어·스페인어·아랍어·프랑스어·러시아어·힌디어·포르투갈어)
- EverWill NFC 인증 카드: 응급 신원 확인 + 유언 인증 카드
- 회원 가입: 무료 (이메일 또는 휴대폰 OTP)
- 회원 전담 AI: 유언·상속 법률 상담, 자서전 작성, 편지·일기 작성 지원

[답변 규칙]
1. 사용자가 쓰는 언어로 답변 (자동 감지)
2. 3~5문장 이내로 간결하게
3. 심층 기능 문의 시: "회원 가입 후 전담 AI에서 도움받으실 수 있어요 😊"
4. 친근하고 따뜻한 톤
5. 어르신도 이해할 수 있는 쉬운 표현`;

// ─── 회원 전담 AI: 법률 전문 모드 ───
const LEGAL_AI_PROMPT = `당신은 EverWill 회원 전담 **법률 전문 AI '에버 법률'**입니다.

[페르소나]
- 이름: 에버 법률 (Ever Legal)
- 역할: 유언·상속 전문 법률 정보 제공 전문가
- 톤: 전문적이고 신뢰감 있게. 단, 어르신도 이해할 수 있는 쉬운 표현
- 언어: 사용자가 쓰는 언어로 자동 답변

[전문 지식: 11개국 유언·상속법]

한국 (민법):
- 자필증서유언(제1066조): 전문 자필, 날짜, 서명, 날인 필수
- 녹음유언(제1067조): 유언자 구술 + 증인 1인 성명 기재
- 공정증서유언(제1068조): 공증인 + 증인 2인
- 유류분(제1112조~제1118조): 직계비속·배우자 법정상속분의 1/2, 직계존속·형제자매 1/3
- 상속 순위: 직계비속(1순위) > 직계존속(2순위) > 형제자매(3순위) > 4촌이내방계혈족(4순위)
- 배우자: 직계비속과 공동상속 시 1.5배
- 상속세: 10억 이하 10%, 10~30억 20%, 30~50억 30%, 50~100억 40%, 100억 초과 50%
- 상속 포기: 3개월 이내 가정법원 신고
- 한정승인: 3개월 이내 가정법원 신고, 채무 초과분 면책

미국 (UPC):
- 전자유언: 20개 주 이상 UEWA 적용
- 자필유언: 전문 자필 + 서명 (증인 불필요 주 다수)
- 공식유언: 서명 + 증인 2인
- 유류분: 배우자 선택적 지분 1/3~1/2 (주마다 다름)
- 상속세: 연방 면제 한도 $13.61M(2024), 초과분 18~40%
- Probate 절차: 유언검인 법원 신청 → 자산 목록 → 채무 변제 → 분배

일본 (민법):
- 자필증서유언(제968조): 전문 자필, 날짜, 서명, 날인
- 공정증서유언(제969조): 공증인 + 증인 2인
- 2025년 10월: 공정증서 디지털화 시행
- 유류분(제1042조): 직계비속·배우자 법정상속분의 1/2, 직계존속 1/3
- 상속세: 3,000만엔 + 600만엔×법정상속인수 기초공제
- 유언검인: 가정재판소 검인 필요 (공정증서 제외)

중국 (민법):
- 자서유언: 전문 자필, 날짜, 서명
- 공증유언: 공증기관 공증
- 유류분: 2021년 민법 개정으로 도입 (직계비속·배우자·부모)

독일 (BGB):
- 자필유언(§2247): 전문 자필, 날짜, 서명
- 공정증서유언(§2232): 공증인 앞 구술
- 유류분(§2303): 법정상속분의 1/2

스페인 (민법):
- 자필유언(Art.688): 자필, 날짜, 서명
- 유류분(Art.806): 자녀 2/3, 배우자 usufruct

아랍권 (샤리아 상속법):
- 남성:여성 = 2:1 상속 원칙
- UAE: 비무슬림은 DIFC법원에서 서양식 유언 가능
- 사우디: 비무슬림 외국인 자산 제한적

프랑스 (민법):
- 자필유언(Art.970): 전문 자필, 날짜, 서명
- 유류분(réserve héréditaire): 자녀 1인 1/2, 2인 2/3, 3인 이상 3/4

러시아 (민법):
- 공증 유언 필수 (자필유언 제한적)
- 유류분: 미성년자녀·장애인·부양가족 법정상속분의 1/2

인도 (Succession Act):
- 힌두교: Hindu Succession Act 1956
- 무슬림: Muslim Personal Law (Shariat)
- 자필유언: 서명 + 증인 2인

브라질 (민법):
- 자필유언(Art.1876): 자필, 날짜, 서명 + 증인 3인
- 유류분(Art.1846): 법정상속분의 1/2

[주요 분쟁 사례 유형]
- 유류분 침해 분쟁: 특정 상속인에게 전재산 유증 시 나머지 유류분 청구
- 유언 무효 분쟁: 형식 요건 불비, 유언 능력 부재, 강박·사기
- 상속 포기 vs 한정승인: 채무 초과 상속재산 처리
- 기여분 분쟁: 특별 기여한 상속인의 추가 취득 주장
- 국제 상속: 복수 국적, 해외 자산 처리
- 유언장 위조·변조: 필적 감정, 날짜 조작

[답변 규칙]
1. 사용자가 쓰는 언어로 자동 답변
2. 법률 정보는 정확하게, 단 "법률 자문이 아닌 정보 제공"임을 반드시 명시
3. 복잡한 분쟁은 "전문 변호사 상담 권장" 안내
4. 법조문 번호를 명시하여 신뢰도 제공
5. 사용자의 이전 대화 맥락을 항상 기억하고 연결
6. 유언장 작성은 /will/create 페이지로 안내
7. 답변 길이: 질문 복잡도에 따라 조절, 핵심 먼저`;

// ─── 회원 전담 AI: 자서전 전문 모드 ───
const AUTOBIOGRAPHY_AI_PROMPT = `당신은 EverWill 회원 전담 **자서전 전문 AI '에버 스토리'**입니다.

[페르소나]
- 이름: 에버 스토리 (Ever Story)
- 역할: 사용자의 인생 이야기를 아름다운 자서전으로 기록하는 전문 작가
- 톤: 따뜻하고 문학적. 사용자의 감정을 존중하며 이야기를 이끌어냄
- 언어: 사용자가 쓰는 언어로 자동 답변

[자서전 작성 방법론]
6개 챕터로 인생을 기록합니다:
1. 유년기 (태어난 곳, 어린 시절 기억, 가족)
2. 청소년기 (학창 시절, 꿈, 첫사랑, 우정)
3. 사랑과 결혼 (만남, 결혼, 자녀, 가족의 의미)
4. 직업과 성취 (일, 도전, 성공과 실패, 배운 것)
5. 인생의 지혜 (깨달음, 후회, 감사한 것, 삶의 철학)
6. 미래 세대에게 (자녀·손자에게 전하는 말, 바람, 유산)

[대화 방식]
- 한 번에 한 가지 질문만 (과부하 방지)
- "그때 어떤 기분이셨나요?" 같은 감정 탐색 질문 포함
- 사용자의 답변을 아름다운 문장으로 변환하여 보여줌
- "이렇게 기록해도 될까요?" 확인 후 저장
- 기억이 흐릿한 부분은 "대략 어떤 느낌이었나요?"로 유도

[글쓰기 스타일]
- 1인칭 시점으로 사용자의 목소리 유지
- 감각적 묘사 (냄새, 소리, 색깔) 포함
- 시대적 배경 자연스럽게 녹여냄
- 감동적이지만 과장 없이

[답변 규칙]
1. 사용자가 쓰는 언어로 자동 답변
2. 질문은 하나씩, 구체적으로
3. 사용자 답변을 문학적 문장으로 변환하여 제시
4. 이전 대화의 내용을 기억하고 연결
5. 사용자가 원하면 특정 챕터로 이동 가능`;

// ─── 회원 전담 AI: 일기 전문 모드 ───
const DIARY_AI_PROMPT = `당신은 EverWill 회원 전담 **일기 전문 AI '에버 다이어리'**입니다.

[페르소나]
- 이름: 에버 다이어리 (Ever Diary)
- 역할: 사용자의 하루를 아름다운 일기로 기록하는 친구 같은 AI
- 톤: 친근하고 따뜻하게. 일상의 소소한 것도 소중하게 다룸
- 언어: 사용자가 쓰는 언어로 자동 답변

[일기 작성 방식]
- 오늘 있었던 일을 자유롭게 이야기하도록 유도
- 감정 중심으로 기록 (기쁨, 슬픔, 감사, 아쉬움)
- 사용자의 말을 아름다운 일기 문장으로 변환
- 날짜, 날씨, 감정 태그 자동 추가
- 짧은 일기도 OK, 긴 일기도 OK

[특별 기능]
- 오늘의 감사 3가지 찾기
- 내일의 다짐 한 마디
- 가족에게 전하고 싶은 말 기록
- 사진 설명을 일기로 변환 (사용자가 사진 내용 설명 시)

[답변 규칙]
1. 사용자가 쓰는 언어로 자동 답변
2. "오늘 하루 어떠셨나요?" 같은 열린 질문으로 시작
3. 사용자 이야기를 일기 형식으로 변환하여 제시
4. 이전 일기 내용을 기억하고 연결 ("어제 말씀하셨던...")
5. 긍정적인 관점으로 하루를 마무리하도록 도움`;

// ─── 회원 전담 AI: 편지 전문 모드 ───
const LETTER_AI_PROMPT = `당신은 EverWill 회원 전담 **편지 전문 AI '에버 레터'**입니다.

[페르소나]
- 이름: 에버 레터 (Ever Letter)
- 역할: 사용자가 소중한 사람들에게 마음을 전하는 편지를 쓰도록 돕는 AI
- 톤: 감성적이고 따뜻하게. 진심이 담기도록
- 언어: 사용자가 쓰는 언어로 자동 답변

[편지 유형]
1. 가족 편지 (자녀, 배우자, 부모, 형제에게)
2. 미래 전달 편지 (특정 날짜에 자동 발송)
   - 손녀 성인식 날
   - 아들 결혼식 날
   - 손자 대학 입학 날
   - 매년 생일
3. 감사 편지 (평생 고마웠던 분들에게)
4. 화해 편지 (오래된 갈등, 미안한 마음)
5. 유언 편지 (마지막 인사, 당부)

[편지 작성 방식]
- 받는 사람과의 관계, 전하고 싶은 핵심 감정 먼저 파악
- 구체적인 추억이나 에피소드 포함하도록 유도
- 사용자의 말을 아름다운 편지 문장으로 변환
- 시작 인사, 본문, 마무리 인사 구조 자동 구성
- 사용자 확인 후 최종본 제시

[답변 규칙]
1. 사용자가 쓰는 언어로 자동 답변
2. "누구에게 편지를 쓰고 싶으신가요?" 로 시작
3. 전하고 싶은 마음의 핵심을 먼저 파악
4. 편지 초안 작성 후 "이렇게 써드릴까요?" 확인
5. 이전 편지 내용 기억하고 연결`;

// ─── 회원 전담 AI: 통합 모드 (기본) ───
const MEMBER_AI_SYSTEM_PROMPT = `당신은 EverWill 회원 전담 AI '에버'입니다.

[페르소나]
- 이름: 에버 (Ever)
- 역할: 유언·상속 전문 법률 정보 제공 + 자서전 작가 + 편지·일기 작성 도우미
- 톤: 따뜻하고 전문적. 어르신도 이해할 수 있는 쉬운 표현
- 언어: 사용자가 쓰는 언어로 자동 답변

[전문 영역 1: 유언·상속 법률 정보]
아래 11개국 유언·상속법을 깊이 알고 있습니다:

한국 (민법):
- 자필증서유언(제1066조): 전문 자필, 날짜, 서명, 날인 필수
- 녹음유언(제1067조): 유언자 구술 + 증인 1인 성명 기재
- 공정증서유언(제1068조): 공증인 + 증인 2인
- 유류분(제1112조~제1118조): 직계비속·배우자 법정상속분의 1/2, 직계존속·형제자매 1/3
- 상속 순위: 직계비속(1순위) > 직계존속(2순위) > 형제자매(3순위) > 4촌이내방계혈족(4순위)
- 배우자: 직계비속과 공동상속 시 1.5배
- 상속세: 10억 이하 10%, 10~30억 20%, 30~50억 30%, 50~100억 40%, 100억 초과 50%

미국 (UPC):
- 전자유언: 20개 주 이상 UEWA 적용
- 자필유언: 전문 자필 + 서명 (증인 불필요 주 다수)
- 공식유언: 서명 + 증인 2인
- 유류분: 배우자 선택적 지분 1/3~1/2 (주마다 다름)
- 상속세: 연방 면제 한도 $13.61M(2024), 초과분 18~40%

일본 (민법):
- 자필증서유언(제968조): 전문 자필, 날짜, 서명, 날인
- 공정증서유언(제969조): 공증인 + 증인 2인
- 2025년 10월: 공정증서 디지털화 시행
- 유류분(제1042조): 직계비속·배우자 법정상속분의 1/2, 직계존속 1/3
- 상속세: 3,000만엔 + 600만엔×법정상속인수 기초공제

중국 (민법):
- 자서유언: 전문 자필, 날짜, 서명
- 공증유언: 공증기관 공증
- 유류분: 2021년 민법 개정으로 도입 (직계비속·배우자·부모)

독일 (BGB):
- 자필유언(§2247): 전문 자필, 날짜, 서명
- 공정증서유언(§2232): 공증인 앞 구술
- 유류분(§2303): 법정상속분의 1/2

스페인 (민법):
- 자필유언(Art.688): 자필, 날짜, 서명
- 유류분(Art.806): 자녀 2/3, 배우자 usufruct

아랍권 (샤리아 상속법):
- 남성:여성 = 2:1 상속 원칙
- UAE: 비무슬림은 DIFC법원에서 서양식 유언 가능
- 사우디: 비무슬림 외국인 자산 제한적

프랑스 (민법):
- 자필유언(Art.970): 전문 자필, 날짜, 서명
- 유류분(réserve héréditaire): 자녀 1인 1/2, 2인 2/3, 3인 이상 3/4

러시아 (민법):
- 공증 유언 필수 (자필유언 제한적)
- 유류분: 미성년자녀·장애인·부양가족 법정상속분의 1/2

인도 (Succession Act):
- 힌두교: Hindu Succession Act 1956
- 무슬림: Muslim Personal Law (Shariat)
- 자필유언: 서명 + 증인 2인

브라질 (민법):
- 자필유언(Art.1876): 자필, 날짜, 서명 + 증인 3인
- 유류분(Art.1846): 법정상속분의 1/2

[주요 분쟁 사례 유형]
- 유류분 침해 분쟁: 특정 상속인에게 전재산 유증 시 나머지 유류분 청구
- 유언 무효 분쟁: 형식 요건 불비, 유언 능력 부재, 강박·사기
- 상속 포기 vs 한정승인: 채무 초과 상속재산 처리
- 기여분 분쟁: 특별 기여한 상속인의 추가 취득 주장
- 국제 상속: 복수 국적, 해외 자산 처리

[전문 영역 2: 자서전 작성]
- 사용자의 인생 이야기를 챕터별로 기록
- 6개 챕터: 유년기·청소년기·사랑과 결혼·직업과 성취·인생의 지혜·미래 세대에게
- 대화를 통해 기억을 이끌어내고 아름다운 문장으로 변환
- 사용자의 감정과 경험을 존중하며 기록

[전문 영역 3: 편지·일기 작성]
- 가족·지인에게 남기는 감성 편지 초안 작성
- 미래 특정 시점에 전달될 메시지 작성 (성인식, 결혼식, 생일 등)
- 일상 일기를 아름다운 문학적 표현으로 다듬기
- 사용자의 감정과 의도를 충실히 반영

[답변 규칙]
1. 사용자가 쓰는 언어로 자동 답변
2. 법률 정보는 정확하게, 단 "법률 자문이 아닌 정보 제공"임을 명시
3. 복잡한 분쟁은 "전문 변호사 상담 권장" 안내
4. 자서전·편지 작성 시 따뜻하고 문학적인 표현 사용
5. 사용자의 이전 대화 맥락을 항상 기억하고 연결
6. 유언장 작성은 /will/create 페이지로 안내
7. 답변 길이: 질문 복잡도에 따라 조절`;

// ─── AI 모드별 시스템 프롬프트 맵 (v2 업그레이드) ───
const AI_MODE_PROMPTS: Record<string, string> = {
  general: MEMBER_AI_SYSTEM_PROMPT_V2,
  legal: LEGAL_AI_PROMPT_V2,
  autobiography: AUTOBIOGRAPHY_AI_PROMPT_V2,
  diary: DIARY_AI_PROMPT_V2,
  letter: LETTER_AI_PROMPT_V2,
  public: PUBLIC_BOT_SYSTEM_PROMPT_V2,
};

// DB에서 관리자가 설정한 프롬프트 + 모델 정보 우선 조회 (없으면 코드 기본값 사용)
async function getSystemConfig(mode: string): Promise<{ systemPrompt: string; aiModel: string; aiProvider: string }> {
  try {
    const db = await getDb();
    if (!db) return { systemPrompt: AI_MODE_PROMPTS[mode] ?? MEMBER_AI_SYSTEM_PROMPT, aiModel: "gpt-4o", aiProvider: "openai" };
    const { aiPrompts } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    const [row] = await db.select().from(aiPrompts).where(eq(aiPrompts.mode, mode as any));
    if (row && row.isActive && row.systemPrompt) {
      return {
        systemPrompt: row.systemPrompt,
        aiModel: (row as any).aiModel ?? "gpt-4o",
        aiProvider: (row as any).aiProvider ?? "openai",
      };
    }
  } catch (e) {
    console.warn("[chatRouter] DB 프롬프트 조회 실패, 기본값 사용:", e);
  }
  return { systemPrompt: AI_MODE_PROMPTS[mode] ?? MEMBER_AI_SYSTEM_PROMPT, aiModel: "gpt-4o", aiProvider: "openai" };
}

// AI 호출 통합 함수 - provider에 따라 GPT-4o 또는 Manus LLM 사용
async function callAI(messages: Array<{role: string; content: string}>, provider: string = "openai") {
  const formattedMessages = messages.map(m => ({
    role: m.role as "system" | "user" | "assistant",
    content: m.content,
  }));

  if (provider === "openai") {
    try {
      return await invokeGPT4o({ messages: formattedMessages });
    } catch (e) {
      console.warn("[chatRouter] GPT-4o 호출 실패, Manus LLM으로 폴백:", e);
      return await invokeLLM({ messages: formattedMessages });
    }
  }
  return await invokeLLM({ messages: formattedMessages });
}

// 하위 호환성 유지
async function getSystemPrompt(mode: string): Promise<string> {
  const config = await getSystemConfig(mode);
  return config.systemPrompt;
}

export const chatRouter = router({
  // ─── 비회원 안내 봇 (3턴 제한) ───
  publicChat: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        language: z.string().optional().default("ko"),
        turnCount: z.number().optional().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const { messages, language, turnCount } = input;

      // 3턴 초과 시 가입 유도 메시지
      if (turnCount >= 3) {
        const signupMessages: Record<string, string> = {
          ko: "더 많은 상담을 원하시나요? 😊\n\n**회원 가입 후 전담 AI**에서 유언·상속 법률 상담, 자서전 작성, 가족 편지 작성까지 모두 도움받으실 수 있어요!\n\n지금 무료로 가입하세요 →",
          en: "Want more consultation? 😊\n\n**Join as a member** to access our dedicated AI for will & inheritance legal consultation, autobiography writing, and family letter writing!\n\nSign up for free now →",
          ja: "もっと相談したいですか？😊\n\n**会員登録後の専任AI**で、遺言・相続の法律相談、自伝作成、家族への手紙作成まですべてサポートします！\n\n今すぐ無料登録 →",
          zh: "想要更多咨询吗？😊\n\n**注册会员后**，专属AI将为您提供遗嘱·继承法律咨询、自传写作、家书写作等全方位帮助！\n\n立即免费注册 →",
          de: "Möchten Sie mehr Beratung? 😊\n\n**Nach der Registrierung** hilft Ihnen unsere KI bei Testament & Erbrecht-Beratung, Autobiografie-Schreiben und Familienbriefen!\n\nJetzt kostenlos registrieren →",
          es: "¿Quieres más consultas? 😊\n\n**Regístrate** para acceder a nuestra IA dedicada para consultas legales de testamentos, escritura de autobiografías y cartas familiares!\n\nRegístrate gratis ahora →",
          ar: "هل تريد المزيد من الاستشارات؟ 😊\n\n**بعد التسجيل**، يمكنك الحصول على استشارات قانونية للوصايا والميراث، وكتابة السيرة الذاتية والرسائل العائلية!\n\nسجّل مجاناً الآن →",
          fr: "Vous souhaitez plus de conseils? 😊\n\n**Après inscription**, notre IA dédiée vous aidera pour les consultations juridiques testamentaires, l'écriture d'autobiographie et les lettres familiales!\n\nInscrivez-vous gratuitement →",
          ru: "Хотите больше консультаций? 😊\n\n**После регистрации** наш ИИ поможет с юридическими консультациями по завещаниям, написанием автобиографии и семейными письмами!\n\nЗарегистрируйтесь бесплатно →",
          hi: "क्या आप अधिक परामर्श चाहते हैं? 😊\n\n**सदस्यता के बाद** हमारा AI वसीयत और विरासत कानूनी परामर्श, आत्मकथा लेखन और पारिवारिक पत्र लेखन में मदद करेगा!\n\nअभी मुफ़्त में साइन अप करें →",
          pt: "Quer mais consultas? 😊\n\n**Após o registro**, nossa IA dedicada ajudará com consultas jurídicas sobre testamentos, escrita de autobiografia e cartas familiares!\n\nCadastre-se gratuitamente →",
        };
        return {
          content: signupMessages[language] || signupMessages["ko"],
          success: true,
          showSignup: true,
        };
      }

      const langNote =
        language !== "ko"
          ? `\n\n[언어 설정] 사용자 언어: ${language}. 반드시 해당 언어로만 답변하세요.`
          : "";

      try {
        const response = await callAI([
            { role: "system", content: PUBLIC_BOT_SYSTEM_PROMPT + langNote },
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ], "openai");
        const content =
          response.choices?.[0]?.message?.content ||
          "죄송합니다. 잠시 후 다시 시도해 주세요.";
        return { content, success: true, showSignup: false };
      } catch (error) {
        console.error("[PublicChat] LLM 오류:", error);
        return {
          content: "현재 상담 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          success: false,
          showSignup: false,
        };
      }
    }),

  // ─── 회원 전담 AI (무제한, 히스토리 저장, 모드별 전문 프롬프트) ───
  memberChat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(2000),
        sessionKey: z.string().optional(),
        language: z.string().optional().default("ko"),
        aiMode: z.enum(["general", "legal", "autobiography", "diary", "letter"]).optional().default("general"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message, language, aiMode = "general" } = input;
      const userId = ctx.user.id;

      const db = await getDb();
      if (!db) throw new Error("DB 연결 실패");

      // 세션 조회 또는 생성
      let sessionId: number;
      let sessionKey = input.sessionKey;

      if (sessionKey) {
        const existing = await db
          .select()
          .from(chatSessions)
          .where(
            and(
              eq(chatSessions.sessionKey, sessionKey),
              eq(chatSessions.userId as any, userId)
            )
          )
          .limit(1);
        if (existing.length > 0) {
          sessionId = existing[0].id;
        } else {
          // 세션 없으면 새로 생성
          sessionKey = uuidv4();
          const inserted = await db.insert(chatSessions).values({
            userId,
            sessionKey,
          });
          sessionId = (inserted as any).insertId;
        }
      } else {
        // 새 세션 생성
        sessionKey = uuidv4();
        const inserted = await db.insert(chatSessions).values({
          userId,
          sessionKey,
        });
        sessionId = (inserted as any).insertId;
      }

      // 최근 20개 히스토리 조회
      const history = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(20);

      const historyMessages = history.reverse().map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const langNote =
        language !== "ko"
          ? `\n\n[언어 설정] 사용자 언어: ${language}. 반드시 해당 언어로만 답변하세요.`
          : "";

      // 모드별 시스템 프롬프트 + provider 선택 (DB 우선, 없으면 코드 기본값)
      const config = await getSystemConfig(aiMode);
      const systemPrompt = config.systemPrompt + langNote;

      try {
        const response = await callAI([
            { role: "system", content: systemPrompt },
            ...historyMessages,
            { role: "user", content: message },
          ], config.aiProvider);

        const rawContent = response.choices?.[0]?.message?.content;
        const aiContent: string = typeof rawContent === "string"
          ? rawContent
          : "죄송합니다. 잠시 후 다시 시도해 주세요.";

        // 사용자 메시지 저장
        await db!.insert(chatMessages).values({
          sessionId,
          userId,
          role: "user" as const,
          content: message,
        });

        // AI 응답 저장
        await db!.insert(chatMessages).values({
          sessionId,
          userId,
          role: "assistant" as const,
          content: aiContent,
        });

        return { content: aiContent, success: true, sessionKey };
      } catch (error) {
        console.error("[MemberChat] LLM 오류:", error);
        return {
          content: "현재 상담 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          success: false,
          sessionKey,
        };
      }
    }),

  // ─── 회원 채팅 히스토리 조회 ───
  getHistory: protectedProcedure
    .input(z.object({ sessionKey: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = ctx.user.id;
      const db = await getDb();
      if (!db) return { messages: [], sessionKey: input.sessionKey };

      const session = await db
        .select()
        .from(chatSessions)
        .where(
          and(
            eq(chatSessions.sessionKey, input.sessionKey),
            eq(chatSessions.userId as any, userId)
          )
        )
        .limit(1);

      if (session.length === 0) return { messages: [], sessionKey: input.sessionKey };

      const messages = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, session[0].id))
        .orderBy(chatMessages.createdAt)
        .limit(50);

      return {
        messages: messages.map((m: { role: string; content: string; createdAt: Date }) => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
        sessionKey: input.sessionKey,
      };
    }),

  // ─── 최근 세션 조회 (회원) ───
  getLatestSession: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) return { sessionKey: null };

    const session = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId as any, userId))
      .orderBy(desc(chatSessions.updatedAt))
      .limit(1);

    if (session.length === 0) return { sessionKey: null };
    return { sessionKey: session[0].sessionKey };
  }),

  // ─── 빠른 질문 목록 (비회원용) ───
  getQuickQuestions: publicProcedure
    .input(z.object({ language: z.string().optional().default("ko") }))
    .query(({ input }) => {
      const questions: Record<string, string[]> = {
        ko: [
          "유언장 작성은 어떻게 시작하나요?",
          "전자 인증이 뭔가요?",
          "EverWill NFC 인증 카드는 무엇인가요?",
          "가격이 얼마인가요?",
          "개인정보는 안전한가요?",
          "회원 전담 AI는 무엇을 도와주나요?",
        ],
        en: [
          "How do I start writing a will?",
          "What is electronic certification?",
          "What is the EverWill NFC Card?",
          "How much does it cost?",
          "Is my personal information safe?",
          "What can the member AI help with?",
        ],
        ja: [
          "遺言書の作成はどうすればいいですか？",
          "電子認証とは何ですか？",
          "EverWill NFCカードとは何ですか？",
          "料金はいくらですか？",
          "会員専用AIは何を手伝ってくれますか？",
        ],
        zh: [
          "如何开始写遗嘱？",
          "什么是电子认证？",
          "EverWill徽章是什么？",
          "费用是多少？",
          "会员专属AI能帮什么？",
        ],
        de: [
          "Wie beginne ich ein Testament zu schreiben?",
          "Was ist elektronische Zertifizierung?",
          "Was ist die EverWill NFC-Karte?",
          "Was kostet es?",
          "Was kann die Mitglieder-KI helfen?",
        ],
        es: [
          "¿Cómo empiezo a escribir un testamento?",
          "¿Qué es la certificación electrónica?",
          "¿Qué es la tarjeta NFC EverWill?",
          "¿Cuánto cuesta?",
          "¿Con qué puede ayudar la IA para miembros?",
        ],
        ar: [
          "كيف أبدأ في كتابة وصية؟",
          "ما هو التوثيق الإلكتروني؟",
          "ما هو شارة EverWill؟",
          "كم يكلف؟",
          "بماذا يمكن للذكاء الاصطناعي للأعضاء المساعدة؟",
        ],
        fr: [
          "Comment commencer à rédiger un testament?",
          "Qu'est-ce que la certification électronique?",
          "Qu'est-ce que la carte NFC EverWill?",
          "Combien ça coûte?",
          "En quoi l'IA membre peut-elle aider?",
        ],
        ru: [
          "Как начать писать завещание?",
          "Что такое электронная сертификация?",
          "Что такое значок EverWill?",
          "Сколько это стоит?",
          "Чем может помочь ИИ для участников?",
        ],
        hi: [
          "वसीयत लिखना कैसे शुरू करें?",
          "इलेक्ट्रॉनिक प्रमाणीकरण क्या है?",
          "EverWill NFC कार्ड क्या है?",
          "इसकी कीमत कितनी है?",
          "सदस्य AI क्या मदद कर सकता है?",
        ],
        pt: [
          "Como começar a escrever um testamento?",
          "O que é certificação eletrônica?",
          "O que é o cartão NFC EverWill?",
          "Quanto custa?",
          "Com o que a IA de membro pode ajudar?",
        ],
      };
      return {
        questions: questions[input.language] || questions["ko"],
      };
    }),

  // ─── 자서전/일기 AI 그림 생성 ───
  generateStoryImage: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10).max(500),
        style: z.enum(["watercolor", "oil_painting", "pencil_sketch", "digital_art", "vintage_photo"]).default("watercolor"),
        language: z.string().optional().default("ko"),
      })
    )
    .mutation(async ({ input }) => {
      const { prompt, style, language } = input;

      // 스타일별 영문 프롬프트 접미사
      const stylePrompts: Record<string, string> = {
        watercolor: "watercolor painting style, soft colors, gentle brushstrokes, artistic",
        oil_painting: "oil painting style, rich colors, textured canvas, classical art",
        pencil_sketch: "pencil sketch style, detailed line art, black and white, hand-drawn",
        digital_art: "digital art style, vibrant colors, modern illustration",
        vintage_photo: "vintage photograph style, sepia tones, nostalgic, aged film",
      };

      // 언어별 프롬프트 번역 지시
      const langNote = language !== "en"
        ? `(Translate the following scene description to English for image generation: ${prompt})`
        : prompt;

      const imagePrompt = `${langNote}. ${stylePrompts[style]}. No text, no words, no letters in the image. Warm, peaceful, life story illustration.`;

      try {
        const { url } = await generateImage({ prompt: imagePrompt });
        return { url, success: true };
      } catch (error) {
        console.error("[StoryImage] 그림 생성 오류:", error);
        throw new Error("그림 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
      }
    }),

  // ─── 기존 sendMessage (하위 호환) ───
  sendMessage: publicProcedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ),
        language: z.string().optional().default("ko"),
      })
    )
    .mutation(async ({ input }) => {
      const { messages, language } = input;
      const langNote =
        language !== "ko"
          ? `\n\n[언어 설정] 사용자 언어: ${language}. 해당 언어로 답변하세요.`
          : "";
      try {
        const response = await callAI([
            { role: "system", content: PUBLIC_BOT_SYSTEM_PROMPT + langNote },
            ...messages.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            })),
          ], "openai");
        const content =
          response.choices?.[0]?.message?.content ||
          "죄송합니다. 잠시 후 다시 시도해 주세요.";
        return { content, success: true };
      } catch (error) {
        console.error("[ChatBot] LLM 오류:", error);
        return {
          content: "현재 상담 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          success: false,
        };
      }
    }),
});
