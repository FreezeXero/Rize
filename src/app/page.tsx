import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { StatCards } from "../components/landing/StatCards";
import { LogoCarousel } from "../components/landing/LogoCarousel";
import { TemplateShowcase } from "../components/landing/TemplateShowcase";
import { PricingSectionClient } from "../components/landing/PricingSectionClient";
import { FooterSection } from "../components/landing/FooterSection";
import { StartBuildingLink } from "../components/auth/StartBuildingLink";
import { getCurrentUser } from "@/lib/auth/session";
import { countResumesForUser, listResumes } from "@/lib/db/resumes";
import { getUserUsageStats } from "@/lib/db/usage";
import { ResumeDashboardCard } from "@/components/dashboard/ResumeDashboardCard";

export default async function Home() {
  const user = await getCurrentUser();
  const firstName =
    typeof user?.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim().split(" ")[0]
      : (user?.email?.split("@")[0] ?? "there");

  let resumesCount = 0;
  let exportsThisMonth = 0;
  let aiUsesThisMonth = 0;
  let userPlan: "free" | "pro" | "max" = "free";
  let recentResumes: Awaited<ReturnType<typeof listResumes>> = [];
  if (user) {
    resumesCount = await countResumesForUser(user.id);
    const usage = await getUserUsageStats(user.id);
    exportsThisMonth = usage.exports_this_month;
    aiUsesThisMonth = usage.ai_uses_this_month;
    userPlan = usage.plan;
    recentResumes = (await listResumes(user.id)).slice(0, 3);
  }
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="relative min-h-screen">
      {/* Deep rich background glows */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.13),transparent_55%),radial-gradient(ellipse_60%_50%_at_20%_80%,rgba(34,211,238,0.10),transparent_55%),linear-gradient(to_bottom,rgba(3,7,18,0.0),rgba(5,5,9,0.70))]" />

        <div className="absolute -left-24 top-[-140px] h-[420px] w-[420px] rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -right-28 top-[-60px] h-[360px] w-[360px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-150px] left-[12%] h-[420px] w-[420px] rounded-full bg-cyan-500/12 blur-3xl" />
        <div className="absolute bottom-[-220px] right-[-80px] h-[520px] w-[520px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute inset-0 opacity-80 blur-3xl mix-blend-screen bg-[linear-gradient(110deg,transparent_0%,rgba(34,211,238,0.16)_35%,rgba(59,130,246,0.18)_60%,transparent_100%)] rize-holo-sweep" />

        <div className="absolute inset-0 opacity-30 mix-blend-screen blur-2xl bg-[repeating-linear-gradient(120deg,rgba(34,211,238,0.09)_0%,transparent_18%,rgba(59,130,246,0.10)_35%,transparent_55%)]" />
      </div>

      {!user ? (
        <>
          {/* HERO */}
          <section className="relative overflow-hidden">
            <div className="mx-auto max-w-6xl px-4 pt-14 md:px-6 md:pt-20">
              <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300 backdrop-blur-sm">
                  <span className="relative h-2 w-2">
                    <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-cyan-400 opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                  </span>
                  Developer-first resume tooling
                </div>

                <h1 className="mt-8 text-4xl font-semibold tracking-tight text-white md:text-6xl">
                  Build resumes with{" "}
                  <span className="text-cyan-200 underline decoration-cyan-300/70 underline-offset-8 drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]">
                    AI bullet rewrites
                  </span>{" "}
                  and{" "}
                  <span className="text-cyan-200 underline decoration-cyan-300/70 underline-offset-8 drop-shadow-[0_0_14px_rgba(34,211,238,0.35)]">
                    ATS insights
                  </span>
                  .
                </h1>

                <p className="mt-5 text-base leading-relaxed text-zinc-300 md:text-lg">
                  Live PDF preview, Pro/Max LaTeX conversion, and server-enforced usage
                  limits—no guesswork.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <StartBuildingLink
                    className="group inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-7 text-sm font-semibold text-[#050509] shadow-[0_0_30px_rgba(34,211,238,0.25)] transition hover:brightness-110 hover:scale-[1.02]"
                  >
                    Start building
                    <ArrowUpRight className="ml-2 transition group-hover:translate-y-[-1px]" size={18} />
                  </StartBuildingLink>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {[
                    "No credit card required",
                    "Free forever",
                    "Setup in 2 minutes",
                  ].map((t) => (
                    <div
                      key={t}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200"
                    >
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-300/15 text-cyan-200">
                        <Check size={14} />
                      </span>
                      {t}
                    </div>
                  ))}
                </div>

                <div className="mt-10">
                  <StatCards />
                </div>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="mx-auto max-w-6xl px-4 py-14 md:px-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Split-screen editor + live PDF preview",
                  body: "Type on the left, see the resume update instantly on the right.",
                },
                {
                  title: "AI rewrites with real quotas",
                  body: "Rewrite bullets and convert LaTeX on Pro/Max with server-side limits.",
                },
                {
                  title: "ATS checker that tells you what’s missing",
                  body: "Keyword match percentage and suggestions you can act on today.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:bg-white/7"
                >
                  <div className="text-sm font-semibold text-white">{f.title}</div>
                  <div className="mt-2 text-sm leading-relaxed text-zinc-300">
                    {f.body}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <LogoCarousel />
          <TemplateShowcase />
          <PricingSectionClient />
        </>
      ) : (
        <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6 md:pt-14">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.12),rgba(168,85,247,0.1),transparent)] rize-iridescent-flow" />
            <div className="relative">
            <h1 className="text-3xl font-semibold text-white md:text-4xl">
              {timeGreeting}, {firstName}
            </h1>
            <p className="mt-2 text-zinc-300">Welcome back. Keep momentum and ship a sharper resume today.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard/resumes/new"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 text-sm font-semibold text-[#050509] transition hover:brightness-110"
              >
                Create Resume
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
              >
                View Templates
              </Link>
              <Link
                href="/dashboard/ats"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 text-sm font-semibold text-zinc-100 transition hover:bg-white/10"
              >
                ATS Checker
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Resumes created
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{resumesCount}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  Exports this month
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{exportsThisMonth}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  AI uses
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">{aiUsesThisMonth}</div>
              </div>
            </div>
            <div className="mt-10">
              <div className="text-sm font-semibold text-white">Recent resumes</div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {recentResumes.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-300 md:col-span-3">
                    No resumes yet. Create one to see your recent activity.
                  </div>
                ) : (
                  recentResumes.map((r) => <ResumeDashboardCard key={r.id} resume={r} />)
                )}
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="text-sm font-semibold text-white">Tips to improve instantly</div>
                <ul className="mt-2 space-y-1 text-sm text-zinc-300">
                  <li>- Lead bullets with impact metrics.</li>
                  <li>- Match 6-10 keywords from the job description.</li>
                  <li>- Keep resume to one page for early-career roles.</li>
                </ul>
              </div>
              {user && userPlan === "free" ? (
                <div className="rounded-2xl border border-violet-300/20 bg-violet-500/10 p-5">
                  <div className="text-sm font-semibold text-white">Pro features teaser</div>
                  <p className="mt-2 text-sm text-zinc-200">
                    Unlock AI rewrites, premium templates, and full ATS reports for faster applications.
                  </p>
                  <Link href="/pricing" className="mt-3 inline-flex text-sm font-semibold text-cyan-300 hover:underline">
                    View plans →
                  </Link>
                </div>
              ) : null}
            </div>
            </div>
          </div>
        </section>
      )}

      <FooterSection variant={user ? "minimal" : "full"} />
    </main>
  );
}
