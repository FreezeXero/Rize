import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserUsageStats } from "@/lib/db/usage";
import { FooterSection } from "@/components/landing/FooterSection";

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const usage = await getUserUsageStats(user.id);
  const exportUnlimited = usage.plan === "max" || usage.plan === "free";
  const exportGoal = usage.plan === "pro" ? 30 : 100;
  const aiGoal = usage.plan === "max" ? 1000 : usage.plan === "pro" ? 100 : 10;
  const exportPct = exportUnlimited ? 100 : Math.min(100, Math.round((usage.exports_this_month / exportGoal) * 100));
  const aiPct = Math.min(100, Math.round((usage.ai_uses_this_month / aiGoal) * 100));

  return (
    <>
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-white">Billing</h1>
      <p className="mt-2 text-zinc-300">
        Current plan and your usage this month.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] p-5">
          <div className="text-sm text-zinc-300">Plan</div>
          <div className="mt-1 text-lg font-semibold uppercase text-white">{usage.plan}</div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
            <div className="h-full w-full bg-gradient-to-r from-cyan-400/50 to-violet-400/50" />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] p-5">
          <div className="text-sm text-zinc-300">Exports this month</div>
          <div className="mt-1 text-lg font-semibold text-white">
            {usage.exports_this_month}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-cyan-300/70 to-cyan-500/70"
              style={{ width: `${exportPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {exportUnlimited ? "Unlimited exports" : `${exportPct}% of monthly allowance`}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f0f1a] p-5">
          <div className="text-sm text-zinc-300">AI uses this month</div>
          <div className="mt-1 text-lg font-semibold text-white">
            {usage.ai_uses_this_month}
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full bg-gradient-to-r from-violet-300/70 to-fuchsia-400/70"
              style={{ width: `${aiPct}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {usage.plan === "max" ? "Unlimited plan (visualized)" : `${aiPct}% of monthly allowance`}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-[#0f0f1a] p-6">
        <div className="text-sm font-semibold text-white">Upgrade / downgrade</div>
        <p className="mt-2 text-sm text-zinc-300">
          Use the Pricing page to switch plans. Stripe webhooks will update your
          `users.plan` in Supabase.
        </p>
        <Link
          href="/pricing"
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:brightness-110"
        >
          Go to pricing
        </Link>
      </div>
    </div>
    <FooterSection />
    </>
  );
}

