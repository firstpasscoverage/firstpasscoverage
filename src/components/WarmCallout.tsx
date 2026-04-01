// src/components/WarmCallout.tsx
// Shared warm-cream callout box — used for accent highlights (Thread 25).

interface WarmCalloutProps {
  children: React.ReactNode;
  className?: string;
}

export default function WarmCallout({ children, className = "" }: WarmCalloutProps) {
  return (
    <div className={`bg-[#fffbf5] border border-[#f0e6d6] rounded-lg ${className}`}>
      {children}
    </div>
  );
}