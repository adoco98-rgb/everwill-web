/**
 * HelpTooltip - 입력 항목 옆 ? 아이콘 도움말 풍선
 * 사용법: <HelpTooltip text="도움말 내용" />
 * 모바일: 탭 시 토글 / 데스크탑: 호버 시 표시
 */
import { useState, useRef, useEffect } from "react";
import { HelpCircle } from "lucide-react";

interface HelpTooltipProps {
  text: string;
  /** 풍선 위치: 기본 top, 필요 시 bottom */
  position?: "top" | "bottom" | "right";
}

export function HelpTooltip({ text, position = "top" }: HelpTooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // 바깥 클릭 시 닫기 (모바일 탭 지원)
  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [visible]);

  // 풍선 위치 클래스
  const posClass =
    position === "bottom"
      ? "top-full mt-2 left-1/2 -translate-x-1/2"
      : position === "right"
      ? "left-full ml-2 top-1/2 -translate-y-1/2"
      : "bottom-full mb-2 left-1/2 -translate-x-1/2";

  // 화살표 위치 클래스
  const arrowClass =
    position === "bottom"
      ? "top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-[#1F3864] border-x-transparent border-t-transparent border-4"
      : position === "right"
      ? "right-full top-1/2 -translate-y-1/2 border-r-[#1F3864] border-y-transparent border-l-transparent border-4"
      : "bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-[#1F3864] border-x-transparent border-b-transparent border-4";

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center ml-1.5 cursor-pointer select-none"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setVisible((v) => !v);
      }}
      aria-label="도움말"
    >
      <HelpCircle
        className="w-4 h-4 text-gray-400 hover:text-[#1F3864] transition-colors"
        strokeWidth={2}
      />

      {visible && (
        <span
          className={`absolute z-50 w-56 rounded-lg px-3 py-2.5 text-xs text-white leading-relaxed shadow-xl pointer-events-none ${posClass}`}
          style={{ background: "#1F3864" }}
        >
          {/* 화살표 */}
          <span className={`absolute w-0 h-0 ${arrowClass}`} />
          {text}
        </span>
      )}
    </span>
  );
}
