/**
 * 파트너센터 메인 랜딩 페이지
 * 전문가(변호사/세무사) + 헬퍼 파트너 프로그램 소개
 * 등급 체계, 수수료 구조, 가입 CTA
 */
import { motion } from "framer-motion";
import { ArrowRight, Scale, Users, TrendingUp, Award, Globe, Shield, DollarSign, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 히어로 이미지
const PARTNER_HERO = "/manus-storage/partner-hero_c6ad9518.jpg";

export default function PartnerPage() {
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();

  // 다국어 텍스트
  const texts = partnerTexts[language] || partnerTexts.ko;

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

          <div className="grid md:grid-cols-2 gap-8">
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
              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <span className="text-sm text-[#6B7280]">{texts.joinFeeLabel}</span>
                  <p className="text-2xl font-bold text-[#1F3864]">$99</p>
                </div>
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
              <div className="flex items-center justify-between border-t pt-6">
                <div>
                  <span className="text-sm text-[#6B7280]">{texts.joinFeeLabel}</span>
                  <p className="text-2xl font-bold text-[#C9A961]">$49</p>
                </div>
                <button
                  onClick={() => navigate("/partner/helper")}
                  className="px-6 py-3 bg-[#C9A961] hover:bg-[#b8953a] text-[#1F3864] font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  {texts.applyBtn}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 등급 체계 섹션 */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {texts.tierTitle}
            </h2>
            <p className="text-lg text-[#6B7280]">
              {texts.tierSubtitle}
            </p>
          </motion.div>

          {/* 등급 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#1F3864] text-white">
                  <th className="px-6 py-4 text-left rounded-tl-xl">{texts.tierCol1}</th>
                  <th className="px-6 py-4 text-center">{texts.tierCol2}</th>
                  <th className="px-6 py-4 text-center">{texts.tierCol3}</th>
                  <th className="px-6 py-4 text-center">{texts.tierCol4}</th>
                  <th className="px-6 py-4 text-center rounded-tr-xl">{texts.tierCol5}</th>
                </tr>
              </thead>
              <tbody>
                {texts.tiers.map((tier: any, i: number) => (
                  <tr key={i} className={`border-b ${i % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-white'}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${tier.color}`} />
                        <span className="font-bold text-[#1A1A1A]">{tier.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center text-[#6B7280]">{tier.condition}</td>
                    <td className="px-6 py-5 text-center font-semibold text-[#1F3864]">{tier.fee}</td>
                    <td className="px-6 py-5 text-center font-semibold text-[#C9A961]">{tier.commission}</td>
                    <td className="px-6 py-5 text-center text-[#6B7280]">{tier.benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 1년간 유지 안내 */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-[#1F3864]/5 border border-[#1F3864]/20 rounded-xl px-6 py-4">
            <span className="text-[#C9A961] text-xl">&#9432;</span>
            <p className="text-sm text-[#6B7280] leading-relaxed">{texts.tierNote}</p>
          </div>
        </div>
      </section>

      {/* 수익 구조 섹션 */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              {texts.revenueTitle}
            </h2>
            <p className="text-lg text-[#6B7280]">
              {texts.revenueSubtitle}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {texts.revenueCards.map((card: any, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center"
              >
                <div className="w-16 h-16 bg-[#1F3864]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  {i === 0 && <DollarSign className="w-8 h-8 text-[#C9A961]" />}
                  {i === 1 && <TrendingUp className="w-8 h-8 text-[#C9A961]" />}
                  {i === 2 && <Globe className="w-8 h-8 text-[#C9A961]" />}
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">{card.title}</h3>
                <p className="text-[#6B7280] mb-4">{card.desc}</p>
                <p className="text-2xl font-bold text-[#1F3864]">{card.highlight}</p>
              </motion.div>
            ))}
          </div>
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
      "고객 유치 시 최대 30% 커미션",
      "전문가 소개 페이지 프로필 노출",
      "고객 사망 시 자동 수임 연결",
      "국가별·지역별 전문가 리스트 등재",
      "전용 대시보드로 고객 관리",
    ],
    helperGroupName: "헬퍼 그룹",
    helperGroupDesc: "보험설계사, 유튜버, 셀럽, 블로거 등 다양한 채널의 영업 파트너",
    helperGroupFeatures: [
      "추천 링크로 고객 유치 시 커미션",
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
      "Up to 30% commission on client acquisition",
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
      "顧客獲得時最大30%コミッション",
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
      "客户获取最高30%佣金",
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
    ctaTitle: "立即成为合作伙伴",
    ctaSubtitle: "早期合作伙伴将获得特别优惠。一起引领全球遗嘱市场。",
  },
};

// 나머지 언어는 영어 fallback
["de", "es", "ar", "fr", "ru", "hi", "pt"].forEach(lang => {
  if (!partnerTexts[lang]) partnerTexts[lang] = partnerTexts.en;
});
