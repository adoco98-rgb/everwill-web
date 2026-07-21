/**
 * 멤버십 카드 페이지
 * - 내 에버윌 인증 카드 (회원번호, 등록일, 한글 이름, QR 코드)
 * - 결제 내역 표시
 * - 멤버십 등급 업그레이드
 */
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, Crown, Star, Zap, Shield, Loader2, ArrowRight,
  CreditCard, User
} from "lucide-react";
import { MEMBERSHIP_PLANS, GRADE_ORDER, calculateUpgradePrice, type MemberGrade } from "@shared/membershipProducts";

/** UI 표시용 2개 플랜 (내부 등급: gold=베이직, vip=풀플랜) */
const DISPLAY_PLANS = [
  {
    grade: "gold" as MemberGrade,
    displayName: "베이직",
    displayNameEn: "BASIC",
    price: 79000,
    priceLabel: "₩79,000",
    storageLabel: "1년 보관 · 이후 매년 ₩15,000",
    cardColor: "from-[#1F3864] to-[#2d4a7a]",
    accentColor: "border-[#4a6fa5]",
    icon: <Shield className="w-6 h-6" />,
    features: [
      "AI 유언장 작성 (무제한)",
      "eKYC 본인인증 + 전자서명",
      "블록체인 해시 기록",
      "상속인 등록 · 자산 등록",
      "유언장 수정 3회",
      "인증서 발급 3회",
      "1년 보관 (이후 ₩15,000/년)",
    ],
    notIncluded: ["영상 유언", "자필 유언장 스캔 인증", "AI 일기 (Life Story)", "자서전 만들기"],
    popular: false,
  },
  {
    grade: "vip" as MemberGrade,
    displayName: "풀플랜",
    displayNameEn: "FULL PLAN",
    price: 168000,
    priceLabel: "₩168,000",
    storageLabel: "영구 보관 · 모든 기능 포함",
    cardColor: "from-[#C9A961] to-[#8B6914]",
    accentColor: "border-[#C9A961]",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "eKYC 본인인증 + 전자서명",
      "블록체인 해시 + RFC 3161 타임스탬프",
      "유언장 영구 보관 (평생)",
      "수정 10회 무료",
      "NFC 인증 카드 발급",
      "QR 신원 인증 + 사망 트리거",
      "영상 유언 녹화 지원",
      "사후 집행 지원 (상속자 자동 알림)",
    ],
    notIncluded: [],
    popular: true,
  },
];
import QRCode from "qrcode";

/** 등급별 카드 아이콘 */
const GRADE_ICONS: Record<string, React.ReactNode> = {
  silver: <Shield className="w-6 h-6" />,
  gold: <Star className="w-6 h-6" />,
  platinum: <Zap className="w-6 h-6" />,
  vip: <Crown className="w-6 h-6" />,
  general: <User className="w-6 h-6" />,
};

/** 등급별 카드 그라디언트 */
const CARD_GRADIENTS: Record<string, string> = {
  general: "from-gray-500 to-gray-700",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-amber-600",
  platinum: "from-purple-400 to-violet-700",
  vip: "from-yellow-500 to-amber-900",
};

/** 등급별 배경 색상 */
const CARD_BG: Record<string, string> = {
  general: "bg-gray-900 border-gray-500",
  silver: "bg-slate-900 border-slate-500",
  gold: "bg-amber-950 border-amber-500",
  platinum: "bg-violet-950 border-violet-500",
  vip: "bg-amber-950 border-yellow-500",
};

/** 등급별 버튼 색상 */
const BTN_COLORS: Record<string, string> = {
  silver: "bg-slate-500 hover:bg-slate-400 text-white",
  gold: "bg-amber-500 hover:bg-amber-400 text-white",
  platinum: "bg-violet-600 hover:bg-violet-500 text-white",
  vip: "bg-yellow-500 hover:bg-yellow-400 text-black",
};

/** 결제 상품 한국어 이름 */
function getItemName(items: string): string {
  if (!items) return "서비스 이용";
  const map: Record<string, string> = {
    membership_silver: "실버 멤버십",
    membership_gold: "골드 멤버십",
    membership_platinum: "플래티넘 멤버십",
    membership_vip: "VIP 멤버십",
    upgrade_to_silver: "실버 승급",
    upgrade_to_gold: "골드 승급",
    upgrade_to_platinum: "플래티넘 승급",
    upgrade_to_vip: "VIP 승급",
    will_certification: "유언 전자 인증",
    will_recertification: "유언 재인증",
    video_will: "영상 유언장",
    handwritten_scan: "자필 유언 스캔",
    annual_membership: "연간 멤버십",
  };
  for (const [key, label] of Object.entries(map)) {
    if (items.includes(key)) return label;
  }
  return items.split(",")[0] ?? "서비스 이용";
}

/** 회원번호 포맷: EW-YYYYMMDD-XXXXXX */
function formatMemberNumber(userId: number, createdAt: Date): string {
  const d = new Date(createdAt);
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const num = String(userId).padStart(6, "0");
  return `EW-${ymd}-${num}`;
}

export default function MembershipPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<MemberGrade | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const { data: gradeData, isLoading: gradeLoading, refetch } = trpc.memberGrade.getMyGrade.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.tossPayment.getMyPayments.useQuery();

  const recalculate = trpc.memberGrade.recalculate.useMutation({
    onSuccess: () => {
      refetch();
      setToastMsg("등급이 업데이트됐습니다!");
    },
  });

  const createCheckout = trpc.memberGrade.createUpgradeCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        setToastMsg("결제 페이지로 이동합니다...");
      }
      setCheckingOut(false);
    },
    onError: (err) => {
      setToastMsg(`오류: ${err.message}`);
      setCheckingOut(false);
    },
  });

  // 결제 완료 후 등급 재계산
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgrade") === "success") {
      recalculate.mutate();
      window.history.replaceState({}, "", "/dashboard/membership");
    }
  }, []);

  // QR 코드 생성
  useEffect(() => {
    if (!gradeData?.qrCode) return;
    const qrUrl = `https://everwill.co.kr/verify/${gradeData.qrCode}`;
    QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#1F3864", light: "#FFFFFF" },
    }).then(setQrDataUrl).catch(console.error);
  }, [gradeData?.qrCode]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSelectGrade = (grade: MemberGrade) => {
    if (!gradeData) return;
    const currentGrade = gradeData.grade as MemberGrade;
    if (GRADE_ORDER[grade] <= GRADE_ORDER[currentGrade]) return;
    setSelectedGrade(grade === selectedGrade ? null : grade);
  };

  const handleCheckout = () => {
    if (!selectedGrade) return;
    setCheckingOut(true);
    createCheckout.mutate({
      targetGrade: selectedGrade as "silver" | "gold" | "platinum" | "vip",
      origin: window.location.origin,
    });
  };

  const getUpgradeAmount = (targetGrade: MemberGrade) => {
    if (!gradeData) return null;
    const currentGrade = gradeData.grade as MemberGrade;
    if (currentGrade === "general") {
      const plan = MEMBERSHIP_PLANS.find((p) => p.grade === targetGrade);
      return plan ? { diff: plan.price, fee: 0, total: plan.price } : null;
    }
    return calculateUpgradePrice(currentGrade, targetGrade);
  };

  if (gradeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A961]" />
      </div>
    );
  }

  const grade = gradeData?.grade ?? "general";
  const gradientClass = CARD_GRADIENTS[grade] ?? CARD_GRADIENTS.general;
  const memberNumber = gradeData?.userId && gradeData?.memberSince
    ? formatMemberNumber(gradeData.userId, new Date(gradeData.memberSince))
    : "EW---------";
  const memberSinceStr = gradeData?.memberSince
    ? new Date(gradeData.memberSince).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "-";
  const userName = gradeData?.userName || "회원";
  const currentGrade = (gradeData?.grade ?? "general") as MemberGrade;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* 토스트 */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#1F3864] text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium">
          {toastMsg}
        </div>
      )}

      {/* ── 에버윌 인증 카드 ── */}
      <section>
        <h2 className="text-xl font-bold text-[#1F3864] mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#C9A961]" />
          나의 에버윌 인증 카드
        </h2>

        <div
          className={`relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br ${gradientClass}`}
          style={{ aspectRatio: "1.586" }}
        >
          {/* 카드 배경 패턴 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white" />
            <div className="absolute top-8 right-8 w-20 h-20 rounded-full border border-white" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-2 border-white" />
          </div>

          {/* 카드 내용 */}
          <div className="relative z-10 p-6 h-full flex flex-col justify-between">
            {/* 상단: 로고 + 등급 아이콘 */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs uppercase tracking-widest font-light">EverWill</p>
                <p className="text-white font-bold text-lg leading-tight">
                  {gradeData?.label ?? "무료회원"}
                </p>
              </div>
              <div className="text-white/80">
                {GRADE_ICONS[grade]}
              </div>
            </div>

            {/* 중단: QR 코드 + 이름 */}
            <div className="flex items-center gap-4">
              {qrDataUrl ? (
                <div className="bg-white rounded-lg p-1.5 shadow-md flex-shrink-0">
                  <img src={qrDataUrl} alt="QR 코드" className="w-16 h-16" />
                </div>
              ) : (
                <div className="bg-white/20 rounded-lg p-1.5 w-[76px] h-[76px] flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
                </div>
              )}
              <div className="text-white min-w-0">
                <p className="text-2xl font-bold tracking-wider truncate">{userName}</p>
                <p className="text-white/70 text-xs mt-1">유언자 본인</p>
              </div>
            </div>

            {/* 하단: 회원번호 + 등록일 */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-widest">Member No.</p>
                <p className="text-white font-mono text-sm font-semibold">{memberNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] uppercase tracking-widest">Registered</p>
                <p className="text-white text-xs">{memberSinceStr}</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3">
          QR 코드를 스캔하면 유언 인증 정보를 확인할 수 있습니다
        </p>
      </section>

      {/* ── 결제 내역 ── */}
      <section>
        <h2 className="text-xl font-bold text-[#1F3864] mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#C9A961]" />
          결제 내역
        </h2>

        {paymentsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#C9A961]" />
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-gray-100">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">결제 내역이 없습니다</p>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#1F3864] text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">상품</th>
                  <th className="text-right px-4 py-3 font-medium">금액</th>
                  <th className="text-center px-4 py-3 font-medium">상태</th>
                  <th className="text-right px-4 py-3 font-medium">결제일</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {getItemName(p.items ?? "")}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">
                      {p.amountTotal ? `₩${p.amountTotal.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : p.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : p.status === "refunded"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {p.status === "completed" ? "완료" : p.status === "pending" ? "대기" : p.status === "refunded" ? "환불" : "실패"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      {p.paidAt
                        ? new Date(p.paidAt).toLocaleDateString("ko-KR")
                        : new Date(p.createdAt).toLocaleDateString("ko-KR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── 멤버십 플랜 ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1F3864] flex items-center gap-2">
            <Crown className="w-5 h-5 text-[#C9A961]" />
            멤버십 플랜
          </h2>
          <Badge
            className="text-sm px-3 py-1 font-semibold"
            style={{ backgroundColor: gradeData?.color ?? "#6B7280", color: "#fff" }}
          >
            {gradeData?.badge} 현재: {gradeData?.label}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {DISPLAY_PLANS.map((plan) => {
            const isCurrentGrade = plan.grade === currentGrade;
            const isLowerGrade = GRADE_ORDER[plan.grade] < GRADE_ORDER[currentGrade];
            const isSelected = selectedGrade === plan.grade;
            const upgradeAmount = getUpgradeAmount(plan.grade);

            return (
              <div
                key={plan.grade}
                onClick={() => handleSelectGrade(plan.grade)}
                className={`
                  relative rounded-2xl border-2 p-5 transition-all duration-200
                  ${CARD_BG[plan.grade]}
                  ${isSelected ? "border-white scale-105 shadow-2xl" : ""}
                  ${isCurrentGrade ? "opacity-100 cursor-default" : ""}
                  ${isLowerGrade ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:shadow-xl"}
                  ${plan.popular ? "ring-2 ring-amber-400" : ""}
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-black text-xs font-bold rounded-full">
                    인기
                  </div>
                )}
                {isCurrentGrade && (
                  <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    현재 등급
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                )}

                                {/* 카드 미리보기 */}
                <div className={`w-full h-16 rounded-lg bg-gradient-to-br ${plan.cardColor} mb-3 flex items-center justify-between px-3`}>
                  <div>
                    <p className="text-white/70 text-[10px] font-medium uppercase">{plan.displayNameEn}</p>
                    <p className="text-white font-bold text-sm">EverWill</p>
                  </div>
                  <div className="text-white/80">{plan.icon}</div>
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">{plan.displayNameEn}</p>
                <h3 className="text-white font-bold text-base mt-0.5">{plan.displayName}</h3>
                <div className="mt-2 mb-3">
                  <p className="text-xl font-bold text-white">{plan.priceLabel}</p>
                  <p className="text-gray-500 text-xs">{plan.storageLabel}</p>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-300">
                      <Check className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.notIncluded.map((f, i) => (
                    <li key={`x-${i}`} className="flex items-start gap-1.5 text-xs text-gray-600 line-through">
                      <span className="w-3 h-3 mt-0.5 flex-shrink-0 text-center">×</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* 선택된 등급 결제 요약 */}
        {selectedGrade && (
          <div className="mt-6 p-5 bg-[#1F3864] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {(() => {
                const plan = MEMBERSHIP_PLANS.find((p) => p.grade === selectedGrade)!;
                const amount = getUpgradeAmount(selectedGrade);
                return (
                  <div>
                    <p className="font-bold text-white text-lg">
                      {gradeData?.label} → EverWill {plan.name}
                    </p>
                    {amount && (
                      <div className="flex items-center gap-2 text-sm text-white/70 mt-1">
                        {amount.fee > 0 && (
                          <>
                            <span>차액 ₩{amount.diff.toLocaleString()}</span>
                            <span>+</span>
                            <span>수수료 ₩{amount.fee.toLocaleString()}</span>
                            <span>=</span>
                          </>
                        )}
                        <span className="text-2xl font-bold text-[#C9A961]">
                          ₩{amount.total.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedGrade(null)}
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                취소
              </Button>
              <Button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="bg-[#C9A961] hover:bg-[#b8933f] text-white px-8 font-bold"
              >
                {checkingOut ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" />처리 중...</>
                ) : (
                  <>지금 신청하기 <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
