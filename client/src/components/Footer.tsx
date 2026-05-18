/**
 * EverWill CTA 섹션 + Footer
 * 마지막 전환 유도 + 사이트맵
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Mail, Phone, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t, language } = useLanguage();

  const scrollToPricing = () => {
    const el = document.querySelector("#pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const serviceLinks = [
    t.services.s1Title,
    t.services.s8Title,
    t.services.s2Title,
    t.services.s3Title,
    t.badge.title,
  ];

  const companyLinks = [
    t.footer.company,
    "Blog",
    t.footer.services,
    "Partnership",
    "Press",
  ];

  const legalLinks = [
    t.footer.terms,
    t.footer.privacy,
    t.footer.legal,
    t.footer.disclaimer,
  ];

  return (
    <>
      {/* 최종 CTA 섹션 */}
      <section className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A961]/8 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
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

      {/* Footer */}
      <footer className="bg-[#0f1e36] text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* 브랜드 */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A961] to-[#a88840] flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-serif">S</span>
                </div>
                <span className="text-white font-bold text-xl">EverWill</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                {t.footer.tagline}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A961]" />
                  <span>Seoul, Korea</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A961]" />
                  <span>hello@saram.io</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C9A961]" />
                  <span>1588-0000</span>
                </div>
              </div>
            </div>

            {/* 서비스 */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">{t.footer.services}</h4>
              <ul className="space-y-2 text-sm">
                {serviceLinks.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => toast.info("준비 중입니다")}
                      className="hover:text-[#C9A961] transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 회사 */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">{t.footer.company2}</h4>
              <ul className="space-y-2 text-sm">
                {companyLinks.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => toast.info("준비 중입니다")}
                      className="hover:text-[#C9A961] transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 법적 */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                {legalLinks.map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => toast.info("준비 중입니다")}
                      className="hover:text-[#C9A961] transition-colors text-left"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 골드 구분선 */}
          <div className="gold-line mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-white/40">
              {t.footer.copyright}
            </div>
            <div className="flex items-center gap-4 text-white/40">
              <span>{t.global.langSupport}</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-white/25 leading-relaxed">
            {t.footer.legalNote}
          </div>
        </div>
      </footer>
    </>
  );
}
