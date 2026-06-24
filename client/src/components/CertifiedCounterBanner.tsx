/**
 * 인증회원 카운터 배너
 * - 실시간 DB에서 인증회원 수 조회
 * - 숫자 카운트업 애니메이션
 * - 관리자 로그인 시 수정 버튼 표시
 */
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Pencil, Check, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

function useCountUp(target: number, duration = 1800) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

export default function CertifiedCounterBanner() {
  const { t } = useLanguage();
  const cb = t.badge;
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const { data, refetch } = trpc.stats.getTotalMemberCount.useQuery();
  const setCount = trpc.stats.setCertifiedCount.useMutation({
    onSuccess: () => { refetch(); setEditing(false); },
  });

  const count = data?.total ?? 0;
  const animated = useCountUp(count);

  // count가 0이면 숨김 처리 (관리자는 항상 표시)
  if (count === 0 && !isAdmin) return null;

  function handleSave() {
    const n = parseInt(inputVal.replace(/[^0-9]/g, ""), 10);
    if (isNaN(n) || n < 0) return;
    setCount.mutate({ count: n });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="bg-[#1F3864] rounded-3xl px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
    >
      {/* 왼쪽: 아이콘 + 설명 */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-[#C9A961]/20 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-8 h-8 text-[#C9A961]" />
        </div>
        <div>
          <div className="text-white/70 text-sm font-semibold mb-1">
            {cb.certBannerLabel}
          </div>
          <div className="text-white text-base font-medium leading-snug max-w-xs">
            {cb.certBannerDesc}
          </div>
        </div>
      </div>

      {/* 오른쪽: 숫자 */}
      <div className="flex flex-col items-center sm:items-end gap-2 flex-shrink-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="숫자 입력"
              className="w-32 px-3 py-2 rounded-xl text-[#1F3864] font-bold text-lg text-center focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={setCount.isPending}
              className="w-9 h-9 rounded-xl bg-[#C9A961] flex items-center justify-center hover:bg-[#d4b870] transition-colors"
            >
              <Check className="w-5 h-5 text-[#1F3864]" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="text-right">
              <span className="text-4xl sm:text-6xl font-extrabold text-[#C9A961] tabular-nums">
                {animated.toLocaleString()}
              </span>
              <span className="text-white/70 text-xl sm:text-2xl font-bold ml-1">
                {cb.certBannerUnit}
              </span>
            </div>
            {isAdmin && (
              <button
                onClick={() => { setInputVal(String(count)); setEditing(true); }}
                className="mb-2 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                title="관리자: 숫자 수정"
              >
                <Pencil className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        )}
        <div className="text-white/50 text-xs">
          {cb.certBannerLive}
        </div>
      </div>
    </motion.div>
  );
}
