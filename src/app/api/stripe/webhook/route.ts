import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripeServer";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing STRIPE_WEBHOOK_SECRET in env.");
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  const body = await req.text();

  let event: unknown;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Unknown webhook verification error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  const eventType = (event as { type?: unknown }).type;
  const obj = (event as { data?: { object?: unknown } }).data?.object;

  const objRecord =
    obj && typeof obj === "object" ? (obj as Record<string, unknown>) : null;

  // subscription objects include metadata if we set it at checkout session creation.
  const userIdRaw =
    objRecord && "metadata" in objRecord
      ? (objRecord.metadata as { user_id?: unknown })?.user_id
      : undefined;
  const userId: string | undefined =
    typeof userIdRaw === "string" ? userIdRaw : undefined;
  if (!userId) {
    // If we can't map the event to a user, we still return 200 so Stripe retries are controlled.
    return NextResponse.json({ received: true, warning: "Missing user_id metadata" });
  }

  if (eventType === "customer.subscription.deleted") {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ plan: "free", billing_cycle: "monthly" })
      .eq("id", userId);
    if (error) throw error;
    return NextResponse.json({ received: true });
  }

  if (
    eventType === "customer.subscription.created" ||
    eventType === "customer.subscription.updated"
  ) {
    const priceId =
      objRecord &&
      "items" in objRecord &&
      typeof objRecord.items === "object" &&
      (objRecord as {
        items?: { data?: Array<{ price?: { id?: unknown } }> };
      }).items?.data?.[0]?.price?.id;

    const priceIdStr = typeof priceId === "string" ? priceId : undefined;
    if (!priceIdStr) {
      return NextResponse.json({ received: true, warning: "Missing subscription price id" });
    }

    const proMonthly = process.env.STRIPE_PRO_PRICE_MONTHLY;
    const proAnnual = process.env.STRIPE_PRO_PRICE_ANNUAL;
    const maxMonthly = process.env.STRIPE_MAX_PRICE_MONTHLY;
    const maxAnnual = process.env.STRIPE_MAX_PRICE_ANNUAL;

    let plan: "free" | "pro" | "max" = "free";
    let billing_cycle: "monthly" | "annual" = "monthly";

    if (priceIdStr === proMonthly) {
      plan = "pro";
      billing_cycle = "monthly";
    } else if (priceIdStr === proAnnual) {
      plan = "pro";
      billing_cycle = "annual";
    } else if (priceIdStr === maxMonthly) {
      plan = "max";
      billing_cycle = "monthly";
    } else if (priceIdStr === maxAnnual) {
      plan = "max";
      billing_cycle = "annual";
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update({ plan, billing_cycle })
      .eq("id", userId);
    if (error) throw error;
  }

  return NextResponse.json({ received: true });
}

