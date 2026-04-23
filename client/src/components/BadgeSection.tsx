/**
 * EverWill Badge 섹션
 * 멤버십 골드 카드 제공 안내
 * 네이비 배경 + 골드 강조
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { QrCode, Heart, FileCheck, Megaphone, Gift, Clock, CreditCard, Star } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const BADGE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/everwill-gold-card-oH5UXq9tRPBYWHV9uVM6ME.webp";

/* 멤버십 골드 카드 혜택 */
const membershipCardBenefits = [
  { icon: CreditCard, title: "멤버십 골드 카드", desc: "유언장 인증 완료 시 실물 골드 카드 발급" },
  { icon: QrCode, title: "QR 신원 인증", desc: "응급 상황 시 QR 스캔으로 가족 연락처 즉시 확인" },
  { icon: FileCheck, title: "유언 인증 번호", desc: "법원·은행에서 일련번호로 유언 인증서 확인" },
  { icon: Star, title: "평생 보관 증명", desc: "카드 소지만으로 EverWill 회원임을 증명" },
];

export default function BadgeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language } = useLanguage();
  const isKo = language === 'ko';

  const badgeRoles = [
    { icon: Heart, title: t.badge.role1, description: t.badge.role1Desc, color: "text-red-400" },
    { icon: QrCode, title: t.badge.role2, description: t.badge.role2Desc, color: "text-blue-400" },
    { icon: FileCheck, title: t.badge.role3, description: t.badge.role3Desc, color: "text-green-400" },
    { icon: Megaphone, title: t.badge.role4, description: t.badge.role4Desc, color: "text-yellow-400" },
  ];

  /* 멤버십 플랜별 카드 혜택 */
  const membershipTiers = [
    { name: "Basic", plan: "유언장 인증 (₩49,000)", card: "스테인레스 골드 카드 + 1년 무료 보관", color: "border-gray-400/30 bg-white/5" },
    { name: "3년 플랜", plan: "₩73,900", card: "스테인레스 골드 카드 + 3년 보관", color: "border-blue-400/30 bg-blue-500/5" },
    { name: "5년 플랜", plan: "₩88,000", card: "티타늄 골드 카드 + 5년 보관", color: "border-[#C9A961]/40 bg-[#C9A961]/5", popular: true },
    { name: "10년 플랜", plan: "₩128,000", card: "티타늄 골드 카드 + 10년 보관", color: "border-purple-400/30 bg-purple-500/5" },
    { name: "영구 플랜", plan: "₩248,000", card: "플래티넘 골드 카드 + 영구 보관", color: "border-[#C9A961]/60 bg-[#C9A961]/10" },
  ];

  return (
    <section id="badge" className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#C9A961]/5 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#C9A961]/8 blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/15 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-6">
            <span className="text-[#C9A961] text-sm font-medium">{t.badge.tag}</span>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.badge.title}
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            {t.badge.subtitle}
            <br />
            {t.badge.desc}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          {/* 좌측: Badge 이미지 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={BADGE_IMAGE}
                alt="EverWill Badge - 프리미엄 스테인레스 카드와 티타늄 팔찌"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "400px", objectFit: "cover" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/60 to-transparent" />
            </div>

            {/* 플로팅 통계 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-[#C9A961] font-bold text-lg">4</div>
                  <div className="text-white/70 text-xs">{t.badge.role1}</div>
                </div>
                <div>
                  <div className="text-[#C9A961] font-bold text-lg">5</div>
                  <div className="text-white/70 text-xs">{t.badge.lineup}</div>
                </div>
                <div>
                  <div className="text-[#C9A961] font-bold text-lg">∞</div>
                  <div className="text-white/70 text-xs">{t.badge.tag}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 우측: 4가지 역할 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5"
          >
            {badgeRoles.map((role, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 ${role.color}`}>
                  <role.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{role.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{role.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 무료 증정 배너 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#C9A961]/20 to-[#C9A961]/10 border border-[#C9A961]/40 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-[#C9A961]/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-6 h-6 text-[#C9A961]" />
            </div>
            <div className="flex-1">
              <div className="text-[#C9A961] font-bold text-base mb-1">
                {t.badge.cardIncluded}
              </div>
              <p className="text-white/60 text-sm">
                {t.badge.wearable} · {t.badge.necklace} · {t.badge.premium} · {t.badge.custom}
              </p>
            </div>
            <div className="flex-shrink-0 bg-[#C9A961] text-[#1F3864] font-black text-sm px-4 py-2 rounded-full whitespace-nowrap">
              ₩49,000 {t.badge.cardIncluded}
            </div>
          </div>
        </motion.div>

        {/* 바로 시작하기 CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="btn-gold px-10 py-4 rounded-full text-lg font-black inline-flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
          >
            <Gift className="w-5 h-5" />
            {isKo ? '지금 바로 시작하기 →' : 'Get Started Now →'}
          </button>
          <p className="text-white/40 text-sm mt-3">
            {isKo ? 'AI 유언장 작성 무료 · 전자인증 ₩49,000' : 'AI Will Writing Free · E-Certification ₩49,000'}
          </p>
        </motion.div>

      </div>
    </section>
  );
}
