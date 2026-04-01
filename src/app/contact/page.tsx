export default function ContactPage() {
  return (
    <div className="max-w-[640px] mx-auto px-6 py-12">
      <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-6">Contact</h1>

      <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
        <p>For questions, feedback, support, or partnership inquiries:</p>

        <p>
          <a
            href="mailto:contact@firstpasscoverage.com"
            className="text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            contact@firstpasscoverage.com
          </a>
        </p>

        <p className="text-gray-400 text-xs pt-4">
          First Pass Coverage is based in Los Angeles, California.
        </p>
      </div>
    </div>
  );
}
