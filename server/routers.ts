import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { willRouter } from "./routers/willRouter";
import { taxRouter } from "./routers/taxRouter";
import { assetRouter } from "./routers/assetRouter";
import { statsRouter } from "./routers/statsRouter";
import { emailAuthRouter } from "./routers/emailAuthRouter";
import { referralRouter } from "./routers/referralRouter";
import { inquiryRouter } from "./routers/inquiryRouter";
import { farewellRouter } from "./routers/farewellRouter";
import { signupTrackingRouter } from "./routers/signupTrackingRouter";
import { phoneAuthRouter } from "./routers/phoneAuthRouter";
import { qrRouter } from "./routers/qrRouter";
import { assetVerifyRouter } from "./routers/assetVerifyRouter";
import { adminRouter, adminCountryRouter } from "./routers/adminRouter";
import { heirsRouter } from "./routers/heirsRouter";
import { newsRouter } from "./routers/newsRouter";
import { idScanRouter } from "./routers/idScanRouter";
import { charityRouter } from "./routers/charityRouter";
import { memberGradeRouter } from "./routers/memberGradeRouter";
import { willAutoRouter } from "./routers/willAutoRouter";
import { pdfRouter } from "./routers/pdfRouter";
import { chatRouter } from "./routers/chatRouter";
import { verificationRouter } from "./routers/verificationRouter";
import { siteSettingsRouter } from "./routers/siteSettingsRouter";
import { lifeStoryRouter } from "./routers/lifeStoryRouter";
import { voiceRouter } from "./routers/voiceRouter";
import { artworkRouter } from "./routers/artworkRouter";
import { autobiographyRouter } from "./routers/autobiographyRouter";
import { medicalDirectiveRouter } from "./routers/medicalDirectiveRouter";
import { willCertificateRouter } from "./routers/willCertificateRouter";
import { tossPaymentRouter } from "./routers/tossPaymentRouter";
import { videoWillRouter } from "./routers/videoWillRouter";
import { aiMemoryRouter } from "./routers/aiMemoryRouter";
import { aiPromptRouter } from "./routers/aiPromptRouter";
import { expertRouter } from "./routers/expertRouter";
import { consultationRouter } from "./routers/consultationRouter";
import { attachmentRouter } from "./routers/attachmentRouter";
import { countryPricingRouter } from "./routers/countryPricingRouter";
import { docAnalyzeRouter } from "./routers/docAnalyzeRouter";
import { profileRouter } from "./routers/profileRouter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    // 이메일 OTP 인증
    email: emailAuthRouter,
    // 휴대폰 OTP 인증 (Twilio Verify)
    phone: phoneAuthRouter,
  }),

  // AI 유언장 라우터
  will: willRouter,
  // 상속세 계산 라우터
  tax: taxRouter,
  // 재산·상속자 관리 라우터
  asset: assetRouter,
  // 사이트 통계 라우터 (인증회원 카운터)
  stats: statsRouter,
  // 추천인 & 포인트 라우터
  referral: referralRouter,
  inquiry: inquiryRouter,
  // 유서 라우터
  farewell: farewellRouter,
  // 회원가입 이탈 추적 라우터
  signupTracking: signupTrackingRouter,
  // QR 코드 라우터
  qr: qrRouter,
  // 자산 인증 라우터
  assetVerify: assetVerifyRouter,
  // 관리자 전용 라우터
  admin: adminRouter,
  // 관리자 국가별 통합 관리 라우터
  adminCountry: adminCountryRouter,
  // 상속자 관리 라우터
  heirs: heirsRouter,
  // 글로벌 뉴스 라우터
  news: newsRouter,
  // 신분증 스캔 OCR 라우터
  idScan: idScanRouter,
  // 사회기부 유언 라우터
  charity: charityRouter,
  // 회원 등급 관리 라우터
  memberGrade: memberGradeRouter,
  // 유언장 자동화 파이프라인 (자산증명서 스캔 → 자산 자동완성 → 유언장 자동 생성)
  willAuto: willAutoRouter,
  // PDF 생성 라우터
  pdf: pdfRouter,
  // AI 챗봇 라우터
  chat: chatRouter,
  // 얼굴 인증 (KYC) 라우터
  verification: verificationRouter,
  // 사이트 설정 (소셜 링크 등) 라우터
  siteSettings: siteSettingsRouter,
  // Life Story (AI 일기·편지·인물앨범) — ₩168,000 이상 전용
  lifeStory: lifeStoryRouter,
  // 음성 인식 (Whisper API)
  voice: voiceRouter,
  // AI 그림 변환 (사진 → 수채화/일러스트)
  artwork: artworkRouter,
  // 나의 자서전 (AI 대화 + 챕터 생성 + PDF)
  autobiography: autobiographyRouter,
  // 사전의료의향서 / 장기기증 동의서
  medicalDirective: medicalDirectiveRouter,
  // 유언인증서 발급 내역
  willCertificate: willCertificateRouter,
  // 토스페이먼츠 결제
  tossPayment: tossPaymentRouter,
  // 영상 유언장
  videoWill: videoWillRouter,
  // 개인 AI 메모리 (나만의 AI - 완전 격리)
  aiMemory: aiMemoryRouter,
  // 관리자 AI 프롬프트 관리 (관리자가 AI 지침 직접 입력/수정)
  aiPrompt: aiPromptRouter,
  // 전문가 파트너 시스템 (변호사·세무사·공증인)
  expert: expertRouter,
  // 전문가 상담 신청 시스템
  consultation: consultationRouter,
  // 유언 첨부파일 (부동산등본·통장사본·주식잔고증명·코인보유증명 등)
  attachment: attachmentRouter,
  // 국가별 가격 관리
  countryPricing: countryPricingRouter,
  // 공증서류 AI 분석 (선명도·서류종류·유효기간·필수항목)
  docAnalyze: docAnalyzeRouter,
  // 프로필 기본정보 저장 (유언 작성 1단계)
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
