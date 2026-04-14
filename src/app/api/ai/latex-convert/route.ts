import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumeAIUse, getUserPlan } from "@/lib/db/usage";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
  const { data: userRow, error: userRowErr } = await supabaseAdmin
    .from("users")
    .select("ai_latex_uses")
    .eq("id", user.id)
    .single();
  if (userRowErr) {
    return NextResponse.json({ error: "Unable to validate AI trial usage." }, { status: 500 });
  }
  const aiLatexUses = Number(userRow?.ai_latex_uses ?? 0);
  if (plan === "free") {
    if (aiLatexUses >= 1) {
      return NextResponse.json(
        { error: "Upgrade to Pro to keep using AI LaTeX conversion.", lockUpgrade: true },
        { status: 403 }
      );
    }
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

  const { error: upErr } = await supabaseAdmin
    .from("users")
    .update({ ai_latex_uses: aiLatexUses + 1 })
    .eq("id", user.id);
  if (upErr) {
    return NextResponse.json({ error: "Converted but failed to update AI usage." }, { status: 500 });
  }

  return NextResponse.json({ latexSource: latex });
}

