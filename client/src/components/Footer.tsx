/**
 * EverWill CTA 섹션 + Footer
 * 마지막 전환 유도 + 사이트맵
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Mail, Phone, MapPin, Shield } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const scrollToPricing = () => {
    const el = document.querySelector("#pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* 최종 CTA 섹션 */}
      <section className="py-20 lg:py-28 navy-gradient relative overflow-hidden" ref={ref}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A961]/8 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#C9A961]/15 border border-[#C9A961]/30 rounded-full px-4 py-1.5 mb-8">
              <Shield className="w-4 h-4 text-[#C9A961]" />
              <span className="text-[#C9A961] text-sm font-medium">AI 작성 무료 · 인증만 ₩49,000</span>
            </div>

            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              지금 시작하세요.
              <br />
              <span className="text-[#C9A961]">17분이면 충분합니다.</span>
            </h2>

            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              유언장 작성을 미루는 이유가 복잡하고 비쌀 것 같아서라면,
              EverWill이 그 생각을 바꿔드립니다.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToPricing}
                className="btn-gold flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base font-semibold shadow-lg"
              >
                무료로 유언장 작성 시작
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => toast.info("상담 신청 기능 준비 중입니다")}
                className="flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base font-medium text-white border border-white/30 hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-all duration-300"
              >
                전문가 상담 신청
              </button>
            </div>

            <p className="text-white/30 text-sm mt-8">
              신용카드 불필요 · 언제든 취소 가능 · 데이터 암호화 보장
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f1e36] text-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            {/* 브랜드 */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A961] to-[#a88840] flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-serif">S</span>
                </div>
                <span className="text-white font-bold text-xl">EverWill</span>
              </div>
              <p className="text-sm leading-relaxed mb-6">
                세계 최초 디지털 유언 OS.
                <br />
                유언 작성부터 사후 자동 집행까지.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C9A961]" />
                  <span>서울특별시 강남구</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C9A961]" />
                  <span>hello@saram.io</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C9A961]" />
                  <span>1588-0000</span>
                </div>
              </div>
            </div>

            {/* 서비스 */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">서비스</h4>
              <ul className="space-y-2 text-sm">
                {["AI 유언장 작성", "전자 인증", "영상 유언장", "자필 스캔", "Badge 시스템"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => toast.info("준비 중입니다")}
                      className="hover:text-[#C9A961] transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 회사 */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">회사</h4>
              <ul className="space-y-2 text-sm">
                {["회사 소개", "블로그", "채용", "파트너십", "언론 보도"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => toast.info("준비 중입니다")}
                      className="hover:text-[#C9A961] transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* 지원 */}
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">지원</h4>
              <ul className="space-y-2 text-sm">
                {["고객센터", "FAQ", "이용약관", "개인정보처리방침", "법적 고지"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => toast.info("준비 중입니다")}
                      className="hover:text-[#C9A961] transition-colors"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 골드 구분선 */}
          <div className="gold-line mb-8" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-white/40">
              © 2025 주식회사 사람 (EverWill Inc.) All rights reserved.
            </div>
            <div className="flex items-center gap-4 text-white/40">
              <span>🇰🇷 한국어</span>
              <span>·</span>
              <span>사업자등록번호: 000-00-00000</span>
              <span>·</span>
              <span>통신판매업신고: 제2025-서울강남-0000호</span>
            </div>
          </div>

          <div className="mt-4 text-xs text-white/25 leading-relaxed">
            EverWill은 법률 정보를 제공하는 플랫폼으로, 법률 자문 서비스가 아닙니다. 
            AI가 생성한 유언장은 변호사의 법률 자문을 대체하지 않습니다. 
            복잡한 법적 상황은 반드시 전문 변호사와 상담하시기 바랍니다.
          </div>
        </div>
      </footer>
    </>
  );
}
