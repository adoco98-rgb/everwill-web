/**
 * Step 2: 가족 관계 확인
 * AI 질문: 가족 구성원 파악
 */
import { useState } from "react";
import type { StepProps } from "./StepProps";
import AIGuide from "../AIGuide";

const FAMILY_RELATIONS = [
  { label: "배우자", emoji: "💑", desc: "법정 상속 1순위 공동" },
  { label: "장남/장녀", emoji: "👦", desc: "직계비속 1순위" },
  { label: "차남/차녀", emoji: "👧", desc: "직계비속 1순위" },
  { label: "부모", emoji: "👨‍👩‍👦", desc: "직계존속 2순위" },
  { label: "형제자매", emoji: "🤝", desc: "3순위" },
  { label: "손자녀", emoji: "👶", desc: "대습상속 가능" },
  { label: "기타", emoji: "👤", desc: "지인·단체 포함" },
];

export default function Step2Family({ will, update }: StepProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (rel: string) => {
    setSelected((prev) =>
      prev.includes(rel) ? prev.filter((r) => r !== rel) : [...prev, rel]
    );
  };

  return (
    <div className="space-y-5">
      {/* AI 안내 말풍선 */}
      <AIGuide
        question="현재 가족 구성원이 어떻게 되시나요? 상속과 관련된 가족을 모두 선택해 주세요."
        description="가족 구성원 파악은 유류분(최소 상속분) 계산과 상속인 순위 결정에 필요합니다. 실제로 재산을 나눠줄 분이 아니더라도, 법적으로 상속권이 있는 모든 가족을 선택해 주세요."
        examples={[
          "배우자 + 자녀 2명: '배우자', '장남/장녀', '차남/차녀' 선택",
          "미혼, 부모님 생존: '부모' 선택",
          "자녀에게만 상속, 형제자매 있음: '장남/장녀'와 '형제자매' 모두 선택 (유류분 계산용)",
          "지인이나 단체에 일부 기부 예정: '기타' 선택 후 다음 단계에서 상세 입력",
        ]}
        tips={[
          "배우자는 자녀 또는 부모와 공동 상속합니다. 단독 상속이 아닙니다.",
          "법적 상속인이 아닌 분(지인, 단체)에게도 재산을 남길 수 있습니다.",
          "손자녀는 자녀가 먼저 사망한 경우 대습상속이 가능합니다.",
        ]}
        warning="법정 상속인(배우자·자녀·부모)을 완전히 배제하면 유류분 침해로 유언이 일부 무효가 될 수 있습니다."
      />

      {/* 유류분 안내 */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        <strong>유류분 안내</strong> — 법정 상속인에게는 최소 상속분(유류분)이 보장됩니다.
        배우자·자녀는 법정 상속분의 1/2, 부모·형제자매는 1/3입니다.
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-3">
          가족 구성원을 선택하세요 <span className="text-gray-400 font-normal">(해당하는 모든 항목)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FAMILY_RELATIONS.map(({ label, emoji, desc }) => (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`py-3 px-4 rounded-xl border-2 text-left transition-all ${
                selected.includes(label)
                  ? "border-[#1F3864] bg-[#1F3864] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#1F3864]/30"
              }`}
            >
              <div className="text-lg mb-0.5">{emoji}</div>
              <div className="text-sm font-semibold">{label}</div>
              <div className={`text-xs mt-0.5 ${selected.includes(label) ? "text-white/60" : "text-gray-400"}`}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="bg-[#1F3864]/4 rounded-xl p-4">
          <p className="text-sm text-[#1F3864] font-medium mb-2">선택된 가족 구성원</p>
          <div className="flex flex-wrap gap-2">
            {selected.map((rel) => (
              <span key={rel} className="bg-[#1F3864] text-white text-xs px-3 py-1 rounded-full">
                {rel}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            다음 단계에서 각 상속인의 상세 정보를 입력합니다.
          </p>
        </div>
      )}
    </div>
  );
}
