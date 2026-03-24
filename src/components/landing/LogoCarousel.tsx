import { Check } from "lucide-react";

type CompanyLogo = { name: string; domain: string };

const COMPANIES: CompanyLogo[] = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Jane Street", domain: "janestreet.com" },
  { name: "Citadel", domain: "citadel.com" },
  { name: "Two Sigma", domain: "twosigma.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  { name: "JPMorgan", domain: "jpmorganchase.com" },
  { name: "Stripe", domain: "stripe.com" },
  { name: "OpenAI", domain: "openai.com" },
  { name: "Uber", domain: "uber.com" },
  { name: "Airbnb", domain: "airbnb.com" },
];

function faviconFor(domain: string) {
  // Reliable favicon endpoint.
  // (Note: some orgs may not have a favicon; in that case the wordmark still shows.)
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
    domain
  )}&sz=64`;
}

export function LogoCarousel() {
  const items = [...COMPANIES, ...COMPANIES];

  return (
    <section className="border-t border-white/5 bg-white/0">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
        <h2 className="text-center text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Trusted by teams who ship
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-zinc-300">
          A fast, developer-friendly workflow for turning your content into
          export-ready resumes.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="rize-marquee-track flex w-max items-center gap-10 py-7 px-6">
            {items.map((c, idx) => (
              <span key={`${c.name}-${idx}`} className="flex items-center gap-3">
                <img
                  src={faviconFor(c.domain)}
                  alt={c.name}
                  className="h-7 w-7 rounded-lg border border-white/10 bg-black/10 opacity-85 transition hover:opacity-100 saturate-125 drop-shadow-[0_0_14px_rgba(34,211,238,0.15)] hover:drop-shadow-[0_0_22px_rgba(34,211,238,0.28)]"
                  loading="lazy"
                  draggable={false}
                />
                <span className="whitespace-nowrap text-sm font-semibold text-zinc-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                  {c.name}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          {["ATS-optimized formats", "Industry-specific templates", "AI-powered optimization"].map((t) => (
            <div
              key={t}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-200"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-300/15 text-cyan-200">
                <Check size={14} />
              </span>
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

