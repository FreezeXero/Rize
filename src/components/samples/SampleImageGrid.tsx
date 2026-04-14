"use client";

import { useEffect, useState } from "react";

type SampleImage = {
  src: string;
  source: string;
  title: string;
};

export function SampleImageGrid(props: { majorLabel: string; images: readonly SampleImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : props.images[activeIndex];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveIndex(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {props.images.map((img, idx) => (
          <button
            key={`${img.src}-${idx}`}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className="group overflow-hidden rounded-xl border border-white/10 bg-black/20 text-left transition hover:border-cyan-300/40 hover:bg-white/5"
          >
            <img
              src={img.src}
              alt={`${props.majorLabel} resume sample ${idx + 1}`}
              className="h-48 w-full object-cover object-top transition group-hover:scale-[1.01]"
              loading="lazy"
            />
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="truncate text-[11px] text-zinc-300">{img.title}</span>
              <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-zinc-200">
                {img.source}
              </span>
            </div>
          </button>
        ))}
      </div>

      {active ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="w-full max-w-5xl rounded-2xl border border-white/15 bg-[#0b1120] p-3 md:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{active.title}</p>
                <p className="text-xs text-zinc-400">{active.source}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={active.src}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setActiveIndex(null)}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-semibold text-zinc-100 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="max-h-[78vh] overflow-auto rounded-xl border border-white/10 bg-black/30">
              <img
                src={active.src}
                alt={`${props.majorLabel} resume enlarged`}
                className="mx-auto w-full max-w-4xl object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
