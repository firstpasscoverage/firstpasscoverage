// src/lib/admin.ts
// Admin access control. Checks Clerk user ID against a comma-separated list of Clerk user IDs in ADMIN_CLERK_USER_ID env var.

export function isAdmin(clerkUserId: string): boolean {
  const adminIds = (process.env.ADMIN_CLERK_USER_ID || '').split(',').map(id => id.trim());
  return adminIds.includes(clerkUserId);
}