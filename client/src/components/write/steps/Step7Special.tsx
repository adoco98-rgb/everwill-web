/**
 * Step 7: 특별 지시사항
 * AI 질문: 장례 방식, 유언집행자, 기부, 특별 메시지
 * 유언집행자: 미지정 시 제1상속인 자동 집행자, 지정 시 직접 입력
 */
import type { StepProps } from "./StepProps";
import AIGuide from "../AIGuide";

const FUNERAL_OPTIONS = ["화장 후 납골당", "화장 후 자연장(수목장·산골)", "매장", "종교 의식에 따름", "가족에게 일임"];

export default function Step7Special({ will, update }: StepProps) {
  // 제1상속인 이름 (상속인 목록에서 첫 번째)
  const firstHeirName = will.heirs?.[0]?.name || "";
  const firstHeirRelation = will.heirs?.[0]?.relation || "";

  // 집행자 유형 (기본값: heir1)
  const executorType = will.executorType || "heir1";

  return (
    <div className="space-y-6">
      {/* AI 안내 말풍선 */}
      <AIGuide
        question="마지막으로 가족에게 남기고 싶은 특별한 지시사항이 있으신가요? 장례 방식, 유언집행자, 기부, 반려동물 등을 지정할 수 있습니다."
        description="이 단계는 법적 효력보다는 가족에게 전하는 마지막 메시지와 실질적 지시사항을 담는 곳입니다. 유언집행자는 유언 내용을 실제로 이행하는 중요한 역할입니다."
        examples={[
          "장례: 화장 후 고향 앞산에 수목장으로 해주세요. 조문은 가족끼리만 조용히.",
          "집행자: 장남 홍길동 (010-1234-5678)에게 집행을 맡깁니다.",
          "기부: 재산의 5%를 초록우산 어린이재단에 기부합니다.",
          "반려동물: 강아지 '뽙치'는 딸 홍영희가 돌봐주기 바랍니다.",
          "메시지: 가족 모두 사이좋게 지내고, 건강하게 살아주세요. 사랑합니다.",
        ]}
        tips={[
          "유언집행자는 신뢰할 수 있고 책임감 있는 분으로 지정하세요. 변호사도 가능합니다.",
          "장례 방식은 법적 구속력은 없지만 가족이 따르는 경우가 대부분입니다.",
          "기부는 특정 단체명과 금액(또는 비율)을 명확히 기재해야 효력이 있습니다.",
          "미성년 자녀가 있다면 후견인 지정이 매우 중요합니다. 지정하지 않으면 법원이 선임합니다.",
        ]}
        warning="유언집행자를 지정하지 않으면 제1상속인이 자동으로 집행자가 됩니다. 다른 분을 지정하려면 아래에서 직접 지정을 선택하세요."
      />

      {/* 유언집행자 지정 (핵심 개편 섹션) */}
      <div className="bg-white border-2 border-[#1F3864]/20 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">⚖️</span>
          <h3 className="font-bold text-[#1F3864] text-base">유언집행자 지정</h3>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">중요</span>
        </div>
        <p className="text-xs text-gray-500">
          유언집행자는 유언자 사망 후 유언 내용을 실제로 이행하는 사람입니다.
          <br />
          <strong className="text-[#1F3864]">한국 민법 제1093조</strong> — 유언으로 집행자를 지정할 수 있습니다.
        </p>

        {/* 집행자 유형 선택 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 제1상속인 자동 */}
          <button
            type="button"
            onClick={() => update({ executorType: "heir1" })}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              executorType === "heir1"
                ? "border-[#1F3864] bg-[#1F3864]/5"
                : "border-gray-200 bg-white hover:border-[#1F3864]/30"
            }`}
          >
            {executorType === "heir1" && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-[#1F3864] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <div className="text-2xl mb-1">👤</div>
            <div className="font-semibold text-sm text-[#1F3864]">제1상속인 자동</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {firstHeirName
                ? `${firstHeirName}${firstHeirRelation ? ` (${firstHeirRelation})` : ""}이(가) 자동으로 집행자가 됩니다`
                : "상속인 등록 후 자동 지정됩니다"}
            </div>
          </button>

          {/* 직접 지정 */}
          <button
            type="button"
            onClick={() => update({ executorType: "custom" })}
            className={`relative p-4 rounded-xl border-2 text-left transition-all ${
              executorType === "custom"
                ? "border-[#C9A961] bg-[#C9A961]/5"
                : "border-gray-200 bg-white hover:border-[#C9A961]/30"
            }`}
          >
            {executorType === "custom" && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-[#C9A961] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
            <div className="text-2xl mb-1">✍️</div>
            <div className="font-semibold text-sm text-[#C9A961]">직접 지정</div>
            <div className="text-xs text-gray-500 mt-0.5">특정인을 유언집행자로 직접 지정합니다</div>
          </button>
        </div>

        {/* 제1상속인 자동 선택 시 안내 */}
        {executorType === "heir1" && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">ℹ️</span>
              <div>
                <strong>
                  {firstHeirName
                    ? `${firstHeirName}${firstHeirRelation ? ` (${firstHeirRelation})` : ""}`
                    : "제1상속인"}
                </strong>
                이(가) 유언집행자로 자동 지정됩니다.
                <br />
                <span className="text-xs text-blue-500 mt-1 block">
                  사망 후 이의제기 기간(72시간) 종료 시 자동으로 집행 절차가 시작됩니다.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 직접 지정 선택 시 입력 폼 */}
        {executorType === "custom" && (
          <div className="space-y-3 pt-1">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">집행자 이름 *</label>
                <input
                  value={will.executorCustomName}
                  onChange={(e) => update({ executorCustomName: e.target.value })}
                  placeholder="홍길동"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">관계</label>
                <input
                  value={will.executorCustomRelation}
                  onChange={(e) => update({ executorCustomRelation: e.target.value })}
                  placeholder="장남, 변호사, 친구 등"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">연락처 *</label>
              <input
                value={will.executorCustomPhone}
                onChange={(e) => update({ executorCustomPhone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#C9A961] focus:ring-2 focus:ring-[#C9A961]/10"
              />
            </div>
            {will.executorCustomName && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
                <strong>{will.executorCustomName}</strong>
                {will.executorCustomRelation ? ` (${will.executorCustomRelation})` : ""}이(가) 유언집행자로 지정됩니다.
                사망 후 자동으로 집행 안내 연락이 발송됩니다.
              </div>
            )}
          </div>
        )}
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

      {/* 기부 내역: 사회기부는 /charity 페이지에서 별도 관리 - 여기서는 제거 */}

      {/* 기타 특별 지시 */}
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">기타 특별 지시사항 및 가족에게 남기는 메시지</label>
        <textarea
          value={will.specialInstructions}
          onChange={(e) => update({ specialInstructions: e.target.value })}
          placeholder="예: 반려견 '뭉치'는 딸 홍영희가 돌봐주기 바란다. 가족들이 화목하게 지내기를 바란다. 사랑한다."
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 resize-none"
        />
      </div>
    </div>
  );
}
