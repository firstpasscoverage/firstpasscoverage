import Link from "next/link";
import { Button } from "@/components/ui/button";
import WarmCallout from "@/components/WarmCallout";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <div className="max-w-[600px] mx-auto px-6">
          <h1 className="font-brand text-[32px] font-normal text-foreground leading-[1.3] tracking-[-0.5px] mb-4">
            Know where your script stands &mdash;
            <br />
            in three minutes, for $20.
          </h1>
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
            Upload your screenplay. Get detailed, calibrated coverage across ten
            rated categories with page-specific citations. Designed by industry
            professionals who&apos;ve evaluated thousands of scripts.
          </p>

          <WarmCallout className="py-4 px-6 mb-6">
            <p className="text-[13px] text-[#78644e] italic text-center">
              Coverage of your first pass, or a first pass of coverage.
            </p>
          </WarmCallout>

          <Button asChild size="lg">
            <Link href="/coverage">Get Coverage</Link>
          </Button>
          <p className="text-xs text-gray-400 mt-3.5">
            PDF format · 4MB max · Coverage in about 3 minutes
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="w-10 h-px bg-gray-300 mx-auto" />

      {/* The Problem */}
      <section className="py-16">
        <div className="max-w-[640px] mx-auto px-6">
          <h2 className="font-brand text-2xl font-normal text-foreground tracking-[-0.3px] mb-6">
            Coverage shouldn&apos;t be a luxury.
          </h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              Professional screenplay coverage runs $75 to $300 per read and
              takes one to two weeks. At those prices, most writers can afford
              feedback once or twice &mdash; not on every draft where it would
              actually help. The result: scripts go to competitions, agents, and
              producers without the writer knowing whether the material is ready.
              That&apos;s expensive, and not just in dollars.
            </p>
            <p>
              First Pass Coverage changes the math. At $20 per coverage and
              three minutes per read, you can use it the way coverage was always
              meant to work &mdash; as a development tool, not a one-time
              verdict. Run your script after a structural overhaul. Run it again
              after a dialogue pass. Know what improved and what didn&apos;t,
              with specific evidence, before you spend real money on submissions.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-10 h-px bg-gray-300 mx-auto" />

      {/* What You Get */}
      <section className="py-16">
        <div className="max-w-[640px] mx-auto px-6">
          <h2 className="font-brand text-2xl font-normal text-foreground text-center tracking-[-0.3px] mb-10">
            What every coverage includes
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                Logline
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                A distilled premise statement that captures the core dramatic
                question &mdash; the version you&apos;d pitch in a room.
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                Synopsis
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                A comprehensive, chronological summary that tracks every major
                beat from setup through resolution. Characters introduced in ALL
                CAPS with age and description.
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                10 rated categories
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                Premise, structure, character, conflict, dialogue, pacing, tone,
                originality, logic, and craft &mdash; each rated 1&ndash;5 with
                a paragraph of analysis citing specific pages and scenes.
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                Overall recommendation
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                Strong Pass through Strong Recommend, with a summative paragraph
                identifying the material&apos;s strongest and weakest elements.
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                Production metadata
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                Genre, budget tier, MPA rating, comps, locations, lead
                description, and more. Everything a producer needs to decide
                whether to read further.
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                Downloadable PDF
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                Professional coverage document suitable for development files,
                submission packages, or sharing with collaborators.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-10 h-px bg-gray-300 mx-auto" />

      {/* Why First Pass */}
      <section className="py-16">
        <div className="max-w-[640px] mx-auto px-6">
          <h2 className="font-brand text-2xl font-normal text-foreground tracking-[-0.3px] mb-8">
            Why this coverage is different
          </h2>
          <div className="space-y-8">
            <div>
              <div className="text-[13px] font-medium text-foreground mb-2">
                Built on industry methodology
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                The evaluation framework was designed by entertainment
                professionals with backgrounds at major talent agencies and in
                literary management &mdash; people who&apos;ve read thousands of
                scripts and built evaluation systems used across the industry.
                The ten categories, the rating rubric, and the diagnostic
                approach reflect how experienced readers actually assess
                material. This isn&apos;t a generic AI prompt asking &ldquo;is
                this screenplay good?&rdquo; It&apos;s a structured analytical
                framework calibrated against professional baselines.
              </p>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-2">
                Honest ratings, not flattering ratings
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Most AI tools default to telling you what you want to hear. We
                built a two-pass system specifically to prevent that. The first
                pass writes the analytical commentary without assigning any
                ratings. The second pass reads that commentary cold and derives
                ratings from what the analysis actually says. The result: when
                the coverage identifies a weakness, the rating reflects it. When
                it identifies a strength, the rating reflects that too. No
                inflation, no accommodation.
              </p>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-2">
                Coverage you can afford to use more than once
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                At $20 per analysis and three minutes per read, you can use
                First Pass Coverage throughout your development process &mdash;
                not just at the end. Track how your script improves across
                drafts. Identify which revisions moved the needle and which
                didn&apos;t. One round of traditional human coverage costs
                $75&ndash;$300. For that price, you can run your script through
                FPC four to fifteen times.
              </p>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-2">
                Your script stays yours
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your screenplay is processed in real time and is not stored,
                retained, or used to train any AI model. We use the Anthropic
                API as a processing layer &mdash; your script goes in, coverage
                comes out, nothing is kept. Period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-10 h-px bg-gray-300 mx-auto" />

      {/* Credibility */}
      <section className="py-12 pb-20">
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <h2 className="font-brand text-2xl font-normal text-foreground tracking-[-0.3px] mb-3">
            Built by people who read scripts for a living.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            First Pass Coverage was designed by development professionals with
            experience at major talent agencies and in literary management
            &mdash; people who&apos;ve spent careers reading, evaluating, and
            developing screenplays across every genre and budget level. We built
            this because we&apos;ve seen both sides of the coverage problem.
            Writers spend too much for inconsistent feedback. Producers spend too
            much time reading material that isn&apos;t ready. First Pass
            Coverage gives everyone a fast, rigorous, affordable first read
            &mdash; so the time and money that follows is better spent.
          </p>
        </div>
      </section>
    </>
  );
}
