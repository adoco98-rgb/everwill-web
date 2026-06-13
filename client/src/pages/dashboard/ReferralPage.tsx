/**
 * 추천인 포인트 대시보드
 * 셀러·헬퍼 그룹 수익 구조 포함
 * - 내 추천 코드 공유
 * - 포인트 잔액 및 적립 내역
 * - 추천 회원 목록 및 커미션 현황
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Copy,
  Check,
  Users,
  TrendingUp,
  Coins,
  Share2,
  ChevronRight,
  Star,
  Crown,
  Trophy,
  Clock,
  ArrowUpRight,
  Info,
} from "lucide-react";

// 포인트 타입 한국어 변환
function getPointTypeLabel(type: string): string {
  const map: Record<string, string> = {
    referral_reward: "추천 보상",
    signup_bonus: "가입 보너스",
    certification_reward: "인증 보상",
    payment_cashback: "결제 캐시백",
    admin_grant: "관리자 지급",
    usage: "사용",
    expiry: "만료",
  };
  return map[type] || type;
}

// 커미션 등급 계산
function getCommissionTier(totalRevenue: number): { label: string; rate: number; color: string; icon: typeof Star } {
  if (totalRevenue >= 50_000_000) return { label: "플래티넘", rate: 0.3, color: "text-purple-600", icon: Crown };
  if (totalRevenue >= 20_000_000) return { label: "골드", rate: 0.25, color: "text-yellow-600", icon: Trophy };
  if (totalRevenue >= 5_000_000) return { label: "실버", rate: 0.2, color: "text-gray-500", icon: Star };
  return { label: "베이직", rate: 0.15, color: "text-[#C9A961]", icon: Gift };
}

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "referrals">("overview");

  // 데이터 조회
  const { data: myCode, isLoading: codeLoading } = trpc.referral.getMyCode.useQuery();
  const { data: history, isLoading: historyLoading } = trpc.referral.getHistory.useQuery();
  const { data: myReferrals, isLoading: referralsLoading } = trpc.referral.getMyReferrals.useQuery();
  const { data: commission, isLoading: commissionLoading } = trpc.referral.getCommissionSummary.useQuery();

  // 추천 코드 복사
  const handleCopy = () => {
    if (!myCode?.referralCode) return;
    navigator.clipboard.writeText(myCode.referralCode).then(() => {
      setCopied(true);
      toast.success("추천 코드가 복사되었습니다!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 공유 링크 복사
  const handleShareLink = () => {
    if (!myCode?.referralCode) return;
    const url = `${window.location.origin}/register?ref=${myCode.referralCode}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("공유 링크가 복사되었습니다!");
    });
  };

  const tier = commission ? getCommissionTier(commission.totalRevenue) : null;
  const TierIcon = tier?.icon || Gift;

  if (codeLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Gift className="w-6 h-6 text-[#C9A961]" />
          <h1 className="text-2xl font-bold text-[#1F3864]">추천인 포인트</h1>
        </div>
        <p className="text-gray-500 text-sm">친구를 초대하고 포인트를 적립하세요. 셀러·헬퍼로 활동하면 커미션도 받을 수 있습니다.</p>
      </div>

      {/* 내 추천 코드 카드 */}
      <div className="bg-gradient-to-br from-[#1F3864] to-[#2d4f8a] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-sm mb-1">내 추천 코드</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold tracking-widest">
                {myCode?.referralCode || "생성 중..."}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {tier && (
            <div className={`text-right`}>
              <TierIcon className={`w-8 h-8 ${tier.color} ml-auto mb-1`} />
              <Badge className="bg-white/10 text-white border-white/20 text-xs">
                {tier.label} 셀러
              </Badge>
            </div>
          )}
        </div>

        {/* 포인트 잔액 */}
        <div className="bg-white/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-xs mb-1">포인트 잔액</p>
              <p className="text-2xl font-bold">
                {(myCode?.pointBalance || 0).toLocaleString()}P
              </p>
            </div>
            <Coins className="w-10 h-10 text-[#C9A961]" />
          </div>
          <p className="text-white/40 text-xs mt-2">1P = ₩1 (결제 시 사용 가능)</p>
        </div>

        {/* 공유 버튼 */}
        <Button
          onClick={handleShareLink}
          variant="outline"
          className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
        >
          <Share2 className="mr-2 w-4 h-4" /> 초대 링크 공유하기
        </Button>
      </div>

      {/* 추천 보상 안내 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, title: "친구 초대", desc: "친구가 가입하면", reward: "+500P" },
          { icon: TrendingUp, title: "결제 완료", desc: "친구가 결제하면", reward: "10% 커미션" },
          { icon: Crown, title: "셀러 등급", desc: "누적 매출 5천만원+", reward: "최대 30%" },
        ].map((item) => (
          <div key={item.title} className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
            <div className="w-10 h-10 bg-[#1F3864]/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <item.icon className="w-5 h-5 text-[#1F3864]" />
            </div>
            <p className="font-semibold text-sm text-[#1F3864] mb-0.5">{item.title}</p>
            <p className="text-xs text-gray-400 mb-1">{item.desc}</p>
            <p className="text-sm font-bold text-[#C9A961]">{item.reward}</p>
          </div>
        ))}
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200">
        {[
          { key: "overview", label: "커미션 현황" },
          { key: "history", label: "포인트 내역" },
          { key: "referrals", label: "추천 회원" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#1F3864] text-[#1F3864]"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠: 커미션 현황 */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {commissionLoading ? (
            <div className="text-center py-8 text-gray-400">불러오는 중...</div>
          ) : commission ? (
            <>
              {/* 현재 등급 */}
              {tier && (
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#1F3864]/10 rounded-full flex items-center justify-center">
                        <TierIcon className={`w-6 h-6 ${tier.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-[#1F3864]">{tier.label} 셀러</p>
                        <p className="text-xs text-gray-400">커미션율 {(tier.rate * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <Badge className="bg-[#C9A961]/10 text-[#C9A961] border-[#C9A961]/20">
                      현재 등급
                    </Badge>
                  </div>

                  {/* 등급 진행 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>누적 매출</span>
                      <span className="font-semibold text-[#1F3864]">
                        ₩{commission.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#1F3864] to-[#C9A961] h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (commission.totalRevenue / 50_000_000) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-right">
                      플래티넘까지 ₩{Math.max(0, 50_000_000 - commission.totalRevenue).toLocaleString()} 남음
                    </p>
                  </div>
                </div>
              )}

              {/* 통계 카드 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "총 추천 회원", value: `${commission.totalReferrals}명`, icon: Users },
                  { label: "총 추천 매출", value: `₩${commission.totalRevenue.toLocaleString()}`, icon: TrendingUp },
                  { label: "예상 커미션", value: `₩${commission.commissionAmount.toLocaleString()}`, icon: Coins },
                  { label: "포인트 잔액", value: `${commission.pointBalance.toLocaleString()}P`, icon: Gift },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon className="w-4 h-4 text-[#C9A961]" />
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                    <p className="text-lg font-bold text-[#1F3864]">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* 커미션 등급표 */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">셀러 등급 기준</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "베이직", range: "~₩500만", rate: "15%", icon: Gift, color: "text-[#C9A961]" },
                    { label: "실버", range: "₩500만~₩2천만", rate: "20%", icon: Star, color: "text-gray-500" },
                    { label: "골드", range: "₩2천만~₩5천만", rate: "25%", icon: Trophy, color: "text-yellow-600" },
                    { label: "플래티넘", range: "₩5천만+", rate: "30%", icon: Crown, color: "text-purple-600" },
                  ].map((g) => (
                    <div key={g.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <g.icon className={`w-4 h-4 ${g.color}`} />
                        <span className="font-medium text-gray-700">{g.label}</span>
                        <span className="text-gray-400 text-xs">{g.range}</span>
                      </div>
                      <span className="font-bold text-[#1F3864]">{g.rate}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  * 커미션은 추천 회원의 결제 완료 금액 기준 / 세금계산서 발행 후 정산
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-400">데이터를 불러올 수 없습니다.</div>
          )}
        </div>
      )}

      {/* 탭 콘텐츠: 포인트 내역 */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {historyLoading ? (
            <div className="text-center py-8 text-gray-400">불러오는 중...</div>
          ) : !history || history.length === 0 ? (
            <div className="text-center py-12">
              <Coins className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">아직 포인트 내역이 없습니다.</p>
              <p className="text-gray-300 text-xs mt-1">친구를 초대하면 포인트가 적립됩니다.</p>
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    item.amount > 0 ? "bg-green-100" : "bg-red-100"
                  }`}>
                    {item.amount > 0
                      ? <ArrowUpRight className="w-4 h-4 text-green-600" />
                      : <ChevronRight className="w-4 h-4 text-red-500 rotate-180" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {getPointTypeLabel(item.type)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.description || ""}
                    </p>
                    <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-base ${item.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {item.amount > 0 ? "+" : ""}{item.amount.toLocaleString()}P
                  </p>
                  <p className="text-xs text-gray-400">잔액 {item.balanceAfter.toLocaleString()}P</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 탭 콘텐츠: 추천 회원 */}
      {activeTab === "referrals" && (
        <div className="space-y-2">
          {referralsLoading ? (
            <div className="text-center py-8 text-gray-400">불러오는 중...</div>
          ) : !myReferrals?.referrals || myReferrals.referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">아직 추천한 회원이 없습니다.</p>
              <p className="text-gray-300 text-xs mt-1">추천 코드를 공유하면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <>
              {/* 요약 */}
              <div className="bg-[#1F3864]/5 rounded-xl p-4 flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm text-gray-500">총 추천 회원</p>
                  <p className="text-2xl font-bold text-[#1F3864]">{myReferrals.totalCount}명</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">총 커미션</p>
                  <p className="text-2xl font-bold text-[#C9A961]">
                    ₩{myReferrals.commissionAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* 회원 목록 */}
              {myReferrals.referrals.map((r, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1F3864]/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-[#1F3864]">
                        {(r.name || r.email || "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {r.name || r.email || "회원"}
                      </p>
                      <p className="text-xs text-gray-400">
                        가입: {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1F3864]">
                      ₩{r.totalPayment.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#C9A961]">
                      커미션 ₩{r.commission.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
