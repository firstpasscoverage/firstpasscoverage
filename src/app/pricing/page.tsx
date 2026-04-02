"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import WarmCallout from "@/components/WarmCallout";

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
  writerAddon: 'price_1TG6d00Tj3dRfbGzFnxU1qla',      // Writer 6-Pack — $30
  producerAddon: 'price_1TG6dO0Tj3dRfbGzh4QuxshK',    // Producer 8-Pack — $30
  executiveAddon: 'price_1TG6do0Tj3dRfbGzlX7TOjPw',   // Executive 10-Pack — $30
};

const ADDON_INFO: Record<string, { key: keyof typeof PRICES; credits: number; perCredit: string }> = {
  writer:    { key: 'writerAddon',    credits: 6,  perCredit: '$5' },
  producer:  { key: 'producerAddon',  credits: 8,  perCredit: '$3.75' },
  executive: { key: 'executiveAddon', credits: 10, perCredit: '$3' },
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
  const [userTier, setUserTier] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/user/credits')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.subscriptionTier) {
          setUserTier(data.subscriptionTier);
        }
      })
      .catch(() => {
        // Not logged in or error — show non-subscriber view
      });
  }, []);

  const isSubscriber = userTier !== null;

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
        <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-2">Pricing</h1>
        <p className="text-gray-500 text-sm">
          Full-on professional screenplay coverage for $20. Need more than one? Monthly subscriptions drop your per draft charge by a mile.
        </p>
      </div>

      {/* One-off callout */}
      <WarmCallout className="px-6 py-5 mb-10 max-w-[480px] mx-auto text-center">
        <div className="text-[15px] font-medium text-foreground mb-1">
          Just need a one-off?
        </div>
        <p className="text-[12.5px] text-gray-500 mb-3">
          <p>No subscription required. Three-minute turnaround.</p>
          <p>(Definitely download the PDF when it pops up.
          Your Coverage Library is tied to your subscription. But you know... No pressure.)</p>
        </p>
        <div className="flex gap-3 justify-center">
        <Button size="lg" onClick={() => checkout('single')} disabled={loading !== null}>
            {loading === 'single' ? 'Redirecting...' : '1 Coverage — $20'}
          </Button>
          {!isSubscriber && (
            <Button variant="outline" size="lg" onClick={() => checkout('threePack')} disabled={loading !== null}>
            {loading === 'threePack' ? 'Redirecting...' : '3-Pack — $30'}
          </Button>
          )}
        </div>
      </WarmCallout>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span
          className={`text-[13px] font-medium ${!annual ? "text-foreground" : "text-gray-400"}`}
        >
          Monthly
        </span>
        <Switch checked={annual} onCheckedChange={setAnnual} />
        <span
          className={`text-[13px] font-medium whitespace-nowrap ${annual ? "text-foreground" : "text-gray-400"}`}
        >
          Annual
        </span>
        {annual && (
          <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium ml-1">
            Annual = 2 months free, you savage you
          </span>
        )}
      </div>

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-5 mb-16">
        {/* Writer */}
        <div className="border border-border rounded-lg p-6">
          <div className="text-[13px] font-medium text-gray-400 mb-1">
            WRITER TIER
          </div>
          <div className="font-brand text-lg font-normal text-foreground mb-1">
            Priced so you can hone drafts on the regular
          </div>
          <div className="mb-5 mt-4">
            <span className="text-[28px] font-medium text-foreground">
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

          <Button size="lg" className="w-full mb-6" onClick={() => checkout(annual ? 'writerAnnual' : 'writerMonthly')} disabled={loading !== null}>
            {loading === 'writerMonthly' || loading === 'writerAnnual'
              ? 'Redirecting...'
              : userTier === 'writer' ? 'Current Plan' : 'Subscribe'}
          </Button>

          <ul className="space-y-2.5 text-[12.5px] text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>
                <strong className="text-foreground">4 coverages</strong> per month
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Full-blown, fresh eyes coverage every time</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Downloadable, shareable PDF for every draft</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Always-on library &mdash; access past coverages on a whim</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="text-[11px] text-gray-400 font-medium mb-1.5">
              NEED MORE?
            </div>
            {userTier === 'writer' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => checkout('writerAddon')} disabled={loading !== null}>
                  {loading === 'writerAddon' ? 'Redirecting...' : '6-Pack — $30 ($5/coverage)'}
                </Button>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Purchased credits never expire.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-gray-500">
                  6-pack for $30 ($5/coverage)
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Purchased credits never expire.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Producer */}
        <div className="border-2 border-primary rounded-lg p-6 relative">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-medium px-3 py-0.5 rounded-full tracking-wide">
            MOST POPULAR
          </div>
          <div className="text-[13px] font-medium text-gray-400 mb-1">
            PRODUCER TIER
          </div>
          <div className="font-brand text-lg font-normal text-foreground mb-1">
            Priced for dynastic development teams
          </div>
          <div className="mb-5 mt-4">
            <span className="text-[28px] font-medium text-foreground">
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

          <Button size="lg" className="w-full mb-6" onClick={() => checkout(annual ? 'producerAnnual' : 'producerMonthly')} disabled={loading !== null}>
            {loading === 'producerMonthly' || loading === 'producerAnnual'
              ? 'Redirecting...'
              : userTier === 'producer' ? 'Current Plan' : 'Subscribe'}
          </Button>

          <ul className="space-y-2.5 text-[12.5px] text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>
                <strong className="text-foreground">25 coverages</strong> per month
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Everything in Writer Tier (but you knew that already, obvi)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Triage your entire submission pipeline</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="text-[11px] text-gray-400 font-medium mb-1.5">
              NEED MORE? (EVERYONE RUNS OUT HERE AND THERE)
            </div>
            {userTier === 'producer' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => checkout('producerAddon')} disabled={loading !== null}>
                  {loading === 'producerAddon' ? 'Redirecting...' : '8-Pack — $30 ($3.75/coverage)'}
                </Button>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Purchased credits never expire.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-gray-500">
                  8-pack for $30 ($3.75/coverage)
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Purchased credits never expire.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Executive */}
        <div className="border border-border rounded-lg p-6">
          <div className="text-[13px] font-medium text-gray-400 mb-1">
            EXECUTIVE TIER
          </div>
          <div className="font-brand text-lg font-normal text-foreground mb-1">
            Priced for dynamos who receive 100s of submissions per month
          </div>
          <div className="mb-5 mt-4">
            <span className="text-[28px] font-medium text-foreground">
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

          <Button size="lg" className="w-full mb-6" onClick={() => checkout(annual ? 'executiveAnnual' : 'executiveMonthly')} disabled={loading !== null}>
            {loading === 'executiveMonthly' || loading === 'executiveAnnual'
              ? 'Redirecting...'
              : userTier === 'executive' ? 'Current Plan' : 'Subscribe'}
          </Button>

          <ul className="space-y-2.5 text-[12.5px] text-gray-600">
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>
                <strong className="text-foreground">150 coverages</strong> per month
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Everything in Producer Tier</span>
            </li>
            <li className="flex gap-2">
              <span className="text-green-600 shrink-0">&#10003;</span>
              <span>Built for high-volume offices</span>
            </li>
          </ul>

          <div className="mt-5 pt-4 border-t border-border">
            <div className="text-[11px] text-gray-400 font-medium mb-1.5">
              NEED MORE?
            </div>
            {userTier === 'executive' ? (
              <>
                <Button variant="outline" size="sm" onClick={() => checkout('executiveAddon')} disabled={loading !== null}>
                  {loading === 'executiveAddon' ? 'Redirecting...' : '10-Pack — $30 ($3/coverage)'}
                </Button>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Purchased credits never expire.
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] text-gray-500">
                  10-pack for $30 ($3/coverage)
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Purchased credits never expire.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="max-w-[640px] mx-auto space-y-10">
        <div>
          <h2 className="text-[15px] font-medium text-foreground mb-2">
            How it works
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Each subscription plan includes a monthly allotment of coverage credits. Monthly credits
            refresh at the start of each billing cycle and do not roll over. If
            you need more than your plan includes in a given month, additional
            credits are available at variable subscriber-only rates &mdash;
            the number of coverages per bundle scales with your tier.
            Purchased add-on coverages do not expire.
          </p>
        </div>

        <div>
          <h2 className="text-[15px] font-medium text-foreground mb-2">
            Satisfaction guarantee
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            If you subscribe, submit your first script, and aren&apos;t
            satisfied with the coverage, you may cancel your subscription forthwith and we&apos;ll
            refund your payment in full &mdash; no questions asked. This applies only
            to your first coverage as a subscriber; after your first submission, you may cancel
            anytime and won&apos;t be charged for the following month. We
            don&apos;t do long-term contracts and we're not trying to dupe you. If you're peeved, 
            ping us and we'll sort it all out, babe, don't worry.
          </p>
        </div>

        <div>
          <h2 className="text-[15px] font-medium text-foreground mb-2">
            Annual billing
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Annual plans are billed upfront and include two free months. 
            If you cancel an annual plan mid-year, we&apos;ll
            calculate the monthly equivalent for the months you&apos;ve used and
            refund the difference, no drama. That's handled by hand, though, so definitely slide into our DMs.
          </p>
        </div>

        {/* Comparison table */}
        <div>
          <h2 className="text-[15px] font-medium text-foreground mb-4">
            First Pass vs Traditional Coverage
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2.5 pr-4 text-gray-400 font-medium w-[140px]" />
                  <th className="text-left py-2.5 px-4 font-medium text-foreground">
                    First Pass Coverage
                  </th>
                  <th className="text-left py-2.5 pl-4 font-medium text-gray-400">
                    Human Coverage
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-border/40">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Price per read
                  </td>
                  <td className="py-2.5 px-4 text-foreground">
                    $20 (much less with subscription)
                  </td>
                  <td className="py-2.5 pl-4">$75&ndash;$300 (no judgement, they earn it)</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Turnaround
                  </td>
                  <td className="py-2.5 px-4 text-foreground">~3 minutes (SOTA!)</td>
                  <td className="py-2.5 pl-4">3&ndash;14 days</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Rated categories
                  </td>
                  <td className="py-2.5 px-4 text-foreground">
                    10, with page citations
                  </td>
                  <td className="py-2.5 pl-4">Varies (often unstructured)</td>
                </tr>
                <tr className="border-b border-border/40">
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Consistency
                  </td>
                  <td className="py-2.5 px-4 text-foreground">
                    Same methodology every time
                  </td>
                  <td className="py-2.5 pl-4">Varies by reader</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-gray-500">
                    Iterative use
                  </td>
                  <td className="py-2.5 px-4 text-foreground">Designed for it</td>
                  <td className="py-2.5 pl-4">Bruh</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
