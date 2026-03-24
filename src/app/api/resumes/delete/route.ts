import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteResumeForUser } from "@/lib/db/resumes";

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

    const body = (await req.json()) as { resumeId?: string };
    if (!body?.resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    await deleteResumeForUser(user.id, body.resumeId);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
