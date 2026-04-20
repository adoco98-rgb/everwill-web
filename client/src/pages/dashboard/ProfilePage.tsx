/**
 * SARAM 프로필 설정 페이지 (/dashboard/profile)
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "-";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
          프로필 설정
        </h1>
        <p className="text-gray-400 text-sm mt-1">계정 정보를 확인하고 관리하세요.</p>
      </div>

      {/* 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 bg-[#1F3864] rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">{initials}</span>
          </div>
          <div>
            <h2 className="font-bold text-[#1F3864] text-lg">{user?.name || "사용자"}</h2>
            <p className="text-gray-400 text-sm">{user?.email || "-"}</p>
            <span className="inline-block mt-1 bg-[#C9A961]/10 text-[#C9A961] text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {user?.role === "admin" ? "관리자" : "일반 회원"}
            </span>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-50 pt-5">
          {[
            { icon: User, label: "이름", value: user?.name || "-" },
            { icon: Mail, label: "이메일", value: user?.email || "-" },
            { icon: Shield, label: "로그인 방식", value: user?.loginMethod || "OAuth" },
            { icon: Calendar, label: "가입일", value: joinDate },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-gray-300 shrink-0" />
              <span className="text-gray-400 text-sm w-24 shrink-0">{item.label}</span>
              <span className="text-[#1F3864] text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 계정 관리 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <h3 className="font-bold text-[#1F3864] text-sm mb-4">계정 관리</h3>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-red-100 text-red-500 hover:bg-red-50 text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          로그아웃
        </button>
      </motion.div>
    </div>
  );
}
