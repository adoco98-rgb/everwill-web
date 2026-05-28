/**
 * 관리자 종합 대시보드
 * - 통계 개요
 * - 회원 관리 (목록, 검색, 역할 변경)
 * - 결제/매출 관리
 * - 자료 관리 (유언장 목록)
 * - 문의 관리 (답변)
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import {
  Users, CreditCard, FileText, MessageSquare,
  BarChart3, Search, ChevronLeft, ChevronRight,
  TrendingUp, Shield, Clock, CheckCircle,
  Newspaper, Plus, Trash2, Eye, EyeOff, ExternalLink, Pencil, KeyRound,
  ShieldCheck, XCircle, AlertTriangle, ImageIcon, Link2, Save, Youtube, Instagram
} from "lucide-react";

type Tab = "stats" | "users" | "payments" | "wills" | "inquiries" | "news" | "assetVerify" | "socialLinks";

function formatKRW(amount: number) {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (amount >= 10_000) return `${(amount / 10_000).toFixed(0)}만원`;
  return `${amount.toLocaleString()}원`;
}

function formatDate(d: Date | string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

/** 통계 카드 */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-500 text-sm">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1F3864]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

/** 통계 탭 */
function StatsTab() {
  const { data, isLoading } = trpc.admin.stats.useQuery();
  if (isLoading) return <div className="text-center py-16 text-gray-400">로딩 중...</div>;
  if (!data) return null;
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-[#1F3864]">종합 현황</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="총 회원수" value={`${data.totalUsers.toLocaleString()}명`} sub={`오늘 +${data.todayUsers}명`} color="bg-[#1F3864]" />
        <StatCard icon={TrendingUp} label="이번달 매출" value={formatKRW(data.monthRevenue)} sub={`총 ${formatKRW(data.totalRevenue)}`} color="bg-[#C9A961]" />
        <StatCard icon={FileText} label="유언장 수" value={`${data.totalWills.toLocaleString()}건`} color="bg-green-500" />
        <StatCard icon={MessageSquare} label="미답변 문의" value={`${data.pendingInquiries}건`} color="bg-orange-500" />
      </div>
    </div>
  );
}

/** 회원 관리 탭 */
function UsersTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [resetTarget, setResetTarget] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.admin.getUsers.useQuery({ page, limit: 20, search, role: roleFilter });
  const updateRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("역할이 변경되었습니다.");
      utils.admin.getUsers.invalidate();
    },
    onError: () => toast.error("변경에 실패했습니다."),
  });

  const updateGrade = trpc.admin.updateUserGrade.useMutation({
    onSuccess: () => { toast.success("등급이 변경되었습니다."); utils.admin.getUsers.invalidate(); },
    onError: () => toast.error("등급 변경에 실패했습니다."),
  });

  const resetPassword = trpc.admin.resetUserPassword.useMutation({
    onSuccess: () => {
      toast.success("비밀번호가 초기화되었습니다.");
      setResetTarget(null);
      setNewPassword("");
    },
    onError: () => toast.error("비밀번호 초기화에 실패했습니다."),
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="space-y-4">
      {/* 비밀번호 초기화 모달 */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1F3864] text-lg mb-1">비밀번호 초기화</h3>
            <p className="text-sm text-gray-400 mb-4">{resetTarget.name} 회원의 새 비밀번호를 입력하세요.</p>
            <div className="relative mb-4">
              <input
                type={showPw ? "text" : "password"}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1F3864] pr-10"
                placeholder="새 비밀번호 (8자 이상)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPw(v => !v)}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50"
                onClick={() => { setResetTarget(null); setNewPassword(""); }}
              >취소</button>
              <button
                className="flex-1 py-2.5 rounded-xl bg-[#1F3864] text-white text-sm font-semibold hover:bg-[#162d52] disabled:opacity-50"
                disabled={newPassword.length < 8 || resetPassword.isPending}
                onClick={() => resetPassword.mutate({ userId: resetTarget.id, newPassword })}
              >{resetPassword.isPending ? "처리 중..." : "초기화"}</button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F3864]">회원 관리 <span className="text-sm font-normal text-gray-400">({data?.total ?? 0}명)</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1F3864]"
              placeholder="이름, 이메일, 전화번호 검색"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            />
          </div>
          <select
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value as any); setPage(1); }}
          >
            <option value="all">전체</option>
            <option value="user">일반</option>
            <option value="admin">관리자</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">이름</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">이메일</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">전화번호</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">국가</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">가입일</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">등급</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">역할</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">로딩 중...</td></tr>
              ) : data?.list.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">검색 결과가 없습니다.</td></tr>
              ) : data?.list.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1F3864]">{u.name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[160px]">{u.email || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{u.phone || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{u.country || "KR"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs px-2 py-1 rounded-lg border font-medium bg-white"
                      value={u.memberGrade ?? "general"}
                      onChange={e => updateGrade.mutate({ userId: u.id, grade: e.target.value as any })}
                    >
                      <option value="general">일반</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                      <option value="vip">VIP</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                        u.role === "admin" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-200 text-gray-600"
                      }`}
                      value={u.role}
                      onChange={e => updateRole.mutate({ userId: u.id, role: e.target.value as "user" | "admin" })}
                    >
                      <option value="user">일반</option>
                      <option value="admin">관리자</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 hover:bg-gray-50 px-2 py-1 rounded-lg"
                      onClick={() => setResetTarget({ id: u.id, name: u.name || "회원" })}
                      title="비밀번호 초기화"
                    >
                      <KeyRound className="w-3 h-3" />
                      비번
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* 페이지네이션 */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{data?.total ?? 0}명 중 {((page - 1) * 20) + 1}-{Math.min(page * 20, data?.total ?? 0)}명</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 결제/매출 탭 */
function PaymentsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "failed" | "refunded">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading } = trpc.admin.getPayments.useQuery({ page, limit: 20, search });
  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  const statusLabel: Record<string, { label: string; color: string }> = {
    completed: { label: "완료", color: "bg-green-50 text-green-700" },
    pending: { label: "대기", color: "bg-yellow-50 text-yellow-700" },
    failed: { label: "실패", color: "bg-red-50 text-red-700" },
    refunded: { label: "환불", color: "bg-gray-50 text-gray-600" },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F3864]">결제/매출 관리 <span className="text-sm font-normal text-gray-400">({data?.total ?? 0}건)</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1F3864]"
              placeholder="이메일 검색"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            />
          </div>
          <select
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
          >
            <option value="all">전체</option>
            <option value="completed">완료</option>
            <option value="pending">대기</option>
            <option value="failed">실패</option>
            <option value="refunded">환불</option>
          </select>
        </div>
      </div>



      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">이메일</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">금액</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">통화</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">상태</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">결제일</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">상품</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">로딩 중...</td></tr>
              ) : data?.list.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">결제 내역이 없습니다.</td></tr>
              ) : data?.list.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 truncate max-w-[160px]">{p.userEmail || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-[#1F3864]">{p.amount ? formatKRW(p.amount) : "-"}</td>
                  <td className="px-4 py-3 text-gray-500 uppercase hidden md:table-cell">{p.currency || "krw"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusLabel[p.status]?.color ?? "bg-gray-50 text-gray-600"}`}>
                      {statusLabel[p.status]?.label ?? p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(p.paidAt)}</td>
                  <td className="px-4 py-3 text-gray-500 truncate max-w-[120px] hidden lg:table-cell">{p.items || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{data?.total ?? 0}건</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 자료 관리 탭 (유언장) */
function WillsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "certified" | "expired">("all");
  const { data, isLoading } = trpc.admin.getWills.useQuery({ page, limit: 20 });
  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  const statusLabel: Record<string, { label: string; color: string }> = {
    draft: { label: "작성중", color: "bg-yellow-50 text-yellow-700" },
    certified: { label: "인증완료", color: "bg-green-50 text-green-700" },
    expired: { label: "만료", color: "bg-gray-50 text-gray-500" },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F3864]">자료 관리 (유언장) <span className="text-sm font-normal text-gray-400">({data?.total ?? 0}건)</span></h2>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
        >
          <option value="all">전체</option>
          <option value="draft">작성중</option>
          <option value="certified">인증완료</option>
          <option value="expired">만료</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">제목</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">작성자</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">방식</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">상태</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">작성일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">로딩 중...</td></tr>
              ) : data?.list.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">유언장이 없습니다.</td></tr>
              ) : data?.list.map(w => (
                <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1F3864] truncate max-w-[160px]">{`유언장 #${w.id}`}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{w.userName}</div>
                    <div className="text-xs text-gray-400">{w.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{w.isCertified ? "인증완료" : "미인증"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${statusLabel[w.status]?.color ?? "bg-gray-50 text-gray-600"}`}>
                      {statusLabel[w.status]?.label ?? w.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{formatDate(w.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">{data?.total ?? 0}건</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 문의 관리 탭 */
function InquiriesTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "answered">("all");
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getInquiries.useQuery({ page, limit: 20, status: statusFilter });;
  const replyMutation = trpc.admin.replyInquiry.useMutation({
    onSuccess: () => {
      toast.success("답변이 저장되었습니다.");
      setReplyingId(null);
      setReplyText("");
      utils.admin.getInquiries.invalidate();
    },
    onError: () => toast.error("답변 저장에 실패했습니다."),
  });

  const totalPages = data ? Math.ceil(data.total / 20) : 1;
  const statusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: "미답변", color: "bg-orange-50 text-orange-700" },
    answered: { label: "답변완료", color: "bg-green-50 text-green-700" },
    closed: { label: "종료", color: "bg-gray-50 text-gray-500" },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F3864]">문의 관리 <span className="text-sm font-normal text-gray-400">({data?.total ?? 0}건)</span></h2>
        <select
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
        >
          <option value="all">전체</option>
          <option value="pending">미답변</option>
          <option value="answered">답변완료</option>
          <option value="closed">종료</option>
        </select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400">로딩 중...</div>
        ) : data?.list.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white rounded-2xl border border-gray-100">문의가 없습니다.</div>
        ) : data?.list.map(inq => (
          <div key={inq.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${statusLabel[inq.status]?.color}`}>
                    {statusLabel[inq.status]?.label}
                  </span>
                  <span className="text-xs text-gray-400">{inq.subject}</span>
                  <span className="text-xs text-gray-400">{formatDate(inq.createdAt)}</span>
                </div>
                <h3 className="font-semibold text-[#1F3864]">{inq.subject}</h3>
                <p className="text-xs text-gray-500">{inq.userName} · {inq.userEmail}</p>
              </div>
              {inq.status === "pending" && (
                <button
                  onClick={() => { setReplyingId(inq.id); setReplyText(""); }}
                  className="shrink-0 px-3 py-1.5 bg-[#1F3864] text-white text-xs rounded-lg hover:bg-[#162a4e] transition-colors"
                >
                  답변하기
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 mb-2">{inq.content}</p>
            {inq.reply && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-600 font-semibold mb-1">관리자 답변</p>
                <p className="text-sm text-blue-800">{inq.reply}</p>
              </div>
            )}
            {replyingId === inq.id && (
              <div className="mt-3 space-y-2">
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#1F3864] resize-none"
                  rows={3}
                  placeholder="답변 내용을 입력하세요..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setReplyingId(null)} className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50">취소</button>
                  <button
                    onClick={() => replyMutation.mutate({ inquiryId: inq.id, reply: replyText })}
                    disabled={!replyText.trim() || replyMutation.isPending}
                    className="px-3 py-1.5 bg-[#C9A961] text-white text-xs rounded-lg hover:bg-[#b8944f] disabled:opacity-50"
                  >
                    {replyMutation.isPending ? "저장 중..." : "답변 저장"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{data?.total ?? 0}건</span>
        <div className="flex gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** 뉴스 관리 탭 */
function NewsTab() {
  const utils = trpc.useUtils();
  const { data: newsList, isLoading } = trpc.news.getAll.useQuery();
  const createMutation = trpc.news.create.useMutation({
    onSuccess: () => { toast.success("뉴스가 등록되었습니다"); utils.news.getAll.invalidate(); setShowForm(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.news.delete.useMutation({
    onSuccess: () => { toast.success("삭제되었습니다"); utils.news.getAll.invalidate(); },
    onError: (e) => toast.error(e.message),
  });
  const toggleMutation = trpc.news.toggleActive.useMutation({
    onSuccess: () => utils.news.getAll.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", url: "", outlet: "", country: "", flag: "", summary: "", tag: "", publishedAt: "" });
  const resetForm = () => setForm({ title: "", url: "", outlet: "", country: "", flag: "", summary: "", tag: "", publishedAt: "" });

  const handleSubmit = () => {
    if (!form.title || !form.url || !form.outlet || !form.country || !form.flag) {
      toast.error("제목, URL, 신문사, 국가, 국기는 필수입니다");
      return;
    }
    createMutation.mutate({ ...form, isActive: 1 });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F3864]">글로벌 뉴스 관리</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#1F3864] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#2a4a7f] transition-colors"
        >
          <Plus className="w-4 h-4" />
          뉴스 등록
        </button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-bold text-[#1F3864] text-base">새 뉴스 등록</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">뉴스 제목 *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="예: 디지털 유언 시대 열린다" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">뉴스 URL *</label>
              <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">신문사명 *</label>
              <input value={form.outlet} onChange={e => setForm(f => ({ ...f, outlet: e.target.value }))} placeholder="예: 조선일보" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">국가명 *</label>
              <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} placeholder="예: 한국" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">국기 이모지 *</label>
              <input value={form.flag} onChange={e => setForm(f => ({ ...f, flag: e.target.value }))} placeholder="예: 🇰🇷" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">발행일</label>
              <input value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} placeholder="예: 2026.05.01" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">카테고리 태그</label>
              <input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="예: 상속, 유언" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">짧은 요약</label>
              <input value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="한 줄 요약 (선택)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-[#C9A961] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#b8954f] transition-colors disabled:opacity-50">
              {createMutation.isPending ? "등록 중..." : "등록하기"}
            </button>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="border border-gray-200 text-gray-600 px-6 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              취소
            </button>
          </div>
        </div>
      )}

      {/* 뉴스 목록 */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">로딩 중...</div>
      ) : !newsList || newsList.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Newspaper className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>등록된 뉴스가 없습니다</p>
          <p className="text-sm mt-1">위의 "뉴스 등록" 버튼으로 추가하세요</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">국가/신문사</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">제목</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">발행일</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">상태</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {newsList.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.flag}</span>
                      <div>
                        <p className="font-medium text-[#1F3864]">{item.outlet}</p>
                        <p className="text-xs text-gray-400">{item.country}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-[#1F3864] hover:text-[#C9A961] font-medium flex items-center gap-1 transition-colors">
                      {item.title.length > 40 ? item.title.slice(0, 40) + "..." : item.title}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    {item.tag && <span className="text-xs bg-[#C9A961]/10 text-[#C9A961] px-2 py-0.5 rounded-full mt-1 inline-block">{item.tag}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{item.publishedAt || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleMutation.mutate({ id: item.id, isActive: item.isActive === 1 ? 0 : 1 })}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        item.isActive === 1
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {item.isActive === 1 ? <><Eye className="w-3 h-3" /> 공개</> : <><EyeOff className="w-3 h-3" /> 비공개</>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { if (confirm("삭제하시겠습니까?")) deleteMutation.mutate({ id: item.id }); }}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** 자산 인증 검토 탭 */
const DOC_TYPE_LABELS: Record<string, string> = {
  real_estate_registry: "부동산등기부등본",
  bank_statement: "은행잔액증명서",
  asset_list: "자산내역서",
  insurance_policy: "보험증권",
  stock_statement: "주식잔고증명서",
  other: "기타 서류",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "미제출", color: "bg-gray-100 text-gray-500" },
  submitted: { label: "검토 대기", color: "bg-amber-100 text-amber-700" },
  reviewing: { label: "검토 중", color: "bg-blue-100 text-blue-700" },
  approved: { label: "승인 완료", color: "bg-green-100 text-green-700" },
  rejected: { label: "반려", color: "bg-red-100 text-red-600" },
};

function AssetVerifyTab() {
  const { data: list, isLoading, refetch } = trpc.assetVerify.adminList.useQuery();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});

  const reviewMutation = trpc.assetVerify.adminReview.useMutation({
    onSuccess: () => { refetch(); toast.success("처리 완료"); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <div className="text-center py-16 text-gray-400">로딩 중...</div>;
  if (!list || list.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>자산 인증 신청 내역이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#1F3864]">자산 인증 검토</h2>
        <span className="text-sm text-gray-500">총 {list.length}건</span>
      </div>

      {list.map((item) => {
        const statusInfo = STATUS_LABELS[item.status ?? "pending"] ?? STATUS_LABELS.pending;
        const isExpanded = expandedId === item.id;
        const noteVal = noteInputs[item.id] ?? item.reviewNote ?? "";

        return (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            {/* 헤더 */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#1F3864]/40" />
                <div>
                  <p className="font-semibold text-[#1F3864] text-sm">{item.userName || "(이름 없음)"}</p>
                  <p className="text-xs text-gray-400">{item.userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className="text-xs text-gray-400">
                  {item.submittedAt ? formatDate(item.submittedAt) : "-"}
                </span>
                <span className="text-gray-400 text-xs">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* 상세 패널 */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-5 py-5 space-y-5">
                {/* 신분증 / 셀피 */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">신분증 &amp; 얼굴 사진</h4>
                  <div className="flex gap-4">
                    {item.idPhotoUrl ? (
                      <a href={item.idPhotoUrl} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="w-32 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-[#1F3864]/40 transition-colors flex items-center justify-center">
                          <img src={item.idPhotoUrl} alt="신분증" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">신분증</p>
                      </a>
                    ) : (
                      <div className="w-32 h-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                    {item.selfieUrl ? (
                      <a href={item.selfieUrl} target="_blank" rel="noopener noreferrer">
                        <div className="w-32 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-[#1F3864]/40 transition-colors">
                          <img src={item.selfieUrl} alt="셀피" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-center">얼굴 사진</p>
                      </a>
                    ) : (
                      <div className="w-32 h-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* 자산 서류 */}
                {item.documents && item.documents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">자산 서류 ({item.documents.length}건)</h4>
                    <div className="space-y-2">
                      {item.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-[#1F3864]/50" />
                            <div>
                              <p className="text-sm font-medium text-[#1F3864]">{DOC_TYPE_LABELS[doc.type] ?? doc.type}</p>
                              {doc.label && <p className="text-xs text-gray-400">{doc.label}</p>}
                            </div>
                          </div>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-[#1F3864] hover:text-[#C9A961] transition-colors font-medium"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            보기
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 검토 메모 + 승인/반려 버튼 */}
                {(item.status === "submitted" || item.status === "reviewing") && (
                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">검토 메모 (선택)</h4>
                    <textarea
                      value={noteVal}
                      onChange={(e) => setNoteInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="반려 사유 또는 검토 메모를 입력하세요"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20"
                    />
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => reviewMutation.mutate({ verificationId: item.id, action: "approve", note: noteVal })}
                        disabled={reviewMutation.isPending}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        승인
                      </button>
                      <button
                        onClick={() => reviewMutation.mutate({ verificationId: item.id, action: "reject", note: noteVal })}
                        disabled={reviewMutation.isPending}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        반려
                      </button>
                    </div>
                  </div>
                )}

                {/* 이미 처리된 경우 결과 표시 */}
                {(item.status === "approved" || item.status === "rejected") && (
                  <div className={`border-t border-gray-100 pt-4 flex items-start gap-3 p-3 rounded-xl ${
                    item.status === "approved" ? "bg-green-50" : "bg-red-50"
                  }`}>
                    {item.status === "approved"
                      ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                    <div>
                      <p className={`text-sm font-semibold ${item.status === "approved" ? "text-green-700" : "text-red-700"}`}>
                        {item.status === "approved" ? "승인 완료" : "반려"}
                      </p>
                      {item.reviewNote && <p className="text-xs text-gray-500 mt-0.5">{item.reviewNote}</p>}
                      {item.reviewedAt && <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.reviewedAt)}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** 소셜 링크 관리 탭 */
function SocialLinksTab() {
  const { data: current, refetch } = trpc.siteSettings.getSocialLinks.useQuery();
  const [youtube, setYoutube] = useState("");
  const [instagram, setInstagram] = useState("");
  const [kakao, setKakao] = useState("");
  const [line, setLine] = useState("");
  const [initialized, setInitialized] = useState(false);

  // DB 값으로 초기화
  if (current && !initialized) {
    setYoutube(current.youtube ?? "");
    setInstagram(current.instagram ?? "");
    setKakao(current.kakao ?? "");
    setLine(current.line ?? "");
    setInitialized(true);
  }

  const updateMutation = trpc.siteSettings.updateSocialLinks.useMutation({
    onSuccess: () => {
      toast.success("소셜 링크가 저장되었습니다.");
      refetch();
    },
    onError: (err) => toast.error(`저장 실패: ${err.message}`),
  });

  const handleSave = () => {
    // URL 형식 검증 (비어있으면 허용)
    const validateUrl = (url: string) => !url || url.startsWith("http://") || url.startsWith("https://");
    if (!validateUrl(youtube)) return toast.error("유튜브 URL은 http:// 또는 https://로 시작해야 합니다.");
    if (!validateUrl(instagram)) return toast.error("인스타 URL은 http:// 또는 https://로 시작해야 합니다.");
    if (!validateUrl(kakao)) return toast.error("카카오 URL은 http:// 또는 https://로 시작해야 합니다.");
    if (!validateUrl(line)) return toast.error("라인 URL은 http:// 또는 https://로 시작해야 합니다.");
    updateMutation.mutate({ youtube, instagram, kakao, line });
  };

  const socialFields = [
    {
      key: "youtube",
      label: "유튜브",
      placeholder: "https://www.youtube.com/@유저네임",
      value: youtube,
      onChange: setYoutube,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
      icon: Youtube,
      hint: "유튜브 체널 URL을 입력하세요",
    },
    {
      key: "instagram",
      label: "인스타그램",
      placeholder: "https://www.instagram.com/아이디/",
      value: instagram,
      onChange: setInstagram,
      color: "text-pink-500",
      bg: "bg-pink-50",
      border: "border-pink-200",
      icon: Instagram,
      hint: "인스타그램 계정 URL을 입력하세요",
    },
    {
      key: "kakao",
      label: "카카오톡 채널",
      placeholder: "https://pf.kakao.com/_아이디/",
      value: kakao,
      onChange: setKakao,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: Link2,
      hint: "카카오톡 연게 또는 카카오 체널 URL",
    },
    {
      key: "line",
      label: "라인 공식 계정",
      placeholder: "https://line.me/R/ti/p/@아이디",
      value: line,
      onChange: setLine,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      icon: Link2,
      hint: "라인 공식 계정 URL을 입력하세요",
    },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#1F3864]">SNS 소셜 링크 관리</h2>
        <p className="text-sm text-gray-500 mt-1">
          네비게이션 바에 표시될 소셜 링크를 설정하세요. URL을 비워두면 해당 아이콘이 숨겨집니다.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 사용 방법</p>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>• URL을 입력하면 네비게이션 바에 아이콘이 자동으로 표시됩니다</li>
          <li>• 비워두면 해당 소셜 아이콘이 숨겨집니다</li>
          <li>• 모바일 메뉴에도 동일하게 적용됩니다</li>
        </ul>
      </div>

      <div className="space-y-4">
        {socialFields.map((field) => (
          <div key={field.key} className={`rounded-xl border ${field.border} ${field.bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <field.icon className={`w-5 h-5 ${field.color}`} />
              <span className={`font-semibold text-sm ${field.color}`}>{field.label}</span>
              {field.value && (
                <a
                  href={field.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> 확인
                </a>
              )}
            </div>
            <input
              type="url"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
            />
            <p className="text-xs text-gray-500 mt-1.5">{field.hint}</p>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={updateMutation.isPending}
        className="flex items-center gap-2 px-6 py-3 bg-[#1F3864] text-white rounded-xl font-semibold text-sm hover:bg-[#1a3057] transition-colors disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        {updateMutation.isPending ? "저장 중..." : "소셜 링크 저장"}
      </button>
    </div>
  );
}

/** 메인 관리자 페이지 */
export default function AdminPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("stats");

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">로딩 중...</div>;
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">관리자만 접근 가능합니다.</p>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "stats", label: "통계 개요", icon: BarChart3 },
    { id: "users", label: "회원 관리", icon: Users },
    { id: "payments", label: "결제/매출", icon: CreditCard },
    { id: "wills", label: "자료 관리", icon: FileText },
    { id: "inquiries", label: "문의 관리", icon: MessageSquare },
    { id: "news", label: "뉴스 관리", icon: Newspaper },
    { id: "assetVerify", label: "자산 인증 검토", icon: ShieldCheck },
    { id: "socialLinks", label: "SNS 소셜 링크", icon: Link2 },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white px-6 py-5">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            SARAM 관리자 대시보드
          </h1>
          <p className="text-white/60 text-sm mt-0.5">관리자: {user.name || user.email}</p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#1F3864] text-[#1F3864]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "payments" && <PaymentsTab />}
        {activeTab === "wills" && <WillsTab />}
        {activeTab === "inquiries" && <InquiriesTab />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "assetVerify" && <AssetVerifyTab />}
        {activeTab === "socialLinks" && <SocialLinksTab />}
      </div>
    </div>
  );
}
