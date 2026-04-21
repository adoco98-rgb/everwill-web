/**
 * Step 5: 금융 자산
 * AI 질문: 예금·주식·보험 등 금융 자산 등록
 */
import { useState } from "react";
import { Plus, Trash2, Banknote } from "lucide-react";
import { nanoid } from "nanoid";
import type { StepProps } from "./StepProps";
import type { FinancialAsset } from "@/lib/willTypes";
import AIGuide from "../AIGuide";

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
      {/* AI 안내 말풍선 */}
      <AIGuide
        question="예금, 주식, 보험, 연금 등 금융 자산이 있으신가요? 있으시면 등록해 주세요."
        description="금융 자산은 사망 후 금융기관에서 지급 정지됩니다. 미리 등록해 두면 SARAM이 사망 신호 감지 시 자동으로 상속인에게 안내하고 인출 절차를 도와드립니다."
        examples={[
          "KB국민은행 예금 계좌 (뒷 4자리: 1234), 잔액 약 5,000만 원 → 배우자에게 100%",
          "삼성증권 주식·펀드, 약 1억 원 → 장남 60%, 장녀 40%",
          "삼성생명 종신보험, 수익자 이미 지정됨 → 수익자 지정 보험은 유언장 없이도 자동 지급",
          "비트코인 등 가상자산 → 거래소명과 지갑 주소 메모 필요",
        ]}
        tips={[
          "계좌번호 전체를 입력하지 않아도 됩니다. 뒷 4자리만으로 식별 가능합니다.",
          "보험은 수익자가 이미 지정되어 있으면 유언장과 별개로 지급됩니다.",
          "가상자산은 개인 키(시드 구문)를 안전한 곳에 별도 보관하세요. 분실 시 영구 소멸됩니다.",
          "퇴직연금(IRP·DC)은 수익자 지정이 가능합니다. 금융기관에 확인하세요.",
        ]}
        warning="금융 자산을 등록하지 않으면 상속인이 계좌 존재 자체를 모를 수 있습니다. 안심상속 원스톱 서비스(정부)로 조회 가능하지만 시간이 걸립니다."
      />

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
