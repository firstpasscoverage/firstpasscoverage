'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import posthog from 'posthog-js'

export function PostHogIdentify() {
  const { isSignedIn, user } = useUser()

  useEffect(() => {
    if (isSignedIn && user) {
      posthog.identify(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        name: user.fullName || user.firstName || undefined,
      })
    } else if (!isSignedIn) {
      posthog.reset()
    }
  }, [isSignedIn, user])

  return null
}