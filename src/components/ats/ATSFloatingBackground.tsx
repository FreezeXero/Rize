"use client";

import { motion } from "framer-motion";

const WORDS = [
  { text: "ATS Score: 78%",      x: "6%",  y: "14%", dur: 22, delay: 0 },
  { text: "Strong match",         x: "72%", y: "8%",  dur: 28, delay: 3.5 },
  { text: "Missing: Kotlin",      x: "82%", y: "38%", dur: 19, delay: 1.8 },
  { text: "Keyword match",        x: "14%", y: "60%", dur: 25, delay: 6 },
  { text: "Recruiter approved",   x: "60%", y: "55%", dur: 31, delay: 2.2 },
  { text: "12 keywords found",    x: "4%",  y: "82%", dur: 24, delay: 4.5 },
  { text: "Resume optimized",     x: "70%", y: "78%", dur: 20, delay: 7 },
];

export function ATSFloatingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {WORDS.map((w, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -18, 6, -10, 0], x: [0, 4, -3, 5, 0] }}
          transition={{ duration: w.dur, repeat: Infinity, ease: "easeInOut", delay: w.delay }}
          className="absolute whitespace-nowrap font-mono text-xs font-medium text-white"
          style={{ left: w.x, top: w.y, opacity: 0.09 }}
        >
          {w.text}
        </motion.span>
      ))}
    </div>
  );
}
