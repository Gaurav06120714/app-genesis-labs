import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
}

const SkeletonLine = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "rounded-md bg-white/10 animate-pulse",
      className
    )}
    aria-hidden="true"
  />
);

const SkeletonCard = ({ className, lines = 3 }: SkeletonCardProps) => {
  return (
    <div
      className={cn(
        "bg-white/5 border border-white/10 rounded-xl p-5 space-y-3",
        className
      )}
      aria-label="Loading content"
      role="status"
    >
      <SkeletonLine className="h-4 w-2/3" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} className={`h-3 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
      ))}
    </div>
  );
};

export const SkeletonStatCard = () => (
  <div
    className="bg-white/5 border border-white/10 rounded-xl p-4"
    role="status"
    aria-label="Loading statistic"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" aria-hidden="true" />
    </div>
    <div className="h-7 w-16 rounded-md bg-white/10 animate-pulse mb-1" aria-hidden="true" />
    <div className="h-3 w-24 rounded-md bg-white/10 animate-pulse" aria-hidden="true" />
  </div>
);

export default SkeletonCard;
