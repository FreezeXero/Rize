"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/browser";

export function StartBuildingLink(props: {
  className: string;
  children: React.ReactNode;
}) {
  const [href, setHref] = useState("/get-started");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setHref(data.session?.user ? "/dashboard/new" : "/get-started");
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setHref(session?.user ? "/dashboard/new" : "/get-started");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Link href={href} className={props.className}>
      {props.children}
    </Link>
  );
}
