/**
 * AdminExpertsTab - 관리자 전문가 파트너 승인·관리 탭
 * - 신청 대기 목록 (pending)
 * - 승인/거절 처리
 * - 활성/정지/거절 상태 변경
 * - 국가·전문분야 필터
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Scale,
  Calculator,
  FileText,
  MapPin,
  Eye,
  Edit3,
  RefreshCw,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const COUNTRY_MAP: Record<string, { flag: string; name: string }> = {
  KR: { flag: "🇰🇷", name: "한국" },
  US: { flag: "🇺🇸", name: "미국" },
  JP: { flag: "🇯🇵", name: "일본" },
  CN: { flag: "🇨🇳", name: "중국" },
  DE: { flag: "🇩🇪", name: "독일" },
  FR: { flag: "🇫🇷", name: "프랑스" },
  ES: { flag: "🇪🇸", name: "스페인" },
  SA: { flag: "🇸🇦", name: "사우디" },
  IN: { flag: "🇮🇳", name: "인도" },
  BR: { flag: "🇧🇷", name: "브라질" },
  GB: { flag: "🇬🇧", name: "영국" },
  AU: { flag: "🇦🇺", name: "호주" },
  CA: { flag: "🇨🇦", name: "캐나다" },
  SG: { flag: "🇸🇬", name: "싱가포르" },
};

const SPECIALTY_CONFIG = {
  lawyer: { icon: <Scale className="w-3.5 h-3.5" />, label: "변호사", color: "bg-blue-100 text-blue-700" },
  tax: { icon: <Calculator className="w-3.5 h-3.5" />, label: "세무사", color: "bg-green-100 text-green-700" },

};

const STATUS_CONFIG = {
  pending: { label: "대기중", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3 h-3" /> },
  active: { label: "활성", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  suspended: { label: "정지", color: "bg-orange-100 text-orange-700", icon: <XCircle className="w-3 h-3" /> },
  rejected: { label: "거절", color: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
};

type ExpertStatus = "pending" | "active" | "suspended" | "rejected";

type Expert = {
  id: number;
  name: string;
  nameEn: string | null;
  specialty: "lawyer" | "tax";
  subSpecialty: string | null;
  country: string;
  city: string | null;
  firmName: string | null;
  bio: string | null;
  bioEn: string | null;
  yearsOfExperience: number | null;
  languages: string | null;
  photoUrl: string | null;
  status: ExpertStatus;
  ratingAvg: number | null;
  reviewCount: number | null;
  consultCount: number | null;
  createdAt: Date | null;
};

function ExpertDetailModal({
  expert,
  open,
  onClose,
}: {
  expert: Expert | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!expert) return null;
  const country = COUNTRY_MAP[expert.country] ?? { flag: "🌐", name: expert.country };
  const spec = SPECIALTY_CONFIG[expert.specialty];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>전문가 상세 정보</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {expert.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-[#1F3864] text-lg">{expert.name}</h3>
              {expert.nameEn && <p className="text-sm text-gray-500">{expert.nameEn}</p>}
              {expert.firmName && <p className="text-sm text-gray-600">{expert.firmName}</p>}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${spec.color}`}>
                  {spec.icon} {spec.label}
                </span>
                <span className="text-sm text-gray-500">
                  {country.flag} {country.name}{expert.city ? ` · ${expert.city}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">경력</p>
              <p className="font-bold text-[#1F3864]">{expert.yearsOfExperience ?? "-"}년</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-0.5">상태</p>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[expert.status]?.color ?? "bg-gray-100 text-gray-600"}`}>
                {STATUS_CONFIG[expert.status]?.icon}
                {STATUS_CONFIG[expert.status]?.label ?? expert.status}
              </span>
            </div>
          </div>

          {expert.subSpecialty && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">전문 분야</p>
              <p className="text-sm text-gray-600">{expert.subSpecialty}</p>
            </div>
          )}

          {expert.bio && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">소개 및 이력</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{expert.bio}</p>
            </div>
          )}

          {expert.languages && (
            <div>
              <p className="text-sm font-semibold text-[#1F3864] mb-1">사용 언어</p>
              <p className="text-sm text-gray-600">{expert.languages}</p>
            </div>
          )}

          <div className="text-xs text-gray-400">
            신청일: {expert.createdAt ? new Date(expert.createdAt).toLocaleDateString("ko-KR") : "-"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminExpertsTab() {
  const [statusFilter, setStatusFilter] = useState<"all" | ExpertStatus>("pending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const LIMIT = 15;

  const { data, isLoading, refetch } = trpc.expert.admin.list.useQuery({
    status: statusFilter,
    limit: LIMIT,
    offset: page * LIMIT,
  });

  const updateStatus = trpc.expert.admin.updateStatus.useMutation({
    onSuccess: (_, vars) => {
      const labels: Record<string, string> = { active: "승인", suspended: "정지", rejected: "거절" };
      toast.success(`${labels[vars.status] ?? vars.status} 처리되었습니다.`);
      refetch();
    },
    onError: (err) => toast.error("처리 실패: " + err.message),
  });

  const experts = data?.experts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  // 상태별 카운트
  const { data: pendingData } = trpc.expert.admin.list.useQuery({ status: "pending", limit: 1, offset: 0 });
  const pendingCount = pendingData?.total ?? 0;

  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1F3864]">전문가 파트너 관리</h2>
          <p className="text-sm text-gray-500 mt-0.5">변호사·세무사 파트너 신청 승인 및 관리</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 새로고침
        </Button>
      </div>

      {/* 상태 요약 카드 */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(["pending", "active", "suspended", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatusFilter(s);
              setPage(0);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              statusFilter === s
                ? "border-[#1F3864] bg-[#1F3864]/5"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium mb-1 ${STATUS_CONFIG[s].color}`}>
              {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
            </div>
            {s === "pending" && (
              <p className="text-lg font-bold text-[#1F3864]">{pendingCount}</p>
            )}
          </button>
        ))}
      </div>

      {/* 필터 */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(searchInput);
                setPage(0);
              }
            }}
            placeholder="이름, 국가, 전문분야 검색..."
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as "all" | ExpertStatus);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기중</SelectItem>
            <SelectItem value="active">활성</SelectItem>
            <SelectItem value="suspended">정지</SelectItem>
            <SelectItem value="rejected">거절</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />
            로딩 중...
          </div>
        ) : experts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>해당 조건의 전문가가 없습니다.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">이름</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">전문분야</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">국가/도시</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">경력</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">상태</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">신청일</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {experts.map((expert) => {
                const country = COUNTRY_MAP[expert.country] ?? { flag: "🌐", name: expert.country };
                const spec = SPECIALTY_CONFIG[expert.specialty as "lawyer" | "tax"] ?? SPECIALTY_CONFIG.lawyer;
                const statusCfg = STATUS_CONFIG[expert.status as ExpertStatus] ?? STATUS_CONFIG.pending;
                return (
                  <tr key={expert.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1F3864] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {expert.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-[#1F3864]">{expert.name}</p>
                          {expert.firmName && (
                            <p className="text-xs text-gray-400 truncate max-w-[120px]">{expert.firmName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${spec.color}`}>
                        {spec.icon} {spec.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {country.flag} {country.name}
                        {expert.city ? ` · ${expert.city}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {expert.yearsOfExperience != null ? `${expert.yearsOfExperience}년` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {expert.createdAt ? new Date(expert.createdAt).toLocaleDateString("ko-KR") : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* 상세 보기 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setSelectedExpert(expert as Expert);
                            setDetailOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        </Button>

                        {/* 승인 (pending일 때) */}
                        {expert.status === "pending" && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white px-2"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({ id: expert.id, status: "active" })
                            }
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> 승인
                          </Button>
                        )}

                        {/* 거절 (pending일 때) */}
                        {expert.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-50 px-2"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({ id: expert.id, status: "rejected" })
                            }
                          >
                            <XCircle className="w-3 h-3 mr-1" /> 거절
                          </Button>
                        )}

                        {/* 정지 (active일 때) */}
                        {expert.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs border-orange-200 text-orange-600 hover:bg-orange-50 px-2"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({ id: expert.id, status: "suspended" })
                            }
                          >
                            정지
                          </Button>
                        )}

                        {/* 재활성화 (suspended/rejected일 때) */}
                        {(expert.status === "suspended" || expert.status === "rejected") && (
                          <Button
                            size="sm"
                            className="h-7 text-xs bg-[#1F3864] hover:bg-[#1F3864]/90 text-white px-2"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              updateStatus.mutate({ id: expert.id, status: "active" })
                            }
                          >
                            재활성화
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">총 {total}명</p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              이전
            </Button>
            <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              다음
            </Button>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      <ExpertDetailModal
        expert={selectedExpert}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
