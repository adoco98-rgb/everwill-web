/**
 * 국가별 랜딩 페이지 컴포넌트
 * 한국판 구조를 기준으로 각 나라 법률에 맞게 현지화
 * 한국판 코드는 절대 변경하지 않음
 */
import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  ShieldCheck, FileText, Activity, Bell, Scale, CreditCard,
  CheckCircle, AlertTriangle, Globe, ArrowRight, Star, Users,
  Lock, Zap, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { countryPagesData, type CountryPageData, type LegalStatus } from "@/data/countryPages";

// 아이콘 매핑
const iconMap: Record<string, React.ElementType> = {
  FileText, ShieldCheck, Activity, Bell, Scale, CreditCard,
  Globe, Lock, Zap, Heart, Users, Star,
};

// 법적 상태 배지
function LegalStatusBadge({ status, label }: { status: LegalStatus; label: string }) {
  const colors = {
    active: "bg-green-500/20 text-green-300 border-green-500/40",
    partial: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    review: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  };
  const icons = {
    active: <CheckCircle className="w-3.5 h-3.5" />,
    partial: <AlertTriangle className="w-3.5 h-3.5" />,
    review: <AlertTriangle className="w-3.5 h-3.5" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}>
      {icons[status]}
      {label}
    </span>
  );
}

// Hero 섹션
function CountryHero({ data }: { data: CountryPageData }) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d1f3c] via-[#1F3864] to-[#0d1f3c]">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C9A961]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A961]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* 국기 + 국가 코드 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <img
            src={data.flagImg}
            alt={data.countryCode}
            className="w-12 h-8 rounded object-cover shadow-lg"
          />
          <span className="text-white/60 text-sm font-mono tracking-widest uppercase">
            {data.countryCode} · EverWill
          </span>
        </motion.div>

        {/* 법적 상태 배지 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <LegalStatusBadge status={data.legalStatus} label={data.legalStatusLabel} />
        </motion.div>

        {/* 메인 타이틀 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4"
          style={{ whiteSpace: "pre-line" }}
        >
          {data.heroTitle}
        </motion.h1>

        {/* 서브타이틀 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl text-[#C9A961] font-semibold mb-4"
        >
          {data.heroSubtitle}
        </motion.p>

        {/* 태그라인 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-white/60 text-base md:text-lg max-w-2xl mx-auto mb-10"
        >
          {data.heroTagline}
        </motion.p>

        {/* CTA 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/write">
            <Button className="bg-[#C9A961] text-[#1F3864] hover:bg-[#d4b56e] font-bold px-10 py-4 rounded-full text-lg shadow-xl shadow-[#C9A961]/30">
              {data.heroCtaText} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-full text-lg">
              {data.currency === "KRW" ? "가격 확인" : "View Pricing"}
            </Button>
          </Link>
        </motion.div>

        {/* 가격 힌트 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-white/30 text-sm mt-6"
        >
          {data.currency === "KRW"
            ? `AI 유언장 작성 무료 · 인증 ${data.certPrice} · 재인증 ${data.renewPrice}`
            : `AI will drafting free · Certification ${data.certPrice} · Renewal ${data.renewPrice}`}
        </motion.p>
      </div>
    </section>
  );
}

// 법률 근거 섹션
function LegalBasisSection({ data }: { data: CountryPageData }) {
  return (
    <section className="py-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase mb-3 block">
            {data.currency === "KRW" ? "법적 근거" : "Legal Basis"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">
            {data.currency === "KRW" ? "완전한 법적 효력" : "Full Legal Validity"}
          </h2>
          <p className="text-[#6B7280] max-w-xl mx-auto">
            {data.legalNote}
          </p>
        </motion.div>

        {/* 법적 경고 (부분 적용 국가) */}
        {data.legalWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-8 flex gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-sm leading-relaxed">{data.legalWarning}</p>
          </motion.div>
        )}

        <div className="grid gap-3">
          {data.legalBasis.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-sm border border-[#1F3864]/8"
            >
              <CheckCircle className="w-5 h-5 text-[#C9A961] flex-shrink-0 mt-0.5" />
              <span className="text-[#1A1A1A] text-sm leading-relaxed">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 서비스 기능 섹션
function FeaturesSection({ data }: { data: CountryPageData }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase mb-3 block">
            {data.currency === "KRW" ? "핵심 서비스" : "Core Services"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">
            {data.serviceTitle}
          </h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">{data.serviceDesc}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.features.map((feature, i) => {
            const Icon = iconMap[feature.icon] || ShieldCheck;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-gradient-to-br from-[#1F3864]/5 to-[#C9A961]/5 rounded-2xl p-6 border border-[#1F3864]/10 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#1F3864] rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-[#C9A961]" />
                </div>
                <h3 className="text-[#1F3864] font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 가격 섹션
function PricingSnippet({ data }: { data: CountryPageData }) {
  return (
    <section className="py-20 bg-gradient-to-br from-[#1F3864] to-[#0d1f3c]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase mb-3 block">
            {data.currency === "KRW" ? "가격 정책" : "Pricing"}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-10">
            {data.currency === "KRW" ? "투명한 가격, 숨겨진 비용 없음" : "Transparent Pricing, No Hidden Fees"}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              label: data.currency === "KRW" ? "AI 유언장 작성" : "AI Will Drafting",
              price: data.currency === "KRW" ? "무료" : "Free",
              desc: data.currency === "KRW" ? "제한 없음" : "Unlimited",
              highlight: false,
            },
            {
              label: data.currency === "KRW" ? "최초 전자 인증" : "First Certification",
              price: data.certPrice,
              desc: data.currency === "KRW" ? "1회 결제" : "One-time",
              highlight: true,
            },
            {
              label: data.currency === "KRW" ? "재인증 (수정)" : "Re-certification",
              price: data.renewPrice,
              desc: data.currency === "KRW" ? "횟수 무제한" : "Unlimited times",
              highlight: false,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-6 ${item.highlight
                ? "bg-[#C9A961] text-[#1F3864]"
                : "bg-white/10 text-white border border-white/20"
                }`}
            >
              <p className={`text-sm font-medium mb-2 ${item.highlight ? "text-[#1F3864]/70" : "text-white/60"}`}>
                {item.label}
              </p>
              <p className={`text-3xl font-bold mb-1 ${item.highlight ? "text-[#1F3864]" : "text-white"}`}>
                {item.price}
              </p>
              <p className={`text-xs ${item.highlight ? "text-[#1F3864]/60" : "text-white/40"}`}>
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 결제 수단 */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {data.paymentMethods.map((method, i) => (
            <span key={i} className="bg-white/10 text-white/70 text-xs px-3 py-1.5 rounded-full border border-white/20">
              {method}
            </span>
          ))}
        </div>

        <Link href="/write">
          <Button className="bg-[#C9A961] text-[#1F3864] hover:bg-[#d4b56e] font-bold px-10 py-4 rounded-full text-lg">
            {data.ctaButton} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <p className="text-white/30 text-xs mt-4">{data.ctaDesc}</p>
      </div>
    </section>
  );
}

// 신뢰 지표 섹션
function TrustSection({ data }: { data: CountryPageData }) {
  return (
    <section className="py-16 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.trustPoints.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-xl p-4 text-center shadow-sm border border-[#1F3864]/8"
            >
              <ShieldCheck className="w-6 h-6 text-[#C9A961] mx-auto mb-2" />
              <p className="text-[#1F3864] text-xs font-semibold leading-tight">{point}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA 섹션
function CtaSection({ data }: { data: CountryPageData }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <img src={data.flagImg} alt={data.countryCode} className="w-16 h-11 rounded object-cover mx-auto mb-6 shadow-lg" />
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">{data.ctaTitle}</h2>
          <p className="text-[#6B7280] text-lg mb-8">{data.ctaDesc}</p>
          <Link href="/write">
            <Button className="bg-[#1F3864] text-white hover:bg-[#162d52] font-bold px-12 py-4 rounded-full text-lg shadow-xl">
              {data.ctaButton} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-[#6B7280]/50 text-xs mt-4">{data.targetAudience}</p>
        </motion.div>
      </div>
    </section>
  );
}

// 메인 CountryPage 컴포넌트
export default function CountryPage() {
  const params = useParams<{ code: string }>();
  const code = params.code?.toLowerCase();

  const data = code ? countryPagesData[code] : null;

  useEffect(() => {
    if (data) {
      document.title = data.metaTitle;
    }
  }, [data]);

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
      <CountryHero data={data} />
      <LegalBasisSection data={data} />
      <FeaturesSection data={data} />
      <TrustSection data={data} />
      <PricingSnippet data={data} />
      <CtaSection data={data} />
      <Footer />
    </div>
  );
}
