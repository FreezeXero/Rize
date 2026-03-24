import type { ResumeContent } from "@/lib/db/resumeTypes";
import { resolveSectionOrder } from "@/lib/pdf/sectionOrder";

export function escapeLatex(input: string) {
  return input
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\^/g, "\\^{}")
    .replace(/~/g, "\\~{}");
}

function jakeLatexPreamble(docClassPt: number) {
  return `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,${docClassPt}pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

% Education: school | dates on row 1; degree full width on row 2; optional details wrap on row 3 (not beside dates).
\\newcommand{\\resumeEducationEntryTwo}[3]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{@{}p{0.62\\textwidth}@{\\extracolsep{\\fill}}r@{}}
      \\textbf{#1} & \\textit{\\small #3} \\\\
      \\multicolumn{2}{@{}p{0.94\\textwidth}}{\\textit{\\small #2}} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeEducationEntry}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{@{}p{0.62\\textwidth}@{\\extracolsep{\\fill}}r@{}}
      \\textbf{#1} & \\textit{\\small #4} \\\\
      \\multicolumn{2}{@{}p{0.94\\textwidth}}{\\textit{\\small #2}} \\\\
      \\multicolumn{2}{@{}p{0.94\\textwidth}}{\\raggedright\\small #3} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}
`;
}

function latexDocClassPt(scale: ResumeContent["resumeTextScale"] | undefined): number {
  switch (scale ?? "normal") {
    case "small":
      return 10;
    case "large":
      return 12;
    default:
      return 11;
  }
}

function buildEducationLatex(content: ResumeContent): string {
  const education = content.education
    .map((e) => {
      const dates = escapeLatex(`${e.start} -- ${e.end}`);
      const details = (e.details ?? "").trim();
      if (details) {
        return `    \\resumeEducationEntry
      {${escapeLatex(e.school)}}{${escapeLatex(e.degree)}}{${escapeLatex(details)}}{${dates}}`;
      }
      return `    \\resumeEducationEntryTwo
      {${escapeLatex(e.school)}}{${escapeLatex(e.degree)}}{${dates}}`;
    })
    .join("\n");
  return `\\section{Education}
  \\resumeSubHeadingListStart
${education || "    \\item \\textit{Add your education.}"}
  \\resumeSubHeadingListEnd`;
}

function buildExperienceLatex(content: ResumeContent): string {
  const experience = content.experience
    .map(
      (e) => `    \\resumeSubheading
      {${escapeLatex(e.role)}}{${escapeLatex(`${e.start} -- ${e.end}`)}}
      {${escapeLatex(e.company)}}{}
      \\resumeItemListStart
${e.bullets.map((b) => `        \\resumeItem{${escapeLatex(b)}}`).join("\n")}
      \\resumeItemListEnd`
    )
    .join("\n\n");
  return `\\section{Experience}
  \\resumeSubHeadingListStart
${experience || "    \\item \\textit{Add your experience.}"}
  \\resumeSubHeadingListEnd`;
}

function buildProjectsLatex(content: ResumeContent): string {
  const projects = content.projects
    .map(
      (p) => `      \\resumeProjectHeading
          {\\textbf{${escapeLatex(p.name)}} $|$ \\emph{${escapeLatex(p.link || "Project")}}}{}
          \\resumeItemListStart
${p.bullets.map((b) => `            \\resumeItem{${escapeLatex(b)}}`).join("\n")}
          \\resumeItemListEnd`
    )
    .join("\n");
  return `\\section{Projects}
    \\resumeSubHeadingListStart
${projects || "      \\item \\textit{Add your projects.}"}
    \\resumeSubHeadingListEnd`;
}

function buildLeadershipLatex(content: ResumeContent): string {
  const la = content.leadershipActivities ?? [];
  const blocks = la
    .map(
      (p) => `      \\resumeProjectHeading
          {\\textbf{${escapeLatex(p.name)}} $|$ \\emph{${escapeLatex(p.link || "")}}}{}
          \\resumeItemListStart
${p.bullets.map((b) => `            \\resumeItem{${escapeLatex(b)}}`).join("\n")}
          \\resumeItemListEnd`
    )
    .join("\n");
  return `\\section{Leadership and Activities}
    \\resumeSubHeadingListStart
${blocks || "      \\item \\textit{Add leadership or activities.}"}
    \\resumeSubHeadingListEnd`;
}

function buildSkillsLatex(content: ResumeContent): string {
  const lines = (content.skills || []).map((s) => `     ${escapeLatex(s)} \\\\`).join("\n");
  return `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${lines || "     \\textit{Add skills.} \\\\"}
    }}
 \\end{itemize}`;
}

function buildSummaryLatex(content: ResumeContent): string {
  const t = (content.summary || "").trim();
  const body = t ? escapeLatex(t).replace(/\n/g, "\\\\\n") : "\\textit{Add a concise professional summary.}";
  return `\\section{Summary}
\\begin{flushleft}
{\\small ${body}}
\\end{flushleft}`;
}

function buildCustomSectionLatex(cs: NonNullable<ResumeContent["customSections"]>[0]): string {
  const title = escapeLatex(cs.title || "Custom");
  if (cs.body?.trim()) {
    const body = escapeLatex(cs.body).replace(/\n/g, "\\\\\n");
    return `\\section{${title}}
\\begin{flushleft}
{\\small ${body}}
\\end{flushleft}`;
  }
  if (cs.bullets?.length) {
    return `\\section{${title}}
\\resumeItemListStart
${cs.bullets.map((b) => `  \\resumeItem{${escapeLatex(b)}}`).join("\n")}
\\resumeItemListEnd`;
  }
  return `\\section{${title}}
\\begin{flushleft}\\small\\textit{Add content.}\\end{flushleft}`;
}

/**
 * Jake LaTeX that mirrors `resolveSectionOrder` + PDF (summary, custom sections, leadership,
 * text size via document class point size).
 */
export function buildOfficialJakeLatex(content: ResumeContent): string {
  const docPt = latexDocClassPt(content.resumeTextScale);
  const preamble = jakeLatexPreamble(docPt);

  const contacts = (content.contactLine || "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const contactLatex =
    contacts.length > 0
      ? contacts
          .map((c, i) => (i === 0 ? escapeLatex(c) : `\\underline{${escapeLatex(c)}}`))
          .join(" $|$ ")
      : "555-123-4567 $|$ \\underline{johndoe@email.com}";

  const order = resolveSectionOrder(content, "jakes_latex");
  const bodyChunks: string[] = [];

  for (const id of order) {
    if (id === "summary") {
      bodyChunks.push(buildSummaryLatex(content));
    } else if (id === "education") {
      bodyChunks.push(buildEducationLatex(content));
    } else if (id === "experience") {
      bodyChunks.push(buildExperienceLatex(content));
    } else if (id === "projects") {
      bodyChunks.push(buildProjectsLatex(content));
    } else if (id === "leadership") {
      bodyChunks.push(buildLeadershipLatex(content));
    } else if (id === "skills") {
      bodyChunks.push(buildSkillsLatex(content));
    } else if (id.startsWith("custom:")) {
      const idx = parseInt(id.split(":")[1] ?? "0", 10);
      const cs = content.customSections?.[idx];
      if (cs) bodyChunks.push(buildCustomSectionLatex(cs));
    }
  }

  return `${preamble}
\\begin{document}
\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(content.fullName || "John Doe")}} \\\\ \\vspace{1pt}
    \\small ${contactLatex}
\\end{center}

${bodyChunks.join("\n\n")}

\\end{document}`;
}
