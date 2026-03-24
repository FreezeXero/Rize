import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function GetStartedPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard/new");

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold text-white">
          Get started with Rize
        </h1>
        <p className="mt-2 text-zinc-300">
          Sign up to create your resumes and unlock AI + ATS features.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/signup"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-6 text-sm font-semibold text-[#050509] shadow-[0_0_30px_rgba(34,211,238,0.25)] transition hover:brightness-110 hover:scale-[1.02]"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/0 px-6 text-sm font-semibold text-white transition hover:bg-white/5 hover:border-cyan-300/30"
          >
            Log in
          </Link>
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          After signing up, you may need to confirm your email before logging
          in (depending on your Supabase auth settings).
        </p>
      </div>
    </div>
  );
}

