import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumeAIUse } from "@/lib/db/usage";
import { claudeComplete } from "@/lib/ai/claude";
import { rewriteBulletPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to use AI rewrites." },
      { status: 401 }
    );
  }

  const body = (await req.json()) as {
    bullet: string;
    section: "experience" | "project";
    context?: string;
    targetRole?: string;
  };

  if (!body?.bullet) {
    return NextResponse.json({ error: "Missing bullet" }, { status: 400 });
  }

  // Server-side quota enforcement.
  await consumeAIUse(user.id, "ai_bullet_rewrite");

  const prompt = rewriteBulletPrompt({
    bullet: body.bullet,
    section: body.section,
    companyOrProject: body.context,
    targetRole: body.targetRole,
  });

  const rewritten = await claudeComplete({
    user: prompt,
    maxTokens: 120,
    system:
      "Be concise and produce only the rewritten bullet text. Do not add quotes.",
  });

  return NextResponse.json({ rewrittenBullet: rewritten });
}

