const STOP_WORDS = new Set(
  [
    "the",
    "and",
    "a",
    "an",
    "to",
    "of",
    "in",
    "for",
    "with",
    "on",
    "at",
    "by",
    "from",
    "as",
    "is",
    "are",
    "be",
    "or",
    "will",
    "you",
    "we",
    "our",
    "your",
    "they",
    "i",
    "it",
    "this",
    "that",
    "can",
    "may",
    "might",
    "should",
    "would",
    "has",
    "have",
    "having",
    "job",
    "role",
    "responsibilities",
    "requirements",
    "experience",
    "skills",
  ].map((s) => s.toLowerCase())
);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+\-#\s]/g, " ")
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function resumeContentToText(resume: {
  contactLine?: string;
  education: { school: string; degree: string; details: string }[];
  experience: { role: string; company: string; bullets: string[] }[];
  projects: { name: string; bullets: string[]; link?: string }[];
  leadershipActivities?: Array<{ name: string; bullets: string[]; link?: string }>;
  skills: string[];
  summary: string;
  customSections?: Array<{ title: string; body?: string; bullets?: string[] }>;
}) {
  const parts: string[] = [];
  if (resume.contactLine) parts.push(resume.contactLine);
  parts.push(resume.summary);
  parts.push(resume.skills.join(" "));
  for (const e of resume.education) parts.push(`${e.school} ${e.degree} ${e.details}`);
  for (const ex of resume.experience) parts.push(`${ex.role} ${ex.company} ${ex.bullets.join(" ")}`);
  for (const p of resume.projects) parts.push(`${p.name} ${p.bullets.join(" ")}`);
  for (const la of resume.leadershipActivities ?? []) {
    parts.push(`${la.name} ${la.bullets.join(" ")}`);
  }
  for (const cs of resume.customSections ?? []) {
    const extra = [cs.body, cs.bullets?.join(" ")].filter(Boolean).join(" ");
    parts.push(`${cs.title} ${extra}`);
  }
  return parts.join("\n");
}

export function computeATSBasic(args: { jobDescription: string; resumeText: string }) {
  const jobTokens = tokenize(args.jobDescription).filter((t) => !STOP_WORDS.has(t));
  const resumeTokens = new Set(tokenize(args.resumeText));

  // Prefer multi-character tokens to avoid matching on tiny words.
  const jobKeywords = Array.from(
    new Set(jobTokens.filter((t) => t.length >= 3))
  );

  if (jobKeywords.length === 0) {
    return { matchPercentage: 0, missingKeywords: [], suggestions: [] as string[] };
  }

  const matched = jobKeywords.filter((k) => resumeTokens.has(k));
  const missingKeywords = jobKeywords.filter((k) => !resumeTokens.has(k));

  const matchPercentage = Math.round((matched.length / jobKeywords.length) * 100);
  const topMissing = missingKeywords.slice(0, 12);

  const suggestions = topMissing.map((kw) => {
    const pretty = kw.toUpperCase();
    return `Consider adding evidence for "${pretty}" in your Experience/Projects bullets (what did you build, measure, or improve?).`;
  });

  return { matchPercentage, missingKeywords: topMissing, suggestions };
}

