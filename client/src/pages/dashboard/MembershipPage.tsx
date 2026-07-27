/**
 * 멤버십 카드 페이지
 * - 에버윌 인증 카드 (로고, 이름, 회원번호, 등록일)
 * - QR 코드 별도 사각 박스
 * - 카드 아래: 한글 성명 / 영문 성명 / 회원번호
 * - 현재 등급 서비스 내용 표시
 * - 결제 내역
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import {
  Check, Crown, Star, Zap, Shield, Loader2, CreditCard, User, QrCode
} from "lucide-react";
import QRCode from "qrcode";

/** 등급별 카드 아이콘 */
const GRADE_ICONS: Record<string, React.ReactNode> = {
  silver: <Shield className="w-5 h-5" />,
  gold: <Star className="w-5 h-5" />,
  platinum: <Zap className="w-5 h-5" />,
  vip: <Crown className="w-5 h-5" />,
  general: <User className="w-5 h-5" />,
};

/** 등급별 카드 그라디언트 */
const CARD_GRADIENTS: Record<string, string> = {
  general: "from-gray-500 to-gray-700",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-400 to-amber-600",
  platinum: "from-purple-400 to-violet-700",
  vip: "from-yellow-500 to-amber-900",
};

/** 현재 등급별 서비스 내용 */
const GRADE_FEATURES: Record<string, string[]> = {
  general: [
    "AI 유언장 작성 (무제한)",
    "자산 등록 및 관리",
    "상속자 등록",
    "유언 진행 현황 확인",
  ],
  silver: [
    "AI 유언장 작성 (무제한)",
    "eKYC 본인인증 + 전자서명",
    "블록체인 해시 기록",
    "상속인 등록 · 자산 등록",
    "유언장 수정 3회",
    "인증서 발급 3회",
    "1년 보관 (이후 ₩15,000/년)",
  ],
  gold: [
    "AI 유언장 작성 (무제한)",
    "eKYC 본인인증 + 전자서명",
    "블록체인 해시 기록",
    "상속인 등록 · 자산 등록",
    "유언장 수정 5회",
    "인증서 발급 5회",
    "1년 보관 (이후 ₩15,000/년)",
  ],
  platinum: [
    "eKYC 본인인증 + 전자서명",
    "블록체인 해시 + RFC 3161 타임스탬프",
    "유언장 5년 보관",
    "수정 7회 무료",
    "NFC 인증 카드 발급",
    "QR 신원 인증 + 사망 트리거",
    "영상 유언 녹화 지원",
  ],
  vip: [
    "eKYC 본인인증 + 전자서명",
    "블록체인 해시 + RFC 3161 타임스탬프",
    "유언장 영구 보관 (평생)",
    "수정 10회 무료",
    "NFC 인증 카드 발급",
    "QR 신원 인증 + 사망 트리거",
    "영상 유언 녹화 지원",
    "사후 집행 지원 (상속자 자동 알림)",
  ],
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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const { data: gradeData, isLoading: gradeLoading } = trpc.memberGrade.getMyGrade.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.tossPayment.getMyPayments.useQuery();

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

  // 토스트 자동 닫기
  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 3000);
    return () => clearTimeout(t);
  }, [toastMsg]);

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
  const userNameEn = (gradeData as any)?.userNameEn || "";
  const features = GRADE_FEATURES[grade] ?? GRADE_FEATURES.general;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
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

        {/* 카드 본체 */}
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
            {/* 상단: 텍스트 로고 + 에버윌 원형 로고 */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/70 text-xs uppercase tracking-widest font-light">EVERWILL</p>
                <p className="text-white font-bold text-lg leading-tight">
                  {gradeData?.label ?? "무료회원"}
                </p>
              </div>
              {/* 에버윌 원형 엠블럼 로고 - 우측 상단 */}
              <div
                className="flex-shrink-0"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '3px solid #1F3864',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.45)',
                  overflow: 'hidden',
                  padding: 2,
                }}
              >
                <img
                  src="/everwill-logo.png"
                  alt="EverWill Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
            </div>

            {/* 중단: 이름 + 등급 */}
            <div className="flex items-center gap-3">
              <div className="text-white/80">
                {GRADE_ICONS[grade]}
              </div>
              <div className="text-white min-w-0">
                <p className="text-2xl font-bold tracking-wider truncate">{userName}</p>
                {userNameEn && (
                  <p className="text-white/80 text-sm font-medium tracking-widest uppercase mt-0.5">{userNameEn}</p>
                )}
                <p className="text-white/70 text-xs mt-0.5">유언자 본인</p>
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

        {/* 카드 아래: 성명 + 회원번호 정보 */}
        <div className="max-w-md mx-auto mt-4 px-2">
          <div className="flex items-center justify-between text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs w-16">한글 성명</span>
                <span className="font-semibold text-[#1F3864]">{userName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs w-16">영문 성명</span>
                <span className="font-semibold text-[#1F3864] uppercase">
                  {userNameEn || <span className="text-gray-400 text-xs font-normal">마이페이지에서 입력해 주세요</span>}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs w-16">회원번호</span>
                <span className="font-mono text-xs font-semibold text-[#1F3864]">{memberNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR 코드 별도 사각 박스 */}
        <div className="max-w-md mx-auto mt-5">
          <div className="border-2 border-[#1F3864]/20 rounded-xl p-4 bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {qrDataUrl ? (
                  <div className="w-24 h-24 border border-gray-200 rounded-lg overflow-hidden p-1 bg-white">
                    <img src={qrDataUrl} alt="QR 코드" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
                    <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <QrCode className="w-4 h-4 text-[#C9A961]" />
                  <p className="text-sm font-bold text-[#1F3864]">유언 인증 QR</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  QR 코드를 스캔하면<br />
                  유언 인증 정보를 확인할 수 있습니다
                </p>
                <p className="text-[10px] text-gray-400 mt-1.5 font-mono break-all">
                  everwill.co.kr/verify/...
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 현재 등급 서비스 내용 ── */}
      <section>
        <h2 className="text-xl font-bold text-[#1F3864] mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-[#C9A961]" />
          나의 서비스 혜택
          <Badge
            className="ml-2 text-xs px-2 py-0.5 font-semibold"
            style={{ backgroundColor: gradeData?.color ?? "#6B7280", color: "#fff" }}
          >
            {gradeData?.badge} {gradeData?.label}
          </Badge>
        </h2>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <ul className="space-y-2.5">
            {features.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                {f}
              </li>
            ))}
          </ul>
        </div>
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
    </div>
  );
}
