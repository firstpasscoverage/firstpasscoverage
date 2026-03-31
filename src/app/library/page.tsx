// src/app/library/page.tsx
// Authenticated page showing the user's past coverages.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/db/users";
import { getCoveragesForUser } from "@/lib/db/coverages";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RecommendationBadge from "@/components/RecommendationBadge";

export default async function LibraryPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect("/");

  const coverageList = await getCoveragesForUser(user.id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-brand text-3xl font-normal tracking-[-0.3px]">Your Coverages</h1>
        <Button asChild size="lg">
          <Link href="/coverage">New Coverage</Link>
        </Button>
      </div>

      {coverageList.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg mb-2">No coverages yet.</p>
          <p className="text-sm">
            Upload a screenplay to get your first coverage.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {coverageList.map((c) => {
            const dateStr = c.createdAt
              ? new Date(c.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";

            return (
              <Link
                key={c.id}
                href={`/library/${c.id}`}
                className="block border border-border rounded-lg p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold truncate">
                      {(c.title || "Untitled").toUpperCase()}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-0.5">
                      {c.writer || "Unknown writer"}
                    </p>
                    {c.logline && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {c.logline}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                  <RecommendationBadge recommendation={c.recommendation || "Pending"} />
                    <p className="text-gray-400 text-xs mt-2">{dateStr}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
