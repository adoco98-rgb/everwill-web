/**
 * EverWill 서비스 섹션
 * 10가지 핵심 서비스/기능 소개
 * 카드 그리드 레이아웃 + 호버 애니메이션
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  FileText, Video, Scan, Shield, Users,
  Bell, Globe, Smartphone, RefreshCw
} from "lucide-react";

const WILL_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/will-writing-mZuJR6sUxzn2zqDJYs74Qu.webp";
const FAMILY_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/family-legacy-8PohtuBkGJRQqwDgcvoFxd.webp";

const services = [
  {
    icon: FileText,
    title: "AI 체크박스 유언 작성",
    description: "체크 몇 번이면 완성. AI가 법률 문장으로 자동 변환. 단순 케이스 17분.",
    tag: "핵심",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Video,
    title: "영상 유언장",
    description: "법적 녹음 유언 + 가족 감성 메시지. '손녀 성인 되는 날' 자동 전송.",
    tag: "+₩29,000",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Scan,
    title: "자필 유언 스캔 인증",
    description: "자필 유언 사진 업로드 → AI 형식 검증 → 블록체인 무결성 기록.",
    tag: "+₩19,000",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Shield,
    title: "4중 사망 감지 시스템",
    description: "가족 신고 → 정부 DB → Dead Man's Switch → 응급 발견자. 2개 채널 교차 확인.",
    tag: "세계 최초",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Users,
    title: "상속자 직접 등록",
    description: "상속자 정보 직접 입력. 사망 시 현지 언어·시간대 맞춤 자동 알림.",
    tag: "자동화",
    color: "bg-teal-50 text-teal-600",
  },

  {
    icon: Bell,
    title: "생애 이벤트 재인증",
    description: "결혼·출산·이사·자산 변동 시 ₩15,000 재인증. 평생 LTV 28배.",
    tag: "₩15,000",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Globe,
    title: "글로벌 멀티관할권",
    description: "한국 거주 + 미국 자산 + 일본 자녀. 각국 법률 자동 적용. 세계 유일.",
    tag: "글로벌",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Smartphone,
    title: "eKYC 전자 인증",
    description: "NICE평가정보 연동. 얼굴 인식 + 음성 의사 확인. 블록체인 해시 기록.",
    tag: "법적 효력",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: RefreshCw,
    title: "7개 언어 + RTL 지원",
    description: "한·일·중·영·독·스페인어 + 아랍어(RTL). 샤리아 상속법 자동 적용.",
    tag: "7개 언어",
    color: "bg-lime-50 text-lime-600",
  },
];

export default function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#FAFAF8]" ref={ref}>
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
            모든 것이 하나에
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            EverWill의 독자적인 10가지 혁신 서비스. 유언 작성부터 사후 자동 집행까지 전 과정을 책임집니다.
          </p>
        </motion.div>

        {/* 피처 하이라이트 - 이미지 + 텍스트 */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden group"
          >
            <img
              src={WILL_IMAGE}
              alt="유언장 작성 과정"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/80 to-transparent flex items-end p-6">
              <div>
                <span className="inline-block bg-[#C9A961] text-[#1F3864] text-xs font-bold px-3 py-1 rounded-full mb-2">AI 자동 작성</span>
                <h3 className="text-white text-xl font-bold">17분 만에 완성되는 법적 유언장</h3>
                <p className="text-white/70 text-sm mt-1">체크박스 선택 → AI 법률 문장 변환 → 전자 인증</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden group"
          >
            <img
              src={FAMILY_IMAGE}
              alt="가족에게 전달되는 유산"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F3864]/80 to-transparent flex items-end p-6">
              <div>
                <span className="inline-block bg-[#C9A961] text-[#1F3864] text-xs font-bold px-3 py-1 rounded-full mb-2">자동 집행</span>
                <h3 className="text-white text-xl font-bold">가족이 아무것도 하지 않아도 됩니다</h3>
                <p className="text-white/70 text-sm mt-1">4중 사망 감지 → 상속자 자동 알림 → 변호사 매칭</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 서비스 카드 그리드 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              className="bg-white rounded-xl p-5 border border-gray-100 card-hover group cursor-default"
            >
              <div className={`w-10 h-10 rounded-lg ${service.color} flex items-center justify-center mb-3`}>
                <service.icon className="w-5 h-5" />
              </div>
              <div className="mb-2">
                <span className="text-xs font-semibold text-[#C9A961] bg-[#C9A961]/10 px-2 py-0.5 rounded-full">
                  {service.tag}
                </span>
              </div>
              <h3 className="font-bold text-[#1F3864] text-sm mb-2 leading-tight">{service.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
