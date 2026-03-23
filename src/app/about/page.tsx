export default function AboutPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-2xl font-normal mb-6">About</h1>

      <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
        <p>
          First Pass Coverage was built by entertainment industry professionals
          with decades of combined experience in development, production, and
          film finance. We&apos;ve read thousands of screenplays across every
          genre and budget level &mdash; as studio executives, as producers, as
          investors evaluating material for funding, and as analysts building the
          data infrastructure behind how scripts get assessed.
        </p>

        <p>
          The evaluation framework behind First Pass Coverage isn&apos;t a
          generic rubric. It reflects how experienced readers actually think
          about material: Does the premise generate inherent tension? Does the
          structure earn its length? Are the characters making active decisions?
          Is the dialogue doing work beyond conveying information? Every category
          was chosen because it&apos;s something a sharp development executive
          would evaluate &mdash; and the scoring methodology was calibrated against
          professional assessments to ensure consistency and rigor.
        </p>

        <p>
          We built this tool because we know how much time the coverage process
          takes and how unevenly it&apos;s distributed. A script at a major
          studio gets multiple reads from trained professionals. A script from an
          independent writer might get one read from an overworked intern &mdash; or
          none at all. First Pass Coverage gives every screenplay access to
          detailed, substantive analysis regardless of where it came from or who
          submitted it.
        </p>

        <p>
          The name says it all: this is a first pass. A rigorous, informed
          starting point that helps writers understand how their material reads,
          helps producers triage their pipeline, and helps executives focus their
          attention where it matters. It&apos;s not the last word on any
          screenplay &mdash; it&apos;s the first good read.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="font-brand text-lg font-normal text-[#111] mb-3">
          Get in touch
        </h2>
        <p className="text-sm text-gray-600">
          Questions, feedback, or partnership inquiries:{" "}
          <a
            href="mailto:j@emergentmediapartners.com"
            className="text-[#111] underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            admin@firstpasscoverage.com
          </a>
        </p>
      </div>
    </div>
  );
}
