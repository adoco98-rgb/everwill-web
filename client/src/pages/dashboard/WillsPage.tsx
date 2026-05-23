/**
 * 내 유언장 목록 페이지
 * - 작성한 유언장 목록 조회
 * - 상태별 필터 (초안/인증완료)
 * - PDF 다운로드
 * - 수정 진입
 */
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Plus,
  Download,
  Edit,
  Trash2,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

// 상태 배지 컴포넌트
function StatusBadge({ status, isCertified }: { status: string; isCertified: number | null }) {
  if (isCertified || status === "certified") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        인증 완료
      </Badge>
    );
  }
  if (status === "expired") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
        <AlertCircle className="w-3 h-3" />
        만료됨
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
      <Clock className="w-3 h-3" />
      초안
    </Badge>
  );
}

export default function WillsPage() {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<number | null>(null);
  const [generatingCardId, setGeneratingCardId] = useState<number | null>(null);

  // 내 유언장 목록 조회
  const { data: wills, isLoading, refetch } = trpc.will.getMyWills.useQuery();

  // 유언장 삭제
  const deleteWill = trpc.will.deleteWill.useMutation({
    onSuccess: () => {
      toast.success("유언장이 삭제되었습니다.");
      refetch();
    },
    onError: (err) => {
      toast.error(`삭제 실패: ${err.message}`);
    },
  });

  // PDF 생성
  const generatePdf = trpc.pdf.generateWillPdf.useMutation({
    onSuccess: (data) => {
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
        toast.success("PDF가 생성되었습니다.");
      }
      setGeneratingPdfId(null);
      refetch();
    },
    onError: (err) => {
      toast.error(`PDF 생성 실패: ${err.message}`);
      setGeneratingPdfId(null);
    },
  });

  const handleDelete = (willId: number) => {
    if (!confirm("이 유언장을 삭제하시겠습니까? 초안 상태의 유언장만 삭제 가능합니다.")) return;
    setDeletingId(willId);
    deleteWill.mutate({ willId });
    setDeletingId(null);
  };

  // 디지털 카드 생성
  const generateCard = trpc.pdf.generateDigitalCard.useMutation({
    onSuccess: (data) => {
      if (data.cardUrl) {
        // SVG 파일 다운로드
        const a = document.createElement("a");
        a.href = data.cardUrl;
        a.download = `EverWill-디지털카드-${data.certNumber}.svg`;
        a.target = "_blank";
        a.click();
        toast.success("디지털 카드가 다운로드되었습니다. 갤럭시/아이폰 잠금화면에 설정하세요.");
      }
      setGeneratingCardId(null);
    },
    onError: (err) => {
      toast.error(`카드 생성 실패: ${err.message}`);
      setGeneratingCardId(null);
    },
  });

  const handleDownloadCard = (willId: number, status: string) => {
    setGeneratingCardId(willId);
    // 인증 완료면 골드, 아니면 실버
    const tier = (status === "certified") ? "gold" : "silver";
    generateCard.mutate({ willId, tier });
  };

  const handleDownloadPdf = (willId: number, pdfUrl: string | null | undefined) => {
    if (pdfUrl) {
      // 이미 PDF가 있으면 바로 열기
      window.open(pdfUrl, "_blank");
      return;
    }
    // PDF 생성 요청
    setGeneratingPdfId(willId);
    generatePdf.mutate({ willId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F3864]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">내 유언장</h1>
          <p className="text-gray-500 mt-1 text-sm">
            작성한 유언장을 확인하고 관리하세요.
          </p>
        </div>
        <Link href="/write">
          <Button className="bg-[#1F3864] hover:bg-[#162a4e] text-white gap-2">
            <Plus className="w-4 h-4" />
            새 유언장 작성
          </Button>
        </Link>
      </div>

      {/* 유언장 없을 때 */}
      {!wills || wills.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              아직 작성된 유언장이 없습니다
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-sm">
              유언장을 작성하면 이곳에 저장됩니다.
              지금 바로 시작해보세요.
            </p>
            <Link href="/write">
              <Button className="bg-[#1F3864] hover:bg-[#162a4e] text-white gap-2">
                <Plus className="w-4 h-4" />
                유언장 작성 시작하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {wills.map((will) => (
            <Card
              key={will.id}
              className="border border-gray-200 hover:border-[#C9A961] transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1F3864]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#1F3864]" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-gray-900">
                        {will.title || "제목 없음"}
                      </CardTitle>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {will.mode === "ai" ? "AI 작성" : "직접 작성"} ·{" "}
                        {new Date(will.updatedAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={will.status} isCertified={will.isCertified} />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* 인증 번호 표시 */}
                {will.certNumber && (
                  <div className="flex items-center gap-2 mb-3 p-2 bg-emerald-50 rounded-md">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-700 font-mono font-semibold">
                      인증번호: {will.certNumber}
                    </span>
                  </div>
                )}

                {/* 인증 완료일 */}
                {will.certifiedAt && (
                  <p className="text-xs text-gray-400 mb-3">
                    인증 완료:{" "}
                    {new Date(will.certifiedAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* PDF 다운로드 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-[#1F3864] text-[#1F3864] hover:bg-[#1F3864] hover:text-white"
                    onClick={() => handleDownloadPdf(will.id, will.pdfUrl)}
                    disabled={generatingPdfId === will.id}
                  >
                    {generatingPdfId === will.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    {will.pdfUrl ? "PDF 다운로드" : "PDF 생성"}
                  </Button>

                  {/* 디지털 카드 다운로드 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961] hover:text-white"
                    onClick={() => handleDownloadCard(will.id, will.status)}
                    disabled={generatingCardId === will.id}
                    title="갤럭시/아이폰 잠금화면에 설정 가능한 디지털 카드"
                  >
                    {generatingCardId === will.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CreditCard className="w-3 h-3" />
                    )}
                    디지털 카드
                  </Button>

                  {/* 수정 (초안만 가능) */}
                  {will.status === "draft" && (
                    <Link href={`/write?willId=${will.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                      >
                        <Edit className="w-3 h-3" />
                        수정
                      </Button>
                    </Link>
                  )}

                  {/* 상세보기 */}
                  <Link href={`/dashboard/wills/${will.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs border-[#1F3864]/30 text-[#1F3864] hover:bg-[#1F3864] hover:text-white"
                    >
                      <FileText className="w-3 h-3" />
                      상세보기
                    </Button>
                  </Link>

                  {/* 삭제 (초안만 가능) */}
                  {will.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(will.id)}
                      disabled={deletingId === will.id}
                    >
                      {deletingId === will.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      삭제
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 안내 문구 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>안내:</strong> 인증 완료된 유언장은 수정 및 삭제가 불가능합니다.
          내용을 변경하려면 새 유언장을 작성하고 재인증(₩15,000)이 필요합니다.
          유언장은 EverWill 분산 암호화 보관 시스템에 안전하게 저장됩니다.
        </p>
      </div>

      {/* 유언 검인 절차 안내 */}
      <div className="mt-6 bg-[#1F3864]/5 rounded-2xl p-6 border border-[#1F3864]/10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">⚖️</span>
          <h3 className="font-bold text-[#1F3864] text-sm">유언 검인 절차 안내 (민법 제1091조)</h3>
          <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">한국 전용</span>
        </div>
        <p className="text-xs text-gray-600 leading-6 mb-4">
          현행 한국 민법상 유언장은 사망 후 <strong>가정법원 검인 절차</strong>를 거쳐야 법적 효력이 인정됩니다.
          EverWill은 이 과정을 지원하는 변호사 매칭 서비스를 제공합니다.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: "1", title: "사망 확인", desc: "사망진단서 \n입수", color: "bg-gray-100 text-gray-600" },
            { step: "2", title: "검인 신청", desc: "사망 후 3개월 이내 \n가정법원 제출", color: "bg-blue-100 text-blue-700" },
            { step: "3", title: "검인 기일", desc: "상속인 전원 \n출석 또는 서면 동의", color: "bg-amber-100 text-amber-700" },
            { step: "4", title: "집행 개시", desc: "유언 집행자 \n집행 시작", color: "bg-green-100 text-green-700" },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center font-bold text-sm mb-2`}>
                {item.step}
              </div>
              <p className="font-semibold text-[#1F3864] text-xs">{item.title}</p>
              <p className="text-gray-400 text-xs mt-0.5 whitespace-pre-line">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[#1F3864]/10 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">EverWill 변호사 매칭 서비스로 검인 절차를 간편하게 진행하세요.</p>
          <a href="/lawyers" className="shrink-0 bg-[#1F3864] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#162a4e] transition-all">
            변호사 매칭 →
          </a>
        </div>
      </div>
    </div>
  );
}
