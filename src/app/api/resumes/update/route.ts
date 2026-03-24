import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/db/usage";
import { updateResumeForUser } from "@/lib/db/resumes";
import { RESUME_TEMPLATES, templateAllowedForPlan } from "@/lib/templates/resumeTemplates";
import type { ResumeContent, ResumeTemplateKey } from "@/lib/db/resumeTypes";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    resumeId: string;
    content: ResumeContent;
    title?: string;
    template?: ResumeTemplateKey;
  };

  if (!body?.resumeId || !body?.content) {
    return NextResponse.json({ error: "Missing resumeId/content" }, { status: 400 });
  }

  const plan = await getUserPlan(user.id);
  if (plan === "free") {
    const customSectionsCount = body.content.customSections?.length ?? 0;
    if (customSectionsCount > 0) {
      return NextResponse.json(
        { error: "Custom sections are available on Pro and Max." },
        { status: 403 }
      );
    }
  }

  if (body.template) {
    const templateDef = RESUME_TEMPLATES.find((t) => t.key === body.template);
    if (!templateDef) {
      return NextResponse.json({ error: "Unknown template" }, { status: 400 });
    }

    if (!templateAllowedForPlan({ template: templateDef, plan })) {
      return NextResponse.json(
        { error: "That template is locked for your plan." },
        { status: 403 }
      );
    }
  }

  const updated = await updateResumeForUser({
    userId: user.id,
    resumeId: body.resumeId,
    content: body.content,
    title: body.title,
    template: body.template,
  });

  return NextResponse.json({ resumeId: updated.id });
}

