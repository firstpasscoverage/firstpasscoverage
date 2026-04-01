// src/components/RatingsGrid.tsx
// Shared ratings grid component — extracted from coverage/page.tsx,
// CoverageDetailClient.tsx, and SampleDetailClient.tsx (Thread 25).

"use client";

// ── Types ────────────────────────────────────────────────────────────

export interface ParsedScores {
  categories: { name: string; score: number }[];
  overall: number | null;
}

// ── Score parsing ────────────────────────────────────────────────────

export function parseScores(text: string): ParsedScores {
  const categories: { name: string; score: number }[] = [];
  let overall: number | null = null;

  for (const line of text.split("\n")) {
    const match = line.match(
      /^(PREMISE|STRUCTURE|CHARACTER|CONFLICT|DIALOGUE|PACING|TONE|ORIGINALITY|LOGIC|CRAFT|OVERALL)\s*[—–-]\s*.+?\((\d)\)/
    );
    if (match) {
      const [, name, scoreStr] = match;
      const score = parseInt(scoreStr);
      if (name === "OVERALL") {
        overall = score;
      } else {
        categories.push({ name, score });
      }
    }
  }

  return { categories, overall };
}

// ── Coverage text splitting ──────────────────────────────────────────

export function splitCoverageAtMetadata(
  text: string
): { beforeMetadata: string; afterMetadata: string } | null {
  let splitIndex = text.indexOf("\nGenre:");
  if (splitIndex === -1) splitIndex = text.indexOf("\n**Genre:");
  if (splitIndex === -1) return null;
  return {
    beforeMetadata: text.slice(0, splitIndex),
    afterMetadata: text.slice(splitIndex),
  };
}

// ── Ratings grid component ───────────────────────────────────────────

const CATEGORY_COLUMNS = ["Very Poor", "Poor", "Fair", "Good", "Excellent"];
const OVERALL_COLUMNS = [
  "Strong Pass",
  "Pass",
  "Consider",
  "Recommend",
  "Strong Recommend",
];

export default function RatingsGrid({ categories, overall }: ParsedScores) {
  if (categories.length === 0) return null;

  return (
    <div className="my-6 py-4 border-t border-b border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="w-28" />
            {CATEGORY_COLUMNS.map((col) => (
              <th
                key={col}
                className="py-2 px-1 font-semibold text-gray-400 text-center text-[10px] uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(({ name, score }) => (
            <tr key={name}>
              <td className="py-1 pr-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                {name}
              </td>
              {[1, 2, 3, 4, 5].map((val) => (
                <td key={val} className="py-1 px-1 text-center">
                  {val === score ? (
                    <span className="text-gray-700 font-semibold">✓</span>
                  ) : (
                    ""
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {overall !== null && (
        <table className="w-full text-sm border-collapse mt-4">
          <thead>
            <tr>
              <th className="w-28" />
              {OVERALL_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="py-2 px-1 font-semibold text-gray-400 text-center text-[10px] uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1 pr-3 font-bold text-gray-700 text-xs uppercase tracking-wide">
                Overall
              </td>
              {[1, 2, 3, 4, 5].map((val) => (
                <td key={val} className="py-1 px-1 text-center">
                  {val === overall ? (
                    <span className="text-gray-700 font-bold text-base">✓</span>
                  ) : (
                    ""
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
