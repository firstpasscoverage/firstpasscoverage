// src/components/CoveragePDF.tsx
// PDF layout for First Pass Coverage reports.
// Uses @react-pdf/renderer — renders client-side for now,
// moves to server-side generation in Phase 3 with minimal changes.

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CoverageData, ScoredSection } from "@/lib/parse-coverage";
import { splitItalicSegments } from "@/lib/parse-coverage";

// ── Styles ───────────────────────────────────────────────────────────

const COLORS = {
  black: "#1a1a1a",
  dark: "#374151",
  mid: "#6b7280",
  light: "#9ca3af",
  faint: "#d1d5db",
  dot: "#374151",
  gridLine: "#c8ccd2",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 80,
    paddingBottom: 64,
    paddingHorizontal: 64,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.black,
    lineHeight: 1.55,
  },

  // ── Header ──
  headerBar: {
    position: "absolute",
    top: 24,
    left: 64,
    right: 64,
    height: 28,
    paddingBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.faint,
    justifyContent: "flex-end",
  },
  headerText: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: COLORS.light,
    letterSpacing: 3,
  },

  // ── Footer (hairline + two text elements, all absolutely positioned) ──
  footerLine: {
    position: "absolute",
    bottom: 46,
    left: 64,
    right: 64,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.faint,
  },
  footerUrl: {
    position: "absolute",
    bottom: 28,
    left: 64,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: COLORS.light,
    letterSpacing: 1,
  },
  footerPageNumBox: {
    position: "absolute",
    bottom: 28,
    right: 64,
  },
  footerPageNumText: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: COLORS.light,
  },

  // ── Cover Fields ──
  coverFieldRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  coverLabel: {
    width: 100,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.mid,
  },
  coverValue: {
    flex: 1,
    fontSize: 10,
    color: COLORS.black,
  },
  coverValueBold: {
    flex: 1,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
  },

  // ── Section Headings ──
  sectionHeading: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: COLORS.mid,
    letterSpacing: 2,
    marginTop: 18,
    marginBottom: 8,
  },

  // ── Logline ──
  loglineText: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Oblique",
    lineHeight: 1.6,
    color: COLORS.black,
  },

  // ── Ratings Grid ──
  gridContainer: {
    marginTop: 14,
    marginBottom: 20,
    borderTopWidth: 0.75,
    borderBottomWidth: 0.75,
    borderColor: COLORS.gridLine,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gridLine,
  },
  gridRowNoBorder: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 18,
  },
  gridNameCell: {
    width: 76,
    paddingLeft: 4,
    paddingRight: 4,
  },
  gridNameText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  gridHeaderCell: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.gridLine,
  },
  gridHeaderLine: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.mid,
    letterSpacing: 0.3,
    textAlign: "center",
    lineHeight: 1.0,
  },
  gridValueCell: {
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 0.5,
    borderLeftColor: COLORS.gridLine,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.dot,
  },
  gridDividerRow: {
    height: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.mid,
  },
  overallNameText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
    letterSpacing: 0.3,
  },

  // ── Metadata ──
  metadataBlock: {
    marginBottom: 4,
  },
  metadataLine: {
    fontSize: 9.5,
    lineHeight: 1.5,
    marginBottom: 1,
  },
  metadataKey: {
    fontFamily: "Helvetica-Bold",
    color: COLORS.dark,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  metadataValue: {
    color: COLORS.black,
    fontSize: 9.5,
  },

  // ── Score Headings ──
  scoreHeading: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.black,
    marginTop: 14,
    marginBottom: 6,
  },

  // ── Body Text ──
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.black,
    marginBottom: 6,
  },
  italicText: {
    fontFamily: "Helvetica-Oblique",
  },
});

// ── Sub-components ───────────────────────────────────────────────────

const CATEGORY_LABELS: string[][] = [
  ["Very Poor"],
  ["Poor"],
  ["Fair"],
  ["Good"],
  ["Excellent"],
];
const OVERALL_LABELS: string[][] = [
  ["Strong", "Pass"],
  ["Pass"],
  ["Consider"],
  ["Recommend"],
  ["Strong", "Recommend"],
];

function GridHeaderRow({ labels }: { labels: string[][] }) {
  return (
    <View style={s.gridRow}>
      <View style={s.gridNameCell} />
      {labels.map((lines, i) => (
        <View key={i} style={s.gridHeaderCell}>
          {lines.map((line, j) => (
            <Text key={j} style={s.gridHeaderLine}>{line.toUpperCase()}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function GridScoreRow({
  name,
  score,
  isOverall,
  noBorder,
}: {
  name: string;
  score: number;
  isOverall?: boolean;
  noBorder?: boolean;
}) {
  return (
    <View style={noBorder ? s.gridRowNoBorder : s.gridRow}>
      <View style={s.gridNameCell}>
        <Text style={isOverall ? s.overallNameText : s.gridNameText}>
          {name}
        </Text>
      </View>
      {[1, 2, 3, 4, 5].map((val) => (
        <View key={val} style={s.gridValueCell}>
          {val === score ? <View style={s.dot} /> : null}
        </View>
      ))}
    </View>
  );
}

function RatingsGrid({
  comments,
  overall,
}: {
  comments: ScoredSection[];
  overall: ScoredSection | null;
}) {
  if (comments.length === 0) return null;

  return (
    <View style={s.gridContainer}>
      <GridHeaderRow labels={CATEGORY_LABELS} />
      {comments.map((c, i) => {
        const isLastCategory = overall && i === comments.length - 1;
        const isLastRow = !overall && i === comments.length - 1;
        return (
          <GridScoreRow
            key={c.name}
            name={c.name}
            score={c.score}
            noBorder={isLastCategory || isLastRow}
          />
        );
      })}
      {overall && (
        <>
          <View style={s.gridDividerRow} />
          <GridHeaderRow labels={OVERALL_LABELS} />
          <GridScoreRow name="OVERALL" score={overall.score} isOverall noBorder />
        </>
      )}
    </View>
  );
}

function RichParagraph({ text, style }: { text: string; style?: object }) {
  const segments = splitItalicSegments(text);

  if (segments.length === 1 && !segments[0].italic) {
    return <Text style={style ? [s.bodyText, style] : s.bodyText}>{segments[0].text}</Text>;
  }

  return (
    <Text style={style ? [s.bodyText, style] : s.bodyText}>
      {segments.map((seg, i) =>
        seg.italic ? (
          <Text key={i} style={s.italicText}>{seg.text}</Text>
        ) : (
          <Text key={i}>{seg.text}</Text>
        )
      )}
    </Text>
  );
}

function TextBlock({ text, style }: { text: string; style?: object }) {
  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((p, i) => (
        <RichParagraph key={i} text={p} style={style} />
      ))}
    </>
  );
}

function CoverFields({ data }: { data: CoverageData }) {
  const fields: { label: string; value: string; bold?: boolean }[] = [];

  if (data.scriptTitle) {
    fields.push({ label: "Title:", value: data.scriptTitle, bold: true });
  }
  if (data.writer) {
    fields.push({ label: "Writer(s):", value: data.writer });
  }
  if (data.draftDate) {
    fields.push({ label: "Draft Date:", value: data.draftDate });
  }
  if (data.coverageDate) {
    fields.push({ label: "Coverage Date:", value: data.coverageDate });
  }

  return (
    <View>
      {fields.map((f, i) => (
        <View key={i} style={s.coverFieldRow}>
          <Text style={s.coverLabel}>{f.label}</Text>
          <Text style={f.bold ? s.coverValueBold : s.coverValue}>{f.value}</Text>
        </View>
      ))}
    </View>
  );
}

function MetadataBlock({ fields }: { fields: { key: string; value: string }[] }) {
  if (fields.length === 0) return null;

  return (
    <View style={s.metadataBlock}>
      {fields.map((f, i) => (
        <Text key={i} style={s.metadataLine}>
          <Text style={s.metadataKey}>{f.key.toUpperCase()}: </Text>
          <Text style={s.metadataValue}>{f.value}</Text>
        </Text>
      ))}
    </View>
  );
}

function CommentSection({ section }: { section: ScoredSection }) {
  return (
    <View>
      <Text style={s.scoreHeading}>{section.heading}</Text>
      <TextBlock text={section.rawText} />
    </View>
  );
}

// ── Document ─────────────────────────────────────────────────────────

export function createCoveragePDF(data: CoverageData) {
  const hasParsedContent =
    data.scriptTitle || data.logline || data.comments.length > 0;

  return (
    <Document
      title={data.scriptTitle ? `Coverage \u2014 ${data.scriptTitle}` : "Screenplay Coverage"}
      author="First Pass Coverage"
      creator="firstpasscoverage.com"
    >
      <Page size="LETTER" style={s.page}>
        {/* Header — fixed View */}
        <View style={s.headerBar} fixed>
          <Text style={s.headerText}>FIRST PASS COVERAGE</Text>
        </View>

        {/* Footer — three separate fixed elements, no container */}
        <View style={s.footerLine} fixed />
        <Text style={s.footerUrl} fixed>WWW.FIRSTPASSCOVERAGE.COM</Text>

        {/* ── Page Content ── */}
        {hasParsedContent ? (
          <>
            <CoverFields data={data} />

            {data.logline && (
              <>
                <Text style={s.sectionHeading}>LOGLINE</Text>
                <Text style={s.loglineText}>{data.logline}</Text>
              </>
            )}

            <RatingsGrid comments={data.comments} overall={data.overall} />

            <MetadataBlock fields={data.metadata} />

            {data.synopsis && (
              <>
                <Text style={s.sectionHeading}>SYNOPSIS</Text>
                <TextBlock text={data.synopsis} />
              </>
            )}

            {data.comments.length > 0 && (
              <Text style={s.sectionHeading}>COMMENTS</Text>
            )}
            {data.comments.map((section) => (
              <CommentSection key={section.name} section={section} />
            ))}

            {data.overall && <CommentSection section={data.overall} />}
          </>
        ) : (
          <TextBlock text={data.rawText} />
        )}
      </Page>
    </Document>
  );
}
