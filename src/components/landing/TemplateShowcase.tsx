import { StartBuildingLink } from "../auth/StartBuildingLink";

type TemplatePreview = {
  title: string;
  badge: "LaTeX" | "Standard";
  angleClass: string;
  accent: string;
};

const templates: TemplatePreview[] = [
  {
    title: "Jake's Resume",
    badge: "LaTeX",
    angleClass: "rotate-[-6deg] translate-y-3 translate-x-2",
    accent: "from-cyan-300 to-violet-300",
  },
  {
    title: "Google Resume Format",
    badge: "Standard",
    angleClass: "rotate-[2deg] translate-y-1 translate-x-1",
    accent: "from-cyan-300 to-cyan-200",
  },
  {
    title: "Harvard Resume Template",
    badge: "Standard",
    angleClass: "rotate-[6deg] translate-y-3 translate-x-0",
    accent: "from-violet-300 to-cyan-200",
  },
];

export function TemplateShowcase() {
  return (
    <section id="templates" className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Templates that look great out of the box
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-zinc-300">
          Choose from ATS-friendly layouts and (for Pro/Max) convert your content
          into LaTeX or standard styling.
        </p>
      </div>

      <div className="relative mt-10 h-[340px]">
        {/* Overlapping preview cards */}
        <div className="hidden items-center justify-center md:flex">
          {templates.map((t, idx) => (
            <div
              key={t.title}
              className={[
                "absolute top-8 w-[260px] rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur",
                t.angleClass,
                idx === 0 ? "left-[25%] z-[3]" : idx === 1 ? "left-[35%] z-[4]" : "left-[45%] z-[2]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    Live preview-ready
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold text-zinc-200">
                  {t.badge}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="h-3 w-1/2 rounded bg-white/10" />
                <div className="mt-2 h-2 w-full rounded bg-white/5" />
                <div className="mt-2 h-2 w-5/6 rounded bg-white/5" />
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={[
                      "h-2.5 w-2.5 rounded-full bg-gradient-to-r",
                      t.accent,
                    ].join(" ")}
                  />
                  <div className="h-2 w-3/5 rounded bg-white/10" />
                </div>
                <div className="mt-2 h-2 w-4/6 rounded bg-white/5" />
                <div className="mt-2 h-2 w-2/3 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile: stacked */}
        <div className="flex flex-col items-center gap-4 md:hidden">
          {templates.map((t) => (
            <div
              key={t.title}
              className="w-full max-w-[320px] rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">
                    {t.title}
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">Live preview-ready</div>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold text-zinc-200">
                  {t.badge}
                </div>
              </div>
              <div className="mt-4 h-24 rounded-2xl border border-white/10 bg-black/20" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <StartBuildingLink
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-6 text-sm font-semibold text-[#050509] shadow-[0_0_30px_rgba(34,211,238,0.25)] transition hover:brightness-110 hover:scale-[1.02]"
        >
          Start building
        </StartBuildingLink>
      </div>
    </section>
  );
}

