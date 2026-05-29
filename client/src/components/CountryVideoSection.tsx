/**
 * 국가별 유튜브/영상 섹션
 * - VideoIntroSection(서비스 소개 슬라이더) 바로 아래에 위치
 * - 현재 선택된 국가 언어에 맞는 영상 자동 표시
 * - 영상 없으면 한국어(video_kr) fallback
 * - 관리자가 /admin 페이지에서 국가별 URL 등록 가능
 */
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

// 네비게이션 국기 순서와 동일한 국가 코드 매핑
const LANG_TO_VIDEO_KEY: Record<string, string> = {
  ko: "video_kr",
  en: "video_us",
  ja: "video_jp",
  zh: "video_cn",
  de: "video_de",
  es: "video_es",
  ar: "video_ar",
  fr: "video_fr",
  ru: "video_ru",
  hi: "video_in",
  pt: "video_br",
};

const COUNTRY_LABELS: Record<string, string> = {
  video_kr: "🇰🇷 한국",
  video_us: "🇺🇸 미국",
  video_jp: "🇯🇵 일본",
  video_cn: "🇨🇳 중국",
  video_de: "🇩🇪 독일",
  video_es: "🇪🇸 스페인",
  video_ar: "🇸🇦 아랍",
  video_fr: "🇫🇷 프랑스",
  video_ru: "🇷🇺 러시아",
  video_in: "🇮🇳 인도",
  video_br: "🇧🇷 브라질",
};

export default function CountryVideoSection() {
  const { data: videos } = trpc.siteSettings.getVideos.useQuery();

  // 현재 선택 언어 감지 (localStorage 또는 브라우저 언어)
  const currentLang = (() => {
    try {
      const saved = localStorage.getItem("everwill_lang");
      if (saved) return saved;
    } catch {}
    const browserLang = navigator.language.split("-")[0];
    return browserLang;
  })();

  const videoKey = LANG_TO_VIDEO_KEY[currentLang] ?? "video_kr";
  const embedUrl = videos?.[videoKey] ?? videos?.["video_kr"] ?? null;
  const countryLabel = COUNTRY_LABELS[videoKey] ?? COUNTRY_LABELS["video_kr"];

  // 영상이 하나도 없으면 섹션 자체를 숨김
  if (!videos || Object.values(videos).every((v) => !v)) return null;

  return (
    <section className="py-16 bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-bold tracking-widest text-[#C9A961] uppercase mb-2">
            ── EverWill 영상 ──
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F3864]">
            EverWill을 영상으로 만나보세요
          </h2>
          <p className="text-gray-500 mt-3 text-sm md:text-base">
            유언 작성의 중요성과 EverWill 서비스를 영상으로 확인하세요.
          </p>
        </motion.div>

        {/* 영상 플레이어 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          {embedUrl ? (
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={embedUrl}
                title="EverWill 소개 영상"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                style={{ border: "none" }}
              />
            </div>
          ) : (
            /* 영상 없는 경우 플레이스홀더 */
            <div className="w-full rounded-3xl bg-[#1F3864]/5 border-2 border-dashed border-[#1F3864]/20 flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#1F3864]/10 flex items-center justify-center">
                <Play className="w-8 h-8 text-[#1F3864]/40" />
              </div>
              <p className="text-[#1F3864]/40 text-sm">현재 선택된 국가의 영상이 준비 중입니다.</p>
            </div>
          )}

          {/* 국가 라벨 */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {countryLabel} 버전
          </div>
        </motion.div>

        {/* 다른 국가 영상 있는 경우 탭 표시 */}
        {videos && Object.entries(videos).filter(([, v]) => v).length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {Object.entries(COUNTRY_LABELS).map(([key, label]) => {
              if (!videos[key]) return null;
              return (
                <a
                  key={key}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    // 언어 변경 시 페이지 리로드 없이 영상만 교체
                    const langEntry = Object.entries(LANG_TO_VIDEO_KEY).find(([, v]) => v === key);
                    if (langEntry) {
                      try { localStorage.setItem("everwill_lang", langEntry[0]); } catch {}
                      window.location.reload();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                    videoKey === key
                      ? "bg-[#1F3864] text-white border-[#1F3864]"
                      : "bg-white text-[#1F3864] border-[#1F3864]/20 hover:border-[#1F3864]/50"
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
