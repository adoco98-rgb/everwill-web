/**
 * 4단계: 유언장 작성
 * - 제목: 회원 이름 기반 자동 입력
 * - 유언집행자: 상속 지분 가장 많은 상속자 자동 반영
 * - 서명: 전자서명 패드 2개 (유언자 서명 + 확인 서명)
 * - 새로고침 후에도 저장된 유언장 자동 불러오기
 */
import { useState, useEffect, useRef } from "react";
import { FileText, Wand2, CheckCircle2, Save, PenTool, RotateCcw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface Props {
  onComplete: () => void;
}

// ─── 서명 패드 컴포넌트 ───
function SignaturePad({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1F3864";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (value) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0); setHasDrawn(true); };
      img.src = value;
    }
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    // CSS 크기와 canvas 내부 크기 비율 보정
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FAFAFA";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
          <PenTool className="w-4 h-4 text-[#1F3864]" />
          {label}
        </label>
        <button
          onClick={clear}
          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          지우기
        </button>
      </div>
      <div className={`relative border-2 rounded-xl overflow-hidden ${hasDrawn ? "border-green-300 bg-green-50/30" : "border-dashed border-gray-300"}`}>
        <canvas
          ref={canvasRef}
          width={400}
          height={120}
          className="w-full h-[120px] cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-gray-400">여기에 서명해 주세요</p>
          </div>
        )}
      </div>
      {hasDrawn && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> 서명 완료
        </p>
      )}
    </div>
  );
}

export default function Step4Will({ onComplete }: Props) {
  const { user } = useAuth();
  const userName = (user as any)?.name || "";

  const [willContent, setWillContent] = useState("");
  const [title, setTitle] = useState("");
  const [willId, setWillId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [signature1, setSignature1] = useState<string | null>(null);
  const [signature2, setSignature2] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const { data: willData } = trpc.asset.getWillData.useQuery();
  const { data: profileData } = trpc.profile.getBasicInfo.useQuery();
  const { data: myWills } = trpc.will.getMyWills.useQuery();

  // ── 저장된 유언장 불러오기 (새로고침 후 복원) ──
  useEffect(() => {
    if (loaded) return;
    if (myWills && myWills.length > 0) {
      // 가장 최근 draft 유언장 불러오기
      const latestDraft = myWills.find((w: any) => w.status === "draft") || myWills[0];
      if (latestDraft) {
        setWillId(latestDraft.id);
        setTitle(latestDraft.title || "");
        // 상세 내용은 getWillById로 불러와야 함
        setLoaded(true);
      }
    } else {
      setLoaded(true);
    }
  }, [myWills]);

  // 유언장 상세 내용 불러오기
  const { data: willDetail } = trpc.will.getWillById.useQuery(
    { willId: willId! },
    { enabled: !!willId }
  );

  useEffect(() => {
    if (willDetail && willDetail.data) {
      setWillContent(willDetail.data);
      setTitle(willDetail.title || title);
      setSaved(true);
    }
  }, [willDetail]);

  // 제목 자동 입력 (회원 이름 기반) - 저장된 것이 없을 때만
  useEffect(() => {
    if (title) return; // 이미 제목이 있으면 건드리지 않음
    const name = profileData?.name || userName;
    if (name) {
      setTitle(`${name} 유언장`);
    }
  }, [profileData, userName]);

  // 유언집행자 자동 선택 (상속 지분 가장 많은 상속자)
  const topHeir = willData?.heirs?.length
    ? [...willData.heirs].sort((a: any, b: any) => (b.sharePercent || 0) - (a.sharePercent || 0))[0]
    : null;

  const saveMutation = trpc.will.saveWill.useMutation({
    onSuccess: (data) => {
      toast.success("유언장이 저장되었습니다.");
      setSaved(true);
      if (data.willId) setWillId(data.willId);
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
    const testatorName = profileData?.name || userName || "유언자";
    const testatorAddress = profileData?.address || "주소 미입력";

    generateDraftMutation.mutate({
      testatorName,
      testatorAddress,
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
      executor: topHeir ? `${(topHeir as any).nameKo || (topHeir as any).name || ""} (${(topHeir as any).relationship || "관계 미입력"})` : undefined,
    });
  };

  const handleSave = () => {
    if (!willContent.trim()) { toast.error("유언장 내용을 입력해주세요."); return; }
    saveMutation.mutate({
      willId: willId || undefined,
      title,
      data: willContent,
      status: "draft",
    });
  };

  const handleComplete = () => {
    if (!willContent.trim()) { toast.error("유언장 내용을 입력해주세요."); return; }
    if (!signature1) { toast.error("유언자 서명을 해주세요."); return; }
    if (!signature2) { toast.error("확인 서명을 해주세요."); return; }
    // 저장 후 다음 단계
    saveMutation.mutate(
      { willId: willId || undefined, title, data: willContent, status: "draft" },
      { onSuccess: () => onComplete() }
    );
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

      <div className="p-6 space-y-5">
        {/* 제목 (자동 입력) */}
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1.5 block">유언장 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="유언장 제목"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A961] bg-gray-50"
          />
          <p className="text-xs text-gray-400 mt-1">회원 이름 기반으로 자동 입력됩니다</p>
        </div>

        {/* 유언집행자 자동 반영 안내 */}
        {topHeir && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-1">유언집행자 자동 지정</p>
            <p className="text-xs text-blue-600">
              상속 지분이 가장 많은 <strong>{(topHeir as any).nameKo || (topHeir as any).name}</strong>
              ({(topHeir as any).relationship || "관계 미입력"}, {(topHeir as any).sharePercent || 0}%)이
              유언집행자로 자동 반영됩니다.
            </p>
          </div>
        )}

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
            placeholder={"유언장 내용을 입력하거나 AI 자동 작성 버튼을 눌러주세요.\n\n예시:\n본인 ○○○은 다음과 같이 유언합니다.\n\n1. 재산 처분에 관하여..."}
            rows={14}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#C9A961] resize-none leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1">{willContent.length}자</p>
        </div>

        {/* ─── 전자서명 영역 ─── */}
        {willContent.trim() && (
          <div className="border-t border-gray-100 pt-5 space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-bold text-amber-800 mb-1">전자서명 (필수)</p>
              <p className="text-xs text-amber-700">
                유언장의 법적 효력을 위해 아래 두 곳에 서명해 주세요.
                <br />전자서명법에 따라 전자서명은 자필 서명과 동일한 법적 효력을 가집니다.
              </p>
            </div>

            {/* 서명 1: 유언자 서명 */}
            <SignaturePad
              label={`유언자 서명 (${profileData?.name || userName || "본인"})`}
              value={signature1}
              onChange={setSignature1}
            />

            {/* 서명 2: 확인 서명 */}
            <SignaturePad
              label="확인 서명 (동일인 재확인)"
              value={signature2}
              onChange={setSignature2}
            />
          </div>
        )}

        {/* 임시 저장 */}
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
          onClick={handleComplete}
          disabled={!willContent.trim() || !signature1 || !signature2}
          className="w-full bg-[#1F3864] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          유언장 작성 완료 · 다음 단계로
        </button>
        {saved && (
          <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" />저장되었습니다.
          </p>
        )}
      </div>
    </div>
  );
}
