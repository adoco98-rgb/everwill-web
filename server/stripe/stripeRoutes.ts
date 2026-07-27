/**
 * SARAM Stripe 결제 라우트
 * POST /api/stripe/checkout  → Checkout Session 생성
 * POST /api/stripe/webhook   → Webhook 이벤트 처리 + 결제 DB 저장
 * GET  /api/stripe/session/:id → 세션 상태 조회
 * GET  /api/payments/my      → 내 결제 내역 조회
 */
import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { SARAM_PRODUCTS, type ProductKey, GRADE_RANK, type MemberGrade } from "./products";
import { getDb } from "../db";
import { payments, users, wills } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";
import { ENV } from "../_core/env";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export function registerStripeRoutes(app: Express) {
  /* ─── 1. Checkout Session 생성 (로그인 필수) ─── */
  app.post("/api/stripe/checkout", async (req: Request, res: Response) => {
    try {
      const { items, customerName, willId } = req.body as {
        items: { key: ProductKey; quantity?: number }[];
        customerName?: string;
        willId?: number; // 인증 결제 시 유언장 ID
      };

      if (!items || items.length === 0) {
        res.status(400).json({ error: "결제 항목이 없습니다." });
        return;
      }

      // 로그인 필수: 서버에서만 사용자 정보 주입 (클라이언트 제공 userId/email 신뢰 안 함)
      let authenticatedUserId: string | undefined;
      let authenticatedEmail: string | undefined;
      try {
        const user = await sdk.authenticateRequest(req);
        if (user) {
          authenticatedUserId = user.id.toString();
          authenticatedEmail = user.email || undefined;
        }
      } catch {
        // 비로그인 시 익명 결제 허용
      }

      const origin = req.headers.origin || "http://localhost:3000";

      // 소문자 key를 SARAM_PRODUCTS 대문자 키로 변환하는 헬퍼
      // 예: "certification" → SARAM_PRODUCTS.CERTIFICATION
      const findProductByKey = (k: string) => {
        // 소문자 key 기준으로 SARAM_PRODUCTS 에서 일치하는 항목 찾기
        return Object.values(SARAM_PRODUCTS).find((p) => p.key === k) || null;
      };

      // line_items 구성
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lineItems: any[] = (items as { key: string; quantity?: number }[]).map(({ key, quantity = 1 }) => {
        const product = findProductByKey(key);
        if (!product) throw new Error(`알 수 없는 상품: ${key}`);
        return {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
          },
          quantity,
        };
      });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        customer_email: authenticatedEmail,
        client_reference_id: authenticatedUserId,
        allow_promotion_codes: true,
        payment_method_types: ["card"],
        metadata: {
          user_id: authenticatedUserId || "",
          customer_email: authenticatedEmail || "",
          customer_name: customerName || "",
          items: items.map((i) => i.key).join(","),
          will_id: willId ? willId.toString() : "", // 인증 결제 시 유언장 ID
        },
        success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/payment/cancel`,
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err: unknown) {
      console.error("[Stripe] checkout error:", err);
      const message = err instanceof Error ? err.message : "결제 세션 생성 실패";
      res.status(500).json({ error: message });
    }
  });

  /* ─── 2. Webhook 처리 + DB 저장 ─── */
  app.post(
    "/api/stripe/webhook",
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error("[Webhook] 서명 검증 실패:", err);
        res.status(400).send("Webhook signature verification failed");
        return;
      }

      // 테스트 이벤트 처리
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        res.json({ verified: true });
        return;
      }

      console.log(`[Webhook] 이벤트: ${event.type} | ID: ${event.id}`);

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`[Webhook] 결제 완료 - 세션: ${session.id}`);

          try {
            const db = await getDb();
            if (db) {
              // 사용자 ID 확인
              let dbUserId: number | null = null;
              const metaUserId = session.metadata?.user_id;
              if (metaUserId) {
                const userRows = await db.select().from(users).where(eq(users.id, parseInt(metaUserId))).limit(1);
                if (userRows.length > 0) dbUserId = userRows[0].id;
              }

              // 결제 내역 저장
              await db.insert(payments).values({
                userId: dbUserId || 0,
                stripeSessionId: session.id,
                stripePaymentIntentId: session.payment_intent as string || null,
                status: "completed",
                amountTotal: session.amount_total,
                currency: session.currency,
                items: session.metadata?.items || null,
                customerEmail: session.customer_email,
                paidAt: new Date(),
              }).onConflictDoUpdate({
                target: payments.stripeSessionId,
                set: { status: "completed", paidAt: new Date() },
              });

              console.log(`[Webhook] 결제 DB 저장 완료: ${session.id}`);

              // ─── 멤버십 등급 자동 업그레이드 ───
              const purchasedItems = (session.metadata?.items || "").split(",").map((k: string) => k.trim().toLowerCase());

              // 구매한 상품 중 가장 높은 등급 찾기
              const gradeMap: Record<string, MemberGrade> = {
                membership_silver: "silver",
                membership_gold: "gold",
                membership_platinum: "platinum",
                membership_vip: "vip",
              };
              let targetGrade: MemberGrade | null = null;
              for (const item of purchasedItems) {
                const g = gradeMap[item];
                if (g) {
                  if (!targetGrade || GRADE_RANK[g] > GRADE_RANK[targetGrade]) {
                    targetGrade = g;
                  }
                }
              }

              // 현재 사용자 등급보다 높으면 업그레이드
              if (targetGrade && dbUserId) {
                const userRows2 = await db.select({ memberGrade: users.memberGrade }).from(users).where(eq(users.id, dbUserId)).limit(1);
                const currentGrade = (userRows2[0]?.memberGrade as MemberGrade) || "general";
                if (GRADE_RANK[targetGrade] > GRADE_RANK[currentGrade]) {
                  await db.update(users).set({
                    memberGrade: targetGrade,
                    gradeUpdatedAt: new Date(),
                  }).where(eq(users.id, dbUserId));
                  console.log(`[Webhook] 등급 업그레이드: userId=${dbUserId} ${currentGrade} → ${targetGrade}`);
                }
              }

              // ─── 인증 상품 결제 시 유언장 상태 자동 업데이트 ───
              const isCertPurchase = purchasedItems.some((k: string) =>
                ["membership_silver", "membership_gold", "membership_platinum", "membership_vip"].includes(k)
              );
              const metaWillId = session.metadata?.will_id;

              if (isCertPurchase && metaWillId && dbUserId) {
                const willIdNum = parseInt(metaWillId);
                if (!isNaN(willIdNum)) {
                  // 인증 번호 생성: EW-YYYYMMDD-XXXXXX
                  const now = new Date();
                  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
                  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                  const certNumber = `EW-${dateStr}-${randomSuffix}`;

                  // 플랜별 무료 수정 횟수 설정
                  // 등급별 무료 수정 횟수
                  let freeRevisionCount = 2; // silver 기본
                  if (purchasedItems.includes("membership_gold")) freeRevisionCount = 3;
                  if (purchasedItems.includes("membership_platinum")) freeRevisionCount = 5;
                  if (purchasedItems.includes("membership_vip")) freeRevisionCount = -1; // 무제한

                  // 등급별 보관 만료일 설정
                  let storageExpiresAt: Date | null = null;
                  if (purchasedItems.includes("membership_silver")) {
                    storageExpiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1년
                  } else if (purchasedItems.includes("membership_gold")) {
                    storageExpiresAt = new Date(now.getTime() + 3 * 365 * 24 * 60 * 60 * 1000); // 3년
                  } else if (purchasedItems.includes("membership_platinum")) {
                    storageExpiresAt = new Date(now.getTime() + 5 * 365 * 24 * 60 * 60 * 1000); // 5년
                  }
                  // vip: null = 영구

                  await db.update(wills)
                    .set({
                      status: "certified",
                      isCertified: 1,
                      certifiedAt: now,
                      certNumber,
                      freeRevisionCount,
                      storageExpiresAt,
                      paymentId: dbUserId, // 결제 사용자 ID 연결
                    })
                    .where(eq(wills.id, willIdNum));

                  console.log(`[Webhook] 유언장 인증 완료: willId=${willIdNum}, certNumber=${certNumber}`);
                }
              }

              // 결제 완료 이메일 영수증 발송
              const receiptEmail = session.customer_email || session.metadata?.customer_email;
              const customerName = session.metadata?.customer_name || "고객";
              const itemNames = session.metadata?.items?.split(",").map((k: string) => {
                const p = SARAM_PRODUCTS[k as ProductKey];
                return p ? p.name : k;
              }).join(", ") || "EverWill 서비스";
              const amountFormatted = session.amount_total
                ? (session.currency === "krw"
                  ? `₩${session.amount_total.toLocaleString()}`
                  : `$${(session.amount_total / 100).toFixed(2)}`)
                : "";

              if (receiptEmail) {
                const resendReceipt = new Resend(ENV.resendApiKey);
                try {
                  await resendReceipt.emails.send({
                    from: "EverWill <noreply@everwill.co.kr>",
                    to: receiptEmail,
                    subject: "[EverWill] 결제가 완료되었습니다 ✅",
                    html: `
                      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 560px; margin: 0 auto; background: #fff;">
                        <div style="background: #1F3864; padding: 32px 40px; text-align: center;">
                          <h1 style="color: #C9A961; font-size: 28px; margin: 0; letter-spacing: 2px;">EverWill</h1>
                          <p style="color: #fff; font-size: 13px; margin: 6px 0 0; opacity: 0.8;">결제 영수증</p>
                        </div>
                        <div style="padding: 40px;">
                          <h2 style="color: #1F3864; font-size: 20px; margin: 0 0 8px;">결제가 완료되었습니다 ✅</h2>
                          <p style="color: #555; font-size: 15px; margin: 0 0 32px;">${customerName}님, 결제해 주셔서 감사합니다.</p>
                          <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                            <table style="width: 100%; border-collapse: collapse;">
                              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">주문 번호</td><td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right; font-family: monospace;">${session.id.slice(-12)}</td></tr>
                              <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">결제 상품</td><td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${itemNames}</td></tr>
                              <tr style="border-top: 1px solid #eee;"><td style="padding: 12px 0 0; color: #1F3864; font-size: 16px; font-weight: bold;">결제 금액</td><td style="padding: 12px 0 0; color: #C9A961; font-size: 18px; font-weight: bold; text-align: right;">${amountFormatted}</td></tr>
                            </table>
                          </div>
                          <div style="text-align: center; margin: 32px 0;">
                            <a href="https://everwill.co.kr/dashboard" style="display: inline-block; background: #C9A961; color: #1F3864; padding: 14px 36px; border-radius: 50px; font-size: 16px; font-weight: bold; text-decoration: none;">대시보드에서 확인하기</a>
                          </div>
                          <div style="border-left: 3px solid #C9A961; padding-left: 16px;">
                            <p style="color: #888; font-size: 13px; line-height: 1.6; margin: 0;">문의사항이 있으시면 <a href="https://everwill.co.kr" style="color: #1F3864;">고객센터</a>로 연락해 주세요.</p>
                          </div>
                        </div>
                        <div style="background: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #eee;">
                          <p style="color: #999; font-size: 12px; margin: 0;">© 2026 EverWill (주식회사 사람) | <a href="https://everwill.co.kr/privacy" style="color: #999;">개인정보처리방침</a></p>
                        </div>
                      </div>
                    `,
                  });
                  console.log(`[Webhook] 결제 영수증 이메일 발송 완료: ${receiptEmail}`);
                } catch (emailErr) {
                  console.error("[Webhook] 결제 영수증 이메일 발송 실패:", emailErr);
                }
              }
            }
          } catch (dbErr) {
            console.error("[Webhook] DB 저장 실패:", dbErr);
          }
          break;
        }
        case "payment_intent.payment_failed": {
          const pi = event.data.object as Stripe.PaymentIntent;
          console.log(`[Webhook] 결제 실패: ${pi.id}`);
          break;
        }
        default:
          console.log(`[Webhook] 미처리 이벤트: ${event.type}`);
      }

      res.json({ received: true });
    }
  );

  /* ─── 3. 세션 상태 조회 (로그인 필수 + 세션 소유자만 조회 가능) ─── */
  app.get("/api/stripe/session/:id", async (req: Request, res: Response) => {
    try {
      // 인증 확인: 로그인한 사용자만 조회 가능
      let authenticatedUser: Awaited<ReturnType<typeof sdk.authenticateRequest>> | null = null;
      try {
        authenticatedUser = await sdk.authenticateRequest(req);
      } catch {
        res.status(401).json({ error: "로그인이 필요합니다." });
        return;
      }
      if (!authenticatedUser) {
        res.status(401).json({ error: "로그인이 필요합니다." });
        return;
      }

      const session = await stripe.checkout.sessions.retrieve(req.params.id, {
        expand: ["line_items"],
      });

      // 세션 소유자 확인: metadata.user_id 또는 customer_email이 일치해야 함
      const isOwner =
        session.metadata?.user_id === authenticatedUser.id.toString() ||
        (session.customer_email && session.customer_email === authenticatedUser.email) ||
        authenticatedUser.role === "admin";

      if (!isOwner) {
        res.status(403).json({ error: "이 결제 세션에 접근할 권한이 없습니다." });
        return;
      }

      res.json({
        status: session.status,
        paymentStatus: session.payment_status,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        items: session.line_items?.data.map((item) => ({
          name: item.description,
          amount: item.amount_total,
          quantity: item.quantity,
        })),
        metadata: session.metadata,
      });
    } catch (err) {
      console.error("[Stripe] 세션 조회 실패:", err);
      res.status(404).json({ error: "세션을 찾을 수 없습니다." });
    }
  });

  /* ─── 4. 내 결제 내역 조회 ─── */
  app.get("/api/payments/my", async (req: Request, res: Response) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const db = await getDb();
      if (!db) {
        res.json([]);
        return;
      }

      const myPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.userId, user.id))
        .orderBy(payments.createdAt);

      res.json(myPayments.reverse());
    } catch {
      // 비로그인 시 빈 배열
      res.json([]);
    }
  });
}
