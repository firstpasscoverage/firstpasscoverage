import { db } from '.'
import { users } from './schema'
import { eq } from 'drizzle-orm'

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
