import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerStorageProxy } from "./storageProxy";
import { registerStripeRoutes } from "../stripe/stripeRoutes";
import { familyDocUploadRouter } from "../familyDocUpload";
import { registerSocialAuthRoutes } from "../socialAuth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  otpSendLimiter,
  otpVerifyLimiter,
  loginAttemptLimiter,
  registrationLimiter,
  inquiryCreateLimiter,
  signupTrackingLimiter,
} from "./rateLimiter";
import { assertAuthEnv } from "./env";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

export async function configureApp(
  app: express.Express,
  server: ReturnType<typeof createServer>
) {
  assertAuthEnv();
  app.set("trust proxy", 1);
  // Stripe webhook은 raw body가 필요하므로 express.json() 전에 등록
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }));
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rate Limiting 엔드포인트별 적용
  // OTP 발송 제한 (15분 5회)
  app.use("/api/trpc/auth.email.sendOtp", otpSendLimiter);
  app.use("/api/trpc/auth.phone.sendVerifyOtp", otpSendLimiter);
  // OTP 검증 제한 (15분 10회)
  app.use("/api/trpc/auth.email.loginStep2", otpVerifyLimiter);
  app.use("/api/trpc/auth.phone.loginStep2", otpVerifyLimiter);
  app.use("/api/trpc/auth.email.loginStep1", loginAttemptLimiter);
  app.use("/api/trpc/auth.phone.loginStep1", loginAttemptLimiter);
  app.use("/api/trpc/auth.email.register", registrationLimiter);
  app.use("/api/trpc/auth.phone.register", registrationLimiter);
  // 문의 접수 제한 (1시간 10회)
  app.use("/api/trpc/inquiry.create", inquiryCreateLimiter);
  // 회원가입 추적 제한 (1시간 200회)
  app.use("/api/trpc/signupTracking.recordEvent", signupTrackingLimiter);

  registerStorageProxy(app);
  // 가족관계증명서 multipart 업로드 (base64 JSON 방식 대신 사용)
  app.use(familyDocUploadRouter);
  registerSocialAuthRoutes(app);
  registerStripeRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  await configureApp(app, server);
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch(console.error);
}
