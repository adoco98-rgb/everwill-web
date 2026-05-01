import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { getDb } from "../db";
import { heirs, users } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { sendSmsMessage, toE164 } from "../_core/sms";

/**
 * 상속자 관리 라우터
 * - 상속자 목록 조회, 추가, 수정, 삭제
 * - 제1상속자 SMS 알림 동의/발송
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
      });

      // 제1상속자이고 SMS 동의한 경우 즉시 알림 발송
      if (priority === 1 && input.smsConsent === 1 && input.phone) {
        const [testator] = await db.select({ name: users.name }).from(users).where(eq(users.id, ctx.user.id));
        const phone = input.phone.startsWith("+") ? input.phone : toE164(input.phone, "+82");
        const message = `[EverWill] ${testator?.name ?? "회원"}님이 EverWill 디지털 유언 서비스에 가입하셨습니다. 유언 작성이 완료되면 알림을 드리겠습니다. www.everwill.co.kr`;
        await sendSmsMessage(phone, message);
        // smsSent 업데이트
        await db.update(heirs).set({ smsSent: 1 }).where(eq(heirs.id, (inserted as { insertId: number }).insertId));
      }

      return { success: true, priority };
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

      await db.update(heirs).set(updateData).where(eq(heirs.id, id));
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
});
