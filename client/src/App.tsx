import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import WritePage from "./pages/WritePage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import LoginPage from "./pages/LoginPage";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PaymentsPage from "./pages/dashboard/PaymentsPage";
import ProfilePage from "./pages/dashboard/ProfilePage";
import SaramDashboardLayout from "./components/SaramDashboardLayout";
import ScanVerifyPage from "./pages/ScanVerifyPage";
import WillChatPage from "./pages/WillChatPage";
import TaxCalculatorPage from "./pages/TaxCalculatorPage";
import TaxReportPage from "./pages/TaxReportPage";

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
      <Route path={"/will/scan"} component={ScanVerifyPage} />
      <Route path={"/will/chat"} component={WillChatPage} />
      <Route path={"/dashboard"} component={() => <SaramDashboardLayout><DashboardHome /></SaramDashboardLayout>} />
      <Route path={"/dashboard/payments"} component={() => <SaramDashboardLayout><PaymentsPage /></SaramDashboardLayout>} />
      <Route path={"/dashboard/profile"} component={() => <SaramDashboardLayout><ProfilePage /></SaramDashboardLayout>} />
      {/* 상속세 계산기 */}
      <Route path={"/tax"} component={TaxCalculatorPage} />
      <Route path={"/tax/report"} component={TaxReportPage} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
