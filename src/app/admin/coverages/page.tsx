import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin';
import AdminCoveragesClient from './AdminCoveragesClient';

export default async function AdminCoveragesPage() {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) redirect('/');

  return <AdminCoveragesClient />;
}
