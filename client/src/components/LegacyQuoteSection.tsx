/**
 * LegacyQuoteSection
 * ServicesSection 바로 위에 위치하는 감성 문구 + 이미지 배너
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

// AI 생성 이미지: 공원을 걸으며 마주보고 웃는 백인 노부부
const COUPLE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/couple_park_walk-UK2TJN5NaR7gJmsbrvHAxb.webp";

export default function LegacyQuoteSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 레이아웃: 좌측 문구 + 우측 이미지+텍스트 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* 좌측: 감성 문구 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="space-y-8 lg:pt-4"
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

          {/* 우측: 이미지 + 이미지 하단 텍스트 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-0 rounded-3xl overflow-hidden"
          style={{ boxShadow: '0 20px 60px -10px rgba(31, 56, 100, 0.25), 0 8px 24px -4px rgba(31, 56, 100, 0.15), 0 2px 8px rgba(0,0,0,0.08)' }}
          >
            {/* 메인 이미지 - 가로 꽉 차게 */}
            <div className="relative overflow-hidden">
              <img
                src={COUPLE_IMAGE}
                alt="공원을 걷는 행복한 노부부"
                className="w-full h-[420px] lg:h-[480px] object-cover object-center"
                style={{ filter: "saturate(1.2) contrast(1.1)" }}
              />
            </div>

            {/* 이미지 바로 하단 - 가로 꽉 차는 텍스트 배너 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="bg-[#1F3864] rounded-b-3xl px-8 py-6 shadow-xl"
            >
              <p className="text-[#C9A961] text-xs font-semibold tracking-widest uppercase mb-2">EverWill</p>
              <p
                className="text-white text-2xl lg:text-3xl font-bold leading-snug"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                나의 마지막 서명이
                <br />
                <span className="text-[#C9A961]">사랑하는 사람들에게</span>
                <br />
                사랑과 평화를 만들어줍니다
              </p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
