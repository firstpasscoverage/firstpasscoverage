"use client";

import { useState } from "react";

// Map each button to its Stripe price ID
const PRICES = {
  single: 'price_1TFiIs0Tj3dRfbGz5i8AfYNU',           // Single Coverage — $20
  threePack: 'price_1TFiS90Tj3dRfbGzUaFeXYXI',        // 3-Pack — $30
  writerMonthly: 'price_1TFiMo0Tj3dRfbGz1KWdec3U',    // Writer Monthly
  writerAnnual: 'price_1TFiMo0Tj3dRfbGzYCh0TWAo',     // Writer Annual
  producerMonthly: 'price_1TFiOT0Tj3dRfbGzBFhkenUs',  // Producer Monthly
  producerAnnual: 'price_1TFiP80Tj3dRfbGz7sUmyPSV',   // Producer Annual
  executiveMonthly: 'price_1TFiPk0Tj3dRfbGzBHbStVty', // Executive Monthly
  executiveAnnual: 'price_1TFiQE0Tj3dRfbGzMqjOD8eq',  // Executive Annual
};

async function handleCheckout(priceId: string) {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    alert(data.error || 'Something went wrong. Please try again.');
  }
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const checkout = async (key: keyof typeof PRICES) => {
    setLoading(key);
    try {
      await handleCheckout(PRICES[key]);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-brand text-2xl font-normal mb-2">Pricing</h1>
        <p className="text-gray-500 text-sm">
          Professional screenplay coverage for $20. Subscribe for more coverages
          at a lower per-read cost.
        </p>
      </div>

      {/* One-off callout */}
      <div className="bg-[#fffbf5] border border-[#f0e6d6] rounded-lg px-6 py-5 mb-10 max-w-[480px] mx-auto text-center">
        <div className="text-[15px] font-medium text-[#111] mb-1">
          Just need one coverage?
        </div>
        <p className="text-[12.5px] text-gray-500 mb-3">
          No subscription required. Same analysis, same quality, same
          three-minute turnaround.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => checkout('single')}
            disabled={loading !== null}
            className="inline-block px-5 py-2 bg-[#111] text-[#fafafa] text-[13px] font-medium rounded-md hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {loading === 'single' ? 'Redirecting...' : '1 Coverage — $20'}
          </button>
          <button
            onClick={() => checkout('threePack')}
            disabled={loading !== null}
            className="inline-block px-5 py-2 bg-white text-[#111] border border-black/[0.12] text-[13px] font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading === 'threePack' ? 'Redirecting...' : '3-Pack — $30'}
          </button>
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span
          className={`text-[13px] font-medium ${!annual ? "text-[#111]" : "text-gray-400"}`}
        >
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-11 h-[22px] rounded-full transition-colors ${
            annual ? "bg-[#111]" : "bg-gray-300"
          }`}
          aria-label="Toggle annual billing"
        >
          <span
            className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform ${
              annual ? "translate-x-[22px]" : "translate-x-[2px]"
            }`}
          />
        </button>
        <span
          className={`text-[13px] font-medium ${annual ? "text-[#111]" : "text-gray-400"}`}
        >
          Annual
        </span>
        {annual && (
          <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
            2 months free
          </span>
        )}
      </div>

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-5 mb-16">
        {/* Writer */}
        <div className="border border-black/[0.08] rounded-lg p-6">
          <div className="text-[13px] font-medium text-gray-400 mb-1">
            WRITER
          </div>
          <div className="font-brand text-lg font-normal text-[#111] mb-1">
            For screenwriters developing material
          </div>
          <div className="mb-5 mt-4">
            <span className="text-[28px] font-medium text-[#111]">
              ${annual ? "200" : "20"}
            </span>
            <span className="text-sm text-gray-400">
              /{annual ? "year" : "month"}
            </span>
            {annual && (
              <p className="text-[11px] text-gray-400 mt-1">
                $16.67/mo &middot; saves $40/year
              </p>
            )}
          </div>

          <button
            onClick={() => checkout(annual ? 'writerAnnual' : 'writerMonthly')}
            disabled={loading !== null}
            className="block w-full text-center px-4 py-2 bg-[#111] text-[#fafafa] text-[13px] font-medium rounded-md hover:bg-[#333] transition-colors mb-6 disabled:opacity-50"
          >
            {loading === 'writerMonthly' || loading === 'writerAnnual' ? 'Redirecting...' : 'Subscribe'}
          </button>

          <ul className="space-y-2.5 text-[12.5px] text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>
                <strong className="text-[#111]">4 coverages</strong> per month
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Full report with 10 rated categories</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Downloadable PDF for each coverage</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Coverage library &mdash; access past coverages anytime</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-black/[0.06]">
            <div className="text-[11px] text-gray-400 font-medium mb-1.5">
              NEED MORE?
            </div>
            <p className="text-[11px] text-gray-500">
              $10/individual &middot; 5-pack for $20
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Purchased coverages don&apos;t expire.
            </p>
          </div>
        </div>

        {/* Producer */}
        <div className="border-2 border-[#111] rounded-lg p-6 relative">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#111] text-[#fafafa] text-[10px] font-medium px-3 py-0.5 rounded-full tracking-wide">
            MOST POPULAR
          </div>
          <div className="text-[13px] font-medium text-gray-400 mb-1">
            PRODUCER
          </div>
          <div className="font-brand text-lg font-normal text-[#111] mb-1">
            For development teams and production companies
          </div>
          <div className="mb-5 mt-4">
            <span className="text-[28px] font-medium text-[#111]">
              ${annual ? "1,000" : "100"}
            </span>
            <span className="text-sm text-gray-400">
              /{annual ? "year" : "month"}
            </span>
            {annual && (
              <p className="text-[11px] text-gray-400 mt-1">
                $83.33/mo &middot; saves $200/year
              </p>
            )}
          </div>

          <button
            onClick={() => checkout(annual ? 'producerAnnual' : 'producerMonthly')}
            disabled={loading !== null}
            className="block w-full text-center px-4 py-2 bg-[#111] text-[#fafafa] text-[13px] font-medium rounded-md hover:bg-[#333] transition-colors mb-6 disabled:opacity-50"
          >
            {loading === 'producerMonthly' || loading === 'producerAnnual' ? 'Redirecting...' : 'Subscribe'}
          </button>

          <ul className="space-y-2.5 text-[12.5px] text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>
                <strong className="text-[#111]">25 coverages</strong> per month
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Everything in Writer</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Triage your entire submission pipeline</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-black/[0.06]">
            <div className="text-[11px] text-gray-400 font-medium mb-1.5">
              NEED MORE?
            </div>
            <p className="text-[11px] text-gray-500">
              $10/individual &middot; 5-pack for $20 &middot; 25-pack for $100
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Purchased coverages don&apos;t expire.
            </p>
          </div>
        </div>

        {/* Executive */}
        <div className="border border-black/[0.08] rounded-lg p-6">
          <div className="text-[13px] font-medium text-gray-400 mb-1">
            EXECUTIVE
          </div>
          <div className="font-brand text-lg font-normal text-[#111] mb-1">
            For agencies, studios, and high-volume operations
          </div>
          <div className="mb-5 mt-4">
            <span className="text-[28px] font-medium text-[#111]">
              ${annual ? "4,000" : "400"}
            </span>
            <span className="text-sm text-gray-400">
              /{annual ? "year" : "month"}
            </span>
            {annual && (
              <p className="text-[11px] text-gray-400 mt-1">
                $333.33/mo &middot; saves $800/year
              </p>
            )}
          </div>

          <button
            onClick={() => checkout(annual ? 'executiveAnnual' : 'executiveMonthly')}
            disabled={loading !== null}
            className="block w-full text-center px-4 py-2 bg-[#111] text-[#fafafa] text-[13px] font-medium rounded-md hover:bg-[#333] transition-colors mb-6 disabled:opacity-50"
          >
            {loading === 'executiveMonthly' || loading === 'executiveAnnual' ? 'Redirecting...' : 'Subscribe'}
          </button>

          <ul className="space-y-2.5 text-[12.5px] text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>
                <strong className="text-[#111]">150 coverages</strong> per month
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Everything in Producer</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Built for high-volume development operations</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-black/[0.06]">
            <div className="text-[11px] text-gray-400 font-medium mb-1.5">
              NEED MORE?
            </div>
            <p className="text-[11px] text-gray-500">
              $10/individual &middot; 5-pack for $20 &middot; 25-pack for $100
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Purchased coverages don&apos;t expire.
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="max-w-[640px] mx-auto space-y-10">
        <div>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">
            How it works
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Each plan includes a monthly allotment of coverages. Monthly credits
            refresh at the start of each billing cycle and do not roll over. If
            you need more than your plan includes in a given month, additional
            coverages are available at subscriber-only pricing &mdash;
            individually or in bundles. Purchased add-on coverages do not expire.
          </p>
        </div>

        <div>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">
            Satisfaction guarantee
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you subscribe, submit your first script, and aren&apos;t
            satisfied with the coverage, cancel your subscription and we&apos;ll
            refund your payment in full &mdash; no questions asked. This applies
            to your first coverage as a subscriber. After that, you can cancel
            anytime and won&apos;t be charged for the following month. We
            don&apos;t do long-term contracts.
          </p>
        </div>

        <div>
          <h2 className="text-[15px] font-medium text-[#111] mb-2">
            Annual billing
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Annual plans are billed upfront and include two free months (a 17%
            discount). If you cancel an annual plan mid-year, we&apos;ll
            calculate the monthly equivalent for the months you&apos;ve used and
            refund the difference.
          </p>
        </div>

        {/* Comparison table */}
        <div>
          <h2 className="text-[15px] font-medium text-[#111] mb-4">
            Compare to traditional coverage
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-black/[0.08]">
                  <th className="text-left py-2.5 pr-4 text-gray-400 font-medium w-[140px]" />
                  <th className="text-left py-2.5 px-4 font-medium text-[#111]">
                    First Pass Coverage
                  </th>
                  <th className="text-left py-2.5 pl-4 font-medium text-gray-400">
                    Human Coverage (typical)
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-black/[0.04]">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Price per read
                  </td>
                  <td className="py-2.5 px-4 text-[#111]">
                    $20 (or less with subscription)
                  </td>
                  <td className="py-2.5 pl-4">$75&ndash;$300</td>
                </tr>
                <tr className="border-b border-black/[0.04]">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Turnaround
                  </td>
                  <td className="py-2.5 px-4 text-[#111]">~3 minutes</td>
                  <td className="py-2.5 pl-4">3&ndash;14 days</td>
                </tr>
                <tr className="border-b border-black/[0.04]">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Rated categories
                  </td>
                  <td className="py-2.5 px-4 text-[#111]">
                    10, with page citations
                  </td>
                  <td className="py-2.5 pl-4">Varies (often unstructured)</td>
                </tr>
                <tr className="border-b border-black/[0.04]">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Consistency
                  </td>
                  <td className="py-2.5 px-4 text-[#111]">
                    Same methodology every time
                  </td>
                  <td className="py-2.5 pl-4">Varies by reader</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Iterative use
                  </td>
                  <td className="py-2.5 px-4 text-[#111]">Designed for it</td>
                  <td className="py-2.5 pl-4">Cost-prohibitive</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}