/**
 * 4단계: 유언장 작성
 * trpc.will.saveWill / getMyWills 활용
 * AI 자동 생성 기능 포함
 */
import { useState } from "react";
import { FileText, Wand2, CheckCircle2, Save } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

export default function Step4Will({ onComplete }: Props) {
  const [willContent, setWillContent] = useState("");
  const [title, setTitle] = useState("나의 유언장");
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: willData } = trpc.asset.getWillData.useQuery();
  const saveMutation = trpc.will.saveWill.useMutation({
    onSuccess: () => {
      toast.success("유언장이 저장됩니다.");
      setSaved(true);
    },
    onError: (e) => toast.error(e.message),
  });

  const generateDraftMutation = trpc.will.generateDraft.useMutation({
    onSuccess: (data) => {
      const draftText = typeof data?.draft === "string" ? data.draft : "";
      if (draftText) {
        setWillContent(draftText);
        toast.success("AI가 유언장 초안을 작성했습니다.");
      }
      setGenerating(false);
    },
    onError: (e) => {
      toast.error(e.message);
      setGenerating(false);
    },
  });

  const handleGenerate = () => {
    setGenerating(true);
    const today = new Date().toISOString().split("T")[0];
    generateDraftMutation.mutate({
      testatorName: "유언자",
      testatorAddress: "주소 미입력",
      writtenDate: today,
      heirs: (willData?.heirs || []).map((h: any) => ({
        id: String(h.id),
        name: h.nameKo || h.name || "",
        relation: h.relationship || h.relation || "",
        share: h.sharePercent || h.share || 0,
        phone: h.phone || undefined,
        email: h.email || undefined,
      })),
      realEstates: [],
      financialAssets: [],
      otherAssets: [],
    });
  };

  const handleSave = () => {
    if (!willContent.trim()) { toast.error("유언장 내용을 입력해주세요."); return; }
    saveMutation.mutate({
      title,
      data: willContent,
      status: "draft",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#C9A961] to-[#b8963a] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">4단계: 유언장 작성</h3>
            <p className="text-white/60 text-xs">AI가 도와드리거나 직접 작성하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 제목 */}
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1.5 block">유언장 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A961]"
          />
        </div>

        {/* AI 생성 버튼 */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-[#C9A961] to-[#b8963a] text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {generating ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />AI 작성 중...</>
          ) : (
            <><Wand2 className="w-4 h-4" />AI로 유언장 자동 작성</>
          )}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">또는 직접 작성</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* 유언장 내용 */}
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1.5 block">유언장 내용</label>
          <textarea
            value={willContent}
            onChange={(e) => { setWillContent(e.target.value); setSaved(false); }}
            placeholder="유언장 내용을 입력하거나 AI 자동 작성 버튼을 눌러주세요.&#10;&#10;예시:&#10;본인 ○○○은 다음과 같이 유언합니다.&#10;&#10;1. 재산 처분에 관하여..."
            rows={12}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A961] resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1">{willContent.length}자</p>
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending || !willContent.trim()}
          className="w-full border-2 border-[#C9A961] text-[#C9A961] py-3 rounded-xl font-bold text-sm hover:bg-[#C9A961]/5 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {saveMutation.isPending ? (
            <><div className="w-4 h-4 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />저장 중...</>
          ) : (
            <><Save className="w-4 h-4" />임시 저장</>
          )}
        </button>

        {/* 다음 단계 버튼 */}
        <button
          onClick={onComplete}
          disabled={!willContent.trim()}
          className="w-full bg-[#1F3864] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          유언장 작성 완료 · 다음 단계로
        </button>
        {saved && <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" />저장됐습니다.</p>}
      </div>
    </div>
  );
}
