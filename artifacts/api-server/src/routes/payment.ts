import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db, ordersTable } from "@workspace/db";
import {
  CreatePaymentIntentBody,
  CreatePaymentIntentResponse,
  ConfirmPaymentBody,
  ConfirmPaymentResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-06-30.basil" });
}

router.post("/payment/create-intent", async (req, res): Promise<void> => {
  const parsed = CreatePaymentIntentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    res.status(400).json({ error: "Payment not configured. STRIPE_SECRET_KEY is missing." });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, parsed.data.orderId));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const amountInCents = Math.round(parseFloat(order.total) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: { orderId: String(order.id) },
  });

  await db
    .update(ordersTable)
    .set({ stripePaymentIntentId: paymentIntent.id })
    .where(eq(ordersTable.id, order.id));

  logger.info({ orderId: order.id, paymentIntentId: paymentIntent.id }, "Payment intent created");

  res.json(
    CreatePaymentIntentResponse.parse({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountInCents,
    })
  );
});

router.post("/payment/confirm", async (req, res): Promise<void> => {
  const parsed = ConfirmPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    res.status(400).json({ error: "Payment not configured. STRIPE_SECRET_KEY is missing." });
    return;
  }

  const { orderId, paymentIntentId } = parsed.data;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const newStatus = paymentIntent.status === "succeeded" ? "paid" : "failed";

  const [updated] = await db
    .update(ordersTable)
    .set({ status: newStatus, stripePaymentIntentId: paymentIntentId })
    .where(eq(ordersTable.id, orderId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  logger.info({ orderId, paymentIntentId, status: newStatus }, "Payment confirmed");

  res.json(
    ConfirmPaymentResponse.parse({
      ...updated,
      total: parseFloat(updated.total),
      createdAt: updated.createdAt.toISOString(),
    })
  );
});

export default router;
