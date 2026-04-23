/**
 * 내부 기밀 사업기획서 페이지 (/799805)
 * - 비밀번호 보호 게이트
 * - 세부 투자처/단가/파트너사 정보
 * - 마케팅 전략 세부 (채널별 예산, KPI)
 * - 재무 상세 모델 (월별 현금흐름, BEP)
 * - 리스크 분석 및 대응 전략
 * - 외부 공개 금지
 */

import { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  BarChart3,
  Globe,
  Cpu,
  Scale,
  Server,
  Megaphone,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  Handshake,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// ── 비밀번호 (환경에서 관리하거나 서버 검증으로 교체 권장) ──
const ACCESS_CODE = "799805";

// ── 월별 현금흐름 데이터 (단위: 만원) ──
const CASHFLOW_DATA = [
  { month: "M1", revenue: 0, expense: -4200, net: -4200, cumulative: -4200 },
  { month: "M2", revenue: 0, expense: -4800, net: -4800, cumulative: -9000 },
  { month: "M3", revenue: 500, expense: -5200, net: -4700, cumulative: -13700 },
  { month: "M4", revenue: 1200, expense: -5500, net: -4300, cumulative: -18000 },
  { month: "M5", revenue: 2500, expense: -6000, net: -3500, cumulative: -21500 },
  { month: "M6", revenue: 4800, expense: -6500, net: -1700, cumulative: -23200 },
  { month: "M7", revenue: 7500, expense: -7000, net: 500, cumulative: -22700 },
  { month: "M8", revenue: 11000, expense: -7200, net: 3800, cumulative: -18900 },
  { month: "M9", revenue: 16000, expense: -7500, net: 8500, cumulative: -10400 },
  { month: "M10", revenue: 22000, expense: -7800, net: 14200, cumulative: 3800 },
  { month: "M11", revenue: 29000, expense: -8000, net: 21000, cumulative: 24800 },
  { month: "M12", revenue: 38000, expense: -8200, net: 29800, cumulative: 54600 },
];

// ── 시나리오별 ARR 전망 (단위: 억원) ──
const ARR_SCENARIO_DATA = [
  { year: "Year 1", conservative: 15, base: 28, optimistic: 45 },
  { year: "Year 2", conservative: 58, base: 96, optimistic: 158 },
  { year: "Year 3", conservative: 142, base: 264, optimistic: 420 },
];

// ── 채널별 CAC 및 LTV 데이터 ──
const CAC_LTV_DATA = [
  { channel: "SNS", cac: 18000, ltv: 726000, ratio: 40 },
  { channel: "검색광고", cac: 25000, ltv: 726000, ratio: 29 },
  { channel: "미디어", cac: 42000, ltv: 726000, ratio: 17 },
  { channel: "추천", cac: 8000, ltv: 726000, ratio: 91 },
  { channel: "B2B", cac: 55000, ltv: 726000, ratio: 13 },
];

// ── 세부 투자처 데이터 ──
const INVESTMENT_DETAIL = [
  {
    category: "제품 개발",
    color: "#C9A961",
    icon: Cpu,
    total: "₩4억",
    items: [
      {
        name: "AI 유언 작성 엔진",
        amount: "₩1억 2천만",
        partners: ["OpenAI (GPT-4 API)", "Anthropic (Claude API)"],
        breakdown: [
          { item: "GPT-4 / Claude API 12개월 사용료", cost: "₩3,000만", note: "월 ~250만원 예상" },
          { item: "법률 프롬프트 엔지니어링 외주", cost: "₩4,000만", note: "법률 전문 개발자 2명 × 2개월" },
          { item: "유류분 계산 / 오류 검증 로직", cost: "₩3,000만", note: "백엔드 개발자 외주" },
          { item: "7개국어 법률 문장 번역 검수", cost: "₩2,000만", note: "전문 번역가 7명 × 언어별 검수" },
        ],
        timeline: "M1 ~ M6",
      },
      {
        name: "eKYC 본인인증 연동",
        amount: "₩6천만",
        partners: ["NICE평가정보 (한국)", "Veriff (글로벌)"],
        breakdown: [
          { item: "NICE평가정보 API 연간 계약", cost: "₩2,000만", note: "건당 과금 포함 (예상 월 100~200건)" },
          { item: "Veriff API 계약 (글로벌 eKYC)", cost: "₩2,000만", note: "미국·일본·유럽 사용자 대상" },
          { item: "연동 개발 공수", cost: "₩2,000만", note: "프론트·백엔드 개발자 각 1명 × 1개월" },
        ],
        timeline: "M2 ~ M4",
      },
      {
        name: "블록체인 해시 기록",
        amount: "₩4천만",
        partners: ["Polygon Network", "KISA (한국인터넷진흥원)"],
        breakdown: [
          { item: "Polygon 네트워크 가스비 (12개월)", cost: "₩1,000만", note: "유언 인증 건당 ~500원 예상" },
          { item: "RFC 3161 타임스탬프 기관 계약", cost: "₩1,500만", note: "KISA 연계 공인 타임스탬프" },
          { item: "스마트컨트랙트 개발 외주", cost: "₩1,500만", note: "블록체인 개발자 1명 × 1.5개월" },
        ],
        timeline: "M3 ~ M6",
      },
      {
        name: "영상 유언 녹화 시스템",
        amount: "₩5천만",
        partners: ["AWS S3 + CloudFront", "AWS KMS"],
        breakdown: [
          { item: "AWS S3 + CloudFront 12개월", cost: "₩1,000만", note: "암호화 저장 + CDN 배포" },
          { item: "AWS KMS 암호화 솔루션", cost: "₩500만", note: "E2E 암호화 키 관리" },
          { item: "공개 타이밍 스케줄러 개발", cost: "₩2,000만", note: "백엔드 개발자 1명 × 2개월" },
          { item: "영상 녹화 UI/UX 개발", cost: "₩1,500만", note: "프론트엔드 개발자 1명 × 1.5개월" },
        ],
        timeline: "M4 ~ M8",
      },
      {
        name: "Badge NFC/QR 연동",
        amount: "₩5천만",
        partners: ["국내 금속 제조업체 (시제품)", "NXP Semiconductors (NFC 칩)"],
        breakdown: [
          { item: "Badge 시제품 제조 500개 (Essential·Wearable)", cost: "₩2,000만", note: "스테인레스·실리콘·티타늄" },
          { item: "NFC 칩 내장 + QR 레이저 각인", cost: "₩1,000만", note: "NTAG213 또는 동급 NXP 칩" },
          { item: "NFC/QR 스캔 앱 연동 개발", cost: "₩1,500만", note: "iOS/Android 모바일 개발자 1명 × 1.5개월" },
          { item: "배송·포장 시스템 구축", cost: "₩500만", note: "물류 파트너 초기 셋업" },
        ],
        timeline: "M5 ~ M9",
      },
      {
        name: "보안·인프라 구축",
        amount: "₩8천만",
        partners: ["Vercel", "AWS", "STEALIEN / NSHC (보안 점검)"],
        breakdown: [
          { item: "Vercel + AWS 클라우드 서버 12개월", cost: "₩2,000만", note: "프로덕션 환경 전체" },
          { item: "E2E 암호화 구현", cost: "₩2,500만", note: "보안 전문 개발자 1명 × 2.5개월" },
          { item: "보안 취약점 점검 (펜테스트)", cost: "₩1,500만", note: "론칭 전 전문 업체 진단" },
          { item: "ISMS 인증 준비 컨설팅", cost: "₩2,000만", note: "KISA 기준 컨설팅 업체" },
        ],
        timeline: "M1 ~ M12",
      },
    ],
  },
  {
    category: "마케팅·영업",
    color: "#10B981",
    icon: Megaphone,
    total: "₩3억",
    items: [
      {
        name: "한국 런칭 캠페인",
        amount: "₩8천만",
        partners: ["네이버 GFA", "카카오 모먼트", "구글 Ads"],
        breakdown: [
          { item: "네이버 검색 광고 (유언장, 상속 키워드)", cost: "₩2,500만", note: "CPC 평균 800~1,500원 예상" },
          { item: "카카오 모먼트 타깃 광고", cost: "₩2,000만", note: "50~70대 타깃 피드 광고" },
          { item: "구글 Ads (검색 + 유튜브 프리롤)", cost: "₩2,000만", note: "재외한인 타깃 포함" },
          { item: "PR 보도자료 배포", cost: "₩1,500만", note: "IT·경제 전문지 10개사" },
        ],
        timeline: "M3 ~ M6",
      },
      {
        name: "일본 진출 마케팅",
        amount: "₩7천만",
        partners: ["Yahoo! Japan Ads", "LINE Business", "현지 PR 에이전시"],
        breakdown: [
          { item: "야후재팬 검색 광고", cost: "₩2,500만", note: "遺言書, 相続 키워드" },
          { item: "LINE Business 타깃 광고", cost: "₩2,000만", note: "60대 이상 일본 사용자" },
          { item: "현지 PR 에이전시 계약", cost: "₩1,500만", note: "일본 법률·금융 미디어 노출" },
          { item: "일본어 콘텐츠 제작", cost: "₩1,000만", note: "현지 카피라이터 + 디자이너" },
        ],
        timeline: "M6 ~ M9",
      },
      {
        name: "재외한인 타깃 광고",
        amount: "₩6천만",
        partners: ["미주 한인 커뮤니티 (미주중앙일보, 한국일보 미주판)", "일본 한인 커뮤니티", "중국 한인 커뮤니티"],
        breakdown: [
          { item: "미주 한인 미디어 광고", cost: "₩2,000만", note: "미주중앙일보, 한국일보 미주판" },
          { item: "일본·중국 한인 커뮤니티 광고", cost: "₩1,500만", note: "온라인 커뮤니티 + 뉴스레터" },
          { item: "페이스북 재외한인 타깃 광고", cost: "₩1,500만", note: "국가별 한인 그룹 타깃" },
          { item: "유튜브 한인 채널 협찬", cost: "₩1,000만", note: "구독자 10만+ 재외한인 채널 3~5개" },
        ],
        timeline: "M7 ~ M12",
      },
      {
        name: "인플루언서·콘텐츠",
        amount: "₩5천만",
        partners: ["유튜브 크리에이터 (구독자 10만+)", "인스타그램 인플루언서"],
        breakdown: [
          { item: "유튜브 크리에이터 협업 (5명)", cost: "₩2,500만", note: "50대+ 라이프스타일 채널" },
          { item: "인스타그램 인플루언서 (10명)", cost: "₩1,500만", note: "시니어 라이프·재테크 계정" },
          { item: "콘텐츠 제작 (영상·카드뉴스)", cost: "₩1,000만", note: "월 4편 × 3개월" },
        ],
        timeline: "M4 ~ M9",
      },
      {
        name: "영업·파트너십",
        amount: "₩4천만",
        partners: ["장례식장 (전국 상위 50개)", "병원 (종합병원 20개)", "은행·증권사"],
        breakdown: [
          { item: "장례식장 제휴 계약 (50개소)", cost: "₩1,500만", note: "Badge 비치 + QR 홍보물 설치" },
          { item: "병원 제휴 계약 (20개소)", cost: "₩1,000만", note: "원무과·호스피스 병동 홍보" },
          { item: "은행·증권사 제휴 협의", cost: "₩1,500만", note: "고객 대상 유언 서비스 공동 홍보" },
        ],
        timeline: "M4 ~ M12",
      },
    ],
  },
  {
    category: "법무·컴플라이언스",
    color: "#8B5CF6",
    icon: Scale,
    total: "₩1.5억",
    items: [
      {
        name: "한국 법률 자문",
        amount: "₩5천만",
        partners: ["법무법인 (대형 로펌 또는 전문 변호사)", "개인정보보호위원회"],
        breakdown: [
          { item: "변호사법 검토 (AI 법률 자문 면책)", cost: "₩1,500만", note: "법무법인 계약 (월 자문)" },
          { item: "전자서명법 검토 및 적용", cost: "₩1,500만", note: "공인 전자서명 기관 제휴 포함" },
          { item: "개인정보보호법 컨설팅", cost: "₩1,000만", note: "ISMS 준비 연계" },
          { item: "약관·면책조항 작성", cost: "₩1,000만", note: "법률 전문 작성 + 검토" },
        ],
        timeline: "M1 ~ M4",
      },
      {
        name: "일본·미국 법률 검토",
        amount: "₩6천만",
        partners: ["일본 법무법인 (도쿄)", "미국 법무법인 (캘리포니아)"],
        breakdown: [
          { item: "일본 유언법·상속법 검토", cost: "₩2,500만", note: "도쿄 소재 법무법인 계약" },
          { item: "미국 캘리포니아·뉴욕 유언법 검토", cost: "₩2,500만", note: "CA·NY 주법 전문 변호사" },
          { item: "각국 데이터 현지화 요건 검토", cost: "₩1,000만", note: "GDPR, CCPA, 일본 개인정보보호법" },
        ],
        timeline: "M4 ~ M8",
      },
      {
        name: "변호사 파트너십 구축",
        amount: "₩4천만",
        partners: ["국내 상속 전문 변호사 10명 (Year 1 큐레이션)"],
        breakdown: [
          { item: "변호사 영입 및 계약 (10명)", cost: "₩2,000만", note: "플랫폼 수수료 15~25% 계약" },
          { item: "변호사 온보딩 시스템 개발", cost: "₩1,500만", note: "프로필·매칭·리뷰 시스템" },
          { item: "변호사 교육 및 가이드라인", cost: "₩500만", note: "플랫폼 사용법 + 법적 기준" },
        ],
        timeline: "M3 ~ M8",
      },
    ],
  },
  {
    category: "운영·인프라",
    color: "#3B82F6",
    icon: Server,
    total: "₩1.5억",
    items: [
      {
        name: "클라우드 서버·CDN",
        amount: "₩5천만",
        partners: ["Vercel (프론트엔드 호스팅)", "AWS (백엔드·스토리지)", "Cloudflare (CDN·보안)"],
        breakdown: [
          { item: "Vercel Pro 12개월", cost: "₩1,500만", note: "프론트엔드 + Edge Functions" },
          { item: "AWS RDS + S3 + EC2 12개월", cost: "₩2,000만", note: "DB·스토리지·서버" },
          { item: "Cloudflare 12개월", cost: "₩1,500만", note: "CDN + DDoS 방어 + WAF" },
        ],
        timeline: "M1 ~ M12",
      },
      {
        name: "고객 지원 시스템",
        amount: "₩4천만",
        partners: ["Zendesk 또는 Freshdesk", "Twilio (SMS)", "Resend (이메일)"],
        breakdown: [
          { item: "CS 툴 (Zendesk/Freshdesk) 12개월", cost: "₩1,500만", note: "다국어 지원 티켓 시스템" },
          { item: "Twilio SMS 글로벌 12개월", cost: "₩1,000만", note: "OTP + 알림 SMS" },
          { item: "Resend 이메일 12개월", cost: "₩500만", note: "트랜잭션 이메일" },
          { item: "챗봇 구축 (FAQ 자동화)", cost: "₩1,000만", note: "7개 언어 FAQ 챗봇" },
        ],
        timeline: "M2 ~ M12",
      },
      {
        name: "운영 인력 채용",
        amount: "₩6천만",
        partners: ["개발자 1명 (풀스택)", "CS 담당 1명 (다국어)"],
        breakdown: [
          { item: "풀스택 개발자 1명 (6개월)", cost: "₩3,600만", note: "월 600만원 × 6개월" },
          { item: "CS 담당 1명 (6개월)", cost: "₩2,400만", note: "월 400만원 × 6개월 (한·영·일 가능자)" },
        ],
        timeline: "M4 ~ M9",
      },
    ],
  },
];

// ── 리스크 분석 데이터 ──
const RISK_DATA = [
  {
    category: "법적 리스크",
    icon: Scale,
    color: "#EF4444",
    level: "높음",
    risks: [
      { risk: "AI 법률 자문 위반 (변호사법)", impact: "서비스 중단", mitigation: "면책 조항 강화 + '정보 제공'으로 한정, 변호사 검토 필수화" },
      { risk: "전자서명 효력 분쟁", impact: "유언 무효화", mitigation: "공인 전자서명 기관 제휴 + 블록체인 해시 이중 보완" },
      { risk: "개인정보 유출", impact: "ISMS 취소 + 과징금", mitigation: "E2E 암호화 + 정기 보안 점검 + ISMS 인증 취득" },
    ],
  },
  {
    category: "시장 리스크",
    icon: TrendingUp,
    color: "#F59E0B",
    level: "중간",
    risks: [
      { risk: "경쟁사 유사 서비스 출시", impact: "시장 점유율 감소", mitigation: "Badge 시스템 특허 출원 + 선점 효과 극대화" },
      { risk: "고령층 디지털 전환 저항", impact: "가입자 목표 미달", mitigation: "오프라인 파트너십 (장례식장·병원) + 가족 대리 가입 기능" },
      { risk: "글로벌 진출 지연", impact: "ARR 목표 미달", mitigation: "한국 시장 안정화 후 단계적 진출, 현지 파트너 활용" },
    ],
  },
  {
    category: "운영 리스크",
    icon: Server,
    color: "#3B82F6",
    level: "낮음",
    risks: [
      { risk: "핵심 인력 이탈", impact: "개발 지연", mitigation: "스톡옵션 부여 + 문서화 강화" },
      { risk: "클라우드 서비스 장애", impact: "서비스 중단", mitigation: "멀티 리전 배포 + 자동 페일오버" },
      { risk: "Badge 제조 파트너 이슈", impact: "배송 지연", mitigation: "복수 제조사 계약 + 재고 버퍼 유지" },
    ],
  },
  {
    category: "재무 리스크",
    icon: DollarSign,
    color: "#10B981",
    level: "중간",
    risks: [
      { risk: "초기 CAC 예상 초과", impact: "마케팅 예산 소진", mitigation: "채널별 ROAS 모니터링 + 비효율 채널 즉시 중단" },
      { risk: "BEP 달성 지연 (M10 이후)", impact: "추가 투자 필요", mitigation: "Series A 준비 병행 + 수익화 가속 (Badge 판매 집중)" },
      { risk: "환율 리스크 (글로벌 결제)", impact: "수익 변동성", mitigation: "Stripe/Paddle 헤징 기능 활용 + 현지 통화 가격 고정" },
    ],
  },
];

// ── KPI 목표 데이터 ──
const KPI_DATA = [
  { metric: "MAU", m3: "500", m6: "2,000", m9: "8,000", m12: "20,000", unit: "명" },
  { metric: "유료 전환율", m3: "12%", m6: "18%", m9: "22%", m12: "25%", unit: "" },
  { metric: "월 신규 인증", m3: "60", m6: "360", m9: "1,760", m12: "5,000", unit: "건" },
  { metric: "Badge 판매", m3: "20", m6: "150", m9: "600", m12: "2,000", unit: "개" },
  { metric: "변호사 파트너", m3: "3", m6: "7", m9: "10", m12: "15", unit: "명" },
  { metric: "월 ARR", m3: "₩900만", m6: "₩5,400만", m9: "₩2.6억", m12: "₩7.5억", unit: "" },
];

// ── 아코디언 컴포넌트 ──
function Accordion({ title, children, color }: { title: string; children: React.ReactNode; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
        style={{ background: open ? `${color}10` : undefined }}
      >
        <span className="font-bold text-white text-left">{title}</span>
        {open ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
      </button>
      {open && <div className="px-6 pb-6 pt-2">{children}</div>}
    </div>
  );
}

// ── 메인 컴포넌트 ──
export default function InternalPage() {
  const [inputCode, setInputCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const handleUnlock = () => {
    if (inputCode === ACCESS_CODE) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInputCode("");
    }
  };

  // ── 잠금 화면 ──
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* 로고 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1F3864] border border-[#C9A961]/30 mb-4">
              <Lock className="w-8 h-8 text-[#C9A961]" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">내부 기밀 문서</h1>
            <p className="text-white/40 text-sm">SARAM Corp. · EverWill 내부 사업기획서</p>
            <div className="mt-3 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-medium">외부 공개 금지 · CONFIDENTIAL</span>
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="bg-[#1a2035] rounded-3xl p-8 border border-white/10">
            <label className="block text-white/60 text-sm mb-3">접근 코드 입력</label>
            <div className="relative mb-4">
              <input
                type={showCode ? "text" : "password"}
                value={inputCode}
                onChange={(e) => { setInputCode(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="접근 코드를 입력하세요"
                className={`w-full bg-[#0d1525] border rounded-xl px-4 py-3.5 text-white placeholder-white/20 outline-none transition-colors pr-12 text-lg tracking-widest ${
                  error ? "border-red-500" : "border-white/10 focus:border-[#C9A961]/50"
                }`}
              />
              <button
                onClick={() => setShowCode(!showCode)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                접근 코드가 올바르지 않습니다.
              </p>
            )}
            <button
              onClick={handleUnlock}
              className="w-full bg-[#C9A961] hover:bg-[#d4b870] text-[#1F3864] font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Shield className="w-5 h-5" />
              문서 열기
            </button>
          </div>

          <p className="text-center text-white/20 text-xs mt-6">
            © 2025 SARAM Corp. · 무단 접근 시 법적 조치
          </p>
        </div>
      </div>
    );
  }

  // ── 내부 문서 본문 ──
  const NAV_ITEMS = [
    { id: "overview", label: "개요", icon: FileText },
    { id: "invest-terms", label: "투자 조건", icon: DollarSign },
    { id: "investment", label: "투자처 세부", icon: BarChart3 },
    { id: "cashflow", label: "현금흐름", icon: TrendingUp },
    { id: "marketing", label: "마케팅 KPI", icon: Target },
    { id: "risk", label: "리스크 분석", icon: AlertTriangle },
    { id: "partners", label: "파트너십", icon: Handshake },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* 상단 기밀 배너 */}
      <div className="bg-red-900/40 border-b border-red-500/30 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-xs font-bold">CONFIDENTIAL — 내부 기밀 문서 · 무단 배포 금지</span>
        </div>
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>2025 Q4 기준</span>
        </div>
      </div>

      {/* 헤더 */}
      <header className="px-6 py-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F3864] border border-[#C9A961]/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#C9A961]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">EverWill 내부 사업기획서</h1>
              <p className="text-white/40 text-xs">SARAM Corp. · 기밀 등급 A</p>
            </div>
          </div>
          <a href="/investor" className="text-white/40 hover:text-white text-sm transition-colors flex items-center gap-1">
            <Globe className="w-4 h-4" />
            외부 투자자 페이지
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* 사이드 네비게이션 */}
        <aside className="w-48 flex-shrink-0 hidden lg:block">
          <nav className="sticky top-8 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                  activeSection === item.id
                    ? "bg-[#C9A961]/20 text-[#C9A961] border border-[#C9A961]/30"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 min-w-0 space-y-12">

          {/* ── 개요 섹션 ── */}
          <section id="overview">
            <h2 className="text-3xl font-extrabold text-white mb-2">사업 개요</h2>
            <p className="text-white/50 mb-8">내부 전략 요약 · 외부 공개 금지</p>

            {/* 핵심 지표 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "목표 조달액", value: "₩5억~₩10억", sub: "시드 라운드", icon: DollarSign, color: "#C9A961" },
                { label: "Pre-money Valuation", value: "₩30억", sub: "협의 가능", icon: TrendingUp, color: "#10B981" },
                { label: "BEP 예상 시점", value: "M10", sub: "투자 후 10개월", icon: BarChart3, color: "#8B5CF6" },
                { label: "Year 3 ARR 목표", value: "₩264억", sub: "Base 시나리오", icon: Target, color: "#3B82F6" },
              ].map((kpi, i) => (
                <div key={i} className="bg-[#1a2035] rounded-2xl p-5 border border-white/5">
                  <kpi.icon className="w-6 h-6 mb-3" style={{ color: kpi.color }} />
                  <div className="text-2xl font-extrabold text-white mb-1">{kpi.value}</div>
                  <div className="text-xs font-bold mb-0.5" style={{ color: kpi.color }}>{kpi.label}</div>
                  <div className="text-xs text-white/30">{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* 시나리오별 ARR */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#C9A961]" />
                시나리오별 ARR 전망 (억원)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ARR_SCENARIO_DATA} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} unit="억" />
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    formatter={(v: number) => [`₩${v}억원`, ""]}
                  />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <Bar dataKey="conservative" name="보수적" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="base" name="기본" fill="#C9A961" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="optimistic" name="낙관적" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ── 투자 조건 섹션 ── */}
          <section id="invest-terms">
            <h2 className="text-3xl font-extrabold text-white mb-2">투자 조건 (기밀)</h2>
            <p className="text-white/50 mb-8">시드 라운드 · 외부 비공개 · 협상용 내부 자료</p>
            {/* 핵심 지표 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "라운드", value: "시드 (Seed)", color: "#C9A961", icon: "🚀" },
                { label: "목표 조달액", value: "₩5억 ~ ₩10억", color: "#10B981", icon: "💰" },
                { label: "Pre-money Valuation", value: "₩30억", color: "#8B5CF6", icon: "📈" },
                { label: "지분 희석률", value: "14.3% ~ 25%", color: "#EF4444", icon: "📊" },
                { label: "투자 기간", value: "12개월 런웨이", color: "#3B82F6", icon: "⏱️" },
                { label: "목표 BEP", value: "M10 (투자 후)", color: "#F59E0B", icon: "🎯" },
              ].map((item, i) => (
                <div key={i} className="bg-[#1a2035] rounded-2xl p-5 border border-white/5">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <p className="text-white/40 text-xs mb-1">{item.label}</p>
                  <p className="font-bold text-lg" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
            {/* 투자금 사용 계획 진행바 */}
            <div className="bg-[#1a2035] rounded-3xl p-8 border border-white/5 mb-6">
              <h3 className="text-xl font-bold text-white mb-6">투자금 사용 계획 (총 ₩10억 기준)</h3>
              <div className="space-y-5">
                {[
                  { label: "제품 개발", pct: 40, amount: "₩4억", desc: "AI 유언 엔진, eKYC, 블록체인", color: "#C9A961" },
                  { label: "마케팅·영업", pct: 30, amount: "₩3억", desc: "한국·일본 런칭, 재외한인 타깃", color: "#10B981" },
                  { label: "법무·컴플라이언스", pct: 15, amount: "₩1.5억", desc: "각국 법률 검토, 변호사 파트너십", color: "#8B5CF6" },
                  { label: "운영·인프라", pct: 15, amount: "₩1.5억", desc: "서버, 보안, CS 시스템", color: "#3B82F6" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-white font-semibold text-sm">{item.label}</span>
                        <span className="font-bold ml-2 text-sm" style={{ color: item.color }}>{item.amount}</span>
                        <span className="text-white/40 text-xs ml-2">— {item.desc}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: item.color }}>{item.pct}%</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 투자 조건 세부 표 */}
            <div className="bg-[#1a2035] rounded-3xl p-8 border border-white/5 mb-6">
              <h3 className="text-xl font-bold text-white mb-6">투자 조건 세부 (협상용)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-white/50 font-medium">항목</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">내용</th>
                      <th className="text-left py-3 px-4 text-white/50 font-medium">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { item: "라운드", value: "시드 (Seed)", note: "2025 Q4 ~ 2026 Q1" },
                      { item: "목표 조달액", value: "₩5억 ~ ₩10억", note: "$380K ~ $760K" },
                      { item: "Pre-money Valuation", value: "₩30억 ($2.3M)", note: "협상 가능" },
                      { item: "지분 희석률", value: "14.3% ~ 25%", note: "조달액에 따라 변동" },
                      { item: "투자 형태", value: "보통주 또는 전환사채 (CB)", note: "투자자 협의" },
                      { item: "이사회 구성", value: "창업자 2 : 투자자 1", note: "시드 기준" },
                      { item: "우선청산권", value: "1x Non-participating", note: "표준 조건" },
                      { item: "반희석 조항", value: "Broad-based WA", note: "표준 조건" },
                      { item: "락업 기간", value: "창업자 2년", note: "Cliff 1년" },
                      { item: "다음 라운드 목표", value: "Series A ₩30억 (Year 2)", note: "MAU 50,000 달성 시" },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                        <td className="py-3 px-4 text-white/70 font-medium">{row.item}</td>
                        <td className="py-3 px-4 font-semibold" style={{ color: '#C9A961' }}>{row.value}</td>
                        <td className="py-3 px-4 text-white/40 text-xs">{row.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* 투자금 집행 타임라인 */}
            <div className="bg-[#1a2035] rounded-3xl p-8 border border-white/5">
              <h3 className="text-xl font-bold text-white mb-6">투자금 집행 타임라인 (12개월)</h3>
              <div className="space-y-6">
                {[
                  { category: "제품 개발", amount: "₩4억", color: "#C9A961", months: [1, 9] as [number, number],
                    milestones: [
                      { month: 2, label: "AI MVP" }, { month: 4, label: "eKYC" },
                      { month: 6, label: "블록체인" }, { month: 9, label: "Badge" }
                    ]
                  },
                  { category: "마케팅·영업", amount: "₩3억", color: "#10B981", months: [3, 12] as [number, number],
                    milestones: [
                      { month: 3, label: "한국 런칭" }, { month: 6, label: "재외한인" },
                      { month: 9, label: "일본" }, { month: 12, label: "MAU 50K" }
                    ]
                  },
                  { category: "법무·컴플라이언스", amount: "₩1.5억", color: "#8B5CF6", months: [1, 8] as [number, number],
                    milestones: [
                      { month: 1, label: "한국 법률" }, { month: 4, label: "일본" }, { month: 8, label: "미국" }
                    ]
                  },
                  { category: "운영·인프라", amount: "₩1.5억", color: "#3B82F6", months: [1, 12] as [number, number],
                    milestones: [
                      { month: 1, label: "서버" }, { month: 3, label: "보안" },
                      { month: 6, label: "CS" }, { month: 12, label: "ISMS" }
                    ]
                  },
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-36 flex-shrink-0">
                        <div className="text-sm font-bold" style={{ color: item.color }}>{item.category}</div>
                        <div className="text-xs text-white/40">{item.amount}</div>
                      </div>
                      <div className="flex-1 relative h-8">
                        <div className="absolute inset-0 grid grid-cols-12 gap-0">
                          {Array.from({ length: 12 }, (_, i) => (
                            <div key={i} className="border-l border-white/5 h-full" />
                          ))}
                        </div>
                        <div
                          className="absolute top-1 bottom-1 rounded-full opacity-80"
                          style={{
                            left: `${((item.months[0] - 1) / 12) * 100}%`,
                            width: `${((item.months[1] - item.months[0] + 1) / 12) * 100}%`,
                            background: `linear-gradient(90deg, ${item.color}cc, ${item.color}66)`,
                            border: `1px solid ${item.color}`,
                          }}
                        />
                        {item.milestones.map((ms, mi) => (
                          <div key={mi} className="absolute top-1/2 -translate-y-1/2 group" style={{ left: `${((ms.month - 0.5) / 12) * 100}%` }}>
                            <div className="w-3 h-3 rounded-full border-2 border-white cursor-pointer" style={{ background: item.color }} />
                            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[#0d1525] border border-white/10 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              M{ms.month}: {ms.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="ml-36 pl-2 flex flex-wrap gap-2 mt-1">
                      {item.milestones.map((ms, mi) => (
                        <span key={mi} className="text-xs px-2 py-0.5 rounded-full border" style={{ color: item.color, borderColor: `${item.color}40`, background: `${item.color}10` }}>
                          M{ms.month} {ms.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 ml-36 pl-2 grid grid-cols-12 gap-0">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="text-center text-xs text-white/30">M{i + 1}</div>
                ))}
              </div>
            </div>
          </section>
          {/* ── 투자처 세부 섹션 ── */}
          <section id="investment">
            <h2 className="text-3xl font-extrabold text-white mb-2">투자처 세부 내역</h2>
            <p className="text-white/50 mb-8">총 ₩10억 기준 · 파트너사 및 단가 포함 · 기밀</p>

            <div className="space-y-6">
              {INVESTMENT_DETAIL.map((cat, ci) => (
                <div key={ci} className="bg-[#1a2035] rounded-3xl border border-white/5 overflow-hidden">
                  {/* 카테고리 헤더 */}
                  <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between" style={{ background: `${cat.color}10` }}>
                    <div className="flex items-center gap-3">
                      <cat.icon className="w-6 h-6" style={{ color: cat.color }} />
                      <h3 className="text-xl font-bold text-white">{cat.category}</h3>
                    </div>
                    <span className="text-2xl font-extrabold" style={{ color: cat.color }}>{cat.total}</span>
                  </div>
                  {/* 세부 항목 */}
                  <div className="divide-y divide-white/5">
                    {cat.items.map((item, ii) => (
                      <Accordion key={ii} title={`${item.name} — ${item.amount} (${item.timeline})`} color={cat.color}>
                        {/* 파트너사 */}
                        <div className="mb-4">
                          <div className="text-xs text-white/40 mb-2 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            투자처 / 파트너사
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {item.partners.map((p, pi) => (
                              <span key={pi} className="text-xs px-3 py-1 rounded-full border text-white/70" style={{ borderColor: `${cat.color}40`, background: `${cat.color}10` }}>
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* 세부 비용 */}
                        <div className="space-y-2">
                          {item.breakdown.map((b, bi) => (
                            <div key={bi} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                              <div className="flex-1">
                                <div className="text-sm text-white font-medium">{b.item}</div>
                                <div className="text-xs text-white/30 mt-0.5">{b.note}</div>
                              </div>
                              <span className="text-sm font-bold whitespace-nowrap" style={{ color: cat.color }}>{b.cost}</span>
                            </div>
                          ))}
                        </div>
                      </Accordion>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 현금흐름 섹션 ── */}
          <section id="cashflow">
            <h2 className="text-3xl font-extrabold text-white mb-2">월별 현금흐름 분석</h2>
            <p className="text-white/50 mb-8">₩10억 투자 기준 · 보수적 시나리오 · 단위: 만원</p>

            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">월별 수익 vs 지출 (만원)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={CASHFLOW_DATA} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 10000).toFixed(0)}억`} />
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    formatter={(v: number) => [`₩${v.toLocaleString()}만원`, ""]}
                  />
                  <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                  <Bar dataKey="revenue" name="수익" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="지출" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">누적 현금흐름 (BEP: M10)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={CASHFLOW_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 10000).toFixed(0)}억`} />
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    formatter={(v: number) => [`₩${v.toLocaleString()}만원`, "누적"]}
                  />
                  <defs>
                    <linearGradient id="cumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A961" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A961" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="cumulative" stroke="#C9A961" strokeWidth={2} fill="url(#cumulativeGrad)" name="누적 현금흐름" />
                  {/* BEP 기준선 */}
                  <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.05)" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-white/30 text-xs mt-3 text-center">* M10(투자 후 10개월)에 누적 현금흐름 흑자 전환 예상 (보수적 시나리오)</p>
            </div>
          </section>

          {/* ── 마케팅 KPI 섹션 ── */}
          <section id="marketing">
            <h2 className="text-3xl font-extrabold text-white mb-2">마케팅 KPI 목표</h2>
            <p className="text-white/50 mb-8">채널별 CAC · LTV · 월별 목표 지표</p>

            {/* KPI 테이블 */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5 mb-6 overflow-x-auto">
              <h3 className="text-lg font-bold text-white mb-4">월별 KPI 목표</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-white/50 font-medium">지표</th>
                    <th className="text-center py-3 text-[#C9A961] font-bold">M3</th>
                    <th className="text-center py-3 text-[#10B981] font-bold">M6</th>
                    <th className="text-center py-3 text-[#8B5CF6] font-bold">M9</th>
                    <th className="text-center py-3 text-[#3B82F6] font-bold">M12</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {KPI_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-white/3">
                      <td className="py-3 text-white font-medium">{row.metric} <span className="text-white/30 text-xs">{row.unit}</span></td>
                      <td className="py-3 text-center text-[#C9A961] font-bold">{row.m3}</td>
                      <td className="py-3 text-center text-[#10B981] font-bold">{row.m6}</td>
                      <td className="py-3 text-center text-[#8B5CF6] font-bold">{row.m9}</td>
                      <td className="py-3 text-center text-[#3B82F6] font-bold">{row.m12}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 채널별 CAC vs LTV */}
            <div className="bg-[#1a2035] rounded-3xl p-6 border border-white/5">
              <h3 className="text-lg font-bold text-white mb-4">채널별 CAC (고객 획득 비용) — 단위: 원</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={CAC_LTV_DATA} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₩${(v / 10000).toFixed(0)}만`} />
                  <YAxis type="category" dataKey="channel" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 12 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: "#1a2035", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                    formatter={(v: number) => [`₩${v.toLocaleString()}원`, "CAC"]}
                  />
                  <Bar dataKey="cac" name="CAC" fill="#C9A961" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-white/30 text-xs mt-3">* LTV ₩726,000 기준 · 추천 채널 LTV/CAC 비율 91배 (최우선 투자)</p>
            </div>
          </section>

          {/* ── 리스크 분석 섹션 ── */}
          <section id="risk">
            <h2 className="text-3xl font-extrabold text-white mb-2">리스크 분석 및 대응 전략</h2>
            <p className="text-white/50 mb-8">4개 영역 · 12개 리스크 · 대응 방안 포함</p>

            <div className="space-y-6">
              {RISK_DATA.map((cat, ci) => (
                <div key={ci} className="bg-[#1a2035] rounded-3xl border border-white/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between" style={{ background: `${cat.color}10` }}>
                    <div className="flex items-center gap-3">
                      <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                      <h3 className="text-lg font-bold text-white">{cat.category}</h3>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: cat.color, background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                      위험도: {cat.level}
                    </span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {cat.risks.map((r, ri) => (
                      <div key={ri} className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <div className="text-xs text-white/30 mb-1">리스크</div>
                          <div className="text-sm text-white font-medium">{r.risk}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/30 mb-1">영향</div>
                          <div className="text-sm text-red-400">{r.impact}</div>
                        </div>
                        <div>
                          <div className="text-xs text-white/30 mb-1">대응 방안</div>
                          <div className="text-sm text-[#10B981]">{r.mitigation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 파트너십 섹션 ── */}
          <section id="partners">
            <h2 className="text-3xl font-extrabold text-white mb-2">핵심 파트너십 전략</h2>
            <p className="text-white/50 mb-8">Year 1 영입 대상 · 협상 우선순위 · 기밀</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  category: "기술 파트너",
                  color: "#C9A961",
                  icon: Cpu,
                  partners: [
                    { name: "NICE평가정보", role: "한국 eKYC", priority: "필수", status: "협의 예정" },
                    { name: "Veriff", role: "글로벌 eKYC", priority: "필수", status: "협의 예정" },
                    { name: "Polygon Foundation", role: "블록체인 해시", priority: "높음", status: "기술 검토 중" },
                  ],
                },
                {
                  category: "법률 파트너",
                  color: "#8B5CF6",
                  icon: Scale,
                  partners: [
                    { name: "국내 상속 전문 변호사 10명", role: "사후 집행", priority: "필수", status: "Year 1 큐레이션" },
                    { name: "일본 도쿄 법무법인", role: "일본 유언법", priority: "높음", status: "Year 1 계약 목표" },
                    { name: "미국 CA·NY 변호사", role: "미국 유언법", priority: "중간", status: "Year 2 목표" },
                  ],
                },
                {
                  category: "유통 파트너",
                  color: "#10B981",
                  icon: Building2,
                  partners: [
                    { name: "전국 장례식장 50개소", role: "Badge 비치 + 홍보", priority: "높음", status: "M4부터 영업" },
                    { name: "종합병원 20개소", role: "원무과 홍보", priority: "중간", status: "M6부터 영업" },
                    { name: "은행·증권사", role: "고객 공동 마케팅", priority: "중간", status: "M8부터 협의" },
                  ],
                },
                {
                  category: "결제 파트너",
                  color: "#3B82F6",
                  icon: DollarSign,
                  partners: [
                    { name: "토스페이먼츠", role: "한국 결제", priority: "필수", status: "M1 연동" },
                    { name: "Stripe", role: "글로벌 결제", priority: "필수", status: "M1 연동" },
                    { name: "PayPay / LINE Pay", role: "일본 결제", priority: "높음", status: "M6 연동 목표" },
                  ],
                },
              ].map((cat, ci) => (
                <div key={ci} className="bg-[#1a2035] rounded-3xl border border-white/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3" style={{ background: `${cat.color}10` }}>
                    <cat.icon className="w-5 h-5" style={{ color: cat.color }} />
                    <h3 className="text-lg font-bold text-white">{cat.category}</h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {cat.partners.map((p, pi) => (
                      <div key={pi} className="px-6 py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-white font-medium">{p.name}</div>
                          <div className="text-xs text-white/30">{p.role}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold mb-1" style={{ color: cat.color }}>{p.priority}</div>
                          <div className="text-xs text-white/40">{p.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>

      {/* 푸터 */}
      <footer className="py-6 px-6 border-t border-white/5 text-center mt-12">
        <p className="text-white/20 text-xs">본 문서는 SARAM Corp. 내부 기밀입니다. 무단 복사·배포·공유를 금합니다.</p>
        <p className="text-white/10 text-xs mt-1">© 2025 SARAM Corp. · adoco98@gmail.com · 기밀 등급 A</p>
      </footer>
    </div>
  );
}
