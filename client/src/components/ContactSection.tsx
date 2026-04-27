import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

// 문의 유형 옵션
const CATEGORIES = [
  { value: "general", label: "일반 문의" },
  { value: "service", label: "서비스 이용" },
  { value: "payment", label: "결제/환불" },
  { value: "badge", label: "Badge 주문" },
  { value: "lawyer", label: "변호사 연결" },
  { value: "other", label: "기타" },
] as const;

type Category = typeof CATEGORIES[number]["value"];

export default function ContactSection() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    category: "general" as Category,
    subject: "",
    content: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const createMutation = trpc.inquiry.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError("");
    },
    onError: (err) => {
      setError(err.message || "문의 접수 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.content) {
      setError("모든 항목을 입력해 주세요.");
      return;
    }
    createMutation.mutate({
      ...form,
      userId: user?.id,
    });
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#1F3864]/10 text-[#1F3864] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <MessageSquare className="w-4 h-4" />
            1:1 문의
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">
            무엇이든 물어보세요
          </h2>
          <p className="text-gray-500 text-lg">
            궁금한 점이 있으시면 언제든 문의해 주세요.<br />
            영업일 기준 1-2일 내 이메일로 답변드립니다.
          </p>
        </motion.div>

        {/* 문의 폼 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8"
        >
          {submitted ? (
            /* 접수 완료 화면 */
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">문의가 접수됐습니다</h3>
              <p className="text-gray-500 mb-6">
                영업일 기준 1-2일 내에 <strong>{form.email}</strong>로 답변드리겠습니다.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: user?.name ?? "", email: user?.email ?? "", category: "general", subject: "", content: "" });
                }}
                className="px-6 py-2 bg-[#1F3864] text-white rounded-lg hover:bg-[#1F3864]/90 transition-colors"
              >
                새 문의 작성
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 이름 + 이메일 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="홍길동"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition-colors"
                  />
                </div>
              </div>

              {/* 문의 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  문의 유형 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition-colors appearance-none bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="문의 제목을 입력해 주세요"
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition-colors"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  문의 내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="문의 내용을 자세히 입력해 주세요 (최소 10자)"
                  rows={6}
                  maxLength={5000}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition-colors resize-none"
                />
                <div className="text-right text-xs text-gray-400 mt-1">{form.content.length}/5000</div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* 제출 버튼 */}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#1F3864] text-white rounded-xl font-semibold text-lg hover:bg-[#1F3864]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {createMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    접수 중...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    문의 접수하기
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                * 접수된 문의는 <strong>adoco98@gmail.com</strong>으로 답변드립니다.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
