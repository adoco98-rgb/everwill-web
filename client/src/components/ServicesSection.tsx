/**
 * EverWill 서비스 섹션
 * 10가지 핵심 서비스/기능 소개
 * 카드 그리드 레이아웃 + 호버 애니메이션
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText, Video, Scan, Shield, Users,
  Bell, Globe, Smartphone, RefreshCw, Scale
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const WILL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/will-writing-mZuJR6sUxzn2zqDJYs74Qu.webp";
const FAMILY_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/family-legacy-8PohtuBkGJRQqwDgcvoFxd.webp";

const serviceColors = [
  "bg-blue-50 text-blue-600",
  "bg-purple-50 text-purple-600",
  "bg-amber-50 text-amber-600",
  "bg-green-50 text-green-600",
  "bg-teal-50 text-teal-600",
  "bg-rose-50 text-rose-600",
  "bg-cyan-50 text-cyan-600",
  "bg-orange-50 text-orange-600",
  "bg-lime-50 text-lime-600",
];

const serviceIcons = [FileText, Video, Scan, Shield, Users, Bell, Globe, Smartphone, RefreshCw];

const cardBg = [
  "bg-blue-50",
  "bg-purple-50",
  "bg-amber-50",
  "bg-green-50",
  "bg-teal-50",
  "bg-rose-50",
  "bg-cyan-50",
  "bg-orange-50",
  "bg-lime-50",
];

const tagColors = [
  "text-blue-700 bg-blue-100",
  "text-purple-700 bg-purple-100",
  "text-amber-700 bg-amber-100",
  "text-green-700 bg-green-100",
  "text-teal-700 bg-teal-100",
  "text-rose-700 bg-rose-100",
  "text-cyan-700 bg-cyan-100",
  "text-orange-700 bg-orange-100",
  "text-lime-700 bg-lime-100",
];

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  const services = [
    // s1: AI 체크박스 유언 작성
    { title: t.services.s1Title, description: t.services.s1Desc, tag: t.services.s1Tag },
    // s4: 다중 안심 확인 서비스
    { title: t.services.s4Title, description: t.services.s4Desc, tag: t.services.s4Tag },
    // s5: 상속자 직접 등록
    { title: t.services.s5Title, description: t.services.s5Desc, tag: t.services.s5Tag },
    // s6: 생애 이벤트 재인증
    { title: t.services.s6Title, description: t.services.s6Desc, tag: t.services.s6Tag },
    // s7: 글로벌 멀티관할권
    { title: t.services.s7Title, description: t.services.s7Desc, tag: t.services.s7Tag },
    // s8: eKYC 전자 인증
    { title: t.services.s8Title, description: t.services.s8Desc, tag: t.services.s8Tag },
    // s9: 11개 언어 + RTL 지원
    { title: t.services.s9Title, description: t.services.s9Desc, tag: t.services.s9Tag },
    // s2: 영상 유언장 (추가인증 박스 있음 → 맨 오른쪽)
    {
      title: t.services.s2Title,
      description: t.services.s2Desc,
      tag: t.services.s2Tag,
      additionalAuth: t.services.s2AdditionalAuth,
      legalNote: t.services.s2LegalNote,
      legalBase: t.services.s2LegalBase,
      legalColor: "bg-purple-50 border-purple-100 text-purple-700",
      legalBaseColor: "text-purple-500",
    },
    // s3: 자필 유언 스캔 인증 (추가인증 박스 있음 → 맨 오른쪽)
    {
      title: t.services.s3Title,
      description: t.services.s3Desc,
      tag: t.services.s3Tag,
      additionalAuth: t.services.s3AdditionalAuth,
      legalNote: t.services.s3LegalNote,
      legalBase: t.services.s3LegalBase,
      legalColor: "bg-amber-50 border-amber-100 text-amber-700",
      legalBaseColor: "text-amber-500",
    },
  ];

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#FAFAF8]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.services.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </motion.div>

        {/* 피처 하이라이트 - 이미지 + 텍스트 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden group"
          >
            <img
              src={WILL_IMAGE}
              alt="유언장 작성 과정"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/80 to-transparent flex items-end p-6">
              <div>
                <span className="inline-block bg-[#C9A961] text-[#1F3864] text-xs font-bold px-3 py-1 rounded-full mb-2">
                  {t.trust.card1Tag}
                </span>
                <h3 className="text-white text-xl font-bold">{t.trust.card1Title}</h3>
                <p className="text-white/70 text-sm mt-1">{t.trust.card1Desc}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden group"
          >
            <img
              src={FAMILY_IMAGE}
              alt="가족에게 전달되는 유산"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/80 to-transparent flex items-end p-6">
              <div>
                <span className="inline-block bg-[#C9A961] text-[#1F3864] text-xs font-bold px-3 py-1 rounded-full mb-2">
                  {t.trust.card2Tag}
                </span>
                <h3 className="text-white text-xl font-bold">{t.trust.card2Title}</h3>
                <p className="text-white/70 text-sm mt-1">{t.trust.card2Desc}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 서비스 카드 그리드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {services.map((service, i) => {
            const Icon = serviceIcons[i];
            const hasAdditionalAuth = !!(service as any).additionalAuth;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className={`${cardBg[i]} rounded-2xl p-4 border border-white/60 hover:shadow-xl transition-all card-hover group cursor-default flex flex-col ${hasAdditionalAuth ? "col-span-2 md:col-span-1" : ""}`}
              >
                <div className={`w-12 h-12 rounded-xl ${serviceColors[i]} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="mb-1.5">
                  <span className={`text-xs font-bold ${tagColors[i]} px-2.5 py-0.5 rounded-full`}>
                    {service.tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#1F3864] text-lg mb-2 leading-tight">{service.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{service.description}</p>

                {/* 추가 인증 설명 (영상유언장·자필유언장 카드만 표시) */}
                {hasAdditionalAuth && (
                  <div className={`mt-4 rounded-xl border-2 p-4 flex items-start gap-2.5 ${(service as any).legalColor}`}>
                    <Scale className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-80" />
                    <div>
                      <p className="text-sm font-bold mb-1 leading-tight">
                        {(service as any).additionalAuth}
                      </p>
                      <p className="text-sm leading-relaxed opacity-90">
                        {(service as any).legalNote}
                      </p>
                      {(service as any).legalBase && (
                        <p className={`text-xs mt-1.5 leading-relaxed ${(service as any).legalBaseColor}`}>
                          {(service as any).legalBase}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
