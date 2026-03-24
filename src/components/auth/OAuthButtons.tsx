"use client";

import React, { useState } from "react";
import { Chrome } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";

function getRedirectTo() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}/auth/callback?next=/dashboard`;
}

export function OAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signInWithProvider(provider: "google") {
    setError(null);
    setLoadingProvider(provider);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: getRedirectTo() },
      });
      if (oauthError) throw oauthError;
      // Browser redirects to provider automatically on success.
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "OAuth sign in failed";
      setError(message);
      setLoadingProvider(null);
    }
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={() => signInWithProvider("google")}
        disabled={loadingProvider !== null}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
      >
        <Chrome size={16} />
        {loadingProvider === "google" ? "Redirecting..." : "Continue with Google"}
      </button>

      {error ? <div className="text-sm text-red-300">{error}</div> : null}
    </div>
  );
}

