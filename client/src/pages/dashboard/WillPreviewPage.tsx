import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Printer, FileText, AlertCircle, User, Users, Landmark,
  Building2, Banknote, Car, Paperclip, ShieldCheck, Crown,
  Phone, MapPin, CalendarDays, Hash, Briefcase
} from "lucide-react";
import { Link } from "wouter";

/**
 * 기본유언장 확인 페이지
 * 유언자 전체 정보 + 상속자 전원 + 자산 목록 + 서명 통합 표시
 */

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: "배우자",
  child: "자녀",
  parent: "부모",
  sibling: "형제자매",
  grandchild: "손자녀",
  other: "기타",
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  real_estate: "부동산", apartment: "아파트", house: "단독주택", land: "토지",
  financial: "금융자산", deposit: "예금", stock: "주식", insurance: "보험",
  fund: "펀드", crypto: "가상자산", vehicle: "자동차", business: "사업체·지분",
  pension: "연금", artwork: "예술품·귀금속", jewelry: "귀금속", art: "미술품",
  other: "기타",
};

function getAssetIcon(type: string) {
  if (["real_estate", "apartment", "house", "land"].includes(type)) return Building2;
  if (["financial", "deposit", "stock", "insurance", "fund", "crypto"].includes(type)) return Banknote;
  if (type === "vehicle") return Car;
  if (type === "business") return Briefcase;
  return Landmark;
}

export default function WillPreviewPage() {
  const { user } = useAuth();

  // 유언장 목록 조회
  const { data: wills, isLoading: isLoadingWills } = trpc.will.getMyWills.useQuery();
  const latestWillId = wills?.[0]?.id;

  // 최신 유언장 상세
  const { data: willDetail, isLoading: isLoadingDetail } = trpc.will.getWillById.useQuery(
    { willId: latestWillId! },
    { enabled: !!latestWillId }
  );

  // 별도 테이블 자산 + 상속자 (항상 조회)
  const { data: willData } = trpc.asset.getWillData.useQuery();
  const assetList = (willData?.assets ?? []) as any[];
  const heirList = (willData?.heirs ?? []) as any[];

  // 업로드된 증빙 서류
  const { data: attachments } = trpc.attachment.list.useQuery();

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
            <Button className="bg-[#1F3864] hover:bg-[#2a4a7a] text-white">유언 작성하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 유언장 data 파싱
  let willText = "";
  let parsedJson: any = null;
  if (willDetail.data) {
    try {
      const parsed = JSON.parse(willDetail.data);
      if (typeof parsed === "object" && parsed !== null) parsedJson = parsed;
    } catch {
      willText = willDetail.data;
    }
  }
  if (parsedJson?.willContent && !willText) willText = parsedJson.willContent;

  const signatureImage = parsedJson?.signature1 || "";
  const signedAt = parsedJson?.signedAt || "";

  // 유언자 정보 (parsedJson 우선, 없으면 user 프로필)
  const testatorName = parsedJson?.testatorName || (user as any)?.name || "-";
  const testatorRRN = parsedJson?.testatorRRN || (user as any)?.residentNumberMasked || "";
  const testatorBirthDate = parsedJson?.testatorBirthDate || (user as any)?.birthDate || "";
  const testatorPhone = parsedJson?.testatorPhone || (user as any)?.phone || "";
  const testatorAddress = parsedJson?.testatorAddress ||
    [((user as any)?.address || ""), ((user as any)?.addressDetail || "")].filter(Boolean).join(" ") || "";

  // JSON 내부 상속자/자산 (Step10Sign에서 저장한 경우)
  const jsonHeirs: any[] = parsedJson?.heirs || [];
  const jsonRealEstates: any[] = parsedJson?.realEstates || [];
  const jsonFinancialAssets: any[] = parsedJson?.financialAssets || [];
  const jsonOtherAssets: any[] = parsedJson?.otherAssets || [];

  // 집행자, 특별 지시사항
  const executor = parsedJson?.executor || parsedJson?.executorCustomName || "";
  const executorRelation = parsedJson?.executorCustomRelation || "";
  const guardian = parsedJson?.guardian || "";
  const funeralWish = parsedJson?.funeralWish || "";
  const specialInstructions = parsedJson?.specialInstructions || "";
  const donationDetails = parsedJson?.donationDetails || "";

  // 표시할 상속자: JSON 내부 > 별도 테이블
  const displayHeirs = jsonHeirs.length > 0 ? jsonHeirs : heirList;
  // 표시할 자산: JSON 내부 > 별도 테이블
  const displayAssets = (jsonRealEstates.length + jsonFinancialAssets.length + jsonOtherAssets.length) > 0
    ? null // JSON 자산은 아래에서 섹션별 표시
    : assetList;

  // 오늘 날짜
  const today = new Date();
  const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">기본유언장 확인</h1>
          <p className="text-gray-600 mt-1">작성한 유언장을 확인하고 출력할 수 있습니다. (무료)</p>
        </div>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" />
          출력하기
        </Button>
      </div>

      {/* ─── 유언장 본문 ─── */}
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

          {/* ─── 유언장 전문 텍스트 (Step4Will에서 저장한 경우) ─── */}
          {willText && (
            <section>
              <div className="bg-[#FAFAF8] border border-gray-100 rounded-xl p-6 print:p-0 print:border-none print:bg-white">
                <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {willText.split("\n").map((line, idx) => {
                    if (line.includes("서명:") && line.includes("(인)") && signatureImage) {
                      return (
                        <div key={idx} className="flex items-center gap-2 my-2">
                          <span className="text-sm">서명: </span>
                          <img src={signatureImage} alt="유언자 서명" className="h-12 object-contain inline-block" />
                          <span className="text-sm"> (인)</span>
                        </div>
                      );
                    }
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={idx} className="font-bold text-[#1F3864] text-base mt-4 mb-2">{line.replace(/\*\*/g, "")}</p>;
                    }
                    if (line.startsWith("---")) return <hr key={idx} className="my-4 border-gray-200" />;
                    if (line.trim() === "") return <div key={idx} className="h-3" />;
                    const parts = line.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={idx} className="text-sm leading-7">
                        {parts.map((part, pIdx) =>
                          part.startsWith("**") && part.endsWith("**")
                            ? <strong key={pIdx} className="text-[#1F3864]">{part.replace(/\*\*/g, "")}</strong>
                            : <span key={pIdx}>{part}</span>
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ─── 유언자 정보 (항상 표시) ─── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-[#1F3864]" />
              <h3 className="font-bold text-[#1F3864] text-base">유언자 정보</h3>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-0.5">성명</p>
                <p className="font-bold text-lg text-gray-900">{testatorName}</p>
              </div>
              {testatorRRN && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <Hash className="w-3 h-3" />주민등록번호
                  </p>
                  <p className="text-sm text-gray-800 font-mono">{testatorRRN}</p>
                </div>
              )}
              {!testatorRRN && testatorBirthDate && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />생년월일
                  </p>
                  <p className="text-sm text-gray-800">{testatorBirthDate}</p>
                </div>
              )}
              {testatorPhone && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <Phone className="w-3 h-3" />연락처
                  </p>
                  <p className="text-sm text-gray-800">{testatorPhone}</p>
                </div>
              )}
              {testatorAddress && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />주소
                  </p>
                  <p className="text-sm text-gray-800">{testatorAddress}</p>
                </div>
              )}
            </div>
          </section>

          {/* ─── 상속자 목록 (항상 표시) ─── */}
          {displayHeirs.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864] text-base">상속자 ({displayHeirs.length}명)</h3>
              </div>
              <div className="space-y-2">
                {displayHeirs
                  .slice()
                  .sort((a: any, b: any) => (a.priority ?? 99) - (b.priority ?? 99))
                  .map((heir: any, idx: number) => {
                    const isExecutor = heir.isExecutor === 1;
                    const priority = heir.priority ?? idx + 1;
                    const name = heir.nameKo || heir.name || "-";
                    const relation = RELATIONSHIP_LABELS[heir.relationship] || heir.relationship || heir.relation || "";
                    const share = heir.sharePercent ?? heir.share ?? 0;
                    const shareType = heir.shareType || "percent";
                    const shareAmount = heir.shareAmount ?? 0;
                    return (
                      <div key={heir.id ?? idx} className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                        {/* 순위 배지 */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isExecutor ? "bg-purple-100" : priority === 1 ? "bg-[#C9A961]/20" : "bg-[#1F3864]/10"
                        }`}>
                          {isExecutor
                            ? <ShieldCheck className="w-5 h-5 text-purple-600" />
                            : priority === 1
                            ? <Crown className="w-5 h-5 text-[#C9A961]" />
                            : <span className="text-sm font-bold text-[#1F3864]">{priority}</span>
                          }
                        </div>
                        {/* 이름 + 관계 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{name}</span>
                            {heir.nameEn && <span className="text-gray-400 text-sm">({heir.nameEn})</span>}
                            {relation && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1F3864]/10 text-[#1F3864]">{relation}</span>
                            )}
                            {isExecutor && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">집행자</span>
                            )}
                          </div>
                          {heir.phone && <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><Phone className="w-3 h-3" />{heir.phone}</p>}
                          {heir.address && <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{heir.address}</p>}
                          {heir.birthDate && <p className="text-xs text-gray-400 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{heir.birthDate}</p>}
                        </div>
                        {/* 분배 비율/금액 */}
                        <div className="text-right flex-shrink-0">
                          {shareType === "amount" && shareAmount > 0 ? (
                            <span className="text-[#1F3864] font-bold">₩{Number(shareAmount).toLocaleString()}</span>
                          ) : share > 0 ? (
                            <span className="text-[#C9A961] font-bold text-xl">{share}%</span>
                          ) : (
                            <span className="text-gray-300 text-sm">미정</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* ─── 자산 목록 (별도 테이블) ─── */}
          {displayAssets && displayAssets.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864] text-base">등록 자산 ({displayAssets.length}건)</h3>
              </div>
              <div className="space-y-2">
                {displayAssets.map((asset: any) => {
                  const AssetIcon = getAssetIcon(asset.type);
                  return (
                    <div key={asset.id} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <AssetIcon className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="font-semibold text-gray-800">{asset.name}</span>
                          <span className="text-gray-500 text-sm ml-2">{ASSET_TYPE_LABELS[asset.type] || asset.type}</span>
                          {asset.description && <p className="text-xs text-gray-400 mt-0.5">{asset.description}</p>}
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

          {/* ─── JSON 자산 (parsedJson에서 온 경우) ─── */}
          {jsonRealEstates.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864] text-base">부동산 ({jsonRealEstates.length}건)</h3>
              </div>
              <div className="space-y-2">
                {jsonRealEstates.map((re: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{re.type} - {re.address}</p>
                      {re.area && <p className="text-xs text-gray-500 mt-0.5">면적: {re.area}</p>}
                    </div>
                    {re.estimatedValue && (
                      <span className="text-[#1F3864] font-bold">₩{Number(re.estimatedValue).toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {jsonFinancialAssets.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864] text-base">금융자산 ({jsonFinancialAssets.length}건)</h3>
              </div>
              <div className="space-y-2">
                {jsonFinancialAssets.map((fa: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{fa.type} - {fa.institution}</p>
                      {fa.accountNo && <p className="text-xs text-gray-500 mt-0.5">계좌: {fa.accountNo}</p>}
                    </div>
                    {fa.estimatedValue && (
                      <span className="text-[#1F3864] font-bold">₩{Number(fa.estimatedValue).toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {jsonOtherAssets.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864] text-base">기타 자산 ({jsonOtherAssets.length}건)</h3>
              </div>
              <div className="space-y-2">
                {jsonOtherAssets.map((oa: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{oa.type}: {oa.description}</p>
                    {oa.estimatedValue && (
                      <span className="text-[#1F3864] font-bold">₩{Number(oa.estimatedValue).toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ─── 유언집행자 ─── */}
          {executor && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864] text-base">유언집행자</h3>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-gray-800">
                  {executor}
                  {executorRelation && <span className="text-gray-500 font-normal ml-2">({executorRelation})</span>}
                </p>
              </div>
            </section>
          )}

          {/* ─── 특별 지시사항 ─── */}
          {(funeralWish || guardian || donationDetails || specialInstructions) && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#1F3864]" />
                <h3 className="font-bold text-[#1F3864] text-base">특별 지시사항</h3>
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

          {/* ─── 서명란 ─── */}
          <section className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-4">
              위 유언은 본인의 자유로운 의사에 따라 작성하였음을 확인한다.
            </p>
            <p className="text-sm text-gray-700 mb-6">{signedAt || todayStr}</p>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-sm text-gray-700">유언자: <strong>{testatorName}</strong></p>
                {testatorAddress && <p className="text-xs text-gray-500 mt-1">주소: {testatorAddress}</p>}
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <span className="text-sm text-gray-600">서명:</span>
                {signatureImage ? (
                  <img src={signatureImage} alt="유언자 서명" className="h-14 object-contain border-b border-gray-400" />
                ) : (
                  <div className="w-32 h-14 border-b border-gray-400" />
                )}
                <span className="text-sm text-gray-600">(인)</span>
              </div>
            </div>
          </section>

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

      {/* ─── 업로드된 증빙 서류 ─── */}
      {attachments && attachments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mt-6 print:border-none print:shadow-none">
          <div className="bg-[#1F3864] text-white px-6 py-4 flex items-center gap-3 print:bg-white print:text-[#1F3864] print:border-b-2 print:border-[#1F3864]">
            <Paperclip className="w-5 h-5" />
            <div>
              <h2 className="font-bold text-lg">업로드된 증빙 서류</h2>
              <p className="text-white/70 text-sm print:text-gray-500">첨부된 서류 {attachments.length}건</p>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {(attachments as any[]).map((att) => (
              <div key={att.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{att.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {att.category !== "other" ? att.category : ""}
                      {att.description ? ` - ${att.description}` : ""}
                      {att.createdAt ? ` · ${new Date(att.createdAt).toLocaleDateString("ko-KR")}` : ""}
                    </p>
                  </div>
                </div>
                <a
                  href={att.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1F3864] hover:underline font-medium"
                >
                  보기
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
