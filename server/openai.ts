/**
 * OpenAI GPT-4o 연결 유틸리티
 * - chatRouter에서 invokeLLM 대신 사용
 * - fetch 기반 (SDK 프록시 이슈 우회)
 * - 환경변수 OPENAI_API_KEY 사용
 */

import { ENV } from "./_core/env";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * GPT-4o로 채팅 응답 생성
 * invokeLLM과 동일한 인터페이스로 교체 가능
 */
export async function invokeGPT4o({
  messages,
  temperature = 0.7,
  maxTokens = 2000,
}: {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}) {
  const apiKey = ENV.openaiApiKey;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API 오류 (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  // invokeLLM과 동일한 형태로 반환
  return {
    choices: [
      {
        message: {
          content: data.choices?.[0]?.message?.content || "",
          role: data.choices?.[0]?.message?.role || "assistant",
        },
      },
    ],
  };
}
