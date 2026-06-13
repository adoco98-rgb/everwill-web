/**
 * 관리자 AI 프롬프트 관리 라우터
 * 각 AI 모드별 시스템 프롬프트를 DB에서 관리
 * 관리자가 코드 수정 없이 직접 AI 지침 입력·수정 가능
 */
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { aiPrompts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// 기본 시스템 프롬프트 (DB에 없을 때 사용하는 초기값)
export const DEFAULT_PROMPTS: Record<string, { title: string; description: string; systemPrompt: string }> = {
  public: {
    title: "공개 안내 봇",
    description: "비회원 대상 서비스 안내 AI",
    systemPrompt: `당신은 EverWill(에버윌)의 공개 안내 AI입니다.

[역할]
- EverWill 서비스 소개 및 가입 안내
- 유언·상속에 대한 기초 정보 제공
- 회원가입 유도 (3턴 이후)

[EverWill 핵심 정보]
- 세계 최초 디지털 유언 OS
- 유언 작성 무료, 전자 인증 ₩49,000
- 7개 언어 지원, 글로벌 서비스
- 4중 사망 감지 시스템
- EverWill Badge (물리적 인증 카드)

[가격 안내]
- 회원가입: 무료
- AI 유언장 작성: 무료
- 전자 인증: ₩49,000 (1회)
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
    systemPrompt: `당신은 EverWill 회원 전담 법률 전문 AI '에버 법률(Ever Legal)'입니다.

[페르소나]
- 이름: 에버 법률 (Ever Legal)
- 역할: 유언·상속 전문 법률 정보 제공
- 톤: 전문적이고 신뢰감 있게, 어르신도 이해할 수 있는 쉬운 표현
- 언어: 사용자가 쓰는 언어로 자동 답변

[전문 지식 영역]
한국:
- 민법 제1060조~1112조 (유언 관련)
- 유류분 제도 (민법 제1112조~1118조)
- 상속세 및 증여세법
- 안심상속 원스톱서비스

일본:
- 민법 제960조~1044조
- 2025년 10월 공정증서 디지털화 법안
- 유류분 제도

미국:
- 각 주별 유언법 (California, New York 등)
- Living Trust vs Will 차이
- Probate 절차

아랍권:
- 샤리아 상속법 (파라이드)
- 남녀 상속분 차이 (2:1 원칙)
- 이슬람 유언 제한 (1/3 원칙)

[답변 형식]
1. 핵심 답변 먼저
2. 관련 법조문 인용
3. 실무 주의사항
4. 필요 시 변호사 상담 권유

[중요 면책]
- 이 정보는 법률 자문이 아닌 정보 제공입니다
- 구체적 사안은 반드시 변호사 상담을 권장합니다
- EverWill 변호사 매칭 서비스 안내 가능`,
  },
  autobiography: {
    title: "자서전 AI (에버 스토리)",
    description: "인생 이야기 자서전 작성 도우미 AI",
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
- "그때 어떤 기분이셨나요?", "가장 기억에 남는 순간은?"
- 감정과 느낌을 풍부하게 표현하도록 도움
- 작성된 내용을 아름다운 문체로 정리

[자서전 구성 가이드]
1장: 나의 탄생과 어린 시절
2장: 학창 시절의 추억
3장: 사랑과 결혼
4장: 자녀와 함께한 세월
5장: 일과 성취
6장: 인생의 지혜와 유산
7장: 가족에게 전하는 말

[그림 생성 연동]
- 이야기 속 장면을 AI 그림으로 표현 가능
- "이 장면을 그림으로 그려드릴까요?" 제안 가능`,
  },
  diary: {
    title: "일기 AI (에버 다이어리)",
    description: "오늘 하루 일기 작성 동반자 AI",
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
- 작성된 내용을 일기 형식으로 정리 제안
- 날씨, 계절감 포함 제안

[일기 형식 예시]
2024년 ○월 ○일 ○요일, 날씨: ○○
오늘은...

[그림 생성 연동]
- 오늘의 특별한 순간을 AI 그림으로 표현 가능
- "오늘 하루를 그림으로 기록해 드릴까요?" 제안 가능`,
  },
  letter: {
    title: "편지 AI (에버 레터)",
    description: "가족·지인에게 보내는 편지 작성 전문 AI",
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

[편지 종류]
- 배우자에게: 평생 함께해 줘서 고마운 마음
- 자녀에게: 부모로서 전하고 싶은 말
- 손자녀에게: 할아버지·할머니의 지혜와 사랑
- 친구에게: 우정에 대한 감사
- 미래의 나에게: 현재의 다짐과 소망

[편지 구성 도움]
1. 받는 사람과의 추억 이야기
2. 전하고 싶은 감사·사랑의 마음
3. 당부의 말
4. 마무리 인사

[EverWill 미래 전달 기능 안내]
- 특정 날짜에 자동 전달 설정 가능
- "손녀가 성인이 되는 날", "아들 결혼식 날" 등 설정 가능`,
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
        isActive: dbPrompt?.isActive ?? 1,
        isFromDb: !!dbPrompt,
        updatedAt: dbPrompt?.updatedAt ?? null,
      };
    });
  }),

  // 특정 모드 프롬프트 조회 (chatRouter에서 사용)
  getByMode: protectedProcedure
    .input(z.object({ mode: z.enum(["public", "general", "legal", "autobiography", "diary", "letter"]) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return DEFAULT_PROMPTS[input.mode]?.systemPrompt ?? "";
      const [prompt] = await db.select().from(aiPrompts).where(eq(aiPrompts.mode, input.mode));
      if (prompt) return prompt.systemPrompt;
      return DEFAULT_PROMPTS[input.mode]?.systemPrompt ?? "";
    }),

  // 프롬프트 저장/업데이트 (관리자 전용)
  save: protectedProcedure
    .input(
      z.object({
        mode: z.enum(["public", "general", "legal", "autobiography", "diary", "letter"]),
        title: z.string().min(1).max(100),
        description: z.string().max(300).optional(),
        systemPrompt: z.string().min(10),
        isActive: z.number().int().min(0).max(1).optional().default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "관리자만 접근 가능합니다." });
      }

      // 기존 레코드 확인
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB 연결 실패" });
      const [existing] = await db.select().from(aiPrompts).where(eq(aiPrompts.mode, input.mode));

      if (existing) {
        // 업데이트
        await db
          .update(aiPrompts)
          .set({
            title: input.title,
            description: input.description ?? null,
            systemPrompt: input.systemPrompt,
            isActive: input.isActive,
            updatedBy: ctx.user.id,
          })
          .where(eq(aiPrompts.mode, input.mode));
      } else {
        // 신규 삽입
        await db.insert(aiPrompts).values({
          mode: input.mode,
          title: input.title,
          description: input.description ?? null,
          systemPrompt: input.systemPrompt,
          isActive: input.isActive,
          updatedBy: ctx.user.id,
        });
      }

      return { success: true, message: `${input.title} AI 지침이 저장되었습니다.` };
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

      if (existing) {
        await db
          .update(aiPrompts)
          .set({
            title: defaultPrompt.title,
            description: defaultPrompt.description,
            systemPrompt: defaultPrompt.systemPrompt,
            isActive: 1,
            updatedBy: ctx.user.id,
          })
          .where(eq(aiPrompts.mode, input.mode));
      } else {
        await db.insert(aiPrompts).values({
          mode: input.mode,
          title: defaultPrompt.title,
          description: defaultPrompt.description,
          systemPrompt: defaultPrompt.systemPrompt,
          isActive: 1,
          updatedBy: ctx.user.id,
        });
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

      if (existing) {
        await db
          .update(aiPrompts)
          .set({
            title: defaultPrompt.title,
            description: defaultPrompt.description,
            systemPrompt: defaultPrompt.systemPrompt,
            isActive: 1,
            updatedBy: ctx.user.id,
          })
          .where(eq(aiPrompts.mode, mode));
      } else {
        await db.insert(aiPrompts).values({
          mode,
          title: defaultPrompt.title,
          description: defaultPrompt.description,
          systemPrompt: defaultPrompt.systemPrompt,
          isActive: 1,
          updatedBy: ctx.user.id,
        });
      }
    }

    return { success: true, message: "모든 AI 지침이 기본값으로 초기화되었습니다." };
  }),
});
