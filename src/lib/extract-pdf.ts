/**
 * PDF Text Extraction for Screenplay Analysis
 *
 * Ported from Feelix run-analysis.ts (Phase 3a).
 * Uses mupdf (WebAssembly MuPDF bindings) to extract text with page markers.
 *
 * Validated across 5 screenplays in Feelix calibration:
 *   - The Nightingale (124 pages, ~37K tokens)
 *   - Die in a Gunfight (109 pages, ~31K tokens)
 *   - My Favorite Season (121 pages, ~29K tokens)
 *   - The Plane (112 pages, ~37K tokens)
 *   - The Post (118 pages, ~30K tokens)
 */

import * as mupdf from "mupdf";

interface StructuredTextBlock {
  type: string;
  lines: Array<{ text: string }>;
}

interface StructuredTextJSON {
  blocks: StructuredTextBlock[];
}

export interface ExtractionResult {
  text: string;
  pageCount: number;
  estimatedTokens: number;
}

/**
 * Extract screenplay text from a PDF buffer.
 * Returns text with [PAGE N] markers for each page, matching the format
 * expected by the single-reader prompt's citation system.
 */
export function extractScreenplay(buffer: Buffer | ArrayBuffer | Uint8Array): ExtractionResult {
  const doc = mupdf.Document.openDocument(buffer, "application/pdf");
  const pageCount = doc.countPages();
  const pages: string[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = doc.loadPage(i);
    const stext = page.toStructuredText("preserve-whitespace");

    const json = JSON.parse(stext.asJSON()) as StructuredTextJSON;

    const text = json.blocks
      .filter((b) => b.type === "text")
      .flatMap((b) => b.lines.map((l) => l.text))
      .join("\n");

    if (text.trim()) {
      pages.push(`[PAGE ${i + 1}]\n${text}`);
    }
  }

  const combined = pages.join("\n\n");

  return {
    text: combined,
    pageCount,
    estimatedTokens: Math.round(combined.length / 4),
  };
}
