import { NextRequest } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { getOrCreateUser, setStripeCustomerId } from '@/lib/db/users'
import { stripe } from '@/lib/stripe'
import { ONE_OFF_CREDITS, SUBSCRIPTION_TIER_MAP } from '@/lib/stripe/config'
import { getPostHogClient } from '@/lib/posthog-server'

export async function POST(request: NextRequest) {
  try {
    // Authenticate
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

    // Parse the requested price ID from the request body
    const { priceId } = await request.json()

    if (!priceId || typeof priceId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing priceId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate that this is a price we recognize
    const isOneOff = priceId in ONE_OFF_CREDITS
    const isSubscription = priceId in SUBSCRIPTION_TIER_MAP

    if (!isOneOff && !isSubscription) {
      return new Response(
        JSON.stringify({ error: 'Invalid price' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get or create a Stripe customer for this user
    let stripeCustomerId = dbUser.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          clerkId,
          dbUserId: String(dbUser.id),
        },
      })
      stripeCustomerId = customer.id
      await setStripeCustomerId(dbUser.id, stripeCustomerId)
    }

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: isSubscription ? 'subscription' : 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${request.nextUrl.origin}/coverage?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/pricing`,
      allow_promotion_codes: true,
      metadata: {
        dbUserId: String(dbUser.id),
      },
    })

    getPostHogClient().capture({
      distinctId: clerkId,
      event: 'checkout_session_created',
      properties: {
        price_id: priceId,
        price_type: isSubscription ? 'subscription' : 'one_off',
        session_id: session.id,
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to create checkout session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}