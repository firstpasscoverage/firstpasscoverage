'use client'

export type Attribution = {
  landing_page: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  gclid?: string
  gbraid?: string
  wbraid?: string
  fbclid?: string
  ttclid?: string
  rdt_cid?: string
  msclkid?: string
  captured_at: string
}

const FIRST_TOUCH_KEY = 'fpc_first_touch_attribution'
const LAST_TOUCH_KEY = 'fpc_last_touch_attribution'
const SENT_KEY_PREFIX = 'fpc_attribution_sent:'

const ATTRIBUTION_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'ttclid',
  'rdt_cid',
  'msclkid',
] as const

const IGNORED_REFERRER_HOSTS = [
  'accounts.dev',
  'accounts.google.com',
  'clerk.com',
  'clerk.dev',
  'stripe.com',
]

export function captureAttribution() {
  if (typeof window === 'undefined') return

  const attribution = getAttributionFromLocation()
  if (!attribution) return

  const serializedAttribution = JSON.stringify(attribution)

  if (!getLocalStorageItem(FIRST_TOUCH_KEY)) setLocalStorageItem(FIRST_TOUCH_KEY, serializedAttribution)
  setLocalStorageItem(LAST_TOUCH_KEY, serializedAttribution)
}

export function getStoredAttribution() {
  if (typeof window === 'undefined') {
    return { firstTouchAttribution: null, lastTouchAttribution: null }
  }

  return {
    firstTouchAttribution: readAttribution(FIRST_TOUCH_KEY),
    lastTouchAttribution: readAttribution(LAST_TOUCH_KEY),
  }
}

export function hasSentAttribution(
  userId: string,
  firstTouchAttribution: Attribution | null,
  lastTouchAttribution: Attribution | null
) {
  if (typeof window === 'undefined') return true
  return getLocalStorageItem(`${SENT_KEY_PREFIX}${userId}`) === getAttributionSignature(
    firstTouchAttribution,
    lastTouchAttribution
  )
}

export function markAttributionSent(
  userId: string,
  firstTouchAttribution: Attribution | null,
  lastTouchAttribution: Attribution | null
) {
  if (typeof window === 'undefined') return
  setLocalStorageItem(
    `${SENT_KEY_PREFIX}${userId}`,
    getAttributionSignature(firstTouchAttribution, lastTouchAttribution)
  )
}

function getAttributionSignature(
  firstTouchAttribution: Attribution | null,
  lastTouchAttribution: Attribution | null
) {
  return JSON.stringify({ firstTouchAttribution, lastTouchAttribution })
}

function getAttributionFromLocation(): Attribution | null {
  const searchParams = new URLSearchParams(window.location.search)
  const values: Partial<Attribution> = {}

  for (const param of ATTRIBUTION_PARAMS) {
    const value = searchParams.get(param)
    if (value) values[param] = value
  }

  const hasCampaignParam = Object.keys(values).length > 0
  const referrer = document.referrer
  const hasExternalReferrer = Boolean(
    referrer && !referrer.startsWith(window.location.origin) && !isIgnoredReferrer(referrer)
  )

  if (!hasCampaignParam && !hasExternalReferrer) return null

  return {
    ...values,
    landing_page: window.location.href,
    referrer: hasExternalReferrer ? referrer : undefined,
    captured_at: new Date().toISOString(),
  }
}

function isIgnoredReferrer(referrer: string) {
  try {
    const hostname = new URL(referrer).hostname
    return IGNORED_REFERRER_HOSTS.some((ignoredHost) => {
      return hostname === ignoredHost || hostname.endsWith(`.${ignoredHost}`)
    })
  } catch {
    return false
  }
}

function readAttribution(key: string): Attribution | null {
  const value = getLocalStorageItem(key)
  if (!value) return null

  try {
    return JSON.parse(value) as Attribution
  } catch {
    removeLocalStorageItem(key)
    return null
  }
}

function getLocalStorageItem(key: string) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function setLocalStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Treat unavailable storage as missing attribution rather than blocking analytics.
  }
}

function removeLocalStorageItem(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore cleanup failures when storage is unavailable.
  }
}
