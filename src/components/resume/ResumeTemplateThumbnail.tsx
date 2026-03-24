import React from "react";
import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";
import { JOHN_DOE_SAMPLE_CONTENT } from "@/lib/resume/sampleData";

/** Thumbnail preview: prefer real saved content; only use sample when no resume payload. */
export function ResumeTemplateThumbnail(props: {
  template: ResumeTemplateKey;
  resume?: ResumeContent;
  compact?: boolean;
}) {
  const raw = props.resume;
  const sample = JOHN_DOE_SAMPLE_CONTENT;
  const hasPayload = Boolean(raw);

  const name = hasPayload
    ? (raw!.fullName?.trim() || "Untitled resume")
    : sample.fullName;
  const contact = hasPayload ? (raw!.contactLine?.trim() || "") : sample.contactLine;
  const summary = hasPayload ? (raw!.summary?.trim() || "") : sample.summary;

  const emptyEdu = { school: "—", degree: "", start: "", end: "", details: "" };
  const emptyExp = {
    company: "—",
    role: "",
    start: "",
    end: "",
    bullets: ["—"] as string[],
  };
  const emptyProj = { name: "—", link: "", bullets: ["—"] as string[] };

  const education = hasPayload ? raw!.education?.[0] ?? emptyEdu : sample.education[0];
  const experience = hasPayload ? raw!.experience?.[0] ?? emptyExp : sample.experience[0];
  const project = hasPayload ? raw!.projects?.[0] ?? emptyProj : sample.projects[0];
  const skills =
    hasPayload && raw!.skills?.length ? raw!.skills.slice(0, 3) : sample.skills.slice(0, 3);

  const pagePadding = props.compact ? "p-3" : "p-4";

  if (props.template === "harvard_classic") {
    return (
      <div className={`h-full w-full rounded-xl bg-white ${pagePadding} text-black`}>
        <div className="text-[10px] font-bold tracking-[0.01em]">{name}</div>
        <div className="mt-0.5 text-[7px] text-zinc-700">{contact || "—"}</div>
        <div className="mt-2 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-wide">
          Education
        </div>
        <div className="mt-1 text-[7px] font-semibold">{education.school}</div>
        <div className="text-[6px] text-zinc-700">
          {education.degree} | {education.start} - {education.end}
        </div>
        <div className="mt-2 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-wide">
          Experience
        </div>
        <div className="mt-1 text-[7px] font-semibold">
          {experience.role}, {experience.company}
        </div>
        <div className="text-[6px] text-zinc-700">
          {experience.start} - {experience.end}
        </div>
        <div className="mt-1 text-[6px] leading-relaxed text-zinc-800">
          - {experience.bullets[0] ?? "—"}
        </div>
        <div className="mt-1 border-b border-black pb-1 text-[7px] font-semibold uppercase tracking-wide">
          Skills
        </div>
        <div className="mt-1 text-[6px] text-zinc-800">{skills.join(" | ")}</div>
      </div>
    );
  }

  if (props.template === "google_standard") {
    return (
      <div className={`h-full w-full rounded-xl bg-white ${pagePadding} text-black`}>
        <div className="text-center text-[10px] font-semibold">{name}</div>
        <div className="mt-0.5 text-center text-[6px] text-zinc-700">{contact || "—"}</div>
        <div className="mt-2 text-[7px] font-semibold tracking-wide">SUMMARY</div>
        <div className="mt-0.5 h-[1.5px] w-16 rounded bg-sky-500" />
        <div className="mt-1 text-[6px] leading-relaxed text-zinc-800">{summary || "—"}</div>
        <div className="mt-2 text-[7px] font-semibold tracking-wide">EXPERIENCE</div>
        <div className="mt-0.5 h-[1.5px] w-20 rounded bg-sky-500" />
        <div className="mt-1 text-[7px] font-semibold">
          {experience.role} | {experience.company}
        </div>
        <div className="text-[6px] text-zinc-700">
          {experience.start} - {experience.end}
        </div>
        <div className="mt-1 text-[6px] leading-relaxed text-zinc-800">
          - {experience.bullets[0] ?? "—"}
        </div>
      </div>
    );
  }

  if (
    props.template === "mit_latex" ||
    props.template === "mit_stanford_latex" ||
    props.template === "stanford_latex"
  ) {
    return (
      <div className={`h-full w-full rounded-xl bg-white ${pagePadding} text-black`}>
        <div className="text-left text-[10px] font-bold">{name}</div>
        <div className="mt-0.5 text-left text-[6px] text-zinc-700">{contact || "—"}</div>
        <div className="mt-2 border-b border-zinc-900 pb-0.5 text-[7px] font-bold tracking-[0.2em] text-zinc-900">
          EDUCATION
        </div>
        <div className="mt-1 text-[7px] font-semibold">{education.school}</div>
        <div className="text-[6px] text-zinc-700">{education.degree}</div>
        <div className="mt-2 border-b border-zinc-900 pb-0.5 text-[7px] font-bold tracking-[0.2em] text-zinc-900">
          EXPERIENCE
        </div>
        <div className="mt-1 text-[7px] font-semibold">
          {experience.role}, {experience.company}
        </div>
        <div className="mt-1 text-[6px] leading-relaxed text-zinc-800">– {experience.bullets[0] ?? "—"}</div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full rounded-xl bg-white ${pagePadding} text-black`}>
      <div className="text-center text-[10px] font-bold uppercase tracking-wide">{name}</div>
      <div className="mt-0.5 text-center text-[6px] text-zinc-700">{contact || "—"}</div>
      <div className="mt-2 h-px bg-zinc-300" />
      <div className="mt-1 text-[7px] font-semibold uppercase">Education</div>
      <div className="mt-1 text-[7px] font-semibold">{education.school}</div>
      <div className="text-[6px] text-zinc-700">{education.degree}</div>
      <div className="mt-2 h-px bg-zinc-300" />
      <div className="mt-1 text-[7px] font-semibold uppercase">Experience</div>
      <div className="mt-1 text-[7px] font-semibold">
        {experience.role}, {experience.company}
      </div>
      <div className="text-[6px] text-zinc-700">
        {experience.start} - {experience.end}
      </div>
      <div className="mt-1 text-[6px] leading-relaxed text-zinc-800">
        - {experience.bullets[0] ?? "—"}
      </div>
      <div className="mt-2 h-px bg-zinc-300" />
      <div className="mt-1 text-[7px] font-semibold uppercase">Projects</div>
      <div className="mt-1 text-[7px] font-semibold">{project.name}</div>
      <div className="text-[6px] text-zinc-700">{project.link || "—"}</div>
    </div>
  );
}
