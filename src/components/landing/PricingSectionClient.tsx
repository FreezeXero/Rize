"use client";

import React, { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { StartBuildingLink } from "../auth/StartBuildingLink";
import { PRICING_TERMS_TEXT } from "@/lib/pricing/pricingTerms";

type BillingCycle = "monthly" | "annual";

function priceForPlan(args: {
  plan: "pro" | "max";
  billing: BillingCycle;
}) {
  const { plan, billing } = args;
  if (billing === "monthly") {
    return plan === "pro" ? "$9.99/mo" : "$19.99/mo";
  }
  return plan === "pro" ? "$8.49/mo" : "$16.99/mo";
}

const tierCardClass =
  "group relative rounded-3xl border border-white/10 bg-white/5 p-7 transition duration-300 ease-out will-change-transform hover:z-10 hover:scale-[1.02] hover:border-cyan-400/50 hover:shadow-[0_0_36px_rgba(34,211,238,0.22)]";

const ctaBright =
  "transition duration-300 group-hover:brightness-125 group-hover:shadow-[0_0_28px_rgba(34,211,238,0.35)]";

export function PricingSectionClient() {
  const [annual, setAnnual] = useState(false);
  const billing: BillingCycle = annual ? "annual" : "monthly";

  const proPrice = useMemo(() => priceForPlan({ plan: "pro", billing }), [billing]);
  const maxPrice = useMemo(() => priceForPlan({ plan: "max", billing }), [billing]);

  return (
    <section id="pricing" className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Pricing
            </h2>
            <p className="mt-2 text-zinc-300">
              Pick the plan that matches your output. Limits are enforced
              server-side.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-zinc-400">Annual</div>
            <button
              type="button"
              onClick={() => setAnnual((v) => !v)}
              className="relative h-10 w-16 rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10"
              aria-label="Toggle annual billing"
            >
              <span
                className={[
                  "absolute top-2 h-6 w-6 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 transition",
                  annual ? "left-9" : "left-2",
                ].join(" ")}
              />
            </button>
            <div className="flex items-center gap-2">
              <div className="text-sm text-zinc-400">Monthly</div>
              {annual ? (
                <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">
                  15% off
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {/* Free */}
          <div className={tierCardClass}>
            <div className="text-sm font-semibold text-white">Free</div>
            <div className="mt-3 text-4xl font-semibold text-white">$0</div>
            <div className="mt-1 text-sm text-zinc-300">For trying Rize</div>

            <ul className="mt-6 grid gap-3">
              {[
                "2 resumes",
                "3 PDF exports/month",
                "4 templates",
                "Manual LaTeX editing only",
                "10 AI bullet rewrites/month",
                "No ATS checker",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-cyan-300/15 text-cyan-200">
                    <Check size={14} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <StartBuildingLink
              className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-white/15 bg-transparent text-sm font-semibold text-white hover:border-cyan-300/40 hover:shadow-[0_0_25px_rgba(34,211,238,0.15)] ${ctaBright}`}
            >
              Start free
            </StartBuildingLink>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
          </div>

          {/* Pro */}
          <div
            className={`${tierCardClass} border-cyan-300/35 ring-1 ring-cyan-300/15 hover:border-cyan-300/70 hover:shadow-[0_0_40px_rgba(34,211,238,0.28)]`}
          >
            <div className="absolute -top-3 left-7 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              Most Popular
            </div>
            <div className="text-sm font-semibold text-white">Pro</div>
            <div className="mt-3 text-4xl font-semibold text-white">{proPrice}</div>
            <div className="mt-1 text-sm text-zinc-300">
              {annual ? "Annual billing (15% off)" : "Monthly billing"}
            </div>

            <ul className="mt-6 grid gap-3">
              {[
                "10 resumes",
                "30 PDF exports/month",
                "All templates",
                "AI LaTeX conversion",
                "100 AI bullet rewrites/month",
                "Basic ATS checker",
                "Custom sections",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-cyan-300/15 text-cyan-200">
                    <Check size={14} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <StartBuildingLink
              className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 text-sm font-semibold text-[#050509] shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:scale-[1.02] ${ctaBright}`}
            >
              Upgrade to Pro
            </StartBuildingLink>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
          </div>

          {/* Max */}
          <div className={tierCardClass}>
            <div className="text-sm font-semibold text-white">Max</div>
            <div className="mt-3 text-4xl font-semibold text-white">{maxPrice}</div>
            <div className="mt-1 text-sm text-zinc-300">
              {annual ? "Annual billing (15% off)" : "Monthly billing"}
            </div>

            <ul className="mt-6 grid gap-3">
              {[
                "Unlimited resumes & exports",
                "Import your own template",
                "Full detailed ATS report",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-zinc-200">
                  <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-cyan-300/15 text-cyan-200">
                    <Check size={14} />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <StartBuildingLink
              className={`mt-8 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 text-sm font-semibold text-[#050509] shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:scale-[1.02] ${ctaBright}`}
            >
              Upgrade to Max
            </StartBuildingLink>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">{PRICING_TERMS_TEXT}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
