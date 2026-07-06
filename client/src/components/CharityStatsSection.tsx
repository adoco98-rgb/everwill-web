/**
 * EverWill 사회기부 섹션 - 노인복지 전용 (랜딩 페이지)
 * 기부 폼은 대시보드(로그인 후)에서만 제공
 * 여기서는 에버윌의 노인복지 지원 의지를 안내만 함
 */
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const BANNER_IMG = "/manus-storage/elderly-welfare-2_8647a9e2.webp";
const CARE_IMG = "/manus-storage/elderly-welfare-1_fb890531.jpg";
const SUPPORT_AREAS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/elderly-welfare-support-areas-65KjjE5ALCWx99ndFtPtJc.webp";

export default function CharityStatsSection() {
  return (
    <section className="bg-gradient-to-b from-[#0d1f3c] to-[#1F3864] text-white relative overflow-hidden">

      {/* ── 히어로 배너 ── */}
      <div className="relative w-full h-[360px] md:h-[460px] overflow-hidden">
        <img
          src={BANNER_IMG}
          alt="노인복지 지원"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d1f3c]/30 via-transparent to-[#0d1f3c]/90" />
        <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/30 border border-[#C9A961]/50 rounded-full px-4 py-1.5 mb-4 backdrop-blur-sm">
              <Heart className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-semibold">노인복지 기부</span>
            </div>
            <h2
              className="text-2xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg leading-snug"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              나의 마지막 선물,<br />노인분들께 사랑과 희망을
            </h2>
          </motion.div>
        </div>
      </div>

      {/* ── 핵심 메시지 ── */}
      <div className="relative max-w-4xl mx-auto px-4 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <img
              src={CARE_IMG}
              alt="노인 돌봄"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C9A961]/50 shadow-lg"
            />
          </div>
          <blockquote className="text-lg md:text-2xl font-semibold text-white/90 leading-relaxed mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            "세계의 모든 빈곤노인들과 독거노인,<br className="hidden md:block" />
            어렵고 힘든 상황에 놓인 노인분들께<br className="hidden md:block" />
            사랑과 희망을 드립니다."
          </blockquote>
          <p className="text-[#C9A961] text-lg font-bold">
            에버윌이 함께 합니다.
          </p>
        </motion.div>
      </div>

      {/* ── 지원 분야 이미지 ── */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={SUPPORT_AREAS_IMG}
            alt="에버윌이 지원하는 노인복지 분야 - 빈곤해결, 사업지원, 돌봄서비스, 의료건강, 문화여가"
            className="w-full rounded-2xl shadow-2xl"
          />
        </motion.div>
      </div>

      {/* ── 노인 빈곤 현실 통계 ── */}
      <div className="max-w-3xl mx-auto px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-[#C9A961] mb-1">40.4%</p>
              <p className="text-white/60 text-xs">한국 노인 상대적 빈곤율<br />(OECD 1위)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#C9A961] mb-1">190만</p>
              <p className="text-white/60 text-xs">독거노인 수<br />(2025년 기준)</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#C9A961] mb-1">매일 36명</p>
              <p className="text-white/60 text-xs">노인 고독사 발생<br />(연간 13,000명 이상)</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── CTA: 가입 후 기부 참여 안내 ── */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <p className="text-white/60 text-sm mb-6">
            에버윌 회원이 되시면 유언장에 기부 의사를 기록하거나,<br />
            즉시 기부에 참여하실 수 있습니다.
          </p>
          <Link href="/signup">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C9A961] to-[#a88840] text-white font-bold px-8 py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-lg">
              <Heart className="w-5 h-5" />
              무료 가입하고 기부에 참여하기
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>

          <p className="text-white/30 text-xs mt-8 leading-relaxed">
            * 기부 유언은 유언자 사망 확인 후 EverWill이 선정한 노인복지 단체에 전달됩니다.<br />
            * 기부 금액은 상속 자산에서 우선 공제 후 집행됩니다.<br />
            * 집행 결과는 유족에게 투명하게 보고됩니다.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
