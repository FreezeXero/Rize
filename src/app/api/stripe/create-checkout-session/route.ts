import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripeServer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Plan, BillingCycle } from "@/lib/plans";

function getPriceId(plan: Plan, billingCycle: BillingCycle) {
  if (plan === "pro" && billingCycle === "monthly")
    return process.env.STRIPE_PRO_PRICE_MONTHLY;
  if (plan === "pro" && billingCycle === "annual")
    return process.env.STRIPE_PRO_PRICE_ANNUAL;
  if (plan === "max" && billingCycle === "monthly")
    return process.env.STRIPE_MAX_PRICE_MONTHLY;
  if (plan === "max" && billingCycle === "annual")
    return process.env.STRIPE_MAX_PRICE_ANNUAL;
  throw new Error(`Unsupported plan/cycle: ${plan}/${billingCycle}`);
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to upgrade." }, { status: 401 });
  }

  const body = (await req.json()) as { plan: Plan; billingCycle: BillingCycle };
  const { plan, billingCycle } = body ?? {};
  if (!plan || !billingCycle) {
    return NextResponse.json({ error: "Missing plan/billingCycle" }, { status: 400 });
  }
  if (plan === "free") {
    return NextResponse.json({ error: "Free has no checkout." }, { status: 400 });
  }

  const priceId = getPriceId(plan, billingCycle);
  if (!priceId) throw new Error("Missing Stripe price id env vars.");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const successUrl = `${baseUrl}/dashboard/billing?checkout=success`;
  const cancelUrl = `${baseUrl}/pricing?checkout=cancel`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    client_reference_id: user.id,
    metadata: { user_id: user.id },
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return NextResponse.json({ url: session.url });
}

