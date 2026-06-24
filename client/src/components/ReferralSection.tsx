/**
 * EverWill 추천/공유 섹션
 * - 로그인 사용자: 내 추천 코드 + SNS 공유 버튼
 * - 비로그인 사용자: 추천 혜택 소개 + 가입 유도
 * SNS: 링크복사·카카오톡·X·Facebook·LinkedIn·WhatsApp·LINE
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Copy, Check, Gift, Users, Star, Share2, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";

// SNS 공유 채널 정의
const SNS_CHANNELS = [
  {
    id: "copy",
    label: "링크 복사",
    labelJa: "リンクコピー",
    labelEn: "Copy Link",
    color: "bg-gray-700 hover:bg-gray-600",
    icon: Copy,
    emoji: "🔗",
  },
  {
    id: "kakao",
    label: "카카오톡",
    labelJa: "カカオトーク",
    labelEn: "KakaoTalk",
    color: "bg-[#FEE500] hover:bg-[#F0D800] text-black",
    icon: MessageCircle,
    emoji: "💬",
  },
  {
    id: "x",
    label: "X (트위터)",
    labelJa: "X (ツイッター)",
    labelEn: "X (Twitter)",
    color: "bg-black hover:bg-gray-900",
    icon: ExternalLink,
    emoji: "✖",
  },
  {
    id: "facebook",
    label: "Facebook",
    labelJa: "Facebook",
    labelEn: "Facebook",
    color: "bg-[#1877F2] hover:bg-[#166FE5]",
    icon: ExternalLink,
    emoji: "f",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    labelJa: "LinkedIn",
    labelEn: "LinkedIn",
    color: "bg-[#0A66C2] hover:bg-[#0958A8]",
    icon: ExternalLink,
    emoji: "in",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    labelJa: "WhatsApp",
    labelEn: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#20BD5A]",
    icon: ExternalLink,
    emoji: "💚",
  },
  {
    id: "line",
    label: "LINE",
    labelJa: "LINE",
    labelEn: "LINE",
    color: "bg-[#00B900] hover:bg-[#009900]",
    icon: ExternalLink,
    emoji: "L",
  },
];

// 추천 혜택 카드 데이터
const BENEFITS = [
  {
    icon: Gift,
    title: "추천인 혜택",
    titleJa: "紹介者特典",
    titleEn: "Referrer Reward",
    desc: "친구가 가입하면 5,000포인트 적립",
    descJa: "友達が登録すると5,000ポイント獲得",
    descEn: "Earn 5,000 points when a friend joins",
    color: "text-[#C9A961]",
    bg: "bg-[#C9A961]/10",
  },
  {
    icon: Star,
    title: "피추천인 혜택",
    titleJa: "紹介された方の特典",
    titleEn: "New Member Bonus",
    desc: "추천 코드 입력 시 재인증 할인 쿠폰",
    descJa: "紹介コード入力で再認証割引クーポン",
    descEn: "Re-certification discount coupon",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    icon: Users,
    title: "무제한 추천",
    titleJa: "無制限紹介",
    titleEn: "Unlimited Referrals",
    desc: "추천 횟수 제한 없이 포인트 적립",
    descJa: "紹介回数無制限でポイント獲得",
    descEn: "No limit on referral points",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
];

export default function ReferralSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const isKo = language === "ko";
  const isJa = language === "ja";
  const getLang = (ko: string, ja: string, en: string) => isKo ? ko : isJa ? ja : en;

  const [copied, setCopied] = useState(false);

  // 로그인 사용자의 추천 코드 조회
  const { data: referralData } = trpc.referral.getMyCode.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 공유 URL 생성
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://everwill.co.kr";
  const referralUrl = referralData?.referralCode
    ? `${baseUrl}?ref=${referralData.referralCode}`
    : baseUrl;

  const shareText = isKo
    ? `EverWill - 세계 최초 디지털 유언 OS. 나의 마지막 서명을 지금 준비하세요. 🌍`
    : isJa
    ? `EverWill - 世界初のデジタル遺言OS。今すぐあなたの最後のサインを準備しましょう。🌍`
    : `EverWill - World's First Digital Will OS. Prepare your last signature now. 🌍`;

  // SNS 공유 핸들러
  const handleShare = async (channelId: string) => {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(referralUrl);

    switch (channelId) {
      case "copy":
        try {
          await navigator.clipboard.writeText(referralUrl);
          setCopied(true);
          // 복사 성공 알림 (toast 없이 상태로 표시)
          setTimeout(() => setCopied(false), 2500);
        } catch {
          alert(isKo ? "복사에 실패했습니다." : "Copy failed.");
        }
        break;
      case "kakao":
        // 카카오톡 공유 (웹 공유 API 사용)
        if (typeof window !== "undefined" && navigator.share) {
          navigator.share({ title: "EverWill", text: shareText, url: referralUrl });
        } else {
          window.open(`https://sharer.kakao.com/talk/friends/picker/link?url=${encodedUrl}`, "_blank");
        }
        break;
      case "x":
        window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank", "width=600,height=400");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=400");
        break;
      case "linkedin":
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank", "width=600,height=400");
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, "_blank");
        break;
      case "line":
        window.open(`https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`, "_blank");
        break;
    }
  };

  return (
    <section id="referral" className="py-20 lg:py-28 bg-[#1F3864] relative overflow-hidden" ref={ref}>
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A961]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/15 border border-[#C9A961]/30 text-[#C9A961] text-sm font-semibold px-4 py-2 rounded-full mb-5">
            <Share2 className="w-4 h-4" />
            {getLang("친구 추천 & 공유", "友達紹介 & シェア", "Refer & Share")}
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {getLang("소중한 사람에게\n알려주세요", "大切な人に\n教えてあげましょう", "Share with\nSomeone Special")}
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            {isKo
              ? "EverWill을 공유하면 추천인과 피추천인 모두 혜택을 받습니다."
              : isJa ? "EverWillをシェアすると、紹介者と紹介された方の両方が特典を受け取れます。"
              : "Both you and your friend receive rewards when you share EverWill."}
          </p>
        </motion.div>

        {/* 혜택 카드 3개 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12"
        >
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="bg-white/8 border border-white/12 rounded-2xl p-6 text-center hover:bg-white/12 transition-all">
                <div className={`w-12 h-12 ${b.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`w-6 h-6 ${b.color}`} />
                </div>
                <h3 className="text-white font-bold text-base mb-1.5">
                  {isKo ? b.title : isJa ? (b as any).titleJa : b.titleEn}
                </h3>
                <p className="text-white/55 text-sm">
                  {isKo ? b.desc : isJa ? (b as any).descJa : b.descEn}
                </p>
              </div>
            );
          })}
        </motion.div>

        {/* 공유 영역 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/8 border border-[#C9A961]/25 rounded-3xl p-5 sm:p-8"
        >
          {isAuthenticated && referralData ? (
            <>
              {/* 내 추천 코드 표시 */}
              <div className="text-center mb-8">
                <p className="text-white/50 text-sm mb-2">{getLang("내 추천 코드", "マイ紹介コード", "My Referral Code")}</p>
                <div className="inline-flex items-center gap-3 bg-[#C9A961]/10 border border-[#C9A961]/40 rounded-2xl px-6 py-3">
                  <span className="text-[#C9A961] font-mono font-bold text-xl sm:text-2xl tracking-widest">
                    {referralData.referralCode}
                  </span>
                  <button
                    onClick={() => handleShare("copy")}
                    className="text-white/50 hover:text-[#C9A961] transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-white/40 text-xs mt-2">
                  {isKo ? `현재 포인트: ${(referralData.pointBalance || 0).toLocaleString()}P` : isJa ? `現在のポイント: ${(referralData.pointBalance || 0).toLocaleString()}P` : `Current Points: ${(referralData.pointBalance || 0).toLocaleString()}P`}
                </p>
              </div>

              {/* 추천 링크 */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
                <span className="text-white/40 text-xs flex-shrink-0">{getLang("추천 링크", "紹介リンク", "Referral Link")}</span>
                <span className="text-white/70 text-sm truncate flex-1 font-mono">{referralUrl}</span>
                <button
                  onClick={() => handleShare("copy")}
                  className="text-white/40 hover:text-[#C9A961] transition-colors flex-shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center mb-8">
              <p className="text-white/60 text-sm mb-4">
                {getLang("로그인하면 나만의 추천 코드를 받을 수 있습니다.", "ログインしてマイ紹介コードを取得できます。", "Login to get your personal referral code.")}
              </p>
              <Button
                onClick={() => window.location.href = "/login"}
                className="bg-[#C9A961] hover:bg-[#b8944f] text-[#1F3864] font-bold px-6 py-2.5 rounded-xl"
              >
                {getLang("로그인하고 추천 코드 받기", "ログインして紹介コードを取得", "Login & Get Referral Code")}
              </Button>
            </div>
          )}

          {/* SNS 공유 버튼 */}
          <div>
            <p className="text-white/50 text-sm text-center mb-4">
              {getLang("SNS로 바로 공유하기", "SNSでシェアする", "Share on Social Media")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {SNS_CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const isTextColor = ch.color.includes("text-black");
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleShare(ch.id)}
                    className={`flex items-center gap-2 ${ch.color} ${isTextColor ? "" : "text-white"} px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-md`}
                  >
                    {ch.id === "copy" && copied ? (
                      <Check className="w-4 h-4" />
                    ) : ch.id === "copy" ? (
                      <Copy className="w-4 h-4" />
                    ) : (
                      <span className="text-base leading-none">{ch.emoji}</span>
                    )}
                    <span>{isKo ? ch.label : isJa ? (ch as any).labelJa : ch.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
