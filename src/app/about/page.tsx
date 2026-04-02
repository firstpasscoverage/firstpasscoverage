export default function AboutPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-6">
        About First Pass Coverage
      </h1>

      <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
        <p>
          First Pass Coverage was built by entertainment industry professionals
          who&apos;ve spent their careers evaluating screenplays at studios, agencies, 
          management companies, and production companies. We&apos;ve read tens of thousands of 
          scripts. We've written countless coverages. We know what good feedback looks
          like and how rarely writers actually receive it (especially aspiring screenwriters).
        </p>

        <p>
          The evaluation framework we built into FPC isn&apos;t a generic AI prompt. 
          It&apos;s a structured, best practices-based, analytical methodology,
          defined by the specific questions professional readers are trained to ask.
          Our ratings have been calibrated against professional script assessments across 
          multiple screenplays and rating ranges. And the system uses a two-pass architecture &mdash; 
          one pass for analysis, a separate pass for rating &mdash; designed to prevent the "pick me" 
          inflation that plagues most AI evaluation tools.
        </p>

        <p>
          We're not saints, but we built First Pass Coverage because the current landscape 
          doesn&apos;t serve most writers. Professional human coverage costs $75 to $300 per
          read (deservedly so! they're bringing hours of time and hard-won experience to the table) 
          and takes days to weeks to deliver. Generic AI coverage tools either lack a tested, 
          rigorous methodology or default to flattering feedback that doesn&apos;t help
          anyone improve. Not to mention the fact most popular affordable coverage services 
          just evaporated, leaving a gap that hasn&apos;t been filled.
        </p>

        <p>
          Our name spells out our philosophy: This is a first pass read of your script. 
          A rigorous, structured, and calibrated starting point &mdash; not the final 
          word on any given draft. Use us to understand how your material plays before 
          you invest in representative submissions, competitions, or further development. 
          Use it to track progress across drafts. Use it to triage your slush pile. We built the
          tool we wished existed when we were on the other side of the desk. (In both directions.)
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-border">
        <h2 className="font-brand text-2xl font-normal tracking-[-0.3px] mb-3">
          Get in touch
        </h2>
        <p className="text-sm text-gray-600">
          Questions, feedback, or partnership inquiries:{" "}
          <a
            href="mailto:contact@firstpasscoverage.com"
            className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            contact@firstpasscoverage.com
          </a>
        </p>
      </div>
    </div>
  );
}
