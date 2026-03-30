// src/components/FormattedCoverage.tsx
// Shared component for rendering coverage markdown as formatted HTML.
// Used by /samples/[slug], /library/[id], and /coverage (post-completion).

"use client";

import ReactMarkdown from "react-markdown";

// ── Date formatting ──────────────────────────────────────────────────

/**
 * Find and replace ordinal-style dates within a block of text.
 * e.g. "Draft date: 12th August 2024" → "Draft date: August 12, 2024"
 */
function reformatDatesInText(text: string): string {
  return text.replace(
    /(\d{1,2})(?:st|nd|rd|th)\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi,
    (_match, day, month, year) => `${month} ${parseInt(day)}, ${year}`
  );
}

// ── Exported date helper (for use in parent components) ──────────────

/**
 * Reformat a standalone date like "12th August 2024" → "August 12, 2024".
 * Returns the original string if it doesn't match.
 */
export function reformatDate(dateStr: string): string {
  const match = dateStr.match(
    /^(\d{1,2})(?:st|nd|rd|th)\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i
  );
  if (!match) return dateStr;
  return `${match[2]} ${parseInt(match[1])}, ${match[3]}`;
}

// ── Main component ───────────────────────────────────────────────────

interface Props {
  text: string;
}

/**
 * Renders coverage markdown as formatted HTML.
 * - Transforms score heading lines (e.g. "PREMISE — Good (4)") into clean
 *   section headers that preserve the rating label (e.g. "### PREMISE — Good")
 * - Reformats ordinal dates to US format
 * - Normalizes single newlines to doubles so markdown renders each line
 *   as a separate paragraph
 */
export default function FormattedCoverage({ text }: Props) {
  // Transform score heading lines into markdown headers with rating label
  const cleaned = text
    .split("\n")
    .map((line) => {
      const match = line.match(
        /^(PREMISE|STRUCTURE|CHARACTER|CONFLICT|DIALOGUE|PACING|TONE|ORIGINALITY|LOGIC|CRAFT|OVERALL)\s*[—–-]\s*(.+?)\s*\(\d\)/
      );
      if (match) return `### ${match[1]} — ${match[2]}`;
      return line;
    })
    .join("\n");

  // Reformat ordinal dates ("12th August 2024" → "August 12, 2024")
  const dated = reformatDatesInText(cleaned);

  // Normalize single newlines to double newlines so markdown treats each
  // line as a separate paragraph. The coverage text uses single \n between
  // metadata fields (Title, Written by, Genre, etc.) which markdown would
  // otherwise collapse into one run-on paragraph.
  const normalized = dated
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(?<!\n)\n(?!\n)/g, "\n\n");

  return (
    <div className="prose prose-sm prose-gray max-w-none">
      <ReactMarkdown
        components={{
          h3: ({ children }) => (
            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mt-6 mb-2">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold uppercase tracking-wide text-gray-700 mt-8 mb-3">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed text-gray-800 mb-3">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-700">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-600">{children}</em>
          ),
          hr: () => <hr className="my-6 border-gray-200" />,
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm text-gray-800 mb-3 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm text-gray-800 mb-3 space-y-1">
              {children}
            </ol>
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
