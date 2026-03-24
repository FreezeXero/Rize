import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumeAIUse, getUserPlan } from "@/lib/db/usage";
import { claudeComplete } from "@/lib/ai/claude";
import { latexConversionPrompt } from "@/lib/ai/prompts";
import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to convert LaTeX." },
      { status: 401 }
    );
  }

  const body = (await req.json()) as {
    template: ResumeTemplateKey;
    content: ResumeContent;
  };

  if (!body?.template || !body?.content) {
    return NextResponse.json({ error: "Missing template/content" }, { status: 400 });
  }

  const plan = await getUserPlan(user.id);
  if (!["pro", "max"].includes(plan)) {
    return NextResponse.json(
      { error: "LaTeX conversion is a Pro/Max feature." },
      { status: 403 }
    );
  }

  await consumeAIUse(user.id, "ai_latex_conversion");

  const prompt = latexConversionPrompt({
    template: body.template,
    content: body.content,
  });

  const latex = await claudeComplete({
    user: prompt,
    maxTokens: 1200,
    system: "Return only LaTeX content. Do not include markdown code fences.",
  });

  return NextResponse.json({ latexSource: latex });
}

