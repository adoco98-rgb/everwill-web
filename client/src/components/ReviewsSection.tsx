/**
 * EverWill 리뷰 + FAQ 섹션
 * 사용자 후기 + 자주 묻는 질문
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// 리뷰는 다국어 번역 없이 원본 유지 (실제 사용자 후기이므로)
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
    age: "64",
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
    age: "66",
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
    age: "60",
    location: "Madrid",
    rating: 5,
    text: "El sistema de Badge es revolucionario. Nunca había visto algo así en ningún servicio de testamentos del mundo.",
    avatar: "M",
  },
];

export default function ReviewsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t } = useLanguage();

  const faqs = [
    { q: t.reviews.faq1q, a: t.reviews.faq1a },
    { q: t.reviews.faq2q, a: t.reviews.faq2a },
    { q: t.reviews.faq3q, a: t.reviews.faq3a },
    { q: t.reviews.faq4q, a: t.reviews.faq4a },
    { q: t.reviews.faq5q, a: t.reviews.faq5a },
    { q: t.reviews.faq6q, a: t.reviews.faq6a },
  ];

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
            {t.reviews.title}
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
              {t.reviews.faqTitle}
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
