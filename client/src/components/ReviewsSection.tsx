/**
 * EverWill 리뷰 + FAQ 섹션
 * 사용자 후기 + 자주 묻는 질문
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronDown } from "lucide-react";

const reviews = [
  {
    name: "김민준",
    age: "58세",
    location: "서울",
    rating: 5,
    text: "17분 만에 유언장을 완성했습니다. 변호사 사무실에 갈 필요도 없고, 복잡한 법률 용어도 없어요. AI가 다 알아서 해줘서 정말 편했습니다.",
    avatar: "김",
  },
  {
    name: "Sarah Johnson",
    age: "64세",
    location: "Los Angeles",
    rating: 5,
    text: "As a Korean-American with assets in both countries, EverWill is the only platform that handles cross-border inheritance. Absolutely essential.",
    avatar: "S",
  },
  {
    name: "이정숙",
    age: "71세",
    location: "부산",
    rating: 5,
    text: "자필 유언장을 스캔해서 올리니까 AI가 바로 검증해줬어요. 블록체인에 기록된다고 하니 자녀들도 안심하더라고요.",
    avatar: "이",
  },
  {
    name: "田中 健一",
    age: "66세",
    location: "東京",
    rating: 5,
    text: "日本語対応で、日本の法律に合わせた遺言書が作れます。Badge システムは世界初の革新的なアイデアです。",
    avatar: "田",
  },
  {
    name: "박성호",
    age: "55세",
    location: "재미교포 · 뉴욕",
    rating: 5,
    text: "미국 자산과 한국 자산을 동시에 관리할 수 있는 서비스가 드디어 나왔네요. Badge도 주문했는데 정말 고급스럽습니다.",
    avatar: "박",
  },
  {
    name: "Maria García",
    age: "60세",
    location: "Madrid",
    rating: 5,
    text: "El sistema de Badge es revolucionario. Nunca había visto algo así en ningún servicio de testamentos del mundo.",
    avatar: "M",
  },
];

const faqs = [
  {
    q: "AI가 작성한 유언장이 법적 효력이 있나요?",
    a: "네. EverWill의 AI 유언장은 변호사가 설계한 법률 템플릿을 기반으로 작성됩니다. eKYC 본인인증 + 전자서명 + 블록체인 타임스탬프를 통해 법적 효력을 갖습니다. 단, 전자 인증(₩49,000) 완료 후 법적 효력이 발생합니다.",
  },
  {
    q: "유언장 수정은 얼마나 자주 할 수 있나요?",
    a: "횟수 제한 없이 수정 가능합니다. 수정 후 재인증 시 ₩15,000만 부과됩니다. Trust & Will($299/년 멤버십)과 달리 필요할 때만 비용이 발생합니다.",
  },
  {
    q: "Badge를 분실하면 어떻게 되나요?",
    a: "Badge 분실 시 앱에서 즉시 비활성화할 수 있습니다. 새 Badge 재발급은 기존 가격의 50%로 가능합니다. 유언장 데이터는 EverWill 서버에 안전하게 보관되어 Badge와 무관하게 유지됩니다.",
  },
  {
    q: "해외 자산도 관리할 수 있나요?",
    a: "네. EverWill은 세계 유일의 멀티관할권 유언 플랫폼입니다. 한국 거주 + 미국 자산 + 일본 자녀 등 복잡한 국제 상속도 각국 법률을 자동 적용하여 처리합니다.",
  },
  {
    q: "4중 사망 감지 시스템이란 무엇인가요?",
    a: "① 가족 신고(1-3일) ② 정부 DB 연동(7-30일) ③ Dead Man's Switch(30-90일) ④ 응급 발견자 신고. 최소 2개 채널 확인 후 유언 집행을 개시하여 허위 신고와 사기를 방지합니다.",
  },
  {
    q: "개인정보는 안전한가요?",
    a: "은행급 E2E 암호화를 적용합니다. ISMS 인증, SOC 2 Type II, GDPR 준수를 목표로 하며, 개인정보는 절대 제3자에게 판매하지 않습니다.",
  },
];

export default function ReviewsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 리뷰 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <div className="section-divider mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1F3864] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            전 세계 사용자의 이야기
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#C9A961] text-[#C9A961]" />
              ))}
            </div>
            <span className="font-semibold text-[#1F3864]">4.9</span>
            <span className="text-gray-400">/ 5.0</span>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-[#FAFAF8] rounded-xl p-6 border border-gray-100 card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1F3864] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {review.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#1F3864] text-sm">{review.name}</div>
                  <div className="text-gray-400 text-xs">{review.age} · {review.location}</div>
                </div>
                <div className="ml-auto flex">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-[#C9A961] text-[#C9A961]" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1F3864] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              자주 묻는 질문
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                className="bg-[#FAFAF8] rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-[#1F3864] text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#C9A961] flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-gray-100 mb-4" />
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
