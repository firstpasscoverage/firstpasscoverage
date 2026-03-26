// src/lib/coverage-utils.ts
// Utilities for merging two-pass output and computing derived scores.
//
// Scoring formula origin: Spec Scout/Slated rubric, with two Feelix modifications:
//   Structure: 15 → 25 (structural quality matters more for audience-facing evaluation)
//   Craft: 30 → 15 (formatting/punctuation matter less when evaluating the story blueprint)
// See FPC_SCORING_FORMULA.md for full reference.

const CATEGORY_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Fair",
  4: "Good",
  5: "Excellent",
};

const OVERALL_LABELS: Record<number, string> = {
  1: "Strong Pass",
  2: "Pass",
  3: "Consider",
  4: "Recommend",
  5: "Strong Recommend",
};

/** Feelix/FPC category weights (from rubric_config.json feelix_weights). */
const CATEGORY_WEIGHTS: Record<string, number> = {
  OVERALL: 100,
  PREMISE: 30,
  STRUCTURE: 25,
  CHARACTER: 30,
  CONFLICT: 20,
  DIALOGUE: 30,
  PACING: 10,
  TONE: 30,
  ORIGINALITY: 5,
  LOGIC: 10,
  CRAFT: 15,
};

/** Sum of all weights — divisor for raw percentage. */
const TOTAL_WEIGHT = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0); // 305

const CATEGORY_NAMES = [
  "PREMISE", "STRUCTURE", "CHARACTER", "CONFLICT", "DIALOGUE",
  "PACING", "TONE", "ORIGINALITY", "LOGIC", "CRAFT",
];

/**
 * Merge Pass 2 scores into Pass 1 analysis text.
 * Replaces standalone category headings (e.g. "PREMISE") with scored
 * headings (e.g. "PREMISE — Good (4)"). Returns the final coverage text
 * in the same format the frontend produces after score insertion.
 */
export function mergeScoresIntoAnalysis(
  analysisText: string,
  scores: Record<string, number>
): string {
  let merged = analysisText;

  for (const name of CATEGORY_NAMES) {
    const score = scores[name];
    if (score === undefined) continue;
    const label = CATEGORY_LABELS[score] ?? "Fair";
    merged = merged.replace(
      new RegExp(`^${name}$`, "m"),
      `${name} \u2014 ${label} (${score})`
    );
  }

  const overallScore = scores["OVERALL"];
  if (overallScore !== undefined) {
    const overallLabel = OVERALL_LABELS[overallScore] ?? "Consider";
    merged = merged.replace(
      /^OVERALL$/m,
      `OVERALL \u2014 ${overallLabel} (${overallScore})`
    );
  }

  return merged;
}

/**
 * Compute the 100-point "Slated-style" score from category scores.
 *
 * Formula: Final = 0.78 × Raw + 22
 * where Raw = (weighted_sum / 305) × 100
 * and weighted_sum = Σ (score/5 × weight) for all 11 categories including Overall.
 */
export function computeCalculatedScore(
  scores: Record<string, number>
): number {
  let weightedSum = 0;

  for (const [name, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const score = scores[name];
    if (score !== undefined) {
      weightedSum += (score / 5) * weight;
    }
  }

  if (weightedSum === 0) return 0;

  const raw = (weightedSum / TOTAL_WEIGHT) * 100;
  const final = Math.round(0.78 * raw + 22);
  return Math.max(0, Math.min(100, final));
}

/** Get the display label for an overall recommendation score. */
export function getOverallLabel(score: number): string {
  return OVERALL_LABELS[score] ?? "Consider";
}

/** Get the display label for a category score. */
export function getCategoryLabel(score: number): string {
  return CATEGORY_LABELS[score] ?? "Fair";
}
