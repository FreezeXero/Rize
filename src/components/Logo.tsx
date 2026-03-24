import React from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5">
        {/* Subtle upward arrow motif */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M4 14.5L14.8 3.7"
            stroke="url(#g)"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M8.4 3.8H15V10.4"
            stroke="url(#g)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient
              id="g"
              x1="4"
              y1="14.5"
              x2="15"
              y2="3.8"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#22D3EE" />
              <stop offset="1" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-cyan-200">
        Rize
      </span>
    </div>
  );
}

