/**
 * Remove LinkedIn UI chrome, salary info, and engagement metrics before
 * sending to Claude. We only remove short lines that clearly match noise
 * patterns — long lines (> 80 chars) are always kept as they're JD content.
 */
export function stripJobPostingNoise(raw: string): string {
  const lines = raw.split("\n");

  const cleaned = lines.filter((line) => {
    const t = line.trim();

    // Always keep long lines — they're almost certainly real JD content
    if (t.length > 80) return true;

    // LinkedIn engagement metrics
    if (/^\d+\s+(people|applicants?)\s+(clicked|applied|viewed)/i.test(t)) return false;
    if (/^\d+\s+connections?\s*$/i.test(t)) return false;

    // Single-word / very short UI artifacts
    if (/^(reposted|promoted|save|apply|follow|connect)\s*$/i.test(t)) return false;

    // "X days/weeks/hours ago" timestamps (always metadata)
    if (/^\d+\s+(day|week|hour|minute)s?\s+ago/i.test(t)) return false;
    if (/\d+\s+(day|week|hour|minute)s?\s+ago\s*·?\s*(reposted|promoted)?\s*$/i.test(t))
      return false;

    // Salary ranges ($X - $Y or $X/yr)
    if (/\$[\d,]+[kK]?\s*[-–—]\s*\$[\d,]+[kK]?/i.test(t)) return false;
    if (/^\$[\d,]+[kK]?\s*\/\s*(yr|year|hr|hour|mo|month)\s*$/i.test(t)) return false;

    // Short-line-only UI chrome (buttons, toggles)
    if (t.length < 40 && /\b(easy\s+apply|quick\s+apply|apply\s+now)\b/i.test(t)) return false;
    if (t.length < 30 && /\b(save\s+job|share\s+job|report\s+job)\b/i.test(t)) return false;
    if (t.length < 20 && /\b(show\s+more|show\s+less)\b/i.test(t)) return false;

    return true;
  });

  return cleaned.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

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
  const topMissing = missingKeywords.slice(0, 8);

  const suggestions = topMissing.slice(0, 5).map((kw) => {
    const pretty = kw.charAt(0).toUpperCase() + kw.slice(1);
    return `If you have experience with ${pretty}, add it explicitly to your Technical Skills or a relevant project/experience description.`;
  });

  return { matchPercentage, missingKeywords: topMissing, suggestions };
}

