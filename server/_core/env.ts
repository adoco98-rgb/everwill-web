export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  // Twilio Verify SMS OTP
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID ?? "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN ?? "",
  twilioVerifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID ?? "",
  // 소셜 로그인 redirect_uri 고정 URL (배포 환경에서 필수)
  appPublicUrl: process.env.APP_PUBLIC_URL ?? "",
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  // Kakao OAuth
  kakaoClientId: process.env.KAKAO_CLIENT_ID ?? "",
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
  // Naver OAuth
  naverClientId: process.env.NAVER_CLIENT_ID ?? "",
  naverClientSecret: process.env.NAVER_CLIENT_SECRET ?? "",
  // LINE OAuth
  lineChannelId: process.env.LINE_CHANNEL_ID ?? "",
  lineChannelSecret: process.env.LINE_CHANNEL_SECRET ?? "",
};
