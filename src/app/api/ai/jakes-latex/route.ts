import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumeAIUse, getUserPlan } from "@/lib/db/usage";
import { claudeComplete } from "@/lib/ai/claude";
import { jakesLatexFromContentPrompt } from "@/lib/ai/prompts";
import type { ResumeContent } from "@/lib/db/resumeTypes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const body = (await req.json()) as { content?: ResumeContent };
  if (!body?.content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  const plan = await getUserPlan(user.id);
  if (plan === "free") {
    return NextResponse.json(
      { error: "AI LaTeX generation is a Pro/Max feature." },
      { status: 403 }
    );
  }

  await consumeAIUse(user.id, "ai_latex_conversion");

  const latex = await claudeComplete({
    system:
      "Return only valid LaTeX source. No markdown fences. Keep exact Jake Gutierrez template structure.",
    user: jakesLatexFromContentPrompt(body.content),
    maxTokens: 2200,
  });

  return NextResponse.json({ latexSource: latex });
}
