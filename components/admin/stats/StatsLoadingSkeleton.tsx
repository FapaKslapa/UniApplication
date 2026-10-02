import { SkeletonCard } from "@/components/admin/stats/StatsPrimitives";

export function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6 pb-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {["sk-a", "sk-b", "sk-c", "sk-d"].map((k) => (
          <SkeletonCard key={k} className="h-28 sm:h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["sk-e", "sk-f", "sk-g"].map((k) => (
          <SkeletonCard key={k} className="h-28" />
        ))}
      </div>
      <SkeletonCard className="h-80" />
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <SkeletonCard className="lg:col-span-4 h-64" />
        <SkeletonCard className="lg:col-span-3 h-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}
