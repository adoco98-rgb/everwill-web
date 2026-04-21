/**
 * EverWill 메인 홈페이지
 * 디자인: Refined Heritage Modernism
 * 네이비(#1F3864) + 골드(#C9A961) + 크림 배경
 * 섹션: Hero → Trust → Services → Badge → Pricing → Global → Lawyers → Reviews → CTA → Footer
 */
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import ServicesSection from "@/components/ServicesSection";
import BadgeSection from "@/components/BadgeSection";
import PricingSection from "@/components/PricingSection";
import GlobalSection from "@/components/GlobalSection";
import LawyersSection from "@/components/LawyersSection";
import ReviewsSection from "@/components/ReviewsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <Navbar />
      <HeroSection />
      <TrustSection />
      <ServicesSection />
      <BadgeSection />
      <PricingSection />
      <GlobalSection />
      <LawyersSection />
      <ReviewsSection />
      <Footer />
    </div>
  );
}
