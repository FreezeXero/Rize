import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumeAIUse, getUserPlan } from "@/lib/db/usage";
import { getResumeForUser } from "@/lib/db/resumes";
import { computeATSBasic, resumeContentToText } from "@/lib/ats/ats";
import { claudeComplete } from "@/lib/ai/claude";
import { atsSuggestionPrompt } from "@/lib/ai/prompts";
import type { ResumeContent } from "@/lib/db/resumeTypes";

export const runtime = "nodejs";

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

  const body = (await req.json()) as {
    resumeId: string;
    jobDescription: string;
  };

  if (!body?.resumeId || !body?.jobDescription) {
    return NextResponse.json(
      { error: "Missing resumeId or jobDescription" },
      { status: 400 }
    );
  }

  const plan = await getUserPlan(user.id);
  if (plan === "free") {
    return NextResponse.json(
      { error: "ATS checker is available on Pro and Max." },
      { status: 403 }
    );
  }

  const resumeRow = await getResumeForUser(user.id, body.resumeId);
  const resumeText = resumeContentToText(resumeRow.content as ResumeContent);
  const basic = computeATSBasic({
    jobDescription: body.jobDescription,
    resumeText,
  });

  if (plan === "pro") {
    return NextResponse.json({
      matchPercentage: basic.matchPercentage,
      missingKeywords: basic.missingKeywords,
      suggestions: basic.suggestions,
    });
  }

  // Max: optionally enrich with a detailed Claude report.
  await consumeAIUse(user.id, "ats_full");
  const prompt = atsSuggestionPrompt({
    jobDescription: body.jobDescription,
    resumeText,
    mode: "full",
  });

  const detailed = await claudeComplete({
    user: prompt,
    maxTokens: 900,
    system:
      "Respond with a JSON object only. Ensure it is valid JSON without markdown.",
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(detailed);
  } catch {
    // If parsing fails, still return the basic heuristics.
    return NextResponse.json({
      matchPercentage: basic.matchPercentage,
      missingKeywords: basic.missingKeywords,
      suggestions: basic.suggestions,
      detailedReport: detailed,
    });
  }

  const parsedObj =
    typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;

  const matchPercentage =
    typeof parsedObj?.matchPercentage === "number"
      ? parsedObj.matchPercentage
      : basic.matchPercentage;

  const missingKeywords =
    Array.isArray(parsedObj?.missingKeywords) && parsedObj.missingKeywords.every((x) => typeof x === "string")
      ? (parsedObj.missingKeywords as string[])
      : basic.missingKeywords;

  const suggestions =
    Array.isArray(parsedObj?.topSuggestions) && parsedObj.topSuggestions.every((x) => typeof x === "string")
      ? (parsedObj.topSuggestions as string[])
      : basic.suggestions;

  const detailedReport =
    typeof parsedObj?.detailedReport === "string" ? parsedObj.detailedReport : null;

  return NextResponse.json({
    matchPercentage,
    missingKeywords,
    suggestions,
    detailedReport,
  });
}

