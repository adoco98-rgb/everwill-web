/**
 * EverWill 신뢰 지표 섹션
 * EverWill 독자적 강점 6가지 — 비교 없음
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Globe2, Zap, Lock, Scale, Heart, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const strengthColors = [
  "bg-amber-50 text-amber-600",
  "bg-green-50 text-green-600",
  "bg-blue-50 text-blue-600",
  "bg-indigo-50 text-indigo-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
];

const strengthIcons = [Zap, ShieldCheck, Globe2, Lock, Scale, Heart];

const INITIAL_COUNT = 10;

export default function TrustSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { t, language } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  // DB에서 공개 뉴스 목록 조회
  const { data: newsItems, isLoading: newsLoading } = trpc.news.getPublic.useQuery();

  const strengths = [
    { title: t.trust.s1Title, description: t.trust.s1Desc },
    { title: t.trust.s2Title, description: t.trust.s2Desc },
    { title: t.trust.s3Title, description: t.trust.s3Desc },
    { title: t.trust.s4Title, description: t.trust.s4Desc },
    { title: t.trust.s5Title, description: t.trust.s5Desc },
    { title: t.trust.s6Title, description: t.trust.s6Desc },
  ];

  return (
    <section className="py-16 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 글로벌 뉴스 게시판 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[#C9A961] text-xs font-semibold tracking-widest uppercase mb-1">MEDIA & PARTNERS</p>
              <h3 className="text-xl font-bold text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {language === 'ko' ? '미디어 & 파트너' :
                 language === 'ja' ? 'メディア & パートナー' :
                 language === 'zh' ? '媒体 & 合作伙伴' :
                 language === 'ar' ? 'الإعلام والشركاء' :
                 'Media & Partners'}
              </h3>
            </div>
          </div>

                    {/* 뉴스 카드 그리드 */}
          {newsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-5 animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-200 rounded w-20" />
                      <div className="h-2 bg-gray-100 rounded w-12" />
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-2 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : !newsItems || newsItems.length === 0 ? null : (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(showAll ? newsItems : newsItems.slice(0, INITIAL_COUNT)).map((item, i) => (
                <motion.a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-[#C9A961]/30 transition-all"
                >
                  {/* 카드 상단: 국기 + 신문사 + 날짜 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.flag}</span>
                      <div>
                        <p className="text-[#1F3864] font-bold text-sm leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                          {item.outlet}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">{item.country}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-300">{item.publishedAt || ''}</span>
                  </div>
                  {/* 구분선 */}
                  <div className="w-8 h-0.5 bg-[#C9A961]/40 mb-3 group-hover:w-full transition-all duration-500" />
                  {/* 뉴스 제목 */}
                  <p className="text-gray-700 text-sm font-medium leading-snug mb-3 line-clamp-3">
                    {item.title}
                  </p>
                  {/* 요약 */}
                  {item.summary && (
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  )}
                  {/* 하단 태그 */}
                  <div className="flex items-center justify-between mt-4">
                    {item.tag ? (
                      <span className="text-xs bg-[#1F3864]/5 text-[#1F3864] rounded-full px-2.5 py-0.5 font-medium">
                        {item.tag}
                      </span>
                    ) : <span />}
                    <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#C9A961] transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>

            {/* 더보기 / 접기 버튼 */}
            {newsItems.length > INITIAL_COUNT && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setShowAll(prev => !prev)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#C9A961]/40 text-[#1F3864] text-sm font-semibold hover:bg-[#C9A961]/10 transition-all"
                >
                  {showAll ? (
                    <span className="flex items-center gap-2"><ChevronUp className="w-4 h-4" /> {language === 'ko' ? '접기' : 'Show less'}</span>
                  ) : (
                    <span className="flex items-center gap-2"><ChevronDown className="w-4 h-4" /> {language === 'ko' ? `더보기 (+${newsItems.length - INITIAL_COUNT}개)` : `Show more (+${newsItems.length - INITIAL_COUNT})`}</span>
                  )}
                </button>
              </div>
            )}
            </>
          )}
        </motion.div>


      </div>
    </section>
  );
}
