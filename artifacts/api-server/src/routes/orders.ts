import { Router, type IRouter } from "express";
import { supabase } from "../lib/supabase";
import {
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerEmail, items } = parsed.data;
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      items,
      total: total.toFixed(2),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(201).json(
    CreateOrderResponse.parse({
      id: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items: order.items,
      total: parseFloat(order.total),
      status: order.status,
      stripePaymentIntentId: order.stripe_payment_intent_id,
      createdAt: new Date(order.created_at).toISOString(),
    }),
  );
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.data.id)
    .single();

  if (error || !order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(
    GetOrderResponse.parse({
      id: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      items: order.items,
      total: parseFloat(order.total),
      status: order.status,
      stripePaymentIntentId: order.stripe_payment_intent_id,
      createdAt: new Date(order.created_at).toISOString(),
    }),
  );
});

export default router;
