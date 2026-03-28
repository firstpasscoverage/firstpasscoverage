export default function PrivacyPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-2xl font-normal mb-6">Privacy Policy</h1>
      <p className="text-xs text-gray-400 mb-8">Last updated: March 2026</p>

      <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">What We Collect</h2>
          <p>When you use First Pass Coverage, we process the screenplay PDF you upload in order to generate coverage. We do not store your uploaded screenplay after processing is complete. We do not read, review, or access your material for any purpose other than generating the requested coverage.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">How We Use Your Data</h2>
          <p>Uploaded screenplays are sent to a third-party AI provider (Anthropic via Vercel AI Gateway) for analysis. The screenplay text is transmitted securely, processed to generate coverage, and is not retained by us or the AI provider after the response is delivered. No uploaded material is used to train AI models.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">Analytics</h2>
          <p>We may use basic analytics (such as Vercel Analytics) to understand how the site is used &mdash; page views, load times, and similar aggregate metrics. This data does not include any content from uploaded screenplays.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">Third Parties</h2>
          <p>We do not sell, share, or distribute any user data or uploaded content to third parties. The only external service that processes your screenplay content is the AI analysis provider, as described above.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">Data Retention</h2>
          <p>Uploaded screenplay files are not retained after coverage generation is complete. Coverage output is generated in your browser session and is not stored on our servers in the current version of the service. If we introduce accounts and coverage history in the future, this policy will be updated accordingly.</p>
        </section>

        <section>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">Contact</h2>
          <p>Privacy questions: <a href="mailto:contact@firstpasscoverage.com" className="text-[#111] underline underline-offset-2 hover:opacity-70 transition-opacity">contact@firstpasscoverage.com</a></p>
        </section>
      </div>
    </div>
  );
}
