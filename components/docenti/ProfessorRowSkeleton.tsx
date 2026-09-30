import { Skeleton } from "@/components/ui/skeleton";
import { staggerDelay } from "@/lib/motion";

const ROWS = [0, 1, 2];

export function ProfessorRowSkeleton() {
  return (
    <div className="space-y-1.5">
      {ROWS.map((row) => (
        <div
          key={row}
          className="flex min-h-14 items-center gap-3 rounded-md bg-card p-2 elevation-1"
        >
          <Skeleton
            className="size-9 shrink-0 rounded-full"
            style={{ animationDelay: `${staggerDelay(row)}s` }}
          />
          <Skeleton
            className="h-3.5 w-32 rounded-md"
            style={{ animationDelay: `${staggerDelay(row)}s` }}
          />
        </div>
      ))}
    </div>
  );
}
