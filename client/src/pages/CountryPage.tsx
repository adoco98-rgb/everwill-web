/**
 * 국가별 전용 랜딩 페이지 (NZ / AU / CA)
 * - 각 국가 법률 기준 반영
 * - 풀 랜딩 페이지 구조: Hero → 법적근거 → 서비스 → 가격 → Badge → 신뢰 → CTA
 * - 언어 자동 전환 (countryPages.ts의 langCode 기준)
 */
import { useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { motion, useInView } from "framer-motion";
import VideoIntroSection from "@/components/VideoIntroSection";
import CountryVideoSection from "@/components/CountryVideoSection";
import ServicesSection from "@/components/ServicesSection";
import ComparisonSection from "@/components/ComparisonSection";
import { LifeStorySection } from "@/components/LifeStorySection";
import ReviewsSection from "@/components/ReviewsSection";
import {
  ShieldCheck, FileText, Activity, Bell, Scale, CreditCard,
  CheckCircle, AlertTriangle, Globe, ArrowRight, Star, Users,
  Lock, Zap, Heart, QrCode, Wifi, Check, Sparkles, ChevronRight,
  BookOpen, Video, Scroll, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { countryPagesData, type CountryPageData, type LegalStatus } from "@/data/countryPages";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/i18n";

// 아이콘 매핑
const iconMap: Record<string, React.ElementType> = {
  FileText, ShieldCheck, Activity, Bell, Scale, CreditCard,
  Globe, Lock, Zap, Heart, Users, Star, QrCode, Wifi, BookOpen, Video, Scroll, RefreshCw
};

// 법적 상태 배지
function LegalStatusBadge({ status, label }: { status: LegalStatus; label: string }) {
  const colors: Record<LegalStatus, string> = {
    active: "bg-green-500/20 text-green-300 border-green-500/40",
    partial: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    review: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  };
  const icons: Record<LegalStatus, React.ReactNode> = {
    active: <CheckCircle className="w-3.5 h-3.5" />,
    partial: <AlertTriangle className="w-3.5 h-3.5" />,
    review: <AlertTriangle className="w-3.5 h-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
      {icons[status]}
      {label}
    </span>
  );
}

// ─── Hero 섹션 ───────────────────────────────────────────────────────────────
const HERO_BG_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/hero-global-elders-v2-DB4mTEuKjbV7DYjdv5fYBA.webp";

function CountryHero({ data }: { data: CountryPageData }) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#0d1f3c]">
      {/* 배경 이미지 - 글로벌 노인 그룹 */}
      <img
        src={HERO_BG_URL}
        alt="Global seniors"
        className="absolute inset-0 w-full h-full object-cover object-center"
        loading="eager"
      />
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c]/70 via-[#1F3864]/60 to-[#0d1f3c]/80" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* 국가 배지 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <img src={data.flagImg} alt={data.lang} className="w-10 h-7 rounded object-cover shadow-lg" />
          <span className="text-[#C9A961] font-semibold text-lg tracking-widest uppercase">
            {data.countryCode} · EVERWILL
          </span>
        </motion.div>

        {/* 법적 상태 배지 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <LegalStatusBadge status={data.legalStatus} label={data.legalStatusLabel} />
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight whitespace-pre-line"
        >
          {data.heroTitle}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-[#C9A961] text-xl font-semibold mb-4"
        >
          {data.heroSubtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/70 text-lg mb-10 max-w-2xl mx-auto"
        >
          {data.heroTagline}
        </motion.p>

        {/* CTA 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/register">
            <Button className="bg-[#C9A961] hover:bg-[#b8954f] text-[#1F3864] font-bold text-lg px-10 py-6 rounded-full shadow-xl">
              {data.heroCtaText} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 법적 근거 섹션 ──────────────────────────────────────────────────────────
function LegalBasisSection({ data }: { data: CountryPageData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="py-20 bg-[#FAFAFA]">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">Legal Basis</span>
          <h2 className="text-3xl font-bold text-[#1F3864] mt-2">
            {data.legalStatus === "active" ? "Full Legal Validity" : data.legalStatus === "partial" ? "법적 근거" : "Legal Review in Progress"}
          </h2>
          <p className="text-[#6B7280] mt-3 max-w-2xl mx-auto">
            {data.legalStatus === "active"
              ? `EverWill operates in full compliance with ${data.countryCode} law. Every will is legally valid and immediately enforceable.`
              : data.legalStatus === "partial"
              ? `EverWill은 한국 민법 및 전자서명법에 기반하여 서비스를 제공합니다. 현재 전자 유언 인증에 대한 세부 법률 검토가 진행 중입니다.`
              : `Legal review is in progress for ${data.countryCode}. Service will be available upon completion.`
            }
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-4">
          {data.legalBasis.map((law, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <span className="text-[#1A1A1A] text-sm font-medium">{law}</span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-[#6B7280] bg-white rounded-full px-6 py-2 inline-block border border-gray-200">
            {data.legalNote}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 서비스 기능 섹션 ────────────────────────────────────────────────────────
function FeaturesSection({ data }: { data: CountryPageData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">Services</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mt-2">{data.serviceTitle}</h2>
          <p className="text-[#6B7280] mt-3 max-w-2xl mx-auto">{data.serviceDesc}</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.features.map((feature, i) => {
            const Icon = iconMap[feature.icon] || FileText;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="bg-[#FAFAFA] rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#1F3864]/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#1F3864]" />
                </div>
                <h3 className="text-lg font-bold text-[#1F3864] mb-2">{feature.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── 가격 섹션 ───────────────────────────────────────────────────────────────
function PricingSection({ data }: { data: CountryPageData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const plans = [
    {
      name: "Free",
      price: "Free",
      desc: "AI will drafting, unlimited revisions",
      features: ["AI will drafting", "10-step wizard", "PDF preview", "Unlimited edits"],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Certification",
      price: data.certPrice,
      desc: "Legally certified, blockchain secured",
      features: [
        "Everything in Free",
        "eKYC identity verification",
        "Electronic signature",
        "Blockchain hash record",
        "Certified PDF issued",
      ],
      cta: "Get Certified",
      highlight: true,
    },
    {
      name: "Membership",
      price: data.membershipPrice,
      desc: "Annual plan with all features",
      features: [
        "Everything in Certification",
        "Unlimited re-certification",
        "Video will recording",
        "Handwritten will scan",
        "Priority support",
        "4-layer death detection",
      ],
      cta: "Join Membership",
      highlight: false,
    },
  ];

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-[#1F3864] to-[#0d1f3c]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Transparent Pricing, No Hidden Fees</h2>
          <p className="text-white/60 mt-3">All prices in {data.currency}. Payment via {data.paymentMethods.join(", ")}.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              className={`rounded-2xl p-8 flex flex-col ${
                plan.highlight
                  ? "bg-[#C9A961] text-[#1F3864]"
                  : "bg-white/10 text-white border border-white/20"
              }`}
            >
              {plan.highlight && (
                <div className="flex items-center gap-1 mb-3">
                  <Star className="w-4 h-4 fill-[#1F3864]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Most Popular</span>
                </div>
              )}
              <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-[#1F3864]" : "text-white"}`}>
                {plan.name}
              </h3>
              <div className={`text-3xl font-bold mb-2 ${plan.highlight ? "text-[#1F3864]" : "text-[#C9A961]"}`}>
                {plan.price}
              </div>
              <p className={`text-sm mb-6 ${plan.highlight ? "text-[#1F3864]/70" : "text-white/60"}`}>{plan.desc}</p>
              <ul className="space-y-2 flex-1 mb-8">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? "text-[#1F3864]" : "text-[#C9A961]"}`} />
                    <span className={plan.highlight ? "text-[#1F3864]" : "text-white/80"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button
                  className={`w-full rounded-full font-bold ${
                    plan.highlight
                      ? "bg-[#1F3864] text-white hover:bg-[#0d1f3c]"
                      : "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  }`}
                >
                  {plan.cta} <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── EverWill Badge 섹션 ─────────────────────────────────────────────────────
function BadgeSection({ data }: { data: CountryPageData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const badgeFeatures = [
    { icon: QrCode, title: "QR Code", desc: "Emergency responders scan to access your medical info and family contacts instantly" },
    { icon: Wifi, title: "NFC Chip", desc: "Tap-to-read with any smartphone — no app required" },
    { icon: ShieldCheck, title: "Will Authentication", desc: "Courts and banks verify your will serial number in seconds" },
    { icon: Bell, title: "Death Trigger", desc: "Hospitals and funeral homes scan the NFC card to automatically notify your family" },
  ];

  // 국가별 Badge 가격 매핑
  const badgePriceMap: Record<string, { e: string; w: string; n: string; p: string }> = {
    KRW:     { e: "₩59,000",  w: "₩99,000",  n: "₩129,000", p: "₩399,000" },
    USD:     { e: "$49",      w: "$79",      n: "$99",      p: "$299" },
    JPY:     { e: "¥7,800",   w: "¥12,500",  n: "¥15,800",  p: "¥47,500" },
    "HKD/TWD": { e: "HK$379",  w: "HK$609",  n: "HK$769",  p: "HK$2,299" },
    EUR:     { e: "€49",      w: "€79",      n: "€99",      p: "€299" },
    SAR:     { e: "SAR 184",  w: "SAR 296",  n: "SAR 371",  p: "SAR 1,121" },
    RUB:     { e: "₽4,500",   w: "₽7,200",   n: "₽9,000",   p: "₽27,000" },
    INR:     { e: "₹4,000",   w: "₹6,500",   n: "₹8,100",   p: "₹24,500" },
    BRL:     { e: "R$249",    w: "R$399",    n: "R$499",    p: "R$1,499" },
    AUD:     { e: "A$55",     w: "A$89",     n: "A$109",    p: "A$329" },
    NZD:     { e: "NZ$59",    w: "NZ$95",    n: "NZ$119",   p: "NZ$359" },
    CAD:     { e: "C$49",     w: "C$79",     n: "C$99",     p: "C$299" },
  };
  const bp = badgePriceMap[data.currency] ?? badgePriceMap["USD"];
  const badgePlans = [
    { name: "Essential", material: "Stainless Steel Card", price: bp.e },
    { name: "Wearable", material: "Silicone / Titanium Bracelet", price: bp.w },
    { name: "Necklace", material: "Stainless / Rose Gold", price: bp.n },
    { name: "Premium", material: "Titanium / Platinum", price: bp.p, highlight: true },
  ];

  return (
    <section ref={ref} className="py-20 bg-[#FAFAFA]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">
            {data.currency === "KRW" ? "NFC 내장 인증카드" : "EverWill NFC Card"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mt-2">
            {data.currency === "KRW" ? "NFC 내장 인증카드" : "Physical Certification Card"}
          </h2>
          <p className="text-[#6B7280] mt-3 max-w-2xl mx-auto">
            {data.currency === "KRW"
              ? "QR·NFC 탑재 실물 인증 카드. 평소에 휴대하면 신원 확인, 응급 알림, 유언 인증에 활용됩니다."
              : "The world's first physical will certification card. Carry it daily — it works as identity, emergency alert, and will authentication."
            }
          </p>
        </motion.div>

        {/* 4가지 기능 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {badgeFeatures.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm"
            >
              <div className="w-12 h-12 bg-[#1F3864]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-[#1F3864]" />
              </div>
              <h3 className="font-bold text-[#1F3864] mb-2">{f.title}</h3>
              <p className="text-[#6B7280] text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* 배지 라인업 */}
        <div className="grid md:grid-cols-4 gap-4">
          {badgePlans.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.1 }}
              className={`rounded-2xl p-6 text-center border ${
                b.highlight
                  ? "bg-[#1F3864] border-[#C9A961] text-white"
                  : "bg-white border-gray-100"
              }`}
            >
              {b.highlight && (
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C9A961]" />
                  <span className="text-[#C9A961] text-xs font-bold">PREMIUM</span>
                </div>
              )}
              <h3 className={`font-bold text-lg mb-1 ${b.highlight ? "text-white" : "text-[#1F3864]"}`}>{b.name}</h3>
              <p className={`text-xs mb-3 ${b.highlight ? "text-white/60" : "text-[#6B7280]"}`}>{b.material}</p>
              <div className={`text-2xl font-bold ${b.highlight ? "text-[#C9A961]" : "text-[#1F3864]"}`}>{b.price}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 신뢰 지표 섹션 ──────────────────────────────────────────────────────────
function TrustSection({ data }: { data: CountryPageData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-4">
          {data.trustPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 bg-[#FAFAFA] border border-gray-200 rounded-full px-5 py-2.5"
            >
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-[#1F3864] text-sm font-medium">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 타깃 고객 섹션 ──────────────────────────────────────────────────────────
function TargetSection({ data }: { data: CountryPageData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="py-16 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">Who It's For</span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1F3864] mt-2 mb-6">Built for {data.countryCode} Residents</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {data.targetAudience.split(" · ").map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 bg-white border border-[#C9A961]/30 rounded-full px-5 py-2.5 shadow-sm"
              >
                <Users className="w-4 h-4 text-[#C9A961]" />
                <span className="text-[#1F3864] text-sm font-medium">{t}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 최종 CTA 섹션 ───────────────────────────────────────────────────────────
function CtaSection({ data }: { data: CountryPageData }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <section ref={ref} className="py-24 bg-gradient-to-br from-[#1F3864] to-[#0d1f3c]">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <img src={data.flagImg} alt={data.countryCode} className="w-16 h-11 rounded mx-auto mb-6 shadow-lg object-cover" />
          <h2 className="text-4xl font-bold text-white mb-4">{data.ctaTitle}</h2>
          <p className="text-white/70 text-lg mb-8">{data.ctaDesc}</p>
          <Link href="/register">
            <Button className="bg-[#C9A961] hover:bg-[#b8954f] text-[#1F3864] font-bold text-lg px-12 py-6 rounded-full shadow-xl">
              {data.ctaButton} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-white/40 text-sm mt-6">{data.targetAudience}</p>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function CountryPage() {
  const params = useParams<{ code: string }>();
  const code = params.code?.toLowerCase();
  const data = code ? countryPagesData[code] : null;
  const { setLanguage } = useLanguage();

  // 국가 페이지 접속 시 해당 국가 언어로 자동 전환
  useEffect(() => {
    if (data) {
      document.title = data.metaTitle;
      const langMap: Record<string, Language> = {
        en: "en", ko: "ko", ja: "ja", zh: "zh",
        de: "de", es: "es", ar: "ar", fr: "fr",
        ru: "ru", hi: "hi", pt: "pt",
      };
      const targetLang = langMap[data.langCode];
      if (targetLang) setLanguage(targetLang);
    }
  }, [data, setLanguage]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 px-6 text-center">
          <Globe className="w-16 h-16 text-[#C9A961]" />
          <h1 className="text-2xl font-bold text-[#1F3864]">Country not found</h1>
          <p className="text-[#6B7280]">The country page for "{code}" is not available yet.</p>
          <Link href="/">
            <Button className="bg-[#1F3864] text-white rounded-full px-8">Go Home</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      {/* 국가 고유 섹션 */}
      <CountryHero data={data} />
      <LegalBasisSection data={data} />
      {/* 홈페이지 공통 섹션 */}
      <VideoIntroSection />
      <CountryVideoSection />
      <ServicesSection />
      <ComparisonSection />
      <LifeStorySection />
      {/* 국가별 가격 */}
      <PricingSection data={data} />
      <BadgeSection data={data} />
      <TargetSection data={data} />
      <TrustSection data={data} />
      <ReviewsSection />
      <CtaSection data={data} />
      <Footer />
    </div>
  );
}
