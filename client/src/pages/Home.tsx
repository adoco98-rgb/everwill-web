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
      <Footer />
    </div>
  );
}
