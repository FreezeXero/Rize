import { Github, Linkedin, Twitter } from "lucide-react";
import { StartBuildingLink } from "../auth/StartBuildingLink";

export function FooterSection(props: { variant?: "full" | "minimal" }) {
  const minimal = props.variant === "minimal";

  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Make your next resume feel unfairly good.
            </h2>
            <p className="mt-3 text-zinc-300">Built by Rize.</p>
          </div>

          {!minimal ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <StartBuildingLink
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 to-violet-300 px-6 text-sm font-semibold text-[#050509] shadow-[0_0_30px_rgba(34,211,238,0.25)] transition hover:brightness-110 hover:scale-[1.02]"
              >
                Start free
              </StartBuildingLink>
            </div>
          ) : null}
        </div>

        {!minimal ? (
          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-zinc-500">© {new Date().getFullYear()} Rize</div>
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:border-cyan-300/30 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:border-cyan-300/30 hover:text-white"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="#"
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300 transition hover:border-cyan-300/30 hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-8 text-sm text-zinc-500">© {new Date().getFullYear()} Rize</div>
        )}
      </div>
    </footer>
  );
}
