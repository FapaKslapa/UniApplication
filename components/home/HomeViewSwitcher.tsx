import {
  CalendarDays,
  type LucideIcon,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { HomeView } from "@/components/home/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewItem = { view: HomeView; label: string; icon: LucideIcon };

const BASE_ITEMS: ViewItem[] = [
  { view: "week", label: "Agenda", icon: CalendarDays },
  { view: "docenti", label: "Docenti", icon: Search },
];

const ADMIN_ITEM: ViewItem = {
  view: "stats",
  label: "Admin",
  icon: ShieldCheck,
};

type HomeViewSwitcherProps = {
  activeView: HomeView;
  isAdmin: boolean;
  onViewChange: (view: HomeView) => void;
};

export function HomeViewSwitcher({
  activeView,
  isAdmin,
  onViewChange,
}: HomeViewSwitcherProps) {
  const items = isAdmin ? [...BASE_ITEMS, ADMIN_ITEM] : BASE_ITEMS;
  const isAdminActive =
    activeView === "stats" || activeView === "admin-courses";

  return (
    <div className="flex rounded-full bg-muted p-1">
      {items.map(({ view, label, icon: Icon }) => {
        const active = view === "stats" ? isAdminActive : activeView === view;
        return (
          <Button
            key={view}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(view)}
            className={cn(
              "gap-2 rounded-full px-4 text-xs font-semibold text-muted-foreground",
              active && "bg-card text-foreground elevation-1",
            )}
          >
            <Icon className="size-3.5" />
            <span>{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
