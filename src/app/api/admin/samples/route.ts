// src/app/api/admin/samples/route.ts
// Admin API: list coverages with sample status, create/update/delete samples.

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  getCoveragesWithSampleStatus,
  setCoverageSampleFlag,
  createSampleMetadata,
  updateSampleMetadata,
  deleteSampleMetadata,
  getSampleMetadataByCoverageId,
} from '@/lib/db/samples'

async function getAdminUser(clerkId: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, clerkId))
  return user ?? null
}

/**
 * GET /api/admin/samples
 * Returns all coverages for the admin user, with sample status.
 */
export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId || !isAdmin(clerkId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const coverageList = await getCoveragesWithSampleStatus()

  // For each sample, also fetch its metadata
  const withMetadata = await Promise.all(
    coverageList.map(async (c) => {
      if (c.isSample) {
        const meta = await getSampleMetadataByCoverageId(c.id)
        return { ...c, sampleMetadata: meta }
      }
      return { ...c, sampleMetadata: null }
    })
  )

  return NextResponse.json({ coverages: withMetadata })
}

/**
 * POST /api/admin/samples
 * Actions: "create" (feature as sample), "update" (edit metadata), "remove" (un-feature).
 *
 * Body for "create":
 *   { action: "create", coverageId, tmdbId, posterPath, slug, displayGenre, releaseYear, displayOrder? }
 *
 * Body for "update":
 *   { action: "update", coverageId, ...fields to update }
 *
 * Body for "remove":
 *   { action: "remove", coverageId }
 */
export async function POST(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId || !isAdmin(clerkId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { action, coverageId } = body

  if (!action || !coverageId) {
    return NextResponse.json({ error: 'Missing action or coverageId' }, { status: 400 })
  }

  try {
    if (action === 'create') {
      const { tmdbId, posterPath, slug, displayGenre, releaseYear, displayOrder } = body

      if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
      }

      await setCoverageSampleFlag(coverageId, true)
      const metadata = await createSampleMetadata({
        coverageId,
        tmdbId: tmdbId ?? null,
        posterPath: posterPath ?? null,
        slug,
        displayGenre: displayGenre ?? null,
        releaseYear: releaseYear ?? null,
        displayOrder: displayOrder ?? 0,
      })

      return NextResponse.json({ success: true, metadata })
    }

    if (action === 'update') {
      const { tmdbId, posterPath, slug, displayGenre, releaseYear, displayOrder } = body
      const metadata = await updateSampleMetadata(coverageId, {
        ...(tmdbId !== undefined && { tmdbId }),
        ...(posterPath !== undefined && { posterPath }),
        ...(slug !== undefined && { slug }),
        ...(displayGenre !== undefined && { displayGenre }),
        ...(releaseYear !== undefined && { releaseYear }),
        ...(displayOrder !== undefined && { displayOrder }),
      })

      return NextResponse.json({ success: true, metadata })
    }

    if (action === 'remove') {
      await deleteSampleMetadata(coverageId)
      await setCoverageSampleFlag(coverageId, false)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Admin samples error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}