"use client";

import React, { useState } from "react";

type ResumeOption = { id: string; title: string | null };

type AtsCheckResult = {
  matchPercentage: number;
  missingKeywords: string[];
  suggestions: string[];
  detailedReport?: string | null;
};

export function ATSChecker(props: { resumes: ResumeOption[] }) {
  const [resumeId, setResumeId] = useState(props.resumes[0]?.id ?? "");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<AtsCheckResult | null>(null);

  async function runCheck() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ats/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeId, jobDescription }),
      });
      const json = (await res.json().catch(() => ({}))) as Partial<AtsCheckResult> & {
        error?: string;
      };
      if (!res.ok) throw new Error(json?.error ?? "ATS check failed");
      setResult({
        matchPercentage: Number(json.matchPercentage ?? 0),
        missingKeywords: Array.isArray(json.missingKeywords)
          ? (json.missingKeywords as string[])
          : [],
        suggestions: Array.isArray(json.suggestions)
          ? (json.suggestions as string[])
          : [],
        detailedReport:
          typeof json.detailedReport === "string" || json.detailedReport === null
            ? (json.detailedReport as string | null)
            : null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ATS check failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white">ATS score checker</div>
        <p className="mt-2 text-xs text-zinc-400">
          Paste a job description and see how well your resume matches keywords.
          Pro gets basic suggestions; Max includes a detailed report.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-xs text-zinc-300">Choose a resume</span>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-cyan-300/50"
            >
              {props.resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title ?? "Untitled"}
                </option>
              ))}
            </select>
          </label>
          <div />
        </div>

        <label className="mt-4 grid gap-1">
          <span className="text-xs text-zinc-300">Job description</span>
          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
            placeholder="Paste the job posting here..."
          />
        </label>

        {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}

        <button
          type="button"
          onClick={runCheck}
          disabled={loading || !jobDescription.trim() || !resumeId}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Checking..." : "Check ATS"}
        </button>
      </div>

      {result ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-semibold text-white">Result</div>
            <div className="text-lg font-semibold text-cyan-200">
              {result.matchPercentage}%
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold text-zinc-300">Missing keywords</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(result.missingKeywords ?? []).map((kw: string) => (
                  <span
                    key={kw}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-zinc-200"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-300">Suggestions</div>
              <ul className="mt-2 list-disc pl-5 text-sm text-zinc-200">
                {(result.suggestions ?? []).slice(0, 6).map((s: string) => (
                  <li key={s} className="mb-1">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {result.detailedReport ? (
            <div className="mt-5">
              <div className="text-xs font-semibold text-zinc-300">
                Detailed report (Max)
              </div>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-zinc-200">
                {String(result.detailedReport)}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

