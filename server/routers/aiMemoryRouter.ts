/**
 * 개인 AI 메모리 라우터
 * 사용자별 완전 격리된 AI 메모리 시스템
 * - 대화에서 자동으로 중요 정보 추출하여 메모리에 저장
 * - AI 생성 시 해당 사용자의 메모리만 참조 (다른 사용자 접근 불가)
 * - 자서전/일기/편지 작성 시 개인화된 컨텍스트 제공
 */
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { aiMemories, aiConversations, users } from "../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// ===== 메모리 카테고리 한국어 라벨 =====
const CATEGORY_LABELS: Record<string, string> = {
  basic_info: "기본 정보",
  family: "가족 관계",
  career: "직업·경력",
  values: "인생관·가치관",
  life_events: "중요한 사건",
  emotions: "성격·감정",
  hobbies: "취미·관심사",
  health: "건강·병력",
  wishes: "소원·바람",
  diary_summary: "일기 요약",
  letter_summary: "편지 요약",
  conversation: "대화 기록",
};

// ===== 개인 컨텍스트 빌더 =====
// 사용자의 메모리를 AI 프롬프트에 주입할 텍스트로 변환
export async function buildPersonalContext(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "";

  // 중요도 높은 순으로 최대 20개 메모리 조회 (해당 사용자 것만)
  const memories = await db
    .select()
    .from(aiMemories)
    .where(eq(aiMemories.userId, userId))
    .orderBy(desc(aiMemories.importance), desc(aiMemories.usageCount))
    .limit(20);

  if (memories.length === 0) return "";

  // 카테고리별로 그룹화
  const grouped: Record<string, string[]> = {};
  for (const mem of memories) {
    const cat = mem.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(mem.content);
  }

  // 컨텍스트 텍스트 생성
  const lines: string[] = ["=== 이 사람에 대해 알고 있는 정보 ==="];
  for (const [cat, contents] of Object.entries(grouped)) {
    lines.push(`[${CATEGORY_LABELS[cat] ?? cat}]`);
    contents.forEach(c => lines.push(`- ${c}`));
  }
  lines.push("=== 위 정보를 바탕으로 개인화된 응답을 제공하세요 ===");

  // 사용 횟수 업데이트
  await db
    .update(aiMemories)
    .set({ lastUsedAt: new Date(), usageCount: sql`usageCount + 1` })
    .where(eq(aiMemories.userId, userId));

  return lines.join("\n");
}

// ===== 대화에서 메모리 자동 추출 =====
async function extractMemoriesFromConversation(
  userId: number,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const extractRes = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `당신은 대화에서 개인 정보를 추출하는 AI입니다.
사용자의 대화에서 기억할 만한 중요한 개인 정보를 추출하세요.
반드시 JSON 배열 형식으로만 응답하세요.

추출 가능한 카테고리:
- basic_info: 이름, 나이, 생년월일, 고향, 현재 거주지
- family: 가족 구성원, 가족 관계, 가족 이야기
- career: 직업, 경력, 회사, 업적, 은퇴
- values: 인생관, 가치관, 신념, 종교
- life_events: 중요한 사건, 기억에 남는 경험
- emotions: 성격, 감정 패턴, 좋아하는 것/싫어하는 것
- hobbies: 취미, 관심사, 특기
- health: 건강 상태, 병력, 복용 약물
- wishes: 소원, 바람, 미래 계획, 유언 관련 희망

응답 형식 (JSON 배열):
[{"category": "카테고리명", "content": "추출된 정보", "importance": 중요도(1-5)}]

중요하지 않으면 빈 배열 [] 반환.`,
        },
        {
          role: "user",
          content: `사용자 메시지: "${userMessage}"\nAI 응답: "${assistantResponse.slice(0, 500)}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "memory_extraction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              memories: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    content: { type: "string" },
                    importance: { type: "integer" },
                  },
                  required: ["category", "content", "importance"],
                  additionalProperties: false,
                },
              },
            },
            required: ["memories"],
            additionalProperties: false,
          },
        },
      },
    });

    const rawContent = extractRes.choices?.[0]?.message?.content;
    if (!rawContent) return;
    const rawStr = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
    if (!rawStr) return;

    const parsed = JSON.parse(rawStr) as { memories: Array<{ category: string; content: string; importance: number }> };
    const validCategories = Object.keys(CATEGORY_LABELS);

    for (const mem of parsed.memories) {
      if (!validCategories.includes(mem.category)) continue;
      if (!mem.content || mem.content.length < 5) continue;

      // 중복 체크 (같은 카테고리에 유사한 내용이 있으면 스킵)
      const existing = await db
        .select({ id: aiMemories.id })
        .from(aiMemories)
        .where(and(
          eq(aiMemories.userId, userId),
          eq(aiMemories.category, mem.category as any),
        ))
        .limit(5);

      // 최대 5개까지만 같은 카테고리 허용
      if (existing.length >= 5) continue;

      await db.insert(aiMemories).values({
        userId,
        category: mem.category as any,
        content: mem.content,
        importance: Math.min(5, Math.max(1, mem.importance)),
        source: "conversation",
      });
    }
  } catch {
    // 메모리 추출 실패는 조용히 무시 (핵심 기능 아님)
  }
}

// ===== 라우터 =====
export const aiMemoryRouter = router({
  // 내 메모리 목록 조회
  getMyMemories: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userId = ctx.user.id;
      const memories = await db
        .select()
        .from(aiMemories)
        .where(eq(aiMemories.userId, userId))
        .orderBy(desc(aiMemories.importance), desc(aiMemories.createdAt));

      return memories.filter(m => !input.category || m.category === input.category);
    }),

  // 메모리 직접 추가 (사용자가 수동으로 입력)
  addMemory: protectedProcedure
    .input(z.object({
      category: z.enum([
        "basic_info", "family", "career", "values",
        "life_events", "emotions", "hobbies", "health",
        "wishes", "diary_summary", "letter_summary", "conversation"
      ]),
      content: z.string().min(2).max(1000),
      importance: z.number().min(1).max(5).default(3),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [result] = await db.insert(aiMemories).values({
        userId: ctx.user.id,
        category: input.category,
        content: input.content,
        importance: input.importance,
        source: "manual",
      });

      return { success: true, id: result.insertId };
    }),

  // 메모리 삭제 (본인 것만)
  deleteMemory: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .delete(aiMemories)
        .where(and(
          eq(aiMemories.id, input.id),
          eq(aiMemories.userId, ctx.user.id), // 본인 것만 삭제 가능
        ));

      return { success: true };
    }),

  // 개인 AI 채팅 (메모리 기반 대화)
  chat: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(2000),
      conversationId: z.number().optional(), // 기존 대화 이어가기
      purpose: z.enum(["autobiography", "diary", "letter", "free_chat"]).default("free_chat"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userId = ctx.user.id;

      // 1. 사용자 기본 정보 조회
      const [userInfo] = await db
        .select({ name: users.name, birthDate: users.birthDate, country: users.country })
        .from(users)
        .where(eq(users.id, userId));

      // 2. 개인 메모리 컨텍스트 빌드 (이 사용자의 메모리만)
      const personalContext = await buildPersonalContext(userId);

      // 3. 기존 대화 기록 조회 또는 새 대화 시작
      let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];
      let conversationId = input.conversationId;

      if (conversationId) {
        const [conv] = await db
          .select()
          .from(aiConversations)
          .where(and(
            eq(aiConversations.id, conversationId),
            eq(aiConversations.userId, userId), // 본인 대화만 접근 가능
          ));

        if (conv) {
          try {
            const parsed = JSON.parse(conv.messages) as Array<{ role: "user" | "assistant"; content: string; timestamp: string }>;
            // 최근 10개 메시지만 컨텍스트로 사용 (토큰 절약)
            conversationHistory = parsed.slice(-10).map(m => ({ role: m.role, content: m.content }));
          } catch { /* 파싱 실패 시 새로 시작 */ }
        }
      }

      // 4. 목적별 시스템 프롬프트
      const purposePrompts: Record<string, string> = {
        autobiography: "당신은 사용자의 자서전 작성을 돕는 개인 AI입니다. 사용자의 인생 이야기를 깊이 있게 탐구하고, 감동적인 자서전을 함께 만들어가세요.",
        diary: "당신은 사용자의 일기 작성을 돕는 개인 AI입니다. 오늘의 감정과 경험을 진솔하게 기록할 수 있도록 도와주세요.",
        letter: "당신은 사용자가 가족에게 보내는 편지를 작성하도록 돕는 개인 AI입니다. 진심 어린 마음이 전달될 수 있도록 도와주세요.",
        free_chat: "당신은 사용자의 개인 AI 비서입니다. 유언, 상속, 자서전, 일기, 편지 등 모든 주제에 대해 친근하고 전문적으로 도와주세요.",
      };

      // 5. AI 응답 생성
      const systemPrompt = `${purposePrompts[input.purpose] ?? purposePrompts.free_chat}

사용자 이름: ${userInfo?.name ?? "사용자"}
${personalContext ? `\n${personalContext}` : ""}

중요 규칙:
- 이 대화는 완전히 비밀이 보장됩니다. 다른 사용자와 공유되지 않습니다.
- 위의 개인 정보를 자연스럽게 활용하여 개인화된 응답을 제공하세요.
- 법률 자문이 아닌 정보 제공 수준으로 답변하세요.
- 한국어로 친근하고 따뜻하게 대화하세요.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: input.message },
        ],
      });

      const rawContent = response.choices?.[0]?.message?.content;
      const assistantMessage = typeof rawContent === "string" ? rawContent : (rawContent ? JSON.stringify(rawContent) : "죄송합니다, 응답을 생성하지 못했습니다.");

      // 6. 대화 저장 (사용자별 독립 저장)
      const newMessage = { role: "user" as const, content: input.message, timestamp: new Date().toISOString() };
      const newResponse = { role: "assistant" as const, content: assistantMessage, timestamp: new Date().toISOString() };

      if (conversationId) {
        // 기존 대화에 메시지 추가
        const [conv] = await db
          .select()
          .from(aiConversations)
          .where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, userId)));

        if (conv) {
          const existing = JSON.parse(conv.messages) as Array<{ role: string; content: string; timestamp: string }>;
          existing.push(newMessage, newResponse);
          await db
            .update(aiConversations)
            .set({ messages: JSON.stringify(existing), updatedAt: new Date() })
            .where(eq(aiConversations.id, conversationId));
        }
      } else {
        // 새 대화 시작
        const [result] = await db.insert(aiConversations).values({
          userId,
          purpose: input.purpose,
          title: input.message.slice(0, 50),
          messages: JSON.stringify([newMessage, newResponse]),
        });
        conversationId = result.insertId;
      }

      // 7. 대화에서 메모리 자동 추출 (백그라운드)
      extractMemoriesFromConversation(userId, input.message, assistantMessage).catch(() => {});

      return {
        message: assistantMessage,
        conversationId,
      };
    }),

  // 대화 목록 조회 (본인 것만)
  getConversations: protectedProcedure
    .input(z.object({
      purpose: z.enum(["autobiography", "diary", "letter", "free_chat"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const convs = await db
        .select({
          id: aiConversations.id,
          purpose: aiConversations.purpose,
          title: aiConversations.title,
          createdAt: aiConversations.createdAt,
          updatedAt: aiConversations.updatedAt,
        })
        .from(aiConversations)
        .where(and(
          eq(aiConversations.userId, ctx.user.id),
          eq(aiConversations.isActive, 1),
        ))
        .orderBy(desc(aiConversations.updatedAt))
        .limit(50);

      return convs.filter(c => !input.purpose || c.purpose === input.purpose);
    }),

  // 대화 상세 조회 (본인 것만)
  getConversation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [conv] = await db
        .select()
        .from(aiConversations)
        .where(and(
          eq(aiConversations.id, input.id),
          eq(aiConversations.userId, ctx.user.id), // 본인 것만
        ));

      if (!conv) throw new TRPCError({ code: "NOT_FOUND" });

      const messages = JSON.parse(conv.messages) as Array<{ role: string; content: string; timestamp: string }>;
      return { ...conv, messages };
    }),

  // 대화 삭제
  deleteConversation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(aiConversations)
        .set({ isActive: 0 })
        .where(and(
          eq(aiConversations.id, input.id),
          eq(aiConversations.userId, ctx.user.id),
        ));

      return { success: true };
    }),

  // 메모리 통계 (내 AI가 나에 대해 얼마나 알고 있는지)
  getMemoryStats: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const memories = await db
        .select({ category: aiMemories.category })
        .from(aiMemories)
        .where(eq(aiMemories.userId, ctx.user.id));

      const stats: Record<string, number> = {};
      for (const m of memories) {
        stats[m.category] = (stats[m.category] ?? 0) + 1;
      }

      const totalMemories = memories.length;
      const completionScore = Math.min(100, Math.round((Object.keys(stats).length / 12) * 100));

      return {
        totalMemories,
        completionScore, // AI가 나를 얼마나 잘 아는지 (0-100%)
        byCategory: stats,
        categoryLabels: CATEGORY_LABELS,
      };
    }),
});
