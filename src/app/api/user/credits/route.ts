import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/db/users'

export async function GET(request: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const clerkUser = await currentUser()
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? 'unknown'
  const user = await getOrCreateUser(clerkId, email)

  return new Response(
    JSON.stringify({
      subscriptionCredits: user.subscriptionCredits,
      purchasedCredits: user.purchasedCredits,
      subscriptionTier: user.subscriptionTier,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}
