/**
 * EverWill 프로필 설정 페이지 (/dashboard/profile)
 * - 기본 프로필 정보
 * - 나의 추천인 코드 (공유용)
 * - 포인트 잔액 및 적립 내역
 */
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  User, Mail, Calendar, Shield, LogOut, Gift, Copy, Check,
  TrendingUp, Clock, ChevronRight, Coins
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** 포인트 유형 한국어 라벨 */
const POINT_TYPE_LABEL: Record<string, string> = {
  referral_reward: "추천 보상",
  referral_bonus: "가입 보너스",
  use: "포인트 사용",
  expire: "포인트 만료",
  admin: "관리자 지급",
};

/** 포인트 유형별 색상 */
const POINT_TYPE_COLOR: Record<string, string> = {
  referral_reward: "text-green-600",
  referral_bonus: "text-blue-600",
  use: "text-red-500",
  expire: "text-gray-400",
  admin: "text-purple-600",
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [codeCopied, setCodeCopied] = useState(false);

  // 나의 추천인 코드 + 포인트 잔액 조회
  const { data: referralData, isLoading: referralLoading } = trpc.referral.getMyCode.useQuery();
  // 포인트 내역 조회
  const { data: historyData, isLoading: historyLoading } = trpc.referral.getHistory.useQuery();

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "-";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  function copyCode() {
    if (!referralData?.referralCode) return;
    navigator.clipboard.writeText(referralData.referralCode).then(() => {
      setCodeCopied(true);
      toast.success("추천인 코드가 복사됐습니다!");
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
          나의 정보
        </h1>
        <p className="text-gray-400 text-sm mt-1">계정 정보와 포인트 내역을 확인하세요.</p>
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

      {/* 포인트 잔액 + 추천인 코드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-gradient-to-br from-[#1F3864] to-[#243d72] rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">포인트 잔액</p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold">
                {referralLoading ? "..." : (referralData?.pointBalance || 0).toLocaleString()}
              </span>
              <span className="text-[#C9A961] font-semibold text-lg mb-0.5">P</span>
            </div>
          </div>
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
            <Coins className="w-7 h-7 text-[#C9A961]" />
          </div>
        </div>

        {/* 나의 추천인 코드 */}
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-4 h-4 text-[#C9A961]" />
            <span className="text-white/80 text-xs font-medium">나의 추천인 코드</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-[0.2em] text-white flex-1">
              {referralLoading ? "------" : (referralData?.referralCode || "------")}
            </span>
            <button
              onClick={copyCode}
              disabled={!referralData?.referralCode}
              className="flex items-center gap-1.5 bg-[#C9A961] hover:bg-[#b8943f] disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all"
            >
              {codeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {codeCopied ? "복사됨" : "복사"}
            </button>
          </div>
          <p className="text-white/50 text-xs mt-2">
            친구에게 이 코드를 공유하면 가입 시 <span className="text-[#C9A961] font-semibold">5,000P</span>가 적립됩니다.
          </p>
        </div>
      </motion.div>

      {/* 포인트 적립 내역 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C9A961]" />
            <h3 className="font-bold text-[#1F3864] text-sm">포인트 적립 내역</h3>
          </div>
          <span className="text-gray-300 text-xs">{historyData?.length || 0}건</span>
        </div>

        {historyLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3 py-3">
                <div className="w-8 h-8 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-2.5 bg-gray-50 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        ) : !historyData || historyData.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">아직 포인트 내역이 없습니다.</p>
            <p className="text-gray-300 text-xs mt-1">친구를 추천하면 5,000P가 적립됩니다.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {historyData.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
              >
                {/* 아이콘 */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  item.amount > 0 ? "bg-green-50" : "bg-red-50"
                }`}>
                  <ChevronRight className={`w-4 h-4 ${item.amount > 0 ? "text-green-500" : "text-red-400"}`} />
                </div>
                {/* 내용 */}
                <div className="flex-1 min-w-0">
                  <p className="text-[#1F3864] text-sm font-medium truncate">
                    {POINT_TYPE_LABEL[item.type] || item.type}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{item.description || "-"}</p>
                  <p className="text-gray-300 text-xs">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
                {/* 포인트 */}
                <div className="text-right shrink-0">
                  <p className={`font-bold text-sm ${POINT_TYPE_COLOR[item.type] || "text-gray-600"}`}>
                    {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}P
                  </p>
                  <p className="text-gray-300 text-xs">{item.balanceAfter.toLocaleString()}P</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 계정 관리 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
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
