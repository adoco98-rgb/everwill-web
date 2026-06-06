/**
 * 연명치료 거부 서명 + 시신기부 서명서 페이지
 * - 사전연명의료의향서 (호스피스·완화의료법 제12조)
 * - 시신기부 동의서 (장기등 이식에 관한 법률)
 * - 법적 효력: 각 기관 공식 등록 필수 안내
 */
import { useState, useEffect } from "react";
import SaramDashboardLayout from "@/components/SaramDashboardLayout";
import { Heart, ExternalLink, CheckSquare, Square, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type DirectiveTab = "advance" | "organ";

export default function MedicalDirectivePage() {
  const [activeTab, setActiveTab] = useState<DirectiveTab>("advance");
  const [advanceChecks, setAdvanceChecks] = useState({
    noLifeSustaining: false,
    hospiceCare: false,
    noCardiopulmonary: false,
    noDialysis: false,
    noMechanicalVentilation: false,
    noBloodTransfusion: false,
    noAntibiotics: false,
    understood: false,
  });
  const [organChecks, setOrganChecks] = useState({
    kidney: false,
    liver: false,
    heart: false,
    lung: false,
    pancreas: false,
    cornea: false,
    bone: false,
    bodyDonation: false,
    understood: false,
  });
  const [advanceSaved, setAdvanceSaved] = useState(false);
  const [organSaved, setOrganSaved] = useState(false);
  const [showAdvanceDetail, setShowAdvanceDetail] = useState(false);
  const [showOrganDetail, setShowOrganDetail] = useState(false);

  // 기존 저장 데이터 조회
  const { data: savedAdvance } = trpc.medicalDirective.get.useQuery({ type: "advance" });
  const { data: savedOrgan } = trpc.medicalDirective.get.useQuery({ type: "organ" });

  // 저장된 데이터 적용
  useEffect(() => {
    if (savedAdvance?.selections) {
      setAdvanceChecks(savedAdvance.selections as typeof advanceChecks);
      setAdvanceSaved(true);
    }
  }, [savedAdvance]);

  useEffect(() => {
    if (savedOrgan?.selections) {
      setOrganChecks(savedOrgan.selections as typeof organChecks);
      setOrganSaved(true);
    }
  }, [savedOrgan]);

  // 저장 뮤테이션
  const saveMutation = trpc.medicalDirective.save.useMutation({
    onSuccess: (_, variables) => {
      if (variables.type === "advance") {
        setAdvanceSaved(true);
        toast.success("사전연명의료의향서가 저장되었습니다");
      } else {
        setOrganSaved(true);
        toast.success("장기기증 동의 의사가 저장되었습니다");
      }
    },
    onError: () => toast.error("저장에 실패했습니다. 다시 시도해주세요."),
  });

  const toggleAdvance = (key: keyof typeof advanceChecks) => {
    setAdvanceChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleOrgan = (key: keyof typeof organChecks) => {
    setOrganChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const advanceAllChecked = Object.values(advanceChecks).every(Boolean);
  const organAllChecked = organChecks.understood && Object.values(organChecks).some((v, i) => i < 8 && v);

  return (
    <SaramDashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* 헤더 */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F3864]">연명치료 거부 · 장기기증</h1>
              <p className="text-sm text-gray-500">사전의료의향서 및 기증 동의서</p>
            </div>
          </div>

          {/* 법적 고지 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-700 space-y-1">
                <p className="font-semibold">법적 효력 안내</p>
                <p>이 서명서는 <strong>EverWill 내부 의사 표시 기록</strong>입니다. 법적 효력을 위해서는 반드시 아래 공식 기관에 별도 등록해야 합니다.</p>
                <p>• 연명치료 거부: <strong>국립연명의료관리기관(NEMC)</strong> 등록 필수</p>
                <p>• 장기기증: <strong>질병관리청 장기이식관리센터(KONOS)</strong> 등록 필수</p>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
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
            장기·시신 기증 동의서
          </button>
        </div>

        {/* 사전연명의료의향서 탭 */}
        {activeTab === "advance" && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#1F3864]">사전연명의료의향서</h2>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">호스피스·완화의료법 제12조</span>
              </div>
              <p className="text-sm text-gray-500">
                임종 과정에 있을 때 연명치료를 받지 않겠다는 의사를 미리 표시합니다.
                의식이 없거나 의사 표현이 불가능한 상황에서 의료진이 이 문서를 참고합니다.
              </p>

              {/* 상세 설명 토글 */}
              <button
                type="button"
                onClick={() => setShowAdvanceDetail(!showAdvanceDetail)}
                className="flex items-center gap-1 text-xs text-[#1F3864] font-medium"
              >
                {showAdvanceDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                연명치료란 무엇인가요?
              </button>
              {showAdvanceDetail && (
                <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-2">
                  <p>연명치료(Life-Sustaining Treatment)는 임박한 사망을 일시적으로 연장하는 의학적 시술입니다.</p>
                  <p>• 심폐소생술(CPR), 인공호흡기, 혈액투석, 항암제 투여 등이 해당됩니다.</p>
                  <p>• 통증 완화, 영양 공급, 수분 공급은 연명치료가 아니므로 계속 제공됩니다.</p>
                  <p>• 호스피스·완화의료는 고통 없이 편안하게 임종을 맞이하도록 돕는 의료입니다.</p>
                </div>
              )}

              {/* 체크리스트 */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-gray-600">거부할 연명치료 항목을 선택하세요</p>
                {[
                  { key: "noLifeSustaining" as const, label: "임종 과정에서 연명치료 전반을 원하지 않습니다", important: true },
                  { key: "noCardiopulmonary" as const, label: "심폐소생술(CPR)을 원하지 않습니다" },
                  { key: "noMechanicalVentilation" as const, label: "인공호흡기 부착을 원하지 않습니다" },
                  { key: "noDialysis" as const, label: "혈액투석을 원하지 않습니다" },
                  { key: "noBloodTransfusion" as const, label: "수혈을 원하지 않습니다" },
                  { key: "noAntibiotics" as const, label: "항생제 투여를 원하지 않습니다" },
                  { key: "hospiceCare" as const, label: "호스피스·완화의료를 받겠습니다", positive: true },
                ].map(({ key, label, important, positive }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAdvance(key)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      advanceChecks[key]
                        ? positive
                          ? "border-green-500 bg-green-50"
                          : "border-[#1F3864] bg-[#1F3864]/5"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {advanceChecks[key] ? (
                      <CheckSquare className={`w-5 h-5 flex-shrink-0 ${positive ? "text-green-600" : "text-[#1F3864]"}`} />
                    ) : (
                      <Square className="w-5 h-5 flex-shrink-0 text-gray-300" />
                    )}
                    <span className={`text-sm ${important ? "font-semibold text-[#1F3864]" : "text-gray-600"}`}>{label}</span>
                    {important && <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">핵심</span>}
                  </button>
                ))}
              </div>

              {/* 이해 확인 */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => toggleAdvance("understood")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    advanceChecks.understood
                      ? "border-[#C9A961] bg-[#C9A961]/5"
                      : "border-gray-200 bg-white hover:border-[#C9A961]/30"
                  }`}
                >
                  {advanceChecks.understood ? (
                    <CheckSquare className="w-5 h-5 flex-shrink-0 text-[#C9A961]" />
                  ) : (
                    <Square className="w-5 h-5 flex-shrink-0 text-gray-300" />
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    위 내용을 충분히 이해하고, 자유로운 의사에 의해 이 의향서를 작성합니다.
                    이 문서는 법적 효력을 위해 NEMC에 별도 등록이 필요함을 알고 있습니다.
                  </span>
                </button>
              </div>

              {/* 저장 버튼 */}
              {advanceSaved ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold text-sm">✓ EverWill에 의사 표시가 저장되었습니다</p>
                  <p className="text-green-600 text-xs mt-1">법적 효력을 위해 NEMC 공식 등록을 완료해주세요.</p>
                  <a
                    href="https://www.lst.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    국립연명의료관리기관(NEMC) 공식 등록 →
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!advanceAllChecked || saveMutation.isPending}
                  onClick={() => saveMutation.mutate({ type: "advance", selections: advanceChecks })}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    advanceAllChecked
                      ? "bg-[#1F3864] text-white hover:bg-[#162d52]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {saveMutation.isPending ? "저장 중..."
                    : advanceAllChecked ? "EverWill에 의사 표시 저장" : "모든 항목을 확인 후 저장할 수 있습니다"}
                </button>
              )}
            </div>

            {/* NEMC 안내 카드 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p className="font-semibold">NEMC 공식 등록 방법</p>
                  <p>① 국립연명의료관리기관 홈페이지(lst.go.kr) 방문</p>
                  <p>② 사전연명의료의향서 등록기관 조회 (전국 병원·보건소)</p>
                  <p>③ 방문 상담 후 서명 및 등록 완료</p>
                  <p>④ 등록번호 발급 → EverWill 프로필에 입력 권장</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 장기·시신 기증 동의서 탭 */}
        {activeTab === "organ" && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-[#1F3864]">장기·시신 기증 동의서</h2>
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">장기등 이식에 관한 법률</span>
              </div>
              <p className="text-sm text-gray-500">
                사망 후 장기·조직·시신을 기증하겠다는 의사를 미리 표시합니다.
                기증된 장기는 이식 대기 중인 환자들에게 새 생명을 선물합니다.
              </p>

              {/* 상세 설명 토글 */}
              <button
                type="button"
                onClick={() => setShowOrganDetail(!showOrganDetail)}
                className="flex items-center gap-1 text-xs text-[#1F3864] font-medium"
              >
                {showOrganDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                기증 종류별 설명 보기
              </button>
              {showOrganDetail && (
                <div className="bg-rose-50 rounded-xl p-4 text-xs text-rose-700 space-y-2">
                  <p><strong>장기기증</strong>: 뇌사 또는 사망 후 신장·간·심장·폐·췌장 등을 이식 대기자에게 기증</p>
                  <p><strong>조직기증</strong>: 사망 후 각막·뼈·피부·혈관 등을 기증 (심장사 후도 가능)</p>
                  <p><strong>시신기증</strong>: 의과대학 해부학 실습 및 의학 연구를 위해 시신 전체를 기증</p>
                  <p className="text-rose-600">※ 기증 의사 표시 후에도 가족이 반대하면 기증이 이루어지지 않을 수 있습니다. 가족과 미리 상의하세요.</p>
                </div>
              )}

              {/* 기증 항목 선택 */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-semibold text-gray-600">기증할 장기·조직을 선택하세요 (복수 선택 가능)</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "kidney" as const, label: "신장 (콩팥)", emoji: "🫘" },
                    { key: "liver" as const, label: "간", emoji: "🫀" },
                    { key: "heart" as const, label: "심장", emoji: "❤️" },
                    { key: "lung" as const, label: "폐", emoji: "🫁" },
                    { key: "pancreas" as const, label: "췌장", emoji: "🫀" },
                    { key: "cornea" as const, label: "각막 (눈)", emoji: "👁️" },
                    { key: "bone" as const, label: "뼈·조직", emoji: "🦴" },
                    { key: "bodyDonation" as const, label: "시신 전체 기증", emoji: "🏥" },
                  ].map(({ key, label, emoji }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleOrgan(key)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                        organChecks[key]
                          ? "border-rose-500 bg-rose-50"
                          : "border-gray-200 bg-white hover:border-rose-200"
                      }`}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className={`text-xs font-medium ${organChecks[key] ? "text-rose-700" : "text-gray-600"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 이해 확인 */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => toggleOrgan("understood")}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    organChecks.understood
                      ? "border-[#C9A961] bg-[#C9A961]/5"
                      : "border-gray-200 bg-white hover:border-[#C9A961]/30"
                  }`}
                >
                  {organChecks.understood ? (
                    <CheckSquare className="w-5 h-5 flex-shrink-0 text-[#C9A961]" />
                  ) : (
                    <Square className="w-5 h-5 flex-shrink-0 text-gray-300" />
                  )}
                  <span className="text-sm font-semibold text-gray-700">
                    위 내용을 충분히 이해하고 자유로운 의사로 기증에 동의합니다.
                    법적 효력을 위해 KONOS에 별도 등록이 필요함을 알고 있습니다.
                  </span>
                </button>
              </div>

              {/* 저장 버튼 */}
              {organSaved ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold text-sm">✓ EverWill에 기증 의사가 저장되었습니다</p>
                  <p className="text-green-600 text-xs mt-1">법적 효력을 위해 KONOS 공식 등록을 완료해주세요.</p>
                  <a
                    href="https://www.konos.go.kr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    질병관리청 KONOS 공식 등록 →
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!organAllChecked || saveMutation.isPending}
                  onClick={() => saveMutation.mutate({ type: "organ", selections: organChecks })}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    organAllChecked
                      ? "bg-rose-600 text-white hover:bg-rose-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {organAllChecked ? "EverWill에 기증 의사 저장" : "기증 항목 선택 및 동의 후 저장 가능합니다"}
                </button>
              )}
            </div>

            {/* KONOS 안내 카드 */}
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-rose-700 space-y-1">
                  <p className="font-semibold">KONOS 공식 등록 방법</p>
                  <p>① 질병관리청 KONOS 홈페이지(konos.go.kr) 방문</p>
                  <p>② 장기기증 희망 등록 신청 (온라인 가능)</p>
                  <p>③ 가족에게 기증 의사 사전 고지 권장</p>
                  <p>④ 운전면허증·신분증 뒷면 기증 스티커 부착 가능</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SaramDashboardLayout>
  );
}
