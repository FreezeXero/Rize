"use client";

import dynamic from "next/dynamic";

const ResumePreview = dynamic(() => import("./ResumePreviewClient"), {
  ssr: false,
  loading: () => (
    <div className="relative flex min-h-[200px] w-full min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-black/20 px-1 py-2 text-sm text-zinc-400">
      Loading preview…
    </div>
  ),
});

export { ResumePreview };
export type { ResumePreviewProps } from "./resumePreviewTypes";
