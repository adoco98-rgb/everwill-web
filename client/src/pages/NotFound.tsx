/**
 * 404 Not Found 페이지
 * EverWill 브랜드 디자인 적용 (네이비 + 골드)
 */
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#1F3864]/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-[#C9A961]/10 blur-2xl" />
      </div>

      <div className="relative text-center px-6 max-w-lg mx-auto">
        {/* 404 숫자 */}
        <div className="mb-6">
          <span
            className="text-[120px] sm:text-[160px] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #1F3864 0%, #C9A961 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </span>
        </div>

        {/* 로고 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#1F3864] flex items-center justify-center">
            <span className="text-[#C9A961] font-bold text-sm">E</span>
          </div>
          <span className="font-bold text-[#1F3864] text-lg">EverWill</span>
        </div>

        {/* 안내 문구 */}
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-[#6B7280] text-base leading-relaxed mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          주소를 다시 확인하거나 홈으로 돌아가세요.
        </p>

        {/* 버튼 그룹 */}
        <div
          id="not-found-button-group"
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="gap-2 border-[#1F3864]/30 text-[#1F3864] hover:bg-[#1F3864] hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            이전 페이지
          </Button>
          <Button
            onClick={() => setLocation("/")}
            className="gap-2 bg-[#1F3864] hover:bg-[#162a4e] text-white shadow-md hover:shadow-lg transition-all"
          >
            <Home className="w-4 h-4" />
            홈으로 돌아가기
          </Button>
        </div>

        {/* 도움말 링크 */}
        <div className="mt-10 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-center gap-4 text-sm text-[#6B7280]">
          <button onClick={() => setLocation("/faq")} className="hover:text-[#1F3864] transition-colors flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            자주 묻는 질문
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => setLocation("/dashboard/inquiries")} className="hover:text-[#1F3864] transition-colors">
            1:1 문의
          </button>
          <span className="text-gray-300">|</span>
          <a href="mailto:adoco98@gmail.com" className="hover:text-[#1F3864] transition-colors">
            adoco98@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
