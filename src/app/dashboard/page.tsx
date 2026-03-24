import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, Crown, FileDown } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/resumes";
import { getUserUsageStats } from "@/lib/db/usage";
import { CreateResumeButton } from "@/components/dashboard/CreateResumeButton";
import { ResumeDashboardCard } from "@/components/dashboard/ResumeDashboardCard";

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{greeting} {firstName}</h1>
          <p className="mt-2 text-zinc-300">
            Manage your resumes, AI usage, and plan billing.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/resumes/new" className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-xs font-semibold text-zinc-100 transition hover:bg-white/10">Create Resume</Link>
            <Link href="/dashboard/ats" className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-xs font-semibold text-zinc-100 transition hover:bg-white/10">ATS Checker</Link>
            <Link href="/dashboard/resumes/new" className="inline-flex h-9 items-center rounded-lg border border-white/10 bg-black/20 px-3 text-xs font-semibold text-zinc-100 transition hover:bg-white/10">View Templates</Link>
          </div>
          <Link
            href="/dashboard/billing"
            className="text-sm text-cyan-300 hover:underline"
          >
            Billing & usage →
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-300">Your plan</div>
            <Crown size={16} className="text-zinc-300" />
          </div>
          <div className="mt-2">
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold uppercase ${planPillClass}`}
            >
              {usage.plan}
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-300">PDF exports this month</div>
            <FileDown size={16} className="text-zinc-300" />
          </div>
          <div className="mt-1 text-lg font-semibold text-white">
            {usage.exports_this_month}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-300">AI uses this month</div>
            <Brain size={16} className="text-zinc-300" />
          </div>
          <div className="mt-1 text-lg font-semibold text-white">
            {usage.ai_uses_this_month}
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Your resumes</h2>
          <CreateResumeButton />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-300 sm:col-span-2 lg:col-span-3">
              No resumes yet. Click “Create new resume”.
            </div>
          ) : (
            resumes.map((r) => <ResumeDashboardCard key={r.id} resume={r} />)
          )}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">ATS checker</h2>
            <p className="mt-1 text-sm text-zinc-300">
              Test your resume against keywords and get targeted suggestions.
            </p>
          </div>
          <Link
            href="/dashboard/ats"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
          >
            Open ATS checker
          </Link>
        </div>
      </section>
    </div>
  );
}

