import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  consumeAIUse,
  getUserPlan,
  getWeeklyATSCheckCount,
  recordUsageOnly,
} from "@/lib/db/usage";
import { getResumeForUser } from "@/lib/db/resumes";
import { resumeContentToText } from "@/lib/ats/ats";
import { claudeComplete } from "@/lib/ai/claude";
import { atsSuggestionPrompt } from "@/lib/ai/prompts";
import type { ResumeContent } from "@/lib/db/resumeTypes";

export const runtime = "nodejs";

const FREE_ATS_WEEKLY_LIMIT = 3;

const ATS_SYSTEM_PROMPT =
  "You are a senior technical recruiter. Analyze how well this resume matches this job posting. " +
  "Ignore any LinkedIn UI text, metadata, location info, application stats, or anything that is not an actual job requirement. " +
  "Focus only on: responsibilities, qualifications, required skills, and preferred skills sections of the job posting.\n\n" +
  "Return a JSON object with exactly these fields:\n" +
  "- matchPercentage: number 0-100 based on genuine qualifications fit\n" +
  "- strengths: array of strings describing what the candidate does well for this role\n" +
  "- missing: array of strings describing actual skill or experience gaps (only real requirements, never words like united, states, reposted, weeks, ago, people, clicked, apply, promoted, hirer, responses, or any metadata)\n" +
  "- suggestions: array of specific actionable strings telling the candidate exactly how to improve their resume for this role\n" +
  "- summary: one paragraph plain English assessment\n\n" +
  "Never include metadata words in missing or suggestions. Only include real technical skills, experience, or qualifications that are actually required by the job.";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to run ATS checks." },
      { status: 401 }
    );
  }

  let body: { resumeId?: string; jobDescription?: string };
  try {
    body = (await req.json()) as { resumeId?: string; jobDescription?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body?.resumeId || !body?.jobDescription?.trim()) {
    return NextResponse.json(
      { error: "Missing resumeId or jobDescription" },
      { status: 400 }
    );
  }

  const plan = await getUserPlan(user.id);

  // Free plan: 3 checks/week limit, then Claude analysis
  if (plan === "free") {
    const weeklyUsed = await getWeeklyATSCheckCount(user.id);
    if (weeklyUsed >= FREE_ATS_WEEKLY_LIMIT) {
      return NextResponse.json(
        {
          error: `Free plan allows ${FREE_ATS_WEEKLY_LIMIT} ATS checks per week. Upgrade to Pro for unlimited AI-powered analysis.`,
        },
        { status: 403 }
      );
    }
    await recordUsageOnly(user.id, "ats_basic");
  } else if (plan === "pro") {
    await recordUsageOnly(user.id, "ats_basic");
  } else {
    await consumeAIUse(user.id, "ats_full");
  }

  const resumeRow = await getResumeForUser(user.id, body.resumeId);
  const resumeText = resumeContentToText(resumeRow.content as ResumeContent);

  // Send raw texts directly to Claude — no pre-processing or keyword extraction
  const userMessage = atsSuggestionPrompt({
    jobDescription: body.jobDescription,
    resumeText,
  });

  const rawResponse = await claudeComplete({
    user: userMessage,
    maxTokens: 1200,
    system: ATS_SYSTEM_PROMPT,
  });

  // Extract JSON from response (handle cases where Claude adds any surrounding text)
  let parsed: Record<string, unknown> | null = null;
  try {
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawResponse;
    const obj = JSON.parse(jsonStr);
    if (typeof obj === "object" && obj !== null) {
      parsed = obj as Record<string, unknown>;
    }
  } catch {
    // fall through to null check below
  }

  if (!parsed) {
    return NextResponse.json(
      { error: "Analysis failed to parse. Please try again." },
      { status: 500 }
    );
  }

  const matchPercentage =
    typeof parsed.matchPercentage === "number"
      ? Math.min(100, Math.max(0, Math.round(parsed.matchPercentage)))
      : 0;

  const toStringArray = (val: unknown): string[] =>
    Array.isArray(val) && (val as unknown[]).every((x) => typeof x === "string")
      ? (val as string[])
      : [];

  const missing = toStringArray(parsed.missing);
  const suggestions = toStringArray(parsed.suggestions);
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : undefined;

  // Max plan gets the strengths card; Free + Pro do not
  if (plan === "max") {
    const strengths = toStringArray(parsed.strengths);
    return NextResponse.json({ matchPercentage, strengths, missing, suggestions, summary });
  }

  return NextResponse.json({ matchPercentage, missing, suggestions, summary });
}
