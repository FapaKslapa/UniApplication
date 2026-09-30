import { Skeleton } from "@/components/ui/skeleton";
import { staggerDelay } from "@/lib/motion";

export function AgendaSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 py-1">
      <Skeleton className="h-[140px] rounded-xl" />
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
