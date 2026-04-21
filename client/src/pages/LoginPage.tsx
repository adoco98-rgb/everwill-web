/**
 * EverWill 로그인 / 회원가입 페이지 (/login)
 * Manus OAuth 기반 소셜 로그인 (구글, 애플, 이메일)
 */
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Globe, Lock, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const benefits = [
  "유언장 작성 무료 · 언제든 재개 가능",
  "결제 내역 자동 연결 및 관리",
  "인증 완료 후 영구 보관",
  "7개 언어 · 195개국 결제 지원",
];

export default function LoginPage() {
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* 왼쪽 브랜드 패널 (데스크탑) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1F3864] via-[#243d72] to-[#1a3058] flex-col justify-between p-12">
        <div>
          <Link href="/">
            <a className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 bg-[#C9A961] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">E/span>
              </div>
              <span className="font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
                EverWill
              </span>
              <span className="text-white/40 text-sm ml-1">유언 OS</span>
            </a>
          </Link>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              누구나 한번은<br />꼭 해야할,<br />
              <span className="text-[#C9A961] italic">나의 마지막 서명</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              세계 최초 디지털 유언 OS.<br />
              작성부터 사후 자동 집행까지 하나로.
            </p>
          </div>

          <div className="space-y-3">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-[#C9A961] shrink-0" />
                <span className="text-white/70 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Globe className="w-3.5 h-3.5" />
          <span>한국 · 일본 · 중국 · 미국 · 유럽</span>
        </div>
      </div>

      {/* 오른쪽 로그인 패널 */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* 모바일 로고 */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/">
              <a className="inline-flex items-center gap-2">
                <div className="w-9 h-9 bg-[#1F3864] rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">E/span>
                </div>
                <span className="font-bold text-xl text-[#1F3864]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  EverWill
                </span>
              </a>
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-[#1F3864]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-[#1F3864]" />
              </div>
              <h1 className="text-2xl font-bold text-[#1F3864] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                시작하기
              </h1>
              <p className="text-gray-400 text-sm">
                계정이 없으면 자동으로 회원가입됩니다.
              </p>
            </div>

            {/* 로그인 버튼 */}
            <div className="space-y-3">
              <button
                onClick={() => { window.location.href = loginUrl; }}
                className="w-full bg-[#1F3864] hover:bg-[#162a4e] text-white py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
              >
                <Lock className="w-4 h-4" />
                이메일로 계속하기
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
                  또는 소셜 계정으로
                </div>
              </div>

              <button
                onClick={() => { window.location.href = loginUrl; }}
                className="w-full border-2 border-gray-100 hover:border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>

              <button
                onClick={() => { window.location.href = loginUrl; }}
                className="w-full border-2 border-gray-100 hover:border-gray-200 text-gray-600 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple로 계속하기
              </button>
            </div>

            {/* 약관 */}
            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              계속 진행하면{" "}
              <a href="#" className="text-[#1F3864] underline">이용약관</a>
              {" "}및{" "}
              <a href="#" className="text-[#1F3864] underline">개인정보처리방침</a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>

          {/* 홈으로 */}
          <div className="text-center mt-6">
            <Link href="/">
              <a className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#1F3864] text-sm transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                홈으로 돌아가기
              </a>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
