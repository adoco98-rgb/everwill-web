/**
 * 파트너센터 메인 랜딩 페이지
 * 전문가(변호사/세무사) + 헬퍼 파트너 프로그램 소개
 * 등급 체계, 수수료 구조, 가입 CTA
 */
import { motion } from "framer-motion";
import { ArrowRight, Scale, Users, TrendingUp, Award, Globe, Shield, DollarSign, Star, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 히어로 이미지
const PARTNER_HERO = "/manus-storage/partner-hero_5c76b639.jpg";

export default function PartnerPage() {
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();

  // 다국어 텍스트
  const texts = partnerTexts[language] || partnerTexts.ko;
  const seniorTexts = partnerSeniorCardTexts[language] || partnerSeniorCardTexts.ko;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />

      {/* Hero 섹션 */}
      <section className="relative w-full min-h-[70vh] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <img
            src={PARTNER_HERO}
            alt="전 세계 다양한 국적의 변호사·법무사들이 화이팅 포즈를 하는 모습"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F3864]/80 via-[#1F3864]/60 to-[#0f1e36]/90" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#C9A961]/20 border border-[#C9A961]/40 text-[#C9A961] rounded-full text-sm font-medium mb-6">
              {texts.heroBadge}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              {texts.heroTitle1}
              <br />
              <span className="text-[#C9A961]">{texts.heroTitle2}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10">
              {texts.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/partner/professional")}
                className="px-8 py-4 bg-[#C9A961] hover:bg-[#b8953a] text-[#1F3864] font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Scale className="w-5 h-5" />
                {texts.ctaProfessional}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("/partner/helper")}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                {texts.ctaHelper}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2그룹 소개 섹션 */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {texts.groupTitle}
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              {texts.groupSubtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 전문가 그룹 카드 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[#1F3864]/10 hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-[#1F3864]/10 rounded-xl flex items-center justify-center mb-6">
                <Scale className="w-7 h-7 text-[#1F3864]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">{texts.proGroupName}</h3>
              <p className="text-[#6B7280] mb-6">{texts.proGroupDesc}</p>
              <ul className="space-y-3 mb-8">
                {texts.proGroupFeatures.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-[#C9A961] mt-0.5 shrink-0" />
                    <span className="text-[#1A1A1A]">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-end border-t pt-6">
                <button
                  onClick={() => navigate("/partner/professional")}
                  className="px-6 py-3 bg-[#1F3864] hover:bg-[#162b50] text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  {texts.applyBtn}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* 헬퍼 그룹 카드 */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[#C9A961]/20 hover:shadow-xl transition-all"
            >
              <div className="w-14 h-14 bg-[#C9A961]/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-[#C9A961]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">{texts.helperGroupName}</h3>
              <p className="text-[#6B7280] mb-6">{texts.helperGroupDesc}</p>
              <ul className="space-y-3 mb-8">
                {texts.helperGroupFeatures.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Star className="w-5 h-5 text-[#C9A961] mt-0.5 shrink-0" />
                    <span className="text-[#1A1A1A]">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-end border-t pt-6">
                <button
                  onClick={() => navigate("/partner/helper")}
                  className="px-6 py-3 bg-[#C9A961] hover:bg-[#b8953a] text-[#1F3864] font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  {texts.applyBtn}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* 시니어 그룹 카드 (NEW) */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[#2D5016]/20 hover:shadow-xl transition-all relative overflow-hidden"
            >
              {/* NEW 배지 */}
              <div className="absolute top-4 right-4 bg-[#2D5016] text-white text-xs font-bold px-2.5 py-1 rounded-full">NEW</div>
              <div className="w-14 h-14 bg-[#2D5016]/10 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-[#2D5016]" />
              </div>
              <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">{seniorTexts.groupName}</h3>
              <p className="text-[#6B7280] mb-6">{seniorTexts.groupDesc}</p>
              <ul className="space-y-3 mb-8">
                {seniorTexts.groupFeatures.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <Heart className="w-5 h-5 text-[#2D5016] mt-0.5 shrink-0" />
                    <span className="text-[#1A1A1A]">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-end border-t pt-6">
                <button
                  onClick={() => navigate("/partner/senior")}
                  className="px-6 py-3 bg-[#2D5016] hover:bg-[#3a6b1e] text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  {texts.applyBtn}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 비전·사업성 섹션 (등급/수익 구조는 승인 후 대시보드에서 공개) */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {texts.visionTitle}
            </h2>
            <p className="text-lg text-[#6B7280] max-w-3xl mx-auto">
              {texts.visionSubtitle}
            </p>
          </motion.div>

          {/* 시장 기회 숫자 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {texts.visionStats.map((stat: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-[#1F3864]/5 rounded-2xl border border-[#1F3864]/10"
              >
                <p className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-2">{stat.value}</p>
                <p className="text-sm text-[#6B7280] font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* 핵심 비전 카드 3개 */}
          <div className="grid md:grid-cols-3 gap-8">
            {texts.visionCards.map((card: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gradient-to-br from-[#1F3864] to-[#162b50] rounded-2xl p-8 text-white"
              >
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                <p className="text-white/80 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* 승인 후 공개 안내 배너 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center gap-4"
          >
            <span className="text-3xl">🔒</span>
            <div>
              <p className="font-bold text-[#1F3864] text-lg">{texts.visionLockTitle}</p>
              <p className="text-[#6B7280] text-sm mt-1">{texts.visionLockDesc}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 탑 리더 배지 섹션 */}
      <section className="py-20 px-6 bg-gradient-to-br from-[#1A1A1A] to-[#2D2D2D]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-5 py-2 mb-6">
              <Star className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-semibold">{texts.topLeaderBadge}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {texts.topLeaderTitle}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {texts.topLeaderSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {texts.topLeaderCards.map((card: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center hover:border-[#C9A961]/50 transition-colors"
              >
                <div className="text-5xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold text-[#C9A961] mb-3">{card.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 bg-[#C9A961]/10 border border-[#C9A961]/30 rounded-2xl p-8 text-center"
          >
            <Award className="w-12 h-12 text-[#C9A961] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">{texts.topLeaderHonorTitle}</h3>
            <p className="text-white/70 max-w-2xl mx-auto">{texts.topLeaderHonorDesc}</p>
          </motion.div>
        </div>
      </section>

      {/* 글로벌 지원 섹션 */}
      <section className="py-20 px-6 bg-[#1F3864]">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Globe className="w-16 h-16 text-[#C9A961] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {texts.globalTitle}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
              {texts.globalSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {texts.globalCountries.map((country: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm">
                  {country}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 명예의 전당 섹션 */}
      <section className="py-24 px-6 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/15 border border-[#C9A961]/30 rounded-full px-5 py-2 mb-6">
              <Award className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-semibold">
                {language === 'ko' ? '2025 연간 수상자' : language === 'ja' ? '2025年度受賞者' : language === 'zh' ? '2025年度获奖者' : '2025 Annual Award Winners'}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {language === 'ko' ? '명예의 전당' : language === 'ja' ? '名誉の殿堂・ホール・オブ・フェイム' : language === 'zh' ? '荣誉殿堂' : 'Hall of Fame'}
            </h2>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              {language === 'ko' ? '2025년 각 국가와 지역에서 가장 높은 기여도를 보인 파트너들입니다.' : language === 'ja' ? '2025年度に各国・地域で最💡高の貢献を示したパートナー。' : language === 'zh' ? '2025年度在各国和地区贡献最大的合作伙伴。' : 'Partners who showed the highest contribution in each country and region in 2025.'}
            </p>
          </motion.div>

          {/* 글로벌 탑 리더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="relative bg-gradient-to-br from-[#1F3864] to-[#0f1e36] rounded-3xl p-8 md:p-12 overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A961]/10 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A961]/5 rounded-full translate-y-24 -translate-x-24" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 text-center">
                  <div className="relative inline-block">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#C9A961] to-[#a07830] flex items-center justify-center text-5xl shadow-2xl">
                      👑
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-[#C9A961] rounded-full px-2 py-0.5 text-[#1F3864] text-xs font-bold shadow">
                      #1 GLOBAL
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-center gap-1 mb-1">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-[#C9A961] text-[#C9A961]" />)}
                    </div>
                    <span className="text-[#C9A961] text-xs font-semibold">Global Top Leader</span>
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                    <span className="px-3 py-1 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full text-[#C9A961] text-xs font-semibold">👑 2025 글로벌 탑 리더</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs">🇰🇷 한국</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs">변호사</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Kim Ji-hoon <span className="text-[#C9A961]">(김지훈)</span></h3>
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {language === 'ko'
                      ? 'EverWill을 통해 고객 847명의 유언 집행을 도왔습니다. 단순한 수수료가 아니라 진정한 의미 있는 일을 한다는 보람이 있습니다.'
                      : 'Through EverWill, I helped 847 clients execute their wills. Truly meaningful work.'}
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-[#C9A961]">847</div>
                      <div className="text-white/60 text-xs mt-1">{language === 'ko' ? '유언 집행' : 'Wills Executed'}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-[#C9A961]">₩184M</div>
                      <div className="text-white/60 text-xs mt-1">{language === 'ko' ? '연간 수입' : 'Annual Revenue'}</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-[#C9A961]">4.98</div>
                      <div className="text-white/60 text-xs mt-1">{language === 'ko' ? '고객 평점' : 'Client Rating'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 국가별 탑 리더 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { flag: "🇺🇸", country: language === 'ko' ? '미국' : 'USA', name: "Sarah Mitchell", title: language === 'ko' ? '미국 탑 리더' : 'USA Top Leader', role: language === 'ko' ? '유언 전문 변호사' : 'Estate Attorney', badge: "🏆", stats: { a: "612", b: "$142K", c: "4.97" }, quote: language === 'ko' ? '"EverWill로 매달 새로운 고객을 만납니다."' : '"I meet new clients every month through EverWill."', color: "from-blue-900 to-blue-800" },
              { flag: "🇯🇵", country: language === 'ko' ? '일본' : 'Japan', name: "Tanaka Hiroshi", title: language === 'ko' ? '일본 탑 리더' : 'Japan Top Leader', role: language === 'ko' ? '사법서사' : 'Judicial Scrivener', badge: "🏆", stats: { a: "534", b: "¥18.2M", c: "4.96" }, quote: language === 'ko' ? '"2025년 일본 유언 시장의 선두주자로 서있습니다."' : '"Standing at the forefront of Japan\'s 2025 will market."', color: "from-red-900 to-red-800" },
              { flag: "🇨🇳", country: language === 'ko' ? '중국' : 'China', name: "Li Wei (리 웨이)", title: language === 'ko' ? '중국 탑 리더' : 'China Top Leader', role: language === 'ko' ? '법률 컴설턴트' : 'Legal Consultant', badge: "🏆", stats: { a: "489", b: "¥1.1M", c: "4.95" }, quote: language === 'ko' ? '"EverWill은 중국 상속 시장의 게임체인저입니다."' : '"EverWill is a game-changer for China\'s inheritance market."', color: "from-yellow-900 to-yellow-800" },
              { flag: "🇩🇪", country: language === 'ko' ? '독일' : 'Germany', name: "Klaus Weber", title: language === 'ko' ? '독일 탑 리더' : 'Germany Top Leader', role: language === 'ko' ? '노타리우스' : 'Notary', badge: "🏆", stats: { a: "401", b: "€98K", c: "4.94" }, quote: language === 'ko' ? '"독일 고객들에게 신뢰할 수 있는 유언 서비스를 제공합니다."' : '"Providing trustworthy will services to German clients."', color: "from-gray-800 to-gray-700" },
              { flag: "🇦🇺", country: language === 'ko' ? '호주' : 'Australia', name: "Emma Thompson", title: language === 'ko' ? '호주 탑 리더' : 'Australia Top Leader', role: language === 'ko' ? '유언 전문 변호사' : 'Wills & Estates Lawyer', badge: "🏆", stats: { a: "378", b: "A$128K", c: "4.96" }, quote: language === 'ko' ? '"EverWill로 호주 전역 고객들을 돕고 있습니다."' : '"Helping clients across all of Australia with EverWill."', color: "from-green-900 to-green-800" },
              { flag: "🇸🇦", country: language === 'ko' ? '사우디' : 'Saudi Arabia', name: "Ahmed Al-Rashid", title: language === 'ko' ? '사우디 탑 리더' : 'Saudi Top Leader', role: language === 'ko' ? '이슬람 법률 전문가' : 'Islamic Law Specialist', badge: "🏆", stats: { a: "356", b: "$118K", c: "4.93" }, quote: language === 'ko' ? '"샤리아법 기반 상속 서비스를 제공합니다."' : '"Providing Sharia-based inheritance services."', color: "from-emerald-900 to-emerald-800" },
            ].map((leader, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`bg-gradient-to-br ${leader.color} rounded-2xl p-6 border border-white/10 hover:border-[#C9A961]/40 transition-all`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                      {leader.flag}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{leader.name}</div>
                      <div className="text-white/60 text-xs">{leader.role}</div>
                    </div>
                  </div>
                  <div className="text-2xl">{leader.badge}</div>
                </div>
                <div className="mb-4">
                  <span className="px-2 py-1 bg-[#C9A961]/20 border border-[#C9A961]/30 rounded-full text-[#C9A961] text-xs font-semibold">
                    {leader.title}
                  </span>
                </div>
                <p className="text-white/70 text-sm italic mb-4 leading-relaxed">{leader.quote}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="text-[#C9A961] font-bold text-sm">{leader.stats.a}</div>
                    <div className="text-white/50 text-xs">{language === 'ko' ? '집행' : 'Cases'}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="text-[#C9A961] font-bold text-sm">{leader.stats.b}</div>
                    <div className="text-white/50 text-xs">{language === 'ko' ? '수입' : 'Revenue'}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="text-[#C9A961] font-bold text-sm">{leader.stats.c}</div>
                    <div className="text-white/50 text-xs">{language === 'ko' ? '평점' : 'Rating'}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 헬퍼 그룹 탑 리더 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#1F3864] to-[#2a4a7f] rounded-3xl p-8 border border-[#C9A961]/20"
          >
            <div className="text-center mb-8">
              <span className="px-4 py-1.5 bg-[#C9A961]/20 border border-[#C9A961]/40 text-[#C9A961] rounded-full text-sm font-semibold">
                {language === 'ko' ? '헬퍼 그룹 탑 리더' : 'Helper Group Top Leaders'}
              </span>
              <h3 className="text-2xl font-bold text-white mt-4 mb-2">
                {language === 'ko' ? '다양한 직종에서 말마를 이어가는 사람들' : 'People from Diverse Fields Carrying the Legacy'}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { emoji: "👩‍⚕️", name: language === 'ko' ? '박수연 간호사' : 'Park Suyeon, RN', country: "🇰🇷", badge: language === 'ko' ? '한국 헬퍼 탑' : 'KR Helper Top', cases: "312", rating: "4.99" },
                { emoji: "👨‍💼", name: language === 'ko' ? 'James Park 자영업자' : 'James Park, Self-Employed', country: "🇺🇸", badge: language === 'ko' ? '미국 헬퍼 탑' : 'US Helper Top', cases: "287", rating: "4.97" },
                { emoji: "👩‍🏫", name: language === 'ko' ? '스즈키 유카리' : 'Suzuki Yukari, SW', country: "🇯🇵", badge: language === 'ko' ? '일본 헬퍼 탑' : 'JP Helper Top', cases: "265", rating: "4.96" },
                { emoji: "🎥", name: language === 'ko' ? 'Chen Mei 유튜버' : 'Chen Mei, YouTuber', country: "🇨🇳", badge: language === 'ko' ? '중국 헬퍼 탑' : 'CN Helper Top', cases: "243", rating: "4.95" },
              ].map((h, i) => (
                <div key={i} className="bg-white/10 rounded-2xl p-5 text-center border border-white/10 hover:border-[#C9A961]/30 transition-all">
                  <div className="text-4xl mb-3">{h.emoji}</div>
                  <div className="text-lg mb-1">{h.country}</div>
                  <div className="text-white font-semibold text-sm mb-1">{h.name}</div>
                  <div className="px-2 py-0.5 bg-[#C9A961]/20 rounded-full text-[#C9A961] text-xs mb-3">{h.badge}</div>
                  <div className="flex justify-center gap-3 text-xs">
                    <span className="text-white/60">{h.cases} {language === 'ko' ? '코드' : 'codes'}</span>
                    <span className="text-[#C9A961]">★ {h.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 최종 CTA 섹션 */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-16 h-16 text-[#C9A961] mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {texts.ctaTitle}
            </h2>
            <p className="text-lg text-[#6B7280] mb-10">
              {texts.ctaSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/partner/professional")}
                className="px-8 py-4 bg-[#1F3864] hover:bg-[#162b50] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Scale className="w-5 h-5" />
                {texts.ctaProfessional}
              </button>
              <button
                onClick={() => navigate("/partner/helper")}
                className="px-8 py-4 bg-[#C9A961] hover:bg-[#b8953a] text-[#1F3864] font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                {texts.ctaHelper}
              </button>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <button
                onClick={() => navigate("/partner/policy")}
                className="px-5 py-2.5 border border-white/30 text-white/80 hover:text-white hover:border-white rounded-lg transition-all text-sm"
              >
                📋 {language === 'ko' ? '정책 안내' : language === 'ja' ? 'ポリシー' : language === 'zh' ? '政策指南' : 'Policy Guide'}
              </button>
              <button
                onClick={() => navigate("/partner/verification")}
                className="px-5 py-2.5 border border-white/30 text-white/80 hover:text-white hover:border-white rounded-lg transition-all text-sm"
              >
                🔐 {language === 'ko' ? '본인 인증' : language === 'ja' ? '本人確認' : language === 'zh' ? '身份验证' : 'Verification'}
              </button>
              <button
                onClick={() => navigate("/partner/dashboard")}
                className="px-5 py-2.5 border border-white/30 text-white/80 hover:text-white hover:border-white rounded-lg transition-all text-sm"
              >
                📊 {language === 'ko' ? '대시보드' : language === 'ja' ? 'ダッシュボード' : language === 'zh' ? '仪表板' : 'Dashboard'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// ─── 다국어 텍스트 ───────────────────────────────────────────────
const partnerTexts: Record<string, any> = {
  ko: {
    heroBadge: "EverWill 파트너 프로그램",
    heroTitle1: "함께 성장하는",
    heroTitle2: "글로벌 파트너 네트워크",
    heroSubtitle: "변호사·세무사·법무사 전문가 그룹과 헬퍼 그룹으로 나누어, 고객을 유치하고 관리하며 사망 시 자동 수임까지 연결되는 수익 파트너십",
    ctaProfessional: "전문가 가입",
    ctaHelper: "헬퍼 가입",
    groupTitle: "2가지 파트너 그룹",
    groupSubtitle: "전문 자격에 따라 최적의 파트너 유형을 선택하세요",
    proGroupName: "전문가 그룹",
    proGroupDesc: "변호사, 세무사, 법무사 등 법률·세무 전문가를 위한 프리미엄 파트너십",
    proGroupFeatures: [
      "고객 유치 시 커미션 지급",
      "전문가 소개 페이지 프로필 노출",
      "고객 사망 시 자동 수임 연결",
      "국가별·지역별 전문가 리스트 등재",
      "전용 대시보드로 고객 관리",
    ],
    helperGroupName: "헬퍼 그룹",
    helperGroupDesc: "보험설계사, 유튜버, 셀럽, 블로거 등 다양한 채널의 영업 파트너",
    helperGroupFeatures: [
      "추천 링크로 고객 유치 시 커미션 지급",
      "실적에 따라 등급 자동 승급",
      "마케팅 자료 및 배너 제공",
      "실시간 수익 대시보드",
      "글로벌 활동 가능 (11개 언어)",
    ],
    joinFeeLabel: "가입비 (1회)",
    applyBtn: "가입 신청",
    tierTitle: "실적 기반 등급 체계",
    tierSubtitle: "매출이 올라갈수록 커미션율과 혜택이 함께 올라갑니다",
    tierCol1: "등급",
    tierCol2: "승급 조건 (연매출)",
    tierCol3: "연간 유지비",
    tierCol4: "커미션율",
    tierCol5: "핵심 혜택",
    tiers: [
      { name: "Bronze", condition: "가입 시 기본", fee: "무료", commission: "15%", benefit: "기본 기능", color: "bg-amber-600" },
      { name: "Silver", condition: "500만원+", fee: "$99/년", commission: "20%", benefit: "우선 매칭", color: "bg-gray-400" },
      { name: "Gold", condition: "2,000만원+", fee: "$199/년", commission: "25%", benefit: "상위 노출", color: "bg-yellow-500" },
      { name: "Premium", condition: "5,000만원+", fee: "$299/년", commission: "30%", benefit: "독점 지역권", color: "bg-purple-600" },
    ],
    tierNote: "• 등급은 연매출 달성 시 자동 승급되며, 해당 등급은 최소 1년간 유지됩니다.  • 연간 유지비 미납 시 이전 등급으로 자동 하향 조정됩니다.  • Bronze 등급은 연간 유지비 없이 영구 유지됩니다.",
    revenueTitle: "파트너 수익 구조",
    revenueSubtitle: "3가지 수익원으로 안정적인 수입을 만드세요",
    revenueCards: [
      { title: "고객 유치 커미션", desc: "고객이 인증비·Badge 등을 결제할 때마다 등급별 커미션 지급", highlight: "최대 30%" },
      { title: "사후 집행 수임", desc: "전문가 그룹 한정. 관리 고객 사망 시 자동으로 수임 연결", highlight: "보수의 75~85%" },
      { title: "글로벌 활동", desc: "14개국 지원, 전 세계 어디서나 파트너 활동 가능 (추후 25개국 확장)", highlight: "14개국" },
    ],
    topLeaderBadge: "EverWill Top Leader Award",
    topLeaderTitle: "탑 리더 배지",
    topLeaderSubtitle: "매년 말, 각 국가와 지역에서 가장 높은 기여도를 보인 파트너를 선정하여 탑 리더 배지를 수여합니다.",
    topLeaderCards: [
      { icon: "🏆", title: "국가 탑 리더", desc: "각 진출 국가(14개국)에서 연간 최다 실적을 올린 파트너 1인에게 수여. 국가를 대표하는 업적 인증서" },
      { icon: "🏡", title: "지역 탑 리더", desc: "각 국가 내 주요 도시 및 지역에서 가장 높은 기여도를 보인 파트너에게 수여. 지역 독점 마케팅 권한" },
      { icon: "👑", title: "글로벌 탑 리더", desc: "전 세계 모든 국가를 통합한 연간 최다 실적자에게 수여. EverWill 공식 타이틀 + 특별 보너스" },
    ],
    topLeaderHonorTitle: "탑 리더 배지는 단순한 상이 아닙니다",
    topLeaderHonorDesc: "탑 리더로 선정되면 EverWill 공식 파트너 프로필에 배지가 표시되며, 신규 고객 유치 시 우선 노출 혜택과 함께 연간 커미션 보너스(+5%)가 적용됩니다. 또한 EverWill 연간 콘퍼런스에 초청되어 글로벌 네트워크를 확장할 수 있습니다.",
    globalTitle: "전 세계에서 활동하세요",
    globalSubtitle: "EverWill은 14개국에서 파트너를 모집합니다. 추후 25개국으로 확장할 예정입니다.",
    globalCountries: ["🇰🇷 한국", "🇺🇸 미국", "🇯🇵 일본", "🇨🇳 중국", "🇩🇪 독일", "🇪🇸 스페인", "🇸🇦 사우디", "🇫🇷 프랑스", "🇷🇺 러시아", "🇮🇳 인도", "🇧🇷 브라질", "🇳🇿 뉴질랜드", "🇦🇺 호주", "🇨🇦 캐나다"],
    visionTitle: "EverWill과 함께 성장하세요",
    visionSubtitle: "세계 최초 디지털 유언 OS, EverWill은 지금 글로벌 파트너를 모집합니다. 시장이 열리기 전에 선점하세요.",
    visionStats: [
      { value: "700만+", label: "재외한인 타겟 고객" },
      { value: "14개국", label: "글로벌 진출 국가" },
      { value: "$5,500", label: "고객 1인당 LTV" },
      { value: "25개국", label: "추후 확장 목표" },
    ],
    visionCards: [
      { icon: "🌍", title: "세계 최초 디지털 유언 OS", desc: "Trust & Will, Farewill 등 글로벌 경쟁사를 능가하는 올인원 글로벌 유언 플랫폼. 유언 작성부터 사후 집행까지 전 과정을 자동화합니다." },
      { icon: "💰", title: "안정적인 장기 수익", desc: "고객이 인증만 해도 수익이 발생합니다. 고객이 사망하면 사후 집행 수임까지 자동 연결되는 지속적 수익 구조입니다." },
      { icon: "🏆", title: "탑 리더 배지 시스템", desc: "매년 국가·지역별 최우수 파트너를 선정하여 공식 배지를 수여합니다. 글로벌 콘퍼런스 초청 + 커미션 보너스 +5% 등 특별 혜택이 제공됩니다." },
    ],
    visionLockTitle: "커미션·등급 세부 정보는 승인 후 공개됩니다",
    visionLockDesc: "가입 신청 후 관리자 검토를 거치면, 대시보드에서 등급별 커미션율과 수익 구조를 확인하실 수 있습니다.",
    ctaTitle: "지금 파트너가 되세요",
    ctaSubtitle: "초기 파트너에게는 특별한 혜택이 제공됩니다. 함께 글로벌 유언 시장을 선도하세요.",
  },
  en: {
    heroBadge: "EverWill Partner Program",
    heroTitle1: "Growing Together,",
    heroTitle2: "Global Partner Network",
    heroSubtitle: "Join as a Professional (Attorney/CPA) or Helper partner. Attract clients, manage them, and get automatically assigned cases upon client death.",
    ctaProfessional: "Join as Professional",
    ctaHelper: "Join as Helper",
    groupTitle: "Two Partner Groups",
    groupSubtitle: "Choose the optimal partner type based on your qualifications",
    proGroupName: "Professional Group",
    proGroupDesc: "Premium partnership for attorneys, CPAs, and legal professionals",
    proGroupFeatures: [
      "Commission paid on client acquisition",
      "Profile listing on expert directory page",
      "Automatic case assignment upon client death",
      "Listed by country and region",
      "Dedicated dashboard for client management",
    ],
    helperGroupName: "Helper Group",
    helperGroupDesc: "Sales partners from various channels: insurance agents, YouTubers, celebrities, bloggers",
    helperGroupFeatures: [
      "Commission on referral link sign-ups",
      "Automatic tier upgrade based on performance",
      "Marketing materials and banners provided",
      "Real-time revenue dashboard",
      "Global activity (11 languages)",
    ],
    joinFeeLabel: "Join Fee (one-time)",
    applyBtn: "Apply Now",
    tierTitle: "Performance-Based Tier System",
    tierSubtitle: "Higher revenue means higher commission rates and benefits",
    tierCol1: "Tier",
    tierCol2: "Upgrade Condition",
    tierCol3: "Annual Maintenance",
    tierCol4: "Commission",
    tierCol5: "Key Benefit",
    tiers: [
      { name: "Bronze", condition: "Default", fee: "Free", commission: "15%", benefit: "Basic features", color: "bg-amber-600" },
      { name: "Silver", condition: "$3,800+", fee: "$99/yr", commission: "20%", benefit: "Priority matching", color: "bg-gray-400" },
      { name: "Gold", condition: "$15,000+", fee: "$199/yr", commission: "25%", benefit: "Featured listing", color: "bg-yellow-500" },
      { name: "Premium", condition: "$38,000+", fee: "$299/yr", commission: "30%", benefit: "Exclusive territory", color: "bg-purple-600" },
    ],
    tierNote: "• Tier upgrades automatically when annual revenue target is met, and the tier is maintained for at least 1 year.  • Failure to pay annual maintenance fee results in automatic downgrade.  • Bronze tier is maintained permanently with no annual fee.",
    revenueTitle: "Partner Revenue Structure",
    revenueSubtitle: "Build stable income with 3 revenue streams",
    revenueCards: [
      { title: "Client Acquisition Commission", desc: "Earn tier-based commission every time your client pays for certification or Badge", highlight: "Up to 30%" },
      { title: "Post-Death Case Assignment", desc: "Professional group only. Automatically assigned when managed client passes away", highlight: "75-85% of fees" },
      { title: "Global Activity", desc: "Active in 14 countries, partner anywhere in the world (expanding to 25 countries)", highlight: "14 Countries" },
    ],
    topLeaderBadge: "EverWill Top Leader Award",
    topLeaderTitle: "Top Leader Badge",
    topLeaderSubtitle: "Every year, the partner with the highest contribution in each country and region is selected and awarded the Top Leader Badge.",
    topLeaderCards: [
      { icon: "🏆", title: "Country Top Leader", desc: "Awarded to the top-performing partner in each of the 14 countries annually. Official achievement certificate representing the country." },
      { icon: "🏡", title: "Regional Top Leader", desc: "Awarded to the highest-contributing partner in major cities and regions within each country. Exclusive regional marketing rights." },
      { icon: "👑", title: "Global Top Leader", desc: "Awarded to the top annual performer across all countries worldwide. Official EverWill title + special bonus." },
    ],
    topLeaderHonorTitle: "The Top Leader Badge is more than just an award",
    topLeaderHonorDesc: "Top Leaders receive a badge on their official EverWill partner profile, priority exposure when attracting new clients, an annual commission bonus (+5%), and an invitation to the EverWill Annual Conference to expand their global network.",
    globalTitle: "Operate Globally",
    globalSubtitle: "EverWill recruits partners in 14 countries. Expanding to 25 countries soon.",
    globalCountries: ["🇰🇷 Korea", "🇺🇸 USA", "🇯🇵 Japan", "🇨🇳 China", "🇩🇪 Germany", "🇪🇸 Spain", "🇸🇦 Saudi Arabia", "🇫🇷 France", "🇷🇺 Russia", "🇮🇳 India", "🇧🇷 Brazil", "🇳🇿 New Zealand", "🇦🇺 Australia", "🇨🇦 Canada"],
    visionTitle: "Grow With EverWill",
    visionSubtitle: "The world's first Digital Will OS is recruiting global partners. Be a pioneer before the market opens.",
    visionStats: [
      { value: "7M+", label: "Overseas Korean Target Customers" },
      { value: "14", label: "Countries" },
      { value: "$5,500", label: "LTV per Customer" },
      { value: "25", label: "Expansion Target Countries" },
    ],
    visionCards: [
      { icon: "🌍", title: "World's First Digital Will OS", desc: "An all-in-one global will platform surpassing Trust & Will, Farewill and other competitors. Automates the entire process from will creation to post-death execution." },
      { icon: "💰", title: "Stable Long-term Income", desc: "Revenue is generated when clients complete certification. When clients pass away, post-execution cases are automatically assigned — a continuous income structure." },
      { icon: "🏆", title: "Top Leader Badge System", desc: "Each year, the top-performing partner per country and region receives an official badge. Special benefits include global conference invitation + commission bonus +5%." },
    ],
    visionLockTitle: "Commission & Tier Details Revealed After Approval",
    visionLockDesc: "After your application is reviewed by an admin, you can view tier-based commission rates and revenue structure in your dashboard.",
    ctaTitle: "Become a Partner Today",
    ctaSubtitle: "Early partners receive special benefits. Lead the global will market together.",
  },
  ja: {
    heroBadge: "EverWill パートナープログラム",
    heroTitle1: "共に成長する",
    heroTitle2: "グローバルパートナーネットワーク",
    heroSubtitle: "弁護士・税理士の専門家グループとヘルパーグループに分かれ、顧客を獲得・管理し、死亡時に自動受任まで連携する収益パートナーシップ",
    ctaProfessional: "専門家として参加",
    ctaHelper: "ヘルパーとして参加",
    groupTitle: "2つのパートナーグループ",
    groupSubtitle: "専門資格に応じて最適なパートナータイプを選択してください",
    proGroupName: "専門家グループ",
    proGroupDesc: "弁護士、税理士、司法書士などの法律・税務専門家向けプレミアムパートナーシップ",
    proGroupFeatures: [
      "顧客獲得時コミッション支給",
      "専門家紹介ページにプロフィール掲載",
      "顧客死亡時に自動受任連携",
      "国別・地域別専門家リスト掲載",
      "専用ダッシュボードで顧客管理",
    ],
    helperGroupName: "ヘルパーグループ",
    helperGroupDesc: "保険代理店、YouTuber、セレブ、ブロガーなど多様なチャネルの営業パートナー",
    helperGroupFeatures: [
      "紹介リンクで顧客獲得時コミッション",
      "実績に応じて自動ランクアップ",
      "マーケティング資料・バナー提供",
      "リアルタイム収益ダッシュボード",
      "グローバル活動可能（11言語）",
    ],
    joinFeeLabel: "入会費（1回）",
    applyBtn: "申し込む",
    tierTitle: "実績ベースのランク制度",
    tierSubtitle: "売上が上がるほどコミッション率と特典も上がります",
    tierCol1: "ランク",
    tierCol2: "昇格条件（年間売上）",
    tierCol3: "年間維持費",
    tierCol4: "コミッション",
    tierCol5: "主な特典",
    tiers: [
      { name: "Bronze", condition: "入会時デフォルト", fee: "無料", commission: "15%", benefit: "基本機能", color: "bg-amber-600" },
      { name: "Silver", condition: "500万ウォン+", fee: "$99/年", commission: "20%", benefit: "優先マッチング", color: "bg-gray-400" },
      { name: "Gold", condition: "2,000万ウォン+", fee: "$199/年", commission: "25%", benefit: "上位表示", color: "bg-yellow-500" },
      { name: "Premium", condition: "5,000万ウォン+", fee: "$299/年", commission: "30%", benefit: "独占地域権", color: "bg-purple-600" },
    ],
    tierNote: "• 年間売上目標達成時に自動昇級され、該当ランクは最低1年間維持されます。  • 年間維持費未納付の場合、自動的に一つ下のランクに降格されます。  • Bronzeランクは年間維持費なしで永久維持されます。",
    revenueTitle: "パートナー収益構造",
    revenueSubtitle: "3つの収益源で安定した収入を作りましょう",
    revenueCards: [
      { title: "顧客獲得コミッション", desc: "顧客が認証費・Badgeなどを支払うたびにランク別コミッション支給", highlight: "最大30%" },
      { title: "死後執行受任", desc: "専門家グループ限定。管理顧客の死亡時に自動受任連携", highlight: "報酬の75〜85%" },
      { title: "グローバル活動", desc: "14カ国対応、世界中どこでもパートナー活動可能（25カ国へ拡大予定）", highlight: "14カ国" },
    ],
    topLeaderBadge: "EverWill トップリーダー賞",
    topLeaderTitle: "トップリーダーバッジ",
    topLeaderSubtitle: "毎年末、各国・地域で最も高い貢献度を示したパートナーを選出し、トップリーダーバッジを授与します。",
    topLeaderCards: [
      { icon: "🏆", title: "国別トップリーダー", desc: "各進出国（14カ国）で年間最多実績を上げたパートナー1名に授与。国を代表する実績証明書。" },
      { icon: "🏡", title: "地域トップリーダー", desc: "各国内の主要都市・地域で最も高い貢献度を示したパートナーに授与。地域独占マーケティング権限。" },
      { icon: "👑", title: "グローバルトップリーダー", desc: "全世界全国を統合した年間最多実績者に授与。EverWill公式タイトル＋特別ボーナス。" },
    ],
    topLeaderHonorTitle: "トップリーダーバッジは単なる賞ではありません",
    topLeaderHonorDesc: "トップリーダーに選出されると、EverWill公式パートナープロフィールにバッジが表示され、新規顧客獲得時の優先表示特典と年間コミッションボーナス（+5%）が適用されます。またEverWill年次カンファレンスに招待され、グローバルネットワークを拡大できます。",
    globalTitle: "世界中で活動しましょう",
    globalSubtitle: "EverWillは14カ国でパートナーを募集しています。今後25カ国へ拡大予定です。",
    globalCountries: ["🇰🇷 韓国", "🇺🇸 アメリカ", "🇯🇵 日本", "🇨🇳 中国", "🇩🇪 ドイツ", "🇪🇸 スペイン", "🇸🇦 サウジ", "🇫🇷 フランス", "🇷🇺 ロシア", "🇮🇳 インド", "🇧🇷 ブラジル", "🇳🇿 ニュージーランド", "🇦🇺 オーストラリア", "🇨🇦 カナダ"],
    visionTitle: "EverWillと共に成長しましょう",
    visionSubtitle: "世界初のデジタル遺言OS、EverWillはグローバルパートナーを募集しています。市場が開く前に先行者になりましょう。",
    visionStats: [
      { value: "700万+", label: "在外韓国人ターゲット顧客" },
      { value: "14カ国", label: "グローバル進出国" },
      { value: "$5,500", label: "顧客1人当たりLTV" },
      { value: "25カ国", label: "将来の拡張目標" },
    ],
    visionCards: [
      { icon: "🌍", title: "世界初のデジタル遺言OS", desc: "Trust & Will、Farewillなどグローバル競合を上回るオールインワン遺言プラットフォーム。遺言作成から死後執行まで全プロセスを自動化します。" },
      { icon: "💰", title: "安定した長期収益", desc: "顧客が認証するだけで収益が発生します。顧客が亡くなると死後執行案件まで自動連携される継続的な収益構造です。" },
      { icon: "🏆", title: "トップリーダーバッジシステム", desc: "毎年、国・地域別の最優秀パートナーを選定し公式バッジを授与します。グローバルカンファレンス招待＋コミッションボーナス+5%などの特典があります。" },
    ],
    visionLockTitle: "コミッション・等級の詳細は承認後に公開されます",
    visionLockDesc: "申請後に管理者審査を経ると、ダッシュボードで等級別コミッション率と収益構造をご確認いただけます。",
    ctaTitle: "今すぐパートナーになりましょう",
    ctaSubtitle: "初期パートナーには特別な特典が提供されます。共にグローバル遺言市場をリードしましょう。",
  },
  zh: {
    heroBadge: "EverWill 合作伙伴计划",
    heroTitle1: "共同成长的",
    heroTitle2: "全球合作伙伴网络",
    heroSubtitle: "分为律师·税务师专家组和助手组，招揽客户、管理客户，客户去世时自动承接案件的收益合作伙伴关系",
    ctaProfessional: "专家加入",
    ctaHelper: "助手加入",
    groupTitle: "两种合作伙伴组",
    groupSubtitle: "根据您的专业资质选择最佳合作伙伴类型",
    proGroupName: "专家组",
    proGroupDesc: "面向律师、税务师、法务师等法律·税务专家的高级合作伙伴关系",
    proGroupFeatures: [
      "客户获取时支付佣金",
      "专家介绍页面展示个人资料",
      "客户去世时自动承接案件",
      "按国家·地区列入专家名单",
      "专用仪表板管理客户",
    ],
    helperGroupName: "助手组",
    helperGroupDesc: "保险代理人、YouTuber、名人、博主等各种渠道的销售合作伙伴",
    helperGroupFeatures: [
      "通过推荐链接获取客户时获得佣金",
      "根据业绩自动升级",
      "提供营销材料和横幅",
      "实时收益仪表板",
      "全球活动（11种语言）",
    ],
    joinFeeLabel: "加入费（一次性）",
    applyBtn: "立即申请",
    tierTitle: "基于业绩的等级体系",
    tierSubtitle: "销售额越高，佣金率和福利也越高",
    tierCol1: "等级",
    tierCol2: "升级条件（年销售额）",
    tierCol3: "年维护费",
    tierCol4: "佣金率",
    tierCol5: "核心福利",
    tiers: [
      { name: "Bronze", condition: "加入时默认", fee: "免费", commission: "15%", benefit: "基本功能", color: "bg-amber-600" },
      { name: "Silver", condition: "500万韩元+", fee: "$99/年", commission: "20%", benefit: "优先匹配", color: "bg-gray-400" },
      { name: "Gold", condition: "2,000万韩元+", fee: "$199/年", commission: "25%", benefit: "优先展示", color: "bg-yellow-500" },
      { name: "Premium", condition: "5,000万韩元+", fee: "$299/年", commission: "30%", benefit: "独占区域权", color: "bg-purple-600" },
    ],
    tierNote: "• 年销售额达标时自动升级，该等级至少维持一年。  • 未缴年度维护费时自动降级。  • Bronze等级无需年度维护费，永久维持。",
    revenueTitle: "合作伙伴收益结构",
    revenueSubtitle: "通过3种收入来源创造稳定收入",
    revenueCards: [
      { title: "客户获取佣金", desc: "客户每次支付认证费·Badge等时按等级支付佣金", highlight: "最高30%" },
      { title: "死后执行承接", desc: "仅限专家组。管理客户去世时自动承接案件", highlight: "报酬的75~85%" },
      { title: "全球活动", desc: "支持14个国家，在世界任何地方都可以作为合作伙伴活动（将扩展至25个国家）", highlight: "14个国家" },
    ],
    topLeaderBadge: "EverWill 顶尖领袖奖",
    topLeaderTitle: "顶尖领袖徽章",
    topLeaderSubtitle: "每年年底，在每个国家和地区选出贡献最大的合作伙伴，授予顶尖领袖徽章。",
    topLeaderCards: [
      { icon: "🏆", title: "国家顶尖领袖", desc: "对每个进入国家（14个国家）年度业绩最佳的合作伙伴授予。代表该国的业绩证书。" },
      { icon: "🏡", title: "地区顶尖领袖", desc: "对各国内主要城市和地区贡献最大的合作伙伴授予。地区独家营销权限。" },
      { icon: "👑", title: "全球顶尖领袖", desc: "对全球所有国家年度业绩最佳者授予。EverWill官方称号＋特别奖金。" },
    ],
    topLeaderHonorTitle: "顶尖领袖徽章不仅仅是一个奖项",
    topLeaderHonorDesc: "入选顶尖领袖后，EverWill官方合作伙伴资料上展示徽章，吸引新客户时优先展示，年度佣金奖金（+5%）以及受邀参加EverWill年度大会，拓展全球业务网络。",
    globalTitle: "在全球范围内活动",
    globalSubtitle: "EverWill在14个国家招募合作伙伴。将来扩展至25个国家。",
    globalCountries: ["🇰🇷 韩国", "🇺🇸 美国", "🇯🇵 日本", "🇨🇳 中国", "🇩🇪 德国", "🇪🇸 西班牙", "🇸🇦 沙特", "🇫🇷 法国", "🇷🇺 俄罗斯", "🇮🇳 印度", "🇧🇷 巴西", "🇳🇿 新西兰", "🇦🇺 澳大利亚", "🇨🇦 加拿大"],
    visionTitle: "与EverWill共同成长",
    visionSubtitle: "世界首个数字遗嘱OS，EverWill正在招募全球合作伙伴。市场开放之前成为先行者。",
    visionStats: [
      { value: "700万+", label: "海外韩国人目标客户" },
      { value: "14个国家", label: "全球进出国家" },
      { value: "$5,500", label: "每位客户LTV" },
      { value: "25个国家", label: "未来扩展目标" },
    ],
    visionCards: [
      { icon: "🌍", title: "世界首个数字遗嘱OS", desc: "超越Trust & Will、Farewill等全球竞争对手的一站式遗嘱平台。从遗嘱制作到死后执行，全流程自动化。" },
      { icon: "💰", title: "稳定的长期收益", desc: "客户完成认证即可产生收益。客户去世后自动承接死后执行案件，持续稳定的收益结构。" },
      { icon: "🏆", title: "顶尖领袖徽章系统", desc: "每年按国家和地区选出最优秀合作伙伴授予官方徽章。全球大会邀请+佣金奖金+5%等特别福利。" },
    ],
    visionLockTitle: "佣金和等级详细信息将在审批后公开",
    visionLockDesc: "申请经管理员审核后，可在仔表板查看各等级佣金率和收益结构。",
    ctaTitle: "立即成为合作伙伴",
    ctaSubtitle: "早期合作伙伴将获得特别优惠。一起引领全球遗嘱市场。",
  },
};

// 나머지 언어는 영어 fallback
["de", "es", "ar", "fr", "ru", "hi", "pt"].forEach(lang => {
  if (!partnerTexts[lang]) partnerTexts[lang] = partnerTexts.en;
});

// ─── 시니어 그룹 카드 텍스트 (PartnerPage 내 카드 표시용) ───────────────
const partnerSeniorCardTexts: Record<string, any> = {
  ko: {
    groupName: "시니어 그룹",
    groupDesc: "만 65세 이상 시니어 파트너 — 직접 홍보·지인 추천 특화. 자격증 없이 경험과 인맥으로 수입 창출",
    groupFeatures: [
      "시작 수수료 20% 우대 (헬퍼보다 높음)",
      "자격증·학력 불필요",
      "지인에게 직접 설명·추천 가능",
      "연 등록비 없음 (VIP 가입비 1회)",
      "한국 및 해외 시니어 모두 가능",
    ],
  },
  en: {
    groupName: "Senior Group",
    groupDesc: "For age 65+. Direct referral & personal recommendation specialist. Earn income through experience and network — no license required.",
    groupFeatures: [
      "Start at 20% commission (higher than Helper)",
      "No license or degree required",
      "Direct personal recommendation welcome",
      "No annual fee (VIP one-time only)",
      "Open to seniors in Korea and worldwide",
    ],
  },
  ja: {
    groupName: "シニアグループ",
    groupDesc: "65歳以上のシニアパートナー — 直接紹介・知人推薦特化。資格不要で経験と人脈で収入を得られます。",
    groupFeatures: [
      "開始手数料20%優遇（ヘルパーより高い）",
      "資格・学歴不要",
      "知人への直接説明・推薦可能",
      "年会費なし（VIP入会費1回のみ）",
      "韓国・海外シニア問わず参加可能",
    ],
  },
  zh: {
    groupName: "老年组",
    groupDesc: "65岁以上老年合作伙伴 — 直接推荐·熟人介绍专项。无需资质，凭经验和人脉创造收入。",
    groupFeatures: [
      "起始佣金20%优待（高于助手组）",
      "无需资质或学历",
      "欢迎直接向熟人介绍推荐",
      "无年费（VIP入会费仅一次）",
      "韩国及海外老年人均可参与",
    ],
  },
};
["de", "es", "ar", "fr", "ru", "hi", "pt"].forEach(lang => {
  if (!partnerSeniorCardTexts[lang]) partnerSeniorCardTexts[lang] = partnerSeniorCardTexts.en;
});
