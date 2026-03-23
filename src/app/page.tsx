import Link from "next/link";

const FEATURES = [
  {
    title: "Logline",
    desc: "A distilled premise statement that captures the core dramatic engine.",
  },
  {
    title: "Synopsis",
    desc: "A comprehensive narrative summary that tracks every major plot movement.",
  },
  {
    title: "10 scored categories",
    desc: "Premise, structure, character, conflict, dialogue, pacing, tone, originality, logic, and craft.",
  },
  {
    title: "Overall recommendation",
    desc: "A clear verdict from Strong Pass to Strong Recommend, with substantive reasoning.",
  },
  {
    title: "Detailed commentary",
    desc: "Page-specific analysis with citations — not vague praise, but useful notes you can act on.",
  },
  {
    title: "Downloadable PDF",
    desc: "Professional coverage document you can share, print, or attach to a submission package.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="pt-20 pb-16 text-center">
        <div className="max-w-[600px] mx-auto px-6">
          <h1 className="font-brand text-[32px] font-normal text-[#111] leading-[1.3] tracking-[-0.5px] mb-4">
            Professional screenplay coverage
            <br />
            in less than three minutes.
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
            Upload your script. Get detailed analysis — premise, structure,
            character, dialogue, and seven more categories — and a clear
            assessment. Built for writers, producers, and development
            executives who need a quick yet rigorous first take.
          </p>

          <div className="py-4 px-6 bg-[#fffbf5] border border-[#f0e6d6] rounded-lg mb-6">
              <p className="text-[13px] text-[#78644e] italic text-center">
                Coverage of your first pass, or a first pass of coverage.
              </p>
            </div>

          <Link
            href="/coverage"
            className="inline-block px-7 py-2.5 bg-[#111] text-[#fafafa] text-sm font-medium rounded-md hover:bg-[#333] transition-colors"
          >
            Upload Screenplay
          </Link>
          <p className="text-xs text-gray-400 mt-3.5">
            PDF format only · 4MB max · Coverage in about 3 minutes
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="w-10 h-px bg-gray-300 mx-auto" />

      {/* What You Get */}
      <section className="py-16">
        <div className="max-w-[640px] mx-auto px-6">
          <h2 className="font-brand text-xl font-normal text-[#111] text-center tracking-[-0.3px] mb-10">
            What you get
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="text-[13px] font-medium text-[#111] mb-1">
                  {f.title}
                </div>
                <div className="text-[12.5px] text-gray-500 leading-relaxed">
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Preview */}
      <section className="py-8">
        <div className="max-w-[640px] mx-auto px-6">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white h-[360px]">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-300 italic">
                Sample coverage preview
              </p>
            </div>
          </div>
          <div className="text-center mt-4">
            <Link
              href="/samples"
              className="text-[13px] text-gray-500 hover:text-[#111] transition-colors underline underline-offset-2"
            >
              See full sample coverages
            </Link>
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="py-12 pb-20">
        <div className="max-w-[640px] mx-auto px-6 text-center">
          <h2 className="font-brand text-xl font-normal text-[#111] tracking-[-0.3px] mb-3">
            Built by people who read scripts for a living.
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            First Pass Coverage was built by development executives and
            producers who&apos;ve covered thousands of screenplays. The evaluation
            framework reflects how professionals actually assess material, based on
            experience that comes from years in the room.
          </p>
        </div>
      </section>
    </>
  );
}
