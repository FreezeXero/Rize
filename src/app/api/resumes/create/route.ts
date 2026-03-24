import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/db/usage";
import { PLAN_LIMITS } from "@/lib/plans";
import { countResumesForUser, createResumeForUser } from "@/lib/db/resumes";
import type { ResumeTemplateKey } from "@/lib/db/resumeTypes";
import {
  RESUME_TEMPLATES,
  templateAllowedForPlan,
} from "@/lib/templates/resumeTemplates";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Handle empty request body safely.
    const raw = await req.text();
    const body = raw
      ? (JSON.parse(raw) as { template?: ResumeTemplateKey; title?: string })
      : {};

    const template = body.template ?? "google_standard";
    const templateDef = RESUME_TEMPLATES.find((t) => t.key === template);
    if (!templateDef) {
      return NextResponse.json({ error: "Invalid template selected." }, { status: 400 });
    }

    const plan = await getUserPlan(user.id);
    if (!templateAllowedForPlan({ template: templateDef, plan })) {
      return NextResponse.json(
        { error: "Upgrade to Pro to use this template." },
        { status: 403 }
      );
    }
    const limits = PLAN_LIMITS[plan];

    if (limits.maxResumes !== "unlimited") {
      const used = await countResumesForUser(user.id);
      if (used >= limits.maxResumes) {
        return NextResponse.json(
          { error: "Resume limit reached for your plan." },
          { status: 403 }
        );
      }
    }

    const resume = await createResumeForUser({
      userId: user.id,
      template,
      title: body.title,
    });

    return NextResponse.json({ resumeId: resume.id });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

