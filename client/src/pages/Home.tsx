/**
 * EverWill 메인 홈페이지
 * 섹션 순서: Hero → VideoIntro → Trust → Services → Comparison → LegalTimeline → Badge → Global → Lawyers → HeirService → Reviews → Pricing → CTA → Footer
 * 설득 흐름: 소개 → 신뢰 → 기능 → 비교(설득) → 입법흐름(신뢰강화) → 차별화 → 글로벌 → 전문가 → 상속인 → 후기 → 가격(구매)
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VideoIntroSection from "@/components/VideoIntroSection";
import TrustSection from "@/components/TrustSection";
import ServicesSection from "@/components/ServicesSection";
import ComparisonSection from "@/components/ComparisonSection";
import LegalTimelineSection from "@/components/LegalTimelineSection";
import BadgeSection from "@/components/BadgeSection";
import GlobalSection from "@/components/GlobalSection";
import LawyersSection from "@/components/LawyersSection";
import HeirServiceSection from "@/components/HeirServiceSection";
import ReviewsSection from "@/components/ReviewsSection";
import ReferralSection from "@/components/ReferralSection";
import CharityStatsSection from "@/components/CharityStatsSection";
import PricingSection from "@/components/PricingSection";
import CertifiedCounterBanner from "@/components/CertifiedCounterBanner";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      {/* 1. 첫인상 */}
      <HeroSection />
      {/* 2. 서비스 소개 슬라이드 */}
      <VideoIntroSection />
      {/* 3. 신뢰 지표 */}
      <TrustSection />
      {/* 4. 핵심 기능 소개 */}
      <ServicesSection />
      {/* 5. 기존 공증 vs EverWill 비교 (설득) */}
      <ComparisonSection />
      {/* 6. 글로벌 입법 흐름 타임라인 — 법적 신뢰 강화 */}
      <LegalTimelineSection />
      {/* 7. Badge/카드 차별화 */}
      <BadgeSection />
      {/* 8. 글로벌 지원 */}
      <GlobalSection />
      {/* 9. 변호사 매칭 */}
      <LawyersSection />
      {/* 10. 상속인 서비스 */}
      <HeirServiceSection />
      {/* 11. 추천/공유 */}
      <ReferralSection />
      {/* 12. 사회기부 누적 현황 */}
      <CharityStatsSection />
      {/* 13. 고객 후기 */}
      <ReviewsSection />
      {/* 14. 인증회원 카운터 */}
      <section className="py-10 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CertifiedCounterBanner />
        </div>
      </section>
      {/* 15. 1:1 문의 */}
      <ContactSection />
      {/* 16. 가격 정책 (맨 아래 - 구매 결정) */}
      <PricingSection />
      <Footer />
    </div>
  );
}
