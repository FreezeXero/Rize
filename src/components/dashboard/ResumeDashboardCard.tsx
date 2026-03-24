"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { ResumeTemplateThumbnail } from "@/components/resume/ResumeTemplateThumbnail";
import type { ResumeRow } from "@/lib/db/resumes";
import type { ResumeTemplateKey } from "@/lib/db/resumeTypes";

export function ResumeDashboardCard(props: { resume: ResumeRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/resumes/delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeId: props.resume.id }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Could not delete resume.");
      setConfirmOpen(false);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  const editHref = `/dashboard/resumes/${props.resume.id}/edit`;

  return (
    <div className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/40 hover:bg-white/10">
      <Link href={editHref} className="block">
        <div className="h-44 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-2">
          <div className="mx-auto aspect-[210/297] w-full translate-y-[-2%]">
            <ResumeTemplateThumbnail
              template={props.resume.template as ResumeTemplateKey}
              resume={props.resume.content}
              compact
            />
          </div>
        </div>
        <div className="mt-3 min-w-0">
          <div className="truncate font-semibold text-white">
            {props.resume.title ?? "Untitled"}
          </div>
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-400">
            {props.resume.template.replaceAll("_", " ")}
          </div>
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href={editHref}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
        >
          <Pencil size={14} />
          Edit
        </Link>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirmOpen(true);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-400/50 hover:bg-red-500/20"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>

      {error ? (
        <div className="mt-2 text-xs text-red-300">{error}</div>
      ) : null}

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => !busy && setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0b1120] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-white">Delete resume?</div>
            <p className="mt-2 text-sm text-zinc-300">
              This permanently deletes{" "}
              <span className="font-semibold text-white">
                {props.resume.title ?? "this resume"}
              </span>
              . This can’t be undone.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmOpen(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-zinc-200 transition hover:bg-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onDelete}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-red-400/40 bg-red-500/20 px-4 text-sm font-semibold text-red-100 transition hover:bg-red-500/30 disabled:opacity-50"
              >
                {busy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
