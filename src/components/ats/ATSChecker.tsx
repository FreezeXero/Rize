"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, X, XCircle, Zap } from "lucide-react";

type ResumeOption = { id: string; title: string | null };

type AtsCheckResult = {
  matchPercentage: number;
  strengths?: string[];
  missing: string[];
  suggestions: string[];
  summary?: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ScoreRing({ score }: { score: number }) {
  const ringColor =
    score >= 70 ? "#22d3ee" : score >= 40 ? "#facc15" : "#f87171";
  const label =
    score >= 70 ? "Strong match" : score >= 40 ? "Partial match" : "Weak match";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
          <g transform="rotate(-90 50 50)">
            <motion.circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke={ringColor}
              strokeWidth="7"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: score / 100 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
            />
          </g>
          <text x="50" y="47" textAnchor="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif">
            {score}%
          </text>
          <text x="50" y="62" textAnchor="middle" fill="rgba(161,161,170,0.8)" fontSize="9" fontFamily="system-ui, -apple-system, sans-serif">
            match
          </text>
        </svg>
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-25 blur-xl"
          style={{ background: ringColor }}
        />
      </div>
      <div
        className="rounded-full px-3 py-0.5 text-xs font-semibold"
        style={{ background: `${ringColor}18`, color: ringColor, border: `1px solid ${ringColor}40` }}
      >
        {label}
      </div>
    </div>
  );
}

export function ATSChecker(props: { resumes: ResumeOption[] }) {
  const [resumeId, setResumeId] = useState(props.resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AtsCheckResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function runCheck() {
    setLoading(true);
    setError(null);
    setResult(null);
    setModalOpen(false);
    try {
      const res = await fetch("/api/ats/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });
      const json = (await res.json().catch(() => ({}))) as Partial<AtsCheckResult> & { error?: string };
      if (!res.ok) throw new Error(json?.error ?? "ATS check failed");
      setResult({
        matchPercentage: Math.min(100, Math.max(0, Number(json.matchPercentage ?? 0))),
        strengths: Array.isArray(json.strengths) ? (json.strengths as string[]) : undefined,
        missing: Array.isArray(json.missing) ? (json.missing as string[]) : [],
        suggestions: Array.isArray(json.suggestions) ? (json.suggestions as string[]) : [],
        summary: typeof json.summary === "string" ? json.summary : undefined,
      });
      setModalOpen(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ATS check failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Form card */}
      <div className="rounded-3xl bg-gradient-to-br from-cyan-300/20 via-violet-300/10 to-transparent p-px shadow-[0_0_32px_rgba(34,211,238,0.07)]">
        <div className="rounded-3xl bg-[#0f0f1a] p-6">
          <div className="text-base font-semibold text-white">Check your ATS score</div>
          <p className="mt-1.5 text-sm text-zinc-400">
            Paste a job description and see how well your resume matches. Free plan: 3
            checks/week. Pro: unlimited. Max: AI-powered semantic analysis.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-zinc-300">Choose a resume</span>
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/20"
              >
                {props.resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.title ?? "Untitled"}</option>
                ))}
              </select>
            </label>
            <div />
          </div>

          <label className="mt-4 grid gap-1.5">
            <span className="text-xs font-medium text-zinc-300">Job description</span>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/20"
              placeholder="Paste the job posting here…"
            />
          </label>

          {error ? (
            <div className="mt-3 rounded-xl border border-red-400/25 bg-red-500/[.07] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={runCheck}
              disabled={loading || !jobDescription.trim() || !resumeId}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-6 text-sm font-semibold text-[#050509] shadow-[0_0_24px_rgba(34,211,238,0.25)] transition hover:brightness-110 hover:shadow-[0_0_36px_rgba(34,211,238,0.40)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
            >
              {loading ? <Loader2 size={15} className="animate-spin text-[#050509]" /> : <Zap size={15} />}
              {loading ? "Analyzing…" : "Check ATS Score"}
            </button>

            {result && !modalOpen ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="h-11 rounded-xl border border-cyan-300/25 bg-cyan-300/[.07] px-4 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/50 hover:text-white"
              >
                View results
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Results modal */}
      <AnimatePresence>
        {result && modalOpen ? (
          <motion.div
            key="ats-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[90] overflow-y-auto"
            style={{ background: "rgba(4,4,12,0.88)" }}
            onClick={() => setModalOpen(false)}
          >
            {/* Backdrop blur layer */}
            <div className="pointer-events-none fixed inset-0 backdrop-blur-[8px]" aria-hidden />

            {/* Centering wrapper */}
            <div className="flex min-h-full items-start justify-center p-4 md:p-10">
              <motion.div
                key="ats-modal"
                initial={{ opacity: 0, scale: 0.93, y: 22 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.38, ease: EASE }}
                className="relative w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="overflow-hidden rounded-3xl border border-white/[.12] bg-[#0d0d1c] shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                  {/* Modal header */}
                  <div className="flex items-center justify-between border-b border-white/[.07] bg-[#0d0d1c] px-6 py-4">
                    <div>
                      <div className="text-base font-semibold text-white">ATS Analysis</div>
                      <div className="mt-0.5 text-xs text-zinc-500">Semantic match against job requirements</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      aria-label="Close results"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:bg-white/[.05] hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Scrollable content */}
                  <div className="grid gap-4 p-6">
                    {/* Score row */}
                    <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/[.07] bg-white/[.02] p-6 sm:flex-row sm:items-start sm:gap-8">
                      <div className="shrink-0">
                        <ScoreRing score={result.matchPercentage} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-white">Your resume vs. this role</div>
                        {result.summary ? (
                          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{result.summary}</p>
                        ) : (
                          <p className="mt-1.5 text-sm text-zinc-400">
                            {result.matchPercentage >= 70
                              ? "You're a strong candidate — focus on the suggestions below to stand out."
                              : result.matchPercentage >= 40
                                ? "There's solid overlap, but some key gaps could hurt your chances."
                                : "This role has significant gaps from your current resume."}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Strengths — Max only */}
                      {result.strengths && result.strengths.length > 0 ? (
                        <div className="rounded-2xl border border-cyan-300/[.12] bg-cyan-300/[.04] p-4">
                          <div className="mb-2.5 flex items-center gap-2">
                            <CheckCircle2 size={14} className="shrink-0 text-cyan-300" />
                            <span className="text-sm font-semibold text-cyan-200">Your strengths</span>
                          </div>
                          <ul className="space-y-1.5">
                            {result.strengths.map((s) => (
                              <li key={s} className="flex items-start gap-2 text-sm text-zinc-300">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {/* What's missing */}
                      <div className="rounded-2xl border border-red-400/[.12] bg-red-400/[.04] p-4">
                        <div className="mb-2.5 flex items-center gap-2">
                          <XCircle size={14} className="shrink-0 text-red-300" />
                          <span className="text-sm font-semibold text-red-200">What&apos;s missing</span>
                        </div>
                        {result.missing.length === 0 ? (
                          <p className="text-sm text-zinc-400">No critical gaps found.</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {result.missing.map((m) => (
                              <li key={m} className="flex items-start gap-2 text-sm text-zinc-300">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                                {m}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {result.suggestions.length > 0 ? (
                      <div className="rounded-2xl border border-white/[.07] bg-white/[.02] p-4">
                        <div className="mb-3 text-sm font-semibold text-white">
                          How to improve your resume for this role
                        </div>
                        <ol className="space-y-2.5">
                          {result.suggestions.map((s, i) => (
                            <li key={s} className="flex gap-3 text-sm text-zinc-300">
                              <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300/30 to-violet-300/30 text-[11px] font-bold text-white">
                                {i + 1}
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
