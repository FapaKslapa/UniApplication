import { Skeleton } from "@/components/ui/skeleton";
import { staggerDelay } from "@/lib/motion";

export function AgendaSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 py-1">
      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 elevation-1">
        <div className="space-y-2">
          <Skeleton className="h-14 w-40 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-1/2 rounded-md" />
        </div>
      </div>
      {[0, 1, 2].map((index) => (
        <Skeleton
          key={index}
          className="h-14 rounded-md"
          style={{ animationDelay: `${staggerDelay(index)}s` }}
        />
      ))}
    </div>
  );
}
