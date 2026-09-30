import { Skeleton } from "@/components/ui/skeleton";
import { staggerDelay } from "@/lib/motion";

const CELLS = Array.from({ length: 42 }, (_, index) => index);

export function MonthSkeleton() {
  return (
    <div className="grid h-full flex-1 grid-cols-7 grid-rows-6 gap-1 rounded-xl bg-card p-3 elevation-1">
      {CELLS.map((cell) => (
        <div key={cell} className="flex items-center justify-center">
          <Skeleton
            className="size-6 rounded-full"
            style={{ animationDelay: `${staggerDelay(cell % 7)}s` }}
          />
        </div>
      ))}
    </div>
  );
}
