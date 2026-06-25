"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bold, ChevronDown, ChevronUp, Code2, Download, GripVertical, Italic, Loader2, Lock, Pencil, Plus, Sparkles, Trash2, Type, Underline, X } from "lucide-react";
import type { Plan } from "@/lib/plans";
import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";
import { RESUME_TEMPLATES, templateAllowedForPlan } from "@/lib/templates/resumeTemplates";
import { withJohnDoeFallback } from "@/lib/resume/sampleData";
import { ResumePreview } from "@/components/pdf/ResumePreview";
import { ResumeTemplateThumbnail } from "@/components/resume/ResumeTemplateThumbnail";
import { ButtonRow } from "@/components/ui/ButtonRow";
import { SaveStatus } from "@/components/ui/SaveStatus";
import { defaultSectionOrder } from "@/lib/pdf/sectionOrder";
import { buildOfficialJakeLatex } from "@/lib/latex/jakeLatex";

const DEFAULT_BULLETS = ["Describe impact with an action verb and measurable outcome."];

type JakeEditorMode = "latex" | "easy";

function parseSkills(input: string) {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mergeEditorSectionOrder(content: ResumeContent): string[] {
  const hidden = new Set(content.hiddenSections ?? []);
  const full = defaultSectionOrder(content);
  const stored = content.sectionOrder?.filter(Boolean) ?? [];
  let out: string[];
  if (stored.length === 0) {
    out = full;
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
  return out.filter((id) => !hidden.has(id));
}

function stripLatexVisuals(input: string) {
  return input
    .replace(/\\href\{[^}]*\}\{\s*\\underline\{([^}]*)\}\s*\}/g, "$1")
    .replace(/\\underline\{([^}]*)\}/g, "$1")
    .replace(/\\textbf\{([^}]*)\}/g, "$1")
    .replace(/\\emph\{([^}]*)\}/g, "$1")
    .replace(/\\scshape/g, "")
    .replace(/\\small/g, "")
    .replace(/\\Huge/g, "")
    .replace(/\$/g, "")
    .replace(/\\&/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJakeLatexToContent(latex: string, fallback: ResumeContent): ResumeContent {
  const next: ResumeContent = structuredClone(fallback);
  const nameMatch = latex.match(/\\textbf\{\s*\\Huge\s*\\scshape\s*([^}]*)\}/);
  if (nameMatch?.[1]) next.fullName = stripLatexVisuals(nameMatch[1]);

  const centerMatch = latex.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  if (centerMatch?.[1]) {
    const centerClean = stripLatexVisuals(centerMatch[1]).replace(/\s*\|\s*/g, " | ");
    const pipeStart = centerClean.indexOf("|");
    if (pipeStart >= 0) {
      next.contactLine = centerClean.slice(pipeStart >= 0 ? centerClean.lastIndexOf(" ", pipeStart) + 1 : 0).trim();
    }
  }

  const subheadingRegex = /\\resumeSubheading\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/g;
  const subheadings = Array.from(latex.matchAll(subheadingRegex)).map((m) => ({
    a: stripLatexVisuals(m[1]),
    b: stripLatexVisuals(m[2]),
    c: stripLatexVisuals(m[3]),
    d: stripLatexVisuals(m[4]),
    idx: m.index ?? 0,
  }));

  const eduStart = latex.indexOf("\\section{Education}");
  const expStart = latex.indexOf("\\section{Experience}");
  const projStart = latex.indexOf("\\section{Projects}");
  const skillsStart = latex.indexOf("\\section{Technical Skills}");

  if (eduStart >= 0 && expStart > eduStart) {
    const eduItems = subheadings.filter((s) => s.idx > eduStart && s.idx < expStart);
    const eduSection = latex.slice(eduStart, expStart);
    const eduDetails = Array.from(eduSection.matchAll(/\\resumeItem\{([^}]*)\}/g)).map((m) =>
      stripLatexVisuals(m[1])
    );
    if (eduItems.length > 0) {
      next.education = eduItems.map((s, i) => ({
        school: s.a,
        location: s.b,
        degree: s.c,
        start: s.d.split("--")[0]?.trim() ?? "",
        end: s.d.split("--")[1]?.trim() ?? "",
        details: eduDetails[i] ?? "",
      }));
    }
  }

  if (expStart >= 0 && projStart > expStart) {
    const expItems = subheadings.filter((s) => s.idx > expStart && s.idx < projStart);
    const expSection = latex.slice(expStart, projStart);
    const bullets = Array.from(expSection.matchAll(/\\resumeItem\{([^}]*)\}/g)).map((m) =>
      stripLatexVisuals(m[1])
    );
    if (expItems.length > 0) {
      const approxPerJob = Math.max(1, Math.floor(bullets.length / expItems.length));
      next.experience = expItems.map((s, i) => ({
        company: s.c,
        location: s.b,
        role: s.a,
        start: s.d.split("--")[0]?.trim() ?? "",
        end: s.d.split("--")[1]?.trim() ?? "",
        bullets: bullets.slice(i * approxPerJob, i === expItems.length - 1 ? undefined : (i + 1) * approxPerJob),
      }));
    }
  }

  if (projStart >= 0 && skillsStart > projStart) {
    const projSection = latex.slice(projStart, skillsStart);
    const projHeadingRegex = /\\resumeProjectHeading\s*\{([\s\S]*?)\}\s*\{([^}]*)\}/g;
    const projectHeadings = Array.from(projSection.matchAll(projHeadingRegex));
    const projectBullets = Array.from(projSection.matchAll(/\\resumeItem\{([^}]*)\}/g)).map((m) =>
      stripLatexVisuals(m[1])
    );
    if (projectHeadings.length > 0) {
      const approxPerProject = Math.max(1, Math.floor(projectBullets.length / projectHeadings.length));
      next.projects = projectHeadings.map((p, i) => ({
        name: stripLatexVisuals(p[1].split("$|$")[0] ?? p[1]),
        link: "",
        bullets: projectBullets.slice(
          i * approxPerProject,
          i === projectHeadings.length - 1 ? undefined : (i + 1) * approxPerProject
        ),
      }));
    }
  }

  if (skillsStart >= 0) {
    const skillSection = latex.slice(skillsStart);
    const skillLines = Array.from(skillSection.matchAll(/\\textbf\{([^}]*)\}\{:\s*([^}]*)\}/g)).map(
      (m) => `${stripLatexVisuals(m[1])}: ${stripLatexVisuals(m[2])}`
    );
    if (skillLines.length > 0) next.skills = skillLines;
  }

  next.latexSource = latex;
  return withJohnDoeFallback(next);
}

export default function ResumeEditor(props: {
  userPlan: Plan;
  resumeId: string;
  initialResume: ResumeContent;
  initialTemplate: ResumeTemplateKey;
  initialTitle: string;
  initialAiLatexUses: number;
  initialWeeklyAIRewrites: number;
}) {
  const [title, setTitle] = useState(props.initialTitle);
  const [template, setTemplate] = useState<ResumeTemplateKey>(props.initialTemplate);
  const [content, setContent] = useState<ResumeContent>(() => withJohnDoeFallback(props.initialResume));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "saving">("idle");
  const [jakeEditorMode, setJakeEditorMode] = useState<JakeEditorMode>("easy");
  const [isConvertingLatex, setIsConvertingLatex] = useState(false);
  const [compiledJakePdfUrl, setCompiledJakePdfUrl] = useState<string | null>(null);
  const [compiledJakeBlob, setCompiledJakeBlob] = useState<Blob | null>(null);
  const [jakeCompileError, setJakeCompileError] = useState<string | null>(null);
  const [aiLatexUses, setAiLatexUses] = useState(props.initialAiLatexUses ?? 0);
  const [editingSectionTitleId, setEditingSectionTitleId] = useState<string | null>(null);
  const [editingSectionTitleDraft, setEditingSectionTitleDraft] = useState("");
  const [weeklyAIRewrites, setWeeklyAIRewrites] = useState(props.initialWeeklyAIRewrites ?? 0);
  const [rewritingBulletKey, setRewritingBulletKey] = useState<string | null>(null);
  const selectionRef = useRef<{
    el: HTMLTextAreaElement;
    fieldType: "exp" | "proj";
    idx: number;
    bIdx: number;
    start: number;
    end: number;
    value: string;
  } | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const isJakeTemplate = template === "jakes_latex";
  const canUseEasyJakeMode = isJakeTemplate;

  const weeklyRewriteLimit = props.userPlan === "max" ? null : props.userPlan === "pro" ? 100 : 10;
  const isFreeAiLatexLocked = props.userPlan === "free" && aiLatexUses >= 1;

  const previewResume = useMemo(() => withJohnDoeFallback(content), [content]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function saveToServer(nextContent?: ResumeContent) {
    const payload = nextContent ?? content;
    setSaving(true);
    setSaveError(null);
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/resumes/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          resumeId: props.resumeId,
          title,
          template,
          content: payload,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Failed to save");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Save failed";
      setSaveError(message);
      setSaveStatus("idle");
    } finally {
      setSaving(false);
    }
  }

  async function exportPdf() {
    if (isJakeTemplate) {
      const source = content.latexSource?.trim();
      if (!source) throw new Error("No LaTeX source available to export.");
      const blob = compiledJakeBlob ?? (await compileJakeLatexToPdf(source));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/\s+/g, "_") || "resume"}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return;
    }

    const res = await fetch("/api/export/pdf", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeId: props.resumeId }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error ?? "Export failed");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_") || "resume"}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function runAILatexConversion() {
    try {
      setIsConvertingLatex(true);
      const res = await fetch("/api/ai/latex-convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template, content }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        latexSource?: string;
        error?: string;
        lockUpgrade?: boolean;
      };
      if (!res.ok || !json.latexSource) {
        throw new Error(json.error ?? "AI LaTeX conversion failed.");
      }
      setAiLatexUses((n) => n + 1);
      setJakeCompileError(null);
      setContent((prev) => ({ ...prev, latexSource: json.latexSource ?? prev.latexSource }));
      await refreshJakeCompiledPreview(json.latexSource);
      setJakeEditorMode("latex");
    } catch (err: unknown) {
      setJakeCompileError(err instanceof Error ? err.message : "AI LaTeX conversion failed.");
    } finally {
      setIsConvertingLatex(false);
    }
  }

  async function goToProCheckout() {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan: "pro", billingCycle: "monthly" }),
    });
    const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (!res.ok || !json.url) {
      throw new Error(json.error ?? "Unable to open checkout.");
    }
    window.location.href = json.url;
  }

  const resolveSectionTitle = useCallback(
    (sectionId: string, fallback: string) => {
      const raw = content.sectionTitles?.[sectionId];
      return typeof raw === "string" && raw.trim() ? raw.trim() : fallback;
    },
    [content.sectionTitles]
  );

  function beginSectionTitleEdit(sectionId: string, fallback: string) {
    setEditingSectionTitleId(sectionId);
    setEditingSectionTitleDraft(resolveSectionTitle(sectionId, fallback));
  }

  function saveSectionTitle(sectionId: string) {
    const nextTitle = editingSectionTitleDraft.trim();
    setContent((prev) => {
      const n = structuredClone(prev);
      n.sectionTitles = { ...(n.sectionTitles ?? {}) };
      if (!nextTitle) {
        delete n.sectionTitles[sectionId];
      } else {
        n.sectionTitles[sectionId] = nextTitle;
      }
      return n;
    });
    setEditingSectionTitleId(null);
  }

  const compileJakeLatexToPdf = useCallback(async (latexSource: string) => {
    const res = await fetch("/api/latex/compile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ latexSource }),
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(json.error ?? "Failed to compile LaTeX.");
    }
    return await res.blob();
  }, []);

  const refreshJakeCompiledPreview = useCallback(async (latexSource: string) => {
    setJakeCompileError(null);
    const blob = await compileJakeLatexToPdf(latexSource);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    setCompiledJakeBlob(blob);
    setCompiledJakePdfUrl(url);
  }, [compileJakeLatexToPdf]);

  useEffect(() => {
    if (!isJakeTemplate) return;
    if ((content.latexSource ?? "").trim()) return;
    const seeded = buildOfficialJakeLatex(content);
    setContent((prev) => ({ ...prev, latexSource: seeded }));
  }, [isJakeTemplate, content]);

  async function rewriteBullet(args: {
    section: "experience" | "project";
    index: number;
    bulletIndex: number;
    context: string;
    currentBullet: string;
  }) {
    const bulletKey = `${args.section}-${args.index}-${args.bulletIndex}`;
    setRewritingBulletKey(bulletKey);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          bullet: args.currentBullet,
          section: args.section,
          context: args.context,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "AI rewrite failed");
      const rewritten = String(json.rewrittenBullet ?? "");
      if (!rewritten) throw new Error("Claude returned an empty rewrite.");

      setWeeklyAIRewrites((n) => n + 1);
      setContent((prev) => {
        const next = structuredClone(prev);
        if (args.section === "experience") {
          next.experience[args.index].bullets[args.bulletIndex] = rewritten;
        } else {
          next.projects[args.index].bullets[args.bulletIndex] = rewritten;
        }
        return next;
      });
    } finally {
      setRewritingBulletKey(null);
    }
  }

  // Easy mode: keep official Jake template source synced from form data.
  useEffect(() => {
    if (!isJakeTemplate || !canUseEasyJakeMode || jakeEditorMode !== "easy") return;
    const handle = window.setTimeout(async () => {
      try {
        setIsConvertingLatex(true);
        const latex = buildOfficialJakeLatex(content);
        setContent((prev) => (prev.latexSource === latex ? prev : { ...prev, latexSource: latex }));
        await refreshJakeCompiledPreview(latex);
      } catch (err: unknown) {
        setJakeCompileError(err instanceof Error ? err.message : "Jake preview generation failed.");
      } finally {
        setIsConvertingLatex(false);
      }
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [isJakeTemplate, canUseEasyJakeMode, jakeEditorMode, content, refreshJakeCompiledPreview]);

  // Raw LaTeX mode: compile as user types.
  useEffect(() => {
    if (!isJakeTemplate || jakeEditorMode !== "latex") return;
    const source = content.latexSource?.trim();
    if (!source) {
      setCompiledJakePdfUrl(null);
      setCompiledJakeBlob(null);
      return;
    }
    const handle = window.setTimeout(async () => {
      try {
        setIsConvertingLatex(true);
        await refreshJakeCompiledPreview(source);
      } catch (err: unknown) {
        setJakeCompileError(err instanceof Error ? err.message : "Jake compilation failed.");
      } finally {
        setIsConvertingLatex(false);
      }
    }, 1500);
    return () => window.clearTimeout(handle);
  }, [isJakeTemplate, jakeEditorMode, content.latexSource, refreshJakeCompiledPreview]);

  function removeEducation(index: number) {
    setContent((prev) => {
      if (prev.education.length <= 1) return prev;
      const next = structuredClone(prev);
      next.education.splice(index, 1);
      return next;
    });
  }

  function removeExperience(index: number) {
    setContent((prev) => {
      const next = structuredClone(prev);
      next.experience.splice(index, 1);
      return next;
    });
  }

  function removeProject(index: number) {
    setContent((prev) => {
      const next = structuredClone(prev);
      next.projects.splice(index, 1);
      return next;
    });
  }

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.setData("application/x-section-id", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOverCard = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropOn = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const dragId = e.dataTransfer.getData("application/x-section-id");
    if (!dragId || dragId === targetId) return;
    setContent((prev) => {
      const order = mergeEditorSectionOrder(prev);
      const from = order.indexOf(dragId);
      const to = order.indexOf(targetId);
      if (from < 0 || to < 0) return prev;
      const nextOrder = [...order];
      nextOrder.splice(from, 1);
      nextOrder.splice(to, 0, dragId);
      return { ...prev, sectionOrder: nextOrder };
    });
  };

  function addCustomSection() {
    setContent((prev) => ({
      ...prev,
      customSections: [...(prev.customSections ?? []), { title: "New section", body: "", bullets: [] }],
      sectionOrder: undefined,
    }));
  }

  function hideSection(sectionId: string) {
    setContent((prev) => ({
      ...prev,
      hiddenSections: [...(prev.hiddenSections ?? []).filter((id) => id !== sectionId), sectionId],
    }));
  }

  function restoreSection(sectionId: string) {
    setContent((prev) => ({
      ...prev,
      hiddenSections: (prev.hiddenSections ?? []).filter((id) => id !== sectionId),
    }));
  }

  function applyFormat(fmt: "bold" | "italic" | "underline" | "mono" | "smallcaps") {
    const sel = selectionRef.current;
    if (!sel) return;
    const { el, fieldType, idx, bIdx, start, end, value } = sel;

    const commands: Record<string, string> = {
      bold: "\\textbf",
      italic: "\\textit",
      underline: "\\underline",
      mono: "\\texttt",
      smallcaps: "\\textsc",
    };
    const cmd = commands[fmt] ?? "\\textbf";
    const selected = value.slice(start, end) || "text";
    const replacement = `${cmd}{${selected}}`;
    const next = value.slice(0, start) + replacement + value.slice(end);

    setContent((prev) => {
      const n = structuredClone(prev);
      if (fieldType === "exp") {
        n.experience[idx].bullets[bIdx] = next;
      } else {
        n.projects[idx].bullets[bIdx] = next;
      }
      return n;
    });

    // After React flushes the update, restore focus and cursor position.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + replacement.length, start + replacement.length);
    });
  }

  function removeCustomSection(index: number) {
    if (!confirm("Remove this custom section?")) return;
    setContent((prev) => {
      const next = structuredClone(prev);
      next.customSections = (next.customSections ?? []).filter((_, i) => i !== index);
      next.sectionOrder = undefined;
      return next;
    });
  }

  return (
    <div className="h-[calc(100vh-76px)] w-full overflow-hidden rounded-none border border-white/10 bg-white/5 p-2 md:p-3">
      <div className="grid h-full min-w-0 gap-3 lg:grid-cols-[2fr_3fr]">
        {/* Left panel: single scrollable column */}
        <div className="h-full min-w-0 overflow-y-auto pr-1">
          <div className="flex flex-col gap-4 pb-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="grid gap-1">
                  <div className="text-sm text-zinc-300">Resume title</div>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-cyan-300/50"
                  />
                </div>
                <ButtonRow
                  onSave={() => saveToServer()}
                  onExport={async () => {
                    try {
                      await exportPdf();
                    } catch (err: unknown) {
                      alert(err instanceof Error ? err.message : "Export failed");
                    }
                  }}
                  saving={saving}
                />
              </div>
              <SaveStatus status={saveStatus} error={saveError} />
            </div>

            {/* Formatting toolbar — sticky inside the scrollable column */}
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
              <span className="mr-1 text-xs text-zinc-500">Format:</span>
              {(
                [
                  { fmt: "bold" as const, icon: <Bold size={13} />, label: "Bold (\\textbf{})" },
                  { fmt: "italic" as const, icon: <Italic size={13} />, label: "Italic (\\textit{})" },
                  { fmt: "underline" as const, icon: <Underline size={13} />, label: "Underline (\\underline{})" },
                  { fmt: "mono" as const, icon: <Type size={13} />, label: "Monospace (\\texttt{})" },
                ] as const
              ).map(({ fmt, icon, label }) => (
                <button
                  key={fmt}
                  type="button"
                  title={label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFormat(fmt);
                  }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-zinc-300 hover:border-cyan-300/40 hover:text-cyan-100"
                >
                  {icon}
                </button>
              ))}
              <span className="ml-2 text-[10px] text-zinc-600">Select text in a bullet, then click</span>
            </div>

            {isJakeTemplate ? (
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">Jake&apos;s Resume editor</div>
                    <div className="mt-1 text-xs text-zinc-400">Switch between Easy mode and raw LaTeX editing.</div>
                  </div>
                  {canUseEasyJakeMode ? (
                    <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-1">
                      <button
                        type="button"
                        onClick={() => setJakeEditorMode("easy")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          jakeEditorMode === "easy"
                            ? "bg-cyan-300/20 text-cyan-100"
                            : "text-zinc-300"
                        }`}
                      >
                        Easy mode
                      </button>
                      <button
                        type="button"
                        onClick={() => setJakeEditorMode("latex")}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                          jakeEditorMode === "latex"
                            ? "bg-cyan-300/20 text-cyan-100"
                            : "text-zinc-300"
                        }`}
                      >
                        LaTeX mode
                      </button>
                    </div>
                  ) : null}
                </div>

                {jakeEditorMode === "latex" ? (
                  <>
                    <div className="mt-3">
                      {isFreeAiLatexLocked ? (
                        <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                          Upgrade to Pro to keep using AI LaTeX conversion.
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await goToProCheckout();
                                } catch (err: unknown) {
                                  alert(err instanceof Error ? err.message : "Unable to open checkout.");
                                }
                              }}
                              className="inline-flex items-center rounded-lg border border-amber-300/40 px-2 py-1 text-[11px] font-semibold text-amber-100 hover:bg-amber-300/10"
                            >
                              Upgrade
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => runAILatexConversion()}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/15"
                        >
                          <Sparkles size={12} />
                          AI LaTeX conversion
                        </button>
                      )}
                    </div>
                    <textarea
                      value={content.latexSource ?? ""}
                      onChange={(e) =>
                        setContent((prev) => parseJakeLatexToContent(e.target.value, prev))
                      }
                      rows={14}
                      className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-xs text-white outline-none focus:border-cyan-300/50"
                      placeholder="% Paste or edit Jake's LaTeX source here"
                    />
                    <div className="mt-2 text-xs text-zinc-500">
                      Live preview compiles this exact LaTeX through latex.ytotech.com.
                    </div>
                  </>
                ) : (
                  <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-300/5 px-3 py-2 text-xs text-cyan-100">
                    Easy mode auto-generates Jake-style LaTeX from your form inputs as you type.
                    {isConvertingLatex ? " Updating LaTeX..." : ""}
                  </div>
                )}
                {jakeCompileError ? (
                  <div className="mt-2 text-xs text-red-300">{jakeCompileError}</div>
                ) : null}
              </div>
            ) : null}

            {(jakeEditorMode === "easy" || !isJakeTemplate) && (
              <>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-semibold text-white">Header</div>
                  <div className="mt-3 grid gap-3">
                    <input
                      value={content.fullName}
                      onChange={(e) => setContent((prev) => ({ ...prev, fullName: e.target.value }))}
                      className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-cyan-300/50"
                      placeholder="Full name"
                    />
                    <input
                      value={content.contactLine}
                      onChange={(e) => setContent((prev) => ({ ...prev, contactLine: e.target.value }))}
                      className="h-11 rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-cyan-300/50"
                      placeholder="(555) 123-4567 | email | linkedin | github"
                    />
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="text-sm font-semibold text-white">PDF text size</div>
                  <div className="mt-2 inline-flex flex-wrap gap-0.5 rounded-xl border border-white/10 bg-black/30 p-1">
                    {(["small", "normal", "large"] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setContent((prev) => ({ ...prev, resumeTextScale: sz }))}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                          (content.resumeTextScale ?? "normal") === sz
                            ? "bg-cyan-300/20 text-cyan-100"
                            : "text-zinc-300"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {mergeEditorSectionOrder(content).map((sectionId) => (
                  <div
                    key={sectionId}
                    className="flex gap-2"
                    onDragOver={handleDragOverCard}
                    onDrop={handleDropOn(sectionId)}
                  >
                    <button
                      type="button"
                      draggable
                      onDragStart={handleDragStart(sectionId)}
                      className="mt-1 h-9 shrink-0 cursor-grab select-none rounded-lg border border-white/10 bg-black/30 p-1 text-zinc-400 hover:text-white"
                      aria-label="Drag to reorder section"
                    >
                      <GripVertical size={16} />
                    </button>
                    <div className="min-w-0 flex-1">
                      {sectionId === "summary" ? (
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <div className="flex items-center gap-2">
                            {editingSectionTitleId === "summary" ? (
                              <input
                                value={editingSectionTitleDraft}
                                onChange={(e) => setEditingSectionTitleDraft(e.target.value)}
                                onBlur={() => saveSectionTitle("summary")}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveSectionTitle("summary");
                                }}
                                autoFocus
                                className="h-8 rounded-lg border border-white/10 bg-black/30 px-2 text-sm font-semibold text-white"
                              />
                            ) : (
                              <>
                                <div className="text-sm font-semibold text-white">
                                  {resolveSectionTitle("summary", "Summary")}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => beginSectionTitleEdit("summary", "Summary")}
                                  className="rounded-md border border-white/10 p-1 text-zinc-300 hover:text-white"
                                  aria-label="Rename summary section"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { if (confirm("Hide the Summary section?")) hideSection("summary"); }}
                                  className="rounded-md border border-red-500/30 p-1 text-red-400 hover:bg-red-500/10"
                                  title="Hide section"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                          <textarea
                            value={content.summary ?? ""}
                            onChange={(e) => setContent((prev) => ({ ...prev, summary: e.target.value }))}
                            rows={4}
                            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
                            placeholder="Professional summary"
                          />
                        </div>
                      ) : null}

                      {sectionId === "education" ? (
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <div className="flex items-center gap-2">
                            {editingSectionTitleId === "education" ? (
                              <input
                                value={editingSectionTitleDraft}
                                onChange={(e) => setEditingSectionTitleDraft(e.target.value)}
                                onBlur={() => saveSectionTitle("education")}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveSectionTitle("education");
                                }}
                                autoFocus
                                className="h-8 rounded-lg border border-white/10 bg-black/30 px-2 text-sm font-semibold text-white"
                              />
                            ) : (
                              <>
                                <div className="text-sm font-semibold text-white">
                                  {resolveSectionTitle("education", "Education")}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => beginSectionTitleEdit("education", "Education")}
                                  className="rounded-md border border-white/10 p-1 text-zinc-300 hover:text-white"
                                  aria-label="Rename education section"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { if (confirm("Hide the Education section?")) hideSection("education"); }}
                                  className="rounded-md border border-red-500/30 p-1 text-red-400 hover:bg-red-500/10"
                                  aria-label="Hide education section"
                                  title="Hide section"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                          <div className="mt-2 text-xs text-zinc-500">At least one education entry is required.</div>
                          <div className="mt-3 grid gap-3">
                            {content.education.map((ed, idx) => (
                              <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3">
                                <div className="mb-2 flex justify-end">
                                  <button
                                    type="button"
                                    disabled={content.education.length <= 1}
                                    onClick={() => {
                                      if (content.education.length <= 1) return;
                                      if (!confirm("Remove this education entry?")) return;
                                      removeEducation(idx);
                                    }}
                                    className="rounded-md border border-white/10 p-1 text-zinc-300 disabled:opacity-40"
                                    aria-label="Delete education"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                  <input
                                    value={ed.school}
                                    onChange={(e) =>
                                      setContent((prev) => {
                                        const n = structuredClone(prev);
                                        n.education[idx].school = e.target.value;
                                        return n;
                                      })
                                    }
                                    className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                    placeholder="School"
                                  />
                                  <input
                                    value={ed.degree}
                                    onChange={(e) =>
                                      setContent((prev) => {
                                        const n = structuredClone(prev);
                                        n.education[idx].degree = e.target.value;
                                        return n;
                                      })
                                    }
                                    className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                    placeholder="Degree"
                                  />
                                  {ed.start !== undefined ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={ed.start ?? ""}
                                        onChange={(e) =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            n.education[idx].start = e.target.value;
                                            return n;
                                          })
                                        }
                                        className="h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                        placeholder="Start"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            delete n.education[idx].start;
                                            return n;
                                          })
                                        }
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/40 text-red-400"
                                        aria-label="Remove start date"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setContent((prev) => {
                                          const n = structuredClone(prev);
                                          n.education[idx].start = "";
                                          return n;
                                        })
                                      }
                                      className="h-10 rounded-lg border border-dashed border-white/20 px-3 text-xs text-zinc-300"
                                    >
                                      Add date
                                    </button>
                                  )}
                                  {ed.end !== undefined ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={ed.end ?? ""}
                                        onChange={(e) =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            n.education[idx].end = e.target.value;
                                            return n;
                                          })
                                        }
                                        className="h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                        placeholder="End"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            delete n.education[idx].end;
                                            return n;
                                          })
                                        }
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/40 text-red-400"
                                        aria-label="Remove end date"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setContent((prev) => {
                                          const n = structuredClone(prev);
                                          n.education[idx].end = "";
                                          return n;
                                        })
                                      }
                                      className="h-10 rounded-lg border border-dashed border-white/20 px-3 text-xs text-zinc-300"
                                    >
                                      Add date
                                    </button>
                                  )}
                                </div>
                                <input
                                  value={ed.details}
                                  onChange={(e) =>
                                    setContent((prev) => {
                                      const n = structuredClone(prev);
                                      n.education[idx].details = e.target.value;
                                      return n;
                                    })
                                  }
                                  className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                  placeholder="Details"
                                />
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setContent((prev) => ({
                                ...prev,
                                education: [...prev.education, { school: "", degree: "", start: "", end: "", details: "" }],
                              }))
                            }
                            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-200"
                          >
                            <Plus size={14} />
                            Add education
                          </button>
                        </div>
                      ) : null}

                      {sectionId === "experience" ? (
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {editingSectionTitleId === "experience" ? (
                                <input
                                  value={editingSectionTitleDraft}
                                  onChange={(e) => setEditingSectionTitleDraft(e.target.value)}
                                  onBlur={() => saveSectionTitle("experience")}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveSectionTitle("experience");
                                  }}
                                  autoFocus
                                  className="h-8 rounded-lg border border-white/10 bg-black/30 px-2 text-sm font-semibold text-white"
                                />
                              ) : (
                                <>
                                  <div className="text-sm font-semibold text-white">
                                    {resolveSectionTitle("experience", "Experience")}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => beginSectionTitleEdit("experience", "Experience")}
                                    className="rounded-md border border-white/10 p-1 text-zinc-300 hover:text-white"
                                    aria-label="Rename experience section"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { if (confirm("Hide the Experience section?")) hideSection("experience"); }}
                                    className="rounded-md border border-red-500/30 p-1 text-red-400 hover:bg-red-500/10"
                                    aria-label="Hide experience section"
                                    title="Hide section"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setContent((prev) => ({
                                  ...prev,
                                  experience: [
                                    ...prev.experience,
                                    { company: "", role: "", start: "", end: "", bullets: [...DEFAULT_BULLETS] },
                                  ],
                                }))
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
                            >
                              <Plus size={14} />
                              Add
                            </button>
                          </div>
                          <div className="mt-3 grid gap-3">
                            {content.experience.map((exp, idx) => (
                              <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3">
                                <div className="mb-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!confirm("Remove this experience entry?")) return;
                                      removeExperience(idx);
                                    }}
                                    className="rounded-md border border-white/10 p-1 text-zinc-300"
                                    aria-label="Delete experience"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                  <input
                                    value={exp.company}
                                    onChange={(e) =>
                                      setContent((prev) => {
                                        const n = structuredClone(prev);
                                        n.experience[idx].company = e.target.value;
                                        return n;
                                      })
                                    }
                                    className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                    placeholder="Company"
                                  />
                                  <input
                                    value={exp.role}
                                    onChange={(e) =>
                                      setContent((prev) => {
                                        const n = structuredClone(prev);
                                        n.experience[idx].role = e.target.value;
                                        return n;
                                      })
                                    }
                                    className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                    placeholder="Role"
                                  />
                                </div>
                                <div className="mt-2 grid gap-2 md:grid-cols-2">
                                  {exp.start !== undefined ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={exp.start ?? ""}
                                        onChange={(e) =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            n.experience[idx].start = e.target.value;
                                            return n;
                                          })
                                        }
                                        className="h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                        placeholder="Start"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            delete n.experience[idx].start;
                                            return n;
                                          })
                                        }
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/40 text-red-400"
                                        aria-label="Remove start date"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setContent((prev) => {
                                          const n = structuredClone(prev);
                                          n.experience[idx].start = "";
                                          return n;
                                        })
                                      }
                                      className="h-10 rounded-lg border border-dashed border-white/20 px-3 text-xs text-zinc-300"
                                    >
                                      Add date
                                    </button>
                                  )}
                                  {exp.end !== undefined ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        value={exp.end ?? ""}
                                        onChange={(e) =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            n.experience[idx].end = e.target.value;
                                            return n;
                                          })
                                        }
                                        className="h-10 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                        placeholder="End"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            delete n.experience[idx].end;
                                            return n;
                                          })
                                        }
                                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/40 text-red-400"
                                        aria-label="Remove end date"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setContent((prev) => {
                                          const n = structuredClone(prev);
                                          n.experience[idx].end = "";
                                          return n;
                                        })
                                      }
                                      className="h-10 rounded-lg border border-dashed border-white/20 px-3 text-xs text-zinc-300"
                                    >
                                      Add date
                                    </button>
                                  )}
                                </div>
                                <div className="mt-2 grid gap-2">
                                  {weeklyRewriteLimit !== null && (
                                    <div className="text-[11px] text-zinc-500">
                                      {weeklyAIRewrites}/{weeklyRewriteLimit} AI rewrites used this week
                                    </div>
                                  )}
                                  {exp.bullets.map((b, bIdx) => (
                                    <div key={bIdx} className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            n.experience[idx].bullets.splice(bIdx, 1);
                                            return n;
                                          })
                                        }
                                        className="inline-flex h-10 shrink-0 items-center rounded-lg border border-red-500/40 px-2 text-red-400 hover:bg-red-500/10"
                                        aria-label="Remove bullet"
                                      >
                                        <X size={14} />
                                      </button>
                                      <div className="flex shrink-0 flex-col gap-0.5 self-center">
                                        <button
                                          type="button"
                                          disabled={bIdx === 0}
                                          onClick={() =>
                                            setContent((prev) => {
                                              const n = structuredClone(prev);
                                              const arr = n.experience[idx].bullets;
                                              if (bIdx <= 0) return prev;
                                              [arr[bIdx - 1], arr[bIdx]] = [arr[bIdx], arr[bIdx - 1]];
                                              return n;
                                            })
                                          }
                                          className="rounded border border-white/10 p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                          aria-label="Move bullet up"
                                        >
                                          <ChevronUp size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={bIdx >= exp.bullets.length - 1}
                                          onClick={() =>
                                            setContent((prev) => {
                                              const n = structuredClone(prev);
                                              const arr = n.experience[idx].bullets;
                                              if (bIdx >= arr.length - 1) return prev;
                                              [arr[bIdx], arr[bIdx + 1]] = [arr[bIdx + 1], arr[bIdx]];
                                              return n;
                                            })
                                          }
                                          className="rounded border border-white/10 p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                          aria-label="Move bullet down"
                                        >
                                          <ChevronDown size={14} />
                                        </button>
                                      </div>
                                      <div className="relative flex-1">
                                        <textarea
                                          rows={2}
                                          value={b}
                                          onSelect={(e) => {
                                            const el = e.currentTarget;
                                            selectionRef.current = { el, fieldType: "exp", idx, bIdx, start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0, value: el.value };
                                          }}
                                          onKeyUp={(e) => {
                                            const el = e.currentTarget;
                                            selectionRef.current = { el, fieldType: "exp", idx, bIdx, start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0, value: el.value };
                                          }}
                                          onChange={(e) =>
                                            setContent((prev) => {
                                              const n = structuredClone(prev);
                                              n.experience[idx].bullets[bIdx] = e.target.value;
                                              return n;
                                            })
                                          }
                                          disabled={rewritingBulletKey === `experience-${idx}-${bIdx}`}
                                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm disabled:opacity-50"
                                        />
                                        {rewritingBulletKey === `experience-${idx}-${bIdx}` && (
                                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                                            <Loader2 size={16} className="animate-spin text-violet-300" />
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        title="AI Rewrite"
                                        disabled={rewritingBulletKey !== null}
                                        onClick={async () => {
                                          try {
                                            await rewriteBullet({
                                              section: "experience",
                                              index: idx,
                                              bulletIndex: bIdx,
                                              context: exp.company || "your role",
                                              currentBullet: b,
                                            });
                                          } catch (err) {
                                            alert(err instanceof Error ? err.message : "Rewrite failed");
                                          }
                                        }}
                                        className="inline-flex h-10 items-center rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 text-violet-300 hover:bg-violet-400/20 disabled:opacity-40"
                                      >
                                        <Sparkles size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setContent((prev) => {
                                      const n = structuredClone(prev);
                                      n.experience[idx].bullets.push("");
                                      return n;
                                    })
                                  }
                                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs"
                                >
                                  <Plus size={12} />
                                  Add bullet
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {sectionId === "projects" ? (
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {editingSectionTitleId === "projects" ? (
                                <input
                                  value={editingSectionTitleDraft}
                                  onChange={(e) => setEditingSectionTitleDraft(e.target.value)}
                                  onBlur={() => saveSectionTitle("projects")}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveSectionTitle("projects");
                                  }}
                                  autoFocus
                                  className="h-8 rounded-lg border border-white/10 bg-black/30 px-2 text-sm font-semibold text-white"
                                />
                              ) : (
                                <>
                                  <div className="text-sm font-semibold text-white">
                                    {resolveSectionTitle("projects", "Projects")}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => beginSectionTitleEdit("projects", "Projects")}
                                    className="rounded-md border border-white/10 p-1 text-zinc-300 hover:text-white"
                                    aria-label="Rename projects section"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { if (confirm("Hide the Projects section?")) hideSection("projects"); }}
                                    className="rounded-md border border-red-500/30 p-1 text-red-400 hover:bg-red-500/10"
                                    aria-label="Hide projects section"
                                    title="Hide section"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setContent((prev) => ({
                                  ...prev,
                                  projects: [...prev.projects, { name: "", link: "", bullets: [...DEFAULT_BULLETS] }],
                                }))
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
                            >
                              <Plus size={14} />
                              Add
                            </button>
                          </div>
                          <div className="mt-3 grid gap-3">
                            {content.projects.map((p, idx) => (
                              <div key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3">
                                <div className="mb-2 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!confirm("Remove this project entry?")) return;
                                      removeProject(idx);
                                    }}
                                    className="rounded-md border border-white/10 p-1 text-zinc-300"
                                    aria-label="Delete project"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className="grid gap-2 md:grid-cols-2">
                                  <input
                                    value={p.name}
                                    onChange={(e) =>
                                      setContent((prev) => {
                                        const n = structuredClone(prev);
                                        n.projects[idx].name = e.target.value;
                                        return n;
                                      })
                                    }
                                    className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                    placeholder="Project"
                                  />
                                  <input
                                    value={p.link}
                                    onChange={(e) =>
                                      setContent((prev) => {
                                        const n = structuredClone(prev);
                                        n.projects[idx].link = e.target.value;
                                        return n;
                                      })
                                    }
                                    className="h-10 rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                    placeholder="Link"
                                  />
                                </div>
                                <div className="mt-2 grid gap-2">
                                  {weeklyRewriteLimit !== null && (
                                    <div className="text-[11px] text-zinc-500">
                                      {weeklyAIRewrites}/{weeklyRewriteLimit} AI rewrites used this week
                                    </div>
                                  )}
                                  {p.bullets.map((b, bIdx) => (
                                    <div key={bIdx} className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setContent((prev) => {
                                            const n = structuredClone(prev);
                                            n.projects[idx].bullets.splice(bIdx, 1);
                                            return n;
                                          })
                                        }
                                        className="inline-flex h-10 shrink-0 items-center rounded-lg border border-red-500/40 px-2 text-red-400 hover:bg-red-500/10"
                                        aria-label="Remove bullet"
                                      >
                                        <X size={14} />
                                      </button>
                                      <div className="flex shrink-0 flex-col gap-0.5 self-center">
                                        <button
                                          type="button"
                                          disabled={bIdx === 0}
                                          onClick={() =>
                                            setContent((prev) => {
                                              const n = structuredClone(prev);
                                              const arr = n.projects[idx].bullets;
                                              if (bIdx <= 0) return prev;
                                              [arr[bIdx - 1], arr[bIdx]] = [arr[bIdx], arr[bIdx - 1]];
                                              return n;
                                            })
                                          }
                                          className="rounded border border-white/10 p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                          aria-label="Move bullet up"
                                        >
                                          <ChevronUp size={14} />
                                        </button>
                                        <button
                                          type="button"
                                          disabled={bIdx >= p.bullets.length - 1}
                                          onClick={() =>
                                            setContent((prev) => {
                                              const n = structuredClone(prev);
                                              const arr = n.projects[idx].bullets;
                                              if (bIdx >= arr.length - 1) return prev;
                                              [arr[bIdx], arr[bIdx + 1]] = [arr[bIdx + 1], arr[bIdx]];
                                              return n;
                                            })
                                          }
                                          className="rounded border border-white/10 p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                                          aria-label="Move bullet down"
                                        >
                                          <ChevronDown size={14} />
                                        </button>
                                      </div>
                                      <div className="relative flex-1">
                                        <textarea
                                          rows={2}
                                          value={b}
                                          onSelect={(e) => {
                                            const el = e.currentTarget;
                                            selectionRef.current = { el, fieldType: "proj", idx, bIdx, start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0, value: el.value };
                                          }}
                                          onKeyUp={(e) => {
                                            const el = e.currentTarget;
                                            selectionRef.current = { el, fieldType: "proj", idx, bIdx, start: el.selectionStart ?? 0, end: el.selectionEnd ?? 0, value: el.value };
                                          }}
                                          onChange={(e) =>
                                            setContent((prev) => {
                                              const n = structuredClone(prev);
                                              n.projects[idx].bullets[bIdx] = e.target.value;
                                              return n;
                                            })
                                          }
                                          disabled={rewritingBulletKey === `project-${idx}-${bIdx}`}
                                          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm disabled:opacity-50"
                                        />
                                        {rewritingBulletKey === `project-${idx}-${bIdx}` && (
                                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                                            <Loader2 size={16} className="animate-spin text-violet-300" />
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        type="button"
                                        title="AI Rewrite"
                                        disabled={rewritingBulletKey !== null}
                                        onClick={async () => {
                                          try {
                                            await rewriteBullet({
                                              section: "project",
                                              index: idx,
                                              bulletIndex: bIdx,
                                              context: p.name || "project",
                                              currentBullet: b,
                                            });
                                          } catch (err) {
                                            alert(err instanceof Error ? err.message : "Rewrite failed");
                                          }
                                        }}
                                        className="inline-flex h-10 items-center rounded-lg border border-violet-400/30 bg-violet-400/10 px-3 text-violet-300 hover:bg-violet-400/20 disabled:opacity-40"
                                      >
                                        <Sparkles size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setContent((prev) => {
                                      const n = structuredClone(prev);
                                      n.projects[idx].bullets.push("");
                                      return n;
                                    })
                                  }
                                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs"
                                >
                                  <Plus size={12} />
                                  Add bullet
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {sectionId === "skills" ? (
                        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                          <div className="flex items-center gap-2">
                            {editingSectionTitleId === "skills" ? (
                              <input
                                value={editingSectionTitleDraft}
                                onChange={(e) => setEditingSectionTitleDraft(e.target.value)}
                                onBlur={() => saveSectionTitle("skills")}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveSectionTitle("skills");
                                }}
                                autoFocus
                                className="h-8 rounded-lg border border-white/10 bg-black/30 px-2 text-sm font-semibold text-white"
                              />
                            ) : (
                              <>
                                <div className="text-sm font-semibold text-white">
                                  {resolveSectionTitle("skills", "Skills")}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => beginSectionTitleEdit("skills", "Skills")}
                                  className="rounded-md border border-white/10 p-1 text-zinc-300 hover:text-white"
                                  aria-label="Rename skills section"
                                >
                                  <Pencil size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { if (confirm("Hide the Skills section?")) hideSection("skills"); }}
                                  className="rounded-md border border-red-500/30 p-1 text-red-400 hover:bg-red-500/10"
                                  title="Hide section"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                          <input
                            value={content.skills.join(", ")}
                            onChange={(e) => setContent((prev) => ({ ...prev, skills: parseSkills(e.target.value) }))}
                            className="mt-3 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm"
                            placeholder="Languages, frameworks, tools"
                          />
                        </div>
                      ) : null}

                      {sectionId.startsWith("custom:") ? (
                        (() => {
                          const ci = parseInt(sectionId.split(":")[1] ?? "0", 10);
                          const cs = content.customSections?.[ci];
                          if (!cs) return null;
                          return (
                            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-white">Custom section</div>
                                <button
                                  type="button"
                                  onClick={() => removeCustomSection(ci)}
                                  className="rounded-md border border-white/10 p-1 text-zinc-300"
                                  aria-label="Remove custom section"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <input
                                value={cs.title}
                                onChange={(e) =>
                                  setContent((prev) => {
                                    const n = structuredClone(prev);
                                    if (!n.customSections?.[ci]) return prev;
                                    n.customSections[ci].title = e.target.value;
                                    return n;
                                  })
                                }
                                className="mt-3 h-10 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm"
                                placeholder="Section title"
                              />
                              <textarea
                                value={cs.body ?? ""}
                                onChange={(e) =>
                                  setContent((prev) => {
                                    const n = structuredClone(prev);
                                    if (!n.customSections?.[ci]) return prev;
                                    n.customSections[ci].body = e.target.value;
                                    return n;
                                  })
                                }
                                rows={5}
                                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/50"
                                placeholder="Free-form content (paragraphs)"
                              />
                            </div>
                          );
                        })()
                      ) : null}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCustomSection}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-black/10 py-3 text-sm text-zinc-300 hover:border-cyan-300/40 hover:text-white"
                >
                  <Plus size={16} />
                  Add custom section
                </button>

                {(content.hiddenSections ?? []).length > 0 && (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="mb-2 text-xs text-zinc-500">Hidden sections — click to restore:</div>
                    <div className="flex flex-wrap gap-2">
                      {(content.hiddenSections ?? []).map((id) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => restoreSection(id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-zinc-300 hover:border-cyan-300/40 hover:text-white"
                        >
                          <Plus size={11} />
                          {id.replace("custom:", "Custom #")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Horizontal template switcher at bottom */}
            <div className="min-w-0 rounded-3xl border border-white/10 bg-black/20 p-5">
              <div className="mb-3 text-sm font-semibold text-white">Switch template</div>
              <div className="-mx-1 flex min-w-0 gap-3 overflow-x-auto overflow-y-visible px-1 pb-4 pt-0.5 [scrollbar-gutter:stable]">
                {RESUME_TEMPLATES.map((t) => {
                  const allowed = templateAllowedForPlan({ template: t, plan: props.userPlan });
                  const selected = template === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      disabled={!allowed}
                      onClick={() => setTemplate(t.key)}
                      className={`min-w-[130px] rounded-xl border p-2 text-left transition ${
                        selected ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-black/20"
                      } ${!allowed ? "opacity-50" : "hover:border-cyan-300/40"}`}
                    >
                      <div className="h-20 overflow-hidden rounded-lg border border-white/10 bg-zinc-900">
                        <ResumeTemplateThumbnail template={t.key} resume={previewResume} compact />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="truncate text-xs font-semibold text-white">{t.name}</div>
                        {!allowed ? <Lock size={12} className="text-zinc-300" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 text-xs text-zinc-500">Switches instantly in the live preview.</div>
            </div>
          </div>
        </div>

        {/* Right panel: fixed preview */}
        <div className="h-full min-w-0 overflow-y-auto">
          <div className="sticky top-0 flex h-[calc(100vh-100px)] flex-col gap-4">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3">
                <div className="text-sm font-semibold text-white">Live preview</div>
              </div>
              <ResumePreview
                resume={previewResume}
                template={template}
                compiledPdfUrl={isJakeTemplate ? compiledJakePdfUrl : undefined}
                compileError={isJakeTemplate ? jakeCompileError : null}
                compiling={isJakeTemplate && isConvertingLatex}
              />
              {isJakeTemplate ? (
                <div className="mt-2 inline-flex items-center gap-2 text-xs text-zinc-500">
                  <Code2 size={12} />
                  Jake&apos;s layout tuned to LaTeX-style compact typography.
                </div>
              ) : null}
            </div>
            <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs text-zinc-400">
                Exports are quota-limited per plan, enforced server-side.
              </p>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await exportPdf();
                  } catch (err: unknown) {
                    alert(err instanceof Error ? err.message : "Export failed");
                  }
                }}
                className="mt-3 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:brightness-110"
              >
                <Download className="mr-2" size={16} />
                Export to PDF
              </button>
              {null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
