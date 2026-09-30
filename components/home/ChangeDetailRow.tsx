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
      <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 text-xs font-medium">{children}</div>
    </div>
  );
}
