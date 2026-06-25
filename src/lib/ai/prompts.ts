import type { ResumeContent, ResumeTemplateKey } from "../db/resumeTypes";

export function rewriteBulletPrompt(args: {
  bullet: string;
  section: "experience" | "project";
  companyOrProject?: string;
  targetRole?: string;
}) {
  const { bullet, section, companyOrProject, targetRole } = args;
  return [
    "Rewrite the following resume bullet to be more compelling and ATS-friendly.",
    "Requirements:",
    "- Keep it to ONE bullet line (no line breaks).",
    "- Start with a strong action verb.",
    "- Keep meaning; improve clarity and impact.",
    "- If you can, add a measurable detail using reasonable estimates (do NOT invent specific numbers if unknown; use placeholders like 'X%' only if provided).",
    "- Avoid fluff and vague adjectives.",
    "",
    `Section: ${section}`,
    companyOrProject ? `Context: ${companyOrProject}` : "",
    targetRole ? `Target role: ${targetRole}` : "",
    "",
    "Bullet to rewrite:",
    bullet,
  ]
    .filter(Boolean)
    .join("\n");
}

export function latexConversionPrompt(args: {
  template: ResumeTemplateKey;
  content: ResumeContent;
}) {
  return [
    "You are generating LaTeX resume content for a resume template.",
    "Output requirements:",
    "- Return ONLY valid LaTeX that can be inserted into a LaTeX resume document body.",
    '- Do NOT include "\\documentclass" or "\\begin{document}" wrappers.',
    "- Use LaTeX structures (sections, itemize) appropriately.",
    "- Keep the content consistent with the provided JSON.",
    "",
    `Template key: ${args.template}`,
    "",
    "Resume JSON:",
    JSON.stringify(args.content, null, 2),
  ].join("\n");
}

export function jakesLatexFromContentPrompt(content: ResumeContent) {
  return [
    "Generate a complete standalone LaTeX resume using the exact Jake Gutierrez template structure.",
    "Use this strict output format:",
    "- Return only complete LaTeX source from \\documentclass to \\end{document}.",
    "- Keep package list, command definitions, spacing macros, and section structure identical to Jake's template.",
    "- Fill values from JSON data below.",
    "- Keep black/white output and ATS-friendly plain text.",
    "- Keep concise one-line bullets when possible.",
    "",
    "JSON data:",
    JSON.stringify(content, null, 2),
    "",
    "Required sections (in order): Heading, Education, Experience, Projects, Technical Skills.",
    "If a section has no items, still include the section with one concise placeholder line.",
  ].join("\n");
}

export function atsSuggestionPrompt(args: {
  jobDescription: string;
  resumeText: string;
}) {
  return `Job Posting:\n${args.jobDescription}\n\nResume:\n${args.resumeText}`;
}
