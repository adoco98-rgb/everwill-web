/**
 * EverWill 대시보드 레이아웃
 * 인증된 사용자 전용 - 사이드바 + 메인 콘텐츠
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import {
  FileText,
  CreditCard,
  Shield,
  Award,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home,
  MessageSquare,
  QrCode,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

const menuItems = [
  { icon: Home, label: "대시보드", path: "/dashboard" },
  { icon: FileText, label: "내 유언장", path: "/dashboard/wills" },
  { icon: CreditCard, label: "결제 내역", path: "/dashboard/payments" },
  { icon: Award, label: "Badge 관리", path: "/dashboard/badge" },
  { icon: Shield, label: "인증 현황", path: "/dashboard/certification" },
  { icon: QrCode, label: "멤버십 카드", path: "/dashboard/membership" },
  { icon: ShieldCheck, label: "자산 인증", path: "/dashboard/asset-verify" },
  { icon: MessageSquare, label: "1:1 문의", path: "/dashboard/inquiries" },
  { icon: User, label: "프로필 설정", path: "/dashboard/profile" },
];

export default function SaramDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-br from-[#1F3864] to-[#2d4f8a] p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#C9A961]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              SARAM
            </h1>
            <p className="text-white/60 text-sm">로그인이 필요한 페이지입니다.</p>
          </div>
          <div className="p-6 space-y-3">
            <button
              onClick={() => { window.location.href = "/login"; }}
              className="w-full bg-[#C9A961] hover:bg-[#b8944f] text-white py-4 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg"
            >
              로그인 / 회원가입
            </button>
            <Link href="/" className="w-full border-2 border-gray-200 text-gray-500 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:border-gray-300 transition-all">
                홈으로 돌아가기
              </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* 모바일 오버레이 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#1F3864] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* 로고 */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#C9A961] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                  SARAM
                </span>
              </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </a>
              </Link>
            );
          })}

          {/* 관리자 전용 메뉴 */}
          {user.role === "admin" && (
            <div className="pt-2 mt-2 border-t border-white/10">
              <Link href="/799805">
                <a
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    location === "/799805"
                      ? "bg-[#C9A961]/20 text-[#C9A961]"
                      : "text-[#C9A961]/70 hover:text-[#C9A961] hover:bg-[#C9A961]/10"
                  }`}
                >
                  <Settings2 className="w-4 h-4 shrink-0" />
                  <span>관리자 패널</span>
                  {location === "/799805" && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                </a>
              </Link>
            </div>
          )}
        </nav>

        {/* 사용자 정보 */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[#C9A961] rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name || "사용자"}</p>
              <p className="text-white/50 text-xs truncate">{user.email || ""}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 모바일 헤더 */}
        <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-[#1F3864]" />
          </button>
          <span className="font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
            SARAM
          </span>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
