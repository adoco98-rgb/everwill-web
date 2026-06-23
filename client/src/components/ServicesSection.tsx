/**
 * EverWill 서비스 섹션 - 리디자인
 * - 깔끔한 3열 그리드 레이아웃
 * - 법률 전문 AI 카드 추가
 * - 핵심 기능 9개를 명확하게 분류
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText, Video, Shield, Users,
  Bell, Globe, BookOpen, Mail,
  RefreshCw, Scale, Scroll, Mic,
  MessageCircle, Sparkles
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  // 핵심 기능 카드 (3열 × 3행 = 9개)
  const coreFeatures = [
    {
      icon: FileText,
      tag: t.services.s1Tag,
      title: t.services.s1Title,
      desc: t.services.s1Desc,
      color: "bg-blue-50 text-blue-600",
      tagColor: "text-blue-700 bg-blue-100",
      cardBg: "bg-blue-50",
    },
    {
      icon: Shield,
      tag: t.services.s4Tag,
      title: t.services.s4Title,
      desc: t.services.s4Desc,
      color: "bg-purple-50 text-purple-600",
      tagColor: "text-purple-700 bg-purple-100",
      cardBg: "bg-purple-50",
    },
    {
      icon: Users,
      tag: t.services.s5Tag,
      title: t.services.s5Title,
      desc: t.services.s5Desc,
      color: "bg-amber-50 text-amber-600",
      tagColor: "text-amber-700 bg-amber-100",
      cardBg: "bg-amber-50",
    },
    {
      icon: RefreshCw,
      tag: t.services.s6Tag,
      title: t.services.s6Title,
      desc: t.services.s6Desc,
      color: "bg-green-50 text-green-600",
      tagColor: "text-green-700 bg-green-100",
      cardBg: "bg-green-50",
    },
    {
      icon: Globe,
      tag: t.services.s7Tag,
      title: t.services.s7Title,
      desc: t.services.s7Desc,
      color: "bg-teal-50 text-teal-600",
      tagColor: "text-teal-700 bg-teal-100",
      cardBg: "bg-teal-50",
    },
    {
      icon: Bell,
      tag: t.services.s8Tag,
      title: t.services.s8Title,
      desc: t.services.s8Desc,
      color: "bg-rose-50 text-rose-600",
      tagColor: "text-rose-700 bg-rose-100",
      cardBg: "bg-rose-50",
    },
    {
      icon: Globe,
      tag: t.services.s9Tag,
      title: t.services.s9Title,
      desc: t.services.s9Desc,
      color: "bg-cyan-50 text-cyan-600",
      tagColor: "text-cyan-700 bg-cyan-100",
      cardBg: "bg-cyan-50",
    },
    {
      icon: BookOpen,
      tag: t.lifeStory.s10Tag,
      title: t.lifeStory.s10Title,
      desc: t.lifeStory.s10Desc,
      color: "bg-indigo-50 text-indigo-600",
      tagColor: "text-[#C9A961] bg-[#C9A961]/10",
      cardBg: "bg-indigo-50",
      isPremium: true,
      href: "/life-story",
    },
    {
      icon: Mail,
      tag: t.lifeStory.s11Tag,
      title: t.lifeStory.s11Title,
      desc: t.lifeStory.s11Desc,
      color: "bg-pink-50 text-pink-600",
      tagColor: "text-[#C9A961] bg-[#C9A961]/10",
      cardBg: "bg-pink-50",
      isPremium: true,
      href: "/life-story",
    },
  ];

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#FAFAF8]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 섹션 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-5xl font-bold text-[#1F3864] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            {t.services.title}
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {t.services.subtitle}
          </p>
        </motion.div>

        {/* ── 법률 전문 AI 강조 배너 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-[#1F3864] to-[#2a4d8a] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-5 shadow-lg"
        >
          <div className="w-14 h-14 bg-[#C9A961]/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Scale className="w-7 h-7 text-[#C9A961]" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <Sparkles className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-xs font-bold uppercase tracking-wider">{t.services.legalBannerTag}</span>
            </div>
            <h3 className="text-white font-bold text-xl mb-1">{t.services.legalBannerTitle}</h3>
            <p className="text-white/60 text-sm">
              {t.services.legalBannerDesc}
            </p>
          </div>
          <Link href="/register">
            <button className="flex-shrink-0 flex items-center gap-2 bg-[#C9A961] hover:bg-[#b8944f] text-[#1F3864] font-bold text-sm px-5 py-3 rounded-xl transition-all whitespace-nowrap shadow-md">
              <MessageCircle className="w-4 h-4" />
              {t.services.legalBannerCta}
            </button>
          </Link>
        </motion.div>

        {/* ── 핵심 기능 3열 그리드 ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {coreFeatures.map((feature, i) => {
            const Icon = feature.icon;
            const card = (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.06 }}
                className={`${feature.cardBg} rounded-2xl p-5 border ${
                  feature.isPremium ? 'border-[#C9A961]/40 ring-1 ring-[#C9A961]/20' : 'border-white/60'
                } hover:shadow-lg transition-all group relative overflow-hidden ${feature.isPremium ? 'cursor-pointer' : ''}`}
              >
                {feature.isPremium && (
                  <span className="absolute top-3 right-3 text-[10px] bg-[#C9A961] text-[#1F3864] font-bold px-2 py-0.5 rounded-full">PRO</span>
                )}
                <div className={`w-11 h-11 rounded-xl ${feature.color} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="mb-2">
                  <span className={`text-xs font-bold ${feature.tagColor} px-2.5 py-0.5 rounded-full`}>
                    {feature.tag}
                  </span>
                </div>
                <h3 className="font-bold text-[#1F3864] text-base mb-1.5 leading-snug">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
            return feature.href ? (
              <Link key={i} href={feature.href}>{card}</Link>
            ) : (
              card
            );
          })}
        </div>

        {/* ── 영상 유언장 + 자필 유언 스캔 통합 카드 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="bg-orange-50 rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-all"
        >
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                {t.services.videoHandwrittenBadge}
              </span>
              <h3 className="font-bold text-[#1F3864] text-lg mt-1 leading-tight">
                {t.services.videoHandwrittenTitle}
              </h3>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-5 leading-relaxed">{t.services.videoHandwrittenDesc}</p>

          {/* 두 서비스 상세 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white/70 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center gap-2 mb-3">
                <Video className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold text-orange-600">{t.services.videoWillSubTitle}</span>
                <span className="ml-auto text-xs font-bold text-orange-500">{t.services.videoWillPrice}</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">•</span>{t.services.videoWillDetail1}</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">•</span>{t.services.videoWillDetail2}</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">•</span>{t.services.videoWillDetail3}</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">•</span>{t.services.videoWillDetail4}</li>
                <li className="flex items-start gap-1.5"><span className="text-orange-400 mt-0.5">•</span>{t.services.videoWillDetail5}</li>
              </ul>
            </div>

            <div className="bg-white/70 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3">
                <Scroll className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-bold text-amber-600">{t.services.handwrittenSubTitle}</span>
                <span className="ml-auto text-xs font-bold text-amber-500">{t.services.handwrittenPrice}</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-1.5"><span className="text-amber-400 mt-0.5">•</span>{t.services.handwrittenDetail1}</li>
                <li className="flex items-start gap-1.5"><span className="text-amber-400 mt-0.5">•</span>{t.services.handwrittenDetail2}</li>
                <li className="flex items-start gap-1.5"><span className="text-amber-400 mt-0.5">•</span>{t.services.handwrittenDetail3}</li>
                <li className="flex items-start gap-1.5"><span className="text-amber-400 mt-0.5">•</span>{t.services.handwrittenDetail4}</li>
                <li className="flex items-start gap-1.5"><span className="text-amber-400 mt-0.5">•</span>{t.services.handwrittenDetail5}</li>
              </ul>
            </div>
          </div>

          {/* 추가 인증 안내 */}
          <div className="flex items-start gap-3 bg-orange-100/60 rounded-xl p-4 border border-orange-200">
            <Scale className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-orange-700 mb-0.5">{t.services.additionalAuthTitle}</p>
              <p className="text-sm text-orange-700/80 leading-relaxed">{t.services.additionalAuthDesc}</p>
              <p className="text-xs text-orange-500 mt-1">{t.services.additionalAuthLegal}</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
