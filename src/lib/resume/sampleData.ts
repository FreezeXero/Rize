import type { ResumeContent } from "@/lib/db/resumeTypes";

/** Default guided-edit content shown in the editor and new resumes (except legacy Jake-specific flows). */
export const JOHN_DOE_SAMPLE_CONTENT: ResumeContent = {
  fullName: "John Doe",
  contactLine:
    "(555) 123-4567 | johndoe@email.com | linkedin.com/in/johndoe | github.com/johndoe",
  summary:
    "Computer Science graduate with internship experience shipping full-stack features, improving reliability, and collaborating across product and design.",
  education: [
    {
      school: "University of Washington",
      location: "Seattle, WA",
      degree: "B.S. Computer Science, GPA 3.8",
      start: "Sept 2021",
      end: "Jun 2025",
      details:
        "Relevant coursework: Data Structures, Algorithms, Databases, Distributed Systems, Software Engineering",
    },
  ],
  experience: [
    {
      company: "Stripe",
      location: "San Francisco, CA",
      role: "Software Engineer Intern",
      start: "Jun 2024",
      end: "Aug 2024",
      bullets: [
        "Implemented payment reconciliation dashboards in React + TypeScript; adopted by 30+ internal analysts.",
        "Reduced batch job runtime by 42% by profiling hotspots and parallelizing Postgres queries.",
        "Partnered with risk team to ship feature flags and guardrails for a high-traffic settlement workflow.",
      ],
    },
    {
      company: "Databricks",
      location: "San Francisco, CA",
      role: "Software Engineering Intern",
      start: "May 2023",
      end: "Aug 2023",
      bullets: [
        "Built Spark notebook utilities in Python to automate schema validation for customer pipelines.",
        "Improved observability with structured logging and Grafana alerts, cutting triage time by ~35%.",
        "Authored design docs and led a sprint retro that clarified ownership across two service teams.",
      ],
    },
    {
      company: "University of Washington — Paul G. Allen School",
      location: "Seattle, WA",
      role: "Undergraduate Teaching Assistant (CSE 331)",
      start: "Jan 2024",
      end: "Jun 2024",
      bullets: [
        "Mentored 60+ students on software design, testing, and code review in Java.",
        "Held weekly office hours and debug sessions; maintained 4.8/5 TA feedback average.",
      ],
    },
  ],
  projects: [
    {
      name: "CampusRide (mobile + API)",
      link: "github.com/johndoe/campusride",
      bullets: [
        "React Native app + Node/Express backend with PostgreSQL; real-time ETA via WebSockets.",
        "Shipped ride-matching and in-app chat; 800+ beta installs across student orgs.",
      ],
    },
    {
      name: "Distributed KV Lab",
      link: "github.com/johndoe/dkv-lab",
      bullets: [
        "Go implementation of Raft consensus with replicated log and snapshotting (course capstone).",
        "Benchmarked under load: stable leader election and sub-25ms replicated writes in local cluster.",
      ],
    },
  ],
  leadershipActivities: [],
  skills: [
    "Languages: TypeScript, JavaScript, Python, Java, Go, SQL",
    "Frameworks: React, Next.js, Node.js, Express, React Native",
    "Tools: Git, Docker, AWS, PostgreSQL, Redis, Grafana",
  ],
  customSections: [],
};

export const JAKES_SAMPLE_CONTENT: ResumeContent = {
  fullName: "Alex Johnson",
  contactLine:
    "alex.johnson@umich.edu • (734) 555-0191 • linkedin.com/in/alexjohnson • github.com/alexjcodes • Ann Arbor, MI",
  summary:
    "Computer Science student building production-grade web products and backend services with measurable impact.",
  education: [
    {
      school: "University of Michigan",
      location: "Ann Arbor, MI",
      degree: "B.S. in Computer Science, GPA: 3.84/4.00",
      start: "Aug 2021",
      end: "Jun 2026",
      details:
        "Relevant Coursework: Data Structures, Operating Systems, Databases, Computer Networks, Machine Learning",
    },
  ],
  experience: [
    {
      company: "Amazon",
      location: "Seattle, WA",
      role: "Software Development Engineer Intern",
      start: "Jun 2025",
      end: "Aug 2025",
      bullets: [
        "Built a React + TypeScript internal tool used by 40+ ops engineers, reducing manual ticket triage time by 31%.",
        "Optimized high-traffic service endpoints in Java and DynamoDB, lowering p95 latency from 480ms to 220ms.",
        "Added integration tests and CI quality gates that prevented 3 production regressions before release.",
      ],
    },
    {
      company: "Capital One",
      location: "McLean, VA",
      role: "Software Engineering Intern",
      start: "May 2024",
      end: "Aug 2024",
      bullets: [
        "Developed Node.js microservice for fraud signals ingestion, processing 1.2M+ events/day via Kafka.",
        "Implemented observability dashboards with Datadog and reduced incident investigation time by 45%.",
        "Shipped REST APIs with OpenAPI specs and contract tests adopted by 3 downstream teams.",
      ],
    },
    {
      company: "University of Michigan ITS",
      location: "Ann Arbor, MI",
      role: "Software Engineer (Part-time)",
      start: "Sep 2023",
      end: "Apr 2024",
      bullets: [
        "Built a Next.js portal for student support workflows used by 8,000+ monthly active users.",
        "Introduced server-side caching and query optimizations that improved page load performance by 38%.",
      ],
    },
  ],
  projects: [
    {
      name: "InterviewPrep AI",
      link: "github.com/alexjcodes/interviewprep-ai",
      bullets: [
        "Built an AI-powered interview prep web app with Next.js, Supabase, and Claude API.",
        "Implemented personalized question generation and session analytics; reached 2,300+ user sessions.",
      ],
    },
    {
      name: "Realtime Collab Whiteboard",
      link: "github.com/alexjcodes/realtime-whiteboard",
      bullets: [
        "Created collaborative whiteboard using React, WebSockets, Node.js, and Redis pub/sub.",
        "Supported low-latency multi-user synchronization with conflict resolution and undo/redo history.",
      ],
    },
  ],
  leadershipActivities: [
    {
      name: "CS Club, Engineering Lead",
      link: "",
      bullets: [
        "Led 6-person team shipping weekly coding interview prep tools for club workshops.",
      ],
    },
  ],
  skills: [
    "Languages: TypeScript, JavaScript, Python, Java, SQL",
    "Frameworks: React, Next.js, Node.js, Express, Tailwind CSS",
    "Tools: Git, Docker, AWS, Supabase, Postman, Datadog",
  ],
  customSections: [],
};

function firstNonEmpty(...values: string[]) {
  for (const value of values) {
    if (value.trim()) return value;
  }
  return "";
}

export function withJakesSampleFallback(input: ResumeContent): ResumeContent {
  return {
    ...input,
    fullName: firstNonEmpty(input.fullName ?? "", JAKES_SAMPLE_CONTENT.fullName),
    contactLine: firstNonEmpty(
      input.contactLine ?? "",
      JAKES_SAMPLE_CONTENT.contactLine
    ),
    summary: firstNonEmpty(input.summary ?? "", JAKES_SAMPLE_CONTENT.summary),
    education:
      input.education.length > 0 ? input.education : JAKES_SAMPLE_CONTENT.education,
    experience:
      input.experience.length > 0
        ? input.experience
        : JAKES_SAMPLE_CONTENT.experience,
    projects: input.projects.length > 0 ? input.projects : JAKES_SAMPLE_CONTENT.projects,
    leadershipActivities:
      (input.leadershipActivities?.length ?? 0) > 0
        ? input.leadershipActivities
        : JAKES_SAMPLE_CONTENT.leadershipActivities,
    skills: input.skills.length > 0 ? input.skills : JAKES_SAMPLE_CONTENT.skills,
    customSections: input.customSections ?? [],
    resumeTextScale: input.resumeTextScale ?? "normal",
    sectionOrder: input.sectionOrder,
    sectionTitles: input.sectionTitles ?? {},
  };
}

export function withJohnDoeFallback(input: ResumeContent): ResumeContent {
  const j = JOHN_DOE_SAMPLE_CONTENT;
  return {
    ...input,
    fullName: firstNonEmpty(input.fullName ?? "", j.fullName),
    contactLine: firstNonEmpty(input.contactLine ?? "", j.contactLine),
    summary: firstNonEmpty(input.summary ?? "", j.summary),
    education: input.education.length > 0 ? input.education : j.education,
    experience: input.experience.length > 0 ? input.experience : j.experience,
    projects: input.projects.length > 0 ? input.projects : j.projects,
    leadershipActivities:
      (input.leadershipActivities?.length ?? 0) > 0
        ? input.leadershipActivities
        : j.leadershipActivities,
    skills: input.skills.length > 0 ? input.skills : j.skills,
    customSections: input.customSections ?? [],
    resumeTextScale: input.resumeTextScale ?? "normal",
    sectionOrder: input.sectionOrder,
    sectionTitles: input.sectionTitles ?? {},
  };
}
