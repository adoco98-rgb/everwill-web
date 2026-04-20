/**
 * SARAM 변호사 마켓플레이스 섹션
 * "평소엔 0%, 사망 후 100%" 철학 강조
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Scale, Clock, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";

const phases = [
  {
    phase: "Phase A",
    title: "생전 자문 (옵션)",
    subtitle: "5-10% 사용자만",
    icon: Scale,
    color: "border-[#C9A961]/30 bg-[#C9A961]/5",
    iconColor: "text-[#C9A961]",
    items: [
      "복잡한 자산 구조만 변호사 상담",
      "매칭 수수료 ₩30,000~",
      "1:1 전문가 화상 상담",
      "문서 검토 + Q&A",
    ],
  },
  {
    phase: "Phase B",
    title: "사후 집행 (필수)",
    subtitle: "90% 케이스",
    icon: CheckCircle2,
    color: "border-[#1F3864] bg-[#1F3864]/5",
    iconColor: "text-[#1F3864]",
    items: [
      "유언 효력 확인 (가정법원 검인)",
      "상속세 신고 + 부동산 이전",
      "금융자산 인출 대행",
      "플랫폼 수수료: 변호사 보수 15-25%",
    ],
  },
];

const timeline = [
  { year: "Year 1", desc: "큐레이션형 직접 영입 10명" },
  { year: "Year 2-3", desc: "반 마켓플레이스 50-100명" },
  { year: "Year 4+", desc: "오픈 마켓플레이스 수백 명" },
];

export default function LawyersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="lawyers" className="py-20 lg:py-28 bg-[#FAFAF8]" ref={ref}>
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
            변호사 마켓플레이스
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            평소엔 변호사 0%, 사망 후 100%.
            <br />
            진짜 필요한 순간에만 등장하는 전문가.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {phases.map((p, i) => (
            <motion.div
              key={p.phase}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`rounded-2xl p-8 border-2 ${p.color}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <p.icon className={`w-6 h-6 ${p.iconColor}`} />
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p.phase}</span>
              </div>
              <h3 className="text-xl font-bold text-[#1F3864] mb-1">{p.title}</h3>
              <p className="text-[#C9A961] text-sm font-semibold mb-6">{p.subtitle}</p>
              <ul className="space-y-3">
                {p.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* 영입 타임라인 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="bg-[#1F3864] rounded-2xl p-8"
        >
          <div className="flex items-center gap-2 mb-8">
            <Users className="w-5 h-5 text-[#C9A961]" />
            <h3 className="text-white font-bold text-lg">변호사 영입 로드맵</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {timeline.map((t, i) => (
              <div key={t.year} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#C9A961] flex items-center justify-center text-[#1F3864] font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="hidden sm:block w-full h-0.5 bg-[#C9A961]/30 mt-4" />
                  )}
                </div>
                <div>
                  <div className="text-[#C9A961] font-bold text-sm mb-1">{t.year}</div>
                  <div className="text-white/70 text-sm">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Clock className="w-4 h-4 text-[#C9A961]" />
              <span>사후 집행 평균 소요: 3-6개월</span>
            </div>
            <button
              onClick={() => toast.info("변호사 등록 신청 준비 중입니다")}
              className="btn-gold px-6 py-2.5 rounded-full text-sm font-semibold"
            >
              변호사로 등록하기
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
