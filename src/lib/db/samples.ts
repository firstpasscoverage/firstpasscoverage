// src/lib/db/samples.ts
// Sample management: queries for the admin page and public Samples page.

import { db } from "./index";
import { coverages, sampleMetadata } from "./schema";
import { eq, desc, asc } from "drizzle-orm";

// ---------- Types ----------

export interface CreateSampleMetadataInput {
  coverageId: number
  tmdbId: number | null
  posterPath: string | null
  slug: string
  displayGenre: string | null
  releaseYear: number | null
  displayOrder?: number
}

export interface UpdateSampleMetadataInput {
  tmdbId?: number | null
  posterPath?: string | null
  slug?: string
  displayGenre?: string | null
  releaseYear?: number | null
  displayOrder?: number
}

// ---------- Admin: Toggle sample status ----------

/**
 * Mark a coverage as a sample (or remove the flag).
 */
export async function setCoverageSampleFlag(coverageId: number, isSample: boolean) {
  const [row] = await db
    .update(coverages)
    .set({ isSample })
    .where(eq(coverages.id, coverageId))
    .returning();

  return row ?? null;
}

// ---------- Admin: Sample metadata CRUD ----------

/**
 * Create a sample_metadata record for a coverage.
 * Call this after setting isSample = true on the coverage.
 */
export async function createSampleMetadata(input: CreateSampleMetadataInput) {
  const [row] = await db
    .insert(sampleMetadata)
    .values({
      coverageId: input.coverageId,
      tmdbId: input.tmdbId,
      posterPath: input.posterPath,
      slug: input.slug,
      displayGenre: input.displayGenre,
      releaseYear: input.releaseYear,
      displayOrder: input.displayOrder ?? 0,
    })
    .returning();

  return row;
}

/**
 * Update an existing sample_metadata record.
 */
export async function updateSampleMetadata(coverageId: number, input: UpdateSampleMetadataInput) {
  const [row] = await db
    .update(sampleMetadata)
    .set(input)
    .where(eq(sampleMetadata.coverageId, coverageId))
    .returning();

  return row ?? null;
}

/**
 * Delete a sample_metadata record (when un-featuring a sample).
 */
export async function deleteSampleMetadata(coverageId: number) {
  const [row] = await db
    .delete(sampleMetadata)
    .where(eq(sampleMetadata.coverageId, coverageId))
    .returning();

  return row ?? null;
}

/**
 * Get sample metadata for a specific coverage.
 */
export async function getSampleMetadataByCoverageId(coverageId: number) {
  const [row] = await db
    .select()
    .from(sampleMetadata)
    .where(eq(sampleMetadata.coverageId, coverageId));

  return row ?? null;
}

// ---------- Public: Samples page queries ----------

/**
 * Get all published samples for the public Samples page.
 * Joins coverages + sample_metadata to return everything the grid needs.
 */
export async function getAllSamples() {
  return db
    .select({
      // Coverage fields
      coverageId: coverages.id,
      title: coverages.title,
      writer: coverages.writer,
      draftDate: coverages.draftDate,
      genre: coverages.genre,
      recommendation: coverages.recommendation,
      overallScore: coverages.overallScore,
      calculatedScore: coverages.calculatedScore,
      logline: coverages.logline,
      coverageText: coverages.coverageText,
      categoryScores: coverages.categoryScores,
      createdAt: coverages.createdAt,
      // Sample metadata fields
      tmdbId: sampleMetadata.tmdbId,
      posterPath: sampleMetadata.posterPath,
      slug: sampleMetadata.slug,
      displayGenre: sampleMetadata.displayGenre,
      releaseYear: sampleMetadata.releaseYear,
      displayOrder: sampleMetadata.displayOrder,
    })
    .from(coverages)
    .innerJoin(sampleMetadata, eq(coverages.id, sampleMetadata.coverageId))
    .where(eq(coverages.isSample, true))
    .orderBy(asc(sampleMetadata.displayGenre), asc(coverages.title));
}

/**
 * Get a single sample by its URL slug.
 * Used by /samples/[slug] detail page.
 */
export async function getSampleBySlug(slug: string) {
  const [row] = await db
    .select({
      coverageId: coverages.id,
      title: coverages.title,
      writer: coverages.writer,
      draftDate: coverages.draftDate,
      genre: coverages.genre,
      logline: coverages.logline,
      settingTimePeriod: coverages.settingTimePeriod,
      recommendation: coverages.recommendation,
      overallScore: coverages.overallScore,
      calculatedScore: coverages.calculatedScore,
      categoryScores: coverages.categoryScores,
      coverageText: coverages.coverageText,
      promptVersion: coverages.promptVersion,
      coverageCreatedAt: coverages.createdAt,
      tmdbId: sampleMetadata.tmdbId,
      posterPath: sampleMetadata.posterPath,
      slug: sampleMetadata.slug,
      displayGenre: sampleMetadata.displayGenre,
      releaseYear: sampleMetadata.releaseYear,
    })
    .from(coverages)
    .innerJoin(sampleMetadata, eq(coverages.id, sampleMetadata.coverageId))
    .where(eq(sampleMetadata.slug, slug));

  return row ?? null;
}

// ---------- Admin: List coverages for sample selection ----------

/**
 * Get all coverages belonging to a user, with sample status.
 * Used by the admin page to show which coverages can be featured.
 */
export async function getCoveragesWithSampleStatus() {
  return db
    .select({
      id: coverages.id,
      title: coverages.title,
      writer: coverages.writer,
      genre: coverages.genre,
      recommendation: coverages.recommendation,
      overallScore: coverages.overallScore,
      calculatedScore: coverages.calculatedScore,
      isSample: coverages.isSample,
      createdAt: coverages.createdAt,
    })
    .from(coverages)
    .orderBy(desc(coverages.createdAt));
}