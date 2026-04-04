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
            You're not alone: Everyone needs a first pass take on their latest draft. 
            <br />
            First Pass Coverage is exactly what it sounds like: Quick, AI-generated 
            coverage in the format industry pros have relied upon for decades.
          </p>

          <Button asChild size="lg">
            <Link href="/coverage">Get Coverage</Link>
          </Button>
          <p className="text-xs text-gray-400 mt-3.5">
            PDF format · 4MB max · Coverage in less than 3 minutes
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="w-10 h-px bg-gray-300 mx-auto" />

      {/* The Problem */}
      <section className="py-16">
        <div className="max-w-[640px] mx-auto px-6">
          <h2 className="font-brand text-[32px] font-normal text-foreground leading-[1.3] tracking-[-0.5px] mb-4 text-center">
            Creative feedback shouldn&apos;t be a luxury.
          </h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <p>
              Professional screenplay coverage runs $75 to $300 per read and
              takes one to two weeks. Reasonable pricing and timing (a guy's gotta eat),
              but at those prices, most writers can only afford feedback here and there &mdash; 
              not on every draft where it would actually help. The result: Scripts 
              get submitted to competitions, agents, and producers without the writer 
              knowing whether the material is ready. That&apos;s expensive, and not just in dollars.
            </p>
            <p>
              First Pass Coverage changes the math. At $20 per coverage (far less for subscribers)
              and three minutes per read, you can use it the way coverage was always
              meant to work &mdash; as a development tool, not a one-time, end-all,
              be-all assessment. Run a draft after a structural overhaul. Run one again
              after a dialogue pass. Know what improved and what didn&apos;t,
              with specific evidence, before you spend real money on competitions and festivals.
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
                A beat by beat summary from setup through resolution. Characters 
                introduced in ALL CAPS with age and description.
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                10 rated categories
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                Premise, structure, character, conflict, dialogue, pacing, tone,
                originality, logic, and craft &mdash; each rated from Weak to Excellent,
                with a paragraph of analysis citing specific pages and scenes.
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
                Genre, budget tier, MPA rating, comps, locations, lead description,
                and more. All the basic context producers need, at a glance.
              </div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-1">
                Downloadable PDF
              </div>
              <div className="text-[12.5px] text-muted-foreground leading-relaxed">
                Professional coverage document, suitable for development files,
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
          <h2 className="font-brand text-2xl font-normal text-foreground tracking-[-0.3px] mb-8 text-center">
            Why this coverage is different
          </h2>
          <div className="space-y-8">
            <div>
              <div className="text-[13px] font-medium text-foreground mb-2">
                Built on industry methodology
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                FPC's evaluation framework was designed by entertainment
                professionals with backgrounds at studios, agencies, production 
                companies, and management companies &mdash; people who&apos;ve 
                read tens of thousands of scripts and written coverage throughout the
                industry. The ten categories, the rating rubric, and the diagnostic
                approach reflect how experienced readers actually assess material.
                We're using a structured analytical framework calibrated against 
                professional baselines, not a generic AI prompt.
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
                ratings from what the analysis actually says. The result: When
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
                At $20 per analysis (far less for Subscribers) and three minutes per 
                read, you can use First Pass Coverage throughout your 
                development process, not just at the end. Track how your script
                improves across drafts. Identify which revisions moved the needle
                and which didn&apos;t. One round of traditional human coverage costs
                $75&ndash;$300. At that rate, you can easily run your script through
                FPC over a dozen times.
              </p>
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground mb-2">
                Your script stays yours
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Your screenplay is processed in real time and is not stored,
                retained, or used to train any AI model. We use the Anthropic
                API as a processing layer &mdash; script tokens go in, coverage
                comes out, nothing is stored. Period.
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
          <p className="text-sm text-muted-foreground leading-relaxed text-left">
            First Pass Coverage was designed by development professionals with
            experience at studios, agencies, management companies, and production 
            companies &mdash; people who&apos;ve spent careers reading, evaluating, and
            developing screenplays across every genre and budget level. We built
            this tool because we&apos;ve seen both sides of the coverage problem.
            Writers spend too much for inconsistent feedback. Producers spend too
            much time reading material that isn&apos;t ready. First Pass
            Coverage gives everyone a fast, rigorous, affordable first read
            &mdash; so the time and money that follows is better spent.
          </p>
        
          <div className="mt-8 flex flex-col items-center gap-3">
  <Button asChild size="lg" variant="outline">
    <Link href="/samples">Browse Sample Coverages</Link>
  </Button>
  <p className="text-xs text-gray-400">
    See exactly what you'll get — real scripts, real analysis.
  </p>
</div>
        </div>
      </section>
    </>
  );
}
