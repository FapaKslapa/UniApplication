import { Skeleton } from "@/components/ui/skeleton";
import { staggerDelay } from "@/lib/motion";

const SECTIONS = [0, 1, 2, 3];

export function WeekSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 py-1">
      {SECTIONS.map((section) => (
        <div key={section} className="space-y-1.5">
          <Skeleton
            className="h-7 w-28 rounded-md"
            style={{ animationDelay: `${staggerDelay(section)}s` }}
          />
          <Skeleton
            className="h-14 rounded-md"
            style={{ animationDelay: `${staggerDelay(section)}s` }}
          />
        </div>
      ))}
    </div>
  );
}
