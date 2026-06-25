"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/browser";
import { ChevronDown, Plus } from "lucide-react";

type NavUser = {
  email: string | null;
  firstName: string;
  avatarUrl: string | null;
};

export function AuthNav() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<NavUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const nextUser = data.session?.user;
      if (!nextUser) {
        setUser(null);
      } else {
        const fullName =
          typeof nextUser.user_metadata?.full_name === "string"
            ? nextUser.user_metadata.full_name
            : "";
        const firstName = fullName.trim()
          ? fullName.trim().split(" ")[0]
          : (nextUser.email?.split("@")[0] ?? "Profile");
        const avatarUrl =
          typeof nextUser.user_metadata?.avatar_url === "string"
            ? nextUser.user_metadata.avatar_url
            : null;
        setUser({
          email: nextUser.email ?? null,
          firstName,
          avatarUrl,
        });
      }
      setLoading(false);
    }

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user;
      if (!nextUser) {
        setUser(null);
      } else {
        const fullName =
          typeof nextUser.user_metadata?.full_name === "string"
            ? nextUser.user_metadata.full_name
            : "";
        const firstName = fullName.trim()
          ? fullName.trim().split(" ")[0]
          : (nextUser.email?.split("@")[0] ?? "Profile");
        const avatarUrl =
          typeof nextUser.user_metadata?.avatar_url === "string"
            ? nextUser.user_metadata.avatar_url
            : null;
        setUser({
          email: nextUser.email ?? null,
          firstName,
          avatarUrl,
        });
      }
      setLoading(false);
      setMenuOpen(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onLogout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/logged-out");
  }

  if (loading) {
    return (
      <div className="h-10 w-[140px] rounded-full bg-white/5" aria-hidden />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-full border border-white/10 bg-white/0 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-cyan-300/30 hover:bg-white/5"
        >
          Sign in
        </Link>
        <Link
          href="/get-started"
          className="rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 px-4 py-2 text-sm font-semibold text-[#050509] shadow-[0_0_22px_rgba(34,211,238,0.25)] ring-1 ring-white/10 transition hover:brightness-110"
        >
          Get started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard/new"
        className="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-gradient-to-r from-cyan-300 to-violet-300 px-4 text-sm font-semibold text-[#050509] shadow-[0_0_22px_rgba(34,211,238,0.25)] ring-1 ring-white/10 transition hover:brightness-110"
      >
        <Plus size={15} />
        Create
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 pr-3 text-sm text-zinc-100 transition hover:border-cyan-300/30 hover:bg-white/10"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.firstName} avatar`}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
                const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (next) next.style.display = "grid";
              }}
            />
          ) : null}
          <span
            style={{ display: user.avatarUrl ? "none" : "grid" }}
            className="h-7 w-7 place-items-center rounded-full bg-cyan-300/20 text-xs font-semibold text-cyan-200"
          >
            {user.firstName.charAt(0).toUpperCase()}
          </span>
          <span className="max-w-20 truncate">{user.firstName}</span>
          <ChevronDown size={14} className="text-zinc-400" />
        </button>

        {menuOpen ? (
          <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0b1120] shadow-xl">
            <div className="border-b border-white/10 px-3 py-2 text-xs text-zinc-400">
              {user.email ?? "Logged in"}
            </div>
            <Link
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/10"
            >
              Upgrade Plan
            </Link>
            <Link
              href="/help"
              onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 text-sm text-zinc-100 transition hover:bg-white/10"
            >
              Help & FAQ
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="block w-full border-t border-white/10 px-3 py-2 text-left text-sm text-red-200 transition hover:bg-red-500/10"
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

