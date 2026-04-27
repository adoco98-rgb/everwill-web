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
import { farewellRouter } from "./routers/farewellRouter";

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
  // 유서 라우터
  farewell: farewellRouter,
});

export type AppRouter = typeof appRouter;
