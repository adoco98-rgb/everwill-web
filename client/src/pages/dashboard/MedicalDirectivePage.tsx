/**
 * 연명치료 거부 · 장기기증 페이지
 * - 공식 기관 안내 + 바로가기 링크
 * - EverWill에 저장된 의사 내용 확인 (읽기 전용)
 */
import { useState } from "react";
import SaramDashboardLayout from "@/components/SaramDashboardLayout";
import {
  Heart,
  ExternalLink,
  CheckCircle2,
  Info,
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

type DirectiveTab = "advance" | "organ";

export default function MedicalDirectivePage() {
  const [activeTab, setActiveTab] = useState<DirectiveTab>("advance");

  // 저장된 데이터 조회 (읽기 전용)
  const { data: savedAdvance } = trpc.medicalDirective.get.useQuery({ type: "advance" });
  const { data: savedOrgan } = trpc.medicalDirective.get.useQuery({ type: "organ" });

  const advanceSelections = savedAdvance?.selections as Record<string, boolean> | undefined;
  const organSelections = savedOrgan?.selections as Record<string, boolean> | undefined;

  const advanceLabelMap: Record<string, string> = {
    noLifeSustaining: "임종 과정에서 연명치료 전반을 원하지 않습니다",
    noCardiopulmonary: "심폐소생술(CPR)을 원하지 않습니다",
    noMechanicalVentilation: "인공호흡기 부착을 원하지 않습니다",
    noDialysis: "혈액투석을 원하지 않습니다",
    noBloodTransfusion: "수혈을 원하지 않습니다",
    noAntibiotics: "항생제 투여를 원하지 않습니다",
    hospiceCare: "호스피스·완화의료를 받겠습니다",
    understood: "내용을 충분히 이해하고 자유로운 의사로 작성합니다",
  };

  const organLabelMap: Record<string, string> = {
    kidney: "신장",
    liver: "간장",
    heart: "심장",
    lung: "폐",
    pancreas: "췌장",
    cornea: "각막",
    bone: "뼈/조직",
    bodyDonation: "시신기증",
    understood: "내용을 충분히 이해하고 자유로운 의사로 동의합니다",
  };

  const hasAdvanceSaved = advanceSelections && Object.values(advanceSelections).some(Boolean);
  const hasOrganSaved = organSelections && Object.values(organSelections).some(Boolean);

  return (
    <SaramDashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <Heart className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1F3864]">연명치료 거부 · 장기기증</h1>
            <p className="text-sm text-gray-500">공식 기관 등록 안내 및 신청 내용 확인</p>
          </div>
        </div>

        {/* 중요 안내 박스 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="font-bold text-amber-800 text-base">반드시 공식 기관에 직접 등록하세요</p>
          </div>
          <p className="text-sm text-amber-700">
            연명치료 거부와 장기기증은 <strong>공식 기관 등록</strong>을 통해서만 법적 효력이 발생합니다.
            아래 공식 사이트에서 직접 신청하시기 바랍니다.
          </p>
        </div>

        {/* 공식 기관 바로가기 */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#1F3864]">공식 기관 바로가기</h2>

          {/* NEMC */}
          <a
            href="https://www.lst.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 bg-white border-2 border-[#1F3864]/20 rounded-2xl hover:border-[#1F3864] hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#1F3864]/10 flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-6 h-6 text-[#1F3864]" />
              </div>
              <div>
                <p className="font-bold text-[#1F3864] text-base">국립연명의료관리기관 (NEMC)</p>
                <p className="text-sm text-gray-500 mt-0.5">사전연명의료의향서 공식 등록</p>
                <p className="text-xs text-gray-400 mt-1">www.lst.go.kr</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">호스피스·완화의료법 제12조</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">무료 등록</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[#1F3864] group-hover:translate-x-1 transition-transform">
              <ExternalLink className="w-5 h-5" />
            </div>
          </a>

          {/* KONOS */}
          <a
            href="https://www.konos.go.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 bg-white border-2 border-rose-200 rounded-2xl hover:border-rose-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="font-bold text-rose-700 text-base">질병관리청 장기이식관리센터 (KONOS)</p>
                <p className="text-sm text-gray-500 mt-0.5">장기기증·시신기증 공식 등록</p>
                <p className="text-xs text-gray-400 mt-1">www.konos.go.kr</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">장기등 이식에 관한 법률</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">무료 등록</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-rose-600 group-hover:translate-x-1 transition-transform">
              <ExternalLink className="w-5 h-5" />
            </div>
          </a>
        </div>

        {/* 안내 절차 */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="font-semibold text-blue-800 text-sm">등록 절차 안내</p>
          </div>
          <ol className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
              <span>위 공식 사이트에 접속하여 본인인증 후 신청서를 작성합니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
              <span>또는 가까운 보건소·사전연명의료의향서 등록기관을 방문하여 등록할 수 있습니다.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
              <span>등록 완료 후 등록번호를 EverWill 프로필에 기재해두면 응급 시 확인 가능합니다.</span>
            </li>
          </ol>
        </div>

        {/* 저장된 의사 내용 확인 */}
        <div>
          <h2 className="text-base font-bold text-[#1F3864] mb-3">EverWill 기록 내용 확인</h2>
          <p className="text-sm text-gray-500 mb-4">이전에 EverWill에 기록한 의사 내용입니다. (참고용 기록, 법적 효력 없음)</p>

          {/* 탭 */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-4">
            <button
              onClick={() => setActiveTab("advance")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "advance"
                  ? "bg-white text-[#1F3864] shadow-sm"
                  : "text-gray-500 hover:text-[#1F3864]"
              }`}
            >
              사전연명의료의향서
            </button>
            <button
              onClick={() => setActiveTab("organ")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "organ"
                  ? "bg-white text-[#1F3864] shadow-sm"
                  : "text-gray-500 hover:text-[#1F3864]"
              }`}
            >
              장기·시신 기증
            </button>
          </div>

          {/* 사전연명의료의향서 기록 */}
          {activeTab === "advance" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              {hasAdvanceSaved ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <p className="font-semibold text-green-700 text-sm">EverWill에 기록된 의사 내용</p>
                  </div>
                  {Object.entries(advanceSelections!).map(([key, value]) =>
                    value && advanceLabelMap[key] ? (
                      <div key={key} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                        <CheckCircle2 className="w-4 h-4 text-[#1F3864] shrink-0" />
                        <span className="text-sm text-gray-700">{advanceLabelMap[key]}</span>
                      </div>
                    ) : null
                  )}
                  <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                    ※ 이 기록은 참고용입니다. 법적 효력을 위해 NEMC 공식 등록이 필요합니다.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">EverWill에 기록된 내용이 없습니다.</p>
                  <p className="text-gray-400 text-xs mt-1">위 NEMC 공식 사이트에서 직접 등록하세요.</p>
                </div>
              )}
            </div>
          )}

          {/* 장기기증 기록 */}
          {activeTab === "organ" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              {hasOrganSaved ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-600" />
                    <p className="font-semibold text-rose-700 text-sm">EverWill에 기록된 기증 의사</p>
                  </div>
                  {Object.entries(organSelections!).map(([key, value]) =>
                    value && organLabelMap[key] ? (
                      <div key={key} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                        <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="text-sm text-gray-700">{organLabelMap[key]}</span>
                      </div>
                    ) : null
                  )}
                  <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                    ※ 이 기록은 참고용입니다. 법적 효력을 위해 KONOS 공식 등록이 필요합니다.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">EverWill에 기록된 내용이 없습니다.</p>
                  <p className="text-gray-400 text-xs mt-1">위 KONOS 공식 사이트에서 직접 등록하세요.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SaramDashboardLayout>
  );
}
