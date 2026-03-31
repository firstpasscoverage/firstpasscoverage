export default function AboutPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-6">
        About First Pass Coverage
      </h1>

      <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
        <p>
          First Pass Coverage was built by entertainment industry professionals
          who&apos;ve spent their careers inside the screenplay evaluation
          process &mdash; at talent agencies, in literary management, and in
          development. We&apos;ve read thousands of scripts. We&apos;ve built
          evaluation systems. We&apos;ve seen what good coverage looks like and
          how rarely writers actually get it.
        </p>

        <p>
          The evaluation framework behind FPC isn&apos;t a generic AI prompt.
          It&apos;s a structured analytical methodology with ten diagnostic
          categories, each defined by specific questions a professional reader
          would ask. The rating rubric was calibrated against professional script
          assessments across multiple screenplays and rating ranges. And the
          system uses a two-pass architecture &mdash; one pass for analysis, a
          separate pass for rating &mdash; designed to prevent the inflation that
          plagues most AI evaluation tools.
        </p>

        <p>
          We built First Pass Coverage because the current landscape doesn&apos;t
          serve most writers. Professional human coverage costs $75 to $300 per
          read and takes days to weeks. AI coverage tools either lack a rigorous
          methodology or default to flattering feedback that doesn&apos;t help
          anyone improve. And the most popular affordable coverage services shut
          down in the past year, leaving a gap that hasn&apos;t been filled.
        </p>

        <p>
          The name tells you our philosophy: this is a first pass. A rigorous,
          calibrated starting point &mdash; not the final word on any screenplay.
          Use it to understand how your material reads before you invest in
          submissions, competitions, or further development. Use it to track your
          progress across drafts. Use it to triage a reading pile. We built the
          tool we wished existed when we were on the other side of the desk.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="font-brand text-2x1 font-normal tracking-[-0.3px] mb-3">
          Get in touch
        </h2>
        <p className="text-sm text-gray-600">
          Questions, feedback, or partnership inquiries:{" "}
          <a
            href="mailto:contact@firstpasscoverage.com"
            className="text-[#111] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            contact@firstpasscoverage.com
          </a>
        </p>
      </div>
    </div>
  );
}
