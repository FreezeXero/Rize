import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Crown, FileDown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/resumes";
import { getUserUsageStats } from "@/lib/db/usage";
import { CreateResumeButton } from "@/components/dashboard/CreateResumeButton";
import { ResumeDashboardCard } from "@/components/dashboard/ResumeDashboardCard";
import { FooterSection } from "@/components/landing/FooterSection";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resumes = await listResumes(user.id);
  const usage = await getUserUsageStats(user.id);
  const firstName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim().split(" ")[0]
      : (user.email?.split("@")[0] ?? "there");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const planPillClass =
    usage.plan === "max"
      ? "bg-amber-400/20 text-amber-200 border-amber-300/40"
      : usage.plan === "pro"
        ? "bg-violet-400/20 text-violet-200 border-violet-300/40"
        : "bg-cyan-400/20 text-cyan-200 border-cyan-300/40";

  const planGlowBorder =
    usage.plan === "max"
      ? "bg-gradient-to-br from-amber-300/40 via-amber-500/10 to-transparent"
      : usage.plan === "pro"
        ? "bg-gradient-to-br from-violet-300/40 via-violet-500/10 to-transparent"
        : "bg-gradient-to-br from-cyan-300/35 via-cyan-500/10 to-transparent";

  const planShadow =
    usage.plan === "max"
      ? "shadow-[0_0_24px_rgba(251,191,36,0.18)]"
      : usage.plan === "pro"
        ? "shadow-[0_0_24px_rgba(139,92,246,0.18)]"
        : "shadow-[0_0_16px_rgba(34,211,238,0.14)]";

  return (
    <>
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      {/* ── Hero greeting ───────────────────────────────────────────── */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[.08] bg-[#0c0c18] p-8 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(34,211,238,0.10),transparent_65%),radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(139,92,246,0.09),transparent_65%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(34,211,238,0.8) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                {firstName}
              </span>
            </h1>
            <p className="mt-2 text-zinc-400">
              Manage your resumes, AI usage, and plan billing.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/resumes/new"
                className="inline-flex h-10 items-center rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-4 text-xs font-semibold text-[#050509] transition hover:brightness-110 hover:shadow-[0_0_20px_rgba(34,211,238,0.35)]"
              >
                Create Resume
              </Link>
              <Link
                href="/dashboard/ats"
                className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-black/30 px-3 text-xs font-semibold text-zinc-100 transition hover:border-cyan-300/30 hover:shadow-[0_0_14px_rgba(34,211,238,0.12)]"
              >
                ATS Checker
              </Link>
              <Link
                href="/dashboard/resumes/new"
                className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-black/30 px-3 text-xs font-semibold text-zinc-100 transition hover:border-cyan-300/30 hover:shadow-[0_0_14px_rgba(34,211,238,0.12)]"
              >
                View Templates
              </Link>
            </div>
            <Link href="/dashboard/billing" className="text-sm text-cyan-400 transition hover:text-cyan-200">
              Billing & usage →
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          {/* Plan card — gradient-border wrapper */}
          <div className={`rounded-2xl p-px ${planGlowBorder} ${planShadow}`}>
            <div className="flex h-full flex-col rounded-2xl bg-[#0f0f1a] px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-400">Your plan</div>
                <Crown size={15} className="text-zinc-400" />
              </div>
              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full border px-3.5 py-1 text-sm font-bold uppercase tracking-wide ${planPillClass}`}
                >
                  {usage.plan}
                </span>
              </div>
              <div className="mt-2 text-xs">
                {usage.plan === "free" ? (
                  <Link href="/pricing" className="text-cyan-400 hover:underline">
                    Upgrade for more →
                  </Link>
                ) : (
                  <Link href="/dashboard/billing" className="text-zinc-500 hover:text-zinc-300">
                    Manage subscription
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[.08] bg-[#0f0f1a] px-5 py-4 transition hover:border-cyan-300/20 hover:shadow-[0_0_16px_rgba(34,211,238,0.08)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">PDF exports this month</div>
              <FileDown size={15} className="text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {usage.exports_this_month}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[.08] bg-[#0f0f1a] px-5 py-4 transition hover:border-cyan-300/20 hover:shadow-[0_0_16px_rgba(34,211,238,0.08)]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">AI uses this month</div>
              <Brain size={15} className="text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {usage.ai_uses_this_month}
            </div>
          </div>
        </div>
      </div>

      {/* ── Resumes ────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your resumes</h2>
          <CreateResumeButton />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.length === 0 ? (
            <div className="rounded-2xl border border-white/[.08] bg-[#0f0f1a] p-6 text-zinc-300 sm:col-span-2 lg:col-span-3">
              No resumes yet.{" "}
              <Link href="/dashboard/resumes/new" className="text-cyan-400 hover:underline">
                Create your first resume →
              </Link>
            </div>
          ) : (
            resumes.map((r) => <ResumeDashboardCard key={r.id} resume={r} />)
          )}
        </div>
      </section>

      {/* ── ATS promo ──────────────────────────────────────────────── */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-white/[.08] bg-[#0f0f1a]">
        <div className="relative p-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_100%_50%,rgba(34,211,238,0.06),transparent_65%)]"
          />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">ATS Checker</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Test your resume against job keywords and get targeted suggestions.
              </p>
            </div>
            <Link
              href="/dashboard/ats"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[.07] px-4 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/50 hover:bg-cyan-300/[.12] hover:shadow-[0_0_18px_rgba(34,211,238,0.22)]"
            >
              Open ATS Checker
            </Link>
          </div>
        </div>
      </section>
    </div>
    <FooterSection />
    </>
  );
}
