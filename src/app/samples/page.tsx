import Link from "next/link";

const SAMPLES: {
  title: string;
  writer: string;
  overall: string;
  overallScore: number;
  slug: string;
}[] = [];

const OVERALL_COLORS: Record<number, string> = {
  1: "bg-red-50 text-red-700",
  2: "bg-orange-50 text-orange-700",
  3: "bg-yellow-50 text-yellow-700",
  4: "bg-green-50 text-green-700",
  5: "bg-emerald-50 text-emerald-700",
};

export default function SamplesPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-brand text-2xl font-normal mb-2">
        Sample Coverages
      </h1>
      <p className="text-gray-500 text-sm mb-10">
        See what First Pass Coverage produces. Every sample below was generated
        from a publicly available screenplay — the same process, the same
        rigor, the same output you&apos;ll get with your own material.
      </p>

      {SAMPLES.length > 0 ? (
        <div className="grid gap-4">
          {SAMPLES.map((s) => (
            <Link
              key={s.slug}
              href={`/samples/${s.slug}`}
              className="flex items-center justify-between p-5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
            >
              <div>
                <div className="text-[15px] font-medium text-[#111] group-hover:underline underline-offset-2">
                  {s.title}
                </div>
                <div className="text-[13px] text-gray-500 mt-0.5">
                  {s.writer}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  OVERALL_COLORS[s.overallScore] || "bg-gray-50 text-gray-700"
                }`}
              >
                {s.overall}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-400 text-sm">
            Sample coverages coming soon.
          </p>
          <p className="text-gray-400 text-xs mt-1">
            We&apos;re preparing coverages of award-nominated screenplays to
            showcase.
          </p>
        </div>
      )}
    </div>
  );
}
