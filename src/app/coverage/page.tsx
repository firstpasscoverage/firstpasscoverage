"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";

type Status = "idle" | "uploading" | "extracting" | "analyzing" | "scoring" | "done" | "error";

// ── Score label mappings ─────────────────────────────────────────────

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
      // Replace standalone heading line with scored heading
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

// ── Score parsing (from merged text, for ratings grid) ───────────────

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

// ── Ratings grid component ───────────────────────────────────────────

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

  const coverageSplit = useMemo(() => {
    if (!coverage) return null;
    let splitIndex = coverage.indexOf("\nGenre:");
    if (splitIndex === -1) splitIndex = coverage.indexOf("\n**Genre:");
    if (splitIndex === -1) return null;
    return {
      beforeMetadata: coverage.slice(0, splitIndex),
      afterMetadata: coverage.slice(splitIndex),
    };
  }, [coverage]);

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
          // Fall through — coverage displays without scores
        }
      }

      // Check for scoring error
      const errorMatch = rawText.match(/<!--FPC_SCORES_ERROR:(.*?)-->/);
      if (errorMatch) {
        console.warn("Pass 2 scoring failed:", errorMatch[1]);
        // Strip markers, show analysis without scores
        const cleanText = rawText
          .replace(/\n?<!--FPC_SCORING-->/, "")
          .replace(/\n?<!--FPC_SCORES_ERROR:.*?-->/, "")
          .trimEnd();
        setCoverage(cleanText);
      }

      setStatus("done");
      fetchCredits(); // Refresh credit balance after use
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
      <h1 className="font-brand text-2xl font-normal mb-1">Get Coverage</h1>
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
              <Link
                href="/pricing"
                className="inline-block px-5 py-2 bg-[#111] text-[#fafafa] text-[13px] font-medium rounded-md hover:bg-[#333] transition-colors"
              >
                View Pricing
              </Link>
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
            <button
              onClick={analyze}
              disabled={!file}
              className={`
                px-6 py-2.5 rounded-lg font-medium text-sm transition-colors
                ${
                  file
                    ? "bg-[#111] text-white hover:bg-[#333]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              Analyze Screenplay
            </button>

            {file && (
              <button
                onClick={reset}
                className="px-4 py-2.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear
              </button>
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
                <button
                  onClick={handleDownloadPDF}
                  disabled={pdfBusy}
                  className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50"
                >
                  {pdfBusy ? "Generating..." : "Download PDF"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(coverage);
                  }}
                  className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  Copy to clipboard
                </button>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  Analyze another
                </button>
              </div>
            )}
          </div>

          <div
            ref={coverageRef}
            className="bg-white border border-gray-200 rounded-lg p-6 max-h-[70vh] overflow-y-auto"
          >
            {status === "done" && coverageSplit && scores.categories.length > 0 ? (
              <>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                  {coverageSplit.beforeMetadata}
                </pre>

                <RatingsGrid
                  categories={scores.categories}
                  overall={scores.overall}
                />

                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                  {coverageSplit.afterMetadata}
                </pre>
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
