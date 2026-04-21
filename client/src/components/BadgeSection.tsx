/**
 * EverWill Badge 시스템 섹션
 * 세계 최초 물리적 유언 인증 배지 소개
 * 네이비 배경 + 골드 강조
 * 모든 Badge 구매자에게 스테인레스 카드(Essential) 무료 증정
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { QrCode, Heart, FileCheck, Megaphone, Gift, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const BADGE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/everwill-gold-card-oH5UXq9tRPBYWHV9uVM6ME.webp";

const badgeLineup = [
  {
    name: "Wearable",
    price: "₩79,000",
    originalPrice: "₩129,000",
    usd: "$79",
    popular: false,
    freeCard: true,
    discount: "39%",
  },
  {
    name: "Necklace",
    price: "₩99,000",
    originalPrice: "₩159,000",
    usd: "$99",
    popular: true,
    freeCard: true,
    discount: "38%",
  },
  {
    name: "Premium",
    price: "₩299,000",
    originalPrice: "₩490,000",
    usd: "$299",
    popular: false,
    freeCard: true,
    discount: "39%",
  },
  {
    name: "Custom VIP",
    price: "₩500,000+",
    originalPrice: "₩800,000+",
    usd: "$500+",
    popular: false,
    freeCard: true,
    discount: "37%",
  },
];

export default function BadgeSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  const badgeRoles = [
    { icon: Heart, title: t.badge.role1, description: t.badge.role1Desc, color: "text-red-400" },
    { icon: QrCode, title: t.badge.role2, description: t.badge.role2Desc, color: "text-blue-400" },
    { icon: FileCheck, title: t.badge.role3, description: t.badge.role3Desc, color: "text-green-400" },
    { icon: Megaphone, title: t.badge.role4, description: t.badge.role4Desc, color: "text-yellow-400" },
  ];

  const badgeLineupWithTranslation = [
    { ...badgeLineup[0], material: t.badge.wearableMat },
    { ...badgeLineup[1], material: t.badge.necklaceMat },
    { ...badgeLineup[2], material: t.badge.premiumMat },
    { ...badgeLineup[3], material: t.badge.customMat },
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

        {/* Badge 라인업 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <h3 className="text-center text-white text-xl font-bold mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.badge.lineup}
          </h3>

          {/* Essential 강조 카드 (무료 증정 기준) */}
          <div className="mb-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#C9A961]/20 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-5 h-5 text-[#C9A961]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-bold text-sm">{t.badge.essential}</span>
                  <span className="text-[10px] bg-[#C9A961] text-[#1F3864] font-black px-2 py-0.5 rounded-full">{t.badge.cardIncluded}</span>
                </div>
                <div className="text-white/50 text-xs">{t.badge.essentialMat}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white/40 text-xs line-through">₩49,000</div>
                <div className="text-[#C9A961] font-bold text-sm">{t.badge.cardIncluded}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badgeLineupWithTranslation.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.45 + i * 0.08 }}
                className={`relative rounded-xl p-4 text-center border transition-all cursor-pointer ${
                  badge.popular
                    ? "bg-[#C9A961]/20 border-[#C9A961]/50 hover:bg-[#C9A961]/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                onClick={() => toast.info(t.badge.order)}
              >
                {badge.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {t.badge.popular}
                  </div>
                )}
                <div className="text-white font-bold text-sm mb-1">{badge.name}</div>
                <div className="text-white/50 text-xs mb-3">{badge.material}</div>
                {badge.originalPrice && (
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <span className="text-white/30 text-xs line-through">{badge.originalPrice}</span>
                    <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{badge.discount}</span>
                  </div>
                )}
                <div className="text-[#C9A961] font-bold text-base">{badge.price}</div>
                <div className="text-white/40 text-xs mb-2">{badge.usd}</div>
                <div className="flex items-center justify-center gap-1 bg-[#C9A961]/15 border border-[#C9A961]/30 rounded-full px-2 py-0.5">
                  <Gift className="w-2.5 h-2.5 text-[#C9A961]" />
                  <span className="text-[#C9A961] text-[10px] font-semibold">{t.badge.cardIncluded}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 얼리버드 배너 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <div className="bg-white/5 border border-white/15 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="text-white font-bold text-base mb-1">
                {t.pricing.earlyBird}
              </div>
              <p className="text-white/50 text-sm">
                {t.pricing.earlyBirdNote}
              </p>
            </div>
            <button
              onClick={() => toast.info(t.pricing.earlyBirdBtn)}
              className="btn-gold px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap flex-shrink-0"
            >
              {t.pricing.earlyBirdBtn}
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
