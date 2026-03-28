import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { ONE_OFF_CREDITS, SUBSCRIPTION_TIER_MAP, TIER_CREDITS } from '@/lib/stripe/config'
import { getUserByStripeCustomerId, addPurchasedCredits, updateSubscription } from '@/lib/db/users'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      // ── One-off payment completed ────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Only handle one-off payments here — subscriptions are handled
        // by invoice.payment_succeeded
        if (session.mode !== 'payment') break

        const customerId = session.customer as string
        const user = await getUserByStripeCustomerId(customerId)
        if (!user) {
          console.error(`Webhook: No user found for Stripe customer ${customerId}`)
          break
        }

        // Look up what they bought from the line items
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

        for (const item of lineItems.data) {
          const priceId = item.price?.id
          if (priceId && priceId in ONE_OFF_CREDITS) {
            const credits = ONE_OFF_CREDITS[priceId]
            await addPurchasedCredits(user.id, credits)
            console.log(`Webhook: Added ${credits} purchased credit(s) for user ${user.id}`)
          }
        }
        break
      }

      // ── Subscription payment succeeded (new or renewal) ──────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }

        // Only handle subscription invoices
        if (!invoice.subscription) break

        const customerId = invoice.customer as string
        const user = await getUserByStripeCustomerId(customerId)
        if (!user) {
          console.error(`Webhook: No user found for Stripe customer ${customerId}`)
          break
        }

        // Get the subscription to find the tier and period
        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        ) as unknown as Stripe.Subscription


        const priceId = subscription.items.data[0]?.price?.id
        if (!priceId) break

        const tier = SUBSCRIPTION_TIER_MAP[priceId]
        if (!tier) {
          console.error(`Webhook: Unknown price ID ${priceId}`)
          break
        }

        const credits = TIER_CREDITS[tier]

        await updateSubscription(user.id, {
          subscriptionTier: tier,
          subscriptionStatus: subscription.status,
          stripeSubscriptionId: subscription.id,
          subscriptionPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          subscriptionCredits: credits,
          subscriptionCreditsResetAt: new Date(),
        })

        console.log(`Webhook: Subscription ${tier} activated/renewed for user ${user.id} — ${credits} credits`)
        break
      }

      // ── Subscription canceled or expired ─────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const user = await getUserByStripeCustomerId(customerId)
        if (!user) break

        await updateSubscription(user.id, {
          subscriptionTier: null,
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
          subscriptionPeriodEnd: null,
          subscriptionCredits: 0,
          subscriptionCreditsResetAt: null,
        })

        console.log(`Webhook: Subscription canceled for user ${user.id}`)
        break
      }

      // ── Subscription payment failed ──────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null }
        if (!invoice.subscription) break

        const customerId = invoice.customer as string
        const user = await getUserByStripeCustomerId(customerId)
        if (!user) break

        await updateSubscription(user.id, {
          subscriptionTier: user.subscriptionTier,
          subscriptionStatus: 'past_due',
          stripeSubscriptionId: user.stripeSubscriptionId,
          subscriptionPeriodEnd: user.subscriptionPeriodEnd,
          subscriptionCredits: user.subscriptionCredits,
          subscriptionCreditsResetAt: user.subscriptionCreditsResetAt,
        })

        console.log(`Webhook: Payment failed for user ${user.id}`)
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    // Return 200 anyway — Stripe will retry if we return an error,
    // and we don't want infinite retries on a bug in our handler
    return new Response('Webhook handler error (logged)', { status: 200 })
  }

  return new Response('OK', { status: 200 })
}
