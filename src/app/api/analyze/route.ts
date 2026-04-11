/**
 * POST /api/analyze
 *
 * Accepts a screenplay PDF via FormData, extracts text, and produces
 * coverage via a two-pass architecture:
 *
 * Pass 1 (streamed): Analytical commentary without scores
 * Pass 2 (not streamed): Reads commentary cold and assigns scores
 *
 * After Pass 2, the merged coverage is saved to the database.
 *
 * The response is a single stream. Analysis text streams in real time,
 * followed by marker events for the scoring phase:
 *   <!--FPC_SCORING-->     — signals scoring has begun
 *   <!--FPC_SCORES:{...}--> — delivers the scores as JSON
 *   <!--FPC_SCORES_ERROR:msg--> — if Pass 2 fails
 */

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getPostHogClient } from "@/lib/posthog-server";
import { extractScreenplay } from "@/lib/extract-pdf";
import { ANALYSIS_PROMPT } from "@/lib/prompts/single-reader-analysis";
import { SCORING_PROMPT } from "@/lib/prompts/single-reader-scoring";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/db/users";
import { saveCoverage } from "@/lib/db/coverages";
import { parseCoverageForPDF } from "@/lib/parse-coverage";
import {
  mergeScoresIntoAnalysis,
  computeCalculatedScore,
} from "@/lib/coverage-utils";
import { validateScreenplay } from "@/lib/validate-screenplay";
import { hasCredits, decrementCredit } from "@/lib/db/users";

// Allow up to 5 minutes for the analysis to complete (requires Vercel Pro)
export const maxDuration = 300;

// Vercel AI Gateway — Anthropic-compatible endpoint
const AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh";
const MODEL = "anthropic/claude-opus-4-6";

const client = new Anthropic({
  baseURL: AI_GATEWAY_BASE_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY!,
});

// Max file size: 4MB (Vercel body limit is 4.5MB, leave headroom for FormData overhead)
const MAX_FILE_SIZE = 4 * 1024 * 1024;

/**
 * Extract the comments section (PREMISE through OVERALL) from Pass 1 output.
 * Pass 2 receives ONLY this — no screenplay text, logline, synopsis, or metadata.
 */
function extractCommentary(fullText: string): string {
  // Find PREMISE as a standalone heading line (start of comments section)
  const match = fullText.match(/^PREMISE$/m);
  if (!match || match.index === undefined) {
    // Fallback: send everything (Pass 2 will still work, just with extra context)
    console.warn(
      "Could not locate PREMISE heading in Pass 1 output — sending full text to Pass 2"
    );
    return fullText;
  }
  return fullText.slice(match.index);
}

/**
 * Parse Pass 2's structured score output into a record.
 */
function parsePassTwoScores(text: string): Record<string, number> {
  const scores: Record<string, number> = {};
  const categories = [
    "PREMISE", "STRUCTURE", "CHARACTER", "CONFLICT", "DIALOGUE",
    "PACING", "TONE", "ORIGINALITY", "LOGIC", "CRAFT", "OVERALL",
  ];
  for (const line of text.split("\n")) {
    const match = line.match(/^([A-Z]+):\s*(\d)/);
    if (match && categories.includes(match[1])) {
      scores[match[1]] = parseInt(match[2]);
    }
  }
  return scores;
}

export async function POST(request: NextRequest) {
  try {
    // ── Authenticate and sync user ───────────────────────────────────
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const clerkUser = await currentUser();
    const email =
      clerkUser?.emailAddresses[0]?.emailAddress ?? "unknown";
    const dbUser = await getOrCreateUser(clerkId, email);

  // ── Check coverage credits ───────────────────────────────────────
  const userHasCredits = await hasCredits(dbUser.id);
  if (!userHasCredits) {
    return new Response(
      JSON.stringify({ error: "No coverage credits available. Visit /pricing to purchase." }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
  }

    // ── Parse the uploaded file ──────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No PDF file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return new Response(
        JSON.stringify({ error: "File must be a PDF" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 4MB.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Extract text from PDF ────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extraction;
    try {
      extraction = extractScreenplay(buffer);
    } catch (err) {
      console.error("PDF extraction failed:", err);
      return new Response(
        JSON.stringify({
          error:
            "Could not extract text from this PDF. It may be corrupted, encrypted, or image-only.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    if (extraction.estimatedTokens < 1000) {
      return new Response(
        JSON.stringify({
          error:
            "This PDF doesn't appear to contain enough text for a screenplay. Extracted only ~" +
            extraction.estimatedTokens.toLocaleString() +
            " tokens.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(
      `Extracted ${extraction.pageCount} pages, ~${extraction.estimatedTokens.toLocaleString()} tokens from "${file.name}"`
    );

// ── Validate that this is a feature screenplay ───────────────────
    const validation = await validateScreenplay(
      extraction.text,
      extraction.pageCount,
      client
    );

    if (!validation.valid) {
      console.log(`Validation rejected "${file.name}": ${validation.reason}`);
      return new Response(
        JSON.stringify({ error: validation.reason }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Two-pass analysis ────────────────────────────────────────────
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullAnalysisText = "";

        try {
          // ── Pass 1: Stream analytical commentary ───────────────────
          const stream = client.messages.stream({
            model: MODEL,
            max_tokens: 8192,
            system: ANALYSIS_PROMPT,
            messages: [
              {
                role: "user",
                content: `Please analyze the following screenplay and produce complete coverage.\n\n${extraction.text}`,
              },
            ],
          });

          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const chunk = event.delta.text;
              fullAnalysisText += chunk;
              controller.enqueue(encoder.encode(chunk));
            }
          }

          // ── Signal scoring phase to frontend ───────────────────────
          controller.enqueue(encoder.encode("\n<!--FPC_SCORING-->"));

          // ── Pass 2: Score from commentary ──────────────────────────
          const commentary = extractCommentary(fullAnalysisText);

          console.log(
            `Pass 1 complete. Commentary extracted (${commentary.length} chars). Running Pass 2...`
          );

          const scoringResponse = await client.messages.create({
            model: MODEL,
            max_tokens: 256,
            system: SCORING_PROMPT,
            messages: [
              {
                role: "user",
                content: commentary,
              },
            ],
          });

          const scoresText =
            scoringResponse.content[0].type === "text"
              ? scoringResponse.content[0].text
              : "";

          const scores = parsePassTwoScores(scoresText);

          console.log("Pass 2 scores:", scores);

          // Send scores to frontend
          controller.enqueue(
            encoder.encode(`\n<!--FPC_SCORES:${JSON.stringify(scores)}-->`)
          );

          // ── Save coverage to database ──────────────────────────────
          try {
            const mergedText = mergeScoresIntoAnalysis(
              fullAnalysisText,
              scores
            );
            const parsed = parseCoverageForPDF(mergedText);

            // Extract specific metadata fields for queryable columns
            const genre =
              parsed.metadata.find(
                (m) => m.key.toLowerCase() === "genre"
              )?.value ?? "";
            const timePeriod =
              parsed.metadata.find(
                (m) => m.key.toLowerCase() === "time period"
              )?.value ?? "";

            await saveCoverage({
              userId: dbUser.id,
              title: parsed.scriptTitle,
              writer: parsed.writer,
              draftDate: parsed.draftDate,
              logline: parsed.logline,
              genre,
              settingTimePeriod: timePeriod,
              recommendation: parsed.overall?.label ?? "",
              overallScore: parsed.overall?.score ?? 0,
              calculatedScore: computeCalculatedScore(scores),
              categoryScores: scores,
              coverageText: mergedText,
              promptVersion: "v0.6.1",
            });

            console.log(
              `Coverage saved for user ${dbUser.id}: "${parsed.scriptTitle}"`
            );

            getPostHogClient().capture({
              distinctId: clerkId,
              event: "coverage_analyzed",
              properties: {
                title: parsed.scriptTitle,
                writer: parsed.writer,
                genre,
                page_count: extraction.pageCount,
                overall_score: parsed.overall?.score ?? null,
                recommendation: parsed.overall?.label ?? null,
                calculated_score: computeCalculatedScore(scores),
              },
            });

            // Decrement one credit (subscription first, then purchased)
            const credited = await decrementCredit(dbUser.id);
            if (credited) {
              console.log(`Credit decremented for user ${dbUser.id}`);
            } else {
              console.error(`Failed to decrement credit for user ${dbUser.id} — no credits found`);
            }
            
          } catch (saveErr) {
            // Don't break the response — user still has their coverage
            console.error(
              "Failed to save coverage to database:",
              saveErr
            );
          }
        } catch (err) {
          console.error("Analysis error:", err);

          // If we have analysis text, the user still gets the commentary
          // even if scoring failed
          if (fullAnalysisText.length > 0) {
            const errorMsg =
              err instanceof Error ? err.message : "Scoring failed";
            controller.enqueue(
              encoder.encode(`\n<!--FPC_SCORES_ERROR:${errorMsg}-->`)
            );
          } else {
            controller.error(err);
            return;
          }
        }

        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Pages": String(extraction.pageCount),
        "X-Estimated-Tokens": String(extraction.estimatedTokens),
      },
    });
  } catch (err) {
    console.error("Unexpected error in /api/analyze:", err);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
