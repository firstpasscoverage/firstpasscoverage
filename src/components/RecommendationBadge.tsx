// src/components/RecommendationBadge.tsx
// Shared badge component for displaying coverage recommendations.
// Used by library/page.tsx, CoverageDetailClient, and SampleDetailClient.

const RECOMMENDATION_COLORS: Record<string, string> = {
  "Strong Pass": "bg-red-50 text-red-700 border-red-200",
  Pass: "bg-orange-50 text-orange-700 border-orange-200",
  Consider: "bg-yellow-50 text-yellow-700 border-yellow-200",
  Recommend: "bg-green-50 text-green-700 border-green-200",
  "Strong Recommend": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface Props {
  recommendation: string;
  className?: string;
}

export default function RecommendationBadge({ recommendation, className = "" }: Props) {
  const colors =
    RECOMMENDATION_COLORS[recommendation] ??
    "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${colors} ${className}`}
    >
      {recommendation}
    </span>
  );
}
