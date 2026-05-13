/**
 * Step 3: 상속인 등록
 * - 전화번호: PhoneInput 컴포넌트 (국가코드 선택)
 * - 주소: GlobalAddressSearch (한국: 카카오, 해외: Google Places)
 * - 상속 지분 합계 실시간 검증
 */
import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { nanoid } from "nanoid";
import type { StepProps } from "./StepProps";
import type { Heir } from "@/lib/willTypes";
import AIGuide from "../AIGuide";
import GlobalAddressSearch from "../GlobalAddressSearch";
import PhoneInput from "../PhoneInput";
import { PHONE_CODE_TO_ISO } from "@/lib/formatUtils";

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

export default function Step3Heirs({ will, update }: StepProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Heir>>({});
  const [heirCountry, setHeirCountry] = useState<string>("KR");
  const [phoneCode, setPhoneCode] = useState<string>("+82");

  const totalShare = will.heirs.reduce((sum, h) => sum + (h.share || 0), 0);

  const addHeir = () => {
    const id = nanoid(8);
    setForm({ id, share: 0 });
    setHeirCountry("KR");
    setPhoneCode("+82");
    setEditing(id);
  };

  const saveHeir = () => {
    if (!form.id || !form.name || !form.relation) return;
    const heir: Heir = {
      id: form.id,
      name: form.name || "",
      relation: form.relation || "",
      birthDate: form.birthDate || "",
      phone: form.phone || "",
      email: form.email || "",
      country: form.country || "대한민국",
      address: form.address || "",
      share: form.share || 0,
    };
    const exists = will.heirs.find((h) => h.id === heir.id);
    update({ heirs: exists ? will.heirs.map((h) => h.id === heir.id ? heir : h) : [...will.heirs, heir] });
    setEditing(null);
    setForm({});
    setHeirCountry("KR");
    setPhoneCode("+82");
  };

  const removeHeir = (id: string) => {
    update({ heirs: will.heirs.filter((h) => h.id !== id) });
  };

  const phoneNumberOnly = form.phone ? form.phone.replace(/^\+\d+\s?/, "") : "";

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

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>민법 제1000조</strong> — 상속인 순위: 1순위 직계비속, 2순위 직계존속, 3순위 형제자매.
        배우자는 1·2순위와 공동상속합니다.
      </div>

      {/* 등록된 상속인 목록 */}
      {will.heirs.length > 0 && (
        <div className="space-y-2">
          {will.heirs.map((heir) => (
            <div key={heir.id} className="flex items-center justify-between bg-[#FAFAF8] rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#1F3864]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1F3864] text-sm">{heir.name} · {heir.relation}</div>
                  <div className="text-gray-400 text-xs">{heir.country || "대한민국"} · {heir.phone || "연락처 미입력"} · {heir.share}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setForm({ ...heir }); setEditing(heir.id); }} className="text-gray-400 hover:text-[#1F3864] text-xs">수정</button>
                <button onClick={() => removeHeir(heir.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <div className={`text-right text-sm font-semibold ${totalShare > 100 ? "text-red-500" : totalShare === 100 ? "text-green-600" : "text-gray-400"}`}>
            총 지분: {totalShare}%
            {totalShare > 100 && " ⚠️ 100% 초과"}
            {totalShare === 100 && " ✅ 완료"}
            {totalShare < 100 && ` (${100 - totalShare}% 미배분)`}
          </div>
        </div>
      )}

      {/* 입력 폼 */}
      {editing && (
        <div className="bg-white border-2 border-[#1F3864]/20 rounded-2xl p-5 space-y-4">
          <h4 className="font-bold text-[#1F3864] text-sm">상속인 정보 입력</h4>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">성명 *</label>
              <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="홍길동" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">관계 *</label>
              <select value={form.relation || ""} onChange={(e) => setForm({ ...form, relation: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]">
                <option value="">선택</option>
                {RELATIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">생년월일</label>
              <input type="date" value={form.birthDate || ""} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">거주 국가</label>
              <select
                value={heirCountry}
                onChange={(e) => {
                  setHeirCountry(e.target.value);
                  const countryLabel = COUNTRIES.find(c => c.code === e.target.value)?.label.replace(/^.{3}/, "").trim() || "대한민국";
                  setForm({ ...form, country: countryLabel, address: "" });
                  const matchedPhone = Object.entries(PHONE_CODE_TO_ISO).find(([, iso]) => iso === e.target.value);
                  if (matchedPhone) setPhoneCode(matchedPhone[0]);
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]"
              >
                {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* 연락처 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">연락처</label>
            <PhoneInput
              countryCode={phoneCode}
              phone={phoneNumberOnly}
              onCountryCodeChange={(code) => { setPhoneCode(code); setForm({ ...form, phone: `${code} ${phoneNumberOnly}` }); }}
              onPhoneChange={(phone) => setForm({ ...form, phone: `${phoneCode} ${phone}` })}
              placeholder={heirCountry === "KR" ? "010-0000-0000" : "Phone number"}
            />
          </div>

          {/* 이메일 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">이메일</label>
            <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="heir@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
          </div>

          {/* 주소 - 모든 국가 자동검색 */}
          <GlobalAddressSearch
            label="주소"
            value={form.address || ""}
            onChange={(address) => setForm({ ...form, address })}
            countryCode={heirCountry}
            placeholder={heirCountry === "KR" ? "주소 검색 버튼을 눌러주세요" : "Start typing address..."}
            showLabel
          />

          {/* 상속 지분 */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              상속 지분 (%) *
              <span className="ml-2 text-gray-400 font-normal">현재 총 배분: {totalShare}%</span>
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} step={1} value={form.share ?? 0} onChange={(e) => setForm({ ...form, share: Number(e.target.value) })} className="flex-1 accent-[#1F3864]" />
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <input type="number" min={0} max={100} value={form.share ?? 0} onChange={(e) => setForm({ ...form, share: Math.min(100, Math.max(0, Number(e.target.value))) })} className="w-16 px-2 py-2 text-sm text-center focus:outline-none" />
                <span className="px-2 text-gray-400 text-sm bg-gray-50 border-l border-gray-200 py-2">%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={saveHeir} className="bg-[#1F3864] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#162d52] transition-colors">저장</button>
            <button onClick={() => { setEditing(null); setForm({}); setHeirCountry("KR"); setPhoneCode("+82"); }} className="text-gray-400 text-sm px-4 py-2">취소</button>
          </div>
        </div>
      )}

      {!editing && (
        <button onClick={addHeir} className="w-full border-2 border-dashed border-gray-200 hover:border-[#1F3864]/30 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-[#1F3864] text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          상속인 추가
        </button>
      )}
    </div>
  );
}
