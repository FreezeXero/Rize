"use client";

import React, { useEffect, useRef, useState } from "react";
import { FileText, ShieldCheck, Sparkles } from "lucide-react";

type StatCard = {
  icon: React.ReactNode;
  value: string;
  label: string;
  progress: number; // 0-100
};

export function StatCards() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const cards: StatCard[] = [
    {
      icon: <Sparkles className="text-cyan-200" size={18} />,
      value: "AI-assisted",
      label: "Bullet rewrites",
      progress: 72,
    },
    {
      icon: <FileText className="text-violet-200" size={18} />,
      value: "Export-ready",
      label: "PDF in seconds",
      progress: 61,
    },
    {
      icon: <ShieldCheck className="text-cyan-200" size={18} />,
      value: "ATS aware",
      label: "Keyword scoring",
      progress: 68,
    },
  ];

  return (
    <div ref={ref} className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={[
            "rounded-3xl border border-white/10 bg-white/5 backdrop-blur",
            "p-5 opacity-0 translate-y-3 transition-all duration-700",
            visible ? "opacity-100 translate-y-0" : "",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                {c.icon}
              </span>
              <div>
                <div className="text-lg font-semibold text-white">{c.value}</div>
                <div className="text-sm text-zinc-300">{c.label}</div>
              </div>
            </div>
          </div>

          {/* Progress bars animate when the section scrolls into view */}
          <div className="mt-4">
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-cyan-300/80 to-violet-300/70 transition-all duration-1000 ease-out"
                style={{ width: visible ? `${c.progress}%` : "0%" }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

