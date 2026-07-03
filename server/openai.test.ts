import { describe, it, expect } from "vitest";
import { invokeGPT4o } from "./openai";

describe("OpenAI GPT-4o 연결 테스트", () => {
  it("GPT-4o API가 정상 응답하는지 확인", async () => {
    const response = await invokeGPT4o({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello in Korean in one word." },
      ],
      maxTokens: 20,
    });

    expect(response.choices).toBeDefined();
    expect(response.choices.length).toBeGreaterThan(0);
    expect(response.choices[0].message.content).toBeTruthy();
    expect(typeof response.choices[0].message.content).toBe("string");
    console.log("GPT-4o 응답:", response.choices[0].message.content);
  }, 30000);
});
