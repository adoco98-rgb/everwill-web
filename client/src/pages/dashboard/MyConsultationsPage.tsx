/**
 * MyConsultationsPage - 나의 상담 신청 내역 (/dashboard/my-consultations)
 * - 로그인 사용자 전용
 * - 상담 신청 목록 조회 (전문가명, 상태, 날짜)
 * - 상세 내용 펼치기
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Calculator,
  MessageSquare,
  Clock,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FileText,
  AlertCircle,
} from "lucide-react";

const SPECIALTY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  lawyer: { label: "변호사", icon: <Scale className="w-3.5 h-3.5" />, color: "bg-blue-100 text-blue-700" },
  tax: { label: "세무사", icon: <Calculator className="w-3.5 h-3.5" />, color: "bg-green-100 text-green-700" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "검토 중", color: "bg-yellow-100 text-yellow-700" },
  read: { label: "확인됨", color: "bg-blue-100 text-blue-700" },
  replied: { label: "답변 완료", color: "bg-green-100 text-green-700" },
  closed: { label: "종료", color: "bg-gray-100 text-gray-500" },
};

const CONSULT_TYPE_LABEL: Record<string, string> = {
  inheritance: "상속 전반",
  will: "유언장 작성",
  tax: "상속세·증여세",
  dispute: "상속 분쟁",
  other: "기타",
};

const ASSET_SCALE_LABEL: Record<string, string> = {
  under_100m: "1억 미만",
  "100m_500m": "1억 ~ 5억",
  "500m_1b": "5억 ~ 10억",
  over_1b: "10억 이상",
  unknown: "비공개",
};

export default function MyConsultationsPage() {
  const { isAuthenticated, loading } = useAuth();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const LIMIT = 10;

  const { data, isLoading, refetch } = trpc.consultation.myList.useQuery(
    { limit: LIMIT, offset: page * LIMIT },
    { enabled: isAuthenticated }
  );

  const consultations = data?.consultations ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-[#1F3864] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-600">로그인 후 이용할 수 있습니다.</p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
        >
          로그인하기
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-[#1F3864] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-[#1F3864]">나의 상담 신청 내역</h1>
            <p className="text-xs text-gray-500">전문가에게 신청한 상담 내역을 확인하세요</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium mb-1">아직 상담 신청 내역이 없습니다</p>
            <p className="text-sm mb-4">전문가 찾기에서 상담을 신청해보세요</p>
            <Button
              onClick={() => (window.location.href = "/dashboard/find-expert")}
              className="bg-[#1F3864] hover:bg-[#1F3864]/90 text-white"
            >
              전문가 찾기
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => {
              const isExpanded = expandedId === c.id;
              const spec = c.expertSpecialty ? SPECIALTY_CONFIG[c.expertSpecialty] : null;
              const status = STATUS_CONFIG[c.status] ?? { label: c.status, color: "bg-gray-100 text-gray-500" };

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* 카드 헤더 */}
                  <button
                    className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* 전문가 아바타 */}
                        <div className="w-10 h-10 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(c.expertName ?? "?").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#1F3864] text-sm">
                              {c.expertName ?? "전문가"}
                            </span>
                            {spec && (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${spec.color}`}>
                                {spec.icon} {spec.label}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                              {status.label}
                            </span>
                            {c.urgency === "urgent" && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> 긴급
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {CONSULT_TYPE_LABEL[c.consultType ?? "other"] ?? c.consultType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {c.createdAt
                                ? new Date(c.createdAt).toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* 상세 내용 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      <div className="pt-3 space-y-3">
                        {/* 상담 내용 */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">상담 신청 내용</p>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-3">
                            {c.selfIntro}
                          </p>
                        </div>

                        {/* 전문가 답변 */}
                        {c.expertNote && (
                          <div>
                            <p className="text-xs font-semibold text-[#1F3864] mb-1">전문가 메모</p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-[#1F3864]/5 rounded-xl p-3">
                              {c.expertNote}
                            </p>
                          </div>
                        )}

                        {/* 상태 안내 */}
                        {c.status === "pending" && (
                          <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700">
                            📌 신청이 접수되었습니다. EverWill 운영팀이 검토 후 전문가에게 전달합니다.
                          </div>
                        )}
                        {c.status === "replied" && (
                          <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700">
                            ✅ 전문가가 답변했습니다. EverWill 운영팀이 연락드릴 예정입니다.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 전문가 찾기 CTA */}
        {consultations.length > 0 && (
          <div className="mt-8 bg-[#1F3864]/5 rounded-2xl p-5 text-center">
            <p className="text-sm text-[#1F3864] font-semibold mb-1">다른 전문가에게도 상담 신청하세요</p>
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard/find-expert")}
              className="border-[#1F3864] text-[#1F3864] hover:bg-[#1F3864] hover:text-white mt-2"
            >
              전문가 찾기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
