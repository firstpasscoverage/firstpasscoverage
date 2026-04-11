import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { getAllCoveragesForAdmin, getCoverageForAdmin } from '@/lib/db/admin-coverages';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId || !isAdmin(userId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const recommendation = searchParams.get('recommendation') || undefined;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;
  const id = searchParams.get('id');

  // Single coverage fetch
  if (id) {
    const coverage = await getCoverageForAdmin(parseInt(id, 10));
    if (!coverage) {
      return NextResponse.json({ error: 'Coverage not found' }, { status: 404 });
    }
    return NextResponse.json(coverage);
  }

  // List with filters
  const coverages = await getAllCoveragesForAdmin({
    search,
    recommendation,
    dateFrom,
    dateTo,
  });

  return NextResponse.json(coverages);
}
