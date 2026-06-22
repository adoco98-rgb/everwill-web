/**
 * 국가별 유튜브/영상 섹션
 * - VideoIntroSection(서비스 소개 슬라이더) 바로 아래에 위치
 * - 현재 선택된 국가 언어에 맞는 영상 자동 표시
 * - 영상 없으면 한국어(video_kr) fallback
 * - 관리자가 /admin 페이지에서 국가별 URL 등록 가능
 * - 국가명은 현재 선택된 언어로 자동 표시
 */
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCountryName, videoKeyToCountryCode, COUNTRY_FLAGS_EMOJI } from "@/lib/countryNames";

// 언어 코드 → 영상 키 매핑 (전체 국가)
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
  ca: "video_ca",
  au: "video_au",
  nz: "video_nz",
  mx: "video_mx",
  it: "video_it",
  nl: "video_nl",
  sg: "video_sg",
  th: "video_th",
  vi: "video_vn",
  tl: "video_ph",
};

// 영상 키 목록 (순서 유지용)
const VIDEO_KEYS = [
  "video_kr", "video_us", "video_jp", "video_cn", "video_de", "video_es",
  "video_ar", "video_fr", "video_ru", "video_in", "video_br", "video_ca",
  "video_au", "video_nz", "video_mx", "video_it", "video_nl", "video_sg",
  "video_th", "video_vn", "video_ph",
];

/** 현재 언어로 국가명 반환 (이모지 포함) */
function getVideoLabel(videoKey: string, language: string): string {
  const code = videoKeyToCountryCode(videoKey);
  const emoji = COUNTRY_FLAGS_EMOJI[code] ?? "";
  const name = getCountryName(code, language);
  return `${emoji} ${name}`;
}

// 언어별 섹션 텍스트 번역
const VIDEO_SECTION_TEXT: Record<string, { label: string; title: string; subtitle: string; version: string; preparing: string }> = {
  ko: { label: "EVERWILL 영상", title: "EverWill 전자인증은 사랑의 실천입니다", subtitle: "유언 작성의 중요성과 EverWill 서비스를 영상으로 확인하세요.", version: "버전", preparing: "현재 선택된 국가의 영상이 준비 중입니다." },
  en: { label: "EVERWILL VIDEO", title: "EverWill: A Digital Act of Love", subtitle: "Watch how EverWill helps you protect your loved ones.", version: "version", preparing: "Video for this country is coming soon." },
  ja: { label: "EVERWILL 動画", title: "EverWillで大切な人への愛を形に", subtitle: "遺言作成の重要性とEverWillサービスを動画でご確認ください。", version: "バージョン", preparing: "この国の動画は準備中です。" },
  zh: { label: "EVERWILL 视频", title: "EverWill：数字时代的爱的传承", subtitle: "通过视频了解遗嘱的重要性和EverWill服务。", version: "版本", preparing: "该国家的视频正在准备中。" },
  de: { label: "EVERWILL VIDEO", title: "EverWill: Ein digitaler Liebesbeweis", subtitle: "Erfahren Sie mehr über EverWill und die Bedeutung eines Testaments.", version: "Version", preparing: "Video für dieses Land wird vorbereitet." },
  es: { label: "VIDEO EVERWILL", title: "EverWill: Un acto de amor digital", subtitle: "Descubra la importancia del testamento y el servicio EverWill.", version: "versión", preparing: "El video para este país está en preparación." },
  ar: { label: "فيديو EverWill", title: "EverWill: فعل محبة رقمي", subtitle: "شاهد كيف يساعدك EverWill على حماية أحبائك.", version: "نسخة", preparing: "الفيديو الخاص بهذا البلد قيد الإعداد." },
  fr: { label: "VIDÉO EVERWILL", title: "EverWill : Un acte d'amour numérique", subtitle: "Découvrez l'importance du testament et le service EverWill.", version: "version", preparing: "La vidéo pour ce pays est en préparation." },
  ru: { label: "ВИДЕО EVERWILL", title: "EverWill: Цифровой акт любви", subtitle: "Узнайте о важности завещания и сервисе EverWill.", version: "версия", preparing: "Видео для этой страны готовится." },
};

// YouTube URL을 embed URL로 변환
function toEmbedUrl(url: string): string {
  if (!url) return url;
  // 이미 embed URL인 경우
  if (url.includes('youtube.com/embed/')) return url;
  // youtu.be 단축 URL
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  // 일반 youtube.com/watch?v= URL
  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

export default function CountryVideoSection() {
  const { data: videos } = trpc.siteSettings.getVideos.useQuery();
  const { language } = useLanguage();

  const videoKey = LANG_TO_VIDEO_KEY[language] ?? "video_kr";
  const rawUrl = videos?.[videoKey] ?? videos?.["video_kr"] ?? null;
  const embedUrl = rawUrl ? toEmbedUrl(rawUrl) : null;
  // 현재 언어로 국가명 표시
  const countryLabel = getVideoLabel(videoKey, language);
  const txt = VIDEO_SECTION_TEXT[language] ?? VIDEO_SECTION_TEXT["en"];

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
            ── {txt.label} ──
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1F3864]">
            {txt.title}
          </h2>
          <p className="text-gray-500 mt-3 text-sm md:text-base">
            {txt.subtitle}
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
              <p className="text-[#1F3864]/40 text-sm">{txt.preparing}</p>
            </div>
          )}

          {/* 국가 라벨 - 현재 언어로 표시 */}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {countryLabel} {txt.version}
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
            {VIDEO_KEYS.map((key) => {
              if (!videos[key]) return null;
              const label = getVideoLabel(key, language);
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
