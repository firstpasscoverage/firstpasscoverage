import { db } from '.'
import { users } from './schema'
import { eq, sql } from 'drizzle-orm'

type Attribution = Record<string, unknown> | null

export async function getOrCreateUser(clerkId: string, email: string) {
  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })

  if (existing) return existing

  const [newUser] = await db.insert(users).values({
    clerkId,
    email,
  }).returning()

  return newUser
}

export async function getUserByClerkId(clerkId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  })
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  return db.query.users.findFirst({
    where: eq(users.stripeCustomerId, stripeCustomerId),
  })
}

export async function setStripeCustomerId(userId: number, stripeCustomerId: string) {
  await db.update(users)
    .set({ stripeCustomerId, updatedAt: new Date() })
    .where(eq(users.id, userId))
}

export async function updateUserAttribution(
  clerkId: string,
  data: {
    firstTouchAttribution: Attribution
    lastTouchAttribution: Attribution
  }
) {
  const existing = await getUserByClerkId(clerkId)
  if (!existing) return

  await db.update(users)
    .set({
      firstTouchAttribution: existing.firstTouchAttribution ?? data.firstTouchAttribution,
      lastTouchAttribution: data.lastTouchAttribution,
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, clerkId))
}

export async function updateSubscription(
  userId: number,
  data: {
    subscriptionTier: string | null
    subscriptionStatus: string | null
    stripeSubscriptionId: string | null
    subscriptionPeriodEnd: Date | null
    subscriptionCredits: number
    subscriptionCreditsResetAt: Date | null
  }
) {
  await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
}

export async function addPurchasedCredits(userId: number, credits: number) {
  await db.update(users)
    .set({
      purchasedCredits: sql`${users.purchasedCredits} + ${credits}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * Decrement one credit after a successful coverage.
 * Burns subscription credits first (they expire), then purchased credits (they don't).
 * Returns true if a credit was available and decremented, false if no credits.
 */
export async function decrementCredit(userId: number): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) return false

  if (user.subscriptionCredits > 0) {
    await db.update(users)
      .set({
        subscriptionCredits: sql`${users.subscriptionCredits} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
    return true
  }

  if (user.purchasedCredits > 0) {
    await db.update(users)
      .set({
        purchasedCredits: sql`${users.purchasedCredits} - 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
    return true
  }

  return false
}

/**
 * Check whether a user has any coverage credits available.
 */
export async function hasCredits(userId: number): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  })

  if (!user) return false
  return (user.subscriptionCredits > 0 || user.purchasedCredits > 0)
}
