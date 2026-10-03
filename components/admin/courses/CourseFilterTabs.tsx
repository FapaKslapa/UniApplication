import { m } from "framer-motion";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "pending" | "approved" | "rejected";

interface CourseFilterTabsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  totalCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

export function CourseFilterTabs({
  filter,
  onFilterChange,
  totalCount,
  pendingCount,
  approvedCount,
  rejectedCount,
}: CourseFilterTabsProps) {
  const tabs = [
    { id: "all", label: "Tutti", count: totalCount },
    { id: "pending", label: "Attesa", count: pendingCount },
    { id: "approved", label: "Approvati", count: approvedCount },
    { id: "rejected", label: "Rifiutati", count: rejectedCount },
  ] as const;

  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-full bg-muted p-1 no-scrollbar text-nowrap">
      {tabs.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onFilterChange(f.id)}
          aria-pressed={filter === f.id}
          className={cn(
            "relative z-10 flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors",
            filter === f.id ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {filter === f.id && (
            <m.span
              layoutId="course-filter-tab"
              transition={springs.snappy}
              className="absolute inset-0 -z-10 rounded-full bg-card elevation-1"
            />
          )}
          {f.label}
          <span className="opacity-60">{f.count}</span>
        </button>
      ))}
    </div>
  );
}
