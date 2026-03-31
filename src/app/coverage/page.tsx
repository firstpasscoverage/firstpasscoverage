"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RatingsGrid, { parseScores, splitCoverageAtMetadata } from "@/components/RatingsGrid";
import FormattedCoverage from "@/components/FormattedCoverage";

type Status = "idle" | "uploading" | "extracting" | "analyzing" | "scoring" | "done" | "error";

// ── Score label mappings (used by mergeScoresIntoHeadings) ───────────

const CATEGORY_SCORE_LABELS: Record<number, string> = {
  1: "Very Poor", 2: "Poor", 3: "Fair", 4: "Good", 5: "Excellent",
};
const OVERALL_SCORE_LABELS: Record<number, string> = {
  1: "Strong Pass", 2: "Pass", 3: "Consider", 4: "Recommend", 5: "Strong Recommend",
};

// ── Score merging (Pass 2 scores → Pass 1 headings) ─────────────────

function mergeScoresIntoHeadings(
  text: string,
  scores: Record<string, number>
): string {
  const categories = [
    "PREMISE", "STRUCTURE", "CHARACTER", "CONFLICT", "DIALOGUE",
    "PACING", "TONE", "ORIGINALITY", "LOGIC", "CRAFT",
  ];

  let result = text;

  for (const cat of categories) {
    if (scores[cat]) {
      const label = CATEGORY_SCORE_LABELS[scores[cat]] || "";
      result = result.replace(
        new RegExp(`^${cat}$`, "m"),
        `${cat} — ${label} (${scores[cat]})`
      );
    }
  }

  if (scores.OVERALL) {
    const label = OVERALL_SCORE_LABELS[scores.OVERALL] || "";
    result = result.replace(
      /^OVERALL$/m,
      `OVERALL — ${label} (${scores.OVERALL})`
    );
  }

  return result;
}

// ── Main page component ──────────────────────────────────────────────

export default function CoveragePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [coverage, setCoverage] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverageRef = useRef<HTMLDivElement>(null);

  // Credit balance
  const [credits, setCredits] = useState<{
    subscriptionCredits: number;
    purchasedCredits: number;
    subscriptionTier: string | null;
  } | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  const totalCredits = credits
    ? credits.subscriptionCredits + credits.purchasedCredits
    : 0;

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/user/credits');
      if (res.ok) {
        setCredits(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err);
    } finally {
      setCreditsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const reset = useCallback(() => {
    setFile(null);
    setStatus("idle");
    setCoverage("");
    setError("");
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setError(
        `File is too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Maximum is 4MB.`
      );
      return;
    }
    setFile(f);
    setError("");
    setCoverage("");
    setStatus("idle");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const scores = useMemo(() => parseScores(coverage), [coverage]);
  const coverageSplit = useMemo(() => splitCoverageAtMetadata(coverage), [coverage]);

  const handleDownloadPDF = useCallback(async () => {
    if (!coverage || pdfBusy) return;
    setPdfBusy(true);

    try {
      const [{ pdf }, { createCoveragePDF }, { parseCoverageForPDF }] =
        await Promise.all([
          import("@react-pdf/renderer"),
          import("@/components/CoveragePDF"),
          import("@/lib/parse-coverage"),
        ]);

      const data = parseCoverageForPDF(coverage);
      const blob = await pdf(createCoveragePDF(data)).toBlob();

      const safeName = data.scriptTitle
        ? data.scriptTitle
            .replace(/[^a-zA-Z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .toLowerCase()
        : "screenplay";

      const dateSlug = new Date().toISOString().slice(0, 10);

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
  }, [coverage, pdfBusy]);

  const analyze = async () => {
    if (!file) return;

    setError("");
    setCoverage("");
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("analyzing");

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Server error (${response.status})`);
      }

      if (!response.body) {
        throw new Error("No response stream available");
      }

      setStatus("analyzing");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let rawText = "";
      let scoringStarted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        rawText += chunk;

        // Detect scoring phase transition
        if (!scoringStarted && rawText.includes("<!--FPC_SCORING-->")) {
          scoringStarted = true;
          setStatus("scoring");
        }

        // Update display: show analysis text with markers stripped
        const displayText = rawText.replace(
          /\n?<!--FPC_SCORING-->[\s\S]*$/,
          ""
        );
        setCoverage(displayText);

        // Auto-scroll only during analysis phase
        if (!scoringStarted && coverageRef.current) {
          coverageRef.current.scrollTop = coverageRef.current.scrollHeight;
        }
      }

      // ── Stream complete — process scores ─────────────────────────
      const scoresMatch = rawText.match(/<!--FPC_SCORES:(\{[^}]*\})-->/);
      if (scoresMatch) {
        try {
          const pass2Scores: Record<string, number> = JSON.parse(
            scoresMatch[1]
          );

          // Strip all markers from raw text
          let cleanText = rawText
            .replace(/\n?<!--FPC_SCORING-->/, "")
            .replace(/\n?<!--FPC_SCORES:\{[^}]*\}-->/, "")
            .trimEnd();

          // Merge scores into headings
          cleanText = mergeScoresIntoHeadings(cleanText, pass2Scores);

          setCoverage(cleanText);
        } catch (parseErr) {
          console.error("Failed to parse Pass 2 scores:", parseErr);
        }
      }

      // Check for scoring error
      const errorMatch = rawText.match(/<!--FPC_SCORES_ERROR:(.*?)-->/);
      if (errorMatch) {
        console.warn("Pass 2 scoring failed:", errorMatch[1]);
        const cleanText = rawText
          .replace(/\n?<!--FPC_SCORING-->/, "")
          .replace(/\n?<!--FPC_SCORES_ERROR:.*?-->/, "")
          .trimEnd();
        setCoverage(cleanText);
      }

      setStatus("done");
      fetchCredits();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  };

  const statusMessages: Record<Status, string> = {
    idle: "",
    uploading: "Uploading...",
    extracting: "Extracting screenplay text...",
    analyzing: "Analyzing — this takes 60–120 seconds...",
    scoring: "Calibrating scores...",
    done: "Coverage complete.",
    error: "",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-1">Get Coverage</h1>
      <p className="text-gray-500 text-sm mb-4">
        Upload a screenplay PDF to generate professional coverage.
      </p>

      {/* Credit balance */}
      {!creditsLoading && credits && status === "idle" && (
        <div className="mb-6 text-sm text-gray-500">
          {totalCredits > 0 ? (
            <span>
              {credits.subscriptionCredits > 0 && (
                <span>{credits.subscriptionCredits} monthly credit{credits.subscriptionCredits !== 1 ? 's' : ''}</span>
              )}
              {credits.subscriptionCredits > 0 && credits.purchasedCredits > 0 && (
                <span> + </span>
              )}
              {credits.purchasedCredits > 0 && (
                <span>{credits.purchasedCredits} purchased credit{credits.purchasedCredits !== 1 ? 's' : ''}</span>
              )}
              <span> available</span>
            </span>
          ) : (
            <div className="bg-[#fffbf5] border border-[#f0e6d6] rounded-lg px-6 py-5 text-center">
              <p className="text-[15px] font-medium text-[#111] mb-1">
                No coverage credits available
              </p>
              <p className="text-[12.5px] text-gray-500 mb-3">
                Purchase a single coverage or subscribe for monthly credits.
              </p>
              <Button asChild size="lg">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {(status === "idle" || status === "error") && totalCredits > 0 ? (
        <div className="mb-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-colors duration-150
              ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : file
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-gray-400 bg-white"
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {file ? (
              <div>
                <p className="text-lg font-medium text-green-700">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)}MB — Click or drop to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg text-gray-600">Drop a screenplay PDF here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
              </div>
            )}
          </div>

          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

          <div className="mt-4 flex gap-3">
          <Button size="lg" onClick={analyze} disabled={!file}>
              Analyze Screenplay
            </Button>

            {file && (
              <Button variant="ghost" onClick={reset}>
              Clear
            </Button>
            )}
          </div>
        </div>
      ) : null}

      {status !== "idle" && status !== "error" && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {status !== "done" && (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
            )}
            {status === "done" && (
              <div className="w-4 h-4 bg-green-500 rounded-full" />
            )}
            <span className="text-sm text-gray-600">
              {statusMessages[status]}
            </span>
          </div>
        </div>
      )}

      {coverage && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Coverage</h2>
            {status === "done" && (
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleDownloadPDF} disabled={pdfBusy}>
                  {pdfBusy ? "Generating..." : "Download PDF"}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => navigator.clipboard.writeText(coverage)}>
                  Copy to clipboard
                </Button>
                <Button variant="secondary" size="sm" onClick={reset}>
                  Analyze another
                </Button>
              </div>
            )}
          </div>

          <div
            ref={coverageRef}
            className="bg-white border border-gray-200 rounded-lg p-6 max-h-[70vh] overflow-y-auto"
          >
            {status === "done" && coverageSplit && scores.categories.length > 0 ? (
              <>
                <FormattedCoverage text={coverageSplit.beforeMetadata} />

                <RatingsGrid
                  categories={scores.categories}
                  overall={scores.overall}
                />

                <FormattedCoverage text={coverageSplit.afterMetadata} />
              </>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                {coverage}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
