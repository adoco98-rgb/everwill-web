/**
 * 회원가입 이탈 추적 라우터
 * - recordEvent: 각 단계 진입/이탈/완료 이벤트 기록 (public)
 * - adminStats: 단계별 통계 + 이탈률 조회 (admin)
 * - adminDropoffList: 이탈 사용자 목록 조회 (admin)
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { signupEvents } from "../../drizzle/schema";
import { eq, desc, gte, and, sql, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const STEPS = ["step1", "step2", "step3", "step4", "step5", "complete"] as const;
type Step = typeof STEPS[number];

const STEP_LABELS: Record<Step, string> = {
  step1: "이메일 입력",
  step2: "OTP 인증",
  step3: "프로필 입력",
  step4: "추가 정보",
  step5: "약관 동의",
  complete: "가입 완료",
};

/** 이메일 마스킹: abc@gmail.com → a**@gmail.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.slice(0, 1) + "*".repeat(Math.max(local.length - 1, 2));
  return `${masked}@${domain}`;
}

/** 기기 감지 (User-Agent 기반) */
function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

export const signupTrackingRouter = router({
  /**
   * 이벤트 기록 (비로그인 가능)
   * 각 단계 진입(enter)/이탈(leave)/완료(complete) 시 호출
   */
  recordEvent: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(8).max(64),
        event: z.enum(["enter", "leave", "complete"]),
        step: z.enum(["step1", "step2", "step3", "step4", "step5", "complete"]),
        email: z.string().email().optional(),
        country: z.string().max(8).optional(),
        lang: z.string().max(16).optional(),
        durationSec: z.number().int().min(0).max(86400).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };

      // User-Agent로 기기 감지
      const ua = (ctx.req as any).headers?.["user-agent"] ?? "";
      const device = detectDevice(ua);

      await db.insert(signupEvents).values({
        sessionId: input.sessionId,
        event: input.event,
        step: input.step,
        emailMasked: input.email ? maskEmail(input.email) : null,
        country: input.country ?? null,
        lang: input.lang ?? null,
        device,
        durationSec: input.durationSec ?? null,
      });

      return { success: true };
    }),

  /**
   * 관리자: 단계별 통계 + 이탈률
   */
  adminStats: protectedProcedure
    .input(
      z.object({
        /** 기간 필터: today | 7d | 30d | all */
        period: z.enum(["today", "7d", "30d", "all"]).default("7d"),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // 기간 필터 계산
      const now = new Date();
      let since: Date | null = null;
      if (input.period === "today") {
        since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (input.period === "7d") {
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (input.period === "30d") {
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      const whereClause = since
        ? and(eq(signupEvents.event, "enter"), gte(signupEvents.createdAt, since))
        : eq(signupEvents.event, "enter");

      // 단계별 진입 세션 수 집계
      const enterCounts = await db
        .select({
          step: signupEvents.step,
          sessions: sql<number>`COUNT(DISTINCT ${signupEvents.sessionId})`,
        })
        .from(signupEvents)
        .where(whereClause)
        .groupBy(signupEvents.step);

      // 완료 세션 수
      const completeWhere = since
        ? and(eq(signupEvents.event, "complete"), gte(signupEvents.createdAt, since))
        : eq(signupEvents.event, "complete");

      const [completeRow] = await db
        .select({ sessions: sql<number>`COUNT(DISTINCT ${signupEvents.sessionId})` })
        .from(signupEvents)
        .where(completeWhere);

      // 단계별 이탈 세션 수 (leave 이벤트)
      const leaveWhere = since
        ? and(eq(signupEvents.event, "leave"), gte(signupEvents.createdAt, since))
        : eq(signupEvents.event, "leave");

      const leaveCounts = await db
        .select({
          step: signupEvents.step,
          sessions: sql<number>`COUNT(DISTINCT ${signupEvents.sessionId})`,
        })
        .from(signupEvents)
        .where(leaveWhere)
        .groupBy(signupEvents.step);

      // 국가별 분포
      const countryDist = await db
        .select({
          country: signupEvents.country,
          cnt: sql<number>`COUNT(DISTINCT ${signupEvents.sessionId})`,
        })
        .from(signupEvents)
        .where(
          since
            ? and(eq(signupEvents.event, "enter"), eq(signupEvents.step, "step1"), gte(signupEvents.createdAt, since))
            : and(eq(signupEvents.event, "enter"), eq(signupEvents.step, "step1"))
        )
        .groupBy(signupEvents.country)
        .orderBy(desc(sql`cnt`))
        .limit(10);

      // 기기별 분포
      const deviceDist = await db
        .select({
          device: signupEvents.device,
          cnt: sql<number>`COUNT(DISTINCT ${signupEvents.sessionId})`,
        })
        .from(signupEvents)
        .where(
          since
            ? and(eq(signupEvents.event, "enter"), eq(signupEvents.step, "step1"), gte(signupEvents.createdAt, since))
            : and(eq(signupEvents.event, "enter"), eq(signupEvents.step, "step1"))
        )
        .groupBy(signupEvents.device);

      // 결과 조합
      const enterMap: Record<string, number> = {};
      for (const row of enterCounts) {
        enterMap[row.step] = Number(row.sessions);
      }
      const leaveMap: Record<string, number> = {};
      for (const row of leaveCounts) {
        leaveMap[row.step] = Number(row.sessions);
      }

      const totalEntered = enterMap["step1"] ?? 0;
      const totalCompleted = Number(completeRow?.sessions ?? 0);

      const funnel = STEPS.map((step, idx) => {
        const entered = step === "complete" ? totalCompleted : (enterMap[step] ?? 0);
        const prevEntered = idx === 0 ? entered : (STEPS[idx - 1] === "complete" ? totalCompleted : (enterMap[STEPS[idx - 1]] ?? 0));
        const left = leaveMap[step] ?? 0;
        const dropoffRate = prevEntered > 0 ? Math.round((left / prevEntered) * 100) : 0;
        const conversionRate = totalEntered > 0 ? Math.round((entered / totalEntered) * 100) : 0;

        return {
          step,
          label: STEP_LABELS[step],
          entered,
          left,
          dropoffRate,
          conversionRate,
        };
      });

      return {
        funnel,
        totalEntered,
        totalCompleted,
        overallConversionRate: totalEntered > 0 ? Math.round((totalCompleted / totalEntered) * 100) : 0,
        countryDist: countryDist.map(r => ({ country: r.country ?? "unknown", cnt: Number(r.cnt) })),
        deviceDist: deviceDist.map(r => ({ device: r.device ?? "desktop", cnt: Number(r.cnt) })),
      };
    }),

  /**
   * 관리자: 이탈 사용자 목록 (leave 이벤트 기준)
   */
  adminDropoffList: protectedProcedure
    .input(
      z.object({
        period: z.enum(["today", "7d", "30d", "all"]).default("7d"),
        step: z.enum(["step1", "step2", "step3", "step4", "step5", "all"]).default("all"),
        limit: z.number().int().min(1).max(200).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const now = new Date();
      let since: Date | null = null;
      if (input.period === "today") {
        since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (input.period === "7d") {
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (input.period === "30d") {
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // 필터 조건 조합
      const conditions = [eq(signupEvents.event, "leave")];
      if (since) conditions.push(gte(signupEvents.createdAt, since));
      if (input.step !== "all") conditions.push(eq(signupEvents.step, input.step as Step));

      const rows = await db
        .select()
        .from(signupEvents)
        .where(and(...conditions))
        .orderBy(desc(signupEvents.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [totalRow] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(signupEvents)
        .where(and(...conditions));

      return {
        list: rows.map(r => ({
          id: r.id,
          sessionId: r.sessionId.slice(0, 8) + "...", // 세션 ID 앞 8자만 노출
          step: r.step,
          stepLabel: STEP_LABELS[r.step as Step] ?? r.step,
          emailMasked: r.emailMasked,
          country: r.country,
          device: r.device,
          lang: r.lang,
          durationSec: r.durationSec,
          createdAt: r.createdAt,
        })),
        total: Number(totalRow?.total ?? 0),
      };
    }),
});
