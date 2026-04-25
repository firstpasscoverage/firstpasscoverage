'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'
import {
  type Attribution,
  captureAttribution,
  getStoredAttribution,
  hasSentAttribution,
  markAttributionSent,
} from '@/lib/attribution'

export function PostHogIdentify() {
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (isSignedIn && user) {
      captureAttribution()
      const { firstTouchAttribution, lastTouchAttribution } = getStoredAttribution()

      posthog.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName || user.firstName || undefined,
        ...(lastTouchAttribution
          ? {
              last_touch_attribution: lastTouchAttribution,
              ...getPrefixedAttributionProperties('last', lastTouchAttribution),
            }
          : {}),
      }, firstTouchAttribution ? {
        first_touch_attribution: firstTouchAttribution,
        ...getPrefixedAttributionProperties('first', firstTouchAttribution),
      } : undefined)

      if (
        (firstTouchAttribution || lastTouchAttribution)
        && !hasSentAttribution(user.id, firstTouchAttribution, lastTouchAttribution)
      ) {
        void syncAttribution(user.id, firstTouchAttribution, lastTouchAttribution)
      }
    } else if (isSignedIn === false) {
      posthog.reset()
    }
  }, [isSignedIn, user])

  return null
}

function getPrefixedAttributionProperties(prefix: 'first' | 'last', attribution: Attribution | null) {
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

async function syncAttribution(
  userId: string,
  firstTouchAttribution: Attribution | null,
  lastTouchAttribution: Attribution | null
) {
  const response = await fetch('/api/user/attribution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstTouchAttribution, lastTouchAttribution }),
  })

  if (response.ok) {
    markAttributionSent(userId, firstTouchAttribution, lastTouchAttribution)
  }
}
