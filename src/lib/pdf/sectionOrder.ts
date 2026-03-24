import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";

/** Editor + PDF section ids (leadership is PDF-only for Harvard; inserted by resolve). */
export const DEFAULT_MAIN_SECTION_ORDER = [
  "summary",
  "education",
  "experience",
  "projects",
  "skills",
] as const;

export type SectionId = (typeof DEFAULT_MAIN_SECTION_ORDER)[number] | "leadership" | `custom:${number}`;

export function defaultSectionOrder(content: ResumeContent): string[] {
  const n = content.customSections?.length ?? 0;
  const customs = Array.from({ length: n }, (_, i) => `custom:${i}` as const);
  return [...DEFAULT_MAIN_SECTION_ORDER, ...customs];
}

/** Merge stored order with any missing sections (appended). Harvard: insert leadership after projects. */
export function resolveSectionOrder(content: ResumeContent, template?: ResumeTemplateKey): string[] {
  const full = defaultSectionOrder(content);
  const stored = content.sectionOrder?.filter(Boolean) ?? [];
  let out: string[];
  if (stored.length === 0) {
    out = [...full];
  } else {
    const seen = new Set<string>();
    out = [];
    for (const id of stored) {
      if (full.includes(id) && !seen.has(id)) {
        out.push(id);
        seen.add(id);
      }
    }
    for (const id of full) {
      if (!seen.has(id)) out.push(id);
    }
  }

  if (template === "harvard_classic") {
    const pi = out.indexOf("projects");
    if (pi >= 0 && !out.includes("leadership")) {
      out = [...out.slice(0, pi + 1), "leadership", ...out.slice(pi + 1)];
    } else if (!out.includes("leadership")) {
      out.push("leadership");
    }
  } else if (
    (content.leadershipActivities?.length ?? 0) > 0 &&
    template &&
    ["jakes_latex", "mit_latex", "stanford_latex", "mit_stanford_latex", "google_standard"].includes(template) &&
    !out.includes("leadership")
  ) {
    const pi = out.indexOf("projects");
    if (pi >= 0) out = [...out.slice(0, pi + 1), "leadership", ...out.slice(pi + 1)];
    else out.push("leadership");
  }

  return out;
}
