import { useState } from "react";
import { Plus, Trash2, Banknote } from "lucide-react";
import { nanoid } from "nanoid";
import type { StepProps } from "./StepProps";
import type { FinancialAsset } from "@/lib/willTypes";

const FA_TYPES = ["예금/적금", "주식/펀드", "보험", "연금", "채권", "가상자산", "기타"];
const INSTITUTIONS = ["KB국민은행", "신한은행", "하나은행", "우리은행", "NH농협", "카카오뱅크", "토스뱅크", "삼성증권", "미래에셋", "기타"];

export default function Step5Financial({ will, update }: StepProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<FinancialAsset>>({});

  const save = () => {
    if (!form.institution) return;
    const item: FinancialAsset = {
      id: form.id || nanoid(8),
      type: form.type || "예금/적금",
      institution: form.institution,
      accountNo: form.accountNo || "",
      estimatedValue: form.estimatedValue || "",
      heirId: form.heirId || "",
      sharePercent: form.sharePercent || 100,
    };
    const exists = will.financialAssets.find((f) => f.id === item.id);
    update({ financialAssets: exists ? will.financialAssets.map((f) => f.id === item.id ? item : f) : [...will.financialAssets, item] });
    setShowForm(false);
    setForm({});
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        금융자산이 없으면 건너뛰어도 됩니다. 계좌번호는 뒷 4자리만 입력해도 됩니다.
      </div>
      {will.financialAssets.map((fa) => (
        <div key={fa.id} className="flex items-center justify-between bg-[#FAFAF8] rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center"><Banknote className="w-4 h-4 text-blue-600" /></div>
            <div>
              <div className="font-semibold text-[#1F3864] text-sm">{fa.type} · {fa.institution}</div>
              <div className="text-gray-400 text-xs">{fa.accountNo ? `계좌 ****${fa.accountNo.slice(-4)}` : ""} {fa.estimatedValue ? `· 약 ${fa.estimatedValue}` : ""}</div>
            </div>
          </div>
          <button onClick={() => update({ financialAssets: will.financialAssets.filter((f) => f.id !== fa.id) })} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
      {showForm && (
        <div className="bg-white border-2 border-[#1F3864]/20 rounded-2xl p-5 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">자산 종류</label>
              <select value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]">
                {FA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">금융기관 *</label>
              <select value={form.institution || ""} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]">
                <option value="">선택</option>
                {INSTITUTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">계좌번호 (뒷 4자리)</label>
              <input value={form.accountNo || ""} onChange={(e) => setForm({ ...form, accountNo: e.target.value })} placeholder="1234" maxLength={20} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">예상 가액</label>
              <input value={form.estimatedValue || ""} onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })} placeholder="1억 원" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864]" />
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
          <Plus className="w-4 h-4" />금융자산 추가
        </button>
      )}
    </div>
  );
}
