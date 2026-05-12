import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

// 문의 유형 value 타입
const CATEGORY_VALUES = ["general", "service", "payment", "badge", "lawyer", "other"] as const;
type Category = typeof CATEGORY_VALUES[number];

export default function ContactSection() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.contact;

  // 카테고리 레이블 (i18n 기반)
  const CATEGORIES: { value: Category; label: string }[] = [
    { value: "general", label: c.cat_general },
    { value: "service", label: c.cat_service },
    { value: "payment", label: c.cat_billing },
    { value: "badge",   label: "Badge" },
    { value: "lawyer",  label: c.cat_legal },
    { value: "other",   label: c.cat_other },
  ];
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    category: "general" as Category,
    subject: "",
    content: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = trpc.inquiry.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || c.errorMsg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || form.content.trim().length < 10) {
      setError(c.errorMsg);
      return;
    }
    createMutation.mutate({
      name: form.name,
      email: form.email,
      category: form.category,
      subject: form.subject,
      content: form.content,
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
            {c.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">
            {c.title}
          </h2>
          <p className="text-gray-500 text-lg">
            {c.subtitle}<br />
            {c.subtitle2}
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">{c.successTitle}</h3>
              <p className="text-gray-500 mb-6">
                {c.successDesc}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: user?.name ?? "", email: user?.email ?? "", category: "general", subject: "", content: "" });
                }}
                className="px-6 py-2 bg-[#1F3864] text-white rounded-lg hover:bg-[#1F3864]/90 transition-colors"
              >
                {c.newInquiry}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 이름 + 이메일 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {c.labelName} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={c.placeholderName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {c.labelEmail} <span className="text-red-500">*</span>
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
                  {c.labelCategory} <span className="text-red-500">*</span>
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
                  {c.labelSubject} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder={c.placeholderSubject}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864] transition-colors"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {c.labelContent} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder={c.placeholderContent}
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
                    {c.submitting}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {c.submitBtn}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                * {c.replyNote}
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
