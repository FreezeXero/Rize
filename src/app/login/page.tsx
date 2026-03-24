"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationRequired, setConfirmationRequired] = useState(false);
  const [confirmResending, setConfirmResending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setConfirmationRequired(false);
    try {
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) throw signInErr;
      if (data.session) {
        router.push("/dashboard");
        return;
      }

      setConfirmationRequired(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      // Supabase usually returns something like "Email not confirmed".
      if (message.toLowerCase().includes("not confirmed") || message.toLowerCase().includes("confirm")) {
        setConfirmationRequired(true);
        setError("Please confirm your email before logging in.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function onResendConfirmation() {
    if (!email) return;
    setConfirmResending(true);
    setError(null);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (resendErr) throw resendErr;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Resend failed";
      setError(message);
    } finally {
      setConfirmResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:px-6">
      <h1 className="text-2xl font-semibold text-white">Welcome back (Log in)</h1>
      <p className="mt-2 text-zinc-300">
        Already signed up? Log in here. If you signed up with email and did not
        verify yet, confirm your inbox first.
      </p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
        <OAuthButtons />

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-wide text-zinc-400">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={onSubmit} className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-300">Email</span>
          <input
            className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-300/50"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-300">Password</span>
          <input
            className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-cyan-300/50"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>

        {error ? <div className="text-sm text-red-300">{error}</div> : null}

          {confirmationRequired ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-200">
              <div className="font-semibold text-white">
                Please confirm your email
              </div>
              <div className="mt-1 text-zinc-300">
                We sent a confirmation link to <span className="font-medium">{email}</span>.
                If you don&apos;t see it, resend the email.
              </div>
              <button
                type="button"
                onClick={onResendConfirmation}
                disabled={confirmResending}
                className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-60"
              >
                {confirmResending ? "Resending..." : "Resend confirmation"}
              </button>
            </div>
          ) : null}

        <button
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300/30 to-violet-300/30 px-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
        </form>
      </div>

      <div className="mt-5 text-center text-sm text-zinc-400">
        Don&apos;t have an account?{" "}
        <a className="text-cyan-200 hover:underline" href="/signup">
          Sign up
        </a>
      </div>
    </div>
  );
}

