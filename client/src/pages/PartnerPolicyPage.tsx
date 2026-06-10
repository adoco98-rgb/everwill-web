/**
 * 파트너 정책 안내 페이지
 * 수수료, 등급, 유지비, 규정 등 상세 안내
 */
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, TrendingUp, Shield, DollarSign, Award, AlertCircle, CheckCircle, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const TEXTS: Record<string, any> = {
  ko: {
    title: "파트너 정책 안내",
    subtitle: "EverWill 파트너 프로그램의 수수료, 등급, 유지비 및 운영 규정을 안내합니다.",
    back: "파트너센터로 돌아가기",
    sections: {
      fee: {
        title: "가입비 안내",
        items: [
          { label: "전문가 그룹 (변호사/세무사/법무사)", value: "$99 (1회)" },
          { label: "헬퍼 그룹 (보험/유튜버/셀럽/블로거 등)", value: "$49 (1회)" },
        ]
      },
      grade: {
        title: "등급 시스템 (실적 기반)",
        desc: "연매출 기준으로 자동 승급되며, 등급이 높을수록 커미션율이 상승합니다.",
        table: [
          { grade: "Bronze", condition: "가입 시 기본", fee: "무료", commission: "15%" },
          { grade: "Silver", condition: "연매출 500만원+", fee: "$99/년", commission: "20%" },
          { grade: "Gold", condition: "연매출 2,000만원+", fee: "$199/년", commission: "25%" },
          { grade: "Premium", condition: "연매출 5,000만원+", fee: "$299/년", commission: "30%" },
        ]
      },
      commission: {
        title: "수수료 정산 규정",
        items: [
          "정산 주기: 매월 1회 (매월 말일 결산, 익월 10일 입금)",
          "최소 정산액: $100 (미만 시 다음 달 이월)",
          "정산 방법: 등록된 통장으로 자동 송금",
          "세무 처리: 국가별 세법에 따라 원천징수 후 지급",
        ]
      },
      referral: {
        title: "추천 코드 정책",
        items: [
          "가입 시 고유 추천 코드 자동 발급",
          "추천 코드를 통해 가입한 고객은 영구적으로 파트너에게 귀속",
          "30일간 쿠키 추적으로 재방문 가입도 인정",
          "추천 코드는 URL, QR코드, 링크 형태로 활용 가능",
        ]
      },
      maintenance: {
        title: "등급 유지비 규정",
        items: [
          "Bronze: 유지비 없음 (가입비만 납부)",
          "Silver 이상: 매년 등급 유지비 납부 필요",
          "유지비 미납 시: 30일 유예 → 이후 Bronze로 자동 강등",
          "강등 후 재승급: 다시 연매출 기준 달성 시 자동 복원",
        ]
      },
      rules: {
        title: "운영 규정",
        items: [
          "허위 정보 입력 시 즉시 계정 정지",
          "고객 불만 누적 시 경고 → 3회 경고 시 자격 박탈",
          "타 파트너의 고객을 부당하게 유치하는 행위 금지",
          "EverWill 브랜드 가이드라인 준수 의무",
          "연 1회 온라인 교육 이수 의무 (무료 제공)",
        ]
      },
      professional: {
        title: "전문가 그룹 추가 혜택",
        items: [
          "전문가 소개 페이지에 프로필 무료 노출",
          "고객 사망 시 자동 수임 연결 (담당 고객 우선)",
          "상위 노출 광고 옵션 (Phase 2 이후 유료화 예정)",
          "고객 상담 신청 직접 수신",
        ]
      }
    },
    tableHeaders: ["등급", "승급 조건", "연간 유지비", "커미션율"],
  },
  en: {
    title: "Partner Policy Guide",
    subtitle: "Commission rates, tier system, maintenance fees, and operational guidelines for the EverWill Partner Program.",
    back: "Back to Partner Center",
    sections: {
      fee: {
        title: "Registration Fee",
        items: [
          { label: "Professional Group (Attorney/Tax Advisor/Legal Scrivener)", value: "$99 (one-time)" },
          { label: "Helper Group (Insurance/YouTuber/Celebrity/Blogger etc.)", value: "$49 (one-time)" },
        ]
      },
      grade: {
        title: "Tier System (Performance-Based)",
        desc: "Auto-promotion based on annual revenue. Higher tiers earn higher commission rates.",
        table: [
          { grade: "Bronze", condition: "Default at signup", fee: "Free", commission: "15%" },
          { grade: "Silver", condition: "Annual revenue $3,800+", fee: "$99/yr", commission: "20%" },
          { grade: "Gold", condition: "Annual revenue $15,000+", fee: "$199/yr", commission: "25%" },
          { grade: "Premium", condition: "Annual revenue $38,000+", fee: "$299/yr", commission: "30%" },
        ]
      },
      commission: {
        title: "Commission Settlement Rules",
        items: [
          "Settlement cycle: Monthly (calculated at month-end, paid by the 10th of next month)",
          "Minimum payout: $100 (below threshold rolls over to next month)",
          "Payment method: Auto-transfer to registered bank account",
          "Tax handling: Withholding tax applied per local regulations",
        ]
      },
      referral: {
        title: "Referral Code Policy",
        items: [
          "Unique referral code auto-generated upon registration",
          "Customers acquired via referral code are permanently attributed to the partner",
          "30-day cookie tracking recognizes return visits",
          "Referral code available as URL, QR code, or link format",
        ]
      },
      maintenance: {
        title: "Tier Maintenance Fee Rules",
        items: [
          "Bronze: No maintenance fee (registration fee only)",
          "Silver and above: Annual tier maintenance fee required",
          "Non-payment: 30-day grace period → auto-downgrade to Bronze",
          "Re-promotion: Automatically restored when revenue threshold is met again",
        ]
      },
      rules: {
        title: "Operational Guidelines",
        items: [
          "False information results in immediate account suspension",
          "Accumulated customer complaints: Warning → 3 warnings = disqualification",
          "Prohibited: Unfairly soliciting other partners' customers",
          "Must comply with EverWill brand guidelines",
          "Annual online training required (provided free)",
        ]
      },
      professional: {
        title: "Professional Group Additional Benefits",
        items: [
          "Free profile listing on Expert Directory page",
          "Auto-assignment for client estate execution upon death",
          "Featured listing ad option (paid option from Phase 2)",
          "Direct consultation requests from customers",
        ]
      }
    },
    tableHeaders: ["Tier", "Promotion Condition", "Annual Fee", "Commission"],
  },
  ja: {
    title: "パートナーポリシーガイド",
    subtitle: "EverWillパートナープログラムの手数料、等級、維持費、運営規定をご案内します。",
    back: "パートナーセンターに戻る",
    sections: {
      fee: {
        title: "登録料",
        items: [
          { label: "専門家グループ（弁護士/税理士/司法書士）", value: "$99（1回）" },
          { label: "ヘルパーグループ（保険/YouTuber/セレブ/ブロガー等）", value: "$49（1回）" },
        ]
      },
      grade: {
        title: "等級システム（実績基準）",
        desc: "年間売上基準で自動昇格。等級が高いほど手数料率が上昇します。",
        table: [
          { grade: "Bronze", condition: "登録時デフォルト", fee: "無料", commission: "15%" },
          { grade: "Silver", condition: "年間売上500万ウォン+", fee: "$99/年", commission: "20%" },
          { grade: "Gold", condition: "年間売上2,000万ウォン+", fee: "$199/年", commission: "25%" },
          { grade: "Premium", condition: "年間売上5,000万ウォン+", fee: "$299/年", commission: "30%" },
        ]
      },
      commission: {
        title: "手数料精算規定",
        items: [
          "精算周期：毎月1回（月末決算、翌月10日入金）",
          "最低精算額：$100（未満の場合翌月繰越）",
          "精算方法：登録口座へ自動送金",
          "税務処理：各国税法に基づき源泉徴収後支給",
        ]
      },
      referral: {
        title: "紹介コードポリシー",
        items: [
          "登録時に固有紹介コードを自動発行",
          "紹介コードで加入した顧客は永久的にパートナーに帰属",
          "30日間のクッキー追跡で再訪問加入も認定",
          "紹介コードはURL、QRコード、リンク形式で活用可能",
        ]
      },
      maintenance: {
        title: "等級維持費規定",
        items: [
          "Bronze：維持費なし（登録料のみ）",
          "Silver以上：毎年等級維持費の納付が必要",
          "未納時：30日猶予→その後Bronzeへ自動降格",
          "再昇格：年間売上基準を再達成時に自動復元",
        ]
      },
      rules: {
        title: "運営規定",
        items: [
          "虚偽情報入力時は即座にアカウント停止",
          "顧客苦情累積時：警告→3回警告で資格剥奪",
          "他パートナーの顧客を不当に勧誘する行為禁止",
          "EverWillブランドガイドライン遵守義務",
          "年1回オンライン教育受講義務（無料提供）",
        ]
      },
      professional: {
        title: "専門家グループ追加特典",
        items: [
          "専門家紹介ページにプロフィール無料掲載",
          "顧客死亡時の自動受任連結（担当顧客優先）",
          "上位表示広告オプション（Phase 2以降有料化予定）",
          "顧客からの相談申請を直接受信",
        ]
      }
    },
    tableHeaders: ["等級", "昇格条件", "年間維持費", "手数料率"],
  },
  zh: {
    title: "合作伙伴政策指南",
    subtitle: "EverWill合作伙伴计划的佣金、等级、维护费及运营规定说明。",
    back: "返回合作伙伴中心",
    sections: {
      fee: {
        title: "注册费",
        items: [
          { label: "专家组（律师/税务师/法务师）", value: "$99（一次性）" },
          { label: "助手组（保险/YouTuber/名人/博主等）", value: "$49（一次性）" },
        ]
      },
      grade: {
        title: "等级系统（基于业绩）",
        desc: "根据年营收自动升级。等级越高，佣金率越高。",
        table: [
          { grade: "Bronze", condition: "注册时默认", fee: "免费", commission: "15%" },
          { grade: "Silver", condition: "年营收500万韩元+", fee: "$99/年", commission: "20%" },
          { grade: "Gold", condition: "年营收2,000万韩元+", fee: "$199/年", commission: "25%" },
          { grade: "Premium", condition: "年营收5,000万韩元+", fee: "$299/年", commission: "30%" },
        ]
      },
      commission: {
        title: "佣金结算规定",
        items: [
          "结算周期：每月1次（月末结算，次月10日入账）",
          "最低结算额：$100（不足时顺延至下月）",
          "结算方式：自动转账至注册银行账户",
          "税务处理：按当地税法代扣代缴后支付",
        ]
      },
      referral: {
        title: "推荐码政策",
        items: [
          "注册时自动生成唯一推荐码",
          "通过推荐码注册的客户永久归属于合作伙伴",
          "30天Cookie追踪，回访注册也予以认定",
          "推荐码可用作URL、二维码或链接形式",
        ]
      },
      maintenance: {
        title: "等级维护费规定",
        items: [
          "Bronze：无维护费（仅需注册费）",
          "Silver及以上：每年需缴纳等级维护费",
          "未缴纳：30天宽限期→之后自动降为Bronze",
          "重新升级：再次达到年营收标准时自动恢复",
        ]
      },
      rules: {
        title: "运营规定",
        items: [
          "提供虚假信息将立即冻结账户",
          "客户投诉累积：警告→3次警告取消资格",
          "禁止不正当拉取其他合作伙伴的客户",
          "必须遵守EverWill品牌指南",
          "每年需完成一次在线培训（免费提供）",
        ]
      },
      professional: {
        title: "专家组额外福利",
        items: [
          "专家介绍页面免费展示个人资料",
          "客户去世时自动分配案件（优先分配给负责人）",
          "置顶广告选项（Phase 2后将收费）",
          "直接接收客户咨询申请",
        ]
      }
    },
    tableHeaders: ["等级", "升级条件", "年维护费", "佣金率"],
  }
};

// 비로그인 잠금 화면 텍스트
const LOCK_TEXTS: Record<string, any> = {
  ko: {
    title: "로그인 후 열람 가능합니다",
    desc: "파트너 등급·커미션·정산 정책은 회원에게만 공개됩니다. 무료로 가입하고 확인하세요.",
    login: "로그인 / 회원가입",
    back: "파트너센터로 돌아가기",
  },
  en: {
    title: "Please log in to view",
    desc: "Partner tier, commission, and settlement policies are only available to members. Sign up for free.",
    login: "Login / Sign Up",
    back: "Back to Partner Center",
  },
  ja: {
    title: "ログイン後に閲覧できます",
    desc: "パートナーランク・コミッション・精算ポリシーは会員限定です。無料登録してご確認ください。",
    login: "ログイン / 新規登録",
    back: "パートナーセンターに戻る",
  },
  zh: {
    title: "请登录后查看",
    desc: "合作伙伴等级、佣金和结算政策仅对会员开放。免费注册即可查看。",
    login: "登录 / 注册",
    back: "返回合作伙伴中心",
  },
};

export default function PartnerPolicyPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const texts = TEXTS[language] || TEXTS.ko;
  const { isAuthenticated, loading } = useAuth();
  const lockTexts = LOCK_TEXTS[language] || LOCK_TEXTS.ko;

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  // 비로그인 시 잠금 화면
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <Navbar />
        <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/partner")}
            className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F3864] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {lockTexts.back}
          </button>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-24"
          >
            <div className="w-20 h-20 bg-[#1F3864]/10 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-[#1F3864]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-4">{lockTexts.title}</h2>
            <p className="text-[#6B7280] max-w-md mb-8 leading-relaxed">{lockTexts.desc}</p>
            <button
              onClick={() => window.location.href = getLoginUrl()}
              className="px-8 py-4 bg-[#1F3864] hover:bg-[#162b50] text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              {lockTexts.login}
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate("/partner")}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#1F3864] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {texts.back}
        </button>

        {/* 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#1F3864] mb-4">{texts.title}</h1>
          <p className="text-[#6B7280] text-lg">{texts.subtitle}</p>
        </motion.div>

        {/* 가입비 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <DollarSign className="w-6 h-6 text-[#C9A961]" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.sections.fee.title}</h2>
          </div>
          <div className="space-y-4">
            {texts.sections.fee.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-3 border-b last:border-0">
                <span className="text-[#1A1A1A]">{item.label}</span>
                <span className="font-bold text-[#1F3864] text-lg">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 등급 시스템 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-[#C9A961]" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.sections.grade.title}</h2>
          </div>
          <p className="text-[#6B7280] mb-6">{texts.sections.grade.desc}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1F3864] text-white">
                  {texts.tableHeaders.map((h: string, i: number) => (
                    <th key={i} className="px-4 py-3 font-semibold text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {texts.sections.grade.table.map((row: any, i: number) => (
                  <tr key={i} className="border-b hover:bg-[#FAFAFA]">
                    <td className="px-4 py-3 font-bold">{row.grade}</td>
                    <td className="px-4 py-3">{row.condition}</td>
                    <td className="px-4 py-3">{row.fee}</td>
                    <td className="px-4 py-3 font-bold text-[#C9A961]">{row.commission}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* 수수료 정산 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-[#C9A961]" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.sections.commission.title}</h2>
          </div>
          <ul className="space-y-3">
            {texts.sections.commission.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-[#1A1A1A]">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* 추천 코드 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-[#C9A961]" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.sections.referral.title}</h2>
          </div>
          <ul className="space-y-3">
            {texts.sections.referral.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#1F3864] mt-0.5 shrink-0" />
                <span className="text-[#1A1A1A]">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* 등급 유지비 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-[#C9A961]" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.sections.maintenance.title}</h2>
          </div>
          <ul className="space-y-3">
            {texts.sections.maintenance.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <span className="text-[#1A1A1A]">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* 운영 규정 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-8 shadow-sm border mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold text-[#1A1A1A]">{texts.sections.rules.title}</h2>
          </div>
          <ul className="space-y-3">
            {texts.sections.rules.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <span className="text-[#1A1A1A]">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* 전문가 추가 혜택 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#1F3864] to-[#2a4a7a] rounded-2xl p-8 shadow-sm mb-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-[#C9A961]" />
            <h2 className="text-xl font-bold text-white">{texts.sections.professional.title}</h2>
          </div>
          <ul className="space-y-3">
            {texts.sections.professional.items.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#C9A961] mt-0.5 shrink-0" />
                <span className="text-white/90">{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}
