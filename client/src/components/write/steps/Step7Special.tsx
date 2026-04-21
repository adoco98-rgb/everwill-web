/**
 * Step 7: 특별 지시사항
 * AI 질문: 장례 방식, 유언집행자, 기부, 특별 메시지
 */
import type { StepProps } from "./StepProps";
import AIGuide from "../AIGuide";

const FUNERAL_OPTIONS = ["화장 후 납골당", "화장 후 자연장(수목장·산골)", "매장", "종교 의식에 따름", "가족에게 일임"];

export default function Step7Special({ will, update }: StepProps) {
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
          "반려동물: 강아지 '뭉치'는 딸 홍영희가 돌봐주기 바랍니다.",
          "메시지: 가족 모두 사이좋게 지내고, 건강하게 살아주세요. 사랑합니다.",
        ]}
        tips={[
          "유언집행자는 신뢰할 수 있고 책임감 있는 분으로 지정하세요. 변호사도 가능합니다.",
          "장례 방식은 법적 구속력은 없지만 가족이 따르는 경우가 대부분입니다.",
          "기부는 특정 단체명과 금액(또는 비율)을 명확히 기재해야 효력이 있습니다.",
          "미성년 자녀가 있다면 후견인 지정이 매우 중요합니다. 지정하지 않으면 법원이 선임합니다.",
        ]}
        warning="유언집행자를 지정하지 않으면 법원이 선임합니다(민법 제1093조). 신뢰할 수 있는 분을 반드시 지정하세요."
      />

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
