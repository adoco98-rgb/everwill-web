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
import { SARAM_PRODUCTS, type ProductKey } from "./products";
import { getDb } from "../db";
import { payments, users } from "../../drizzle/schema";
import { sdk } from "../_core/sdk";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export function registerStripeRoutes(app: Express) {
  /* ─── 1. Checkout Session 생성 ─── */
  app.post("/api/stripe/checkout", async (req: Request, res: Response) => {
    try {
      const { items, customerEmail, customerName, userId, metadata } = req.body as {
        items: { key: ProductKey; quantity?: number }[];
        customerEmail?: string;
        customerName?: string;
        userId?: string;
        metadata?: Record<string, string>;
      };

      if (!items || items.length === 0) {
        res.status(400).json({ error: "결제 항목이 없습니다." });
        return;
      }

      // 로그인된 사용자 정보 가져오기
      let authenticatedUserId: string | undefined = userId;
      let authenticatedEmail: string | undefined = customerEmail;
      try {
        const user = await sdk.authenticateRequest(req);
        if (user) {
          authenticatedUserId = user.id.toString();
          authenticatedEmail = user.email || customerEmail;
        }
      } catch {
        // 비로그인 결제도 허용
      }

      const origin = req.headers.origin || "http://localhost:3000";

      // line_items 구성
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lineItems: any[] = (items as { key: ProductKey; quantity?: number }[]).map(({ key, quantity = 1 }) => {
        const product = SARAM_PRODUCTS[key];
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
          ...metadata,
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
              }).onDuplicateKeyUpdate({
                set: { status: "completed", paidAt: new Date() },
              });

              console.log(`[Webhook] 결제 DB 저장 완료: ${session.id}`);
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

  /* ─── 3. 세션 상태 조회 ─── */
  app.get("/api/stripe/session/:id", async (req: Request, res: Response) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(req.params.id, {
        expand: ["line_items"],
      });
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
