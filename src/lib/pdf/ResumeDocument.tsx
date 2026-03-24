import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeTemplateKey, ResumeContent } from "../db/resumeTypes";
import { getPdfScale, scaleSize } from "./pdfTextScale";
import { resolveSectionOrder } from "./sectionOrder";

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
        <Section title="Summary">
          <Text style={styles.details}>{summary || "Add a concise professional summary."}</Text>
        </Section>
      ),
      education: (
        <Section title="Education">
          {education.length === 0 ? (
            <Text style={styles.details}>Add your education.</Text>
          ) : (
            education.map((e, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 3 * s.sectionGap }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryCompany}>{e.school}</Text>
                  {e.details ? <Text style={styles.entryDates}>{e.details}</Text> : <Text style={styles.entryDates} />}
                </View>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryDegree}>{e.degree}</Text>
                  <Text style={styles.entryDates}>
                    {e.start || "—"} - {e.end || "—"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Section>
      ),
      experience: (
        <Section title="Experience">
          {experience.length === 0 ? (
            <Text style={styles.details}>Add your experience.</Text>
          ) : (
            experience.map((x, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 3.5 * s.sectionGap }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryCompany}>{x.company}</Text>
                  <Text style={styles.entryDates}>
                    {x.start || "—"} - {x.end || "—"}
                  </Text>
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
        <Section title="Projects">
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
          <Section title="Leadership and Activities">
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
        <Section title="Technical Skills">
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
        paddingTop: 30 * s.padV,
        paddingBottom: 28 * s.padV,
        paddingHorizontal: 36 * s.padH,
        backgroundColor: "#ffffff",
        color: "#000000",
      },
      name: { fontSize: scaleSize(20, s), fontFamily: "Times-Bold", color: "#000000" },
      contact: { fontSize: scaleSize(10, s), marginTop: 2, color: "#000000", fontFamily: "Times-Roman" },
      section: { marginBottom: 10 * s.sectionGap },
      sectionHeaderWrap: { marginBottom: 4 },
      sectionHeader: { fontSize: scaleSize(11.2, s), fontFamily: "Times-Bold", color: "#000000" },
      sectionBorder: { height: 1, backgroundColor: "#000000", width: "100%", marginTop: 3 },

      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Times-Bold", color: "#000000", fontSize: scaleSize(10, s) },
      entryDates: { fontSize: scaleSize(9.2, s), color: "#000000", fontFamily: "Times-Roman" },
      entrySubtitle: { fontFamily: "Times-Bold", color: "#000000", marginTop: 2, fontSize: scaleSize(9.5, s) },

      details: {
        fontSize: scaleSize(9.3, s),
        color: "#000000",
        marginTop: 1,
        lineHeight: 1.25 * s.lineTight,
        fontFamily: "Times-Roman",
      },
      bullet: { marginLeft: 12, marginBottom: 2 },
      bulletRow: { flexDirection: "row", marginLeft: 12, marginBottom: 2 },
      bulletChar: { width: 8, fontSize: scaleSize(9, s) },
      bulletText: { fontSize: scaleSize(9.6, s), fontFamily: "Times-Roman", color: "#000000", flex: 1 },
      projectTitle: { fontFamily: "Times-Bold", color: "#000000", fontSize: scaleSize(10, s) },
      skillsLine: { fontSize: scaleSize(10, s), color: "#000000", marginTop: 2, fontFamily: "Times-Roman" },
      spacer: { marginTop: 10 * s.sectionGap },
    });

    const Section = (props: { title: string; children: React.ReactNode }) => (
      <View style={styles.section}>
        <View style={styles.sectionHeaderWrap}>
          <Text style={styles.sectionHeader}>{props.title}</Text>
          <View style={styles.sectionBorder} />
        </View>
        {props.children}
      </View>
    );

    const blocks: Record<string, React.ReactNode> = {
      summary: (
        <Section title="Summary">
          <Text style={styles.details}>{summary || "Add a summary that highlights your strengths."}</Text>
        </Section>
      ),
      education: (
        <Section title="Education">
          {education.length === 0 ? (
            <Text style={styles.details}>Add your education.</Text>
          ) : (
            education.map((e, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 8 * s.sectionGap }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryCompany}>{e.school}</Text>
                  <Text style={styles.entryDates}>
                    {e.start || "—"} - {e.end || "—"}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{e.degree}</Text>
                {e.details ? <Text style={styles.details}>{e.details}</Text> : null}
              </View>
            ))
          )}
        </Section>
      ),
      experience: (
        <Section title="Experience">
          {experience.length === 0 ? (
            <Text style={styles.details}>Add your experience.</Text>
          ) : (
            experience.map((x, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
                <View style={styles.entryHeaderRow}>
                  <Text style={styles.entryCompany}>{x.company}</Text>
                  <Text style={styles.entryDates}>
                    {x.start || "—"} - {x.end || "—"}
                  </Text>
                </View>
                <Text style={styles.entrySubtitle}>{x.role}</Text>
                {x.bullets.map((b, bIdx) => (
                  <View key={bIdx} style={styles.bullet}>
                    <Text style={styles.bulletText}>- {b}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </Section>
      ),
      projects: (
        <Section title="Projects">
          {projects.length === 0 ? (
            <Text style={styles.details}>Add your projects.</Text>
          ) : (
            projects.map((p, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {p.bullets.map((b, bIdx) => (
                  <View key={bIdx} style={styles.bullet}>
                    <Text style={styles.bulletText}>- {b}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </Section>
      ),
      leadership: (
        <Section title="Leadership and Activities">
          {leadershipActivities.length === 0 ? (
            <Text style={styles.details}>Add leadership/activities.</Text>
          ) : (
            leadershipActivities.map((p, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {p.bullets.map((b, bIdx) => (
                  <View key={bIdx} style={styles.bullet}>
                    <Text style={styles.bulletText}>- {b}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </Section>
      ),
      skills: (
        <Section title="Skills">
          {skills.length === 0 ? (
            <Text style={styles.details}>Add relevant skills.</Text>
          ) : (
            <Text style={styles.skillsLine}>{skills.join(", ")}</Text>
          )}
        </Section>
      ),
    };

    customSections.forEach((cs, i) => {
      blocks[`custom:${i}`] = (
        <Section title={cs.title || "Custom"}>
          {renderCustomSectionPdf(cs, {
            details: styles.details,
            bulletRow: styles.bulletRow,
            bulletChar: styles.bulletChar,
            bulletText: styles.bulletText,
          })}
        </Section>
      );
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
        paddingTop: 34 * s.padV,
        paddingBottom: 28 * s.padV,
        paddingHorizontal: 34 * s.padH,
        backgroundColor: "#ffffff",
      },
      name: { fontSize: scaleSize(22, s), fontFamily: "Helvetica-Bold", textAlign: "center" },
      contact: { fontSize: scaleSize(10, s), textAlign: "center", marginTop: 3, color: "#111827", fontFamily: "Helvetica" },
      section: { marginBottom: 14 * s.sectionGap },
      headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
      leftAccent: { width: 3, height: 12, backgroundColor: "#0EA5E9", marginRight: 10 },
      sectionHeader: { fontSize: scaleSize(12, s), fontFamily: "Helvetica-Bold", color: "#111827" },

      entryHeaderRow: { ...baseStyles.rowBetween },
      entryCompany: { fontFamily: "Helvetica-Bold", color: "#111827", fontSize: scaleSize(10, s) },
      entryDates: { fontSize: scaleSize(9.2, s), color: "#6b7280" },
      entrySubtitle: { fontFamily: "Helvetica-Bold", color: "#111827", marginTop: 2, fontSize: scaleSize(9.5, s) },
      details: {
        fontSize: scaleSize(9.3, s),
        color: "#6b7280",
        marginTop: 1,
        lineHeight: 1.25 * s.lineTight,
        fontFamily: "Helvetica",
      },
      bullet: { marginLeft: 12, marginBottom: 2 },
      bulletRow: { flexDirection: "row", marginLeft: 12, marginBottom: 2 },
      bulletChar: { width: 8, fontSize: scaleSize(9, s) },
      bulletText: { fontSize: scaleSize(9.6, s), color: "#111827", flex: 1, fontFamily: "Helvetica" },
      projectTitle: { fontFamily: "Helvetica-Bold", color: "#111827", fontSize: scaleSize(10, s) },
      skillsLine: { fontSize: scaleSize(10.4, s), color: "#111827", marginTop: 2, fontFamily: "Helvetica" },
      paragraph: {
        marginTop: 2,
        color: "#111827",
        lineHeight: 1.35 * s.lineTight,
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

    const blocks: Record<string, React.ReactNode> = {
      summary: wrap(
        "Summary",
        <Text style={styles.paragraph}>
          {summary ? summary : "Add a summary that highlights your strengths and results."}
        </Text>
      ),
      education: wrap(
        "Education",
        education.length === 0 ? (
          <Text style={styles.details}>Add your education.</Text>
        ) : (
          education.map((e, idx) => (
            <View key={idx} wrap={false} style={{ marginBottom: 8 * s.sectionGap }}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryCompany}>{e.school}</Text>
                <Text style={styles.entryDates}>
                  {e.start || "—"} - {e.end || "—"}
                </Text>
              </View>
              <Text style={styles.entrySubtitle}>{e.degree}</Text>
              {e.details ? <Text style={styles.details}>{e.details}</Text> : null}
            </View>
          ))
        )
      ),
      experience: wrap(
        "Experience",
        experience.length === 0 ? (
          <Text style={styles.details}>Add your experience.</Text>
        ) : (
          experience.map((x, idx) => (
            <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
              <View style={styles.entryHeaderRow}>
                <Text style={styles.entryCompany}>{x.company}</Text>
                <Text style={styles.entryDates}>
                  {x.start || "—"} - {x.end || "—"}
                </Text>
              </View>
              <Text style={styles.entrySubtitle}>{x.role}</Text>
              {x.bullets.map((b, bIdx) => (
                <View key={bIdx} style={styles.bullet}>
                  <Text style={styles.bulletText}>- {b}</Text>
                </View>
              ))}
            </View>
          ))
        )
      ),
      projects: wrap(
        "Projects",
        projects.length === 0 ? (
          <Text style={styles.details}>Add your projects.</Text>
        ) : (
          projects.map((p, idx) => (
            <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
              <Text style={styles.projectTitle}>
                {p.name}
                {p.link ? ` (${p.link})` : ""}
              </Text>
              {p.bullets.map((b, bIdx) => (
                <View key={bIdx} style={styles.bullet}>
                  <Text style={styles.bulletText}>- {b}</Text>
                </View>
              ))}
            </View>
          ))
        )
      ),
      leadership:
        leadershipActivities.length === 0 ? null : wrap(
            "Leadership and Activities",
            leadershipActivities.map((p, idx) => (
              <View key={idx} wrap={false} style={{ marginBottom: 10 * s.sectionGap }}>
                <Text style={styles.projectTitle}>
                  {p.name}
                  {p.link ? ` (${p.link})` : ""}
                </Text>
                {p.bullets.map((b, bIdx) => (
                  <View key={bIdx} style={styles.bullet}>
                    <Text style={styles.bulletText}>- {b}</Text>
                  </View>
                ))}
              </View>
            ))
          ),
      skills: wrap(
        "Skills",
        skills.length === 0 ? (
          <Text style={styles.details}>Add relevant skills.</Text>
        ) : (
          <Text style={styles.skillsLine}>{skills.join(", ")}</Text>
        )
      ),
    };

    customSections.forEach((cs, i) => {
      blocks[`custom:${i}`] = wrap(
        cs.title || "Custom",
        renderCustomSectionPdf(cs, {
          details: styles.details,
          bulletRow: styles.bulletRow,
          bulletChar: styles.bulletChar,
          bulletText: styles.bulletText,
        })
      );
    });

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View>
            <Text style={styles.name}>{fullName}</Text>
            <Text style={styles.contact}>{contactDisplay}</Text>
          </View>

          <View style={{ marginTop: 14 }}>
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
        <SloanSection title="Summary">
          <Text style={styles.summary}>{summary || "Add a concise professional summary."}</Text>
        </SloanSection>
      ),
      education: (
        <SloanSection title="Education">
          {education.map((e, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 3 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>{e.school}</Text>
                <Text style={styles.right}>
                  {e.start} – {e.end}
                </Text>
              </View>
              <Text style={styles.sub}>{e.degree}</Text>
              {e.details ? <Text style={styles.sub}>{e.details}</Text> : null}
            </View>
          ))}
        </SloanSection>
      ),
      experience: (
        <SloanSection title="Experience">
          {experience.map((x, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 3.2 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>
                  {x.role}, {x.company}
                </Text>
                <Text style={styles.right}>
                  {x.start} – {x.end}
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
        <SloanSection title="Projects">
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
          <SloanSection title="Leadership">
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
        <SloanSection title="Technical Skills">
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
        <StanSection title="Summary">
          <Text style={styles.body}>{summary || "Add a concise professional summary."}</Text>
        </StanSection>
      ),
      education: (
        <StanSection title="Education">
          {education.map((e, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 6 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>{e.school}</Text>
                <Text style={styles.right}>
                  {e.start} – {e.end}
                </Text>
              </View>
              <Text style={styles.body}>{e.degree}</Text>
              {e.details ? <Text style={styles.summary}>{e.details}</Text> : null}
            </View>
          ))}
        </StanSection>
      ),
      experience: (
        <StanSection title="Experience">
          {experience.map((x, i) => (
            <View key={i} wrap={false} style={{ marginBottom: 7 * s.sectionGap }}>
              <View style={styles.row}>
                <Text style={styles.left}>
                  {x.role}, {x.company}
                </Text>
                <Text style={styles.right}>
                  {x.start} – {x.end}
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
        <StanSection title="Projects">
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
          <StanSection title="Leadership">
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
        <StanSection title="Technical Skills">
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
      body: { fontSize: scaleSize(8.7, s), marginTop: 2, lineHeight: 1.25 * s.lineTight },
    });
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.layout}>
            <View style={styles.leftCol}>
              <Text style={styles.name}>{fullName}</Text>
              <Text style={styles.small}>{contactDisplay}</Text>
              <View style={styles.section}><Text style={styles.heading}>SKILLS</Text>{skills.map((s, i) => <Text key={i} style={styles.body}>{s}</Text>)}</View>
            </View>
            <View style={styles.rightCol}>
              <View style={styles.section}><Text style={styles.heading}>EXPERIENCE</Text>{experience.map((x, i) => <View key={i} wrap={false} style={{ marginTop: 4 }}><Text style={{ fontSize: scaleSize(9, s), fontWeight: 700 }}>{x.role} • {x.company}</Text>{x.bullets.map((b, bi) => <Text key={bi} style={styles.body}>• {b}</Text>)}</View>)}</View>
              <View style={styles.section}><Text style={styles.heading}>PROJECTS</Text>{projects.map((p, i) => <View key={i} wrap={false} style={{ marginTop: 4 }}><Text style={{ fontSize: scaleSize(9, s), fontWeight: 700 }}>{p.name}</Text>{p.bullets.map((b, bi) => <Text key={bi} style={styles.body}>• {b}</Text>)}</View>)}</View>
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
  if (args.template === "apollo_pro") return renderApollo();

  // Fallback: Google-style so the UI never breaks for Pro templates.
  return renderGoogle();
}

