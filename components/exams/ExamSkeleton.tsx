import { Skeleton } from "@/components/ui/skeleton";
import { staggerDelay } from "@/lib/motion";

const ROWS = [0, 1, 2];

export function ExamSkeleton() {
  return (
    <div
      role="status"
      aria-label="Caricamento esami"
      className="space-y-1.5 xl:grid xl:grid-cols-2 xl:gap-1.5 xl:space-y-0"
    >
      {ROWS.map((row) => (
        <div
          key={row}
          className="space-y-2.5 rounded-md bg-card p-3 elevation-1"
        >
          <Skeleton
            className="h-3.5 w-3/4 rounded-md"
            style={{ animationDelay: `${staggerDelay(row)}s` }}
          />
          <Skeleton
            className="h-3 w-1/2 rounded-md"
            style={{ animationDelay: `${staggerDelay(row)}s` }}
          />
          <Skeleton
            className="h-3 w-2/3 rounded-md"
            style={{ animationDelay: `${staggerDelay(row)}s` }}
          />
        </div>
      ))}
    </div>
  );
}
