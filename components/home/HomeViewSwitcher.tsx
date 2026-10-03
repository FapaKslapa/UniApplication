import {
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  type LucideIcon,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { HomeView } from "@/components/home/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ITEM_CLASS =
  "gap-2 rounded-full px-4 text-xs font-semibold text-muted-foreground";
const ACTIVE_CLASS = "bg-card text-foreground elevation-1";

type ViewItem = { view: HomeView; label: string; icon: LucideIcon };

const BASE_ITEMS: ViewItem[] = [
  { view: "week", label: "Agenda", icon: CalendarDays },
  { view: "docenti", label: "Docenti", icon: GraduationCap },
  { view: "esami", label: "Esami", icon: ClipboardCheck },
];

const ADMIN_ITEM: ViewItem = {
  view: "stats",
  label: "Admin",
  icon: ShieldCheck,
};

type HomeViewSwitcherProps = {
  activeView: HomeView | null;
  isAdmin: boolean;
  settingsActive?: boolean;
  onViewChange: (view: HomeView) => void;
  onOpenSettings: () => void;
};

export function HomeViewSwitcher({
  activeView,
  isAdmin,
  settingsActive = false,
  onViewChange,
  onOpenSettings,
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
            aria-pressed={active}
            onClick={() => onViewChange(view)}
            className={cn(ITEM_CLASS, active && ACTIVE_CLASS)}
          >
            <Icon className="size-3.5" aria-hidden />
            <span>{label}</span>
          </Button>
        );
      })}
      <Button
        variant="ghost"
        size="sm"
        aria-pressed={settingsActive}
        aria-current={settingsActive ? "page" : undefined}
        onClick={onOpenSettings}
        className={cn(ITEM_CLASS, settingsActive && ACTIVE_CLASS)}
      >
        <Settings className="size-3.5" aria-hidden />
        <span>Opzioni</span>
      </Button>
    </div>
  );
}
