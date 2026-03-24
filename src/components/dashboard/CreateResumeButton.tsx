"use client";

import Link from "next/link";

export function CreateResumeButton() {
  return (
    <Link
      href="/dashboard/resumes/new"
      className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:brightness-110"
    >
      Create new resume
    </Link>
  );
}

