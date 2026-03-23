const FAQS: { q: string; a: string }[] = [
  {
    q: "What is First Pass Coverage?",
    a: "First Pass Coverage generates professional screenplay coverage — the same format used across the industry by studios, agencies, and production companies. You upload a screenplay PDF, and within a few minutes you receive a logline, synopsis, scored evaluations across ten categories, detailed commentary with page citations, and an overall recommendation.",
  },
  {
    q: "How does it work?",
    a: "Upload your screenplay as a PDF. Our system extracts the text, analyzes the material across ten categories (premise, structure, character, conflict, dialogue, pacing, tone, originality, logic, and craft), and streams the coverage back to you in real time. The entire process takes roughly 90 seconds to three minutes depending on script length. When it\u2019s done, you can read it on screen, copy it, or download a professionally formatted PDF.",
  },
  {
    q: "What does the coverage include?",
    a: "Every coverage includes: a logline distilling the core premise, a comprehensive synopsis tracking all major plot movements, individual scored evaluations for ten categories (each with detailed commentary and page citations), production-relevant metadata (genre, budget tier, MPA rating, comparable films, locations, lead description), and an overall recommendation from Strong Pass to Strong Recommend.",
  },
  {
    q: "Is this AI-generated?",
    a: "Yes. First Pass Coverage uses a frontier AI model guided by an evaluation framework designed by experienced development executives. The framework reflects how professional readers actually assess material \u2014 it\u2019s not a generic checklist. We chose \u201cFirst Pass\u201d as the name deliberately: this is the step before your human readers, not a replacement for them. It gives you a rigorous, detailed first read so the humans in your process can focus their time where it matters most.",
  },
  {
    q: "How accurate is the analysis?",
    a: "The evaluation framework was calibrated against professional script assessments across multiple screenplays and score ranges. Scores are consistent and substantive \u2014 the commentary cites specific pages, identifies structural patterns, and makes actionable observations. Like any single reader, it represents one informed perspective. We recommend treating it the way you\u2019d treat coverage from a sharp reader you trust but don\u2019t always agree with.",
  },
  {
    q: "Who sees my screenplay?",
    a: "Nobody. Your screenplay is processed in real time and is not stored after the coverage is generated. We do not retain copies of uploaded scripts, and no human reads your material as part of the coverage process.",
  },
  {
    q: "What format does my script need to be in?",
    a: "Standard screenplay PDF, 4MB maximum. The system works best with properly formatted screenplays (Final Draft, WriterSolo, Highland, or similar software output). Scanned documents or image-based PDFs may not extract cleanly.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing details are coming soon. We\u2019re finalizing the model and will update this page when coverage is available for purchase.",
  },
  {
    q: "Can I use this coverage in a submission package?",
    a: "The PDF export is designed for exactly that. It\u2019s formatted as a professional coverage document with clear branding, structured sections, and a ratings grid \u2014 suitable for attaching to packaging materials, sharing with producers, or including in development files.",
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-2xl font-normal mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-gray-500 text-sm mb-10">
        How it works, what you get, and what to expect.
      </p>

      <div className="space-y-8">
        {FAQS.map((faq, i) => (
          <div key={i}>
            <h3 className="text-[15px] font-medium text-[#111] mb-2">
              {faq.q}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
