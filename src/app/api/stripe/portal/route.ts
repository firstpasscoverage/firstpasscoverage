import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getOrCreateUser } from '@/lib/db/users'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const clerkUser = await currentUser()
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? 'unknown'
    const dbUser = await getOrCreateUser(clerkId, email)

    if (!dbUser.stripeCustomerId) {
      return new Response(
        JSON.stringify({ error: 'No billing account found' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: dbUser.stripeCustomerId,
      return_url: `${request.nextUrl.origin}/coverage`,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Stripe portal error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to create portal session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
