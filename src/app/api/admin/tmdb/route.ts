// src/app/api/admin/tmdb/route.ts
// Proxy for TMDB movie search. Keeps the API key server-side.

import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin'
import { searchMovies } from '@/lib/tmdb'

/**
 * GET /api/admin/tmdb?q=sinners
 * Returns TMDB search results for the given query.
 */
export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId || !isAdmin(clerkId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const query = request.nextUrl.searchParams.get('q')
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 })
  }

  try {
    const results = await searchMovies(query.trim())
    return NextResponse.json({ results })
  } catch (error) {
    console.error('TMDB search error:', error)
    return NextResponse.json({ error: 'TMDB search failed' }, { status: 500 })
  }
}