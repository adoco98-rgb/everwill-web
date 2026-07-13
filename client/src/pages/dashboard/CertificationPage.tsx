/**
 * 인증 현황 페이지
 * 얼굴 인증(KYC), 유언장 전자 인증, 자산 인증 상태를 한눈에 확인
 */
import { CheckCircle2, Clock, AlertCircle, Shield, FileText, Package, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import FaceVerification from "@/components/FaceVerification";
import { Link } from "wouter";

// 인증 상태 배지 컴포넌트
function StatusBadge({ verified, label }: { verified: boolean; label?: string }) {
  if (verified) {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        {label ?? "완료"}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-gray-500 gap-1">
      <Clock className="w-3 h-3" />
      {label ?? "미완료"}
    </Badge>
  );
}

export default function CertificationPage() {
  // 얼굴 인증 상태
  const { data: faceStatus, refetch: refetchFace } = trpc.verification.getStatus.useQuery();

  // 유언장 목록 (인증 완료 여부 확인용)
  const { data: willsData, refetch: refetchWills } = trpc.will.getMyWills.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifiedWills = (willsData ?? []).filter((w: any) => w.isCertified === 1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uncertifiedWills = (willsData ?? []).filter((w: any) => w.isCertified !== 1);
  const hasCertifiedWill = certifiedWills.length > 0;

  // 인증 연결 mutation
  const [certifyingId, setCertifyingId] = useState<number | null>(null);
  const certifyWillMutation = trpc.will.certifyWill.useMutation({
    onSuccess: (data) => {
      toast.success(`유언장 인증 완료! 인증번호: ${data.certNumber}`);
      refetchWills();
      setCertifyingId(null);
    },
    onError: (err) => {
      toast.error(`인증 실패: ${err.message}`);
      setCertifyingId(null);
    },
  });

  const handleCertifyWill = (willId: number) => {
    setCertifyingId(willId);
    certifyWillMutation.mutate({ willId });
  };

  // 자산 인증 상태 - 자산이 1개 이상 등록되면 자동 완료
  const { data: assetVerifyData } = trpc.assetVerify.getStatus.useQuery();
  const { data: myAssets } = trpc.asset.listAssets.useQuery();
  const hasAssets = (myAssets ?? []).length > 0;
  // 자산 등록 완료 OR 기존 approved 상태면 완료
  const assetVerified = hasAssets || assetVerifyData?.status === "approved";

  const allVerified = faceStatus?.faceVerified && hasCertifiedWill && assetVerified;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]">인증 현황</h1>
        <p className="text-gray-500 text-sm mt-1">
          본인 인증, 유언장 전자 인증, 자산 인증 상태를 확인하세요.
        </p>
      </div>

      {/* 전체 인증 완료 배너 */}
      {allVerified && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#1F3864] text-white">
          <Shield className="w-8 h-8 text-[#C9A961] shrink-0" />
          <div>
            <p className="font-bold">모든 인증이 완료되었습니다!</p>
            <p className="text-sm text-blue-200 mt-0.5">EverWill 공식 인증 문서를 발급받을 수 있습니다.</p>
          </div>
        </div>
      )}

      {/* 인증 항목 카드 목록 */}
      <div className="space-y-4">

        {/* 1. 본인 인증 (얼굴 KYC) */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                  <span className="text-[#1F3864] font-bold text-sm">1</span>
                </div>
                본인 인증 (KYC)
              </CardTitle>
              <StatusBadge verified={faceStatus?.faceVerified ?? false} />
            </div>
          </CardHeader>
          <CardContent>
            {faceStatus?.faceVerified ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>신분증 + 셀피 얼굴 매칭 완료</span>
                </div>
                {faceStatus.faceVerifiedAt && (
                  <p className="text-xs text-gray-500">
                    인증 일시: {new Date(faceStatus.faceVerifiedAt).toLocaleString("ko-KR")}
                  </p>
                )}
                {faceStatus.faceVerifyResult && (
                  <p className="text-xs text-gray-500">{faceStatus.faceVerifyResult}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  신분증 사진과 셀피(얼굴 사진)를 업로드하여 본인 인증을 완료하세요.
                  모바일에서 카메라로 직접 촬영하거나 갤러리에서 사진을 선택할 수 있습니다.
                </p>
                {/* 얼굴 인증 컴포넌트 인라인 표시 */}
                <FaceVerification onSuccess={() => refetchFace()} compact />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. 유언장 전자 인증 */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                  <span className="text-[#1F3864] font-bold text-sm">2</span>
                </div>
                유언장 전자 인증
              </CardTitle>
              <StatusBadge verified={hasCertifiedWill} />
            </div>
          </CardHeader>
          <CardContent>
            {hasCertifiedWill ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>인증된 유언장 {certifiedWills.length}건</span>
                </div>
                {certifiedWills.map((w) => (
                  <div key={w.id} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {w.certNumber ?? `유언장 #${w.id}`}
                    </span>
                    <span>{w.certifiedAt ? new Date(w.certifiedAt).toLocaleDateString("ko-KR") : "-"}</span>
                  </div>
                ))}
              </div>
            ) : uncertifiedWills.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  작성된 유언장을 선택하여 전자 인증을 연결하세요.
                </p>
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {uncertifiedWills.map((w: any) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FileText className="w-4 h-4 text-[#1F3864]" />
                        <div>
                          <p className="font-medium">{w.title || `유언장 #${w.id}`}</p>
                          <p className="text-xs text-gray-400">
                            작성일: {w.createdAt ? new Date(w.createdAt).toLocaleDateString("ko-KR") : "-"}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#1F3864] hover:bg-[#162a4e] text-white text-xs px-3"
                        disabled={certifyingId === w.id}
                        onClick={() => handleCertifyWill(w.id)}
                      >
                        {certifyingId === w.id ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" />처리중...</>
                        ) : (
                          "인증 연결하기"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="pt-1">
                  <Link href="/write">
                    <Button variant="ghost" size="sm" className="text-xs text-gray-400 gap-1 px-0 hover:text-[#1F3864]">
                      <FileText className="w-3 h-3" />
                      새 유언장 작성하기
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  유언장 작성 후 전자 인증을 완료하면 효력이 강화됩니다.
                </p>
                <Link href="/write">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    유언장 작성하기
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. 자산 인증 */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                  <span className="text-[#1F3864] font-bold text-sm">3</span>
                </div>
                자산 인증
              </CardTitle>
              <StatusBadge
                verified={assetVerified}
                label={assetVerified ? "완료" : "미완료"}
              />
            </div>
          </CardHeader>
          <CardContent>
            {assetVerified ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>자산 등록 완료 ({(myAssets ?? []).length}건)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  등기부등본, 잔액증명서, 주식증명서 등 자산 서류를 업로드하여 자산 인증을 받으세요.
                </p>
                <Link href="/dashboard/asset-verify">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Package className="w-4 h-4" />
                    자산 서류 제출하기
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* 공식 인증 문서 발급 안내 */}
      <Card className="border-[#C9A961] bg-[#C9A961]/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-[#C9A961] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-[#1F3864] text-sm">EverWill 공식 인증 문서</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                본인 인증 + 유언장 전자 인증 + 자산 인증이 모두 완료되면 공식 인증 통합 문서(한글/영문)를 발급받을 수 있습니다.
                법원·금융기관 제출용으로 활용 가능합니다.
              </p>
              {allVerified && (
                <Link href="/dashboard">
                  <Button size="sm" className="mt-3 bg-[#C9A961] hover:bg-[#b8963f] text-white">
                    공식 인증 문서 발급
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
