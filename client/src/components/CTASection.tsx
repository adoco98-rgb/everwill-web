/**
 * EverWill 최종 CTA 섹션
 * "지금 시작하세요 17 min." - PricingSection 바로 위에 배치
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language } = useLanguage();

  const scrollToPricing = () => {
    const el = document.querySelector("#pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A961]/8 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/15 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-8">
            <Shield className="w-4 h-4 text-[#C9A961]" />
            <span className="text-[#C9A961] text-sm font-medium">{t.pricing.free} · {t.pricing.certTitle} {language === 'ko' ? '₩49,000' : '$39'}</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.cta.title}
            <br />
            <span className="text-[#C9A961]">17 min.</span>
          </h2>

          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
            {t.cta.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToPricing}
              className="btn-gold flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base font-semibold shadow-lg"
            >
              {t.cta.btn}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-white/30 text-sm mt-8">
            {t.cta.note}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
