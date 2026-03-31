// src/app/samples/page.tsx
// Public Samples page — browse featured coverages by genre, rating, or title.

import { getAllSamples } from '@/lib/db/samples'
import SamplesClient from './SamplesClient'

export const metadata = {
  title: 'Sample Coverages — First Pass Coverage',
  description: 'Browse AI-powered screenplay coverage of produced films. See what our analysis looks like before you buy.',
}

export const dynamic = 'force-dynamic'

export default async function SamplesPage() {
  const samples = await getAllSamples()

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-3">
            Sample Coverages
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            See what First Pass Coverage delivers. Browse full coverage of produced films — 
            read the analysis, check the ratings, and download the PDF. This is exactly 
            what you get for your script.
          </p>
        </div>

        <SamplesClient samples={samples} />

        {/* TMDB attribution */}
        <div className="mt-12 text-xs text-gray-400 flex items-center gap-2">
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
    </div>
  )
}
