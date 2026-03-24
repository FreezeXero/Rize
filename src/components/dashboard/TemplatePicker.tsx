"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import type { Plan } from "@/lib/plans";
import type { ResumeTemplate } from "@/lib/templates/resumeTemplates";
import { templateAllowedForPlan } from "@/lib/templates/resumeTemplates";

function previewImageForTemplate(templateKey: string) {
  if (templateKey === "jakes_latex") return "/templates/jakes-resume.png";
  if (templateKey === "mit_latex") return "/templates/mit-stanford.png";
  if (templateKey === "stanford_latex") return "/templates/stanford-gsb-resume-preview.svg";
  if (templateKey === "mit_stanford_latex") return "/templates/mit-stanford.png";
  if (templateKey === "google_standard") return "/templates/google-standard.jpg";
  if (templateKey === "harvard_classic") return "/templates/harvard-classic.jpg";
  if (templateKey === "modern_grid_pro") return "/templates/modern-grid-pro.jpg";
  if (templateKey === "tech_executive_pro") return "/templates/tech-executive-pro.jpg";
  if (templateKey === "minimalist_pro") return "/templates/minimalist-pro.jpg";
  if (templateKey === "classic_serif_pro") return "/templates/classic-serif-pro.jpg";
  if (templateKey === "creative_split_pro") return "/templates/creative-split-pro.jpg";
  if (templateKey === "apollo_pro") return "/templates/apollo-pro.jpg";
  if (templateKey === "tempera_pro") return "/templates/tempera-pro.jpg";
  if (templateKey === "euclid_pro") return "/templates/euclid-pro.jpg";
  return "/templates/jakes-resume.png";
}

export function TemplatePicker(props: {
  plan: Plan;
  templates: ResumeTemplate[];
}) {
  const router = useRouter();
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);

  async function createWithTemplate(templateKey: string, allowed: boolean) {
    if (!allowed) return;
    setCreatingTemplate(templateKey);
    setError(null);
    try {
      const res = await fetch("/api/resumes/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template: templateKey }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        error?: string;
        resumeId?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Failed to create resume");
      if (!json.resumeId) throw new Error("Server did not return a resume ID.");
      router.push(`/dashboard/resumes/${json.resumeId}/edit`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create resume");
      setCreatingTemplate(null);
    }
  }

  function openTemplatePreview(template: ResumeTemplate) {
    setSelectedTemplate(template);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            Choose a template
          </h1>
          <p className="mt-2 text-zinc-300">
            Pick a layout to start editing. Your plan:{" "}
            <span className="font-semibold uppercase text-cyan-200">{props.plan}</span>
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="max-h-[72vh] overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {props.templates.map((template) => {
            const allowed = templateAllowedForPlan({
              template,
              plan: props.plan,
            });
            const busy = creatingTemplate === template.key;
            return (
              <button
                key={template.key}
                type="button"
                onClick={() => openTemplatePreview(template)}
                disabled={busy}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/10 disabled:opacity-70"
              >
                <div className="relative aspect-[210/297] overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                  <img
                    src={previewImageForTemplate(template.key)}
                    alt={`${template.name} preview`}
                    className={[
                      "h-full w-full object-contain object-top bg-white",
                      !allowed ? "grayscale opacity-70" : "",
                    ].join(" ")}
                  />
                  {!allowed ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px]">
                      <Link
                        href="/pricing"
                        className="rounded-xl border border-white/20 bg-black/70 px-4 py-3 text-center transition hover:border-cyan-400/40 hover:bg-black/80"
                      >
                        <div className="mb-1 flex items-center justify-center gap-2 text-zinc-100">
                          <Lock size={14} />
                          <span className="text-sm font-semibold">
                            Upgrade to Pro to unlock
                          </span>
                        </div>
                      </Link>
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {template.name}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {template.description}
                    </div>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-semibold text-zinc-200">
                    {template.badge}
                  </span>
                </div>
                <div className="mt-3 text-xs text-zinc-300">
                  {busy
                    ? "Creating resume..."
                    : allowed
                      ? "Click to preview"
                      : "Locked on your current plan"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTemplate ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0b1120] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{selectedTemplate.name}</h2>
                <p className="mt-1 text-sm text-zinc-300">{selectedTemplate.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-200 transition hover:bg-white/10"
              >
                Back
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_280px]">
              <div className="rounded-xl border border-white/10 bg-zinc-900 p-3">
                <div className="mx-auto aspect-[210/297] max-h-[65vh] overflow-hidden rounded-lg bg-white">
                  <img
                    src={previewImageForTemplate(selectedTemplate.key)}
                    alt={`${selectedTemplate.name} full preview`}
                    className="h-full w-full object-contain object-top"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-400">
                  Template details
                </div>
                <div className="mt-2 text-sm text-zinc-200">{selectedTemplate.name}</div>
                <div className="mt-1 text-xs text-zinc-400">{selectedTemplate.description}</div>
                {!templateAllowedForPlan({ template: selectedTemplate, plan: props.plan }) ? (
                  <div className="mt-2 text-xs text-red-300">
                    <Link href="/pricing" className="underline hover:text-red-200">
                      Upgrade to Pro to use this template.
                    </Link>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      createWithTemplate(
                        selectedTemplate.key,
                        templateAllowedForPlan({
                          template: selectedTemplate,
                          plan: props.plan,
                        })
                      )
                    }
                    disabled={
                      creatingTemplate === selectedTemplate.key ||
                      !templateAllowedForPlan({ template: selectedTemplate, plan: props.plan })
                    }
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-4 text-sm font-semibold text-[#050509] transition hover:brightness-110 disabled:opacity-60"
                  >
                    {creatingTemplate === selectedTemplate.key
                      ? "Creating..."
                      : "Use this template"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-zinc-200 transition hover:bg-white/10"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
