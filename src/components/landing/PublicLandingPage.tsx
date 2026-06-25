"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight, Sparkles } from "lucide-react";
import { PricingSectionClient } from "./PricingSectionClient";

// ─── Shared animation config ────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return { ref, inView };
}

// ─── Editor mockup sub-components ───────────────────────────────────────────
function MField({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div>
      <div className="mb-[3px] text-[7px] text-zinc-500">{label}</div>
      <div className={`truncate rounded border border-white/10 bg-white/[.05] px-1.5 py-[3px] text-[7.5px] leading-snug ${muted ? "text-zinc-500" : "text-zinc-300"}`}>
        {value}
      </div>
    </div>
  );
}

function MSecLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[7px] font-semibold uppercase tracking-widest text-cyan-400/70">{children}</div>;
}

function MBullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-1 text-[7px] leading-snug text-zinc-400">
      <span className="mt-px shrink-0 text-cyan-400/50">•</span>
      <span>{children}</span>
    </div>
  );
}

function PdfSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5">
      <div className="mb-[3px] border-b border-gray-200 pb-px text-[6.5px] font-bold uppercase tracking-widest text-gray-700">
        {title}
      </div>
      {children}
    </div>
  );
}

function PdfBullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-0.5 text-[6px] leading-snug text-gray-600">
      <span className="shrink-0">•</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Full editor mockup ──────────────────────────────────────────────────────
function EditorMockup() {
  return (
    <div className="flex w-full overflow-hidden rounded-xl border border-white/[.10] shadow-[0_40px_80px_rgba(0,0,0,0.55)]">
      {/* Left: dark editor panel */}
      <div className="w-[44%] shrink-0 space-y-2 bg-[#07101f] p-4">
        {/* Window chrome */}
        <div className="mb-3 flex items-center gap-1.5">
          <span className="h-[7px] w-[7px] rounded-full bg-red-400/60" />
          <span className="h-[7px] w-[7px] rounded-full bg-yellow-400/60" />
          <span className="h-[7px] w-[7px] rounded-full bg-green-400/60" />
          <span className="ml-2 text-[7px] text-zinc-600">Rize · Resume Editor</span>
        </div>

        <MField label="Full Name" value="John Anderson" />
        <MField label="Contact" value="john@email.com · github.com/john" muted />

        <div>
          <MSecLabel>Experience</MSecLabel>
          <div className="mt-1 space-y-[3px] rounded border border-white/10 bg-white/[.04] p-2">
            <div className="text-[7.5px] font-medium text-zinc-300">Software Engineer · Google</div>
            <div className="text-[6.5px] text-zinc-500">Jun 2022 – Present</div>
            <MBullet>Reduced API latency 40% via Redis caching layer</MBullet>
            <MBullet>Led 5-engineer team to ship real-time pipeline</MBullet>
          </div>
        </div>

        <div>
          <MSecLabel>Skills</MSecLabel>
          <div className="mt-1 rounded border border-white/10 bg-white/[.04] px-1.5 py-[3px] text-[7px] text-zinc-400">
            Python · TypeScript · React · AWS · Docker
          </div>
        </div>

        <div>
          <MSecLabel>Education</MSecLabel>
          <div className="mt-1 rounded border border-white/10 bg-white/[.04] p-2">
            <div className="text-[7.5px] font-medium text-zinc-300">B.S. Computer Science</div>
            <div className="text-[6.5px] text-zinc-500">Stanford University · 2018–2022</div>
          </div>
        </div>
      </div>

      {/* Right: white PDF preview */}
      <div className="flex-1 bg-white p-3.5 text-[6.5px]">
        <div className="mb-2 border-b border-gray-200 pb-1.5 text-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-900">John Anderson</div>
          <div className="mt-[3px] text-[6px] text-gray-500">
            john@email.com · linkedin.com/in/john · github.com/john
          </div>
        </div>

        <PdfSection title="Experience">
          <div className="mb-[3px] flex items-start justify-between">
            <div>
              <div className="text-[7.5px] font-semibold text-gray-900">Software Engineer</div>
              <div className="text-[6px] italic text-gray-500">Google, Mountain View CA</div>
            </div>
            <div className="ml-2 shrink-0 text-[6px] text-gray-500">2022–Present</div>
          </div>
          <PdfBullet>Reduced API latency by 40% via Redis caching layer</PdfBullet>
          <PdfBullet>Led 5-engineer team to ship real-time data pipeline</PdfBullet>
        </PdfSection>

        <PdfSection title="Education">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[7.5px] font-semibold text-gray-900">B.S. Computer Science</div>
              <div className="text-[6px] italic text-gray-500">Stanford University · GPA 3.9</div>
            </div>
            <div className="ml-2 shrink-0 text-[6px] text-gray-500">2018–2022</div>
          </div>
        </PdfSection>

        <PdfSection title="Technical Skills">
          <div className="text-[6px] text-gray-600">
            <span className="font-semibold text-gray-700">Languages:</span> Python, TypeScript, Go &nbsp;·&nbsp;
            <span className="font-semibold text-gray-700">Cloud:</span> AWS, Docker, Kubernetes
          </div>
        </PdfSection>

        <PdfSection title="Projects">
          <div className="text-[7.5px] font-semibold text-gray-900">RealFlow — Event streaming platform</div>
          <PdfBullet>Processed 2M events/day with p99 latency under 20ms using Kafka + Go</PdfBullet>
        </PdfSection>
      </div>
    </div>
  );
}

// ─── Feature visuals ─────────────────────────────────────────────────────────
function LivePreviewVisual() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#07101f] p-5 shadow-2xl shadow-black/40">
      <div className="flex items-stretch gap-3">
        {/* Editor side */}
        <div className="flex-1 space-y-2">
          <div className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Editor</div>
          <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/[.06] px-3 py-2 text-[11px] leading-snug text-zinc-200">
            Reduced latency by 40%
            <motion.span
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ duration: 1.05, repeat: Infinity, times: [0, 0.45, 0.5, 0.95] }}
              className="ml-px inline-block h-3.5 w-0.5 translate-y-[1px] bg-cyan-300 align-middle"
            />
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-[11px] leading-snug text-zinc-500">
            Led team of 5 engineers...
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-[11px] leading-snug text-zinc-500">
            Built CI/CD pipeline...
          </div>
        </div>

        {/* Connector */}
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-300/30 to-transparent" />
          <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 p-1.5">
            <ChevronRight size={10} className="text-cyan-300" />
          </div>
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-cyan-300/30 to-transparent" />
        </div>

        {/* Preview side */}
        <div className="flex-1 rounded-xl bg-white p-3">
          <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">Preview</div>
          <div className="space-y-1 text-[9px] leading-snug text-gray-600">
            <div className="flex gap-1"><span>•</span><span>Reduced latency by 40%</span></div>
            <div className="flex gap-1"><span>•</span><span>Led team of 5 engineers...</span></div>
            <div className="flex gap-1"><span>•</span><span>Built CI/CD pipeline...</span></div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-zinc-500">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400/70">
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex h-full w-full rounded-full bg-cyan-400"
          />
        </span>
        Updates as you type
      </div>
    </div>
  );
}

function AIRewriteVisual() {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-[#07101f] p-5 shadow-2xl shadow-black/40">
      <div>
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">Before</div>
        <div className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-sm leading-snug text-zinc-400 line-through decoration-zinc-600/50">
          Worked on improving website performance issues
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-300/25" />
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-cyan-300/[.08] px-3 py-1 text-[10px] font-medium text-cyan-200">
          <Sparkles size={10} />
          AI Rewrite
        </div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-cyan-300/25" />
      </div>

      <div>
        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-400/80">After</div>
        <div className="rounded-xl border border-cyan-300/25 bg-cyan-300/[.05] px-4 py-3 text-sm leading-relaxed text-white">
          Improved Core Web Vitals by 62%, reducing LCP from 4.2s → 1.6s and boosting conversion 18% across 3M monthly users
        </div>
      </div>
    </div>
  );
}

function ATSVisual() {
  const keywords = [
    { word: "React", matched: true },
    { word: "TypeScript", matched: true },
    { word: "Node.js", matched: true },
    { word: "AWS", matched: false },
    { word: "Docker", matched: true },
    { word: "GraphQL", matched: false },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[#07101f] p-5 shadow-2xl shadow-black/40">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-white">ATS Score</div>
          <div className="mt-0.5 text-xs text-zinc-500">vs. job description</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold tabular-nums text-cyan-300">82%</div>
          <div className="text-[9px] text-cyan-400/70">Strong match</div>
        </div>
      </div>

      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400"
          style={{ width: "82%" }}
        />
      </div>

      <div className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
        Keyword matches
      </div>
      <div className="flex flex-wrap gap-1.5">
        {keywords.map((k) => (
          <span
            key={k.word}
            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
              k.matched
                ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                : "border-red-400/25 bg-red-400/[.08] text-red-300 line-through"
            }`}
          >
            {k.word}
          </span>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-zinc-500">
        2 missing keywords detected — add before applying
      </div>
    </div>
  );
}

// ─── Feature row (scroll-reveal) ─────────────────────────────────────────────
function FeatureRow({
  eyebrow,
  title,
  body,
  visual,
}: {
  eyebrow: string;
  title: string;
  body: string;
  visual: React.ReactNode;
}) {
  const { ref, inView } = useReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 52 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: EASE }}
      className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20"
    >
      <div className="max-w-lg">
        <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400/80">
          {eyebrow}
        </div>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">{body}</p>
      </div>
      <div>{visual}</div>
    </motion.div>
  );
}

// ─── Public landing page ─────────────────────────────────────────────────────
export function PublicLandingPage() {
  return (
    <>
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,rgba(34,211,238,0.10),transparent_65%),radial-gradient(ellipse_50%_40%_at_85%_80%,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="absolute -left-40 -top-28 h-[520px] w-[520px] rounded-full bg-blue-600/[.07] blur-[100px]" />
        <div className="absolute -right-24 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/[.06] blur-[80px]" />
        <div className="absolute bottom-[-180px] left-[10%] h-[400px] w-[400px] rounded-full bg-cyan-500/[.08] blur-[90px]" />
      </div>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Dot-grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(34,211,238,0.55) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Ambient beam */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(34,211,238,0.15), transparent 70%)",
            }}
          />

          {/* Floating background text — purely decorative */}
          {([
            { text: "Reduced API latency by 40%",       x: "4%",  y: "12%", dur: 26, delay: 0 },
            { text: "Software Engineer Intern · Stripe", x: "60%", y: "7%",  dur: 32, delay: 4 },
            { text: "ATS Score: 82%",                   x: "80%", y: "32%", dur: 21, delay: 1.5 },
            { text: "GPA: 3.99",                        x: "10%", y: "58%", dur: 28, delay: 7 },
            { text: "Strong match",                     x: "52%", y: "68%", dur: 23, delay: 2.5 },
            { text: "PDF exported",                     x: "78%", y: "70%", dur: 30, delay: 5.5 },
            { text: String.raw`\textbf{Experience}`,    x: "28%", y: "80%", dur: 25, delay: 9 },
            { text: "NSF REU Research Intern",          x: "5%",  y: "84%", dur: 22, delay: 3 },
          ] as { text: string; x: string; y: string; dur: number; delay: number }[]).map((w, i) => (
            <motion.span
              key={i}
              aria-hidden
              animate={{ y: [0, -16, 6, -9, 0], x: [0, 4, -2, 5, 0] }}
              transition={{ duration: w.dur, repeat: Infinity, ease: "easeInOut", delay: w.delay }}
              className="pointer-events-none absolute whitespace-nowrap font-mono text-xs font-medium text-white"
              style={{ left: w.x, top: w.y, opacity: 0.055 }}
            >
              {w.text}
            </motion.span>
          ))}

          <div className="relative mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
              className="flex justify-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[.09] bg-white/[.05] px-4 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
                </span>
                Recruiter-ready resumes · Free to start
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              className="mx-auto mt-7 max-w-3xl text-center text-[2.6rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl md:text-6xl"
            >
              The resume that{" "}
              <span className="bg-gradient-to-br from-cyan-300 via-teal-200 to-violet-300 bg-clip-text text-transparent">
                gets you the interview.
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.17, ease: EASE }}
              className="mx-auto mt-6 max-w-lg text-center text-lg leading-relaxed text-zinc-300"
            >
              Build a LaTeX-quality resume in minutes. AI rewrites, live PDF preview, ATS
              scoring. Free to start.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.27, ease: EASE }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/get-started"
                className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-8 text-sm font-semibold text-[#050509] shadow-[0_0_32px_rgba(34,211,238,0.26)] transition duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.99]"
              >
                Build your resume free
                <ArrowUpRight
                  size={16}
                  className="transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/[.05] px-6 text-sm font-medium text-zinc-200 backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                Sign in
              </Link>
            </motion.div>

            {/* Trust chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.42 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-2"
            >
              {["No credit card required", "Free forever", "2-minute setup"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[.08] bg-white/[.04] px-3 py-1 text-[11px] text-zinc-400"
                >
                  <Check size={10} className="text-cyan-300" />
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Perspective-tilted editor mockup */}
          <motion.div
            initial={{ opacity: 0, y: 72 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, delay: 0.5, ease: EASE }}
            className="mx-auto mt-16 max-w-5xl px-4 md:px-10 [mask-image:linear-gradient(to_bottom,black_35%,transparent_100%)]"
          >
            <div className="[perspective:1600px]">
              <div style={{ transform: "rotateX(14deg)" }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.6,
                  }}
                >
                  <EditorMockup />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────── */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-32 md:px-6">
          <div className="space-y-32">
            <FeatureRow
              eyebrow="Live preview"
              title="Type. See it update instantly."
              body="Your changes appear in the live PDF preview in real time — no saving, no refreshing. What you type is what gets printed, pixel-perfect and export-ready."
              visual={<LivePreviewVisual />}
            />
            <FeatureRow
              eyebrow="AI rewrites"
              title="AI rewrites your bullets in seconds."
              body="Paste a vague responsibility and watch it become a metric-driven bullet that hiring managers actually read. Powered by Claude — with weekly limits on the free plan."
              visual={<AIRewriteVisual />}
            />
            <FeatureRow
              eyebrow="ATS score"
              title="Know your ATS score before you apply."
              body="Compare your resume against any job description and see exactly which keywords are missing — fix them before the algorithm filters you out."
              visual={<ATSVisual />}
            />
          </div>
        </section>

        <PricingSectionClient />
      </main>
    </>
  );
}
