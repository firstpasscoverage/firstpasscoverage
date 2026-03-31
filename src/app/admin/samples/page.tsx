// src/app/admin/samples/page.tsx
// Admin page for managing sample coverages. Protected by Clerk auth + admin check.

import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import AdminSamplesClient from './AdminSamplesClient'

export default async function AdminSamplesPage() {
  const { userId: clerkId } = await auth()

  if (!clerkId || !isAdmin(clerkId)) {
    redirect('/')
  }

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress ?? ''

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-2">
            Sample Management
          </h1>
          <p className="text-gray-500 text-sm">
            Admin: {email} &middot; Feature coverages on the public Samples page
          </p>
        </div>
        <AdminSamplesClient />
      </div>
    </div>
  )
}
