/**
 * EverWill 유언장 3포맷 설명 페이지
 * 자필증서 유언 / 전자서명 유언 / 영상(녹음) 유언
 */
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, PenLine, Monitor, Video, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const FORMATS = [
  {
    id: "handwritten",
    icon: <PenLine className="w-8 h-8" />,
    title: "자필증서 유언",
    subtitle: "한국 민법 제1066조",
    color: "from-emerald-600 to-teal-700",
    accentColor: "text-emerald-600",
    borderColor: "border-emerald-100",
    bgColor: "bg-emerald-50",
    requirements: [
      "전문을 자필로 작성 (타이핑 불가)",
      "작성 연월일 자필 기재",
      "주소 자필 기재",
      "성명 자필 기재 및 날인",
    ],
    pros: [
      "비용 없음 (작성 자체는 무료)",
      "공증 불필요",
      "언제든지 수정 가능",
      "가장 간단한 방식",
    ],
    cons: [
      "분실·훼손 위험",
      "발견되지 않을 수 있음",
      "위조·변조 가능성",
      "형식 요건 미충족 시 무효",
    ],
    everwillSolution: "EverWill 자필 스캔 인증(+₩19,000)으로 AI 형식 검증 + 블록체인 무결성 기록 + 원본 위치 추적 가능",
    price: "+₩19,000",
    priceNote: "자필 스캔 인증 옵션",
  },
  {
    id: "digital",
    icon: <Monitor className="w-8 h-8" />,
    title: "전자서명 유언",
    subtitle: "전자서명법 기반 인증",
    color: "from-[#1F3864] to-[#2a4a7f]",
    accentColor: "text-[#1F3864]",
    borderColor: "border-blue-100",
    bgColor: "bg-blue-50",
    requirements: [
      "공인 전자서명 또는 개인 인증서",
      "eKYC 본인 확인",
      "RFC 3161 타임스탬프",
      "블록체인 해시 기록",
    ],
    pros: [
      "분실·훼손 위험 없음",
      "즉시 발급 가능",
      "법원·금융기관 진위 확인 가능",
      "재인증 시 ₩15,000으로 수정 가능",
    ],
    cons: [
      "전자서명 인증 필요",
      "최초 인증 비용 ₩168,000",
      "인터넷 환경 필요",
    ],
    everwillSolution: "EverWill 핵심 서비스. 10단계 마법사로 17분 만에 완성. PASS·카카오·네이버 인증서 지원.",
    price: "₩168,000",
    priceNote: "전자 인증 (최초 1회)",
    recommended: true,
  },
  {
    id: "video",
    icon: <Video className="w-8 h-8" />,
    title: "영상(녹음) 유언",
    subtitle: "한국 민법 제1067조",
    color: "from-purple-600 to-violet-700",
    accentColor: "text-purple-600",
    borderColor: "border-purple-100",
    bgColor: "bg-purple-50",
    requirements: [
      "유언 내용을 구술로 녹음·녹화",
      "성명·연월일 구술 포함",
      "증인 1인 이상 서명·날인",
      "봉인 또는 표기",
    ],
    pros: [
      "글을 쓰기 어려운 분도 가능",
      "감성적 메시지 전달 가능",
      "가족 각자에게 개별 메시지",
      "미래 전달 타이밍 설정 가능",
    ],
    cons: [
      "증인 필요 (EverWill 지원)",
      "파일 보관 관리 필요",
      "법적 요건 충족 확인 필요",
    ],
    everwillSolution: "AI 낭독 스크립트 자동 생성 + 실시간 녹화 가이드 + 블록체인 해시 기록. '손녀 성인 되는 날' 등 미래 전달 타이밍 설정 가능.",
    price: "+₩29,000",
    priceNote: "영상 유언 옵션",
  },
];

export default function WillFormatsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <PenLine className="w-4 h-4 text-[#C9A961]" />
            <span>유언장 포맷 안내</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            유언장 3가지 방식
          </h1>
          <p className="text-white/70 text-lg">
            자필, 전자서명, 영상 — 상황에 맞는 방식을 선택하세요.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">

        {/* 포맷 카드 3개 */}
        {FORMATS.map((fmt, idx) => (
          <motion.div
            key={fmt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`bg-white rounded-2xl border-2 ${fmt.borderColor} overflow-hidden shadow-sm relative`}
          >
            {fmt.recommended && (
              <div className="absolute top-4 right-4 bg-[#C9A961] text-[#1F3864] text-xs font-bold px-3 py-1 rounded-full">
                EverWill 핵심
              </div>
            )}
            <div className={`bg-gradient-to-r ${fmt.color} text-white p-6 flex items-center gap-4`}>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                {fmt.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{fmt.title}</h2>
                <p className="text-white/70 text-sm">{fmt.subtitle}</p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-2xl font-bold">{fmt.price}</div>
                <div className="text-white/60 text-xs">{fmt.priceNote}</div>
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-3 gap-6">
              {/* 법적 요건 */}
              <div>
                <h3 className={`text-sm font-bold mb-3 ${fmt.accentColor}`}>법적 요건</h3>
                <div className="space-y-2">
                  {fmt.requirements.map((r, ri) => (
                    <div key={ri} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>

              {/* 장단점 */}
              <div>
                <h3 className="text-sm font-bold mb-3 text-green-600">장점</h3>
                <div className="space-y-1.5 mb-4">
                  {fmt.pros.map((p, pi) => (
                    <div key={pi} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                      {p}
                    </div>
                  ))}
                </div>
                <h3 className="text-sm font-bold mb-3 text-red-500">주의사항</h3>
                <div className="space-y-1.5">
                  {fmt.cons.map((c, ci) => (
                    <div key={ci} className="flex items-start gap-2 text-sm text-gray-600">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* EverWill 솔루션 */}
              <div>
                <h3 className={`text-sm font-bold mb-3 ${fmt.accentColor}`}>EverWill 솔루션</h3>
                <div className={`${fmt.bgColor} rounded-xl p-4 text-sm text-gray-700 leading-relaxed`}>
                  {fmt.everwillSolution}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* 어떤 방식을 선택해야 하나요? */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#1F3864] mb-6 text-center">어떤 방식을 선택해야 하나요?</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { emoji: "✍️", title: "자필 유언", desc: "디지털 기기가 불편하신 어르신, 간단한 자산 구조", recommend: "자필 스캔 인증 추가 권장" },
              { emoji: "💻", title: "전자서명 유언", desc: "일반적인 경우, 빠르고 안전하게 처리하고 싶을 때", recommend: "EverWill 기본 플랜" },
              { emoji: "🎥", title: "영상 유언", desc: "가족에게 감성적 메시지를 남기고 싶을 때, 글쓰기가 어려울 때", recommend: "프리미엄 플랜 또는 옵션 추가" },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-5 text-center">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-[#1F3864] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{item.desc}</p>
                <div className="text-xs bg-[#1F3864]/10 text-[#1F3864] rounded-lg px-3 py-1.5 font-medium">
                  {item.recommend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1F3864] rounded-2xl p-10 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">지금 바로 시작하세요</h3>
          <p className="text-white/70 mb-6 text-sm">유언장 작성은 무료. 17분이면 충분합니다.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/write">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#C9A961] text-[#1F3864] rounded-xl font-bold hover:bg-[#d4b870] transition-colors">
                무료로 유언장 작성 <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/faq">
              <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
                FAQ 보기
              </button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
