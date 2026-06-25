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
    <nav className="hidden flex-1 items-center justify-center gap-7 md:flex">
      <a
        className="text-sm font-medium text-zinc-300 transition hover:text-white"
        href="/#features"
      >
        Features
      </a>
      <Link
        className="text-sm font-medium text-zinc-300 transition hover:text-white"
        href="/pricing"
      >
        Pricing
      </Link>
      <Link
        className="text-sm font-medium text-zinc-300 transition hover:text-white"
        href="/help"
      >
        Help
      </Link>
    </nav>
  );
}
