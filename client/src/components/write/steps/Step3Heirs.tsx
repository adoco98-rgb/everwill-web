import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { nanoid } from "nanoid";
import type { StepProps } from "./StepProps";
import type { Heir } from "@/lib/willTypes";

const RELATIONS = ["배우자", "장남", "장녀", "차남", "차녀", "부모(부)", "부모(모)", "형제", "자매", "손자녀", "기타"];
const COUNTRIES = ["대한민국", "미국", "일본", "중국", "캐나다", "호주", "영국", "독일", "기타"];

export default function Step3Heirs({ will, update }: StepProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Heir>>({});

  const totalShare = will.heirs.reduce((sum, h) => sum + (h.share || 0), 0);

  const addHeir = () => {
    const id = nanoid(8);
    setForm({ id, share: 0 });
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
    update({
      heirs: exists
        ? will.heirs.map((h) => (h.id === heir.id ? heir : h))
        : [...will.heirs, heir],
    });
    setEditing(null);
    setForm({});
  };

  const removeHeir = (id: string) => {
    update({ heirs: will.heirs.filter((h) => h.id !== id) });
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>민법 제1000조</strong> — 상속인 순위: 1순위 직계비속, 2순위 직계존속, 3순위 형제자매, 4순위 4촌 이내 방계혈족.
        배우자는 1·2순위와 공동상속합니다.
      </div>

      {/* 상속인 목록 */}
      {will.heirs.length > 0 && (
        <div className="space-y-3">
          {will.heirs.map((heir) => (
            <div key={heir.id} className="flex items-center justify-between bg-[#FAFAF8] rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#1F3864]" />
                </div>
                <div>
                  <div className="font-semibold text-[#1F3864] text-sm">{heir.name}</div>
                  <div className="text-gray-400 text-xs">{heir.relation} · {heir.country}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#C9A961] font-bold text-sm">{heir.share}%</span>
                <button onClick={() => { setForm(heir); setEditing(heir.id); }} className="text-gray-400 hover:text-[#1F3864] text-xs">수정</button>
                <button onClick={() => removeHeir(heir.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <div className={`text-right text-sm font-semibold ${totalShare > 100 ? "text-red-500" : totalShare === 100 ? "text-green-600" : "text-gray-400"}`}>
            총 지분: {totalShare}% {totalShare > 100 ? "⚠️ 100% 초과" : totalShare === 100 ? "✅ 완료" : `(${100 - totalShare}% 미배분)`}
          </div>
        </div>
      )}

      {/* 추가 폼 */}
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
              <select value={form.country || "대한민국"} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]">
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">연락처</label>
              <input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+82-10-0000-0000" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">이메일</label>
              <input type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="heir@example.com" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">주소</label>
              <input value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="상세 주소" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">상속 지분 (%)</label>
              <input type="number" min={0} max={100} value={form.share ?? 0} onChange={(e) => setForm({ ...form, share: Number(e.target.value) })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={saveHeir} className="btn-navy text-white px-6 py-2 rounded-lg text-sm font-semibold">저장</button>
            <button onClick={() => { setEditing(null); setForm({}); }} className="text-gray-400 text-sm px-4 py-2">취소</button>
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
