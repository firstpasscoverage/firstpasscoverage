// src/lib/parse-coverage.ts
// Parses raw coverage text into structured sections for PDF generation.
// Handles markdown formatting (###, **, *italics*) in the raw output.
// Defensive: if any section can't be found, downstream fields stay empty
// and the PDF renderer falls back to raw text.
//
// NOTE: The AI model occasionally varies its formatting — sometimes using
// ### headings (### LOGLINE) and sometimes bold labels (**LOGLINE:**).
// All landmark regexes must tolerate both formats. See Thread 29.

export interface ScoredSection {
  heading: string;   // Display heading, e.g. "PREMISE — Good"
  name: string;      // Category name, e.g. "PREMISE"
  label: string;     // Rating label, e.g. "Good"
  score: number;     // 1–5
  text: string;      // Commentary paragraphs (markdown stripped)
  rawText: string;   // Commentary with italic markers preserved
}

export interface CoverageData {
  scriptTitle: string;
  writer: string;
  draftDate: string;
  logline: string;
  metadata: { key: string; value: string }[];
  synopsis: string;
  comments: ScoredSection[];
  overall: ScoredSection | null;
  rawText: string;
  /** Human-readable coverage date, e.g. "March 22, 2026" */
  coverageDate: string;
}

const SCORE_CATEGORIES = [
  "PREMISE", "STRUCTURE", "CHARACTER", "CONFLICT", "DIALOGUE",
  "PACING", "TONE", "ORIGINALITY", "LOGIC", "CRAFT", "OVERALL",
];

// ── Date Formatting ──────────────────────────────────────────────────

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Format a Date object as "Month Day, Year" */
function formatDateLong(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Attempt to normalize a draft date string into "Month Day, Year" format.
 * Handles: "9.24.20", "9/24/2020", "September 24, 2020", "2020-09-24", etc.
 * Returns the original string if parsing fails.
 */
function normalizeDraftDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  // Try native Date parse first (handles "September 24, 2020", "2020-09-24", etc.)
  const nativeParsed = new Date(trimmed);
  if (!isNaN(nativeParsed.getTime()) && trimmed.length > 6) {
    return formatDateLong(nativeParsed);
  }

  // Try M.D.YY or M.D.YYYY or M/D/YY or M/D/YYYY
  const mdy = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (mdy) {
    const month = parseInt(mdy[1]) - 1;
    const day = parseInt(mdy[2]);
    let year = parseInt(mdy[3]);
    if (year < 100) year += 2000;
    if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
      return formatDateLong(new Date(year, month, day));
    }
  }

  // Give up — return original
  return trimmed;
}

// ── Markdown Stripping ───────────────────────────────────────────────

/** Remove markdown formatting: ### headings, **bold**, *italic* */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\w)\*([^*\n]+?)\*(?!\w)/g, "$1")
    .trim();
}

/**
 * Strip markdown but preserve *italic* markers for rich rendering.
 * Removes ### headings and **bold** only.
 */
function stripMarkdownKeepItalics(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .trim();
}

// ── Italic Segment Detection ─────────────────────────────────────────

export interface TextSegment {
  text: string;
  italic: boolean;
}

/** Splits a paragraph into alternating normal/italic segments based on *markers* */
export function splitItalicSegments(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /(?<!\w)\*([^*\n]+?)\*(?!\w)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), italic: false });
    }
    segments.push({ text: match[1], italic: true });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), italic: false });
  }

  return segments;
}

// ── Cover Info Extraction ────────────────────────────────────────────

function parseCoverInfo(block: string): {
  scriptTitle: string;
  writer: string;
  draftDate: string;
} {
  const result = { scriptTitle: "", writer: "", draftDate: "" };
  const cleaned = stripMarkdown(block);

  for (const line of cleaned.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const titleMatch = trimmed.match(/^Title:\s*(.+)/i);
    if (titleMatch) { result.scriptTitle = titleMatch[1].trim(); continue; }

    const writerMatch = trimmed.match(/^(?:Written\s+by|Writer|Screenwriter|Screenplay\s+by):\s*(.+)/i);
    if (writerMatch) { result.writer = writerMatch[1].trim(); continue; }

    const draftMatch = trimmed.match(/^(?:Draft(?:\s+Date)?):\s*(.+)/i);
    if (draftMatch) { result.draftDate = draftMatch[1].trim(); continue; }
  }

  if (!result.scriptTitle) {
    for (const line of cleaned.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^FIRST\s+PASS\s+COVERAGE$/i.test(trimmed)) continue;
      if (/^(Title|Written\s+by|Writer|Draft|Screenplay\s+by):/i.test(trimmed)) continue;
      result.scriptTitle = trimmed;
      break;
    }
  }

  return result;
}

// ── Metadata Extraction ──────────────────────────────────────────────

function parseMetadata(block: string): { key: string; value: string }[] {
  const cleaned = stripMarkdown(block);
  const fields: { key: string; value: string }[] = [];
  for (const line of cleaned.split("\n")) {
    const match = line.match(/^([A-Za-z\s]+?):\s*(.+)/);
    if (match) {
      fields.push({ key: match[1].trim(), value: match[2].trim() });
    }
  }
  return fields;
}

// ── Main Parser ──────────────────────────────────────────────────────

export function parseCoverageForPDF(text: string): CoverageData {
  const result: CoverageData = {
    scriptTitle: "",
    writer: "",
    draftDate: "",
    logline: "",
    metadata: [],
    synopsis: "",
    comments: [],
    overall: null,
    rawText: text,
    coverageDate: formatDateLong(new Date()),
  };

  // ── 1. Split at LOGLINE (### LOGLINE, **LOGLINE:**, or bare LOGLINE) ──
  // Thread 29: model sometimes outputs **LOGLINE:** instead of ### LOGLINE
  const loglineIdx = text.search(/\n\*{0,2}#{0,6}\s*LOGLINE\b/);
  if (loglineIdx === -1) return result;

  const coverBlock = text.slice(0, loglineIdx).trim();
  const cleanCover = stripMarkdown(
    coverBlock.replace(/^FIRST\s+PASS\s+COVERAGE\s*/i, "").trim()
  );
  const coverInfo = parseCoverInfo(cleanCover);
  result.scriptTitle = coverInfo.scriptTitle;
  result.writer = coverInfo.writer;
  result.draftDate = normalizeDraftDate(coverInfo.draftDate);

  let remaining = text.slice(loglineIdx);

  // ── 2. Extract logline ──
  const actualGenreIdx = remaining.search(/\n\*?\*?Genre:\*?\*?/);
  if (actualGenreIdx === -1) return result;

  // Skip the LOGLINE heading line
  const afterLoglineHeading = remaining.indexOf("\n") + 1;
  let loglineBlock = remaining.slice(afterLoglineHeading, actualGenreIdx).trim();
  // Strip markdown first so both "### LOGLINE" and "**LOGLINE:**" normalize,
  // then remove any remaining LOGLINE prefix text (Thread 29)
  loglineBlock = stripMarkdown(loglineBlock);
  loglineBlock = loglineBlock.replace(/^LOGLINE:?\s*/i, "").trim();
  result.logline = loglineBlock;
  remaining = remaining.slice(actualGenreIdx + 1);

  // ── 3. Extract metadata ──
  // Thread 29: tolerate both ### SYNOPSIS and **SYNOPSIS:**
  const synopsisIdx = remaining.search(/\n\*{0,2}#{0,6}\s*SYNOPSIS\b/);
  if (synopsisIdx === -1) return result;

  result.metadata = parseMetadata(remaining.slice(0, synopsisIdx));
  remaining = remaining.slice(synopsisIdx);

  // ── 4. Extract synopsis ──
  // Skip the SYNOPSIS heading line
  const synopsisHeadingEnd = remaining.indexOf("\n") + 1;
  const afterSynopsis = remaining.slice(synopsisHeadingEnd);

  // Find COMMENTS heading or first scored section
  // Thread 29: tolerate both ### COMMENTS and **COMMENTS:**
  const commentsHeadingIdx = afterSynopsis.search(/\n\*{0,2}#{0,6}\s*COMMENTS\b/);
  const firstScoreIdx = afterSynopsis.search(
    new RegExp(`\n(${SCORE_CATEGORIES.join("|")})\\s*[—–-]`)
  );

  let synopsisEnd: number;
  if (commentsHeadingIdx !== -1 && (firstScoreIdx === -1 || commentsHeadingIdx < firstScoreIdx)) {
    synopsisEnd = commentsHeadingIdx;
  } else if (firstScoreIdx !== -1) {
    synopsisEnd = firstScoreIdx;
  } else {
    result.synopsis = stripMarkdown(afterSynopsis);
    return result;
  }

  let synopsisBlock = afterSynopsis.slice(0, synopsisEnd).trim();
  // Strip markdown first, then remove prefix (same pattern as logline — Thread 29)
  synopsisBlock = stripMarkdown(synopsisBlock);
  synopsisBlock = synopsisBlock.replace(/^SYNOPSIS:?\s*/i, "").trim();
  result.synopsis = synopsisBlock;
  remaining = afterSynopsis.slice(synopsisEnd);

  // Skip "COMMENTS" heading if present (tolerate ### or ** format)
  if (/^\s*\n?\*{0,2}#{0,6}\s*COMMENTS\b/.test(remaining)) {
    const nextNewline = remaining.indexOf("\n", remaining.search(/COMMENTS/) + 8);
    remaining = nextNewline !== -1 ? remaining.slice(nextNewline) : "";
  }

  // ── 5. Parse scored sections ──
  const headings: {
    index: number;
    fullMatch: string;
    name: string;
    label: string;
    score: number;
  }[] = [];

  const globalPattern = new RegExp(
    `(${SCORE_CATEGORIES.join("|")})\\s*[—–-]\\s*(.+?)\\s*\\((\\d)\\)`,
    "g",
  );

  let match;
  while ((match = globalPattern.exec(remaining)) !== null) {
    headings.push({
      index: match.index,
      fullMatch: match[0],
      name: match[1],
      label: match[2].trim(),
      score: parseInt(match[3]),
    });
  }

  for (let i = 0; i < headings.length; i++) {
    const textStart = headings[i].index + headings[i].fullMatch.length;
    const textEnd = i + 1 < headings.length ? headings[i + 1].index : remaining.length;
    const rawSectionText = stripMarkdownKeepItalics(remaining.slice(textStart, textEnd));
    const cleanSectionText = stripMarkdown(remaining.slice(textStart, textEnd));

    const section: ScoredSection = {
      heading: `${headings[i].name} \u2014 ${headings[i].label}`,
      name: headings[i].name,
      label: headings[i].label,
      score: headings[i].score,
      text: cleanSectionText,
      rawText: rawSectionText,
    };

    if (headings[i].name === "OVERALL") {
      result.overall = section;
    } else {
      result.comments.push(section);
    }
  }

  return result;
}
