// src/app/samples/[slug]/SampleDetailClient.tsx
// Client component for rendering a sample coverage — public, no auth required.
// Adapted from library's CoverageDetailClient: adds poster header, CTA,
// removes clipboard copy (user tool, not marketing tool).

"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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

// ── Ratings grid ─────────────────────────────────────────────────────

const CATEGORY_COLUMNS = ["Very Poor", "Poor", "Fair", "Good", "Excellent"];
const OVERALL_COLUMNS = [
  "Strong Pass",
  "Pass",
  "Consider",
  "Recommend",
  "Strong Recommend",
];

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
                    <span className="text-gray-700 font-bold text-base">
                      ✓
                    </span>
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

// ── Recommendation badge ─────────────────────────────────────────────

const RECOMMENDATION_COLORS: Record<string, string> = {
  "Strong Pass": "bg-red-50 text-red-700 border-red-200",
  Pass: "bg-orange-50 text-orange-700 border-orange-200",
  Consider: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Recommend: "bg-green-50 text-green-700 border-green-200",
  "Strong Recommend": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function RecommendationBadge({ recommendation }: { recommendation: string }) {
  const colors =
    RECOMMENDATION_COLORS[recommendation] ??
    "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${colors}`}
    >
      {recommendation}
    </span>
  );
}

// ── CTA section ──────────────────────────────────────────────────────

function CTASection() {
  return (
    <div className="mt-10 bg-stone-50 border border-stone-200 rounded-lg p-8 text-center">
      <h2 className="font-brand text-xl mb-2">
        Get this level of coverage for your screenplay
      </h2>
      <p className="text-gray-600 text-sm mb-6 max-w-lg mx-auto">
        Every coverage includes 10 category ratings, an overall recommendation,
        and detailed analysis — powered by the same methodology used by talent
        agencies and literary managers.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          href="/pricing"
          className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          See Pricing
        </Link>
        <Link
          href="/coverage"
          className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Try It Now
        </Link>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────

interface Props {
  coverageText: string;
  title: string;
  writer: string;
  draftDate: string;
  recommendation: string;
  overallScore: number;
  posterPath: string | null;
  displayGenre: string;
  releaseYear: number | null;
  slug: string;
  coverageCreatedAt: string;
}

export default function SampleDetailClient({
  coverageText,
  title,
  writer,
  draftDate,
  recommendation,
  overallScore,
  posterPath,
  displayGenre,
  releaseYear,
  slug,
  coverageCreatedAt,
}: Props) {
  const [pdfBusy, setPdfBusy] = useState(false);

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

  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w300${posterPath}`
    : null;

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

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fpc-sample-${safeName}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfBusy(false);
    }
  }, [coverageText, title, pdfBusy]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/samples"
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6 inline-block"
      >
        &larr; Back to Samples
      </Link>

      {/* Header: poster + movie info */}
      <div className="flex gap-6 mb-8">
        {posterUrl && (
          <div className="shrink-0">
            <Image
              src={posterUrl}
              alt={`${title} poster`}
              width={120}
              height={180}
              className="rounded-lg shadow-md"
              unoptimized
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-brand mb-1">
            {(title || "Untitled").toUpperCase()}
            {releaseYear && (
              <span className="text-gray-400 font-normal ml-2">
                ({releaseYear})
              </span>
            )}
          </h1>
          <div className="text-sm text-gray-500 space-y-0.5 mt-1">
            <p>
              <span className="font-semibold text-gray-600">Written by:</span>{" "}
              {writer || "Unknown"}
            </p>
            {draftDate && draftDate !== "Not specified" && (
              <p>
                <span className="font-semibold text-gray-600">Draft date:</span>{" "}
                {reformatDate(draftDate)}
              </p>
            )}
            {displayGenre && (
              <p>
                <span className="font-semibold text-gray-600">Genre:</span>{" "}
                {displayGenre}
              </p>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <RecommendationBadge recommendation={recommendation} />
            <button
              onClick={handleDownloadPDF}
              disabled={pdfBusy}
              className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
            >
              {pdfBusy ? "Generating..." : "Download PDF"}
            </button>
          </div>
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

      {/* CTA */}
      <CTASection />

      {/* TMDB attribution */}
      {posterUrl && (
        <p className="text-center text-gray-300 text-[10px] mt-6">
          Movie data provided by{" "}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-400"
          >
            TMDB
          </a>
        </p>
      )}
    </div>
  );
}
