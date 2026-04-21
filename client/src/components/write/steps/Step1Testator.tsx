/**
 * Step 1: 유언자 기본 정보
 * AI 질문: 본인 확인 정보 입력 안내
 * 주소 검색: 카카오 우편번호 API 사용
 */
import type { StepProps } from "./StepProps";
import AIGuide from "../AIGuide";
import AddressSearch from "../AddressSearch";

export default function Step1Testator({ will, update }: StepProps) {
  return (
    <div className="space-y-5">
      {/* AI 안내 말풍선 */}
      <AIGuide
        question="안녕하세요! 먼저 유언자 본인의 정보를 확인할게요. 성함과 주민등록번호를 입력해 주세요."
        description="유언장은 반드시 유언자 본인이 작성해야 법적 효력이 있습니다. 입력하신 정보는 E2E 암호화로 안전하게 보관되며, 유언장 인증 시 본인 확인에 사용됩니다."
        examples={[
          "성명: 홍길동 / 주민등록번호: 550101-1234567 / 주소: 서울특별시 강남구 테헤란로 123, 101동 1001호",
          "해외 거주자: 영문 이름도 함께 입력 가능합니다 (예: Hong Gil-dong)",
        ]}
        tips={[
          "주민등록번호는 유언장 법적 효력 확인에 필수입니다. 여권번호로 대체 가능합니다.",
          "주소는 현재 실제 거주지를 입력해 주세요. 등록 주소와 다를 경우 둘 다 기재하면 좋습니다.",
          "작성일은 오늘 날짜로 자동 설정됩니다. 실제 서명 날짜와 일치해야 합니다.",
        ]}
        warning="주민등록번호는 반드시 정확하게 입력해야 합니다. 오류 시 유언장 인증이 거부될 수 있습니다."
      />

      {/* 법적 근거 */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>민법 제1066조</strong> — 자필증서 유언은 유언자가 전문·연월일·주소·성명을 자필로 기재하고 날인해야 합니다.
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
            성명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={will.testatorName}
            onChange={(e) => update({ testatorName: e.target.value })}
            placeholder="홍길동"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
            주민등록번호 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={will.testatorRRN}
            onChange={(e) => update({ testatorRRN: e.target.value })}
            placeholder="000000-0000000"
            maxLength={14}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
          />
          <p className="text-xs text-gray-400 mt-1">E2E 암호화로 안전하게 보관됩니다</p>
        </div>
      </div>

      {/* 카카오 우편번호 주소 검색 */}
      <AddressSearch
        label="주소"
        required
        value={will.testatorAddress}
        onChange={(address) => update({ testatorAddress: address })}
        placeholder="주소 검색 버튼을 눌러 주소를 찾아주세요"
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">연락처</label>
          <input
            type="tel"
            value={will.testatorPhone}
            onChange={(e) => update({ testatorPhone: e.target.value })}
            placeholder="010-0000-0000"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
            작성일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={will.writtenDate}
            onChange={(e) => update({ writtenDate: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
          />
        </div>
      </div>
    </div>
  );
}
