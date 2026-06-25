import { supabaseAdmin } from "../supabase/admin";
import { PLAN_LIMITS, type Plan } from "../plans";

export type UsageActionType =
  | "export_pdf"
  | "ai_bullet_rewrite"
  | "ai_latex_conversion"
  | "ats_basic"
  | "ats_full";

function isSingleRowCoercionError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const msg = (err as { message?: unknown }).message;
  return (
    typeof msg === "string" &&
    (msg.includes("PGRST116") ||
      msg.includes("Cannot coerce") ||
      msg.includes("result contains 0 rows"))
  );
}

async function ensureUserRow(userId: string) {
  // If the signup trigger didn’t create the users row (race condition / missing setup),
  // we create a default row so dashboard/billing never crash.
  const { error } = await supabaseAdmin.from("users").upsert(
    {
      id: userId,
      plan: "free",
      billing_cycle: "monthly",
      exports_this_month: 0,
      ai_uses_this_month: 0,
      ai_latex_uses: 0,
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

function getForcedMaxEmails() {
  const raw =
    process.env.RIZE_FORCE_MAX_EMAILS ??
    "rafayfarah.cs@gmail.com,fxero.media@gmail.com";
  return raw
    .split(",")
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);
}

function shouldForceMaxForEmail(email?: string | null) {
  if (!email) return false;
  return getForcedMaxEmails().includes(email.trim().toLowerCase());
}

async function getEmailForUserId(userId: string): Promise<string | null> {
  const { data: userRow, error: userErr } = await supabaseAdmin
    .from("users")
    .select("email")
    .eq("id", userId)
    .single();

  if (!userErr && userRow?.email) {
    return String(userRow.email).trim().toLowerCase();
  }

  const { data: authData, error: authErr } =
    await supabaseAdmin.auth.admin.getUserById(userId);
  if (authErr) return null;
  return authData.user?.email?.trim().toLowerCase() ?? null;
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const emailEarly = await getEmailForUserId(userId);
  if (shouldForceMaxForEmail(emailEarly)) {
    await ensureUserRow(userId);
    return "max";
  }

  await ensureUserRow(userId);

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("plan")
    .eq("id", userId)
    .single();

  if (error) {
    if (isSingleRowCoercionError(error)) {
      await ensureUserRow(userId);
      const { data: retry } = await supabaseAdmin
        .from("users")
        .select("plan")
        .eq("id", userId)
        .single();
      const plan = retry?.plan as string | undefined;
      return plan === "pro" || plan === "max"
        ? (plan as Plan)
        : "free";
    }
    throw error;
  }

  const plan = data?.plan as string;
  if (plan !== "free" && plan !== "pro" && plan !== "max") {
    // Defensive fallback
    await ensureUserRow(userId);
    return "free";
  }
  return plan;
}

export async function getUserUsageStats(userId: string) {
  const emailEarly = await getEmailForUserId(userId);
  const forcedMax = shouldForceMaxForEmail(emailEarly);

  await ensureUserRow(userId);

  const { data, error } = await supabaseAdmin
    .from("users")
    .select("exports_this_month, ai_uses_this_month, plan")
    .eq("id", userId)
    .single();
  const fallback = {
    exports_this_month: 0,
    ai_uses_this_month: 0,
    plan: "free" as Plan,
  };

  if (error) {
    if (isSingleRowCoercionError(error)) {
      await ensureUserRow(userId);
      const { data: retry } = await supabaseAdmin
        .from("users")
        .select("exports_this_month, ai_uses_this_month, plan")
        .eq("id", userId)
        .single();

      if (!retry) return forcedMax ? { ...fallback, plan: "max" as Plan } : fallback;

      const plan = retry.plan as string | undefined;
      const normalizedPlan: Plan = forcedMax
        ? "max"
        : plan === "pro" || plan === "max"
          ? (plan as Plan)
          : "free";

      return {
        exports_this_month: Number(retry.exports_this_month ?? 0),
        ai_uses_this_month: Number(retry.ai_uses_this_month ?? 0),
        plan: normalizedPlan,
      };
    }
    throw error;
  }

  if (!data) return forcedMax ? { ...fallback, plan: "max" as Plan } : fallback;

  const dbPlan = (data.plan as string | undefined) ?? "free";
  const normalizedPlan: Plan = forcedMax
    ? "max"
    : dbPlan === "pro" || dbPlan === "max"
      ? (dbPlan as Plan)
      : "free";

  return {
    exports_this_month: Number(data.exports_this_month ?? 0),
    ai_uses_this_month: Number(data.ai_uses_this_month ?? 0),
    plan: normalizedPlan,
  };
}

function getMonthStartISO() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function getWeekStartISO() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay()); // back to Sunday
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function countAIWeekTotal(userId: string) {
  const weekStart = getWeekStartISO();
  const { count, error } = await supabaseAdmin
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("action_type", ["ai_bullet_rewrite", "ai_latex_conversion", "ats_basic", "ats_full"] as const)
    .gte("timestamp", weekStart);
  if (error) throw error;
  return count ?? 0;
}

export async function getWeeklyAIRewriteCount(userId: string): Promise<number> {
  const weekStart = getWeekStartISO();
  const { count, error } = await supabaseAdmin
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", "ai_bullet_rewrite")
    .gte("timestamp", weekStart);
  if (error) throw error;
  return count ?? 0;
}

export async function getWeeklyATSCheckCount(userId: string): Promise<number> {
  const weekStart = getWeekStartISO();
  const { count, error } = await supabaseAdmin
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", "ats_basic")
    .gte("timestamp", weekStart);
  if (error) throw error;
  return count ?? 0;
}

export async function recordUsageOnly(
  userId: string,
  actionType: UsageActionType
): Promise<void> {
  const { error } = await supabaseAdmin.from("usage").insert({
    user_id: userId,
    action_type: actionType,
    timestamp: new Date().toISOString(),
  });
  if (error) throw error;
}

async function countUsageThisMonth(userId: string, actionType: UsageActionType) {
  const monthStart = getMonthStartISO();
  const { count, error } = await supabaseAdmin
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", actionType)
    .gte("timestamp", monthStart);
  if (error) throw error;
  return count ?? 0;
}

async function countAIMonthTotal(userId: string) {
  const monthStart = getMonthStartISO();
  const { count, error } = await supabaseAdmin
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("action_type", ["ai_bullet_rewrite", "ai_latex_conversion", "ats_basic", "ats_full"] as const)
    .gte("timestamp", monthStart);
  if (error) throw error;
  return count ?? 0;
}

async function recordUsage(args: { userId: string; actionType: UsageActionType }) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("usage").insert({
    user_id: args.userId,
    action_type: args.actionType,
    timestamp: now,
  });
  if (error) throw error;
}

async function refreshUserCounters(userId: string) {
  const monthStart = getMonthStartISO();

  await ensureUserRow(userId);

  // exports_this_month
  const { count: exportCount, error: exportErr } = await supabaseAdmin
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", "export_pdf")
    .gte("timestamp", monthStart);
  if (exportErr) throw exportErr;

  // ai_uses_this_month
  const { count: aiCount, error: aiErr } = await supabaseAdmin
    .from("usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in(
      "action_type",
      ["ai_bullet_rewrite", "ai_latex_conversion", "ats_basic", "ats_full"] as const
    )
    .gte("timestamp", monthStart);
  if (aiErr) throw aiErr;

  const { error: updateErr } = await supabaseAdmin
    .from("users")
    .update({
      exports_this_month: exportCount ?? 0,
      ai_uses_this_month: aiCount ?? 0,
    })
    .eq("id", userId);
  if (updateErr) throw updateErr;
}

export async function consumeExport(userId: string) {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  if (limits.exportLimitPerMonth === "unlimited") {
    await recordUsage({ userId, actionType: "export_pdf" });
    await refreshUserCounters(userId);
    return;
  }

  const used = await countUsageThisMonth(userId, "export_pdf");
  if (used >= limits.exportLimitPerMonth) {
    throw new Error("PDF export limit reached for your plan.");
  }

  await recordUsage({ userId, actionType: "export_pdf" });
  await refreshUserCounters(userId);
}

export async function consumeAIUse(userId: string, actionType: UsageActionType) {
  // Only certain action types are "AI uses" against the monthly quota.
  if (
    !["ai_bullet_rewrite", "ai_latex_conversion", "ats_basic", "ats_full"].includes(
      actionType
    )
  ) {
    // No-op: not counted against quota.
    await recordUsage({ userId, actionType });
    await refreshUserCounters(userId);
    return;
  }

  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  if (limits.maxAIBulletRewritesPerMonth === "unlimited") {
    await recordUsage({ userId, actionType });
    await refreshUserCounters(userId);
    return;
  }

  // AI bullet rewrite quota resets weekly; other AI actions still use the monthly total.
  const used =
    actionType === "ai_bullet_rewrite"
      ? await countAIWeekTotal(userId)
      : await countAIMonthTotal(userId);
  if (used >= limits.maxAIBulletRewritesPerMonth) {
    throw new Error("AI usage limit reached for your plan.");
  }

  await recordUsage({ userId, actionType });
  await refreshUserCounters(userId);
}

export async function getAiLatexUses(userId: string): Promise<number> {
  await ensureUserRow(userId);
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("ai_latex_uses")
    .eq("id", userId)
    .single();
  if (error && !isSingleRowCoercionError(error)) throw error;
  return Number(data?.ai_latex_uses ?? 0);
}

