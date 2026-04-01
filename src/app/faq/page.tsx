import Link from "next/link";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is First Pass Coverage?",
    a: "First Pass Coverage generates professional screenplay coverage \u2014 the same format used across the industry by studios, agencies, and production companies. You upload a screenplay PDF, and within a few minutes you receive a logline, synopsis, rated evaluations across ten categories, detailed commentary with page citations, and an overall recommendation.",
  },
  {
    q: "How does it work?",
    a: "Upload your screenplay as a PDF. Our system extracts the text, analyzes the material across ten categories (premise, structure, character, conflict, dialogue, pacing, tone, originality, logic, and craft), and streams the coverage back to you in real time. The entire process takes roughly 90 seconds to three minutes depending on script length. When it\u2019s done, you can read it on screen, copy it, or download a professionally formatted PDF.",
  },
  {
    q: "What does the coverage include?",
    a: "Every coverage includes: a logline distilling the core premise, a comprehensive synopsis tracking all major plot movements, individual rated evaluations for ten categories (each with detailed commentary and page citations), production-relevant metadata (genre, budget tier, MPA rating, comparable films, locations, lead description), and an overall recommendation from Strong Pass to Strong Recommend.",
  },
  {
    q: "Is this AI-generated?",
    a: "Yes. First Pass Coverage uses a frontier AI model guided by an evaluation framework designed by experienced development executives. The framework reflects how professional readers actually assess material \u2014 it\u2019s not a generic checklist. We chose \u201cFirst Pass\u201d as the name deliberately: this is the step before your human readers, not a replacement for them. It gives you a rigorous, detailed first read so the humans in your process can focus their time where it matters most.",
  },
  {
    q: "How accurate is the analysis?",
    a: "The evaluation framework was calibrated against professional script assessments across multiple screenplays and rating ranges. Ratings are consistent and substantive \u2014 the commentary cites specific pages, identifies structural patterns, and makes actionable observations. Like any single reader, it represents one informed perspective. We recommend treating it the way you\u2019d treat coverage from a sharp reader you trust but don\u2019t always agree with.",
  },
  {
    q: "Can I use FPC on multiple drafts of the same script?",
    a: "That\u2019s what it\u2019s built for. At $20 per coverage and three minutes per read, you can run your script after every major revision and track how the ratings and commentary change. This is the core advantage over traditional coverage \u2014 instead of one expensive read at the end, you get an iterative feedback loop throughout development.",
  },
  {
    q: "How does this compare to human coverage?",
    a: "Different tools for different stages. Human coverage gives you a subjective, experienced perspective \u2014 a reader who can intuit things about tone, voice, and audience that no AI can fully replicate. First Pass Coverage gives you a fast, consistent, calibrated diagnostic that identifies structural and craft-level patterns with specific evidence. Most writers benefit from both: FPC during development (when you need frequent feedback at low cost) and human coverage when the script is close to finished (when you need that final subjective perspective). We\u2019re the first pass. The name isn\u2019t accidental.",
  },
  {
    q: "Should I get FPC coverage before submitting to the Black List?",
    a: "We\u2019d recommend it. A Black List hosting plus evaluation costs $130. FPC coverage costs $20. Getting FPC coverage first tells you whether your script is in the range where a Black List investment makes sense, or whether another revision would be a better use of that $130. A writer who gets a Consider from FPC might decide they\u2019re ready to submit. A writer who gets a Pass can target the specific weaknesses FPC identified, revise, and submit a stronger script.",
  },
  {
    q: "How is this different from pasting my script into ChatGPT?",
    a: "In every way that matters. ChatGPT doesn\u2019t have a calibrated rating methodology, doesn\u2019t cite specific pages, doesn\u2019t use diagnostic evaluation categories, and \u2014 critically \u2014 defaults to accommodating feedback because it\u2019s designed to be helpful, not honest. FPC uses a structured analytical framework with defined rubrics, enforced page citations, and a two-pass rating system specifically designed to prevent inflation. The difference is the difference between asking a friend \u201cis this good?\u201d and getting a professional evaluation.",
  },
  {
    q: "Who sees my screenplay?",
    a: "Nobody. Your screenplay is processed in real time and is not stored after the coverage is generated. We do not retain copies of uploaded scripts, and no human reads your material as part of the coverage process.",
  },
  {
    q: "Do you use my script to train AI models?",
    a: "No. Your screenplay is processed through the Anthropic API (Claude) in real time. It is not stored, retained, or used for any training purpose. We don\u2019t save copies of uploaded scripts. The API provider\u2019s terms prohibit training on API inputs. Your intellectual property remains yours \u2014 we\u2019re a processing layer, not a data collection operation.",
  },
  {
    q: "What format does my script need to be in?",
    a: "Standard screenplay PDF, 4MB maximum. The system works best with properly formatted screenplays (Final Draft, WriterSolo, Highland, or similar software output). Scanned documents or image-based PDFs may not extract cleanly.",
  },
  {
    q: "Can I use this coverage in a submission package?",
    a: "The PDF export is designed for exactly that. It\u2019s formatted as a professional coverage document with clear branding, structured sections, and a ratings grid \u2014 suitable for attaching to packaging materials, sharing with producers, or including in development files.",
  },
  {
    q: "I\u2019m a producer or executive. Can I use this for my reading pile?",
    a: "Absolutely. FPC processes a screenplay in about three minutes for $20. If you receive 20 submissions a month, you can triage your entire pipeline in an afternoon. The Producer plan ($100/month for 25 coverages) was built for exactly this use case. The coverage includes all the metadata you need for a quick assessment \u2014 genre, budget tier, comps, page count, locations, lead description \u2014 plus rated analysis across ten categories.",
  },
];

// The pricing FAQ needs a Link component, so we handle it separately
const PRICING_FAQ = {
  q: "How much does it cost?",
};

export default function FAQPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-gray-500 text-sm mb-10">
        How it works, what you get, and what to expect.
      </p>

      <div className="space-y-8">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <h3 className="text-[15px] font-medium text-foreground mb-2">
              {faq.q}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}

        {/* Pricing FAQ with Link — handled outside the array */}
        <div>
          <h3 className="text-[15px] font-medium text-foreground mb-2">
            {PRICING_FAQ.q}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Individual coverages are $20 each &mdash; no subscription required.
            For writers who use FPC regularly, subscriptions start at $20/month
            for 4 coverages, with additional coverages available at reduced
            pricing. See our{" "}
            <Link
              href="/pricing"
              className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              pricing page
            </Link>{" "}
            for full details on all plans.
          </p>
        </div>
      </div>
    </div>
  );
}
