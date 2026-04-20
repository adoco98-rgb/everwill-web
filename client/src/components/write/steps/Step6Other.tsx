import { useState } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { nanoid } from "nanoid";
import type { StepProps } from "./StepProps";
import type { OtherAsset } from "@/lib/willTypes";

const OTHER_TYPES = ["자동차", "귀금속/보석", "미술품/골동품", "지식재산권", "사업체 지분", "기타"];

export default function Step6Other({ will, update }: StepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<OtherAsset>>({});

  const save = () => {
    if (!form.description) return;
    const item: OtherAsset = {
      id: form.id || nanoid(8),
      type: form.type || "기타",
      description: form.description,
      estimatedValue: form.estimatedValue || "",
      heirId: form.heirId || "",
    };
    const exists = will.otherAssets.find((o) => o.id === item.id);
    update({ otherAssets: exists ? will.otherAssets.map((o) => o.id === item.id ? item : o) : [...will.otherAssets, item] });
    setShowForm(false);
    setForm({});
  };

  return (
    <div className="space-y-5">
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-700">
        자동차, 귀금속, 미술품 등 기타 자산을 입력합니다. 없으면 건너뛰어도 됩니다.
      </div>
      {will.otherAssets.map((oa) => (
        <div key={oa.id} className="flex items-center justify-between bg-[#FAFAF8] rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center"><Package className="w-4 h-4 text-purple-600" /></div>
            <div>
              <div className="font-semibold text-[#1F3864] text-sm">{oa.type} · {oa.description}</div>
              <div className="text-gray-400 text-xs">{oa.estimatedValue ? `약 ${oa.estimatedValue}` : ""}</div>
            </div>
          </div>
          <button onClick={() => update({ otherAssets: will.otherAssets.filter((o) => o.id !== oa.id) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      {showForm && (
        <div className="bg-white border-2 border-[#1F3864]/20 rounded-2xl p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">자산 종류</label>
              <select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]">
                {OTHER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">예상 가액</label>
              <input value={form.estimatedValue || ""} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} placeholder="500만 원" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">상세 설명 *</label>
              <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="2022년식 현대 아반떼, 흰색, 차량번호 12가3456" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={save} className="btn-navy text-white px-6 py-2 rounded-lg text-sm font-semibold">저장</button>
            <button onClick={() => { setShowForm(false); setForm({}); }} className="text-gray-400 text-sm px-4 py-2">취소</button>
          </div>
        </div>
      )}
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="w-full border-2 border-dashed border-gray-200 hover:border-[#1F3864]/30 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-[#1F3864] text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />기타 자산 추가
        </button>
      )}
    </div>
  );
}
