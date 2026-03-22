"use client";

import { useState, useRef, useCallback } from "react";

type Status = "idle" | "uploading" | "extracting" | "analyzing" | "done" | "error";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [coverage, setCoverage] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
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
      setError(`File is too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Maximum is 4MB.`);
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

      // Stream the response
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

        // Auto-scroll to bottom as content streams in
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
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <h1 className="text-2xl font-semibold mb-1">Screenplay Coverage Tool</h1>
        <p className="text-gray-500 mb-8">
          Upload a screenplay PDF to generate AI-powered coverage.
        </p>

        {/* Upload Area */}
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
                ${dragOver
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

            {error && (
              <p className="mt-3 text-red-600 text-sm">{error}</p>
            )}

            <div className="mt-4 flex gap-3">
              <button
                onClick={analyze}
                disabled={!file}
                className={`
                  px-6 py-2.5 rounded-lg font-medium text-sm transition-colors
                  ${file
                    ? "bg-gray-900 text-white hover:bg-gray-700"
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

        {/* Status */}
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

        {/* Coverage Output */}
        {coverage && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Coverage</h2>
              {status === "done" && (
                <div className="flex gap-2">
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
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                {coverage}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
