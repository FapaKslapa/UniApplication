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
    <div className="flex items-center gap-3 overflow-x-auto pb-2 px-1 no-scrollbar text-nowrap">
      {tabs.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onFilterChange(f.id)}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-[color,background-color,border-color,box-shadow,transform] text-[10px] font-bold uppercase tracking-widest font-mono",
            filter === f.id
              ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-transparent shadow-md scale-105"
              : "bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:border-zinc-300",
          )}
        >
          {f.label}
          <span className="opacity-50">{f.count}</span>
        </button>
      ))}
    </div>
  );
}
