import { RefreshCw, Settings } from "lucide-react";
import { HomeViewSwitcher } from "@/components/home/HomeViewSwitcher";
import type { HomeView } from "@/components/home/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeHeaderProps = {
  title: string;
  subtitle: string;
  showTitle: boolean;
  activeView: HomeView;
  isAdmin: boolean;
  showRefresh: boolean;
  onViewChange: (view: HomeView) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
};

export function HomeHeader({
  title,
  subtitle,
  showTitle,
  activeView,
  isAdmin,
  showRefresh,
  onViewChange,
  onRefresh,
  onOpenSettings,
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
              variant="outline"
              size="icon"
              aria-label="Aggiorna orario"
              onClick={onRefresh}
              className="rounded-full elevation-1 md:hidden"
            >
              <RefreshCw className="size-4" />
            </Button>
          )}
        </>
      )}

      <div className="hidden items-center gap-2 md:flex">
        <HomeViewSwitcher
          activeView={activeView}
          isAdmin={isAdmin}
          onViewChange={onViewChange}
        />
        <ThemeToggle />
        {showRefresh && (
          <Button
            variant="outline"
            size="icon"
            aria-label="Aggiorna orario"
            onClick={onRefresh}
            className="rounded-full elevation-1"
          >
            <RefreshCw className="size-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          aria-label="Impostazioni"
          onClick={onOpenSettings}
          className="rounded-full elevation-1"
        >
          <Settings className="size-5" />
        </Button>
      </div>
    </header>
  );
}
