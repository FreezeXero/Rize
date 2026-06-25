import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { resumeId?: string; title?: string };
  if (!body?.resumeId || typeof body.title !== "string") {
    return NextResponse.json({ error: "Missing resumeId or title" }, { status: 400 });
  }

  const title = body.title.trim().slice(0, 120);
  if (!title) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("resumes")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", body.resumeId)
    .eq("user_id", user.id); // scoped to owner

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
