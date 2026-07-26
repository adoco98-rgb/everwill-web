import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { getDb } from "../db";
import { heirs, users, heirInvitations, wills } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { sendSmsMessage, toE164 } from "../_core/sms";
import { randomUUID } from "crypto";
import { ENV } from "../_core/env";

/**
 * 상속자 관리 라우터
 * - 상속자 목록 조회, 추가, 수정, 삭제
 * - 제1상속자 SMS 알림 동의/발송
 * - 상속인 권한 분리 (제1상속인/제2~N/집행자)
 * - 사망 후 초대 발송 및 수락
 */
export const heirsRouter = router({
  /** 내 상속자 목록 조회 */
  getMyHeirs: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const myHeirs = await db
      .select()
      .from(heirs)
      .where(eq(heirs.userId, ctx.user.id))
      .orderBy(asc(heirs.priority));
    return myHeirs;
  }),

  /** 상속자 추가 */
  addHeir: protectedProcedure
    .input(
      z.object({
        nameKo: z.string().min(1, "이름을 입력해주세요"),
        nameEn: z.string().optional(),
        relationship: z.enum(["spouse", "child", "parent", "sibling", "grandchild", "other"]),
        birthDate: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        country: z.string().default("KR"),
        address: z.string().optional(),
        shareType: z.enum(["percent", "amount"]).default("percent"),
        sharePercent: z.number().min(0).max(100).default(0),
        shareAmount: z.number().min(0).default(0),
        smsConsent: z.number().min(0).max(1).default(0),
        isExecutor: z.number().min(0).max(1).default(0),
        accessLevel: z.enum(["own_only", "full"]).default("own_only"),
        kakaoId: z.string().optional(),
        lineId: z.string().optional(),
        whatsappId: z.string().optional(),
        wechatId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      // 현재 상속자 수 조회하여 priority 자동 설정
      const existingHeirs = await db
        .select({ id: heirs.id })
        .from(heirs)
        .where(eq(heirs.userId, ctx.user.id));
      const priority = existingHeirs.length + 1;

      // 요금 계산: 제1상속인 ₩168,000 / 집행자 ₩149,000 / 제2~N ₩168,000
      let heirFee = 168000;
      if (input.isExecutor === 1) {
        heirFee = 149000;
      } else if (priority === 1) {
        heirFee = 168000;
      }

      // 집행자는 전체 열람 권한 자동 부여
      const accessLevel = input.isExecutor === 1 ? "full" : input.accessLevel;

      const [inserted] = await db.insert(heirs).values({
        userId: ctx.user.id,
        priority,
        nameKo: input.nameKo,
        nameEn: input.nameEn ?? null,
        relationship: input.relationship,
        birthDate: input.birthDate ?? null,
        phone: input.phone ?? null,
        email: input.email || null,
        country: input.country,
        address: input.address ?? null,
        shareType: input.shareType,
        sharePercent: input.sharePercent,
        shareAmount: input.shareAmount,
        smsConsent: input.smsConsent,
        smsSent: 0,
        isExecutor: input.isExecutor,
        accessLevel,
        heirFee,
        heirPaid: 0,
        kakaoId: input.kakaoId ?? null,
        lineId: input.lineId ?? null,
        whatsappId: input.whatsappId ?? null,
        wechatId: input.wechatId ?? null,
      }).returning({ id: heirs.id });

      // 제1상속자이고 SMS 동의한 경우 즉시 알림 발송
      if (priority === 1 && input.smsConsent === 1 && input.phone) {
        const [testator] = await db.select({ name: users.name }).from(users).where(eq(users.id, ctx.user.id));
        const phone = input.phone.startsWith("+") ? input.phone : toE164(input.phone, "+82");
        const message = `[EverWill] ${testator?.name ?? "회원"}님이 EverWill 디지털 유언 서비스에 가입하셨습니다. 유언 작성이 완료되면 알림을 드리겠습니다. www.everwill.co.kr`;
        await sendSmsMessage(phone, message);
        await db.update(heirs).set({ smsSent: 1 }).where(eq(heirs.id, inserted.id));
      }

      return { success: true, priority, heirFee };
    }),

  /** 상속자 정보 수정 */
  updateHeir: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        nameKo: z.string().min(1).optional(),
        nameEn: z.string().optional(),
        relationship: z.enum(["spouse", "child", "parent", "sibling", "grandchild", "other"]).optional(),
        birthDate: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        country: z.string().optional(),
        address: z.string().optional(),
        shareType: z.enum(["percent", "amount"]).optional(),
        sharePercent: z.number().min(0).max(100).optional(),
        shareAmount: z.number().min(0).optional(),
        smsConsent: z.number().min(0).max(1).optional(),
        isExecutor: z.number().min(0).max(1).optional(),
        accessLevel: z.enum(["own_only", "full"]).optional(),
        kakaoId: z.string().optional(),
        lineId: z.string().optional(),
        whatsappId: z.string().optional(),
        wechatId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");
      const { id, ...updateData } = input;

      // 본인 소유 확인
      const [heir] = await db
        .select()
        .from(heirs)
        .where(and(eq(heirs.id, id), eq(heirs.userId, ctx.user.id)));
      if (!heir) throw new Error("상속자를 찾을 수 없습니다");

      // 집행자로 변경 시 전체 열람 권한 자동 부여
      const finalUpdate = { ...updateData } as Partial<typeof heirs.$inferInsert>;
      if (updateData.isExecutor === 1) {
        finalUpdate.accessLevel = "full";
        finalUpdate.heirFee = 149000;
      }

      await db.update(heirs).set(finalUpdate).where(eq(heirs.id, id));
      return { success: true };
    }),

  /** 상속자 삭제 */
  deleteHeir: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      // 본인 소유 확인
      const [heir] = await db
        .select()
        .from(heirs)
        .where(and(eq(heirs.id, input.id), eq(heirs.userId, ctx.user.id)));
      if (!heir) throw new Error("상속자를 찾을 수 없습니다");

      await db.delete(heirs).where(eq(heirs.id, input.id));

      // priority 재정렬
      const remaining = await db
        .select()
        .from(heirs)
        .where(eq(heirs.userId, ctx.user.id))
        .orderBy(asc(heirs.priority));

      for (let i = 0; i < remaining.length; i++) {
        await db.update(heirs).set({ priority: i + 1 }).where(eq(heirs.id, remaining[i].id));
      }

      return { success: true };
    }),

  /** 유언 완료 후 제1상속자에게 SMS 알림 발송 */
  sendWillNotification: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false, error: "데이터베이스 연결 오류" };

    // 제1상속자 조회
    const [firstHeir] = await db
      .select()
      .from(heirs)
      .where(and(eq(heirs.userId, ctx.user.id), eq(heirs.priority, 1)));

    if (!firstHeir) return { success: false, error: "제1상속자가 등록되지 않았습니다" };
    if (!firstHeir.phone) return { success: false, error: "제1상속자 전화번호가 없습니다" };
    if (!firstHeir.smsConsent) return { success: false, error: "SMS 알림에 동의하지 않았습니다" };

    const [testator] = await db.select({ name: users.name }).from(users).where(eq(users.id, ctx.user.id));
    const phone = firstHeir.phone.startsWith("+") ? firstHeir.phone : toE164(firstHeir.phone, "+82");
    const message = `[EverWill] ${testator?.name ?? "유언자"}님의 디지털 유언이 EverWill에 안전하게 보관되었습니다. 유언자가 지정한 시점에 내용이 공개됩니다. www.everwill.co.kr`;

    const result = await sendSmsMessage(phone, message);
    if (result.success) {
      await db.update(heirs).set({ smsSent: 1 }).where(eq(heirs.id, firstHeir.id));
    }
    return result;
  }),

  /**
   * 사망 감지 후 모든 상속인에게 초대 발송
   * (관리자 또는 사망 감지 시스템에서 호출)
   */
  sendHeirInvitations: protectedProcedure
    .input(z.object({ willId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      // 유언 소유자 확인
      const [will] = await db.select().from(wills).where(
        and(eq(wills.id, input.willId), eq(wills.userId, ctx.user.id))
      );
      if (!will) throw new Error("유언을 찾을 수 없습니다");

      // 모든 상속인 조회
      const allHeirs = await db
        .select()
        .from(heirs)
        .where(eq(heirs.userId, ctx.user.id))
        .orderBy(asc(heirs.priority));

      const results = [];
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30일 후 만료

      for (const heir of allHeirs) {
        // 이미 초대가 있는지 확인
        const [existing] = await db.select().from(heirInvitations).where(
          and(eq(heirInvitations.heirId, heir.id), eq(heirInvitations.willId, input.willId))
        );
        if (existing) {
          results.push({ heirId: heir.id, status: "already_sent" });
          continue;
        }

        // 초대 토큰 생성
        const token = randomUUID();
        await db.insert(heirInvitations).values({
          willId: input.willId,
          heirId: heir.id,
          userId: ctx.user.id,
          token,
          expiresAt,
          isActive: 1,
        });

        // SMS 발송 (전화번호 있는 경우)
        if (heir.phone) {
          const phone = heir.phone.startsWith("+") ? heir.phone : toE164(heir.phone, "+82");
          const inviteUrl = `${ENV.appPublicUrl || "https://everwill.co.kr"}/heir/accept/${token}`;
          const roleLabel = heir.isExecutor ? "집행자" : `제${heir.priority}상속인`;
          const message = `[EverWill] 유언자의 유언 내용 확인을 위해 EverWill에 가입해주세요. (${roleLabel}) 가입 링크: ${inviteUrl} (30일 내 유효)`;
          const smsResult = await sendSmsMessage(phone, message);
          if (smsResult.success) {
            await db.update(heirInvitations).set({ smsSent: 1 }).where(
              and(eq(heirInvitations.heirId, heir.id), eq(heirInvitations.willId, input.willId))
            );
          }
        }

        results.push({ heirId: heir.id, status: "sent", token });
      }

      return { success: true, results };
    }),

  /**
   * 초대 토큰 검증 및 상속인 정보 조회
   * (상속인 가입 페이지에서 호출 - 비인증)
   */
  verifyInvitationToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      const [invitation] = await db
        .select()
        .from(heirInvitations)
        .where(eq(heirInvitations.token, input.token));

      if (!invitation) throw new Error("유효하지 않은 초대 링크입니다");
      if (!invitation.isActive) throw new Error("아직 활성화되지 않은 초대입니다");
      if (new Date(invitation.expiresAt) < new Date()) throw new Error("만료된 초대 링크입니다");

      // 상속인 정보 조회 (이름, 순위만 반환 - 개인정보 최소화)
      const [heir] = await db.select({
        id: heirs.id,
        nameKo: heirs.nameKo,
        priority: heirs.priority,
        isExecutor: heirs.isExecutor,
        accessLevel: heirs.accessLevel,
        heirFee: heirs.heirFee,
        heirPaid: heirs.heirPaid,
      }).from(heirs).where(eq(heirs.id, invitation.heirId));

      if (!heir) throw new Error("상속인 정보를 찾을 수 없습니다");

      return {
        valid: true,
        invitation: {
          id: invitation.id,
          willId: invitation.willId,
          accepted: invitation.accepted,
          registered: invitation.registered,
        },
        heir: {
          id: heir.id,
          nameKo: heir.nameKo,
          priority: heir.priority,
          isExecutor: heir.isExecutor,
          accessLevel: heir.accessLevel,
          heirFee: heir.heirFee,
          heirPaid: heir.heirPaid,
          roleLabel: heir.isExecutor ? "집행자" : `제${heir.priority}상속인`,
          feeLabel: heir.isExecutor
            ? "₩149,000"
            : heir.priority === 1
            ? "₩168,000"
            : "₩168,000",
        },
      };
    }),

  /**
   * 초대 수락 처리 (상속인 가입 완료 후 호출)
   */
  acceptInvitation: protectedProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      const [invitation] = await db
        .select()
        .from(heirInvitations)
        .where(eq(heirInvitations.token, input.token));

      if (!invitation) throw new Error("유효하지 않은 초대 링크입니다");
      if (!invitation.isActive) throw new Error("아직 활성화되지 않은 초대입니다");
      if (new Date(invitation.expiresAt) < new Date()) throw new Error("만료된 초대 링크입니다");

      // 초대 수락 처리
      await db.update(heirInvitations).set({
        accepted: 1,
        acceptedAt: new Date(),
        registered: 1,
      }).where(eq(heirInvitations.id, invitation.id));

      return {
        success: true,
        willId: invitation.willId,
        heirId: invitation.heirId,
      };
    }),

  /**
   * 상속인 권한별 유언 내용 조회
   * - own_only: 자기 몫(상속 지분)만 반환
   * - full (집행자): 전체 유언 내용 반환
   */
  getHeirWillContent: protectedProcedure
    .input(z.object({ willId: z.number(), heirId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("데이터베이스 연결 오류");

      // 초대 수락 여부 확인
      const [invitation] = await db
        .select()
        .from(heirInvitations)
        .where(
          and(
            eq(heirInvitations.willId, input.willId),
            eq(heirInvitations.heirId, input.heirId),
            eq(heirInvitations.accepted, 1)
          )
        );
      if (!invitation) throw new Error("접근 권한이 없습니다. 초대 수락 후 이용 가능합니다");

      // 상속인 정보 조회
      const [heir] = await db.select().from(heirs).where(eq(heirs.id, input.heirId));
      if (!heir) throw new Error("상속인 정보를 찾을 수 없습니다");

      // 유언 내용 조회
      const [will] = await db.select().from(wills).where(eq(wills.id, input.willId));
      if (!will) throw new Error("유언을 찾을 수 없습니다");

      const willData = will.data ? JSON.parse(will.data as string) : {};

      // 접근 권한에 따라 반환 내용 분리
      if (heir.accessLevel === "full" || heir.isExecutor) {
        // 집행자: 전체 유언 내용 반환
        return {
          accessLevel: "full",
          roleLabel: heir.isExecutor ? "집행자" : `제${heir.priority}상속인`,
          willContent: willData,
          heirs: await db.select().from(heirs).where(eq(heirs.userId, will.userId)).orderBy(asc(heirs.priority)),
        };
      } else {
        // 일반 상속인: 자기 몫만 반환
        const myShare = {
          nameKo: heir.nameKo,
          priority: heir.priority,
          shareType: heir.shareType,
          sharePercent: heir.sharePercent,
          shareAmount: heir.shareAmount,
          relationship: heir.relationship,
        };

        return {
          accessLevel: "own_only",
          roleLabel: `제${heir.priority}상속인`,
          myShare,
          // 유언자 이름만 공개
          testatorName: willData.name || "유언자",
          willStatus: will.status,
        };
      }
    }),
});
