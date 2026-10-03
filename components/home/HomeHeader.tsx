import { RefreshCw } from "lucide-react";
import { HeaderActions } from "@/components/home/HeaderActions";
import type { HomeView } from "@/components/home/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeHeaderProps = {
  title: string;
  subtitle: string;
  showTitle: boolean;
  activeView: HomeView | null;
  settingsActive?: boolean;
  isAdmin: boolean;
  showRefresh: boolean;
  isRefreshing: boolean;
  onViewChange: (view: HomeView) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
};

export function HomeHeader({
  title,
  subtitle,
  showTitle,
  showRefresh,
  isRefreshing,
  onRefresh,
  ...actions
}: HomeHeaderProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between gap-4",
        showTitle ? "mb-4 lg:mb-8" : "mb-0 md:mb-4 lg:mb-8",
      )}
    >
      {showTitle && (
        <>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold leading-none lg:text-lg">
              {title}
            </h1>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {showRefresh && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Aggiorna orario"
              title="Aggiorna orario"
              aria-busy={isRefreshing}
              onClick={onRefresh}
              className="rounded-full text-muted-foreground md:hidden"
            >
              <RefreshCw
                className={cn("size-4", isRefreshing && "animate-spin")}
              />
            </Button>
          )}
        </>
      )}

      <HeaderActions
        {...actions}
        showRefresh={showRefresh}
        isRefreshing={isRefreshing}
        onRefresh={onRefresh}
      />
    </header>
  );
}
