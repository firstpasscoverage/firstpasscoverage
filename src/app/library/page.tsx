// src/app/library/page.tsx
// Authenticated page showing the user's past coverages.

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByClerkId } from "@/lib/db/users";
import { getCoveragesForUser } from "@/lib/db/coverages";
import Link from "next/link";

const OVERALL_COLORS: Record<string, string> = {
  "Strong Recommend": "bg-emerald-100 text-emerald-800",
  Recommend: "bg-teal-100 text-teal-800",
  Consider: "bg-amber-100 text-amber-800",
  Pass: "bg-orange-100 text-orange-800",
  "Strong Pass": "bg-red-100 text-red-800",
};

export default async function LibraryPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/");

  const user = await getUserByClerkId(clerkId);
  if (!user) redirect("/");

  const coverageList = await getCoveragesForUser(user.id);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-brand">Your Coverages</h1>
        <Link
          href="/coverage"
          className="inline-block bg-[#111] text-[#fafafa] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#333] transition-colors"
        >
          New Coverage
        </Link>
      </div>

      {coverageList.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-2">No coverages yet.</p>
          <p className="text-sm">
            Upload a screenplay to get your first coverage.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {coverageList.map((c) => {
            const colorClass =
              OVERALL_COLORS[c.recommendation ?? ""] ??
              "bg-gray-100 text-gray-700";
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
                className="block border border-black/[0.08] rounded-lg p-5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold truncate">
                      {c.title || "Untitled"}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                      {c.writer || "Unknown writer"}
                    </p>
                    {c.logline && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                        {c.logline}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
                    >
                      {c.recommendation || "Pending"}
                    </span>
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
