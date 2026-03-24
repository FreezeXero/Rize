"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";
import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";
import { ResumeDocument } from "@/lib/pdf/ResumeDocument";

/** ~A4 width in pt; react-pdf canvas is often slightly wider — scale to fit panel. */
const PDF_NOMINAL_WIDTH = 600;

export function ResumePreview(props: {
  resume: ResumeContent;
  template: ResumeTemplateKey;
  compiledPdfUrl?: string | null;
  /** When true, shows a compiling overlay (Jake LaTeX path). */
  compiling?: boolean;
}) {
  const previewKey = `${props.template}:${JSON.stringify(props.resume)}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, (w - 4) / PDF_NOMINAL_WIDTH));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const overlay = props.compiling ? (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/45 backdrop-blur-[2px]">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-200" aria-hidden />
      <span className="text-sm font-medium text-white">Compiling…</span>
    </div>
  ) : null;

  const scaledShell = (child: ReactNode) => (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-190px)] w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      {overlay}
      <div
        className="flex h-full w-full min-w-0 justify-center overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div
          className="h-full w-full min-w-0"
          style={{ width: `${100 / scale}%`, maxWidth: `${100 / scale}%` }}
        >
          {child}
        </div>
      </div>
    </div>
  );

  if (props.compiledPdfUrl) {
    const src = props.compiledPdfUrl.includes("#")
      ? props.compiledPdfUrl
      : `${props.compiledPdfUrl}#toolbar=0`;
    return scaledShell(
      <iframe
        title="Compiled LaTeX preview"
        src={src}
        className="h-full w-full min-w-0 border-0 bg-white"
      />
    );
  }

  return scaledShell(
    <div className="h-full w-full min-w-0 overflow-hidden [&>div]:!h-full [&>div]:!min-w-0 [&>div]:!w-full [&>div]:!max-w-full">
      <PDFViewer key={previewKey} className="h-full w-full min-w-0 !max-w-full">
        <ResumeDocument
          key={previewKey}
          resume={props.resume}
          template={props.template}
        />
      </PDFViewer>
    </div>
  );
}
