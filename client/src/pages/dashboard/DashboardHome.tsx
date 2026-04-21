/**
 * EverWill 대시보드 홈 (/dashboard)
 * 사용자 현황 요약 카드
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import {
  FileText,
  CreditCard,
  Award,
  Shield,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";

const quickActions = [
  {
    icon: FileText,
    title: "유언장 작성",
    desc: "AI 가이드 또는 직접 작성",
    href: "/write",
    color: "bg-[#1F3864]",
    textColor: "text-white",
  },
  {
    icon: CreditCard,
    title: "결제하기",
    desc: "전자인증 · Badge · 보관",
    href: "/payment",
    color: "bg-[#C9A961]",
    textColor: "text-white",
  },
  {
    icon: Award,
    title: "Badge 주문",
    desc: "물리적 유언 인증 배지",
    href: "/payment",
    color: "bg-white border-2 border-gray-100",
    textColor: "text-[#1F3864]",
  },
];

const statusCards = [
  {
    icon: FileText,
    label: "유언장",
    value: "작성 중",
    sub: "마지막 저장: 오늘",
    status: "draft",
    href: "/write",
  },
  {
    icon: Shield,
    label: "인증 상태",
    value: "미인증",
    sub: "전자인증 ₩49,000",
    status: "pending",
    href: "/payment",
  },
  {
    icon: CreditCard,
    label: "결제 내역",
    value: "0건",
    sub: "결제 내역 없음",
    status: "none",
    href: "/dashboard/payments",
  },
  {
    icon: Award,
    label: "Badge",
    value: "미신청",
    sub: "Essential ₩49,000~",
    status: "none",
    href: "/payment",
  },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "안녕하세요" : "안녕하세요";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 인사 */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
          {greeting}, {user?.name?.split(" ")[0] || "회원"}님 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          유언장 작성부터 사후 집행까지 EverWill이 함께합니다.
        </p>
      </motion.div>

      {/* 빠른 실행 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">빠른 실행</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={action.href}>
                <a className={`block ${action.color} rounded-2xl p-5 hover:shadow-md transition-all group`}>
                  <action.icon className={`w-6 h-6 ${action.textColor} mb-3 opacity-80`} />
                  <h3 className={`font-bold ${action.textColor} text-sm`}>{action.title}</h3>
                  <p className={`text-xs mt-0.5 ${action.textColor} opacity-60`}>{action.desc}</p>
                  <ArrowRight className={`w-4 h-4 ${action.textColor} opacity-40 mt-3 group-hover:opacity-80 group-hover:translate-x-1 transition-all`} />
                </a>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 현황 카드 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">내 현황</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link href={card.href}>
                <a className="block bg-white rounded-2xl border border-gray-100 p-4 hover:border-[#1F3864]/20 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <card.icon className="w-4 h-4 text-[#1F3864]/40" />
                    {card.status === "draft" && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                    {card.status === "pending" && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                    {card.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                  </div>
                  <p className="text-xs text-gray-400">{card.label}</p>
                  <p className="font-bold text-[#1F3864] text-sm mt-0.5">{card.value}</p>
                  <p className="text-xs text-gray-300 mt-0.5">{card.sub}</p>
                </a>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 안내 배너 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-[#1F3864] to-[#2d4f8a] rounded-2xl p-6 text-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-base mb-1">유언장 작성을 시작해보세요</h3>
            <p className="text-white/60 text-sm">AI 가이드 모드로 17분이면 완성됩니다. 작성은 무료입니다.</p>
          </div>
          <Link href="/write">
            <a className="shrink-0 bg-[#C9A961] hover:bg-[#b8944f] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
              시작하기 →
            </a>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
