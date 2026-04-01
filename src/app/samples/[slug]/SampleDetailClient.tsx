// src/app/samples/[slug]/SampleDetailClient.tsx
// Client component for rendering a sample coverage — public, no auth required.
// Adapted from library's CoverageDetailClient: adds poster header, CTA,
// removes clipboard copy (user tool, not marketing tool).

"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import RecommendationBadge from "@/components/RecommendationBadge";
import RatingsGrid, { parseScores, splitCoverageAtMetadata } from "@/components/RatingsGrid";
import FormattedCoverage, { reformatDate } from "@/components/FormattedCoverage";

// ── CTA section ──────────────────────────────────────────────────────

function CTASection() {
  return (
    <div className="mt-10 bg-stone-50 border border-border rounded-lg p-8 text-center">
      <h2 className="font-brand text-2xl font-normal tracking-[-0.3px] mb-2">
        Get this level of coverage for your screenplay
      </h2>
      <p className="text-gray-600 text-sm mb-6 max-w-lg mx-auto">
        Every coverage includes 10 category ratings, an overall recommendation,
        and detailed analysis — powered by the same methodology used by talent
        agencies and literary managers.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Button asChild size="lg">
          <Link href="/pricing">See Pricing</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/coverage">Try It Now</Link>
        </Button>
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
  const coverageSplit = useMemo(() => splitCoverageAtMetadata(coverageText), [coverageText]);

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
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
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
          <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-1">
            {(title || "Untitled").toUpperCase()}
            {releaseYear && (
              <span className="text-gray-400 font-normal ml-2">
                ({releaseYear})
              </span>
            )}
          </h1>
          <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
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
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={pdfBusy}
            >
              {pdfBusy ? "Generating..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Coverage content */}
      <div className="bg-white border border-border rounded-lg p-6">
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
