import { FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import type { StepProps } from "./StepProps";

export default function Step9Preview({ will }: StepProps) {
  const today = new Date(will.writtenDate || Date.now());
  const dateStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  const issues: string[] = [];
  if (!will.testatorName) issues.push("유언자 성명이 입력되지 않았습니다.");
  if (!will.testatorRRN) issues.push("주민등록번호가 입력되지 않았습니다.");
  if (!will.testatorAddress) issues.push("주소가 입력되지 않았습니다.");
  if (will.heirs.length === 0) issues.push("상속인이 등록되지 않았습니다.");
  const totalShare = will.heirs.reduce((s, h) => s + h.share, 0);
  if (will.heirs.length > 0 && totalShare !== 100) issues.push(`상속 지분 합계가 ${totalShare}%입니다. 100%가 되어야 합니다.`);

  return (
    <div className="space-y-5">
      {/* 검증 결과 */}
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

      {/* 유언장 미리보기 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#1F3864] px-6 py-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C9A961]" />
          <span className="text-white font-semibold text-sm">유언장 미리보기</span>
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
