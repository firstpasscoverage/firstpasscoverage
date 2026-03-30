// src/app/samples/[slug]/page.tsx
// Sample detail view — public, no auth required.
// Renders a featured coverage with poster, ratings grid, PDF download, and CTA.

import { notFound } from "next/navigation";
import { getSampleBySlug, getAllSamples } from "@/lib/db/samples";
import SampleDetailClient from "./SampleDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sample = await getSampleBySlug(slug);
  if (!sample) return { title: "Sample Not Found — First Pass Coverage" };

  return {
    title: `${sample.title} — Sample Coverage | First Pass Coverage`,
    description: sample.logline
      ? `AI-powered screenplay coverage for ${sample.title}. ${sample.logline}`
      : `See what First Pass Coverage produces — full AI-powered coverage of ${sample.title}.`,
  };
}

export default async function SampleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sample = await getSampleBySlug(slug);
  if (!sample) notFound();

  return (
    <SampleDetailClient
      coverageText={sample.coverageText ?? ""}
      title={sample.title ?? ""}
      writer={sample.writer ?? ""}
      draftDate={sample.draftDate ?? ""}
      recommendation={sample.recommendation ?? ""}
      overallScore={sample.overallScore ?? 0}
      posterPath={sample.posterPath ?? null}
      displayGenre={sample.displayGenre ?? ""}
      releaseYear={sample.releaseYear ?? null}
      slug={sample.slug}
      coverageCreatedAt={sample.coverageCreatedAt?.toISOString() ?? ""}
    />
  );
}
