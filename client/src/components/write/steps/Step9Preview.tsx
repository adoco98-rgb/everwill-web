/**
 * Step9: 미리보기 - 왼쪽 법적 유효성 검토 + AI 초안, 오른쪽 실시간 법적 문서 미리보기
 * 한국 민법 제1066조 자필증서 유언 형식 기준
 */
import { useState } from "react";
import { FileText, AlertCircle, CheckCircle2, Sparkles, PenLine, Copy, Check } from "lucide-react";
import type { StepProps } from "./StepProps";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import WillDocumentPreview from "@/components/write/WillDocumentPreview";

export default function Step9Preview({ will }: StepProps) {
  const [aiDraft, setAiDraft] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [mobileTab, setMobileTab] = useState<"check" | "preview">("check");

  const today = new Date(will.writtenDate || Date.now());
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 법적 유효성 검토
  const issues: string[] = [];
  if (!will.testatorName) issues.push("유언자 성명이 입력되지 않았습니다.");
  if (!will.testatorRRN) issues.push("주민등록번호가 입력되지 않았습니다.");
  if (!will.testatorAddress) issues.push("주소가 입력되지 않았습니다.");
  if (will.heirs.length === 0) issues.push("상속인이 등록되지 않았습니다.");
  const totalShare = will.heirs.reduce((s, h) => s + h.share, 0);
  if (will.heirs.length > 0 && totalShare !== 100)
    issues.push(`상속 지분 합계가 ${totalShare}%입니다. 100%가 되어야 합니다.`);

  // AI 초안 생성 mutation
  const generateDraft = trpc.will.generateDraft.useMutation({
    onSuccess: (data) => {
      if (data.success && data.draft) {
        const draftText = typeof data.draft === "string" ? data.draft : String(data.draft);
        setAiDraft(draftText);
        toast.success("AI 유언장 초안이 생성됐습니다!");
      }
    },
    onError: () => {
      toast.error("AI 초안 생성에 실패했습니다. 다시 시도해주세요.");
    },
  });

  const handleGenerateDraft = () => {
    if (issues.length > 0) {
      toast.error("필수 항목을 먼저 입력해주세요.");
      return;
    }
    generateDraft.mutate({
      testatorName: will.testatorName,
      testatorRRN: will.testatorRRN,
      testatorAddress: will.testatorAddress,
      testatorPhone: will.testatorPhone,
      writtenDate: will.writtenDate,
      heirs: will.heirs,
      realEstates: will.realEstates,
      financialAssets: will.financialAssets,
      otherAssets: will.otherAssets,
      executor: will.executor,
      guardian: will.guardian,
      funeralWish: will.funeralWish,
      donationDetails: will.donationDetails,
      specialInstructions: will.specialInstructions,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(aiDraft);
    setCopied(true);
    toast.success("클립보드에 복사됐습니다.");
    setTimeout(() => setCopied(false), 2000);
  };

  // 왼쪽 패널 공통 컨텐츠
  const LeftPanel = () => (
    <div className="space-y-4">
      {/* 법적 유효성 검토 */}
      {issues.length > 0 ? (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            법적 유효성 검토 — {issues.length}개 항목 확인 필요
          </div>
          {issues.map((issue) => (
            <div key={issue} className="text-red-600 text-xs flex items-start gap-1.5">
              <span className="mt-0.5">•</span>{issue}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-2 text-green-700 text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          법적 유효성 검토 완료 — 모든 필수 항목이 입력됐습니다.
        </div>
      )}

      {/* 작성 내용 요약 */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[
          { label: "상속인", value: `${will.heirs.length}명` },
          { label: "부동산", value: `${will.realEstates.length}건` },
          { label: "금융자산", value: `${will.financialAssets.length}건` },
          { label: "기타자산", value: `${will.otherAssets.length}건` },
          { label: "사회기부", value: will.donationDetails ? "있음" : "없음" },
          { label: "집행자", value: will.executorType === "heir1" ? "제1상속인" : will.executorCustomName ? "직접지정" : "미지정" },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-gray-400">{item.label}</p>
            <p className="font-bold text-[#1F3864] mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* AI 초안 생성 */}
      <div className="bg-gradient-to-r from-[#1F3864] to-[#2a4a80] rounded-2xl p-5 text-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#C9A961]/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#C9A961]" />
          </div>
          <div>
            <h3 className="font-bold text-base mb-1">AI 유언장 초안 자동 생성</h3>
            <p className="text-white/70 text-sm">입력하신 정보를 바탕으로 한국 민법에 맞는 유언장 전문을 자동으로 작성합니다.</p>
          </div>
        </div>
        <button
          onClick={handleGenerateDraft}
          disabled={generateDraft.isPending || issues.length > 0}
          className="w-full bg-[#C9A961] hover:bg-[#b8954f] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {generateDraft.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI가 유언장을 작성 중입니다...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              AI 유언장 초안 생성하기
            </>
          )}
        </button>
      </div>

      {/* AI 생성된 초안 */}
      {aiDraft && (
        <div className="bg-white border-2 border-[#C9A961]/30 rounded-2xl overflow-hidden">
          <div className="bg-[#C9A961]/10 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A961]" />
              <span className="font-semibold text-[#1F3864] text-sm">AI 생성 유언장 초안</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-[#1F3864] hover:text-[#C9A961] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#C9A961]/10"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
          <div className="p-5 max-h-80 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-serif text-sm text-gray-700 leading-loose" style={{ fontFamily: "Georgia, 'Noto Serif KR', serif" }}>
              {aiDraft}
            </pre>
          </div>
          <div className="border-t border-[#C9A961]/20 bg-amber-50 px-5 py-4">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center gap-2 text-amber-800 font-semibold text-sm w-full"
            >
              <PenLine className="w-4 h-4" />
              자필 작성 방법 안내 보기
              <span className="ml-auto text-amber-600">{showGuide ? "▲" : "▼"}</span>
            </button>
            {showGuide && (
              <div className="mt-3 space-y-2 text-amber-800 text-sm">
                <p className="font-semibold">📝 자필증서 유언 작성 방법 (한국 민법 제1066조)</p>
                <div className="space-y-1.5 text-xs leading-relaxed">
                  {[
                    "A4 용지에 위 내용을 반드시 손으로 직접 써주세요. (타이핑·프린트 출력 불가)",
                    "연월일을 반드시 기재하세요. (예: 2026년 4월 20일)",
                    "주소를 자필로 기재하세요.",
                    "성명을 자필로 서명하고 도장(날인)을 찍으세요.",
                    "작성 완료 후 사진 또는 스캔하여 다음 단계에서 업로드하세요.",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-bold text-amber-800 text-xs">{i + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 bg-amber-100 rounded-lg p-3 text-xs text-amber-700">
                  ✅ 자필증서 유언은 <strong>증인이 필요 없습니다.</strong> 위 4가지 요건만 충족하면 법적 효력이 발생합니다.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* 상단 안내 */}
      <div className="bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-xl px-4 py-3 flex items-center gap-3">
        <FileText className="w-5 h-5 text-[#1F3864] flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#1F3864]">작성일: {dateStr}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            데스크탑에서는 왼쪽 검토 + 오른쪽 실시간 문서 미리보기를 동시에 확인하세요.
          </p>
        </div>
      </div>

      {/* 모바일 탭 전환 */}
      <div className="flex bg-gray-100 rounded-xl p-1 lg:hidden">
        <button
          onClick={() => setMobileTab("check")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mobileTab === "check" ? "bg-white text-[#1F3864] shadow-sm" : "text-gray-500"
          }`}
        >
          검토 & AI
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            mobileTab === "preview" ? "bg-white text-[#1F3864] shadow-sm" : "text-gray-500"
          }`}
        >
          문서 미리보기
        </button>
      </div>

      {/* 데스크탑: 좌우 분할 */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        <LeftPanel />
        <div className="sticky top-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#1F3864]" />
            <span className="text-sm font-semibold text-[#1F3864]">실시간 유언장 문서 미리보기</span>
            <span className="text-xs text-gray-400 ml-auto">입력 즉시 반영</span>
          </div>
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto rounded-2xl">
            <WillDocumentPreview will={will} />
          </div>
        </div>
      </div>

      {/* 모바일: 탭별 표시 */}
      <div className="lg:hidden">
        {mobileTab === "check" && <LeftPanel />}
        {mobileTab === "preview" && <WillDocumentPreview will={will} />}
      </div>
    </div>
  );
}
