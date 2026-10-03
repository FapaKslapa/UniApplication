import type { ReactNode } from "react";

type DesktopLineProps = {
  title: string;
  hint?: string;
  children: ReactNode;
};

export function DesktopLine({ title, hint, children }: DesktopLineProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}
