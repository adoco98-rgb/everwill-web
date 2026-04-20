import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// ─── 언어 목록 ────────────────────────────────────────────────────
const languages = [
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

// ─── 애니메이션 헬퍼 ───────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── 숫자 카운터 ────────────────────────────────────────────────────
function CountUp({ end, suffix = "", prefix = "" }: { end: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── 섹션 헤더 ──────────────────────────────────────────────────────
function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <FadeIn className="text-center mb-16">
      <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
        style={{ background: "rgba(201,169,97,0.15)", color: "#C9A961", border: "1px solid rgba(201,169,97,0.3)" }}>
        {badge}
      </span>
      <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1F3864" }}>{title}</h2>
      {subtitle && <p className="text-lg max-w-2xl mx-auto" style={{ color: "#6B7280" }}>{subtitle}</p>}
    </FadeIn>
  );
}

export default function InvestPage() {
  const [contactForm, setContactForm] = useState({ name: "", company: "", email: "", amount: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Pretendard', 'Inter', sans-serif", background: "#FAFAFA", color: "#1A1A1A" }}>

      {/* ── NAVBAR ─────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: "rgba(31,56,100,0.97)", backdropFilter: "blur(12px)" }}>
        <Link href="/">
          <span className="flex items-center gap-2 cursor-pointer">
            <span className="text-2xl font-bold tracking-tight" style={{ color: "#C9A961" }}>SARAM</span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(201,169,97,0.2)", color: "#C9A961" }}>Investor</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
          <a href="#mission" className="hover:text-white transition-colors">사업 의의</a>
          <a href="#market" className="hover:text-white transition-colors">시장 현황</a>
          <a href="#differentiation" className="hover:text-white transition-colors">차별성</a>
          <a href="#vision" className="hover:text-white transition-colors">비전</a>
          <a href="#revenue" className="hover:text-white transition-colors">수익 모델</a>
          <a href="#team" className="hover:text-white transition-colors">팀</a>
        </div>
        <div className="flex items-center gap-3">
          {/* 언어 선택 국기 드롭다운 */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors"
              style={{ color: "rgba(255,255,255,0.8)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              title={currentLang.label}
            >
              <span className="text-xl leading-none">{currentLang.flag}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 rounded-2xl shadow-2xl overflow-hidden py-1"
                  style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", minWidth: 160 }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setCurrentLang(lang); setLangOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left"
                      style={{
                        background: currentLang.code === lang.code ? "rgba(31,56,100,0.05)" : "transparent",
                        color: currentLang.code === lang.code ? "#1F3864" : "#374151",
                        fontWeight: currentLang.code === lang.code ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (currentLang.code !== lang.code) e.currentTarget.style.background = "#F9FAFB"; }}
                      onMouseLeave={e => { if (currentLang.code !== lang.code) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.label}</span>
                      {currentLang.code === lang.code && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#C9A961" }} />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a href="#contact"
            className="px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
            style={{ background: "#C9A961", color: "#1F3864" }}>
            투자 문의
          </a>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        style={{ background: "linear-gradient(135deg, #0d1f3c 0%, #1F3864 50%, #162d55 100%)" }}>
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: Math.random() * 300 + 50,
                height: Math.random() * 300 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: "radial-gradient(circle, rgba(201,169,97,0.3) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)"
              }} />
          ))}
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-sm font-medium"
              style={{ background: "rgba(201,169,97,0.15)", border: "1px solid rgba(201,169,97,0.4)", color: "#C9A961" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Series A 투자 유치 중 · 2026
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ color: "#FFFFFF" }}>
              세계 최초<br />
              <span style={{ color: "#C9A961" }}>디지털 유언 OS</span>
            </h1>

            <p className="text-xl md:text-2xl mb-4 font-light" style={{ color: "rgba(255,255,255,0.85)" }}>
              유언 작성부터 사후 자동 집행까지
            </p>
            <p className="text-lg mb-12 max-w-3xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Trust & Will·Farewill·GoodTrust 등 글로벌 경쟁사를 뛰어넘는<br />
              올인원 글로벌 유언 플랫폼 — 아시아 시장 선점 기회
            </p>

            {/* KPI 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              {[
                { label: "글로벌 시장 규모 (2026)", value: "$6.4억", sub: "연 9.3% CAGR 성장" },
                { label: "한국 시니어 자산", value: "4,930조원", sub: "65세 이상 보유" },
                { label: "경쟁사 LTV 대비", value: "2.8배", sub: "목표 LTV $550" },
                { label: "아시아 경쟁사", value: "0개", sub: "블루오션 선점 기회" },
              ].map((kpi, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="rounded-2xl p-5 text-center"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,169,97,0.25)", backdropFilter: "blur(10px)" }}>
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: "#C9A961" }}>{kpi.value}</div>
                  <div className="text-xs font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>{kpi.label}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{kpi.sub}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#contact"
                className="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: "#C9A961", color: "#1F3864" }}>
                투자 문의하기
              </a>
              <a href="#mission"
                className="px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105"
                style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)" }}>
                사업 소개 보기
              </a>
            </div>
          </motion.div>
        </div>

        {/* 스크롤 인디케이터 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <span className="text-xs">스크롤</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-0.5 h-8 rounded-full" style={{ background: "rgba(201,169,97,0.6)" }} />
        </div>
      </section>

      {/* ── 사업 의의 & 목적 ────────────────────────────────────────── */}
      <section id="mission" className="py-24 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="사업 의의 & 목적"
            title="왜 SARAM인가"
            subtitle="죽음은 누구에게나 찾아오지만, 준비된 사람은 극소수입니다. SARAM은 이 불평등을 해소합니다."
          />

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <FadeIn>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)", border: "1px solid #dce8ff" }}>
                  <div className="text-4xl mb-3">⚠️</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#1F3864" }}>현재의 문제</h3>
                  <ul className="space-y-2 text-sm" style={{ color: "#4B5563" }}>
                    <li className="flex items-start gap-2"><span style={{ color: "#DC2626" }}>✗</span> 한국인의 <strong>95%</strong>가 유언장 없이 사망</li>
                    <li className="flex items-start gap-2"><span style={{ color: "#DC2626" }}>✗</span> 상속 분쟁으로 연간 <strong>수조원</strong>의 가족 갈등</li>
                    <li className="flex items-start gap-2"><span style={{ color: "#DC2626" }}>✗</span> 기존 서비스는 <strong>변호사 방문</strong> 필수 (최소 50만원~)</li>
                    <li className="flex items-start gap-2"><span style={{ color: "#DC2626" }}>✗</span> 사망 후 유언 <strong>발견 못하는</strong> 경우 다반사</li>
                    <li className="flex items-start gap-2"><span style={{ color: "#DC2626" }}>✗</span> 글로벌 자산 보유자는 <strong>각국 법률 따로</strong> 처리</li>
                  </ul>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "1px solid #bbf7d0" }}>
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: "#166534" }}>SARAM의 해결책</h3>
                <ul className="space-y-2 text-sm" style={{ color: "#166534" }}>
                  <li className="flex items-start gap-2"><span>✓</span> AI 가이드로 <strong>17분</strong> 만에 유언장 완성</li>
                  <li className="flex items-start gap-2"><span>✓</span> 물리적 Badge로 <strong>사망 자동 감지</strong> + 집행</li>
                  <li className="flex items-start gap-2"><span>✓</span> 변호사 없이 <strong>₩49,000</strong>으로 법적 인증</li>
                  <li className="flex items-start gap-2"><span>✓</span> 4중 사망 감지로 <strong>유언 자동 집행</strong></li>
                  <li className="flex items-start gap-2"><span>✓</span> 7개 언어 + <strong>멀티관할권</strong> 동시 지원</li>
                </ul>
              </div>
            </FadeIn>
          </div>

          {/* 사업 목적 3가지 */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏛️",
                title: "사회적 의의",
                desc: "유언 문화의 민주화. 부유층만 누리던 유언 서비스를 모든 계층이 접근 가능하게 만든다. 상속 분쟁 예방으로 사회적 비용을 줄이고, 가족 간 갈등을 사전에 차단한다."
              },
              {
                icon: "🌍",
                title: "글로벌 임팩트",
                desc: "700만 재외한인, 일본·중동 고령화 사회의 디지털 유언 공백을 채운다. 세계 어디서나 자신의 마지막 뜻을 안전하게 전달할 수 있는 인프라를 구축한다."
              },
              {
                icon: "💡",
                title: "기술 혁신",
                desc: "AI·블록체인·IoT(NFC Badge)를 결합한 세계 최초의 유언 OS. 단순 문서 작성 도구가 아닌, 사후 자동 집행까지 완결되는 엔드투엔드 플랫폼이다."
              }
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="p-6 rounded-2xl h-full" style={{ background: "#FAFAFA", border: "1px solid #E5E7EB" }}>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: "#1F3864" }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 시장 현황 ───────────────────────────────────────────────── */}
      <section id="market" className="py-24 px-6" style={{ background: "#F8FAFF" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="시장 현황"
            title="지금이 최적의 진입 시점"
            subtitle="고령화 가속, 디지털 전환, 법제화 — 세 가지 메가트렌드가 동시에 수렴하고 있다."
          />

          {/* 핵심 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { num: 6.4, suffix: "억$", label: "글로벌 시장 규모 (2026)", sub: "2035년 $17.1억 예측" },
              { num: 9.3, suffix: "%", label: "연평균 성장률 (CAGR)", sub: "핀테크 평균 상회" },
              { num: 4930, suffix: "조원", label: "한국 시니어 자산 총액", sub: "65세 이상 보유" },
              { num: 60, suffix: "조엔", label: "일본 연간 상속 규모", sub: "세계 2위 상속세율" },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-6 rounded-2xl text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(31,56,100,0.06)" }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: "#1F3864" }}>
                    <CountUp end={item.num} suffix={item.suffix} />
                  </div>
                  <div className="text-sm font-semibold mb-1" style={{ color: "#374151" }}>{item.label}</div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>{item.sub}</div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 차트 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <FadeIn>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
                <div className="p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                  <h3 className="font-bold" style={{ color: "#1F3864" }}>글로벌 온라인 유언 시장 성장 예측</h3>
                </div>
                <img src="/manus-storage/chart2_market_growth_f09312d7.png" alt="시장 성장 차트" className="w-full" />
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
                <div className="p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                  <h3 className="font-bold" style={{ color: "#1F3864" }}>한국 고령화 및 신탁 시장 성장</h3>
                </div>
                <img src="/manus-storage/chart6_korea_aging_cf98283e.png" alt="한국 고령화 차트" className="w-full" />
              </div>
            </FadeIn>
          </div>

          {/* 국가별 시장 */}
          <FadeIn>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
              <div className="p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                <h3 className="font-bold" style={{ color: "#1F3864" }}>국가별 타깃 시장 규모 및 특성</h3>
              </div>
              <img src="/manus-storage/chart4_target_markets_8a6300fb.png" alt="국가별 시장 차트" className="w-full" />
            </div>
          </FadeIn>

          {/* 시장 타이밍 */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { flag: "🇰🇷", country: "한국 (1차)", timing: "지금 즉시", desc: "초고령사회 진입(2025), 유언대용신탁 2배 증가, 경쟁사 전무", color: "#EFF6FF" },
              { flag: "🇯🇵", country: "일본 (2차)", timing: "2025년 10월~", desc: "공정증서 디지털화 법제화, 연간 상속 60조엔, 한국 유사 법체계", color: "#F0FDF4" },
              { flag: "🇺🇸", country: "미국 (4차)", timing: "2027년~", desc: "재미한인 100만명, Trust & Will 공백 지역(아시안 커뮤니티)", color: "#FFF7ED" },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="p-6 rounded-2xl" style={{ background: item.color, border: "1px solid #E5E7EB" }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{item.flag}</span>
                    <div>
                      <div className="font-bold" style={{ color: "#1F3864" }}>{item.country}</div>
                      <div className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block" style={{ background: "#C9A961", color: "#1F3864" }}>{item.timing}</div>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: "#6B7280" }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── 차별성 & 독립성 ─────────────────────────────────────────── */}
      <section id="differentiation" className="py-24 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="차별성 & 독립성"
            title="경쟁사가 따라올 수 없는 이유"
            subtitle="SARAM의 10가지 혁신 아이디어 중 7가지는 전 세계 어떤 경쟁사도 시도하지 않은 독창적 기술이다."
          />

          {/* 경쟁사 비교 차트 */}
          <FadeIn className="mb-16">
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
              <div className="p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                <h3 className="font-bold" style={{ color: "#1F3864" }}>글로벌 경쟁사 비교 분석</h3>
              </div>
              <img src="/manus-storage/chart3_competitor_de21a6df.png" alt="경쟁사 비교" className="w-full" />
            </div>
          </FadeIn>

          {/* 10가지 혁신 */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              { num: "01", title: "물리적 Badge 시스템", desc: "MedicAlert + AirTag + 유언 인증 결합. 스테인레스·티타늄 카드/팔찌/목걸이 5종 라인업. 평소 착용 자체가 마케팅 채널.", unique: true },
              { num: "02", title: "4중 사망 감지 시스템", desc: "가족 신고 + 정부 DB 연동 + Dead Man's Switch + 응급 발견자 신고. 최소 2개 채널 교차 검증 후 자동 집행.", unique: true },
              { num: "03", title: "변호사 마켓플레이스", desc: "생전 0%, 사후 100% 등장. 진짜 필요한 순간에만 전문가 매칭. 플랫폼 수수료 15-25%.", unique: true },
              { num: "04", title: "상속자 직접 등록", desc: "사망 시 전 세계 상속자에게 자동 알림. 현지 언어·시간대 맞춤. 72시간 이의제기 기간 후 유언 공개.", unique: true },
              { num: "05", title: "체크박스 기반 17분 완성", desc: "AI가 체크박스 → 법률 문장 자동 변환. 유류분 실시간 검증. 상속세 자동 계산. 오류 경고.", unique: false },
              { num: "06", title: "영상 유언장 + 미래 전달", desc: "손녀 성인식, 아들 결혼식 날 자동 전송. 평생 보관. 수십 년 후에도 재생 보장.", unique: false },
              { num: "07", title: "자필 스캔 AI 인증", desc: "자필 여부 확인, 날짜·서명·날인 체크, 위조 탐지. 블록체인 무결성 기록.", unique: true },
              { num: "08", title: "재인증 ₩15,000 체계", desc: "결혼·출산·이사·자산 변동마다 재인증 유도. 평생 LTV 28배 증가. 심리적 장벽 최소화.", unique: true },
              { num: "09", title: "글로벌 멀티관할권 지원", desc: "한국+미국+일본 자산 동시 관리. 각국 법률 자동 적용. 크로스보더 상속 자동 조율.", unique: true },
              { num: "10", title: "7개 언어 + 아랍어 RTL", desc: "한국어·영어·일본어·중국어·독일어·스페인어·아랍어. 샤리아 상속법 자동 적용. 중동 고액 자산가 타깃.", unique: false },
            ].map((item, i) => (
              <FadeIn key={i} delay={(i % 4) * 0.1}>
                <div className="p-5 rounded-2xl flex gap-4"
                  style={{ background: item.unique ? "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)" : "#FAFAFA", border: `1px solid ${item.unique ? "#BFDBFE" : "#E5E7EB"}` }}>
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ background: item.unique ? "#1F3864" : "#E5E7EB", color: item.unique ? "#C9A961" : "#6B7280" }}>
                    {item.num}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm" style={{ color: "#1F3864" }}>{item.title}</h4>
                      {item.unique && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#C9A961", color: "#1F3864" }}>세계 최초</span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 유튜브 검색량 격차 */}
          <FadeIn>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
              <div className="p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                <h3 className="font-bold" style={{ color: "#1F3864" }}>유튜브 검색량 분석 — 163배 시장 공백 확인</h3>
                <p className="text-sm mt-1" style={{ color: "#6B7280" }}>영미권 대비 한국·일본의 디지털 유언 콘텐츠 공급 격차 = 시장 선점 기회</p>
              </div>
              <img src="/manus-storage/chart1_youtube_search_d499e7b2.png" alt="유튜브 검색량 차트" className="w-full" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 비전 ────────────────────────────────────────────────────── */}
      <section id="vision" className="py-24 px-6" style={{ background: "linear-gradient(135deg, #1F3864 0%, #0d1f3c 100%)" }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
              style={{ background: "rgba(201,169,97,0.2)", color: "#C9A961", border: "1px solid rgba(201,169,97,0.4)" }}>
              비전 & 로드맵
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
              2030년, 글로벌 유언 플랫폼 1위
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
              아시아에서 시작해 전 세계로 확장하는 단계별 성장 전략
            </p>
          </FadeIn>

          {/* 로드맵 타임라인 */}
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 hidden md:block" style={{ background: "rgba(201,169,97,0.3)" }} />
            <div className="space-y-8">
              {[
                {
                  period: "2026 Q1-Q2", title: "한국 시장 선점", side: "left",
                  items: ["MVP 출시 및 베타 서비스", "유료 회원 10,000명 목표", "변호사 파트너 10명 영입", "Badge 시제품 제작"],
                  kpi: "MAU 50,000 · 매출 ₩5억"
                },
                {
                  period: "2026 Q3-Q4", title: "일본 진출", side: "right",
                  items: ["디지털 유언 법제화 시점 활용", "일본어 서비스 완성", "일본 변호사 파트너십", "시리즈 A 투자 유치"],
                  kpi: "MAU 200,000 · 매출 ₩30억"
                },
                {
                  period: "2027", title: "중화권 + 중동 진출", side: "left",
                  items: ["홍콩·대만 서비스 출시", "아랍어 RTL + 샤리아 상속법", "중동 HNWI 타깃 마케팅", "Badge 프리미엄 라인 출시"],
                  kpi: "MAU 1,000,000 · 매출 ₩200억"
                },
                {
                  period: "2028-2030", title: "미국 + 글로벌 확장", side: "right",
                  items: ["재미한인 100만명 타깃", "영미권 본격 진출", "변호사 마켓플레이스 수백명", "IPO 준비"],
                  kpi: "글로벌 1위 · 매출 ₩1,000억+"
                },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.15}>
                  <div className={`flex gap-8 items-start ${item.side === "right" ? "md:flex-row-reverse" : ""}`}>
                    <div className="flex-1 md:max-w-[45%]">
                      <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(201,169,97,0.25)" }}>
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: "#C9A961", color: "#1F3864" }}>{item.period}</span>
                          <h3 className="font-bold" style={{ color: "#FFFFFF" }}>{item.title}</h3>
                        </div>
                        <ul className="space-y-1 mb-4">
                          {item.items.map((it, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                              <span style={{ color: "#C9A961" }}>→</span> {it}
                            </li>
                          ))}
                        </ul>
                        <div className="pt-3 border-t text-sm font-semibold" style={{ borderColor: "rgba(201,169,97,0.2)", color: "#C9A961" }}>
                          🎯 {item.kpi}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-shrink-0 w-4 h-4 rounded-full mt-6 relative z-10"
                      style={{ background: "#C9A961", boxShadow: "0 0 0 4px rgba(201,169,97,0.3)" }} />
                    <div className="flex-1 md:max-w-[45%] hidden md:block" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 수익 모델 ───────────────────────────────────────────────── */}
      <section id="revenue" className="py-24 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="수익 모델"
            title="다층 수익 구조로 LTV 극대화"
            subtitle="단순 구독이 아닌 생애주기 전반에 걸친 반복 수익 모델"
          />

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <FadeIn>
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E5E7EB" }}>
                <div className="p-4 border-b" style={{ borderColor: "#E5E7EB" }}>
                  <h3 className="font-bold" style={{ color: "#1F3864" }}>수익 구조 및 LTV 비교</h3>
                </div>
                <img src="/manus-storage/chart5_revenue_ltv_a464110f.png" alt="수익 모델 차트" className="w-full" />
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="space-y-4">
                {[
                  { category: "핵심 수익", items: [
                    { name: "전자 인증 (최초)", price: "₩49,000", note: "1회" },
                    { name: "재인증 (수정)", price: "₩15,000", note: "횟수 무제한" },
                    { name: "보관 수수료", price: "₩9,900/년", note: "2년차부터" },
                  ]},
                  { category: "부가 수익", items: [
                    { name: "영상 유언장", price: "+₩29,000", note: "옵션" },
                    { name: "자필 스캔 인증", price: "+₩19,000", note: "옵션" },
                    { name: "Badge (5종)", price: "₩49,000~299,000", note: "1회" },
                  ]},
                  { category: "플랫폼 수익", items: [
                    { name: "변호사 생전 자문", price: "₩30,000~", note: "매칭 수수료" },
                    { name: "변호사 사후 집행", price: "보수의 15-25%", note: "플랫폼 수수료" },
                  ]},
                ].map((group, gi) => (
                  <div key={gi} className="p-4 rounded-xl" style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                    <div className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: "#9CA3AF" }}>{group.category}</div>
                    <div className="space-y-2">
                      {group.items.map((item, ii) => (
                        <div key={ii} className="flex items-center justify-between text-sm">
                          <span style={{ color: "#374151" }}>{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{ color: "#1F3864" }}>{item.price}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#E5E7EB", color: "#6B7280" }}>{item.note}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* LTV 비교 */}
          <FadeIn>
            <div className="grid grid-cols-3 gap-6 p-8 rounded-2xl" style={{ background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)", border: "1px solid #BFDBFE" }}>
              {[
                { company: "Farewill", ltv: "$150", color: "#9CA3AF" },
                { company: "Trust & Will", ltv: "$199", color: "#6B7280" },
                { company: "SARAM 목표", ltv: "$550", color: "#C9A961", highlight: true },
              ].map((item, i) => (
                <div key={i} className={`text-center p-4 rounded-xl ${item.highlight ? "shadow-lg" : ""}`}
                  style={{ background: item.highlight ? "#1F3864" : "transparent" }}>
                  <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: item.highlight ? "#C9A961" : item.color }}>{item.ltv}</div>
                  <div className="text-sm font-semibold" style={{ color: item.highlight ? "#FFFFFF" : "#6B7280" }}>{item.company}</div>
                  {item.highlight && <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>경쟁사 대비 2.8배</div>}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── 팀 ─────────────────────────────────────────────────────── */}
      <section id="team" className="py-24 px-6" style={{ background: "#F8FAFF" }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="팀 소개"
            title="실행하는 창업자"
            subtitle="1인 멀티 역할로 제품기획·디자인·재무를 직접 담당. 글로벌 유언 플랫폼 1위를 향한 집념."
          />

          <div className="grid md:grid-cols-3 gap-8">
            <FadeIn className="md:col-span-1">
              <div className="p-8 rounded-2xl text-center" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(31,56,100,0.08)" }}>
                <div className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                  style={{ background: "linear-gradient(135deg, #1F3864 0%, #2d4f8a 100%)" }}>
                  👤
                </div>
                <h3 className="text-xl font-bold mb-1" style={{ color: "#1F3864" }}>라수환 (Jeff Lah)</h3>
                <div className="text-sm mb-4" style={{ color: "#C9A961" }}>대표이사 · 창업자</div>
                <div className="text-sm mb-6" style={{ color: "#6B7280" }}>주식회사 사람 (SARAM Inc.)</div>
                <div className="space-y-2 text-left">
                  {[
                    "제품기획 · 디자인",
                    "회계 · 재무",
                    "글로벌 전략",
                    "디자이너 출신 창업자",
                  ].map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span style={{ color: "#C9A961" }}>✓</span>
                      <span style={{ color: "#374151" }}>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2} className="md:col-span-2">
              <div className="space-y-4 h-full">
                <div className="p-6 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
                  <h4 className="font-bold mb-3" style={{ color: "#1F3864" }}>채용 중인 핵심 포지션</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { role: "CTO / 풀스택 개발자", priority: "최우선" },
                      { role: "법률 자문 (변호사)", priority: "우선" },
                      { role: "일본 시장 매니저", priority: "2차" },
                      { role: "마케팅 리드", priority: "우선" },
                      { role: "Badge 제조 파트너", priority: "2차" },
                      { role: "글로벌 BD", priority: "장기" },
                    ].map((pos, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg text-sm"
                        style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}>
                        <span style={{ color: "#374151" }}>{pos.role}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: pos.priority === "최우선" ? "#FEF3C7" : pos.priority === "우선" ? "#DBEAFE" : "#F3F4F6", color: pos.priority === "최우선" ? "#92400E" : pos.priority === "우선" ? "#1E40AF" : "#6B7280" }}>
                          {pos.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl" style={{ background: "linear-gradient(135deg, #1F3864 0%, #2d4f8a 100%)" }}>
                  <h4 className="font-bold mb-3" style={{ color: "#C9A961" }}>투자금 사용 계획</h4>
                  <div className="space-y-3">
                    {[
                      { item: "개발팀 채용 (CTO + 개발자 2명)", pct: 40 },
                      { item: "마케팅 · 고객 획득", pct: 25 },
                      { item: "법률 · 규제 대응", pct: 15 },
                      { item: "Badge 제조 · 재고", pct: 12 },
                      { item: "운영 · 기타", pct: 8 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span style={{ color: "rgba(255,255,255,0.85)" }}>{item.item}</span>
                          <span style={{ color: "#C9A961" }}>{item.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                          <motion.div className="h-full rounded-full" style={{ background: "#C9A961", width: `${item.pct}%` }}
                            initial={{ width: 0 }} whileInView={{ width: `${item.pct}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }} viewport={{ once: true }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 투자 문의 ───────────────────────────────────────────────── */}
      <section id="contact" className="py-24 px-6" style={{ background: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="투자 문의"
            title="함께 만들어갈 투자자를 찾습니다"
            subtitle="Series A · 목표 투자금 $5~10M · 기업가치 협의"
          />

          {submitted ? (
            <FadeIn>
              <div className="text-center py-16 px-8 rounded-2xl" style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", border: "1px solid #BBF7D0" }}>
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2" style={{ color: "#166534" }}>문의가 접수됐습니다</h3>
                <p className="text-lg mb-4" style={{ color: "#166534" }}>48시간 이내에 연락드리겠습니다.</p>
                <p className="text-sm" style={{ color: "#6B7280" }}>이메일: wadokdo@hanmail.net</p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <form onSubmit={handleSubmit} className="p-8 rounded-2xl space-y-6"
                style={{ background: "#FAFAFA", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(31,56,100,0.06)" }}>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { key: "name", label: "성함 *", placeholder: "홍길동", type: "text" },
                    { key: "company", label: "회사/기관명 *", placeholder: "ABC 벤처스", type: "text" },
                    { key: "email", label: "이메일 *", placeholder: "investor@company.com", type: "email" },
                    { key: "amount", label: "투자 희망 금액", placeholder: "예: $1M, ₩10억", type: "text" },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={contactForm[field.key as keyof typeof contactForm]}
                        onChange={e => setContactForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        required={field.label.includes("*")}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "#FFFFFF", border: "1px solid #D1D5DB", color: "#1A1A1A" }}
                        onFocus={e => e.target.style.borderColor = "#1F3864"}
                        onBlur={e => e.target.style.borderColor = "#D1D5DB"}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>문의 내용 *</label>
                  <textarea
                    rows={5}
                    placeholder="투자 관심 배경, 질문 사항, 미팅 희망 일정 등을 자유롭게 작성해주세요."
                    value={contactForm.message}
                    onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                    style={{ background: "#FFFFFF", border: "1px solid #D1D5DB", color: "#1A1A1A" }}
                    onFocus={e => e.target.style.borderColor = "#1F3864"}
                    onBlur={e => e.target.style.borderColor = "#D1D5DB"}
                  />
                </div>
                <button type="submit"
                  className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: "linear-gradient(135deg, #1F3864 0%, #2d4f8a 100%)", color: "#C9A961" }}>
                  투자 문의 보내기 →
                </button>
                <p className="text-center text-xs" style={{ color: "#9CA3AF" }}>
                  또는 직접 연락: <strong>wadokdo@hanmail.net</strong> · 주식회사 사람 (SARAM Inc.)
                </p>
              </form>
            </FadeIn>
          )}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="py-12 px-6 text-center" style={{ background: "#0d1f3c" }}>
        <div className="text-2xl font-bold mb-2" style={{ color: "#C9A961" }}>SARAM</div>
        <div className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>주식회사 사람 · 대표 라수환 (Jeff Lah)</div>
        <div className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>wadokdo@hanmail.net</div>
        <div className="flex justify-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          <Link href="/"><span className="hover:text-white cursor-pointer transition-colors">메인 사이트</span></Link>
          <Link href="/write"><span className="hover:text-white cursor-pointer transition-colors">유언장 작성</span></Link>
          <Link href="/tax"><span className="hover:text-white cursor-pointer transition-colors">상속세 계산기</span></Link>
        </div>
        <div className="mt-8 text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          © 2026 SARAM Inc. All rights reserved. · 본 자료는 투자 권유가 아니며, 투자 결정 시 추가 실사를 권장합니다.
        </div>
      </footer>
    </div>
  );
}
