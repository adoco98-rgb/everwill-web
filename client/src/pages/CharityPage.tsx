/**
 * 사회기부 소개·홍보 페이지
 * "나의 편지" 메뉴를 대체하는 EverWill 사회기부 안내 페이지
 * 분야 카드: 이미지 + 아이콘 + 텍스트 조합
 */
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { Heart, BookOpen, Users, Leaf, FlaskConical, Music, Dog, Zap, Church, HelpCircle, Baby, UserCheck, CheckCircle, ArrowRight, Building2, Quote } from "lucide-react";
import CharityStatsSection from "@/components/CharityStatsSection";

// 분야별 감성 이미지 (manus-storage)
const CATEGORY_IMAGES: Record<string, string> = {
  education:   "/manus-storage/charity_education_fd78152c.jpg",
  children:    "/manus-storage/charity_children_47b9432a.jpg",
  elderly:     "/manus-storage/charity_elderly_d54f3504.jpg",
  disability:  "/manus-storage/charity_disabled_06da545b.jpg",
  disabled:    "/manus-storage/charity_disabled_06da545b.jpg",
  medical:     "/manus-storage/charity_medical_270a8196.jpg",
  environment: "/manus-storage/charity_environment_f8aca49a.jpg",
  culture:     "/manus-storage/charity_culture_022d1544.jpg",
  science:     "/manus-storage/charity_science_997af245.jpg",
  animal:      "/manus-storage/charity_animal_dcb6e6da.jpg",
  disaster:    "/manus-storage/charity_disaster_278812bd.jpg",
  religion:    "/manus-storage/charity_religion_7af51a22.jpg",
  other:       "/manus-storage/charity_other_779cb314.jpg",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  education:   <BookOpen className="w-5 h-5" />,
  children:    <Baby className="w-5 h-5" />,
  elderly:     <UserCheck className="w-5 h-5" />,
  disability:  <Heart className="w-5 h-5" />,
  disabled:    <Heart className="w-5 h-5" />,
  medical:     <Heart className="w-5 h-5" />,
  environment: <Leaf className="w-5 h-5" />,
  culture:     <Music className="w-5 h-5" />,
  science:     <FlaskConical className="w-5 h-5" />,
  animal:      <Dog className="w-5 h-5" />,
  disaster:    <Zap className="w-5 h-5" />,
  religion:    <Church className="w-5 h-5" />,
  other:       <HelpCircle className="w-5 h-5" />,
};

// 분야별 텍스트 컬러 (카드 하단 배지용)
const CATEGORY_TEXT_COLOR: Record<string, string> = {
  education:   "text-blue-600",
  children:    "text-pink-600",
  elderly:     "text-amber-600",
  disability:  "text-purple-600",
  disabled:    "text-purple-600",
  medical:     "text-red-600",
  environment: "text-green-600",
  culture:     "text-indigo-600",
  science:     "text-cyan-600",
  animal:      "text-orange-600",
  disaster:    "text-yellow-600",
  religion:    "text-teal-600",
  other:       "text-gray-600",
};

export default function CharityPage() {
  const { t, language } = useLanguage();
  const cp = t.charityPage;
  const isRTL = language === "ar";

  const categories = Object.entries(cp.cats) as [string, string][];

  return (
    <div className="min-h-screen bg-[#FAFAFA]" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Hero 섹션 (이미지 풀스크린 + Jeff 인용구 오버레이) ── */}
      <section className="relative overflow-hidden min-h-screen flex flex-col justify-end">
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <img
            src="/manus-storage/charity_hero_a1375e07.png"
            alt="사회기부 히어로"
            className="w-full h-full object-cover object-center"
          />
          {/* 상단 어두운 그라디언트 - 제목 가독성 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F3864]/60 via-transparent to-[#1F3864]/85" />
        </div>

        {/* 상단 제목 영역 */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-0 text-center text-white w-full">
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/20 border border-[#C9A961]/40 rounded-full px-4 py-1.5 mb-6">
            <Heart className="w-4 h-4 text-[#C9A961]" />
            <span className="text-sm text-[#C9A961] font-medium">{cp.navLabel}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 whitespace-pre-line drop-shadow-lg">
            {cp.heroTitle}
          </h1>
          <p className="text-xl text-white/90 mb-10 drop-shadow">{cp.heroSubtitle}</p>
          <Link href="/write">
            <button className="inline-flex items-center gap-2 bg-[#C9A961] hover:bg-[#b8943e] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl">
              {cp.ctaBtn}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Jeff 인용구 - 이미지 하단 오버레이 */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pb-16 pt-12 w-full">
          <div className="relative bg-white/10 backdrop-blur-md border border-white/20 border-l-4 border-l-[#C9A961] rounded-2xl p-8 md:p-10 shadow-2xl">
            <Quote className="absolute top-6 left-6 w-8 h-8 text-[#C9A961]/50" />
            <p className="text-base md:text-lg text-white leading-relaxed font-medium italic pl-4 drop-shadow">
              {cp.jeffQuote}
            </p>
            <div className="mt-6 flex items-center gap-3 pl-4">
              <div className="w-8 h-0.5 bg-[#C9A961]" />
              <span className="text-sm text-white/80 font-medium">Jeff Ra · EverWill Founder</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── EverWill 약속 ── */}
      <section className="py-16 bg-[#1F3864]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C9A961]/20 rounded-full mb-6">
            <Heart className="w-8 h-8 text-[#C9A961]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{cp.everwillPledgeTitle}</h2>
          <p className="text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">{cp.everwillPledge}</p>

          {/* 투명성 원칙 3가지 */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[cp.transparency1, cp.transparency2, cp.transparency3].map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-5 py-4">
                <CheckCircle className="w-5 h-5 text-[#C9A961] flex-shrink-0" />
                <span className="text-white/90 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 기부 절차 3단계 ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1F3864] text-center mb-12">{cp.howTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: cp.step1Title, desc: cp.step1Desc, num: "01" },
              { title: cp.step2Title, desc: cp.step2Desc, num: "02" },
              { title: cp.step3Title, desc: cp.step3Desc, num: "03" },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%-1rem)] w-8 h-0.5 bg-[#C9A961]/40 z-10" />
                )}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1F3864] rounded-full text-[#C9A961] font-bold text-xl mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-[#1F3864] mb-2">{step.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 후원 분야 12개 — 이미지+텍스트 카드 ── */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1F3864] text-center mb-3">{cp.categoriesTitle}</h2>
          <p className="text-center text-[#6B7280] mb-10 text-sm">EverWill이 검증된 단체를 선정하여 전달합니다</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {categories.map(([key, label]) => {
              const imgUrl = CATEGORY_IMAGES[key];
              const iconColor = CATEGORY_TEXT_COLOR[key] ?? "text-gray-600";
              return (
                <div
                  key={key}
                  className="group overflow-hidden rounded-2xl shadow-md hover:-translate-y-1 hover:shadow-xl transition-all duration-300 bg-white border border-gray-100"
                >
                  {/* 이미지 영역 */}
                  <div className="relative h-36 overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className={`opacity-40 scale-150 ${iconColor}`}>
                          {CATEGORY_ICONS[key] || <HelpCircle className="w-8 h-8" />}
                        </div>
                      </div>
                    )}
                    {/* 하단 그라디언트 오버레이 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>

                  {/* 텍스트 + 아이콘 영역 */}
                  <div className="px-4 py-3 flex items-center gap-2.5">
                    <div className={`flex-shrink-0 ${iconColor}`}>
                      {CATEGORY_ICONS[key] || <HelpCircle className="w-4 h-4" />}
                    </div>
                    <span className="font-semibold text-sm text-[#1F3864] leading-tight">{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 기부금 누적 현황 ── */}
      <CharityStatsSection />

      {/* ── CTA 섹션 ── */}
      <section className="py-20 bg-gradient-to-br from-[#1F3864] to-[#2d4f8a]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{cp.ctaTitle}</h2>
          <p className="text-white/70 mb-8">{cp.ctaDesc}</p>
          <Link href="/write">
            <button className="inline-flex items-center gap-2 bg-[#C9A961] hover:bg-[#b8943e] text-white font-bold px-10 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-lg">
              {cp.ctaBtn}
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* ── 기부 단체 후원 신청 ── */}
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#C9A961]/10 rounded-full mb-4">
            <Building2 className="w-7 h-7 text-[#C9A961]" />
          </div>
          <h2 className="text-xl font-bold text-[#1F3864] mb-3">{cp.applyTitle}</h2>
          <p className="text-[#6B7280] text-sm mb-6 leading-relaxed">{cp.applyDesc}</p>
          <a
            href="mailto:adoco98@gmail.com?subject=EverWill 기부 단체 후원 신청"
            className="inline-flex items-center gap-2 border-2 border-[#1F3864] text-[#1F3864] hover:bg-[#1F3864] hover:text-white font-semibold px-8 py-3 rounded-full transition-all duration-200"
          >
            {cp.applyBtn}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

    </div>
  );
}
