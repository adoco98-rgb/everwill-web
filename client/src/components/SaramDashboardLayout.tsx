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
  Users,
  Lock,
  Heart,
  PenLine,
  BookMarked,
  Mail,
  BookOpen,
  ClipboardList,
  Calculator,
  Pencil,
  NotebookPen,
  Sparkles,
  Smartphone,
  BadgeCheck,
  ScrollText,
  Video,
  ScanLine,
  Brain,
  Fingerprint,
  Gift,
  Scale,
  Eye,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/** 유언 작성 플로우 메뉴 */
const willFlowMenuItems = [
  { icon: Sparkles, label: "유언 작성하기", path: "/dashboard/will-wizard", highlight: true },
];

/** 유언 작성 단계별 메뉴 (무료) - 위자드 단계 순서와 동일 */
const mainMenuItems = [
  { icon: ClipboardList, label: "자산 등록", path: "/assets" },
  { icon: Users, label: "상속자 등록", path: "/dashboard/heirs" },
  { icon: Scale, label: "상속 내용", path: "/dashboard/will-wizard?step=4" },
  { icon: Eye, label: "기본유언장 확인", path: "/dashboard/will-preview" },
];

/** 전자유언인증 메뉴 (결제 후 진행) */
const certMenuItems = [
  { icon: CreditCard, label: "전자인증·결제하기", path: "/dashboard/payments" },
  { icon: User, label: "개인 인증", path: "/dashboard/profile" },
  { icon: FileText, label: "공증서류", path: "/dashboard/notarization-docs" },
  { icon: BadgeCheck, label: "서명 인증", path: "/dashboard/certification" },
  { icon: Video, label: "영상 유언 (선택)", path: "/video-will" },
  { icon: ScanLine, label: "자필 유언장 (선택)", path: "/will/scan" },
  { icon: Home, label: "유언진행 현황", path: "/dashboard" },
  { icon: Scale, label: "유류분 배제 문서 (선택)", path: "/dashboard/reserve-share-exclusion" },
  { icon: ScrollText, label: "유언 인증서 발급신청", path: "/dashboard/will-certificate" },
];

/** 멤버십 / 카드 메뉴 */
const membershipMenuItems = [
  { icon: QrCode, label: "멤버십 카드", path: "/dashboard/membership" },
  { icon: Award, label: "NFC 인증 카드", path: "/dashboard/badge" },
  { icon: Calculator, label: "상속세 계산", path: "/dashboard/inheritance-tax" },
  { icon: ShieldCheck, label: "자산 인증", path: "/dashboard/asset-verify" },
  { icon: Heart, label: "연명치료·기증", path: "/dashboard/medical-directive" },
];

/** Life Story PRO 메뉴 */
const lifeStoryMenuItems = [
  { icon: BookMarked, label: "나의 자서전", path: "/life-story/autobiography" },
  { icon: PenLine, label: "AI 일기 쓰기", path: "/life-story" },
  { icon: Mail, label: "소중한 편지 쓰기", path: "/letter" },
  { icon: Brain, label: "나만의 AI", path: "/my-ai" },
];

/** 전문가 찾기 메뉴 */
const expertMenuItems = [
  { icon: Scale, label: "전문가 찾기", path: "/dashboard/find-expert" },
  { icon: MessageSquare, label: "상담 신청 내역", path: "/dashboard/my-consultations" },
];

/** 내 정보 관리 메뉴 */
const myInfoMenuItems = [
  { icon: Fingerprint, label: "본인인증 (KYC)", path: "/dashboard/kyc" },
  { icon: Smartphone, label: "휴대폰 인증", path: "/dashboard/phone-verify" },
  { icon: Shield, label: "내 정보 관리", path: "/dashboard/profile" },
  { icon: MessageSquare, label: "1:1 문의", path: "/dashboard/inquiries" },
  { icon: Gift, label: "추천인 포인트", path: "/dashboard/referral" },
  { icon: CreditCard, label: "결제 내역", path: "/dashboard/payments" },
];

export default function SaramDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  // 결제 여부 확인 (관리자는 항상 true)
  const { data: paymentStatus } = trpc.tossPayment.hasPaid.useQuery(undefined, { enabled: !!user });
  const hasPaid = user?.role === "admin" || (paymentStatus?.hasPaid ?? false);

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
            <img
              src="/everwill-logo.png"
              alt="EverWill"
              className="object-contain mx-auto mb-2"
              style={{ height: '48px', maxWidth: '180px' }}
            />
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

  /** 메뉴 아이템 렌더링 헬퍼 */
  function renderMenuItems(items: typeof mainMenuItems) {
    return items.map((item) => {
      const isActive = item.path === "/dashboard"
        ? location === item.path
        : location.startsWith(item.path);
      return (
        <Link
          key={item.path}
          href={item.path}
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
        </Link>
      );
    });
  }

  /** 결제 후 메뉴 렌더링 - 비결제 회원은 잠금 표시 */
  function renderPaidMenuItems(items: typeof certMenuItems) {
    return items.map((item) => {
      const isActive = item.path === "/dashboard"
        ? location === item.path
        : location.startsWith(item.path);
      if (!hasPaid) {
        // 비결제 회원: 잠금 표시, 클릭 시 결제 페이지로 이동
        return (
          <button
            key={item.path}
            onClick={() => { navigate("/dashboard/payments"); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/30 cursor-pointer hover:bg-white/5 transition-all"
          >
            <item.icon className="w-4 h-4 shrink-0 opacity-40" />
            <span className="opacity-40">{item.label}</span>
            <Lock className="w-3 h-3 ml-auto text-white/30 shrink-0" />
          </button>
        );
      }
      return (
        <Link
          key={item.path}
          href={item.path}
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
        </Link>
      );
    });
  }

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
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 flex-1">
                <div className="rounded-full overflow-hidden drop-shadow-xl shrink-0" style={{ height: '64px', width: '64px' }}>
                  <img
                    src="/everwill-logo.png"
                    alt="EverWill"
                    className="h-full w-full object-cover brightness-110"
                  />
                </div>
                <div>
                  <div className="text-white font-bold text-base leading-tight">EverWill</div>
                  <div className="text-[#C9A961] text-[10px] font-medium tracking-wider">DIGITAL WILL OS</div>
                </div>
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
        <nav className="flex-1 p-4 overflow-y-auto space-y-1">
          {/* 안내 텍스트 */}
          <div className="pt-1 mb-1">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest px-3">메뉴 순서대로 작성합니다</span>
          </div>

          {/* 유언 작성하기 - 최상단 CTA */}
          {willFlowMenuItems.map((item) => {
            const isActive = location.startsWith(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all mb-2 ${
                  isActive
                    ? "bg-[#C9A961] text-white"
                    : "bg-[#C9A961]/20 text-[#C9A961] hover:bg-[#C9A961]/30"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            );
          })}

          {/* 유언 작성 단계 */}
          {renderMenuItems(mainMenuItems)}

          {/* 전자유언인증 (결제 후) */}
          <div className="pt-3 mt-2 border-t border-white/10">
            <div className="flex items-center gap-2 px-3 mb-1">
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">전자유언인증</span>
              {!hasPaid && (
                <span className="text-[9px] bg-[#C9A961]/20 text-[#C9A961] px-1.5 py-0.5 rounded-full font-semibold">결제 후 이용</span>
              )}
            </div>
            <div className="mt-1">{renderPaidMenuItems(certMenuItems)}</div>
          </div>

          {/* 멤버십 / 부가 서비스 */}
          <div className="pt-3 mt-2 border-t border-white/10">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest px-3">멤버십 · 서비스</span>
            <div className="mt-1">{renderMenuItems(membershipMenuItems)}</div>
          </div>

          {/* Life Story PRO 그룹 */}
          <div className="pt-3 mt-2 border-t border-white/10">
            <div className="flex items-center gap-2 px-3 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#C9A961]" />
              <span className="text-[10px] font-bold text-[#C9A961] uppercase tracking-widest">Life Story PRO</span>
            </div>
            {lifeStoryMenuItems.map((item) => {
              const isActive = location.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#C9A961]/20 text-[#C9A961]"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#C9A961]" />}
                </Link>
              );
            })}
          </div>

          {/* 전문가 찾기 */}
          <div className="pt-3 mt-2 border-t border-white/10">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest px-3">전문가 서비스</span>
            <div className="mt-1">{renderMenuItems(expertMenuItems)}</div>
          </div>

          {/* 내 정보 관리 */}
          <div className="pt-3 mt-2 border-t border-white/10">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest px-3">내 정보 관리</span>
            <div className="mt-1">{renderMenuItems(myInfoMenuItems)}</div>
          </div>

          {/* 관리자 전용 메뉴 */}
          {user.role === "admin" && (
            <div className="pt-2 mt-2 border-t border-white/10">
              <Link
                href="/799805"
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
          {/* 암호화 안내 */}
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Lock className="w-3 h-3 text-green-400 shrink-0" />
            <span className="text-white/40 text-xs">E2E 암호화 보안 저장</span>
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
          <div className="flex items-center gap-2">
            <div className="rounded-full overflow-hidden drop-shadow-md shrink-0" style={{ height: '48px', width: '48px' }}>
              <img
                src="/everwill-logo.png"
                alt="EverWill"
                className="h-full w-full object-cover brightness-110"
              />
            </div>
            <div>
              <div className="text-[#1F3864] font-bold text-sm leading-tight">EverWill</div>
              <div className="text-[#C9A961] text-[9px] font-medium tracking-wider">DIGITAL WILL OS</div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
