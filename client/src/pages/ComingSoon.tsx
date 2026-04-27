/**
 * ComingSoon 페이지
 * - 외부 공개용 준비 중 화면
 * - 노인 그룹 배경 이미지 + EverWill 로고 + 홈 버튼
 * - 홈 버튼 클릭 → 비밀번호 모달 → 정답(2026) 입력 시 /home 진입
 * - 비밀번호는 sessionStorage에 저장 (탭 닫으면 초기화)
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Lock, Eye, EyeOff, X } from "lucide-react";

const HERO_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/hero-global-elders-v2-DB4mTEuKjbV7DYjdv5fYBA.webp";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663445965637/PhaVJexqfm3CAwoPdg4NhS/everwill-logo-new-R7uSaMGqygLC4HyLmUjt93.webp";

const PASSWORD = "2026";
const SESSION_KEY = "ew_unlocked";

export default function ComingSoon() {
  const [, navigate] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [input, setInput] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 이미 인증된 경우 바로 홈으로
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "1") {
      navigate("/home");
    }
  }, [navigate]);

  const openModal = () => {
    setShowModal(true);
    setInput("");
    setError(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setShowModal(false);
    setInput("");
    setError(false);
  };

  const handleSubmit = () => {
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShowModal(false);
      navigate("/home");
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") closeModal();
  };

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
        {/* 로고 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <img
            src={LOGO_URL}
            alt="EverWill"
            className="h-14 md:h-16 mx-auto drop-shadow-xl"
            onError={(e) => {
              // 로고 이미지 로드 실패 시 텍스트 폴백
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              const fallback = document.getElementById("logo-fallback");
              if (fallback) fallback.style.display = "block";
            }}
          />
          <div
            id="logo-fallback"
            style={{ display: "none" }}
            className="text-white font-bold text-3xl tracking-widest"
          >
            <span className="text-[#C9A961]">Ever</span>Will
          </div>
        </motion.div>

        {/* 준비 중 문구 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-3"
        >
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#C9A961] animate-pulse" />
            세계 최초 디지털 유언 OS
          </span>
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

        {/* 홈 버튼 */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={openModal}
          className="flex items-center gap-2.5 bg-white/15 hover:bg-white/25 border border-white/30 hover:border-[#C9A961]/60 text-white font-semibold text-base px-7 py-3.5 rounded-full backdrop-blur-sm transition-all duration-300 shadow-lg"
        >
          <Home size={18} className="text-[#C9A961]" />
          홈
        </motion.button>
      </div>

      {/* 비밀번호 모달 */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* 배경 블러 */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* 모달 카드 */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4 bg-[#0d1b2e]/95 border border-white/20 rounded-2xl p-8 shadow-2xl backdrop-blur-xl ${shake ? "animate-[wiggle_0.4s_ease-in-out]" : ""}`}
            >
              {/* 닫기 버튼 */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
              >
                <X size={18} />
              </button>

              {/* 아이콘 */}
              <div className="flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-[#C9A961]/15 border border-[#C9A961]/30 flex items-center justify-center">
                  <Lock size={24} className="text-[#C9A961]" />
                </div>
              </div>

              <h2 className="text-white text-xl font-bold text-center mb-1">
                관리자 전용
              </h2>
              <p className="text-white/50 text-sm text-center mb-6">
                비밀번호를 입력하세요
              </p>

              {/* 입력 필드 */}
              <div className="relative mb-4">
                <input
                  ref={inputRef}
                  type={showPw ? "text" : "password"}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="비밀번호"
                  className={`w-full bg-white/10 border ${error ? "border-red-400/60" : "border-white/20"} text-white placeholder-white/30 rounded-xl px-4 py-3 pr-12 text-base outline-none focus:border-[#C9A961]/60 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <p className="text-red-400 text-sm text-center mb-3">
                  비밀번호가 올바르지 않습니다
                </p>
              )}

              {/* 확인 버튼 */}
              <button
                onClick={handleSubmit}
                className="w-full bg-[#C9A961] hover:bg-[#b8944e] text-[#0d1b2e] font-bold py-3 rounded-xl transition-colors text-base"
              >
                확인
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* shake 애니메이션 */}
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: translate(-50%, -50%) translateX(0); }
          20% { transform: translate(-50%, -50%) translateX(-8px); }
          40% { transform: translate(-50%, -50%) translateX(8px); }
          60% { transform: translate(-50%, -50%) translateX(-6px); }
          80% { transform: translate(-50%, -50%) translateX(6px); }
        }
      `}</style>
    </div>
  );
}
