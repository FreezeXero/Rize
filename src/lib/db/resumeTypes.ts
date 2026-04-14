export type ResumeSectionEducation = {
  school: string;
  location?: string;
  degree: string;
  start?: string;
  end?: string;
  details: string;
};

export type ResumeBulletSet = {
  bullets: string[];
};

export type ResumeSectionExperience = {
  company: string;
  location?: string;
  role: string;
  start?: string;
  end?: string;
  bullets: string[];
};

export type ResumeSectionProject = {
  name: string;
  link: string;
  bullets: string[];
};

export type ResumeContent = {
  // Shown as the large name at the top of the PDF.
  fullName: string;
  // Shown directly under the name in the PDF templates.
  contactLine: string;
  education: ResumeSectionEducation[];
  experience: ResumeSectionExperience[];
  projects: ResumeSectionProject[];
  // Harvard: “Leadership/Activities”. Stored separately from projects.
  leadershipActivities: ResumeSectionProject[];
  skills: string[];
  summary: string;
  // For LaTeX templates (Pro/Max), we can store generated LaTeX here for export.
  // Free users can edit this manually.
  latexSource?: string;
  // Pro/Max feature: allow extra user-defined sections (e.g., Publications).
  customSections?: Array<{
    title: string;
    /** When set, PDF shows this as free-form body (paragraphs); bullets ignored. */
    body?: string;
    bullets?: string[];
  }>;
  /** Small / Normal / Large — PDF scales fonts and tightens spacing on Large to stay one page. */
  resumeTextScale?: "small" | "normal" | "large";
  /** Ordered section ids: summary, education, experience, projects, leadership, skills, custom:0, … */
  sectionOrder?: string[];
  /** Optional per-section title overrides keyed by section id. */
  sectionTitles?: Record<string, string>;
};

export type ResumeTemplateKey =
  | "jakes_latex"
  | "mit_latex"
  | "stanford_latex"
  | "mit_stanford_latex"
  | "google_standard"
  | "harvard_classic"
  | "modern_grid_pro"
  | "tech_executive_pro"
  | "minimalist_pro"
  | "classic_serif_pro"
  | "creative_split_pro"
  | "apollo_pro"
  | "tempera_pro"
  | "euclid_pro";

