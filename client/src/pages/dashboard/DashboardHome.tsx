/**
 * EverWill 대시보드 홈 (/dashboard)
 * 사용자 현황 요약 카드 + 자산 등록 현황
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  FileText, CreditCard, Award, Shield, ArrowRight,
  Clock, CheckCircle2, AlertCircle, Building2, Users,
  PlusCircle, TrendingUp, ChevronRight,
} from "lucide-react";
import { Link } from "wouter";

const ASSET_LABELS: Record<string, string> = {
  real_estate: "부동산", bank: "예금·적금", stock: "주식·펀드",
  insurance: "보험", crypto: "가상자산", vehicle: "차량",
  business: "사업체·지분", pension: "연금", artwork: "예술품·귀금속", other: "기타",
};

const RELATIONSHIP_LABELS: Record<string, string> = {
  spouse: "배우자", child: "자녀", parent: "부모",
  sibling: "형제자매", grandchild: "손자녀", other: "기타",
};

function formatKRW(value?: number | null) {
  if (!value) return "미입력";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만원`;
  return `${value.toLocaleString()}원`;
}

export default function DashboardHome() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "안녕하세요" : "안녕하세요";

  // 자산 + 상속자 데이터 조회
  const { data: willData, isLoading } = trpc.asset.getWillData.useQuery();
  const assetList = willData?.assets ?? [];
  const heirList = willData?.heirs ?? [];

  // 총 자산 가치 계산
  const totalValue = assetList.reduce((sum, a) => sum + (a.estimatedValue ?? 0), 0);

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

      {/* 자산 등록 현황 배너 */}
      {!isLoading && assetList.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-amber-800 text-sm">자산을 먼저 등록해주세요</p>
              <p className="text-amber-600 text-xs mt-0.5">자산을 등록하면 유언장 작성 시 자동으로 불러와 배분을 설계할 수 있습니다.</p>
            </div>
          </div>
          <Link href="/assets" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4" />
              자산 등록
            </Link>
        </motion.div>
      )}

      {/* 자산 + 상속자 현황 카드 */}
      {(assetList.length > 0 || heirList.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">내 자산 현황</h2>
            <Link href="/assets" className="text-xs text-[#1F3864] hover:underline flex items-center gap-1">
                전체 관리 <ChevronRight className="w-3 h-3" />
              </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 자산 요약 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#1F3864]/20 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1F3864]/60" />
                  <span className="text-sm font-semibold text-gray-700">등록 자산</span>
                </div>
                <span className="text-xs bg-[#1F3864]/5 text-[#1F3864] px-2 py-0.5 rounded-full font-medium">
                  {assetList.length}건
                </span>
              </div>
              {assetList.length > 0 ? (
                <div className="space-y-2">
                  {assetList.slice(0, 3).map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-[60%]">
                        {ASSET_LABELS[asset.type] || asset.type} · {asset.name}
                      </span>
                      <span className="text-[#1F3864] font-medium shrink-0">
                        {formatKRW(asset.estimatedValue)}
                      </span>
                    </div>
                  ))}
                  {assetList.length > 3 && (
                    <p className="text-xs text-gray-400">+{assetList.length - 3}건 더 있음</p>
                  )}
                  <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">총 추정 가치</span>
                    <span className="text-sm font-bold text-[#C9A961]">{formatKRW(totalValue)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">등록된 자산이 없습니다.</p>
              )}
            </div>

            {/* 상속자 요약 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#1F3864]/20 hover:shadow-sm transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#1F3864]/60" />
                  <span className="text-sm font-semibold text-gray-700">상속자</span>
                </div>
                <span className="text-xs bg-[#1F3864]/5 text-[#1F3864] px-2 py-0.5 rounded-full font-medium">
                  {heirList.length}명
                </span>
              </div>
              {heirList.length > 0 ? (
                <div className="space-y-2">
                  {heirList.slice(0, 3).map((heir) => (
                    <div key={heir.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{heir.nameKo}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{RELATIONSHIP_LABELS[heir.relationship] || heir.relationship}</span>
                        {(heir.sharePercent ?? 0) > 0 && (
                          <span className="text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full font-medium">
                            {heir.sharePercent ?? 0}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {heirList.length > 3 && (
                    <p className="text-xs text-gray-400">+{heirList.length - 3}명 더 있음</p>
                  )}
                  {/* 지분 합계 */}
                  {heirList.some(h => (h.sharePercent ?? 0) > 0) && (
                    <div className="border-t border-gray-100 pt-2 mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400 font-medium">배분 합계</span>
                      <span className={`text-sm font-bold ${
                        heirList.reduce((s, h) => s + (h.sharePercent ?? 0), 0) === 100
                          ? "text-green-600" : "text-amber-500"
                      }`}>
                        {heirList.reduce((s, h) => s + (h.sharePercent ?? 0), 0)}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">등록된 상속자가 없습니다.</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 빠른 실행 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">빠른 실행</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link href="/assets" className="block bg-white border-2 border-dashed border-[#1F3864]/20 hover:border-[#1F3864]/50 rounded-2xl p-5 hover:shadow-md transition-all group">
                <Building2 className="w-6 h-6 text-[#1F3864]/50 mb-3" />
                <h3 className="font-bold text-[#1F3864] text-sm">자산 등록</h3>
                <p className="text-xs mt-0.5 text-gray-400">부동산·금융·기타</p>
                <ArrowRight className="w-4 h-4 text-[#1F3864]/30 mt-3 group-hover:opacity-80 group-hover:translate-x-1 transition-all" />
              </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Link href="/write" className="block bg-[#1F3864] rounded-2xl p-5 hover:shadow-md transition-all group">
                <FileText className="w-6 h-6 text-white mb-3 opacity-80" />
                <h3 className="font-bold text-white text-sm">유언장 작성</h3>
                <p className="text-xs mt-0.5 text-white opacity-60">AI 가이드 또는 직접 작성</p>
                <ArrowRight className="w-4 h-4 text-white opacity-40 mt-3 group-hover:opacity-80 group-hover:translate-x-1 transition-all" />
              </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
            <Link href="/payment" className="block bg-[#C9A961] rounded-2xl p-5 hover:shadow-md transition-all group">
                <CreditCard className="w-6 h-6 text-white mb-3 opacity-80" />
                <h3 className="font-bold text-white text-sm">결제하기</h3>
                <p className="text-xs mt-0.5 text-white opacity-60">전자인증 · Badge · 보관</p>
                <ArrowRight className="w-4 h-4 text-white opacity-40 mt-3 group-hover:opacity-80 group-hover:translate-x-1 transition-all" />
              </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Link href="/payment" className="block bg-white border-2 border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all group">
                <Award className="w-6 h-6 text-[#1F3864] mb-3 opacity-80" />
                <h3 className="font-bold text-[#1F3864] text-sm">Badge 주문</h3>
                <p className="text-xs mt-0.5 text-gray-400">물리적 유언 인증 배지</p>
                <ArrowRight className="w-4 h-4 text-[#1F3864]/30 mt-3 group-hover:opacity-80 group-hover:translate-x-1 transition-all" />
              </Link>
          </motion.div>
        </div>
      </div>

      {/* 현황 카드 */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">내 현황</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: "유언장", value: "작성 중", sub: "마지막 저장: 오늘", status: "draft", href: "/write" },
            { icon: Shield, label: "인증 상태", value: "미인증", sub: "전자인증 ₩49,000", status: "pending", href: "/payment" },
            { icon: CreditCard, label: "결제 내역", value: "0건", sub: "결제 내역 없음", status: "none", href: "/dashboard/payments" },
            { icon: Award, label: "Badge", value: "미신청", sub: "Essential ₩49,000~", status: "none", href: "/payment" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
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
            <h3 className="font-bold text-base mb-1">
              {assetList.length > 0 ? "유언장 작성을 시작해보세요" : "자산을 등록하고 유언장을 작성하세요"}
            </h3>
            <p className="text-white/60 text-sm">
              {assetList.length > 0
                ? "등록된 자산이 자동으로 불러와집니다. AI 가이드 모드로 17분이면 완성됩니다."
                : "자산 등록 → 상속자 등록 → 유언장 작성 순서로 진행하면 가장 쉽습니다."}
            </p>
          </div>
          <Link href={assetList.length > 0 ? "/write" : "/assets"}>
            <a className="shrink-0 bg-[#C9A961] hover:bg-[#b8944f] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap">
              {assetList.length > 0 ? "유언장 작성 →" : "자산 등록 →"}
            </a>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
