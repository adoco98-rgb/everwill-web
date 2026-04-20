import type { StepProps } from "./StepProps";

const FUNERAL_OPTIONS = ["화장 후 납골당", "화장 후 자연장(수목장·산골)", "매장", "종교 의식에 따름", "가족에게 일임"];

export default function Step7Special({ will, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
        <strong>민법 제1093조</strong> — 유언집행자를 지정하지 않으면 법원이 선임합니다. 신뢰할 수 있는 분을 지정하세요.
      </div>

      {/* 유언집행자 */}
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
          유언집행자 지정
        </label>
        <input
          value={will.executor}
          onChange={(e) => update({ executor: e.target.value })}
          placeholder="홍길동 (관계: 장남, 연락처: 010-0000-0000)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10"
        />
        <p className="text-xs text-gray-400 mt-1">유언 내용을 실제로 집행할 사람입니다.</p>
      </div>

      {/* 미성년 자녀 후견인 */}
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
          미성년 자녀 후견인 지정
        </label>
        <input
          value={will.guardian}
          onChange={(e) => update({ guardian: e.target.value })}
          placeholder="홍길순 (관계: 이모, 연락처: 010-0000-0000)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10"
        />
        <p className="text-xs text-gray-400 mt-1">미성년 자녀가 없으면 비워두세요.</p>
      </div>

      {/* 장례 방식 */}
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-2">장례 방식</label>
        <div className="grid sm:grid-cols-2 gap-2 mb-3">
          {FUNERAL_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => update({ funeralWish: opt })}
              className={`text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                will.funeralWish === opt
                  ? "border-[#1F3864] bg-[#1F3864] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[#1F3864]/30"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <input
          value={will.funeralWish && !FUNERAL_OPTIONS.includes(will.funeralWish) ? will.funeralWish : ""}
          onChange={(e) => update({ funeralWish: e.target.value })}
          placeholder="직접 입력 (예: 종교 의식 없이 간소하게)"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10"
        />
      </div>

      {/* 기부 내역 */}
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">기부 내역</label>
        <textarea
          value={will.donationDetails}
          onChange={(e) => update({ donationDetails: e.target.value })}
          placeholder="예: 재산의 10%를 대한적십자사에 기부한다."
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none"
        />
      </div>

      {/* 기타 특별 지시 */}
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">기타 특별 지시사항</label>
        <textarea
          value={will.specialInstructions}
          onChange={(e) => update({ specialInstructions: e.target.value })}
          placeholder="예: 반려견 '뭉치'는 딸 홍영희가 돌봐주기 바란다. 가족들이 화목하게 지내기를 바란다."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none"
        />
      </div>
    </div>
  );
}
