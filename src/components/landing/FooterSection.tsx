import Link from "next/link";
import { Logo } from "@/components/Logo";

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/samples/computer-science", label: "Templates" },
  { href: "/dashboard/ats", label: "ATS Checker" },
];

const RESOURCE_LINKS = [
  { href: "/help#how-to-write-resume", label: "How to write a resume" },
  { href: "/help#ats-tips", label: "ATS tips" },
  { href: "/help#resume-examples", label: "Resume examples" },
  { href: "/help#faq", label: "FAQ" },
];

export function FooterSection() {
  return (
    <footer className="mt-16 border-t border-white/[.06] bg-[#080810]">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        {/* Main grid */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Left — branding */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Build resumes that get you hired.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="https://www.youtube.com/@RafayCS"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] text-zinc-400 transition hover:border-red-400/30 hover:bg-red-400/[.06] hover:text-red-300"
              >
                <YouTubeIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/rafayfarah/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] text-zinc-400 transition hover:border-blue-400/30 hover:bg-blue-400/[.06] hover:text-blue-300"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://www.instagram.com/rafaycse/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[.03] text-zinc-400 transition hover:border-pink-400/30 hover:bg-pink-400/[.06] hover:text-pink-300"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Middle — Product */}
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Product
            </div>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Resources */}
          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Resources
            </div>
            <ul className="space-y-3">
              {RESOURCE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[.05] pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-600">© 2026 Rize</p>
          <p className="text-xs text-zinc-600">v0.1 · Built by Rafay Farah</p>
        </div>
      </div>
    </footer>
  );
}
