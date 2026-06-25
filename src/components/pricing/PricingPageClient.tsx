"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { PRICING_TERMS_TEXT } from "@/lib/pricing/pricingTerms";

type PlanChoice = "pro" | "max";
type BillingCycle = "monthly" | "annual";

const tierCardClass =
  "group relative rounded-3xl border border-white/10 bg-[#0f0f1a] p-6 transition duration-300 ease-out will-change-transform hover:z-10 hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-[0_0_36px_rgba(34,211,238,0.22)]";

const checkoutBtnClass =
  "mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 text-sm font-semibold text-[#050509] shadow-[0_0_24px_rgba(34,211,238,0.22)] transition duration-300 ease-out hover:brightness-110 hover:shadow-[0_0_36px_rgba(34,211,238,0.40)] hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100";

export function PricingPageClient() {
  const [annual, setAnnual] = useState(true);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<PlanChoice | null>(null);

  const billingCycle: BillingCycle = annual ? "annual" : "monthly";

  const proPrice = annual ? "$5.83/mo" : "$6.99/mo";
  const proSubtitle = annual ? "Billed $69.99/yr" : "Monthly billing";
  const maxPrice = annual ? "$10.83/mo" : "$12.99/mo";
  const maxSubtitle = annual ? "Billed $129.99/yr" : "Monthly billing";

  async function startCheckout(choice: PlanChoice) {
    setCheckoutError(null);
    setLoadingPlan(choice);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: choice, billingCycle }),
      });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        setCheckoutError(json.error ?? "Checkout failed. Please try again.");
        return;
      }
      const url = String(json.url ?? "");
      if (!url) {
        setCheckoutError("No redirect URL returned. Please try again.");
        return;
      }
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Plans
          </h1>
          <p className="mt-2 text-zinc-300">
            Toggle annual billing to save 17%.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0f0f1a] px-4 py-3">
          <span className={annual ? "text-zinc-400" : "text-zinc-200"}>Monthly</span>
          <button
            type="button"
            onClick={() => setAnnual((v) => !v)}
            className={[
              "relative h-8 w-14 rounded-full border border-white/10 transition",
              annual ? "bg-gradient-to-r from-cyan-300/25 to-violet-300/25" : "bg-black/30",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-1 h-6 w-6 rounded-full border border-white/10 bg-white/10 transition-all duration-200",
                annual ? "left-8" : "left-1",
              ].join(" ")}
            />
          </button>
          <span className={annual ? "text-cyan-200" : "text-zinc-400"}>Annual</span>
          {/* Always in DOM — opacity toggle prevents layout shift */}
          <span
            className={`rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200 transition-opacity duration-200 ${annual ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            Save 17%
          </span>
        </div>
      </div>

      {checkoutError ? (
        <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/[.08] px-4 py-3 text-sm text-red-300">
          {checkoutError}
        </div>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {/* Free */}
        <div className={tierCardClass}>
          <div className="text-sm font-semibold text-white">Free</div>
          <div className="mt-3 text-4xl font-semibold text-white">$0</div>
          <div className="mt-1 text-sm text-zinc-300">2 resumes · unlimited exports</div>
          <ul className="mt-5 grid gap-2 text-sm text-zinc-300">
            <li>4 templates</li>
            <li>10 AI bullet rewrites/week</li>
            <li>3 ATS checks/week</li>
            <li>No detailed ATS report</li>
          </ul>
          <div className="mt-6 text-xs text-zinc-500">
            <Link href="/get-started" className="font-semibold text-cyan-300 hover:underline">
              Create an account
            </Link>{" "}
            to get started.
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
        </div>

        {/* Pro */}
        <div
          className={`${tierCardClass} border-cyan-300/35 ring-1 ring-cyan-300/15 hover:border-cyan-300/70 hover:shadow-[0_0_40px_rgba(34,211,238,0.28)]`}
        >
          <div className="absolute -top-3 left-6 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
            Most Popular
          </div>
          <div className="text-sm font-semibold text-white">Pro</div>
          <div className="mt-3 text-4xl font-semibold text-white">{proPrice}</div>
          <div className="mt-1 text-sm text-zinc-300">{proSubtitle}</div>
          <ul className="mt-5 grid gap-2 text-sm text-zinc-300">
            <li>10 resumes · 30 exports/month</li>
            <li>All templates</li>
            <li>AI LaTeX conversion</li>
            <li>100 AI bullet rewrites/month</li>
            <li>Basic ATS checker</li>
            <li>Custom sections</li>
          </ul>
          <button
            type="button"
            onClick={() => startCheckout("pro")}
            disabled={loadingPlan !== null}
            className={checkoutBtnClass}
          >
            {loadingPlan === "pro" ? <Loader2 size={15} className="animate-spin" /> : null}
            {loadingPlan === "pro" ? "Redirecting…" : "Upgrade to Pro"}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
        </div>

        {/* Max */}
        <div className={tierCardClass}>
          <div className="text-sm font-semibold text-white">Max</div>
          <div className="mt-3 text-4xl font-semibold text-white">{maxPrice}</div>
          <div className="mt-1 text-sm text-zinc-300">{maxSubtitle}</div>
          <ul className="mt-5 grid gap-2 text-sm text-zinc-300">
            <li>Unlimited resumes & exports</li>
            <li>Import your own template</li>
            <li>Full detailed ATS report</li>
            <li>Priority support</li>
          </ul>
          <button
            type="button"
            onClick={() => startCheckout("max")}
            disabled={loadingPlan !== null}
            className={checkoutBtnClass}
          >
            {loadingPlan === "max" ? <Loader2 size={15} className="animate-spin" /> : null}
            {loadingPlan === "max" ? "Redirecting…" : "Upgrade to Max"}
          </button>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
        </div>
      </div>
    </div>
  );
}
