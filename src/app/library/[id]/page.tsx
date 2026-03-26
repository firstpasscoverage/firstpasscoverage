// src/app/library/[id]/page.tsx
// Coverage detail view — re-renders a saved coverage from the database,
// matching the visual output of the /coverage page.

import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getUserByClerkId } from "@/lib/db/users";
import { getCoverageById } from "@/lib/db/coverages";
import CoverageDetailClient from "./CoverageDetailClient";

export default async function CoverageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect("/");

  const { id } = await params;
  const coverageId = parseInt(id);
  if (isNaN(coverageId)) notFound();

  const coverage = await getCoverageById(coverageId, user.id);
  if (!coverage) notFound();

  return (
    <CoverageDetailClient
      coverageText={coverage.coverageText ?? ""}
      title={coverage.title ?? ""}
      writer={coverage.writer ?? ""}
      draftDate={coverage.draftDate ?? ""}
      createdAt={coverage.createdAt?.toISOString() ?? ""}
    />
  );
}
