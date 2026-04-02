// src/app/samples/page.tsx
// Public Samples page — browse featured coverages by genre, rating, or title.

import { getAllSamples } from '@/lib/db/samples'
import SamplesClient from './SamplesClient'

export const metadata = {
  title: 'Sample Coverage — First Pass Coverage',
  description: 'Browse AI-powered screenplay coverage of produced films. Try before you buy (but also don't sweat it: If you're not satisfied, ping us, we'll refund you: contact@firstpasscoverage.com).',
}

export const dynamic = 'force-dynamic'

export default async function SamplesPage() {
  const samples = await getAllSamples()

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="max-w-4xl mb-10">
          <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-3">
            Sample Coverage
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Don't just take our word for it - see what First Pass Coverage delivers. Browse, review our analyses,
            second-guess the ratings, and download the PDFs. This is the level of scrutiny you should expect for every draft.
          </p>
        </div>

        <SamplesClient samples={samples} />

        {/* TMDB attribution */}
        <div className="mt-12 text-xs text-gray-400 flex items-center gap-2">
          <span>Data for released movies provided by</span>
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
