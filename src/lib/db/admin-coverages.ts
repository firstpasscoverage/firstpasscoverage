import { db } from './index';
import { coverages, users } from './schema';
import { desc, eq, ilike, or, and, gte, lte, sql } from 'drizzle-orm';

export type AdminCoverage = {
  id: number;
  title: string | null;
  writer: string | null;
  draftDate: string | null;
  recommendation: string | null;
  overallScore: number | null;
  calculatedScore: number | null;
  categoryScores: Record<string, number> | null;
  coverageText: string | null;
  promptVersion: string | null;
  isSample: boolean | null;
  createdAt: Date;
  submitterEmail: string | null;
  submitterClerkId: string | null;
};

export async function getAllCoveragesForAdmin(options?: {
  search?: string;
  recommendation?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<AdminCoverage[]> {
  const conditions = [];

  if (options?.search) {
    const term = `%${options.search}%`;
    conditions.push(
      or(
        ilike(coverages.title, term),
        ilike(coverages.writer, term),
        ilike(users.email, term)
      )
    );
  }

  if (options?.recommendation) {
    conditions.push(eq(coverages.recommendation, options.recommendation));
  }

  if (options?.dateFrom) {
    conditions.push(gte(coverages.createdAt, new Date(options.dateFrom)));
  }

  if (options?.dateTo) {
    // Add a day to make the "to" date inclusive
    const toDate = new Date(options.dateTo);
    toDate.setDate(toDate.getDate() + 1);
    conditions.push(lte(coverages.createdAt, toDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const results = await db
    .select({
      id: coverages.id,
      title: coverages.title,
      writer: coverages.writer,
      draftDate: coverages.draftDate,
      recommendation: coverages.recommendation,
      overallScore: coverages.overallScore,
      calculatedScore: coverages.calculatedScore,
      categoryScores: coverages.categoryScores,
      coverageText: coverages.coverageText,
      promptVersion: coverages.promptVersion,
      isSample: coverages.isSample,
      createdAt: coverages.createdAt,
      submitterEmail: users.email,
      submitterClerkId: users.clerkId,
    })
    .from(coverages)
    .leftJoin(users, eq(coverages.userId, users.id))
    .where(whereClause)
    .orderBy(desc(coverages.createdAt));

  return results as AdminCoverage[];
}

export async function getCoverageForAdmin(id: number): Promise<AdminCoverage | null> {
  const results = await db
    .select({
      id: coverages.id,
      title: coverages.title,
      writer: coverages.writer,
      draftDate: coverages.draftDate,
      recommendation: coverages.recommendation,
      overallScore: coverages.overallScore,
      calculatedScore: coverages.calculatedScore,
      categoryScores: coverages.categoryScores,
      coverageText: coverages.coverageText,
      promptVersion: coverages.promptVersion,
      isSample: coverages.isSample,
      createdAt: coverages.createdAt,
      submitterEmail: users.email,
      submitterClerkId: users.clerkId,
    })
    .from(coverages)
    .leftJoin(users, eq(coverages.userId, users.id))
    .where(eq(coverages.id, id));

  return (results[0] as AdminCoverage) ?? null;
}
