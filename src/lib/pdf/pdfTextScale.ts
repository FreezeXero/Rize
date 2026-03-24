import type { ResumeContent } from "@/lib/db/resumeTypes";

export type PdfTextScale = NonNullable<ResumeContent["resumeTextScale"]>;

/** Keeps one-page layouts tighter when font ramps up. */
export function getPdfScale(scale: PdfTextScale | undefined) {
  switch (scale ?? "normal") {
    case "small":
      return { font: 0.9, padV: 1.04, padH: 1.02, sectionGap: 1.02, lineTight: 1.02 };
    case "large":
      return { font: 1.08, padV: 0.9, padH: 0.93, sectionGap: 0.82, lineTight: 0.98 };
    default:
      return { font: 1, padV: 1, padH: 1, sectionGap: 1, lineTight: 1 };
  }
}

export function scaleSize(base: number, s: ReturnType<typeof getPdfScale>) {
  return base * s.font;
}
