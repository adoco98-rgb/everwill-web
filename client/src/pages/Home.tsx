/**
 * EverWill 메인 홈페이지
 * 섹션 순서: Hero → VideoIntro → Trust → Services → Comparison → LegalTimeline → Global → Pricing → Referral → HeirService → Charity → Reviews → Footer
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VideoIntroSection from "@/components/VideoIntroSection";
import CountryVideoSection from "@/components/CountryVideoSection";
import TrustSection from "@/components/TrustSection";
import ServicesSection from "@/components/ServicesSection";
import ComparisonSection from "@/components/ComparisonSection";
import LegalTimelineSection from "@/components/LegalTimelineSection";
import GlobalSection from "@/components/GlobalSection";
import HeirServiceSection from "@/components/HeirServiceSection";
import ReviewsSection from "@/components/ReviewsSection";
import ReferralSection from "@/components/ReferralSection";
import CharityStatsSection from "@/components/CharityStatsSection";
import CTASection from "@/components/CTASection";
import PricingSection from "@/components/PricingSection";
import CertifiedCounterBanner from "@/components/CertifiedCounterBanner";
import { LifeStorySection } from "@/components/LifeStorySection";
import LegalAISection from "@/components/LegalAISection";
import ExpertsSection from "@/components/ExpertsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      {/* 1. 첫인상 */}
      <HeroSection />
      {/* 2. 서비스 소개 슬라이드 */}
      <VideoIntroSection />
      {/* 2-1. 국가별 유튜브 영상 */}
      <CountryVideoSection />
      {/* 3. 신뢰 지표 */}
      <TrustSection />
      {/* 4. 핵심 기능 소개 */}
      <ServicesSection />
      {/* 5. 기존 공증 vs EverWill 비교 (설득) */}
      <ComparisonSection />
      {/* 6. 글로벌 입법 흐름 타임라인 — 법적 신뢰 강화 */}
      <LegalTimelineSection />
      {/* 7. 글로벌 지원 */}
      <GlobalSection />
      {/* 7-1. 법률 전문 AI 소개 */}
      <LegalAISection />
      {/* 8. Life Story 프리미엄 기능 소개 */}
      <LifeStorySection />
      {/* 9. 사회기부 */}
      <CharityStatsSection />
      {/* 10. 지금 시작하세요 CTA */}
      <CTASection />
      {/* 11. 가격 정책 */}
      <PricingSection />
      {/* 12. 친구 추천 & 공유 */}
      <ReferralSection />
      {/* 13. 고객 후기 */}
      <ReviewsSection />
      {/* 14. 상속인 서비스 */}
      <HeirServiceSection />
      {/* 15. 전문가 파트너 그룹 소개 */}
      <ExpertsSection />
      {/* 16. 인증회원 카운터 */}
      <section className="py-10 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CertifiedCounterBanner />
        </div>
      </section>
      {/* 파트너 신청 CTA 배너 */}
      <section className="py-16 bg-[#1F3864]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase mb-3">EverWill Partner</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            변호사·세무사·금융 전문가와 함께하세요
          </h2>
          <p className="text-white/70 text-base mb-8 max-w-xl mx-auto">
            EverWill 파트너로 등록하고 전 세계 고객과 연결되세요.<br />
            사후 집행 수수료의 15-25%를 수익으로 받습니다.
          </p>
          <a
            href="/partner"
            className="inline-flex items-center gap-2 bg-[#C9A961] hover:bg-[#d4b56e] text-[#1F3864] font-bold px-10 py-4 rounded-full text-base shadow-lg transition-all duration-200"
          >
            파트너 신청하기 →
          </a>
        </div>
      </section>
      <Footer />
    </div>
  );
}
