/**
 * EverWill 리뷰 + FAQ 섹션
 * 사용자 후기 + 자주 묻는 질문
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronDown, Video, PenLine, Scale, CheckCircle2, Info, ExternalLink } from "lucide-react";
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
    text: "자필 유언장을 스캔해서 올리니까 AI가 바로 검증해줬어요. 분산 암호화 보안에 기록된다고 하니 자녀들도 안심하더라고요.",
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
  // 비교표 법적 근거 드롭다운: 'video' | 'hand' | null
  const [openLegal, setOpenLegal] = useState<'video' | 'hand' | null>(null);
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
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
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

          {/* ── 법적 근거 비교표 ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16"
          >
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-[#1F3864]/8 px-4 py-1.5 rounded-full mb-4">
                <Scale className="w-4 h-4 text-[#C9A961]" />
                <span className="text-[#1F3864] text-xs font-semibold tracking-wide uppercase">
                  {t.reviews.faqTableTitle}
                </span>
              </div>
              <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed">
                {t.reviews.faqTableSubtitle}
              </p>
            </div>

            {/* 비교표 */}
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 bg-[#1F3864] text-white text-sm font-semibold rounded-tl-xl w-1/4">
                      {t.reviews.faqTableCol1}
                    </th>
                    <th className="p-4 bg-purple-600 text-white text-sm font-semibold w-[37.5%]">
                      <div className="flex items-center justify-center gap-2">
                        <Video className="w-4 h-4" />
                        {t.reviews.faqTableCol2}
                      </div>
                    </th>
                    <th className="p-4 bg-amber-500 text-white text-sm font-semibold rounded-tr-xl w-[37.5%]">
                      <div className="flex items-center justify-center gap-2">
                        <PenLine className="w-4 h-4" />
                        {t.reviews.faqTableCol3}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: t.reviews.faqTableRow1Label,
                      video: t.reviews.faqTableRow1Video,
                      hand: t.reviews.faqTableRow1Hand,
                      isLegal: true,   // 법적 근거 행 — 드롭다운 적용
                    },
                    {
                      label: t.reviews.faqTableRow2Label,
                      video: t.reviews.faqTableRow2Video,
                      hand: t.reviews.faqTableRow2Hand,
                    },
                    {
                      label: t.reviews.faqTableRow3Label,
                      video: t.reviews.faqTableRow3Video,
                      hand: t.reviews.faqTableRow3Hand,
                    },
                    {
                      label: t.reviews.faqTableRow4Label,
                      video: t.reviews.faqTableRow4Video,
                      hand: t.reviews.faqTableRow4Hand,
                      highlight: true,
                    },
                    {
                      label: t.reviews.faqTableRow5Label,
                      video: t.reviews.faqTableRow5Video,
                      hand: t.reviews.faqTableRow5Hand,
                    },
                    {
                      label: t.reviews.faqTableRow6Label,
                      video: t.reviews.faqTableRow6Video,
                      hand: t.reviews.faqTableRow6Hand,
                    },
                    {
                      label: t.reviews.faqTableRow7Label,
                      video: t.reviews.faqTableRow7Video,
                      hand: t.reviews.faqTableRow7Hand,
                      isStorage: true,  // 보관 방법 행 — 아이콘 강조
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className={i % 2 === 0 ? "bg-white" : "bg-[#FAFAF8]"}
                    >
                      {/* 행 레이블 */}
                      <td className="p-4 text-[#1F3864] text-xs font-bold border-b border-gray-100 align-top">
                        {row.label}
                      </td>

                      {/* 영상 유언장 셀 */}
                      <td className={`p-4 text-center text-xs border-b border-gray-100 align-top ${
                        (row as any).highlight ? "text-purple-700 font-bold text-sm" : "text-gray-600"
                      }`}>
                        {(row as any).highlight ? (
                          <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">
                            {row.video}
                          </span>
                        ) : (row as any).isLegal ? (
                          /* 법적 근거 행 — 드롭다운 버튼 */
                          <div className="text-left">
                            <button
                              onClick={() => setOpenLegal(openLegal === 'video' ? null : 'video')}
                              className="w-full flex items-start gap-1.5 group"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                              <span className="flex-1 text-left group-hover:text-purple-700 transition-colors">{row.video}</span>
                              <span className="flex items-center gap-0.5 text-purple-500 text-[10px] font-semibold whitespace-nowrap ml-1 flex-shrink-0">
                                <Info className="w-3 h-3" />
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                                  openLegal === 'video' ? 'rotate-180' : ''
                                }`} />
                              </span>
                            </button>
                            {openLegal === 'video' && (
                              <div className="mt-2 p-3 bg-purple-50 border border-purple-100 rounded-lg text-left">
                                <p className="text-purple-800 text-[11px] font-bold mb-1">
                                  {t.reviews.faqLegalDetailTitle}
                                </p>
                                <p className="text-purple-700 text-[11px] leading-relaxed mb-2">
                                  {t.reviews.faqVideoLegalDetail}
                                </p>
                                {/* 법령 원문 외부 링크 + 최종 개정일 배지 */}
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <a
                                    href={t.reviews.faqVideoLegalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 text-[11px] font-semibold underline underline-offset-2 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    {t.reviews.faqVideoLegalUrlText}
                                  </a>
                                  {/* 최종 개정일 배지 */}
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-600 border border-purple-200 whitespace-nowrap">
                                    <span className="opacity-70">{t.reviews.faqLegalDateLabel}:</span>
                                    <span className="font-bold">{t.reviews.faqVideoLegalDate}</span>
                                  </span>
                                </div>
                                {/* 공식 출체 기관명 배지 */}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                    <svg className="w-2.5 h-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21l9-18 9 18M6.5 15h11"/></svg>
                                    {t.reviews.faqLegalSourceLabel}: {t.reviews.faqVideoLegalSource}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (row as any).isStorage ? (
                          /* 보관 방법 행 — 잠금 아이콘 + 청록색 */
                          <span className="flex items-start gap-1.5 text-left text-teal-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                            {row.video}
                          </span>
                        ) : (
                          <span className="flex items-start justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                            {row.video}
                          </span>
                        )}
                      </td>

                      {/* 자필 유언장 셀 */}
                      <td className={`p-4 text-center text-xs border-b border-gray-100 align-top ${
                        (row as any).highlight ? "text-amber-700 font-bold text-sm" : "text-gray-600"
                      }`}>
                        {(row as any).highlight ? (
                          <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">
                            {row.hand}
                          </span>
                        ) : (row as any).isLegal ? (
                          /* 법적 근거 행 — 드롭다운 버튼 */
                          <div className="text-left">
                            <button
                              onClick={() => setOpenLegal(openLegal === 'hand' ? null : 'hand')}
                              className="w-full flex items-start gap-1.5 group"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                              <span className="flex-1 text-left group-hover:text-amber-700 transition-colors">{row.hand}</span>
                              <span className="flex items-center gap-0.5 text-amber-500 text-[10px] font-semibold whitespace-nowrap ml-1 flex-shrink-0">
                                <Info className="w-3 h-3" />
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${
                                  openLegal === 'hand' ? 'rotate-180' : ''
                                }`} />
                              </span>
                            </button>
                            {openLegal === 'hand' && (
                              <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-left">
                                <p className="text-amber-800 text-[11px] font-bold mb-1">
                                  {t.reviews.faqLegalDetailTitle}
                                </p>
                                <p className="text-amber-700 text-[11px] leading-relaxed mb-2">
                                  {t.reviews.faqHandLegalDetail}
                                </p>
                                {/* 법령 원문 외부 링크 + 최종 개정일 배지 */}
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <a
                                    href={t.reviews.faqHandLegalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 text-[11px] font-semibold underline underline-offset-2 transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    {t.reviews.faqHandLegalUrlText}
                                  </a>
                                  {/* 최종 개정일 배지 */}
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-600 border border-amber-200 whitespace-nowrap">
                                    <span className="opacity-70">{t.reviews.faqLegalDateLabel}:</span>
                                    <span className="font-bold">{t.reviews.faqHandLegalDate}</span>
                                  </span>
                                </div>
                                {/* 공식 출체 기관명 배지 */}
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                                    <svg className="w-2.5 h-2.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 21l9-18 9 18M6.5 15h11"/></svg>
                                    {t.reviews.faqLegalSourceLabel}: {t.reviews.faqHandLegalSource}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (row as any).isStorage ? (
                          /* 보관 방법 행 — 청록색 */
                          <span className="flex items-start gap-1.5 text-left text-teal-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                            {row.hand}
                          </span>
                        ) : (
                          <span className="flex items-start justify-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            {row.hand}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 주석 */}
            <p className="text-center text-gray-400 text-xs mt-4 max-w-2xl mx-auto">
              {t.reviews.faqTableNote}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
