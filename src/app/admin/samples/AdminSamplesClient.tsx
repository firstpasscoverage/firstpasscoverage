// src/app/admin/samples/AdminSamplesClient.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'

// ---------- Types ----------

interface SampleMeta {
  coverageId: number
  tmdbId: number | null
  posterPath: string | null
  slug: string
  displayGenre: string | null
  releaseYear: number | null
  displayOrder: number
}

interface Coverage {
  id: number
  title: string | null
  writer: string | null
  genre: string | null
  recommendation: string | null
  overallScore: number | null
  calculatedScore: number | null
  isSample: boolean
  createdAt: string
  sampleMetadata: SampleMeta | null
}

interface TmdbResult {
  tmdbId: number
  title: string
  releaseDate: string
  releaseYear: number | null
  posterPath: string | null
  posterUrl: string | null
  overview: string
}

// ---------- Helpers ----------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const GENRE_OPTIONS = [
  'Action', 'Animation', 'Comedy', 'Crime', 'Drama', 'Fantasy',
  'Horror', 'Musical', 'Romance', 'Sci-Fi', 'Thriller', 'Western',
]

// ---------- Component ----------

export default function AdminSamplesClient() {
  const [coverages, setCoverages] = useState<Coverage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Which coverage row has the form open
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Form state
  const [formSlug, setFormSlug] = useState('')
  const [formGenre, setFormGenre] = useState('')
  const [formReleaseYear, setFormReleaseYear] = useState('')
  const [formDisplayOrder, setFormDisplayOrder] = useState('0')
  const [formTmdbId, setFormTmdbId] = useState<number | null>(null)
  const [formPosterPath, setFormPosterPath] = useState<string | null>(null)
  const [formPosterUrl, setFormPosterUrl] = useState<string | null>(null)

  // TMDB search
  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<TmdbResult[]>([])
  const [tmdbSearching, setTmdbSearching] = useState(false)

  // Action state
  const [saving, setSaving] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // ---------- Data fetching ----------

  const fetchCoverages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/samples')
      if (!res.ok) throw new Error('Failed to fetch coverages')
      const data = await res.json()
      setCoverages(data.coverages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoverages()
  }, [fetchCoverages])

  // ---------- TMDB search ----------

  async function handleTmdbSearch() {
    if (!tmdbQuery.trim()) return
    setTmdbSearching(true)
    setTmdbResults([])
    try {
      const res = await fetch(`/api/admin/tmdb?q=${encodeURIComponent(tmdbQuery.trim())}`)
      if (!res.ok) throw new Error('TMDB search failed')
      const data = await res.json()
      setTmdbResults(data.results || [])
    } catch (err) {
      console.error(err)
    } finally {
      setTmdbSearching(false)
    }
  }

  function selectTmdbResult(result: TmdbResult) {
    setFormTmdbId(result.tmdbId)
    setFormPosterPath(result.posterPath)
    setFormPosterUrl(result.posterUrl)
    if (result.releaseYear) {
      setFormReleaseYear(String(result.releaseYear))
    }
    setTmdbResults([])
    setTmdbQuery('')
  }

  // ---------- Form management ----------

  function openForm(coverage: Coverage) {
    setExpandedId(coverage.id)
    setActionMessage(null)

    if (coverage.isSample && coverage.sampleMetadata) {
      // Editing existing sample — populate from metadata
      const meta = coverage.sampleMetadata
      setFormSlug(meta.slug)
      setFormGenre(meta.displayGenre ?? '')
      setFormReleaseYear(meta.releaseYear ? String(meta.releaseYear) : '')
      setFormDisplayOrder(String(meta.displayOrder))
      setFormTmdbId(meta.tmdbId)
      setFormPosterPath(meta.posterPath)
      setFormPosterUrl(
        meta.posterPath ? `https://image.tmdb.org/t/p/w500${meta.posterPath}` : null
      )
    } else {
      // New sample — pre-fill from coverage data
      setFormSlug(coverage.title ? slugify(coverage.title) : '')
      setFormGenre(coverage.genre ?? '')
      setFormReleaseYear('')
      setFormDisplayOrder('0')
      setFormTmdbId(null)
      setFormPosterPath(null)
      setFormPosterUrl(null)
      // Auto-trigger TMDB search if we have a title
      if (coverage.title) {
        setTmdbQuery(coverage.title)
      }
    }
    setTmdbResults([])
  }

  function closeForm() {
    setExpandedId(null)
    setTmdbQuery('')
    setTmdbResults([])
  }

  // ---------- Save / Remove ----------

  async function handleSave(coverage: Coverage) {
    setSaving(true)
    setActionMessage(null)
    try {
      const isEditing = coverage.isSample && coverage.sampleMetadata
      const action = isEditing ? 'update' : 'create'

      const res = await fetch('/api/admin/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          coverageId: coverage.id,
          tmdbId: formTmdbId,
          posterPath: formPosterPath,
          slug: formSlug,
          displayGenre: formGenre || null,
          releaseYear: formReleaseYear ? parseInt(formReleaseYear, 10) : null,
          displayOrder: parseInt(formDisplayOrder, 10) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Save failed')
      }

      setActionMessage(isEditing ? 'Sample updated.' : 'Featured as sample!')
      closeForm()
      await fetchCoverages()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(coverageId: number) {
    if (!confirm('Remove this coverage from the Samples page?')) return
    setSaving(true)
    setActionMessage(null)
    try {
      const res = await fetch('/api/admin/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', coverageId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Remove failed')
      }
      setActionMessage('Sample removed.')
      closeForm()
      await fetchCoverages()
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : 'Remove failed')
    } finally {
      setSaving(false)
    }
  }

  // ---------- Render ----------

  if (loading) {
    return <p className="text-gray-500">Loading coverages…</p>
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>
  }

  const sampleCount = coverages.filter((c) => c.isSample).length

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {coverages.length} coverages &middot; {sampleCount} featured as samples
        </span>
        {actionMessage && (
          <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded">
            {actionMessage}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {coverages.map((coverage) => (
          <div key={coverage.id} className="border border-black/[0.08] rounded-lg bg-white">
            {/* Coverage row */}
            <div className="flex items-center gap-4 px-5 py-4">
              {/* Poster thumbnail (if sample with poster) */}
              {coverage.isSample && coverage.sampleMetadata?.posterPath && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${coverage.sampleMetadata.posterPath}`}
                  alt=""
                  className="w-10 h-14 object-cover rounded flex-shrink-0"
                />
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[#111] truncate">
                    {coverage.title || 'Untitled'}
                  </span>
                  {coverage.isSample && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      SAMPLE
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {coverage.writer || 'Unknown writer'} &middot;{' '}
                  {coverage.genre || 'No genre'} &middot;{' '}
                  {coverage.recommendation ?? '—'} ({coverage.overallScore ?? '—'})
                </div>
              </div>

              {/* Date */}
              <span className="text-xs text-gray-400 flex-shrink-0">
                {new Date(coverage.createdAt).toLocaleDateString()}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {coverage.isSample ? (
                  <>
                    <button
                      onClick={() =>
                        expandedId === coverage.id ? closeForm() : openForm(coverage)
                      }
                      className="text-sm text-[#111] underline underline-offset-2 hover:text-gray-600"
                    >
                      {expandedId === coverage.id ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleRemove(coverage.id)}
                      disabled={saving}
                      className="text-sm text-red-600 underline underline-offset-2 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      expandedId === coverage.id ? closeForm() : openForm(coverage)
                    }
                    className="text-sm bg-[#111] text-[#fafafa] px-3 py-1.5 rounded hover:bg-[#333] transition-colors"
                  >
                    {expandedId === coverage.id ? 'Cancel' : 'Feature as Sample'}
                  </button>
                )}
              </div>
            </div>

            {/* Expanded form */}
            {expandedId === coverage.id && (
              <div className="border-t border-black/[0.08] px-5 py-5 bg-[#fafafa]/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column: TMDB search + poster preview */}
                  <div>
                    <label className="block text-sm font-medium text-[#111] mb-1.5">
                      Find poster on TMDB
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={tmdbQuery}
                        onChange={(e) => setTmdbQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTmdbSearch()}
                        placeholder="Search movie title…"
                        className="flex-1 border border-black/[0.08] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111]"
                      />
                      <button
                        onClick={handleTmdbSearch}
                        disabled={tmdbSearching}
                        className="bg-[#111] text-[#fafafa] px-4 py-2 rounded text-sm hover:bg-[#333] transition-colors disabled:opacity-50"
                      >
                        {tmdbSearching ? 'Searching…' : 'Search'}
                      </button>
                    </div>

                    {/* TMDB results */}
                    {tmdbResults.length > 0 && (
                      <div className="border border-black/[0.08] rounded bg-white max-h-64 overflow-y-auto mb-3">
                        {tmdbResults.map((r) => (
                          <button
                            key={r.tmdbId}
                            onClick={() => selectTmdbResult(r)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 border-b border-black/[0.05] last:border-b-0 text-left"
                          >
                            {r.posterUrl ? (
                              <img
                                src={r.posterUrl.replace('/w500/', '/w92/')}
                                alt=""
                                className="w-8 h-12 object-cover rounded flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-12 bg-gray-200 rounded flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-[#111] truncate">
                                {r.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {r.releaseYear ?? 'Unknown year'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Selected poster preview */}
                    {formPosterUrl && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Selected poster:</p>
                        <img
                          src={formPosterUrl}
                          alt="Selected poster"
                          className="w-32 rounded shadow-sm"
                        />
                      </div>
                    )}

                    {!formPosterUrl && formTmdbId === null && (
                      <p className="text-xs text-gray-400 mt-2">
                        No poster selected. Search TMDB above to find one.
                      </p>
                    )}
                  </div>

                  {/* Right column: metadata fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111] mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={formSlug}
                        onChange={(e) => setFormSlug(slugify(e.target.value))}
                        placeholder="e.g. sinners"
                        className="w-full border border-black/[0.08] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111]"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        /samples/{formSlug || '…'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#111] mb-1">
                        Display Genre
                      </label>
                      <select
                        value={formGenre}
                        onChange={(e) => setFormGenre(e.target.value)}
                        className="w-full border border-black/[0.08] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111] bg-white"
                      >
                        <option value="">Select genre…</option>
                        {GENRE_OPTIONS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#111] mb-1">
                          Release Year
                        </label>
                        <input
                          type="number"
                          value={formReleaseYear}
                          onChange={(e) => setFormReleaseYear(e.target.value)}
                          placeholder="2025"
                          className="w-full border border-black/[0.08] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#111] mb-1">
                          Display Order
                        </label>
                        <input
                          type="number"
                          value={formDisplayOrder}
                          onChange={(e) => setFormDisplayOrder(e.target.value)}
                          placeholder="0"
                          className="w-full border border-black/[0.08] rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#111]"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleSave(coverage)}
                      disabled={saving || !formSlug}
                      className="w-full bg-[#111] text-[#fafafa] px-4 py-2.5 rounded text-sm font-medium hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving
                        ? 'Saving…'
                        : coverage.isSample
                          ? 'Update Sample'
                          : 'Save as Sample'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* TMDB attribution (required by their terms) */}
      <div className="mt-8 text-xs text-gray-400 flex items-center gap-2">
        <span>Movie data provided by</span>
        <a
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          TMDB
        </a>
      </div>
    </div>
  )
}
