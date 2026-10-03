import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DesktopPanelProps = {
  id?: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function DesktopPanel({
  id,
  title,
  description,
  aside,
  className,
  children,
}: DesktopPanelProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn(
        "flex min-h-0 scroll-mt-6 flex-col rounded-xl border border-border bg-card elevation-1",
        className,
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-4 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <h2
            id={id ? `${id}-title` : undefined}
            className="text-base font-semibold"
          >
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}
