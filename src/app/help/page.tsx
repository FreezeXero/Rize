import { ContactForm } from "@/components/forms/ContactForm";

const FAQ_ITEMS = [
  {
    q: "What is the best resume format for tech jobs?",
    a: "A clean single-column layout with clear section headings, measurable bullets, and a skills line that mirrors the job description tends to perform well for both ATS and humans.",
  },
  {
    q: "Is Jake's Resume template ATS friendly?",
    a: "Yes—when you keep standard headings and avoid complex graphics, Jake-style LaTeX templates are typically ATS-parseable. Always export to PDF and run our ATS checker before you apply.",
  },
  {
    q: "How many pages should my resume be?",
    a: "Most students and early-career candidates should aim for one page. If you have several years of strong, relevant experience, two pages can be OK for some roles.",
  },
  {
    q: "What should I include in my technical skills section?",
    a: "Group skills by category (Languages, Frameworks, Tools/Cloud) and align them with the job posting. Prefer specifics over vague buzzwords.",
  },
  {
    q: "Can I use Rize for non-tech resumes?",
    a: "Absolutely. The editor is flexible—swap sections, rename headings, and tailor bullets to your industry.",
  },
  {
    q: "How does the AI bullet rewrite work?",
    a: "You provide context and a bullet; we return a tighter, impact-focused rewrite. Usage counts against your monthly AI quota based on your plan.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6">
      <h1 className="text-2xl font-semibold text-white">Help &amp; FAQ</h1>
      <p className="mt-2 text-zinc-300">
        Billing, product questions, or feedback — we&apos;re here to help.
      </p>

      <section id="how-to-write-resume" className="mt-12 scroll-mt-24">
        <h2 className="text-lg font-semibold text-white">How to write a resume</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
          <li>Lead with impact: action verb + what you did + outcome (prefer numbers).</li>
          <li>Mirror keywords from the job description without keyword stuffing.</li>
          <li>Keep formatting consistent: dates, punctuation, and heading styles.</li>
          <li>Proofread aloud; one typo can sink an otherwise strong resume.</li>
        </ul>
      </section>

      <section id="ats-tips" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold text-white">ATS tips</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-300">
          <li>Use standard section titles (Experience, Education, Skills).</li>
          <li>Avoid tables, text boxes, and multi-column layouts for critical content.</li>
          <li>Export as PDF unless the employer requests Word.</li>
          <li>Run Rize&apos;s ATS checker against the job description before submitting.</li>
        </ul>
      </section>

      <section id="resume-examples" className="mt-10 scroll-mt-24">
        <h2 className="text-lg font-semibold text-white">Resume examples</h2>
        <p className="mt-3 text-sm text-zinc-300">
          Browse major-specific starting points from the Samples menu in the nav (e.g. Computer Science,
          Business, Engineering). Each sample page links to the template picker so you can build fast.
        </p>
      </section>

      <section id="faq" className="mt-12 scroll-mt-24">
        <h2 className="text-lg font-semibold text-white">Frequently asked questions</h2>
        <div className="mt-6 grid gap-4">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-zinc-200"
            >
              <div className="font-semibold text-white">{item.q}</div>
              <p className="mt-2 leading-relaxed text-zinc-300">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 border-t border-white/10 pt-12">
        <h2 className="text-lg font-semibold text-white">Contact</h2>
        <p className="mt-2 text-sm text-zinc-300">
          Questions about Rize, billing, or the ATS checker? Send us a message.
        </p>
        <div className="mt-6">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
