import { useState } from "react";
import type { StepProps } from "./StepProps";

const FAMILY_RELATIONS = ["배우자", "장남/장녀", "차남/차녀", "부모", "형제자매", "손자녀", "기타"];

export default function Step2Family({ will, update }: StepProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (rel: string) => {
    setSelected((prev) =>
      prev.includes(rel) ? prev.filter((r) => r !== rel) : [...prev, rel]
    );
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        <strong>유류분 안내</strong> — 법정 상속인에게는 최소 상속분(유류분)이 보장됩니다.
        배우자·자녀는 법정 상속분의 1/2, 부모·형제자매는 1/3입니다.
      </div>
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-3">
          가족 구성원을 선택하세요 (해당하는 모든 항목)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FAMILY_RELATIONS.map((rel) => (
            <button
              key={rel}
              type="button"
              onClick={() => toggle(rel)}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                selected.includes(rel)
                  ? "border-[#1F3864] bg-[#1F3864] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#1F3864]/30"
              }`}
            >
              {rel}
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
