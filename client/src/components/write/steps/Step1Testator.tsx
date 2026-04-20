import type { StepProps } from "./StepProps";

export default function Step1Testator({ will, update }: StepProps) {
  return (
    <div className="space-y-5">
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
      <div>
        <label className="block text-sm font-semibold text-[#1F3864] mb-1.5">
          주소 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={will.testatorAddress}
          onChange={(e) => update({ testatorAddress: e.target.value })}
          placeholder="서울특별시 강남구 테헤란로 123"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
        />
      </div>
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
