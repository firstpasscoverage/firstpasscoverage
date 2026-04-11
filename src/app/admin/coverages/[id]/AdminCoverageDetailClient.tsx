'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RatingsGrid, { parseScores, splitCoverageAtMetadata } from '@/components/RatingsGrid';
import FormattedCoverage from '@/components/FormattedCoverage';
import RecommendationBadge from '@/components/RecommendationBadge';

type AdminCoverage = {
  id: number;
  title: string | null;
  writer: string | null;
  draftDate: string | null;
  recommendation: string | null;
  overallScore: number | null;
  calculatedScore: number | null;
  categoryScores: Record<string, number> | null;
  coverageText: string | null;
  promptVersion: string | null;
  isSample: boolean | null;
  createdAt: string;
  submitterEmail: string | null;
};

export default function AdminCoverageDetailClient({ coverage }: { coverage: AdminCoverage }) {
  const [copied, setCopied] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const handleDownloadPDF = useCallback(async () => {
    if (!coverage.coverageText || pdfBusy) return;
    setPdfBusy(true);
    try {
      const [{ pdf }, { createCoveragePDF }, { parseCoverageForPDF }] =
        await Promise.all([
          import('@react-pdf/renderer'),
          import('@/components/CoveragePDF'),
          import('@/lib/parse-coverage'),
        ]);
      const data = parseCoverageForPDF(coverage.coverageText);
      const blob = await pdf(createCoveragePDF(data)).toBlob();
      const safeName = coverage.title
        ? coverage.title.replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').toLowerCase()
        : 'coverage';
      const dateSlug = new Date(coverage.createdAt).toISOString().slice(0, 10);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeName}-fpc-${dateSlug}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfBusy(false);
    }
  }, [coverage, pdfBusy]);
  
  const scores = coverage.categoryScores ? parseScores(JSON.stringify(coverage.categoryScores)) : null;
  const split = coverage.coverageText ? splitCoverageAtMetadata(coverage.coverageText) : null;
  const coverageBody = split?.afterMetadata || coverage.coverageText;

  const handleCopy = async () => {
    if (coverage.coverageText) {
      await navigator.clipboard.writeText(coverage.coverageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link href="/admin/coverages">
        <Button variant="ghost" size="sm" className="mb-6">← All Coverages</Button>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-2">
          {coverage.title?.toUpperCase() || 'UNTITLED'}
        </h1>
        {coverage.writer && (
          <p className="text-muted-foreground mb-1">Written by {coverage.writer}</p>
        )}
        {coverage.recommendation && (
          <div className="mt-2">
            <RecommendationBadge recommendation={coverage.recommendation} />
          </div>
        )}
      </div>

      {/* Admin metadata panel */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10 p-4 mb-8">
        <h2 className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-3">
          Admin Info
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-muted-foreground">100-Point Score: </span>
            <span className="font-mono font-medium text-foreground">
              {coverage.calculatedScore ?? '—'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">User-Facing Rating: </span>
            <span className="font-medium">{coverage.overallScore ?? '—'}/5</span>
          </div>
          <div>
            <span className="text-muted-foreground">Submitted By: </span>
            <span>{coverage.submitterEmail ?? '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Draft Date: </span>
            <span>{coverage.draftDate ?? '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Created: </span>
            <span>
              {new Date(coverage.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Prompt Version: </span>
            <span className="font-mono text-xs">{coverage.promptVersion ?? '—'}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Coverage ID: </span>
            <span className="font-mono text-xs">{coverage.id}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Is Sample: </span>
            <span>{coverage.isSample ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Ratings grid */}
      {scores && <RatingsGrid {...scores} />}

      {/* Action buttons */}
      <div className="flex gap-3 my-6">
        {coverage.coverageText && (
          <>
            <Button variant="secondary" size="sm" onClick={handleDownloadPDF} disabled={pdfBusy}>
              {pdfBusy ? 'Preparing…' : 'Download PDF'}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </>
        )}
      </div>

      {/* Coverage text */}
      {coverage.coverageText && (
        <div className="mt-8">
          <FormattedCoverage text={coverageBody || ''} />
        </div>
      )}
    </main>
  );
}
