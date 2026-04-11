// src/app/library/[id]/CoverageDetailClient.tsx
// Client component for rendering saved coverage — matches /coverage page
// visual output with ratings grid, PDF download, and clipboard copy.

"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import posthog from "posthog-js";
import { Button } from "@/components/ui/button";
import RatingsGrid, { parseScores, splitCoverageAtMetadata } from "@/components/RatingsGrid";
import FormattedCoverage, { reformatDate } from "@/components/FormattedCoverage";

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
  const coverageSplit = useMemo(() => splitCoverageAtMetadata(coverageText), [coverageText]);

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
    posthog.capture("library_coverage_copied", { title });
  }, [coverageText, title]);

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
      posthog.capture("library_coverage_pdf_downloaded", { title });
    } catch (err) {
      console.error("PDF generation failed:", err);
      posthog.captureException(err);
    } finally {
      setPdfBusy(false);
    }
  }, [coverageText, title, createdAt, pdfBusy]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/library"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
      >
        &larr; Back to Library
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-1">
            {(title || "Untitled").toUpperCase()}
          </h1>
          <p className="text-muted-foreground text-sm">
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
          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={pdfBusy}
          >
            {pdfBusy ? "Generating..." : "Download PDF"}
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy to clipboard"}
          </Button>
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
    </div>
  );
}
