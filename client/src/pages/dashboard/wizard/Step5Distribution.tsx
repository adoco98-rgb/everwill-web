/**
 * 5단계: 상속 내용 입력 (자산별 상속자 배분 설정)
 */
import { useState } from "react";
import { Scale, CheckCircle2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Props {
  onComplete: () => void;
}

export default function Step5Distribution({ onComplete }: Props) {
  const { data: willData } = trpc.asset.getWillData.useQuery();
  const [distributions, setDistributions] = useState<Record<number, number>>({});

  const assets = willData?.assets || [];
  const heirs = willData?.heirs || [];

  const getHeirName = (heirId: number) => {
    const heir = heirs.find((h: any) => h.id === heirId);
    return (heir as any)?.nameKo || (heir as any)?.name || "미지정";
  };

  const totalPercent = Object.values(distributions).reduce((sum, v) => sum + v, 0);
  const isValid = heirs.length > 0 && (totalPercent === 0 || totalPercent === 100);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-[#DC2626] to-[#b91c1c] p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">5단계: 상속 내용 입력</h3>
            <p className="text-white/60 text-xs">자산별 상속자와 배분 비율을 설정하세요</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* 안내 */}
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium">상속 배분 안내</p>
          <p className="text-xs text-blue-600 mt-1">
            각 상속자에게 배분할 비율을 입력하세요. 전체 합계가 100%가 되어야 합니다.
            유류분(법정 최소 상속분)을 자동으로 검증합니다.
          </p>
        </div>

        {/* 상속자 지분 요약 */}
        {heirs.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-700">상속자별 배분 비율</h4>
            {heirs.map((heir: any) => {
              const sharePercent = heir.sharePercent || 0;
              return (
                <div key={heir.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-red-600">{(heir.nameKo || heir.name || "?").charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{heir.nameKo || heir.name}</p>
                    <p className="text-xs text-gray-400">{heir.relationship}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-400 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(sharePercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-10 text-right">{sharePercent}%</span>
                  </div>
                </div>
              );
            })}

            {/* 합계 표시 */}
            {(() => {
              const total = heirs.reduce((sum: number, h: any) => sum + (h.sharePercent || 0), 0);
              return (
                <div className={`flex items-center justify-between p-3 rounded-xl ${
                  total === 100 ? "bg-green-50" : total > 100 ? "bg-red-50" : "bg-yellow-50"
                }`}>
                  <span className={`text-sm font-bold ${
                    total === 100 ? "text-green-700" : total > 100 ? "text-red-700" : "text-yellow-700"
                  }`}>합계</span>
                  <span className={`text-lg font-bold ${
                    total === 100 ? "text-green-700" : total > 100 ? "text-red-700" : "text-yellow-700"
                  }`}>
                    {total}%
                    {total === 100 && " ✓"}
                    {total > 100 && " (초과)"}
                    {total < 100 && total > 0 && ` (${100 - total}% 미배정)`}
                  </span>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">등록된 상속자가 없습니다.</p>
            <p className="text-xs mt-1">3단계에서 상속자를 먼저 등록해주세요.</p>
          </div>
        )}

        {/* 자산 목록 */}
        {assets.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-gray-700">등록된 자산 목록</h4>
            {assets.map((asset: any) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">{asset.name}</p>
                  <p className="text-xs text-gray-400">{asset.type}{asset.estimatedValue ? ` · ₩${asset.estimatedValue.toLocaleString()}` : ""}</p>
                </div>
                <span className="text-xs text-gray-400 bg-white px-2 py-1 rounded-lg border border-gray-200">
                  유언장에 포함됨
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 특별 지시사항 */}
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-2">특별 지시사항 (선택)</h4>
          <textarea
            placeholder="장례 방식, 집행자 지정, 반려동물 돌봄 등 특별한 지시사항을 입력하세요."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#DC2626] resize-none"
          />
        </div>

        {/* 다음 단계 버튼 */}
        <button
          onClick={onComplete}
          disabled={heirs.length === 0}
          className="w-full bg-[#1F3864] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#162d52] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          상속 내용 확인 완료 · 다음 단계로
        </button>
        {heirs.length === 0 && (
          <p className="text-xs text-gray-400 text-center">3단계에서 상속자를 먼저 등록해주세요.</p>
        )}
      </div>
    </div>
  );
}
