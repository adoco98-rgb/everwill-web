/**
 * EverWill 메인 홈페이지
 * 섹션 순서: Hero → VideoIntro → Trust → Services → Comparison → Badge → Global → Lawyers → HeirService → Reviews → Pricing → CTA → Footer
 * 설득 흐름: 소개 → 신뢰 → 기능 → 비교(설득) → 차별화 → 글로벌 → 전문가 → 상속인 → 후기 → 가격(구매)
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import VideoIntroSection from "@/components/VideoIntroSection";
import TrustSection from "@/components/TrustSection";
import ServicesSection from "@/components/ServicesSection";
import ComparisonSection from "@/components/ComparisonSection";
import BadgeSection from "@/components/BadgeSection";
import GlobalSection from "@/components/GlobalSection";
import LawyersSection from "@/components/LawyersSection";
import HeirServiceSection from "@/components/HeirServiceSection";
import ReviewsSection from "@/components/ReviewsSection";
import ReferralSection from "@/components/ReferralSection";
import PricingSection from "@/components/PricingSection";
import CertifiedCounterBanner from "@/components/CertifiedCounterBanner";
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
      {/* 6. Badge 차별화 */}
      <BadgeSection />
      {/* 7. 글로벌 지원 */}
      <GlobalSection />
      {/* 8. 변호사 매칭 */}
      <LawyersSection />
      {/* 9. 상속인 서비스 */}
      <HeirServiceSection />
      {/* 10. 추천/공유 */}
      <ReferralSection />
      {/* 11. 고객 후기 */}
      <ReviewsSection />
      {/* 11. 인증회원 카운터 */}
      <section className="py-10 bg-[#FAFAF8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <CertifiedCounterBanner />
        </div>
      </section>
      {/* 12. 가격 정책 (맨 아래 - 구매 결정) */}
      <PricingSection />
      <Footer />
    </div>
  );
}
