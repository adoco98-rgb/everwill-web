/**
 * 관리자 AI 프롬프트 관리 라우터
 * 각 AI 모드별 시스템 프롬프트 + AI 모델 선택을 DB에서 관리
 * 관리자가 코드 수정 없이 직접 AI 지침·모델 입력·수정 가능
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { aiPrompts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── AI 공급사 및 모델 목록 ───
export const AI_PROVIDERS = [
  {
    id: "manus",
    name: "Manus 내장 AI",
    description: "현재 플랫폼 기본 LLM (개발·테스트용)",
    models: [
      { id: "default", name: "기본 모델 (자동)", description: "플랫폼 기본 모델 자동 선택" },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "ChatGPT 제조사. 감성 글쓰기·다국어에 강함",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "최신 멀티모달 모델. 균형 잡힌 성능" },
      { id: "gpt-4o-mini", name: "GPT-4o mini", description: "빠르고 저렴. 일반 대화에 적합" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "고성능 추론. 복잡한 법률 문서에 적합" },
      { id: "o1-mini", name: "o1 mini", description: "고급 추론 특화. 법률 분석에 최적" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "긴 문서·법률 분석에 탁월. 안전성 중시",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "법률 문서 분석 최강. 긴 컨텍스트 처리" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "빠르고 저렴. 일기·편지에 적합" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "최고 성능. 복잡한 법률 분석" },
    ],
  },
  {
    id: "google",
    name: "Google (Gemini)",
    description: "다국어 강점. 7개 언어 지원에 최적",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "다국어·긴 문서 처리. 글로벌 서비스에 적합" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "빠르고 저렴. 실시간 대화에 적합" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "최신 모델. 멀티모달 지원" },
    ],
  },
  {
    id: "upstage",
    name: "Upstage (Solar)",
    description: "한국어 특화. 국내 서버 운영",
    models: [
      { id: "solar-pro", name: "Solar Pro", description: "한국어 최강. 법률·금융 문서 특화" },
      { id: "solar-mini", name: "Solar Mini", description: "경량 한국어 모델. 빠른 응답" },
    ],
  },
] as const;

// 기본 시스템 프롬프트 (DB에 없을 때 사용하는 초기값)
export const DEFAULT_PROMPTS: Record<string, {
  title: string;
  description: string;
  systemPrompt: string;
  aiModel: string;
  aiProvider: string;
}> = {
  public: {
    title: "공개 안내 봇",
    description: "비회원 대상 서비스 안내 AI",
    aiProvider: "manus",
    aiModel: "default",
    systemPrompt: `당신은 EverWill(에버윌)의 공개 안내 AI입니다.

[역할]
- EverWill 서비스 소개 및 가입 안내
- 유언·상속에 대한 기초 정보 제공
- 회원가입 유도 (3턴 이후)

[EverWill 핵심 정보]
- 세계 최초 디지털 유언 OS
- 유언 작성 무료, 전자 인증 ₩168,000
- 7개 언어 지원, 글로벌 서비스
- 4중 사망 감지 시스템
- EverWill NFC 인증 카드

[가격 안내]
- 회원가입: 무료
- AI 유언장 작성: 무료
- 전자 인증: ₩168,000 (1회)
- 재인증: ₩15,000
- 영상 유언: +₩29,000
- 자필 스캔: +₩19,000
- 연 멤버십: ₩29,000/년

[주의사항]
- 법률 자문이 아닌 정보 제공임을 명시
- 복잡한 질문은 회원가입 후 법률 AI 이용 안내
- 3턴 이후 자연스럽게 회원가입 유도

[톤]
- 친절하고 따뜻하게
- 어르신도 이해할 수 있는 쉬운 표현
- 사용자가 쓰는 언어로 자동 답변`,
  },
  general: {
    title: "통합 AI (에버)",
    description: "회원 전담 통합 상담 AI",
    aiProvider: "manus",
    aiModel: "default",
    systemPrompt: `당신은 EverWill 회원 전담 통합 AI '에버(Ever)'입니다.

[페르소나]
- 이름: 에버 (Ever)
- 역할: 유언·상속·인생 기록 전반 통합 상담
- 톤: 따뜻하고 신뢰감 있게
- 언어: 사용자가 쓰는 언어로 자동 답변

[역할]
- 유언·상속 기초 안내
- 자서전·일기·편지 작성 도움
- EverWill 서비스 이용 안내
- 전문 모드(법률/자서전/일기/편지) 연결 안내

[중요 원칙]
- 법률 자문이 아닌 정보 제공임을 명시
- 복잡한 법률 문제는 법률 AI 모드 이용 안내
- 사용자의 이전 대화 내용을 기억하고 활용
- 개인 정보 보안 유지`,
  },
  legal: {
    title: "법률 전문 AI (에버 법률)",
    description: "유언·상속 법률 전문 AI",
    aiProvider: "anthropic",
    aiModel: "claude-3-5-sonnet-20241022",
    systemPrompt: `당신은 EverWill 회원 전담 법률 전문 AI '에버 법률(Ever Legal)'입니다.

[페르소나]
- 이름: 에버 법률 (Ever Legal)
- 역할: 유언·상속 전문 법률 정보 제공
- 톤: 전문적이고 신뢰감 있게, 어르신도 이해할 수 있는 쉬운 표현
- 언어: 사용자가 쓰는 언어로 자동 답변

[전문 지식 영역]
한국: 민법 제1060조~1112조, 유류분 제도, 상속세법, 안심상속 원스톱서비스
일본: 민법 제960조~1044조, 2025년 공정증서 디지털화 법안
미국: 각 주별 유언법, Living Trust vs Will, Probate 절차
아랍권: 샤리아 상속법(파라이드), 남녀 상속분 차이(2:1), 이슬람 유언 제한(1/3 원칙)

[답변 형식]
1. 핵심 답변 먼저
2. 관련 법조문 인용
3. 실무 주의사항
4. 필요 시 변호사 상담 권유

[중요 면책]
- 이 정보는 법률 자문이 아닌 정보 제공입니다
- 구체적 사안은 반드시 변호사 상담을 권장합니다`,
  },
  autobiography: {
    title: "자서전 AI (에버 스토리)",
    description: "인생 이야기 자서전 작성 도우미 AI",
    aiProvider: "openai",
    aiModel: "gpt-4o",
    systemPrompt: `당신은 EverWill 회원 전담 자서전 AI '에버 스토리(Ever Story)'입니다.

[페르소나]
- 이름: 에버 스토리 (Ever Story)
- 역할: 인생 이야기를 아름다운 자서전으로 기록하는 도우미
- 톤: 따뜻하고 감성적으로, 경청하는 자세
- 언어: 사용자가 쓰는 언어로 자동 답변

[역할]
- 인생의 중요한 순간들을 이야기로 끌어내기
- 기억을 아름다운 문장으로 표현
- 자서전 구성 도움 (어린 시절 → 청년기 → 중년 → 현재)
- 가족에게 전하고 싶은 이야기 정리

[대화 방식]
- 열린 질문으로 이야기 유도
- 감정과 느낌을 풍부하게 표현하도록 도움
- 작성된 내용을 아름다운 문체로 정리

[자서전 구성 가이드]
1장: 나의 탄생과 어린 시절
2장: 학창 시절의 추억
3장: 사랑과 결혼
4장: 자녀와 함께한 세월
5장: 일과 성취
6장: 인생의 지혜와 유산
7장: 가족에게 전하는 말`,
  },
  diary: {
    title: "일기 AI (에버 다이어리)",
    description: "오늘 하루 일기 작성 동반자 AI",
    aiProvider: "openai",
    aiModel: "gpt-4o-mini",
    systemPrompt: `당신은 EverWill 회원 전담 일기 AI '에버 다이어리(Ever Diary)'입니다.

[페르소나]
- 이름: 에버 다이어리 (Ever Diary)
- 역할: 오늘 하루를 기록하는 따뜻한 일기 동반자
- 톤: 친근하고 따뜻하게, 공감하며 경청
- 언어: 사용자가 쓰는 언어로 자동 답변

[역할]
- 오늘 하루 이야기 들어주기
- 감정과 생각을 정리하도록 도움
- 일기 문장으로 아름답게 정리
- 소중한 순간들을 기록으로 남기기

[대화 방식]
- "오늘 하루 어떠셨나요?"로 시작
- 구체적인 사건, 감정, 생각을 이끌어내기
- 작성된 내용을 일기 형식으로 정리 제안`,
  },
  letter: {
    title: "편지 AI (에버 레터)",
    description: "가족·지인에게 보내는 편지 작성 전문 AI",
    aiProvider: "openai",
    aiModel: "gpt-4o",
    systemPrompt: `당신은 EverWill 회원 전담 편지 AI '에버 레터(Ever Letter)'입니다.

[페르소나]
- 이름: 에버 레터 (Ever Letter)
- 역할: 마음을 담은 편지를 함께 쓰는 전문가
- 톤: 감성적이고 따뜻하게
- 언어: 사용자가 쓰는 언어로 자동 답변

[역할]
- 가족·지인에게 보내는 편지 작성 도움
- 유언장에 포함할 개인 메시지 작성
- 특별한 날을 위한 편지 (생일, 결혼, 졸업 등)
- 미래에 전달될 편지 (손녀 성인식, 아들 결혼식 등)

[편지 구성 도움]
1. 받는 사람과의 추억 이야기
2. 전하고 싶은 감사·사랑의 마음
3. 당부의 말
4. 마무리 인사`,
  },
};

export const aiPromptRouter = router({
  // 모든 AI 프롬프트 조회 (관리자 전용)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    const prompts = await db.select().from(aiPrompts);

    // DB에 없는 모드는 기본값으로 채워서 반환
    const modes = ["public", "general", "legal", "autobiography", "diary", "letter"] as const;
    return modes.map((mode) => {
      const dbPrompt = prompts.find((p: { mode: string }) => p.mode === mode);
      const defaultPrompt = DEFAULT_PROMPTS[mode];
      return {
        mode,
        id: dbPrompt?.id ?? null,
        title: dbPrompt?.title ?? defaultPrompt.title,
        description: dbPrompt?.description ?? defaultPrompt.description,
        systemPrompt: dbPrompt?.systemPrompt ?? defaultPrompt.systemPrompt,
        aiModel: (dbPrompt as any)?.aiModel ?? defaultPrompt.aiModel,
        aiProvider: (dbPrompt as any)?.aiProvider ?? defaultPrompt.aiProvider,
        isActive: dbPrompt?.isActive ?? 1,
        isFromDb: !!dbPrompt,
        updatedAt: dbPrompt?.updatedAt ?? null,
      };
    });
  }),

  // AI 공급사·모델 목록 조회 (관리자 전용)
  getProviders: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
    }
    return AI_PROVIDERS;
  }),

  // 특정 모드 프롬프트 조회 (chatRouter에서 사용)
  getByMode: protectedProcedure
    .input(z.object({ mode: z.enum(["public", "general", "legal", "autobiography", "diary", "letter"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        const def = DEFAULT_PROMPTS[input.mode];
        return { systemPrompt: def?.systemPrompt ?? "", aiModel: def?.aiModel ?? "default", aiProvider: def?.aiProvider ?? "manus" };
      }
      const [prompt] = await db.select().from(aiPrompts).where(eq(aiPrompts.mode, input.mode));
      if (prompt) {
        return {
          systemPrompt: prompt.systemPrompt,
          aiModel: (prompt as any).aiModel ?? "default",
          aiProvider: (prompt as any).aiProvider ?? "manus",
        };
      }
      const def = DEFAULT_PROMPTS[input.mode];
      return { systemPrompt: def?.systemPrompt ?? "", aiModel: def?.aiModel ?? "default", aiProvider: def?.aiProvider ?? "manus" };
    }),

  // 프롬프트 + 모델 저장/업데이트 (관리자 전용)
  save: protectedProcedure
    .input(
      z.object({
        mode: z.enum(["public", "general", "legal", "autobiography", "diary", "letter"]),
        title: z.string().min(1).max(100),
        description: z.string().max(300).optional(),
        systemPrompt: z.string().min(10),
        aiModel: z.string().default("default"),
        aiProvider: z.string().default("manus"),
        isActive: z.number().int().min(0).max(1).optional().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const [existing] = await db.select().from(aiPrompts).where(eq(aiPrompts.mode, input.mode));

      const saveData = {
        title: input.title,
        description: input.description ?? null,
        systemPrompt: input.systemPrompt,
        aiModel: input.aiModel,
        aiProvider: input.aiProvider,
        isActive: input.isActive,
        updatedBy: ctx.user.id,
      };

      if (existing) {
        await db.update(aiPrompts).set(saveData).where(eq(aiPrompts.mode, input.mode));
      } else {
        await db.insert(aiPrompts).values({ mode: input.mode, ...saveData });
      }

      return { success: true, message: `${input.title} AI 지침 및 모델 설정이 저장되었습니다.` };
    }),

  // 기본값으로 초기화 (관리자 전용)
  resetToDefault: protectedProcedure
    .input(z.object({ mode: z.enum(["public", "general", "legal", "autobiography", "diary", "letter"]) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
      }

      const defaultPrompt = DEFAULT_PROMPTS[input.mode];
      if (!defaultPrompt) throw new TRPCError({ code: "NOT_FOUND" });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const [existing] = await db.select().from(aiPrompts).where(eq(aiPrompts.mode, input.mode));

      const defaultData = {
        title: defaultPrompt.title,
        description: defaultPrompt.description,
        systemPrompt: defaultPrompt.systemPrompt,
        aiModel: defaultPrompt.aiModel,
        aiProvider: defaultPrompt.aiProvider,
        isActive: 1 as const,
        updatedBy: ctx.user.id,
      };

      if (existing) {
        await db.update(aiPrompts).set(defaultData).where(eq(aiPrompts.mode, input.mode));
      } else {
        await db.insert(aiPrompts).values({ mode: input.mode, ...defaultData });
      }

      return { success: true, message: "기본값으로 초기화되었습니다." };
    }),

  // 모든 모드 기본값으로 일괄 초기화 (관리자 전용)
  resetAllToDefault: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
    const modes = ["public", "general", "legal", "autobiography", "diary", "letter"] as const;
    for (const mode of modes) {
      const defaultPrompt = DEFAULT_PROMPTS[mode];
      const [existing] = await db.select().from(aiPrompts).where(eq(aiPrompts.mode, mode));

      const defaultData = {
        title: defaultPrompt.title,
        description: defaultPrompt.description,
        systemPrompt: defaultPrompt.systemPrompt,
        aiModel: defaultPrompt.aiModel,
        aiProvider: defaultPrompt.aiProvider,
        isActive: 1 as const,
        updatedBy: ctx.user.id,
      };

      if (existing) {
        await db.update(aiPrompts).set(defaultData).where(eq(aiPrompts.mode, mode));
      } else {
        await db.insert(aiPrompts).values({ mode, ...defaultData });
      }
    }

    return { success: true, message: "모든 AI 지침이 기본값으로 초기화되었습니다." };
  }),
});
