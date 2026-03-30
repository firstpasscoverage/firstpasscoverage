// src/lib/tmdb.ts
// TMDB API utility: search movies by title, retrieve poster URLs.
// Uses TMDB API v3. Requires TMDB_API_KEY environment variable.

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

export interface TmdbSearchResult {
  tmdbId: number
  title: string
  releaseDate: string       // "2025-04-18" or ""
  releaseYear: number | null
  posterPath: string | null  // relative path, e.g. "/abc123.jpg"
  posterUrl: string | null   // full URL at w500 size
  overview: string
}

/**
 * Search TMDB for movies matching a query string.
 * Returns up to 10 results sorted by TMDB's relevance ranking.
 */
export async function searchMovies(query: string): Promise<TmdbSearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    throw new Error('TMDB_API_KEY environment variable is not set')
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    query,
    include_adult: 'false',
  })

  const response = await fetch(`${TMDB_BASE_URL}/search/movie?${params}`)

  if (!response.ok) {
    throw new Error(`TMDB search failed: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.results || []).slice(0, 10).map((movie: any) => ({
    tmdbId: movie.id,
    title: movie.title,
    releaseDate: movie.release_date || '',
    releaseYear: movie.release_date ? parseInt(movie.release_date.substring(0, 4), 10) : null,
    posterPath: movie.poster_path || null,
    posterUrl: movie.poster_path ? getPosterUrl(movie.poster_path, 'w500') : null,
    overview: movie.overview || '',
  }))
}

/**
 * Construct a full TMDB image URL from a relative poster path.
 * Available sizes: w92, w154, w185, w342, w500, w780, original
 */
export function getPosterUrl(
  posterPath: string,
  size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string {
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`
}