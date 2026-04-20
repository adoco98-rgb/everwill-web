/**
 * Step9: 미리보기 + AI 초안 생성 + 자필 작성 가이드
 */
import { useState } from "react";
import { FileText, AlertCircle, CheckCircle2, Sparkles, Download, PenLine, Copy, Check } from "lucide-react";
import type { StepProps } from "./StepProps";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Step9Preview({ will }: StepProps) {
  const [aiDraft, setAiDraft] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const today = new Date(will.writtenDate || Date.now());
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  // 법적 유효성 검토
  const issues: string[] = [];
  if (!will.testatorName) issues.push("유언자 성명이 입력되지 않았습니다.");
  if (!will.testatorRRN) issues.push("주민등록번호가 입력되지 않았습니다.");
  if (!will.testatorAddress) issues.push("주소가 입력되지 않았습니다.");
  if (will.heirs.length === 0) issues.push("상속인이 등록되지 않았습니다.");
  const totalShare = will.heirs.reduce((s, h) => s + h.share, 0);
  if (will.heirs.length > 0 && totalShare !== 100) issues.push(`상속 지분 합계가 ${totalShare}%입니다. 100%가 되어야 합니다.`);

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

  return (
    <div className="space-y-5">
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

      {/* AI 초안 생성 버튼 */}
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
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-[#1F3864] hover:text-[#C9A961] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#C9A961]/10"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
          </div>
          <div className="p-5">
            <pre className="whitespace-pre-wrap font-serif text-sm text-gray-700 leading-loose" style={{ fontFamily: "Georgia, 'Noto Serif KR', serif" }}>
              {aiDraft}
            </pre>
          </div>

          {/* 자필 작성 안내 */}
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
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-bold text-amber-800">1</span>
                    <span><strong>A4 용지</strong>에 위 내용을 <strong>반드시 손으로 직접</strong> 써주세요. (타이핑·프린트 출력 불가)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-bold text-amber-800">2</span>
                    <span><strong>연월일</strong>을 반드시 기재하세요. (예: 2026년 4월 20일)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-bold text-amber-800">3</span>
                    <span><strong>주소</strong>를 자필로 기재하세요.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-bold text-amber-800">4</span>
                    <span><strong>성명</strong>을 자필로 서명하고 <strong>도장(날인)</strong>을 찍으세요.</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 font-bold text-amber-800">5</span>
                    <span>작성 완료 후 <strong>사진 또는 스캔</strong>하여 다음 단계에서 업로드하세요.</span>
                  </div>
                </div>
                <div className="mt-2 bg-amber-100 rounded-lg p-3 text-xs text-amber-700">
                  ✅ 자필증서 유언은 <strong>증인이 필요 없습니다.</strong> 위 4가지 요건만 충족하면 법적 효력이 발생합니다.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 기존 유언장 미리보기 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1F3864] px-6 py-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C9A961]" />
          <span className="text-white font-semibold text-sm">유언장 구조 미리보기</span>
          <span className="ml-auto text-white/40 text-xs">한국 민법 제1065조 기준</span>
        </div>
        <div className="p-6 font-serif text-sm text-gray-700 leading-loose space-y-6" style={{ fontFamily: "Georgia, 'Noto Serif KR', serif" }}>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#1F3864] mb-1">유 언 장</h2>
            <p className="text-gray-400 text-xs">LAST WILL AND TESTAMENT</p>
          </div>

          <div className="border-t border-b border-gray-100 py-4 space-y-1">
            <p><strong>유언자 성명:</strong> {will.testatorName || "_______________"}</p>
            <p><strong>주민등록번호:</strong> {will.testatorRRN ? will.testatorRRN.replace(/(\d{6})-?(\d{7})/, "$1-*******") : "_______________"}</p>
            <p><strong>주소:</strong> {will.testatorAddress || "_______________"}</p>
            <p><strong>작성일:</strong> {dateStr}</p>
          </div>

          <div>
            <p className="font-bold text-[#1F3864] mb-2">【유언 전문】</p>
            <p className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
              본인 {will.testatorName || "___"}은(는) 정신이 맑고 건강한 상태에서 다음과 같이 유언한다.
            </p>
          </div>

          {will.heirs.length > 0 && (
            <div>
              <p className="font-bold text-[#1F3864] mb-2">【제1조 상속인 지정 및 재산 분배】</p>
              {will.heirs.map((heir, i) => (
                <p key={heir.id} className="mb-1">
                  제{i + 1}항. 본인의 {heir.relation} {heir.name}에게 전체 재산의 {heir.share}%를 상속한다.
                </p>
              ))}
            </div>
          )}

          {(will.realEstates.length > 0 || will.financialAssets.length > 0 || will.otherAssets.length > 0) && (
            <div>
              <p className="font-bold text-[#1F3864] mb-2">【제2조 재산 목록】</p>
              {will.realEstates.map((re, i) => (
                <p key={re.id} className="mb-1">부동산 {i + 1}. {re.type} — {re.address}</p>
              ))}
              {will.financialAssets.map((fa, i) => (
                <p key={fa.id} className="mb-1">금융자산 {i + 1}. {fa.type} — {fa.institution}</p>
              ))}
              {will.otherAssets.map((oa, i) => (
                <p key={oa.id} className="mb-1">기타자산 {i + 1}. {oa.type} — {oa.description}</p>
              ))}
            </div>
          )}

          {(will.executor || will.guardian || will.funeralWish) && (
            <div>
              <p className="font-bold text-[#1F3864] mb-2">【제3조 특별 지시사항】</p>
              {will.executor && <p className="mb-1">제1항. 유언집행자로 {will.executor}을(를) 지정한다.</p>}
              {will.guardian && <p className="mb-1">제2항. 미성년 자녀의 후견인으로 {will.guardian}을(를) 지정한다.</p>}
              {will.funeralWish && <p className="mb-1">제3항. 장례는 {will.funeralWish}으로 한다.</p>}
              {will.donationDetails && <p className="mb-1">제4항. {will.donationDetails}</p>}
              {will.specialInstructions && <p className="mb-1">제5항. {will.specialInstructions}</p>}
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <p className="bg-gray-50 rounded-lg p-3 text-sm leading-relaxed">
              위 유언은 본인의 자유로운 의사에 따라 작성하였음을 확인한다.
            </p>
          </div>

          <div className="text-right space-y-2">
            <p>{dateStr}</p>
            <p>유언자: {will.testatorName || "_______________"} (서명/날인)</p>
            <p className="text-gray-400 text-xs">전자서명 및 블록체인 인증 후 법적 효력 발생</p>
          </div>
        </div>
      </div>
    </div>
  );
}
