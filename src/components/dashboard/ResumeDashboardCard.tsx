"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Trash2 } from "lucide-react";
import { ResumeTemplateThumbnail } from "@/components/resume/ResumeTemplateThumbnail";
import type { ResumeRow } from "@/lib/db/resumes";
import type { ResumeTemplateKey } from "@/lib/db/resumeTypes";

export function ResumeDashboardCard(props: { resume: ResumeRow }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Inline rename state
  const [localTitle, setLocalTitle] = useState(props.resume.title ?? "Untitled");
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(localTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  function startRename() {
    setDraftTitle(localTitle);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function commitRename() {
    setIsRenaming(false);
    const trimmed = draftTitle.trim();
    if (!trimmed || trimmed === localTitle) return;
    const prev = localTitle;
    setLocalTitle(trimmed); // optimistic
    try {
      const res = await fetch("/api/resumes/rename", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeId: props.resume.id, title: trimmed }),
      });
      if (!res.ok) setLocalTitle(prev); // revert on error
      else router.refresh();
    } catch {
      setLocalTitle(prev);
    }
  }

  function cancelRename() {
    setIsRenaming(false);
    setDraftTitle(localTitle);
  }

  async function onDelete() {
    setBusy(true);
    setDeleteError(null);
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
      setDeleteError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  const editHref = `/dashboard/resumes/${props.resume.id}/edit`;

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.025, y: -3 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="group flex flex-col rounded-2xl border border-white/[.08] bg-[#0f0f1a] p-4 hover:border-cyan-300/30 hover:shadow-[0_8px_32px_rgba(34,211,238,0.09)]"
      >
        <Link href={editHref} className="block">
          <div className="h-44 overflow-hidden rounded-xl border border-white/[.07] bg-zinc-900/60 p-2">
            <div className="mx-auto aspect-[210/297] w-full translate-y-[-2%]">
              <ResumeTemplateThumbnail
                template={props.resume.template as ResumeTemplateKey}
                resume={props.resume.content}
                compact
              />
            </div>
          </div>
        </Link>

        <div className="mt-3 min-w-0">
          {isRenaming ? (
            <input
              ref={inputRef}
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); commitRename(); }
                if (e.key === "Escape") cancelRename();
              }}
              className="w-full rounded border border-cyan-300/40 bg-black/30 px-1.5 py-0.5 text-sm font-semibold text-white outline-none focus:ring-1 focus:ring-cyan-300/30"
              maxLength={120}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={startRename}
              title="Click to rename"
              className="w-full truncate text-left text-sm font-semibold text-white transition hover:text-cyan-200"
            >
              {localTitle}
            </button>
          )}
          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            {props.resume.template.replaceAll("_", " ")}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link
            href={editHref}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/[.08] bg-black/30 px-3 py-2 text-xs font-semibold text-zinc-100 transition hover:border-cyan-300/30 hover:shadow-[0_0_12px_rgba(34,211,238,0.12)]"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => { setDeleteError(null); setConfirmOpen(true); }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-400/20 bg-red-500/[.07] px-3 py-2 text-xs font-semibold text-red-300 transition hover:border-red-400/45 hover:bg-red-500/15"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>

        {deleteError ? <div className="mt-2 text-xs text-red-300">{deleteError}</div> : null}
      </motion.div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => !busy && setConfirmOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111120] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-semibold text-white">Delete resume?</div>
            <p className="mt-2 text-sm text-zinc-300">
              This permanently deletes{" "}
              <span className="font-semibold text-white">{localTitle}</span>. This
              can&apos;t be undone.
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
    </>
  );
}
