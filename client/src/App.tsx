import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ComingSoon from "./pages/ComingSoon";
import WritePage from "./pages/WritePage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import LoginPage from "./pages/LoginPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import InquiriesPage from "./pages/dashboard/InquiriesPage";
import SaramDashboardLayout from "./components/SaramDashboardLayout";
import ScanVerifyPage from "./pages/ScanVerifyPage";
import WillChatPage from "./pages/WillChatPage";
import TaxCalculatorPage from "./pages/TaxCalculatorPage";
import TaxReportPage from "./pages/TaxReportPage";
import InvestPage from "./pages/InvestPage";
import PitchPage from "./pages/PitchPage";
import AssetsPage from "./pages/AssetsPage";
import InvestorPage from "./pages/InvestorPage";
import InternalPage from "./pages/InternalPage";
import AdminPage from "./pages/AdminPage";
import LetterDashboard from "./pages/LetterDashboard";
import LifeStoryPage from "./pages/LifeStoryPage";
import LetterWrite from "./pages/LetterWrite";
import CharityPage from "./pages/CharityPage";
import Feedback from "./pages/Feedback";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import FaqPage from "./pages/FaqPage";
import PricingPage from "./pages/PricingPage";
import WillFormatsPage from "./pages/WillFormatsPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import MembershipCardPage from "./pages/dashboard/MembershipCardPage";
import AssetVerifyPage from "./pages/dashboard/AssetVerifyPage";
import HeirsPage from "./pages/dashboard/HeirsPage";
import MedicalDirectivePage from "./pages/dashboard/MedicalDirectivePage";
import WillsPage from "./pages/dashboard/WillsPage";
import WillDetailPage from "./pages/dashboard/WillDetailPage";
import WillRevisionPage from "./pages/dashboard/WillRevisionPage";
import HeirAcceptPage from "./pages/HeirAcceptPage";
import BadgePage from "./pages/dashboard/BadgePage";
import CertificationPage from "./pages/dashboard/CertificationPage";
import WillWizardPage from "./pages/dashboard/WillWizardPage";
import CountryPage from "./pages/CountryPage";
import AutobiographyPage from "./pages/AutobiographyPage";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { LanguageProvider } from "./contexts/LanguageContext";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/write"} component={WritePage} />
      <Route path={"/payment"} component={PaymentPage} />
      <Route path={"/payment/success"} component={PaymentSuccess} />
      <Route path={"/payment/cancel"} component={PaymentCancel} />
      <Route path={"/login"} component={LoginPage} />
      {/* 약관 페이지 */}
      <Route path={"/terms"} component={TermsPage} />
      <Route path={"/privacy"} component={PrivacyPage} />
      {/* 정보 페이지 */}
      <Route path={"/faq"} component={FaqPage} />
      <Route path={"/pricing"} component={PricingPage} />
      <Route path={"/will-formats"} component={WillFormatsPage} />
      {/* QR 코드 공개 프로필 페이지 */}
      <Route path={"/profile/:qrCode"} component={PublicProfilePage} />
      <Route path={"/will/scan"} component={ScanVerifyPage} />
      <Route path={"/will/chat"} component={WillChatPage} />
      <Route path={"/dashboard"} component={() => <SaramDashboardLayout><DashboardHome /></SaramDashboardLayout>} />
      <Route path={"/dashboard/payments"} component={() => <SaramDashboardLayout><PaymentsPage /></SaramDashboardLayout>} />
      <Route path={"/dashboard/profile"} component={() => <SaramDashboardLayout><ProfilePage /></SaramDashboardLayout>} />
      <Route path={"/dashboard/membership"} component={() => <SaramDashboardLayout><MembershipCardPage /></SaramDashboardLayout>} />
      <Route path={"/dashboard/asset-verify"} component={() => <SaramDashboardLayout><AssetVerifyPage /></SaramDashboardLayout>} />
      <Route path={"/dashboard/inquiries"} component={() => <SaramDashboardLayout><InquiriesPage /></SaramDashboardLayout>} />
      <Route path={"/dashboard/heirs"} component={() => <SaramDashboardLayout><HeirsPage /></SaramDashboardLayout>} />
      {/* Badge 카드 관리 */}
      <Route path={"/dashboard/badge"} component={() => <SaramDashboardLayout><BadgePage /></SaramDashboardLayout>} />
      {/* 인증 현황 */}
      <Route path={"/dashboard/certification"} component={() => <SaramDashboardLayout><CertificationPage /></SaramDashboardLayout>} />
      {/* 유언 완성 6단계 위저드 */}
      <Route path={"/dashboard/will-wizard"} component={() => <SaramDashboardLayout><WillWizardPage /></SaramDashboardLayout>} />
      {/* 연명치료 거부·장기기증 */}
      <Route path={"/dashboard/medical-directive"} component={MedicalDirectivePage} />
      {/* 내 유언장 목록 */}
      <Route path={"/dashboard/wills"} component={() => <SaramDashboardLayout><WillsPage /></SaramDashboardLayout>} />
      {/* 유언장 수정 게이트 */}
      <Route path={"/dashboard/wills/:willId/revise"} component={() => <SaramDashboardLayout><WillRevisionPage /></SaramDashboardLayout>} />
      {/* 유언장 상세 */}
      <Route path={"/dashboard/wills/:id"} component={() => <SaramDashboardLayout><WillDetailPage /></SaramDashboardLayout>} />
      {/* 상속세 계산기 */}
      <Route path={"/tax"} component={TaxCalculatorPage} />
      <Route path={"/tax/report"} component={TaxReportPage} />
      {/* 투자 유치 페이지 */}
      <Route path={"/invest"} component={InvestPage} />
      {/* 사업기획서 */}
      <Route path={"/pitch"} component={PitchPage} />
      {/* 재산 등록 관리 */}
      <Route path={"/assets"} component={AssetsPage} />
      {/* 투자유치 사업설명회 - 비공개 URL */}
      <Route path={"/investor"} component={InvestorPage} />
      {/* Life Story - AI 일기·편지·인물앨범 (₩79,000 이상 전용) */}
      <Route path={"/life-story"} component={LifeStoryPage} />
      {/* 나의 자서전 만들기 (AI 대화 + 음성 + 사진 그림) */}
      <Route path={"/life-story/autobiography"} component={AutobiographyPage} />
      {/* 유서 쓰기 */}
      <Route path={"/letter"} component={LetterDashboard} />
      <Route path={"/letter/write"} component={LetterWrite} />
      {/* 사회기부 소개 페이지 */}
      <Route path={"/charity"} component={CharityPage} />
      {/* 상속인 초대 수락 페이지 */}
      <Route path={"/heir/accept/:token"} component={HeirAcceptPage} />
      {/* 만족도 평가 페이지 (이메일 링크 클릭 시) */}
      <Route path={"/feedback"} component={Feedback} />
      {/* 국가별 전용 랜딩 페이지 (/country/kr, /country/us, /country/jp 등) */}
      <Route path={"/country/:code"} component={CountryPage} />
      {/* 관리자 대시보드 */}
      <Route path={"/799805"} component={AdminPage} />
      {/* 내부 기밀 사업기획서 - 비공개 URL */}
      <Route path={"/799805/internal"} component={InternalPage} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <ChatbotWidget />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
