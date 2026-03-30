// src/lib/admin.ts
// Admin access control. Checks Clerk user ID against the ADMIN_CLERK_USER_ID env var.

export function isAdmin(clerkUserId: string): boolean {
  return clerkUserId === process.env.ADMIN_CLERK_USER_ID
}