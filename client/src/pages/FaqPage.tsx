/**
 * EverWill FAQ 페이지
 * 법적 효력, 유언 작성, 인증, 상속 관련 자주 묻는 질문
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield, FileText, CreditCard, Globe, HelpCircle } from "lucide-react";
import { Link } from "wouter";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  icon: React.ReactNode;
  title: string;
  color: string;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "법적 효력",
    color: "text-[#1F3864]",
    items: [
      {
        q: "EverWill로 작성한 유언장은 법적 효력이 있나요?",
        a: "네, 있습니다. EverWill은 한국 민법 제1065조~제1072조에서 규정하는 유언 방식 중 '전자서명 기반 자필증서 유언' 및 '녹음 유언' 방식을 지원합니다. 전자인증(₩168,000) 완료 후 발급되는 인증서는 RFC 3161 타임스탬프와 블록체인 해시가 기록되어 법원·금융기관에서 진위 확인이 가능합니다. 단, AI가 제공하는 내용은 법률 정보 제공이며 법률 자문이 아닙니다."
      },
      {
        q: "공증과 다른가요?",
        a: "공증은 공증인(변호사·법무사)이 직접 입회하여 작성하는 방식입니다. EverWill은 '인증'을 제공하며, 공증과 동일한 법적 효력을 주장하지 않습니다. 다만 전자서명법 및 민법상 자필증서 유언 요건을 충족하도록 설계되어 있습니다. 복잡한 자산 구조나 분쟁 가능성이 높은 경우 파트너 변호사 상담을 권장합니다."
      },
      {
        q: "유류분이란 무엇인가요?",
        a: "유류분은 법정 상속인(배우자, 직계비속, 직계존속)이 유언과 관계없이 최소한으로 받을 수 있는 상속분입니다. 예를 들어 자녀가 있는 경우 법정 상속분의 1/2이 유류분으로 보호됩니다. EverWill은 유언 작성 시 유류분 침해 여부를 자동으로 계산하여 경고합니다."
      },
      {
        q: "전자유언은 세계적으로 법적 효력이 인정되나요?",
        a: "네. 미국은 2000년 ESIGN Act(전자계약법)와 2019년 UEWA(전자유언법)를 통해 20개 주 이상에서 전자유언을 명시적으로 인정합니다. EU는 2016년 eIDAS 규정으로 27개국 전자서명을 통일했습니다. 한국도 2020년 전자서명법 전면 개정으로 다양한 전자서명 방식의 법적 효력을 인정했습니다. EverWill은 이 모든 기준에 부합하도록 설계되어 있습니다."
      },
      {
        q: "한국에서 전자유언이 법적으로 완전히 인정되지 않는다면?",
        a: "현재 한국 민법은 자필증서·공정증서·비밀증서·구수증서·녹음 등 5가지 유언 방식을 규정합니다. EverWill은 이 중 '자필증서 유언'과 '녹음 유언' 방식을 전자적으로 구현합니다. 법무부는 2023년 전자유언 도입 가능성 연구를 발주했으며, 2027년 이후 민법 개정이 논의 중입니다. EverWill은 현행법 테두리 안에서 최대한 법적 안전성을 확보하며, 법 개정 시 즉시 업데이트됩니다."
      },
      {
        q: "유언 작성 후 마음이 바뀌면 어떻게 하나요?",
        a: "언제든지 수정 가능합니다. 수정 5회까지 무료이며, 6회부터 ₩15,000/회입니다. 결혼, 출산, 이사, 자산 변동 등 생애 이벤트 발생 시 재인증을 권장합니다. 가장 최근에 인증된 유언장이 법적 효력을 가집니다."
      },
    ]
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "유언 작성",
    color: "text-emerald-700",
    items: [
      {
        q: "유언장 작성에 얼마나 걸리나요?",
        a: "단순한 경우 약 17분, 자산이 복잡한 경우 30~45분 정도 소요됩니다. 10단계 체크박스 마법사로 안내되므로 법률 지식 없이도 작성 가능합니다. 중간에 저장하고 나중에 이어서 작성할 수 있습니다."
      },
      {
        q: "자필로 쓴 유언장도 등록할 수 있나요?",
        a: "네, 가능합니다. 자필 유언장 스캔 인증(+₩19,000) 서비스를 이용하면 됩니다. 사진을 업로드하면 AI가 자필 여부, 날짜·서명·날인 등 법적 요건을 자동 검증하고 블록체인에 무결성을 기록합니다."
      },
      {
        q: "영상 유언장은 어떻게 작성하나요?",
        a: "영상 유언(+₩29,000) 서비스를 선택하면 AI가 낭독 스크립트를 생성해 드립니다. 스마트폰이나 PC 카메라로 녹화하면 되고, 녹화 중 실시간 가이드가 제공됩니다. 한국 민법 제1067조 녹음 유언 요건을 충족하도록 설계되어 있습니다."
      },
      {
        q: "상속인이 외국에 거주하면 어떻게 되나요?",
        a: "EverWill은 상속인의 거주 국가, 언어, 시간대를 등록할 수 있습니다. 사망 감지 시 현지 언어로 자동 알림이 발송됩니다. 크로스보더 상속의 경우 해당 국가 파트너 변호사와 자동 매칭됩니다."
      },
    ]
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    title: "가격 및 결제",
    color: "text-amber-700",
    items: [
      {
        q: "가입 및 유언장 작성은 정말 무료인가요?",
        a: "네, 완전 무료입니다. 회원가입과 AI 유언장 작성에는 비용이 없습니다. 비용은 법적 효력을 부여하는 '전자 인증' 단계에서만 발생합니다(₩168,000, 모든 기능 포함)."
      },
      {
        q: "결제 후 환불이 가능한가요?",
        a: "전자 인증 완료 전까지는 환불 가능합니다. 인증 완료 후에는 디지털 서비스 특성상 환불이 어렵습니다. 자세한 내용은 이용약관을 참조하세요."
      },
      {
        q: "연 멤버십은 무엇인가요?",
        a: "2년차부터 연 ₩29,000의 선택적 멤버십이 있습니다. 멤버십 가입 시 유언장 보관, 상속인 알림, Dead Man's Switch(생존 확인 서비스) 등 지속 서비스를 이용할 수 있습니다. 멤버십 없이도 기본 보관은 유지됩니다."
      },
      {
        q: "EverWill NFC 인증 카드는 무엇인가요?",
        a: "EverWill 카드는 회원 전용 물리적 인증 카드입니다. QR 코드와 NFC가 내장되어 있어 응급 상황 시 의료진이 스캔하면 가족 연락처와 의료 정보를 확인할 수 있습니다. 전자인증(₩168,000) 시 기본 카드가 포함됩니다."
      },
    ]
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "글로벌 서비스",
    color: "text-blue-700",
    items: [
      {
        q: "해외에 거주하는 재외한인도 이용할 수 있나요?",
        a: "네, EverWill은 재외한인을 주요 타깃으로 설계되었습니다. 한국 자산과 해외 자산을 동시에 관리할 수 있으며, 각국 법률에 맞는 유언장이 자동 생성됩니다. 현재 한국어 서비스 완성 후 일본어, 영어 순으로 확장 예정입니다."
      },
      {
        q: "미국, 일본 등 해외 자산도 등록할 수 있나요?",
        a: "네, 가능합니다. 자산 등록 시 국가를 선택하면 해당 국가 법률이 자동 적용됩니다. 크로스보더 상속의 경우 현지 파트너 변호사와 자동 매칭하여 각국 절차를 지원합니다."
      },
      {
        q: "아랍어, 일본어 서비스는 언제 시작되나요?",
        a: "한국어 서비스 완성 후 일본어(Phase 2), 중국어(Phase 3), 영어(Phase 4), 아랍어(Phase 5) 순으로 출시 예정입니다. 각 언어별 법률 체계와 문화를 반영하여 현지화합니다."
      },
    ]
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    title: "기타",
    color: "text-purple-700",
    items: [
      {
        q: "개인정보는 안전하게 보호되나요?",
        a: "EverWill은 종단간 암호화(E2E Encryption)를 적용하며, 유언장 원문은 분산 암호화 저장됩니다. 블록체인 해시 기록으로 무결성을 보장합니다. ISMS 인증 및 SOC 2 Type II 인증을 목표로 준비 중입니다."
      },
      {
        q: "사망 후 유언장은 어떻게 집행되나요?",
        a: "4중 사망 감지 시스템(가족 신고 → 정부 DB 연동 → Dead Man's Switch → 응급 발견자 신고)으로 사망을 확인합니다. 최소 2개 채널 확인 후 상속인에게 자동 알림이 발송되고, 72시간 이의제기 기간 후 유언장이 공개됩니다."
      },
      {
        q: "변호사 없이도 유언장을 작성할 수 있나요?",
        a: "네, 단순한 자산 구조의 경우 변호사 없이도 충분합니다. EverWill AI가 법률 정보를 제공하고 유류분·상속세를 자동 계산합니다. 복잡한 자산 구조(사업체, 해외 자산, 분쟁 가능성)의 경우 파트너 변호사 상담을 권장합니다."
      },
    ]
  }
];

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            aria-expanded={openIdx === idx}
          >
            <span className="font-semibold text-[#1A1A1A] text-sm leading-relaxed pr-4">{item.q}</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openIdx === idx ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {openIdx === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-2 text-sm text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/50">
                  {item.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* 헤더 */}
      <div className="bg-[#1F3864] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6">
            <HelpCircle className="w-4 h-4 text-[#C9A961]" />
            <span>자주 묻는 질문</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">무엇이든 물어보세요</h1>
          <p className="text-white/70 text-lg">
            유언장 작성부터 상속 집행까지, 궁금한 모든 것을 답해드립니다.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* 카테고리 탭 */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {FAQ_DATA.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(idx)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === idx
                  ? "bg-[#1F3864] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#1F3864]/30"
              }`}
            >
              <span className={activeCategory === idx ? "text-[#C9A961]" : cat.color}>
                {cat.icon}
              </span>
              {cat.title}
            </button>
          ))}
        </div>

        {/* FAQ 아코디언 */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <FaqAccordion items={FAQ_DATA[activeCategory].items} />
        </motion.div>

        {/* 더 궁금한 점 */}
        <div className="mt-12 bg-[#1F3864] rounded-2xl p-8 text-center text-white">
          <h3 className="text-xl font-bold mb-2">더 궁금한 점이 있으신가요?</h3>
          <p className="text-white/70 mb-6 text-sm">
            AI 상담 또는 파트너 변호사와 직접 상담하실 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/will/chat">
              <button className="px-6 py-3 bg-[#C9A961] text-[#1F3864] rounded-xl font-semibold text-sm hover:bg-[#d4b870] transition-colors">
                AI 상담 시작하기
              </button>
            </Link>
            <Link href="/write">
              <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors border border-white/20">
                유언장 무료 작성
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
