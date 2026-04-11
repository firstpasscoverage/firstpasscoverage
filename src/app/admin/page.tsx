import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import Link from 'next/link';

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) redirect('/');

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="font-brand text-3xl font-normal tracking-[-0.3px] mb-8">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/coverages"
          className="block p-6 rounded-lg border border-border hover:border-amber-500/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-1">All Coverages</h2>
          <p className="text-sm text-muted-foreground">
            Browse, search, and view every coverage on the platform.
          </p>
        </Link>
        <Link
          href="/admin/samples"
          className="block p-6 rounded-lg border border-border hover:border-amber-500/50 transition-colors"
        >
          <h2 className="text-lg font-medium mb-1">Samples Management</h2>
          <p className="text-sm text-muted-foreground">
            Feature coverages on the public Samples page with TMDB posters.
          </p>
        </Link>
      </div>
    </main>
  );
}
