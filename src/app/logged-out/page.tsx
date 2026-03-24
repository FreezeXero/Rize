import Link from "next/link";

export default function LoggedOutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-3xl font-semibold text-white">
          You have been logged out
        </h1>
        <p className="mt-3 text-zinc-300">
          Sign back in to continue building your resumes.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-6 text-sm font-semibold text-[#050509] shadow-[0_0_30px_rgba(34,211,238,0.25)] transition hover:brightness-110 hover:scale-[1.02]"
          >
            Go to Log in
          </Link>
          <Link
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/0 px-6 text-sm font-semibold text-white transition hover:bg-white/5 hover:border-cyan-300/30"
          >
            Back to landing
          </Link>
        </div>
      </div>
    </div>
  );
}

