import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/stripeServer";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Plan, BillingCycle } from "@/lib/plans";

function getPriceId(plan: Plan, billingCycle: BillingCycle): string | undefined {
  if (plan === "pro" && billingCycle === "monthly")
    return process.env.STRIPE_PRO_PRICE_MONTHLY;
  if (plan === "pro" && billingCycle === "annual")
    return process.env.STRIPE_PRO_PRICE_ANNUAL;
  if (plan === "max" && billingCycle === "monthly")
    return process.env.STRIPE_MAX_PRICE_MONTHLY;
  if (plan === "max" && billingCycle === "annual")
    return process.env.STRIPE_MAX_PRICE_ANNUAL;
  return undefined;
}

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to upgrade." }, { status: 401 });
  }

  let body: { plan?: Plan; billingCycle?: BillingCycle };
  try {
    body = (await req.json()) as { plan?: Plan; billingCycle?: BillingCycle };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { plan, billingCycle } = body ?? {};

  if (!plan || !billingCycle) {
    return NextResponse.json({ error: "Missing plan or billingCycle." }, { status: 400 });
  }
  if (plan === "free") {
    return NextResponse.json({ error: "Free plan has no checkout." }, { status: 400 });
  }

  const priceId = getPriceId(plan, billingCycle);
  if (!priceId) {
    return NextResponse.json(
      {
        error:
          "Stripe price IDs are not configured. Please contact support or check your .env file (STRIPE_PRO_PRICE_MONTHLY, STRIPE_PRO_PRICE_ANNUAL, STRIPE_MAX_PRICE_MONTHLY, STRIPE_MAX_PRICE_ANNUAL).",
      },
      { status: 500 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/billing?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe checkout session creation failed.";
    console.error("[stripe/create-checkout-session]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
