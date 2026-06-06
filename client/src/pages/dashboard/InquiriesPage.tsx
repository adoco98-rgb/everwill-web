/**
 * 마이페이지 - 내 문의 내역 탭 (/dashboard/inquiries)
 * 접수한 문의 목록 + 답변 확인
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Clock, CheckCircle2, AlertCircle, ChevronDown,
  ChevronUp, PlusCircle, Loader2, Star, Tag, X, Send
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

const CATEGORY_LABELS: Record<string, string> = {
  general: "일반 문의",
  service: "서비스 이용",
  payment: "결제/환불",
  badge: "Badge 관련",
  lawyer: "변호사 매칭",
  other: "기타",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "접수 완료", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
  answered: { label: "답변 완료", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  closed: { label: "종료", color: "text-gray-500 bg-gray-50 border-gray-200", icon: AlertCircle },
};

function formatDate(d: Date | string | null | undefined) {
  if (!d) return "-";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function SatisfactionStars({ score }: { score: number | null | undefined }) {
  if (!score) return null;
  const emojis = ["😞", "😕", "😐", "😊", "😄"];
  const labels = ["매우 불만족", "불만족", "보통", "만족", "매우 만족"];
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-lg">{emojis[score - 1]}</span>
      <span className="text-xs text-gray-500">{labels[score - 1]}</span>
    </div>
  );
}

export default function InquiriesPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "general" as "general" | "service" | "payment" | "badge" | "lawyer" | "other",
    subject: "",
    content: "",
  });
  const { user } = useAuth();
  const { data: inquiries, isLoading, isError, refetch } = trpc.inquiry.myList.useQuery();

  const createMutation = trpc.inquiry.create.useMutation({
    onSuccess: () => {
      toast.success("문의가 접수되었습니다. 영업일 기준 1~2일 내 답변 드립니다.");
      setShowNewForm(false);
      setFormData({ category: "general", subject: "", content: "" });
      refetch();
    },
    onError: (err) => toast.error(err.message || "문의 접수에 실패했습니다."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) return toast.error("제목을 입력해주세요.");
    if (formData.content.length < 10) return toast.error("내용을 10자 이상 입력해주세요.");
    createMutation.mutate({
      name: user?.name || "사용자",
      email: user?.email || "",
      category: formData.category,
      subject: formData.subject,
      content: formData.content,
      userId: user?.id,
    });
  };

  function toggleExpand(id: number) {
    setExpandedId(prev => prev === id ? null : id);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#1F3864] animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-gray-500 text-sm">문의 내역을 불러오는 중 오류가 발생했습니다.</p>
        <button
          onClick={() => refetch()}
          className="bg-[#1F3864] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#162a4e] transition-all"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
            1:1 문의 내역
          </h1>
          <p className="text-gray-400 text-sm mt-1">접수한 문의와 답변을 확인하세요.</p>
        </div>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="flex items-center gap-2 bg-[#1F3864] hover:bg-[#162a4e] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md"
        >
          {showNewForm ? <X className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {showNewForm ? "닫기" : "새 문의"}
        </button>
      </div>

      {/* 새 문의 폼 */}
      <AnimatePresence>
        {showNewForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#1F3864]/20 shadow-sm p-6 mb-6 space-y-4"
          >
            <h2 className="font-bold text-[#1F3864] text-sm">1:1 문의 작성</h2>
            {/* 카테고리 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">문의 유형</label>
              <select
                value={formData.category}
                onChange={e => setFormData(p => ({ ...p, category: e.target.value as typeof formData.category }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
              >
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            {/* 제목 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">제목</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                placeholder="문의 제목을 입력하세요"
                maxLength={200}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864]"
              />
            </div>
            {/* 내용 */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">문의 내용</label>
              <textarea
                value={formData.content}
                onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
                placeholder="문의 내용을 상세히 입력해주세요 (10자 이상)"
                rows={4}
                maxLength={5000}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{formData.content.length}/5000</p>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 bg-[#1F3864] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#162a4e] transition-all disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {createMutation.isPending ? "접수 중..." : "문의 접수"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* 문의 없음 */}
      {(!inquiries || inquiries.length === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm"
        >
          <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium mb-2">접수한 문의가 없습니다.</p>
          <p className="text-gray-300 text-sm mb-6">궁금한 점이 있으시면 언제든 문의해주세요.</p>
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 bg-[#1F3864] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#162a4e] transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            문의하기
          </button>
        </motion.div>
      )}

      {/* 문의 목록 */}
      <div className="space-y-3">
        {inquiries?.map((inq, idx) => {
          const statusCfg = STATUS_CONFIG[inq.status] || STATUS_CONFIG.pending;
          const StatusIcon = statusCfg.icon;
          const isExpanded = expandedId === inq.id;

          return (
            <motion.div
              key={inq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* 문의 헤더 (클릭 시 펼침) */}
              <button
                onClick={() => toggleExpand(inq.id)}
                className="w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {/* 상태 배지 */}
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                      {/* 카테고리 배지 */}
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Tag className="w-3 h-3" />
                        {CATEGORY_LABELS[inq.category] || inq.category}
                      </span>
                      {/* 만족도 (답변 완료 시) */}
                      {inq.status === "answered" && inq.satisfaction && (
                        <SatisfactionStars score={inq.satisfaction} />
                      )}
                    </div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{inq.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">접수일: {formatDate(inq.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-gray-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* 펼침 내용 */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                      {/* 문의 내용 */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">문의 내용</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {inq.content}
                        </div>
                      </div>

                      {/* 답변 */}
                      {inq.status === "answered" && inq.reply ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">EverWill 답변</p>
                            {inq.repliedAt && (
                              <span className="text-xs text-gray-300">· {formatDate(inq.repliedAt)}</span>
                            )}
                          </div>
                          <div className="bg-[#1F3864]/5 border border-[#1F3864]/10 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-6 h-6 bg-[#C9A961] rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white text-xs font-bold">E</span>
                              </div>
                              <span className="text-xs font-semibold text-[#1F3864]">EverWill 고객지원</span>
                            </div>
                            {inq.reply}
                          </div>
                          {/* 만족도 평가 안내 (아직 평가 안 한 경우) */}
                          {!inq.satisfaction && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                              <Star className="w-3.5 h-3.5 text-amber-400" />
                              답변 이메일에서 만족도를 평가해주세요. 서비스 개선에 도움이 됩니다.
                            </div>
                          )}
                          {/* 만족도 표시 (평가 완료) */}
                          {inq.satisfaction && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                              만족도 평가 완료: <SatisfactionStars score={inq.satisfaction} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                          <Clock className="w-3.5 h-3.5" />
                          답변 대기 중입니다. 영업일 기준 1~2일 내 답변 드립니다.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
