"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { BlobProvider } from "@react-pdf/renderer";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ResumeDocument } from "@/lib/pdf/ResumeDocument";
import type { ResumePreviewProps } from "./resumePreviewTypes";
import { loadPdfJsFromCdn } from "./pdfjsCdn";

/** ~Letter-width PDF page at 72dpi; used to cap preview width. */
const PDF_NOMINAL_WIDTH = 612;

function PdfPageCanvas(props: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
  width: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    (async () => {
      const page = await props.pdf.getPage(props.pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      const scale = props.width / base.width;
      const viewport = page.getViewport({ scale });
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    })();

    return () => {
      cancelled = true;
    };
  }, [props.pdf, props.pageNumber, props.width]);

  return <canvas ref={canvasRef} className="block max-w-full bg-white shadow-sm" />;
}

function PdfCanvasPages({
  fileUrl,
  containerWidth,
}: {
  fileUrl: string;
  containerWidth: number;
}) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageWidth = Math.max(160, Math.min(containerWidth - 8, PDF_NOMINAL_WIDTH));

  useEffect(() => {
    let cancelled = false;
    setPdf(null);
    setError(null);

    (async () => {
      try {
        const pdfjs = await loadPdfJsFromCdn();
        if (cancelled) return;
        const task = pdfjs.getDocument({ url: fileUrl, withCredentials: false });
        const doc = await task.promise;
        if (cancelled) return;
        setPdf(doc);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load PDF.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  if (error) {
    return (
      <div className="min-h-[120px] py-6 text-center text-sm text-red-300">{error}</div>
    );
  }

  if (!pdf) {
    return (
      <div className="flex min-h-[180px] items-center justify-center gap-2 text-sm text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        Loading PDF…
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {Array.from({ length: pdf.numPages }, (_, i) => (
        <PdfPageCanvas key={i + 1} pdf={pdf} pageNumber={i + 1} width={pageWidth} />
      ))}
    </div>
  );
}

export default function ResumePreview(props: ResumePreviewProps) {
  const previewKey = `${props.template}:${JSON.stringify(props.resume)}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w > 0) setContainerWidth(w);
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
      className="relative max-h-[min(85vh,calc(100vh-10rem))] min-h-0 w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border border-white/10 bg-black/20"
    >
      {overlay}
      <div className="flex min-h-0 w-full flex-col items-stretch px-1 py-2">{child}</div>
    </div>
  );

  if (props.compiledPdfUrl !== undefined) {
    if (props.compiledPdfUrl) {
      return scaledShell(
        <PdfCanvasPages fileUrl={props.compiledPdfUrl} containerWidth={containerWidth} />
      );
    }
    return scaledShell(
      <div className="flex min-h-[200px] items-center justify-center gap-2 text-sm text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        Waiting for LaTeX preview…
      </div>
    );
  }

  return scaledShell(
    <BlobProvider
      document={
        <ResumeDocument
          key={previewKey}
          resume={props.resume}
          template={props.template}
        />
      }
    >
      {(instance) => {
        if (instance.error) {
          return (
            <div className="min-h-[120px] py-6 text-center text-sm text-red-300">
              {String(instance.error?.message ?? instance.error)}
            </div>
          );
        }
        if (instance.loading || !instance.url) {
          return (
            <div className="flex min-h-[200px] items-center justify-center gap-2 text-sm text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
              Generating PDF…
            </div>
          );
        }
        return <PdfCanvasPages fileUrl={instance.url} containerWidth={containerWidth} />;
      }}
    </BlobProvider>
  );
}
