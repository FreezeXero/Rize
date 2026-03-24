import { supabaseAdmin } from "../supabase/admin";
import { JOHN_DOE_SAMPLE_CONTENT } from "@/lib/resume/sampleData";
import type { ResumeContent, ResumeTemplateKey } from "./resumeTypes";

export type ResumeRow = {
  id: string;
  user_id: string;
  title: string | null;
  template: string;
  content: ResumeContent;
  created_at: string;
  updated_at: string;
};

export async function listResumes(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as ResumeRow[];
}

export async function getResumeForUser(userId: string, resumeId: string) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .eq("id", resumeId)
    .single();

  if (error) throw error;
  return data as ResumeRow;
}

export async function countResumesForUser(userId: string) {
  const { count, error } = await supabaseAdmin
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return count ?? 0;
}

export async function createResumeForUser(args: {
  userId: string;
  title?: string;
  template: ResumeTemplateKey;
  content?: Partial<ResumeContent>;
}) {
  const now = new Date().toISOString();
  const base = JOHN_DOE_SAMPLE_CONTENT;
  const content: ResumeContent = {
    fullName: args.content?.fullName ?? base.fullName,
    contactLine: args.content?.contactLine ?? base.contactLine,
    education:
      args.content?.education && args.content.education.length > 0
        ? args.content.education
        : base.education,
    experience:
      args.content?.experience && args.content.experience.length > 0
        ? args.content.experience
        : base.experience,
    projects:
      args.content?.projects && args.content.projects.length > 0
        ? args.content.projects
        : base.projects,
    leadershipActivities:
      args.content?.leadershipActivities && args.content.leadershipActivities.length > 0
        ? args.content.leadershipActivities
        : base.leadershipActivities ?? [],
    skills:
      args.content?.skills && args.content.skills.length > 0
        ? args.content.skills
        : base.skills,
    summary: args.content?.summary ?? base.summary,
    customSections: args.content?.customSections ?? [],
    latexSource: args.content?.latexSource,
  };

  const { data, error } = await supabaseAdmin
    .from("resumes")
    .insert({
      user_id: args.userId,
      title: args.title ?? "Untitled Resume",
      template: args.template,
      content,
      created_at: now,
      updated_at: now,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as ResumeRow;
}

export async function updateResumeForUser(args: {
  userId: string;
  resumeId: string;
  content: ResumeContent;
  title?: string;
  template?: ResumeTemplateKey;
}) {
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    content: args.content,
    updated_at: now,
  };
  if (args.title !== undefined) patch.title = args.title;
  if (args.template !== undefined) patch.template = args.template;

  const { data, error } = await supabaseAdmin
    .from("resumes")
    .update(patch)
    .eq("user_id", args.userId)
    .eq("id", args.resumeId)
    .select("*")
    .single();

  if (error) throw error;
  return data as ResumeRow;
}

export async function deleteResumeForUser(userId: string, resumeId: string) {
  const { error } = await supabaseAdmin
    .from("resumes")
    .delete()
    .eq("user_id", userId)
    .eq("id", resumeId);

  if (error) throw error;
}

