export type Plan = "free" | "pro" | "max";
export type BillingCycle = "monthly" | "annual";

export const PLAN_LIMITS = {
  free: {
    maxResumes: 2,
    exportLimitPerMonth: "unlimited" as const,
    maxAIBulletRewritesPerMonth: 10,
    atsCheckerEnabled: false,
    aiLatexConversionEnabled: false,
    templatesAllowed: 4,
  },
  pro: {
    maxResumes: 10,
    exportLimitPerMonth: 30,
    maxAIBulletRewritesPerMonth: 100,
    atsCheckerEnabled: "basic" as const,
    aiLatexConversionEnabled: true,
    templatesAllowed: "all" as const,
  },
  max: {
    maxResumes: "unlimited" as const,
    exportLimitPerMonth: "unlimited" as const,
    maxAIBulletRewritesPerMonth: "unlimited" as const,
    atsCheckerEnabled: "full" as const,
    aiLatexConversionEnabled: true,
    templatesAllowed: "all" as const,
  },
} as const;

export function assertPlan(value: string): Plan {
  if (value === "free" || value === "pro" || value === "max") return value;
  throw new Error(`Unknown plan: ${value}`);
}

