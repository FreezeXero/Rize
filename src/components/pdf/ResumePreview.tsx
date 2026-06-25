"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { PDFViewer } from "@react-pdf/renderer";
import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";
import { ResumeDocument } from "@/lib/pdf/ResumeDocument";

// US Letter aspect ratio (height / width)
const PDF_ASPECT = 792 / 612;

export function ResumePreview(props: {
  resume: ResumeContent;
  template: ResumeTemplateKey;
  compiledPdfUrl?: string | null;
  compileError?: string | null;
  /** When true, shows a compiling overlay (Jake LaTeX path). */
  compiling?: boolean;
}) {
  const previewKey = `${props.template}:${JSON.stringify(props.resume)}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Renderer receives explicit pixel dimensions = panel width, fitting to width.
  const renderW = containerWidth > 0 ? containerWidth : undefined;
  const renderH = renderW ? Math.round(renderW * PDF_ASPECT) : undefined;

  const overlay = props.compiling ? (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl bg-black/45 backdrop-blur-[2px]">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-200" aria-hidden />
      <span className="text-sm font-medium text-white">Compiling…</span>
    </div>
  ) : null;

  const shell = (child: ReactNode) => (
    <div
      ref={containerRef}
      className="relative h-[calc(100vh-190px)] w-full overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      {overlay}
      {child}
    </div>
  );

  if (props.compiledPdfUrl !== undefined) {
    if (props.compiledPdfUrl) {
      const src = props.compiledPdfUrl.includes("#")
        ? props.compiledPdfUrl
        : `${props.compiledPdfUrl}#toolbar=0`;
      return shell(
        <iframe
          key={src}
          title="Compiled LaTeX preview"
          src={src}
          style={{
            display: "block",
            border: "none",
            backgroundColor: "white",
            width: renderW ? `${renderW}px` : "100%",
            height: renderH ? `${renderH}px` : "100%",
          }}
        />
      );
    }
    if (props.compileError) {
      return shell(
        <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-red-300">
          LaTeX compilation failed: {props.compileError}
        </div>
      );
    }
    return shell(
      <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-zinc-300">
        Waiting for LaTeX preview…
      </div>
    );
  }

  // react-pdf's PDFViewer accepts width/height that control the iframe's render
  // dimensions. Passing explicit pixels here means the PDF.js inside renders at
  // native resolution for those dimensions — no CSS scaling, no blurriness.
  return shell(
    <PDFViewer
      key={previewKey}
      width={renderW ?? "100%"}
      height={renderH ?? "100%"}
      className="block border-none"
    >
      <ResumeDocument
        key={previewKey}
        resume={props.resume}
        template={props.template}
      />
    </PDFViewer>
  );
}
