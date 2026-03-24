import type { Plan } from "../plans";
import type { ResumeTemplateKey } from "../db/resumeTypes";

export type TemplateBadge = "LaTeX" | "Standard";

export type ResumeTemplate = {
  key: ResumeTemplateKey;
  name: string;
  description: string;
  badge: TemplateBadge;
  isProOnly?: boolean;
  // If provided, users below this plan should not see/select the template.
  minPlan?: Plan;
};

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    key: "jakes_latex",
    name: "Jake's Resume",
    description: "The gold standard for CS and engineering roles",
    badge: "LaTeX",
    minPlan: "free",
  },
  {
    key: "mit_latex",
    name: "MIT Template",
    description: "Minimal academic format trusted by top engineers",
    badge: "Standard",
    minPlan: "free",
  },
  {
    key: "stanford_latex",
    name: "Stanford Template",
    description:
      "Single-column professional layout inspired by Stanford CareerEd / GSB-style résumés",
    badge: "Standard",
    minPlan: "free",
  },
  {
    key: "google_standard",
    name: "Google Resume Format",
    description: "Clean modern format favored by tech companies",
    badge: "Standard",
    minPlan: "free",
  },
  {
    key: "apollo_pro",
    name: "Apollo",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
  {
    key: "harvard_classic",
    name: "Harvard Resume Template",
    description: "Classic professional format for any industry",
    badge: "Standard",
    minPlan: "free",
  },
  // Additional Pro templates (at least 5). These are locked for Free users.
  {
    key: "modern_grid_pro",
    name: "Modern Grid",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
  {
    key: "tech_executive_pro",
    name: "Tech Executive",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
  {
    key: "minimalist_pro",
    name: "Minimalist",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
  {
    key: "classic_serif_pro",
    name: "Classic Serif",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
  {
    key: "creative_split_pro",
    name: "Creative Split",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
  {
    key: "tempera_pro",
    name: "Tempera",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
  {
    key: "euclid_pro",
    name: "Euclid",
    description: "Premium template for standing out",
    badge: "Standard",
    isProOnly: true,
    minPlan: "pro",
  },
];

export function templateAllowedForPlan(args: {
  template: ResumeTemplate;
  plan: Plan;
}) {
  const order: Plan[] = ["free", "pro", "max"];
  const min = args.template.minPlan ?? "free";
  return order.indexOf(args.plan) >= order.indexOf(min);
}

