import { createSupabaseServerClient } from "../supabase/server";

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return null;
  return data.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    // In server routes/components, we typically redirect; keep this helper generic.
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

