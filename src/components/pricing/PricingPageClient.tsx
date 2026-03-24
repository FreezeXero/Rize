"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PRICING_TERMS_TEXT } from "@/lib/pricing/pricingTerms";

type PlanChoice = "pro" | "max";
type BillingCycle = "monthly" | "annual";

const tierCardClass =
  "group relative rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 ease-out will-change-transform hover:z-10 hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-[0_0_36px_rgba(34,211,238,0.22)]";

const checkoutBtnClass =
  "mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition duration-300 ease-out group-hover:brightness-125 group-hover:ring-cyan-400/40";

export function PricingPageClient() {
  const [annual, setAnnual] = useState(true);
  const billingCycle: BillingCycle = annual ? "annual" : "monthly";

  const proPrice = annual ? "$8.49/mo" : "$9.99/mo";
  const maxPrice = annual ? "$16.99/mo" : "$19.99/mo";

  async function startCheckout(choice: PlanChoice) {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: choice, billingCycle }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Checkout failed");
    const url = String(json.url ?? "");
    if (!url) throw new Error("Missing checkout session URL");
    window.location.href = url;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Plans
          </h1>
          <p className="mt-2 text-zinc-300">
            Toggle annual billing to see the 15% discount.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <span className={annual ? "text-zinc-200" : "text-zinc-400"}>Monthly</span>
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
                "absolute top-1 h-6 w-6 rounded-full border border-white/10 bg-white/10 transition",
                annual ? "left-8" : "left-1",
              ].join(" ")}
            />
          </button>
          <span className={annual ? "text-cyan-200" : "text-zinc-400"}>Annual</span>
          {annual ? (
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">
              15% off
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className={tierCardClass}>
          <div className="text-sm font-semibold text-white">Free</div>
          <div className="mt-3 text-4xl font-semibold text-white">$0</div>
          <div className="mt-1 text-sm text-zinc-300">2 resumes • 3 exports/month</div>
          <ul className="mt-5 grid gap-2 text-sm text-zinc-200">
            <li>3 templates</li>
            <li>Manual LaTeX editing only</li>
            <li>10 AI bullet rewrites/month</li>
            <li>No ATS checker</li>
          </ul>
          <div className="mt-6 text-xs text-zinc-500">
            <Link href="/get-started" className="font-semibold text-cyan-300 hover:underline">
              Create an account
            </Link>{" "}
            to enable exports.
          </div>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
        </div>

        <div
          className={`${tierCardClass} border-cyan-300/35 ring-1 ring-cyan-300/15 hover:border-cyan-300/70 hover:shadow-[0_0_40px_rgba(34,211,238,0.28)]`}
        >
          <div className="text-sm font-semibold text-white">Pro</div>
          <div className="mt-3 text-4xl font-semibold text-white">{proPrice}</div>
          <div className="mt-1 text-sm text-zinc-300">
            {annual ? "Annual billing" : "Monthly billing"}
          </div>
          <ul className="mt-5 grid gap-2 text-sm text-zinc-200">
            <li>10 resumes • 30 exports/month</li>
            <li>All templates</li>
            <li>AI LaTeX conversion</li>
            <li>100 AI bullet rewrites/month</li>
            <li>Basic ATS checker</li>
            <li>Custom sections</li>
          </ul>
          <button
            type="button"
            onClick={() => startCheckout("pro")}
            className={checkoutBtnClass}
          >
            Upgrade to Pro
          </button>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
        </div>

        <div className={tierCardClass}>
          <div className="text-sm font-semibold text-white">Max</div>
          <div className="mt-3 text-4xl font-semibold text-white">{maxPrice}</div>
          <div className="mt-1 text-sm text-zinc-300">
            {annual ? "Annual billing" : "Monthly billing"}
          </div>
          <ul className="mt-5 grid gap-2 text-sm text-zinc-200">
            <li>Unlimited resumes & exports</li>
            <li>Import your own template</li>
            <li>Full detailed ATS report</li>
            <li>Priority support</li>
          </ul>
          <button
            type="button"
            onClick={() => startCheckout("max")}
            className={`${checkoutBtnClass} from-violet-300/25 to-cyan-300/15`}
          >
            Upgrade to Max
          </button>
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
        </div>
      </div>
    </div>
  );
}
