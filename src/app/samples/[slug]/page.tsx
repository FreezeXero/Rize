import Link from "next/link";
import { notFound } from "next/navigation";
import { SampleImageGrid } from "@/components/samples/SampleImageGrid";

const rw = (slug: string, title: string) => ({
  src: `https://resumeworded.com/assets/images/resume-guides/${slug}.png`,
  source: "resumeworded.com",
  title,
});

const MAJOR_SAMPLES = {
  "computer-science": {
    label: "Computer Science",
    images: [
      rw("software-engineer", "Software Engineer Resume"),
      rw("software-developer", "Software Developer Resume"),
      rw("entry-level-software-engineer", "Entry-Level Software Engineer Resume"),
      rw("mid-level-software-engineer", "Mid-Level Software Engineer Resume"),
      rw("senior-software-engineer", "Senior Software Engineer Resume"),
      rw("lead-software-engineer", "Lead Software Engineer Resume"),
      rw("principal-software-engineer", "Principal Software Engineer Resume"),
      rw("full-stack-developer", "Full Stack Developer Resume"),
    ],
  },
  "electrical-engineering": {
    label: "Electrical Engineering",
    images: [
      rw("electrical-engineer", "Electrical Engineer Resume"),
      rw("entry-level-electrical-engineer", "Entry-Level Electrical Engineer Resume"),
      rw("electrical-project-engineer", "Electrical Project Engineer Resume"),
      rw("electronic-technician", "Electronic Technician Resume"),
      rw("test-engineer", "Test Engineer Resume"),
      rw("design-engineer", "Design Engineer Resume"),
    ],
  },
  "mechanical-engineering": {
    label: "Mechanical Engineering",
    images: [
      rw("mechanical-engineer", "Mechanical Engineer Resume"),
      rw("entry-level-mechanical-engineer", "Entry-Level Mechanical Engineer Resume"),
      rw("senior-mechanical-engineer", "Senior Mechanical Engineer Resume"),
      rw("mechanical-design-engineer", "Mechanical Design Engineer Resume"),
      rw("manufacturing-engineer", "Manufacturing Engineer Resume"),
      rw("industrial-engineer", "Industrial Engineer Resume"),
    ],
  },
  finance: {
    label: "Finance",
    images: [
      rw("financial-analyst", "Financial Analyst Resume"),
      rw("senior-financial-analyst", "Senior Financial Analyst Resume"),
      rw("investment-banking-analyst", "Investment Banking Analyst Resume"),
      rw("equity-research-analyst", "Equity Research Analyst Resume"),
      rw("investment-analyst", "Investment Analyst Resume"),
      rw("credit-analyst", "Credit Analyst Resume"),
      rw("risk-analyst", "Risk Analyst Resume"),
      rw("financial-controller", "Financial Controller Resume"),
    ],
  },
  "data-science": {
    label: "Data Science",
    images: [
      rw("data-scientist", "Data Scientist Resume"),
      rw("entry-level-data-scientist", "Entry-Level Data Scientist Resume"),
      rw("senior-data-scientist", "Senior Data Scientist Resume"),
      rw("data-engineer", "Data Engineer Resume"),
      rw("data-analyst", "Data Analyst Resume"),
      rw("entry-level-data-analyst", "Entry-Level Data Analyst Resume"),
      rw("business-intelligence-analyst", "Business Intelligence Analyst Resume"),
      rw("business-intelligence-engineer", "Business Intelligence Engineer Resume"),
    ],
  },
  biology: {
    label: "Biology",
    images: [
      rw("clinical-research-assistant", "Clinical Research Assistant Resume"),
      rw("clinical-research-coordinator", "Clinical Research Coordinator Resume"),
      rw("research-assistant", "Research Assistant Resume"),
      rw("microbiologist", "Microbiologist Resume"),
      rw("environmental-scientist", "Environmental Scientist Resume"),
      rw("quality-control-manager", "Quality Control Manager Resume"),
    ],
  },
  psychology: {
    label: "Psychology",
    images: [
      rw("psychologist", "Psychologist Resume"),
      rw("clinical-psychologist", "Clinical Psychologist Resume"),
      rw("psychology-research-assistant", "Psychology Research Assistant Resume"),
      rw("therapist", "Therapist Resume"),
      rw("case-manager", "Case Manager Resume"),
      rw("clinical-social-worker", "Clinical Social Worker Resume"),
      rw("patient-care-coordinator", "Patient Care Coordinator Resume"),
      rw("psychiatric-nurse", "Psychiatric Nurse Resume"),
    ],
  },
  marketing: {
    label: "Marketing",
    images: [
      rw("digital-marketing-specialist", "Digital Marketing Specialist Resume"),
      rw("marketing-manager", "Marketing Manager Resume"),
      rw("content-marketing-manager", "Content Marketing Manager Resume"),
      rw("social-media-manager", "Social Media Manager Resume"),
      rw("brand-manager", "Brand Manager Resume"),
      rw("growth-marketer", "Growth Marketer Resume"),
      rw("growth-marketing-manager", "Growth Marketing Manager Resume"),
      rw("product-marketing-manager", "Product Marketing Manager Resume"),
    ],
  },
  "civil-engineering": {
    label: "Civil Engineering",
    images: [
      rw("civil-engineer", "Civil Engineer Resume"),
      rw("entry-level-civil-engineer", "Entry-Level Civil Engineer Resume"),
      rw("senior-civil-engineer", "Senior Civil Engineer Resume"),
      rw("structural-engineer", "Structural Engineer Resume"),
      rw("project-engineer", "Project Engineer Resume"),
      rw("site-engineer", "Site Engineer Resume"),
    ],
  },
  "political-science": {
    label: "Political Science",
    images: [
      rw("director-of-public-policy", "Director of Public Policy Resume"),
      rw("public-policy-analyst", "Public Policy Analyst Resume"),
      rw("political-campaign-manager", "Political Campaign Manager Resume"),
      rw("regulatory-affairs-specialist", "Regulatory Affairs Specialist Resume"),
      rw("compliance-analyst", "Compliance Analyst Resume"),
      rw("communications-manager", "Communications Manager Resume"),
      rw("chief-of-staff", "Chief of Staff Resume"),
      rw("program-manager", "Program Manager Resume"),
    ],
  },
} as const;

export function generateStaticParams() {
  return Object.keys(MAJOR_SAMPLES).map((slug) => ({ slug }));
}

export default function SampleMajorPage({ params }: { params: { slug: string } }) {
  const major = MAJOR_SAMPLES[params.slug as keyof typeof MAJOR_SAMPLES];
  if (!major) notFound();
  const label = major.label;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">Samples</p>
      <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">{label} resume examples</h1>
      <p className="mt-3 text-zinc-300">
        Browse resume thumbnails for {label.toLowerCase()} roles. Click any image to view full screen,
        then download if you want to keep a reference while building your own.
      </p>

      <div className="mt-8">
        <SampleImageGrid majorLabel={label} images={major.images} />
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/dashboard/resumes/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-300 to-violet-300 px-5 text-sm font-semibold text-[#050509] transition hover:brightness-110"
        >
          Build your resume now
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
