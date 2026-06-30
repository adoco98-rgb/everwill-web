/**
 * ComingSoon 페이지
 * - 외부 공개용 준비 중 화면
 * - 노인 그룹 배경 이미지 + EverWill 로고 + 홈 버튼
 * - 홈 버튼 클릭 → 비밀번호 모달 → 정답(2026) 입력 시 /home 진입
 * - 비밀번호는 sessionStorage에 저장 (탭 닫으면 초기화)
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/hero-global-elders-v2-DB4mTEuKjbV7DYjdv5fYBA.webp";

const LOGO_URL = "/manus-storage/everwill_seal_32fed306.png";

const PASSWORD = "2026";
const SESSION_KEY = "ew_unlocked";

// 로그인 상태에 따라 다른 버튼 표시
function LoginButton({ navigate }: { navigate: (path: string) => void }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2.5 bg-white/15 hover:bg-white/25 border border-white/40 text-white font-bold text-base px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm"
      >
        <LogIn size={18} />
        내 대시보드
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate("/login")}
      className="flex items-center gap-2.5 bg-white/15 hover:bg-white/25 border border-white/40 text-white font-bold text-base px-8 py-4 rounded-full transition-all duration-300 backdrop-blur-sm"
    >
      <LogIn size={18} />
      로그인
    </motion.button>
  );
}

export default function ComingSoon() {
  const [, navigate] = useLocation();

  // 항상 바로 홈으로 이동 가능 (비밀번호 잠금 해제)
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0d1b2e]">
      {/* 배경 이미지 */}
      <img
        src={HERO_IMAGE}
        alt="EverWill"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: "brightness(0.45)" }}
      />

      {/* 오버레이 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      {/* 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* 로고 — 복합 애니메이션: 등장 + 부유 + 글로우 펄스 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 relative"
        >
          {/* 골드 글로우 후광 — 로고 뒤에서 맥동 */}
          <motion.div
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(201,169,97,0.35) 0%, transparent 70%)",
              zIndex: 0,
            }}
          />

          {/* 로고 이미지 — 위아래 부유 */}
          <motion.img
            src={LOGO_URL}
            alt="EverWill"
            className="relative z-10 h-40 md:h-52 lg:h-64 mx-auto object-contain brightness-110"
            style={{ filter: "drop-shadow(0 12px 32px rgba(201,169,97,0.7)) brightness(1.1)" }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              const fallback = document.getElementById("logo-fallback");
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div
            id="logo-fallback"
            style={{ display: "none" }}
            className="text-white font-bold text-4xl tracking-widest drop-shadow-2xl"
          >
            <span className="text-[#C9A961]">Ever</span>Will
          </div>
        </motion.div>

        {/* 준비 중 문구 */}
        {/* 세계 최초 디지털 유언 OS 배지 — 크게 강조 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6"
        >
          <motion.span
            animate={{ boxShadow: [
              "0 0 0px rgba(201,169,97,0)",
              "0 0 28px rgba(201,169,97,0.7)",
              "0 0 0px rgba(201,169,97,0)",
            ] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex items-center gap-3 bg-[#C9A961]/20 border-2 border-[#C9A961] text-white text-lg md:text-xl font-bold px-7 py-3 rounded-full backdrop-blur-md"
            style={{ letterSpacing: "0.04em" }}
          >
            <motion.span
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-3 h-3 rounded-full bg-[#C9A961] inline-block"
            />
            세계 최초 디지털 유언 OS
          </motion.span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="text-white text-4xl md:text-6xl font-bold leading-tight mb-3"
          style={{ fontFamily: "'Pretendard', 'Inter', sans-serif" }}
        >
          누구나 한번은<br />꼭 해야할,
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-[#C9A961] text-3xl md:text-5xl font-bold italic mb-10"
          style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
        >
          나의 마지막 서명
        </motion.p>

        {/* 버튼 그룹 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          {/* 바로가기 버튼 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/home")}
            className="flex items-center gap-2.5 bg-[#C9A961] hover:bg-[#b8944e] text-[#0d1b2e] font-bold text-base px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-[#C9A961]/30"
          >
            바로가기
            <ArrowRight size={18} />
          </motion.button>

          {/* 로그인 버튼 — 이미 로그인된 경우 대시보드로 */}
          <LoginButton navigate={navigate} />
        </motion.div>
      </div>


    </div>
  );
}
