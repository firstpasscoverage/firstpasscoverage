/**
 * Maps Stripe price IDs to what they mean for our system.
 * Update these when prices change in the Stripe dashboard.
 */

// One-off purchases: price ID → number of purchased credits to add
export const ONE_OFF_CREDITS: Record<string, number> = {
  'price_1TFiIs0Tj3dRfbGz5i8AfYNU': 1,   // Single Coverage — $20
  'price_1TFiS90Tj3dRfbGzUaFeXYXI': 3,   // 3-Pack — $30
  'price_1TG6d00Tj3dRfbGzFnxU1qla': 6,   // Writer Add-on 6-Pack — $30
  'price_1TG6dO0Tj3dRfbGzh4QuxshK': 8,   // Producer Add-on 8-Pack — $30
  'price_1TG6do0Tj3dRfbGzlX7TOjPw': 10,  // Executive Add-on 10-Pack — $30
}

// Subscriber add-on packs: tier → { priceId, credits, label }
export const TIER_ADDON_PACKS: Record<string, { priceId: string; credits: number; label: string }> = {
  writer:    { priceId: 'price_1TG6d00Tj3dRfbGzFnxU1qla', credits: 6,  label: '6-Pack — $30' },
  producer:  { priceId: 'price_1TG6dO0Tj3dRfbGzh4QuxshK', credits: 8,  label: '8-Pack — $30' },
  executive: { priceId: 'price_1TG6do0Tj3dRfbGzlX7TOjPw', credits: 10, label: '10-Pack — $30' },
}

// Subscription prices: price ID → tier name
export const SUBSCRIPTION_TIER_MAP: Record<string, string> = {
  'price_1TFiMo0Tj3dRfbGz1KWdec3U': 'writer',      // Writer Monthly — $20/mo
  'price_1TFiMo0Tj3dRfbGzYCh0TWAo': 'writer',      // Writer Annual — $200/yr
  'price_1TFiOT0Tj3dRfbGzBFhkenUs': 'producer',    // Producer Monthly — $100/mo
  'price_1TFiP80Tj3dRfbGz7sUmyPSV': 'producer',    // Producer Annual — $1,000/yr
  'price_1TFiPk0Tj3dRfbGzBHbStVty': 'executive',   // Executive Monthly — $400/mo
  'price_1TFiQE0Tj3dRfbGzMqjOD8eq': 'executive',   // Executive Annual — $4,000/yr
}

// Monthly credit allotment per tier (same regardless of monthly vs annual billing)
export const TIER_CREDITS: Record<string, number> = {
  writer: 4,
  producer: 25,
  executive: 150,
}