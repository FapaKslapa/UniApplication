import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ChangeDetailRowProps {
  icon: LucideIcon;
  children: ReactNode;
}

export function ChangeDetailRow({
  icon: Icon,
  children,
}: ChangeDetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="min-w-0 text-sm font-medium">{children}</div>
    </div>
  );
}
