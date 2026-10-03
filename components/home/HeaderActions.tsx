import { RefreshCw } from "lucide-react";
import { HomeViewSwitcher } from "@/components/home/HomeViewSwitcher";
import type { HomeView } from "@/components/home/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderActionsProps = {
  activeView: HomeView | null;
  settingsActive?: boolean;
  isAdmin: boolean;
  showRefresh: boolean;
  isRefreshing: boolean;
  onViewChange: (view: HomeView) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
};

export function HeaderActions({
  activeView,
  settingsActive = false,
  isAdmin,
  showRefresh,
  isRefreshing,
  onViewChange,
  onRefresh,
  onOpenSettings,
}: HeaderActionsProps) {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <HomeViewSwitcher
        activeView={activeView}
        isAdmin={isAdmin}
        settingsActive={settingsActive}
        onViewChange={onViewChange}
        onOpenSettings={onOpenSettings}
      />
      {showRefresh && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Aggiorna orario"
          title="Aggiorna orario"
          aria-busy={isRefreshing}
          onClick={onRefresh}
          className="rounded-full text-muted-foreground"
        >
          <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
        </Button>
      )}
    </div>
  );
}
