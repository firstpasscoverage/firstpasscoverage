import { auth, currentUser } from '@clerk/nextjs/server'
import { getOrCreateUser, updateUserAttribution } from '@/lib/db/users'
import { getPostHogClient } from '@/lib/posthog-server'

type Attribution = Record<string, unknown> | null

export async function POST(request: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { firstTouchAttribution, lastTouchAttribution } = await request.json()
  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? 'unknown'

  await getOrCreateUser(clerkId, email)

  const attribution = {
    firstTouchAttribution: firstTouchAttribution ?? null,
    lastTouchAttribution: lastTouchAttribution ?? null,
  }

  await updateUserAttribution(clerkId, attribution)

  getPostHogClient().capture({
    distinctId: clerkId,
    event: 'account_attribution_captured',
    properties: {
      first_touch_attribution: attribution.firstTouchAttribution,
      last_touch_attribution: attribution.lastTouchAttribution,
      $set_once: {
        first_touch_attribution: attribution.firstTouchAttribution,
        ...getPrefixedAttributionProperties('first', attribution.firstTouchAttribution),
      },
      $set: {
        last_touch_attribution: attribution.lastTouchAttribution,
        ...getPrefixedAttributionProperties('last', attribution.lastTouchAttribution),
      },
    },
  })

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function getPrefixedAttributionProperties(prefix: 'first' | 'last', attribution: Attribution) {
  if (!attribution) return {}

  return {
    [`${prefix}_utm_source`]: attribution.utm_source,
    [`${prefix}_utm_medium`]: attribution.utm_medium,
    [`${prefix}_utm_campaign`]: attribution.utm_campaign,
    [`${prefix}_utm_content`]: attribution.utm_content,
    [`${prefix}_utm_term`]: attribution.utm_term,
    [`${prefix}_gclid`]: attribution.gclid,
    [`${prefix}_gbraid`]: attribution.gbraid,
    [`${prefix}_wbraid`]: attribution.wbraid,
    [`${prefix}_fbclid`]: attribution.fbclid,
    [`${prefix}_ttclid`]: attribution.ttclid,
    [`${prefix}_rdt_cid`]: attribution.rdt_cid,
    [`${prefix}_msclkid`]: attribution.msclkid,
    [`${prefix}_referrer`]: attribution.referrer,
    [`${prefix}_landing_page`]: attribution.landing_page,
    [`${prefix}_captured_at`]: attribution.captured_at,
  }
}
