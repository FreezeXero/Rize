import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";

export type ResumePreviewProps = {
  resume: ResumeContent;
  template: ResumeTemplateKey;
  /**
   * When set (including `null`), use pdf.js canvas-only preview for compiled LaTeX (Jake).
   * `null` = waiting for first compile; do not fall back to @react-pdf/renderer.
   */
  compiledPdfUrl?: string | null;
  /** When true, shows a compiling overlay (Jake LaTeX path). */
  compiling?: boolean;
};
