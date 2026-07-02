/**
 * EverWill CTA 섹션 + Footer
 * 마지막 전환 유도 + 사이트맵
 */

import { Mail, Phone, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";

export default function Footer() {
  const { t, language } = useLanguage();
  const isKorean = language === "ko";

  // DB에서 Footer 회사 정보 조회
  const { data: footerInfo } = trpc.siteSettings.getFooterInfo.useQuery(undefined, {
    staleTime: 60_000,
  });
  const fi = footerInfo ?? {
    footer_email: "adoco98@gmail.com",
    footer_email_visible: "true",
    footer_biz_number: "621-81-61690",
    footer_biz_number_visible: "true",
    footer_phone: "070-4735-0834",
    footer_phone_visible: "true",
    footer_address: "",
    footer_address_visible: "false",
    footer_company_name: "주식회사 사람",
    footer_company_name_visible: "true",
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
      {/* Footer */}
      <footer className="bg-[#0f1e36] text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* 브랜드 - 모바일에서 전체 너비 */}
            <div className="col-span-1 sm:col-span-2">
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
                {/* 이메일 */}
                {fi.footer_email_visible === "true" && fi.footer_email && (
                  <a
                    href={`mailto:${fi.footer_email}`}
                    className="flex items-center gap-2 hover:text-[#C9A961] transition-colors group"
                  >
                    <Mail className="w-4 h-4 text-[#C9A961] shrink-0" />
                    <span className="group-hover:text-[#C9A961]">{fi.footer_email}</span>
                  </a>
                )}
                {/* 전화번호 */}
                {fi.footer_phone_visible === "true" && fi.footer_phone && (
                  <a
                    href={`tel:${fi.footer_phone.replace(/-/g, "")}`}
                    className="flex items-center gap-2 hover:text-[#C9A961] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[#C9A961] shrink-0" />
                    <span>{fi.footer_phone}</span>
                  </a>
                )}
                {/* 사업자번호 (한국어 페이지만) */}
                {isKorean && fi.footer_biz_number_visible === "true" && fi.footer_biz_number && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C9A961] shrink-0" />
                    <span>사업자 {fi.footer_biz_number}</span>
                  </div>
                )}
                {/* 주소 */}
                {fi.footer_address_visible === "true" && fi.footer_address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#C9A961] shrink-0 mt-0.5" />
                    <span>{fi.footer_address}</span>
                  </div>
                )}
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
