import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import { getCoverageForAdmin } from '@/lib/db/admin-coverages';
import AdminCoverageDetailClient from './AdminCoverageDetailClient';

export default async function AdminCoverageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) redirect('/');

  const { id } = await params;
  const coverage = await getCoverageForAdmin(parseInt(id, 10));

  if (!coverage) {
    redirect('/admin/coverages');
  }

  return <AdminCoverageDetailClient coverage={JSON.parse(JSON.stringify(coverage))} />;
}
