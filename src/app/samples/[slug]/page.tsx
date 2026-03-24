import Link from "next/link";
import { notFound } from "next/navigation";

const MAJORS: Record<string, string> = {
  "computer-science": "Computer Science",
  business: "Business",
  engineering: "Engineering",
  marketing: "Marketing",
  finance: "Finance",
  "data-science": "Data Science",
  design: "Design",
  "pre-med": "Pre-Med",
  law: "Law",
  education: "Education",
};

export function generateStaticParams() {
  return Object.keys(MAJORS).map((slug) => ({ slug }));
}

export default function SampleMajorPage({ params }: { params: { slug: string } }) {
  const label = MAJORS[params.slug];
  if (!label) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Samples</p>
      <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{label} resume</h1>
      <p className="mt-3 text-zinc-300">
        Example structure and keywords for {label.toLowerCase()} roles. Use the editor to tailor
        bullets to your experience—this page is a starting point.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/resumes/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 text-sm font-semibold text-[#050509] transition hover:brightness-110"
        >
          Create resume
        </Link>
        <Link
          href="/help#resume-examples"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-black/20 px-5 text-sm font-semibold text-zinc-100 transition hover:border-cyan-300/40 hover:bg-white/10"
        >
          More examples
        </Link>
      </div>
    </div>
  );
}
