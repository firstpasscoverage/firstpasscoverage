/**
 * POST /api/analyze
 *
 * Accepts a screenplay PDF via FormData, extracts text, and streams
 * coverage back from Claude Opus 4.6 via Vercel AI Gateway.
 *
 * Request: FormData with "file" field containing a PDF
 * Response: Streamed plain text (coverage output)
 */

import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractScreenplay } from "@/lib/extract-pdf";
import { SYSTEM_PROMPT } from "@/lib/prompts/single-reader";

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

export async function POST(request: NextRequest) {
  try {
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
          error: "Could not extract text from this PDF. It may be corrupted, encrypted, or image-only.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    if (extraction.estimatedTokens < 1000) {
      return new Response(
        JSON.stringify({
          error: "This PDF doesn't appear to contain enough text for a screenplay. Extracted only ~" +
            extraction.estimatedTokens.toLocaleString() + " tokens.",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(
      `Extracted ${extraction.pageCount} pages, ~${extraction.estimatedTokens.toLocaleString()} tokens from "${file.name}"`
    );

    // ── Stream analysis from Claude ──────────────────────────────────
    const stream = client.messages.stream({
      model: MODEL,
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Please analyze the following screenplay and produce complete coverage.\n\n${extraction.text}`,
        },
      ],
    });

    // Convert the Anthropic stream to a ReadableStream of text chunks
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Streaming error:", err);
          controller.error(err);
        }
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
      JSON.stringify({ error: "An unexpected error occurred. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
