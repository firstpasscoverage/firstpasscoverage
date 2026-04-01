// src/app/samples/SamplesClient.tsx
'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// ---------- Types ----------

interface Sample {
  coverageId: number
  title: string | null
  writer: string | null
  draftDate: string | null
  genre: string | null
  recommendation: string | null
  overallScore: number | null
  calculatedScore: number | null
  logline: string | null
  coverageText: string | null
  categoryScores: unknown
  createdAt: Date
  tmdbId: number | null
  posterPath: string | null
  slug: string
  displayGenre: string | null
  releaseYear: number | null
  displayOrder: number | null
}

type ViewMode = 'genre' | 'rating' | 'title' | 'recent'

// ---------- Poster Card ----------

function SampleCard({ sample }: { sample: Sample }) {
  const posterUrl = sample.posterPath
    ? `https://image.tmdb.org/t/p/w342${sample.posterPath}`
    : null

  return (
    <Link
      href={`/samples/${sample.slug}`}
      className="group flex-shrink-0 w-44 block"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-200 mb-2 shadow-sm group-hover:shadow-md transition-shadow">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={sample.title ?? 'Movie poster'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No poster
          </div>
        )}
        {/* Rating badge */}
        {sample.recommendation && (
          <div className="absolute bottom-2 right-2 bg-primary/85 text-white text-xs font-semibold px-2.5 py-1 rounded">
            {sample.recommendation}
          </div>
        )}
      </div>
      {/* Title and writer */}
      <h3 className="text-sm font-medium text-foreground truncate group-hover:underline">
        {(sample.title ?? 'Untitled').toUpperCase()}
      </h3>
      <p className="text-xs text-gray-500 truncate">
        {sample.writer ?? 'Unknown writer'}
      </p>
    </Link>
  )
}

// ---------- Horizontal Scroll Row ----------

function GenreRow({ genre, samples }: { genre: string; samples: Sample[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-brand text-xl font-normal">{genre}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-foreground"
            aria-label="Scroll left"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors text-gray-500 hover:text-foreground"
            aria-label="Scroll right"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {samples.map((sample) => (
          <SampleCard key={sample.coverageId} sample={sample} />
        ))}
      </div>
    </div>
  )
}

// ---------- Grid View (for non-genre sort modes) ----------

function SampleGrid({ samples }: { samples: Sample[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {samples.map((sample) => (
        <SampleCard key={sample.coverageId} sample={sample} />
      ))}
    </div>
  )
}

// ---------- Main Client Component ----------

export default function SamplesClient({ samples }: { samples: Sample[] }) {
  const [viewMode, setViewMode] = useState<ViewMode>('genre')

  if (samples.length === 0) {
    return (
      <p className="text-gray-500 py-8">
        No sample coverages yet. Check back soon.
      </p>
    )
  }

  // Sort functions
  function getSortedSamples(): Sample[] {
    const sorted = [...samples]
    switch (viewMode) {
      case 'rating':
        return sorted.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))
      case 'title':
        return sorted.sort((a, b) =>
          (a.title ?? '').localeCompare(b.title ?? '')
        )
      case 'recent':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      default:
        return sorted
    }
  }

  // Group by genre for genre view
  function getGenreGroups(): { genre: string; samples: Sample[] }[] {
    const groups: Record<string, Sample[]> = {}
    for (const sample of samples) {
      const genre = sample.displayGenre || 'Other'
      if (!groups[genre]) groups[genre] = []
      groups[genre].push(sample)
    }
    // Sort genres alphabetically, samples within each genre alphabetically by title
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([genre, items]) => ({
        genre,
        samples: items.sort((a, b) =>
          (a.title ?? '').localeCompare(b.title ?? '')
        ),
      }))
  }

  const views: { key: ViewMode; label: string }[] = [
    { key: 'genre', label: 'By Genre' },
    { key: 'rating', label: 'By Rating' },
    { key: 'title', label: 'By Title' },
    { key: 'recent', label: 'Recently Added' },
  ]

  return (
    <div>
      {/* View toggles */}
      <div className="flex items-center gap-1 mb-8 border-b border-border pb-3">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setViewMode(v.key)}
            className={`px-4 py-2 text-sm rounded-t transition-colors ${
              viewMode === v.key
                ? 'font-medium text-foreground bg-white border border-border border-b-white -mb-[1px]'
                : 'text-gray-500 hover:text-foreground'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {viewMode === 'genre' ? (
        getGenreGroups().map((group) => (
          <GenreRow
            key={group.genre}
            genre={group.genre}
            samples={group.samples}
          />
        ))
      ) : (
        <SampleGrid samples={getSortedSamples()} />
      )}
    </div>
  )
}
