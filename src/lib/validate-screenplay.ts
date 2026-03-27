// src/lib/validate-screenplay.ts
// Validates that an extracted PDF is a feature film screenplay before
// spending money on AI analysis. Two layers:
//   Layer 1: Structural heuristics (free, instant)
//   Layer 2: Haiku AI check for ambiguous cases (~$0.001, ~2 sec)

import Anthropic from "@anthropic-ai/sdk";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const HAIKU_MODEL = "anthropic/claude-haiku-4-5-20251001";

// Minimum scene headings to confidently identify a screenplay
const SCENE_HEADING_THRESHOLD = 10;

// Page count bounds for feature screenplays (permissive)
const MIN_PAGES = 30;
const MAX_PAGES = 250;

/**
 * Validate that extracted PDF text is a feature film screenplay.
 * Returns { valid: true } or { valid: false, reason: "user-facing message" }.
 */
export async function validateScreenplay(
  text: string,
  pageCount: number,
  client: Anthropic
): Promise<ValidationResult> {
  // ── Layer 1: Structural heuristics ─────────────────────────────

  if (pageCount < MIN_PAGES) {
    return {
      valid: false,
      reason: `This document is only ${pageCount} pages — too short for a feature screenplay. Feature scripts are typically 80–130 pages.`,
    };
  }

  if (pageCount > MAX_PAGES) {
    return {
      valid: false,
      reason: `This document is ${pageCount} pages — too long for a feature screenplay. Feature scripts are typically 80–130 pages. If this is a shooting script with revision pages, try uploading the base draft.`,
    };
  }

  // Scene headings (INT./EXT.) — the most reliable screenplay signal
  const sceneHeadingPattern = /^\s*(INT\.|EXT\.|INT\.\/EXT\.|I\/E\.)\s/gm;
  const sceneHeadings = (text.match(sceneHeadingPattern) || []).length;

  // FADE IN — common screenplay opener
  const hasFadeIn = /FADE\s*IN/i.test(text);

  // High confidence: clearly a screenplay
  if (sceneHeadings >= SCENE_HEADING_THRESHOLD) {
    return { valid: true };
  }

  // High confidence: clearly NOT a screenplay
  if (sceneHeadings === 0 && !hasFadeIn) {
    return {
      valid: false,
      reason:
        "This document doesn't appear to be a screenplay — no scene headings (INT./EXT.) or other screenplay formatting were found. First Pass Coverage currently analyzes feature film screenplays only. Please upload a screenplay in standard format.",
    };
  }

  // ── Layer 2: Ambiguous — ask Haiku ─────────────────────────────

  const firstPages = extractFirstPages(text, 3);

  try {
    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 150,
      system:
        "You evaluate whether documents are feature film screenplays. Respond with ONLY a JSON object, no other text.",
      messages: [
        {
          role: "user",
          content: `Here are the first few pages of a ${pageCount}-page document. Is this a feature film screenplay in standard screenplay format?\n\nRespond with JSON: {"is_screenplay": true} or {"is_screenplay": false, "document_type": "brief description of what this appears to be"}\n\n${firstPages}`,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    try {
      const parsed = JSON.parse(
        responseText.replace(/```json|```/g, "").trim()
      );

      if (parsed.is_screenplay) {
        return { valid: true };
      } else {
        const docType =
          parsed.document_type || "something other than a screenplay";
        return {
          valid: false,
          reason: `This document appears to be ${docType}, not a feature film screenplay. First Pass Coverage currently analyzes feature film screenplays only.`,
        };
      }
    } catch {
      // Can't parse Haiku's response — let it through
      // (better to attempt coverage than reject a valid screenplay)
      console.warn(
        "Could not parse Haiku validation response:",
        responseText
      );
      return { valid: true };
    }
  } catch (err) {
    // Haiku call failed — let it through rather than block
    console.warn("Haiku validation failed, allowing document:", err);
    return { valid: true };
  }
}

/**
 * Extract approximately the first N pages using [PAGE N] markers from mupdf.
 */
function extractFirstPages(text: string, n: number): string {
  const marker = `[PAGE ${n + 1}]`;
  const idx = text.indexOf(marker);
  if (idx === -1) {
    return text.slice(0, 3000);
  }
  return text.slice(0, idx);
}
