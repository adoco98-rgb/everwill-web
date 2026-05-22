/**
 * 유언장 상세 페이지 (/dashboard/wills/:id)
 * - 저장된 유언장 내용 전체 조회
 * - 인증 번호, 블록체인 해시 표시
 * - PDF 생성/다운로드
 * - 수정 진입 (초안만)
 */
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Edit,
  Loader2,
  FileText,
  Hash,
  CalendarDays,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import WillDocumentPreview from "@/components/write/WillDocumentPreview";
import type { WillData } from "@/lib/willTypes";
import { initialWillData } from "@/lib/willTypes";

// 상태 배지
function StatusBadge({ status, isCertified }: { status: string; isCertified: number | null }) {
  if (isCertified || status === "certified") {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1">
        <CheckCircle2 className="w-4 h-4" />
        인증 완료
      </Badge>
    );
  }
  if (status === "expired") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 gap-1.5 px-3 py-1">
        <AlertCircle className="w-4 h-4" />
        만료됨
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1.5 px-3 py-1">
      <Clock className="w-4 h-4" />
      초안
    </Badge>
  );
}

export default function WillDetailPage() {
  const params = useParams<{ id: string }>();
  const willId = parseInt(params.id ?? "0", 10);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const { data: will, isLoading, error } = trpc.will.getWillById.useQuery(
    { willId },
    { enabled: !!willId && willId > 0, retry: false }
  );

  // PDF 생성
  const generatePdf = trpc.pdf.generateWillPdf.useMutation({
    onSuccess: (data) => {
      if (data.pdfUrl) {
        window.open(data.pdfUrl, "_blank");
        toast.success("PDF가 생성되었습니다.");
      }
      setGeneratingPdf(false);
    },
    onError: (err) => {
      toast.error(`PDF 생성 실패: ${err.message}`);
      setGeneratingPdf(false);
    },
  });

  const handleDownloadPdf = () => {
    if (will?.pdfUrl) {
      window.open(will.pdfUrl, "_blank");
      return;
    }
    setGeneratingPdf(true);
    generatePdf.mutate({ willId });
  };

  // 로딩
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1F3864]" />
      </div>
    );
  }

  // 오류 또는 없음
  if (error || !will) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">유언장을 찾을 수 없습니다</h2>
        <p className="text-gray-400 mb-6">삭제되었거나 접근 권한이 없는 유언장입니다.</p>
        <Link href="/dashboard/wills">
          <Button className="bg-[#1F3864] hover:bg-[#162a4e] text-white gap-2">
            <ArrowLeft className="w-4 h-4" />
            목록으로 돌아가기
          </Button>
        </Link>
      </div>
    );
  }

  // will.data JSON 파싱
  let willData: WillData = { ...initialWillData };
  try {
    const parsed = JSON.parse(will.data || "{}");
    willData = { ...initialWillData, ...parsed };
  } catch {
    // 파싱 실패 시 기본값 사용
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* 상단 네비 */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/wills">
          <button className="flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            내 유언장 목록
          </button>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-600 font-medium truncate max-w-xs">
          {will.title || "유언장"}
        </span>
      </div>

      {/* 헤더 카드 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1F3864]/10 flex items-center justify-center">
              <FileText className="w-7 h-7 text-[#1F3864]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F3864]">
                {will.title || "제목 없음"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {will.mode === "ai" ? "AI 가이드 작성" : "직접 작성"} ·{" "}
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

        {/* 인증 정보 */}
        {will.certNumber && (
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-emerald-500 font-medium">인증 번호</p>
                <p className="text-sm font-mono font-bold text-emerald-700">{will.certNumber}</p>
              </div>
            </div>
            {will.certifiedAt && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <CalendarDays className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-500 font-medium">인증 완료일</p>
                  <p className="text-sm font-semibold text-blue-700">
                    {new Date(will.certifiedAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 블록체인 해시 */}
        {(will as any).blockchainHash && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <Hash className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs text-gray-400 font-medium mb-0.5">블록체인 무결성 해시</p>
              <p className="text-xs font-mono text-gray-500 break-all">{(will as any).blockchainHash}</p>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex items-center gap-3 mt-5 flex-wrap">
          <Button
            onClick={handleDownloadPdf}
            disabled={generatingPdf}
            className="bg-[#1F3864] hover:bg-[#162a4e] text-white gap-2"
          >
            {generatingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {will.pdfUrl ? "PDF 다운로드" : "PDF 생성"}
          </Button>

          {will.status === "draft" && (
            <Link href={`/write?willId=${will.id}`}>
              <Button variant="outline" className="gap-2 border-[#C9A961] text-[#C9A961] hover:bg-[#C9A961] hover:text-white">
                <Edit className="w-4 h-4" />
                수정하기
              </Button>
            </Link>
          )}

          {will.status === "draft" && (
            <Link href={`/write?willId=${will.id}&certify=1`}>
              <Button variant="outline" className="gap-2 border-[#1F3864] text-[#1F3864] hover:bg-[#1F3864] hover:text-white">
                <CreditCard className="w-4 h-4" />
                전자 인증하기
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* 유언장 본문 미리보기 */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-[#1F3864] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          유언장 내용
        </h2>
        <WillDocumentPreview will={willData} />
      </div>

      {/* 하단 안내 */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-xs text-blue-700 leading-relaxed">
          <strong>안내:</strong>{" "}
          {will.status === "certified"
            ? "인증 완료된 유언장은 수정 및 삭제가 불가능합니다. 내용 변경이 필요하면 새 유언장을 작성하고 재인증(₩15,000)이 필요합니다."
            : "초안 상태의 유언장은 언제든지 수정할 수 있습니다. 전자 인증(₩49,000)을 완료하면 법적 효력이 부여됩니다."}
        </p>
      </div>
    </motion.div>
  );
}
