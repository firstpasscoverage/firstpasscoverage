"use client";

import { useState, useRef, useCallback, useMemo } from "react";

type Status = "idle" | "uploading" | "extracting" | "analyzing" | "done" | "error";

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

export default function CoveragePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [coverage, setCoverage] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverageRef = useRef<HTMLDivElement>(null);

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
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCoverage(fullText);

        if (coverageRef.current) {
          coverageRef.current.scrollTop = coverageRef.current.scrollHeight;
        }
      }

      setStatus("done");
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
    done: "Coverage complete.",
    error: "",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-brand text-2xl font-normal mb-1">Get Coverage</h1>
      <p className="text-gray-500 text-sm mb-8">
        Upload a screenplay PDF to generate professional coverage.
      </p>

      {status === "idle" || status === "error" ? (
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
