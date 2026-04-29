/**
 * QR 코드 공개 프로필 페이지 (/profile/:qrCode)
 * - QR 스캔 시 표시되는 공개 프로필
 * - 이름(마스킹), 국가, 주소(마스킹), 가입 연도 표시
 * - EverWill 가입 확인 배지
 */
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { Shield, CheckCircle2, Globe, MapPin, User, ArrowRight, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PublicProfilePage() {
  const params = useParams<{ qrCode: string }>();
  const qrCode = params.qrCode ?? "";

  const { data, isLoading, error } = trpc.qr.getPublicProfile.useQuery(
    { qrCode },
    { enabled: !!qrCode, retry: false }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1F3864] to-[#162a4e] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">확인 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1F3864] to-[#162a4e] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">유효하지 않은 QR 코드</h2>
          <p className="text-gray-500 mb-6">이 QR 코드는 존재하지 않거나 만료되었습니다.</p>
          <Link href="/">
            <a className="block w-full bg-[#1F3864] text-white py-3 rounded-xl font-semibold hover:bg-[#162a4e] transition-colors">
              EverWill 홈으로
            </a>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F3864] to-[#162a4e] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* 상단 헤더 */}
        <div className="bg-gradient-to-r from-[#1F3864] to-[#2a4a80] px-6 py-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">{data.name}</h1>
          {data.memberSince && (
            <p className="text-white/70 text-sm">{data.memberSince} 가입</p>
          )}
        </div>

        {/* 가입 확인 배지 */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 bg-green-50 rounded-2xl px-4 py-3">
            <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-800 text-sm">EverWill 인증 회원</p>
              <p className="text-green-600 text-xs mt-0.5">디지털 유언 보관 서비스 가입 확인</p>
            </div>
          </div>
        </div>

        {/* 프로필 정보 */}
        {data.isPublic && (
          <div className="px-6 py-5 space-y-4">
            {data.country && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1F3864]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-[#1F3864]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">거주 국가</p>
                  <p className="text-sm font-semibold text-gray-700">{data.country}</p>
                </div>
              </div>
            )}
            {data.address && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1F3864]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-[#1F3864]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">주소</p>
                  <p className="text-sm font-semibold text-gray-700">{data.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* EverWill 소개 */}
        <div className="px-6 pb-4">
          <div className="bg-[#C9A961]/10 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs text-[#8a6d30] leading-relaxed">
              <span className="font-bold">EverWill</span>은 디지털 유언 보관 서비스입니다.<br />
              나는 EverWill에 나의 유언을 디지털 저장 인증하였습니다.
            </p>
          </div>
        </div>

        {/* EverWill 방문 버튼 */}
        <div className="px-6 pb-6">
          <Link href="/">
            <a className="flex items-center justify-center gap-2 w-full bg-[#1F3864] hover:bg-[#162a4e] text-white py-4 rounded-2xl font-bold text-base transition-colors shadow-md">
              <Shield className="w-5 h-5" />
              EverWill 방문하기
              <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
