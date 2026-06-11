/**
 * Step 3: 상속인 등록
 * - 항상 펼쳐진 카드 형태 (즉시 입력 → 자동 반영)
 * - 상속인 추가 버튼으로 계속 추가 가능
 * - 이름 / 전화번호 / 주소 각각 별도 입력칸
 * - 상속 지분 합계 실시간 검증
 */
import { useState } from "react";
import { Plus, Trash2, User, ChevronDown, ChevronUp } from "lucide-react";
import { nanoid } from "nanoid";
import type { StepProps } from "./StepProps";
import type { Heir } from "@/lib/willTypes";
import AIGuide from "../AIGuide";
import GlobalAddressSearch from "../GlobalAddressSearch";
import PhoneInput from "../PhoneInput";
import { PHONE_CODE_TO_ISO } from "@/lib/formatUtils";
import { useLanguage } from "@/contexts/LanguageContext";

const RELATIONS = ["배우자", "장남", "장녀", "차남", "차녀", "부모(부)", "부모(모)", "형제", "자매", "손자녀", "기타"];

const COUNTRIES = [
  { code: "KR", label: "🇰🇷 대한민국" },
  { code: "US", label: "🇺🇸 미국" },
  { code: "JP", label: "🇯🇵 일본" },
  { code: "CN", label: "🇨🇳 중국" },
  { code: "HK", label: "🇭🇰 홍콩" },
  { code: "TW", label: "🇹🇼 대만" },
  { code: "GB", label: "🇬🇧 영국" },
  { code: "DE", label: "🇩🇪 독일" },
  { code: "FR", label: "🇫🇷 프랑스" },
  { code: "ES", label: "🇪🇸 스페인" },
  { code: "AU", label: "🇦🇺 호주" },
  { code: "CA", label: "🇨🇦 캐나다" },
  { code: "SA", label: "🇸🇦 사우디" },
  { code: "AE", label: "🇦🇪 UAE" },
  { code: "IN", label: "🇮🇳 인도" },
  { code: "BR", label: "🇧🇷 브라질" },
];

/** 상속인 카드 상태 (국가코드, 전화국가코드, 접힘여부) */
interface HeirCardState {
  countryCode: string;
  phoneCode: string;
  collapsed: boolean;
}

export default function Step3Heirs({ will, update }: StepProps) {
  const { language } = useLanguage();
  const totalShare = will.heirs.reduce((sum, h) => sum + (h.share || 0), 0);

  // 각 카드의 UI 상태 (countryCode, phoneCode, collapsed)
  const [cardStates, setCardStates] = useState<Record<string, HeirCardState>>({});

  const getCardState = (id: string): HeirCardState =>
    cardStates[id] ?? { countryCode: "KR", phoneCode: "+82", collapsed: false };

  const setCardState = (id: string, partial: Partial<HeirCardState>) => {
    setCardStates((prev) => ({
      ...prev,
      [id]: { ...getCardState(id), ...partial },
    }));
  };

  /** 상속인 필드 즉시 업데이트 */
  const updateHeir = (id: string, partial: Partial<Heir>) => {
    update({
      heirs: will.heirs.map((h) => h.id === id ? { ...h, ...partial } : h),
    });
  };

  /** 상속인 추가 */
  const addHeir = () => {
    const id = nanoid(8);
    const newHeir: Heir = {
      id,
      name: "",
      relation: "",
      birthDate: "",
      phone: "",
      email: "",
      country: "대한민국",
      address: "",
      share: 0,
    };
    update({ heirs: [...will.heirs, newHeir] });
    setCardState(id, { countryCode: "KR", phoneCode: "+82", collapsed: false });
  };

  /** 상속인 삭제 */
  const removeHeir = (id: string) => {
    update({ heirs: will.heirs.filter((h) => h.id !== id) });
  };

  return (
    <div className="space-y-5">
      <AIGuide
        question="재산을 나눠줄 상속인을 등록해 주세요. 이름, 연락정보, 지분을 입력하면 사망 후 자동으로 연락됩니다."
        description="상속인 정보는 유언장의 핵심입니다. EverWill은 안심 확인 완료 시 등록된 상속인 전원에게 자동으로 알림을 보냅니다."
        examples={[
          "배우자 김영희 (1970.03.15, 010-1234-5678) → 지분 50%",
          "장남 홍길동 (미국 거주, +1-555-1234) → 지분 30%",
          "장녀 홍영희 (일본 도쿄 거주) → 지분 20%",
        ]}
        tips={[
          "지분 합계가 100%가 되어야 합니다.",
          "유류분: 배우자·자녀는 법정 상속분의 1/2 이상 보장됩니다.",
          "해외 거주 상속인은 국가코드 포함 전화번호를 입력해 주세요.",
        ]}
        warning="상속인 연락정보가 잘못되면 사망 후 알림이 전달되지 않을 수 있습니다."
      />

      {/* 언어별 유류분 경고 */}
      {language === "ko" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <div className="flex items-start justify-between gap-2">
            <div>
              <strong>🇰🇷 한국 민법 제1112조 — 유류분 경고</strong><br />
              배우자·자녀는 법정 상속분의 <strong>1/2</strong>, 직계존속·형제자매는 <strong>1/3</strong>이 최소 보장됩니다.
            </div>
            <span className="shrink-0 bg-amber-200 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">참고용</span>
          </div>
          <p className="mt-2 text-xs text-amber-600">⚠️ 이 계산은 참고용입니다. 반드시 변호사와 확인하세요.</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>민법 제1000조</strong> — 상속인 순위: 1순위 직계비속, 2순위 직계존속, 3순위 형제자매.
        배우자는 1·2순위와 공동상속합니다.
      </div>

      {/* 지분 합계 표시 */}
      {will.heirs.length > 0 && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold border ${
          totalShare > 100
            ? "bg-red-50 border-red-200 text-red-600"
            : totalShare === 100
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-gray-50 border-gray-200 text-gray-500"
        }`}>
          <span>총 상속 지분</span>
          <span>
            {totalShare}%
            {totalShare > 100 && " ⚠️ 100% 초과"}
            {totalShare === 100 && " ✅ 완료"}
            {totalShare < 100 && ` (${100 - totalShare}% 미배분)`}
          </span>
        </div>
      )}

      {/* 상속인 카드 목록 */}
      <div className="space-y-4">
        {will.heirs.map((heir, index) => {
          const cs = getCardState(heir.id);
          const phoneNumberOnly = heir.phone ? heir.phone.replace(/^\+\d+\s?/, "") : "";
          const isComplete = heir.name && heir.relation;

          return (
            <div
              key={heir.id}
              className="border-2 border-[#1F3864]/15 rounded-2xl overflow-hidden bg-white"
            >
              {/* 카드 헤더 */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#1F3864]/5 border-b border-[#1F3864]/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1F3864] flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-[#1F3864] text-sm">
                      {heir.name || `상속인 ${index + 1}`}
                      {heir.relation && <span className="ml-2 text-[#C9A961] font-normal">({heir.relation})</span>}
                    </div>
                    {heir.share > 0 && (
                      <div className="text-xs text-gray-400">지분 {heir.share}%</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCardState(heir.id, { collapsed: !cs.collapsed })}
                    className="text-gray-400 hover:text-[#1F3864] transition-colors p-1"
                    title={cs.collapsed ? "펼치기" : "접기"}
                  >
                    {cs.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeHeir(heir.id)}
                    className="text-red-300 hover:text-red-500 transition-colors p-1"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 카드 본문 (접힘 가능) */}
              {!cs.collapsed && (
                <div className="p-5 space-y-4">
                  {/* 이름 + 관계 */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        성명 <span className="text-red-400">*</span>
                      </label>
                      <input
                        value={heir.name}
                        onChange={(e) => updateHeir(heir.id, { name: e.target.value })}
                        placeholder="홍길동"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                        관계 <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={heir.relation}
                        onChange={(e) => updateHeir(heir.id, { relation: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
                      >
                        <option value="">선택</option>
                        {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 생년월일 + 거주 국가 */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">생년월일</label>
                      <input
                        type="date"
                        value={heir.birthDate}
                        onChange={(e) => updateHeir(heir.id, { birthDate: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">거주 국가</label>
                      <select
                        value={cs.countryCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          const countryLabel = COUNTRIES.find((c) => c.code === code)?.label.replace(/^.{3}/, "").trim() || "대한민국";
                          const matchedPhone = Object.entries(PHONE_CODE_TO_ISO).find(([, iso]) => iso === code);
                          setCardState(heir.id, {
                            countryCode: code,
                            phoneCode: matchedPhone ? matchedPhone[0] : "+82",
                          });
                          updateHeir(heir.id, { country: countryLabel, address: "" });
                        }}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
                      >
                        {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 전화번호 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">전화번호</label>
                    <PhoneInput
                      countryCode={cs.phoneCode}
                      phone={phoneNumberOnly}
                      onCountryCodeChange={(code) => {
                        setCardState(heir.id, { phoneCode: code });
                        updateHeir(heir.id, { phone: `${code} ${phoneNumberOnly}` });
                      }}
                      onPhoneChange={(phone) => updateHeir(heir.id, { phone: `${cs.phoneCode} ${phone}` })}
                      placeholder={cs.countryCode === "KR" ? "010-0000-0000" : "Phone number"}
                    />
                  </div>

                  {/* 이메일 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">이메일</label>
                    <input
                      type="email"
                      value={heir.email}
                      onChange={(e) => updateHeir(heir.id, { email: e.target.value })}
                      placeholder="heir@example.com"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] focus:ring-2 focus:ring-[#1F3864]/10 transition-all"
                    />
                  </div>

                  {/* 주소 */}
                  <GlobalAddressSearch
                    label="주소"
                    value={heir.address}
                    onChange={(address) => updateHeir(heir.id, { address })}
                    countryCode={cs.countryCode}
                    placeholder={cs.countryCode === "KR" ? "주소 검색 버튼을 눌러주세요" : "Start typing address..."}
                    showLabel
                  />

                  {/* 상속 지분 */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                      상속 지분 (%)
                      <span className="ml-2 text-gray-400 font-normal">현재 총 배분: {totalShare}%</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={heir.share ?? 0}
                        onChange={(e) => updateHeir(heir.id, { share: Number(e.target.value) })}
                        className="flex-1 accent-[#1F3864]"
                      />
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={heir.share ?? 0}
                          onChange={(e) => updateHeir(heir.id, { share: Math.min(100, Math.max(0, Number(e.target.value))) })}
                          className="w-16 px-2 py-2 text-sm text-center focus:outline-none"
                        />
                        <span className="px-2 text-gray-400 text-sm bg-gray-50 border-l border-gray-200 py-2">%</span>
                      </div>
                    </div>
                  </div>

                  {/* 완성도 표시 */}
                  {!isComplete && (
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      성명과 관계는 필수 입력 항목입니다.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 상속인 추가 버튼 */}
      <button
        type="button"
        onClick={addHeir}
        className="w-full border-2 border-dashed border-[#C9A961]/40 hover:border-[#C9A961] rounded-2xl py-4 flex items-center justify-center gap-2 text-[#C9A961] hover:bg-[#C9A961]/5 text-sm font-semibold transition-all"
      >
        <Plus className="w-4 h-4" />
        상속인 추가
      </button>

      {will.heirs.length === 0 && (
        <div className="text-center py-6 text-gray-400 text-sm">
          <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
          아직 등록된 상속인이 없습니다.<br />
          위 버튼을 눌러 상속인을 추가해 주세요.
        </div>
      )}
    </div>
  );
}
