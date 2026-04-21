/**
 * AIGuide — 각 단계에서 AI가 사용자에게 보여주는 안내 말풍선
 * 질문 + 설명 + 예시 답변 + 팁으로 구성
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, MessageCircle } from "lucide-react";

interface AIGuideProps {
  question: string;           // AI의 핵심 질문
  description: string;        // 질문에 대한 설명
  examples?: string[];        // 예시 답변 목록
  tips?: string[];            // 법적/실용적 팁
  warning?: string;           // 주의사항
}

export default function AIGuide({ question, description, examples, tips, warning }: AIGuideProps) {
  const [showExamples, setShowExamples] = useState(false);

  return (
    <div className="mb-6 space-y-3">
      {/* AI 말풍선 */}
      <div className="flex items-start gap-3">
        {/* AI 아바타 */}
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#1F3864] to-[#2d4f8a] flex items-center justify-center shadow-sm">
          <MessageCircle className="w-4 h-4 text-[#C9A961]" />
        </div>
        {/* 말풍선 */}
        <div className="flex-1 bg-[#1F3864] text-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
          <p className="text-sm font-semibold leading-relaxed mb-1.5">{question}</p>
          <p className="text-white/70 text-xs leading-relaxed">{description}</p>
        </div>
      </div>

      {/* 예시 답변 토글 */}
      {examples && examples.length > 0 && (
        <div className="ml-12">
          <button
            onClick={() => setShowExamples((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-[#1F3864] font-semibold hover:underline"
          >
            {showExamples ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            예시 답변 보기
          </button>
          {showExamples && (
            <div className="mt-2 bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-1.5">
              {examples.map((ex, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#C9A961] font-bold text-xs mt-0.5">예{i + 1}</span>
                  <p className="text-gray-600 text-xs leading-relaxed">{ex}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 팁 */}
      {tips && tips.length > 0 && (
        <div className="ml-12 bg-amber-50 border border-amber-100 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-700">AI 팁</span>
          </div>
          <ul className="space-y-1">
            {tips.map((tip, i) => (
              <li key={i} className="text-xs text-amber-700 leading-relaxed flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 주의사항 */}
      {warning && (
        <div className="ml-12 bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-xs text-red-700 leading-relaxed">
            <span className="font-bold">⚠️ 주의: </span>{warning}
          </p>
        </div>
      )}
    </div>
  );
}
