/**
 * EverWill 서비스 섹션
 * - 영상 유언장 + 자필 유언 스캔 → 하나의 박스로 통합
 * - 나의 자서전 만들기 박스 추가
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText, Video, Shield, Users,
  Bell, Globe, BookOpen, Mail,
  RefreshCw, Scale, Scroll, Mic
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

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
  "bg-indigo-50 text-indigo-600",
  "bg-pink-50 text-pink-600",
];

const cardBg = [
  "bg-blue-50",
  "bg-purple-50",
  "bg-amber-50",
  "bg-green-50",
  "bg-teal-50",
  "bg-rose-50",
  "bg-cyan-50",
  "bg-indigo-50",
  "bg-pink-50",
];

const tagColors = [
  "text-blue-700 bg-blue-100",
  "text-purple-700 bg-purple-100",
  "text-amber-700 bg-amber-100",
  "text-green-700 bg-green-100",
  "text-teal-700 bg-teal-100",
  "text-rose-700 bg-rose-100",
  "text-cyan-700 bg-cyan-100",
  "text-indigo-700 bg-indigo-100",
  "text-pink-700 bg-pink-100",
];

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { t } = useLanguage();

  // 첫 번째 행 (5개)
  const row1Services = [
    { title: t.services.s1Title, description: t.services.s1Desc, tag: t.services.s1Tag, icon: FileText },
    { title: t.services.s4Title, description: t.services.s4Desc, tag: t.services.s4Tag, icon: Shield },
    { title: t.services.s5Title, description: t.services.s5Desc, tag: t.services.s5Tag, icon: Users },
    { title: t.services.s6Title, description: t.services.s6Desc, tag: t.services.s6Tag, icon: RefreshCw },
    { title: t.services.s7Title, description: t.services.s7Desc, tag: t.services.s7Tag, icon: Globe },
  ];

  // 두 번째 행 (4개)
  const row2Services = [
    { title: t.services.s8Title, description: t.services.s8Desc, tag: t.services.s8Tag, icon: Bell },
    { title: t.services.s9Title, description: t.services.s9Desc, tag: t.services.s9Tag, icon: Globe },
    {
      title: t.lifeStory.s10Title,
      description: t.lifeStory.s10Desc,
      tag: t.lifeStory.s10Tag,
      icon: BookOpen,
      isPremium: true,
      href: "/life-story",
    },
    {
      title: t.lifeStory.s11Title,
      description: t.lifeStory.s11Desc,
      tag: t.lifeStory.s11Tag,
      icon: Mail,
      isPremium: true,
      href: "/life-story",
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

        {/* ── 첫 번째 행: 5개 카드 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-3">
          {row1Services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className={`${cardBg[i]} rounded-2xl p-4 border border-white/60 hover:shadow-xl transition-all card-hover group cursor-default flex flex-col relative overflow-hidden`}
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
              </motion.div>
            );
          })}
        </div>

        {/* ── 두 번째 행: 4개 카드 ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {row2Services.map((service, j) => {
            const i = j + 5;
            const Icon = service.icon;
            const isPremium = (service as any).isPremium;
            const href = (service as any).href;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
                className={`${cardBg[i]} rounded-2xl p-4 border ${
                  isPremium ? 'border-[#C9A961]/60 ring-1 ring-[#C9A961]/30' : 'border-white/60'
                } hover:shadow-xl transition-all card-hover group ${
                  isPremium ? 'cursor-pointer' : 'cursor-default'
                } flex flex-col relative overflow-hidden`}
                onClick={() => isPremium && href && (window.location.href = href)}
              >
                {isPremium && (
                  <span className="absolute top-2 right-2 text-[9px] bg-[#C9A961] text-[#1F3864] font-bold px-1.5 py-0.5 rounded-full">PRO</span>
                )}
                <div className={`w-12 h-12 rounded-xl ${serviceColors[i]} flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="mb-1.5">
                  <span className={`text-xs font-bold ${
                    isPremium ? 'text-[#C9A961] bg-[#C9A961]/10' : tagColors[i]
                  } px-2.5 py-0.5 rounded-full`}>
                    {service.tag}
                  </span>
                </div>
                <h3 className="font-extrabold text-[#1F3864] text-lg mb-2 leading-tight">{service.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── 세 번째 행: 영상+자필 통합 박스 + 자서전 박스 ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* 영상 유언장 + 자필 유언 스캔 통합 박스 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="bg-orange-50 rounded-2xl p-5 border border-white/60 hover:shadow-xl transition-all card-hover group cursor-default flex flex-col"
          >
            {/* 헤더 */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">영상 + 자필 인증</span>
                </div>
                <h3 className="font-extrabold text-[#1F3864] text-lg leading-tight">영상 유언장 + 자필 유언 스캔 인증</h3>
                <p className="text-gray-700 text-sm leading-relaxed mt-1">
                  법적 녹음 유언 + 가족 감성 메시지 영상 녹화, 그리고 자필 유언 사진 업로드 → AI 형식 검증 → 분산 암호화 무결성 기록까지 한 번에.
                </p>
              </div>
            </div>

            {/* 두 서비스 상세 카드 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* 영상 유언장 */}
              <div className="bg-white/60 rounded-xl p-3 border border-orange-100">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-orange-600">영상 유언장</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• AI 낭독 스크립트 자동 생성</li>
                  <li>• 녹화 중 실시간 가이드</li>
                  <li>• 가족별 개별 메시지 설정</li>
                  <li>• 공개 타이밍 설정 (성인식·결혼식)</li>
                  <li>• 블록체인 해시 기록</li>
                </ul>
                <div className="mt-2 text-[10px] text-orange-500 font-medium">+₩29,000</div>
              </div>

              {/* 자필 유언 스캔 */}
              <div className="bg-white/60 rounded-xl p-3 border border-amber-100">
                <div className="flex items-center gap-2 mb-2">
                  <Scroll className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-600">자필 유언 스캔</span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 자필 유언 사진 업로드</li>
                  <li>• AI 자동 형식 검증</li>
                  <li>• 날짜·서명·날인 5요건 체크</li>
                  <li>• 위조 탐지 알고리즘</li>
                  <li>• 분산 암호화 무결성 기록</li>
                </ul>
                <div className="mt-2 text-[10px] text-amber-500 font-medium">+₩19,000</div>
              </div>
            </div>

            {/* 추가 인증 서비스 안내 */}
            <div className="rounded-xl border-2 p-4 flex items-start gap-2.5 bg-orange-50 border-orange-100 text-orange-700">
              <Scale className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-80" />
              <div>
                <p className="text-sm font-bold mb-1 leading-tight">추가 인증 서비스</p>
                <p className="text-sm leading-relaxed opacity-90">
                  기본 가입만으로도 전자 인증 유언장이 완성됩니다. 영상 유언 + 자필 스캔은 이를 더욱 확고히 하는 선택적 추가 인증입니다.
                </p>
                <p className="text-xs mt-1.5 leading-relaxed text-orange-500">
                  민법 제1067조(녹음 유언) · 제1066조(자필증서 유언) 기준 — AI 자동 검증으로 인증 신뢰도 강화
                </p>
              </div>
            </div>
          </motion.div>

          {/* 나의 자서전 만들기 박스 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-[#C9A961]/40 ring-1 ring-[#C9A961]/20 hover:shadow-xl transition-all card-hover group cursor-pointer flex flex-col relative overflow-hidden"
            onClick={() => window.location.href = "/life-story"}
          >
            {/* PRO 배지 */}
            <span className="absolute top-3 right-3 text-[10px] bg-[#C9A961] text-[#1F3864] font-bold px-2 py-0.5 rounded-full">PRO</span>

            {/* 헤더 */}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">Life Story PRO</span>
                </div>
                <h3 className="font-extrabold text-[#1F3864] text-lg leading-tight">나의 자서전 만들기</h3>
                <p className="text-gray-700 text-sm leading-relaxed mt-1">
                  AI와 대화하며 나만의 인생 이야기를 책으로 만들어 보세요. 음성으로 말씀하시면 AI가 아름다운 자서전을 써드립니다.
                </p>
              </div>
            </div>

            {/* 6챕터 구성 */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { emoji: "👶", title: "어린 시절", desc: "태어난 곳, 가족, 추억" },
                { emoji: "🎓", title: "청년 시절", desc: "학창 시절, 꿈, 도전" },
                { emoji: "💑", title: "사랑과 결혼", desc: "만남, 결혼, 가정" },
                { emoji: "💼", title: "직업과 성취", desc: "일, 성공, 보람" },
                { emoji: "👨‍👩‍👧‍👦", title: "가족과 삶", desc: "자녀, 손자녀, 행복" },
                { emoji: "🌅", title: "지혜와 유언", desc: "인생 교훈, 마지막 말" },
              ].map((chapter, idx) => (
                <div key={idx} className="bg-white/70 rounded-xl p-2.5 border border-indigo-100 text-center">
                  <div className="text-xl mb-1">{chapter.emoji}</div>
                  <div className="text-xs font-bold text-[#1F3864] leading-tight">{chapter.title}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{chapter.desc}</div>
                </div>
              ))}
            </div>

            {/* 핵심 기능 */}
            <div className="bg-white/60 rounded-xl p-3 border border-indigo-100 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700">음성으로 말하면 AI가 글로 변환</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎨</span>
                  <span className="text-xs text-gray-700">내 사진 → AI 수채화 그림 삽입</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">📖</span>
                  <span className="text-xs text-gray-700">6챕터 완성 후 PDF 출력</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">👨‍👩‍👧</span>
                  <span className="text-xs text-gray-700">가족 공유 링크 발송</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-auto">
              <Link href="/life-story">
                <button
                  className="w-full py-3 bg-[#1F3864] text-white font-bold text-sm rounded-xl hover:bg-[#2a4d8a] transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BookOpen className="w-4 h-4" />
                  자서전 시작하기 →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
