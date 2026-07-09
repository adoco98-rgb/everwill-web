import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Eye, Printer, FileText, AlertCircle } from "lucide-react";
import { Link } from "wouter";

/**
 * 기본유언장 확인 페이지
 * 무료 회원이 자기가 작성한 유언장을 확인하고 출력할 수 있는 페이지
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

  // PDF 미리보기 (isSample 모드로 호출 - willId 파라미터 없음)
  const previewMutation = trpc.willCertificate.previewPdf.useMutation({
    onSuccess: (data) => {
      if (data.base64) {
        const blob = base64ToBlob(data.base64, "application/pdf");
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      }
    },
  });

  function base64ToBlob(base64: string, mimeType: string) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  function handlePreview() {
    previewMutation.mutate({ isSample: true });
  }

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

  // 유언장 데이터 파싱 (data 필드는 JSON 문자열)
  let parsedData: any = {};
  try {
    if (willDetail.data) {
      parsedData = typeof willDetail.data === "string" ? JSON.parse(willDetail.data) : willDetail.data;
    }
  } catch {
    parsedData = {};
  }

  // 상속자/자산/유언자 정보 추출
  const heirs = parsedData?.heirs || parsedData?.beneficiaries || [];
  const assets = parsedData?.assets || [];
  const testatorName = parsedData?.testatorName || parsedData?.name || user?.name || "-";
  const testatorAddress = parsedData?.testatorAddress || parsedData?.address || "";
  const testatorPhone = parsedData?.testatorPhone || parsedData?.phone || "";
  const executor = parsedData?.executor || parsedData?.executorName || "";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">기본유언장 확인</h1>
          <p className="text-gray-600 mt-1">작성한 유언장을 확인하고 출력할 수 있습니다. (무료)</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={previewMutation.isPending}
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMutation.isPending ? "로딩..." : "미리보기"}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            출력하기
          </Button>
        </div>
      </div>

      {/* 유언장 요약 카드 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden print:border-none print:shadow-none">
        {/* 헤더 */}
        <div className="bg-[#1F3864] text-white px-6 py-4 flex items-center gap-3">
          <FileText className="w-5 h-5" />
          <div>
            <h2 className="font-bold">{willDetail.title || "나의 유언장"}</h2>
            <p className="text-white/70 text-sm">
              작성일: {new Date(willDetail.createdAt).toLocaleDateString("ko-KR")} · 
              상태: {willDetail.status === "certified" ? "인증 완료" : "초안 (미인증)"}
            </p>
          </div>
        </div>

        {/* 유언장 내용 */}
        <div className="p-6 space-y-6">
          {/* 유언자 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-500 mb-2">유언자</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="font-bold text-lg text-[#1F3864]">{testatorName}</p>
              {(testatorAddress || testatorPhone) && (
                <p className="text-gray-600 text-sm mt-1">
                  {testatorAddress}{testatorAddress && testatorPhone ? " · " : ""}{testatorPhone}
                </p>
              )}
            </div>
          </section>

          {/* 유언집행자 */}
          {executor && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">유언집행자</h3>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="font-semibold text-[#1F3864]">{executor}</p>
              </div>
            </section>
          )}

          {/* 상속자 정보 */}
          {heirs.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">상속자 ({heirs.length}명)</h3>
              <div className="space-y-2">
                {heirs.map((heir: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{heir.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({heir.relationship || heir.relation || ""})</span>
                    </div>
                    {heir.share && <span className="text-[#C9A961] font-bold">{heir.share}%</span>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 자산 정보 */}
          {assets.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">등록 자산 ({assets.length}건)</h3>
              <div className="space-y-2">
                {assets.map((asset: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <span className="font-semibold">{asset.name || asset.category || asset.type || "자산"}</span>
                      {asset.type && asset.name && (
                        <span className="text-gray-500 text-sm ml-2">{asset.type}</span>
                      )}
                    </div>
                    {asset.estimatedValue && (
                      <span className="text-[#1F3864] font-bold">
                        ₩{Number(asset.estimatedValue).toLocaleString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 안내 */}
          {willDetail.status !== "certified" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
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
