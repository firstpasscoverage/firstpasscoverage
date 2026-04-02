import Link from "next/link";

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "What is First Pass Coverage?",
    a: "First Pass Coverage is an AI-generated professional screenplay coverage service, delivering detailed script analysis in the same format that's been relied upon for over 75 years by studios, agencies, management companies, and production companies industry-wide. It's 2026, AI exists, you should be able to upload a screenplay and within minutes receive a logline, synopsis, evaluations across ten categories, detailed analysis (with page citations), and a decisive overall recommendation. First Pass is the platonic ideal of coverage - no prejudices, no jaded reader syndrome, no agendas, just clear-eyed analysis.",
  },
  {
    q: "Wait. AI-generated?? Seriously?",
    a: "Yes. First Pass uses a frontier AI model (as of April 2026: Anthropic's Opus 4.6) coupled with a purpose-built evaluation framework designed by experienced development executives. The framework reflects how professional readers actually assess material \u2014 it\u2019s not a generic checklist scraped from the internet. We chose \u201cFirst Pass\u201d as the name deliberately: Think of this as the step before you submit to human readers, not a replacement for them. You're getting a rigorous, detailed first read so the humans in your process can focus their time where it matters most.",
  },
  {
    q: "Fine, how does it work?",
    a: "Upload the PDF of your screenplay. Our system extracts the text (we don't save your PDF), analyzes the material across the usual categories (premise, structure, character, conflict, dialogue, pacing, tone, originality, logic, and craft), and then streams your coverage back to you in real time. The entire process takes less than three minutes (depending on script length). When it\u2019s done, it's rendered in the window in the browser and you can download a professionally formatted PDF. If you've got an FPC subscription, it'll always be available in your Library for download and sharing.",
  },
  {
    q: "What does the coverage include?",
    a: "Every coverage includes: A logline distilling the core premise, a comprehensive synopsis tracking all major plot movements, individual rated evaluations for ten categories (each with detailed commentary and page citations), production-relevant metadata (genre, budget tier, MPA rating, comparable films, locations, lead description), and an overall recommendation from Strong Pass to Strong Recommend.",
  },
  {
    q: "How accurate is the analysis?",
    a: "The evaluation framework was calibrated against professional script assessments across hundreds of screenplays and rating ranges. Ratings are consistent and substantive \u2014 the commentary cites specific pages, identifies structural patterns, and makes actionable observations. Like any single reader, it represents one informed perspective. We recommend treating it the way you\u2019d treat coverage from a sharp reader you trust but don\u2019t always agree with.",
  },
  {
    q: "Can I use FPC on multiple drafts of the same script?",
    a: "That\u2019s what it\u2019s built for. Even at $20 per coverage and three minutes per read, you can run your script after every major revision and track how the ratings and commentary change. (The subscription tiers are designed to drop the per draft cost - you can literally get a take on your latest draft for the cost of a latte.) This is the core advantage over traditional coverage \u2014 instead of one expensive read at the end, you get an iterative feedback loop throughout development.",
  },
  {
    q: "How does First Pass compare to human coverage?",
    a: "Different tools for different stages. Human coverage gives you a subjective, experienced perspective \u2014 a reader who can intuit things about tone, voice, and audience that no AI can fully replicate. First Pass Coverage gives you a fast, consistent, calibrated diagnostic that identifies structural and craft-level patterns with specific evidence. Most writers benefit from both: FPC during development (when you need frequent feedback at low cost) and human coverage when the script is close to finished (when you need that final subjective perspective). We\u2019re the first pass. The name isn\u2019t accidental.",
  },
  {
    q: "Should I get FPC coverage before submitting to the Black List?",
    a: "Totally, that's literally part of what we were thinking when we developed FPC. The Black List hosting plus evaluations has a reasonable but relatively high cost. For $20, FPC can give you a sense of whether your script is in the range where a Black List investment makes sense, or whether you'd be better served by another revision first. A writer who gets a Consider from FPC might decide they\u2019re ready to submit to The Black List, whereas someone who gets a Pass should probably target the specific weaknesses FPC identifies, revise, and then roll forward with the stronger draft.",
  },
  {
    q: "How is this different from pasting my script into ChatGPT?",
    a: "In every way that matters. ChatGPT doesn\u2019t have a calibrated rating methodology, doesn\u2019t cite specific pages, doesn\u2019t use diagnostic evaluation categories, and \u2014 critically \u2014 defaults to accommodating feedback because it\u2019s designed to be helpful, not honest. FPC uses a structured analytical framework with defined rubrics, enforced page citations, and a two-pass rating system specifically designed to prevent feedback inflation. The difference is the difference between asking a friend \u201cis this good?\u201d and getting a professional read.",
  },
  {
    q: "Who sees my screenplay?",
    a: "Nobody. Your screenplay is processed in real time and is not stored after the coverage is generated. We do not retain copies of uploaded scripts, and no human reads your material as part of the coverage process.",
  },
  {
    q: "Do you use my script to train AI models?",
    a: "No. Your screenplay is processed through the Anthropic API (as of this writing: Opus 4.6) in real time. It is not stored, retained, or used for any training purpose. We don\u2019t save copies of uploaded scripts. Anthropic\u2019s terms prohibit training on API inputs. Your intellectual property remains yours \u2014 we\u2019re a processing layer, not a data collection operation.",
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
    a: "Of course! Our Producer and Executive subscription tiers are designed explicitly so you can triage your entire slush pile in an afternoon and then adjust your monthly load as necessary.",
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
