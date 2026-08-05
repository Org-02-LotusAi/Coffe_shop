import { Router, type IRouter } from "express";
import Stripe from "stripe";
import { supabase } from "../lib/supabase";
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
  return new Stripe(key, { apiVersion: "2026-07-29.dahlia" });
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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", parsed.data.orderId)
    .single();

  if (orderError || !order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const amountInCents = Math.round(parseFloat(order.total) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: { orderId: String(order.id) },
  });

  await supabase
    .from("orders")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", order.id);

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

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus, stripe_payment_intent_id: paymentIntentId })
    .eq("id", orderId)
    .select("*")
    .single();

  if (updateError || !updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  logger.info({ orderId, paymentIntentId, status: newStatus }, "Payment confirmed");

  res.json(
    ConfirmPaymentResponse.parse({
      id: updated.id,
      customerName: updated.customer_name,
      customerEmail: updated.customer_email,
      items: updated.items,
      total: parseFloat(updated.total),
      status: updated.status,
      stripePaymentIntentId: updated.stripe_payment_intent_id,
      createdAt: new Date(updated.created_at).toISOString(),
    })
  );
});

export default router;
