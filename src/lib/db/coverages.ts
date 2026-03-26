// src/lib/db/coverages.ts
// Coverage persistence: save, list, and fetch coverage records.

import { db } from "./index";
import { coverages } from "./schema";
import { eq, desc, and } from "drizzle-orm";

export interface SaveCoverageInput {
  userId: number;
  title: string;
  writer: string;
  draftDate: string;
  logline: string;
  genre: string;
  settingTimePeriod: string;
  recommendation: string;
  overallScore: number;
  calculatedScore: number;
  categoryScores: Record<string, number>;
  coverageText: string;
  promptVersion: string;
}

/**
 * Save a completed coverage to the database.
 * Called from the API route after Pass 2 completes.
 */
export async function saveCoverage(input: SaveCoverageInput) {
  const [row] = await db
    .insert(coverages)
    .values({
      userId: input.userId,
      title: input.title,
      writer: input.writer,
      draftDate: input.draftDate,
      logline: input.logline,
      genre: input.genre,
      settingTimePeriod: input.settingTimePeriod,
      recommendation: input.recommendation,
      overallScore: input.overallScore,
      calculatedScore: input.calculatedScore,
      categoryScores: input.categoryScores,
      coverageText: input.coverageText,
      promptVersion: input.promptVersion,
    })
    .returning();

  return row;
}

/**
 * Get all coverages for a user (library list view).
 * Returns summary fields only — not the full coverage text.
 */
export async function getCoveragesForUser(userId: number) {
  return db
    .select({
      id: coverages.id,
      title: coverages.title,
      writer: coverages.writer,
      recommendation: coverages.recommendation,
      overallScore: coverages.overallScore,
      calculatedScore: coverages.calculatedScore,
      logline: coverages.logline,
      createdAt: coverages.createdAt,
    })
    .from(coverages)
    .where(eq(coverages.userId, userId))
    .orderBy(desc(coverages.createdAt));
}

/**
 * Get a single coverage by ID, scoped to the requesting user.
 * Returns null if the coverage doesn't exist or belongs to another user.
 */
export async function getCoverageById(id: number, userId: number) {
  const [row] = await db
    .select()
    .from(coverages)
    .where(and(eq(coverages.id, id), eq(coverages.userId, userId)));

  return row ?? null;
}
