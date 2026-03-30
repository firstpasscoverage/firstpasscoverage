// src/app/library/[id]/CoverageDetailClient.tsx
// Client component for rendering saved coverage — matches /coverage page
// visual output with ratings grid, PDF download, and clipboard copy.

"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import FormattedCoverage, { reformatDate } from "@/components/FormattedCoverage";

// ── Score parsing ────────────────────────────────────────────────────

interface ParsedScores {
  categories: { name: string; score: number }[];
  overall: number | null;
}

function parseScores(text: string): ParsedScores {
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

// ── Ratings grid (matches /coverage page) ────────────────────────────

const CATEGORY_COLUMNS = ["Very Poor", "Poor", "Fair", "Good", "Excellent"];
const OVERALL_COLUMNS = ["Strong Pass", "Pass", "Consider", "Recommend", "Strong Recommend"];

function RatingsGrid({ categories, overall }: ParsedScores) {
  if (categories.length === 0) return null;

  return (
    <div className="my-6 py-4 border-t border-b border-gray-200">
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

// ── Main component ───────────────────────────────────────────────────

interface Props {
  coverageText: string;
  title: string;
  writer: string;
  draftDate: string;
  createdAt: string;
}

export default function CoverageDetailClient({
  coverageText,
  title,
  writer,
  draftDate,
  createdAt,
}: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const scores = useMemo(() => parseScores(coverageText), [coverageText]);

  const coverageSplit = useMemo(() => {
    if (!coverageText) return null;
    let splitIndex = coverageText.indexOf("\nGenre:");
    if (splitIndex === -1) splitIndex = coverageText.indexOf("\n**Genre:");
    if (splitIndex === -1) return null;
    return {
      beforeMetadata: coverageText.slice(0, splitIndex),
      afterMetadata: coverageText.slice(splitIndex),
    };
  }, [coverageText]);

  const dateStr = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(coverageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [coverageText]);

  const handleDownloadPDF = useCallback(async () => {
    if (!coverageText || pdfBusy) return;
    setPdfBusy(true);

    try {
      const [{ pdf }, { createCoveragePDF }, { parseCoverageForPDF }] =
        await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/CoveragePDF"),
          import("@/lib/parse-coverage"),
        ]);

      const data = parseCoverageForPDF(coverageText);
      const blob = await pdf(createCoveragePDF(data)).toBlob();

      const safeName = title
        ? title
            .replace(/[^a-zA-Z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .toLowerCase()
        : "screenplay";

      const dateSlug = createdAt
        ? new Date(createdAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `coverage-${safeName}-${dateSlug}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfBusy(false);
    }
  }, [coverageText, title, createdAt, pdfBusy]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/library"
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6 inline-block"
      >
        &larr; Back to Library
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-brand mb-1">
            {(title || "Untitled").toUpperCase()}
          </h1>
          <p className="text-gray-500 text-sm">
            {writer || "Unknown writer"}
            {draftDate && draftDate !== "Not specified"
              ? ` \u2022 ${reformatDate(draftDate)}`
              : ""}
          </p>
          {dateStr && (
            <p className="text-gray-400 text-xs mt-1">
              Coverage generated {dateStr}
            </p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfBusy}
            className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
          >
            {pdfBusy ? "Generating..." : "Download PDF"}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      </div>

      {/* Coverage content */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {coverageSplit && scores.categories.length > 0 ? (
          <>
            <FormattedCoverage text={coverageSplit.beforeMetadata} />

            <RatingsGrid
              categories={scores.categories}
              overall={scores.overall}
            />

            <FormattedCoverage text={coverageSplit.afterMetadata} />
          </>
        ) : (
          <FormattedCoverage text={coverageText} />
        )}
      </div>
    </div>
  );
}
