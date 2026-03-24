"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browser";
import { LoggedInNav } from "./LoggedInNav";

export function HeaderNavLinks() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setLoggedIn(Boolean(data.session?.user));
      setLoading(false);
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(Boolean(session?.user));
      setLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="hidden flex-1 md:block" aria-hidden />;
  }

  if (loggedIn) {
    return <LoggedInNav />;
  }

  return (
    <nav className="hidden flex-1 items-center justify-center gap-3 text-sm md:flex">
      <a
        className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
        href="/#features"
      >
        Features
      </a>
      <Link
        className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
        href="/pricing"
      >
        Pricing
      </Link>
      <Link
        className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
        href="/help"
      >
        Help
      </Link>
    </nav>
  );
}
