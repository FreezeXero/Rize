"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const SAMPLE_MAJORS = [
  { href: "/samples/computer-science", label: "Computer Science" },
  { href: "/samples/business", label: "Business" },
  { href: "/samples/engineering", label: "Engineering" },
  { href: "/samples/marketing", label: "Marketing" },
  { href: "/samples/finance", label: "Finance" },
  { href: "/samples/data-science", label: "Data Science" },
  { href: "/samples/design", label: "Design" },
  { href: "/samples/pre-med", label: "Pre-Med" },
  { href: "/samples/law", label: "Law" },
  { href: "/samples/education", label: "Education" },
] as const;

const RESOURCE_LINKS = [
  { href: "/help#how-to-write-resume", label: "How to write a resume" },
  { href: "/help#ats-tips", label: "ATS tips" },
  { href: "/help#resume-examples", label: "Resume examples" },
  { href: "/help#faq", label: "FAQ" },
] as const;

function Dropdown(props: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
      >
        {props.label}
        <ChevronDown size={14} className="text-zinc-400" />
      </button>
      {open ? (
        <div className="absolute left-0 z-50 mt-2 max-h-[min(70vh,420px)] w-56 overflow-y-auto rounded-xl border border-white/10 bg-[#0b1120] py-1 shadow-xl">
          {props.children}
        </div>
      ) : null}
    </div>
  );
}

export function LoggedInNav() {
  return (
    <nav className="hidden flex-1 items-center justify-center gap-2 md:flex" aria-label="Main">
      <Link
        href="/dashboard"
        className="inline-flex h-10 items-center rounded-full border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
      >
        Dashboard
      </Link>
      <Link
        href="/dashboard/ats"
        className="inline-flex h-10 items-center rounded-full border border-white/10 bg-white/5 px-3 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
      >
        ATS Checker
      </Link>

      <Dropdown label="Samples">
        {SAMPLE_MAJORS.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="block px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/10"
          >
            {m.label}
          </Link>
        ))}
      </Dropdown>

      <Dropdown label="Resources">
        {RESOURCE_LINKS.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="block px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/10"
          >
            {r.label}
          </Link>
        ))}
      </Dropdown>
    </nav>
  );
}
