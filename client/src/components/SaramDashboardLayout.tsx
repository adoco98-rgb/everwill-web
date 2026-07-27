/**
 * EverWill 대시보드 레이아웃
 * - 좌측 사이드바: 유언 작성 관련 메뉴
 * - 상단 탭바: 멤버십·서비스, Life Story PRO, 전문가 서비스, 내 정보 관리
 * - 탭 클릭 시 아래에 서브메뉴 바 표시
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CreditCard,
  Shield,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Home,
  MessageSquare,
  QrCode,
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
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/* ─── 사이드바 메뉴 (유언 관련) ─── */
const willFlowMenuItems = [
  { icon: Sparkles, label: "유언 작성하기", path: "/dashboard/will-wizard", highlight: true },
];
const mainMenuItems = [
  { icon: ClipboardList, label: "자산 등록", path: "/assets" },
  { icon: Users, label: "상속자 등록", path: "/dashboard/heirs" },
  { icon: Scale, label: "상속 내용", path: "/dashboard/will-wizard?step=4" },
  { icon: Eye, label: "기본유언장 확인", path: "/dashboard/will-preview" },
];
const certMenuItems = [
  { icon: CreditCard, label: "전자인증·결제하기", path: "/dashboard/payments", alwaysVisible: true },
  { icon: User, label: "개인 인증", path: "/dashboard/profile" },
  { icon: FileText, label: "공증서류", path: "/dashboard/notarization-docs" },
  { icon: BadgeCheck, label: "서명 인증", path: "/dashboard/certification" },
  { icon: Video, label: "영상 유언 (선택)", path: "/video-will" },
  { icon: ScanLine, label: "자필 유언장 (선택)", path: "/will/scan" },
  { icon: Home, label: "유언진행 현황", path: "/dashboard" },
  { icon: Scale, label: "유류분 배제 문서 (선택)", path: "/dashboard/reserve-share-exclusion" },
  { icon: ScrollText, label: "유언 인증서 발급신청", path: "/dashboard/will-certificate" },
  { icon: Calculator, label: "상속세 계산", path: "/dashboard/inheritance-tax" },
];

/* ─── 상단 탭 메뉴 그룹 ─── */
const topTabGroups = [
  {
    label: "멤버십·서비스",
    gold: false,
    items: [
      { icon: QrCode, label: "멤버십 카드", path: "/dashboard/membership" },
      { icon: Heart, label: "연명치료·기증", path: "/dashboard/medical-directive" },
    ],
  },
  {
    label: "Life Story PRO",
    gold: true,
    items: [
      { icon: BookMarked, label: "나의 자서전", path: "/life-story/autobiography" },
      { icon: PenLine, label: "AI 일기 쓰기", path: "/life-story" },
      { icon: Mail, label: "소중한 편지 쓰기", path: "/letter" },
      { icon: Brain, label: "나만의 AI", path: "/my-ai" },
    ],
  },
  {
    label: "전문가 서비스",
    gold: false,
    items: [
      { icon: Scale, label: "전문가 찾기", path: "/dashboard/find-expert" },
      { icon: MessageSquare, label: "상담 신청 내역", path: "/dashboard/my-consultations" },
    ],
  },
  {
    label: "내 정보",
    gold: false,
    items: [
      { icon: Fingerprint, label: "본인인증 (KYC)", path: "/dashboard/kyc" },
      { icon: Smartphone, label: "휴대폰 인증", path: "/dashboard/phone-verify" },
      { icon: Shield, label: "내 정보 관리", path: "/dashboard/profile" },
      { icon: MessageSquare, label: "1:1 문의", path: "/dashboard/inquiries" },
      { icon: Gift, label: "추천인 포인트", path: "/dashboard/referral" },
      { icon: CreditCard, label: "결제 내역", path: "/dashboard/payments" },
    ],
  },
];

/* ─── 메인 레이아웃 ─── */
export default function SaramDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { data: paymentStatus } = trpc.tossPayment.hasPaid.useQuery(undefined, { enabled: !!user });
  const hasPaid = user?.role === "admin" || (paymentStatus?.hasPaid ?? false);

  /* 탭 외부 클릭 시 서브메뉴 닫기 */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-topbar]")) {
        setActiveTab(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* 페이지 이동 시 서브메뉴 닫기 */
  useEffect(() => {
    setActiveTab(null);
  }, [location]);

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
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link href="/" className="text-[#1F3864] underline">홈으로</Link>
        </div>
      </div>
    );
  }

  const initials = (user.name || "U").slice(0, 1).toUpperCase();

  /* 사이드바 메뉴 렌더링 헬퍼 */
  function renderMenuItems(items: typeof mainMenuItems) {
    return items.map((item) => {
      const isActive = location.startsWith(item.path.split("?")[0]);
      return (
        <Link
          key={item.path}
          href={item.path}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isActive ? "bg-white/15 text-[#FFD700]" : "text-[#C9A961]/90 hover:text-[#FFD700] hover:bg-white/10"
          }`}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span>{item.label}</span>
          {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
        </Link>
      );
    });
  }

  function renderPaidMenuItems(items: typeof certMenuItems) {
    return items.map((item) => {
      const isActive = location.startsWith(item.path.split("?")[0]);
      const isLocked = !hasPaid && !("alwaysVisible" in item && item.alwaysVisible);
      return (
        <Link
          key={item.path}
          href={isLocked ? "/dashboard/payments" : item.path}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isLocked
              ? "text-white/30 cursor-pointer"
              : isActive
              ? "bg-white/15 text-[#FFD700]"
              : "text-[#C9A961]/90 hover:text-[#FFD700] hover:bg-white/10"
          }`}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          <span>{item.label}</span>
          {isLocked && <Lock className="w-3 h-3 ml-auto text-white/30" />}
          {!isLocked && isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
        </Link>
      );
    });
  }

  /* 현재 활성 탭 그룹 */
  const activeGroup = topTabGroups.find((g) => g.label === activeTab) ?? null;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* ── 상단 탭바 ── */}
      <div data-topbar className="bg-[#1F3864] sticky top-0 z-40 shadow-md">
        {/* 메인 탭 행 */}
        <div className="flex items-center px-4 py-0">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 shrink-0 mr-6 py-3">
            <div className="rounded-full overflow-hidden" style={{ height: "44px", width: "44px" }}>
              <img src="/everwill-logo.png" alt="EverWill" className="h-full w-full object-cover brightness-110" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight">EverWill</div>
              <div className="text-[#C9A961] text-[10px] tracking-wider">DIGITAL WILL OS</div>
            </div>
          </Link>

          {/* 탭 버튼들 - 중앙 */}
          <div className="flex items-stretch flex-1 justify-center gap-1">
            {topTabGroups.map((group) => {
              const isActive = activeTab === group.label;
              const isCurrentPage = group.items.some((item) =>
                location.startsWith(item.path.split("?")[0])
              );
              return (
                <button
                  key={group.label}
                  onClick={() => setActiveTab(isActive ? null : group.label)}
                  className={`flex items-center gap-2 px-5 py-4 text-lg font-bold whitespace-nowrap transition-all border-b-2 ${
                    isActive
                      ? group.gold
                        ? "border-[#FFD700] text-[#FFD700] bg-[#C9A961]/15"
                        : "border-[#FFD700] text-[#FFD700] bg-white/10"
                      : isCurrentPage
                      ? group.gold
                        ? "border-[#C9A961] text-[#C9A961]"
                        : "border-[#C9A961] text-[#C9A961]"
                      : "border-transparent text-[#C9A961]/80 hover:text-[#FFD700] hover:bg-white/5"
                  }`}
                >
                  {group.gold && <BookOpen className="w-4 h-4 shrink-0" />}
                  <span>{group.label}</span>
                </button>
              );
            })}
            {/* 관리자 */}
            {user.role === "admin" && (
              <Link
                href="/799805"
                className={`flex items-center gap-2 px-5 py-4 text-lg font-bold whitespace-nowrap transition-all border-b-2 ${
                  location === "/799805"
                    ? "border-[#FFD700] text-[#FFD700] bg-[#C9A961]/15"
                    : "border-transparent text-[#C9A961]/60 hover:text-[#C9A961] hover:bg-[#C9A961]/5"
                }`}
              >
                <Settings2 className="w-4 h-4" />
                <span>관리자</span>
              </Link>
            )}
          </div>

          {/* 사용자 + 로그아웃 */}
          <div className="ml-4 flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-9 h-9 bg-[#C9A961] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">{initials}</span>
              </div>
              <span className="text-white text-sm font-medium hidden md:block">{user.name || "사용자"}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">로그아웃</span>
            </button>
            {/* 모바일 햄버거 */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 서브메뉴 바 (탭 클릭 시 표시) */}
        <AnimatePresence>
          {activeGroup && (
            <motion.div
              key={activeGroup.label}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className={`border-t ${activeGroup.gold ? "border-[#C9A961]/20 bg-[#1a2d4a]" : "border-white/10 bg-[#162d4a]"} overflow-hidden`}
            >
              <div className="flex items-center justify-center gap-2 px-6 py-2 flex-wrap">
                {activeGroup.items.map((item) => {
                  const isActive = location.startsWith(item.path.split("?")[0]);
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-semibold transition-all whitespace-nowrap ${
                        isActive
                          ? activeGroup.gold
                            ? "bg-[#C9A961]/25 text-[#FFD700]"
                            : "bg-white/15 text-[#FFD700]"
                          : activeGroup.gold
                          ? "text-[#C9A961] hover:text-[#FFD700] hover:bg-[#C9A961]/15"
                          : "text-[#C9A961]/90 hover:text-[#FFD700] hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── 본문: 사이드바 + 콘텐츠 ── */}
      <div className="flex flex-1 min-h-0">
        {/* 모바일 오버레이 */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* 사이드바 (유언 관련 메뉴만) */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-[#1F3864] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* 모바일 사이드바 헤더 */}
          <div className="px-4 py-5 border-b border-white/10 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full overflow-hidden drop-shadow-xl shrink-0" style={{ height: "48px", width: "48px" }}>
                  <img src="/everwill-logo.png" alt="EverWill" className="h-full w-full object-cover brightness-110" />
                </div>
                <div>
                  <div className="text-white font-bold text-base leading-tight">EverWill</div>
                  <div className="text-[#C9A961] text-[10px] font-medium tracking-wider">DIGITAL WILL OS</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 p-4 overflow-y-auto space-y-1">
            <div className="pt-1 mb-1">
              <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest px-3">메뉴 순서대로 작성합니다</span>
            </div>

            {/* 유언 작성하기 CTA */}
            {willFlowMenuItems.map((item) => {
              const isActive = location.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all mb-2 ${
                    isActive ? "bg-[#C9A961] text-white" : "bg-[#C9A961]/20 text-[#C9A961] hover:bg-[#C9A961]/30"
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

            {/* 전자유언인증 */}
            <div className="pt-3 mt-2 border-t border-white/10">
              <div className="flex items-center gap-2 px-3 mb-1">
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">전자유언인증</span>
                {!hasPaid && (
                  <span className="text-[9px] bg-[#C9A961]/20 text-[#C9A961] px-1.5 py-0.5 rounded-full font-semibold">결제 후 이용</span>
                )}
              </div>
              <div className="mt-1">{renderPaidMenuItems(certMenuItems)}</div>
            </div>
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
          {/* 모바일 헤더 (사이드바 열기 버튼) */}
          <header className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-[60px] z-30">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-[#1F3864]" />
            </button>
            <span className="text-[#1F3864] font-semibold text-sm">유언 작성 메뉴</span>
          </header>

          <main className="flex-1 p-6 lg:p-8 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
