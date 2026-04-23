/**
 * 기존 공증 vs EverWill 전자공증 비교 섹션
 * 텍스트 크게 + 진하게 강화
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check, Clock, DollarSign, FileText, Users, AlertTriangle, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ComparisonSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const { language } = useLanguage();
  const isKo = language === "ko";

  const rows = [
    {
      icon: DollarSign,
      label: isKo ? "총 비용" : "Total Cost",
      traditional: isKo ? "₩300,000 ~ ₩1,500,000+" : "₩300K ~ ₩1.5M+",
      traditionalSub: isKo ? "변호사 수임료 + 공증료 + 증인 교통비 등" : "Attorney fee + notary fee + witness costs",
      everwill: "₩49,000",
      everwillSub: isKo ? "모든 비용 포함 (1년 무료 보관)" : "All-inclusive (1yr free storage)",
      highlight: true,
    },
    {
      icon: Clock,
      label: isKo ? "소요 시간" : "Time Required",
      traditional: isKo ? "2주 ~ 2개월" : "2 weeks ~ 2 months",
      traditionalSub: isKo ? "변호사 예약 → 상담 → 작성 → 공증 → 보관" : "Book attorney → consult → draft → notarize → store",
      everwill: isKo ? "17분" : "17 minutes",
      everwillSub: isKo ? "AI 체크박스 마법사로 즉시 완성" : "AI checkbox wizard — done instantly",
      highlight: true,
    },
    {
      icon: Users,
      label: isKo ? "증인" : "Witnesses",
      traditional: isKo ? "증인 2명 필수" : "2 witnesses required",
      traditionalSub: isKo ? "직접 섭외, 서명, 날인 — 번거롭고 비용 발생" : "Must recruit, sign, seal — costly & inconvenient",
      everwill: isKo ? "불필요" : "Not required",
      everwillSub: isKo ? "eKYC 본인인증으로 대체" : "Replaced by eKYC identity verification",
      highlight: false,
    },
    {
      icon: FileText,
      label: isKo ? "법적 효력" : "Legal Validity",
      traditional: isKo ? "공증 유언장" : "Notarized Will",
      traditionalSub: isKo ? "민법 제1068조 공증인 유언" : "Civil Act §1068 notarial will",
      everwill: isKo ? "전자 인증 유언장" : "E-Certified Will",
      everwillSub: isKo ? "eKYC + 블록체인 타임스탬프 + RFC 3161" : "eKYC + blockchain timestamp + RFC 3161",
      highlight: false,
    },
    {
      icon: AlertTriangle,
      label: isKo ? "분실·훼손 위험" : "Loss / Damage Risk",
      traditional: isKo ? "높음" : "High",
      traditionalSub: isKo ? "종이 원본 분실 시 효력 없음. 발견 안 되는 경우 다수" : "Lost paper = invalid. Many wills are never found",
      everwill: isKo ? "없음" : "None",
      everwillSub: isKo ? "암호화 클라우드 + 블록체인 영구 보존" : "Encrypted cloud + blockchain permanent storage",
      highlight: false,
    },
    {
      icon: Zap,
      label: isKo ? "사후 집행" : "Post-Death Execution",
      traditional: isKo ? "가족이 직접 진행" : "Family must handle everything",
      traditionalSub: isKo ? "법원 검인 → 변호사 선임 → 상속 절차 → 수개월 소요" : "Court probate → hire attorney → months of process",
      everwill: isKo ? "자동 집행" : "Auto Execution",
      everwillSub: isKo ? "4중 사망 감지 → 상속자 자동 알림 → 변호사 자동 매칭" : "4-layer detection → auto notify heirs → auto lawyer match",
      highlight: false,
    },
  ];

  return (
    <section id="comparison" className="py-20 lg:py-28 bg-[#F5F4F0]" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2
            className="text-4xl lg:text-6xl font-extrabold text-[#1F3864] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {isKo ? "왜 EverWill인가?" : "Why EverWill?"}
          </h2>
          <p className="text-gray-700 text-xl font-semibold max-w-2xl mx-auto">
            {isKo
              ? "기존 공증 방식과 EverWill 전자공증을 직접 비교해보세요."
              : "Compare traditional notarization with EverWill's digital certification."}
          </p>
        </motion.div>

        {/* ── 테이블 헤더 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-2 mb-3 px-1"
        >
          <div className="text-xs sm:text-base font-extrabold text-gray-500 uppercase tracking-wider flex items-center">
            {isKo ? "비교 항목" : "Category"}
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-red-50 border-2 border-red-300 rounded-xl px-2 sm:px-5 py-1.5 sm:py-2.5">
              <X className="w-3 h-3 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
              <span className="text-xs sm:text-base font-extrabold text-red-600 leading-tight">
                {isKo ? "기존 공증" : "Traditional"}
              </span>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-[#1F3864] rounded-xl px-2 sm:px-5 py-1.5 sm:py-2.5">
              <Check className="w-3 h-3 sm:w-5 sm:h-5 text-[#C9A961] flex-shrink-0" />
              <span className="text-xs sm:text-base font-extrabold text-white">EverWill</span>
            </div>
          </div>
        </motion.div>

        {/* ── 비교 행 ── */}
        <div className="space-y-2 sm:space-y-3">
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                className="grid grid-cols-3 gap-0 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden"
              >
                {/* 항목명 */}
                <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-5 py-3 sm:py-5 bg-gray-50 border-r-2 border-gray-100">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#1F3864]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#1F3864]" />
                  </div>
                  <span className="font-extrabold text-[#1F3864] text-xs sm:text-base leading-tight">{row.label}</span>
                </div>

                {/* 기존 공증 */}
                <div className="px-2 sm:px-5 py-3 sm:py-5 border-r-2 border-gray-100">
                  <div className="flex items-start gap-1 sm:gap-2">
                    <X className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className={`font-extrabold leading-tight ${row.highlight ? "text-red-600 text-sm sm:text-xl" : "text-gray-800 text-xs sm:text-base"}`}>
                        {row.traditional}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-500 mt-0.5 sm:mt-1 leading-snug font-medium hidden sm:block">{row.traditionalSub}</div>
                    </div>
                  </div>
                </div>

                {/* EverWill */}
                <div className={`px-2 sm:px-5 py-3 sm:py-5 ${row.highlight ? "bg-[#1F3864]/5" : ""}`}>
                  <div className="flex items-start gap-1 sm:gap-2">
                    <Check className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#C9A961] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className={`font-extrabold leading-tight ${row.highlight ? "text-[#1F3864] text-sm sm:text-xl" : "text-gray-800 text-xs sm:text-base"}`}>
                        {row.everwill}
                      </div>
                      <div className="text-[10px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-snug font-medium hidden sm:block">{row.everwillSub}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── 요약 배너 ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 bg-[#1F3864] rounded-2xl p-10 text-center"
        >
          <div className="text-white/70 text-base mb-5 font-semibold">
            {isKo ? "기존 공증 대비 EverWill" : "EverWill vs Traditional Notary"}
          </div>
          <div className="flex justify-center gap-16 flex-wrap">
            <div>
              <div className="text-6xl font-extrabold text-[#C9A961]">97%</div>
              <div className="text-white text-lg font-bold mt-2">{isKo ? "비용 절감" : "Cost Savings"}</div>
            </div>
            <div className="w-px bg-white/20 hidden sm:block" />
            <div>
              <div className="text-6xl font-extrabold text-[#C9A961]">99%</div>
              <div className="text-white text-lg font-bold mt-2">{isKo ? "시간 단축" : "Time Saved"}</div>
            </div>
            <div className="w-px bg-white/20 hidden sm:block" />
            <div>
              <div className="text-6xl font-extrabold text-[#C9A961]">100%</div>
              <div className="text-white text-lg font-bold mt-2">{isKo ? "분실 위험 제거" : "Zero Loss Risk"}</div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
