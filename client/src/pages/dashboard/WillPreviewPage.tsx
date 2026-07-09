import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Printer, FileText, AlertCircle, User, Users, Landmark, Award, Building2, Banknote, Car } from "lucide-react";
import { Link } from "wouter";

/**
 * 기본유언장 확인 페이지
 * 무료 회원이 자기가 작성한 유언장을 확인하고 출력할 수 있는 페이지
 * 페이지 진입 시 유언장 전체 내용이 바로 보임
 */
export default function WillPreviewPage() {
  const { user } = useAuth();

  // 유언장 목록 조회
  const { data: wills, isLoading: isLoadingWills } = trpc.will.getMyWills.useQuery();

  // 최신 유언장 ID
  const latestWillId = wills?.[0]?.id;

  // 최신 유언장 상세 조회 (data 필드 포함)
  const { data: willDetail, isLoading: isLoadingDetail } = trpc.will.getWillById.useQuery(
    { willId: latestWillId! },
    { enabled: !!latestWillId }
  );

  // 자산 + 상속자 데이터 조회 (별도 테이블)
  const { data: willData } = trpc.asset.getWillData.useQuery();
  const assetList = willData?.assets ?? [];
  const heirList = willData?.heirs ?? [];

  // 출력 기능
  function handlePrint() {
    window.print();
  }

  const isLoading = isLoadingWills || isLoadingDetail;

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // 유언장이 없는 경우
  if (!wills || wills.length === 0 || !willDetail) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#1F3864] mb-2">기본유언장 확인</h1>
        <p className="text-gray-600 mb-8">작성한 유언장을 확인하고 출력할 수 있습니다.</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">아직 작성된 유언장이 없습니다</h2>
          <p className="text-gray-500 mb-6">유언 작성하기에서 간편하게 유언장을 작성해보세요.</p>
          <Link href="/dashboard/will-wizard">
            <Button className="bg-[#1F3864] hover:bg-[#2a4a7a] text-white">
              유언 작성하기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 유언장 data 필드 분석 - JSON이면 파싱, 텍스트면 그대로 표시
  let willText = "";
  let parsedJson: any = null;

  if (willDetail.data) {
    try {
      const parsed = JSON.parse(willDetail.data);
      if (typeof parsed === "object" && parsed !== null) {
        parsedJson = parsed;
      }
    } catch {
      // JSON이 아닌 경우 → 유언장 전문 텍스트
      willText = willDetail.data;
    }
  }

  // Step4Will에서 서명 포함 JSON으로 저장한 경우 willContent 추출
  if (parsedJson?.willContent && !willText) {
    willText = parsedJson.willContent;
  }
  const signatureImage = parsedJson?.signature1 || "";
  const signatureImage2 = parsedJson?.signature2 || "";
  const signedAt = parsedJson?.signedAt || "";

  // JSON 파싱된 경우에서 유언자 정보 추출
  const testatorName = parsedJson?.testatorName || user?.name || "-";
  const testatorAddress = parsedJson?.testatorAddress || "";
  const testatorPhone = parsedJson?.testatorPhone || "";
  const executor = parsedJson?.executor || parsedJson?.executorCustomName || "";
  const executorRelation = parsedJson?.executorCustomRelation || "";
  const guardian = parsedJson?.guardian || "";
  const funeralWish = parsedJson?.funeralWish || "";
  const specialInstructions = parsedJson?.specialInstructions || "";
  const donationDetails = parsedJson?.donationDetails || "";

  // JSON 내부 상속자/자산 (Step10Sign에서 저장한 경우)
  const jsonHeirs = parsedJson?.heirs || [];
  const jsonRealEstates = parsedJson?.realEstates || [];
  const jsonFinancialAssets = parsedJson?.financialAssets || [];
  const jsonOtherAssets = parsedJson?.otherAssets || [];

  // 자산 타입 아이콘 매핑
  function getAssetIcon(type: string) {
    if (type === "real_estate" || type === "부동산") return Building2;
    if (type === "financial" || type === "금융") return Banknote;
    if (type === "vehicle" || type === "자동차") return Car;
    return Landmark;
  }

  // 자산 타입 한글 변환
  function getAssetTypeLabel(type: string) {
    const map: Record<string, string> = {
      real_estate: "부동산", apartment: "아파트", house: "단독주택", land: "토지",
      financial: "금융자산", deposit: "예금", stock: "주식", insurance: "보험", fund: "펀드",
      crypto: "가상자산", vehicle: "자동차", jewelry: "귀금속", art: "미술품", other: "기타",
    };
    return map[type] || type;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">기본유언장 확인</h1>
          <p className="text-gray-600 mt-1">작성한 유언장을 확인하고 출력할 수 있습니다. (무료)</p>
        </div>
        <Button
          variant="outline"
          onClick={handlePrint}
          className="gap-2"
        >
          <Printer className="w-4 h-4" />
          출력하기
        </Button>
      </div>

      {/* 유언장 전체 내용 표시 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden print:border-none print:shadow-none">
        {/* 카드 헤더 */}
        <div className="bg-[#1F3864] text-white px-6 py-4 flex items-center gap-3 print:bg-white print:text-[#1F3864] print:border-b-2 print:border-[#1F3864]">
          <FileText className="w-5 h-5" />
          <div>
            <h2 className="font-bold text-lg">{willDetail.title || "나의 유언장"}</h2>
            <p className="text-white/70 text-sm print:text-gray-500">
              작성일: {new Date(willDetail.createdAt).toLocaleDateString("ko-KR")} · 
              상태: {willDetail.status === "certified" ? "인증 완료 ✓" : "초안 (미인증)"}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* ─── 유언장 전문 텍스트가 있는 경우 (Step4Will에서 저장) ─── */}
          {willText && (
            <section>
              <div className="bg-[#FAFAF8] border border-gray-100 rounded-xl p-6 print:p-0 print:border-none print:bg-white">
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {willText.split("\n").map((line, idx) => {
                    // 마크다운 볼드 처리
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={idx} className="font-bold text-[#1F3864] text-base mt-4 mb-2">{line.replace(/\*\*/g, "")}</p>;
                    }
                    if (line.startsWith("---")) {
                      return <hr key={idx} className="my-4 border-gray-200" />;
                    }
                    if (line.trim() === "") {
                      return <div key={idx} className="h-3" />;
                    }
                    // 일반 텍스트 (볼드 인라인 처리)
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={idx} className="text-sm leading-7">
                        {parts.map((part, pIdx) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={pIdx} className="text-[#1F3864]">{part.replace(/\*\*/g, "")}</strong>;
                          }
                          return <span key={pIdx}>{part}</span>;
                        })}
                      </p>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ─── JSON 데이터가 있는 경우 (Step10Sign에서 저장) ─── */}
          {parsedJson && (
            <>
              {/* 유언자 정보 */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[#1F3864]" />
                  <h3 className="font-bold text-[#1F3864]">유언자 정보</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="font-bold text-lg text-gray-900">{testatorName}</p>
                  {testatorAddress && <p className="text-gray-600 text-sm mt-1">{testatorAddress}</p>}
                  {testatorPhone && <p className="text-gray-600 text-sm">{testatorPhone}</p>}
                </div>
              </section>

              {/* 상속자 정보 */}
              {jsonHeirs.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#1F3864]" />
                    <h3 className="font-bold text-[#1F3864]">상속자 ({jsonHeirs.length}명)</h3>
                  </div>
                  <div className="space-y-2">
                    {jsonHeirs.map((heir: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-[#1F3864]">{(heir.name || "?").charAt(0)}</span>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-800">{heir.name}</span>
                            <span className="text-gray-500 text-sm ml-2">({heir.relation || ""})</span>
                            {heir.phone && <p className="text-xs text-gray-400">{heir.phone}</p>}
                          </div>
                        </div>
                        {heir.share > 0 && (
                          <span className="text-[#C9A961] font-bold text-lg">{heir.share}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 부동산 자산 */}
              {jsonRealEstates.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-[#1F3864]" />
                    <h3 className="font-bold text-[#1F3864]">부동산 ({jsonRealEstates.length}건)</h3>
                  </div>
                  <div className="space-y-2">
                    {jsonRealEstates.map((re: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{re.type} - {re.address}</p>
                            {re.area && <p className="text-xs text-gray-500 mt-0.5">면적: {re.area}</p>}
                          </div>
                          {re.estimatedValue && (
                            <span className="text-[#1F3864] font-bold">₩{Number(re.estimatedValue).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 금융 자산 */}
              {jsonFinancialAssets.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Banknote className="w-4 h-4 text-[#1F3864]" />
                    <h3 className="font-bold text-[#1F3864]">금융자산 ({jsonFinancialAssets.length}건)</h3>
                  </div>
                  <div className="space-y-2">
                    {jsonFinancialAssets.map((fa: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">{fa.type} - {fa.institution}</p>
                            {fa.accountNo && <p className="text-xs text-gray-500 mt-0.5">계좌: {fa.accountNo}</p>}
                          </div>
                          {fa.estimatedValue && (
                            <span className="text-[#1F3864] font-bold">₩{Number(fa.estimatedValue).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 기타 자산 */}
              {jsonOtherAssets.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Landmark className="w-4 h-4 text-[#1F3864]" />
                    <h3 className="font-bold text-[#1F3864]">기타 자산 ({jsonOtherAssets.length}건)</h3>
                  </div>
                  <div className="space-y-2">
                    {jsonOtherAssets.map((oa: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{oa.type}: {oa.description}</p>
                        </div>
                        {oa.estimatedValue && (
                          <span className="text-[#1F3864] font-bold">₩{Number(oa.estimatedValue).toLocaleString()}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 유언집행자 */}
              {executor && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-[#1F3864]" />
                    <h3 className="font-bold text-[#1F3864]">유언집행자</h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">
                      {executor}
                      {executorRelation && <span className="text-gray-500 font-normal ml-2">({executorRelation})</span>}
                    </p>
                  </div>
                </section>
              )}

              {/* 특별 지시사항 */}
              {(funeralWish || guardian || donationDetails || specialInstructions) && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-[#1F3864]" />
                    <h3 className="font-bold text-[#1F3864]">특별 지시사항</h3>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                    {funeralWish && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">장례 방식</p>
                        <p className="text-sm text-gray-800">{funeralWish}</p>
                      </div>
                    )}
                    {guardian && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">미성년 자녀 후견인</p>
                        <p className="text-sm text-gray-800">{guardian}</p>
                      </div>
                    )}
                    {donationDetails && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">기부 내역</p>
                        <p className="text-sm text-gray-800">{donationDetails}</p>
                      </div>
                    )}
                    {specialInstructions && (
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">기타 지시사항</p>
                        <p className="text-sm text-gray-800">{specialInstructions}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          {/* ─── 별도 테이블 자산/상속자 (JSON에 없는 경우 보충) ─── */}
          {!parsedJson && !willText && assetList.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864]">등록 자산 ({assetList.length}건)</h3>
              </div>
              <div className="space-y-2">
                {assetList.map((asset: any) => {
                  const AssetIcon = getAssetIcon(asset.type);
                  return (
                    <div key={asset.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <AssetIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="font-semibold text-gray-800">{asset.name}</span>
                          <span className="text-gray-500 text-sm ml-2">{getAssetTypeLabel(asset.type)}</span>
                        </div>
                      </div>
                      {asset.estimatedValue > 0 && (
                        <span className="text-[#1F3864] font-bold">₩{Number(asset.estimatedValue).toLocaleString()}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {!parsedJson && !willText && heirList.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864]">상속자 ({heirList.length}명)</h3>
              </div>
              <div className="space-y-2">
                {heirList.map((heir: any) => (
                  <div key={heir.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#1F3864]">{(heir.nameKo || heir.name || "?").charAt(0)}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">{heir.nameKo || heir.name}</span>
                        <span className="text-gray-500 text-sm ml-2">({heir.relationship || ""})</span>
                      </div>
                    </div>
                    {heir.sharePercent > 0 && (
                      <span className="text-[#C9A961] font-bold text-lg">{heir.sharePercent}%</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── 서명 ─── */}
          {signatureImage && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864]">전자 서명</h3>
                {signedAt && (
                  <span className="text-xs text-gray-500 ml-2">
                    (서명일: {new Date(signedAt).toLocaleDateString("ko-KR")})
                  </span>
                )}
              </div>
              <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">유언자 서명</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 inline-block">
                    <img src={signatureImage} alt="유언자 서명" className="h-16 object-contain" />
                  </div>
                </div>
                {signatureImage2 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">확인 서명</p>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 inline-block">
                      <img src={signatureImage2} alt="확인 서명" className="h-16 object-contain" />
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ─── 상태 안내 ─── */}
          {willDetail.status !== "certified" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 print:hidden">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">안내</p>
                <p>현재 유언장은 초안 상태입니다. 전자유언인증을 완료하면 블록체인 타임스탬프와 함께 보관되어 효력이 강화됩니다.</p>
              </div>
            </div>
          )}

          {willDetail.status === "certified" && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
              <FileText className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">인증 완료</p>
                <p>
                  인증번호: {willDetail.certNumber} · 
                  인증일: {willDetail.certifiedAt ? new Date(willDetail.certifiedAt).toLocaleDateString("ko-KR") : "-"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
