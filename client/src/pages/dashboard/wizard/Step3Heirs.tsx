/**
 * 3단계: 상속자 등록
 * trpc.heirs.getMyHeirs / addHeir / deleteHeir 활용
 */
import { useState } from "react";
import { Users, Plus, Trash2, CheckCircle2, UserPlus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

const RELATIONSHIPS = [
  { value: "spouse", label: "배우자" },
  { value: "child", label: "자녀" },
  { value: "parent", label: "부모" },
  { value: "sibling", label: "형제/자매" },
  { value: "grandchild", label: "손자녀" },
  { value: "other", label: "기타" },
];

export default function Step3Heirs({ onComplete }: Props) {
  const [showForm, setShowForm] = useState(false);
  type RelType = "spouse" | "child" | "parent" | "sibling" | "grandchild" | "other";
  const [form, setForm] = useState({
    nameKo: "",
    nameEn: "",
    relationship: "child" as RelType,
    birthDate: "",
    phone: "",
    email: "",
    country: "KR",
    sharePercent: "",
  });

  const { data: heirs, refetch } = trpc.heirs.getMyHeirs.useQuery();
  const addMutation = trpc.heirs.addHeir.useMutation({
    onSuccess: () => {
      toast.success("상속자가 등록됐습니다.");
      refetch();
      setShowForm(false);
      setForm({ nameKo: "", nameEn: "", relationship: "child" as RelType, birthDate: "", phone: "", email: "", country: "KR", sharePercent: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.heirs.deleteHeir.useMutation({
    onSuccess: () => { toast.success("상속자가 삭제됐습니다."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const totalPercent = heirs?.reduce((sum, h) => sum + (h.sharePercent || 0), 0) || 0;

  const handleAdd = () => {
    if (!form.nameKo) { toast.error("이름을 입력해주세요."); return; }
    if (!form.relationship) { toast.error("관계를 선택해주세요."); return; }
    addMutation.mutate({
      nameKo: form.nameKo,
      nameEn: form.nameEn || undefined,
      relationship: form.relationship,
      birthDate: form.birthDate || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      country: form.country,
      sharePercent: form.sharePercent ? Number(form.sharePercent) : undefined,
      shareType: "percent",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">3단계: 상속자 등록</h3>
            <p className="text-white/60 text-xs">유산을 받을 상속인을 등록하세요</p>
          </div>
          {heirs && heirs.length > 0 && (
            <div className="ml-auto text-right">
              <div className="text-white font-bold text-lg">{heirs.length}명</div>
              <div className="text-white/60 text-xs">등록된 상속자</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 지분 합계 */}
        {heirs && heirs.length > 0 && (
          <div className={`rounded-xl p-4 flex items-center justify-between ${
            totalPercent === 100 ? "bg-green-50" : totalPercent > 100 ? "bg-red-50" : "bg-yellow-50"
          }`}>
            <span className={`text-sm font-medium ${
              totalPercent === 100 ? "text-green-700" : totalPercent > 100 ? "text-red-700" : "text-yellow-700"
            }`}>
              총 상속 지분
            </span>
            <span className={`text-lg font-bold ${
              totalPercent === 100 ? "text-green-700" : totalPercent > 100 ? "text-red-700" : "text-yellow-700"
            }`}>
              {totalPercent}%
              {totalPercent === 100 && " ✓"}
              {totalPercent > 100 && " (초과!)"}
              {totalPercent < 100 && totalPercent > 0 && ` (${100 - totalPercent}% 미배정)`}
            </span>
          </div>
        )}

        {/* 상속자 목록 */}
        {heirs && heirs.length > 0 ? (
          <div className="space-y-2">
            {heirs.map((heir) => {
              const rel = RELATIONSHIPS.find((r) => r.value === heir.relationship);
              return (
                <div key={heir.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-purple-600">{heir.nameKo?.charAt(0) || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{heir.nameKo}</p>
                    <p className="text-xs text-gray-400">
                      {rel?.label || heir.relationship}
                      {heir.sharePercent ? ` · ${heir.sharePercent}%` : ""}
                      {heir.phone ? ` · ${heir.phone}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate({ id: heir.id })}
                    className="p-1.5 text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">등록된 상속자가 없습니다.</p>
            <p className="text-xs mt-1">아래 버튼을 눌러 상속자를 추가하세요.</p>
          </div>
        )}

        {/* 상속자 추가 폼 */}
        {showForm && (
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <h5 className="text-sm font-bold text-gray-700">상속자 추가</h5>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={form.nameKo}
                onChange={(e) => setForm({ ...form, nameKo: e.target.value })}
                placeholder="이름 (한국어) *"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]"
              />
              <input
                type="text"
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="Name (English)"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <select
              value={form.relationship}
              onChange={(e) => setForm({ ...form, relationship: e.target.value as RelType })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]"
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="휴대폰 번호"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="이메일"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <input
              type="number"
              value={form.sharePercent}
              onChange={(e) => setForm({ ...form, sharePercent: e.target.value })}
              placeholder="상속 지분 % (예: 50)"
              min={1}
              max={100}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B5CF6]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm font-medium">취소</button>
              <button onClick={handleAdd} disabled={addMutation.isPending} className="flex-1 bg-[#8B5CF6] text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
                {addMutation.isPending ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        )}

        {/* 상속자 추가 버튼 */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-xl text-sm font-medium hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            상속자 추가하기
          </button>
        )}

        {/* 다음 단계 버튼 */}
        <button
          onClick={onComplete}
          disabled={!heirs || heirs.length === 0}
          className="w-full bg-[#8B5CF6] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#7C3AED] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          상속자 등록 완료 · 다음 단계로
        </button>
        {(!heirs || heirs.length === 0) && (
          <p className="text-xs text-gray-400 text-center">최소 1명 이상의 상속자를 등록해야 다음 단계로 진행할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
