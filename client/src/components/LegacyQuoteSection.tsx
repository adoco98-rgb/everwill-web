/**
 * LegacyQuoteSection
 * ServicesSection 바로 위에 위치하는 감성 문구 + 이미지 배너
 * "지금까지 세상을 참 열심히 행복하게 잘 살았습니다..."
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const COUPLE_IMAGE = "/manus-storage/legacy-couple_b16b465f.jpg";
const FAMILY_IMAGE = "/manus-storage/happy-couple_0b7b4216.jpg";

export default function LegacyQuoteSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 레이아웃: 좌측 문구 + 우측 이미지 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* 좌측: 감성 문구 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* 골드 장식선 */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-0.5 bg-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-semibold tracking-widest uppercase">
                EverWill Message
              </span>
            </div>

            {/* 메인 문구 */}
            <div className="space-y-4">
              <h2
                className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#1F3864] leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                지금까지 세상을
                <br />
                <span className="text-[#C9A961]">참 열심히,</span>
                <br />
                행복하게 잘 살았습니다.
              </h2>

              <div className="w-16 h-1 bg-gradient-to-r from-[#C9A961] to-transparent rounded-full" />

              <p
                className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-[#1F3864] leading-relaxed"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                이제 내가 사랑하고
                <br />
                아끼는 사람들을 위해
                <br />
                <em className="text-[#C9A961] not-italic">내가 해야 할 사랑을</em>
                <br />
                실천해야 합니다.
              </p>
            </div>

            {/* 서브 문구 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.4 }}
              className="text-lg text-[#6B7280] leading-relaxed border-l-4 border-[#C9A961] pl-5"
            >
              유언장은 죽음을 준비하는 것이 아닙니다.
              <br />
              <strong className="text-[#1F3864]">사랑하는 사람에게 전하는 마지막 선물</strong>입니다.
            </motion.p>
          </motion.div>

          {/* 우측: 이미지 콜라주 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {/* 메인 이미지 (가족 석양) */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={FAMILY_IMAGE}
                alt="가족과 함께하는 소중한 순간"
                className="w-full h-[420px] lg:h-[500px] object-cover"
              />
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/60 via-transparent to-transparent" />
              {/* 하단 문구 오버레이 */}
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  "나의 마지막 서명이<br />당신의 첫 번째 평화가 됩니다"
                </p>
              </div>
            </div>

            {/* 플로팅 작은 이미지 (노부부) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="absolute -bottom-8 -left-8 w-44 h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-white"
            >
              <img
                src={COUPLE_IMAGE}
                alt="노부부의 따뜻한 순간"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* 플로팅 골드 장식 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="absolute -top-6 -right-4 bg-[#1F3864] text-white rounded-2xl px-5 py-4 shadow-xl"
            >
              <p className="text-[#C9A961] text-xs font-semibold tracking-wider uppercase mb-1">EverWill</p>
              <p className="text-white text-sm font-bold">나의 마지막 서명</p>
              <p className="text-white/60 text-xs mt-0.5">당신의 첫 번째 평화</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
