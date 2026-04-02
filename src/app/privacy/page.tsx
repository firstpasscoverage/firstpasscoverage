export default function PrivacyPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-6">Privacy Policy</h1>
      <p className="text-xs text-gray-400 mb-8">Last updated: April 2026</p>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-[15px] font-medium text-foreground mb-2">What We Collect</h2>
          <p>When you use First Pass Coverage ("FPC"), we process the screenplay PDF you upload in order to generate coverage. Neither FPC nor its third-party AI provider(s) store your uploaded screenplay after processing is complete. Humans cannot read, review, or access your material at all via FPC for any purpose whatsoever.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-foreground mb-2">How We Use Your Data</h2>
          <p>Information extracted from uploaded screenplays is sent to a third-party AI provider (as of this writing: Anthropic, via Vercel AI Gateway) for analysis. The screenplay text is transmitted securely, processed to generate coverage, and is not retained by us or the AI provider after the response is delivered. No uploaded material is used to train AI models, neither by FPC nor by the AI provider.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-foreground mb-2">Analytics</h2>
          <p>We use basic website analytics (such as Vercel Analytics and PostHog) to understand how the site is used &mdash; page views, load times, and similar aggregate metrics to make sure you're having an acceptable experience. This data does not include any content from uploaded screenplays.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-foreground mb-2">Third Parties</h2>
          <p>We do not sell, share, or distribute any user data or uploaded content to third parties. The only external service that processes your screenplay content is the AI analysis provider, as described above.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-foreground mb-2">Data Retention</h2>
          <p>Uploaded screenplay PDFs are not retained after coverage generation is complete. Generated coverage (including ratings, commentary, and metadata) is stored in your account so you can access it from your coverage library. You can request deletion of your stored coverage at any time by contacting us.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-foreground mb-2">Contact</h2>
          <p>Privacy questions: <a href="mailto:contact@firstpasscoverage.com" className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity">contact@firstpasscoverage.com</a></p>
        </section>
      </div>
    </div>
  );
}
