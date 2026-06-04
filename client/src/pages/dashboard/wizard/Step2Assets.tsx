/**
 * 2단계: 자산 등록
 * trpc.asset.listAssets / addAsset / deleteAsset 활용
 */
import { useState } from "react";
import { ClipboardList, Plus, Trash2, CheckCircle2, Home, Banknote, Car, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

const ASSET_TYPES = [
  { value: "real_estate" as const, label: "부동산", icon: Home, color: "#3B82F6" },
  { value: "bank" as const, label: "금융자산", icon: Banknote, color: "#10B981" },
  { value: "vehicle" as const, label: "차량", icon: Car, color: "#F59E0B" },
  { value: "other" as const, label: "기타", icon: Package, color: "#8B5CF6" },
];

export default function Step2Assets({ onComplete }: Props) {
  const [showForm, setShowForm] = useState(false);
  type AssetType = "real_estate" | "bank" | "vehicle" | "other";
  const [form, setForm] = useState({
    type: "real_estate" as AssetType,
    name: "",
    description: "",
    estimatedValue: "",
    details: "",
  });

  const { data: assets, refetch } = trpc.asset.listAssets.useQuery();
  const addMutation = trpc.asset.addAsset.useMutation({
    onSuccess: () => {
      toast.success("자산이 등록됐습니다.");
      refetch();
      setShowForm(false);
      setForm({ type: "real_estate" as AssetType, name: "", description: "", estimatedValue: "", details: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.asset.deleteAsset.useMutation({
    onSuccess: () => { toast.success("자산이 삭제됐습니다."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const handleAdd = () => {
    if (!form.name) { toast.error("자산명을 입력해주세요."); return; }
    addMutation.mutate({
      type: form.type,
      name: form.name,
      description: form.description,
      estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : undefined,
      details: form.details,
    });
  };

  const totalValue = assets?.reduce((sum, a) => sum + (a.estimatedValue || 0), 0) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">2단계: 자산 등록</h3>
            <p className="text-white/60 text-xs">상속 대상 자산을 등록하세요</p>
          </div>
          {assets && assets.length > 0 && (
            <div className="ml-auto text-right">
              <div className="text-white font-bold text-lg">{assets.length}개</div>
              <div className="text-white/60 text-xs">등록된 자산</div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 총 자산 요약 */}
        {assets && assets.length > 0 && (
          <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between">
            <span className="text-sm text-green-700 font-medium">총 등록 자산 추정가</span>
            <span className="text-lg font-bold text-green-700">
              {totalValue > 0 ? `₩${totalValue.toLocaleString()}` : "미입력"}
            </span>
          </div>
        )}

        {/* 자산 목록 */}
        {assets && assets.length > 0 ? (
          <div className="space-y-2">
            {assets.map((asset) => {
              const typeInfo = ASSET_TYPES.find((t) => t.value === asset.type) || ASSET_TYPES[3];
              const TypeIcon = typeInfo.icon;
              return (
                <div key={asset.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeInfo.color}15` }}>
                    <TypeIcon className="w-4 h-4" style={{ color: typeInfo.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{asset.name}</p>
                    <p className="text-xs text-gray-400">{typeInfo.label}{asset.estimatedValue ? ` · ₩${asset.estimatedValue.toLocaleString()}` : ""}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate({ id: asset.id })}
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
            <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">등록된 자산이 없습니다.</p>
            <p className="text-xs mt-1">아래 버튼을 눌러 자산을 추가하세요.</p>
          </div>
        )}

        {/* 자산 추가 폼 */}
        {showForm && (
          <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
            <h5 className="text-sm font-bold text-gray-700">자산 추가</h5>
            {/* 자산 유형 */}
            <div className="grid grid-cols-4 gap-2">
              {ASSET_TYPES.map((t) => {
                const TIcon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => setForm({ ...form, type: t.value as AssetType })}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all ${
                      form.type === t.value ? "border-[#1F3864] bg-[#1F3864]/5 text-[#1F3864]" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <TIcon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="자산명 (예: 서울 강남구 아파트)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
            />
            <input
              type="text"
              placeholder="소재지 / 계좌번호 (선택)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
            <input
              type="number"
              value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
              placeholder="추정 가치 (원, 선택)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1F3864]"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-lg text-sm font-medium">취소</button>
              <button onClick={handleAdd} disabled={addMutation.isPending} className="flex-1 bg-[#1F3864] text-white py-2.5 rounded-lg text-sm font-bold disabled:opacity-50">
                {addMutation.isPending ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        )}

        {/* 자산 추가 버튼 */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full border-2 border-dashed border-gray-200 text-gray-400 py-3 rounded-xl text-sm font-medium hover:border-[#1F3864] hover:text-[#1F3864] transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            자산 추가하기
          </button>
        )}

        {/* 다음 단계 버튼 */}
        <button
          onClick={onComplete}
          disabled={!assets || assets.length === 0}
          className="w-full bg-[#1F3864] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          자산 등록 완료 · 다음 단계로
        </button>
        {(!assets || assets.length === 0) && (
          <p className="text-xs text-gray-400 text-center">최소 1개 이상의 자산을 등록해야 다음 단계로 진행할 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
