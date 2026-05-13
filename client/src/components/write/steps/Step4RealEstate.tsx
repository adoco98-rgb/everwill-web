import { useState } from "react";
import { Plus, Trash2, Home, Percent, DollarSign } from "lucide-react";
import { nanoid } from "nanoid";
import type { StepProps } from "./StepProps";
import type { RealEstate } from "@/lib/willTypes";
import AIGuide from "../AIGuide";
import GlobalAddressSearch from "../GlobalAddressSearch";
import AmountInput from "../AmountInput";

const RE_TYPES = ["아파트", "단독주택", "빌라/연립", "오피스텔", "토지", "상가/건물", "기타"];

const RE_COUNTRIES = [
  { code: "KR", label: "🇰🇷 한국" },
  { code: "US", label: "🇺🇸 미국" },
  { code: "JP", label: "🇯🇵 일본" },
  { code: "CN", label: "🇨🇳 중국" },
  { code: "HK", label: "🇭🇰 홍콩" },
  { code: "TW", label: "🇹🇼 대만" },
  { code: "GB", label: "🇬🇧 영국" },
  { code: "DE", label: "🇩🇪 독일" },
  { code: "AU", label: "🇦🇺 호주" },
  { code: "CA", label: "🇨🇦 캐나다" },
  { code: "AE", label: "🇦🇪 UAE" },
];

export default function Step4RealEstate({ will, update }: StepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<RealEstate>>({ distributionMode: "percent" });
  const [reCountry, setReCountry] = useState<string>("KR");

  const save = () => {
    if (!form.address) return;
    const item: RealEstate = {
      id: form.id || nanoid(8),
      type: form.type || "아파트",
      address: form.address,
      area: form.area || "",
      registrationNo: form.registrationNo || "",
      estimatedValue: form.estimatedValue || "",
      heirId: form.heirId || "",
      sharePercent: form.sharePercent || 100,
      shareAmount: form.shareAmount || "",
      distributionMode: form.distributionMode || "percent",
    };
    const exists = will.realEstates.find((r) => r.id === item.id);
    update({ realEstates: exists ? will.realEstates.map((r) => r.id === item.id ? item : r) : [...will.realEstates, item] });
    setShowForm(false);
    setForm({ distributionMode: "percent" });
  };

  // 배분 방식 표시 텍스트
  const getDistributionLabel = (re: RealEstate) => {
    if (re.distributionMode === "amount" && re.shareAmount) {
      return `${re.shareAmount} 배분`;
    }
    return `${re.sharePercent ?? 100}% 배분`;
  };

  return (
    <div className="space-y-5">
      {/* AI 안내 말풍선 */}
      <AIGuide
        question="부동산이 있으시면 등록해 주세요. 없으시면 바로 다음 단계로 넘어가셔도 됩니다."
        description="부동산은 상속 재산 중 가장 큰 비중을 차지합니다. 등기부등본에 있는 정보를 기준으로 입력하면 사망 후 상속 집행 시 자동으로 활용됩니다."
        examples={[
          "서울 강남구 아파트 84㎡, 등기 고유번호 1234-2024-000000, 예상 가액 5억 원 → 장남에게 100% 상속",
          "경기도 성남시 토지 500㎡, 예상 가액 3억 원 → 자녀 2명에게 각 50% 상속",
          "부동산 없음 → 이 단계 건너뛰기",
        ]}
        tips={[
          "등기부등본은 인터넷등기소(iros.go.kr)에서 무료로 발급받을 수 있습니다.",
          "예상 가액은 정확하지 않아도 됩니다. 시세 표준가 기준 어림으로 입력하세요.",
          "여러 상속인에게 나눔 경우, 다음 단계에서 상속인별 지분을 설정합니다.",
        ]}
        warning="임대차인이 있는 부동산은 임대차 계약이 종료된 후 상속됩니다. 임대인에게 사전 통보가 필요할 수 있습니다."
      />

      <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
        부동산이 없으면 건너뛰어도 됩니다. 등기부등본의 정보를 기준으로 입력하세요.
      </div>

      {/* 등록된 부동산 목록 */}
      {will.realEstates.map((re) => (
        <div key={re.id} className="flex items-center justify-between bg-[#FAFAF8] rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
              <Home className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-[#1F3864] text-sm">{re.type} · {re.address}</div>
              <div className="text-gray-400 text-xs flex items-center gap-2">
                {re.estimatedValue ? `약 ${re.estimatedValue}` : "금액 미입력"}
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
                  {re.distributionMode === "amount" ? (
                    <DollarSign className="w-3 h-3" />
                  ) : (
                    <Percent className="w-3 h-3" />
                  )}
                  {getDistributionLabel(re)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setForm({ ...re }); setShowForm(true); }}
              className="text-gray-400 hover:text-[#1F3864] text-xs px-2 py-1 rounded border border-gray-200 hover:border-[#1F3864]/30 transition-all"
            >
              수정
            </button>
            <button
              onClick={() => update({ realEstates: will.realEstates.filter((r) => r.id !== re.id) })}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* 입력 폼 */}
      {showForm && (
        <div className="bg-white border-2 border-[#1F3864]/20 rounded-2xl p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">부동산 종류</label>
              <select
                value={form.type || ""}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
              >
                {RE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">면적 (㎡)</label>
              <input
                value={form.area || ""}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                placeholder="84.5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">소재지 국가</label>
              <select
                value={reCountry}
                onChange={(e) => { setReCountry(e.target.value); setForm({ ...form, address: "" }); }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
              >
                {RE_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <GlobalAddressSearch
                label="주소 *"
                value={form.address || ""}
                onChange={(address) => setForm({ ...form, address })}
                countryCode={reCountry}
                placeholder={reCountry === "KR" ? "주소 검색 버튼을 눌러주세요" : "Start typing address..."}
                showLabel
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">등기 고유번호</label>
              <input
                value={form.registrationNo || ""}
                onChange={(e) => setForm({ ...form, registrationNo: e.target.value })}
                placeholder="1234-2024-000000"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">예상 가액</label>
              <AmountInput
                value={form.estimatedValue || ""}
                onChange={(raw) => setForm({ ...form, estimatedValue: raw })}
                placeholder="예상 가액 입력"
                unit="원"
              />
            </div>
          </div>

          {/* 배분 방식 선택 */}
          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs font-semibold text-gray-500 mb-3">배분 방식</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, distributionMode: "percent" })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  (form.distributionMode || "percent") === "percent"
                    ? "bg-[#1F3864] text-white border-[#1F3864]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#1F3864]/40"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                비율 (%)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, distributionMode: "amount" })}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.distributionMode === "amount"
                    ? "bg-[#1F3864] text-white border-[#1F3864]"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[#1F3864]/40"
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                금액 직접 입력
              </button>
            </div>

            {(form.distributionMode || "percent") === "percent" ? (
              <div>
                <label className="block text-xs text-gray-400 mb-1">상속 비율 (%)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.sharePercent ?? 100}
                    onChange={(e) => setForm({ ...form, sharePercent: Number(e.target.value) })}
                    className="flex-1 accent-[#1F3864]"
                  />
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.sharePercent ?? 100}
                      onChange={(e) => setForm({ ...form, sharePercent: Math.min(100, Math.max(0, Number(e.target.value))) })}
                      className="w-16 px-2 py-2 text-sm text-center focus:outline-none"
                    />
                    <span className="px-2 text-gray-400 text-sm bg-gray-50 border-l border-gray-200 py-2">%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">슬라이더를 움직이거나 숫자를 직접 입력하세요</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs text-gray-400 mb-1">배분 금액</label>
                <AmountInput
                  value={form.shareAmount || ""}
                  onChange={(raw) => setForm({ ...form, shareAmount: raw })}
                  placeholder="배분 금액 입력"
                  unit="원"
                />
                <p className="text-xs text-gray-400 mt-1">구체적인 금액을 입력하면 유언장에 그대로 반영됩니다</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button onClick={save} className="btn-navy text-white px-6 py-2 rounded-lg text-sm font-semibold">저장</button>
            <button
              onClick={() => { setShowForm(false); setForm({ distributionMode: "percent" }); }}
              className="text-gray-400 text-sm px-4 py-2"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full border-2 border-dashed border-gray-200 hover:border-[#1F3864]/30 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-[#1F3864] text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />부동산 추가
        </button>
      )}
    </div>
  );
}
