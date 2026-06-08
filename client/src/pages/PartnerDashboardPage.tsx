/**
 * 파트너 대시보드 페이지
 * 가입시킨 회원 내역, 매출 내역, 수수료 내역, 추천 코드 관리
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Users, DollarSign, TrendingUp, Copy, CheckCircle, ArrowLeft, Award, Calendar, ExternalLink, QrCode } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TEXTS: Record<string, any> = {
  ko: {
    title: "파트너 대시보드",
    welcome: "환영합니다",
    grade: "현재 등급",
    referralCode: "내 추천 코드",
    referralLink: "추천 링크",
    copyCode: "코드 복사",
    copyLink: "링크 복사",
    copied: "복사됨!",
    qrCode: "QR 코드 다운로드",
    tabs: ["요약", "회원 내역", "매출 내역", "수수료 내역"],
    summary: {
      totalMembers: "총 가입 회원",
      monthMembers: "이번 달 신규",
      totalRevenue: "총 매출",
      monthRevenue: "이번 달 매출",
      totalCommission: "총 수수료",
      pendingCommission: "정산 대기",
      nextPayout: "다음 정산일",
    },
    membersTable: {
      headers: ["이름", "가입일", "상태", "결제 금액", "수수료"],
      status: { active: "활성", pending: "대기", expired: "만료" },
    },
    revenueTable: {
      headers: ["날짜", "회원명", "상품", "결제 금액"],
    },
    commissionTable: {
      headers: ["정산일", "정산 금액", "상태", "입금 계좌"],
      status: { paid: "입금 완료", pending: "정산 대기", processing: "처리 중" },
    },
    noData: "아직 데이터가 없습니다.",
    upgradeNotice: "다음 등급까지",
    remaining: "남음",
  },
  en: {
    title: "Partner Dashboard",
    welcome: "Welcome",
    grade: "Current Tier",
    referralCode: "My Referral Code",
    referralLink: "Referral Link",
    copyCode: "Copy Code",
    copyLink: "Copy Link",
    copied: "Copied!",
    qrCode: "Download QR Code",
    tabs: ["Summary", "Members", "Revenue", "Commission"],
    summary: {
      totalMembers: "Total Members",
      monthMembers: "New This Month",
      totalRevenue: "Total Revenue",
      monthRevenue: "This Month Revenue",
      totalCommission: "Total Commission",
      pendingCommission: "Pending",
      nextPayout: "Next Payout",
    },
    membersTable: {
      headers: ["Name", "Joined", "Status", "Payment", "Commission"],
      status: { active: "Active", pending: "Pending", expired: "Expired" },
    },
    revenueTable: {
      headers: ["Date", "Member", "Product", "Amount"],
    },
    commissionTable: {
      headers: ["Date", "Amount", "Status", "Account"],
      status: { paid: "Paid", pending: "Pending", processing: "Processing" },
    },
    noData: "No data yet.",
    upgradeNotice: "Until next tier",
    remaining: "remaining",
  },
  ja: {
    title: "パートナーダッシュボード",
    welcome: "ようこそ",
    grade: "現在の等級",
    referralCode: "紹介コード",
    referralLink: "紹介リンク",
    copyCode: "コードをコピー",
    copyLink: "リンクをコピー",
    copied: "コピーしました！",
    qrCode: "QRコードダウンロード",
    tabs: ["概要", "会員履歴", "売上履歴", "手数料履歴"],
    summary: {
      totalMembers: "総会員数",
      monthMembers: "今月の新規",
      totalRevenue: "総売上",
      monthRevenue: "今月の売上",
      totalCommission: "総手数料",
      pendingCommission: "精算待ち",
      nextPayout: "次回精算日",
    },
    membersTable: {
      headers: ["名前", "加入日", "状態", "支払額", "手数料"],
      status: { active: "アクティブ", pending: "保留中", expired: "期限切れ" },
    },
    revenueTable: {
      headers: ["日付", "会員名", "商品", "金額"],
    },
    commissionTable: {
      headers: ["精算日", "精算額", "状態", "入金口座"],
      status: { paid: "入金完了", pending: "精算待ち", processing: "処理中" },
    },
    noData: "まだデータがありません。",
    upgradeNotice: "次の等級まで",
    remaining: "残り",
  },
  zh: {
    title: "合作伙伴仪表板",
    welcome: "欢迎",
    grade: "当前等级",
    referralCode: "我的推荐码",
    referralLink: "推荐链接",
    copyCode: "复制代码",
    copyLink: "复制链接",
    copied: "已复制！",
    qrCode: "下载二维码",
    tabs: ["概览", "会员记录", "营收记录", "佣金记录"],
    summary: {
      totalMembers: "总会员数",
      monthMembers: "本月新增",
      totalRevenue: "总营收",
      monthRevenue: "本月营收",
      totalCommission: "总佣金",
      pendingCommission: "待结算",
      nextPayout: "下次结算日",
    },
    membersTable: {
      headers: ["姓名", "注册日", "状态", "支付金额", "佣金"],
      status: { active: "活跃", pending: "待处理", expired: "已过期" },
    },
    revenueTable: {
      headers: ["日期", "会员名", "产品", "金额"],
    },
    commissionTable: {
      headers: ["结算日", "结算金额", "状态", "入账账户"],
      status: { paid: "已入账", pending: "待结算", processing: "处理中" },
    },
    noData: "暂无数据。",
    upgradeNotice: "距下一等级",
    remaining: "剩余",
  }
};

// 샘플 데이터 (데모용)
const SAMPLE_DATA = {
  partner: { name: "김변호사", grade: "Silver", code: "EW-KIM2026", commission: 20 },
  summary: { totalMembers: 23, monthMembers: 5, totalRevenue: 8920000, monthRevenue: 1950000, totalCommission: 1784000, pendingCommission: 390000 },
  members: [
    { name: "박지영", date: "2026-06-01", status: "active", payment: 49000, commission: 9800 },
    { name: "이민수", date: "2026-05-28", status: "active", payment: 49000, commission: 9800 },
    { name: "John Smith", date: "2026-05-25", status: "active", payment: 39, commission: 7.8 },
    { name: "田中太郎", date: "2026-05-20", status: "pending", payment: 0, commission: 0 },
    { name: "최서연", date: "2026-05-15", status: "active", payment: 128000, commission: 25600 },
  ],
  revenue: [
    { date: "2026-06-05", member: "박지영", product: "유언 인증", amount: 49000 },
    { date: "2026-06-03", member: "박지영", product: "Badge Essential", amount: 49000 },
    { date: "2026-06-01", member: "이민수", product: "유언 인증", amount: 49000 },
    { date: "2026-05-28", member: "John Smith", product: "Will Certification", amount: 39 },
    { date: "2026-05-25", member: "최서연", product: "유언 인증 + Badge Wearable", amount: 128000 },
  ],
  commissions: [
    { date: "2026-06-10", amount: 390000, status: "pending", account: "신한 ***-1234" },
    { date: "2026-05-10", amount: 520000, status: "paid", account: "신한 ***-1234" },
    { date: "2026-04-10", amount: 430000, status: "paid", account: "신한 ***-1234" },
    { date: "2026-03-10", amount: 444000, status: "paid", account: "신한 ***-1234" },
  ],
};

export default function PartnerDashboardPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const texts = TEXTS[language] || TEXTS.ko;
  const [activeTab, setActiveTab] = useState(0);
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const data = SAMPLE_DATA;
  const referralLink = `https://everwill.com/ref/${data.partner.code}`;

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } else {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount < 1000) return `$${amount}`;
    return `₩${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#1F3864] to-[#2a4a7a] rounded-2xl p-8 mb-8 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-white/60 text-sm">{texts.welcome}</p>
              <h1 className="text-2xl md:text-3xl font-bold mt-1">{data.partner.name}</h1>
              <div className="flex items-center gap-2 mt-3">
                <Award className="w-5 h-5 text-[#C9A961]" />
                <span className="text-[#C9A961] font-semibold">{texts.grade}: {data.partner.grade}</span>
                <span className="text-white/50 text-sm">({data.partner.commission}% commission)</span>
              </div>
            </div>

            {/* 추천 코드 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 min-w-[300px]">
              <p className="text-white/60 text-xs mb-2">{texts.referralCode}</p>
              <div className="flex items-center gap-2 mb-3">
                <code className="text-xl font-bold text-[#C9A961] tracking-wider">{data.partner.code}</code>
                <button
                  onClick={() => copyToClipboard(data.partner.code, "code")}
                  className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                  title={texts.copyCode}
                >
                  {codeCopied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-white/60 text-xs mb-1">{texts.referralLink}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 truncate flex-1">{referralLink}</span>
                <button
                  onClick={() => copyToClipboard(referralLink, "link")}
                  className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all shrink-0"
                  title={texts.copyLink}
                >
                  {linkCopied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all shrink-0"
                  title={texts.qrCode}
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
              {(codeCopied || linkCopied) && (
                <p className="text-green-400 text-xs mt-2">{texts.copied}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {texts.tabs.map((tab: string, i: number) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                activeTab === i
                  ? "bg-[#1F3864] text-white"
                  : "bg-white text-[#6B7280] hover:bg-gray-100 border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-5 h-5 text-[#1F3864]" />
                <span className="text-sm text-[#6B7280]">{texts.summary.totalMembers}</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{data.summary.totalMembers}</p>
              <p className="text-xs text-green-500 mt-1">+{data.summary.monthMembers} {texts.summary.monthMembers}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-5 h-5 text-[#C9A961]" />
                <span className="text-sm text-[#6B7280]">{texts.summary.totalRevenue}</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{formatCurrency(data.summary.totalRevenue)}</p>
              <p className="text-xs text-green-500 mt-1">+{formatCurrency(data.summary.monthRevenue)} {texts.summary.monthRevenue}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-[#6B7280]">{texts.summary.totalCommission}</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{formatCurrency(data.summary.totalCommission)}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-[#6B7280]">{texts.summary.pendingCommission}</span>
              </div>
              <p className="text-3xl font-bold text-orange-500">{formatCurrency(data.summary.pendingCommission)}</p>
              <p className="text-xs text-[#6B7280] mt-1">{texts.summary.nextPayout}: 2026-07-10</p>
            </div>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b">
                    {texts.membersTable.headers.map((h: string, i: number) => (
                      <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.members.map((m, i) => (
                    <tr key={i} className="border-b hover:bg-[#FAFAFA]">
                      <td className="px-6 py-4 font-medium">{m.name}</td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{m.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          m.status === "active" ? "bg-green-100 text-green-700" :
                          m.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {texts.membersTable.status[m.status as keyof typeof texts.membersTable.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{formatCurrency(m.payment)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-[#C9A961]">{formatCurrency(m.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b">
                    {texts.revenueTable.headers.map((h: string, i: number) => (
                      <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.revenue.map((r, i) => (
                    <tr key={i} className="border-b hover:bg-[#FAFAFA]">
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{r.date}</td>
                      <td className="px-6 py-4 font-medium">{r.member}</td>
                      <td className="px-6 py-4 text-sm">{r.product}</td>
                      <td className="px-6 py-4 font-medium text-[#1F3864]">{formatCurrency(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b">
                    {texts.commissionTable.headers.map((h: string, i: number) => (
                      <th key={i} className="px-6 py-4 text-left text-sm font-semibold text-[#1A1A1A]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.commissions.map((c, i) => (
                    <tr key={i} className="border-b hover:bg-[#FAFAFA]">
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{c.date}</td>
                      <td className="px-6 py-4 font-bold text-[#1A1A1A]">{formatCurrency(c.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          c.status === "paid" ? "bg-green-100 text-green-700" :
                          c.status === "pending" ? "bg-orange-100 text-orange-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {texts.commissionTable.status[c.status as keyof typeof texts.commissionTable.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">{c.account}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
