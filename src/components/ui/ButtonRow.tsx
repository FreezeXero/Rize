"use client";

import React from "react";
import type { ReactNode } from "react";

export function ButtonRow(props: {
  onSave: () => void;
  onExport: () => void | Promise<void>;
  saving: boolean;
}): ReactNode {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <button
        type="button"
        onClick={() => props.onSave()}
        disabled={props.saving}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        {props.saving ? "Saving..." : "Save"}
      </button>
      <button
        type="button"
        onClick={() => props.onExport()}
        disabled={props.saving}
        className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:brightness-110 disabled:opacity-60"
      >
        Export
      </button>
    </div>
  );
}

