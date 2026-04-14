import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ResumeTemplateKey, ResumeContent } from "../db/resumeTypes";
import { getPdfScale, scaleSize } from "./pdfTextScale";
import { resolveSectionOrder } from "./sectionOrder";

/** Stacked bullets for Google/Harvard/Pro PDF templates (not Jake/MIT/Stanford). */
function renderStandardPdfBulletList(
  bullets: string[],
  bulletTextStyle: Style,
  itemStyle: Style
): React.ReactNode {
  return (
    <View style={{ flexDirection: "column", width: "100%", marginTop: 2 }}>
      {bullets.map((b, i) => (
        <View key={i} wrap={false} style={itemStyle}>
          <Text style={[bulletTextStyle, { lineHeight: 1.45 }]}>• {b}</Text>
        </View>
      ))}
    </View>
  );
}

function renderCustomSectionForStandardPdf(
  cs: NonNullable<ResumeContent["customSections"]>[0],
  detailsStyle: Style,
  bulletTextStyle: Style
): React.ReactNode {
  if (cs.body?.trim()) {
    return cs.body
      .split("\n")
      .filter((l) => l.trim())
      .map((line, i) => (
        <Text key={i} style={detailsStyle}>
          {line}
        </Text>
      ));
  }
  if (cs.bullets?.length) {
    return renderStandardPdfBulletList(cs.bullets, bulletTextStyle, {
      marginBottom: 4,
      marginLeft: 12,
      width: "100%",
    } as Style);
  }
  return <Text style={detailsStyle}>Add content.</Text>;
}

function renderCustomSectionPdf(
  cs: NonNullable<ResumeContent["customSections"]>[0],
  styles: {
    details: object;
    bulletRow: object;
    bulletChar: object;
    bulletText: object;
  }
): React.ReactNode {
  if (cs.body?.trim()) {
    return cs.body
      .split("\n")
      .filter((l) => l.trim())
      .map((line, i) => (
        <Text key={i} style={styles.details as never}>
          {line}
        </Text>
      ));
  }
  if (cs.bullets?.length) {
    return cs.bullets.map((b, i) => (
      <View key={i} style={styles.bulletRow as never}>
        <Text style={styles.bulletChar as never}>•</Text>
        <Text style={styles.bulletText as never}>{b}</Text>
      </View>
    ));
  }
  return <Text style={styles.details as never}>Add content.</Text>;
}

export function ResumeDocument(args: { resume: ResumeContent; template: ResumeTemplateKey }) {
  const resume = args.resume;
  const fullName =
    typeof resume.fullName === "string" && resume.fullName.trim()
      ? resume.fullName.trim()
      : "Your Name";
  const contactRaw = typeof resume.contactLine === "string" ? resume.contactLine : "";
  const contactParts = contactRaw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
  const contactDisplay =
    contactParts.length >= 2 ? contactParts.join(" | ") : contactRaw || "contact info";

  const education = resume.education ?? [];
  const experience = resume.experience ?? [];
  const projects = resume.projects ?? [];
  const leadershipActivities = resume.leadershipActivities ?? [];
  const skills = resume.skills ?? [];
  const summary = resume.summary ?? "";
  const customSections = resume.customSections ?? [];
  const sectionTitles = resume.sectionTitles ?? {};

  const sectionTitle = (id: string, fallback: string) => {
    const raw = sectionTitles[id];
    return typeof raw === "string" && raw.trim() ? raw.trim() : fallback;
  };

  const dateRange = (start?: string, end?: string) => {
    const s = (start ?? "").trim();
    const e = (end ?? "").trim();
    if (s && e) return `${s} - ${e}`;
    return s || e || "";
  };

  type PdfBlockStyles = {
    details: Style;
    bullet: Style;
    bulletChar: Style;
    bulletText: Style;
    entryHeaderRow: Style;
    entryCompany: Style;
    entryDates: Style;
    entrySubtitle: Style;
    projectTitle: Style;
    skillsLine: Style;
    paragraph: Style;
  };

  const buildPdfBlocks = (
    s: ReturnType<typeof getPdfScale>,
    styles: PdfBlockStyles,
    wrap: (title: string, children: React.ReactNode) => React.ReactNode,
    opts: {
      leadershipMode: "omit-if-empty" | "placeholder-if-empty";
      summaryPlaceholder: string;
      excludeSectionIds?: Set<string>;
    }
  ): Record<string, React.ReactNode | null> => {
    const ex = opts.excludeSectionIds ?? new Set<string>();
    const blocks: Record<string, React.ReactNode | null> = {};

    if (!ex.has("summary")) {
      blocks.summary = wrap(
        sectionTitle("summary", "Summary"),
        <Text style={styles.paragraph}>{summary ? summary : opts.summaryPlaceholder}</Text>
      );
    }

    if (!ex.has("education")) {
      blocks.education = wrap(
        sectionTitle("education", "Education"),
        education.length === 0 ? (
          <Text style={styles.details}>Add your education.</Text>
        ) : (
          education.map((e, idx) => (
            <View key={idx} wrap={false} style={{ marginBottom: 8 * s.sectionGap }}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryCompany}>{e.school}</Text>
                {dateRange(e.start, e.end) ? (
                  <Text style={styles.entryDates}>{dateRange(e.start, e.end)}</Text>
                ) : null}
              </View>
              <Text style={styles.entrySubtitle}>{e.degree}</Text>
              {e.location ? <Text style={styles.details}>{e.location}</Text> : null}
              {e.details ? <Text style={styles.details}>{e.details}</Text> : null}
            </View>
          ))
        )
      );
    }

    if (!ex.has("experience")) {
      blocks.experience = wrap(
        sectionTitle("experience", "Experience"),
        experience.length === 0 ? (
          <Text style={styles.details}>Add your experience.</Text>
        ) : (
          experience.map((x, idx) => (
            <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryCompany}>{x.company}</Text>
                {dateRange(x.start, x.end) ? (
                  <Text style={styles.entryDates}>{dateRange(x.start, x.end)}</Text>
                ) : null}
              </View>
              <Text style={styles.entrySubtitle}>{x.role}</Text>
              {x.location ? (
                <Text style={styles.details}>{x.location}</Text>
              ) : null}
              {renderStandardPdfBulletList(x.bullets, styles.bulletText, {
                ...styles.bullet,
                marginBottom: 4,
                width: "100%",
              } as Style)}
            </View>
          ))
        )
      );
    }

    if (!ex.has("projects")) {
      blocks.projects = wrap(
        sectionTitle("projects", "Projects"),
        projects.length === 0 ? (
          <Text style={styles.details}>Add your projects.</Text>
        ) : (
          projects.map((p, idx) => (
            <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
              <Text style={styles.projectTitle}>
                {p.name}
                {p.link ? ` (${p.link})` : ""}
              </Text>
              {renderStandardPdfBulletList(p.bullets, styles.bulletText, {
                ...styles.bullet,
                marginBottom: 4,
                width: "100%",
              } as Style)}
            </View>
          ))
        )
      );
    }

    if (!ex.has("leadership")) {
      if (opts.leadershipMode === "omit-if-empty" && leadershipActivities.length === 0) {
        blocks.leadership = null;
      } else {
        blocks.leadership = wrap(
          sectionTitle("leadership", "Leadership and Activities"),
          leadershipActivities.length === 0 ? (
            <Text style={styles.details}>Add leadership/activities.</Text>
          ) : (
            leadershipActivities.map((p, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {renderStandardPdfBulletList(p.bullets, styles.bulletText, {
                  ...styles.bullet,
                  marginBottom: 4,
                  width: "100%",
                } as Style)}
              </View>
            ))
          )
        );
      }
    }

    if (!ex.has("skills")) {
      blocks.skills = wrap(
        sectionTitle("skills", "Skills"),
        skills.length === 0 ? (
          <Text style={styles.details}>Add relevant skills.</Text>
        ) : (
          <Text style={styles.skillsLine}>{skills.join(", ")}</Text>
        )
      );
    }

    customSections.forEach((cs, i) => {
      if (ex.has(`custom:${i}`)) return;
      blocks[`custom:${i}`] = wrap(
        cs.title || "Custom",
        renderCustomSectionForStandardPdf(cs, styles.details, styles.bulletText)
      );
    });

    return blocks;
  };

  const baseStyles = StyleSheet.create({
    // Shared layout helpers (colors/text rules differ per template).
    rowBetween: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  });

  const renderJake = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Times-Roman",
        fontSize: scaleSize(10.2, s),
        paddingTop: 24 * s.padV,
        paddingBottom: 22 * s.padV,
        paddingHorizontal: 34 * s.padH,
        backgroundColor: "#ffffff",
        color: "#000000",
      },
      name: {
        fontSize: scaleSize(24, s),
        fontFamily: "Times-Bold",
        textAlign: "center",
        color: "#000000",
        letterSpacing: 0.4,
      },
      contact: {
        fontSize: scaleSize(9, s),
        textAlign: "center",
        marginTop: 2,
        color: "#000000",
        textDecoration: "underline",
      },

      sectionHeader: {
        fontSize: scaleSize(10.3, s),
        fontFamily: "Times-Bold",
        letterSpacing: 0.8,
        textAlign: "left",
        color: "#000000",
      },
      sectionTitleRow: { marginBottom: 1.5 * s.sectionGap },
      hr: {
        height: 1,
        backgroundColor: "#000000",
        width: "100%",
        marginTop: 1.5,
        marginBottom: 3 * s.sectionGap,
      },
      section: { marginBottom: 2.2 * s.sectionGap },

      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Times-Bold", color: "#000000", fontSize: scaleSize(10, s) },
      entryDates: { fontSize: scaleSize(9, s), color: "#000000", fontFamily: "Times-Italic" },
      entryDegree: { fontFamily: "Times-Italic", color: "#000000", marginTop: 0.2, fontSize: scaleSize(9, s) },
      details: { fontSize: scaleSize(9, s), color: "#000000", marginTop: 0.2, lineHeight: 1.15 * s.lineTight },

      bulletRow: { flexDirection: "row", marginLeft: 8, marginBottom: 0.8 },
      bulletChar: { width: 7, fontSize: scaleSize(8.5, s), color: "#000000" },
      bulletText: { color: "#000000", fontSize: scaleSize(8.8, s), flex: 1, lineHeight: 1.12 * s.lineTight },

      projectTitle: { fontFamily: "Times-Bold", color: "#000000", fontSize: scaleSize(9.4, s) },
      skillsLine: { color: "#000000", fontSize: scaleSize(8.8, s), lineHeight: 1.12 * s.lineTight },
    });

    const Section = (props: { title: string; children: React.ReactNode }) => (
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeader}>{props.title.toUpperCase()}</Text>
          <View style={styles.hr} />
        </View>
        {props.children}
      </View>
    );

    const blocks: Record<string, React.ReactNode> = {
      summary: (
        <Section title={sectionTitle("summary", "Summary")}>
          <Text style={styles.details}>{summary || "Add a concise professional summary."}</Text>
        </Section>
      ),
      education: (
        <Section title={sectionTitle("education", "Education")}>
          {education.length === 0 ? (
            <Text style={styles.details}>Add your education.</Text>
          ) : (
            education.map((e, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 3 * s.sectionGap }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryCompany}>{e.school}</Text>
                  {e.location ? <Text style={styles.entryDates}>{e.location}</Text> : <Text style={styles.entryDates} />}
                </View>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryDegree}>{e.degree}</Text>
                  {dateRange(e.start, e.end) ? <Text style={styles.entryDates}>{dateRange(e.start, e.end)}</Text> : <Text style={styles.entryDates} />}
                </View>
                {e.details ? <Text style={styles.details}>{e.details}</Text> : null}
              </View>
            ))
          )}
        </Section>
      ),
      experience: (
        <Section title={sectionTitle("experience", "Experience")}>
          {experience.length === 0 ? (
            <Text style={styles.details}>Add your experience.</Text>
          ) : (
            experience.map((x, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 3.5 * s.sectionGap }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryCompany}>{x.company}</Text>
                  {dateRange(x.start, x.end) ? <Text style={styles.entryDates}>{dateRange(x.start, x.end)}</Text> : <Text style={styles.entryDates} />}
                </View>
                <Text style={styles.entryDegree}>{x.role}</Text>
                {x.bullets.map((b, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletChar}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </Section>
      ),
      projects: (
        <Section title={sectionTitle("projects", "Projects")}>
          {projects.length === 0 ? (
            <Text style={styles.details}>Add your projects.</Text>
          ) : (
            projects.map((p, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 3.5 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {p.bullets.map((b, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletChar}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </Section>
      ),
      leadership:
        leadershipActivities.length === 0 ? null : (
          <Section title={sectionTitle("leadership", "Leadership and Activities")}>
            {leadershipActivities.map((p, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 3 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {p.bullets.map((b, bIdx) => (
                  <View key={bIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletChar}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </Section>
        ),
      skills: (
        <Section title={sectionTitle("skills", "Technical Skills")}>
          {skills.length === 0 ? (
            <Text style={styles.details}>Add technical skills.</Text>
          ) : (
            <Text style={styles.skillsLine}>{skills.join(", ")}</Text>
          )}
        </Section>
      ),
    };

    customSections.forEach((cs, i) => {
      blocks[`custom:${i}`] = (
        <Section title={cs.title || "Custom"}>{renderCustomSectionPdf(cs, styles)}</Section>
      );
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.contact}>{contactDisplay}</Text>
          </View>

          <View style={{ marginTop: 6 * s.sectionGap }}>
            {orderedIds.map((id) => {
              const node = blocks[id];
              return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
            })}
          </View>
        </Page>
      </Document>
    );
  };

  const renderHarvard = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Times-Roman",
        fontSize: scaleSize(10.2, s),
        paddingTop: 32 * s.padV,
        paddingBottom: 30 * s.padV,
        paddingHorizontal: 38 * s.padH,
        backgroundColor: "#ffffff",
        color: "#000000",
      },
      name: { fontSize: scaleSize(24, s), fontFamily: "Times-Bold", color: "#000000", textAlign: "left" },
      contact: {
        fontSize: scaleSize(10, s),
        marginTop: 4,
        color: "#000000",
        fontFamily: "Times-Roman",
        textAlign: "left",
      },
      section: { marginBottom: 12 * s.sectionGap },
      sectionHeaderWrap: { marginBottom: 5 },
      sectionHeader: { fontSize: scaleSize(11.5, s), fontFamily: "Times-Bold", color: "#000000" },
      sectionBorder: { height: 1, backgroundColor: "#000000", width: "100%", marginTop: 4 },

      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Times-Bold", color: "#000000", fontSize: scaleSize(10, s) },
      entryDates: { fontSize: scaleSize(9.2, s), color: "#000000", fontFamily: "Times-Roman" },
      entrySubtitle: { fontFamily: "Times-Bold", color: "#000000", marginTop: 2, fontSize: scaleSize(9.5, s) },

      details: {
        fontSize: scaleSize(9.3, s),
        color: "#000000",
        marginTop: 1,
        lineHeight: 1.32 * s.lineTight,
        fontFamily: "Times-Roman",
      },
      paragraph: {
        fontSize: scaleSize(9.5, s),
        color: "#000000",
        marginTop: 1,
        lineHeight: 1.38 * s.lineTight,
        fontFamily: "Times-Roman",
      },
      bullet: { flexDirection: "row", marginLeft: 12, marginBottom: 2 },
      bulletChar: { width: 8, fontSize: scaleSize(9, s) },
      bulletText: { fontSize: scaleSize(9.6, s), fontFamily: "Times-Roman", color: "#000000", flex: 1 },
      projectTitle: { fontFamily: "Times-Bold", color: "#000000", fontSize: scaleSize(10, s) },
      skillsLine: { fontSize: scaleSize(10, s), color: "#000000", marginTop: 2, fontFamily: "Times-Roman" },
      spacer: { marginTop: 12 * s.sectionGap },
    });

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.section}>
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>{title}</Text>
          <View style={styles.sectionBorder} />
        </View>
        {children}
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "placeholder-if-empty",
      summaryPlaceholder: "Add a summary that highlights your strengths.",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.contact}>{contactDisplay}</Text>
          </View>

          <View style={styles.spacer}>
            {orderedIds.map((id) => {
              const node = blocks[id];
              return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
            })}
          </View>
        </Page>
      </Document>
    );
  };

  const renderGoogle = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Helvetica",
        fontSize: scaleSize(10.4, s),
        paddingTop: 38 * s.padV,
        paddingBottom: 30 * s.padV,
        paddingHorizontal: 36 * s.padH,
        backgroundColor: "#ffffff",
      },
      name: {
        fontSize: scaleSize(26, s),
        fontFamily: "Helvetica-Bold",
        textAlign: "center",
        color: "#0f172a",
      },
      contact: {
        fontSize: scaleSize(10, s),
        textAlign: "center",
        marginTop: 5,
        color: "#334155",
        fontFamily: "Helvetica",
      },
      section: { marginBottom: 18 * s.sectionGap },
      headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
      leftAccent: { width: 4, height: 14, backgroundColor: "#06b6d4", marginRight: 10 },
      sectionHeader: { fontSize: scaleSize(12, s), fontFamily: "Helvetica-Bold", color: "#0f172a" },

      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(10, s) },
      entryDates: { fontSize: scaleSize(9.2, s), color: "#64748b" },
      entrySubtitle: { fontFamily: "Helvetica-Bold", color: "#0f172a", marginTop: 2, fontSize: scaleSize(9.5, s) },
      details: {
        fontSize: scaleSize(9.3, s),
        color: "#64748b",
        marginTop: 1,
        lineHeight: 1.3 * s.lineTight,
        fontFamily: "Helvetica",
      },
      bullet: { flexDirection: "row", marginLeft: 12, marginBottom: 2 },
      bulletChar: { width: 8, fontSize: scaleSize(9, s) },
      bulletText: { fontSize: scaleSize(9.6, s), color: "#0f172a", flex: 1, fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(10, s) },
      skillsLine: { fontSize: scaleSize(10.4, s), color: "#0f172a", marginTop: 2, fontFamily: "Helvetica" },
      paragraph: {
        marginTop: 2,
        color: "#0f172a",
        lineHeight: 1.42 * s.lineTight,
        fontFamily: "Helvetica",
      },
    });

    const SectionHeader = (props: { title: string }) => (
      <View style={styles.headerRow}>
        <View style={styles.leftAccent} />
        <Text style={styles.sectionHeader}>{props.title}</Text>
      </View>
    );

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.section}>
        <SectionHeader title={title} />
        {children}
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "omit-if-empty",
      summaryPlaceholder: "Add a summary that highlights your strengths and results.",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.contact}>{contactDisplay}</Text>
          </View>

          <View style={{ marginTop: 18 }}>
            {orderedIds.map((id) => {
              const node = blocks[id];
              return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
            })}
          </View>
        </Page>
      </Document>
    );
  };

  const renderMIT = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    /** MIT Sloan–style: single column, name left, section titles underlined with solid rule. */
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Times-Roman",
        fontSize: scaleSize(10, s),
        paddingTop: 22 * s.padV,
        paddingBottom: 20 * s.padV,
        paddingHorizontal: 34 * s.padH,
        backgroundColor: "#fff",
        color: "#111827",
      },
      name: { fontSize: scaleSize(20, s), fontFamily: "Times-Bold", textAlign: "left", color: "#111827" },
      contact: { marginTop: 3, fontSize: scaleSize(9, s), textAlign: "left", color: "#374151" },
      section: { marginTop: 8 * s.sectionGap },
      sectionTitle: {
        fontSize: scaleSize(9.5, s),
        fontFamily: "Times-Bold",
        letterSpacing: 2,
        color: "#111827",
      },
      sectionRule: {
        height: 1.5,
        backgroundColor: "#111827",
        width: "100%",
        marginTop: 1.5,
        marginBottom: 4 * s.sectionGap,
      },
      row: { ...baseStyles.rowBetween },
      left: { fontFamily: "Times-Bold", fontSize: scaleSize(9.5, s), color: "#111827", flex: 1, paddingRight: 6 },
      right: { fontSize: scaleSize(9, s), fontFamily: "Times-Italic", color: "#4b5563" },
      sub: { fontSize: scaleSize(9, s), marginTop: 1, lineHeight: 1.25 * s.lineTight, color: "#1f2937" },
      bullet: { flexDirection: "row", marginLeft: 8, marginBottom: 1 },
      dash: { width: 10, fontSize: scaleSize(8, s), fontFamily: "Times-Roman", color: "#111827" },
      bt: { fontSize: scaleSize(8.8, s), flex: 1, lineHeight: 1.2 * s.lineTight, color: "#1f2937" },
      projectTitle: { fontFamily: "Times-Bold", fontSize: scaleSize(9.3, s), color: "#111827" },
      skillsLine: { fontSize: scaleSize(9, s), lineHeight: 1.2 * s.lineTight, color: "#1f2937" },
      summary: { fontSize: scaleSize(9, s), lineHeight: 1.25 * s.lineTight, color: "#1f2937" },
    });

    const SloanSection = (props: { title: string; children: React.ReactNode }) => (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{props.title.toUpperCase()}</Text>
        <View style={styles.sectionRule} />
        {props.children}
      </View>
    );

    const blocks: Record<string, React.ReactNode> = {
      summary: (
        <SloanSection title={sectionTitle("summary", "Summary")}>
          <Text style={styles.summary}>{summary || "Add a concise professional summary."}</Text>
        </SloanSection>
      ),
      education: (
        <SloanSection title={sectionTitle("education", "Education")}>
          {education.map((e, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 3 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>{e.school}</Text>
                <Text style={styles.right}>
                  {dateRange(e.start, e.end)}
                </Text>
              </View>
              <Text style={styles.sub}>{e.degree}</Text>
              {e.details ? <Text style={styles.sub}>{e.details}</Text> : null}
            </View>
          ))}
        </SloanSection>
      ),
      experience: (
        <SloanSection title={sectionTitle("experience", "Experience")}>
          {experience.map((x, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 3.2 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>
                  {x.role}, {x.company}
                </Text>
                <Text style={styles.right}>
                  {dateRange(x.start, x.end)}
                </Text>
              </View>
              {x.bullets.map((b, bi) => (
                <View key={bi} style={styles.bullet}>
                  <Text style={styles.dash}>–</Text>
                  <Text style={styles.bt}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </SloanSection>
      ),
      projects: (
        <SloanSection title={sectionTitle("projects", "Projects")}>
          {projects.map((p, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 3 * s.sectionGap }}>
              <Text style={styles.projectTitle}>
                {p.name}
                {p.link ? ` (${p.link})` : ""}
              </Text>
              {p.bullets.map((b, bi) => (
                <View key={bi} style={styles.bullet}>
                  <Text style={styles.dash}>–</Text>
                  <Text style={styles.bt}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </SloanSection>
      ),
      leadership:
        leadershipActivities.length === 0 ? null : (
          <SloanSection title={sectionTitle("leadership", "Leadership")}>
            {leadershipActivities.map((p, i) => (
              <View key={i} wrap={false} style={{ marginBottom: 3 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {p.bullets.map((b, bi) => (
                  <View key={bi} style={styles.bullet}>
                    <Text style={styles.dash}>–</Text>
                    <Text style={styles.bt}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </SloanSection>
        ),
      skills: (
        <SloanSection title={sectionTitle("skills", "Technical Skills")}>
          <Text style={styles.skillsLine}>{skills.length ? skills.join(", ") : "Add skills."}</Text>
        </SloanSection>
      ),
    };

    customSections.forEach((cs, i) => {
      blocks[`custom:${i}`] = (
        <SloanSection title={cs.title || "Custom"}>
          {renderCustomSectionPdf(cs, {
            details: styles.summary,
            bulletRow: styles.bullet,
            bulletChar: styles.dash,
            bulletText: styles.bt,
          })}
        </SloanSection>
      );
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.contact}>{contactDisplay}</Text>
          {orderedIds.map((id) => {
            const node = blocks[id];
            return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
          })}
        </Page>
      </Document>
    );
  };

  const renderStanford = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const cardinal = "#8C1515";
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Helvetica",
        fontSize: scaleSize(10.2, s),
        paddingTop: 28 * s.padV,
        paddingBottom: 26 * s.padV,
        paddingHorizontal: 36 * s.padH,
        backgroundColor: "#fff",
        color: "#111827",
      },
      name: { fontSize: scaleSize(23, s), fontFamily: "Helvetica-Bold", textAlign: "center" },
      contact: {
        marginTop: 4,
        fontSize: scaleSize(9.2, s),
        textAlign: "center",
        color: "#374151",
        fontFamily: "Helvetica",
      },
      section: { marginTop: 12 * s.sectionGap },
      headingWrap: { marginBottom: 5 * s.sectionGap },
      heading: { fontSize: scaleSize(10.5, s), fontFamily: "Helvetica-Bold", color: cardinal, letterSpacing: 0.6 },
      rule: { height: 0.8, backgroundColor: cardinal, marginTop: 3, width: "100%" },
      row: { ...baseStyles.rowBetween },
      left: { fontFamily: "Helvetica-Bold", fontSize: scaleSize(9.6, s) },
      right: { fontSize: scaleSize(9, s), color: "#4b5563", fontFamily: "Helvetica" },
      body: {
        fontSize: scaleSize(9.1, s),
        marginTop: 2,
        lineHeight: 1.28 * s.lineTight,
        fontFamily: "Helvetica",
      },
      bulletRow: { flexDirection: "row", marginLeft: 10, marginBottom: 2 },
      bulletChar: { width: 12, fontSize: scaleSize(8, s), color: cardinal },
      bulletText: { fontSize: scaleSize(9, s), flex: 1, lineHeight: 1.22 * s.lineTight, fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", fontSize: scaleSize(9.5, s) },
      skillsLine: { fontSize: scaleSize(9.2, s), lineHeight: 1.22 * s.lineTight, fontFamily: "Helvetica" },
      summary: { fontSize: scaleSize(9.2, s), lineHeight: 1.3 * s.lineTight, fontFamily: "Helvetica" },
    });

    const StanSection = (props: { title: string; children: React.ReactNode }) => (
      <View style={styles.section}>
        <View style={styles.headingWrap}>
          <Text style={styles.heading}>{props.title.toUpperCase()}</Text>
          <View style={styles.rule} />
        </View>
        {props.children}
      </View>
    );

    const blocks: Record<string, React.ReactNode> = {
      summary: (
        <StanSection title={sectionTitle("summary", "Summary")}>
          <Text style={styles.body}>{summary || "Add a concise professional summary."}</Text>
        </StanSection>
      ),
      education: (
        <StanSection title={sectionTitle("education", "Education")}>
          {education.map((e, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 6 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>{e.school}</Text>
                <Text style={styles.right}>
                  {dateRange(e.start, e.end)}
                </Text>
              </View>
              <Text style={styles.body}>{e.degree}</Text>
              {e.details ? <Text style={styles.summary}>{e.details}</Text> : null}
            </View>
          ))}
        </StanSection>
      ),
      experience: (
        <StanSection title={sectionTitle("experience", "Experience")}>
          {experience.map((x, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 7 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>
                  {x.role}, {x.company}
                </Text>
                <Text style={styles.right}>
                  {dateRange(x.start, x.end)}
                </Text>
              </View>
              {x.bullets.map((b, bi) => (
                <View key={bi} style={styles.bulletRow}>
                  <Text style={styles.bulletChar}>●</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </StanSection>
      ),
      projects: (
        <StanSection title={sectionTitle("projects", "Projects")}>
          {projects.map((p, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 7 * s.sectionGap }}>
              <Text style={styles.projectTitle}>
                {p.name}
                {p.link ? ` (${p.link})` : ""}
              </Text>
              {p.bullets.map((b, bi) => (
                <View key={bi} style={styles.bulletRow}>
                  <Text style={styles.bulletChar}>●</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          ))}
        </StanSection>
      ),
      leadership:
        leadershipActivities.length === 0 ? null : (
          <StanSection title={sectionTitle("leadership", "Leadership")}>
            {leadershipActivities.map((p, i) => (
              <View key={i} wrap={false} style={{ marginBottom: 6 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {p.bullets.map((b, bi) => (
                  <View key={bi} style={styles.bulletRow}>
                    <Text style={styles.bulletChar}>●</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </StanSection>
        ),
      skills: (
        <StanSection title={sectionTitle("skills", "Technical Skills")}>
          <Text style={styles.skillsLine}>{skills.length ? skills.join(", ") : "Add skills."}</Text>
        </StanSection>
      ),
    };

    customSections.forEach((cs, i) => {
      blocks[`custom:${i}`] = (
        <StanSection title={cs.title || "Custom"}>
          {renderCustomSectionPdf(cs, {
            details: styles.summary,
            bulletRow: styles.bulletRow,
            bulletChar: styles.bulletChar,
            bulletText: styles.bulletText,
          })}
        </StanSection>
      );
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.contact}>{contactDisplay}</Text>
          {orderedIds.map((id) => {
            const node = blocks[id];
            return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
          })}
        </Page>
      </Document>
    );
  };

  /** Two-column: dark sidebar (contact + skills), main column follows section order (skills omitted in main). */
  const renderModernGrid = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: { fontFamily: "Helvetica", fontSize: scaleSize(10, s), backgroundColor: "#fff" },
      row: { flexDirection: "row", width: "100%" },
      sidebar: {
        width: "28%",
        backgroundColor: "#0f172a",
        paddingTop: 22 * s.padV,
        paddingBottom: 20 * s.padV,
        paddingHorizontal: 10,
      },
      sideName: {
        fontSize: scaleSize(13, s),
        fontFamily: "Helvetica-Bold",
        color: "#f8fafc",
      },
      sideMeta: { fontSize: scaleSize(8.2, s), color: "#cbd5e1", marginTop: 6, lineHeight: 1.35 * s.lineTight },
      sideHeading: {
        fontSize: scaleSize(8, s),
        fontFamily: "Helvetica-Bold",
        color: "#94a3b8",
        marginTop: 12,
        letterSpacing: 1.2,
      },
      sideBody: { fontSize: scaleSize(8.5, s), color: "#e2e8f0", marginTop: 3, lineHeight: 1.35 * s.lineTight },
      main: {
        width: "72%",
        paddingTop: 22 * s.padV,
        paddingBottom: 20 * s.padV,
        paddingHorizontal: 14 * s.padH,
        backgroundColor: "#ffffff",
      },
      section: { marginBottom: 14 * s.sectionGap },
      headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
      stripe: { width: 3, height: 11, backgroundColor: "#38bdf8", marginRight: 8 },
      sectionHeader: { fontSize: scaleSize(11, s), fontFamily: "Helvetica-Bold", color: "#0f172a" },
      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(9.5, s) },
      entryDates: { fontSize: scaleSize(8.8, s), color: "#64748b" },
      entrySubtitle: { fontFamily: "Helvetica-Bold", color: "#334155", marginTop: 2, fontSize: scaleSize(9, s) },
      details: {
        fontSize: scaleSize(8.9, s),
        color: "#475569",
        marginTop: 1,
        lineHeight: 1.28 * s.lineTight,
        fontFamily: "Helvetica",
      },
      paragraph: {
        fontSize: scaleSize(9, s),
        color: "#1e293b",
        lineHeight: 1.38 * s.lineTight,
        fontFamily: "Helvetica",
      },
      bullet: { flexDirection: "row", marginLeft: 10, marginBottom: 2 },
      bulletChar: { width: 7, fontSize: scaleSize(8.5, s) },
      bulletText: { fontSize: scaleSize(9, s), color: "#1e293b", flex: 1, fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(9.5, s) },
      skillsLine: { fontSize: scaleSize(9, s), color: "#1e293b", fontFamily: "Helvetica" },
    });

    const SectionHeader = (props: { title: string }) => (
      <View style={styles.headerRow}>
        <View style={styles.stripe} />
        <Text style={styles.sectionHeader}>{props.title}</Text>
      </View>
    );

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.section}>
        <SectionHeader title={title} />
        {children}
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "omit-if-empty",
      summaryPlaceholder: "Add a professional summary.",
      excludeSectionIds: new Set(["skills"]),
    });

    const mainIds = orderedIds.filter((id) => id !== "skills");

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.row}>
            <View style={styles.sidebar}>
              <Text style={styles.sideName}>{fullName}</Text>
              <Text style={styles.sideMeta}>{contactDisplay}</Text>
              <Text style={styles.sideHeading}>SKILLS</Text>
              <Text style={styles.sideBody}>
                {skills.length ? skills.join(" · ") : "Add skills in the editor."}
              </Text>
            </View>
            <View style={styles.main}>
              {mainIds.map((id) => {
                const node = blocks[id];
                return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
              })}
            </View>
          </View>
        </Page>
      </Document>
    );
  };

  /** Large name, thin rules between sections, monospace body. */
  const renderTechExecutive = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Courier",
        fontSize: scaleSize(9.8, s),
        paddingTop: 28 * s.padV,
        paddingBottom: 26 * s.padV,
        paddingHorizontal: 36 * s.padH,
        backgroundColor: "#ffffff",
      },
      name: {
        fontSize: scaleSize(28, s),
        fontFamily: "Courier-Bold",
        letterSpacing: -0.5,
        color: "#111827",
      },
      contact: { fontSize: scaleSize(9, s), marginTop: 6, color: "#4b5563", fontFamily: "Courier" },
      section: { marginBottom: 20 * s.sectionGap },
      hr: { height: 0.5, backgroundColor: "#9ca3af", width: "100%", marginBottom: 8 },
      sectionHeader: { fontSize: scaleSize(10, s), fontFamily: "Courier-Bold", color: "#111827", letterSpacing: 2 },
      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Courier-Bold", color: "#111827", fontSize: scaleSize(9.5, s) },
      entryDates: { fontSize: scaleSize(8.8, s), color: "#6b7280", fontFamily: "Courier" },
      entrySubtitle: { fontFamily: "Courier-Bold", color: "#374151", marginTop: 2, fontSize: scaleSize(9, s) },
      details: {
        fontSize: scaleSize(9, s),
        color: "#4b5563",
        marginTop: 2,
        lineHeight: 1.35 * s.lineTight,
        fontFamily: "Courier",
      },
      paragraph: { fontSize: scaleSize(9.2, s), color: "#111827", lineHeight: 1.42 * s.lineTight, fontFamily: "Courier" },
      bullet: { flexDirection: "row", marginLeft: 10, marginBottom: 2 },
      bulletChar: { width: 7, fontSize: scaleSize(8.5, s), fontFamily: "Courier" },
      bulletText: { fontSize: scaleSize(9, s), color: "#111827", flex: 1, fontFamily: "Courier" },
      projectTitle: { fontFamily: "Courier-Bold", color: "#111827", fontSize: scaleSize(9.5, s) },
      skillsLine: { fontSize: scaleSize(9.2, s), color: "#111827", fontFamily: "Courier" },
    });

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.section}>
        <View style={styles.hr} />
        <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
        <View style={{ marginTop: 6 }}>{children}</View>
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "omit-if-empty",
      summaryPlaceholder: "Add a concise executive summary.",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.contact}>{contactDisplay}</Text>
          <View style={{ marginTop: 16 }}>
            {orderedIds.map((id) => {
              const node = blocks[id];
              return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
            })}
          </View>
        </Page>
      </Document>
    );
  };

  /** No rules or borders — typography and spacing only. */
  const renderMinimalist = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Helvetica",
        fontSize: scaleSize(10.5, s),
        paddingTop: 40 * s.padV,
        paddingBottom: 36 * s.padV,
        paddingHorizontal: 42 * s.padH,
        backgroundColor: "#ffffff",
        color: "#171717",
      },
      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Helvetica-Bold", fontSize: scaleSize(10, s), color: "#171717" },
      entryDates: { fontSize: scaleSize(9, s), color: "#525252", fontFamily: "Helvetica" },
      entrySubtitle: { fontFamily: "Helvetica", fontSize: scaleSize(10, s), marginTop: 3, color: "#262626" },
      details: {
        fontSize: scaleSize(9.8, s),
        color: "#404040",
        marginTop: 2,
        lineHeight: 1.45 * s.lineTight,
        fontFamily: "Helvetica",
      },
      paragraph: {
        fontSize: scaleSize(10, s),
        color: "#262626",
        lineHeight: 1.5 * s.lineTight,
        fontFamily: "Helvetica",
      },
      bullet: { flexDirection: "row", marginLeft: 8, marginBottom: 3 },
      bulletChar: { width: 6, fontSize: scaleSize(9, s) },
      bulletText: { fontSize: scaleSize(9.8, s), color: "#262626", flex: 1, fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", fontSize: scaleSize(10, s), color: "#171717" },
      skillsLine: { fontSize: scaleSize(10, s), color: "#262626", fontFamily: "Helvetica" },
      section: { marginBottom: 22 * s.sectionGap },
      sectionLabel: { fontSize: scaleSize(9, s), color: "#737373", letterSpacing: 2, marginBottom: 8 },
    });

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{title.toUpperCase()}</Text>
        {children}
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "omit-if-empty",
      summaryPlaceholder: "Write a short summary.",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text
            style={{
              fontSize: scaleSize(22, s),
              fontFamily: "Helvetica-Bold",
              color: "#0a0a0a",
              marginBottom: 4,
            }}
          >
            {fullName}
          </Text>
          <Text style={{ fontSize: scaleSize(10, s), color: "#525252", marginBottom: 28 }}>
            {contactDisplay}
          </Text>
          {orderedIds.map((id) => {
            const node = blocks[id];
            return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
          })}
        </Page>
      </Document>
    );
  };

  /** Times-based formal serif with decorative divider under each heading. */
  const renderClassicSerif = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Times-Roman",
        fontSize: scaleSize(10.3, s),
        paddingTop: 32 * s.padV,
        paddingBottom: 28 * s.padV,
        paddingHorizontal: 40 * s.padH,
        backgroundColor: "#fffef9",
        color: "#1c1917",
      },
      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Times-Bold", fontSize: scaleSize(10, s) },
      entryDates: { fontSize: scaleSize(9.2, s), fontFamily: "Times-Italic", color: "#57534e" },
      entrySubtitle: { fontFamily: "Times-Bold", marginTop: 2, fontSize: scaleSize(9.8, s) },
      details: {
        fontSize: scaleSize(9.5, s),
        marginTop: 2,
        lineHeight: 1.38 * s.lineTight,
        fontFamily: "Times-Roman",
        color: "#44403c",
      },
      paragraph: {
        fontSize: scaleSize(9.8, s),
        lineHeight: 1.42 * s.lineTight,
        fontFamily: "Times-Roman",
        color: "#292524",
      },
      bullet: { flexDirection: "row", marginLeft: 14, marginBottom: 2 },
      bulletChar: { width: 8, fontSize: scaleSize(9, s), fontFamily: "Times-Roman" },
      bulletText: { fontSize: scaleSize(9.6, s), flex: 1, fontFamily: "Times-Roman", color: "#1c1917" },
      projectTitle: { fontFamily: "Times-Bold", fontSize: scaleSize(10, s) },
      skillsLine: { fontSize: scaleSize(10, s), fontFamily: "Times-Roman" },
      section: { marginBottom: 14 * s.sectionGap },
      h: { fontSize: scaleSize(11.5, s), fontFamily: "Times-Bold", color: "#1c1917" },
      ornate: {
        fontSize: scaleSize(8, s),
        color: "#a8a29e",
        marginTop: 2,
        marginBottom: 8,
        letterSpacing: 3,
        fontFamily: "Times-Roman",
      },
    });

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.section}>
        <Text style={styles.h}>{title}</Text>
        <Text style={styles.ornate}>— ❦ — ❦ —</Text>
        {children}
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "placeholder-if-empty",
      summaryPlaceholder: "Add a formal professional summary.",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ fontSize: scaleSize(26, s), fontFamily: "Times-Bold", textAlign: "center" }}>
            {fullName}
          </Text>
          <Text
            style={{
              fontSize: scaleSize(10, s),
              fontFamily: "Times-Roman",
              textAlign: "center",
              marginTop: 6,
              color: "#57534e",
            }}
          >
            {contactDisplay}
          </Text>
          <View style={{ marginTop: 18 }}>
            {orderedIds.map((id) => {
              const node = blocks[id];
              return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
            })}
          </View>
        </Page>
      </Document>
    );
  };

  /** Colored left band (name/contact); main column is full resume content. */
  const renderCreativeSplit = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const accent = "#1d4ed8";
    const styles = StyleSheet.create({
      page: { fontFamily: "Helvetica", fontSize: scaleSize(10, s), backgroundColor: "#fff" },
      row: { flexDirection: "row", width: "100%" },
      band: {
        width: "30%",
        backgroundColor: accent,
        paddingTop: 28 * s.padV,
        paddingBottom: 24 * s.padV,
        paddingHorizontal: 12,
      },
      bandName: { fontSize: scaleSize(16, s), fontFamily: "Helvetica-Bold", color: "#ffffff" },
      bandContact: { fontSize: scaleSize(8.5, s), color: "#dbeafe", marginTop: 10, lineHeight: 1.4 * s.lineTight },
      main: {
        width: "70%",
        paddingTop: 22 * s.padV,
        paddingBottom: 22 * s.padV,
        paddingHorizontal: 14 * s.padH,
      },
      section: { marginBottom: 12 * s.sectionGap },
      sectionHeader: { fontSize: scaleSize(11, s), fontFamily: "Helvetica-Bold", color: "#0f172a", marginBottom: 6 },
      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(9.8, s) },
      entryDates: { fontSize: scaleSize(8.8, s), color: "#64748b" },
      entrySubtitle: { fontFamily: "Helvetica-Bold", color: "#334155", marginTop: 2, fontSize: scaleSize(9, s) },
      details: {
        fontSize: scaleSize(9, s),
        color: "#475569",
        marginTop: 1,
        lineHeight: 1.3 * s.lineTight,
        fontFamily: "Helvetica",
      },
      paragraph: { fontSize: scaleSize(9.2, s), color: "#1e293b", lineHeight: 1.38 * s.lineTight, fontFamily: "Helvetica" },
      bullet: { flexDirection: "row", marginLeft: 10, marginBottom: 2 },
      bulletChar: { width: 7, fontSize: scaleSize(8.5, s) },
      bulletText: { fontSize: scaleSize(9, s), color: "#0f172a", flex: 1, fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(9.5, s) },
      skillsLine: { fontSize: scaleSize(9.2, s), color: "#1e293b", fontFamily: "Helvetica" },
    });

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>{title}</Text>
        {children}
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "omit-if-empty",
      summaryPlaceholder: "Professional summary",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.row}>
            <View style={styles.band}>
              <Text style={styles.bandName}>{fullName}</Text>
              <Text style={styles.bandContact}>{contactDisplay}</Text>
            </View>
            <View style={styles.main}>
              {orderedIds.map((id) => {
                const node = blocks[id];
                return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
              })}
            </View>
          </View>
        </Page>
      </Document>
    );
  };

  /** Light gray panels, restrained Scandinavian grid. */
  const renderTempera = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Helvetica",
        fontSize: scaleSize(10, s),
        paddingTop: 30 * s.padV,
        paddingBottom: 26 * s.padV,
        paddingHorizontal: 34 * s.padH,
        backgroundColor: "#fafafa",
        color: "#18181b",
      },
      panel: {
        backgroundColor: "#f4f4f5",
        borderLeftWidth: 2,
        borderLeftColor: "#d4d4d8",
        padding: 10,
        marginBottom: 12 * s.sectionGap,
      },
      sectionHeader: { fontSize: scaleSize(10, s), fontFamily: "Helvetica-Bold", color: "#27272a", marginBottom: 6 },
      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Helvetica-Bold", fontSize: scaleSize(9.8, s), color: "#18181b" },
      entryDates: { fontSize: scaleSize(8.8, s), color: "#71717a" },
      entrySubtitle: { fontFamily: "Helvetica-Bold", marginTop: 2, fontSize: scaleSize(9, s), color: "#3f3f46" },
      details: {
        fontSize: scaleSize(9, s),
        color: "#52525b",
        marginTop: 2,
        lineHeight: 1.32 * s.lineTight,
        fontFamily: "Helvetica",
      },
      paragraph: { fontSize: scaleSize(9.2, s), color: "#27272a", lineHeight: 1.4 * s.lineTight, fontFamily: "Helvetica" },
      bullet: { flexDirection: "row", marginLeft: 8, marginBottom: 2 },
      bulletChar: { width: 7, fontSize: scaleSize(8.5, s) },
      bulletText: { fontSize: scaleSize(9, s), flex: 1, color: "#27272a", fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", fontSize: scaleSize(9.6, s), color: "#18181b" },
      skillsLine: { fontSize: scaleSize(9.2, s), color: "#3f3f46", fontFamily: "Helvetica" },
    });

    const wrap = (title: string, children: React.ReactNode) => (
      <View style={styles.panel}>
        <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
        {children}
      </View>
    );

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "omit-if-empty",
      summaryPlaceholder: "Summary",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ fontSize: scaleSize(20, s), fontFamily: "Helvetica-Bold", color: "#18181b" }}>
            {fullName}
          </Text>
          <Text style={{ fontSize: scaleSize(9.2, s), color: "#71717a", marginTop: 4, marginBottom: 14 }}>
            {contactDisplay}
          </Text>
          {orderedIds.map((id) => {
            const node = blocks[id];
            return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
          })}
        </Page>
      </Document>
    );
  };

  /** Blue square + ring accents next to headings; technical grid feel. */
  const renderEuclid = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const orderedIds = resolveSectionOrder(resume, args.template);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Helvetica",
        fontSize: scaleSize(10, s),
        paddingTop: 28 * s.padV,
        paddingBottom: 24 * s.padV,
        paddingHorizontal: 32 * s.padH,
        backgroundColor: "#ffffff",
      },
      section: { marginBottom: 13 * s.sectionGap },
      headingRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
      sq: { width: 7, height: 7, backgroundColor: "#2563eb", marginRight: 8 },
      circ: {
        width: 9,
        height: 9,
        borderWidth: 1.5,
        borderColor: "#2563eb",
        borderRadius: 5,
        marginRight: 8,
      },
      sectionHeader: { fontSize: scaleSize(11, s), fontFamily: "Helvetica-Bold", color: "#0f172a" },
      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(9.8, s) },
      entryDates: { fontSize: scaleSize(8.8, s), color: "#64748b" },
      entrySubtitle: { fontFamily: "Helvetica-Bold", color: "#334155", marginTop: 2, fontSize: scaleSize(9, s) },
      details: {
        fontSize: scaleSize(9, s),
        color: "#475569",
        marginTop: 1,
        lineHeight: 1.3 * s.lineTight,
        fontFamily: "Helvetica",
      },
      paragraph: { fontSize: scaleSize(9.2, s), color: "#1e293b", lineHeight: 1.38 * s.lineTight, fontFamily: "Helvetica" },
      bullet: { flexDirection: "row", marginLeft: 10, marginBottom: 2 },
      bulletChar: { width: 7, fontSize: scaleSize(8.5, s) },
      bulletText: { fontSize: scaleSize(9, s), color: "#0f172a", flex: 1, fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", color: "#0f172a", fontSize: scaleSize(9.6, s) },
      skillsLine: { fontSize: scaleSize(9.2, s), color: "#1e293b", fontFamily: "Helvetica" },
    });

    const headingAccent = (title: string) =>
      title.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 2 === 0;

    const wrap = (title: string, children: React.ReactNode) => {
      const useSquare = headingAccent(title);
      return (
        <View style={styles.section}>
          <View style={styles.headingRow}>
            {useSquare ? <View style={styles.sq} /> : <View style={styles.circ} />}
            <Text style={styles.sectionHeader}>{title}</Text>
          </View>
          {children}
        </View>
      );
    };

    const blocks = buildPdfBlocks(s, styles, wrap, {
      leadershipMode: "omit-if-empty",
      summaryPlaceholder: "Summary statement",
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={{ fontSize: scaleSize(22, s), fontFamily: "Helvetica-Bold", color: "#0f172a" }}>
            {fullName}
          </Text>
          <Text style={{ fontSize: scaleSize(9.5, s), color: "#64748b", marginTop: 4, marginBottom: 12 }}>
            {contactDisplay}
          </Text>
          {orderedIds.map((id) => {
            const node = blocks[id];
            return node ? <React.Fragment key={id}>{node}</React.Fragment> : null;
          })}
        </Page>
      </Document>
    );
  };

  const renderApollo = () => {
    const s = getPdfScale(resume.resumeTextScale);
    const styles = StyleSheet.create({
      page: {
        fontFamily: "Helvetica",
        fontSize: scaleSize(9.5, s),
        padding: 26 * s.padH,
        backgroundColor: "#fff",
        color: "#111",
      },
      layout: { flexDirection: "row", gap: 12 },
      leftCol: { width: "34%", backgroundColor: "#f5f7fb", padding: 10 },
      rightCol: { width: "66%" },
      name: { fontSize: scaleSize(17, s), fontWeight: 700 },
      small: { fontSize: scaleSize(8.4, s), marginTop: 4 },
      section: { marginTop: 10 * s.sectionGap },
      heading: { fontSize: scaleSize(9, s), fontWeight: 700, color: "#1d4ed8" },
      body: { fontSize: scaleSize(8.7, s), marginTop: 2, lineHeight: 1.45 },
      bulletItem: { marginBottom: 4, width: "100%" as const },
    });
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.layout}>
            <View style={styles.leftCol}>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.small}>{contactDisplay}</Text>
              <View style={styles.section}>
                <Text style={styles.heading}>SKILLS</Text>
                {skills.map((sk, i) => (
                  <Text key={i} style={styles.body}>
                    {sk}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.rightCol}>
              <View style={styles.section}>
                <Text style={styles.heading}>EXPERIENCE</Text>
                {experience.map((x, i) => (
                  <View key={i} wrap={false} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: scaleSize(9, s), fontWeight: 700 }}>
                      {x.role} • {x.company}
                    </Text>
                    <View style={{ flexDirection: "column", width: "100%", marginTop: 2 }}>
                      {x.bullets.map((b, bi) => (
                        <View key={bi} wrap={false} style={styles.bulletItem}>
                          <Text style={styles.body}>• {b}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.section}>
                <Text style={styles.heading}>PROJECTS</Text>
                {projects.map((p, i) => (
                  <View key={i} wrap={false} style={{ marginTop: 4 }}>
                    <Text style={{ fontSize: scaleSize(9, s), fontWeight: 700 }}>{p.name}</Text>
                    <View style={{ flexDirection: "column", width: "100%", marginTop: 2 }}>
                      {p.bullets.map((b, bi) => (
                        <View key={bi} wrap={false} style={styles.bulletItem}>
                          <Text style={styles.body}>• {b}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Page>
      </Document>
    );
  };

  // Choose template renderer. These map directly to your template keys.
  if (args.template === "jakes_latex") return renderJake();
  if (args.template === "mit_latex") return renderMIT();
  if (args.template === "stanford_latex") return renderStanford();
  if (args.template === "mit_stanford_latex") return renderJake();
  if (args.template === "harvard_classic") return renderHarvard();
  if (args.template === "google_standard") return renderGoogle();
  if (args.template === "modern_grid_pro") return renderModernGrid();
  if (args.template === "tech_executive_pro") return renderTechExecutive();
  if (args.template === "minimalist_pro") return renderMinimalist();
  if (args.template === "classic_serif_pro") return renderClassicSerif();
  if (args.template === "creative_split_pro") return renderCreativeSplit();
  if (args.template === "tempera_pro") return renderTempera();
  if (args.template === "euclid_pro") return renderEuclid();
  if (args.template === "apollo_pro") return renderApollo();

  return renderGoogle();
}

