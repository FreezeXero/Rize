import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listResumes } from "@/lib/db/resumes";
import { ATSChecker } from "@/components/ats/ATSChecker";
import { ATSFloatingBackground } from "@/components/ats/ATSFloatingBackground";
import { FooterSection } from "@/components/landing/FooterSection";

export default async function ATSPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resumes = await listResumes(user.id);
  return (
    <>
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
      {/* Hero */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/[.08] bg-[#0c0c18] px-8 py-10 md:px-10">
        <ATSFloatingBackground />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(34,211,238,0.12),transparent_60%),radial-gradient(ellipse_60%_60%_at_0%_100%,rgba(139,92,246,0.08),transparent_60%)]"
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
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[.07] px-3 py-1 text-xs font-medium text-cyan-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-300" />
            </span>
            ATS Score Checker
          </div>
          <h1 className="mt-4 text-3xl font-bold text-white md:text-4xl">
            Know your score{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
              before you apply.
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-zinc-300">
            Paste any job description and see exactly which keywords your resume is
            missing. Fix them before the algorithm filters you out.
          </p>
        </div>
      </div>

      <ATSChecker resumes={resumes.map((r) => ({ id: r.id, title: r.title }))} />
    </div>
    <FooterSection />
    </>
  );
}
